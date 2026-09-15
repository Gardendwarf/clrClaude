import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore, useProgressStore } from './lib/store';
import { AppShell } from './components/layout';
import { AuthGuard } from './components/auth';
import Interest from './pages/Interest';

// Lazy-load heavy pages -- keeps initial bundle small on Vercel's edge
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ModuleView = lazy(() => import('./pages/ModuleView'));
const LessonView = lazy(() => import('./pages/LessonView'));
const Profile = lazy(() => import('./pages/Profile'));
const TeamLogin = lazy(() => import('./pages/TeamLogin'));
const Services = lazy(() => import('./pages/Services'));

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
          {/* Hidden team sign-in (unlinked, noindex) */}
          <Route path="/team" element={<TeamLogin />} />

          {/* Public entry points: interest capture only, never a redirect.
              Old auth routes are kept explicitly so they never reach the app. */}
          <Route path="/login" element={<Interest />} />
          <Route path="/register" element={<Interest />} />
          <Route path="/signup" element={<Interest />} />
          <Route path="/forgot-password" element={<Interest />} />
          <Route path="/auth/*" element={<Interest />} />
          <Route path="/pricing" element={<Interest />} />

          {/* Protected routes: signed-out visitors see the interest page */}
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
            <Route path="/services" element={<Services />} />
          </Route>

          {/* Anything else */}
          <Route path="*" element={<Interest />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
