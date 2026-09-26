-- ============================================================
-- Atlas Cloud Foundation — 030
-- Compass suggestion history
--
-- Durable account-owned discovery memory for signed-in tutors.
-- Stores only a bounded rolling set of suggestion titles per mode.
-- Browser state remains a cache; this row is authoritative across devices.
-- ============================================================

create table if not exists public.compass_suggestion_state (
    owner_user_id uuid primary key
        references auth.users(id)
        on delete cascade,
    schema_version integer not null default 1,
    revision integer not null default 1,
    state jsonb not null default '{"schemaVersion":1,"historyByMode":{}}'::jsonb,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    constraint compass_suggestion_state_revision_positive
        check (revision >= 1),
    constraint compass_suggestion_state_is_object
        check (jsonb_typeof(state) = 'object')
);

alter table public.compass_suggestion_state
    enable row level security;

drop policy if exists compass_suggestion_state_select_own
    on public.compass_suggestion_state;
create policy compass_suggestion_state_select_own
    on public.compass_suggestion_state
    for select
    to authenticated
    using ((select auth.uid()) = owner_user_id);

drop policy if exists compass_suggestion_state_insert_own
    on public.compass_suggestion_state;
create policy compass_suggestion_state_insert_own
    on public.compass_suggestion_state
    for insert
    to authenticated
    with check ((select auth.uid()) = owner_user_id);

drop policy if exists compass_suggestion_state_update_own
    on public.compass_suggestion_state;
create policy compass_suggestion_state_update_own
    on public.compass_suggestion_state
    for update
    to authenticated
    using ((select auth.uid()) = owner_user_id)
    with check ((select auth.uid()) = owner_user_id);

drop policy if exists compass_suggestion_state_delete_own
    on public.compass_suggestion_state;
create policy compass_suggestion_state_delete_own
    on public.compass_suggestion_state
    for delete
    to authenticated
    using ((select auth.uid()) = owner_user_id);

revoke all on table public.compass_suggestion_state from anon;
grant select, insert, update, delete
    on table public.compass_suggestion_state
    to authenticated;
