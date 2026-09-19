'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const account = fs.readFileSync(
  'account/index.html',
  'utf8'
);

assert.ok(
  account.includes(
    'Your sign-in address changes only after you confirm both.'
  )
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
    'One email confirmation is complete.'
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

console.log(
  'Atlas 5.1 account change feedback contract passed.'
);
