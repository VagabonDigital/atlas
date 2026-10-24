'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const CURATION_SOURCE = fs.readFileSync(
    path.join(__dirname, '..', 'shared', 'atlas-original-curation.js'),
    'utf8'
);
const STORAGE_KEY = 'atlas::originalCuration';

function harness(initialStore = null) {
    const values = new Map(
        initialStore
            ? [[STORAGE_KEY, JSON.stringify(initialStore)]]
            : []
    );
    const writes = [];
    const localStorage = {
        getItem(key) {
            return values.has(key) ? values.get(key) : null;
        },
        setItem(key, value) {
            writes.push(['set', key]);
            values.set(key, value);
        },
        removeItem(key) {
            writes.push(['remove', key]);
            values.delete(key);
        }
    };
    const window = {
        addEventListener() {}
    };

    vm.runInNewContext(
        CURATION_SOURCE,
        { window, localStorage, console },
        { filename: 'atlas-original-curation.js' }
    );

    return {
        api: window.AtlasOriginalCuration,
        values,
        writes
    };
}

function store(order = [], items = {}) {
    return {
        schemaVersion: 2,
        items,
        order: order.map(id => 'compass:' + id)
    };
}

function subjects(ids) {
    return ids.map(id => ({ registryId: 'compass:' + id }));
}

function ids(list) {
    return Array.from(list, subject =>
        subject.registryId.replace(/^compass:/, '')
    );
}

function registryIds(list) {
    return Array.from(list, subject => subject.registryId);
}

test('a fresh library uses catalogue order without saving a preference', () => {
    const instance = harness();
    const result = instance.api.sortSubjects(
        subjects(['new-top', 'old-a', 'new-middle', 'old-b'])
    );

    assert.deepEqual(
        ids(result),
        ['new-top', 'old-a', 'new-middle', 'old-b']
    );
    assert.equal(instance.values.has(STORAGE_KEY), false);
    assert.deepEqual(instance.writes, []);
});

test('new Originals enter their catalogue positions in a legacy default order', () => {
    const oldStore = store(['old-a', 'old-b', 'old-c']);
    const instance = harness(oldStore);

    assert.deepEqual(
        ids(instance.api.sortSubjects(subjects([
            'new-top', 'old-a', 'new-middle', 'old-b', 'old-c'
        ]))),
        ['new-top', 'old-a', 'new-middle', 'old-b', 'old-c']
    );

    // Rendering must not rewrite local or cloud-authoritative curation.
    assert.equal(
        instance.values.get(STORAGE_KEY),
        JSON.stringify(oldStore)
    );
    assert.deepEqual(instance.writes, []);
});

test('a legacy customised order stays intact as Originals are published', () => {
    const instance = harness(store(['old-b', 'old-a', 'old-c']));

    const result = ids(instance.api.sortSubjects(subjects([
        'new-top', 'old-a', 'new-middle', 'old-b', 'old-c'
    ])));

    assert.deepEqual(result, [
        'new-top', 'new-middle', 'old-b', 'old-a', 'old-c'
    ]);
    assert.deepEqual(
        result.filter(id => id.startsWith('old-')),
        ['old-b', 'old-a', 'old-c']
    );
    assert.deepEqual(instance.writes, []);
});

test('newly published subjects at the end are appended in catalogue order', () => {
    const instance = harness(store(['old-b', 'old-a']));

    assert.deepEqual(
        ids(instance.api.sortSubjects(
            subjects(['old-a', 'old-b', 'new-one', 'new-two'])
        )),
        ['old-b', 'old-a', 'new-one', 'new-two']
    );
});

test('archived state does not establish manual ordering', () => {
    const instance = harness(store([], {
        'compass:old-b': { state: 'archived', updatedAt: 1000 }
    }));

    assert.deepEqual(
        ids(instance.api.sortSubjects(subjects([
            'new-top', 'old-a', 'old-b'
        ]))),
        ['new-top', 'old-a', 'old-b']
    );
    assert.equal(instance.api.isHidden('compass:old-b'), true);
    assert.deepEqual(instance.writes, []);
});

test('the first manual move persists the positions actually displayed', () => {
    const instance = harness();
    const catalogue = subjects(['new-top', 'old-a', 'old-b']);
    const displayed = instance.api.sortSubjects(catalogue);
    const displayedIds = registryIds(displayed);

    assert.equal(
        instance.api.moveVisible(
            'compass:new-top', 1, displayedIds, displayedIds
        ),
        true
    );
    assert.deepEqual(
        ids(instance.api.sortSubjects(catalogue)),
        ['old-a', 'new-top', 'old-b']
    );
    assert.equal(instance.writes.length, 1);
});

test('a first move after catalogue expansion does not jump to a stale slot', () => {
    const instance = harness(store(['old-a', 'old-b', 'old-c']));
    const catalogue = subjects(['new-top', 'old-a', 'old-b', 'old-c']);
    const displayed = instance.api.sortSubjects(catalogue);
    const allIds = registryIds(displayed);

    assert.equal(
        instance.api.moveVisible('compass:new-top', 1, allIds, allIds),
        true
    );
    assert.deepEqual(
        ids(instance.api.sortSubjects(catalogue)),
        ['old-a', 'new-top', 'old-b', 'old-c']
    );
});

test('movement preserves the placement of hidden Originals', () => {
    const instance = harness(store(['old-a', 'old-b', 'old-c']));
    const catalogue = subjects(['new-top', 'old-a', 'old-b', 'old-c']);
    const visible = subjects(['new-top', 'old-a', 'old-c']);
    const visibleIds = registryIds(instance.api.sortSubjects(visible));
    const allIds = registryIds(instance.api.sortSubjects(catalogue));

    assert.equal(
        instance.api.moveVisible(
            'compass:new-top', 1, visibleIds, allIds
        ),
        true
    );
    assert.deepEqual(
        ids(instance.api.sortSubjects(visible)),
        ['old-a', 'new-top', 'old-c']
    );
    assert.deepEqual(
        ids(instance.api.sortSubjects(catalogue)),
        ['old-a', 'new-top', 'old-b', 'old-c']
    );
});
