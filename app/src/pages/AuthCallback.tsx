import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Auth is handled by clr-hub via our backend; there is no OAuth redirect flow.
// This route just sends people home (kept so old links don't 404).
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      color: 'var(--text-tertiary)',
      fontWeight: 300,
    }}>
      Redirecting...
    </div>
  );
}
