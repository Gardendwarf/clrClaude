import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// When Supabase env vars are present, we use Supabase Cloud for auth + progress.
// When they're missing, the app runs in "offline" mode -- no login required,
// progress tracked in localStorage only.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  supabaseAnonKey !== 'your-anon-key-here';

// Only create a real client when credentials are present.
// Otherwise export null -- consumers check isSupabaseConfigured first.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
