import type { CSSProperties, ReactNode } from 'react';

interface BadgeProps {
  variant?: 'coral' | 'azure' | 'success' | 'warning';
  children: ReactNode;
}

const variantMap: Record<string, CSSProperties> = {
  coral: {
    background: 'var(--coral-tint)',
    color: 'var(--coral)',
  },
  azure: {
    background: 'var(--azure-tint)',
    color: 'var(--azure)',
  },
  success: {
    background: 'rgba(5, 150, 105, 0.08)',
    color: 'var(--success)',
  },
  warning: {
    background: 'rgba(217, 119, 6, 0.08)',
    color: 'var(--warning)',
  },
};

export function Badge({ variant = 'azure', children }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 10px',
        borderRadius: '100px',
        fontSize: '0.75rem',
        fontWeight: 500,
        letterSpacing: '0.02em',
        ...variantMap[variant],
      }}
    >
      {children}
    </span>
  );
}
