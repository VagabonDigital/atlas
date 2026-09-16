/* ============================================================
   ATLAS PERSISTENCE TRUST
   Browser projection isolation + persistence failure observability.

   Supabase/RLS protects durable rows. This module protects the browser-side
   projections and deliberately local working state that share generic Atlas
   storage keys across account sessions in the same browser.

   Rules:
   - every signed-in account and the signed-out/local workspace has its own
     browser projection scope;
   - account switching swaps generic Atlas projection keys before the next
     account can render them;
   - deliberately transient tab/session state is cleared on scope changes;
   - old unscoped browser data is treated as local unless existing Atlas cloud
     owner markers prove that it belongs to the currently signed-in account;
   - cloud errors are normalized into one observable persistence-failure event.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasPersistenceTrust) return;

    const AUTH_STORAGE_KEY =
        'sb-jnhjfpagectprceswvqn-auth-token';
    const SCOPE_OWNER_KEY =
        'atlas::persistenceTrust::scopeOwner::v1';
    const SCOPED_PREFIX =
        'atlas::persistenceTrust::scoped::v1::';
    const RECOVERY_SESSION_KEY =
        'atlas::accountPasswordRecovery';

    const OWNER_HINT_KEYS = [
        'atlas::hubPersonalizationCloudOwner::v1',
        'atlas::learnerContinuityCloudOwner::v1',
        'atlas::sharedContinuityCloudOwner::v1',
        'atlas::sharedSessionSubjectsCloudOwner::v1'
    ];

    const EXACT_LOCAL_KEYS = new Set([
        'atlas::sessions',
        'atlas::handoffs',
        'atlas::registry',
        'learning::ledger',
        'atlas::appearanceBySession',
        'atlas::learnerMemory',
        'atlas::originalCuration',
        'atlas::sessionAtmosphereImages',
        'atlas::welcomeImageFavorites',
        'atlas::tutorSubjects::order',
        'atlas::tutorSubjects::library'
    ]);

    const LOCAL_PREFIXES = [
        'atlas::tutorSubjects::subject::',
        'atlas::tutorSubjects::workingDraft::',
        'atlas::tutorSubjects::buildState::',
        'atlas::tutorSubjects::buildCheckpoint::',
        'atlas::tutorSubjects::sessionSubjects::',
        'atlas::tutorSubjects::pendingDelete::',
        'atlas::tutorContent::version::',
        'atlas::tutorContent::workingDraft::'
    ];

    const CLOUD_ERROR_EVENTS = [
        'atlas:learner-cloud-error',
        'atlas:learner-continuity-cloud-error',
        'atlas:shared-continuity-cloud-error',
        'atlas:original-curation-cloud-error',
        'atlas:hub-personalization-cloud-error',
        'atlas:shared-session-subjects-cloud-error'
    ];

    let activeScope = '';
    let lastFailure = null;
    let lastToastSignature = '';
    let lastToastAt = 0;
    let authorityRefreshPromise = null;

    function storageGet(storage, key) {
        try {
            return storage.getItem(key);
        } catch {
            return null;
        }
    }

    function storageSet(storage, key, value) {
        try {
            storage.setItem(key, value);
            return true;
        } catch {
            return false;
        }
    }

    function storageRemove(storage, key) {
        try {
            storage.removeItem(key);
            return true;
        } catch {
            return false;
        }
    }

    function storageKeys(storage) {
        const keys = [];

        try {
            for (let index = 0; index < storage.length; index += 1) {
                const key = storage.key(index);
                if (key) keys.push(key);
            }
        } catch { }

        return keys;
    }

    function readJson(storage, key) {
        const raw = storageGet(storage, key);
        if (!raw) return null;

        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    function storedSessionUserId() {
        const parsed = readJson(localStorage, AUTH_STORAGE_KEY);
        if (!parsed || typeof parsed !== 'object') return null;

        const candidates = [
            parsed,
            parsed.session,
            parsed.currentSession,
            parsed.data?.session
        ];

        for (const candidate of candidates) {
            const id = String(candidate?.user?.id || '').trim();
            if (id) return id;
        }

        return null;
    }

    function scopeForUserId(userId) {
        const id = String(userId || '').trim();
        return id ? `user:${id}` : 'local';
    }

    function scopeFromStoredSession() {
        return scopeForUserId(storedSessionUserId());
    }

    function readScopeOwner() {
        return String(
            storageGet(localStorage, SCOPE_OWNER_KEY) || ''
        ).trim();
    }

    function writeScopeOwner(scope) {
        const value = String(scope || '').trim();
        if (!value) return storageRemove(localStorage, SCOPE_OWNER_KEY);
        return storageSet(localStorage, SCOPE_OWNER_KEY, value);
    }

    function inferExistingScope() {
        const hintedUsers = new Set(
            OWNER_HINT_KEYS
                .map(key => String(
                    storageGet(localStorage, key) || ''
                ).trim())
                .filter(Boolean)
        );

        if (hintedUsers.size === 1) {
            return scopeForUserId(
                Array.from(hintedUsers)[0]
            );
        }

        // Generic legacy browser state is not silently claimed into a signed-in
        // account. The retired migration policy treats unscoped data as local.
        return 'local';
    }

    function isGenericScopedLocalKey(key) {
        const value = String(key || '');

        if (
            !value ||
            value === AUTH_STORAGE_KEY ||
            value === SCOPE_OWNER_KEY ||
            value.startsWith(SCOPED_PREFIX)
        ) {
            return false;
        }

        if (EXACT_LOCAL_KEYS.has(value)) return true;
        return LOCAL_PREFIXES.some(prefix => value.startsWith(prefix));
    }

    function scopeStoragePrefix(scope) {
        return (
            SCOPED_PREFIX +
            encodeURIComponent(String(scope || 'local')) +
            '::'
        );
    }

    function scopedStorageKey(scope, originalKey) {
        return (
            scopeStoragePrefix(scope) +
            encodeURIComponent(String(originalKey || ''))
        );
    }

    function originalKeyFromScoped(scope, scopedKey) {
        const prefix = scopeStoragePrefix(scope);
        const value = String(scopedKey || '');
        if (!value.startsWith(prefix)) return '';

        try {
            return decodeURIComponent(value.slice(prefix.length));
        } catch {
            return '';
        }
    }

    function recordFailure({
        source = 'persistence-trust',
        action = '',
        code = '',
        message = '',
        scope = activeScope || readScopeOwner() || scopeFromStoredSession()
    } = {}) {
        lastFailure = Object.freeze({
            source: String(source || 'persistence-trust'),
            action: String(action || ''),
            code: String(code || ''),
            message: String(message || 'Atlas persistence operation failed.'),
            scope: String(scope || 'local'),
            timestamp: Date.now()
        });

        try {
            window.dispatchEvent(
                new CustomEvent('atlas:persistence-failure', {
                    detail: { ...lastFailure }
                })
            );
        } catch { }

        return lastFailure;
    }

    function moveLocalKeyToScope(key, scope) {
        const originalKey = String(key || '');
        const value = storageGet(localStorage, originalKey);
        if (value === null) return true;

        const targetKey = scopedStorageKey(scope, originalKey);

        // Remove first so a near-full localStorage does not need capacity for
        // two full copies of a potentially large working draft at once.
        if (!storageRemove(localStorage, originalKey)) return false;

        if (storageSet(localStorage, targetKey, value)) return true;

        // Best-effort rollback if the scoped write unexpectedly fails.
        storageSet(localStorage, originalKey, value);
        recordFailure({
            action: 'isolation-stash',
            code: 'ATLAS_SCOPE_STASH_FAILED',
            message: `Atlas could not isolate browser state for ${originalKey}.`,
            scope
        });
        return false;
    }

    function restoreLocalKeyFromScope(scopedKey, scope) {
        const originalKey = originalKeyFromScoped(scope, scopedKey);
        if (!originalKey || !isGenericScopedLocalKey(originalKey)) return true;

        const value = storageGet(localStorage, scopedKey);
        if (value === null) return true;

        storageRemove(localStorage, originalKey);

        if (storageSet(localStorage, originalKey, value)) {
            storageRemove(localStorage, scopedKey);
            return true;
        }

        recordFailure({
            action: 'isolation-restore',
            code: 'ATLAS_SCOPE_RESTORE_FAILED',
            message: `Atlas could not restore browser state for ${originalKey}.`,
            scope
        });
        return false;
    }

    function stashGenericLocalState(scope) {
        const keys = storageKeys(localStorage)
            .filter(isGenericScopedLocalKey);

        return keys.reduce(
            (ok, key) => moveLocalKeyToScope(key, scope) && ok,
            true
        );
    }

    function restoreScopedLocalState(scope) {
        const prefix = scopeStoragePrefix(scope);
        const keys = storageKeys(localStorage)
            .filter(key => key.startsWith(prefix));

        return keys.reduce(
            (ok, key) => restoreLocalKeyFromScope(key, scope) && ok,
            true
        );
    }

    function clearTransientAtlasSessionState() {
        storageKeys(sessionStorage).forEach(key => {
            if (
                key.startsWith('atlas::') &&
                key !== RECOVERY_SESSION_KEY
            ) {
                storageRemove(sessionStorage, key);
            }
        });
    }

    function refreshKnownAuthorities(scope = activeScope || readScopeOwner()) {
        if (authorityRefreshPromise) return authorityRefreshPromise;

        const authenticatedScope =
            String(scope || '').startsWith('user:');

        authorityRefreshPromise = new Promise(resolve => {
            window.setTimeout(async () => {
                try {
                    window.AtlasCloudCache?.clear?.();
                    window.AtlasTutorSubjectsCloudAuthority?.refresh?.();

                    // Learner Sessions owns an in-memory record map. Refresh it
                    // even on sign-out so it stops treating the previous account
                    // as authenticated; its signed-out path leaves restored local
                    // AtlasBridge data untouched.
                    if (
                        window.AtlasLearnerSessionsCloudAuthority?.initialize
                    ) {
                        await window.AtlasLearnerSessionsCloudAuthority
                            .initialize({ force: true })
                            .catch(() => undefined);
                    }

                    if (authenticatedScope) {
                        const refreshes = [
                            window.AtlasLearnerContinuityCloudAuthority,
                            window.AtlasSharedContinuityCloudAuthority,
                            window.AtlasOriginalCurationCloudAuthority,
                            window.AtlasHubPersonalizationCloudAuthority,
                            window.AtlasSharedSessionSubjectsCloudAuthority
                        ]
                            .filter(authority =>
                                authority &&
                                typeof authority.initialize === 'function'
                            )
                            .map(authority =>
                                authority.initialize({ force: true })
                                    .catch(() => undefined)
                            );

                        await Promise.all(refreshes);

                        if (
                            window.AtlasTutorContentCloudSync?.refreshProjection
                        ) {
                            await window.AtlasTutorContentCloudSync
                                .refreshProjection()
                                .catch(() => undefined);
                        }
                    }

                    try {
                        window.AtlasSessionPanel?.refresh?.();
                        window.renderHome?.();
                        window.dispatchEvent(
                            new CustomEvent(
                                'atlas:compass-hub-refresh-request',
                                { detail: { source: 'persistence-trust' } }
                            )
                        );
                    } catch { }
                } finally {
                    authorityRefreshPromise = null;
                    resolve();
                }
            }, 0);
        });

        return authorityRefreshPromise;
    }

    function dispatchScopeChange(previousScope, nextScope) {
        try {
            window.dispatchEvent(
                new CustomEvent('atlas:persistence-scope-change', {
                    detail: {
                        previousScope: previousScope || null,
                        scope: nextScope,
                        userId: nextScope.startsWith('user:')
                            ? nextScope.slice(5)
                            : null
                    }
                })
            );
        } catch { }

        void refreshKnownAuthorities(nextScope);
    }

    function syncScopeForUser(userId) {
        const nextScope = scopeForUserId(userId);
        let previousScope = readScopeOwner();

        if (!previousScope) {
            previousScope = inferExistingScope();

            if (previousScope === nextScope) {
                activeScope = nextScope;
                writeScopeOwner(nextScope);
                return getState();
            }
        }

        if (previousScope === nextScope) {
            activeScope = nextScope;
            writeScopeOwner(nextScope);
            return getState();
        }

        stashGenericLocalState(previousScope);
        restoreScopedLocalState(nextScope);
        clearTransientAtlasSessionState();

        activeScope = nextScope;
        writeScopeOwner(nextScope);
        dispatchScopeChange(previousScope, nextScope);

        return getState();
    }

    function syncScope() {
        return syncScopeForUser(storedSessionUserId());
    }

    function maybeToastLearnerFailure(detail) {
        const action = String(detail?.action || '').trim();

        // last-active touch is background bookkeeping. Record it, but do not
        // interrupt a lesson with a toast for that non-critical failure.
        if (action === 'touch') return;

        const signature = [
            action,
            detail?.code || '',
            detail?.message || ''
        ].join('|');
        const now = Date.now();

        if (
            signature === lastToastSignature &&
            now - lastToastAt < 1500
        ) {
            return;
        }

        lastToastSignature = signature;
        lastToastAt = now;

        try {
            window.showToast?.(
                'Atlas couldn’t save that learner change. Check your connection and try again.'
            );
        } catch { }
    }

    function installFailureObservers() {
        CLOUD_ERROR_EVENTS.forEach(eventName => {
            window.addEventListener(eventName, event => {
                const detail = event?.detail || {};

                recordFailure({
                    source: eventName,
                    action: detail.action || '',
                    code: detail.code || '',
                    message:
                        detail.message ||
                        'Atlas cloud persistence operation failed.'
                });

                if (eventName === 'atlas:learner-cloud-error') {
                    maybeToastLearnerFailure(detail);
                }
            });
        });
    }

    function getState() {
        return {
            scope:
                activeScope ||
                readScopeOwner() ||
                scopeFromStoredSession(),
            userId: storedSessionUserId(),
            lastFailure: lastFailure
                ? { ...lastFailure }
                : null
        };
    }

    function clearLastFailure() {
        lastFailure = null;
        return getState();
    }

    window.AtlasPersistenceTrust = Object.freeze({
        syncScope,
        syncScopeForUser,
        refreshKnownAuthorities,
        getState,
        clearLastFailure
    });

    installFailureObservers();
    syncScope();

    window.addEventListener('atlas:account-change', event => {
        syncScopeForUser(event?.detail?.userId || null);
    });

    window.addEventListener('storage', event => {
        if (event.key === AUTH_STORAGE_KEY) {
            const previousScope = readScopeOwner();
            const nextState = syncScope();

            if (nextState.scope === previousScope) {
                void refreshKnownAuthorities(nextState.scope);
            }
        }
    });
})();
