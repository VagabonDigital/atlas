'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const boot = fs.readFileSync(
  'shared/atlas-checkout-recovery-boot.js',
  'utf8'
);

const recoveryHosts = [
  'index.html',
  'compass/index.html',
  'arcade/index.html',
  'tutors/index.html',
  'pricing/index.html',
  'account/subscription/index.html'
];

for (const path of recoveryHosts) {
  const source = fs.readFileSync(
    path,
    'utf8'
  );

  assert.match(
    source,
    /<meta name="viewport"[^>]*>\s*<script src="\/shared\/atlas-checkout-recovery-boot\.js\?v=20260925-checkoutfinal1"><\/script>/,
    `${path} must install checkout recovery before normal page paint.`
  );
}

assert.match(
  boot,
  /checkoutState[\s\S]*?paymentState/,
  'Recovery boot must recognize both Pro checkout and payment-update intent.'
);

assert.match(
  boot,
  /document\.documentElement[\s\S]*?appendChild\([\s\S]*?layer/,
  'Recovery boot must mount outside the page body so underlying page presentation cannot flash through.'
);

assert.match(
  boot,
  /function handoffReady[\s\S]*?payment-update[\s\S]*?data-open[\s\S]*?\.atlas-pro-checkout-loading\[open\]/,
  'Recovery boot must hand off only when the canonical checkout/payment surface is visible.'
);

assert.match(
  boot,
  /intentStillActive[\s\S]*?handoffReady[\s\S]*?release/,
  'Recovery boot must stay opaque until recovery exits or the secure payment UI owns the viewport.'
);

console.log(
  'Checkout refresh pre-paint sequencing contract passed.'
);
