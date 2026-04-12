import { Check, Circle } from 'lucide-react';
import { Button } from '../ui';
import { useProgressStore } from '../../lib/store';

interface LessonCompleteButtonProps {
  lessonId: string;
}

export function LessonCompleteButton({ lessonId }: LessonCompleteButtonProps) {
  const progress = useProgressStore((s) => s.progress);
  const markComplete = useProgressStore((s) => s.markComplete);
  const markInProgress = useProgressStore((s) => s.markInProgress);

  const status = progress[lessonId]?.status || 'not_started';

  if (status === 'completed') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => markInProgress(lessonId)}
        style={{ color: 'var(--success)' }}
      >
        <Check size={16} />
        Completed -- mark incomplete
      </Button>
    );
  }

  return (
    <Button
      variant="primary"
      size="sm"
      onClick={() => markComplete(lessonId)}
    >
      <Circle size={16} />
      Mark as complete
    </Button>
  );
}
