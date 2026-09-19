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
    'async function updateEmail(email, redirectTo)'
  )
);
assert.ok(
  cloud.includes(
    'client.auth.updateUser'
  )
);
assert.ok(
  cloud.includes(
    'emailRedirectTo:'
  )
);
assert.ok(
  account.includes(
    'async function changeEmail(email)'
  )
);
assert.ok(
  account.includes(
    'async function changePassword(password)'
  )
);
assert.ok(
  account.includes(
    'changeEmail,\n        changePassword,'
  )
);
assert.ok(
  page.includes(
    'id="change-email-form"'
  )
);
assert.ok(
  page.includes(
    'id="change-password-form"'
  )
);
assert.ok(
  page.includes(
    'AtlasAccount.changeEmail(email)'
  )
);
assert.ok(
  page.includes(
    'AtlasAccount.changePassword(password)'
  )
);
assert.ok(
  page.includes(
    'type=email_change'
  )
);
assert.ok(
  page.includes(
    'If Atlas asks you to verify both addresses, confirm both.'
  )
);
assert.ok(
  bootstrap.includes(
    'atlas-account.js?v=20260919-accountmanagement1'
  )
);

console.log(
  'Atlas 5.1 account management contract passed.'
);
