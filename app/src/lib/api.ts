// Owned API client. Auth goes through our backend, which proxies to clr-hub
// (the IdP) and returns clr-hub access/refresh tokens. Progress + profile are
// served by our backend (clr-postgres), scoped to the token's subject.

const TOKEN_KEY = 'clrclaude_token';
const REFRESH_KEY = 'clrclaude_refresh';

export interface AppUser {
  id: string;
  email: string;
  user_metadata?: { display_name?: string };
}

export interface UserProfileData {
  displayName: string;
  jobTitle: string;
  aiInterest: string;
  toolsWanted: string;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setTokens(access: string, refresh?: string | null): void {
  localStorage.setItem(TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

function decodeUser(token: string): AppUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { sub?: string; email?: string };
    if (!payload.sub) return null;
    return { id: payload.sub, email: payload.email || '' };
  } catch {
    return null;
  }
}

// Pull tokens out of clr-hub's { success, data: { access_token, refresh_token } }
// envelope (also tolerates a flat shape).
function extractTokens(body: unknown): { access?: string; refresh?: string } {
  const b = (body || {}) as Record<string, unknown>;
  const d = (b.data as Record<string, unknown>) || b;
  return { access: d.access_token as string | undefined, refresh: d.refresh_token as string | undefined };
}

async function tryRefresh(): Promise<boolean> {
  const rt = localStorage.getItem(REFRESH_KEY);
  if (!rt) return false;
  try {
    const r = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: rt }),
    });
    if (!r.ok) return false;
    const { access, refresh } = extractTokens(await r.json());
    if (access) {
      setTokens(access, refresh);
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

// fetch with Bearer + one transparent refresh-and-retry on 401
async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const build = (): RequestInit => ({
    ...init,
    headers: {
      ...(init.headers || {}),
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${getToken() || ''}`,
    },
  });
  let res = await fetch(path, build());
  if (res.status === 401 && (await tryRefresh())) {
    res = await fetch(path, build());
  }
  return res;
}

function errorFrom(body: unknown, fallback: string): string {
  const b = (body || {}) as Record<string, unknown>;
  return (b.error as string) || (b.message as string) || fallback;
}

// ---- auth ----
export async function login(email: string, password: string): Promise<{ user: AppUser | null; error: string | null }> {
  try {
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const body = await r.json().catch(() => null);
    const { access, refresh } = extractTokens(body);
    if (!r.ok || !access) return { user: null, error: errorFrom(body, 'Invalid email or password.') };
    setTokens(access, refresh);
    return { user: decodeUser(access), error: null };
  } catch {
    return { user: null, error: 'Network error. Please try again.' };
  }
}

export async function register(
  email: string,
  password: string,
  displayName: string
): Promise<{ user: AppUser | null; error: string | null }> {
  try {
    const r = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name: displayName }),
    });
    const body = await r.json().catch(() => null);
    const { access, refresh } = extractTokens(body);
    if (!r.ok || !access) return { user: null, error: errorFrom(body, 'Registration failed.') };
    setTokens(access, refresh);
    return { user: decodeUser(access), error: null };
  } catch {
    return { user: null, error: 'Network error. Please try again.' };
  }
}

export async function forgotPassword(email: string): Promise<boolean> {
  try {
    const r = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

export function logout(): void {
  clearTokens();
  fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
}

// Validate the stored session against the backend (refreshes if needed).
export async function getSessionUser(): Promise<AppUser | null> {
  if (!getToken()) return null;
  try {
    const r = await authedFetch('/api/auth/me');
    if (!r.ok) {
      clearTokens();
      return null;
    }
    const { user } = (await r.json()) as { user: { id: string; email: string } };
    return { id: user.id, email: user.email };
  } catch {
    return null;
  }
}

// ---- data ----
export interface ProgressDTO {
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completedAt: string | null;
}

export async function fetchProgress(): Promise<ProgressDTO[]> {
  const r = await authedFetch('/api/progress');
  if (!r.ok) return [];
  return (await r.json()) as ProgressDTO[];
}

export async function saveProgress(lessonId: string, status: string, completedAt: string | null): Promise<void> {
  await authedFetch('/api/progress', {
    method: 'POST',
    body: JSON.stringify({ lessonId, status, completedAt }),
  });
}

export async function getProfile(): Promise<UserProfileData | null> {
  const r = await authedFetch('/api/profile');
  if (!r.ok) return null;
  return (await r.json()) as UserProfileData;
}

export async function saveProfile(p: UserProfileData): Promise<void> {
  await authedFetch('/api/profile', { method: 'PUT', body: JSON.stringify(p) });
}
