/* ============================================================
   ATLAS PRODUCT ANALYTICS
   Thin GA4 adapter for decision-grade product observability.

   GA4 already owns page views, sessions, referrers and campaigns.
   This layer adds only product events GA4 cannot infer.

   Privacy boundary:
   - no email addresses;
   - no learner/student names;
   - no user-written titles/content/prompts;
   - no passwords;
   - no raw error messages;
   - no account/user identifiers.

   The GA4 measurement ID is configured outside this module.
   ============================================================ */

(function () {
    'use strict';

    if (
        typeof window.AtlasAnalytics?.getDebugState === 'function'
    ) {
        return;
    }

    const legacyAnalytics =
        window.AtlasAnalytics &&
        typeof window.AtlasAnalytics === 'object'
            ? window.AtlasAnalytics
            : null;

    const EVENT_VERSION = 1;
    const MAX_RECENT_EVENTS = 20;
    const FAILURE_DEDUPE_MS = 1500;
    const recentEvents = [];
    const failureTimes = new Map();

    const BLOCKED_PARAM_KEYS = new Set([
        'email',
        'password',
        'message',
        'prompt',
        'content',
        'user_id',
        'userid',
        'userId',
        'learner_name',
        'student_name',
        'subject_title',
        'title'
    ]);

    function inferWorld() {
        const declared = String(
            document.body?.dataset?.atlasWorld || ''
        ).trim().toLowerCase();

        if (declared) return declared;

        const path = String(window.location.pathname || '/');

        if (path.startsWith('/compass')) return 'compass';
        if (path.startsWith('/arcade')) return 'arcade';

        return 'atlas';
    }

    function inferSurface() {
        const declared = String(
            document.body?.dataset?.atlasSurface || ''
        ).trim().toLowerCase();

        if (declared) return declared;

        const path = String(window.location.pathname || '/');

        if (path.startsWith('/tutors')) return 'inside-atlas';
        if (path.startsWith('/account')) return 'account';
        if (path.startsWith('/compass/')) return 'content';
        if (
            path.startsWith('/arcade/') &&
            path !== '/arcade/'
        ) {
            return 'content';
        }

        return 'hub';
    }

    function getAccessContext() {
        const access =
            window.AtlasAccess?.getState?.() || null;
        const account =
            window.AtlasAccount?.getState?.() || null;

        let accountState = 'unknown';

        if (
            access &&
            typeof access.authenticated === 'boolean'
        ) {
            accountState = access.authenticated
                ? 'authenticated'
                : 'anonymous';
        } else if (
            account &&
            typeof account.authenticated === 'boolean'
        ) {
            accountState = account.authenticated
                ? 'authenticated'
                : 'anonymous';
        } else {
            const hint = String(
                document.documentElement
                    ?.dataset?.atlasAccountHint || ''
            ).trim();

            if (hint === 'account') {
                accountState = 'authenticated';
            } else if (hint === 'anonymous') {
                accountState = 'anonymous';
            }
        }

        return {
            account_state: accountState,
            access_tier: String(
                access?.tier ||
                account?.tier ||
                'unknown'
            ).toLowerCase()
        };
    }

    function cleanString(value, maxLength = 80) {
        return String(value == null ? '' : value)
            .trim()
            .replace(/[\u0000-\u001F\u007F]/g, ' ')
            .slice(0, maxLength);
    }

    function cleanParams(input = {}) {
        const output = {};

        Object.entries(input || {}).forEach(
            ([key, value]) => {
                if (BLOCKED_PARAM_KEYS.has(key)) return;
                if (value == null) return;

                if (
                    typeof value === 'number' &&
                    Number.isFinite(value)
                ) {
                    output[key] = value;
                    return;
                }

                if (typeof value === 'boolean') {
                    output[key] = value;
                    return;
                }

                if (typeof value === 'string') {
                    const cleaned = cleanString(value);

                    if (cleaned) {
                        output[key] = cleaned;
                    }
                }
            }
        );

        return output;
    }

    function pushGtagCommand() {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(arguments);
    }

    function dispatchDebugEvent(name, params) {
        try {
            window.dispatchEvent(
                new CustomEvent(
                    'atlas:analytics-event',
                    {
                        detail: {
                            name,
                            params: { ...params }
                        }
                    }
                )
            );
        } catch { }
    }

    function send(name, params = {}) {
        const eventName = cleanString(name, 40);

        if (!eventName) return false;

        const payload = {
            event_version: EVENT_VERSION,
            atlas_world: inferWorld(),
            atlas_surface: inferSurface(),
            ...getAccessContext(),
            ...cleanParams(params)
        };

        const transport =
            typeof window.gtag === 'function'
                ? window.gtag
                : pushGtagCommand;

        try {
            transport(
                'event',
                eventName,
                payload
            );
        } catch {
            return false;
        }

        recentEvents.push({
            name: eventName,
            params: { ...payload },
            timestamp: Date.now()
        });

        if (
            recentEvents.length >
            MAX_RECENT_EVENTS
        ) {
            recentEvents.shift();
        }

        dispatchDebugEvent(
            eventName,
            payload
        );

        return true;
    }

    function sendFailure(name, params = {}) {
        const cleaned = cleanParams(params);
        const key = [
            name,
            cleaned.action || '',
            cleaned.error_code || '',
            cleaned.outcome || '',
            cleaned.reason || ''
        ].join('|');
        const now = Date.now();
        const previous =
            failureTimes.get(key) || 0;

        if (
            now - previous <
            FAILURE_DEDUPE_MS
        ) {
            return false;
        }

        failureTimes.set(key, now);
        return send(name, cleaned);
    }

    function normalizeResourceId(value) {
        const id =
            cleanString(value, 64)
                .toLowerCase();

        return /^[a-z0-9][a-z0-9_-]{0,63}$/.test(id)
            ? id
            : '';
    }

    function normalizeResourceSource(value) {
        const source =
            cleanString(value, 32)
                .toLowerCase();

        return [
            'atlas',
            'owned',
            'my-version',
            'arcade',
            'public',
            'unknown'
        ].includes(source)
            ? source
            : 'unknown';
    }

    function classifyAuthError(error) {
        const message = String(
            error?.message ||
            error ||
            ''
        ).toLowerCase();

        if (
            message.includes(
                'invalid login credentials'
            ) ||
            message.includes(
                'invalid email or password'
            )
        ) {
            return 'invalid_credentials';
        }

        if (
            message.includes(
                'email not confirmed'
            ) ||
            message.includes(
                'email_not_confirmed'
            )
        ) {
            return 'email_not_confirmed';
        }

        if (
            message.includes(
                'already registered'
            ) ||
            message.includes(
                'user already registered'
            )
        ) {
            return 'already_registered';
        }

        if (
            message.includes('rate limit') ||
            message.includes(
                'too many requests'
            )
        ) {
            return 'rate_limited';
        }

        if (
            message.includes(
                'failed to fetch'
            ) ||
            message.includes('network')
        ) {
            return 'network';
        }

        return 'unknown';
    }

    function productEntry(targetWorld) {
        return send(
            'atlas_product_entry',
            {
                target_world:
                    cleanString(
                        targetWorld,
                        24
                    ).toLowerCase()
            }
        );
    }

    function resourceOpen({
        resourceType = 'unknown',
        resourceSource = 'unknown',
        resourceId = ''
    } = {}) {
        return send(
            'atlas_resource_open',
            {
                resource_type:
                    cleanString(
                        resourceType,
                        24
                    ).toLowerCase(),
                resource_source:
                    normalizeResourceSource(
                        resourceSource
                    ),
                resource_id:
                    normalizeResourceId(
                        resourceId
                    )
            }
        );
    }

    function resourceBegin({
        resourceType = 'unknown',
        resourceSource = 'unknown',
        resourceId = ''
    } = {}) {
        return send(
            'atlas_resource_begin',
            {
                resource_type:
                    cleanString(
                        resourceType,
                        24
                    ).toLowerCase(),
                resource_source:
                    normalizeResourceSource(
                        resourceSource
                    ),
                resource_id:
                    normalizeResourceId(
                        resourceId
                    )
            }
        );
    }

    function compassLessonBegin({
        subjectSource = 'atlas'
    } = {}) {
        return resourceBegin({
            resourceType: 'subject',
            resourceSource:
                subjectSource
        });
    }

    function arcadeGameStart(gameId) {
        return resourceBegin({
            resourceType: 'game',
            resourceSource: 'arcade',
            resourceId: gameId
        });
    }

    function accountGate({
        mode = 'sign-in',
        action = 'account'
    } = {}) {
        return send(
            'atlas_account_gate',
            {
                gate_mode:
                    cleanString(
                        mode,
                        24
                    ).toLowerCase(),
                action:
                    cleanString(
                        action,
                        40
                    ).toLowerCase()
            }
        );
    }

    function signupStart({
        source = 'account-gate'
    } = {}) {
        return send(
            'atlas_signup_start',
            {
                signup_source:
                    cleanString(
                        source,
                        32
                    ).toLowerCase()
            }
        );
    }

    function signupCreated({
        source = 'account-gate',
        confirmationRequired = false
    } = {}) {
        return send(
            'atlas_signup_created',
            {
                signup_source:
                    cleanString(
                        source,
                        32
                    ).toLowerCase(),
                confirmation_required:
                    confirmationRequired ===
                    true
            }
        );
    }

    function signupComplete({
        source = 'account-gate'
    } = {}) {
        return send(
            'sign_up',
            {
                method: 'email',
                signup_source:
                    cleanString(
                        source,
                        32
                    ).toLowerCase()
            }
        );
    }

    function learnerAdded({
        source = 'session-panel'
    } = {}) {
        send(
            'atlas_learner_added',
            {
                learner_source:
                    cleanString(
                        source,
                        32
                    ).toLowerCase()
            }
        );

        return durableSave({
            kind: 'learner'
        });
    }

    function durableSave({
        kind = 'unknown'
    } = {}) {
        return send(
            'atlas_durable_save',
            {
                save_kind:
                    cleanString(
                        kind,
                        32
                    ).toLowerCase()
            }
        );
    }

    function subjectCreateAttempt({
        creationMode = 'create'
    } = {}) {
        return send(
            'atlas_subject_create_attempt',
            {
                creation_mode:
                    cleanString(
                        creationMode,
                        24
                    ).toLowerCase()
            }
        );
    }

    function subjectCreate({
        creationMode = 'create'
    } = {}) {
        send(
            'atlas_subject_create',
            {
                creation_mode:
                    cleanString(
                        creationMode,
                        24
                    ).toLowerCase()
            }
        );

        return durableSave({
            kind: 'owned_subject'
        });
    }

    function teachingUse({
        action = 'wrap_up',
        resourceSource = 'atlas',
        exploredCount = 0,
        savedLanguageCount = 0
    } = {}) {
        return send(
            'atlas_teaching_use',
            {
                teaching_action:
                    cleanString(
                        action,
                        32
                    ).toLowerCase(),
                resource_source:
                    normalizeResourceSource(
                        resourceSource
                    ),
                explored_count:
                    Math.max(
                        0,
                        Number(
                            exploredCount
                        ) || 0
                    ),
                saved_language_count:
                    Math.max(
                        0,
                        Number(
                            savedLanguageCount
                        ) || 0
                    )
            }
        );
    }

    function authFailure({
        action = 'unknown',
        error = null
    } = {}) {
        return sendFailure(
            'atlas_auth_failure',
            {
                action:
                    cleanString(
                        action,
                        40
                    ).toLowerCase(),
                error_category:
                    classifyAuthError(error)
            }
        );
    }

    function capabilityFailure({
        action = 'capability',
        capability = '',
        outcome = 'unavailable',
        reason = ''
    } = {}) {
        return sendFailure(
            'atlas_capability_failure',
            {
                action:
                    cleanString(
                        action,
                        40
                    ).toLowerCase(),
                capability:
                    cleanString(
                        capability,
                        40
                    ),
                outcome:
                    cleanString(
                        outcome,
                        24
                    ).toLowerCase(),
                reason:
                    cleanString(
                        reason,
                        32
                    ).toLowerCase()
            }
        );
    }

    function restoreFailure({
        phase = 'restore'
    } = {}) {
        return sendFailure(
            'atlas_restore_failure',
            {
                action: 'restore',
                reason:
                    cleanString(
                        phase,
                        32
                    ).toLowerCase()
            }
        );
    }

    function inferProductTarget(anchor) {
        let url;

        try {
            url = new URL(
                anchor.getAttribute(
                    'href'
                ) || '',
                window.location.href
            );
        } catch {
            return '';
        }

        if (
            url.origin !==
            window.location.origin
        ) {
            return '';
        }

        const path = url.pathname;

        if (
            path.startsWith(
                '/compass'
            )
        ) {
            return 'compass';
        }

        if (
            path.startsWith(
                '/arcade'
            )
        ) {
            return 'arcade';
        }

        if (
            path === '/' ||
            path === '/index.html'
        ) {
            return 'atlas';
        }

        return '';
    }

    document.addEventListener(
        'click',
        event => {
            if (
                inferSurface() !==
                'inside-atlas'
            ) {
                return;
            }

            const anchor =
                event.target
                    ?.closest?.('a[href]');

            if (!anchor) return;

            const targetWorld =
                inferProductTarget(
                    anchor
                );

            if (!targetWorld) return;

            productEntry(
                targetWorld
            );
        }
    );

    window.addEventListener(
        'atlas:persistence-failure',
        event => {
            const detail =
                event?.detail || {};

            sendFailure(
                'atlas_persistence_failure',
                {
                    action:
                        cleanString(
                            detail.action ||
                            'unknown',
                            40
                        ).toLowerCase(),
                    failure_source:
                        cleanString(
                            detail.source ||
                            'unknown',
                            48
                        ).toLowerCase(),
                    error_code:
                        cleanString(
                            detail.code ||
                            'unknown',
                            40
                        )
                }
            );
        }
    );

    window.addEventListener(
        'atlas:account-session-ended',
        event => {
            const detail =
                event?.detail || {};

            sendFailure(
                'atlas_auth_failure',
                {
                    action: 'session_ended',
                    error_category:
                        'session_ended',
                    error_code:
                        cleanString(
                            detail.code ||
                            'unknown',
                            40
                        )
                }
            );
        }
    );

    window.AtlasAnalytics =
        Object.freeze({
            ...(legacyAnalytics || {}),
            send,
            productEntry,
            resourceOpen,
            resourceBegin,
            compassLessonBegin,
            arcadeGameStart,
            accountGate,
            signupStart,
            signupCreated,
            signupComplete,
            learnerAdded,
            durableSave,
            subjectCreateAttempt,
            subjectCreate,
            teachingUse,
            authFailure,
            capabilityFailure,
            restoreFailure,
            getDebugState() {
                return Object.freeze({
                    recentEvents:
                        recentEvents.map(
                            event => ({
                                ...event,
                                params: {
                                    ...event.params
                                }
                            })
                        )
                });
            }
        });
})();
