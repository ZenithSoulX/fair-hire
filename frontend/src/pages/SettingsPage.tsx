import React, { useState } from 'react';
import { Save, Building2, Mail, ShieldCheck, Sliders } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import './SettingsPage.css';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, label, description }) => (
  <div className="settings-toggle-row">
    <div className="settings-toggle-info">
      <p className="text-sm font-semibold text-primary">{label}</p>
      <p className="text-xs text-secondary" style={{ marginTop: 2, lineHeight: 1.6 }}>{description}</p>
    </div>
    <button
      role="switch"
      aria-checked={checked}
      className={`switch-track${checked ? ' on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <div className="switch-thumb" />
    </button>
  </div>
);

const SettingsPage: React.FC = () => {
  const [org, setOrg] = useState('Acme Corp');
  const [email, setEmail] = useState('talent@acme.com');
  const [saved, setSaved] = useState(false);

  const [fairnessToggles, setFairnessToggles] = useState({
    ignoreCGPA: true,
    ignoreCollegeTier: true,
    semanticRanking: true,
    biasAuditMode: false,
  });

  const [weights, setWeights] = useState({
    skillMatch: 40,
    projectRelevance: 25,
    experience: 20,
    semantic: 15,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <div className="page-wrapper">
      <PageHeader
        section="SETTINGS"
        title="Workspace settings"
        subtitle="Configure your workspace, fairness controls, and ranking algorithm weights."
      />

      {/* Workspace */}
      <div className="card settings-section animate-slideUp">
        <div className="settings-section-header">
          <div className="settings-section-icon"><Building2 size={18} /></div>
          <div>
            <h2 className="section-title">Workspace</h2>
            <p className="section-subtitle">Basic organisation details</p>
          </div>
        </div>
        <div className="settings-form-grid">
          <div className="settings-field">
            <label className="settings-label" htmlFor="org">Organisation name</label>
            <input
              id="org"
              className="input"
              value={org}
              onChange={e => setOrg(e.target.value)}
              placeholder="Your company"
            />
          </div>
          <div className="settings-field">
            <label className="settings-label" htmlFor="recruiter-email">
              <Mail size={13} style={{ display: 'inline', marginRight: 5 }} />
              Recruiter email
            </label>
            <input
              id="recruiter-email"
              type="email"
              className="input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </div>
        </div>
      </div>

      {/* Fairness Controls */}
      <div className="card settings-section animate-slideUp">
        <div className="settings-section-header">
          <div className="settings-section-icon success"><ShieldCheck size={18} /></div>
          <div>
            <h2 className="section-title">Fairness controls</h2>
            <p className="section-subtitle">Configure which signals are used in ranking vs audit-only</p>
          </div>
        </div>
        <div className="settings-toggles">
          <ToggleSwitch
            checked={fairnessToggles.ignoreCGPA}
            onChange={v => setFairnessToggles(f => ({ ...f, ignoreCGPA: v }))}
            label="Ignore CGPA in ranking"
            description="CGPA is logged for audit purposes only and does not affect a candidate's rank position."
          />
          <ToggleSwitch
            checked={fairnessToggles.ignoreCollegeTier}
            onChange={v => setFairnessToggles(f => ({ ...f, ignoreCollegeTier: v }))}
            label="Ignore college tier in ranking"
            description="Institution tier is excluded from ranking signals. Skills and project work take precedence."
          />
          <ToggleSwitch
            checked={fairnessToggles.semanticRanking}
            onChange={v => setFairnessToggles(f => ({ ...f, semanticRanking: v }))}
            label="Enable semantic ranking"
            description="Use embedding-based similarity between JD and candidate profiles for deeper matching."
          />
          <ToggleSwitch
            checked={fairnessToggles.biasAuditMode}
            onChange={v => setFairnessToggles(f => ({ ...f, biasAuditMode: v }))}
            label="Bias audit mode"
            description="Shows a dual-view comparing traditional filters vs FairHire results on every analysis run."
          />
        </div>
      </div>

      {/* Ranking Weights */}
      <div className="card settings-section animate-slideUp">
        <div className="settings-section-header">
          <div className="settings-section-icon primary"><Sliders size={18} /></div>
          <div>
            <h2 className="section-title">Ranking weights</h2>
            <p className="section-subtitle">
              Adjust relative importance of each signal. Must total exactly 100.
            </p>
          </div>
        </div>

        {/* #10 — Live stacked weight constraint bar */}
        <div className="weight-constraint-bar-wrap">
          <div className="weight-constraint-bar">
            {(Object.keys(weights) as Array<keyof typeof weights>).map((key, i) => {
              const colors = ['#2563EB','#22C55E','#F59E0B','#7C3AED'];
              return (
                <div
                  key={key}
                  className="weight-constraint-seg"
                  style={{
                    width: `${weights[key]}%`,
                    background: colors[i],
                    transition: 'width 0.3s cubic-bezier(0.22,1,0.36,1)',
                  }}
                  title={`${{ skillMatch:'Skill',projectRelevance:'Project',experience:'Exp',semantic:'Semantic' }[key]}: ${weights[key]}%`}
                />
              );
            })}
            {/* Remaining if under 100 */}
            {totalWeight < 100 && (
              <div
                className="weight-constraint-seg remaining"
                style={{ width: `${100 - totalWeight}%` }}
              />
            )}
          </div>
          <div className="weight-constraint-info">
            <div className="weight-legend">
              {(Object.keys(weights) as Array<keyof typeof weights>).map((key, i) => {
                const colors = ['#2563EB','#22C55E','#F59E0B','#7C3AED'];
                const labels = { skillMatch:'Skill match', projectRelevance:'Project relevance', experience:'Experience', semantic:'Semantic' };
                return (
                  <span key={key} className="weight-legend-item">
                    <span className="weight-legend-dot" style={{ background: colors[i] }} />
                    {labels[key]} {weights[key]}%
                  </span>
                );
              })}
            </div>
            <span
              className={`weight-total-badge ${totalWeight === 100 ? 'ok' : 'err'}`}
            >
              {totalWeight === 100 ? '✓ 100%' : `${totalWeight}% — needs ${100 - totalWeight > 0 ? '+' : ''}${100 - totalWeight}%`}
            </span>
          </div>
        </div>

        <div className="settings-weights">
          {(Object.keys(weights) as Array<keyof typeof weights>).map(key => (
            <div key={key} className="weight-row">
              <div className="weight-row-label">
                <span className="text-sm font-medium text-primary">
                  {{
                    skillMatch: 'Skill match',
                    projectRelevance: 'Project relevance',
                    experience: 'Experience',
                    semantic: 'Semantic similarity',
                  }[key]}
                </span>
                <span className="weight-badge tabular-nums">{weights[key]}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={weights[key]}
                onChange={e => setWeights(w => ({ ...w, [key]: Number(e.target.value) }))}
                className="weight-slider"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="settings-actions animate-slideUp">
        <button className="btn btn-outline">Cancel</button>
        <button
          className={`btn${saved ? ' btn-outline' : ' btn-primary'}`}
          onClick={handleSave}
          id="settings-save-btn"
        >
          {saved ? '✓ Saved' : <><Save size={15} /> Save changes</>}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
