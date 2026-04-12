import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { GlassCard, Button, Input } from '../components/ui';

// Users land here after clicking the password reset link in their email.
// Supabase sets a session from the URL hash, then the user enters a new password.

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase puts the recovery token in the URL hash.
  // The JS client picks it up automatically when detectSessionInUrl is true.
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setError('Authentication is not configured.');
      return;
    }

    // Listen for the PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    // Also check if we already have a session (user may have arrived with token already processed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (!supabase) return;

    setSubmitting(true);

    const { error } = await supabase.auth.updateUser({ password });

    setSubmitting(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      // Redirect to dashboard after a short delay
      setTimeout(() => navigate('/', { replace: true }), 2000);
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
            <img src="/favicon.png" alt="clrClaude" width={40} height={40} />
            <span style={{
              fontSize: '1.875rem',
              fontWeight: 100,
              color: 'var(--text-primary)',
            }}>
              clrClaude
            </span>
          </div>
        </div>

        <GlassCard elevated>
          {success ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
              <h2 style={{ fontWeight: 300, marginBottom: 'var(--space-md)' }}>
                Password updated
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                Redirecting to your dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-sm)' }}>
                <h2 style={{ fontWeight: 300 }}>Set new password</h2>
              </div>

              {!sessionReady && (
                <div style={{
                  padding: 'var(--space-sm) var(--space-md)',
                  background: 'rgba(217, 119, 6, 0.06)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--warning)',
                  fontSize: '0.875rem',
                }}>
                  Verifying your reset link...
                </div>
              )}

              <Input
                label="New password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Min 6 characters"
                required
                minLength={6}
                disabled={!sessionReady}
              />

              <Input
                label="Confirm password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat your password"
                required
                minLength={6}
                disabled={!sessionReady}
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

              <Button type="submit" fullWidth disabled={submitting || !sessionReady}>
                {submitting ? 'Updating...' : 'Update password'}
              </Button>

              <div style={{ textAlign: 'center' }}>
                <a
                  href="/login"
                  style={{
                    color: 'var(--azure)',
                    fontSize: '0.875rem',
                    fontWeight: 300,
                    textDecoration: 'none',
                  }}
                >
                  Back to login
                </a>
              </div>
            </form>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
