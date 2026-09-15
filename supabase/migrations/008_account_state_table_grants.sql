-- ============================================================
-- Atlas Cloud Foundation — 008
-- Account state table access grants
--
-- Grants authenticated Atlas clients the CRUD privileges required for the
-- RLS-protected account-state tables introduced in 006 and 007. Anonymous
-- clients receive no table access.
-- ============================================================

revoke all on table public.original_curation_state from anon;
grant select, insert, update, delete
    on table public.original_curation_state
    to authenticated;

revoke all on table public.hub_personalization_state from anon;
grant select, insert, update, delete
    on table public.hub_personalization_state
    to authenticated;
