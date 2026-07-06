def heuristic_score(jd_parsed, features):
    weights = jd_parsed.category_weights

    score = (
        features["required_skill_ratio"] * weights.skill_match
        + features["experience_score"] * weights.experience_match
        + features["retrieval_score"] * weights.semantic_similarity
        + features["project_score"] * weights.project_relevance
    )
    score = min(score, 1.0)
    return round(score*120, 2)