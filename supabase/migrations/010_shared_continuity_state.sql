-- ============================================================
-- Atlas Cloud Foundation — 010
-- Durable signed-in Shared teaching continuity
--
-- Persists the same durable teaching state as named learner continuity,
-- but for the account-level Shared context rather than a learner session.
-- Anonymous Shared remains browser-local.
-- ============================================================

create table if not exists public.shared_continuity_state (
    owner_user_id uuid primary key
        references auth.users(id)
        on delete cascade,

    schema_version integer not null default 1
        check (schema_version >= 1),

    revision integer not null default 1
        check (revision >= 1),

    state jsonb not null default '{"schemaVersion":1,"sessionStates":{},"ledgerEntries":{},"handoffs":{},"recentActivity":[],"languageReviewCompletedThrough":-1}'::jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint shared_continuity_state_is_object
        check (jsonb_typeof(state) = 'object')
);

drop trigger if exists shared_continuity_state_set_updated_at
    on public.shared_continuity_state;

create trigger shared_continuity_state_set_updated_at
before update on public.shared_continuity_state
for each row
execute function public.set_updated_at();

alter table public.shared_continuity_state
    enable row level security;

revoke all on table public.shared_continuity_state from anon;
grant select, insert, update, delete
    on table public.shared_continuity_state
    to authenticated;

drop policy if exists shared_continuity_state_select_own
    on public.shared_continuity_state;
create policy shared_continuity_state_select_own
    on public.shared_continuity_state
    for select
    to authenticated
    using (auth.uid() = owner_user_id);

drop policy if exists shared_continuity_state_insert_own
    on public.shared_continuity_state;
create policy shared_continuity_state_insert_own
    on public.shared_continuity_state
    for insert
    to authenticated
    with check (auth.uid() = owner_user_id);

drop policy if exists shared_continuity_state_update_own
    on public.shared_continuity_state;
create policy shared_continuity_state_update_own
    on public.shared_continuity_state
    for update
    to authenticated
    using (auth.uid() = owner_user_id)
    with check (auth.uid() = owner_user_id);

drop policy if exists shared_continuity_state_delete_own
    on public.shared_continuity_state;
create policy shared_continuity_state_delete_own
    on public.shared_continuity_state
    for delete
    to authenticated
    using (auth.uid() = owner_user_id);

-- No row is pre-seeded. A signed-in browser carrying meaningful legacy
-- Shared teaching state may claim the first row. A fresh browser with no
-- Shared continuity does not seal the account empty.
