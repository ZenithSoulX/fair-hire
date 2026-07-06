import json
import os
from dotenv import load_dotenv
from google import genai
from enum import Enum
from typing import Optional
from utils.file_reader import read_file
from pydantic import BaseModel, Field

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables. Please set it in your .env file.")
client = genai.Client(api_key=api_key)

class SeniorityLevel(str, Enum):
    INTERN = "intern"
    ENTRY = "entry"
    MID = "mid"
    SENIOR = "senior"
    LEAD = "lead"
    UNSPECIFIED = "unspecified"

class EmploymentType(str, Enum):
    FULL_TIME = "full_time"
    INTERNSHIP = "internship"
    CONTRACT = "contract"
    PART_TIME = "part_time"
    UNSPECIFIED = "unspecified"

class HiringPriority(BaseModel):
    must_haves: list[str] = Field(description="List of skills that are explicitly required for the role")
    preferred: list[str] = Field(description="List of skills that are preferred but not mandatory")
    bonus : list[str] = Field(description="List of skills that are nice-to-have but not required")

class SkillRequirement(BaseModel):
    skill: str = Field(description="Normalized skill name, e.g. 'Python', 'React', 'Distributed Systems'")
    is_mandatory: bool = Field(description="True if the JD explicitly requires this, False if merely preferred/nice-to-have")
    importance: float = Field(
        ge=0, le=1,
        description="0-1 relative importance inferred from JD emphasis (repetition, placement, phrasing like 'must have' vs 'bonus')"
    )
    context: Optional[str] = Field(
        default=None,
        description="Short phrase from the JD giving context, e.g. 'used for backend microservices'"
    )

class ExperienceRequirement(BaseModel):
    min_years: float = Field(default=0, description="Minimum years of experience required; 0 if not specified or fresher role")
    max_years: Optional[float] = Field(default=None, description="Upper bound if the JD specifies a range, else null")
    domain_specific: Optional[str] = Field(
        default=None,
        description="If experience must be in a specific domain, e.g. 'fintech', 'ML infra', else null"
    )

class EducationRequirement(BaseModel):
    min_degree: Optional[str] = Field(default=None, description="e.g. 'Bachelor's', 'Master's', null if not specified")
    preferred_fields: list[str] = Field(default_factory=list, description="e.g. ['Computer Science', 'Electrical Engineering']")
    is_hard_requirement: bool = Field(
        default=False,
        description="True only if JD explicitly states degree is mandatory/disqualifying, not just 'preferred'"
    )

class CategoryWeights(BaseModel):
    skill_match: float = Field(ge=0, le=1)
    project_relevance: float = Field(ge=0, le=1)
    experience_match: float = Field(ge=0, le=1)
    semantic_similarity: float = Field(ge=0, le=1)
    reasoning: str = Field(description="1-2 sentence explanation of why these weights were chosen for this JD")

class ParsedJD(BaseModel):
    schema_version : str = Field(
        default="1.0",
        description="Version of the structured JD schema. Increment this if the schema changes in a backward-compatible way."
    )
    role_title: str
    seniority_level: SeniorityLevel
    employment_type: EmploymentType
    industry_domain: str = Field(description="e.g. 'fintech', 'e-commerce', 'healthcare tech'")
    location: Optional[str] = None
    remote_ok: bool = False
    required_skills: list[SkillRequirement]
    preferred_skills: list[SkillRequirement]
    soft_skills: list[str] = Field(default_factory=list, description="e.g. 'communication', 'ownership', 'stakeholder management'")
    experience: ExperienceRequirement
    education: EducationRequirement
    hiring_priority: HiringPriority = Field(description="Structured representation of the JD's explicit and implicit skill priorities")
    key_responsibilities: list[str] = Field(description="3-6 core responsibilities, paraphrased concisely")
    certifications_mentioned: list[str] = Field(default_factory=list)
    search_query_expansion: list[str] = Field(
        description="5-10 keywords/phrases for BM25 query expansion beyond the literal JD text "
                    "(synonyms, related tech, adjacent skills a strong candidate might list instead)"
    )
    category_weights: CategoryWeights
    red_flags_to_ignore: list[str] = Field(
        default_factory=list,
        description="Signals present in typical resumes that should NOT affect ranking per Fair Hire's "
                    "bias policy, e.g. 'college tier', 'CGPA', 'employment gap', 'name-based signals'"
    )
    retrieval_prompt : str = Field(
        description = "One concise recruiter search query summarizing the ideal candidate. Used for semantic embedding and retrieval."
    )
    confidence : float = Field(
        ge=0,
        le=1,
        description = "Model confidence that the extracted structure accurately represents the JD."
    )
    job_summary : str = Field(description="2-3 sentences summary of the role.")

PROMPT = """
You are the JD Understanding Agent for Fair Hire, a bias-aware talent \
intelligence platform. Given a raw job description, extract a complete structured representation \
of it.

Critical rules:
1. Infer importance/weights from the JD's own emphasis and language — do not apply a generic template.
2. Never infer or output anything related to candidate college tier or CGPA thresholds as a \
requirement, even if the JD mentions them — instead add them to `red_flags_to_ignore`.
3. `category_weights` must sum to exactly 1.0 The weights represent the relative importance \
    of the hiring categories for THIS JD only. \
(e.g. a research role should weight project_relevance and skill_match higher than a generalist \
ops role, which might weight experience_match higher).
4. Be conservative: only mark a skill `is_mandatory=True` if the JD's language clearly requires it \
(e.g. "must have", "required", listed under "Requirements") rather than "nice to have" or "bonus".
5. `search_query_expansion` should surface adjacent/synonymous terms a qualified candidate might use \
6. Populate hiring_priority:
    - `must_haves` with skills that are explicitly required for the role
    - `preferred` with skills that are preferred but not mandatory
    - `bonus` with skills that are nice-to-have but not required
7. Generate a `retrieval_prompt` that summarizes the ideal candidate in one concise sentence,
instead of the JD's exact wording, to avoid penalizing candidates for phrasing differences.
Generate one concise retrieval_prompt.
It should summarize the ideal candidate
in one sentence.
This will be embedded directly by the Retrieval Agent instead of embedding the raw JD.
Estimate an overall confidence score
between 0 and 1.
Lower confidence if the JD is vague,
poorly written,
or missing important details.
Extract every technical skill, framework, library, tool, platform, programming language, database, cloud service, AI concept, search technology, and retrieval technique explicitly mentioned or strongly implied. Prefer fine-grained entities (e.g., "FAISS", "Sentence Transformers", "BM25") in addition to broader concepts (e.g., "Vector Databases", "Information Retrieval")
Return ONLY JSON.
"""

def parse_jd(jd_text : str, save : bool=True, model: str="gemini-2.0-flash") -> ParsedJD:
    response = client.models.generate_content(
        model=model,
        contents=jd_text,
        config={
            "system_instruction": PROMPT,
            "response_mime_type": "application/json",
            "response_schema": ParsedJD,
            "temperature": 0.2,  # low temperature : this is extraction, not creative generation
        },
    )
    result = ParsedJD.model_validate_json(response.text)
    if save:
        os.makedirs("artifacts", exist_ok=True)
        with open("artifacts/jd_parsed.json","w") as f:
            json.dump(result.model_dump(mode="json"),f,indent=2)
    return result

def jd_understanding_tool(jd_text: str) -> dict:
    parsed = parse_jd(jd_text)
    return parsed.model_dump(mode="json")

def jd_from_file(file_path: str):
    jd_text = read_file(file_path)
    return parse_jd(jd_text)

def load_parsed_jd(file_path: str):
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            return ParsedJD.model_validate(json.load(f))
    else:
        raise FileNotFoundError("Parsed JD file not found")

if __name__ == "__main__":

    jd = read_file("data/job_description.md")

    parsed = parse_jd(jd)

    print("JD parsed successfully.")
    print(json.dumps(parsed.model_dump(mode="json"), indent=2))