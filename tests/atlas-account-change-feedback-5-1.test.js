'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const account = fs.readFileSync(
  'account/index.html',
  'utf8'
);

assert.ok(
  account.includes(
    "authReturnType === 'email_change'"
  )
);

assert.ok(
  account.includes(
    'emailChangeUser?.new_email'
  )
);

assert.ok(
  account.includes(
    'Email confirmation received, but the change to'
  )
);

assert.ok(
  account.includes(
    'Email address confirmed. Your Atlas account email is updated.'
  )
);

assert.ok(
  account.includes(
    'id="change-password-status"'
  )
);

assert.ok(
  account.includes(
    'id="change-password-success"'
  )
);

assert.ok(
  account.includes(
    'Your Atlas account is ready.'
  )
);

console.log(
  'Atlas account change feedback contract passed.'
);
