import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Button, Input, GlassCard } from '../ui';

export function LoginForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Password reset modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    let result;
    if (mode === 'login') {
      result = await signIn(email, password);
    } else {
      result = await signUp(email, password, displayName);
    }

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      navigate('/');
    }
  };

  const handlePasswordReset = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isSupabaseConfigured || !supabase) return;

    setResetSubmitting(true);
    setResetError(null);
    setResetMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });

    setResetSubmitting(false);

    if (error) {
      setResetError(error.message);
    } else {
      setResetMessage('If an account exists with that email, a password reset link has been sent.');
    }
  };

  const linkButtonStyle = {
    background: 'none',
    border: 'none',
    color: 'var(--azure)',
    cursor: 'pointer',
    fontFamily: 'var(--font-primary)',
    fontSize: '0.875rem',
    fontWeight: 300 as const,
    padding: 0,
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface-base)',
      padding: 'var(--space-lg)',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Branding */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            marginBottom: 'var(--space-md)',
          }}>
            <img
              src="/favicon.png"
              alt="clrClaude"
              width={40}
              height={40}
            />
            <span style={{
              fontSize: '1.875rem',
              fontWeight: 100,
              color: 'var(--text-primary)',
            }}>
              clrClaude
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 300, fontSize: '0.9375rem' }}>
            Master Claude Code -- from basics to advanced agents
          </p>
        </div>

        <GlassCard elevated>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-sm)' }}>
              <h2 style={{ fontWeight: 300 }}>
                {mode === 'login' ? 'Sign in' : 'Create account'}
              </h2>
            </div>

            {mode === 'register' && (
              <Input
                label="Display name"
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Your name"
                required
              />
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Min 6 characters"
              required
              minLength={6}
            />

            {error && (
              <div style={{
                padding: 'var(--space-sm) var(--space-md)',
                background: 'rgba(185, 28, 28, 0.06)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--error)',
                fontSize: '0.875rem',
              }}>
                {error}
              </div>
            )}

            <Button type="submit" fullWidth disabled={submitting}>
              {submitting
                ? 'Please wait...'
                : mode === 'login' ? 'Sign in' : 'Create account'}
            </Button>

            {/* Forgot password link -- only show on login */}
            {mode === 'login' && (
              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setResetMessage(null);
                    setResetError(null);
                    setShowResetModal(true);
                  }}
                  style={linkButtonStyle}
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <div style={{
              textAlign: 'center',
              borderTop: '1px solid var(--border)',
              paddingTop: 'var(--space-md)',
            }}>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError(null);
                }}
                style={linkButtonStyle}
              >
                {mode === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        </GlassCard>
      </div>

      {/* Password reset modal overlay */}
      {showResetModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-lg)',
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) setShowResetModal(false);
          }}
        >
          <div style={{ width: '100%', maxWidth: 400 }}>
            <GlassCard elevated>
              {/* Modal header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-lg)',
              }}>
                <h2 style={{ fontWeight: 300, margin: 0 }}>Reset password</h2>
                <button
                  onClick={() => setShowResetModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-tertiary)',
                    padding: 4,
                    display: 'flex',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handlePasswordReset} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  margin: 0,
                }}>
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                <Input
                  label="Email"
                  type="email"
                  value={resetEmail}
                  onChange={(event) => setResetEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                />

                {resetError && (
                  <div style={{
                    padding: 'var(--space-sm) var(--space-md)',
                    background: 'rgba(185, 28, 28, 0.06)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--error)',
                    fontSize: '0.875rem',
                  }}>
                    {resetError}
                  </div>
                )}

                {resetMessage && (
                  <div style={{
                    padding: 'var(--space-sm) var(--space-md)',
                    background: 'rgba(5, 150, 105, 0.06)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--success)',
                    fontSize: '0.875rem',
                  }}>
                    {resetMessage}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowResetModal(false)}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={resetSubmitting || !!resetMessage}
                    style={{ flex: 1 }}
                  >
                    {resetSubmitting ? 'Sending...' : 'Send reset link'}
                  </Button>
                </div>
              </form>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
