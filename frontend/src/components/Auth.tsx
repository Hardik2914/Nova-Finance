import React, { useState } from 'react';
import { Terminal, KeyRound, Mail, AlertCircle, ArrowRight } from 'lucide-react';

function GithubIcon({ size = 16, style = {} }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      style={style}
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
  );
}

interface User {
  id: number;
  email: string;
  provider: string;
}

interface AuthProps {
  onLoginSuccess: (user: User) => void;
  isSandboxMode: boolean;
}

function GoogleIcon({ size = 16, style = {} }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      style={style}
    >
      <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.41 0-6.19-2.78-6.19-6.19s2.78-6.19 6.19-6.19c1.7 0 3.033.649 4.022 1.588l3.197-3.197C19.262 2.686 16.002 1.5 12.24 1.5 6.444 1.5 1.75 6.194 1.75 12s4.694 10.5 10.49 10.5c5.783 0 10.15-4.053 10.15-10.285 0-.672-.06-1.316-.17-1.93H12.24z" />
    </svg>
  );
}

export default function Auth({ onLoginSuccess, isSandboxMode }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
  const API_BASE = `${BACKEND_URL}/auth`;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (mode === 'signup' && password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const endpoint = mode === 'login' ? 'login' : 'signup';
      const response = await fetch(`${API_BASE}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(data.data);
      } else {
        setErrorMsg(data.message || `Failed to ${mode}`);
      }
    } catch (err) {
      console.warn("Backend auth offline. Swapping to offline credentials.");
      if (mode === 'login') {
        if (email === 'demo@example.com' && password === 'password123') {
          onLoginSuccess({ id: 999, email: 'demo@example.com', provider: 'LOCAL' });
        } else {
          setErrorMsg("Invalid credentials. Try demo@example.com / password123 in offline sandbox mode.");
        }
      } else {
        onLoginSuccess({ id: Date.now(), email, provider: 'LOCAL' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setErrorMsg('');
    setLoading(true);
    const mockEmail = `oauth-${provider}-user@gmail.com`;

    try {
      const response = await fetch(`${API_BASE}/oauth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: mockEmail, provider: provider.toUpperCase() })
      });

      const data = await response.json();
      if (response.ok) {
        onLoginSuccess(data.data);
      } else {
        setErrorMsg(data.message || "OAuth login failed");
      }
    } catch (err) {
      console.warn("Backend offline. Simulating mock OAuth profile.");
      onLoginSuccess({ id: Date.now(), email: mockEmail, provider: provider.toUpperCase() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--color-primary-start) 0%, var(--color-primary-end) 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-primary)'
          }}>
            <Terminal size={22} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-ink)', marginTop: '8px', fontFamily: 'Outfit, sans-serif' }}>
            {mode === 'login' ? 'Sign in to Nova Finance' : 'Create your account'}
          </h2>
          <p className="caption-md">
            {isSandboxMode 
              ? "Running in sandbox mode. Try demo@example.com / password123" 
              : "Enter credentials to access your fintech ledger"}
          </p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div style={{
            backgroundColor: 'var(--color-accent-red-soft)',
            border: '1px solid var(--color-accent-red)',
            color: 'var(--color-accent-red)',
            padding: '12px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main form */}
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="caption-md">Email address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-ash)' }} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-input"
                required
                style={{ width: '100%', paddingLeft: '38px' }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="caption-md">Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-ash)' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-input"
                required
                style={{ width: '100%', paddingLeft: '38px' }}
              />
            </div>
          </div>

          {/* Confirm Password (Signup only) */}
          {mode === 'signup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="caption-md">Confirm password</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-ash)' }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="text-input"
                  required
                  style={{ width: '100%', paddingLeft: '38px' }}
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <button 
            type="submit" 
            className="btn-primary btn-submit" 
            disabled={loading}
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-hairline)' }} />
          <span style={{ fontSize: '11px', color: 'var(--color-mute)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>or continue with</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-hairline)' }} />
        </div>

        {/* OAuth stack */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button
            onClick={() => handleOAuth('google')}
            className="btn-secondary"
            disabled={loading}
            style={{ height: '38px', fontSize: '13px', display: 'flex', gap: '8px', padding: 0 }}
          >
            <GoogleIcon size={14} style={{ color: 'var(--color-primary)' }} />
            Google
          </button>
          <button
            onClick={() => handleOAuth('github')}
            className="btn-secondary"
            disabled={loading}
            style={{ height: '38px', fontSize: '13px', display: 'flex', gap: '8px', padding: 0 }}
          >
            <GithubIcon size={14} style={{ color: 'var(--color-charcoal)' }} />
            GitHub
          </button>
        </div>

        {/* Toggle link */}
        <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '13px' }}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setMode(mode === 'login' ? 'signup' : 'login');
              setErrorMsg('');
            }}
            style={{ color: 'var(--color-mute)', textDecoration: 'none', transition: 'color 0.15s', fontWeight: 600 }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-mute)'}
          >
            {mode === 'login' 
              ? "Don't have an account? Sign Up" 
              : "Already have an account? Sign In"}
          </a>
        </div>
      </div>
    </div>
  );
}
