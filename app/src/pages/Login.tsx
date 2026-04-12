import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { LoginForm } from '../components/auth';

export default function Login() {
  const user = useAuthStore((s) => s.user);

  // Already logged in -- redirect to dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  return <LoginForm />;
}
