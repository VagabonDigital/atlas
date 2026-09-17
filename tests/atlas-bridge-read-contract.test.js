'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const path = 'shared/atlas-bridge.js';
const source = fs.readFileSync(path, 'utf8');
const sessionsKey = 'atlas::sessions';
const activeKey = 'atlas::activeSessionId';
const clone = value => JSON.parse(JSON.stringify(value));
const session = (id, lastActiveAt = 1) => ({
    id, name: id, createdAt: 1, updatedAt: 1, lastActiveAt
});

function boot(code = source, { sessions, active = 'default', legacy, blocked = false } = {}) {
    const writes = [];
    function storage(kind) {
        const data = new Map();
        return {
            data,
            getItem(key) { return data.get(key) ?? null; },
            setItem(key, value) {
                writes.push({ kind, key, operation: 'set' });
                if (blocked) throw new Error('storage unavailable');
                data.set(key, String(value));
            },
            removeItem(key) {
                writes.push({ kind, key, operation: 'remove' });
                if (blocked) throw new Error('storage unavailable');
                data.delete(key);
            }
        };
    }
    const localStorage = storage('local');
    const sessionStorage = storage('tab');
    if (sessions !== undefined) {
        localStorage.data.set(sessionsKey,
            typeof sessions === 'string' ? sessions : JSON.stringify(sessions));
    }
    if (active !== null) sessionStorage.data.set(activeKey, active);
    if (legacy) localStorage.data.set(activeKey, legacy);
    const events = [];
    const listeners = new Map();
    const labels = new Map();
    for (const id of ['spine-session-name', 'mobile-session-name', 'drawer-session-name']) {
        labels.set(id, { textContent: '', closest: () => ({ setAttribute() {} }) });
    }
    let nextId = 0;
    const context = {
        localStorage, sessionStorage, console,
        Date: class extends Date { static now() { return 1000; } },
        crypto: { randomUUID: () => `fixture-${++nextId}` },
        document: {
            querySelector: () => ({}), // Do not load analytics in the probe.
            getElementById: id => labels.get(id),
            documentElement: { dataset: {}, classList: { add() {}, remove() {} } }
        },
        CustomEvent: class {
            constructor(type, init = {}) { this.type = type; this.detail = init.detail; }
        },
        setTimeout: () => 1, clearTimeout() {},
        addEventListener(type, listener) {
            if (!listeners.has(type)) listeners.set(type, []);
            listeners.get(type).push(listener);
        },
        dispatchEvent(event) {
            events.push(event);
            for (const listener of listeners.get(event.type) || []) listener(event);
        }
    };
    context.window = context;
    vm.runInNewContext(code, context, { filename: path });
    return { bridge: context.AtlasBridge, context, localStorage, sessionStorage, writes, events, labels };
}

function withoutWrites(env, fn) {
    env.writes.length = 0;
    const result = fn();
    assert.deepEqual(env.writes, [], 'read path attempted a persistence write');
    return result;
}

const fixture = [session('default'), ...Array.from({ length: 20 }, (_,i) => session(`learner-${i}`, i + 2))];
const reads = ['readSessions', 'readActiveSessionId', 'readActiveSession', 'readAppearanceMode', 'hydrateSessionChrome'];
const counts = [];
for (const method of reads) {
    const after = boot(source, { sessions: fixture, active: 'learner-4' });
    for (let i = 0; i < 5; i++) withoutWrites(after, () => after.bridge[method]());
    counts.push({ method, calls: 5, persistenceOperations: after.writes.length });
}

// Explicit normalization fixtures: default first, recency order, trimming,
// numeric timestamps, first duplicate wins, generated IDs, and invalid input.
const legacySessions = [
    null, false, { id: ' learner ', name: '  Name  ', createdAt: '2', updatedAt: '3', lastActiveAt: '9', extra: true },
    { id: 'learner', name: 'duplicate' }, { name: 'Generated ID' },
    session('older'), session('default')
];
const defaultSession = { id: 'default', name: 'Default', createdAt: 1000, updatedAt: 1000, lastActiveAt: 1000 };
const normalizedFixture = [session('default'), ...fixture.slice(1).reverse()];
const normalizedLegacy = [
    session('default'),
    { id: 'session-fixture-1', name: 'Generated ID', createdAt: 1000, updatedAt: 1000, lastActiveAt: 1000 },
    { id: 'learner', name: 'Name', createdAt: 2, updatedAt: 3, lastActiveAt: 9 },
    session('older')
];
for (const [sessions, expected, repairWrites] of [
    [normalizedFixture, normalizedFixture, 0],
    [fixture, normalizedFixture, 1],
    [legacySessions, normalizedLegacy, 1],
    ...['invalid JSON', '{}', 'null', [], undefined].map(input => [input, [defaultSession], 1])
]) {
    const after = boot(source, { sessions, active: 'learner' });
    assert.equal(after.writes.filter(write => write.key === sessionsKey && write.operation === 'set').length, repairWrites);
    assert.deepEqual(clone(after.bridge.readSessions()), expected);
    const expectedActive = expected.find(item => item.id === 'learner') || expected[0];
    assert.equal(after.bridge.readActiveSessionId(), expectedActive.id);
    assert.deepEqual(clone(after.bridge.readActiveSession()), expectedActive);
    assert.equal(after.localStorage.getItem(sessionsKey), JSON.stringify(expected));
    const repaired = clone(after.bridge.readSessions());
    withoutWrites(after, () => {
        assert.deepEqual(clone(after.bridge.readSessions()), repaired);
        after.bridge.readAppearanceMode();
        after.bridge.hydrateSessionChrome();
    });
    withoutWrites(after, () => after.bridge.repairSessionState()); // Already canonical.
}

// Bootstrap migrates legacy cross-tab selection but never replaces an existing tab selection.
for (const [active, expected] of [[null, 'learner'], ['older', 'older'], ['missing', 'default']]) {
    const after = boot(source, { sessions: [session('learner'), session('older')], active, legacy: 'learner' });
    assert.equal(after.sessionStorage.getItem(activeKey), expected);
    assert.equal(after.localStorage.getItem(activeKey), null);
}

// Missing/invalid selections resolve purely; explicit repair persists the fallback.
for (const active of [null, 'missing']) {
    const env = boot(source, { sessions: fixture });
    if (active === null) env.sessionStorage.data.delete(activeKey);
    else env.sessionStorage.data.set(activeKey, active);
    env.localStorage.data.set('atlas::appearanceBySession', JSON.stringify({ default: 'night' }));
    withoutWrites(env, () => {
        assert.equal(env.bridge.readActiveSessionId(), 'default');
        assert.equal(env.bridge.readActiveSession().id, 'default');
        assert.equal(env.bridge.readAppearanceMode(), 'night');
        env.bridge.hydrateSessionChrome();
        assert.equal(env.labels.get('spine-session-name').textContent, 'Shared');
    });
    assert.equal(env.sessionStorage.getItem(activeKey), active);
    env.bridge.repairSessionState();
    assert.equal(env.sessionStorage.getItem(activeKey), 'default');
}

// Repair can explicitly canonicalize malformed data introduced after bootstrap.
{
    const env = boot();
    env.localStorage.data.set(sessionsKey, JSON.stringify(legacySessions));
    env.bridge.repairSessionState();
    const repaired = clone(env.bridge.readSessions());
    withoutWrites(env, () => assert.deepEqual(clone(env.bridge.readSessions()), repaired));
    assert.equal(repaired.filter(item => item.id === 'learner').length, 1);
    assert.ok(repaired.some(item => item.name === 'Generated ID' && item.id));
}

// External session replacement repairs this tab at the storage-change boundary.
{
    const env = boot(source, { sessions: fixture, active: 'learner-4' });
    env.localStorage.data.set(sessionsKey, JSON.stringify([session('default')]));
    env.context.dispatchEvent({ type: 'storage', key: sessionsKey, storageArea: env.localStorage });
    assert.equal(env.sessionStorage.getItem(activeKey), 'default');
    env.bridge.writeSessions(fixture);
    assert.equal(env.bridge.readActiveSessionId(), 'default', 'deleted selection must not resurrect');
    env.localStorage.data.set(sessionsKey, JSON.stringify([session('account-b')]));
    env.sessionStorage.data.clear();
    env.context.dispatchEvent({ type: 'atlas:persistence-scope-change' });
    assert.deepEqual(env.bridge.readSessions().map(item => item.id).join(','), 'default,account-b');
    withoutWrites(env, () => env.bridge.readActiveSession());
}

// Explicit mutations preserve persisted data, selection, events, and theme behavior.
{
    const env = boot(source, { sessions: fixture });
    env.localStorage.data.set('atlas::appearanceBySession', JSON.stringify({ default: 'night', 'learner-4': 'light' }));
    const selected = { ...session('learner-4'), updatedAt: 1000, lastActiveAt: 1000 };
    const renamed = { ...selected, name: 'Renamed' };
    const created = { id: 'session-fixture-1', name: 'New learner', createdAt: 1000, updatedAt: 1000, lastActiveAt: 1000 };
    function mutation(method, args, expectedResult, expectedEvents) {
        env.events.length = 0;
        env.writes.length = 0;
        assert.deepEqual(clone(env.bridge[method](...args)), expectedResult, method);
        assert.deepEqual(clone(env.events), expectedEvents, method);
        assert.ok(env.writes.some(write => write.operation === 'set'), `${method} must persist`);
    }
    const sessionEvent = value => [{ type: 'atlas:session-change', detail: { session: value } }];
    mutation('setActiveSession', ['learner-4'], selected, sessionEvent(selected));
    assert.equal(env.sessionStorage.getItem(activeKey), 'learner-4');
    assert.equal(env.context.document.documentElement.dataset.theme, 'light');
    mutation('renameSession', ['learner-4', 'Renamed'], renamed, sessionEvent(renamed));
    assert.deepEqual(JSON.parse(env.localStorage.getItem(sessionsKey)).find(item => item.id === 'learner-4'), renamed);
    mutation('setAppearanceMode', ['night'], 'night', [{ type: 'atlas:appearance-change', detail: { mode: 'night', sessionId: 'learner-4' } }]);
    assert.equal(env.context.document.documentElement.dataset.theme, 'night');
    mutation('createSession', ['New learner'], created, sessionEvent(created));
    assert.equal(env.sessionStorage.getItem(activeKey), created.id);
    assert.equal(env.bridge.readAppearanceMode(), 'night');
    assert.deepEqual(JSON.parse(env.localStorage.getItem(sessionsKey)).find(item => item.id === created.id), created);
    const memory = { schemaVersion: 1, sessionId: 'learner-4', about: '', interests: '', notes: 'Remember', nextTime: '', updatedAt: 1000 };
    mutation('writeLearnerMemory', ['learner-4', { notes: 'Remember' }], memory,
        [{ type: 'atlas:learner-memory-change', detail: { sessionId: 'learner-4', memory } }]);
    assert.deepEqual(JSON.parse(env.localStorage.getItem('atlas::learnerMemory'))['learner-4'], memory);
    mutation('deleteSession', ['learner-4'], true, []);
    assert.equal(env.sessionStorage.getItem(activeKey), created.id);
    assert.ok(!JSON.parse(env.localStorage.getItem(sessionsKey)).some(item => item.id === 'learner-4'));
    assert.ok(!JSON.parse(env.localStorage.getItem('atlas::learnerMemory'))['learner-4']);
    mutation('deleteSession', [created.id], true, []);
    assert.equal(env.sessionStorage.getItem(activeKey), 'default');
    assert.equal(env.bridge.readAppearanceMode(), 'night');
    withoutWrites(env, () => assert.equal(env.bridge.deleteSession('default'), false));
    mutation('resetAllAtlasState', [], true, sessionEvent(defaultSession));
    assert.deepEqual(JSON.parse(env.localStorage.getItem(sessionsKey)), [defaultSession]);
    assert.equal(env.sessionStorage.getItem(activeKey), 'default');
}

// Cloud-style list replacement preserves a valid tab selection and repairs a removed one.
{
    const env = boot(source, { sessions: fixture, active: 'learner-4' });
    env.writes.length = 0;
    assert.equal(env.bridge.writeSessions(fixture), true);
    assert.equal(env.sessionStorage.getItem(activeKey), 'learner-4');
    assert.equal(env.writes.filter(write => write.key === sessionsKey).length, 1);
    env.bridge.writeSessions([session('default')]);
    assert.equal(env.sessionStorage.getItem(activeKey), 'default');
    const otherTab = boot(source, { sessions: fixture, active: 'learner-5' });
    assert.equal(otherTab.bridge.readActiveSessionId(), 'learner-5');
}

// Storage failures remain best-effort; ordinary reads never even attempt a write.
{
    const env = boot(source, { blocked: true });
    withoutWrites(env, () => {
        assert.equal(env.bridge.readActiveSessionId(), 'default');
        assert.equal(env.bridge.readActiveSession().id, 'default');
        assert.equal(env.bridge.readAppearanceMode(), 'light');
    });
    assert.equal(env.bridge.writeSessions(fixture), false);
}

// Partial failures: session-list and tab-selection storage can fail independently.
for (const failList of [false, true]) {
    for (const failTab of [false, true]) {
        const env = boot(source, { sessions: fixture, active: 'learner-4' });
        env.localStorage.data.set('atlas::appearanceBySession', JSON.stringify({
            default: 'night', 'learner-4': 'light'
        }));
        const localSet = env.localStorage.setItem;
        const tabSet = env.sessionStorage.setItem;
        env.localStorage.setItem = (key, value) => {
            if (failList && key === sessionsKey) throw new Error('session list quota');
            return localSet(key, value);
        };
        env.sessionStorage.setItem = (key, value) => {
            if (failTab && key === activeKey) throw new Error('tab storage unavailable');
            return tabSet(key, value);
        };
        const created = env.bridge.createSession('New learner');
        const expectedId = failTab ? 'learner-4' : failList ? 'default' : created.id;
        // The new mutation must establish the fallback before any getter runs.
        assert.equal(env.sessionStorage.getItem(activeKey), expectedId);
        assert.equal(env.bridge.readActiveSessionId(), expectedId);
        assert.equal(env.sessionStorage.getItem(activeKey), expectedId);
        assert.equal(env.bridge.readAppearanceMode(), expectedId === 'default' ? 'night' : 'light');
        assert.equal(JSON.parse(env.localStorage.getItem('atlas::appearanceBySession'))[created.id], 'light');
        const expectedCreated = { id: 'session-fixture-1', name: 'New learner', createdAt: 1000, updatedAt: 1000, lastActiveAt: 1000 };
        assert.deepEqual(clone(created), expectedCreated);
        assert.deepEqual(clone(env.events), [{ type: 'atlas:session-change', detail: { session: expectedCreated } }]);
        for (const method of reads) withoutWrites(env, () => env.bridge[method]());
        env.localStorage.setItem = localSet;
        env.sessionStorage.setItem = tabSet;
        // A later successful projection containing the failed creation cannot reactivate it.
        assert.equal(env.bridge.writeSessions([...fixture, created]), true);
        assert.equal(env.bridge.readActiveSessionId(), expectedId);
    }
}

console.table(counts);
console.log('PASS AtlasBridge read purity, explicit repair, legacy migration, mutations and theme contracts');
