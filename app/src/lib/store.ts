import { create } from 'zustand';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { UserProgress } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

// -- DB row shape (snake_case from Postgres) --

interface ProgressRow {
  id: string;
  user_id: string;
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completed_at: string | null;
}

function rowToProgress(row: ProgressRow): UserProgress {
  return {
    lessonId: row.lesson_id,
    status: row.status,
    completedAt: row.completed_at,
  };
}

// -- localStorage helpers for offline mode --

const LS_PROGRESS_KEY = 'clrclaude_progress';

function loadLocalProgress(): Record<string, UserProgress> {
  try {
    const raw = localStorage.getItem(LS_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalProgress(progress: Record<string, UserProgress>) {
  try {
    localStorage.setItem(LS_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // localStorage full or unavailable -- silently fail
  }
}

// -- Auth Store --
// In offline mode: user is always a mock "guest" user, no login required.

interface AuthState {
  user: SupabaseUser | null;
  loading: boolean;
  offlineMode: boolean;
  setUser: (user: SupabaseUser | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  offlineMode: !isSupabaseConfigured,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  signIn: async (email, password) => {
    if (!supabase) return { error: null };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  },

  signUp: async (email, password, displayName) => {
    if (!supabase) return { error: null };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) return { error: error.message };
    return { error: null };
  },

  signOut: async () => {
    if (supabase) await supabase.auth.signOut();
    set({ user: null });
  },

  initialize: async () => {
    if (!isSupabaseConfigured) {
      // Offline mode -- create a fake guest user so the app works
      const guestUser = {
        id: 'guest',
        email: 'guest@clrclaude.local',
        user_metadata: { display_name: 'Learner' },
      } as unknown as SupabaseUser;
      set({ user: guestUser, loading: false, offlineMode: true });
      return;
    }

    const { data: { session } } = await supabase!.auth.getSession();
    set({ user: session?.user ?? null, loading: false });

    supabase!.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null });
    });
  },
}));

// -- Progress Store --
// Uses Supabase when configured, falls back to localStorage.

interface ProgressState {
  progress: Record<string, UserProgress>;
  loading: boolean;
  fetchProgress: () => Promise<void>;
  markComplete: (lessonId: string) => Promise<void>;
  markInProgress: (lessonId: string) => Promise<void>;
  getModuleProgress: (moduleId: string, lessonIds: string[]) => {
    completed: number;
    total: number;
    percentage: number;
  };
  getOverallProgress: (allLessonIds: string[]) => {
    completed: number;
    total: number;
    percentage: number;
  };
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: {},
  loading: false,

  fetchProgress: async () => {
    set({ loading: true });

    if (!isSupabaseConfigured || !supabase) {
      // Offline mode -- load from localStorage
      set({ progress: loadLocalProgress(), loading: false });
      return;
    }

    const { data, error } = await supabase
      .from('user_progress')
      .select('*');

    if (!error && data) {
      const progressMap: Record<string, UserProgress> = {};
      (data as ProgressRow[]).forEach((row) => {
        const mapped = rowToProgress(row);
        progressMap[mapped.lessonId] = mapped;
      });
      set({ progress: progressMap });
    }
    set({ loading: false });
  },

  markComplete: async (lessonId) => {
    const now = new Date().toISOString();
    const entry: UserProgress = {
      lessonId,
      status: 'completed',
      completedAt: now,
    };

    // Optimistic update
    set((state) => {
      const updated = { ...state.progress, [lessonId]: entry };
      if (!isSupabaseConfigured) saveLocalProgress(updated);
      return { progress: updated };
    });

    if (!isSupabaseConfigured || !supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        status: 'completed',
        completed_at: now,
      }, { onConflict: 'user_id,lesson_id' });

    if (error) {
      console.error('Failed to save progress:', error.message);
      set((state) => {
        const reverted = { ...state.progress };
        delete reverted[lessonId];
        return { progress: reverted };
      });
    }
  },

  markInProgress: async (lessonId) => {
    const entry: UserProgress = {
      lessonId,
      status: 'in_progress',
      completedAt: null,
    };

    set((state) => {
      const updated = { ...state.progress, [lessonId]: entry };
      if (!isSupabaseConfigured) saveLocalProgress(updated);
      return { progress: updated };
    });

    if (!isSupabaseConfigured || !supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        status: 'in_progress',
        completed_at: null,
      }, { onConflict: 'user_id,lesson_id' });
  },

  getModuleProgress: (_moduleId, lessonIds) => {
    const { progress } = get();
    const completed = lessonIds.filter(
      (id) => progress[id]?.status === 'completed'
    ).length;
    return {
      completed,
      total: lessonIds.length,
      percentage: lessonIds.length > 0 ? Math.round((completed / lessonIds.length) * 100) : 0,
    };
  },

  getOverallProgress: (allLessonIds) => {
    const { progress } = get();
    const completed = allLessonIds.filter(
      (id) => progress[id]?.status === 'completed'
    ).length;
    return {
      completed,
      total: allLessonIds.length,
      percentage: allLessonIds.length > 0 ? Math.round((completed / allLessonIds.length) * 100) : 0,
    };
  },
}));
