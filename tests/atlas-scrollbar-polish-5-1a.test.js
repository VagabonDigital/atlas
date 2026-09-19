'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const atlas = fs.readFileSync('index.html', 'utf8');
const compass = fs.readFileSync('compass/index.html', 'utf8');
const subject = fs.readFileSync(
  'compass/shared/compass-subject.css',
  'utf8'
);
const accountGate = fs.readFileSync(
  'shared/atlas-account-gate.css',
  'utf8'
);
const account = fs.readFileSync(
  'account/index.html',
  'utf8'
);
const memory = fs.readFileSync(
  'memory/index.html',
  'utf8'
);
const insideAtlas = fs.readFileSync(
  'tutors/index.html',
  'utf8'
);
const notFound = fs.readFileSync(
  '404.html',
  'utf8'
);

assert.ok(
  atlas.includes('.modal-body::-webkit-scrollbar')
);

[
  '.owned-subject-dialog-panel',
  '.subject-artwork-studio',
  '.subject-artwork-studio-body',
  '.owned-subject-dialog-create-field textarea',
  '.subject-artwork-idea-input'
].forEach(selector => {
  assert.ok(
    compass.includes(
      selector + '::-webkit-scrollbar'
    )
  );
});

[
  '.atlas-cover-picker-results-column',
  '.atlas-cover-picker-url-panel',
  '.atlas-cover-picker-layout',
  '.atlas-my-version-dialog-panel',
  '.atlas-my-version-bar.is-mobile-tools-open .atlas-my-version-actions',
  'textarea'
].forEach(selector => {
  assert.ok(
    subject.includes(
      selector + '::-webkit-scrollbar'
    )
  );
});

assert.ok(
  accountGate.includes(
    '.atlas-account-gate-card::-webkit-scrollbar'
  )
);

assert.ok(
  account.includes(
    'html::-webkit-scrollbar-thumb'
  )
);

assert.ok(
  memory.includes(
    '.memory-textarea::-webkit-scrollbar'
  )
);

assert.ok(
  insideAtlas.includes(
    'html::-webkit-scrollbar-thumb'
  )
);

assert.ok(
  notFound.includes(
    'var(--scrollbar-thumb)'
  )
);

console.log(
  'Atlas 5.1 scrollbar polish contract passed.'
);
