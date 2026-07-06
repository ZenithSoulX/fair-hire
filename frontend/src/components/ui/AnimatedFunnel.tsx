import React, { useState } from 'react';
import './AnimatedFunnel.css';

interface FunnelStage {
  stage: string;
  traditional: number;
  fairhire: number;
}

interface AnimatedFunnelProps {
  stages: FunnelStage[];
}

const SVG_W = 740;
const STAGE_H = 48;
const GAP = 10;
const CX = SVG_W / 2; // 370
const HALF_LANE = 45; // Space in center for labels
const MAX_HALF_WIDTH = 210;

const AnimatedFunnel: React.FC<AnimatedFunnelProps> = ({ stages }) => {
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);

  const maxVal = Math.max(...stages.flatMap(s => [s.traditional, s.fairhire]), 1);
  const scale = MAX_HALF_WIDTH / maxVal;
  const totalH = stages.length * (STAGE_H + GAP) + 20;

  return (
    <div className="animated-funnel-container">
      {/* Legend */}
      <div className="funnel-legend">
        <div className="funnel-legend-item traditional">
          <span className="funnel-legend-dot traditional-dot" />
          <div>
            <p className="legend-title">Traditional AI</p>
            <p className="legend-subtitle">CGPA & College-tier cuts</p>
          </div>
        </div>
        <div className="funnel-legend-item fairhire">
          <span className="funnel-legend-dot fairhire-dot" />
          <div>
            <p className="legend-title font-semibold text-brand">FairHire Pipeline</p>
            <p className="legend-subtitle">Rescued talent + skills fit</p>
          </div>
        </div>
      </div>

      <div className="funnel-svg-wrapper">
        <svg width="100%" height="100%" viewBox={`0 0 ${SVG_W} ${totalH}`} preserveAspectRatio="xMidYMid meet">
          <defs>
            {/* Traditional gradient (leaky, slate gray) */}
            <linearGradient id="tradGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-text-secondary)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="var(--color-text-secondary)" stopOpacity="0.15" />
            </linearGradient>

            {/* FairHire gradient (rich tech-blue to success-green) */}
            <linearGradient id="fairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            {/* Glow filters for premium dark theme support */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {stages.map((stage, i) => {
            const nextStage = stages[i + 1];
            const y_top = i * (STAGE_H + GAP) + 15;
            const y_bottom = y_top + STAGE_H;

            // Widths proportional to counts
            const w_t_top = stage.traditional * scale;
            const w_t_bottom = (nextStage ? nextStage.traditional : stage.traditional) * scale;

            const w_f_top = stage.fairhire * scale;
            const w_f_bottom = (nextStage ? nextStage.fairhire : stage.fairhire) * scale;

            // Coordinate strings
            const tradPoints = `
              ${CX - HALF_LANE},${y_top}
              ${CX - HALF_LANE - w_t_top},${y_top}
              ${CX - HALF_LANE - w_t_bottom},${y_bottom}
              ${CX - HALF_LANE},${y_bottom}
            `.trim();

            const fairPoints = `
              ${CX + HALF_LANE},${y_top}
              ${CX + HALF_LANE + w_f_top},${y_top}
              ${CX + HALF_LANE + w_f_bottom},${y_bottom}
              ${CX + HALF_LANE},${y_bottom}
            `.trim();

            const isHovered = hoveredStage === i;

            // Compute local conversion rate from previous stage
            const prevStage = stages[i - 1];
            const tConv = prevStage ? Math.round((stage.traditional / prevStage.traditional) * 100) : 100;
            const fConv = prevStage ? Math.round((stage.fairhire / prevStage.fairhire) * 100) : 100;

            return (
              <g
                key={stage.stage}
                className={`funnel-stage-group ${isHovered ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredStage(i)}
                onMouseLeave={() => setHoveredStage(null)}
              >
                {/* Traditional Side Polygon */}
                <polygon
                  points={tradPoints}
                  fill="url(#tradGrad)"
                  stroke="var(--color-border)"
                  strokeWidth={isHovered ? 1.5 : 1}
                  className="funnel-poly trad-poly"
                  style={{ transition: 'opacity 0.25s ease, stroke-width 0.25s ease' }}
                />

                {/* FairHire Side Polygon */}
                <polygon
                  points={fairPoints}
                  fill="url(#fairGrad)"
                  filter={isHovered ? 'url(#glow)' : undefined}
                  className="funnel-poly fair-poly"
                  style={{ transition: 'transform 0.25s ease, filter 0.25s ease' }}
                />

                {/* Central Stage Text Label */}
                <rect
                  x={CX - HALF_LANE + 6}
                  y={y_top + 4}
                  width={(HALF_LANE - 6) * 2}
                  height={STAGE_H - 8}
                  rx="6"
                  className="funnel-label-bg"
                />
                <text
                  x={CX}
                  y={y_top + STAGE_H / 2 + 4}
                  textAnchor="middle"
                  className="funnel-stage-name"
                >
                  {stage.stage.toUpperCase()}
                </text>

                {/* Left Candidate Count (Traditional) */}
                <text
                  x={CX - HALF_LANE - w_t_top - 14}
                  y={y_top + STAGE_H / 2 + 4}
                  textAnchor="end"
                  className="funnel-count traditional-count tabular-nums"
                >
                  {stage.traditional}
                </text>

                {/* Right Candidate Count (FairHire) */}
                <text
                  x={CX + HALF_LANE + w_f_top + 14}
                  y={y_top + STAGE_H / 2 + 4}
                  textAnchor="start"
                  className="funnel-count fairhire-count tabular-nums"
                >
                  {stage.fairhire}
                </text>

                {/* Stage Info Hover Overlays */}
                {isHovered && prevStage && (
                  <g className="funnel-conversion-g animate-fadeIn">
                    {/* Left Conversion Label */}
                    <rect
                      x={CX - HALF_LANE - w_t_top - 90}
                      y={y_top + 6}
                      width="70"
                      height="20"
                      rx="4"
                      fill="var(--color-surface)"
                      stroke="var(--color-border)"
                    />
                    <text
                      x={CX - HALF_LANE - w_t_top - 55}
                      y={y_top + 20}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="700"
                      fill="var(--color-text-secondary)"
                    >
                      {tConv}% conv.
                    </text>

                    {/* Right Conversion Label */}
                    <rect
                      x={CX + HALF_LANE + w_f_top + 20}
                      y={y_top + 6}
                      width="70"
                      height="20"
                      rx="4"
                      fill="var(--color-surface)"
                      stroke="var(--color-primary)"
                    />
                    <text
                      x={CX + HALF_LANE + w_f_top + 55}
                      y={y_top + 20}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="700"
                      fill="var(--color-primary)"
                    >
                      {fConv}% conv.
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default AnimatedFunnel;
