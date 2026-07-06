from agents.orchestrator import run_pipeline

if __name__ == "__main__":

    result = run_pipeline("data/job_description.md")

    ranking = result["ranking"]
    audit = result["audit"]

    print("\nBias Audit")
    print(audit)
    for candidate in ranking.ranked_candidates[:10]:

        print(f"\nRank #{candidate.rank}")
        print(f"Candidate : {candidate.candidate_name}")
        print(f"Score     : {candidate.final_score}")
        print(candidate.feature_scores)