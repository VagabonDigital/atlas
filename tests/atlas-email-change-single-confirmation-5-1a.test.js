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

assert.ok(
  cloud.includes(
    'updateEmailWithCurrentCredentials'
  )
);

assert.match(
  cloud,
  /signInWithPassword\([\s\S]*?currentPassword[\s\S]*?updateUser\([\s\S]*?email: nextEmail/
);

assert.match(
  account,
  /async function changeEmail\(\s*currentPassword,\s*email\s*\)/
);

assert.ok(
  account.includes(
    'Enter your current password.'
  )
);

assert.ok(
  page.includes(
    'id="change-email-current-password"'
  )
);

assert.ok(
  page.includes(
    'Sending confirmation email…'
  )
);

assert.ok(
  page.includes(
    'Your sign-in email changes after you confirm it.'
  )
);

assert.ok(
  !page.includes(
    'Your sign-in address changes only after you confirm both.'
  )
);

assert.ok(
  !page.includes(
    'Confirm the link sent to your other address'
  )
);

console.log(
  'Atlas single-confirmation email change contract passed.'
);
