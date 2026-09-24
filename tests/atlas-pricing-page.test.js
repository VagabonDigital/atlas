'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const pricing = fs.readFileSync('pricing/index.html', 'utf8');
const pricingCss = fs.readFileSync('pricing/pricing.css', 'utf8');
const inside = fs.readFileSync('tutors/index.html', 'utf8');

assert.match(pricing, /https:\/\/atlasfortutors\.com\/pricing\//);
assert.match(pricing, /The magic of Atlas Pro/);
assert.match(pricing, /Make the lesson[\s\S]*feel made[\s\S]*for them/);
assert.match(
  pricing,
  /in minutes before a lesson, or together as it unfolds/,
  'Pricing should explain both prepared and in-lesson creation.'
);

assert.match(pricing, /Atlas Free/);
assert.match(pricing, /Atlas Pro/);
assert.match(pricing, /\$12/);
assert.match(pricing, /USD \/ month/);
assert.match(
  pricing,
  /8 fresh subject creations for the lifetime of your account/,
  'Free must state the lifetime creation allowance.'
);
assert.match(
  pricing,
  /100 fresh subject creations[\s\S]*each billing month/,
  'Pro must state the recurring billing-month allowance.'
);
assert.match(pricing, /Only completed fresh creations count/);
assert.match(
  pricing,
  /A fresh subject uses one creation when Atlas finishes creating it/,
  'Pricing should explain the allowance in tutor-facing completion language.'
);
assert.match(
  pricing,
  /If creation doesn’t complete, it doesn’t use your allowance/,
  'An incomplete creation must be described as allowance-safe without internal failure terminology.'
);
assert.doesNotMatch(
  pricing,
  /successful(?:ly)? fresh|successfully created fresh subject|malformed attempts/,
  'Pricing must not frame normal subject creation as a probabilistic success condition or expose internal failure language.'
);
assert.match(
  pricing,
  /Editing, duplicating, reshaping and reusing existing material do not spend another fresh creation/
);
assert.match(pricing, /Your unused Free allowance is preserved while Pro is active/);
assert.match(pricing, /Your saved teaching material and learner continuity remain available/);
assert.match(pricing, /Unlimited learners/);

assert.match(
  pricing,
  /overview-toefl-wide\.png/,
  'Pricing should use truthful Atlas product proof rather than generic mock imagery.'
);
assert.match(
  pricing,
  /overview-toefl-mobile\.png/,
  'Pricing product proof should retain its dedicated mobile asset.'
);

assert.match(pricing, /data-atlas-account-entry/);
assert.match(pricing, /data-atlas-inside-sign-in/);
assert.match(pricing, /data-atlas-inside-create/);
assert.match(pricing, /data-atlas-inside-account/);
assert.match(
  pricing,
  /atlas-inside-account-explore-label">Explore Atlas<\/span><span class="atlas-inside-account-enter-label">Enter Atlas<\/span>/,
  'Pricing must share the anonymous Explore Atlas / authenticated Enter Atlas account-entry contract.'
);
assert.match(
  pricing,
  /atlas-account-chrome\.css\?v=20260924-enterlabel1/,
  'Pricing must load the current shared account chrome styles.'
);
assert.match(
  pricing,
  /atlas-account-chrome\.js\?v=20260924-enterlabel1/,
  'Pricing must load the current shared account chrome runtime.'
);

assert.match(
  pricing,
  /\.atlas-inside-account-entry \{[\s\S]*?margin-left:4px;[\s\S]*?gap:6px;/,
  'Pricing account controls must use the same cluster spacing as Inside Atlas.'
);
assert.match(
  pricing,
  /\.appearance-toggle,[\s\S]*?\.atlas-inside-account-icon \{[\s\S]*?width:38px;[\s\S]*?height:38px;[\s\S]*?border-radius:12px;[\s\S]*?box-shadow:var\(--shadow-sm\);/,
  'Pricing theme and profile controls must use the same 38px squircle treatment as Inside Atlas.'
);
assert.match(
  pricing,
  /\.appearance-toggle:hover,[\s\S]*?\.atlas-inside-account-icon:focus-visible \{[\s\S]*?border-color:var\(--control-border-hover\);[\s\S]*?box-shadow:var\(--shadow-md\);/,
  'Pricing shared header controls must use the same hover/focus elevation contract as Inside Atlas.'
);
assert.match(
  pricing,
  /\.site-header \{[\s\S]*?border-bottom:1px solid var\(--border-faint\);[\s\S]*?color-mix\(in srgb,var\(--surface\) 72%,transparent\)/,
  'Pricing sticky header surface must match Inside Atlas.'
);

assert.doesNotMatch(
  pricing,
  /Return to Atlas/,
  'Pricing must not use journey-assuming Return to Atlas language.'
);
assert.match(
  pricing,
  /\.pricing-header-pro \{[\s\S]*?border:1px solid var\(--border-subtle\);[\s\S]*?background:var\(--surface-panel\);[\s\S]*?font-weight:600;/,
  'Pricing Pro management shortcut should remain visually secondary to authenticated Enter Atlas.'
);
assert.match(
  inside,
  /atlas-inside-account-enter-label">Enter Atlas<\/span>/,
  'Inside Atlas must retain the same authenticated return language.'
);

assert.match(pricing, /--frame:\s*1120px/);
assert.match(inside, /--frame:\s*1120px/);
assert.doesNotMatch(
  pricingCss,
  /\.frame\s*\{[^}]*1180px/,
  'Pricing must not override the shared 1120px editorial frame.'
);
assert.match(
  pricingCss,
  /\.frame\s*\{\s*width:\s*min\(calc\(100% - 48px\), var\(--frame\)\)/,
  'Pricing desktop frame should match Inside Atlas.'
);

assert.match(
  pricingCss,
  /\.site-header \.header-inner \{[\s\S]*?width: 100%;[\s\S]*?max-width: none;[\s\S]*?margin-inline: 0;[\s\S]*?padding-inline: 1\.5rem;/,
  'Pricing header must break out of the editorial frame and match Inside Atlas full-width chrome.'
);
assert.match(
  pricingCss,
  /scrollbar-width: thin;[\s\S]*?scrollbar-color: rgba\(var\(--accent-rgb\), \.46\) transparent;/,
  'Pricing must use the same custom Firefox scrollbar treatment as Inside Atlas.'
);
assert.match(
  pricingCss,
  /html::\-webkit-scrollbar \{ width: 10px; \}[\s\S]*?html::\-webkit-scrollbar-thumb \{[\s\S]*?border: 2px solid transparent;[\s\S]*?border-radius: 999px;[\s\S]*?background: rgba\(var\(--accent-rgb\), \.46\);[\s\S]*?background-clip: padding-box;/,
  'Pricing must use the same custom WebKit scrollbar treatment as Inside Atlas.'
);
assert.match(
  pricingCss,
  /@media \(max-width: 720px\)[\s\S]*?\.frame \{ width: min\(calc\(100% - 30px\), var\(--frame\)\); \}/,
  'Pricing mobile frame should match Inside Atlas.'
);

assert.match(
  pricingCss,
  /\.footer-inner \{ min-height: 82px;[\s\S]*?gap: 20px;[\s\S]*?font-size: \.82rem; \}/,
  'Pricing footer geometry should match Inside Atlas.'
);
assert.match(
  pricingCss,
  /\.footer-links \{ display: flex; align-items: center; gap: 16px;/,
  'Pricing footer link spacing should match Inside Atlas.'
);
assert.match(
  pricing,
  /class="footer-links"[\s\S]*?href="\/tutors\/"[\s\S]*?href="\/privacy\/"[\s\S]*?href="\/terms\/"[\s\S]*?href="\/refunds\//,
  'Pricing should link back to Inside Atlas and the shared legal surfaces.'
);
assert.match(
  inside,
  /class="footer-links"[\s\S]*?href="\/pricing\/"[\s\S]*?href="\/privacy\/"[\s\S]*?href="\/terms\/"[\s\S]*?href="\/refunds\//,
  'Inside Atlas should link to Pricing and the same legal surfaces.'
);

assert.match(pricing, /atlas-access-bootstrap\.js/);
assert.match(pricing, /cdn\.paddle\.com\/paddle\/v2\/paddle\.js/);
assert.match(pricing, /atlas-paddle-config\.js/);
assert.match(pricing, /data-paddle-pro-price/);
assert.match(pricing, /data-pro-repeat-price/);
assert.match(pricing, /data-atlas-plan="pro"/);
assert.match(pricing, /data-pricing-repeat-pro/);
assert.match(pricing, /Paddle\.Environment\.set\('sandbox'\)/);
assert.match(pricing, /Paddle\.PricePreview/);
assert.match(pricing, /Paddle\.Checkout\.open/);
assert.match(pricing, /checkout\.closed/);
assert.match(
  pricing,
  /window\.innerWidth - document\.documentElement\.clientWidth/,
  'Atlas must measure the disappearing scrollbar before locking checkout.'
);
assert.match(
  pricing,
  /document\.body\.style\.paddingRight[\s\S]*?document\.body\.style\.overflow = 'hidden'[\s\S]*?Paddle\.Checkout\.open/,
  'Atlas must preserve layout width, then lock host scrolling before Paddle mounts checkout.'
);
assert.match(
  pricing,
  /document\.body\.style\.paddingRight = checkoutScrollState\.bodyPaddingRight/,
  'Atlas must restore the original layout after Paddle closes.'
);
assert.match(pricing, /atlas_user_id/);
assert.match(pricing, /customer: \{ email: account\.email \}/);
assert.match(pricing, /Sign in or create a free Atlas account before choosing Pro/);

console.log(
  'Atlas pricing contract passed: Pro proposition, commercial behavior, and Inside Atlas sibling shell are aligned.'
);
