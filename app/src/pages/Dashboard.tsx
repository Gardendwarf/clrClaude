import {
  Terminal, Brain, Wand2, Bot, Plug, Webhook,
  Package, History, Zap, MonitorDot, BookOpen, Clock, Award,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { modules, getAllLessonIds, getTotalEstimatedMinutes } from '../lib/courseData';
import { useProgressStore, useAuthStore } from '../lib/store';
import { GlassCard, ProgressBar, IconContainer } from '../components/ui';
import { ModuleProgressCard } from '../components/progress';

const moduleIcons: Record<string, ReactNode> = {
  'slash-commands': <Terminal size={20} />,
  'memory': <Brain size={20} />,
  'skills': <Wand2 size={20} />,
  'subagents': <Bot size={20} />,
  'mcp': <Plug size={20} />,
  'hooks': <Webhook size={20} />,
  'plugins': <Package size={20} />,
  'checkpoints': <History size={20} />,
  'advanced': <Zap size={20} />,
  'cli': <MonitorDot size={20} />,
};

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const getOverallProgress = useProgressStore((s) => s.getOverallProgress);

  const allLessonIds = getAllLessonIds();
  const { completed, total, percentage } = getOverallProgress(allLessonIds);
  const totalMinutes = getTotalEstimatedMinutes();
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Learner';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* Welcome section */}
      <div>
        <div className="section-label">Welcome back</div>
        <h1 style={{ margin: '0 0 var(--space-sm)', fontWeight: 100 }}>
          {displayName}
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Master Claude Code -- from slash commands to advanced agent teams.
        </p>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--space-md)',
      }}>
        <GlassCard style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <IconContainer variant="coral">
            <BookOpen size={20} />
          </IconContainer>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 100, color: 'var(--text-primary)' }}>
              {completed}/{total}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
              Lessons completed
            </div>
          </div>
        </GlassCard>

        <GlassCard style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <IconContainer variant="azure">
            <Clock size={20} />
          </IconContainer>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 100, color: 'var(--text-primary)' }}>
              ~{Math.round(totalMinutes / 60)}h
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
              Total course time
            </div>
          </div>
        </GlassCard>

        <GlassCard style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <IconContainer variant={percentage === 100 ? 'coral' : 'azure'}>
            <Award size={20} />
          </IconContainer>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 100, color: 'var(--text-primary)' }}>
              {percentage}%
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
              Overall progress
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Overall progress bar */}
      <GlassCard>
        <ProgressBar
          percentage={percentage}
          height={8}
          showLabel
          label="Course progress"
        />
      </GlassCard>

      {/* Modules grid */}
      <div>
        <div className="section-label">Modules</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 'var(--space-md)',
          marginTop: 'var(--space-sm)',
        }}>
          {modules.map((mod) => (
            <ModuleProgressCard
              key={mod.id}
              module={mod}
              icon={moduleIcons[mod.id]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
