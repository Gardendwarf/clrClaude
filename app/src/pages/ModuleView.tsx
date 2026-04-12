import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { ChevronRight, Check, Circle, Clock } from 'lucide-react';
import { getModuleBySlug } from '../lib/courseData';
import { useProgressStore } from '../lib/store';
import { GlassCard, ProgressBar, Badge } from '../components/ui';

export default function ModuleView() {
  const { moduleSlug } = useParams<{ moduleSlug: string }>();
  const navigate = useNavigate();
  const progress = useProgressStore((s) => s.progress);
  const getModuleProgress = useProgressStore((s) => s.getModuleProgress);

  const mod = moduleSlug ? getModuleBySlug(moduleSlug) : undefined;

  if (!mod) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--text-tertiary)' }}>
        Module not found.
      </div>
    );
  }

  const lessonIds = mod.lessons.map((l) => l.id);
  const { completed, total, percentage } = getModuleProgress(mod.id, lessonIds);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* Module header */}
      <div>
        <div className="section-label">Module {mod.number}</div>
        <h1 style={{ fontWeight: 100, margin: '0 0 var(--space-sm)' }}>{mod.title}</h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0 0 var(--space-md)' }}>
          {mod.description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <Badge variant={percentage === 100 ? 'success' : 'azure'}>
            {completed}/{total} completed
          </Badge>
          <Badge variant="azure">
            <Clock size={12} style={{ marginRight: 4 }} />
            ~{mod.estimatedMinutes} min
          </Badge>
        </div>
      </div>

      {/* Progress bar */}
      <GlassCard>
        <ProgressBar percentage={percentage} height={6} showLabel label="Module progress" />
      </GlassCard>

      {/* Lesson list */}
      <div>
        <div className="section-label">Lessons</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
          {mod.lessons.map((lesson, index) => {
            const status = progress[lesson.id]?.status || 'not_started';
            const isCompleted = status === 'completed';

            return (
              <GlassCard
                key={lesson.id}
                hoverable
                onClick={() => navigate(`/module/${mod.slug}/lesson/${lesson.slug}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  padding: 'var(--space-md) var(--space-lg)',
                }}
              >
                {/* Lesson number / status icon */}
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: isCompleted ? 'rgba(5, 150, 105, 0.08)' : 'var(--azure-tint)',
                  color: isCompleted ? 'var(--success)' : 'var(--azure)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                }}>
                  {isCompleted ? <Check size={16} /> : <Circle size={16} />}
                </div>

                {/* Lesson info */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.9375rem',
                    fontWeight: isCompleted ? 400 : 300,
                    color: isCompleted ? 'var(--text-tertiary)' : 'var(--text-primary)',
                    textDecoration: isCompleted ? 'line-through' : 'none',
                  }}>
                    {index + 1}. {lesson.title}
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Navigation hint */}
      <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
        <NavLink to="/" style={{ color: 'var(--azure)' }}>Back to dashboard</NavLink>
      </div>
    </div>
  );
}
