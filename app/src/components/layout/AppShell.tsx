import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore } from '../../lib/store';

export function AppShell() {
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();

  // Signing out lands on the public interest page at "/".
  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar onSignOut={handleSignOut} />
      <div style={{
        marginLeft: 'var(--sidebar-width)',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Header />
        <main style={{
          flex: 1,
          padding: 'var(--space-xl)',
          maxWidth: 'var(--content-max-width)',
          width: '100%',
          margin: '0 auto',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
