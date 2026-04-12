import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';
import { Button, Input, GlassCard } from '../ui';

export function LoginForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--azure)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-primary)',
                  fontSize: '0.875rem',
                  fontWeight: 300,
                }}
              >
                {mode === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
