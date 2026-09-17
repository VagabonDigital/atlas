'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(
    'shared/atlas-return-intent.js',
    'utf8'
);

class MemoryStorage {
    constructor() {
        this.map = new Map();
    }
    get length() { return this.map.size; }
    getItem(key) {
        return this.map.has(key) ? this.map.get(key) : null;
    }
    setItem(key, value) {
        this.map.set(String(key), String(value));
    }
    removeItem(key) {
        this.map.delete(String(key));
    }
    key(index) {
        return Array.from(this.map.keys())[index] || null;
    }
}

function makeHarness() {
    const localStorage = new MemoryStorage();
    const sessionStorage = new MemoryStorage();
    let counter = 0;

    const window = {
        window: null,
        localStorage,
        sessionStorage,
        location: {
            href: 'https://atlasfortutors.com/compass/',
            origin: 'https://atlasfortutors.com'
        },
        crypto: {
            randomUUID() {
                counter += 1;
                return `00000000-0000-0000-0000-${String(counter).padStart(12, '0')}`;
            }
        }
    };
    window.window = window;

    vm.runInNewContext(
        source,
        {
            console,
            window,
            URL,
            Date,
            JSON,
            Map,
            Set,
            Uint8Array,
            Object,
            Number,
            String,
            Boolean,
            Array,
            Math,
            RegExp
        },
        { filename: 'shared/atlas-return-intent.js' }
    );

    return {
        window,
        ReturnIntent: window.AtlasReturnIntent,
        sessionStorage
    };
}

function testQueuePreservesUntilDestinationConsumes() {
    const harness = makeHarness();
    const intent = harness.ReturnIntent.create({
        action: 'create-subject',
        destination: '/compass/?create=subject',
        context: { source: 'proof' }
    });

    const queued = harness.ReturnIntent.queueResume(intent.id);
    assert.equal(queued.id, intent.id);
    assert.ok(
        harness.ReturnIntent.get(intent.id),
        'Queueing must not consume the durable return intent on /account/.'
    );

    const resumed = harness.ReturnIntent.consumeQueuedResume(
        'https://atlasfortutors.com/compass/?create=subject'
    );

    assert.equal(resumed.id, intent.id);
    assert.equal(
        harness.ReturnIntent.get(intent.id),
        null,
        'Destination delivery should consume the intent exactly once.'
    );
    assert.equal(
        harness.ReturnIntent.consumeQueuedResume(
            'https://atlasfortutors.com/compass/?create=subject'
        ),
        null
    );
}

function testWrongDestinationFailsClosedWithoutDestroyingIntent() {
    const harness = makeHarness();
    const intent = harness.ReturnIntent.create({
        action: 'create-learner',
        destination: '/?learner=new',
        context: {}
    });

    harness.ReturnIntent.queueResume(intent.id);

    assert.equal(
        harness.ReturnIntent.consumeQueuedResume(
            'https://atlasfortutors.com/compass/'
        ),
        null
    );
    assert.ok(
        harness.ReturnIntent.get(intent.id),
        'A destination mismatch must not consume the underlying intent.'
    );
}

function testQueueRequiresValidStoredIntent() {
    const harness = makeHarness();
    assert.equal(
        harness.ReturnIntent.queueResume(
            'ri_abcdefghijklmnopqrstuvwx'
        ),
        null
    );
}

testQueuePreservesUntilDestinationConsumes();
testWrongDestinationFailsClosedWithoutDestroyingIntent();
testQueueRequiresValidStoredIntent();

console.log(
    'Atlas cross-page resume queue proof passed: account handoff preserves intent, destination validates and consumes once, mismatch fails closed.'
);
