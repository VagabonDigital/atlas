'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const subjectPage = fs.readFileSync(
  'compass/subject/index.html',
  'utf8'
);


const compass = fs.readFileSync(
  'compass/index.html',
  'utf8'
);

const account = fs.readFileSync(
  'account/index.html',
  'utf8'
);

assert.ok(
  subjectPage.includes(
    ".get('author') === 'generate'"
  )
);

assert.ok(
  subjectPage.includes(
    "? 'Building your subject…'"
  )
);

assert.ok(
  subjectPage.includes(
    ": 'Opening subject'"
  )
);

assert.ok(
  subjectPage.includes(
    'The static "Opening subject" fallback remains valid.'
  )
);

assert.ok(
  subjectPage.includes(
    ".get('author') === 'generate'"
  )
);

assert.ok(
  subjectPage.includes(
    '.atlasSubjectBuildHandoff = \'true\''
  )
);

assert.ok(
  subjectPage.includes(
    'html[data-atlas-subject-build-handoff="true"]'
  )
);

assert.ok(
  subjectPage.includes(
    'overflow: hidden !important;'
  )
);


[
  compass,
  subjectPage,
  account
].forEach(source => {
  assert.ok(
    source.includes(
      '--atlas-transition-canvas: #f5f1e9;'
    )
  );

  assert.ok(
    source.includes(
      '--atlas-transition-canvas: #221f1b;'
    )
  );
});

assert.ok(
  subjectPage.includes(
    'background: var(--atlas-transition-canvas);'
  )
);

console.log(
  'Atlas 5.1 subject loading language contract passed.'
);
