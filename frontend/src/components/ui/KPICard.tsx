import React, { useEffect, useRef, useState } from 'react';
import Sparkline from './Sparkline';
import HoloCard from './HoloCard';

// Pre-baked sparkline data for each KPI type
const SPARKLINE_PRESETS: Record<string, Array<{ v: number }>> = {
  candidates: [
    { v: 130 }, { v: 142 }, { v: 138 }, { v: 155 }, { v: 160 }, { v: 168 },
  ],
  recovered: [
    { v: 6 }, { v: 8 }, { v: 9 }, { v: 11 }, { v: 13 }, { v: 14 },
  ],
  skill: [
    { v: 80 }, { v: 82 }, { v: 81 }, { v: 84 }, { v: 86 }, { v: 87 },
  ],
  time: [
    { v: 1.6 }, { v: 1.5 }, { v: 1.4 }, { v: 1.3 }, { v: 1.2 }, { v: 1.2 },
  ],
  fairness: [
    { v: 72 }, { v: 75 }, { v: 79 }, { v: 83 }, { v: 88 }, { v: 94 },
  ],
  default: [
    { v: 60 }, { v: 65 }, { v: 63 }, { v: 70 }, { v: 74 }, { v: 78 },
  ],
};

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  prefix?: string;
  suffix?: string;
  valueColor?: string;
  icon?: React.ReactNode;
  delta?: number;
  deltaLabel?: string;
  animateCount?: boolean;
  sparklineKey?: keyof typeof SPARKLINE_PRESETS;
  sparklineColor?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  prefix = '',
  suffix = '',
  valueColor,
  icon,
  delta,
  deltaLabel,
  animateCount = true,
  sparklineKey,
  sparklineColor,
}) => {
  const [displayed, setDisplayed] = useState<string | number>(
    typeof value === 'number' && animateCount ? 0 : value
  );
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof value !== 'number' || !animateCount) {
      setDisplayed(value);
      return;
    }
    const end = value;
    const duration = 900;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Number.isInteger(end)
        ? Math.round(end * eased)
        : parseFloat((end * eased).toFixed(1));
      setDisplayed(current);
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [value, animateCount]);

  const hasDelta = delta !== undefined;
  const isPositiveDelta = delta !== undefined && delta > 0;
  const sparkData = sparklineKey ? SPARKLINE_PRESETS[sparklineKey] : undefined;
  const sColor = sparklineColor || (valueColor ?? 'var(--color-primary)');

  return (
    <HoloCard className="card kpi-card animate-slideUp">
      <div className="kpi-card-header">
        <p className="section-label">{title}</p>
        {icon && <div className="kpi-card-icon">{icon}</div>}
      </div>

      {/* #3 — Sparkline above value */}
      {sparkData && (
        <div style={{ marginTop: 4, marginBottom: 2 }}>
          <Sparkline data={sparkData} color={sColor} height={40} />
        </div>
      )}

      <div
        className="kpi-card-value"
        style={{
          color: valueColor,
          fontVariantNumeric: 'tabular-nums',  /* #11 */
        }}
      >
        {prefix}{displayed}{suffix}
      </div>

      <div className="kpi-card-footer">
        {hasDelta && (
          <span className={`badge ${isPositiveDelta ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '0.7rem' }}>
            {isPositiveDelta ? '▲' : '▼'} {Math.abs(delta!)}%{deltaLabel ? ` ${deltaLabel}` : ''}
          </span>
        )}
        {subtitle && <p className="text-secondary text-xs">{subtitle}</p>}
      </div>
    </HoloCard>
  );
};

export default KPICard;
