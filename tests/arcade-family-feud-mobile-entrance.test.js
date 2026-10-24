'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const html = fs.readFileSync(
    path.join(__dirname, '..', 'arcade', 'family-feud', 'index.html'),
    'utf8'
);
const stylesheet = fs.readFileSync(
    path.join(__dirname, '..', 'arcade', 'family-feud', 'game.css'),
    'utf8'
);

const mobileAnchor =
    'The desktop entrance intentionally uses a narrow freestanding cabinet.';
const beginning = html.indexOf(mobileAnchor);
assert.ok(beginning >= 0, 'Family Feud mobile entrance rules must exist');

const mobileRules = html.slice(
    beginning,
    html.indexOf('    @media (max-width: 560px)', beginning)
);

test('mobile entrance overrides the narrow desktop cabinet width', () => {
    assert.match(mobileRules, /@media \(max-width: 700px\)/);
    assert.match(
        mobileRules,
        /\.stage\.entrance \.machine \{[^}]*width: 100%;/
    );
    assert.match(
        html,
        /@media \(min-width: 900px\)[\s\S]*?\.entrance \.machine \{/
    );
});

test('portrait entrance grows with content rather than clamping its height', () => {
    assert.match(
        mobileRules,
        /\.stage\.entrance \{[^}]*height: auto;[^}]*min-height: 0;[^}]*max-height: none;/
    );
    assert.match(
        mobileRules,
        /\.stage\.entrance \.machine \{[^}]*height: auto;[^}]*max-height: none;[^}]*flex: none;/
    );
});

test('the entrance board reserves six unobstructed rows', () => {
    assert.match(
        mobileRules,
        /\.stage\.entrance \.board \{[^}]*grid-template-rows: repeat\(6, minmax\(0, 1fr\)\);[^}]*height: 184px;[^}]*min-height: 0;/
    );
    assert.match(
        mobileRules,
        /\.stage\.entrance \.row \{[^}]*min-height: 0;/
    );
    assert.match(html, /id="board" class="board"/);
});

test('the start button stays in flow instead of overlaying answers', () => {
    assert.match(
        mobileRules,
        /\.stage\.entrance \.board-start \{[^}]*position: relative;[^}]*top: auto;[^}]*left: auto;/
    );
    assert.match(
        mobileRules,
        /\.stage\.entrance \.board-start \{[^}]*height: 66px;/
    );
    assert.match(html, /id="board-start" class="board-start"/);
});

test('player panels form a paired row directly below the cabinet', () => {
    assert.match(
        mobileRules,
        /\.stage\.entrance \.console \{[^}]*position: relative;[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/
    );
    assert.match(
        mobileRules,
        /\.stage\.entrance \.player-b \{\s*grid-column: 2;/
    );
    assert.match(html, /id="player-0" class="contestant player-a"/);
    assert.match(html, /id="player-1" class="contestant player-b"/);
});

test('phone cover keeps the Family Feud logo subordinate to the cabinet', () => {
    const logoRule = mobileRules.match(
        /\.stage\.entrance \.question h1 \{([^}]+)\}/
    )?.[1];
    assert.ok(logoRule, 'entrance logo should have a phone-specific rule');
    assert.match(
        logoRule,
        /font-size:\s*clamp\(29px, 8\.6vw, 40px\);/,
        'phone logo should retain the deliberately reduced mobile scale'
    );
    assert.match(
        html,
        /@media \(min-width: 900px\)[\s\S]*?\.entrance \.question h1 \{[^}]*font-size: clamp\(42px, 7\.2dvh, 84px\);/,
        'desktop entrance typography must remain unchanged'
    );
});

test('gameplay remains governed by separate non-entrance selectors', () => {
    assert.match(html, /\.stage:not\(\.entrance\) \.machine \{/);
    assert.match(html, /\.stage:not\(\.entrance\) \.console \{/);
    assert.match(html, /\.stage:not\(\.entrance\) \.board-start \{ display: none; \}/);
    assert.match(stylesheet, /\.stage:not\(\.entrance\) \.question/);
});

const mobileGameplayAnchor = 'In-play phone/tablet composition: full-width speech controls';
const mobileGameplayStart = html.indexOf(mobileGameplayAnchor);
assert.ok(mobileGameplayStart >= 0, 'Family Feud mobile gameplay rules must exist');
const mobileGameplay = html.slice(mobileGameplayStart, html.indexOf('  </style>', mobileGameplayStart));

test('phone gameplay grows naturally rather than crushing the board into a fixed viewport', () => {
    assert.match(mobileGameplay, /@media \(max-width: 820px\)/);
    assert.match(mobileGameplay, /\.stage:not\(\.entrance\) \{[^}]*height: auto;[^}]*display: flex;/);
    assert.match(mobileGameplay, /\.stage:not\(\.entrance\) \.question \{[^}]*height: auto;[^}]*min-height: 0;/);
    assert.match(mobileGameplay, /\.stage:not\(\.entrance\) \.board \{[^}]*height: clamp\(252px, 42dvh, 352px\);/);
    assert.match(mobileGameplay, /\.stage:not\(\.entrance\) \.board:not\(\.final-board\) \{[^}]*grid-template-rows: repeat\(6, minmax\(0, 1fr\)\);/);
});

test('phone gameplay gives both scores a row and the answer dock the entire width', () => {
    assert.match(mobileGameplay, /grid-template-areas: "player-a player-b" "dock dock";/);
    assert.match(mobileGameplay, /\.stage:not\(\.entrance\) \.dock \{[^}]*grid-area: dock;/);
    assert.match(mobileGameplay, /\.stage:not\(\.entrance\) #answer-form input \{[^}]*font-size: 16px;/);
    assert.match(mobileGameplay, /\.stage:not\(\.entrance\) #answer-form \.actions button \{[^}]*min-height: 44px;/);
    assert.match(mobileGameplay, /\.stage:not\(\.entrance\) \.reveal-actions \{[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
});
