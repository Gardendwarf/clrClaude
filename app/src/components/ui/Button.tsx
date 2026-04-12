import type { ButtonHTMLAttributes, ReactNode, CSSProperties } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<string, CSSProperties> = {
  primary: {
    background: 'var(--coral)',
    color: '#ffffff',
    border: 'none',
  },
  secondary: {
    background: 'var(--surface-glass)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
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
          background: var(--coral-dim) !important;
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }
        .clr-button-secondary:hover:not(:disabled) {
          border-color: var(--azure) !important;
          color: var(--azure) !important;
        }
        .clr-button-ghost:hover:not(:disabled) {
          background: var(--coral-tint) !important;
          color: var(--coral) !important;
        }
        .clr-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}
