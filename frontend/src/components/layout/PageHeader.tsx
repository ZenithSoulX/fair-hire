import React from 'react';
import './PageHeader.css';

interface PageHeaderProps {
  section: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

// #14 — Sticky blurred page header
const PageHeader: React.FC<PageHeaderProps> = ({ section, title, subtitle, actions }) => (
  <div className="page-header animate-slideUp">
    <div className="page-header-left">
      <p className="section-label">{section}</p>
      <h1 className="text-3xl font-bold text-primary" style={{ marginTop: 4, letterSpacing: '-0.02em' }}>
        {title}
      </h1>
      {subtitle && (
        <p className="text-secondary text-sm" style={{ marginTop: 6, maxWidth: 600 }}>
          {subtitle}
        </p>
      )}
    </div>
    {actions && <div className="page-header-actions">{actions}</div>}
  </div>
);

export default PageHeader;
