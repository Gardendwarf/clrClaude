import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { Module } from '../../types';
import { useProgressStore } from '../../lib/store';
import { GlassCard, ProgressBar, Badge, IconContainer } from '../ui';

interface ModuleProgressCardProps {
  module: Module;
  icon: ReactNode;
}

export function ModuleProgressCard({ module, icon }: ModuleProgressCardProps) {
  const navigate = useNavigate();
  const getModuleProgress = useProgressStore((s) => s.getModuleProgress);
  const lessonIds = module.lessons.map((l) => l.id);
  const { completed, total, percentage } = getModuleProgress(module.id, lessonIds);

  const statusVariant = percentage === 100 ? 'success' : percentage > 0 ? 'coral' : 'azure';
  const statusLabel = percentage === 100 ? 'Complete' : percentage > 0 ? 'In progress' : 'Not started';

  return (
    <GlassCard
      hoverable
      onClick={() => navigate(`/module/${module.slug}`)}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <IconContainer variant={percentage > 0 ? 'coral' : 'azure'}>
          {icon}
        </IconContainer>
        <Badge variant={statusVariant}>{statusLabel}</Badge>
      </div>

      <div>
        <div className="section-label">Module {module.number}</div>
        <h3 style={{ margin: 0, fontWeight: 300 }}>{module.title}</h3>
      </div>

      <p style={{
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        margin: 0,
        lineHeight: 1.5,
        flex: 1,
      }}>
        {module.description}
      </p>

      <div>
        <ProgressBar
          percentage={percentage}
          showLabel
          label={`${completed}/${total} lessons`}
        />
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        color: 'var(--text-tertiary)',
      }}>
        <span>{module.lessons.length} lessons</span>
        <span>~{module.estimatedMinutes} min</span>
      </div>
    </GlassCard>
  );
}
