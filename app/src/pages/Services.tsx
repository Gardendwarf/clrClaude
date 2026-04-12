import { Mail, Globe, Zap, Code, Bot, BarChart3 } from 'lucide-react';
import { GlassCard, IconContainer, Button } from '../components/ui';

const services = [
  {
    icon: <Bot size={20} />,
    title: 'AI Integration',
    description: 'Connect AI tools into your existing workflows. From Claude Code setups to custom agent teams.',
  },
  {
    icon: <Code size={20} />,
    title: 'Custom Development',
    description: 'Full-stack web apps, APIs, and internal tools. React, TypeScript, Fastify, PostgreSQL.',
  },
  {
    icon: <Zap size={20} />,
    title: 'Workflow Automation',
    description: 'n8n workflows, webhook integrations, and process automation that saves real hours.',
  },
  {
    icon: <BarChart3 size={20} />,
    title: 'SCADA and Monitoring',
    description: 'Industrial monitoring dashboards, sensor data pipelines, and real-time alerting.',
  },
  {
    icon: <Globe size={20} />,
    title: 'Web Presence',
    description: 'Professional websites, landing pages, and client portals. Clean, fast, mobile-first.',
  },
  {
    icon: <Bot size={20} />,
    title: 'AI Training',
    description: 'Hands-on workshops from introductory AI concepts to advanced Claude Code agent development.',
  },
];

export default function Services() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', maxWidth: 800 }}>
      {/* Header */}
      <div>
        <div className="section-label">Services</div>
        <h1 style={{ fontWeight: 100, margin: '0 0 var(--space-sm)' }}>
          What we build
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0, maxWidth: 560 }}>
          clrPath Consult helps businesses adopt AI, automate workflows,
          and build the tools they actually need.
        </p>
      </div>

      {/* Services grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 'var(--space-md)',
      }}>
        {services.map((service) => (
          <GlassCard key={service.title} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md)',
          }}>
            <IconContainer variant="coral">
              {service.icon}
            </IconContainer>
            <h3 style={{ fontWeight: 300, margin: 0 }}>{service.title}</h3>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              margin: 0,
              lineHeight: 1.6,
              flex: 1,
            }}>
              {service.description}
            </p>
          </GlassCard>
        ))}
      </div>

      {/* Contact section */}
      <GlassCard accentTop style={{ marginTop: 'var(--space-md)' }}>
        <div className="section-label" style={{ marginBottom: 'var(--space-md)' }}>
          Get in touch
        </div>
        <h2 style={{ fontWeight: 300, margin: '0 0 var(--space-md)' }}>
          Let's talk about your project
        </h2>
        <p style={{
          color: 'var(--text-secondary)',
          margin: '0 0 var(--space-lg)',
          fontSize: '0.9375rem',
          maxWidth: 480,
        }}>
          Whether you need a quick automation, a full platform build,
          or AI training for your team -- we'd like to hear from you.
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            fontSize: '0.9375rem',
          }}>
            <IconContainer variant="azure" size={32}>
              <Mail size={16} />
            </IconContainer>
            <a
              href="mailto:wessel@clrpath.xyz"
              style={{
                color: 'var(--text-primary)',
                textDecoration: 'none',
                fontWeight: 300,
              }}
            >
              wessel@clrpath.xyz
            </a>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            fontSize: '0.9375rem',
          }}>
            <IconContainer variant="azure" size={32}>
              <Globe size={16} />
            </IconContainer>
            <a
              href="https://clrpath.xyz"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--text-primary)',
                textDecoration: 'none',
                fontWeight: 300,
              }}
            >
              clrpath.xyz
            </a>
          </div>
        </div>

        <div style={{ marginTop: 'var(--space-lg)' }}>
          <Button
            onClick={() => window.location.href = 'mailto:wessel@clrpath.xyz?subject=clrClaude%20-%20Project%20enquiry'}
          >
            Send us an email
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
