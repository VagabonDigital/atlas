-- ============================================================
-- Atlas Cloud Foundation — 003
-- Account-owned committed Tutor Content / My Versions
-- ============================================================

create table if not exists public.tutor_content_versions (
    owner_user_id uuid not null
        default auth.uid()
        references auth.users(id)
        on delete cascade,

    content_id text not null,

    schema_version integer not null default 2
        check (schema_version >= 1),

    base_content_version text not null default '',

    revision integer not null default 0
        check (revision >= 0),

    overrides jsonb not null default '{}'::jsonb,
    document jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    primary key (owner_user_id, content_id),

    check (length(trim(content_id)) > 0),
    check (jsonb_typeof(overrides) = 'object'),
    check (jsonb_typeof(document) = 'object')
);

create index if not exists tutor_content_versions_owner_updated_at_idx
    on public.tutor_content_versions(owner_user_id, updated_at desc);

create index if not exists tutor_content_versions_content_id_idx
    on public.tutor_content_versions(content_id);

drop trigger if exists tutor_content_versions_set_updated_at
    on public.tutor_content_versions;

create trigger tutor_content_versions_set_updated_at
before update on public.tutor_content_versions
for each row
execute function public.set_updated_at();

alter table public.tutor_content_versions enable row level security;

revoke all on table public.tutor_content_versions from anon;
grant select, insert, update, delete
    on table public.tutor_content_versions
    to authenticated;

drop policy if exists "Users can read their own tutor content versions"
    on public.tutor_content_versions;
drop policy if exists "Users can create their own tutor content versions"
    on public.tutor_content_versions;
drop policy if exists "Users can update their own tutor content versions"
    on public.tutor_content_versions;
drop policy if exists "Users can delete their own tutor content versions"
    on public.tutor_content_versions;

create policy "Users can read their own tutor content versions"
on public.tutor_content_versions
for select
to authenticated
using (auth.uid() = owner_user_id);

create policy "Users can create their own tutor content versions"
on public.tutor_content_versions
for insert
to authenticated
with check (auth.uid() = owner_user_id);

create policy "Users can update their own tutor content versions"
on public.tutor_content_versions
for update
to authenticated
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

create policy "Users can delete their own tutor content versions"
on public.tutor_content_versions
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
  and table_name = 'tutor_content_versions'
order by ordinal_position;

select
    policyname,
    cmd
from pg_policies
where schemaname = 'public'
  and tablename = 'tutor_content_versions'
order by cmd;
