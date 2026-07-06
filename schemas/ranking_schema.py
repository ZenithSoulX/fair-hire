from typing import List
from pydantic import BaseModel

class RankedCandidate(BaseModel):
    candidate_id: str
    candidate_name : str
    final_score: float
    feature_scores: dict[str, float]
    rank: int

class RankingResult(BaseModel):
    ranked_candidates: List[RankedCandidate]