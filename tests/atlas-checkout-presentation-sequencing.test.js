'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const checkout = fs.readFileSync(
  'shared/atlas-pro-checkout.js',
  'utf8'
);
const boot = fs.readFileSync(
  'shared/atlas-checkout-recovery-boot.js',
  'utf8'
);
const subscription = fs.readFileSync(
  'account/subscription/index.html',
  'utf8'
);

assert.match(
  checkout,
  /activeCheckoutRecoveryBoot[\s\S]*?showCheckoutLoading\(\)[\s\S]*?if \(!recoveryBoot\)[\s\S]*?ensureCheckoutLoadingLayer/,
  'Recovered Pro checkout must keep the pre-paint loader instead of swapping to a second loading surface.'
);

assert.match(
  checkout,
  /hideCheckoutLoading\(\)[\s\S]*?activeCheckoutRecoveryBoot[\s\S]*?\.release/,
  'Recovered Pro checkout must release its pre-paint loader only at the canonical checkout reveal point.'
);

assert.match(
  checkout,
  /atlas-pro-checkout-loading-brand[\s\S]*?font-size: 2rem;[\s\S]*?line-height: 1\.1;[\s\S]*?atlas-pro-checkout-loading-copy[\s\S]*?font-size: \.9rem;[\s\S]*?line-height: 1\.4;/,
  'Ordinary checkout loading geometry must match the recovery loader.'
);

assert.match(
  boot,
  /function handoffReady[\s\S]*?mode !== 'payment'[\s\S]*?getComputedStyle[\s\S]*?style\.opacity[\s\S]*?>= 0\.999/,
  'Update Payment recovery must remain covered until the destination overlay is fully opaque.'
);

assert.doesNotMatch(
  boot,
  /\.atlas-pro-checkout-loading\[open\]/,
  'Pro recovery must not hand off to a second loader.'
);

assert.match(
  subscription,
  /function settlePaymentPrewarm[\s\S]*?paymentCheckoutMode ===[\s\S]*?'inline'[\s\S]*?setPaymentPreparing\(false\)/,
  'A ready inline Update Payment checkout must clear its 15-second loading watchdog.'
);

console.log(
  'Checkout presentation sequencing contract passed.'
);
