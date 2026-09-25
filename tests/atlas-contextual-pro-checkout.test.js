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
const gateCss = fs.readFileSync(
  'shared/atlas-account-gate.css',
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
const subscription = fs.readFileSync(
  'account/subscription/index.html',
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
  /data-account-menu-pricing[\s\S]*?The magic of Atlas Pro/
);

assert.match(
  gateCss,
  /data-account-menu-upgrade[\s\S]*?background: var\(--atlas-modal-accent-bg[\s\S]*?font-weight: 700/
);

assert.match(
  gateCss,
  /data-account-menu-upgrade\]:hover[\s\S]*?background: var\(--atlas-modal-accent[\s\S]*?color: var\(--atlas-modal-accent-ink/
);


assert.match(
  gate,
  /const pricingAction =[\s\S]*?data-account-menu-pricing[\s\S]*?access\.tier === 'pro'[\s\S]*?'none'/
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
  /name === 'checkout\.loaded'[\s\S]*?revealCheckoutWhenReady\(\)/,
  'Contextual Pro checkout must keep the Atlas loading veil until Paddle reports checkout.loaded.'
);

assert.match(
  checkout,
  /inlineMobile:[\s\S]*?isMobileCheckoutPresentation\(\)/,
  'Contextual checkout must choose its presentation mode from the current device layout.'
);

assert.match(
  checkout,
  /activeCheckout\.inlineMobile[\s\S]*?displayMode:[\s\S]*?'inline'[\s\S]*?frameTarget:[\s\S]*?'atlas-pro-checkout-inline-frame'/,
  'Mobile checkout must use Paddle inline mode inside the Atlas-owned full-screen shell.'
);

assert.match(
  checkout,
  /displayMode:[\s\S]*?'overlay'[\s\S]*?variant:[\s\S]*?'one-page'/,
  'Desktop checkout must retain the working Paddle overlay presentation.'
);

assert.match(
  checkout,
  /atlas-pro-checkout-mobile-shell[\s\S]*?position: fixed;[\s\S]*?inset: 0;/,
  'Atlas must own the entire mobile checkout viewport while Paddle is inline.'
);

assert.match(
  checkout,
  /activeCheckout\?\.inlineMobile[\s\S]*?\? 1600[\s\S]*?: 120/,
  'Mobile inline checkout must keep the Atlas veil up through Paddle’s internal loading-to-form transition.'
);

assert.match(
  checkout,
  /atlas-pro-checkout-mobile-context[\s\S]*?Secure checkout[\s\S]*?atlas-pro-checkout-mobile-stage/,
  'Mobile checkout shell must provide stable Atlas-owned context and a centered checkout surface.'
);

assert.match(
  checkout,
  /Back to Atlas/,
  'Mobile checkout must provide an explicit Atlas-owned way back instead of a generic close icon.'
);

assert.equal(
  (checkout.match(/showAddTaxId:/g) || []).length,
  2,
  'Tax ID entry must be hidden in both mobile inline and desktop overlay checkout modes.'
);

assert.equal(
  (checkout.match(/showAddDiscounts:/g) || []).length,
  2,
  'Discount entry must be hidden in both mobile inline and desktop overlay checkout modes.'
);

assert.match(
  pricing,
  /showAddTaxId:\s*false[\s\S]*showAddDiscounts:\s*false/,
  'Pricing checkout must hide tax ID and discount entry too.'
);

assert.doesNotMatch(
  checkout,
  /captureCheckoutFrameBaseline|checkoutFrameCoversViewport|stableFrames >= 4/,
  'Atlas must not infer readiness from the outer Paddle iframe geometry.'
);

assert.match(
  checkout,
  /showCheckoutLoading\(\)[\s\S]*?setCheckoutScrollLocked\([\s\S]*?true[\s\S]*?\.Checkout[\s\S]*?\.open\(\{/,
  'Contextual Pro checkout must show the Atlas loading veil before Paddle mounts.'
);

assert.match(
  checkout,
  /return await presentationPromise/,
  'Contextual checkout should report opened only after the Paddle presentation is ready.'
);

assert.doesNotMatch(
  gate,
  /Opening secure checkout…/,
  'Opening checkout must not grow the bottom-anchored mobile account menu.'
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
  checkout,
  /data-atlas-pro-checkout-open="true"[\s\S]*?overflow: hidden !important/
);

assert.match(
  checkout,
  /setCheckoutScrollLocked\([\s\S]*?true[\s\S]*?Paddle[\s\S]*?Checkout[\s\S]*?\.open\(/
);

assert.match(
  checkout,
  /name === 'checkout\.closed'[\s\S]*?setCheckoutScrollLocked\([\s\S]*?false/
);

assert.match(
  checkout,
  /Checkout failed'[\s\S]*?setCheckoutScrollLocked\([\s\S]*?false|setCheckoutScrollLocked\([\s\S]*?false[\s\S]*?Checkout failed'/
);

assert.match(
  chrome,
  /atlas-account-gate\.js\?v=20260924-checkoutclean2/
);

assert.match(
  registry,
  /atlas-account-chrome\.js\?v=20260924-accountfast1/
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
  subscription,
  /See what’s included/
);

assert.match(
  subscription,
  /const pricingUrl =[\s\S]*?\/pricing\/\?from=\$\{encodeURIComponent\(from\)\}[\s\S]*?'\/pricing\/'/
);

assert.match(
  subscription,
  /id="plan-includes"[\s\S]*?class="plan-includes"/
);


assert.match(
  subscription,
  /<p class="plan">[\s\S]*?Atlas Pro[\s\S]*?\$12\/month[\s\S]*?<\/p>[\s\S]*?<a id="plan-includes"/
);

assert.match(
  subscription,
  /\.loading \{[\s\S]*?min-height: 493px;/
);

assert.match(
  subscription,
  /@media \(max-width: 620px\)[\s\S]*?\.card \{[\s\S]*?min-height: 539px;[\s\S]*?\.loading \{[\s\S]*?min-height: 501px;/
);


assert.doesNotMatch(
  subscription,
  /payment-return-success|showDesktopPaymentSuccess|data-payment-return/
);

assert.match(
  subscription,
  /mobile-payment-success/
);

assert.match(
  subscription,
  /Payment method updated successfully\./
);

assert.match(
  compass,
  /atlas-pro-checkout\.js\?v=20260924-checkoutclean2/
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
