// #3 — Mini Sparkline for KPI Cards
import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface SparklineProps {
  data: Array<{ v: number }>;
  color?: string;
  height?: number;
}

const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = 'var(--color-primary)',
  height = 36,
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
      <Tooltip
        contentStyle={{
          borderRadius: 8,
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
          fontSize: 11,
          padding: '4px 8px',
          boxShadow: 'var(--shadow-sm)',
        }}
        formatter={(val: any) => [val, '']}
        labelFormatter={() => ''}
      />
      <Line
        type="monotone"
        dataKey="v"
        stroke={color}
        strokeWidth={2}
        dot={false}
        activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
        isAnimationActive={true}
        animationDuration={1500}
        animationEasing="ease-in-out"
      />
    </LineChart>
  </ResponsiveContainer>
);

export default Sparkline;
