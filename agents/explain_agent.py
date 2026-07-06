import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

PROMPT = """
You are an expert technical recruiter.

Your task is to explain WHY this candidate was selected.

Job Description:
{jd}

Candidate:
{candidate}

Matching Features:
{features}

Write exactly 4 bullet points.

Rules:
- Mention matching technical skills.
- Mention experience relevance.
- Mention project/background relevance.
- Mention one overall hiring recommendation.
- DO NOT mention college tier.
- DO NOT mention CGPA.
- Maximum 80 words.
"""

def generate_reasoning(parsed_jd, candidate, features):

    prompt = PROMPT.format(
        jd=parsed_jd,
        candidate=candidate,
        features=features
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text