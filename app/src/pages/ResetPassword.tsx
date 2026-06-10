import { Link } from 'react-router-dom';
import { GlassCard, Button } from '../components/ui';

// Password resets are handled by clr-hub (the IdP): the reset link in the email
// goes to clr-hub's own reset page, so this in-app route is informational only.
export default function ResetPassword() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: 'var(--space-lg)',
    }}>
      <GlassCard style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div className="section-label" style={{ marginBottom: 'var(--space-sm)' }}>Password reset</div>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 300, margin: '0 0 var(--space-lg)' }}>
          Use the reset link in your email to set a new password. Once done, come back and sign in.
        </p>
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <Button>Back to sign in</Button>
        </Link>
      </GlassCard>
    </div>
  );
}
