'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const account = fs.readFileSync(
  'account/index.html',
  'utf8'
);

const compass = fs.readFileSync(
  'compass/index.html',
  'utf8'
);

assert.ok(
  account.includes(
    'data-atlas-return-handoff'
  )
);

assert.ok(
  account.includes(
    "storedIntent.action ===\n                'create-subject'"
  )
);

assert.ok(
  account.includes(
    "content: 'Building your subject…';"
  )
);

assert.ok(
  account.includes(
    'finishReturnHandoff();'
  )
);

assert.ok(
  account.includes(
    'html[data-atlas-return-handoff="true"] {'
  )
);

assert.ok(
  account.includes(
    'overflow: hidden !important;'
  )
);

assert.ok(
  compass.includes(
    'class="atlas-resume-handoff"'
  )
);

assert.ok(
  compass.includes(
    'class="atlas-resume-handoff-dots"'
  )
);

assert.ok(
  compass.includes(
    "content: 'Building your subject…';"
  )
);

assert.ok(
  !compass.includes(
    "font-size: clamp(1.75rem, 4vw, 2.45rem)"
  )
);

assert.ok(
  !compass.includes(
    "Restoring your choices and preparing the subject."
  )
);

assert.ok(
  compass.includes(
    'atlasResumeTransition'
  )
);

assert.ok(
  compass.includes(
    'html[data-atlas-resume-transition] {'
  )
);

console.log(
  'Atlas 5.1 confirmation return journey contract passed.'
);
