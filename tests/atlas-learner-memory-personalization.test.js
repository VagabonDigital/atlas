'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const memory = fs.readFileSync(
    'memory/index.html',
    'utf8'
);

const bridge = fs.readFileSync(
    'shared/atlas-bridge.js',
    'utf8'
);

const cloud = fs.readFileSync(
    'shared/atlas-learner-sessions-cloud.js',
    'utf8'
);

const authority = fs.readFileSync(
    'shared/atlas-learner-sessions-cloud-authority.js',
    'utf8'
);

const sessionPanel = fs.readFileSync(
    'shared/atlas-session-panel.js',
    'utf8'
);

assert.match(
    memory,
    /id="memory-goals"/,
    'Learner Memory must expose a Goals field.'
);

for (const id of [
    'memory-about',
    'memory-interests',
    'memory-goals'
]) {
    assert.match(
        memory,
        new RegExp(
            `id="${id}"[\\s\\S]*?maxlength="500"`
        ),
        `${id} must enforce the learner suggestion text cap.`
    );
}

assert.match(
    memory,
    /id="memory-about-suggestions"\s*type="checkbox"/,
    'About must expose an explicit suggestion-source control.'
);

assert.match(
    memory,
    /id="memory-interests-suggestions"[\s\S]*?type="checkbox"[\s\S]*?checked/,
    'Interests must default to use for suggestions.'
);

assert.match(
    memory,
    /id="memory-goals-suggestions"[\s\S]*?type="checkbox"[\s\S]*?checked/,
    'Goals must default to use for suggestions.'
);

assert.doesNotMatch(
    memory,
    /id="memory-about-suggestions"[\s\S]{0,120}?checked/,
    'About must remain opt-in for suggestions.'
);

assert.match(
    memory,
    /suggestionSources:\s*getSuggestionSources\(\)/,
    'Learner Memory saves suggestion-source permissions.'
);

assert.match(
    memory,
    /goals:\s*goalsTextarea\.value/,
    'Learner Memory saves Goals.'
);

assert.match(
    bridge,
    /LEARNER_MEMORY_SUGGESTION_TEXT_MAX\s*=\s*500/,
    'AtlasBridge must cap suggestion-source text at 500 characters.'
);

assert.match(
    bridge,
    /schemaVersion:\s*2[\s\S]*?goals:\s*''[\s\S]*?suggestionSources:/,
    'AtlasBridge must expose learner memory schema v2 with Goals and source permissions.'
);

assert.match(
    bridge,
    /about:\s*candidate\.about === true[\s\S]*?interests:\s*candidate\.interests !== false[\s\S]*?goals:\s*candidate\.goals !== false/,
    'AtlasBridge defaults must keep About opt-in and Interests/Goals enabled.'
);

assert.match(
    bridge,
    /!next\.goals\.trim\(\)/,
    'Goals must count as meaningful learner memory.'
);

assert.match(
    cloud,
    /LEARNER_MEMORY_SUGGESTION_TEXT_MAX\s*=\s*\n?\s*500/,
    'Cloud normalization must enforce the same 500-character cap.'
);

assert.match(
    cloud,
    /schemaVersion:\s*2[\s\S]*?goals:[\s\S]*?suggestionSources:/,
    'Cloud normalization must preserve Goals and source permissions.'
);

assert.match(
    authority,
    /String\(memory\.goals \|\| ''\)\.trim\(\)/,
    'Cloud-to-Bridge projection must preserve learner Goals.'
);

assert.match(
    memory,
    /atlas-learner-sessions-cloud\.js\?v=20260926-learnercontext1/,
    'Learner Memory must load the learner-context cloud adapter revision.'
);

assert.match(
    sessionPanel,
    /atlas-learner-sessions-cloud\.js\?v=20260926-learnercontext1/,
    'Shared learner runtime must load the learner-context cloud adapter revision.'
);

assert.match(
    sessionPanel,
    /atlas-learner-sessions-cloud-authority\.js\?v=20260926-learnercontext1/,
    'Shared learner runtime must load the learner-context authority revision.'
);

console.log(
    'Atlas learner-memory personalization contract verified.'
);
