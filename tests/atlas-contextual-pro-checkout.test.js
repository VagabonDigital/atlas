'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const gate = fs.readFileSync(
  'shared/atlas-account-gate.js',
  'utf8'
);
const checkout = fs.readFileSync(
  'shared/atlas-pro-checkout.js',
  'utf8'
);
const chrome = fs.readFileSync(
  'shared/atlas-account-chrome.js',
  'utf8'
);
const registry = fs.readFileSync(
  'shared/atlas-content-registry.js',
  'utf8'
);
const pricing = fs.readFileSync(
  'pricing/index.html',
  'utf8'
);
const compass = fs.readFileSync(
  'compass/index.html',
  'utf8'
);

assert.doesNotMatch(
  gate,
  /pricing\/\?checkout=pro/
);

assert.match(
  gate,
  /data-account-menu-upgrade[\s\S]*?Upgrade to Pro · \$12\/month/
);

assert.match(
  gate,
  /data-account-menu-pricing[\s\S]*?View pricing/
);

assert.match(
  gate,
  /openProCheckoutFromAccount[\s\S]*?Checkout\.open\(\{[\s\S]*?source:[\s\S]*?'account-menu'/
);

assert.match(
  gate,
  /function getPricingHref\(\)[\s\S]*?world === 'compass'[\s\S]*?world === 'arcade'/
);

assert.match(
  checkout,
  /Paddle\.Checkout[\s\S]*?\.open\(\{/
);

assert.match(
  checkout,
  /name ===[\s\S]*?'checkout\.completed'[\s\S]*?Checkout[\s\S]*?close/
);

assert.match(
  checkout,
  /Welcome to Atlas Pro/
);

assert.match(
  checkout,
  /100 fresh subject creations each billing month/
);

assert.match(
  checkout,
  /name === 'checkout\.closed'[\s\S]*?!activeCheckout\.completed/
);

assert.match(
  chrome,
  /atlas-account-gate\.js\?v=20260923-procheckout2/
);

assert.match(
  registry,
  /atlas-account-chrome\.js\?v=20260923-procheckout2/
);

assert.match(
  pricing,
  /data-atlas-pro-activation/
);

assert.match(
  pricing,
  /Paddle\.Checkout\.close\(\)/
);

assert.match(
  pricing,
  /getPricingReturnDestination[\s\S]*?Return to Compass[\s\S]*?Return to Arcade[\s\S]*?Return to Inside Atlas[\s\S]*?Return to Atlas/
);

assert.match(
  pricing,
  /Welcome to Atlas Pro/
);

assert.match(
  compass,
  /atlas-pro-checkout\.js\?v=20260923-contextual1/
);

assert.match(
  compass,
  /Free · \$\{resolved\.remaining\} left/
);


assert.match(
  compass,
  /resolved\.tier === 'free'[\s\S]*?resolved\.remaining <= 3/
);

assert.match(
  compass,
  /resolved\.tier === 'pro'[\s\S]*?resolved\.remaining <= 10/
);

assert.match(
  compass,
  /Pro · \$\{resolved\.remaining\} left · resets \$\{resolved\.resetLabel\}/
);

assert.match(
  compass,
  /Free creations used/
);

assert.match(
  compass,
  /Monthly creations used/
);

assert.match(
  compass,
  /owned-subject-dialog-allowance-status/
);


assert.match(
  compass,
  /owned-subject-dialog-allowance-label">Creation allowance/
);

assert.match(
  compass,
  /owned-subject-dialog-allowance-value/
);

assert.match(
  compass,
  /owned-subject-dialog-actions[\s\S]*?align-items: flex-end;/
);

assert.match(
  compass,
  /@media \(max-width: 680px\)[\s\S]*?owned-subject-dialog-allowance-status[\s\S]*?width: 100%;/
);

assert.doesNotMatch(
  compass,
  /owned-subject-dialog-upgrade\.is-allowance/
);


assert.match(
  compass,
  /--allowance-low-text: #9a6a2f/
);

assert.match(
  compass,
  /--allowance-low-text: #d6a766/
);

assert.match(
  compass,
  /owned-subject-dialog-allowance-status\.is-low[\s\S]*?var\(--allowance-low-text\)/
);

assert.match(
  compass,
  /resolved\.remaining <= 2[\s\S]*?classList\.add\([\s\S]*?'is-low'/
);

assert.match(
  compass,
  /resolved\.tier === 'pro'[\s\S]*?resolved\.remaining <= 10[\s\S]*?resolved\.remaining <= 5[\s\S]*?classList\.add\([\s\S]*?'is-low'/
);

assert.match(
  compass,
  /owned-subject-dialog-action-buttons \.btn-primary,[\s\S]*?white-space: nowrap;/
);

assert.match(
  compass,
  /@media \(max-width: 680px\)[\s\S]*?owned-subject-dialog-action-buttons[\s\S]*?width: 100%;[\s\S]*?margin-left: 0;/
);

assert.match(
  compass,
  /owned-subject-dialog-action-buttons \.btn-primary,[\s\S]*?flex: 1 1 auto;[\s\S]*?min-width: max-content;/
);

assert.match(
  compass,
  /upgradePrompt =\s*'pro-exhausted'[\s\S]*?confirm\.hidden = true/
);

assert.match(
  compass,
  /Upgrade to Pro · \$12\/month/
);

assert.match(
  compass,
  /source:\s*'compass-create'/
);

assert.doesNotMatch(
  compass,
  /openCompassCreationUpgradePricing/
);

console.log(
  'Atlas contextual Pro checkout contract passed: purchase intent opens checkout in place, Pricing remains informational, and completion returns through Atlas-owned UI.'
);
