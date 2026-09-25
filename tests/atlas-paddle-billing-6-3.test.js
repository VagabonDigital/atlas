'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const worker = fs.readFileSync('shared/worker.js', 'utf8');
const pricing = fs.readFileSync('pricing/index.html', 'utf8');
const checkout = fs.readFileSync('shared/atlas-pro-checkout.js', 'utf8');
const subscription = fs.readFileSync(
  'account/subscription/index.html',
  'utf8'
);
const config = fs.readFileSync('shared/atlas-paddle-config.js', 'utf8');
const migration = fs.readFileSync(
  'supabase/migrations/020_paddle_billing_foundation.sql',
  'utf8'
);

assert.match(worker, /url\.pathname === '\/paddle\/webhook'/);
assert.match(worker, /Paddle-Signature/);
assert.match(worker, /crypto\.subtle\.importKey/);
assert.match(worker, /crypto\.subtle\.sign/);
assert.match(worker, /\`\$\{timestamp\}:\$\{rawBody\}\`/);
assert.match(worker, /Math\.abs\([\s\S]*nowSeconds - unixTime[\s\S]*\) > 5/);
assert.match(worker, /timestamp_out_of_tolerance/);
assert.match(worker, /hmac_mismatch/);
assert.match(
  worker,
  /diagnostic:[\s\S]*environment:[\s\S]*paddleEnvironment[\s\S]*reason:/
);
assert.match(worker, /ATLAS_PADDLE_WEBHOOK_SECRET/);
assert.match(worker, /ATLAS_PADDLE_LIVE_WEBHOOK_SECRET/);
assert.match(worker, /ATLAS_PADDLE_API_KEY/);
assert.match(worker, /ATLAS_PADDLE_LIVE_API_KEY/);
assert.match(worker, /ATLAS_PADDLE_ENVIRONMENT/);
assert.match(
  worker,
  /paddleEnvironment === 'live'[\s\S]*ATLAS_PADDLE_LIVE_API_KEY/
);
assert.match(
  worker,
  /paddleEnvironment === 'live'[\s\S]*ATLAS_PADDLE_LIVE_WEBHOOK_SECRET/
);
assert.match(worker, /atlas_apply_paddle_event_v1/);
assert.match(worker, /transaction\.completed/);
assert.match(worker, /Atlas Pro is active\./);
assert.match(worker, /100 fresh subject creations each billing month/);
assert.doesNotMatch(worker, /You’re in\./);
assert.match(worker, /eventType\.startsWith\([\s\S]*'subscription\.'/);
assert.match(
  worker,
  /request\.text\(\)[\s\S]*verifyPaddleWebhookSignature[\s\S]*JSON\.parse\(rawBody\)/,
  'Paddle raw body must be verified before JSON parsing.'
);

assert.match(config, /const environment = 'live'/);
assert.match(
  config,
  /sandbox:[\s\S]*clientToken:[\s\S]*'test_4daba62599c4c2a77ca0bed2f0e'[\s\S]*proMonthly:[\s\S]*'pri_01m32eh22evm0xjtcrm71yndnx'/
);
assert.match(
  config,
  /live:[\s\S]*clientToken:[\s\S]*'live_[^']+'[\s\S]*proMonthly:[\s\S]*'pri_01m3apem2h7h1g2bt44j2hnxqp'/
);
assert.match(
  config,
  /environment === 'sandbox'[\s\S]*selected\?\.clientToken[\s\S]*\?\.startsWith\('test_'\)/
);
assert.match(
  config,
  /environment === 'live'[\s\S]*selected\?\.clientToken[\s\S]*\?\.startsWith\('live_'\)/
);
assert.match(
  checkout,
  /config\.environment ===[\s\S]*'sandbox'[\s\S]*Paddle\.Environment\.set\([\s\S]*'sandbox'/
);
assert.match(
  subscription,
  /config\.environment === 'sandbox'[\s\S]*Paddle\.Environment\.set\([\s\S]*'sandbox'/
);
assert.match(
  worker,
  /environment === 'sandbox'[\s\S]*'https:\/\/sandbox-api\.paddle\.com'[\s\S]*'https:\/\/api\.paddle\.com'/
);
assert.match(
  pricing,
  /atlas-pro-checkout\.js\?v=20260925-checkoutresume1/
);
assert.match(
  checkout,
  /atlas-paddle-config\.js\?v=20260924-live1/
);
assert.match(
  subscription,
  /atlas-paddle-config\.js\?v=20260924-live1/
);
assert.match(
  checkout,
  /\.atlas-pro-checkout-body \{[\s\S]*?overflow-y: auto;[\s\S]*?<div class="atlas-pro-checkout-body">\s*<header class="atlas-pro-checkout-head">/,
  'Upgrade checkout header must live inside the scrolling checkout body so backdrop-filter samples moving content.'
);
assert.match(
  checkout,
  /\.atlas-pro-checkout-head \{[\s\S]*?position: sticky;[\s\S]*?top: 0;[\s\S]*?z-index: 3;[\s\S]*?color-mix\([\s\S]*?72%[\s\S]*?transparent[\s\S]*?backdrop-filter:[\s\S]*?blur\(16px\) saturate\(1\.1\)/,
  'Upgrade checkout desktop header must match the Inside Atlas 72% / 16px / 1.1 glass recipe.'
);
assert.match(
  checkout,
  /@media \(max-width: 760px\)[\s\S]*?\.atlas-pro-checkout-head \{[\s\S]*?color-mix\([\s\S]*?72%[\s\S]*?transparent[\s\S]*?backdrop-filter:[\s\S]*?blur\(16px\) saturate\(1\.1\)/,
  'Upgrade checkout mobile header must match the Inside Atlas glass recipe too.'
);
assert.match(
  checkout,
  /\.atlas-pro-checkout-close-arrow \{[\s\S]*?width: 16px;[\s\S]*?height: 16px;[\s\S]*?font-size: 0;[\s\S]*?-webkit-mask: url\([\s\S]*?M7 3L2 8l5 5M2 8h12/,
  'Upgrade checkout must use the drawn Atlas back arrow rather than the Unicode arrow glyph.'
);
assert.match(
  subscription,
  /--payment-update-canvas:\s*#eceff3;[\s\S]*?--payment-update-header-surface:\s*#f7f8fa;/,
  'Update Payment must retain the cool-grey checkout canvas and header palette.'
);

assert.match(
  subscription,
  /\.brand h1 \{[\s\S]*?font-family: "DM Serif Display", Georgia, serif;[\s\S]*?\.payment-update-summary h2 \{[\s\S]*?font-family: "DM Serif Display", Georgia, serif;[\s\S]*?\.payment-update-success h2 \{[\s\S]*?font-family: "DM Serif Display", Georgia, serif;[\s\S]*?\.error h2 \{[\s\S]*?font-family: "DM Serif Display", Georgia, serif;/,
  'Subscription and payment-update major headings must use the canonical Atlas display typeface.'
);

assert.doesNotMatch(
  subscription,
  /font-family: Georgia, "Times New Roman", serif;/,
  'Subscription must not reintroduce the foreign plain-Georgia heading stack.'
);
assert.match(
  subscription,
  /\.payment-update \{[\s\S]*?background: var\(--payment-update-canvas\);/,
  'Update Payment must use its own checkout-grey canvas without changing the surrounding Subscription page.'
);
assert.match(
  subscription,
  /\.payment-update-body \{[\s\S]*?overflow-y: auto;[\s\S]*?<header class="payment-update-head">/,
  'Update Payment header must live inside the scrolling layer so backdrop-filter samples moving content.'
);
assert.match(
  subscription,
  /\.payment-update-head \{[\s\S]*?position: sticky;[\s\S]*?top: 0;[\s\S]*?z-index: 3;[\s\S]*?color-mix\(in srgb, var\(--payment-update-header-surface\) 72%, transparent\)[\s\S]*?backdrop-filter: blur\(16px\) saturate\(1\.1\)/,
  'Update Payment desktop header must match the Inside Atlas 72% / 16px / 1.1 glass recipe.'
);
assert.match(
  subscription,
  /@media \(max-width: 620px\)[\s\S]*?\.payment-update-head \{[\s\S]*?color-mix\(in srgb, var\(--payment-update-header-surface\) 72%, transparent\)[\s\S]*?backdrop-filter: blur\(16px\) saturate\(1\.1\)/,
  'Update Payment mobile header must match the Inside Atlas glass recipe too.'
);
assert.match(
  subscription,
  /\.payment-update-back \{[\s\S]*?gap: 5px;[\s\S]*?color: var\(--muted\);[\s\S]*?font: 600 \.9rem\/1\.2 "DM Sans", system-ui, sans-serif;/,
  'Update Payment back control must match the Upgrade checkout Back to Atlas styling.'
);
assert.match(
  subscription,
  /\.payment-update-back-arrow \{[\s\S]*?width: 16px;[\s\S]*?height: 16px;[\s\S]*?font-size: 0;[\s\S]*?-webkit-mask: url\([\s\S]*?M7 3L2 8l5 5M2 8h12/,
  'Update Payment must use the same drawn Atlas back arrow as Upgrade checkout.'
);
assert.match(
  subscription,
  /aria-label="Back to Subscription"[\s\S]*?<span>Back to Subscription<\/span>/,
  'Update Payment back control must retain Subscription as the destination label.'
);

assert.match(
  checkout,
  /checkoutState[\s\S]*?restoreRecoverableCheckout[\s\S]*?scheduleRecoverableCheckoutRestore/,
  'Upgrade checkout must recover the active purchase journey after refresh.'
);

assert.match(
  subscription,
  /paymentState[\s\S]*?setPaymentUpdateIntent\(true\)[\s\S]*?hasPaymentUpdateIntent\(\)[\s\S]*?await updatePaymentMethod\(\)/,
  'Update Payment must preserve intent across refresh and rebuild a fresh Paddle transaction.'
);
assert.match(
  subscription,
  /\.payment-update-back-arrow \{[\s\S]*?width: 16px;[\s\S]*?height: 16px;[\s\S]*?font-size: 0;[\s\S]*?-webkit-mask: url\([\s\S]*?M7 3L2 8l5 5M2 8h12/,
  'Update Payment must use the same drawn Atlas back arrow as the Upgrade checkout.'
);
assert.doesNotMatch(
  pricing + checkout + subscription,
  /20260921-sandbox1/
);

assert.match(checkout, /atlas_checkout_environment:[\s\S]*config\.environment/);
assert.match(checkout, /atlas_user_id:[\s\S]*account\.userId/);
assert.doesNotMatch(
  pricing,
  /Paddle\.Checkout\.open/,
  'Pricing must delegate checkout ownership to the shared Paddle runtime.'
);

assert.match(migration, /private\.paddle_billing_policy/);
assert.match(migration, /private\.paddle_billing_events/);
assert.match(migration, /private\.paddle_subscriptions/);
assert.match(migration, /private\.paddle_account_state/);
assert.match(migration, /'sandbox',[\s\S]*'pri_01m32eh22evm0xjtcrm71yndnx',[\s\S]*false/);
assert.match(migration, /on conflict \(environment, event_id\)[\s\S]*do nothing/);
assert.match(migration, /v_occurred_at < v_existing_occurred_at/);
assert.match(migration, /revoke all on function public\.atlas_apply_paddle_event_v1/);
assert.match(migration, /grant execute on function public\.atlas_apply_paddle_event_v1[\s\S]*to service_role/);

console.log(
  'Atlas Paddle 6.3 contract passed: signed raw webhooks, private billing mirror, idempotency, stale-event protection, and sandbox entitlement safety are present.'
);
