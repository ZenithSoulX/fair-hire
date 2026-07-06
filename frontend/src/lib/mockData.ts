import type { Candidate, KPIData, BiasMetrics, AnalyticsKPI, FairnessTrend, SkillDistribution, FunnelData, User } from '../types';

// ─── Current User ──────────────────────────────────────────────────────────
export const MOCK_USER: User = {
  name: 'Aditi Rao',
  role: 'Talent Lead',
  company: 'Acme',
  initials: 'AR',
};

// ─── KPI Data ──────────────────────────────────────────────────────────────
export const MOCK_KPI: KPIData = {
  candidates_ranked: 168,
  recovered: 14,
  avg_skill_match: 87,
  processing_time: 1.2,
};

// ─── Candidates ────────────────────────────────────────────────────────────
export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: 'c1',
    name: 'Priya Menon',
    initials: 'PM',
    title: 'Senior Backend Engineer',
    location: 'Bengaluru',
    years_of_experience: 5,
    match_score: 96,
    semantic_score: 0.91,
    skill_match: 96,
    skills: ['Go', 'Kafka', 'PostgreSQL', 'Kubernetes', 'gRPC'],
    explanation: 'Direct match on distributed systems and event streaming. Shipped a payment ledger that mirrors the JD\'s core requirement.',
    is_recovered: true,
    recovery_reason: 'Direct match on distributed systems and event streaming. Shipped a payment ledger that mirrors the JD\'s core requirement.',
    traditional_filter: 'CGPA < 7.0 and non-tier-1 college',
    avatar_color: '#7C3AED',
  },
  {
    id: 'c2',
    name: 'Sara Okonkwo',
    initials: 'SO',
    title: 'ML Platform Engineer',
    location: 'Berlin',
    years_of_experience: 6,
    match_score: 94,
    semantic_score: 0.93,
    skill_match: 94,
    skills: ['Python', 'Ray', 'Kubernetes', 'MLflow', 'PyTorch'],
    explanation: 'Semantic match on ML infrastructure. No formal 4-year degree but 6 years of platform work at scale.',
    is_recovered: true,
    recovery_reason: 'Semantic match on ML infrastructure. No formal 4-year degree but 6 years of platform work at scale.',
    traditional_filter: 'No 4-year degree from qualifying institution',
    avatar_color: '#059669',
  },
  {
    id: 'c3',
    name: 'Marcus Adeyemi',
    initials: 'MA',
    title: 'Full-Stack Engineer',
    location: 'Lagos',
    years_of_experience: 4,
    match_score: 92,
    semantic_score: 0.88,
    skill_match: 92,
    skills: ['TypeScript', 'Node.js', 'React', 'AWS', 'Terraform'],
    explanation: 'Strong overlap with product surface area. KYC work aligns with the JD\'s compliance requirements.',
    is_recovered: false,
    avatar_color: '#DC2626',
  },
  {
    id: 'c4',
    name: 'Leilani Cruz',
    initials: 'LC',
    title: 'Site Reliability Engineer',
    location: 'Manila',
    years_of_experience: 7,
    match_score: 90,
    semantic_score: 0.86,
    skill_match: 90,
    skills: ['Kubernetes', 'Terraform', 'Prometheus', 'Go', 'PostgreSQL'],
    explanation: 'Deep SRE experience directly relevant to reliability requirements. Non-traditional background.',
    is_recovered: true,
    recovery_reason: 'Deep SRE experience directly relevant to reliability requirements. Non-traditional background.',
    traditional_filter: 'CGPA < 7.0 filter',
    avatar_color: '#D97706',
  },
  {
    id: 'c5',
    name: 'Rohan Iyer',
    initials: 'RI',
    title: 'Staff Software Engineer',
    location: 'San Francisco',
    years_of_experience: 9,
    match_score: 89,
    semantic_score: 0.85,
    skill_match: 89,
    skills: ['Java', 'Kotlin', 'Kafka', 'AWS', 'gRPC'],
    explanation: 'Broad staff-level experience. Some skills adjacent rather than exact.',
    is_recovered: false,
    avatar_color: '#2563EB',
  },
  {
    id: 'c6',
    name: 'Jonas Weber',
    initials: 'JW',
    title: 'Backend Engineer',
    location: 'Munich',
    years_of_experience: 3,
    match_score: 84,
    semantic_score: 0.79,
    skill_match: 84,
    skills: ['Rust', 'Redis', 'PostgreSQL', 'Docker'],
    explanation: 'Solid systems background. Slightly lower project relevance to payment infrastructure.',
    is_recovered: false,
    avatar_color: '#0891B2',
  },
];

// ─── Bias Audit ────────────────────────────────────────────────────────────
export const MOCK_BIAS: BiasMetrics = {
  recovered: 14,
  talent_loss_prevented: 31,
  bias_risk: 'High',
  filter_bias: 'High',
  fair_hiring_score: 94,
  traditional_surfaced: 84,
  fairhire_surfaced: 168,
  traditional_interviews: 32,
  fairhire_interviews: 61,
  traditional_hires: 5,
  fairhire_hires: 12,
  traditional_diverse: 12,
  fairhire_diverse: 44,
};

// ─── Analytics ─────────────────────────────────────────────────────────────
export const MOCK_ANALYTICS_KPI: AnalyticsKPI = {
  time_to_hire: 18,
  offer_accept_rate: 82,
  fairness_score: 94,
  pipeline_diversity: 44,
  time_to_hire_delta: -24,
  offer_accept_delta: 11,
  fairness_score_delta: 7,
  pipeline_diversity_delta: 18,
};

export const MOCK_FAIRNESS_TREND: FairnessTrend[] = [
  { month: 'Feb', score: 72 },
  { month: 'Mar', score: 75 },
  { month: 'Apr', score: 79 },
  { month: 'May', score: 83 },
  { month: 'Jun', score: 88 },
  { month: 'Jul', score: 94 },
];

export const MOCK_SKILL_DIST: SkillDistribution[] = [
  { skill: 'Python', count: 112 },
  { skill: 'Kubernetes', count: 87 },
  { skill: 'Go', count: 64 },
  { skill: 'TypeScript', count: 59 },
  { skill: 'Kafka', count: 48 },
  { skill: 'PostgreSQL', count: 45 },
  { skill: 'AWS', count: 41 },
  { skill: 'React', count: 38 },
];

export const MOCK_FUNNEL: FunnelData[] = [
  { stage: 'Sourced', traditional: 84, fairhire: 168 },
  { stage: 'Screened', traditional: 60, fairhire: 140 },
  { stage: 'Interview', traditional: 32, fairhire: 61 },
  { stage: 'Offer', traditional: 10, fairhire: 22 },
  { stage: 'Hired', traditional: 5, fairhire: 12 },
];

export const MOCK_JD = `Senior AI Engineer — Redrob AI

We're building the next generation of intelligent search and recommendation infrastructure. Our stack is Python-first with heavy use of vector search, distributed systems, and production ML.

What you'll work on:
• Design and implement production-grade retrieval systems (FAISS, Qdrant, Weaviate)
• Build and optimize hybrid search pipelines (dense + sparse retrieval, BM25, RRF fusion)
• Own ranking and evaluation: NDCG, MRR, precision@k
• Fine-tune and deploy embedding models for domain-specific tasks
• Collaborate with product to ship AI features that affect millions of users

What we're looking for:
• 5-9 years experience in backend or ML engineering
• Strong Python — you write clean, tested, production code
• Production deployment experience: containerisation, monitoring, rollbacks
• Experience with vector databases or information retrieval
• Bonus: LLM fine-tuning, distributed systems, open source contributions`;
