-- ============================================================
-- Atlas Cloud Foundation — 007
-- Learner welcome images and saved favourites continuity
--
-- Persists Atlas Hub personalization for signed-in tutors:
-- - per-session welcome / atmosphere image URLs
-- - account-level saved image favourites
--
-- The application keeps a local cache for fast rendering, while this row
-- is the durable account authority across browsers and devices.
-- ============================================================

create table if not exists public.hub_personalization_state (
    owner_user_id uuid primary key
        references auth.users(id)
        on delete cascade,
    schema_version integer not null default 1,
    revision integer not null default 1,
    state jsonb not null default '{"schemaVersion":1,"sessionImages":{},"favoriteImages":[]}'::jsonb,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    constraint hub_personalization_state_revision_positive
        check (revision >= 1),
    constraint hub_personalization_state_is_object
        check (jsonb_typeof(state) = 'object')
);

alter table public.hub_personalization_state
    enable row level security;

drop policy if exists hub_personalization_state_select_own
    on public.hub_personalization_state;
create policy hub_personalization_state_select_own
    on public.hub_personalization_state
    for select
    to authenticated
    using (auth.uid() = owner_user_id);

drop policy if exists hub_personalization_state_insert_own
    on public.hub_personalization_state;
create policy hub_personalization_state_insert_own
    on public.hub_personalization_state
    for insert
    to authenticated
    with check (auth.uid() = owner_user_id);

drop policy if exists hub_personalization_state_update_own
    on public.hub_personalization_state;
create policy hub_personalization_state_update_own
    on public.hub_personalization_state
    for update
    to authenticated
    using (auth.uid() = owner_user_id)
    with check (auth.uid() = owner_user_id);

drop policy if exists hub_personalization_state_delete_own
    on public.hub_personalization_state;
create policy hub_personalization_state_delete_own
    on public.hub_personalization_state
    for delete
    to authenticated
    using (auth.uid() = owner_user_id);

-- Existing accounts intentionally receive no row here. A signed-in legacy
-- browser carrying real local welcome-image or favourite state may claim the
-- first row. A fresh browser with an empty cache does not seal the account
-- empty, so older browsers can still contribute their pre-account state once.
