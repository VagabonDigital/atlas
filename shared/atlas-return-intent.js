/* ============================================================
   ATLAS RETURN INTENT
   Canonical temporary contract for resuming a tutor's interrupted action
   after authentication.

   Batch 2.3A owns:
   - opaque intent identity
   - safe same-origin destination normalization
   - small JSON-safe action context
   - temporary local persistence across tabs / email confirmation
   - expiry, read, consume, and discard semantics

   This module does NOT own:
   - account-gate wiring
   - auth callback/query parameters
   - navigation/resume execution
   - protected-action interception
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasReturnIntent) return;

    const VERSION = 1;
    const STORAGE_PREFIX = 'atlas::returnIntent::v1::';
    const ID_PREFIX = 'ri_';
    const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;
    const MAX_TTL_MS = 7 * 24 * 60 * 60 * 1000;
    const MAX_DESTINATION_CHARS = 2048;
    const MAX_CONTEXT_CHARS = 2048;
    const MAX_CONTEXT_DEPTH = 6;
    const MAX_ID_ATTEMPTS = 8;
    const RESUME_QUEUE_VERSION = 1;
    const RESUME_QUEUE_KEY = 'atlas::returnIntentResume::v1';
    const RESUME_QUEUE_MAX_AGE_MS = 10 * 60 * 1000;

    const ACTION_TYPES = Object.freeze({
        CREATE_LEARNER: 'create-learner',
        SAVE_WORK: 'save-work',
        CREATE_SUBJECT: 'create-subject',
        EDIT_SUBJECT: 'edit-subject',
        OPEN_ACCOUNT_LIBRARY: 'open-account-library',
        OPEN_GATED_CONTENT: 'open-gated-content',
        CAPABILITY: 'capability'
    });

    const VALID_ACTIONS = new Set(
        Object.values(ACTION_TYPES)
    );

    const BLOCKED_CONTEXT_KEYS = new Set([
        '__proto__',
        'prototype',
        'constructor'
    ]);

    const memoryStore = new Map();

    function now() {
        return Date.now();
    }

    function storageKey(id) {
        return STORAGE_PREFIX + id;
    }

    function isValidId(value) {
        return new RegExp(
            `^${ID_PREFIX}[A-Za-z0-9_-]{20,80}$`
        ).test(String(value || ''));
    }

    function randomBytesHex(length = 16) {
        const bytes = new Uint8Array(length);

        if (
            window.crypto &&
            typeof window.crypto.getRandomValues === 'function'
        ) {
            window.crypto.getRandomValues(bytes);
            return Array.from(bytes, byte =>
                byte.toString(16).padStart(2, '0')
            ).join('');
        }

        let output = '';

        for (let index = 0; index < length * 2; index += 1) {
            output += Math.floor(Math.random() * 16).toString(16);
        }

        return output;
    }

    function createId() {
        if (
            window.crypto &&
            typeof window.crypto.randomUUID === 'function'
        ) {
            return ID_PREFIX +
                window.crypto.randomUUID().replace(/-/g, '');
        }

        return ID_PREFIX + randomBytesHex(16);
    }

    function normalizeAction(action) {
        const value = String(action || '').trim();

        if (!VALID_ACTIONS.has(value)) {
            throw new Error(
                'Atlas return intent requires a supported action type.'
            );
        }

        return value;
    }

    function normalizeDestination(destination) {
        const raw = String(destination || '').trim();

        if (!raw || raw.length > MAX_DESTINATION_CHARS) {
            throw new Error(
                'Atlas return intent requires a valid destination.'
            );
        }

        let url;

        try {
            url = new URL(raw, window.location.href);
        } catch {
            throw new Error(
                'Atlas return intent destination is invalid.'
            );
        }

        if (
            !['http:', 'https:'].includes(url.protocol) ||
            url.origin !== window.location.origin ||
            url.username ||
            url.password
        ) {
            throw new Error(
                'Atlas return intent destination must stay inside Atlas.'
            );
        }

        const pathname = url.pathname || '/';

        if (
            pathname === '/account' ||
            pathname.startsWith('/account/')
        ) {
            throw new Error(
                'Atlas return intent cannot point back to the account surface.'
            );
        }

        const normalized =
            pathname + url.search + url.hash;

        if (normalized.length > MAX_DESTINATION_CHARS) {
            throw new Error(
                'Atlas return intent destination is too long.'
            );
        }

        return normalized;
    }

    function assertContextValue(value, depth = 0) {
        if (depth > MAX_CONTEXT_DEPTH) {
            throw new Error(
                'Atlas return intent context is too deeply nested.'
            );
        }

        if (
            value === null ||
            typeof value === 'string' ||
            typeof value === 'boolean'
        ) {
            return;
        }

        if (typeof value === 'number') {
            if (!Number.isFinite(value)) {
                throw new Error(
                    'Atlas return intent context contains an invalid number.'
                );
            }
            return;
        }

        if (Array.isArray(value)) {
            value.forEach(item =>
                assertContextValue(item, depth + 1)
            );
            return;
        }

        if (
            !value ||
            typeof value !== 'object' ||
            (
                Object.getPrototypeOf(value) !== Object.prototype &&
                Object.getPrototypeOf(value) !== null
            )
        ) {
            throw new Error(
                'Atlas return intent context must be plain JSON data.'
            );
        }

        Object.entries(value).forEach(([key, item]) => {
            if (BLOCKED_CONTEXT_KEYS.has(key)) {
                throw new Error(
                    'Atlas return intent context contains a blocked key.'
                );
            }

            assertContextValue(item, depth + 1);
        });
    }

    function normalizeContext(context) {
        if (context === undefined || context === null) {
            return {};
        }

        if (
            typeof context !== 'object' ||
            Array.isArray(context)
        ) {
            throw new Error(
                'Atlas return intent context must be an object.'
            );
        }

        assertContextValue(context);

        let serialized;

        try {
            serialized = JSON.stringify(context);
        } catch {
            throw new Error(
                'Atlas return intent context must be serializable.'
            );
        }

        if (serialized.length > MAX_CONTEXT_CHARS) {
            throw new Error(
                'Atlas return intent context is too large.'
            );
        }

        return JSON.parse(serialized);
    }

    function normalizeTtl(ttlMs) {
        if (ttlMs === undefined || ttlMs === null) {
            return DEFAULT_TTL_MS;
        }

        const value = Number(ttlMs);

        if (
            !Number.isFinite(value) ||
            value <= 0 ||
            value > MAX_TTL_MS
        ) {
            throw new Error(
                'Atlas return intent expiry is invalid.'
            );
        }

        return Math.floor(value);
    }

    function cloneIntent(intent) {
        if (!intent) return null;

        return {
            ...intent,
            context: JSON.parse(
                JSON.stringify(intent.context || {})
            )
        };
    }

    function freezeIntent(intent) {
        const clone = cloneIntent(intent);

        if (!clone) return null;

        clone.context = Object.freeze(clone.context);
        return Object.freeze(clone);
    }

    function writeRecord(record) {
        const serialized = JSON.stringify(record);

        try {
            window.localStorage.setItem(
                storageKey(record.id),
                serialized
            );
            memoryStore.delete(record.id);
            return 'local';
        } catch {
            memoryStore.set(record.id, serialized);
            return 'memory';
        }
    }

    function readRaw(id) {
        let serialized = null;

        try {
            serialized = window.localStorage.getItem(
                storageKey(id)
            );
        } catch {
            serialized = null;
        }

        if (serialized === null) {
            serialized = memoryStore.get(id) || null;
        }

        return serialized;
    }

    function removeRaw(id) {
        try {
            window.localStorage.removeItem(storageKey(id));
        } catch { }

        memoryStore.delete(id);
    }

    function validateStoredRecord(candidate, expectedId) {
        if (
            !candidate ||
            typeof candidate !== 'object' ||
            Array.isArray(candidate) ||
            candidate.version !== VERSION ||
            candidate.id !== expectedId ||
            !isValidId(candidate.id) ||
            !VALID_ACTIONS.has(candidate.action)
        ) {
            return null;
        }

        let destination;
        let context;

        try {
            destination = normalizeDestination(
                candidate.destination
            );
            context = normalizeContext(candidate.context);
        } catch {
            return null;
        }

        if (destination !== candidate.destination) {
            return null;
        }

        const createdAt = Number(candidate.createdAt);
        const expiresAt = Number(candidate.expiresAt);

        if (
            !Number.isFinite(createdAt) ||
            !Number.isFinite(expiresAt) ||
            createdAt <= 0 ||
            expiresAt <= createdAt ||
            expiresAt - createdAt > MAX_TTL_MS
        ) {
            return null;
        }

        return {
            version: VERSION,
            id: candidate.id,
            action: candidate.action,
            destination,
            context,
            createdAt,
            expiresAt
        };
    }

    function hasRecord(id) {
        if (!isValidId(id)) return false;
        return readRaw(id) !== null;
    }

    function uniqueId() {
        for (
            let attempt = 0;
            attempt < MAX_ID_ATTEMPTS;
            attempt += 1
        ) {
            const id = createId();
            if (!hasRecord(id)) return id;
        }

        throw new Error(
            'Atlas could not create a unique return intent.'
        );
    }

    function create({
        action,
        destination = window.location.href,
        context = {},
        ttlMs = DEFAULT_TTL_MS
    } = {}) {
        clearExpired();

        const createdAt = now();
        const intent = {
            version: VERSION,
            id: uniqueId(),
            action: normalizeAction(action),
            destination: normalizeDestination(destination),
            context: normalizeContext(context),
            createdAt,
            expiresAt: createdAt + normalizeTtl(ttlMs)
        };

        writeRecord(intent);
        return freezeIntent(intent);
    }

    function get(id) {
        const normalizedId = String(id || '').trim();

        if (!isValidId(normalizedId)) return null;

        const serialized = readRaw(normalizedId);
        if (!serialized) return null;

        let candidate;

        try {
            candidate = JSON.parse(serialized);
        } catch {
            removeRaw(normalizedId);
            return null;
        }

        const intent = validateStoredRecord(
            candidate,
            normalizedId
        );

        if (!intent || intent.expiresAt <= now()) {
            removeRaw(normalizedId);
            return null;
        }

        return freezeIntent(intent);
    }

    function consume(id) {
        const intent = get(id);

        if (!intent) return null;

        removeRaw(intent.id);
        return intent;
    }

    function discard(id) {
        const normalizedId = String(id || '').trim();
        if (!isValidId(normalizedId)) return false;

        const existed = readRaw(normalizedId) !== null;
        removeRaw(normalizedId);
        return existed;
    }

    function clearQueuedResume() {
        try {
            window.sessionStorage.removeItem(
                RESUME_QUEUE_KEY
            );
        } catch { }
    }

    function queueResume(id) {
        const normalizedId = String(id || '').trim();
        const intent = get(normalizedId);

        if (!intent) return null;

        const record = {
            version: RESUME_QUEUE_VERSION,
            id: intent.id,
            queuedAt: now()
        };

        try {
            window.sessionStorage.setItem(
                RESUME_QUEUE_KEY,
                JSON.stringify(record)
            );
        } catch {
            return null;
        }

        return intent;
    }

    function readQueuedResumeRecord() {
        let serialized = null;

        try {
            serialized = window.sessionStorage.getItem(
                RESUME_QUEUE_KEY
            );
        } catch {
            return null;
        }

        if (!serialized) return null;

        let candidate = null;

        try {
            candidate = JSON.parse(serialized);
        } catch {
            clearQueuedResume();
            return null;
        }

        const queuedAt = Number(candidate?.queuedAt);
        const id = String(candidate?.id || '').trim();

        if (
            !candidate ||
            candidate.version !== RESUME_QUEUE_VERSION ||
            !isValidId(id) ||
            !Number.isFinite(queuedAt) ||
            queuedAt <= 0 ||
            now() - queuedAt > RESUME_QUEUE_MAX_AGE_MS
        ) {
            clearQueuedResume();
            return null;
        }

        return {
            version: RESUME_QUEUE_VERSION,
            id,
            queuedAt
        };
    }

    function consumeQueuedResume(
        destination = window.location.href
    ) {
        const queued = readQueuedResumeRecord();

        if (!queued) return null;

        clearQueuedResume();

        const intent = get(queued.id);
        if (!intent) return null;

        let currentDestination = null;

        try {
            currentDestination = normalizeDestination(
                destination
            );
        } catch {
            return null;
        }

        if (currentDestination !== intent.destination) {
            return null;
        }

        return consume(intent.id);
    }

    function clearExpired() {
        const candidateIds = new Set(memoryStore.keys());

        try {
            for (
                let index = 0;
                index < window.localStorage.length;
                index += 1
            ) {
                const key = window.localStorage.key(index);

                if (
                    key &&
                    key.startsWith(STORAGE_PREFIX)
                ) {
                    candidateIds.add(
                        key.slice(STORAGE_PREFIX.length)
                    );
                }
            }
        } catch { }

        let removed = 0;

        candidateIds.forEach(id => {
            if (!isValidId(id)) {
                removeRaw(id);
                removed += 1;
                return;
            }

            const serialized = readRaw(id);
            let candidate = null;

            try {
                candidate = serialized
                    ? JSON.parse(serialized)
                    : null;
            } catch { }

            const intent = validateStoredRecord(
                candidate,
                id
            );

            if (!intent || intent.expiresAt <= now()) {
                removeRaw(id);
                removed += 1;
            }
        });

        return removed;
    }

    clearExpired();

    window.AtlasReturnIntent = Object.freeze({
        VERSION,
        ACTION_TYPES,
        DEFAULT_TTL_MS,
        MAX_TTL_MS,
        MAX_CONTEXT_CHARS,
        create,
        get,
        consume,
        discard,
        clearExpired,
        isValidId,
        normalizeDestination,
        queueResume,
        consumeQueuedResume,
        clearQueuedResume
    });
})();
