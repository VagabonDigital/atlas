'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const gate = fs.readFileSync(
  'shared/atlas-account-gate.js',
  'utf8'
);

const compass = fs.readFileSync(
  'compass/index.html',
  'utf8'
);

assert.ok(
  gate.includes(
    "'atlas:account-confirmation-acknowledged'"
  )
);

assert.match(
  gate,
  /if \(confirmationPendingIntentId\) \{[\s\S]*?dispatchConfirmationAcknowledged\([\s\S]*?close\(\{[\s\S]*?restoreFocus:\s*false/
);

assert.ok(
  !gate.includes(
    'confirmationPendingIntentId = null;\n                    dispatchConfirmationAcknowledged'
  )
);

assert.ok(
  compass.includes(
    'function closePendingCreateSubjectUI'
  )
);

assert.ok(
  compass.includes(
    "'atlas:account-confirmation-acknowledged'"
  )
);

assert.ok(
  compass.includes(
    "'atlas:account-confirmed-elsewhere'"
  )
);

assert.match(
  compass,
  /function closePendingCreateSubjectUI[\s\S]*?closeOwnedSubjectDialog\(false\);[\s\S]*?closeOwnedSubjectMenus\(\);/
);

console.log(
  'Atlas 5.1 pending confirmation cleanup contract passed.'
);
