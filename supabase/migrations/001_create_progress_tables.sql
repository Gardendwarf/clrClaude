-- clrClaude -- Progress tracking schema
-- Depends on Supabase Auth (auth.users)

-- User progress per lesson
create table if not exists public.user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  lesson_id text not null,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- One progress row per user per lesson
  unique (user_id, lesson_id)
);

-- Quiz attempts
create table if not exists public.quiz_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  lesson_id text not null,
  score integer not null default 0,
  total_questions integer not null default 0,
  answers jsonb not null default '[]'::jsonb,
  attempted_at timestamptz default now()
);

-- Auto-update the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.user_progress
  for each row
  execute function public.handle_updated_at();

-- Indexes for common queries
create index if not exists idx_user_progress_user_id on public.user_progress(user_id);
create index if not exists idx_user_progress_lesson_id on public.user_progress(lesson_id);
create index if not exists idx_quiz_attempts_user_id on public.quiz_attempts(user_id);
create index if not exists idx_quiz_attempts_lesson_id on public.quiz_attempts(lesson_id);

-- Row Level Security -- users can only see/edit their own data
alter table public.user_progress enable row level security;
alter table public.quiz_attempts enable row level security;

-- Policies: authenticated users can CRUD their own rows
create policy "Users can view own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.user_progress for update
  using (auth.uid() = user_id);

create policy "Users can delete own progress"
  on public.user_progress for delete
  using (auth.uid() = user_id);

create policy "Users can view own quiz attempts"
  on public.quiz_attempts for select
  using (auth.uid() = user_id);

create policy "Users can insert own quiz attempts"
  on public.quiz_attempts for insert
  with check (auth.uid() = user_id);
