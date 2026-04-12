import { NavLink, useLocation } from 'react-router-dom';
import {
  Terminal,
  Brain,
  Wand2,
  Bot,
  Plug,
  Webhook,
  Package,
  History,
  Zap,
  MonitorDot,
  LayoutDashboard,
  User,
  LogOut,
  Heart,
  Star,
  Briefcase,
} from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { modules } from '../../lib/courseData';
import { useProgressStore } from '../../lib/store';

// Map module IDs to icons
const moduleIcons: Record<string, ReactNode> = {
  'slash-commands': <Terminal size={18} />,
  'memory': <Brain size={18} />,
  'skills': <Wand2 size={18} />,
  'subagents': <Bot size={18} />,
  'mcp': <Plug size={18} />,
  'hooks': <Webhook size={18} />,
  'plugins': <Package size={18} />,
  'checkpoints': <History size={18} />,
  'advanced': <Zap size={18} />,
  'cli': <MonitorDot size={18} />,
};

const sidebarStyle: CSSProperties = {
  width: 'var(--sidebar-width)',
  height: '100vh',
  position: 'fixed',
  top: 0,
  left: 0,
  background: 'var(--surface-glass)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRight: '1px solid var(--border)',
  display: 'flex',
  flexDirection: 'column',
  padding: 'var(--space-lg) 0',
  overflowY: 'auto',
  zIndex: 100,
};

const logoStyle: CSSProperties = {
  padding: '0 var(--space-lg)',
  marginBottom: 'var(--space-2xl)',
};

const navItemBase: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-sm)',
  padding: '10px var(--space-lg)',
  fontSize: '0.9375rem',
  fontWeight: 300,
  color: 'var(--text-secondary)',
  textDecoration: 'none',
  transition: 'all var(--transition-fast)',
  borderLeft: '3px solid transparent',
};

interface SidebarProps {
  onSignOut: () => void;
}

export function Sidebar({ onSignOut }: SidebarProps) {
  const location = useLocation();
  const getModuleProgress = useProgressStore((s) => s.getModuleProgress);

  return (
    <aside style={sidebarStyle}>
      {/* Logo */}
      <div style={logoStyle}>
        <NavLink to="/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <img
              src="/favicon.png"
              alt="clrClaude"
              width={28}
              height={28}
            />
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 100,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}>
              clrClaude
            </span>
          </div>
        </NavLink>
      </div>

      {/* Dashboard link */}
      <NavLink
        to="/"
        end
        style={({ isActive }) => ({
          ...navItemBase,
          color: isActive ? 'var(--coral)' : 'var(--text-secondary)',
          borderLeftColor: isActive ? 'var(--coral)' : 'transparent',
          background: isActive ? 'var(--coral-tint)' : 'transparent',
          fontWeight: isActive ? 400 : 300,
        })}
      >
        <LayoutDashboard size={18} />
        Dashboard
      </NavLink>

      {/* Section label */}
      <div style={{
        padding: 'var(--space-lg) var(--space-lg) var(--space-sm)',
      }}>
        <span className="section-label">Modules</span>
      </div>

      {/* Module nav */}
      <nav style={{ flex: 1 }}>
        {modules.map((mod) => {
          const lessonIds = mod.lessons.map((l) => l.id);
          const { percentage } = getModuleProgress(mod.id, lessonIds);
          const isActive = location.pathname.startsWith(`/module/${mod.slug}`);

          return (
            <NavLink
              key={mod.id}
              to={`/module/${mod.slug}`}
              style={{
                ...navItemBase,
                color: isActive ? 'var(--coral)' : 'var(--text-secondary)',
                borderLeftColor: isActive ? 'var(--coral)' : 'transparent',
                background: isActive ? 'var(--coral-tint)' : 'transparent',
                fontWeight: isActive ? 400 : 300,
              }}
            >
              <span style={{
                color: isActive ? 'var(--coral)' : 'var(--azure)',
                display: 'flex',
                alignItems: 'center',
              }}>
                {moduleIcons[mod.id]}
              </span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {mod.title}
              </span>
              {percentage > 0 && (
                <span style={{
                  fontSize: '0.6875rem',
                  color: percentage === 100 ? 'var(--success)' : 'var(--text-tertiary)',
                  fontWeight: 500,
                }}>
                  {percentage}%
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Attribution -- credit to original content author */}
      <div style={{
        padding: 'var(--space-sm) var(--space-lg)',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{
          fontSize: '0.6875rem',
          color: 'var(--text-tertiary)',
          lineHeight: 1.5,
        }}>
          Course content by{' '}
          <a
            href="https://github.com/luongnv89/claude-howto"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--azure)', textDecoration: 'none' }}
          >
            Luong Nguyen
          </a>
        </div>
        <div style={{
          display: 'flex',
          gap: 'var(--space-sm)',
          marginTop: 'var(--space-xs)',
        }}>
          <a
            href="https://github.com/luongnv89/claude-howto"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.625rem',
              color: 'var(--text-tertiary)',
              textDecoration: 'none',
              padding: '2px 8px',
              borderRadius: '100px',
              background: 'var(--azure-tint)',
              transition: 'color var(--transition-fast)',
            }}
          >
            <Star size={10} />
            Star
          </a>
          <a
            href="https://github.com/sponsors/luongnv89"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.625rem',
              color: 'var(--text-tertiary)',
              textDecoration: 'none',
              padding: '2px 8px',
              borderRadius: '100px',
              background: 'var(--coral-tint)',
              transition: 'color var(--transition-fast)',
            }}
          >
            <Heart size={10} />
            Sponsor
          </a>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-md)' }}>
        <NavLink
          to="/services"
          style={({ isActive }) => ({
            ...navItemBase,
            color: isActive ? 'var(--coral)' : 'var(--text-secondary)',
            borderLeftColor: isActive ? 'var(--coral)' : 'transparent',
          })}
        >
          <Briefcase size={18} />
          Services
        </NavLink>
        <NavLink
          to="/profile"
          style={({ isActive }) => ({
            ...navItemBase,
            color: isActive ? 'var(--coral)' : 'var(--text-secondary)',
            borderLeftColor: isActive ? 'var(--coral)' : 'transparent',
          })}
        >
          <User size={18} />
          Profile
        </NavLink>
        <button
          onClick={onSignOut}
          style={{
            ...navItemBase,
            background: 'none',
            cursor: 'pointer',
            width: '100%',
            border: 'none',
            fontFamily: 'var(--font-primary)',
          }}
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
