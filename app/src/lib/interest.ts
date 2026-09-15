// Interest capture. The public site is a single "register your interest" page;
// submissions go to the clrTech landing site's lead API (n8n-backed).
// No dependencies here so it can be unit-tested with plain `node --test`.

export const DEFAULT_INTEREST_ENDPOINT = 'https://clrtech.co.za/api/contact';
export const APP_KEY = 'clrclaude';
export const APP_NAME = 'clrClaude';
export const APP_HOST = 'clrclaude.clrtech.xyz';

export interface InterestFields {
  name: string;
  email: string;
  company?: string;
  note?: string;
  /** Honeypot. Humans never see or fill it. */
  website?: string;
}

export interface InterestPayload {
  name: string;
  email: string;
  company: string;
  message: string;
  app: string;
  website: string;
}

// Build-time override: VITE_INTEREST_ENDPOINT=<full URL of the contact API>.
export function interestEndpoint(): string {
  const env = (import.meta as { env?: Record<string, string | undefined> }).env;
  const override = env?.VITE_INTEREST_ENDPOINT?.trim();
  return override || DEFAULT_INTEREST_ENDPOINT;
}

export function buildInterestPayload(f: InterestFields): InterestPayload {
  const note = (f.note || '').trim();
  return {
    name: f.name.trim(),
    email: f.email.trim(),
    company: (f.company || '').trim(),
    message: note
      ? `Interest: ${APP_NAME}\n\n${note}`
      : `Registered interest via ${APP_HOST}`,
    app: APP_KEY,
    website: f.website || '',
  };
}

export async function submitInterest(
  f: InterestFields,
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: boolean; error: string | null }> {
  let res: Response;
  try {
    res = await fetchImpl(interestEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildInterestPayload(f)),
    });
  } catch {
    return { ok: false, error: 'Network error, please try again' };
  }
  if (res.ok) return { ok: true, error: null };
  let error = 'Something went wrong, please try again';
  try {
    const body = (await res.json()) as { error?: unknown };
    if (typeof body?.error === 'string' && body.error) error = body.error;
  } catch {
    /* non-JSON error body */
  }
  return { ok: false, error };
}
