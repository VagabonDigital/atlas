-- ============================================================
-- Atlas Cloud Foundation — 001
-- First durable account-owned object: My Subjects
-- ============================================================

create table if not exists public.owned_subjects (
    id text primary key,

    owner_user_id uuid not null
        default auth.uid()
        references auth.users(id)
        on delete cascade,

    schema_version integer not null default 1
        check (schema_version >= 1),

    format text not null default 'structured'
        check (format = 'structured'),

    metadata jsonb not null default '{}'::jsonb,
    document jsonb not null,

    revision integer not null default 1
        check (revision >= 1),

    provenance jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists owned_subjects_owner_updated_at_idx
    on public.owned_subjects(owner_user_id, updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists owned_subjects_set_updated_at
    on public.owned_subjects;

create trigger owned_subjects_set_updated_at
before update on public.owned_subjects
for each row
execute function public.set_updated_at();

alter table public.owned_subjects enable row level security;

revoke all on table public.owned_subjects from anon;
grant select, insert, update, delete
    on table public.owned_subjects
    to authenticated;

drop policy if exists "Users can read their own subjects"
    on public.owned_subjects;
drop policy if exists "Users can create their own subjects"
    on public.owned_subjects;
drop policy if exists "Users can update their own subjects"
    on public.owned_subjects;
drop policy if exists "Users can delete their own subjects"
    on public.owned_subjects;

create policy "Users can read their own subjects"
on public.owned_subjects
for select
to authenticated
using (auth.uid() = owner_user_id);

create policy "Users can create their own subjects"
on public.owned_subjects
for insert
to authenticated
with check (auth.uid() = owner_user_id);

create policy "Users can update their own subjects"
on public.owned_subjects
for update
to authenticated
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

create policy "Users can delete their own subjects"
on public.owned_subjects
for delete
to authenticated
using (auth.uid() = owner_user_id);
