// #2 — Bias Shield tooltip
import React, { useState } from 'react';
import './BiasShieldTooltip.css';

interface BiasShieldTooltipProps {
  blockedBy: string[];
  rankedBy: string[];
  children: React.ReactNode;
}

const BiasShieldTooltip: React.FC<BiasShieldTooltipProps> = ({ blockedBy, rankedBy, children }) => {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="bias-shield-wrap"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="bias-shield-tooltip animate-fadeIn">
          <p className="bias-shield-header">🛡 FairHire rescued this candidate</p>
          <div className="bias-shield-section">
            <p className="bias-shield-label">Would've been rejected by:</p>
            {blockedBy.map(b => (
              <div key={b} className="bias-shield-row blocked">
                <span>✗</span>
                <span>{b}</span>
              </div>
            ))}
          </div>
          <div className="bias-shield-section">
            <p className="bias-shield-label">FairHire ranked by:</p>
            {rankedBy.map(r => (
              <div key={r} className="bias-shield-row allowed">
                <span>✓</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </span>
  );
};

export default BiasShieldTooltip;
