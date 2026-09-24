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
  /free creations remaining/
);

assert.match(
  compass,
  /resolved\.tier === 'pro'[\s\S]*?resolved\.remaining <= 10/
);

assert.match(
  compass,
  /Fresh subject creations reset \$\{resolved\.resetLabel\}/
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
