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

const returnHandoff = fs.readFileSync(
  'shared/atlas-return-handoff.js',
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

assert.match(
  compass,
  /function closePendingCreateSubjectUI\([\s\S]*?continue-create-preview[\s\S]*?closeOwnedSubjectDialog\(false\)/
);

assert.ok(
  compass.includes(
    'atlas:account-confirmation-acknowledged'
  )
);

assert.match(
  returnHandoff,
  /PRESENTATION_KEY[\s\S]*?atlas::returnHandoffPresentation::v1/
);

assert.match(
  returnHandoff,
  /queuePresentationHandoff\(intent\)[\s\S]*?window\.location\.replace\(intent\.destination\)/
);

const firstCompassScriptEnd =
  compass.indexOf('</script>');

const transitionStylesheet =
  compass.indexOf(
    '/shared/atlas-transition-state.css'
  );

assert.ok(
  firstCompassScriptEnd >= 0 &&
  transitionStylesheet > firstCompassScriptEnd,
  'Compass return-paint lock must be resolved before styles or Hub content can paint.'
);

const firstCompassScript =
  compass.slice(
    0,
    firstCompassScriptEnd
  );

assert.match(
  firstCompassScript,
  /atlas::returnHandoffPresentation::v1/
);

assert.match(
  firstCompassScript,
  /sessionStorage\.removeItem\([\s\S]*?presentationKey/
);

assert.match(
  firstCompassScript,
  /atlasResumeTransition/
);

assert.match(
  firstCompassScript,
  /atlas::returnIntentResume::v1/,
  'Queued return intent must remain the fallback if the presentation marker is unavailable.'
);

assert.ok(
  account.includes(
    'atlas-return-handoff.js?v=20260923-returnpaint1'
  )
);

console.log(
  'Atlas 5.1 confirmation return journey contract passed.'
);
