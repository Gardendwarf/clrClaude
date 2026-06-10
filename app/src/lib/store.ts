import { create } from 'zustand';
import type { UserProgress } from '../types';
import {
  type AppUser,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getSessionUser,
  fetchProgress as apiFetchProgress,
  saveProgress as apiSaveProgress,
} from './api';

// -- Auth Store --
// clr-hub-backed accounts via our backend. Login required (no offline guest);
// `offlineMode` is kept false so AuthGuard gates on the user.

interface AuthState {
  user: AppUser | null;
  loading: boolean;
  offlineMode: boolean;
  setUser: (user: AppUser | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  offlineMode: false,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  signIn: async (email, password) => {
    const { user, error } = await apiLogin(email, password);
    if (error) return { error };
    set({ user });
    return { error: null };
  },

  signUp: async (email, password, displayName) => {
    const { user, error } = await apiRegister(email, password, displayName);
    if (error) return { error };
    set({ user });
    return { error: null };
  },

  signOut: async () => {
    apiLogout();
    set({ user: null });
  },

  initialize: async () => {
    const user = await getSessionUser();
    set({ user, loading: false });
  },
}));

// -- Progress Store --
// Backed by the owned API (clr-postgres), scoped to the logged-in user.

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
    const rows = await apiFetchProgress();
    const progressMap: Record<string, UserProgress> = {};
    rows.forEach((row) => {
      progressMap[row.lessonId] = {
        lessonId: row.lessonId,
        status: row.status,
        completedAt: row.completedAt,
      };
    });
    set({ progress: progressMap, loading: false });
  },

  markComplete: async (lessonId) => {
    const now = new Date().toISOString();
    const entry: UserProgress = { lessonId, status: 'completed', completedAt: now };
    set((state) => ({ progress: { ...state.progress, [lessonId]: entry } }));
    try {
      await apiSaveProgress(lessonId, 'completed', now);
    } catch {
      set((state) => {
        const reverted = { ...state.progress };
        delete reverted[lessonId];
        return { progress: reverted };
      });
    }
  },

  markInProgress: async (lessonId) => {
    const entry: UserProgress = { lessonId, status: 'in_progress', completedAt: null };
    set((state) => ({ progress: { ...state.progress, [lessonId]: entry } }));
    try {
      await apiSaveProgress(lessonId, 'in_progress', null);
    } catch {
      /* best-effort; in-progress is non-critical */
    }
  },

  getModuleProgress: (_moduleId, lessonIds) => {
    const { progress } = get();
    const completed = lessonIds.filter((id) => progress[id]?.status === 'completed').length;
    return {
      completed,
      total: lessonIds.length,
      percentage: lessonIds.length > 0 ? Math.round((completed / lessonIds.length) * 100) : 0,
    };
  },

  getOverallProgress: (allLessonIds) => {
    const { progress } = get();
    const completed = allLessonIds.filter((id) => progress[id]?.status === 'completed').length;
    return {
      completed,
      total: allLessonIds.length,
      percentage: allLessonIds.length > 0 ? Math.round((completed / allLessonIds.length) * 100) : 0,
    };
  },
}));
