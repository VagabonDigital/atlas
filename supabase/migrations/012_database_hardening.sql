-- ============================================================
-- Atlas Cloud Foundation — 012
-- Database privilege hardening
--
-- Keeps the existing account-owned schema and RLS policies unchanged while
-- tightening the SQL privileges exposed to browser roles.
-- ============================================================

-- Atlas clients only need ordinary CRUD. Supabase's default table grants can
-- also include TRUNCATE, REFERENCES, TRIGGER and MAINTAIN-style privileges;
-- remove those from the browser roles on every current account-owned table.
revoke all privileges on table
    public.owned_subjects,
    public.subject_library_state,
    public.tutor_content_versions,
    public.learner_sessions,
    public.original_curation_state,
    public.hub_personalization_state,
    public.learner_continuity_state,
    public.shared_continuity_state
from anon, authenticated;

grant select, insert, update, delete on table
    public.owned_subjects,
    public.subject_library_state,
    public.tutor_content_versions,
    public.learner_sessions,
    public.original_curation_state,
    public.hub_personalization_state,
    public.learner_continuity_state,
    public.shared_continuity_state
to authenticated;

-- Anonymous Atlas remains browser-local and receives no durable account-table
-- privileges. Reassert RLS explicitly as defense in depth.
alter table public.owned_subjects enable row level security;
alter table public.subject_library_state enable row level security;
alter table public.tutor_content_versions enable row level security;
alter table public.learner_sessions enable row level security;
alter table public.original_curation_state enable row level security;
alter table public.hub_personalization_state enable row level security;
alter table public.learner_continuity_state enable row level security;
alter table public.shared_continuity_state enable row level security;

-- Future Atlas migrations run as postgres and should opt browser roles into
-- only the privileges they actually need, rather than inheriting broad table
-- defaults automatically.
alter default privileges for role postgres in schema public
    revoke all on tables from anon, authenticated;

-- This event-trigger function is useful as a DDL safety net: it automatically
-- enables RLS on newly-created public tables. It is not an application RPC and
-- must not be callable through the exposed API roles.
revoke execute on function public.rls_auto_enable()
    from PUBLIC, anon, authenticated;
