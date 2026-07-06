import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useTheme } from '../../lib/theme';
import { useData } from '../../lib/DataContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true, isBiasAudit: false },
  { to: '/bias-audit', icon: ShieldAlert, label: 'Bias Audit', end: false, isBiasAudit: true },
  { to: '/candidates', icon: Users, label: 'Candidates', end: false, isBiasAudit: false },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', end: false, isBiasAudit: false },
  { to: '/settings', icon: Settings, label: 'Settings', end: false, isBiasAudit: false },
];

// #1 — Fairness Pulse: color based on score
const getPulseColor = (score: number) => {
  if (score >= 85) return '#22C55E';
  if (score >= 60) return '#F59E0B';
  return '#EF4444';
};

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { bias } = useData();
  const navigate = useNavigate();
  const pulseColor = getPulseColor(bias.fair_hiring_score);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <ShieldAlert size={18} strokeWidth={2.5} />
        </div>
        <span className="sidebar-logo-text">FairHire</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon: Icon, label, end, isBiasAudit }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `sidebar-nav-item${isActive ? ' active' : ''}${isBiasAudit ? ' bias-audit-item' : ''}`
            }
          >
            {/* #1 — Wrap Bias Audit icon in pulse ring */}
            {isBiasAudit ? (
              <span
                className="fairness-pulse"
                style={{ '--pulse-color': pulseColor } as React.CSSProperties}
              >
                <Icon size={18} strokeWidth={1.8} />
              </span>
            ) : (
              <Icon size={18} strokeWidth={1.8} />
            )}
            <span>{label}</span>
            {/* Live fairness score badge next to Bias Audit */}
            {isBiasAudit && (
              <span
                className="sidebar-fairness-badge"
                style={{ color: pulseColor }}
              >
                {bias.fair_hiring_score}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Theme Toggle & User profile */}
      <div className="sidebar-footer">
        <button
          className="sidebar-theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {user && (
          <div className="sidebar-user" style={{ marginTop: 12 }}>
            <div className="sidebar-avatar">{user.initials}</div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user.name}</p>
              <p className="sidebar-user-role">{user.role} · {user.company}</p>
            </div>
            <button className="sidebar-logout-btn" onClick={handleLogout} title="Sign out">
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
