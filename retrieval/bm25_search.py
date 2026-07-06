from typing import List, Tuple


def bm25_search(
    bm25_data: dict,
    query: str,
    top_k: int = 1000,
) -> List[Tuple[str, float]]:
    """
    Sparse lexical retrieval using BM25.

    Args:
        bm25_data:
            {
                "bm25": BM25Okapi,
                "candidate_ids": [...]
            }

        query:
            Expanded retrieval query.

    Returns:
        [
            (candidate_id, bm25_score),
            ...
        ]
    """

    bm25 = bm25_data["bm25"]
    candidate_ids = bm25_data["candidate_ids"]

    tokenized_query = query.lower().split()

    scores = bm25.get_scores(tokenized_query)

    top_indices = scores.argsort()[::-1][:top_k]

    results = [
        (
            candidate_ids[i],
            float(scores[i]),
        )
        for i in top_indices
        if scores[i] > 0
    ]

    print(f"BM25 returned {len(results)} candidates")

    return results