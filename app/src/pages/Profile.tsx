import { useState, useEffect } from 'react';
import { Save, Check } from 'lucide-react';
import { useAuthStore, useProgressStore } from '../lib/store';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { modules, getAllLessonIds, getTotalEstimatedMinutes } from '../lib/courseData';
import { GlassCard, ProgressBar, Button, Input } from '../components/ui';

interface UserProfile {
  displayName: string;
  jobTitle: string;
  aiInterest: string;
  toolsWanted: string;
}

const LS_PROFILE_KEY = 'clrclaude_profile';

function loadLocalProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(LS_PROFILE_KEY);
    return raw ? JSON.parse(raw) : { displayName: '', jobTitle: '', aiInterest: '', toolsWanted: '' };
  } catch {
    return { displayName: '', jobTitle: '', aiInterest: '', toolsWanted: '' };
  }
}

function saveLocalProfile(profile: UserProfile) {
  try {
    localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(profile));
  } catch { /* ignore */ }
}

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const getOverallProgress = useProgressStore((s) => s.getOverallProgress);
  const getModuleProgress = useProgressStore((s) => s.getModuleProgress);

  const allLessonIds = getAllLessonIds();
  const { completed, total, percentage } = getOverallProgress(allLessonIds);
  const totalMinutes = getTotalEstimatedMinutes();

  const [profile, setProfile] = useState<UserProfile>({
    displayName: user?.user_metadata?.display_name || '',
    jobTitle: '',
    aiInterest: '',
    toolsWanted: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isSupabaseConfigured || !supabase || !user) {
        const local = loadLocalProfile();
        setProfile((p) => ({
          ...p,
          ...local,
          displayName: local.displayName || p.displayName,
        }));
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProfile({
          displayName: data.display_name || user.user_metadata?.display_name || '',
          jobTitle: data.job_title || '',
          aiInterest: data.ai_interest || '',
          toolsWanted: data.tools_wanted || '',
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const MAX_SHORT = 100;
  const MAX_LONG = 500;

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    // Trim and enforce length limits
    const trimmed = {
      displayName: profile.displayName.trim().slice(0, MAX_SHORT),
      jobTitle: profile.jobTitle.trim().slice(0, MAX_SHORT),
      aiInterest: profile.aiInterest.trim().slice(0, MAX_LONG),
      toolsWanted: profile.toolsWanted.trim().slice(0, MAX_LONG),
    };
    setProfile(trimmed);

    if (!isSupabaseConfigured || !supabase || !user) {
      saveLocalProfile(trimmed);
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return;
    }

    await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        display_name: trimmed.displayName,
        job_title: trimmed.jobTitle,
        ai_interest: trimmed.aiInterest,
        tools_wanted: trimmed.toolsWanted,
      }, { onConflict: 'user_id' });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateField = (field: keyof UserProfile, value: string) => {
    setProfile((p) => ({ ...p, [field]: value }));
    setSaved(false);
  };

  const displayName = profile.displayName || user?.email?.split('@')[0] || 'Learner';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', maxWidth: 640 }}>
      <div>
        <div className="section-label">Profile</div>
        <h1 style={{ fontWeight: 100, margin: 0 }}>{displayName}</h1>
        <p style={{ color: 'var(--text-tertiary)', margin: 'var(--space-xs) 0 0', fontSize: '0.9375rem' }}>
          {user?.email}
        </p>
      </div>

      {/* Profile edit card */}
      <GlassCard>
        <div className="section-label" style={{ marginBottom: 'var(--space-md)' }}>
          About you
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-tertiary)', padding: 'var(--space-md)' }}>Loading profile...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <Input
              label="Display name"
              type="text"
              value={profile.displayName}
              onChange={(e) => updateField('displayName', e.target.value)}
              placeholder="How should we address you?"
            />

            <Input
              label="What do you do?"
              type="text"
              value={profile.jobTitle}
              onChange={(e) => updateField('jobTitle', e.target.value)}
              placeholder="e.g. Full-stack developer, Product manager, Student"
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              <label style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                letterSpacing: '0.06em',
                textTransform: 'uppercase' as const,
                color: 'var(--azure)',
              }}>
                What got you into AI?
              </label>
              <textarea
                value={profile.aiInterest}
                onChange={(e) => updateField('aiInterest', e.target.value)}
                placeholder="What sparked your interest in AI tools and automation?"
                rows={3}
                style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: '1rem',
                  fontWeight: 300,
                  padding: '12px 16px',
                  background: 'var(--surface-glass)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  resize: 'vertical',
                  width: '100%',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              <label style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                letterSpacing: '0.06em',
                textTransform: 'uppercase' as const,
                color: 'var(--azure)',
              }}>
                Any AI tools you want access to or would like to build?
              </label>
              <textarea
                value={profile.toolsWanted}
                onChange={(e) => updateField('toolsWanted', e.target.value)}
                placeholder="Tell us about tools you're interested in -- we might be able to help"
                rows={3}
                style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: '1rem',
                  fontWeight: 300,
                  padding: '12px 16px',
                  background: 'var(--surface-glass)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  resize: 'vertical',
                  width: '100%',
                }}
              />
            </div>

            <Button onClick={handleSave} disabled={saving} style={{ alignSelf: 'flex-start' }}>
              {saved ? <><Check size={16} /> Saved</> : saving ? 'Saving...' : <><Save size={16} /> Save profile</>}
            </Button>
          </div>
        )}
      </GlassCard>

      {/* Overall stats */}
      <GlassCard>
        <div className="section-label" style={{ marginBottom: 'var(--space-md)' }}>
          Overall progress
        </div>
        <ProgressBar percentage={percentage} height={8} showLabel label={`${completed}/${total} lessons`} />
        <div style={{
          marginTop: 'var(--space-md)',
          display: 'flex',
          gap: 'var(--space-xl)',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          flexWrap: 'wrap',
        }}>
          <span>Total course time: ~{Math.round(totalMinutes / 60)}h</span>
          <span>{modules.length} modules</span>
          <span>{total} lessons</span>
        </div>
      </GlassCard>

      {/* Per-module breakdown */}
      <div>
        <div className="section-label">Module breakdown</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
          {modules.map((mod) => {
            const lessonIds = mod.lessons.map((l) => l.id);
            const modProgress = getModuleProgress(mod.id, lessonIds);

            return (
              <GlassCard key={mod.id} style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-xs)',
                }}>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 300 }}>
                    {mod.number}. {mod.title}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: modProgress.percentage === 100 ? 'var(--success)' : 'var(--text-tertiary)',
                  }}>
                    {modProgress.completed}/{modProgress.total}
                  </span>
                </div>
                <ProgressBar percentage={modProgress.percentage} height={4} />
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
