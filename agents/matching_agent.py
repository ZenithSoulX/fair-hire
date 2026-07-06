from agents.jd_agent import ParsedJD
from sentence_transformers import util
import torch
from core.retrieval_resources import embedding_model
_candidate_skill_cache = {}
_jd_embedding_cache = {}
match_thr = 0.78
project_thr = 0.72
DEGREE_RANK = {
    "b.e.": 1,
    "b.tech": 1,
    "bachelor": 1,
    "master": 2,
    "m.tech": 2,
    "m.e.": 2,
    "phd": 3
}
def normalize(skills):
    return {
        s.lower().strip()
        for s in skills
    }

def get_candidate_skill_embeddings(candidate):

    cid = candidate["candidate_id"]

    if cid in _candidate_skill_cache:
        return _candidate_skill_cache[cid]

    skill_names = [
        skill["name"]
        for skill in candidate["skills"]
    ]

    embeddings = embedding_model.encode(
        skill_names,
        convert_to_tensor=True,
        normalize_embeddings=True
    )

    _candidate_skill_cache[cid] = (
        skill_names,
        embeddings
    )

    return skill_names, embeddings

def get_jd_embedding(skill: str):

    if skill in _jd_embedding_cache:
        return _jd_embedding_cache[skill]

    emb = embedding_model.encode(
        skill,
        convert_to_tensor=True,
        normalize_embeddings=True
    )

    _jd_embedding_cache[skill] = emb

    return emb

def skill_overlap(candidate, parsed_jd):

    candidate_skill_names, candidate_skill_embeddings = \
        get_candidate_skill_embeddings(candidate)

    required_total = 0
    required_match = 0

    preferred_total = 0
    preferred_match = 0

    matched_required = []
    missing_required = []

    for jd_skill in parsed_jd.required_skills:

        jd_embedding = get_jd_embedding(jd_skill.skill)

        similarities = util.cos_sim(
            jd_embedding,
            candidate_skill_embeddings
        )[0]

        best = float(torch.max(similarities))

        required_total += jd_skill.importance

        if best >= match_thr:

            required_match += jd_skill.importance*best
            matched_required.append(jd_skill.skill)

        else:

            missing_required.append(f"{jd_skill.skill} ({best:.2f})")

    for jd_skill in parsed_jd.preferred_skills:

        jd_embedding = get_jd_embedding(jd_skill.skill)

        similarities = util.cos_sim(
            jd_embedding,
            candidate_skill_embeddings
        )[0]

        best = float(torch.max(similarities))

        preferred_total += jd_skill.importance

        if best >= match_thr:

            preferred_match += jd_skill.importance*best

    return {

        "required_ratio":
            required_match / required_total
            if required_total else 1,

        "preferred_ratio":
            preferred_match / preferred_total
            if preferred_total else 0,

        "matched_required":
            matched_required,

        "missing_required":
            missing_required
    }

def experience_match(candidate, parsed_jd):

    years = candidate["profile"]["years_of_experience"]

    required = parsed_jd.experience.min_years

    if required <= 0:
        return 1

    ratio = years / required

    return min(ratio, 1)

def education_match(candidate, parsed_jd):

    education = candidate["education"]

    if not education:
        return 0

    candidate_degree = education[0]["degree"].lower()

    candidate_rank = 1

    for key in DEGREE_RANK:

        if key in candidate_degree:
            candidate_rank = DEGREE_RANK[key]
            break

    required = (
        parsed_jd.education.min_degree or ""
    ).lower()

    if required == "":
        return 1

    required_rank = 1

    for key in DEGREE_RANK:

        if key in required:
            required_rank = DEGREE_RANK[key]
            break

    return min(candidate_rank / required_rank, 1)

def project_match(candidate, parsed_jd):

    chunks = []

    chunks.append(candidate["profile"]["headline"])
    chunks.append(candidate["profile"]["summary"])

    for job in candidate["career_history"]:
        chunks.append(job["description"])

    chunk_embeddings = embedding_model.encode(
        chunks,
        convert_to_tensor=True,
        normalize_embeddings=True
    )

    total = 0
    matched = 0

    for skill in parsed_jd.required_skills:

        skill_embedding = get_jd_embedding(skill.skill)

        similarities = util.cos_sim(
            skill_embedding,
            chunk_embeddings
        )[0]

        best = float(torch.max(similarities))

        total += skill.importance

        if best >= 0.60:
            matched += skill.importance * best

    if total == 0:
        return 0

    return min(matched / total, 1.0)


def build_features(candidate, parsed_jd, retrieval_score, max_rrf):

    skills = skill_overlap(candidate, parsed_jd)

    return {

        "candidate_id": candidate["candidate_id"],

        "name": candidate["profile"]["anonymized_name"],

        "required_skill_ratio": skills["required_ratio"],

        "preferred_skill_ratio": skills["preferred_ratio"],

        "matched_required": skills["matched_required"],

        "missing_required": skills["missing_required"],

        "experience_score":
            experience_match(candidate, parsed_jd),

        "education_score":
            education_match(candidate, parsed_jd),

        "project_score":
            project_match(candidate, parsed_jd),

        "retrieval_score":
            retrieval_score / max_rrf
    }