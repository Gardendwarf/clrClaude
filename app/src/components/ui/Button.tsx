import type { ButtonHTMLAttributes, ReactNode, CSSProperties } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'emphasis';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  fullWidth?: boolean;
}

// v1.7: coral steps back from solid fills to ring/border + text accent.
// primary = coral-soft fill + coral-text + 1.5px coral ring
// secondary = azure-soft fill + azure-text + 1.5px azure ring
// ghost = coral-text + coral-soft hover
// emphasis = solid coral + white (one-per-screen high-emphasis only)
const variantStyles: Record<string, CSSProperties> = {
  primary: {
    background: 'var(--coral-soft)',
    color: 'var(--coral-text)',
    border: '1.5px solid var(--coral)',
  },
  secondary: {
    background: 'var(--azure-soft)',
    color: 'var(--azure-text)',
    border: '1.5px solid var(--azure)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--coral-text)',
    border: 'none',
  },
  emphasis: {
    background: 'var(--coral)',
    color: '#FFFFFF',
    border: 'none',
  },
};

const sizeStyles: Record<string, CSSProperties> = {
  sm: { padding: '8px 16px', fontSize: '0.875rem' },
  md: { padding: '12px 24px', fontSize: '1rem' },
  lg: { padding: '16px 32px', fontSize: '1.125rem' },
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  style,
  ...props
}: ButtonProps) {
  return (
    <>
      <button
        className={`clr-button clr-button-${variant}`}
        style={{
          fontFamily: 'var(--font-primary)',
          fontWeight: 400,
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all var(--transition-fast)',
          width: fullWidth ? '100%' : undefined,
          ...variantStyles[variant],
          ...sizeStyles[size],
          ...style,
        }}
        {...props}
      >
        {children}
      </button>
      <style>{`
        .clr-button-primary:hover:not(:disabled) {
          background: var(--coral-soft-hover) !important;
        }
        .clr-button-secondary:hover:not(:disabled) {
          background: var(--azure-soft-hover) !important;
        }
        .clr-button-ghost:hover:not(:disabled) {
          background: var(--coral-soft) !important;
        }
        .clr-button-emphasis:hover:not(:disabled) {
          background: var(--coral-dim) !important;
        }
        .clr-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}
