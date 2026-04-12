import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore, useProgressStore } from './lib/store';
import { AppShell } from './components/layout';
import { AuthGuard } from './components/auth';

// Lazy-load heavy pages -- keeps initial bundle small on Vercel's edge
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ModuleView = lazy(() => import('./pages/ModuleView'));
const LessonView = lazy(() => import('./pages/LessonView'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));

function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-3xl)',
      color: 'var(--text-tertiary)',
      fontWeight: 300,
    }}>
      Loading...
    </div>
  );
}

function App() {
  const initialize = useAuthStore((s) => s.initialize);
  const user = useAuthStore((s) => s.user);
  const fetchProgress = useProgressStore((s) => s.fetchProgress);

  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Fetch progress when user logs in
  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user, fetchProgress]);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected routes */}
          <Route
            element={
              <AuthGuard>
                <AppShell />
              </AuthGuard>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/module/:moduleSlug" element={<ModuleView />} />
            <Route path="/module/:moduleSlug/lesson/:lessonSlug" element={<LessonView />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
