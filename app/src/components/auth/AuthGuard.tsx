import type { ReactNode } from 'react';
import { useAuthStore } from '../../lib/store';
import Interest from '../../pages/Interest';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const offlineMode = useAuthStore((s) => s.offlineMode);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: 'var(--text-tertiary)',
        fontWeight: 300,
      }}>
        Loading...
      </div>
    );
  }

  // Offline mode -- no login needed, guest user already set
  if (offlineMode) {
    return <>{children}</>;
  }

  // Signed out: show the public interest page in place (no redirect, URL kept).
  if (!user) {
    return <Interest />;
  }

  return <>{children}</>;
}
