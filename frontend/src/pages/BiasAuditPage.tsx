import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, TrendingUp, AlertTriangle, BarChart3, X, Check } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import KPICard from '../components/ui/KPICard';
import AnimatedFunnel from '../components/ui/AnimatedFunnel';
import { MOCK_BIAS, MOCK_CANDIDATES, MOCK_FUNNEL } from '../lib/mockData';
import './BiasAuditPage.css';

const recoveredCandidates = MOCK_CANDIDATES.filter(c => c.is_recovered);

const BiasAuditPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper">
      <PageHeader
        section="BIAS AUDIT"
        title="Traditional AI Screening vs FairHire"
        subtitle="A side-by-side executive audit of how legacy screening filters shape — and shrink — your qualified candidate pool."
        actions={
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/analytics')}>
            <BarChart3 size={14} /> View analytics
          </button>
        }
      />

      {/* Hero Metrics Row */}
      <div className="grid-3 stagger-children">
        <KPICard
          title="RECOVERED"
          value={MOCK_BIAS.recovered}
          subtitle="Qualified candidates recovered. Reintroduced into your active pipeline this month."
          valueColor="var(--color-success-text)"
          icon={<ShieldCheck size={16} />}
        />
        <KPICard
          title="PREVENTED"
          value={MOCK_BIAS.talent_loss_prevented}
          suffix="%"
          subtitle="Talent loss prevented. Share of strong candidates that would have been filtered out."
          valueColor="var(--color-primary)"
          icon={<TrendingUp size={16} />}
        />
        <KPICard
          title="ASSESSMENT"
          value={MOCK_BIAS.bias_risk}
          subtitle="Bias risk. Legacy filters rely on CGPA and college tier."
          valueColor="var(--color-warning-text)"
          icon={<AlertTriangle size={16} />}
          animateCount={false}
        />
      </div>

      {/* Highlight Alert */}
      <div className="callout callout-warning animate-slideUp">
        <AlertTriangle size={18} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: 2 }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-warning-text)' }}>
            {MOCK_BIAS.recovered} of your top candidates would have been rejected by traditional AI screening.
          </p>
          <p className="text-sm" style={{ color: 'var(--color-warning-text)', marginTop: 4, opacity: 0.85 }}>
            Filters applied: CGPA &lt; 7.0 and tier-1 college requirement.
            FairHire ignored those signals and ranked by JD-aligned skills and project relevance instead.
          </p>
        </div>
      </div>

      {/* Side-by-Side Comparison */}
      <div className="card comparison-card animate-slideUp">
        <h2 className="section-title" style={{ padding: '24px 28px 0' }}>Pipeline comparison</h2>
        <div className="comparison-grid">
          {/* Traditional AI */}
          <div className="comparison-col traditional">
            <div className="comparison-col-header">
              <div className="comparison-col-icon traditional-icon">
                <X size={16} strokeWidth={2.5} />
              </div>
              <div>
                <p className="comparison-col-title">Traditional AI Screening</p>
                <p className="comparison-col-sub">CGPA cutoffs · Tier-1 college filter · Keyword match</p>
              </div>
              <span className="badge badge-neutral">Baseline</span>
            </div>
            <div className="comparison-stats">
              {[
                { label: 'Candidates surfaced', value: `${MOCK_BIAS.traditional_surfaced}` },
                { label: 'Interviews scheduled', value: `${MOCK_BIAS.traditional_interviews}` },
                { label: 'Hires', value: `${MOCK_BIAS.traditional_hires}` },
                { label: 'Diverse hires', value: `${MOCK_BIAS.traditional_diverse}%` },
              ].map(({ label, value }) => (
                <div key={label} className="comparison-stat">
                  <span className="comparison-stat-label">{label}</span>
                  <span className="comparison-stat-value traditional-val">{value}</span>
                </div>
              ))}
            </div>
            <div className="comparison-bullets">
              {[
                'Filters CGPA below 7.0 (rejects late bloomers)',
                'Excludes non-tier-1 colleges',
                'Ignores real projects and open-source work',
                'No semantic understanding of the JD',
              ].map(b => (
                <div key={b} className="comparison-bullet traditional-bullet">
                  <X size={13} /> <span>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FairHire */}
          <div className="comparison-col fairhire">
            <div className="comparison-col-header">
              <div className="comparison-col-icon fairhire-icon">
                <ShieldCheck size={16} strokeWidth={2.5} />
              </div>
              <div>
                <p className="comparison-col-title">FairHire</p>
                <p className="comparison-col-sub">Skills · Experience · Projects · Semantic similarity</p>
              </div>
              <span className="badge badge-success">+140% pipeline</span>
            </div>
            <div className="comparison-stats">
              {[
                { label: 'Candidates surfaced', value: `${MOCK_BIAS.fairhire_surfaced}` },
                { label: 'Interviews scheduled', value: `${MOCK_BIAS.fairhire_interviews}` },
                { label: 'Hires', value: `${MOCK_BIAS.fairhire_hires}` },
                { label: 'Diverse hires', value: `${MOCK_BIAS.fairhire_diverse}%` },
              ].map(({ label, value }) => (
                <div key={label} className="comparison-stat">
                  <span className="comparison-stat-label">{label}</span>
                  <span className="comparison-stat-value fairhire-val">{value}</span>
                </div>
              ))}
            </div>
            <div className="comparison-bullets">
              {[
                'Ranks by JD-aligned skills and outcomes',
                'Weights real projects and measurable impact',
                'College tier and CGPA are audit-only signals',
                'Semantic embedding of full JD and profile',
              ].map(b => (
                <div key={b} className="comparison-bullet fairhire-bullet">
                  <Check size={13} /> <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* #7 — Animated pipeline funnel */}
      <div className="card animate-slideUp" style={{ padding: 28 }}>
        <div style={{ marginBottom: 16 }}>
          <h2 className="section-title">Pipeline at each stage</h2>
          <p className="section-subtitle">How many candidates reach each step — Traditional AI vs FairHire</p>
        </div>
        <AnimatedFunnel stages={MOCK_FUNNEL} />
      </div>

      {/* Recovered Candidates Table */}
      <div className="animate-slideUp">
        <div style={{ marginBottom: 16 }}>
          <h2 className="section-title">Recovered qualified candidates</h2>
          <p className="section-subtitle">
            Strong matches that traditional filters would have removed from the pipeline.{' '}
            <span className="badge badge-success">+{MOCK_BIAS.recovered} recovered</span>
          </p>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Skill Match</th>
                <th>Experience</th>
                <th>Recovery Reason</th>
                <th>Traditional Filter Trigger</th>
              </tr>
            </thead>
            <tbody>
              {recoveredCandidates.map((c, i) => (
                <tr key={c.id} className="animate-slideUp" style={{ animationDelay: `${i * 80}ms` }}>
                  <td>
                    <div className="flex items-center gap-10">
                      <div
                        className="sidebar-avatar"
                        style={{
                          width: 34, height: 34,
                          background: c.avatar_color,
                          borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
                        }}
                      >
                        {c.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{c.name}</p>
                        <p className="text-xs text-secondary">{c.title}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-success">{c.skill_match}%</span>
                  </td>
                  <td>
                    <span className="text-sm font-medium">{c.years_of_experience} yrs</span>
                  </td>
                  <td>
                    <p className="text-xs text-secondary" style={{ maxWidth: 300, lineHeight: 1.6 }}>
                      {c.recovery_reason}
                    </p>
                  </td>
                  <td>
                    <span className="badge badge-error" style={{ fontSize: '0.6875rem' }}>
                      {c.traditional_filter}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Business Impact */}
      <div className="animate-slideUp">
        <div style={{ marginBottom: 16 }}>
          <h2 className="section-title">Business impact</h2>
          <p className="section-subtitle" style={{ maxWidth: 600 }}>
            Fairer inputs, measurably better hiring outcomes.
            When your pipeline expands to include qualified candidates rejected by proxy signals, downstream quality improves — not just diversity.
          </p>
        </div>
        <div className="grid-3 stagger-children">
          {[
            {
              icon: <TrendingUp size={20} />,
              title: 'Broader qualified pool',
              desc: `Interview pipeline grew from ${MOCK_BIAS.traditional_interviews} to ${MOCK_BIAS.fairhire_interviews} candidates per role, without lowering skill thresholds.`,
              color: 'var(--color-primary)',
            },
            {
              icon: <ShieldCheck size={20} />,
              title: 'Transparent, defensible decisions',
              desc: 'Every ranking ships with an explainable reason grounded in the JD — audit-ready by default.',
              color: 'var(--color-success-text)',
            },
            {
              icon: <BarChart3 size={20} />,
              title: 'Stronger hiring quality',
              desc: `Diverse hires rose from ${MOCK_BIAS.traditional_diverse}% to ${MOCK_BIAS.fairhire_diverse}% while first-year performance ratings held or improved.`,
              color: 'var(--color-warning-text)',
            },
          ].map(({ icon, title, desc, color }) => (
            <div key={title} className="card impact-card">
              <div className="impact-icon" style={{ color }}>
                {icon}
              </div>
              <h3 className="text-base font-semibold text-primary" style={{ marginTop: 14 }}>{title}</h3>
              <p className="text-sm text-secondary" style={{ marginTop: 8, lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BiasAuditPage;
