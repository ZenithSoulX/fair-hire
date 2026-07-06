import os
import json

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agents.jd_agent import parse_jd
from agents.retrieval_agent import retrieval_tool
from agents.matching_agent import build_features
from agents.ranking_agent import ranking_tool
from agents.bias_audit import audit_rankings
from agents.explain_agent import generate_reasoning
from core.candidate_db import candidate_lookup

app = FastAPI(title="FairHire API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    jd_text: str


@app.post("/api/analyze")
async def analyze_jd(req: AnalyzeRequest):
    """
    Parse a job description, run the full ranking pipeline,
    and return ranked candidates + bias audit.
    """
    try:
        # 1. Parse JD via Gemini (do NOT save to disk — pass save=False)
        parsed_jd = parse_jd(req.jd_text, save=False)

        # 2. Retrieve top candidates
        retrieval_results = retrieval_tool(parsed_jd)

        # 3. Build features for each retrieved candidate
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
                retrieval_results.max_rrf,
            )
            feature_list.append(features)
            selected_candidates.append(candidate)

        # 4. Rank
        ranking_results = ranking_tool(feature_list, parsed_jd)

        # 5. Bias audit
        audit = audit_rankings(selected_candidates)

        # 6. Enrich top-5 candidates with profile data + reasoning
        ranking_results.ranked_candidates = ranking_results.ranked_candidates[:20]
        for rank, candidate_result in enumerate(ranking_results.ranked_candidates):
            candidate = candidate_lookup[candidate_result.candidate_id]
            profile = candidate.get("profile", {})

            # Populate display fields
            candidate_result.title = profile.get("current_title", "")
            candidate_result.location = profile.get("location", "")
            candidate_result.years_of_experience = profile.get("years_of_experience", 0.0)
            candidate_result.skills = [s.get("name", "") for s in candidate.get("skills", [])][:6]

            # Determine if the candidate would have been filtered by traditional ATS
            edu = candidate.get("education", [{}])[0]
            is_tier_3 = "tier_3" in str(edu.get("tier", "")).lower()
            try:
                is_low_cgpa = float(str(edu.get("grade", "10")).split()[0]) < 8.0
            except Exception:
                is_low_cgpa = False
            candidate_result.is_recovered = is_tier_3 or is_low_cgpa

            # Generate reasoning only for top 5 (Gemini call per candidate)
            if rank < 5:
                candidate_result.reasoning = generate_reasoning(
                    parsed_jd, candidate, candidate_result
                )

        return {
            "ranking": ranking_results.model_dump(),
            "audit": audit,
        }

    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {e}\n{traceback.format_exc()}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
