import os
import json

from agents.jd_agent import jd_from_file, ParsedJD
from agents.retrieval_agent import retrieval_tool
from agents.matching_agent import build_features
from agents.ranking_agent import ranking_tool
from core.candidate_db import candidate_lookup
from agents.bias_audit import audit_rankings
from agents.explain_agent import generate_reasoning

def load_parsed_jd(file_path: str):

    if os.path.exists("artifacts/jd_parsed.json"):
        print("Loading cached parsed JD...")

        with open("artifacts/jd_parsed.json", "r") as f:
            return ParsedJD.model_validate(json.load(f))

    print("Parsing JD using Gemini...")

    return jd_from_file(file_path)


def run_pipeline(file_path: str):

    parsed_jd = load_parsed_jd(file_path)
    for skill in parsed_jd.required_skills:
        print(skill.skill, 
              "| mandatory =", skill.is_mandatory,
              "| importance =", skill.importance)
    retrieval_results = retrieval_tool(parsed_jd)

    feature_list = []
    selected_candidates = []
    for candidate_id in retrieval_results.candidate_ids[:20]:

        candidate = candidate_lookup.get(candidate_id)

        if candidate is None:
            continue

        features = build_features(
            candidate,
            parsed_jd,
            retrieval_results.rrf_scores[candidate_id],
            retrieval_results.max_rrf
        )

        feature_list.append(features)
        selected_candidates.append(candidate)
    ranking_results = ranking_tool(
        feature_list,
        parsed_jd
    )
    audit = audit_rankings(selected_candidates)

    ranking_results.ranked_candidates = ranking_results.ranked_candidates[:20]
    for rank, candidate_result in enumerate(ranking_results.ranked_candidates):

        if rank >= 5:
            break

        candidate = candidate_lookup[
            candidate_result["candidate_id"]
        ]

        candidate_result["reasoning"] = generate_reasoning(
            parsed_jd,
            candidate,
            candidate_result
        )
    return{
        "ranking": ranking_results,

        "audit": audit 
    }