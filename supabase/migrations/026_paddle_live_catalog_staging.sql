-- ============================================================
-- Atlas Commercial System — 026
-- Paddle live catalog staging
--
-- Registers the production Atlas Pro price ahead of cutover while keeping
-- entitlement grants disabled until the Worker and webhook credentials are
-- switched to Paddle Live together.
-- ============================================================

insert into private.paddle_billing_policy (
    environment,
    pro_price_id,
    grants_entitlements
)
values (
    'live',
    'pri_01m3apem2h7h1g2bt44j2hnxqp',
    false
)
on conflict (environment)
do update set
    pro_price_id = excluded.pro_price_id,
    grants_entitlements = false,
    updated_at = timezone('utc', now());
