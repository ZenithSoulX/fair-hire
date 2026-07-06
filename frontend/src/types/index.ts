// ─── Candidate & Skills ────────────────────────────────────────────────────

export interface Skill {
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced';
  endorsements?: number;
}

export interface CareerEntry {
  company: string;
  title: string;
  duration_months: number;
  is_current: boolean;
  description?: string;
}

export interface Candidate {
  id: string;
  name: string;
  initials: string;
  title: string;
  location: string;
  years_of_experience: number;
  match_score: number;       // 0–100
  semantic_score: number;    // 0–1
  skill_match: number;       // 0–100
  skills: string[];
  explanation: string;
  is_recovered: boolean;
  recovery_reason?: string;
  traditional_filter?: string;
  avatar_color?: string;
}

// ─── KPI & Analytics ───────────────────────────────────────────────────────

export interface KPIData {
  candidates_ranked: number;
  recovered: number;
  avg_skill_match: number;
  processing_time: number;
}

export interface AnalyticsKPI {
  time_to_hire: number;
  offer_accept_rate: number;
  fairness_score: number;
  pipeline_diversity: number;
  time_to_hire_delta: number;
  offer_accept_delta: number;
  fairness_score_delta: number;
  pipeline_diversity_delta: number;
}

export interface FairnessTrend {
  month: string;
  score: number;
}

export interface SkillDistribution {
  skill: string;
  count: number;
}

export interface FunnelData {
  stage: string;
  traditional: number;
  fairhire: number;
}

// ─── Bias Audit ────────────────────────────────────────────────────────────

export interface BiasMetrics {
  recovered: number;
  talent_loss_prevented: number;  // percent
  bias_risk: 'Low' | 'Medium' | 'High';
  filter_bias: 'Low' | 'Medium' | 'High';
  fair_hiring_score: number;      // out of 100
  traditional_surfaced: number;
  fairhire_surfaced: number;
  traditional_interviews: number;
  fairhire_interviews: number;
  traditional_hires: number;
  fairhire_hires: number;
  traditional_diverse: number;    // percent
  fairhire_diverse: number;       // percent
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export interface User {
  name: string;
  role: string;
  company: string;
  initials: string;
}

// ─── Analysis ──────────────────────────────────────────────────────────────

export type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';
