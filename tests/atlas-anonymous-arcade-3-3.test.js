'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const catalogSource = fs.readFileSync(
    'shared/arcade-catalog-data.js',
    'utf8'
);
const arcade = fs.readFileSync(
    'arcade/index.html',
    'utf8'
);
const publicAccess = fs.readFileSync(
    'arcade/shared/arcade-public-access.js',
    'utf8'
);
const truthTrap = fs.readFileSync(
    'arcade/truth-trap/index.html',
    'utf8'
);
const tomorrow = fs.readFileSync(
    'arcade/tomorrow-got-weird/index.html',
    'utf8'
);
const wouldYouRather = fs.readFileSync(
    'arcade/would-you-rather/index.html',
    'utf8'
);
const search = fs.readFileSync(
    'shared/atlas-search.js',
    'utf8'
);

const window = {};

vm.runInNewContext(
    catalogSource,
    { window },
    {
        filename:
            'shared/arcade-catalog-data.js'
    }
);

const games =
    window.ArcadeCatalogData
        .getArcadeGames();

assert.equal(
    games.length,
    3,
    'Stage 3.3 keeps the real three-game Arcade catalogue visible'
);

const accessById =
    Object.fromEntries(
        games.map(game => [
            game.registryId,
            game.publicAccess
        ])
    );

assert.deepEqual(
    accessById,
    {
        'arcade:tomorrow-got-weird':
            'preview',
        'arcade:truth-trap':
            'full',
        'arcade:would-you-rather':
            'preview'
    },
    'Truth Trap must be the single fully playable anonymous game'
);

assert.equal(
    window.ArcadeCatalogData
        .getArcadeGamePublicAccess(
            'arcade:truth-trap'
        ),
    'full'
);

assert.equal(
    window.ArcadeCatalogData
        .getArcadeGamePublicAccess(
            'arcade:tomorrow-got-weird'
        ),
    'preview'
);

assert.equal(
    window.ArcadeCatalogData
        .getArcadeGamePublicAccess(
            'arcade:would-you-rather'
        ),
    'preview'
);

assert.match(
    arcade,
    /publicAccess:\s*game\.publicAccess === 'full'\s*\? 'full'\s*:\s*'preview'/
);

assert.match(
    arcade,
    /const authenticated =\s*Boolean\(\s*getStoredPresentationUserId\(\)\s*\)/
);

assert.match(
    arcade,
    /const preview =\s*anonymous &&\s*game\.publicAccess === 'preview'/
);

assert.match(
    arcade,
    /mode: 'preview',[\s\S]*?actionLabel: 'Preview'/
);

assert.match(
    search,
    /item\?\.publicAccess === 'preview'[\s\S]*?item\?\.world === 'arcade'[\s\S]*?item\?\.type === 'game'[\s\S]*?return 'Preview'/
);

assert.match(
    publicAccess,
    /function isAnonymousPreview\(registryId\)[\s\S]*?getPublicAccess\(registryId\) ===\s*'preview'/
);

assert.match(
    publicAccess,
    /Gate\.requireAuthentication\(\{[\s\S]*?action: 'open-gated-content'[\s\S]*?operation:[\s\S]*?BEGIN_GAME_OPERATION[\s\S]*?gameId:[\s\S]*?registryId[\s\S]*?mode: 'create'/
);

assert.match(
    publicAccess,
    /Gate\.subscribeResume\([\s\S]*?context\.operation !==\s*BEGIN_GAME_OPERATION[\s\S]*?context\.gameId[\s\S]*?onResume\(payload\)[\s\S]*?replay: true/
);

for (const [
    name,
    source,
    buttonId
] of [
    [
        'Tomorrow Got Weird',
        tomorrow,
        'launch-button'
    ],
    [
        'Would You Rather',
        wouldYouRather,
        'btn-start'
    ]
]) {
    assert.match(
        source,
        /arcade-catalog-data\.js/
    );

    assert.match(
        source,
        /arcade-public-access\.js/
    );

    assert.match(
        source,
        /publicAccess:[\s\S]*?getArcadeGamePublicAccess/
    );

    assert.match(
        source,
        /async function startGame\([\s\S]*?skipPublicAccessGate = false[\s\S]*?isAnonymousPreview[\s\S]*?requestGameAccess[\s\S]*?accessAllows/
    );

    assert.match(
        source,
        new RegExp(
            "document\\.getElementById\\(\\s*'" +
            buttonId +
            "'\\s*\\)"
        )
    );

    assert.doesNotMatch(
        source,
        /subscribeGameResume\([\s\S]*?startGame\(\{[\s\S]*?skipPublicAccessGate: true/
    );

    assert.match(
        source,
        /subscribeGameResume\([\s\S]*?readActiveSession\(\)[\s\S]*?readBridgeState\(\)[\s\S]*?update(?:Launch|Start)Button/
    );

    assert.match(
        source,
        /Play with free account/
    );

    assert.match(
        source,
        /window\.AtlasAnalytics\?\.arcadeGameStart/,
        name + ' keeps the real game start path'
    );
}

assert.match(
    truthTrap,
    /arcade-catalog-data\.js/
);

assert.match(
    truthTrap,
    /publicAccess:[\s\S]*?getArcadeGamePublicAccess/
);

assert.doesNotMatch(
    truthTrap,
    /arcade-public-access\.js|requestGameAccess|skipPublicAccessGate/,
    'Truth Trap must remain genuinely playable without an account gate'
);

assert.match(
    truthTrap,
    /function startGame\(\)[\s\S]*?AtlasAnalytics\?\.arcadeGameStart\([\s\S]*?'truth-trap'/
);

console.log(
    'Stage 3.3 anonymous Arcade contract passed: real catalogue visible, Truth Trap fully public, other games preview their real intros, gameplay gates at Start, post-auth return unlocks the cover without auto-starting, and Search exposes preview context.'
);
