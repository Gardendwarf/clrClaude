import { useAuthStore, useProgressStore } from '../../lib/store';
import { getAllLessonIds } from '../../lib/courseData';
import { ProgressBar } from '../ui/ProgressBar';

export function Header() {
  const user = useAuthStore((s) => s.user);
  const getOverallProgress = useProgressStore((s) => s.getOverallProgress);
  const allLessonIds = getAllLessonIds();
  const { completed, total, percentage } = getOverallProgress(allLessonIds);

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Learner';

  return (
    <header style={{
      height: 'var(--header-height)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--space-xl)',
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface-glass)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ flex: 1 }} />

      {/* Overall progress in header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        minWidth: 280,
      }}>
        <span style={{
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          whiteSpace: 'nowrap',
        }}>
          {completed}/{total} lessons
        </span>
        <div style={{ flex: 1, minWidth: 120 }}>
          <ProgressBar percentage={percentage} height={4} />
        </div>
      </div>

      {/* User greeting */}
      <div style={{
        marginLeft: 'var(--space-xl)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'var(--azure-tint)',
          color: 'var(--azure)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 500,
          fontSize: '0.8125rem',
        }}>
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {displayName}
        </span>
      </div>
    </header>
  );
}
