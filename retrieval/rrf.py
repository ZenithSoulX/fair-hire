from typing import Dict, List, Tuple


def reciprocal_rank_fusion(faiss_results: List[Tuple[str, float]],bm25_results: List[Tuple[str, float]],k: int = 60,) -> Tuple[List[str], Dict[str, float], float]:

    rrf_scores = {}

    # Dense retrieval contribution
    for rank, (candidate_id, _) in enumerate(faiss_results):
        rrf_scores[candidate_id] = (
            rrf_scores.get(candidate_id, 0)
            + 1 / (k + rank + 1)
        )

    # Sparse retrieval contribution
    for rank, (candidate_id, _) in enumerate(bm25_results):
        rrf_scores[candidate_id] = (
            rrf_scores.get(candidate_id, 0)
            + 1 / (k + rank + 1)
        )

    merged_ids = sorted(
        rrf_scores.keys(),
        key=lambda cid: rrf_scores[cid],
        reverse=True,
    )

    max_rrf = max(rrf_scores.values()) if rrf_scores else 1.0

    print(f"After fusion: {len(merged_ids)} unique candidates")

    return merged_ids, rrf_scores, max_rrf