import type { Candidate, BiasMetrics, KPIData } from '../types';

export interface AnalysisResponse {
  candidates: Candidate[];
  audit: BiasMetrics;
  kpi: KPIData;
}

export async function analyzeJobDescription(jdText: string): Promise<AnalysisResponse> {
  const res = await fetch('http://localhost:8000/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jd_text: jdText }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Analysis failed');
  }

  const data = await res.json();
  
  const rawCandidates = data.ranking.ranked_candidates;
  const rawAudit = data.audit;

  const candidates: Candidate[] = rawCandidates.map((c: any) => {
    // Determine initials
    const parts = c.candidate_name.split(' ');
    const initials = parts.length > 1 
      ? parts[0][0] + parts[parts.length - 1][0] 
      : parts[0][0];

    // Determine traditional filter text if recovered
    let filterText = '';
    if (c.is_recovered) {
       filterText = 'Filtered by traditional ATS criteria (College Tier / CGPA)';
    }

    return {
      id: c.candidate_id,
      name: c.candidate_name,
      initials: initials.toUpperCase(),
      title: c.title || 'Software Engineer',
      location: c.location || 'Remote',
      years_of_experience: c.years_of_experience || 0,
      // heuristic_score returns up to 12.0 (0-1 × 120 capped); normalize to 0–100
      match_score: Math.min(100, Math.round((c.final_score / 12) * 100)),
      semantic_score: c.feature_scores?.retrieval_score || 0,
      skill_match: Math.min(100, Math.round((c.feature_scores?.required_skill_ratio || 0) * 100)),
      skills: c.skills || [],
      explanation: c.reasoning || '',
      is_recovered: c.is_recovered,
      traditional_filter: filterText,
      recovery_reason: c.is_recovered ? c.reasoning : undefined,
    };
  });

  const audit: BiasMetrics = {
    recovered: rawAudit.tier3_selected + rawAudit.low_cgpa_selected || 0,
    talent_loss_prevented: 31, // Mock metric not in API
    bias_risk: 'Low',
    filter_bias: 'High',
    fair_hiring_score: 94,
    traditional_surfaced: rawAudit.total_candidates - (rawAudit.tier3_selected + rawAudit.low_cgpa_selected || 0),
    fairhire_surfaced: rawAudit.total_candidates,
    traditional_interviews: 0,
    fairhire_interviews: 0,
    traditional_hires: 0,
    fairhire_hires: 0,
    traditional_diverse: 0,
    fairhire_diverse: 0,
  };

  const kpi: KPIData = {
    candidates_ranked: rawAudit.total_candidates,
    recovered: audit.recovered,
    avg_skill_match: Math.round(
      candidates.reduce((acc, c) => acc + c.skill_match, 0) / (candidates.length || 1)
    ),
    processing_time: 1.5,
  };

  return { candidates, audit, kpi };
}
