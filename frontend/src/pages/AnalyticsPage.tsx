import React from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Clock, CheckCircle, ShieldCheck, Users2 } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import KPICard from '../components/ui/KPICard';
import {
  MOCK_ANALYTICS_KPI,
  MOCK_FAIRNESS_TREND,
  MOCK_SKILL_DIST,
  MOCK_FUNNEL,
} from '../lib/mockData';
import './AnalyticsPage.css';

const INSIGHTS = [
  {
    icon: '📈',
    title: 'Fairness accelerating',
    body: 'Fair hiring score has grown +22 points over 6 months, driven primarily by removal of CGPA floor filters.',
  },
  {
    icon: '🎯',
    title: 'Offer acceptance trending up',
    body: 'Candidates ranked by skill alignment — not proxy signals — accept offers 11% more often.',
  },
  {
    icon: '⚡',
    title: 'Faster time-to-hire',
    body: 'Removing unqualified top-tier candidates from interview rounds cut average time-to-hire by 24%.',
  },
  {
    icon: '🌍',
    title: 'Geographic diversity widened',
    body: 'Pipeline now spans 14 countries vs 6 in the prior quarter, with no reduction in skill match scores.',
  },
];

const AnalyticsPage: React.FC = () => (
  <div className="page-wrapper">
    <PageHeader
      section="ANALYTICS"
      title="Recruitment insights"
      subtitle="AI-powered hiring analytics across your active candidate pipeline."
    />

    {/* KPI Row */}
    <div className="grid-4 stagger-children">
      <KPICard
        title="TIME TO HIRE"
        value={MOCK_ANALYTICS_KPI.time_to_hire}
        suffix="d"
        subtitle="Avg days to fill"
        delta={MOCK_ANALYTICS_KPI.time_to_hire_delta}
        deltaLabel="vs last qtr"
        icon={<Clock size={16} />}
      />
      <KPICard
        title="OFFER ACCEPT RATE"
        value={MOCK_ANALYTICS_KPI.offer_accept_rate}
        suffix="%"
        subtitle="Accepted in 30d"
        delta={MOCK_ANALYTICS_KPI.offer_accept_delta}
        icon={<CheckCircle size={16} />}
      />
      <KPICard
        title="FAIRNESS SCORE"
        value={MOCK_ANALYTICS_KPI.fairness_score}
        subtitle="Out of 100"
        delta={MOCK_ANALYTICS_KPI.fairness_score_delta}
        icon={<ShieldCheck size={16} />}
      />
      <KPICard
        title="PIPELINE DIVERSITY"
        value={MOCK_ANALYTICS_KPI.pipeline_diversity}
        suffix="%"
        subtitle="This quarter"
        delta={MOCK_ANALYTICS_KPI.pipeline_diversity_delta}
        icon={<Users2 size={16} />}
      />
    </div>

    {/* Chart + Insights Row */}
    <div className="grid-2 analytics-main-row">
      {/* Fairness Trend Chart */}
      <div className="card analytics-chart-card">
        <div className="analytics-card-header">
          <div>
            <h2 className="section-title">Fairness score trend</h2>
            <p className="section-subtitle">Monthly fair hiring score over 6 months</p>
          </div>
          <span className="badge badge-success">+{MOCK_ANALYTICS_KPI.fairness_score_delta}pts</span>
        </div>
        <div className="chart-wrap" style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_FAIRNESS_TREND} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[65, 100]} tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  boxShadow: 'var(--shadow-md)',
                  fontSize: 13,
                }}
                itemStyle={{ color: 'var(--color-primary)' }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: 'var(--color-primary)', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: 'var(--color-primary)' }}
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights */}
      <div className="card analytics-insights-card">
        <div className="analytics-card-header">
          <h2 className="section-title">AI-generated insights</h2>
          <span className="badge badge-primary">Gemini</span>
        </div>
        <div className="insights-list">
          {INSIGHTS.map(({ icon, title, body }) => (
            <div key={title} className="insight-row">
              <span className="insight-icon">{icon}</span>
              <div>
                <p className="text-sm font-semibold text-primary">{title}</p>
                <p className="text-xs text-secondary" style={{ marginTop: 3, lineHeight: 1.65 }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Detail Charts Row */}
    <div className="grid-2">
      {/* Skill Distribution */}
      <div className="card analytics-chart-card">
        <div className="analytics-card-header">
          <div>
            <h2 className="section-title">Top skills in pipeline</h2>
            <p className="section-subtitle">Candidates with this skill matched at ≥70%</p>
          </div>
        </div>
        <div className="chart-wrap" style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_SKILL_DIST} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 70 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="skill" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} width={70} />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  boxShadow: 'var(--shadow-md)',
                  fontSize: 13,
                }}
              />
              <Bar 
                dataKey="count" 
                fill="var(--color-primary)" 
                radius={[0, 4, 4, 0]} 
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hiring Funnel */}
      <div className="card analytics-chart-card">
        <div className="analytics-card-header">
          <div>
            <h2 className="section-title">Hiring funnel comparison</h2>
            <p className="section-subtitle">Traditional AI vs FairHire at each stage</p>
          </div>
        </div>
        <div className="chart-wrap" style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_FUNNEL} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="stage" tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  boxShadow: 'var(--shadow-md)',
                  fontSize: 13,
                }}
              />
              <Bar 
                dataKey="traditional" 
                fill="var(--color-border)" 
                radius={[4, 4, 0, 0]} 
                name="Traditional" 
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
              <Bar 
                dataKey="fairhire" 
                fill="var(--color-primary)" 
                radius={[4, 4, 0, 0]} 
                name="FairHire" 
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </div>
);

export default AnalyticsPage;
