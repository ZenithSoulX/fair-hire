def audit_rankings(ranked_candidates):

    audit = {

        "total_candidates": len(ranked_candidates),

        "tier3_selected": 0,

        "low_cgpa_selected": 0,

        "ignored_bias_features": [
            "College Tier",
            "CGPA"
        ],

        "message":
        "Candidates were ranked using skills, experience, semantic relevance and projects only."
    }

    for candidate in ranked_candidates:

        education = candidate.get("education", [])

        if not education:
            continue

        edu = education[0]

        tier = str(
            edu.get("tier", "")
        ).lower()

        grade = str(
            edu.get("grade", "")
        )

        if "tier_3" in tier:
            audit["tier3_selected"] += 1

        try:

            cgpa = float(
                grade.split()[0]
            )

            if cgpa < 8:
                audit["low_cgpa_selected"] += 1

        except:
            pass

    return audit