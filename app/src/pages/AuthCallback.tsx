import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      if (!isSupabaseConfigured || !supabase) {
        navigate('/', { replace: true });
        return;
      }

      const { error } = await supabase.auth.getSession();

      if (error) {
        setError(error.message);
        return;
      }

      navigate('/', { replace: true });
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: 'var(--space-md)',
        color: 'var(--text-secondary)',
      }}>
        <p style={{ color: 'var(--error)' }}>Authentication failed: {error}</p>
        <a href="/login" style={{ color: 'var(--azure)' }}>Back to login</a>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      color: 'var(--text-tertiary)',
      fontWeight: 300,
    }}>
      Signing you in...
    </div>
  );
}
