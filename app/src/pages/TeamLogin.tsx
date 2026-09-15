import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { LoginForm } from '../components/auth';

// Hidden team sign-in. Not linked from anywhere; kept out of search indexes.
export default function TeamLogin() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex,nofollow';
    document.head.appendChild(meta);
    return () => {
      meta.remove();
    };
  }, []);

  // Already signed in (team only): go to the app.
  if (user) {
    return <Navigate to="/" replace />;
  }

  return <LoginForm />;
}
