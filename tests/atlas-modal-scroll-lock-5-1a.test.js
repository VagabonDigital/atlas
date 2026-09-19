'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const feedback = fs.readFileSync('shared/atlas-feedback.js', 'utf8');
const search = fs.readFileSync('shared/atlas-search.css', 'utf8');
const sessions = fs.readFileSync('shared/atlas-session-panel.css', 'utf8');
const accountGate = fs.readFileSync('shared/atlas-account-gate.css', 'utf8');
const compass = fs.readFileSync('compass/index.html', 'utf8');
const subject = fs.readFileSync('compass/shared/compass-subject.css', 'utf8');

const expected = [
  [feedback, 'html:has(#${IDS.overlay}:not([hidden]))'],
  [search, 'html:has(.atlas-search-overlay.open)'],
  [sessions, 'html:has(.atlas-session-overlay.is-open)'],
  [accountGate, 'html:has(.atlas-account-gate-layer:not([hidden]))'],
  [compass, 'html:has(#owned-subject-dialog:not([hidden]))'],
  [compass, 'html:has(#subject-artwork-studio-backdrop:not([hidden]))'],
  [subject, 'html:has(.atlas-my-version-dialog:not([hidden]))']
];

expected.forEach(([source, selector]) => {
  assert.ok(source.includes(selector), 'Missing modal document lock: ' + selector);
});

assert.ok(feedback.includes('max-height: calc(100dvh - 2rem);'));
assert.ok(feedback.includes('overscroll-behavior: contain;'));

console.log('Atlas 5.1 modal scroll-lock contract passed.');
