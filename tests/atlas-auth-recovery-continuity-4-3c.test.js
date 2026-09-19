'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const returnIntentSource = fs.readFileSync(
    'shared/atlas-return-intent.js',
    'utf8'
);

const returnHandoffSource = fs.readFileSync(
    'shared/atlas-return-handoff.js',
    'utf8'
);

const accountSource = fs.readFileSync(
    'shared/atlas-account.js',
    'utf8'
);

const accountGateSource = fs.readFileSync(
    'shared/atlas-account-gate.js',
    'utf8'
);

const accountPageSource = fs.readFileSync(
    'account/index.html',
    'utf8'
);

const compassEngineSource = fs.readFileSync(
    'compass/shared/compass-engine.js',
    'utf8'
);

const arcadeAccessSource = fs.readFileSync(
    'arcade/shared/arcade-public-access.js',
    'utf8'
);

class FakeStorage {
    constructor() {
        this.values = new Map();
    }

    get length() {
        return this.values.size;
    }

    key(index) {
        return Array.from(
            this.values.keys()
        )[index] || null;
    }

    getItem(key) {
        return this.values.has(key)
            ? this.values.get(key)
            : null;
    }

    setItem(key, value) {
        this.values.set(
            key,
            String(value)
        );
    }

    removeItem(key) {
        this.values.delete(key);
    }
}

function makeRuntime(
    href =
        'https://atlasfortutors.com/'
) {
    const localStorage =
        new FakeStorage();

    const sessionStorage =
        new FakeStorage();

    let uuidCounter = 0;

    const location = {
        href,
        origin:
            'https://atlasfortutors.com',
        replace() {}
    };

    Object.defineProperties(
        location,
        {
            pathname: {
                get() {
                    return new URL(
                        location.href
                    ).pathname;
                }
            },
            search: {
                get() {
                    return new URL(
                        location.href
                    ).search;
                }
            },
            hash: {
                get() {
                    return new URL(
                        location.href
                    ).hash;
                }
            }
        }
    );

    const window = {
        location,
        localStorage,
        sessionStorage,
        crypto: {
            randomUUID() {
                uuidCounter += 1;

                return (
                    '12345678-1234-1234-1234-' +
                    String(uuidCounter)
                        .padStart(12, '0')
                );
            }
        }
    };

    window.window = window;

    const context = {
        window,
        URL,
        Uint8Array,
        Date,
        Math,
        console
    };

    vm.runInNewContext(
        returnIntentSource,
        context,
        {
            filename:
                'shared/atlas-return-intent.js'
        }
    );

    return {
        window,
        context
    };
}

function installHandoff(
    runtime,
    href
) {
    const replacements = [];
    const historyUrls = [];

    runtime.window.location.href =
        href;

    runtime.window.location.replace =
        value => {
            replacements.push(value);
        };

    runtime.window.history = {
        replaceState(
            _state,
            _title,
            value
        ) {
            historyUrls.push(value);
        }
    };

    runtime.context.document = {
        title: 'Atlas Account'
    };

    vm.runInNewContext(
        returnHandoffSource,
        runtime.context,
        {
            filename:
                'shared/atlas-return-handoff.js'
        }
    );

    return {
        Handoff:
            runtime.window
                .AtlasReturnHandoff,
        replacements,
        historyUrls
    };
}

function createResourceIntent(
    runtime,
    {
        destination,
        operation,
        resourceKey,
        resourceId
    }
) {
    return runtime.window
        .AtlasReturnIntent.create({
            action:
                'open-gated-content',
            destination,
            context: {
                operation,
                [resourceKey]:
                    resourceId
            }
        });
}

function testSharedSubjectRecoveryRoundTrip() {
    const runtime = makeRuntime();

    const destination =
        '/compass/food-table/index.html' +
        '?share=s1_q4C8yF2tN6pW' +
        '&utm_source=linkedin' +
        '#discussion';

    const intent =
        createResourceIntent(
            runtime,
            {
                destination,
                operation:
                    'begin-compass-subject',
                resourceKey:
                    'subjectId',
                resourceId:
                    'food-table'
            }
        );

    const handoff =
        installHandoff(
            runtime,
            'https://atlasfortutors.com/account/' +
            '?ri=' +
            encodeURIComponent(
                intent.id
            )
        );

    assert.equal(
        handoff.Handoff
            .initialize()
            .destination,
        destination
    );

    assert.equal(
        handoff.Handoff
            .resumeIfAuthenticated({
                ready: true,
                authenticated: true,
                recovery: true
            }),
        null,
        'Recovery must own the account surface before ordinary return handoff.'
    );

    assert.deepEqual(
        handoff.replacements,
        []
    );

    assert.ok(
        runtime.window
            .AtlasReturnIntent
            .get(intent.id),
        'Recovery must not consume the interrupted resource intent.'
    );

    const resumed =
        handoff.Handoff
            .resumeIfAuthenticated({
                ready: true,
                authenticated: true,
                recovery: false
            });

    assert.equal(
        resumed.destination,
        destination
    );

    assert.deepEqual(
        handoff.replacements,
        [destination],
        'After recovery completes, Atlas must return to the exact shared subject URL.'
    );

    runtime.window.location.href =
        'https://atlasfortutors.com' +
        destination;

    const replayed =
        runtime.window
            .AtlasReturnIntent
            .consumeQueuedResume(
                runtime.window.location.href
            );

    assert.ok(replayed);
    assert.equal(
        replayed.action,
        'open-gated-content'
    );
    assert.equal(
        replayed.context.operation,
        'begin-compass-subject'
    );
    assert.equal(
        replayed.context.subjectId,
        'food-table'
    );
    assert.equal(
        replayed.destination,
        destination
    );
}

function testSharedGameRoundTrip() {
    const runtime = makeRuntime();

    const destination =
        '/arcade/tomorrow-got-weird/index.html' +
        '?share=g1_r7K2vM9xC4qT' +
        '&utm_source=direct';

    const intent =
        createResourceIntent(
            runtime,
            {
                destination,
                operation:
                    'begin-arcade-game',
                resourceKey:
                    'gameId',
                resourceId:
                    'arcade:tomorrow-got-weird'
            }
        );

    const handoff =
        installHandoff(
            runtime,
            'https://atlasfortutors.com/account/' +
            '?ri=' +
            encodeURIComponent(
                intent.id
            )
        );

    handoff.Handoff.initialize();

    const resumed =
        handoff.Handoff
            .resumeIfAuthenticated({
                ready: true,
                authenticated: true,
                recovery: false
            });

    assert.equal(
        resumed.destination,
        destination
    );

    assert.deepEqual(
        handoff.replacements,
        [destination]
    );

    runtime.window.location.href =
        'https://atlasfortutors.com' +
        destination;

    const replayed =
        runtime.window
            .AtlasReturnIntent
            .consumeQueuedResume(
                runtime.window.location.href
            );

    assert.equal(
        replayed.context.operation,
        'begin-arcade-game'
    );
    assert.equal(
        replayed.context.gameId,
        'arcade:tomorrow-got-weird'
    );
}

function testQueuedActionCannotReplayOnWrongDestination() {
    const runtime = makeRuntime();

    const intent =
        createResourceIntent(
            runtime,
            {
                destination:
                    '/compass/work-purpose/index.html' +
                    '?share=s1_k5R9vB3nH7dM',
                operation:
                    'begin-compass-subject',
                resourceKey:
                    'subjectId',
                resourceId:
                    'work-purpose'
            }
        );

    runtime.window
        .AtlasReturnIntent
        .queueResume(intent.id);

    assert.equal(
        runtime.window
            .AtlasReturnIntent
            .consumeQueuedResume(
                'https://atlasfortutors.com/compass/food-table/index.html'
            ),
        null,
        'A queued action must not replay on a different resource.'
    );

    assert.ok(
        runtime.window
            .AtlasReturnIntent
            .get(intent.id),
        'Destination mismatch must not destroy the underlying return intent.'
    );
}

function testRecoveryIntentWiring() {
    assert.match(
        accountSource,
        /requestPasswordReset\([\s\S]*?\{ returnIntentId = null \}[\s\S]*?accountReturnUrl\(\{ returnIntentId \}\)/
    );

    assert.match(
        accountGateSource,
        /requestPasswordReset\([\s\S]*?returnIntentId:[\s\S]*?activeReturnIntentId/
    );

    assert.match(
        accountPageSource,
        /requestPasswordReset\([\s\S]*?returnIntentId:[\s\S]*?AtlasReturnHandoff\.getPendingId\(\)/
    );

    assert.match(
        accountSource,
        /completePasswordRecovery\([\s\S]*?writeRecoveryHint\(false\);[\s\S]*?recovery: false/
    );

    const recoveryBranch =
        accountPageSource.indexOf(
            'state.authenticated && state.recovery'
        );

    const ordinaryResume =
        accountPageSource.indexOf(
            'AtlasReturnHandoff.resumeIfAuthenticated(state)'
        );

    assert.ok(
        recoveryBranch >= 0 &&
        ordinaryResume > recoveryBranch,
        'Recovery rendering must run before ordinary return handoff.'
    );
}

function testResourceResumeConsumers() {
    assert.match(
        compassEngineSource,
        /operation ===[\s\S]*?'begin-compass-subject'[\s\S]*?subjectId === MODULE\.id[\s\S]*?beginModule\(\{[\s\S]*?skipPublicAccessGate: true/
    );

    assert.match(
        arcadeAccessSource,
        /context\.operation !==[\s\S]*?BEGIN_GAME_OPERATION[\s\S]*?context\.gameId[\s\S]*?registryId/
    );
}

testSharedSubjectRecoveryRoundTrip();
testSharedGameRoundTrip();
testQueuedActionCannotReplayOnWrongDestination();
testRecoveryIntentWiring();
testResourceResumeConsumers();

console.log(
    'Batch 4.3C auth continuity passed: shared subject/game destinations and action context survive auth handoff, recovery owns the account flow until completion, password-reset emails preserve the opaque return intent, and queued actions cannot replay on the wrong resource.'
);
