'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync(
  'arcade/truth-trap/index.html',
  'utf8'
);

const sessionStart =
  source.indexOf(
    "window.addEventListener('atlas:session-change'"
  );

const sessionEnd =
  source.indexOf(
    '/* ================================================================\n       RUN',
    sessionStart
  );

assert.ok(
  sessionStart >= 0 &&
  sessionEnd > sessionStart,
  'Truth Trap must own a session-change handler.'
);

const handler =
  source.slice(
    sessionStart,
    sessionEnd
  );

assert.match(
  handler,
  /const gameWasVisible =[\s\S]*?game\?\.classList\.contains\('visible'\) === true/,
  'Session changes must remember whether gameplay was already open.'
);

assert.match(
  handler,
  /if \(gameWasVisible\) \{[\s\S]*?game\.classList\.add\('visible'\);[\s\S]*?render\(\);[\s\S]*?return;/,
  'An already-open game may stay open when switching learner.'
);

assert.match(
  handler,
  /opening\.style\.display = '';[\s\S]*?game\.classList\.remove\('visible'\);/,
  'A session change while on the cover must preserve the cover.'
);

assert.doesNotMatch(
  handler,
  /startGame\s*\(/,
  'Session changes must never start Truth Trap.'
);

assert.match(
  handler,
  /event\.detail && event\.detail\.session/,
  'Truth Trap should use the session supplied by the session-change event when present.'
);

assert.match(
  handler,
  /covered >= TOTAL_CASES[\s\S]*?ST\.status === 'complete'[\s\S]*?ST\.status === 'completed'/,
  'Completed learners must still land on the completion screen.'
);

assert.match(
  source,
  /function updateStartButton\(covered = 0\)[\s\S]*?CONTINUE INVESTIGATION[\s\S]*?ENTER THE TRAP/,
  'Cover CTA must reflect saved progress without entering gameplay.'
);

const executableCalls =
  Array.from(
    source.matchAll(
      /\bstartGame\s*\(\s*\)/g
    )
  );

assert.equal(
  executableCalls.length,
  2,
  'Truth Trap should expose startGame only as the button action plus its function declaration; no hidden auto-start call may exist.'
);

console.log(
  'Truth Trap entry-state proof passed: initial/session setup cannot auto-start gameplay, active games survive learner switches, completed learners keep the completion screen, and cover CTA reflects progress.'
);
