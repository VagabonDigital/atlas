-- ============================================================
-- Atlas Cloud Foundation — 009
-- Durable named-learner teaching continuity
--
-- Persists account-owned teaching state that already flows through
-- AtlasBridge: Compass/Arcade progress, game answers, saved language,
-- Wrap Up handoffs, recent activity, and Saved Language review completion.
-- Shared/default remains browser-local.
-- ============================================================

create table if not exists public.learner_continuity_state (
    owner_user_id uuid not null
        default auth.uid()
        references auth.users(id)
        on delete cascade,

    session_id text not null,

    schema_version integer not null default 1
        check (schema_version >= 1),

    revision integer not null default 1
        check (revision >= 1),

    state jsonb not null default '{"schemaVersion":1,"sessionStates":{},"ledgerEntries":{},"handoffs":{},"recentActivity":[],"languageReviewCompletedThrough":-1}'::jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    primary key (owner_user_id, session_id),

    constraint learner_continuity_state_session_fk
        foreign key (owner_user_id, session_id)
        references public.learner_sessions(owner_user_id, id)
        on delete cascade,

    constraint learner_continuity_state_is_object
        check (jsonb_typeof(state) = 'object')
);

create index if not exists learner_continuity_state_owner_updated_at_idx
    on public.learner_continuity_state(owner_user_id, updated_at desc);

drop trigger if exists learner_continuity_state_set_updated_at
    on public.learner_continuity_state;

create trigger learner_continuity_state_set_updated_at
before update on public.learner_continuity_state
for each row
execute function public.set_updated_at();

alter table public.learner_continuity_state
    enable row level security;

revoke all on table public.learner_continuity_state from anon;
grant select, insert, update, delete
    on table public.learner_continuity_state
    to authenticated;

drop policy if exists learner_continuity_state_select_own
    on public.learner_continuity_state;
create policy learner_continuity_state_select_own
    on public.learner_continuity_state
    for select
    to authenticated
    using (auth.uid() = owner_user_id);

drop policy if exists learner_continuity_state_insert_own
    on public.learner_continuity_state;
create policy learner_continuity_state_insert_own
    on public.learner_continuity_state
    for insert
    to authenticated
    with check (auth.uid() = owner_user_id);

drop policy if exists learner_continuity_state_update_own
    on public.learner_continuity_state;
create policy learner_continuity_state_update_own
    on public.learner_continuity_state
    for update
    to authenticated
    using (auth.uid() = owner_user_id)
    with check (auth.uid() = owner_user_id);

drop policy if exists learner_continuity_state_delete_own
    on public.learner_continuity_state;
create policy learner_continuity_state_delete_own
    on public.learner_continuity_state
    for delete
    to authenticated
    using (auth.uid() = owner_user_id);

-- No rows are pre-seeded. An authenticated browser with meaningful legacy
-- named-learner continuity may claim the first row for that learner. Fresh
-- browsers do not create empty rows, so they cannot seal out an older browser
-- that still holds pre-account progress.
