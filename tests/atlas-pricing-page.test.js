'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const pricing = fs.readFileSync('pricing/index.html', 'utf8');
const pricingCss = fs.readFileSync('pricing/pricing.css', 'utf8');
const accountChromeCss = fs.readFileSync('shared/atlas-account-chrome.css', 'utf8');
const inside = fs.readFileSync('tutors/index.html', 'utf8');

assert.match(pricing, /https:\/\/atlasfortutors\.com\/pricing\//);
assert.match(pricing, /The magic of Atlas Pro/);
assert.match(pricing, /Make the lesson[\s\S]*feel made[\s\S]*for them/);
assert.match(
  pricing,
  /Turn whatever matters to them into lesson-ready material — minutes before a lesson, or together in the moment/,
  'Pricing should express both prepared and in-the-moment creation through learner relevance.'
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
assert.match(
  pricing,
  /data-atlas-account-entry[\s\S]*?data-pricing-header-pro[\s\S]*?atlas-inside-account-explore/,
  'Pricing Get Pro must live inside the same right-hand account-action cluster as Explore/Sign in/Create.'
);
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
  /atlas-account-chrome\.css\?v=20260924-mobilegap1/,
  'Pricing must load the current shared account chrome styles.'
);
assert.match(
  accountChromeCss,
  /@media \(max-width: 720px\)[\s\S]*?\.atlas-inside-account-entry \{[\s\S]*?gap: 6px;/,
  'Mobile account actions must keep the same 6px spacing across Inside Atlas and Pricing.'
);
assert.match(
  pricing,
  /atlas-account-chrome\.js\?v=20260925-paymentworld1/,
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
  /--header-surface:\s*#fffdf9;[\s\S]*?\.site-header \{[\s\S]*?border-bottom:1px solid var\(--border-faint\);[\s\S]*?color-mix\(in srgb,var\(--header-surface\) 72%,transparent\)[\s\S]*?backdrop-filter:blur\(16px\) saturate\(1\.1\)[\s\S]*?-webkit-backdrop-filter:blur\(16px\) saturate\(1\.1\)/,
  'Pricing sticky header must match the Inside Atlas 72% / 16px / 1.1 glass treatment.'
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
  /\.footer-inner \{[\s\S]*?width: min\(calc\(100% - 36px\), 1120px\);[\s\S]*?min-height: 82px;[\s\S]*?gap: 20px;[\s\S]*?font-size: \.82rem;/,
  'Pricing footer geometry should match the legal footer.'
);
assert.match(
  pricingCss,
  /@media \(max-width: 640px\)[\s\S]*?\.footer-inner \{[\s\S]*?padding: 22px 0;[\s\S]*?gap: 10px;/,
  'Pricing mobile footer should match the legal footer rhythm.'
);
assert.match(
  inside,
  /\.footer-inner \{[\s\S]*?width: min\(calc\(100% - 36px\), 1120px\);[\s\S]*?min-height: 82px;[\s\S]*?gap: 20px;[\s\S]*?font-size: 0\.82rem;/,
  'Inside Atlas footer geometry should match the legal footer.'
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
assert.match(
  pricing,
  /atlas-pro-checkout\.js\?v=20260925-paymentworld1/,
  'Pricing must load the current shared Pro checkout runtime.'
);
assert.doesNotMatch(
  pricing,
  /cdn\.paddle\.com\/paddle\/v2\/paddle\.js/,
  'Pricing must not initialize Paddle independently of the shared checkout runtime.'
);
assert.doesNotMatch(
  pricing,
  /atlas-paddle-config\.js/,
  'Pricing must not own a second copy of Paddle environment configuration.'
);
assert.match(pricing, /data-paddle-pro-price/);
assert.match(pricing, /data-pro-repeat-price/);
assert.match(pricing, /data-atlas-plan="pro"/);
assert.match(pricing, /data-pricing-repeat-pro/);
assert.match(
  pricing,
  /AtlasProCheckout\.previewPrice/,
  'Pricing must delegate localized price preview to the shared checkout runtime.'
);
assert.match(
  pricing,
  /AtlasProCheckout\.open/,
  'Pricing must delegate purchase presentation to the shared checkout runtime.'
);
assert.doesNotMatch(
  pricing,
  /Paddle\.Checkout\.open/,
  'Pricing must never regress to its own Paddle overlay implementation.'
);
assert.match(
  pricing,
  /continueLabel:[\s\S]*?destination\.label[\s\S]*?onContinue:/,
  'Shared checkout completion must preserve Pricing return destinations.'
);
assert.match(
  pricing,
  /async function openCheckout[\s\S]*?AtlasAccessBootstrap[\s\S]*?initialize[\s\S]*?AtlasAccount[\s\S]*?getState/,
  'Pricing must hydrate canonical account state before deciding that the tutor is a guest.'
);

assert.match(
  pricing,
  /Sign in or create a free Atlas account before choosing Pro/,
  'Pricing must retain contextual account gating before checkout.'
);

console.log(
  'Atlas pricing contract passed: Pro proposition, commercial behavior, and Inside Atlas sibling shell are aligned.'
);
