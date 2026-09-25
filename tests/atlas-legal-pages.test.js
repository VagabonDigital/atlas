'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const atlas = fs.readFileSync('index.html', 'utf8');
const inside = fs.readFileSync('tutors/index.html', 'utf8');
const privacy = fs.readFileSync('privacy/index.html', 'utf8');
const terms = fs.readFileSync('terms/index.html', 'utf8');
const refunds = fs.readFileSync('refunds/index.html', 'utf8');
const css = fs.readFileSync('shared/atlas-legal.css', 'utf8');
const appearance = fs.readFileSync('shared/atlas-legal-appearance.js', 'utf8');

assert.match(
  atlas,
  /class="atlas-welcome-screen"[\s\S]*?href="\/privacy\/"[\s\S]*?href="\/terms\/"[\s\S]*?<\/section>/,
  'Fresh public entry must expose Privacy and Terms without sign-in.'
);
assert.match(
  atlas,
  /class="drawer-legal-links"[\s\S]*?href="\/privacy\/"[\s\S]*?href="\/terms\/"[\s\S]*?href="\/refunds\/"/,
  'Atlas product navigation must retain Privacy, Terms, and Refunds after entry.'
);
assert.match(
  inside,
  /class="footer-links"[\s\S]*?href="\/privacy\/"[\s\S]*?href="\/terms\/"[\s\S]*?href="\/refunds\/"[\s\S]*?support@atlasfortutors\.com/,
  'Inside Atlas must expose Privacy, Terms, Refunds, and Support publicly.'
);

assert.match(
  privacy,
  /https:\/\/atlasfortutors\.com\/privacy\//
);
assert.match(
  privacy,
  /Google Sign-In information/
);
assert.match(
  privacy,
  /openid/
);
assert.match(
  privacy,
  /does not request access to your Gmail, Google Drive, Google Calendar/
);
assert.match(
  privacy,
  /Google account data is used only to support account sign-in and account identity/
);
assert.match(
  privacy,
  /does not sell Google user data/
);
assert.match(
  privacy,
  /Supabase/
);
assert.match(
  privacy,
  /Google Analytics/
);
assert.match(
  privacy,
  /Cloudflare/
);
assert.match(
  privacy,
  /OpenAI/
);
assert.match(
  privacy,
  /Pexels and Serper/
);
assert.match(
  privacy,
  /Paddle/
);
assert.match(
  privacy,
  /Merchant of Record/
);
assert.match(
  privacy,
  /does not currently provide a self-service “Delete account” button/
);
assert.match(
  privacy,
  /support@atlasfortutors\.com/
);

assert.match(
  terms,
  /https:\/\/atlasfortutors\.com\/terms\//
);
assert.match(
  terms,
  /you retain the rights you already have/
);
assert.match(
  terms,
  /AI output can be incomplete, inaccurate, outdated, biased, or unsuitable/
);
assert.match(
  terms,
  /Atlas does not give Atlas access to Gmail|Using Google Sign-In does not give Atlas access to Gmail/
);
assert.match(
  terms,
  /support@atlasfortutors\.com/
);
assert.match(
  terms,
  /Nothing in these Terms limits liability that cannot lawfully be limited/
);
assert.match(
  terms,
  /Paid features and subscriptions/
);
assert.match(
  terms,
  /Paddle acts as Merchant of Record/
);
assert.match(
  terms,
  /href="\/refunds\/"/
);

assert.match(
  refunds,
  /https:\/\/atlasfortutors\.com\/refunds\//
);
assert.match(
  refunds,
  /Refund &amp; Cancellation Policy/
);
assert.match(
  refunds,
  /Paddle acts as Merchant of Record/
);
assert.match(
  refunds,
  /Cancellation stops future renewals/
);
assert.match(
  refunds,
  /Your workspace is not deleted when you cancel/
);
assert.match(
  refunds,
  /support@atlasfortutors\.com/
);

assert.match(
  privacy,
  /atlas-legal\.css\?v=20260925-tap1/
);
assert.match(
  terms,
  /atlas-legal\.css\?v=20260925-tap1/
);
assert.match(
  refunds,
  /atlas-legal\.css\?v=20260925-tap1/
);
assert.match(
  privacy,
  /data-legal-appearance/
);
assert.match(
  terms,
  /data-legal-appearance/
);
assert.match(
  refunds,
  /data-legal-appearance/
);
assert.match(
  privacy,
  /atlas-legal-appearance\.js\?v=20260920-legal-theme1/
);
assert.match(
  terms,
  /atlas-legal-appearance\.js\?v=20260920-legal-theme1/
);
assert.match(
  refunds,
  /atlas-legal-appearance\.js\?v=20260920-legal-theme1/
);
assert.match(
  css,
  /-webkit-tap-highlight-color:\s*transparent;/,
  'Legal pages must suppress the native mobile tap highlight globally.'
);
assert.match(
  css,
  /\.legal-main/
);
assert.match(
  css,
  /\.legal-footer-links/
);
assert.match(
  css,
  /html\[data-theme="night"\]/
);
assert.match(
  css,
  /--header-surface:\s*rgba\(243, 240, 233, 0\.72\);[\s\S]*?html\[data-theme="night"\][\s\S]*?--header-surface:\s*rgba\(27, 29, 28, 0\.72\);/,
  'Legal headers must use the canonical 72% glass opacity in both themes.'
);
assert.match(
  css,
  /\.site-header \{[\s\S]*?backdrop-filter:\s*blur\(16px\) saturate\(1\.1\);[\s\S]*?-webkit-backdrop-filter:\s*blur\(16px\) saturate\(1\.1\);/,
  'Legal headers must match the Inside Atlas blur and saturation recipe.'
);
assert.match(
  css,
  /--theme-motion:\s*280ms cubic-bezier\(0\.4, 0, 0\.2, 1\)/
);
assert.match(
  appearance,
  /atlas::appearanceBySession/
);
assert.match(
  appearance,
  /TRANSITION_MS = 280/
);

console.log(
  'Atlas legal-page contract passed: public discovery, billing/refund disclosure, Google-data disclosure, support contact, ownership, and AI terms are present.'
);
