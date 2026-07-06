import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal, Sparkles, Upload, FileText, AlertCircle } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import KPICard from '../components/ui/KPICard';
import CandidateCard from '../components/ui/CandidateCard';
import { MOCK_CANDIDATES, MOCK_KPI, MOCK_JD, MOCK_BIAS } from '../lib/mockData';
import type { Candidate, KPIData, BiasMetrics } from '../types';
import { analyzeJobDescription } from '../lib/api';
import './DashboardPage.css';

// #8 — Skill keyword detection regex list
const SKILL_KEYWORDS = [
  'Python','TypeScript','JavaScript','Go','Rust','Java','Kotlin','C++','C#',
  'Kubernetes','Docker','Terraform','AWS','GCP','Azure',
  'React','Node.js','FastAPI','Django','Flask','GraphQL','gRPC',
  'Kafka','Redis','PostgreSQL','MongoDB','Elasticsearch','Cassandra',
  'FAISS','Qdrant','Weaviate','Pinecone','ChromaDB',
  'PyTorch','TensorFlow','scikit-learn','LightGBM','XGBoost',
  'BERT','GPT','LLM','FAISS','BM25','RRF','Airflow','Spark','dbt',
  'MLflow','Ray','Weights & Biases','Hugging Face',
  'LangChain','LlamaIndex','OpenAI','Gemini',
];

const SKILL_CATEGORIES: Record<string, string> = {
  Python: 'Languages', TypeScript: 'Languages', JavaScript: 'Languages', Go: 'Languages', Rust: 'Languages', Java: 'Languages', Kotlin: 'Languages', 'C++': 'Languages', 'C#': 'Languages',
  Kubernetes: 'Infrastructure', Docker: 'Infrastructure', Terraform: 'Infrastructure', AWS: 'Infrastructure', GCP: 'Infrastructure', Azure: 'Infrastructure',
  React: 'Tools & Frameworks', 'Node.js': 'Tools & Frameworks', FastAPI: 'Tools & Frameworks', Django: 'Tools & Frameworks', Flask: 'Tools & Frameworks', GraphQL: 'Tools & Frameworks', gRPC: 'Tools & Frameworks', Airflow: 'Infrastructure', Spark: 'Infrastructure', dbt: 'Tools & Frameworks',
  Kafka: 'Databases & Streaming', Redis: 'Databases & Streaming', PostgreSQL: 'Databases & Streaming', MongoDB: 'Databases & Streaming', Elasticsearch: 'Databases & Streaming', Cassandra: 'Databases & Streaming',
  FAISS: 'AI & Vector Search', Qdrant: 'AI & Vector Search', Weaviate: 'AI & Vector Search', Pinecone: 'AI & Vector Search', ChromaDB: 'AI & Vector Search',
  PyTorch: 'AI & Vector Search', TensorFlow: 'AI & Vector Search', 'scikit-learn': 'AI & Vector Search', LightGBM: 'AI & Vector Search', XGBoost: 'AI & Vector Search',
  BERT: 'AI & Vector Search', GPT: 'AI & Vector Search', LLM: 'AI & Vector Search', BM25: 'AI & Vector Search', RRF: 'AI & Vector Search', MLflow: 'AI & Vector Search', Ray: 'AI & Vector Search', 'Weights & Biases': 'AI & Vector Search', 'Hugging Face': 'AI & Vector Search',
  LangChain: 'AI & Vector Search', LlamaIndex: 'AI & Vector Search', OpenAI: 'AI & Vector Search', Gemini: 'AI & Vector Search'
};


function extractSkills(text: string): string[] {
  const found = new Set<string>();
  const lowerText = text.toLowerCase();
  const isWordChar = (c: string) => /[a-z0-9_]/i.test(c);

  SKILL_KEYWORDS.forEach(kw => {
    const lowerKw = kw.toLowerCase();
    let startIdx = 0;
    while (true) {
      const idx = lowerText.indexOf(lowerKw, startIdx);
      if (idx === -1) break;

      // Check boundary conditions
      const charBefore = idx > 0 ? lowerText[idx - 1] : ' ';
      const charAfter = idx + lowerKw.length < lowerText.length ? lowerText[idx + lowerKw.length] : ' ';

      const validBefore = !isWordChar(lowerKw[0]) || !isWordChar(charBefore);
      const validAfter = !isWordChar(lowerKw[lowerKw.length - 1]) || !isWordChar(charAfter);

      if (validBefore && validAfter) {
        found.add(kw);
        break; // matched this keyword, move to next
      }
      startIdx = idx + 1;
    }
  });
  return Array.from(found).slice(0, 12);
}

const DashboardPage: React.FC = () => {
  const [jd, setJd] = useState(MOCK_JD);
  const [analyzing, setAnalyzing] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [kpi, setKpi] = useState<KPIData>(MOCK_KPI);
  const [bias, setBias] = useState<BiasMetrics>(MOCK_BIAS);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // #8 — Real-time skill extraction
  const detectedSkills = useMemo(() => extractSkills(jd), [jd]);

  const groupedSkills = useMemo(() => {
    const groups: Record<string, string[]> = {};
    detectedSkills.forEach(skill => {
      const cat = SKILL_CATEGORIES[skill] || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(skill);
    });
    return groups;
  }, [detectedSkills]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await analyzeJobDescription(jd);
      setCandidates(res.candidates);
      setKpi(res.kpi);
      setBias(res.audit);
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="page-wrapper">
      <PageHeader
        section="DASHBOARD"
        title="Rank candidates fairly"
        subtitle="Paste a job description. FairHire ranks candidates by skills, experience, and project relevance — not by college tier or CGPA."
        actions={
          <>
            <button className="btn btn-outline btn-sm">
              <SlidersHorizontal size={14} /> Filters
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => { setJd(''); setCandidates([]); }}>
              <Sparkles size={14} /> New analysis
            </button>
          </>
        }
      />

      {/* Error Banner */}
      {error && (
        <div className="error-banner animate-slideUp">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button className="error-dismiss" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* #4 — Glassmorphism Bias Audit Alert Card */}
      <div className="bias-alert-card glass-card animate-slideUp">
        <div className="bias-alert-left">
          <div className="bias-alert-badge">
            <span>⚠</span> BIAS AUDIT SUMMARY
          </div>
          <h2 className="text-3xl font-extrabold text-primary" style={{ marginTop: 10, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            {bias.recovered} Qualified Candidates<br />Recovered
          </h2>
          <p className="text-secondary text-sm" style={{ marginTop: 12, maxWidth: 520, lineHeight: 1.7 }}>
            Traditional AI screening would have rejected these candidates due to CGPA cutoffs and college-tier filtering.
            FairHire surfaced them by evaluating skills, experience, and real project relevance instead.
          </p>
          <button
            className="btn btn-outline"
            style={{ marginTop: 20 }}
            onClick={() => navigate('/bias-audit')}
          >
            Open full bias audit →
          </button>
        </div>
        <div className="bias-alert-metrics">
          {[
            { label: 'FILTER BIAS', value: bias.filter_bias, color: 'var(--color-warning-text)' },
            { label: 'FAIR HIRING SCORE', value: `${bias.fair_hiring_score}/100`, color: 'var(--color-primary)' },
            { label: 'CANDIDATES RECOVERED', value: `+${bias.recovered}`, color: 'var(--color-success-text)' },
            { label: 'TALENT LOSS PREVENTED', value: `${bias.talent_loss_prevented}%`, color: 'var(--color-text-primary)' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bias-alert-metric">
              <p className="section-label">{label}</p>
              <p className="bias-alert-metric-value tabular-nums" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Grid — with sparklines (#3) */}
      <div className="grid-4 stagger-children">
        <KPICard
          title="CANDIDATES RANKED"
          value={kpi.candidates_ranked}
          subtitle="Across active roles"
          sparklineKey="candidates"
        />
        <KPICard
          title="QUALIFIED CANDIDATES RECOVERED"
          value={kpi.recovered}
          prefix="+"
          subtitle="Would've been filtered out"
          valueColor="var(--color-success-text)"
          sparklineKey="recovered"
          sparklineColor="var(--color-success)"
        />
        <KPICard
          title="AVERAGE SKILL MATCH"
          value={kpi.avg_skill_match}
          suffix="%"
          subtitle="Weighted by JD relevance"
          sparklineKey="skill"
        />
        <KPICard
          title="PROCESSING TIME"
          value={kpi.processing_time}
          suffix="s"
          subtitle="p95 per candidate"
          animateCount={false}
          sparklineKey="time"
          sparklineColor="var(--color-warning)"
        />
      </div>

      {/* JD Input + #8 skill extraction preview */}
      <div className="card jd-panel">
        <div className="jd-panel-header">
          <div>
            <h2 className="section-title">Job description</h2>
            <p className="section-subtitle">Paste the JD or upload a file. FairHire extracts the signal.</p>
          </div>
          <button className="btn btn-outline btn-sm">
            <Upload size={14} /> Upload
          </button>
        </div>
        <div className="jd-textarea-wrap">
          <textarea
            className="input textarea jd-textarea"
            value={jd}
            onChange={e => setJd(e.target.value)}
            placeholder="Paste your job description here…"
          />
          {/* #8 — Real-time skill chip preview grouped systematically */}
          {detectedSkills.length > 0 && (
            <div className="jd-skills-preview">
              <span className="jd-skills-label" style={{ marginBottom: 6 }}>
                <Sparkles size={12} /> Extracted Pipeline Signals ({detectedSkills.length})
              </span>
              <div className="jd-skills-groups">
                {Object.entries(groupedSkills).map(([cat, list]) => (
                  <div key={cat} className="jd-skills-group-col animate-slideUp">
                    <p className="jd-skills-group-title">{cat}</p>
                    <div className="jd-skills-chips">
                      {list.map(s => (
                        <span key={s} className="skill-chip jd-skill-chip">{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="jd-textarea-footer">
            <span className="flex items-center gap-2 text-xs text-tertiary">
              <FileText size={13} />
              {jd.length} chars · gemini-2.5-flash
            </span>
            <button
              className={`btn btn-primary btn-sm${analyzing ? ' analyzing' : ''}`}
              onClick={handleAnalyze}
              disabled={analyzing || !jd.trim()}
            >
              {analyzing ? (
                <><span className="spin-dot" />Analyzing…</>
              ) : (
                <><Sparkles size={14} />Analyze candidates</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Ranked Candidates */}
      <div className="candidates-section">
        <div style={{ marginBottom: 20 }}>
          <h2 className="section-title">Ranked candidates</h2>
          <p className="section-subtitle">
            Ordered by skill match, semantic similarity, and project relevance.
            Showing {candidates.length} results
          </p>
        </div>
        <div className="candidates-grid stagger-children">
          {candidates.map((c, i) => (
            <CandidateCard
              key={c.id}
              candidate={c}
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
