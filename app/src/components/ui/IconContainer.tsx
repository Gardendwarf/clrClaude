import type { CSSProperties, ReactNode } from 'react';

interface IconContainerProps {
  variant?: 'coral' | 'azure';
  size?: number;
  children: ReactNode;
}

export function IconContainer({
  variant = 'coral',
  size = 40,
  children,
}: IconContainerProps) {
  const style: CSSProperties = {
    width: size,
    height: size,
    background: variant === 'coral'
      ? 'var(--coral-tint)'
      : 'var(--azure-tint)',
    color: variant === 'coral' ? 'var(--coral)' : 'var(--azure)',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  return <div style={style}>{children}</div>;
}
