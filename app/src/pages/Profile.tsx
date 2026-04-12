import { useAuthStore, useProgressStore } from '../lib/store';
import { modules, getAllLessonIds, getTotalEstimatedMinutes } from '../lib/courseData';
import { GlassCard, ProgressBar } from '../components/ui';

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const getOverallProgress = useProgressStore((s) => s.getOverallProgress);
  const getModuleProgress = useProgressStore((s) => s.getModuleProgress);

  const allLessonIds = getAllLessonIds();
  const { completed, total, percentage } = getOverallProgress(allLessonIds);
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Learner';
  const totalMinutes = getTotalEstimatedMinutes();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', maxWidth: 640 }}>
      <div>
        <div className="section-label">Profile</div>
        <h1 style={{ fontWeight: 100, margin: 0 }}>{displayName}</h1>
        <p style={{ color: 'var(--text-tertiary)', margin: 'var(--space-xs) 0 0', fontSize: '0.9375rem' }}>
          {user?.email}
        </p>
      </div>

      {/* Overall stats */}
      <GlassCard>
        <div className="section-label" style={{ marginBottom: 'var(--space-md)' }}>
          Overall progress
        </div>
        <ProgressBar percentage={percentage} height={8} showLabel label={`${completed}/${total} lessons`} />
        <div style={{
          marginTop: 'var(--space-md)',
          display: 'flex',
          gap: 'var(--space-xl)',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
        }}>
          <span>Total course time: ~{Math.round(totalMinutes / 60)}h</span>
          <span>{modules.length} modules</span>
          <span>{total} lessons</span>
        </div>
      </GlassCard>

      {/* Per-module breakdown */}
      <div>
        <div className="section-label">Module breakdown</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
          {modules.map((mod) => {
            const lessonIds = mod.lessons.map((l) => l.id);
            const modProgress = getModuleProgress(mod.id, lessonIds);

            return (
              <GlassCard key={mod.id} style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-xs)',
                }}>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 300 }}>
                    {mod.number}. {mod.title}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: modProgress.percentage === 100 ? 'var(--success)' : 'var(--text-tertiary)',
                  }}>
                    {modProgress.completed}/{modProgress.total}
                  </span>
                </div>
                <ProgressBar percentage={modProgress.percentage} height={4} />
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
