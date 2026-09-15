-- ============================================================
-- Atlas Cloud Foundation — 002
-- Account-owned My Subjects library organisation
-- ============================================================

create table if not exists public.subject_library_state (
    owner_user_id uuid primary key
        default auth.uid()
        references auth.users(id)
        on delete cascade,

    schema_version integer not null default 1
        check (schema_version >= 1),

    revision integer not null default 1
        check (revision >= 1),

    state jsonb not null default '{"library":{},"order":[]}'::jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

drop trigger if exists subject_library_state_set_updated_at
    on public.subject_library_state;

create trigger subject_library_state_set_updated_at
before update on public.subject_library_state
for each row
execute function public.set_updated_at();

alter table public.subject_library_state enable row level security;

revoke all on table public.subject_library_state from anon;
grant select, insert, update, delete
    on table public.subject_library_state
    to authenticated;

drop policy if exists "Users can read their own subject library"
    on public.subject_library_state;
drop policy if exists "Users can create their own subject library"
    on public.subject_library_state;
drop policy if exists "Users can update their own subject library"
    on public.subject_library_state;
drop policy if exists "Users can delete their own subject library"
    on public.subject_library_state;

create policy "Users can read their own subject library"
on public.subject_library_state
for select
to authenticated
using (auth.uid() = owner_user_id);

create policy "Users can create their own subject library"
on public.subject_library_state
for insert
to authenticated
with check (auth.uid() = owner_user_id);

create policy "Users can update their own subject library"
on public.subject_library_state
for update
to authenticated
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

create policy "Users can delete their own subject library"
on public.subject_library_state
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
  and table_name = 'subject_library_state'
order by ordinal_position;

select
    policyname,
    cmd
from pg_policies
where schemaname = 'public'
  and tablename = 'subject_library_state'
order by cmd;
