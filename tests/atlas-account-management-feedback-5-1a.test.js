'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const page = fs.readFileSync(
  'account/index.html',
  'utf8'
);

assert.ok(
  page.includes(
    'We’ll send confirmation links to your current email and your new email. Your sign-in address changes only after you confirm both.'
  )
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
  page.includes(
    'Confirmation links sent. Confirm the messages at'
  )
);

assert.ok(
  page.includes(
    'Your sign-in email changes after both are confirmed.'
  )
);

console.log(
  'Atlas 5.1 account management feedback contract passed.'
);
