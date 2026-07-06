import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, MapPin, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import type { Candidate } from '../../types';
import ProgressBar from './ProgressBar';
import BiasShieldTooltip from './BiasShieldTooltip';
import HoloCard from './HoloCard';
import './CandidateCard.css';

interface CandidateCardProps {
  candidate: Candidate;
  style?: React.CSSProperties;
}

// #5 — Avatar SVG ring with animated stroke
const ScoreRingAvatar: React.FC<{ initials: string; color: string; score: number }> = ({
  initials,
  color,
  score,
}) => {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const ringColor =
    score >= 90 ? '#22C55E' : score >= 75 ? '#2563EB' : score >= 50 ? '#F59E0B' : '#EF4444';

  const dashRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!dashRef.current) return;
    dashRef.current.style.strokeDashoffset = String(circ);
    const t = setTimeout(() => {
      if (dashRef.current)
        dashRef.current.style.strokeDashoffset = String(circ - filled);
    }, 120);
    return () => clearTimeout(t);
  }, [circ, filled]);

  return (
    <div className="score-ring-wrap" style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
      <svg width={52} height={52} style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx={26} cy={26} r={r} fill="none" stroke="var(--color-border)" strokeWidth={3} />
        {/* Fill */}
        <circle
          ref={dashRef}
          cx={26}
          cy={26}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ}
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div
        className="score-ring-avatar"
        style={{ background: color }}
      >
        {initials}
      </div>
    </div>
  );
};

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, style }) => {
  const [expanded, setExpanded] = useState(false);

  const scoreColor =
    candidate.match_score >= 90
      ? 'var(--color-success-text)'
      : candidate.match_score >= 75
      ? 'var(--color-primary)'
      : 'var(--color-warning-text)';

  // #2 — Bias shield data
  const blockedBy = candidate.traditional_filter
    ? [candidate.traditional_filter]
    : ['CGPA < 7.0 filter', 'Non tier-1 college'];
  const rankedBy = candidate.skills.slice(0, 3).concat(['Project relevance', 'Semantic match']).slice(0, 4);

  return (
    <HoloCard
      id={`candidate-card-${candidate.id}`}
      className="card card-hover candidate-card animate-slideUp"
      style={style}
    >
      {/* Header */}
      <div className="candidate-card-header">
        {/* #5 — Score ring avatar */}
        <ScoreRingAvatar
          initials={candidate.initials}
          color={candidate.avatar_color || 'var(--color-primary)'}
          score={candidate.match_score}
        />

        <div className="candidate-identity">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-primary">{candidate.name}</h3>

            {/* #12 — Shimmer badge + #2 — BiasShield tooltip */}
            {candidate.is_recovered && (
              <BiasShieldTooltip blockedBy={blockedBy} rankedBy={rankedBy}>
                <span className="badge badge-success recovered-badge">
                  ✦ Recovered Talent
                </span>
              </BiasShieldTooltip>
            )}
          </div>
          <p className="text-sm text-secondary" style={{ marginTop: 2 }}>{candidate.title}</p>
        </div>

        {/* #11 — Tabular nums score */}
        <div className="candidate-score" style={{ color: scoreColor }}>
          <span className="candidate-score-num tabular-nums">{candidate.match_score}%</span>
          <span className="candidate-score-label">Match</span>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="candidate-metrics">
        {[
          { label: 'Experience', value: `${candidate.years_of_experience} yrs`, icon: <Briefcase size={13} /> },
          { label: 'Skill Match', value: `${candidate.skill_match}%` },
          { label: 'Semantic', value: candidate.semantic_score.toFixed(2) },
          { label: 'Location', value: candidate.location, icon: <MapPin size={13} /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="candidate-metric">
            <p className="candidate-metric-label">{label}</p>
            <p className="candidate-metric-value tabular-nums">
              {icon && <span style={{ marginRight: 3 }}>{icon}</span>}
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* #15 — Expand/Collapse toggle */}
      <button
        className="candidate-expand-toggle"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
      >
        <span className="text-xs font-medium">{expanded ? 'Hide details' : 'Show details'}</span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Expandable details section */}
      <div className={`candidate-details${expanded ? ' open' : ''}`}>
        {/* Systematic Requirement vs Fit Comparison Table */}
        <div className="candidate-comparison-table-wrap" style={{ marginTop: 16 }}>
          <p className="text-xs font-bold text-secondary" style={{ marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Alignment Scorecard
          </p>
          <table className="candidate-comparison-table">
            <thead>
              <tr>
                <th>Signal</th>
                <th>Target JD Range</th>
                <th>Candidate Match</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-semibold text-primary">Skills overlap</td>
                <td>Core stack matches</td>
                <td>
                  <span className="badge badge-success tabular-nums">{candidate.skill_match}%</span>
                </td>
              </tr>
              <tr>
                <td className="font-semibold text-primary">Experience</td>
                <td>5+ Years preferred</td>
                <td className="tabular-nums font-semibold">{candidate.years_of_experience} Years</td>
              </tr>
              <tr>
                <td className="font-semibold text-primary">Semantic Similarity</td>
                <td>Contextual alignment</td>
                <td className="tabular-nums font-semibold">{(candidate.semantic_score * 100).toFixed(0)}%</td>
              </tr>
              <tr>
                <td className="font-semibold text-primary">Proxy filter</td>
                <td>Ignored / Neutral</td>
                <td>
                  {candidate.is_recovered ? (
                    <span className="badge badge-error" style={{ fontSize: '0.6875rem' }}>
                      Rescued from filter
                    </span>
                  ) : (
                    <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
                      Clean pass
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Skill Match Bar */}
        <div style={{ marginTop: 14 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
            <span className="text-xs text-secondary">Skill overlap details</span>
            <span className="text-xs font-semibold tabular-nums" style={{ color: scoreColor }}>{candidate.skill_match}%</span>
          </div>
          <ProgressBar value={candidate.skill_match} animated={expanded} />
        </div>

        {/* Skills */}
        <div className="candidate-skills" style={{ marginTop: 14 }}>
          {candidate.skills.map(skill => (
            <span key={skill} className="skill-chip">{skill}</span>
          ))}
        </div>

        {/* Explanation */}
        <div className="candidate-explanation">
          <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
            <Sparkles size={13} style={{ color: 'var(--color-primary)' }} />
            <span className="text-xs font-semibold text-brand">Why this candidate?</span>
          </div>
          <p className="text-xs text-secondary" style={{ lineHeight: 1.6 }}>{candidate.explanation}</p>
        </div>
      </div>
    </HoloCard>
  );
};

export default CandidateCard;
