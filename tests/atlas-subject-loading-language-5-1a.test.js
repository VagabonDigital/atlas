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

const transitionCss = fs.readFileSync(
  'shared/atlas-transition-state.css',
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
      '/shared/atlas-transition-state.css?v=20260920-transition1'
    )
  );
});

assert.ok(
  transitionCss.includes(
    '--atlas-transition-canvas: #f5f1e9;'
  )
);

assert.ok(
  transitionCss.includes(
    '--atlas-transition-canvas: #221f1b;'
  )
);

assert.ok(
  compass.indexOf(
    'document.documentElement.dataset.theme'
  ) <
  compass.indexOf(
    '/shared/atlas-transition-state.css?v=20260920-transition1'
  ),
  'Compass must resolve day/night appearance before the shared loading canvas can paint.'
);

assert.match(
  transitionCss,
  /html\[data-atlas-resume-transition\][\s\S]*?html\[data-atlas-return-handoff="true"\][\s\S]*?html\[data-atlas-subject-build-handoff="true"\][\s\S]*?background-color:\s*var\(--atlas-transition-canvas\)\s*!important;/
);

assert.match(
  transitionCss,
  /\.atlas-resume-handoff,[\s\S]*?\.account-return-handoff,[\s\S]*?#compass-subject-load-status[\s\S]*?background:\s*var\(--atlas-transition-canvas\)\s*!important;/
);

console.log(
  'Atlas 5.1 subject loading language contract passed.'
);
