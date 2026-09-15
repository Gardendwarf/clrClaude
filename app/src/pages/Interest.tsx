import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Input, GlassCard } from '../components/ui';
import { APP_NAME, submitInterest } from '../lib/interest';

// The one public page. Every route a signed-out visitor can reach renders this.
// The submit button is the only active control: no links, no nav, no redirects.
export default function Interest() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [note, setNote] = useState('');
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await submitInterest({ name, email, company, note, website });
    setSubmitting(false);
    if (result.ok) setDone(true);
    else setError(result.error);
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
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
          <h1 style={{ fontWeight: 300, margin: '0 0 var(--space-sm)', letterSpacing: '0.01em' }}>
            clr<span style={{ color: 'var(--coral)' }}>Claude</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 300, fontSize: '0.9375rem', margin: 0 }}>
            Something new is taking shape for teams who build with AI. Register your interest to hear more.
          </p>
        </div>

        <GlassCard elevated>
          {done ? (
            <div role="status" data-testid="interest-thanks" style={{ textAlign: 'center', padding: 'var(--space-md) 0' }}>
              <h2 style={{ fontWeight: 300, margin: '0 0 var(--space-sm)' }}>Thank you</h2>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 300, margin: 0 }}>
                We have noted your interest in {APP_NAME} and will be in touch.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              data-testid="interest-form"
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
            >
              <Input
                label="Name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Work email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Company (optional)"
                name="company"
                type="text"
                autoComplete="organization"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                <label
                  htmlFor="interest-note"
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--azure)',
                  }}
                >
                  What would you use it for? (optional)
                </label>
                <textarea
                  id="interest-note"
                  name="note"
                  className="clr-input"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{
                    fontFamily: 'var(--font-primary)',
                    fontSize: '1rem',
                    fontWeight: 300,
                    padding: '12px 16px',
                    background: 'var(--surface-glass)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    resize: 'vertical',
                    width: '100%',
                  }}
                />
              </div>

              {/* Honeypot: off-screen, never focused by keyboard users. */}
              <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
                <label htmlFor="interest-website">Website</label>
                <input
                  id="interest-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              {error && (
                <div role="alert" style={{
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
                {submitting ? 'Sending...' : 'Register interest'}
              </Button>
            </form>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
