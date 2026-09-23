'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const page = fs.readFileSync(
  'account/index.html',
  'utf8'
);

assert.ok(
  page.includes('id="change-email-status"')
);

assert.ok(
  page.includes('id="change-password-status"')
);

assert.ok(
  page.includes(
    "setAccountManagementStatus(\n          'password',\n          humanizeAccountError(error),\n          'error'"
  )
);

assert.ok(
  page.includes(
    "setAccountManagementStatus(\n          'email',\n          humanizeAccountError(error),\n          'error'"
  )
);

assert.ok(
  page.includes('id="change-email-success"')
);

assert.ok(
  page.includes('id="change-password-success"')
);

assert.ok(
  page.includes('Check your new email')
);

assert.ok(
  page.includes('Password updated')
);

assert.ok(
  page.includes(
    'Your Atlas sign-in email won’t change until you confirm it.'
  )
);

assert.match(
  page,
  /ChangeEmailFields\.hidden = true[\s\S]*?ChangeEmailSuccess\.hidden = false/
);

assert.match(
  page,
  /ChangePasswordFields\.hidden = true[\s\S]*?ChangePasswordSuccess\.hidden = false/
);

console.log(
  'Atlas account management feedback contract passed: errors stay actionable and successful changes transform inside their modal.'
);
