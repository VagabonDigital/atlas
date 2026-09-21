'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const root = fs.readFileSync('index.html', 'utf8');

// Atlas should prefer explicit resumable session state, but recover Continue
// from a recent valid Compass handoff when continuity migration/hydration
// leaves sessionStates empty while saved language + handoffs still exist.
assert.match(
  root,
  /function getHandoffFallbackContinue\(reg, sessionId\)[\s\S]*?Bridge\.readJson\([\s\S]*?Bridge\.keys\.handoffs[\s\S]*?handoff\.world === COMPASS_ID[\s\S]*?handoff\.sessionId[\s\S]*?handoff\.subjectId/
);

assert.match(
  root,
  /getHandoffFallbackContinue[\s\S]*?Subjects\.getSessionSubjects\(cleanSessionId\)[\s\S]*?Array\.isArray\(refs\)[\s\S]*?registryItem\.ownershipKind !== 'my-subject'/
);

assert.match(
  root,
  /getHandoffFallbackContinue[\s\S]*?catalog\[registryId\][\s\S]*?Curation\.isHidden\(registryId\)/
);

assert.match(
  root,
  /const primaryContinueItem = getContinueItem\(reg, session\.id\)[\s\S]*?if \(continueItem\)[\s\S]*?getMatchingCompassHandoff[\s\S]*?else \{[\s\S]*?getHandoffFallbackContinue\([\s\S]*?continueItem = fallback\?\.item \|\| null[\s\S]*?continueHandoff = fallback\?\.handoff \|\| null/
);

// A handoff fallback must never blindly revive an archived registry item.
assert.match(
  root,
  /if \(registryItem\.archived === true\) \{[\s\S]*?continue;/
);

console.log(
  'Atlas Continue handoff fallback contract passed: saved-language-only continuity can recover a valid Compass Continue card synchronously without reviving removed content.'
);
