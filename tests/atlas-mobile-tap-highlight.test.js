'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const coveredSurfaces = [
  ['Atlas and Arcade shared modal theme', 'shared/atlas-modal-theme.css'],
  ['Compass subject shell', 'compass/shared/compass-subject.css'],
  ['Inside Atlas', 'tutors/index.html'],
  ['Account', 'account/index.html'],
  ['Manage Subscription', 'account/subscription/index.html'],
  ['Pricing', 'pricing/pricing.css'],
  ['Legal pages', 'shared/atlas-legal.css'],
  ['Learner Memory', 'memory/index.html'],
  ['404', '404.html'],
  ['Arcade workbench', 'arcade/engines/shared-plan-workbench/workbench.css']
];

for (const [label, path] of coveredSurfaces) {
  const source = fs.readFileSync(path, 'utf8');

  assert.match(
    source,
    /-webkit-tap-highlight-color:\s*transparent;/,
    `${label} must suppress the native WebKit tap highlight on mobile.`
  );
}

console.log(
  'Atlas mobile tap-highlight contract passed across public, account, subject, game, legal, and utility surfaces.'
);
