import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
      {label && (
        <label style={{
          fontSize: '0.75rem',
          fontWeight: 500,
          letterSpacing: '0.06em',
          textTransform: 'uppercase' as const,
          color: 'var(--azure)',
        }}>
          {label}
        </label>
      )}
      <input
        className="clr-input"
        style={{
          fontFamily: 'var(--font-primary)',
          fontSize: '1rem',
          fontWeight: 300,
          padding: '12px 16px',
          background: 'var(--surface-glass)',
          border: error ? '1px solid var(--error)' : '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-primary)',
          outline: 'none',
          transition: 'border-color var(--transition-fast)',
          width: '100%',
          ...style,
        }}
        {...props}
      />
      {error && (
        <span style={{ fontSize: '0.8125rem', color: 'var(--error)' }}>{error}</span>
      )}
      <style>{`
        .clr-input:focus {
          border-color: var(--azure) !important;
        }
        .clr-input::placeholder {
          color: var(--text-tertiary);
        }
      `}</style>
    </div>
  );
}
