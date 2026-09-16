'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const SOURCE_PATH = 'shared/atlas-return-intent.js';
const SOURCE = fs.readFileSync(SOURCE_PATH, 'utf8');

function createStorage() {
    const values = new Map();

    return {
        get length() {
            return values.size;
        },
        key(index) {
            return Array.from(values.keys())[index] ?? null;
        },
        getItem(key) {
            return values.has(String(key))
                ? values.get(String(key))
                : null;
        },
        setItem(key, value) {
            values.set(String(key), String(value));
        },
        removeItem(key) {
            values.delete(String(key));
        },
        clear() {
            values.clear();
        },
        dump() {
            return new Map(values);
        }
    };
}

const storage = createStorage();
let uuidCounter = 0;

global.window = global;
global.location = {
    href: 'https://atlasfortutors.com/compass/?view=my-subjects#recent',
    origin: 'https://atlasfortutors.com'
};
global.localStorage = storage;
Object.defineProperty(global, 'crypto', {
    configurable: true,
    value: {
        randomUUID() {
            uuidCounter += 1;
            return `00000000-0000-4000-8000-${String(uuidCounter).padStart(12, '0')}`;
        }
    }
});

function loadModule() {
    delete window.AtlasReturnIntent;
    vm.runInThisContext(SOURCE, { filename: SOURCE_PATH });
    return window.AtlasReturnIntent;
}

let Intent = loadModule();

assert.ok(Intent, 'AtlasReturnIntent should initialize.');
assert.equal(Intent.VERSION, 1);
assert.equal(Intent.DEFAULT_TTL_MS, 24 * 60 * 60 * 1000);
assert.equal(Intent.ACTION_TYPES.CREATE_LEARNER, 'create-learner');
assert.equal(Intent.ACTION_TYPES.SAVE_WORK, 'save-work');
assert.equal(Intent.ACTION_TYPES.CREATE_SUBJECT, 'create-subject');
assert.equal(Intent.ACTION_TYPES.EDIT_SUBJECT, 'edit-subject');
assert.equal(Intent.ACTION_TYPES.OPEN_ACCOUNT_LIBRARY, 'open-account-library');
assert.equal(Intent.ACTION_TYPES.OPEN_GATED_CONTENT, 'open-gated-content');
assert.equal(Intent.ACTION_TYPES.CAPABILITY, 'capability');

const created = Intent.create({
    action: Intent.ACTION_TYPES.CREATE_SUBJECT,
    destination: '/compass/?create=tutor#subjects',
    context: {
        source: 'compass-hub',
        capability: 'canCreateSubject',
        subjectId: 'draft-123'
    }
});

assert.match(created.id, /^ri_[A-Za-z0-9_-]{20,80}$/);
assert.equal(created.destination, '/compass/?create=tutor#subjects');
assert.equal(created.action, 'create-subject');
assert.deepEqual(created.context, {
    source: 'compass-hub',
    capability: 'canCreateSubject',
    subjectId: 'draft-123'
});
assert.ok(created.expiresAt > created.createdAt);
assert.equal(
    created.expiresAt - created.createdAt,
    Intent.DEFAULT_TTL_MS
);

const reread = Intent.get(created.id);
assert.equal(reread.id, created.id);
assert.equal(reread.destination, created.destination);
assert.notEqual(
    reread.context,
    created.context,
    'Reads should return cloned context rather than the stored object.'
);

// Reloading the module simulates another same-origin tab. The intent must
// survive because its canonical store is localStorage, not module memory.
Intent = loadModule();
const crossTab = Intent.get(created.id);
assert.equal(
    crossTab?.id,
    created.id,
    'Return intent should survive a same-browser tab/module reload.'
);

const consumed = Intent.consume(created.id);
assert.equal(consumed?.id, created.id);
assert.equal(Intent.get(created.id), null);
assert.equal(
    Intent.consume(created.id),
    null,
    'An intent must be consumable only once.'
);

const relative = Intent.create({
    action: Intent.ACTION_TYPES.OPEN_GATED_CONTENT,
    destination: '../arcade/?game=truth-trap#play',
    context: { registryId: 'arcade:truth-trap' },
    ttlMs: 60_000
});
assert.equal(
    relative.destination,
    '/arcade/?game=truth-trap#play',
    'Stored destinations should normalize to same-origin relative URLs.'
);
assert.equal(Intent.discard(relative.id), true);
assert.equal(Intent.discard(relative.id), false);

assert.throws(
    () => Intent.create({
        action: Intent.ACTION_TYPES.CREATE_SUBJECT,
        destination: 'https://evil.example/steal'
    }),
    /must stay inside Atlas/
);

assert.throws(
    () => Intent.create({
        action: Intent.ACTION_TYPES.CREATE_SUBJECT,
        destination: 'javascript:alert(1)'
    }),
    /must stay inside Atlas/
);

assert.throws(
    () => Intent.create({
        action: Intent.ACTION_TYPES.CREATE_SUBJECT,
        destination: '/account/?mode=signin'
    }),
    /cannot point back to the account surface/
);

assert.throws(
    () => Intent.create({
        action: 'invented-action',
        destination: '/compass/'
    }),
    /supported action type/
);

assert.throws(
    () => Intent.create({
        action: Intent.ACTION_TYPES.CAPABILITY,
        destination: '/compass/',
        context: 'not-an-object'
    }),
    /context must be an object/
);

assert.throws(
    () => Intent.create({
        action: Intent.ACTION_TYPES.CAPABILITY,
        destination: '/compass/',
        context: { payload: 'x'.repeat(Intent.MAX_CONTEXT_CHARS + 1) }
    }),
    /context is too large/
);

assert.throws(
    () => Intent.create({
        action: Intent.ACTION_TYPES.CAPABILITY,
        destination: '/compass/',
        ttlMs: Intent.MAX_TTL_MS + 1
    }),
    /expiry is invalid/
);

const expiring = Intent.create({
    action: Intent.ACTION_TYPES.SAVE_WORK,
    destination: '/compass/',
    context: { subjectId: 'subject-1' }
});

const expiringKey = Array.from(storage.dump().keys())
    .find(key => key.endsWith(expiring.id));
assert.ok(expiringKey, 'Stored return-intent key should be discoverable.');

const expiredRecord = JSON.parse(storage.getItem(expiringKey));
expiredRecord.createdAt = 1;
expiredRecord.expiresAt = 2;
storage.setItem(expiringKey, JSON.stringify(expiredRecord));

assert.equal(
    Intent.get(expiring.id),
    null,
    'Expired intents should fail closed and clean themselves up.'
);
assert.equal(storage.getItem(expiringKey), null);

const tampered = Intent.create({
    action: Intent.ACTION_TYPES.EDIT_SUBJECT,
    destination: '/compass/subject-one/',
    context: { subjectId: 'subject-one' }
});
const tamperedKey = Array.from(storage.dump().keys())
    .find(key => key.endsWith(tampered.id));
const tamperedRecord = JSON.parse(storage.getItem(tamperedKey));
tamperedRecord.destination = 'https://evil.example/';
storage.setItem(tamperedKey, JSON.stringify(tamperedRecord));

assert.equal(
    Intent.get(tampered.id),
    null,
    'Tampered stored destinations must be rejected rather than followed.'
);
assert.equal(storage.getItem(tamperedKey), null);

storage.setItem('unrelated-key', 'keep-me');
storage.setItem(
    'atlas::returnIntent::v1::broken',
    JSON.stringify({ version: 1, id: 'broken' })
);
const removed = Intent.clearExpired();
assert.ok(removed >= 1);
assert.equal(
    storage.getItem('unrelated-key'),
    'keep-me',
    'Return-intent cleanup must not touch unrelated browser storage.'
);

console.log(
    'Atlas return intent proof passed: safe same-origin destinations, opaque cross-tab storage, bounded context, expiry, consume-once, and tamper rejection.'
);
