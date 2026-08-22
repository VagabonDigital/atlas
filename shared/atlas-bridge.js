/* ============================================================
   ATLAS BRIDGE
   Canonical shared runtime state for Atlas, Compass, Arcade,
   and future Atlas surfaces.

   This file owns:
   - shared localStorage helpers
   - stable sessions
   - active session
   - Atlas registry
   - learning ledger
   - shared slugging

   Product/UI layers must not create parallel session systems.
   Atlas = read/router UI.
   Compass = subject behaviour UI.
   Arcade = game behaviour UI.
   AtlasBridge = shared state contract.
   ============================================================ */

(function () {
    'use strict';

    const KEYS = {
        sessions: 'atlas::sessions',
        activeSessionId: 'atlas::activeSessionId',
        handoffs: 'atlas::handoffs',
        registry: 'atlas::registry',
        ledger: 'learning::ledger',
        appearance: 'atlas::appearanceMode',
        appearanceBySession: 'atlas::appearanceBySession',
        preferences: 'atlas::preferences',
        learnerMemory: 'atlas::learnerMemory'
    };

    const DEFAULT_SESSION_ID = 'default';
    const APPEARANCE_TRANSITION_MS = 280;
    let appearanceTransitionTimer = null;

    // ============================================================
    // STORAGE HELPERS
    // ============================================================

    function storageGet(key) {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    }

    function storageSet(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch {
            return false;
        }
    }

    function storageRemove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch {
            return false;
        }
    }

    function tabStorageGet(key) {
        try {
            return sessionStorage.getItem(key);
        } catch {
            return null;
        }
    }

    function tabStorageSet(key, value) {
        try {
            sessionStorage.setItem(key, value);
            return true;
        } catch {
            return false;
        }
    }

    function tabStorageRemove(key) {
        try {
            sessionStorage.removeItem(key);
            return true;
        } catch {
            return false;
        }
    }

    function readJson(key, fallback) {
        try {
            const raw = storageGet(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch {
            return fallback;
        }
    }

    function writeJson(key, value) {
        return storageSet(key, JSON.stringify(value));
    }

    function slugify(value) {
        return String(value || '')
            .trim()
            .toLowerCase()
            .replace(/&/g, 'and')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'item';
    }

    function now() {
        return Date.now();
    }

    function createId(prefix = 'id') {
        if (window.crypto && typeof window.crypto.randomUUID === 'function') {
            return `${prefix}-${window.crypto.randomUUID()}`;
        }

        return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }

    // ============================================================
    // SESSIONS
    // ============================================================

    function createDefaultSession() {
        const timestamp = now();

        return {
            id: DEFAULT_SESSION_ID,
            name: 'Default',
            createdAt: timestamp,
            updatedAt: timestamp,
            lastActiveAt: timestamp
        };
    }

    function normalizeSession(session) {
        if (!session || typeof session !== 'object') return null;

        const id = typeof session.id === 'string' && session.id.trim()
            ? session.id.trim()
            : createId('session');

        const name = typeof session.name === 'string' && session.name.trim()
            ? session.name.trim()
            : 'Untitled Session';

        const timestamp = now();

        return {
            id,
            name,
            createdAt: Number(session.createdAt) || timestamp,
            updatedAt: Number(session.updatedAt) || timestamp,
            lastActiveAt: Number(session.lastActiveAt) || timestamp
        };
    }

    function readSessions() {
        const raw = readJson(KEYS.sessions, null);
        const normalized = Array.isArray(raw)
            ? raw.map(normalizeSession).filter(Boolean)
            : [];

        const byId = new Map();

        normalized.forEach(session => {
            if (!byId.has(session.id)) {
                byId.set(session.id, session);
            }
        });

        if (!byId.has(DEFAULT_SESSION_ID)) {
            byId.set(DEFAULT_SESSION_ID, createDefaultSession());
        }

        const sessions = Array.from(byId.values());

        sessions.sort((a, b) => {
            if (a.id === DEFAULT_SESSION_ID) return -1;
            if (b.id === DEFAULT_SESSION_ID) return 1;
            return (b.lastActiveAt || 0) - (a.lastActiveAt || 0);
        });

        writeJson(KEYS.sessions, sessions);

        return sessions;
    }

    function writeSessions(sessions) {
        const normalized = Array.isArray(sessions)
            ? sessions.map(normalizeSession).filter(Boolean)
            : [];

        if (!normalized.some(session => session.id === DEFAULT_SESSION_ID)) {
            normalized.unshift(createDefaultSession());
        }

        return writeJson(KEYS.sessions, normalized);
    }

    function readActiveSessionId() {
        const storedId = tabStorageGet(KEYS.activeSessionId);
        const sessions = readSessions();

        if (storedId && sessions.some(session => session.id === storedId)) {
            return storedId;
        }

        tabStorageSet(KEYS.activeSessionId, DEFAULT_SESSION_ID);
        return DEFAULT_SESSION_ID;
    }

    function readActiveSession() {
        const sessions = readSessions();
        const activeSessionId = readActiveSessionId();

        return sessions.find(session => session.id === activeSessionId) || sessions[0] || createDefaultSession();
    }

    function setActiveSession(sessionId) {
        const sessions = readSessions();
        const session = sessions.find(item => item.id === sessionId);

        if (!session) return null;

        const previousAppearanceMode = readAppearanceMode();
        const timestamp = now();

        const nextSession = {
            ...session,
            updatedAt: timestamp,
            lastActiveAt: timestamp
        };

        const nextSessions = sessions.map(item =>
            item.id === sessionId ? nextSession : item
        );

        writeSessions(nextSessions);
        tabStorageSet(KEYS.activeSessionId, nextSession.id);

        const nextAppearanceMode = readAppearanceMode();

        if (nextAppearanceMode !== previousAppearanceMode) {
            beginAppearanceTransition();
            applyAppearanceMode(nextAppearanceMode);
        }

        window.dispatchEvent(new CustomEvent('atlas:session-change', {
            detail: { session: nextSession }
        }));

        return nextSession;
    }

    function createSession(name) {
        const cleanName = String(name || '').trim();

        if (!cleanName) return null;

        const sessions = readSessions();
        const exists = sessions.some(session =>
            session.name.trim().toLowerCase() === cleanName.toLowerCase()
        );

        if (exists) return null;

        const inheritedAppearanceMode = readAppearanceMode();
        const timestamp = now();

        const session = {
            id: createId('session'),
            name: cleanName,
            createdAt: timestamp,
            updatedAt: timestamp,
            lastActiveAt: timestamp
        };

        writeSessions([...sessions, session]);
        tabStorageSet(KEYS.activeSessionId, session.id);
        writeSessionAppearanceMode(session.id, inheritedAppearanceMode);

        window.dispatchEvent(new CustomEvent('atlas:session-change', {
            detail: { session }
        }));

        return session;
    }

    function renameSession(sessionId, nextName) {
        const cleanName = String(nextName || '').trim();

        if (!cleanName) return null;

        const sessions = readSessions();
        const target = sessions.find(session => session.id === sessionId);

        if (!target) return null;

        const nameTaken = sessions.some(session =>
            session.id !== sessionId &&
            session.name.trim().toLowerCase() === cleanName.toLowerCase()
        );

        if (nameTaken) return null;

        const timestamp = now();

        const renamed = {
            ...target,
            name: cleanName,
            updatedAt: timestamp
        };

        writeSessions(sessions.map(session =>
            session.id === sessionId ? renamed : session
        ));

        if (readActiveSessionId() === sessionId) {
            window.dispatchEvent(new CustomEvent('atlas:session-change', {
                detail: { session: renamed }
            }));
        }

        return renamed;
    }

    function createEmptyLearnerMemory(sessionId) {
        return {
            schemaVersion: 1,
            sessionId,
            notes: '',
            nextTime: '',
            updatedAt: 0
        };
    }

    function normalizeLearnerMemory(record, sessionId) {
        const fallback = createEmptyLearnerMemory(sessionId);

        if (!record || typeof record !== 'object' || Array.isArray(record)) {
            return fallback;
        }

        return {
            schemaVersion: 1,
            sessionId,
            notes: typeof record.notes === 'string'
                ? record.notes
                : '',
            nextTime: typeof record.nextTime === 'string'
                ? record.nextTime
                : '',
            updatedAt: Number(record.updatedAt) || 0
        };
    }

    function readLearnerMemory(sessionId) {
        const cleanSessionId = String(sessionId || '').trim();

        if (!cleanSessionId) {
            return createEmptyLearnerMemory('');
        }

        const store = readJson(KEYS.learnerMemory, {});

        return normalizeLearnerMemory(
            store && typeof store === 'object'
                ? store[cleanSessionId]
                : null,
            cleanSessionId
        );
    }

    function writeLearnerMemory(sessionId, changes = {}) {
        const cleanSessionId = String(sessionId || '').trim();

        if (!cleanSessionId) return null;

        const sessionExists = readSessions().some(
            session => session.id === cleanSessionId
        );

        if (!sessionExists) return null;

        const store = readJson(KEYS.learnerMemory, {});
        const safeStore =
            store && typeof store === 'object' && !Array.isArray(store)
                ? store
                : {};

        const current = readLearnerMemory(cleanSessionId);

        const next = normalizeLearnerMemory(
            {
                ...current,
                ...changes,
                updatedAt: now()
            },
            cleanSessionId
        );

        if (!next.notes.trim() && !next.nextTime.trim()) {
            delete safeStore[cleanSessionId];
        } else {
            safeStore[cleanSessionId] = next;
        }

        writeJson(KEYS.learnerMemory, safeStore);

        window.dispatchEvent(
            new CustomEvent('atlas:learner-memory-change', {
                detail: {
                    sessionId: cleanSessionId,
                    memory: next
                }
            })
        );

        return next;
    }

    function removeLearnerMemory(sessionId) {
        const cleanSessionId = String(sessionId || '').trim();

        if (!cleanSessionId) return false;

        const store = readJson(KEYS.learnerMemory, {});

        if (
            !store ||
            typeof store !== 'object' ||
            !Object.prototype.hasOwnProperty.call(
                store,
                cleanSessionId
            )
        ) {
            return false;
        }

        delete store[cleanSessionId];
        writeJson(KEYS.learnerMemory, store);

        return true;
    }

    function purgeSessionData(sessionId) {
        removeLearnerMemory(sessionId);

        const registry = readRegistry();

        if (registry.sessionStates?.[sessionId]) {
            delete registry.sessionStates[sessionId];
        }

        registry.recentActivity = Array.isArray(registry.recentActivity)
            ? registry.recentActivity.filter(
                item => item?.sessionId !== sessionId
            )
            : [];

        writeRegistry(registry);

        const ledger = readLedger();

        Object.keys(ledger.entries || {}).forEach(entryId => {
            if (ledger.entries[entryId]?.sessionId === sessionId) {
                delete ledger.entries[entryId];
            }
        });

        writeLedger(ledger);

        const handoffs = readHandoffStore();

        Object.keys(handoffs).forEach(handoffId => {
            if (handoffs[handoffId]?.sessionId === sessionId) {
                delete handoffs[handoffId];
            }
        });

        writeJson(KEYS.handoffs, handoffs);
    }

    function deleteSession(sessionId) {
        if (sessionId === DEFAULT_SESSION_ID) return false;

        const previousAppearanceMode = readAppearanceMode();
        const sessions = readSessions();
        const nextSessions = sessions.filter(session => session.id !== sessionId);

        if (nextSessions.length === sessions.length) return false;

        writeSessions(nextSessions);
        removeSessionAppearanceMode(sessionId);
        purgeSessionData(sessionId);

        const activeSessionId = readActiveSessionId();

        if (activeSessionId === sessionId) {
            tabStorageSet(KEYS.activeSessionId, DEFAULT_SESSION_ID);

            const nextAppearanceMode = readAppearanceMode();

            if (nextAppearanceMode !== previousAppearanceMode) {
                beginAppearanceTransition();
                applyAppearanceMode(nextAppearanceMode);
            }

            window.dispatchEvent(new CustomEvent('atlas:session-change', {
                detail: { session: readActiveSession() }
            }));
        }

        return true;
    }

    // ============================================================
    // SESSION CHROME
    // Hydrates persistent session labels before first paint and keeps
    // them synchronized with the active Atlas session.
    // ============================================================

    function getSessionDisplayName(session = readActiveSession()) {
        if (!session || session.id === DEFAULT_SESSION_ID) {
            return 'Shared';
        }

        return session.name || 'Shared';
    }

    function hydrateSessionChrome() {
        if (typeof document === 'undefined') return;

        const displayName = getSessionDisplayName();

        [
            'spine-session-name',
            'mobile-session-name',
            'drawer-session-name'
        ].forEach(id => {
            const label = document.getElementById(id);

            if (!label) return;

            if (label.textContent !== displayName) {
                label.textContent = displayName;
            }

            const trigger = label.closest('button');

            if (trigger) {
                trigger.setAttribute(
                    'aria-label',
                    `Open session panel. Working with ${displayName}`
                );
            }
        });
    }

    // ============================================================
    // HANDOFFS
    // Latest lightweight handoff per session + subject.
    // ============================================================

    function getHandoffStorageId(sessionId, subjectId) {
        return `${encodeURIComponent(sessionId)}::${encodeURIComponent(subjectId)}`;
    }

    function readHandoffStore() {
        const stored = readJson(KEYS.handoffs, null);

        return stored && typeof stored === 'object' && !Array.isArray(stored)
            ? stored
            : {};
    }

    function normalizeHandoff(record) {
        if (!record || typeof record !== 'object' || Array.isArray(record)) {
            return null;
        }

        const sessionId = typeof record.sessionId === 'string'
            ? record.sessionId.trim()
            : '';

        const subjectId = typeof record.subjectId === 'string'
            ? record.subjectId.trim()
            : '';

        if (!sessionId || !subjectId) return null;

        const exploredItems = Array.isArray(record.exploredItems)
            ? record.exploredItems
                .map(item => {
                    if (!item || typeof item !== 'object') return null;

                    const id = typeof item.id === 'string'
                        ? item.id.trim()
                        : '';

                    const title = typeof item.title === 'string'
                        ? item.title.trim()
                        : '';

                    return id && title ? { id, title } : null;
                })
                .filter(Boolean)
            : [];

        const savedLanguageCount = Math.max(
            0,
            Math.floor(Number(record.savedLanguageCount) || 0)
        );

        const pickupLabel = typeof record.pickupLabel === 'string' && record.pickupLabel.trim()
            ? record.pickupLabel.trim()
            : null;

        const pickupRef = typeof record.pickupRef === 'string' && record.pickupRef.trim()
            ? record.pickupRef.trim()
            : null;

        return {
            v: 1,
            id: typeof record.id === 'string' && record.id.trim()
                ? record.id.trim()
                : createId('handoff'),
            sessionId,
            subjectId,
            subjectTitle: typeof record.subjectTitle === 'string'
                ? record.subjectTitle.trim()
                : '',
            world: typeof record.world === 'string'
                ? record.world.trim()
                : '',
            exploredItems,
            savedLanguageCount,
            pickupLabel,
            pickupRef,
            completedAt: Number(record.completedAt) || now()
        };
    }

    function writeHandoff(record) {
        const handoff = normalizeHandoff(record);

        if (!handoff) return null;

        const handoffs = readHandoffStore();
        const storageId = getHandoffStorageId(
            handoff.sessionId,
            handoff.subjectId
        );

        handoffs[storageId] = handoff;
        const written = writeJson(KEYS.handoffs, handoffs);

        return written ? handoff : null;
    }

    function readHandoff(sessionId, subjectId) {
        const cleanSessionId = typeof sessionId === 'string'
            ? sessionId.trim()
            : '';

        const cleanSubjectId = typeof subjectId === 'string'
            ? subjectId.trim()
            : '';

        if (!cleanSessionId || !cleanSubjectId) return null;

        const handoff = readHandoffStore()[
            getHandoffStorageId(cleanSessionId, cleanSubjectId)
        ];

        return normalizeHandoff(handoff);
    }

    function readLatestHandoff(sessionId) {
        const cleanSessionId = typeof sessionId === 'string'
            ? sessionId.trim()
            : '';

        if (!cleanSessionId) return null;

        return Object.values(readHandoffStore())
            .map(normalizeHandoff)
            .filter(handoff => handoff?.sessionId === cleanSessionId)
            .sort((a, b) => b.completedAt - a.completedAt)[0] || null;
    }

    // ============================================================
    // REGISTRY
    // ============================================================

    function createEmptyRegistry() {
        return {
            schemaVersion: 2,
            updatedAt: now(),
            worlds: {},
            items: {},
            sessionStates: {},
            recentActivity: []
        };
    }

    function normalizeRegistry(registry) {
        const fallback = createEmptyRegistry();

        if (!registry || typeof registry !== 'object' || Array.isArray(registry)) {
            return fallback;
        }

        return {
            ...registry,
            schemaVersion: 2,
            updatedAt: Number(registry.updatedAt) || now(),
            worlds: registry.worlds && typeof registry.worlds === 'object' && !Array.isArray(registry.worlds)
                ? registry.worlds
                : {},
            items: registry.items && typeof registry.items === 'object' && !Array.isArray(registry.items)
                ? registry.items
                : {},
            sessionStates: registry.sessionStates && typeof registry.sessionStates === 'object' && !Array.isArray(registry.sessionStates)
                ? registry.sessionStates
                : {},
            recentActivity: Array.isArray(registry.recentActivity)
                ? registry.recentActivity
                : []
        };
    }

    function readRegistry() {
        return normalizeRegistry(readJson(KEYS.registry, null));
    }

    function writeRegistry(registry) {
        const normalized = normalizeRegistry(registry);
        normalized.updatedAt = now();

        return writeJson(KEYS.registry, normalized);
    }

    function getContentRegistryId(world, id) {
        return `${world}:${id}`;
    }

    function upsertWorld(world) {
        if (!world || !world.registryId) return null;

        const registry = readRegistry();
        const timestamp = now();

        registry.worlds[world.registryId] = {
            ...(registry.worlds[world.registryId] || {}),
            ...world,
            updatedAt: timestamp
        };

        writeRegistry(registry);

        return registry.worlds[world.registryId];
    }

    function upsertItem(item) {
        if (!item || !item.registryId) return null;

        const registry = readRegistry();
        const timestamp = now();
        const existing = registry.items[item.registryId] || {};

        const preserveMyVersionIdentity =
            existing.hasMyVersion === true &&
            !Object.prototype.hasOwnProperty.call(
                item,
                'hasMyVersion'
            );

        const preserveOwnershipIdentity =
            (
                existing.ownershipKind === 'my-version' ||
                existing.ownershipKind === 'my-subject'
            ) &&
            !Object.prototype.hasOwnProperty.call(
                item,
                'ownershipKind'
            );

        let nextItem = item;

        if (preserveMyVersionIdentity) {
            nextItem = {
                ...nextItem,
                title: existing.title,
                navTitle: existing.navTitle,
                description: existing.description,
                hook: existing.hook,
                coverImage: existing.coverImage,
                ownershipKind:
                    existing.ownershipKind || 'my-version',
                hasMyVersion: true
            };
        }

        if (preserveOwnershipIdentity) {
            nextItem = {
                ...nextItem,
                ownershipKind: existing.ownershipKind
            };
        }

        registry.items[item.registryId] = {
            ...existing,
            ...nextItem,
            updatedAt: timestamp
        };

        writeRegistry(registry);

        return registry.items[item.registryId];
    }

    function removeItem(registryId) {
        const cleanRegistryId =
            String(registryId || '').trim();

        if (!cleanRegistryId) return false;

        let removed = false;

        const registry = readRegistry();

        if (
            Object.prototype.hasOwnProperty.call(
                registry.items,
                cleanRegistryId
            )
        ) {
            delete registry.items[cleanRegistryId];
            removed = true;
        }

        Object.keys(
            registry.sessionStates || {}
        ).forEach(sessionId => {
            const states =
                registry.sessionStates[sessionId];

            if (
                states &&
                typeof states === 'object' &&
                Object.prototype.hasOwnProperty.call(
                    states,
                    cleanRegistryId
                )
            ) {
                delete states[cleanRegistryId];
                removed = true;
            }

            if (
                states &&
                typeof states === 'object' &&
                Object.keys(states).length === 0
            ) {
                delete registry.sessionStates[sessionId];
            }
        });

        const recentActivity =
            Array.isArray(registry.recentActivity)
                ? registry.recentActivity
                : [];

        const nextRecentActivity =
            recentActivity.filter(
                item =>
                    item?.registryId !== cleanRegistryId
            );

        if (
            nextRecentActivity.length !==
            recentActivity.length
        ) {
            registry.recentActivity =
                nextRecentActivity;

            removed = true;
        }

        if (removed) {
            writeRegistry(registry);
        }

        const separatorIndex =
            cleanRegistryId.indexOf(':');

        if (separatorIndex > 0) {
            const world =
                cleanRegistryId.slice(
                    0,
                    separatorIndex
                );

            const itemId =
                cleanRegistryId.slice(
                    separatorIndex + 1
                );

            const ledger = readLedger();
            let ledgerChanged = false;

            Object.keys(
                ledger.entries || {}
            ).forEach(entryId => {
                const entry =
                    ledger.entries[entryId];

                if (
                    entry?.sourceWorld === world &&
                    entry?.sourceItem === itemId
                ) {
                    delete ledger.entries[entryId];
                    ledgerChanged = true;
                }
            });

            if (ledgerChanged) {
                writeLedger(ledger);
                removed = true;
            }

            const handoffs = readHandoffStore();
            let handoffsChanged = false;

            Object.keys(handoffs).forEach(
                handoffId => {
                    const handoff =
                        handoffs[handoffId];

                    if (
                        handoff?.subjectId === itemId &&
                        (
                            !handoff.world ||
                            handoff.world === world
                        )
                    ) {
                        delete handoffs[handoffId];
                        handoffsChanged = true;
                    }
                }
            );

            if (handoffsChanged) {
                writeJson(
                    KEYS.handoffs,
                    handoffs
                );

                removed = true;
            }
        }

        return removed;
    }

    function upsertSessionState(sessionId, registryId, state) {
        if (!sessionId || !registryId || !state || typeof state !== 'object') return null;

        const registry = readRegistry();
        const timestamp = now();

        registry.sessionStates[sessionId] =
            registry.sessionStates[sessionId] &&
                typeof registry.sessionStates[sessionId] === 'object' &&
                !Array.isArray(registry.sessionStates[sessionId])
                ? registry.sessionStates[sessionId]
                : {};

        registry.sessionStates[sessionId][registryId] = {
            ...(registry.sessionStates[sessionId][registryId] || {}),
            ...state,
            sessionId,
            registryId,
            updatedAt: timestamp,
            lastTouchedAt: state.lastTouchedAt || timestamp
        };

        writeRegistry(registry);

        return registry.sessionStates[sessionId][registryId];
    }

    function touchRecentActivity(activity) {
        if (!activity || !activity.sessionId || !activity.registryId) return [];

        const registry = readRegistry();
        const timestamp = now();

        const nextActivity = {
            ...activity,
            timestamp: activity.timestamp || timestamp
        };

        const previous = Array.isArray(registry.recentActivity)
            ? registry.recentActivity
            : [];

        registry.recentActivity = [
            nextActivity,
            ...previous.filter(item =>
                !(item.sessionId === nextActivity.sessionId && item.registryId === nextActivity.registryId)
            )
        ].slice(0, 50);

        writeRegistry(registry);

        return registry.recentActivity;
    }

    // ============================================================
    // LEARNING LEDGER
    // ============================================================

    function createEmptyLedger() {
        return {
            schemaVersion: 1,
            updatedAt: now(),
            entries: {}
        };
    }

    function normalizeLedger(ledger) {
        if (!ledger || typeof ledger !== 'object' || Array.isArray(ledger)) {
            return createEmptyLedger();
        }

        return {
            ...ledger,
            schemaVersion: 1,
            updatedAt: Number(ledger.updatedAt) || now(),
            entries: ledger.entries && typeof ledger.entries === 'object' && !Array.isArray(ledger.entries)
                ? ledger.entries
                : {}
        };
    }

    function readLedger() {
        return normalizeLedger(readJson(KEYS.ledger, null));
    }

    function writeLedger(ledger) {
        const normalized = normalizeLedger(ledger);
        normalized.updatedAt = now();

        return writeJson(KEYS.ledger, normalized);
    }

    function upsertLedgerEntry(entry) {
        if (!entry || !entry.id) return null;

        const ledger = readLedger();
        const timestamp = now();

        ledger.entries[entry.id] = {
            ...(ledger.entries[entry.id] || {}),
            ...entry,
            updatedAt: timestamp,
            lastTouchedAt: entry.lastTouchedAt || timestamp
        };

        writeLedger(ledger);

        return ledger.entries[entry.id];
    }

    // ============================================================
    // TUTOR PREFERENCES
    // ============================================================

    function createDefaultPreferences() {
        return {
            schemaVersion: 1,
            upgradeVisibility: 'key'
        };
    }

    function normalizePreferences(preferences) {
        const fallback = createDefaultPreferences();

        if (!preferences || typeof preferences !== 'object' || Array.isArray(preferences)) {
            return fallback;
        }

        const upgradeVisibility = ['off', 'key', 'all'].includes(preferences.upgradeVisibility)
            ? preferences.upgradeVisibility
            : fallback.upgradeVisibility;

        return {
            ...fallback,
            ...preferences,
            schemaVersion: 1,
            upgradeVisibility
        };
    }

    function readPreferences() {
        return normalizePreferences(readJson(KEYS.preferences, null));
    }

    function writePreferences(preferences) {
        const normalized = normalizePreferences(preferences);

        writeJson(KEYS.preferences, normalized);

        return normalized;
    }

    function readUpgradeVisibility() {
        return readPreferences().upgradeVisibility;
    }

    function setUpgradeVisibility(mode) {
        const upgradeVisibility = ['off', 'key', 'all'].includes(mode)
            ? mode
            : 'key';

        const preferences = writePreferences({
            ...readPreferences(),
            upgradeVisibility
        });

        window.dispatchEvent(new CustomEvent('atlas:preferences-change', {
            detail: {
                preferences,
                upgradeVisibility
            }
        }));

        return upgradeVisibility;
    }

    // ============================================================
    // APPEARANCE
    // ============================================================

    function beginAppearanceTransition() {
        if (typeof document === 'undefined' || !document.documentElement) return;

        const root = document.documentElement;

        root.classList.remove('theme-changing');
        void root.offsetWidth;
        root.classList.add('theme-changing');

        if (appearanceTransitionTimer !== null) {
            clearTimeout(appearanceTransitionTimer);
        }

        appearanceTransitionTimer = setTimeout(() => {
            root.classList.remove('theme-changing');
            appearanceTransitionTimer = null;
        }, APPEARANCE_TRANSITION_MS);
    }

    function normalizeAppearanceMode(mode) {
        return mode === 'night' ? 'night' : 'light';
    }

    function readSessionAppearanceModes() {
        const stored = readJson(KEYS.appearanceBySession, {});

        if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
            return {};
        }

        return Object.entries(stored).reduce((modes, [sessionId, mode]) => {
            if (mode === 'light' || mode === 'night') {
                modes[sessionId] = mode;
            }

            return modes;
        }, {});
    }

    function writeSessionAppearanceMode(sessionId, mode) {
        if (!sessionId) return normalizeAppearanceMode(mode);

        const normalized = normalizeAppearanceMode(mode);
        const modes = readSessionAppearanceModes();

        modes[sessionId] = normalized;
        writeJson(KEYS.appearanceBySession, modes);

        return normalized;
    }

    function removeSessionAppearanceMode(sessionId) {
        const modes = readSessionAppearanceModes();

        if (!Object.prototype.hasOwnProperty.call(modes, sessionId)) return;

        delete modes[sessionId];
        writeJson(KEYS.appearanceBySession, modes);
    }

    function readAppearanceMode() {
        const sessionId = readActiveSessionId();
        const sessionModes = readSessionAppearanceModes();

        if (sessionModes[sessionId] === 'light' || sessionModes[sessionId] === 'night') {
            return sessionModes[sessionId];
        }

        return normalizeAppearanceMode(storageGet(KEYS.appearance));
    }

    function applyAppearanceMode(mode = readAppearanceMode()) {
        const normalized = mode === 'night' ? 'night' : 'light';

        if (typeof document !== 'undefined' && document.documentElement) {
            document.documentElement.dataset.theme = normalized;
        }

        return normalized;
    }

    function setAppearanceMode(mode) {
        const sessionId = readActiveSessionId();
        const previousMode = readAppearanceMode();
        const normalized = writeSessionAppearanceMode(sessionId, mode);

        if (normalized !== previousMode) {
            beginAppearanceTransition();
        }

        applyAppearanceMode(normalized);

        window.dispatchEvent(new CustomEvent('atlas:appearance-change', {
            detail: { mode: normalized, sessionId }
        }));

        return normalized;
    }

    // ============================================================
    // DEV / RESET
    // ============================================================

    function resetAllAtlasState() {
        storageRemove(KEYS.sessions);
        storageRemove(KEYS.activeSessionId);
        tabStorageRemove(KEYS.activeSessionId);
        storageRemove(KEYS.registry);
        storageRemove(KEYS.ledger);
        storageRemove(KEYS.learnerMemory);

        readSessions();
        tabStorageSet(KEYS.activeSessionId, DEFAULT_SESSION_ID);

        window.dispatchEvent(new CustomEvent('atlas:session-change', {
            detail: { session: readActiveSession() }
        }));

        return true;
    }

    // ============================================================
    // PUBLIC API
    // ============================================================

    window.AtlasBridge = {
        keys: { ...KEYS },
        defaultSessionId: DEFAULT_SESSION_ID,

        storageGet,
        storageSet,
        storageRemove,
        readJson,
        writeJson,
        slugify,

        readSessions,
        writeSessions,
        readActiveSessionId,
        readActiveSession,
        getSessionDisplayName,
        hydrateSessionChrome,
        setActiveSession,
        createSession,
        renameSession,
        deleteSession,

        readLearnerMemory,
        writeLearnerMemory,

        writeHandoff,
        readHandoff,
        readLatestHandoff,

        readRegistry,
        writeRegistry,
        getContentRegistryId,
        upsertWorld,
        upsertItem,
        removeItem,
        upsertSessionState,
        touchRecentActivity,

        readLedger,
        writeLedger,
        upsertLedgerEntry,

        readPreferences,
        writePreferences,
        readUpgradeVisibility,
        setUpgradeVisibility,

        readAppearanceMode,
        applyAppearanceMode,
        setAppearanceMode,

        resetAllAtlasState
    };

    // Ensure a valid default session exists immediately after bridge load.
    readSessions();

    // Migrate the previous cross-tab active session once, then keep it
    // isolated inside this browser tab.
    const legacyActiveSessionId = storageGet(KEYS.activeSessionId);

    if (
        !tabStorageGet(KEYS.activeSessionId) &&
        legacyActiveSessionId
    ) {
        tabStorageSet(
            KEYS.activeSessionId,
            legacyActiveSessionId
        );
    }

    storageRemove(KEYS.activeSessionId);
    readActiveSessionId();

    // Apply the active tab's saved appearance before first paint.
    applyAppearanceMode();
})();
