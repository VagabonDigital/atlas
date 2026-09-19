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
    'async function changePassword(\n        currentPassword,\n        password\n    )'
  )
);
assert.ok(
  cloud.includes(
    'async function refreshCurrentSession()'
  )
);
assert.ok(
  cloud.includes(
    'client.auth.refreshSession()'
  )
);
assert.ok(
  account.includes(
    'async function refreshIdentitySession()'
  )
);
assert.ok(
  page.includes(
    '.refreshIdentitySession();'
  )
);
assert.ok(
  cloud.includes(
    'async function updatePasswordWithCurrentCredentials('
  )
);
assert.ok(
  cloud.includes(
    'client.auth.signInWithPassword'
  )
);
assert.ok(
  cloud.includes(
    'Your current password is incorrect.'
  )
);
assert.ok(
  account.includes(
    'changeEmail,\n        refreshIdentitySession,\n        changePassword,'
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
    'id="change-password-current"'
  )
);
assert.ok(
  page.includes(
    'AtlasAccount.changePassword(\n          currentPassword,\n          password\n        )'
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
  page.includes(
    'atlas-account.js?v=20260919-emailchange3'
  )
);
assert.ok(
  account.includes(
    'atlas-account-cloud.js?v=20260919-emailchange3'
  )
);

console.log(
  'Atlas 5.1 account management contract passed.'
);
