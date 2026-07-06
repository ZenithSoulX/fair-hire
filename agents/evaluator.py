import json
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)
PROMPT = """
You are an expert senior recruiter.

Your task is to evaluate ONE candidate for ONE job description.

Score ONLY on:

1. Required skills
2. Preferred skills
3. Experience relevance
4. Project relevance
5. Career progression

Ignore completely:

- College tier
- CGPA
- Gender
- Age
- Name

Return ONLY valid JSON.

Schema:

{
  "match_score": 0,
  "technical_fit": 0,
  "experience_fit": 0,
  "project_fit": 0,
  "reason":"",

  "strengths":[
      "...",
      "..."
  ],

  "missing_skills":[
      "...",
      "..."
  ]
}

Scores must be between 0 and 100.
"""
def evaluate_candidate(parsed_jd,candidate,retrieval_score):
    response = client.models.generate_content(
        model="gemini-2.5-flash",

        contents=f"""

    JOB DESCRIPTION

    {parsed_jd.model_dump_json(indent=2)}

    CANDIDATE

    {json.dumps(candidate, indent=2)}

    Initial Retrieval Score

    {retrieval_score}

    """,

        config={

            "system_instruction": PROMPT,

            "response_mime_type": "application/json",

            "temperature":0.2
        }
    )
    return json.loads(response.text)