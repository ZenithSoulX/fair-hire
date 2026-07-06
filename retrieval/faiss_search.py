from typing import List, Tuple

import numpy as np
import faiss


def faiss_search(
    index: faiss.Index,
    embedding_ids: list[str],
    query_embedding: np.ndarray,
    top_k: int = 1000,) -> List[Tuple[str, float]]:

    query_embedding = query_embedding.reshape(1, -1)

    scores, indices = index.search(
        query_embedding,
        top_k,
    )

    results = [
        (
            embedding_ids[idx],
            float(scores[0][rank]),
        )
        for rank, idx in enumerate(indices[0])
        if idx != -1
    ]

    print(f"FAISS returned {len(results)} candidates")

    return results