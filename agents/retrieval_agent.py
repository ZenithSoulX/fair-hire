from agents.jd_agent import ParsedJD

from core.retrieval_resources import (
    embedding_model,
    faiss_index,
    embedding_ids,
    bm25_data,
)
from schemas.retrieval_schema import RetrievalResult
from agents.jd_agent import ParsedJD
from retrieval.faiss_search import faiss_search
from retrieval.bm25_search import bm25_search
from retrieval.rrf import reciprocal_rank_fusion


def retrieval_tool(parsed_jd: ParsedJD,top_k: int = 1000,) -> RetrievalResult:
    retrieval_query = parsed_jd.retrieval_prompt
    bm25_query = " ".join(parsed_jd.search_query_expansion)
    query_embedding = embedding_model.encode(retrieval_query,normalize_embeddings=True,)
    faiss_results = faiss_search(faiss_index,embedding_ids,query_embedding,top_k,)
    bm25_results = bm25_search(bm25_data,bm25_query,top_k,)
    merged_ids, rrf_scores, max_rrf = reciprocal_rank_fusion(faiss_results,bm25_results,)
    return RetrievalResult(
        candidate_ids=merged_ids,
        rrf_scores=rrf_scores,
        max_rrf=max_rrf
    )
