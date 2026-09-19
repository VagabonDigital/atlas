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

const subjectPage = fs.readFileSync(
  'compass/subject/index.html',
  'utf8'
);

const engine = fs.readFileSync(
  'compass/shared/compass-engine.js',
  'utf8'
);

assert.match(
  account,
  /html\[data-atlas-return-handoff="true"\]\s*\{[\s\S]*?overflow:\s*hidden\s*!important;[\s\S]*?scrollbar-gutter:\s*auto;/
);

assert.match(
  compass,
  /html\[data-atlas-resume-transition\]\s*\{[\s\S]*?overflow:\s*hidden\s*!important;[\s\S]*?scrollbar-gutter:\s*auto;/
);

assert.ok(
  subjectPage.includes(
    '.atlasSubjectBuildHandoff = \'true\''
  )
);

assert.match(
  subjectPage,
  /html\[data-atlas-subject-build-handoff="true"\]\s*\{[\s\S]*?overflow:\s*hidden\s*!important;[\s\S]*?scrollbar-gutter:\s*auto\s*!important;/
);

assert.match(
  engine,
  /if \(viewId !== 'view-cover'\) \{[\s\S]*?delete document\.documentElement\.dataset[\s\S]*?\.atlasSubjectBuildHandoff;/
);

console.log(
  'Atlas 5.1 subject build scroll-lock contract passed.'
);
