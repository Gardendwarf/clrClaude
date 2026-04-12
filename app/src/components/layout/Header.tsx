import { Sun, Moon } from 'lucide-react';
import { useAuthStore, useProgressStore } from '../../lib/store';
import { getAllLessonIds } from '../../lib/courseData';
import { ProgressBar } from '../ui/ProgressBar';
import { useTheme } from '../../hooks/useTheme';

export function Header() {
  const user = useAuthStore((s) => s.user);
  const getOverallProgress = useProgressStore((s) => s.getOverallProgress);
  const allLessonIds = getAllLessonIds();
  const { completed, total, percentage } = getOverallProgress(allLessonIds);
  const { theme, toggleTheme } = useTheme();

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

      {/* Overall progress */}
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

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
        style={{
          marginLeft: 'var(--space-md)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 6,
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color var(--transition-fast), background var(--transition-fast)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--azure-tint)';
          e.currentTarget.style.color = 'var(--azure)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'none';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
      >
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      {/* User greeting */}
      <div style={{
        marginLeft: 'var(--space-md)',
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
