import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';
import { Button, Input, GlassCard } from '../ui';

// Team sign-in only. Public self-registration and password-reset entry points
// were removed: accounts are provisioned in clr-hub.
export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const signIn = useAuthStore((s) => s.signIn);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await signIn(email, password);

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
          <h1 style={{ fontWeight: 300, margin: '0 0 var(--space-sm)', letterSpacing: '0.01em' }}>
            clr<span style={{ color: 'var(--coral)' }}>Claude</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 300, fontSize: '0.9375rem', margin: 0 }}>
            Team access
          </p>
        </div>

        <GlassCard elevated>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-sm)' }}>
              <h2 style={{ fontWeight: 300 }}>Sign in</h2>
            </div>

            <Input
              label="Email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
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
              {submitting ? 'Please wait...' : 'Sign in'}
            </Button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
