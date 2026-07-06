import React, { useEffect, useRef } from 'react';

interface ProgressBarProps {
  value: number;    // 0–100
  max?: number;
  color?: string;
  height?: number;
  animated?: boolean;
  showLabel?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color,
  height = 6,
  animated = true,
  showLabel = false,
}) => {
  const fillRef = useRef<HTMLDivElement>(null);
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  useEffect(() => {
    if (!fillRef.current || !animated) return;
    fillRef.current.style.width = '0%';
    const t = setTimeout(() => {
      if (fillRef.current) fillRef.current.style.width = `${pct}%`;
    }, 100);
    return () => clearTimeout(t);
  }, [pct, animated]);

  const getColor = () => {
    if (color) return color;
    if (pct >= 90) return 'var(--color-success)';
    if (pct >= 75) return 'var(--color-primary)';
    if (pct >= 50) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="progress-track" style={{ height }}>
        <div
          ref={fillRef}
          className="progress-fill"
          style={{
            width: animated ? '0%' : `${pct}%`,
            backgroundColor: getColor(),
            transition: animated ? 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
          }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-secondary" style={{ marginTop: 4, textAlign: 'right' }}>
          {value}%
        </p>
      )}
    </div>
  );
};

export default ProgressBar;
