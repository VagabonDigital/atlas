'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const cloud = fs.readFileSync(
  'shared/atlas-account-cloud.js',
  'utf8'
);
const account = fs.readFileSync(
  'shared/atlas-account.js',
  'utf8'
);
const page = fs.readFileSync(
  'account/index.html',
  'utf8'
);
const bootstrap = fs.readFileSync(
  'shared/atlas-access-bootstrap.js',
  'utf8'
);

assert.ok(
  cloud.includes(
    'async function updateEmailWithCurrentCredentials('
  )
);

assert.ok(
  account.includes(
    'async function changeEmail(\n        currentPassword,\n        email\n    )'
  )
);

assert.ok(
  account.includes(
    'async function changePassword(\n        currentPassword,\n        password\n    )'
  )
);

assert.ok(page.includes('id="change-email-modal"'));
assert.ok(page.includes('id="change-password-modal"'));
assert.ok(page.includes('id="change-email-form"'));
assert.ok(page.includes('id="change-password-form"'));
assert.ok(page.includes('aria-haspopup="dialog"'));
assert.ok(page.includes('role="dialog"'));
assert.ok(page.includes('aria-modal="true"'));
assert.ok(page.includes('data-password-management'));
assert.ok(page.includes('id="account-sign-in-method"'));

assert.match(
  page,
  /openAccountManagementModal\('email'\)/
);

assert.match(
  page,
  /openAccountManagementModal\('password'\)/
);

assert.match(
  page,
  /event\.key === 'Escape'[\s\S]*?closeAccountManagementModal/
);

assert.match(
  page,
  /event\.key !== 'Tab'[\s\S]*?focusable/
);

assert.ok(account.includes('providers: Object.freeze([])'));

assert.ok(
  account.includes(
    "hasPassword: providers.includes('email')"
  )
);

assert.ok(
  page.includes(
    'AtlasAccount.googleAuthEnabled?.()'
  )
);

assert.ok(
  page.includes(
    'atlas-account.js?v=20260920-googleid1'
  )
);

assert.ok(
  account.includes(
    'atlas-account-cloud.js?v=20260920-googleid1'
  )
);

assert.ok(
  bootstrap.includes(
    'atlas-account.js?v=20260920-googleid1'
  )
);

console.log(
  'Atlas account management contract passed: account actions use accessible modals while identity methods remain unchanged.'
);
