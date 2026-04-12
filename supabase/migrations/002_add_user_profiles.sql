-- clrClaude -- User profiles with onboarding context
-- Stores answers to the 3 onboarding questions + editable profile fields

create table if not exists public.user_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  display_name text,
  job_title text,
  ai_interest text,
  tools_wanted text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update timestamp
drop trigger if exists set_profile_updated_at on public.user_profiles;
create trigger set_profile_updated_at
  before update on public.user_profiles
  for each row
  execute function public.handle_updated_at();

-- Index
create index if not exists idx_user_profiles_user_id on public.user_profiles(user_id);

-- RLS
alter table public.user_profiles enable row level security;

drop policy if exists "Users can view own profile" on public.user_profiles;
drop policy if exists "Users can insert own profile" on public.user_profiles;
drop policy if exists "Users can update own profile" on public.user_profiles;

create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = user_id);
