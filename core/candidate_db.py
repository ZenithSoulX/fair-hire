import json


with open("data/sample_candidates.json", "r") as f:
    candidates = json.load(f)

candidate_lookup = {
    candidate["candidate_id"]: candidate
    for candidate in candidates
}