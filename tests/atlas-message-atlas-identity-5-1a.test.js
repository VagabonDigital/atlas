'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const feedback = fs.readFileSync(
  'shared/atlas-feedback.js',
  'utf8'
);

assert.ok(
  feedback.includes('Message Atlas')
);

assert.ok(
  feedback.includes(
    'Sending from your Atlas account · '
  )
);

assert.ok(
  feedback.includes(
    'window.AtlasAccount?.getState?.()'
  )
);

assert.ok(
  feedback.includes(
    'anonymousContact.hidden = true'
  )
);

assert.match(
  feedback,
  /const replyEmail =\s*account\s*\? account\.email/
);

assert.match(
  feedback,
  /const replyName =\s*account\s*\? account\.email/
);

assert.ok(
  feedback.includes(
    'function visibleFocusable(container)'
  )
);

assert.ok(
  feedback.includes(
    'event.key !== \'Tab\''
  )
);

console.log(
  'Atlas 5.1 Message Atlas identity contract passed.'
);
