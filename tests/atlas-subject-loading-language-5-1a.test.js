'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const subjectPage = fs.readFileSync(
  'compass/subject/index.html',
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

console.log(
  'Atlas 5.1 subject loading language contract passed.'
);
