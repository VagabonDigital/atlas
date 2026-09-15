-- ============================================================
-- Atlas Cloud Foundation — 006
-- Atlas Original curation continuity
--
-- Persists per-account archive/delete/order state for canonical
-- Atlas Originals so signed-in tutors keep the same Compass curation
-- across browsers and devices.
-- ============================================================

create table if not exists public.original_curation_state (
    owner_user_id uuid primary key
        references auth.users(id)
        on delete cascade,
    schema_version integer not null default 2,
    revision integer not null default 1,
    state jsonb not null default '{"schemaVersion":2,"items":{},"order":[]}'::jsonb,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    constraint original_curation_state_revision_positive
        check (revision >= 1),
    constraint original_curation_state_is_object
        check (jsonb_typeof(state) = 'object')
);

alter table public.original_curation_state
    enable row level security;

drop policy if exists original_curation_state_select_own
    on public.original_curation_state;
create policy original_curation_state_select_own
    on public.original_curation_state
    for select
    to authenticated
    using (auth.uid() = owner_user_id);

drop policy if exists original_curation_state_insert_own
    on public.original_curation_state;
create policy original_curation_state_insert_own
    on public.original_curation_state
    for insert
    to authenticated
    with check (auth.uid() = owner_user_id);

drop policy if exists original_curation_state_update_own
    on public.original_curation_state;
create policy original_curation_state_update_own
    on public.original_curation_state
    for update
    to authenticated
    using (auth.uid() = owner_user_id)
    with check (auth.uid() = owner_user_id);

drop policy if exists original_curation_state_delete_own
    on public.original_curation_state;
create policy original_curation_state_delete_own
    on public.original_curation_state
    for delete
    to authenticated
    using (auth.uid() = owner_user_id);

-- Existing accounts intentionally receive no row here. On first load,
-- an authenticated legacy browser with local Atlas Original curation can
-- claim that state once. Otherwise the first future curation mutation
-- creates the account-owned row.
