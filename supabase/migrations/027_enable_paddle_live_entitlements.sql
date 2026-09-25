-- ============================================================
-- Atlas Commercial System — 027
-- Enable Paddle live entitlements
--
-- Activates entitlement grants for the staged Atlas Pro Live price.
-- Public checkout remains independently controlled by the frontend
-- Paddle environment switch.
-- ============================================================

update private.paddle_billing_policy
set
    grants_entitlements = true,
    updated_at = timezone('utc', now())
where environment = 'live'
  and pro_price_id = 'pri_01m3apem2h7h1g2bt44j2hnxqp';
