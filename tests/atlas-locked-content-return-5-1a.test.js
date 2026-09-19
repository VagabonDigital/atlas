'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const compass = fs.readFileSync(
  'compass/shared/compass-engine.js',
  'utf8'
);

const tomorrow = fs.readFileSync(
  'arcade/tomorrow-got-weird/index.html',
  'utf8'
);

const wouldYouRather = fs.readFileSync(
  'arcade/would-you-rather/index.html',
  'utf8'
);

const compassResume =
  compass.slice(
    compass.indexOf(
      'async function installCompassPublicAccessResume()'
    ),
    compass.indexOf(
      'function applyCompassPublicAccessChrome()'
    )
  );

assert.ok(
  compassResume.includes(
    'updateCoverActionUI();'
  )
);

assert.ok(
  !compassResume.includes(
    'beginModule({'
  )
);

[
  ['Tomorrow Got Weird', tomorrow, 'updateLaunchButton'],
  ['Would You Rather', wouldYouRather, 'updateStartButton']
].forEach(([name, source, updateFunction]) => {
  const start =
    source.indexOf(
      '.subscribeGameResume('
    );

  const end =
    source.indexOf(
      'if (window.ArcadeGameChrome)',
      start
    );

  const resumeBlock =
    source.slice(start, end);

  assert.ok(
    resumeBlock.includes(
      'readActiveSession()'
    ),
    name + ' must refresh the authenticated session'
  );

  assert.ok(
    resumeBlock.includes(
      'readBridgeState()'
    ),
    name + ' must refresh saved progress for the unlocked cover'
  );

  assert.ok(
    resumeBlock.includes(
      updateFunction + '('
    ),
    name + ' must refresh its cover CTA'
  );

  assert.ok(
    !resumeBlock.includes(
      'startGame({'
    ),
    name + ' must not auto-enter gameplay after authentication'
  );
});

assert.ok(
  compass.includes(
    "Create free account to explore"
  )
);

assert.ok(
  compass.includes(
    "Begin lesson"
  )
);

assert.ok(
  tomorrow.includes(
    "Create free account to play"
  )
);

assert.ok(
  wouldYouRather.includes(
    "Create free account to play"
  )
);

console.log(
  'Atlas 5.1 locked-content return contract passed.'
);
