-- ============================================================
-- Atlas Cloud Foundation — 013
-- Server-owned account entitlement foundation
--
-- Adds the minimal account-level source for plan/capability state without
-- introducing billing, quota enforcement or product gating. Missing rows are
-- intentionally interpreted by Atlas as the Free baseline.
-- ============================================================

create table if not exists public.account_entitlements (
    owner_user_id uuid primary key
        references auth.users(id)
        on delete cascade,
    schema_version integer not null default 1,
    plan_code text not null default 'free',
    capabilities jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    constraint account_entitlements_schema_version_positive
        check (schema_version >= 1),
    constraint account_entitlements_plan_code_present
        check (length(trim(plan_code)) > 0 and length(plan_code) <= 64),
    constraint account_entitlements_capabilities_object
        check (jsonb_typeof(capabilities) = 'object')
);

alter table public.account_entitlements
    enable row level security;

-- Entitlements are server-owned. Browser clients may read only their own row;
-- they cannot create, upgrade, downgrade or otherwise mutate entitlement data.
revoke all privileges on table public.account_entitlements
    from anon, authenticated;
grant select on table public.account_entitlements
    to authenticated;

drop policy if exists account_entitlements_select_own
    on public.account_entitlements;
create policy account_entitlements_select_own
    on public.account_entitlements
    for select
    to authenticated
    using ((select auth.uid()) = owner_user_id);

-- Do not seed Free rows. A missing row is the durable Free baseline, while a
-- future billing/admin service can create a row only when an account needs an
-- explicit entitlement or capability override.
