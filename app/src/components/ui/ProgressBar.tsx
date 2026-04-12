import type { CSSProperties } from 'react';

interface ProgressBarProps {
  percentage: number;
  height?: number;
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({
  percentage,
  height = 6,
  showLabel = false,
  label,
}: ProgressBarProps) {
  const clampedPct = Math.min(100, Math.max(0, percentage));

  const trackStyle: CSSProperties = {
    width: '100%',
    height: `${height}px`,
    background: 'var(--surface-azure)',
    borderRadius: height / 2,
    overflow: 'hidden',
    position: 'relative',
  };

  const fillStyle: CSSProperties = {
    width: `${clampedPct}%`,
    height: '100%',
    // Decorative gradient -- thin linear element, permitted by design system
    background: clampedPct === 100
      ? 'var(--success)'
      : 'linear-gradient(90deg, var(--coral), var(--azure))',
    borderRadius: height / 2,
    transition: 'width var(--transition-base)',
  };

  return (
    <div>
      {showLabel && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-xs)',
        }}>
          {label && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
              {label}
            </span>
          )}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
            {clampedPct}%
          </span>
        </div>
      )}
      <div style={trackStyle}>
        <div style={fillStyle} />
      </div>
    </div>
  );
}
