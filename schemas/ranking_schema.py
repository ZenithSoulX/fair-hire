from typing import List
from pydantic import BaseModel

class RankedCandidate(BaseModel):
    candidate_id: str
    candidate_name : str
    final_score: float
    feature_scores: dict[str, float]
    rank: int
    reasoning: str | None = None
    title: str = ""
    location: str = ""
    years_of_experience: float = 0.0
    skills: list[str] = []
    is_recovered: bool = False

class RankingResult(BaseModel):
    ranked_candidates: List[RankedCandidate]