-- ============================================================
-- Atlas Cloud Foundation — 011
-- Durable signed-in Shared Session Subjects
--
-- Extends the account-level Shared continuity row with the same durable
-- subject-reference collection used by named learners. Existing rows remain
-- explicitly unmigrated until a browser with legacy Shared Session Subjects
-- safely claims them, so a fresh browser cannot seal the account empty.
-- ============================================================

alter table public.shared_continuity_state
    add column if not exists subject_refs jsonb not null default '[]'::jsonb,
    add column if not exists subject_refs_migrated boolean not null default false;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'shared_continuity_state_subject_refs_is_array'
          and conrelid = 'public.shared_continuity_state'::regclass
    ) then
        alter table public.shared_continuity_state
            add constraint shared_continuity_state_subject_refs_is_array
            check (jsonb_typeof(subject_refs) = 'array');
    end if;
end
$$;

-- Existing table-level grants and RLS policies continue to govern these
-- columns. No existing row is marked migrated here; migration is claimed by
-- the browser only when meaningful legacy Shared Session Subjects exist.
