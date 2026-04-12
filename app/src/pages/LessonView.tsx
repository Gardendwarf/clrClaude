import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getModuleBySlug, getLessonBySlug, getAdjacentLessons } from '../lib/courseData';
import { useProgressStore } from '../lib/store';
import { GlassCard, Button } from '../components/ui';
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer';
import { LessonCompleteButton } from '../components/progress';

export default function LessonView() {
  const { moduleSlug, lessonSlug } = useParams<{ moduleSlug: string; lessonSlug: string }>();
  const navigate = useNavigate();
  const markInProgress = useProgressStore((s) => s.markInProgress);
  const progress = useProgressStore((s) => s.progress);

  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mod = moduleSlug ? getModuleBySlug(moduleSlug) : undefined;
  const lesson = moduleSlug && lessonSlug ? getLessonBySlug(moduleSlug, lessonSlug) : undefined;
  const adjacent = moduleSlug && lessonSlug ? getAdjacentLessons(moduleSlug, lessonSlug) : { previous: null, next: null };

  // Mark as in-progress when viewing
  useEffect(() => {
    if (lesson && progress[lesson.id]?.status !== 'completed') {
      markInProgress(lesson.id);
    }
  }, [lesson?.id]);

  // Load markdown content
  useEffect(() => {
    if (!lesson) return;

    setLoading(true);
    setError(null);

    // Fetch the markdown file from the content directory
    // In production this would be an API call; for now we fetch from public/
    fetch(`/content${lesson.contentPath}`)
      .then((response) => {
        if (!response.ok) throw new Error('Content not found');
        return response.text();
      })
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load lesson content. Make sure the content files are in the public/content directory.');
        setLoading(false);
      });
  }, [lesson?.contentPath]);

  if (!mod || !lesson) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--text-tertiary)' }}>
        Lesson not found.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* Breadcrumb */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-xs)',
        fontSize: '0.8125rem',
        color: 'var(--text-tertiary)',
      }}>
        <NavLink to="/" style={{ color: 'var(--azure)' }}>Dashboard</NavLink>
        <ChevronRight size={12} />
        <NavLink to={`/module/${mod.slug}`} style={{ color: 'var(--azure)' }}>
          {mod.title}
        </NavLink>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--text-secondary)' }}>{lesson.title}</span>
      </div>

      {/* Lesson header */}
      <div>
        <div className="section-label">Module {mod.number} -- Lesson {lesson.order}</div>
        <h1 style={{ fontWeight: 100, margin: 0 }}>{lesson.title}</h1>
      </div>

      {/* Content */}
      <GlassCard style={{ padding: 'var(--space-xl)' }}>
        {loading && (
          <div style={{ color: 'var(--text-tertiary)', padding: 'var(--space-xl)', textAlign: 'center' }}>
            Loading lesson content...
          </div>
        )}
        {error && (
          <div style={{
            color: 'var(--warning)',
            padding: 'var(--space-lg)',
            background: 'rgba(217, 119, 6, 0.06)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9375rem',
          }}>
            {error}
          </div>
        )}
        {!loading && !error && <MarkdownRenderer content={content} />}
      </GlassCard>

      {/* Completion + navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-md)',
      }}>
        <div>
          {adjacent.previous && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/module/${adjacent.previous!.moduleSlug}/lesson/${adjacent.previous!.slug}`)}
            >
              <ChevronLeft size={16} />
              {adjacent.previous.title}
            </Button>
          )}
        </div>

        <LessonCompleteButton lessonId={lesson.id} />

        <div>
          {adjacent.next && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/module/${adjacent.next!.moduleSlug}/lesson/${adjacent.next!.slug}`)}
            >
              {adjacent.next.title}
              <ChevronRight size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
