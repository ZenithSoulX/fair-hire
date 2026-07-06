"""
build_artifacts.py
-------------------
Builds all precomputed artifacts required by the fair-hire-1 pipeline:
  artifacts/embeddings.npy
  artifacts/embedding_ids.json
  artifacts/faiss.index
  artifacts/bm25_index.pkl

Reads from: data/sample_candidates.json
"""

import json
import os
import pickle

import faiss
import numpy as np
from rank_bm25 import BM25Okapi
from sentence_transformers import SentenceTransformer

EMBEDDING_MODEL = "BAAI/bge-small-en-v1.5"
DATA_PATH = "data/sample_candidates.json"
ARTIFACTS_DIR = "artifacts"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
# 1. Load candidates
# ---------------------------------------------------------------------------
print("Loading candidates...")
with open(DATA_PATH, "r", encoding="utf-8") as f:
    candidates = json.load(f)
print(f"  Loaded {len(candidates)} candidates.")


# ---------------------------------------------------------------------------
# 2. Build composite text for each candidate
# ---------------------------------------------------------------------------
def build_composite_text(candidate):
    profile = candidate.get("profile", {})
    headline = profile.get("headline", "")
    summary = profile.get("summary", "")
    current_title = profile.get("current_title", "")
    current_company = profile.get("current_company", "")

    career_text = " ".join(
        f"{job.get('title', '')} at {job.get('company', '')}. {job.get('description', '')}"
        for job in candidate.get("career_history", [])
    )
    education_text = " ".join(
        f"{edu.get('degree', '')} {edu.get('field_of_study', '')} from {edu.get('institution', '')}"
        for edu in candidate.get("education", [])
    )
    skills_text = " ".join(
        f"{skill.get('name', '')} {skill.get('proficiency', '')}"
        for skill in candidate.get("skills", [])
    )
    return (
        f"Headline: {headline}\n"
        f"Current Title: {current_title}\n"
        f"Current Company: {current_company}\n"
        f"Summary: {summary}\n"
        f"Career History: {career_text}\n"
        f"Education: {education_text}\n"
        f"Skills: {skills_text}"
    )


print("Building composite texts...")
texts = [build_composite_text(c) for c in candidates]
candidate_ids = [c["candidate_id"] for c in candidates]


# ---------------------------------------------------------------------------
# 3. Build embeddings + FAISS index
# ---------------------------------------------------------------------------
print("Loading embedding model (BAAI/bge-small-en-v1.5)...")
model = SentenceTransformer(EMBEDDING_MODEL)

print("Encoding candidates (this may take a few minutes)...")
embeddings = model.encode(
    texts,
    batch_size=64,
    show_progress_bar=True,
    convert_to_numpy=True,
    normalize_embeddings=True,
).astype(np.float32)

print(f"  Embeddings shape: {embeddings.shape}")

np.save(os.path.join(ARTIFACTS_DIR, "embeddings.npy"), embeddings)
print("  Saved embeddings.npy")

with open(os.path.join(ARTIFACTS_DIR, "embedding_ids.json"), "w") as f:
    json.dump(candidate_ids, f)
print("  Saved embedding_ids.json")

dim = embeddings.shape[1]
index = faiss.IndexFlatIP(dim)  # Inner-product (cosine on normalized vectors)
index.add(embeddings)
faiss.write_index(index, os.path.join(ARTIFACTS_DIR, "faiss.index"))
print(f"  Saved faiss.index ({index.ntotal} vectors)")


# ---------------------------------------------------------------------------
# 4. Build BM25 index
# ---------------------------------------------------------------------------
print("Building BM25 index...")
tokenized = [text.lower().split() for text in texts]
bm25 = BM25Okapi(tokenized)
bm25_data = {"bm25": bm25, "candidate_ids": candidate_ids}
with open(os.path.join(ARTIFACTS_DIR, "bm25_index.pkl"), "wb") as f:
    pickle.dump(bm25_data, f)
print("  Saved bm25_index.pkl")

print("\nAll artifacts built successfully!")
