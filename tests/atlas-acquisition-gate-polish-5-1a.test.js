'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const gate = fs.readFileSync(
  'shared/atlas-account-gate.js',
  'utf8'
);

const css = fs.readFileSync(
  'shared/atlas-account-gate.css',
  'utf8'
);

const panel = fs.readFileSync(
  'shared/atlas-session-panel.js',
  'utf8'
);

const signInIndex = gate.indexOf(
  'data-account-mode="sign-in"'
);
const createIndex = gate.indexOf(
  'data-account-mode="create"'
);

assert.ok(signInIndex >= 0);
assert.ok(createIndex > signInIndex);

assert.ok(
  gate.includes(
    "card.dataset.accountView = 'auth'"
  )
);

assert.ok(
  gate.includes(
    "card.dataset.accountView = 'message'"
  )
);

assert.ok(
  css.includes(
    '[data-account-view="message"] .atlas-account-gate-heading'
  )
);

assert.ok(
  css.includes(
    '.atlas-account-gate-message .atlas-account-gate-secondary'
  )
);

assert.ok(
  css.includes(
    'margin-top: 22px;'
  )
);

assert.match(
  panel,
  /requireCapability\(\s*'canCreateLearner'[\s\S]*?mode:\s*'create'/
);

assert.ok(
  panel.includes(
    "'atlas:account-confirmed-elsewhere'"
  )
);

assert.match(
  panel,
  /intent\?\.action !== 'create-learner'[\s\S]*?setCreateExpanded\([\s\S]*?false,[\s\S]*?reset:\s*true[\s\S]*?close\(\)/
);

assert.ok(
  gateCss.includes(
    '.atlas-account-gate-card[data-account-view="message"] .atlas-account-gate-body {\n    padding-top: 14px;'
  )
);

assert.ok(
  gateCss.includes(
    '.atlas-account-gate-card[data-account-view="message"] .atlas-account-gate-close {\n    position: absolute;'
  )
);

console.log(
  'Atlas 5.1 acquisition gate polish contract passed.'
);
