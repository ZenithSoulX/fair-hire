from pydantic import BaseModel


class RetrievalResult(BaseModel):
    candidate_ids: list[str]
    rrf_scores: dict[str, float]
    max_rrf: float