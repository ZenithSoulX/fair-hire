from schemas.ranking_schema import (
    RankedCandidate,
    RankingResult,
)

from scoring.heuristic import heuristic_score


def ranking_tool(
    feature_list,
    parsed_jd
):

    ranked=[]

    for feature in feature_list:

        score=heuristic_score(
            parsed_jd,
            feature
        )

        ranked.append(

            RankedCandidate(

                candidate_id=feature["candidate_id"],

                candidate_name=feature["name"],

                final_score=score,

                feature_scores={

                    "required_skill_ratio":
                    feature["required_skill_ratio"],

                    "preferred_skill_ratio":
                    feature["preferred_skill_ratio"],

                    "experience_score":
                    feature["experience_score"],

                    "education_score":
                    feature["education_score"],

                    "project_score":
                    feature["project_score"],

                    "retrieval_score":
                    feature["retrieval_score"]

                },

                rank=0

            )

        )

    ranked.sort(
        key=lambda x:x.final_score,
        reverse=True
    )

    for i,candidate in enumerate(ranked):

        candidate.rank=i+1

    return RankingResult(
        ranked_candidates=ranked
    )