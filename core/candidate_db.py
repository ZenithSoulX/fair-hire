import json


with open("data/candidates.jsonl.gz", "r") as f:
    candidates = [json.loads(line) for line in f]

candidate_lookup = {
    candidate["candidate_id"]: candidate
    for candidate in candidates
}