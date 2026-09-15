-- ============================================================
-- Atlas Cloud Foundation — 004
-- Account-owned learner/session continuity
-- ============================================================

create table if not exists public.learner_sessions (
    owner_user_id uuid not null
        default auth.uid()
        references auth.users(id)
        on delete cascade,

    id text not null,

    schema_version integer not null default 1
        check (schema_version >= 1),

    name text not null,

    revision integer not null default 1
        check (revision >= 1),

    memory jsonb not null default '{"schemaVersion":1,"sessionId":"","about":"","interests":"","notes":"","nextTime":"","updatedAt":0}'::jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    last_active_at timestamptz not null default now(),

    primary key (owner_user_id, id),

    check (length(trim(id)) > 0),
    check (length(trim(name)) > 0),
    check (jsonb_typeof(memory) = 'object')
);

create index if not exists learner_sessions_owner_last_active_idx
    on public.learner_sessions(owner_user_id, last_active_at desc);

create index if not exists learner_sessions_owner_updated_idx
    on public.learner_sessions(owner_user_id, updated_at desc);

drop trigger if exists learner_sessions_set_updated_at
    on public.learner_sessions;

create trigger learner_sessions_set_updated_at
before update on public.learner_sessions
for each row
execute function public.set_updated_at();

alter table public.learner_sessions enable row level security;

revoke all on table public.learner_sessions from anon;

grant select, insert, update, delete
    on table public.learner_sessions
    to authenticated;

drop policy if exists "Users can read their own learner sessions"
    on public.learner_sessions;
drop policy if exists "Users can create their own learner sessions"
    on public.learner_sessions;
drop policy if exists "Users can update their own learner sessions"
    on public.learner_sessions;
drop policy if exists "Users can delete their own learner sessions"
    on public.learner_sessions;

create policy "Users can read their own learner sessions"
on public.learner_sessions
for select
to authenticated
using (auth.uid() = owner_user_id);

create policy "Users can create their own learner sessions"
on public.learner_sessions
for insert
to authenticated
with check (auth.uid() = owner_user_id);

create policy "Users can update their own learner sessions"
on public.learner_sessions
for update
to authenticated
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

create policy "Users can delete their own learner sessions"
on public.learner_sessions
for delete
to authenticated
using (auth.uid() = owner_user_id);

-- Verify
select
    column_name,
    data_type,
    is_nullable,
    column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'learner_sessions'
order by ordinal_position;

select
    policyname,
    cmd
from pg_policies
where schemaname = 'public'
  and tablename = 'learner_sessions'
order by cmd;
