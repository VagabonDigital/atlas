'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const path =
    'shared/atlas-learner-continuity-cloud-authority.js';
const source = fs.readFileSync(path, 'utf8');

const USER_ID = 'user-a';
const AUTH_KEY =
    'sb-jnhjfpagectprceswvqn-auth-token';
const OWNER_KEY =
    'atlas::learnerContinuityCloudOwner::v1';
const REVIEW_PREFIX =
    'atlas::languageReviewCompletedThrough::v1::';

const clone = value =>
    JSON.parse(JSON.stringify(value));

class Storage {
    constructor() {
        this.data = new Map();
        this.writes = [];
    }

    get length() {
        return this.data.size;
    }

    key(index) {
        return [...this.data.keys()][index] ?? null;
    }

    getItem(key) {
        return this.data.get(key) ?? null;
    }

    setItem(key, value) {
        this.writes.push({
            operation: 'set',
            key
        });
        this.data.set(key, String(value));
    }

    removeItem(key) {
        this.writes.push({
            operation: 'remove',
            key
        });
        this.data.delete(key);
    }
}

function stateFor(sessionId, index) {
    return {
        schemaVersion: 1,
        sessionStates: {
            ['compass:item-' + index]: {
                explored: true,
                progress: index
            }
        },
        ledgerEntries: {
            ['language-' + index]: {
                id: 'language-' + index,
                sessionId,
                kind: 'language',
                term: 'Term ' + index
            }
        },
        handoffs: {
            ['handoff-' + index]: {
                id: 'handoff-' + index,
                sessionId,
                sourceWorld: 'compass'
            }
        },
        recentActivity: [{
            sessionId,
            registryId: 'compass:item-' + index,
            timestamp: 1000 + index
        }],
        languageReviewCompletedThrough:
            500 + index
    };
}

function remoteRows(count = 20) {
    return Array.from({ length: count }, (_, index) => {
        const sessionId = 'learner-' + index;

        return {
            owner_user_id: USER_ID,
            session_id: sessionId,
            schema_version: 1,
            revision: 1,
            state: stateFor(sessionId, index),
            updated_at:
                '2026-09-17T00:00:00.000Z'
        };
    });
}

function boot(rows) {
    const localStorage = new Storage();
    const sessionStorage = new Storage();

    localStorage.data.set(
        AUTH_KEY,
        JSON.stringify({
            user: { id: USER_ID }
        })
    );
    localStorage.data.set(OWNER_KEY, USER_ID);

    const bridgeState = {
        registry: {
            schemaVersion: 2,
            updatedAt: 1,
            worlds: {},
            items: {},
            sessionStates: {
                default: {
                    'arcade:shared': {
                        explored: true
                    }
                },
                'local-only': {
                    'compass:local': {
                        explored: true
                    }
                }
            },
            recentActivity: [
                {
                    sessionId: 'default',
                    registryId: 'arcade:shared',
                    timestamp: 50
                },
                {
                    sessionId: 'local-only',
                    registryId: 'compass:local',
                    timestamp: 40
                }
            ]
        },
        ledger: {
            schemaVersion: 1,
            updatedAt: 1,
            entries: {
                shared: {
                    id: 'shared',
                    sessionId: 'default',
                    kind: 'language'
                },
                localOnly: {
                    id: 'localOnly',
                    sessionId: 'local-only',
                    kind: 'language'
                }
            }
        },
        handoffs: {
            shared: {
                id: 'shared',
                sessionId: 'default'
            },
            localOnly: {
                id: 'localOnly',
                sessionId: 'local-only'
            }
        }
    };

    const counts = {
        registryReads: 0,
        registryWrites: 0,
        ledgerReads: 0,
        ledgerWrites: 0,
        handoffReads: 0,
        handoffWrites: 0
    };

    const Bridge = {
        defaultSessionId: 'default',
        keys: {
            handoffs: 'atlas::handoffs'
        },
        readRegistry() {
            counts.registryReads += 1;
            return clone(bridgeState.registry);
        },
        writeRegistry(value) {
            counts.registryWrites += 1;
            bridgeState.registry = clone(value);
            return clone(value);
        },
        readLedger() {
            counts.ledgerReads += 1;
            return clone(bridgeState.ledger);
        },
        writeLedger(value) {
            counts.ledgerWrites += 1;
            bridgeState.ledger = clone(value);
            return clone(value);
        },
        readJson(key, fallback) {
            if (key !== this.keys.handoffs) {
                return clone(fallback);
            }
            counts.handoffReads += 1;
            return clone(bridgeState.handoffs);
        },
        writeJson(key, value) {
            assert.equal(key, this.keys.handoffs);
            counts.handoffWrites += 1;
            bridgeState.handoffs = clone(value);
            return clone(value);
        },
        readSessions() {
            return [{
                id: 'default'
            }];
        },
        readActiveSession() {
            return { id: 'default' };
        }
    };

    const query = {
        select() {
            return this;
        },
        eq() {
            return Promise.resolve({
                data: clone(rows),
                error: null
            });
        }
    };

    const AtlasCloud = {
        async getSession() {
            return {
                user: { id: USER_ID }
            };
        },
        async getClient() {
            return {
                from() {
                    return Object.create(query);
                }
            };
        }
    };

    const listeners = new Map();

    const context = {
        console,
        Storage,
        localStorage,
        sessionStorage,
        AtlasBridge: Bridge,
        AtlasCloud,
        CustomEvent: class {
            constructor(type, init = {}) {
                this.type = type;
                this.detail = init.detail;
            }
        },
        requestAnimationFrame() {
            return 1;
        },
        setTimeout(fn) {
            fn();
            return 1;
        },
        clearTimeout() {},
        addEventListener(type, listener) {
            if (!listeners.has(type)) {
                listeners.set(type, []);
            }
            listeners.get(type).push(listener);
        },
        dispatchEvent() {}
    };

    context.window = context;

    vm.runInNewContext(
        source,
        context,
        { filename: path }
    );

    return {
        authority:
            context.AtlasLearnerContinuityCloudAuthority,
        bridgeState,
        counts,
        localStorage
    };
}

(async () => {
    const rows = remoteRows();
    const env = boot(rows);

    await env.authority.initialize();

    assert.deepEqual(
        env.counts,
        {
            registryReads: 1,
            registryWrites: 1,
            ledgerReads: 1,
            ledgerWrites: 1,
            handoffReads: 1,
            handoffWrites: 1
        },
        '20-record hydration must read/write each aggregate projection once'
    );

    assert.ok(
        env.bridgeState.registry.sessionStates.default,
        'Shared/default registry state must survive'
    );
    assert.ok(
        env.bridgeState.registry.sessionStates['local-only'],
        'same-account local named state absent from cloud must preserve current semantics'
    );
    assert.ok(
        env.bridgeState.ledger.entries.shared,
        'Shared/default ledger entries must survive'
    );
    assert.ok(
        env.bridgeState.ledger.entries.localOnly,
        'unmentioned same-account ledger entries must survive'
    );
    assert.ok(
        env.bridgeState.handoffs.shared,
        'Shared/default handoffs must survive'
    );
    assert.ok(
        env.bridgeState.handoffs.localOnly,
        'unmentioned same-account handoffs must survive'
    );

    const reviewWritesAfterFirstHydration =
        env.localStorage.writes.filter(write =>
            write.key.startsWith(REVIEW_PREFIX)
        ).length;

    assert.equal(
        reviewWritesAfterFirstHydration,
        20,
        'changed review watermarks should be written once each'
    );

    env.counts.registryReads = 0;
    env.counts.registryWrites = 0;
    env.counts.ledgerReads = 0;
    env.counts.ledgerWrites = 0;
    env.counts.handoffReads = 0;
    env.counts.handoffWrites = 0;
    env.localStorage.writes.length = 0;

    await env.authority.initialize({ force: true });

    assert.deepEqual(
        env.counts,
        {
            registryReads: 1,
            registryWrites: 0,
            ledgerReads: 1,
            ledgerWrites: 0,
            handoffReads: 1,
            handoffWrites: 0
        },
        'unchanged hydration must not rewrite aggregate projections'
    );

    assert.equal(
        env.localStorage.writes.filter(write =>
            write.key.startsWith(REVIEW_PREFIX)
        ).length,
        0,
        'unchanged review watermarks must not be rewritten'
    );

    console.log(
        'Atlas learner continuity batch projection passed.'
    );
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
