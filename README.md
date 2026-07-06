<div align="center">

# FairHire

### Explainable AI Recruitment for Fair and Transparent Hiring

<p>
  <img src="https://img.shields.io/badge/Python-3.11-blue?logo=python" alt="Python">
  <img src="https://img.shields.io/badge/Google-Gemini%202.5%20Flash-4285F4?logo=google" alt="Gemini">
  <img src="https://img.shields.io/badge/Streamlit-App-FF4B4B?logo=streamlit" alt="Streamlit">
  <img src="https://img.shields.io/badge/FAISS-Vector%20Search-success" alt="FAISS">
  <img src="https://img.shields.io/badge/Google%20Gen%20AI%20Academy-APAC-purple" alt="Google Gen AI Academy APAC">
</p>

<p>
  <a href="https://github.com/ZenithSoulX/fair-hire">GitHub Repository</a> •
  <a href="#">Demo Video</a> •
</p>

</div>

---

FairHire is an AI-powered recruitment platform and hiring assistant that helps organizations identify the best candidates based on skills, experience, project relevance, and semantic understanding instead of relying on proxy indicators such as college tier or CGPA.

Built with Google's Gemini 2.5 Flash, FairHire combines semantic search, hybrid retrieval, explainable AI, and bias auditing to deliver transparent candidate rankings and actionable hiring insights. Rather than replacing recruiters, FairHire empowers them with evidence-backed recommendations, enabling fairer, more informed, and data-driven hiring decisions.

---

## Built For

**Google Gen AI Academy APAC Hackathon**

FairHire was developed as part of the Google Gen AI Academy APAC Hackathon to showcase how Generative AI can enable transparent, explainable, and bias-aware recruitment.

---

## Overview

Traditional recruitment systems often rely on rigid filters such as keyword matching, GPA cutoffs, or college reputation, causing highly qualified candidates to be overlooked before they ever reach a recruiter. These approaches often lack transparency, making it difficult to understand or challenge automated hiring decisions.

FairHire addresses these challenges through an explainable AI-powered hiring workflow that evaluates candidates using semantic understanding, relevant experience, technical skills, and project alignment. By combining hybrid retrieval techniques with large language models, FairHire delivers meaningful candidate rankings, transparent explanations, and comprehensive bias audits that support fair and informed hiring decisions.

---

## Why FairHire?

Unlike conventional Applicant Tracking Systems that depend heavily on keyword matching and rigid filtering criteria, FairHire combines semantic retrieval, explainable AI, and fairness analysis into a unified recruitment workflow. Every recommendation is accompanied by transparent reasoning, enabling recruiters to make confident hiring decisions while reducing unintended bias.

---

## Core Capabilities

### Explainable Candidate Ranking

Ranks applicants based on skills, experience, project relevance, and semantic similarity while providing clear explanations for every recommendation.

### Hybrid Candidate Retrieval

Combines semantic embeddings, BM25, FAISS, and Reciprocal Rank Fusion (RRF) to identify the most relevant candidates beyond simple keyword matching.

### AI-Powered Resume Analysis

Automatically extracts and structures information from PDF and DOCX resumes, enabling consistent and efficient candidate evaluation.

### Bias Audit Dashboard

Analyzes recruitment decisions to identify potential biases related to factors such as CGPA, college tier, and other traditional screening criteria, helping recruiters make more equitable hiring decisions.

### Interactive Recruitment Analytics

Presents hiring insights through intuitive dashboards, including candidate distribution, fairness metrics, ranking trends, and recruitment performance.

### Transparent Hiring Workflow

Maintains visibility across every stage of the recruitment process, allowing recruiters to understand how candidates are evaluated and why they receive their final rankings.

### Recruiter-Centric Experience

Designed with an intuitive interface that enables recruiters to upload job descriptions, review ranked candidates, analyze hiring fairness, and make informed decisions from a single workspace.

---

## Tech Highlights

- Multi-Agent AI Pipeline
- Hybrid Retrieval (BM25 + FAISS + RRF)
- Explainable AI Candidate Ranking
- Semantic Resume Matching
- Bias Audit Dashboard
- Interactive Recruitment Analytics

---

## Technology Stack

| Category | Technologies |
|----------|--------------|
| **AI Model** | Google Gemini 2.5 Flash |
| **Programming Language** | Python, TypeScript |
| **Backend Framework** | FastAPI |
| **Frontend Framework** | React, Vite |
| **Data Validation** | Pydantic |
| **Embeddings** | Sentence Transformers |
| **Retrieval** | BM25, FAISS, Reciprocal Rank Fusion (RRF) |
| **Resume Parsing** | PyMuPDF, python-docx |
| **Data Format** | JSON |

---

## How FairHire Works

FairHire follows an end-to-end AI-powered recruitment pipeline that transforms unstructured resumes into explainable, bias-aware hiring recommendations. By combining hybrid retrieval techniques with Google's Gemini 2.5 Flash, the system delivers candidate rankings that are both accurate and transparent.

### Workflow

1. Job Description Submission
2. Resume Processing
3. Hybrid Candidate Retrieval (BM25 + FAISS + RRF)
4. AI Evaluation with Gemini 2.5 Flash
5. Explainable Candidate Ranking
6. Bias Audit
7. Recruitment Analytics

> **Architecture Diagram**

*(Insert architecture diagram here.)*

---

## Product Walkthrough

### Login

*(Insert login screenshot here.)*

Secure authentication provides recruiters with a dedicated workspace for managing hiring workflows.

---

### Job Description Submission

*(Insert job description upload screenshot here.)*

Recruiters begin a new hiring analysis by uploading or entering a job description. FairHire processes the requirements and prepares them for semantic candidate matching.

---

### Dashboard

*(Insert dashboard screenshot here.)*

The dashboard provides an overview of recruitment activity, candidate statistics, fairness metrics, and key hiring insights through an intuitive interface.

---

### Candidate Evaluation

*(Insert candidate evaluation screenshot here.)*

Candidates are evaluated and ranked using skills, experience, project relevance, and semantic similarity. Every recommendation includes transparent AI-generated explanations to support informed hiring decisions.

---

### Bias Audit

*(Insert bias audit screenshot here.)*

The Bias Audit dashboard compares traditional screening methods with FairHire's evaluation pipeline, highlighting overlooked talent, fairness scores, and measurable improvements in hiring outcomes.

---

### Recruitment Analytics

*(Insert analytics screenshot here.)*

Interactive dashboards visualize hiring performance, recruitment trends, fairness metrics, and AI-generated insights to support data-driven recruitment decisions.

---

### Settings

*(Insert settings screenshot here.)*

Recruiters can customize evaluation weights, ranking preferences, and application settings to align FairHire with their organization's hiring process.

---

## Repository Structure

```text
fair-hire/
│
├── api/             # FastAPI backend server
├── frontend/        # React + Vite frontend application
├── agents/          # Multi-agent AI pipeline
├── core/            # Shared resources and data management
├── retrieval/       # FAISS, BM25 & RRF retrieval
├── scoring/         # Dynamic candidate scoring
├── schemas/         # Data validation schemas
├── utils/           # Helper utilities
├── artifacts/       # Generated indexes & embeddings
├── data/            # Candidate datasets
│
├── build_artifacts.py # Script to precompute indexes
├── requirements.txt
├── .env.example
└── README.md
```

---

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/ZenithSoulX/fair-hire.git
cd fair-hire
```

### Backend Setup

1. Create a Virtual Environment
```bash
python -m venv venv
```

2. Activate the Environment

**Windows**
```bash
venv\Scripts\activate
```

**macOS / Linux**
```bash
source venv/bin/activate
```

3. Install Dependencies
```bash
pip install -r requirements.txt
```

4. Configure Environment Variables
Create a `.env` file in the project root.
```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

5. Build Precompute Artifacts
```bash
python build_artifacts.py
```

6. Run the Backend API
```bash
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. Navigate to the frontend directory
```bash
cd frontend
```

2. Install Dependencies
```bash
npm install
```

3. Run the Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5174/` and the backend API at `http://localhost:8000/`.

---

## Future Scope

FairHire establishes a strong foundation for explainable and bias-aware recruitment. Future enhancements include:

- Applicant Tracking System (ATS) integration
- Enterprise API integrations
- Multilingual resume and job description support
- AI-assisted interview preparation and candidate evaluation
- Customizable evaluation criteria for different hiring roles
- Collaborative recruiter workspaces
- Real-time fairness monitoring
- Continuous learning from recruiter feedback

---

## Team

| Name | Contribution |
|------|--------------|
| **Diya Majee** | Frontend Development |
| **Rahul Singh** | AI Engineering & Backend Development |
| **Kushal R** | Retrieval Pipeline & Bias Evaluation |
| **Shalini S** | Product Design, UI/UX, Documentation |

---

## Acknowledgements

We sincerely thank the **Google Gen AI Academy APAC** team for organizing this hackathon and providing a platform to explore practical applications of Generative AI. FairHire represents our shared vision of building recruitment technology that is transparent, explainable, and equitable.

---

<p align="center">
Built for <strong>Google Gen AI Academy APAC Edition</strong>, advancing fair, explainable, and AI-powered recruitment.
</p>

