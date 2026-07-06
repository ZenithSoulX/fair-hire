import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/auth';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setError('');
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) navigate('/');
    else setError('Invalid credentials. Try any email & password.');
  };

  return (
    <div className="login-page">
      {/* Background pattern */}
      <div className="login-bg-pattern" aria-hidden />

      <div className="login-card card animate-slideUp">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand-icon">
            <ShieldAlert size={22} strokeWidth={2.2} />
          </div>
          <span className="login-brand-name">FairHire</span>
        </div>

        <div className="login-heading">
          <h1 className="text-2xl font-bold text-primary">Welcome back</h1>
          <p className="text-secondary text-sm" style={{ marginTop: 6 }}>
            Sign in to your talent intelligence workspace
          </p>
        </div>

        {/* Google SSO */}
        <button className="btn btn-outline login-google-btn" type="button">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="login-divider">
          <span className="login-divider-text">or sign in with email</span>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="callout callout-error" style={{ padding: '10px 14px' }}>
              <p className="text-xs" style={{ color: 'var(--color-error-text)' }}>{error}</p>
            </div>
          )}

          <div className="login-field">
            <label className="login-label" htmlFor="email">Work email</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
              <label className="login-label" htmlFor="password">Password</label>
              <a href="#" className="text-xs text-brand" style={{ fontWeight: 500 }}>Forgot password?</a>
            </div>
            <div className="login-pass-wrap">
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                className="login-pass-toggle"
                onClick={() => setShowPass(p => !p)}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <label className="login-remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              style={{ accentColor: 'var(--color-primary)' }}
            />
            <span className="text-sm text-secondary">Remember me for 30 days</span>
          </label>

          <button
            type="submit"
            className="btn btn-primary login-submit"
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? <Loader2 size={16} className="spin" /> : null}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="login-footer-note">
          Enterprise-grade security · SOC 2 Type II · GDPR compliant
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
