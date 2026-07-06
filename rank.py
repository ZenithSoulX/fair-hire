import json
import pickle
import numpy as np
import faiss
import pandas as pd
import csv
import time
import sys
import os
from datetime import date, datetime
from sentence_transformers import SentenceTransformer
from pathlib import Path

TODAY = date(2026, 6, 25)
MODEL_NAME = "BAAI/bge-small-en-v1.5"
JD_PATH = "data/job_description.md"
OUTPUT_PATH = "submission.csv"

CONFIG_DIR = Path(__file__).resolve().parent / "precompute" / "configs"
with open(CONFIG_DIR / "ranking_weights.json", "r", encoding="utf-8") as f:
    WEIGHTS = json.load(f)["WEIGHTS"]

def load_artifacts():
    print("Loading model...")
    model = SentenceTransformer(MODEL_NAME)

    print("Loading FAISS index...")
    index = faiss.read_index("artifacts/faiss.index")

    print("Loading embedding IDs...")
    with open("artifacts/embedding_ids.json") as f:
        embedding_ids = json.load(f)

    print("Loading BM25 index...")
    with open("artifacts/bm25_index.pkl", "rb") as f:
        bm25_data = pickle.load(f)

    print("Loading feature matrix...")
    features_df = pd.read_pickle("artifacts/risk_scores.pkl")

    print("Loading honeypot flags...")
    with open("artifacts/honeypot_flags.json") as f:
        honeypots = set(json.load(f))

    print("Loading JD parsed signals...")
    with open("artifacts/jd_parsed.json") as f:
        jd_parsed = json.load(f)

    print("Loading reasoning cache...")
    if os.path.exists("artifacts/reasoning_cache.json"):
        with open("artifacts/reasoning_cache.json") as f:
            reasoning_cache = json.load(f)
    else:
        reasoning_cache = {}
        print("  Warning: reasoning_cache.json not found, using empty cache")
    print("Loading reranker model...")

    reranker = None
    reranker_features = None

    if os.path.exists("artifacts/reranker_model.txt"):
        with open("artifacts/reranker_features.json") as f:
            reranker_features = json.load(f)
    else:
        print("  Warning: reranker_model.txt not found")
    print("All artifacts loaded.\n")
    return (model, index, embedding_ids, bm25_data,
            features_df, honeypots, jd_parsed,
            reasoning_cache, reranker, reranker_features)

def embed_jd(model, jd_text):
    query = "Represent this sentence for searching relevant passages: " + jd_text
    vector = model.encode(
        [query],
        normalize_embeddings=True,
        convert_to_numpy=True
    )
    return vector[0].astype("float32")

def faiss_search(index, embedding_ids, jd_vector, top_k=1000):
    jd_vector_2d = jd_vector.reshape(1, -1)
    scores, indices = index.search(jd_vector_2d, top_k)
    results = [
        (embedding_ids[idx], float(scores[0][rank]))
        for rank, idx in enumerate(indices[0])
        if idx != -1 ]
    print(f"  FAISS returned {len(results)} candidates")
    return results

def bm25_search(bm25_data, jd_text, top_k=1000):
    bm25 = bm25_data["bm25"]
    candidate_ids = bm25_data["candidate_ids"]
    tokenized_query = jd_text.lower().split()
    scores = bm25.get_scores(tokenized_query)
    top_indices = scores.argsort()[::-1][:top_k]
    results = [
        (candidate_ids[i], float(scores[i]))
        for i in top_indices
        if float(scores[i]) > 0  #ignore zero score candidates
    ]
    print(f"  BM25 returned {len(results)} candidates")
    return results

def reciprocal_rank_fusion(faiss_results, bm25_results, k=60):
    rrf_scores = {}

    for rank, (cid, _) in enumerate(faiss_results):
        rrf_scores[cid] = rrf_scores.get(cid, 0) + 1 / (k + rank + 1)

    for rank, (cid, _) in enumerate(bm25_results):
        rrf_scores[cid] = rrf_scores.get(cid, 0) + 1 / (k + rank + 1)

    merged = sorted(rrf_scores.keys(),
                    key=lambda x: rrf_scores[x],
                    reverse=True)
    max_rrf = max(rrf_scores.values()) if rrf_scores else 1.0
    print(f"  After fusion: {len(merged)} unique candidates")
    return merged, rrf_scores, max_rrf

def score_semantic(row):
    return (
        row.get("jd_skill_overlap_ratio", 0) * 0.6 +
        min(row.get("jd_skill_avg", 0) / 4, 1.0) * 0.4
    )

def score_technical(row,jd_parsed):
    weights = jd_parsed.get("skill_weights",{})
    retrieval_w = weights.get("retrieval",1.0)
    ranking_w = weights.get("ranking",1.0)
    recomm_w = weights.get("recommendation",1.0)
    llm_w = weights.get("llm",1.0)
    score = (
        row.get("has_prod_exp",0)*0.25+
        min(row.get("ml_keys",0)/10,1)*0.15+
        retrieval_w*min(row.get("retrieval_keys",0)/8,1)*0.20+
        ranking_w*min(row.get("ranking_keys",0)/8,1)*0.15+
        recomm_w*min(row.get("recommendation_keys",0)/6,1)*0.15+
        llm_w*min(row.get("llm_keys",0)/8,1)*0.10
    )
    return min(score,1.0)

def score_notice(row, jd_parsed):
    notice_days = row.get("notice_days", 90)
    notice = jd_parsed.get("notice_period", {})
    limit = notice.get("max_buyout_days",90)
    if notice_days <= limit:
        return 1.0
    return max(0, 1 - (notice_days - limit) / 90)

def score_availability(row,jd_parsed):
    return (
        row.get("active_score", 0) * 0.50 +
        score_notice(row,jd_parsed) * 0.30 +
        row.get("open_to_work", 0) * 0.20
    )

def score_engagement(row):
    return (
        row.get("recruiter_response_rate", 0.5) * 0.40 +
        row.get("interview_completion_rate", 0.5) * 0.40 +
        row.get("response_time_score", 0.5) * 0.20
    )

def score_assessment(row):
    return row.get("avg_score", 0.5)

def score_trust(row):
    return row.get("trust_score", 0)

def score_education(row):
    return (
        row.get("best_tier", 0) * 0.70 +
        min(row.get("highest_degree_rank", 0) / 4, 1.0) * 0.30
    )

def score_retrieval(rrf_score, max_rrf):
    if max_rrf <= 0:
        return 0.0
    return rrf_score / max_rrf

def score_experience(row, jd_parsed):
    years = row.get("years_of_experience", 0)
    exp = jd_parsed.get("experience", {})
    minimum = exp.get("min_years", 0)
    preferred = exp.get("preferred_years", minimum)
    maximum = exp.get("max_years", 100)

    if minimum <= years <= maximum:
        return 1.0
    if years < minimum:
        return max(0, 1 - (minimum - years) / 5)
    return max(0, 1 - (years - maximum) / 5)


def score_location(row, jd_parsed):

    if row.get("location_fit", 0): return 1.0
    preferred = (
        jd_parsed
        .get("location", {})
        .get("cities", [])
    )

    if not preferred:
        return 0.5

    return row.get("location_fit", 0)



def score_candidate(row, jd_parsed, rrf_score=0.0, max_rrf=1.0):
    weights = jd_parsed.get("ranking_importance", WEIGHTS)
    skill_score = score_semantic(row)
    career_score = score_technical(row,jd_parsed)
    availability_score = score_availability(row,jd_parsed)
    engagement_score = score_engagement(row)
    assessment_score = score_assessment(row)
    trust_score = score_trust(row)
    edu_score = score_education(row)
    retrieval_score = score_retrieval(rrf_score, max_rrf)
    exp_fit = score_experience(row, jd_parsed)
    location_bonus = score_location(row,jd_parsed)*weights["location_bonus"]
    final = (
        retrieval_score    * weights["retrieval"] +
        skill_score        * weights["skills"] +
        career_score       * weights["career"] +
        availability_score * weights["availability"] +
        engagement_score   * weights["engagement"] +
        assessment_score   * weights["assessment"] +
        exp_fit            * weights["experience"] +
        edu_score          * weights["education"] +
        trust_score        * weights["trust"] +
        location_bonus)
    risk_multiplier =1.0
    if(row.get("has_prod_exp",0)==0 and jd_parsed.get("product_company_required",False)) : risk_multiplier *=0.75
    final *= risk_multiplier
    return { 
        "score" : round(float(final), 6),
        "retrieval" : retrieval_score,
        "career" : career_score,
        "skills" : skill_score,
        "availability" : availability_score,
        "engagement" : engagement_score,
        "assessment" : assessment_score,
        "experience" : exp_fit,
        "education" : edu_score,
        "trust" : trust_score,
        "location_bonus" : location_bonus
    }

def apply_reranker(booster, features_df, scored_list, feature_cols):
    top_500 = scored_list[:500]
    valid_ids = [cid for cid, _ in top_500 if cid in features_df.index]

    if not valid_ids:
        return scored_list
    print("entered apply_reranker")
    sub_df = features_df.loc[valid_ids, feature_cols].copy()
    print(f"Using {len(feature_cols)} reranker features")
    print(sub_df.shape)
    print(sub_df.columns.tolist())
    print(booster.feature_name())
    print(sub_df.dtypes)
    print("calling booster.predict...")
    lgb_scores = booster.predict(sub_df)
    print("booster.predict completed")
    id_to_lgb = dict(zip(valid_ids, lgb_scores))

    reranked = []
    for cid, my_score in top_500:
        lgb_score = id_to_lgb.get(cid, 0.0)
        lgb_score = min(max(lgb_score, 0.0), 1.0)
        alpha = min(0.40 + 0.20*my_score,0.60)
        combined = alpha * my_score + (1 - alpha) * lgb_score
        combined = round(combined, 6)
        reranked.append((cid, combined))

    reranked.sort(key=lambda x: x[1], reverse=True)
    rest = scored_list[500:]
    return reranked + rest

DEFAULT_REASONING = (
    "Strong alignment with the job requirements based on retrieval relevance, "
    "technical capabilities, career history, platform assessments, and hiring signals."
)

def write_csv(top_100, reasoning_cache, output_path):
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f, quoting=csv.QUOTE_ALL)
        writer.writerow(["rank", "candidate_id", "score", "reasoning"])
        for rank, (cid, score) in enumerate(top_100, start=1):
            reasoning = reasoning_cache.get(cid, DEFAULT_REASONING)
            writer.writerow([rank, cid, score, reasoning])
    print(f"CSV written → {output_path}")

def export_top200_ids(scored_list, honeypots):
    clean = [(cid, s) for cid, s in scored_list if cid not in honeypots]
    top_200_ids = [cid for cid, _ in clean[:200]]
    with open("artifacts/initial_top200.json", "w") as f:
        json.dump(top_200_ids, f)
    print(f"Exported top 200 IDs → artifacts/initial_top200.json")
    print("Send this file to Diya so she can generate reasoning strings.")

    initial_scores = {cid: float(s) for cid, s in clean[:500]}
    with open("artifacts/initial_scores.json", "w") as f:
        json.dump(initial_scores, f)
    print(f"Exported initial scores → artifacts/initial_scores.json")
    print("Send this file to Kushal so he can improve reranker labels.")

if __name__ == "__main__":
    total_start = time.time()
    t = time.time()
    (model, index, embedding_ids, bm25_data,
     features_df, honeypots, jd_parsed,
     reasoning_cache, reranker, reranker_features) = load_artifacts()
    print(f"Artifact loading: {time.time()-t:.1f}s\n")

    with open(JD_PATH) as f:
        jd_text = f.read()

    t = time.time()
    print("Embedding JD...")
    jd_vector = embed_jd(model, jd_text)
    print(f"JD embedding: {time.time()-t:.1f}s\n")

    t = time.time()
    print("Running hybrid retrieval...")
    faiss_results = faiss_search(index, embedding_ids, jd_vector, top_k=1000)
    bm25_results  = bm25_search(bm25_data, jd_text, top_k=1000)
    merged_ids, rrf_scores, max_rrf = reciprocal_rank_fusion(faiss_results, bm25_results)
    print(f"Retrieval + fusion: {time.time()-t:.1f}s\n")

    t = time.time()
    print("Scoring candidates...")
    scored = []
    skipped_honeypot = 0
    skipped_no_features = 0
    score_breakdowns = {}
    for cid in merged_ids:
        if cid in honeypots:
            skipped_honeypot += 1
            continue
        if cid not in features_df.index:
            skipped_no_features += 1
            continue
        row = features_df.loc[cid]
        rrf = rrf_scores.get(cid, 0)
        result = score_candidate(row, jd_parsed, rrf_score=rrf, max_rrf=max_rrf)
        scored.append((cid, result["score"]))
        score_breakdowns[cid] = {
            "candidate_id": cid,
            **result
            }

    scored.sort(key=lambda x: x[1], reverse=True)
    print(f"  Scored: {len(scored)} candidates")
    print(f"  Skipped honeypots: {skipped_honeypot}")
    print(f"  Skipped (no features): {skipped_no_features}")
    print(f"Scoring: {time.time()-t:.1f}s\n")

    export_top200_ids(scored, honeypots)

    if os.path.exists("artifacts/reranker_model.txt"):
        t = time.time()
        print("Running external LightGBM reranker...")
        import subprocess
        subprocess.run(
            [sys.executable, "rerank.py"],
            check=True
        )
        with open("artifacts/reranked_scores.json") as f:
            reranked_scores = json.load(f)

        # Update only the top 500 candidates
        for i in range(min(500, len(scored))):
            cid, _ = scored[i]
            if cid in reranked_scores:
                scored[i] = (cid, reranked_scores[cid])

        scored.sort(key=lambda x: x[1], reverse=True)
        print(f"External reranking: {time.time()-t:.1f}s\n")

    else:
        print("Skipping reranker (model not found)\n")

    top_100 = scored[:100]

    write_csv(top_100, reasoning_cache, OUTPUT_PATH)
    with open("artifacts/score_breakdowns.json", "w") as f:
        json.dump(score_breakdowns, f, indent=4)
    print("Saved score breakdowns → artifacts/score_breakdowns.json")
    total_time = time.time() - total_start
    print(f"\n{'='*50}")
    print(f"Total runtime: {total_time:.1f}s")
    print(f"Top 5 candidates:")
    for i, (cid, score) in enumerate(top_100[:5], 1):
        print(f"  {i}. {cid} — score: {score}")
    print(f"{'='*50}")

    if total_time > 280:
        print("WARNING: Runtime over 280s — dangerously close to 5min limit")
    else:
        print(f"Runtime OK — {300 - total_time:.0f}s to spare")