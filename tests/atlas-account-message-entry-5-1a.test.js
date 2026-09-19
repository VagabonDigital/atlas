'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const gate = fs.readFileSync(
  'shared/atlas-account-gate.js',
  'utf8'
);

assert.ok(
  gate.includes(
    'async function openFeedbackFromAccount()'
  )
);

assert.ok(
  gate.includes(
    'closeAccountMenu({\n            restoreFocus: false\n        });'
  )
);

assert.ok(
  !gate.includes(
    'closeMenu();'
  )
);

assert.ok(
  gate.includes(
    'Feedback.open({\n                returnFocus\n            });'
  )
);

console.log(
  'Atlas 5.1 account Message Atlas entry contract passed.'
);
