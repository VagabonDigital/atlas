'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const worker = fs.readFileSync('shared/worker.js', 'utf8');
const pricing = fs.readFileSync('pricing/index.html', 'utf8');
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
assert.match(worker, /ATLAS_PADDLE_ENVIRONMENT/);
assert.match(worker, /atlas_apply_paddle_event_v1/);
assert.match(worker, /transaction\.completed/);
assert.match(worker, /eventType\.startsWith\([\s\S]*'subscription\.'/);
assert.match(
  worker,
  /request\.text\(\)[\s\S]*verifyPaddleWebhookSignature[\s\S]*JSON\.parse\(rawBody\)/,
  'Paddle raw body must be verified before JSON parsing.'
);

assert.match(config, /environment: 'sandbox'/);
assert.match(config, /proMonthly: 'pri_01m32eh22evm0xjtcrm71yndnx'/);

assert.match(pricing, /atlas_checkout_environment: config\.environment/);
assert.match(pricing, /atlas_user_id: account\.userId/);

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
