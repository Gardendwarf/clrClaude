import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';

interface AudioPlayerProps {
  /** The text content to read aloud */
  content: string;
}

// Strip markdown syntax so the speech engine reads clean text
function stripMarkdown(md: string): string {
  return md
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`[^`]*`/g, '')
    // Remove images
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Remove links but keep text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove headers markers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic markers
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}$/gm, '')
    // Remove blockquote markers
    .replace(/^>\s+/gm, '')
    // Remove list markers
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Collapse whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const speeds = [0.75, 1, 1.25, 1.5, 2];

export function AudioPlayer({ content }: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(1); // default 1x
  const [progress, setProgress] = useState(0);
  const [supported, setSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<number | null>(null);
  const cleanText = useRef('');

  useEffect(() => {
    if (!window.speechSynthesis) {
      setSupported(false);
    }
    cleanText.current = stripMarkdown(content);

    // Cleanup on unmount
    return () => {
      window.speechSynthesis?.cancel();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [content]);

  const startTracking = useCallback(() => {
    // SpeechSynthesis doesn't give us granular progress,
    // so we estimate based on elapsed time vs total duration
    const totalChars = cleanText.current.length;
    const rate = speeds[speedIndex];
    // Average reading rate: ~150 words/min at 1x, ~5 chars/word
    const charsPerSecond = (150 * 5 * rate) / 60;
    const estimatedDuration = totalChars / charsPerSecond;

    const startTime = Date.now();
    intervalRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const pct = Math.min(100, (elapsed / estimatedDuration) * 100);
      setProgress(pct);
    }, 250);
  }, [speedIndex]);

  const play = useCallback(() => {
    if (!window.speechSynthesis) return;

    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
      setPlaying(true);
      return;
    }

    // Cancel any existing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText.current);
    utterance.rate = speeds[speedIndex];
    utterance.pitch = 1;

    // Try to pick a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('natural')
    ) || voices.find(
      (v) => v.lang.startsWith('en-') && !v.name.toLowerCase().includes('compact')
    ) || voices.find(
      (v) => v.lang.startsWith('en')
    );
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => {
      setPlaying(false);
      setPaused(false);
      setProgress(100);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    utterance.onerror = () => {
      setPlaying(false);
      setPaused(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setPlaying(true);
    setPaused(false);
    setProgress(0);
    startTracking();
  }, [paused, speedIndex, startTracking]);

  const pause = useCallback(() => {
    window.speechSynthesis?.pause();
    setPaused(true);
    setPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setPlaying(false);
    setPaused(false);
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const cycleSpeed = useCallback(() => {
    setSpeedIndex((i) => (i + 1) % speeds.length);
  }, []);

  if (!supported) return null;

  const isActive = playing || paused;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-sm)',
      padding: '8px 16px',
      background: 'var(--azure-tint)',
      borderRadius: 'var(--radius-md)',
      fontSize: '0.8125rem',
      color: 'var(--text-secondary)',
    }}>
      {/* Play/Pause */}
      {playing ? (
        <button onClick={pause} style={iconBtnStyle} title="Pause">
          <Pause size={16} />
        </button>
      ) : (
        <button onClick={play} style={iconBtnStyle} title={paused ? 'Resume' : 'Listen to this lesson'}>
          <Play size={16} />
        </button>
      )}

      {/* Stop (only when active) */}
      {isActive && (
        <button onClick={stop} style={iconBtnStyle} title="Stop">
          <Square size={14} />
        </button>
      )}

      {/* Progress bar */}
      <div style={{
        flex: 1,
        height: 3,
        background: 'var(--border)',
        borderRadius: 2,
        overflow: 'hidden',
        minWidth: 60,
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'var(--azure)',
          borderRadius: 2,
          transition: 'width 0.25s linear',
        }} />
      </div>

      {/* Speed control */}
      <button
        onClick={cycleSpeed}
        style={{
          ...iconBtnStyle,
          fontSize: '0.6875rem',
          fontWeight: 500,
          minWidth: 32,
          fontFamily: 'var(--font-mono)',
        }}
        title="Change speed"
      >
        {speeds[speedIndex]}x
      </button>

      {/* Restart */}
      {isActive && (
        <button onClick={() => { stop(); play(); }} style={iconBtnStyle} title="Restart">
          <RotateCcw size={14} />
        </button>
      )}

      {!isActive && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          Listen
        </span>
      )}
    </div>
  );
}

const iconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 4,
  color: 'var(--azure)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 4,
};
