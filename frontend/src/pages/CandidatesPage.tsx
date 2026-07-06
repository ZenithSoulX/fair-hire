import React, { useState } from 'react';
import { SlidersHorizontal, Search } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import CandidateCard from '../components/ui/CandidateCard';
import { MOCK_CANDIDATES } from '../lib/mockData';
import './CandidatesPage.css';

const SORT_OPTIONS = ['Match score', 'Experience', 'Semantic score', 'Name'];

// #9 — Score heatmap cell colors
const heatColor = (score: number) => {
  if (score >= 90) return '#15803D';
  if (score >= 80) return '#22C55E';
  if (score >= 70) return '#86EFAC';
  if (score >= 60) return '#FCD34D';
  return '#FCA5A5';
};

// #13 — Empty state SVG illustration
const EmptyState: React.FC<{ query: string }> = ({ query }) => (
  <div className="candidates-empty card">
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <circle cx="26" cy="26" r="18" stroke="var(--color-border)" strokeWidth="3"/>
      <circle cx="26" cy="26" r="11" stroke="var(--color-border-light)" strokeWidth="2" strokeDasharray="4 3"/>
      <line x1="39" y1="39" x2="56" y2="56" stroke="var(--color-border)" strokeWidth="3" strokeLinecap="round"/>
      <text x="22" y="30" fontSize="14" fill="var(--color-text-tertiary)" fontFamily="Inter,sans-serif" fontWeight="700">?</text>
    </svg>
    <p className="text-primary font-semibold" style={{ marginTop: 12 }}>No results for "{query}"</p>
    <p className="text-secondary text-sm" style={{ marginTop: 4 }}>
      Try searching by name, job title, or a specific skill like "Python" or "Kubernetes".
    </p>
  </div>
);

const CandidatesPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('Match score');
  const [filter, setFilter] = useState<'all' | 'recovered'>('all');
  const [heatHover, setHeatHover] = useState<number | null>(null);

  const sorted = [...MOCK_CANDIDATES].sort((a, b) => {
    if (sort === 'Match score') return b.match_score - a.match_score;
    if (sort === 'Experience') return b.years_of_experience - a.years_of_experience;
    if (sort === 'Semantic score') return b.semantic_score - a.semantic_score;
    return a.name.localeCompare(b.name);
  });

  const filtered = sorted.filter(c => {
    const matchesQuery =
      !query ||
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.skills.some(s => s.toLowerCase().includes(query.toLowerCase()));
    const matchesFilter = filter === 'all' || (filter === 'recovered' && c.is_recovered);
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="page-wrapper">
      <PageHeader
        section="CANDIDATES"
        title="Ranked candidates"
        subtitle={`${filtered.length} of ${MOCK_CANDIDATES.length} candidates shown. Ranked by skill match, semantic similarity, and project relevance.`}
      />

      {/* Controls */}
      <div className="candidates-controls">
        <div className="candidates-search-wrap">
          <Search size={16} className="candidates-search-icon" />
          <input
            className="input candidates-search"
            placeholder="Search by name, title or skill…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="candidates-filters">
          <div className="filter-pill-group">
            {(['all', 'recovered'] as const).map(f => (
              <button
                key={f}
                className={`filter-pill${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All candidates' : '✦ Recovered talent'}
              </button>
            ))}
          </div>
          <select
            className="input sort-select"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
          <button className="btn btn-outline btn-sm">
            <SlidersHorizontal size={14} /> Filters
          </button>
        </div>
      </div>

      {/* #9 — Score heatmap row */}
      {filtered.length > 0 && (
        <div className="score-heatmap">
          <p className="score-heatmap-label">Score distribution</p>
          <div className="score-heatmap-cells">
            {filtered.map((c, i) => (
              <div
                key={c.id}
                className="heatmap-cell"
                style={{
                  background: heatHover === i ? 'var(--color-primary)' : heatColor(c.match_score),
                  opacity: heatHover !== null && heatHover !== i ? 0.5 : 1,
                }}
                onMouseEnter={() => setHeatHover(i)}
                onMouseLeave={() => setHeatHover(null)}
                onClick={() => {
                  const el = document.getElementById(`candidate-card-${c.id}`);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.remove('highlight-flash');
                    // Force repaint to re-trigger CSS keyframe animation
                    void el.offsetWidth;
                    el.classList.add('highlight-flash');
                  }
                }}
                title={`${c.name} — ${c.match_score}% · Click to view`}
              >
                {heatHover === i && (
                  <span className="heatmap-cell-tooltip">{c.match_score}%</span>
                )}
              </div>
            ))}
            {/* Pad to 20 cells minimum */}
            {Array.from({ length: Math.max(0, 20 - filtered.length) }).map((_, i) => (
              <div key={`pad-${i}`} className="heatmap-cell heatmap-cell-empty" />
            ))}
          </div>
          <div className="heatmap-legend">
            {['< 60', '60–70', '70–80', '80–90', '≥ 90'].map((l, i) => (
              <div key={l} className="heatmap-legend-item">
                <div
                  className="heatmap-legend-dot"
                  style={{ background: [heatColor(55), heatColor(65), heatColor(75), heatColor(85), heatColor(95)][i] }}
                />
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results or Empty State (#13) */}
      {filtered.length > 0 ? (
        <div className="candidates-list stagger-children">
          {filtered.map((c, i) => (
            <CandidateCard
              key={c.id}
              candidate={c}
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      ) : (
        <EmptyState query={query} />
      )}
    </div>
  );
};

export default CandidatesPage;
