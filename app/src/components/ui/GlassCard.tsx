import type { CSSProperties, ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  elevated?: boolean;
  accentTop?: boolean;
  hoverable?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

export function GlassCard({
  children,
  elevated = false,
  accentTop = false,
  hoverable = false,
  className = '',
  style,
  onClick,
}: GlassCardProps) {
  const baseStyles: CSSProperties = elevated
    ? {
        background: 'var(--surface-elevated)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: 'var(--shadow-lg)',
        borderRadius: 'var(--radius-xl)',
      }
    : {
        background: 'var(--surface-glass)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-sm)',
        borderRadius: 'var(--radius-lg)',
      };

  const accentStyles: CSSProperties = accentTop
    ? { borderTop: '4px solid var(--coral)' }
    : {};

  const hoverClass = hoverable ? ' glass-card-hoverable' : '';

  return (
    <div
      className={`glass-card${hoverClass} ${className}`}
      style={{ padding: 'var(--space-lg)', ...baseStyles, ...accentStyles, ...style }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
      <style>{`
        .glass-card-hoverable {
          cursor: pointer;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-top-color var(--transition-fast);
        }
        .glass-card-hoverable:hover {
          transform: scale(1.01);
          box-shadow: var(--shadow-md);
          border-top: 4px solid var(--coral);
        }
      `}</style>
    </div>
  );
}
