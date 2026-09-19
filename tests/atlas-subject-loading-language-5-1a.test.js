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

assert.match(
  subjectPage,
  /html:has\(body > #compass-subject-load-status\)\s*\{\s*overflow-y: hidden;\s*scrollbar-gutter: auto;\s*\}/
);

console.log(
  'Atlas 5.1 subject loading language contract passed.'
);
