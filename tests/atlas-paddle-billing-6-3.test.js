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
  /atlas-pro-checkout\.js\?v=20260924-valuecopy3/
);
assert.match(
  checkout,
  /atlas-paddle-config\.js\?v=20260924-live1/
);
assert.match(
  subscription,
  /atlas-paddle-config\.js\?v=20260924-live1/
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
