// ============================================================
// COMPASS SHARED SUBJECT ENGINE
// Canonical runtime for Compass subject pages.
//
// Subject-specific content lives in subject-data.js:
// MODULE, subjectCopy, discussionSets, and clCards.
//
// This file owns:
// - navigation and shared shell rendering
// - deliberate Explored state
// - Upgrade visibility and inline Upgrade rendering
// - saved language and the Language Bank
// - Cultural Lens and Discussion behaviour
// - session management
// - appearance, focus handling, and accessibility
//
// AtlasBridge owns:
// - sessions
// - shared registry state
// - the learning ledger
// - tutor preferences
// - appearance persistence
//
// Keep MODULE.id and all card and moment IDs stable after release.
// ============================================================


// ============================================================
// SHARED MARKS
// ============================================================

function getCompassMarkSvg({
    width = 18,
    height = 18,
    color = 'currentColor',
    ariaHidden = true
} = {}) {
    const ariaAttr = ariaHidden ? ' aria-hidden="true"' : '';

    return `<svg width="${width}" height="${height}" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"${ariaAttr}>
            <path d="M10 3.8L16.2 10L10 16.2L3.8 10L10 3.8Z"
                fill="${color}"
                fill-opacity="0.18"
                stroke="${color}"
                stroke-width="1.65"
                stroke-linejoin="round"/>
            <path d="M10 7.35L12.65 10L10 12.65L7.35 10L10 7.35Z"
                fill="${color}"
                fill-opacity="0.14"
                stroke="${color}"
                stroke-width="1.4"
                stroke-linejoin="round"
                opacity="0.86"/>
            <circle cx="10" cy="10" r="1.15" fill="${color}"/>
        </svg>`;
}

const COMPASS_BRAND_ICON_SVG = getCompassMarkSvg();

const UPGRADE_ICON_SVG = `<svg class="upgrade-chip-icon" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.5 1.5 L7.1 4.9 L10.5 5.5 L7.1 6.1 L6.5 9.5 L5.9 6.1 L2.5 5.5 L5.9 4.9 Z"
            stroke="currentColor"
            stroke-width="1.1"
            stroke-linejoin="round"/>
        <path d="M10.5 1.5 L10.9 2.8 L12.2 3.2 L10.9 3.6 L10.5 4.9 L10.1 3.6 L8.8 3.2 L10.1 2.8 Z"
            stroke="currentColor"
            stroke-width="0.9"
            stroke-linejoin="round"/>
    </svg>`;


// ============================================================
// NAVIGATION CONFIG
// ============================================================

const NAV_ITEMS = [
    {
        id: 'overview',
        label: 'Overview',
        viewId: 'view-orientation',
        desktopSvg: `<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <rect x="1" y="1" width="4.5" height="4.5" rx="1" stroke="currentColor" stroke-width="1.2" />
                <rect x="7.5" y="1" width="4.5" height="4.5" rx="1" stroke="currentColor" stroke-width="1.2" />
                <rect x="1" y="7.5" width="4.5" height="4.5" rx="1" stroke="currentColor" stroke-width="1.2" />
                <rect x="7.5" y="7.5" width="4.5" height="4.5" rx="1" stroke="currentColor" stroke-width="1.2" />
            </svg>`,
        mobileSvg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="6" rx="1.2" stroke="currentColor" stroke-width="1.3" />
                <rect x="9" y="1" width="6" height="6" rx="1.2" stroke="currentColor" stroke-width="1.3" />
                <rect x="1" y="9" width="6" height="6" rx="1.2" stroke="currentColor" stroke-width="1.3" />
                <rect x="9" y="9" width="6" height="6" rx="1.2" stroke="currentColor" stroke-width="1.3" />
            </svg>`
    },
    {
        id: 'discussion',
        label: 'Discussion',
        viewId: 'view-discussion',
        desktopSvg: `<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M2 3a1 1 0 011-1h7a1 1 0 011 1v5a1 1 0 01-1 1H7L4.5 11V9H3a1 1 0 01-1-1V3z"
                    stroke="currentColor"
                    stroke-width="1.2"
                    stroke-linejoin="round"/>
            </svg>`,
        mobileSvg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 4a1.5 1.5 0 011.5-1.5h7A1.5 1.5 0 0113 4v6a1.5 1.5 0 01-1.5 1.5H8.5L6 14V11.5H4.5A1.5 1.5 0 013 10V4z"
                    stroke="currentColor"
                    stroke-width="1.3"
                    stroke-linejoin="round"/>
            </svg>`
    },
    {
        id: 'cultural-lens',
        label: 'Cultural Lens',
        viewId: 'view-cultural-lens',
        desktopSvg: `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <circle cx="7.5" cy="7.5" r="5.2" stroke="currentColor" stroke-width="1.35"/>
                <path d="M2.3 7.5h10.4M7.5 2.3c1.35 1.45 2.05 3.2 2.05 5.2s-.7 3.75-2.05 5.2M7.5 2.3C6.15 3.75 5.45 5.5 5.45 7.5s.7 3.75 2.05 5.2"
                    stroke="currentColor"
                    stroke-width="1.05"
                    stroke-linecap="round"/>
            </svg>`,
        mobileSvg: `<svg width="17" height="17" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <circle cx="7.5" cy="7.5" r="5.2" stroke="currentColor" stroke-width="1.35"/>
                <path d="M2.3 7.5h10.4M7.5 2.3c1.35 1.45 2.05 3.2 2.05 5.2s-.7 3.75-2.05 5.2M7.5 2.3C6.15 3.75 5.45 5.5 5.45 7.5s.7 3.75 2.05 5.2"
                    stroke="currentColor"
                    stroke-width="1.05"
                    stroke-linecap="round"/>
            </svg>`
    },
    {
        id: 'reflection',
        label: 'Reflection',
        viewId: 'view-reflection',
        desktopSvg: `<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 1v10M3 9l3.5 2.5L10 9"
                    stroke="currentColor"
                    stroke-width="1.3"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>
                <circle cx="6.5" cy="4.5" r="2" stroke="currentColor" stroke-width="1.2"/>
            </svg>`,
        mobileSvg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M4 12l4 2.5L12 12"
                    stroke="currentColor"
                    stroke-width="1.3"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>
                <circle cx="8" cy="6" r="2.5" stroke="currentColor" stroke-width="1.3"/>
            </svg>`
    }
];

const NAV_SVG = {
    session: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="4" r="2.2" stroke="currentColor" stroke-width="1.2"/>
            <path d="M1.5 11c0-2.485 2.015-4 4.5-4s4.5 1.515 4.5 4"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linecap="round"/>
        </svg>`,

    keylang: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4.2 3.2h4.1c.9 0 1.7.35 2.2.95.5-.6 1.3-.95 2.2-.95h1.1c.7 0 1.2.5 1.2 1.2v9.2c0 .7-.5 1.2-1.2 1.2h-1.1c-.9 0-1.7.35-2.2.95-.5-.6-1.3-.95-2.2-.95H4.2c-.7 0-1.2-.5-1.2-1.2V4.4c0-.7.5-1.2 1.2-1.2Z"
                stroke="currentColor"
                stroke-width="1.35"
                stroke-linejoin="round"/>
            <path d="M10.5 4.15v11.1"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linecap="round"/>
            <path d="M5.3 6.2h2.3M5.3 8.4h2.3M12.2 6.2h1.1M12.2 8.4h1.1"
                stroke="currentColor"
                stroke-width="1.15"
                stroke-linecap="round"/>
        </svg>`,

    hamburger: `<svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <path d="M2 4h13M2 8.5h13M2 13h13"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"/>
        </svg>`,

    keylangMobile: `<svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <path d="M4.2 3.2h4.1c.9 0 1.7.35 2.2.95.5-.6 1.3-.95 2.2-.95h1.1c.7 0 1.2.5 1.2 1.2v9.2c0 .7-.5 1.2-1.2 1.2h-1.1c-.9 0-1.7.35-2.2.95-.5-.6-1.3-.95-2.2-.95H4.2c-.7 0-1.2-.5-1.2-1.2V4.4c0-.7.5-1.2 1.2-1.2Z"
                stroke="currentColor"
                stroke-width="1.35"
                stroke-linejoin="round"/>
            <path d="M10.5 4.15v11.1"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linecap="round"/>
            <path d="M5.3 6.2h2.3M5.3 8.4h2.3M12.2 6.2h1.1M12.2 8.4h1.1"
                stroke="currentColor"
                stroke-width="1.15"
                stroke-linecap="round"/>
        </svg>`
};


// ============================================================
// RUNTIME CONTRACT
// ============================================================

const COMPASS_WORLD_ID = 'compass';
const COMPASS_WORLD_TITLE = 'Compass';

const COMPASS_LABELS = {
    culturalLensUnitSingular: 'culture',
    culturalLensUnitPlural: 'cultures',
    discussionUnitSingular: 'moment',
    discussionUnitPlural: 'moments'
};

let currentSession = 'Default';
let currentSessionId = 'default';

let progress = {
    explored: new Set(),
    lessonCompletedAt: null
};

const wrapUpEvidenceBySessionSubject = new Map();
const COMPASS_WRAP_UP_DRAFT_PREFIX = 'atlas::compassWrapUpDraft::';
const COMPASS_ACTIVE_WRAP_UP_DRAFT_PREFIX = 'atlas::activeCompassWrapUpDraft::';
const COMPASS_WRAP_UP_DRAFT_MAX_AGE = 8 * 60 * 60 * 1000;

let wrapUpOriginView = null;
let wrapUpPreviousBodyOverflow = '';
let wrapUpPreviousRootOverflow = '';
let wrapUpPreviousScrollX = 0;
let wrapUpPreviousScrollY = 0;

let currentModalIndex = 0;
let activeSetId = null;

let vocabBankActiveTab = 'saved';
let vocabBankEditMode = false;

let lastFocusedElement = null;
let activeFocusTrapRoot = null;


// ============================================================
// BRIDGE
// ============================================================

function requireAtlasBridge() {
    if (!window.AtlasBridge) {
        throw new Error(
            'AtlasBridge is missing. atlas-bridge.js must load before compass-engine.js.'
        );
    }

    return window.AtlasBridge;
}

function getCurrentBridgeSession() {
    const session = requireAtlasBridge().readActiveSession();

    currentSessionId = session.id;
    currentSession = session.name || 'Default';

    return session;
}

function syncSessionsFromBridge() {
    const Bridge = requireAtlasBridge();
    const activeSession = Bridge.readActiveSession();

    currentSessionId = activeSession.id;
    currentSession = activeSession.name || 'Default';
}

function getBridgeSessionByName(name) {
    return requireAtlasBridge()
        .readSessions()
        .find(session => session.name === name) || null;
}

function getContentRegistryId() {
    const Bridge = requireAtlasBridge();

    return typeof Bridge.getContentRegistryId === 'function'
        ? Bridge.getContentRegistryId(COMPASS_WORLD_ID, MODULE.id)
        : `${COMPASS_WORLD_ID}:${MODULE.id}`;
}

function getAtlasLaunchUrl() {
    try {
        return window.location.href.split('#')[0];
    } catch {
        return '';
    }
}

function getCompassWorldLaunchUrl() {
    try {
        return new URL('../index.html', window.location.href).href;
    } catch {
        return '../index.html';
    }
}

function getSubjectExplorationCounts() {
    const moments = discussionSets.flatMap(set => set.moments);

    const culturesExplored = clCards.filter(card =>
        progress.explored.has(card.id)
    ).length;

    const momentsExplored = moments.filter(moment =>
        progress.explored.has(moment.id)
    ).length;

    return {
        culturesExplored,
        momentsExplored,
        culturesTotal: clCards.length,
        momentsTotal: moments.length,
        exploredTotal: culturesExplored + momentsExplored,
        itemTotal: clCards.length + moments.length
    };
}

function getWrapUpEvidenceKey(sessionId) {
    return `${sessionId}::${MODULE.id}`;
}

function getWrapUpDraftStorageKey(sessionId) {
    return [
        COMPASS_WRAP_UP_DRAFT_PREFIX,
        encodeURIComponent(String(sessionId || '')),
        '::',
        encodeURIComponent(String(MODULE.id || ''))
    ].join('');
}

function getActiveWrapUpDraftStorageKey(sessionId) {
    return [
        COMPASS_ACTIVE_WRAP_UP_DRAFT_PREFIX,
        encodeURIComponent(String(sessionId || ''))
    ].join('');
}

function readActiveWrapUpDraftSubjectId(sessionId) {
    try {
        return sessionStorage.getItem(
            getActiveWrapUpDraftStorageKey(sessionId)
        ) || '';
    } catch {
        return '';
    }
}

function writeActiveWrapUpDraftSubjectId(sessionId, subjectId) {
    try {
        sessionStorage.setItem(
            getActiveWrapUpDraftStorageKey(sessionId),
            subjectId
        );
    } catch { }
}

function clearActiveWrapUpDraftSubjectId(sessionId) {
    try {
        sessionStorage.removeItem(
            getActiveWrapUpDraftStorageKey(sessionId)
        );
    } catch { }
}

function createEmptyWrapUpEvidence() {
    return {
        exploredItems: [],
        savedLanguageEntryIds: new Set()
    };
}

function normalizeWrapUpEvidenceDraft(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        return null;
    }

    if (raw.subjectId !== MODULE.id) {
        return null;
    }

    const updatedAt = Number(raw.updatedAt) || 0;
    const stale = updatedAt > 0 &&
        Date.now() - updatedAt > COMPASS_WRAP_UP_DRAFT_MAX_AGE;

    if (stale) return null;

    const exploredItems = Array.isArray(raw.exploredItems)
        ? raw.exploredItems
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

    const savedLanguageEntryIds = new Set(
        Array.isArray(raw.savedLanguageEntryIds)
            ? raw.savedLanguageEntryIds
                .filter(id => typeof id === 'string' && id.trim())
                .map(id => id.trim())
            : []
    );

    if (!exploredItems.length && savedLanguageEntryIds.size === 0) {
        return null;
    }

    return {
        exploredItems,
        savedLanguageEntryIds
    };
}

function readWrapUpEvidenceDraft(sessionId) {
    try {
        const raw = sessionStorage.getItem(
            getWrapUpDraftStorageKey(sessionId)
        );

        return raw
            ? normalizeWrapUpEvidenceDraft(JSON.parse(raw))
            : null;
    } catch {
        return null;
    }
}

function persistWrapUpEvidence(sessionId = currentSessionId) {
    const evidence = getWrapUpEvidence(sessionId, false);
    const storageKey = getWrapUpDraftStorageKey(sessionId);

    if (
        !evidence ||
        (
            evidence.exploredItems.length === 0 &&
            evidence.savedLanguageEntryIds.size === 0
        )
    ) {
        try {
            sessionStorage.removeItem(storageKey);
        } catch { }

        return false;
    }

    try {
        sessionStorage.setItem(
            storageKey,
            JSON.stringify({
                v: 1,
                sessionId,
                subjectId: MODULE.id,
                updatedAt: Date.now(),
                exploredItems: evidence.exploredItems,
                savedLanguageEntryIds: [
                    ...evidence.savedLanguageEntryIds
                ]
            })
        );

        writeActiveWrapUpDraftSubjectId(sessionId, MODULE.id);
        return true;
    } catch {
        return false;
    }
}

function getWrapUpEvidence(sessionId = currentSessionId, create = true) {
    const key = getWrapUpEvidenceKey(sessionId);

    if (!wrapUpEvidenceBySessionSubject.has(key)) {
        const restored = readWrapUpEvidenceDraft(sessionId);

        if (restored) {
            wrapUpEvidenceBySessionSubject.set(key, restored);
        } else if (create) {
            wrapUpEvidenceBySessionSubject.set(
                key,
                createEmptyWrapUpEvidence()
            );
        }
    }

    return wrapUpEvidenceBySessionSubject.get(key) || null;
}

function clearWrapUpEvidence(sessionId) {
    wrapUpEvidenceBySessionSubject.delete(
        getWrapUpEvidenceKey(sessionId)
    );

    try {
        sessionStorage.removeItem(
            getWrapUpDraftStorageKey(sessionId)
        );
    } catch { }

    if (readActiveWrapUpDraftSubjectId(sessionId) === MODULE.id) {
        clearActiveWrapUpDraftSubjectId(sessionId);
    }
}

function clearOtherCompassWrapUpDraftForSession(sessionId) {
    const activeSubjectId = readActiveWrapUpDraftSubjectId(sessionId);

    if (!activeSubjectId || activeSubjectId === MODULE.id) {
        return;
    }

    const previousKey = [
        COMPASS_WRAP_UP_DRAFT_PREFIX,
        encodeURIComponent(String(sessionId || '')),
        '::',
        encodeURIComponent(String(activeSubjectId))
    ].join('');

    try {
        sessionStorage.removeItem(previousKey);
    } catch { }

    wrapUpEvidenceBySessionSubject.delete(
        `${sessionId}::${activeSubjectId}`
    );

    clearActiveWrapUpDraftSubjectId(sessionId);
}

function prepareCurrentCompassWrapUpDraft(sessionId = currentSessionId) {
    clearOtherCompassWrapUpDraftForSession(sessionId);
}

function getExploredItemSummary(id) {
    const culturalLensCard = clCards.find(card => card.id === id);

    if (culturalLensCard?.title) {
        return {
            id: culturalLensCard.id,
            title: culturalLensCard.title
        };
    }

    for (const set of discussionSets) {
        const moment = set.moments.find(item => item.id === id);
        const title = moment?.handoffTitle || moment?.title || moment?.preview;

        if (moment && title) {
            return {
                id: moment.id,
                title
            };
        }
    }

    return null;
}

function recordExploredForWrapUp(id) {
    prepareCurrentCompassWrapUpDraft();

    const item = getExploredItemSummary(id);

    if (!item) return;

    const evidence = getWrapUpEvidence();

    evidence.exploredItems = evidence.exploredItems.filter(
        existing => existing.id !== item.id
    );

    evidence.exploredItems.push(item);
    persistWrapUpEvidence(currentSessionId);
}

function removeExploredFromWrapUp(id) {
    const evidence = getWrapUpEvidence(currentSessionId, false);

    if (!evidence) return;

    evidence.exploredItems = evidence.exploredItems.filter(
        item => item.id !== id
    );

    persistWrapUpEvidence(currentSessionId);
}

function recordSavedLanguageForWrapUp(sessionId, entryId) {
    if (!sessionId || !entryId) return;

    prepareCurrentCompassWrapUpDraft(sessionId);

    getWrapUpEvidence(sessionId).savedLanguageEntryIds.add(entryId);
    persistWrapUpEvidence(sessionId);
}

function removeSavedLanguageFromWrapUp(sessionId, entryId) {
    const evidence = getWrapUpEvidence(sessionId, false);

    if (!evidence) return;

    evidence.savedLanguageEntryIds.delete(entryId);
    persistWrapUpEvidence(sessionId);
}

function publishAtlasCompassItem(action = 'updated') {
    try {
        const Bridge = requireAtlasBridge();
        const activeSession = getCurrentBridgeSession();
        const registryId = getContentRegistryId();
        const timestamp = Date.now();

        const culturalLensExplored = clCards.filter(card =>
            progress.explored.has(card.id)
        ).length;

        const momentsExplored = discussionSets
            .flatMap(set => set.moments)
            .filter(moment => progress.explored.has(moment.id))
            .length;

        const exploredCount = culturalLensExplored + momentsExplored;
        const savedLanguageCount = getSavedLanguageEntriesForCurrentSubject().length;

        const status = progress.lessonCompletedAt
            ? 'complete'
            : exploredCount > 0
                ? 'in-progress'
                : 'not-started';

        Bridge.upsertWorld({
            registryId: COMPASS_WORLD_ID,
            world: COMPASS_WORLD_ID,
            type: 'world',
            title: COMPASS_WORLD_TITLE,
            description: 'Deep conversation subjects for thoughtful English, cultural reflection, and human communication.',
            status: 'available',
            launchUrl: getCompassWorldLaunchUrl()
        });

        Bridge.upsertItem({
            registryId,
            world: COMPASS_WORLD_ID,
            type: 'subject',
            schemaVersion: MODULE.schemaVersion,
            contentVersion: MODULE.contentVersion,
            id: MODULE.id,
            title: MODULE.title,
            navTitle: MODULE.navTitle || MODULE.title,
            status: 'available',
            launchUrl: getAtlasLaunchUrl()
        });

        const sessionState = {
            sessionId: activeSession.id,
            sessionName: activeSession.name,
            registryId,
            world: COMPASS_WORLD_ID,
            type: 'subject-session-state',
            schemaVersion: 2,
            contentVersion: MODULE.contentVersion,
            id: MODULE.id,
            title: MODULE.title,
            navTitle: MODULE.navTitle || MODULE.title,
            status,
            action,
            launchUrl: getAtlasLaunchUrl(),

            completedAt: status === 'complete'
                ? progress.lessonCompletedAt
                : null,

            progress: {
                explored: exploredCount,
                total: clCards.length + discussionSets
                    .flatMap(set => set.moments)
                    .length,
                culturalLensExplored,
                momentsExplored,
                savedLanguageCount,
                label: [
                    culturalLensExplored
                        ? `${culturalLensExplored} ${culturalLensExplored === 1 ? 'culture' : 'cultures'} explored`
                        : '',
                    momentsExplored
                        ? `${momentsExplored} ${momentsExplored === 1 ? 'moment' : 'moments'} explored`
                        : '',
                    savedLanguageCount
                        ? `${savedLanguageCount} ${savedLanguageCount === 1 ? 'expression' : 'expressions'} saved`
                        : ''
                ].filter(Boolean).join(' · ')
            },

            progressRaw: {
                exploredIds: [...progress.explored],
                lessonCompletedAt: progress.lessonCompletedAt || null
            },

            lastTouchedAt: timestamp
        };

        if (action === 'opened') {
            sessionState.lastOpenedAt = timestamp;
        }

        Bridge.upsertSessionState(activeSession.id, registryId, sessionState);

        Bridge.touchRecentActivity({
            registryId,
            sessionId: activeSession.id,
            sessionName: activeSession.name,
            world: COMPASS_WORLD_ID,
            action,
            timestamp
        });
    } catch (error) {
        console.warn('[Compass] AtlasBridge publish failed:', error);
    }
}


// ============================================================
// UTILITIES
// ============================================================

function escHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function jsArg(value) {
    return escHtml(JSON.stringify(String(value)));
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value || '';
    }
}

function getScrollBehavior() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth';
}

function countLabel(number) {
    const words = [
        'Zero', 'One', 'Two', 'Three', 'Four',
        'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen',
        'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
        'Twenty'
    ];

    return number < words.length ? words[number] : String(number);
}


// ============================================================
// DOCUMENT AND SUBJECT COPY
// ============================================================

function applyCompassFavicon() {
    const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <path d="M50 4L96 50L50 96L4 50Z"
                fill="#7FA898"
                stroke="#5C7A6E"
                stroke-width="5"
                stroke-linejoin="round"/>
            <path d="M50 18L82 50L50 82L18 50Z"
                fill="#EFFFF9"
                stroke="#FFFFFF"
                stroke-width="3"
                stroke-linejoin="round"/>
            <path d="M50 34L66 50L50 66L34 50Z"
                fill="#5C7A6E"
                stroke="#3F6B5C"
                stroke-width="3"
                stroke-linejoin="round"/>
            <path d="M50 18L50 34M82 50L66 50M50 82L50 66M18 50L34 50"
                stroke="#7FA898"
                stroke-width="3"
                stroke-linecap="round"/>
        </svg>`;

    let icon = document.querySelector('link[rel~="icon"]');

    if (!icon) {
        icon = document.createElement('link');
        icon.rel = 'icon';
        document.head.appendChild(icon);
    }

    icon.type = 'image/svg+xml';
    icon.href = `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`;
}

function applyCoverConfig() {
    document.title = MODULE.title;

    const coverTitle = document.getElementById('cover-title');

    if (coverTitle) {
        coverTitle.innerHTML = MODULE.titleHtml;
    }

    document.documentElement.style.setProperty(
        '--module-bg-image',
        `url('${MODULE.bgImage}')`
    );
}

function renderOverviewIntro() {
    const container = document.getElementById('overview-intro');

    if (!container) return;

    const paragraphs = Array.isArray(subjectCopy.overview.intro)
        ? subjectCopy.overview.intro
        : [];

    container.innerHTML = paragraphs
        .filter(paragraph => typeof paragraph === 'string' && paragraph.trim())
        .map(paragraph => `<p>${escHtml(paragraph)}</p>`)
        .join('');
}

function renderReflectionQuestions() {
    const container = document.getElementById('reflection-questions');

    if (!container) return;

    const questions = Array.isArray(subjectCopy.reflection.questions)
        ? subjectCopy.reflection.questions
        : [];

    container.innerHTML = questions
        .filter(question => typeof question === 'string' && question.trim())
        .map(question => `
            <div class="reflection-q">
                <p class="reflection-q-text">${escHtml(question)}</p>
            </div>
        `)
        .join('');
}

function applySubjectCopy() {
    setText('cover-hook', subjectCopy.cover.hook);

    setText('overview-heading', subjectCopy.overview.heading);
    renderOverviewIntro();
    setText('overview-question', subjectCopy.overview.question);

    setText('path-desc-cl', subjectCopy.paths.culturalLensDescription);
    setText('path-desc-disc', subjectCopy.paths.discussionDescription);
    setText('reflection-path-title', subjectCopy.paths.reflectionTitle);
    setText('reflection-path-desc', subjectCopy.paths.reflectionDescription);

    setText('cl-section-heading', subjectCopy.culturalLens.heading);
    setText('cl-section-intro', subjectCopy.culturalLens.intro);

    setText('discussion-section-heading', subjectCopy.discussion.heading);
    setText('discussion-section-intro', subjectCopy.discussion.intro);

    setText('reflection-title', subjectCopy.reflection.title);
    setText('reflection-summary', subjectCopy.reflection.summary);

    renderReflectionQuestions();
}

function isLessonComplete() {
    return Boolean(progress.lessonCompletedAt);
}

function completeLesson() {
    const wasComplete = isLessonComplete();

    progress.lessonCompletedAt = wasComplete
        ? null
        : Date.now();

    publishAtlasCompassItem(
        wasComplete
            ? 'wrap-up-undone'
            : 'completed'
    );

    updateReflectionCompleteState(!wasComplete);
    updateCoverActionUI();
}

function updateReflectionProgressSummary() {
    const summary = document.getElementById(
        'reflection-progress-summary'
    );

    if (!summary) return;

    const {
        momentsExplored,
        culturesExplored
    } = getSubjectExplorationCounts();

    const moments =
        `${momentsExplored} ${momentsExplored === 1 ? 'moment' : 'moments'}`;

    const cultures =
        `${culturesExplored} ${culturesExplored === 1 ? 'culture' : 'cultures'}`;

    summary.textContent = isLessonComplete()
        ? `${moments} · ${cultures}`
        : `${moments} explored · ${cultures} explored`;
}

function updateReflectionCompleteState(animate = false) {
    const view = document.getElementById('view-reflection');
    const button = document.getElementById('complete-lesson-btn');

    if (!view || !button) return;

    const complete = isLessonComplete();

    view.classList.toggle('reflection-complete', complete);
    updateReflectionProgressSummary();

    setText(
        'reflection-title',
        complete
            ? `You explored ${MODULE.title}`
            : subjectCopy.reflection.title
    );

    button.disabled = false;
    button.classList.toggle('btn-complete-done', complete);
    button.setAttribute('aria-pressed', String(complete));
    button.innerHTML = complete
        ? `
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8.2l3.1 3.1L13 4.5"
                        stroke="currentColor"
                        stroke-width="1.6"
                        stroke-linecap="round"
                        stroke-linejoin="round"/>
                </svg>
                Undo wrap up
            `
        : `
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8.2l3.1 3.1L13 4.5"
                        stroke="currentColor"
                        stroke-width="1.6"
                        stroke-linecap="round"
                        stroke-linejoin="round"/>
                </svg>
                Wrap up
            `;

    if (complete && animate) {
        view.classList.remove('reflection-complete-animate');

        requestAnimationFrame(() => {
            view.classList.add('reflection-complete-animate');

            window.setTimeout(() => {
                view.classList.remove('reflection-complete-animate');
            }, 900);
        });
    }
}

function applyDerivedLabels() {
    const culturalLensCount = clCards.length;
    const culturalLensLabel = document.getElementById('path-label-cl');

    if (culturalLensLabel) {
        culturalLensLabel.textContent =
            `${countLabel(culturalLensCount)} ${culturalLensCount === 1
                ? COMPASS_LABELS.culturalLensUnitSingular
                : COMPASS_LABELS.culturalLensUnitPlural
            }`;
    }

    const momentCount = discussionSets.reduce(
        (total, set) => total + set.moments.length,
        0
    );

    const discussionLabel = document.getElementById('path-label-disc');

    if (discussionLabel) {
        discussionLabel.textContent =
            `${countLabel(momentCount)} ${momentCount === 1
                ? COMPASS_LABELS.discussionUnitSingular
                : COMPASS_LABELS.discussionUnitPlural
            }`;
    }

    setText('orient-eyebrow', MODULE.title);
}


// ============================================================
// NAVIGATION RENDERING
// ============================================================

function getAtlasSearchIcon() {
    return window.AtlasSearch?.icon || `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.3"/>
            <path d="M10.5 10.5l3 3"
                stroke="currentColor"
                stroke-width="1.4"
                stroke-linecap="round"/>
        </svg>`;
}

function openAtlasSearch() {
    if (typeof window.AtlasSearch?.open === 'function') {
        window.AtlasSearch.open();
    }
}

function openAtlasSearchFromDrawer() {
    closeMobileDrawer();
    window.setTimeout(openAtlasSearch, 80);
}

function getCompassBrandModel() {
    return {
        system: 'Compass Library',
        subject: MODULE.title
    };
}

function renderCompassBrandLockup({
    iconClass = 'nav-brand-mark',
    textClass,
    systemClass,
    subjectClass
}) {
    const brand = getCompassBrandModel();
    const compassUrl = escHtml(getCompassWorldLaunchUrl());

    return `
            <a class="${iconClass}" href="${compassUrl}" aria-label="Back to Compass Library">
                ${COMPASS_BRAND_ICON_SVG}
            </a>
            <span class="${textClass}">
                <span class="${systemClass}">${escHtml(brand.system)}</span>
                <span class="${subjectClass}">${escHtml(brand.subject)}</span>
            </span>
        `;
}

function renderNav(containerId, activeViewId) {
    const container = document.getElementById(containerId);

    if (!container) return;

    const sessionSpanId = `nav-session-${activeViewId}`;

    const links = NAV_ITEMS.map(item => {
        const active = item.viewId === activeViewId;
        const click = active
            ? ''
            : `onclick="goToView('${item.viewId}')"`;

        return `<button
                class="nav-link${active ? ' active' : ''}"
                title="${escHtml(item.label)}"
                aria-label="${escHtml(item.label)}"
                ${click}>
                ${item.desktopSvg}
                ${escHtml(item.label)}
            </button>`;
    }).join('');

    container.innerHTML = `<nav class="top-nav">
            <div class="nav-brand">
                ${renderCompassBrandLockup({
        textClass: 'nav-brand-copy',
        systemClass: 'nav-brand-system',
        subjectClass: 'nav-brand-subject'
    })}
            </div>

            <div class="nav-links">${links}</div>

            <div class="nav-actions">
                <button
                    class="nav-session-indicator"
                    onclick="openSessionModal()"
                    title="Session settings"
                    aria-label="Open session panel. Working with Shared">
                    ${NAV_SVG.session}
                    <span id="${sessionSpanId}">Shared</span>
                </button>

                <button
                    class="nav-keylang-btn nav-search-btn"
                    onclick="openAtlasSearch()"
                    title="Search"
                    aria-label="Search">
                    ${getAtlasSearchIcon()}
                </button>

                <button
                    class="nav-keylang-btn"
                    onclick="openVocabBank()"
                    title="Language Bank"
                    aria-label="Open Language Bank">
                    ${NAV_SVG.keylang}
                </button>

                <button
                    class="appearance-toggle nav-appearance-toggle"
                    onclick="toggleAppearanceMode()"
                    title="Switch to night mode"
                    aria-label="Switch to night mode">
                </button>
            </div>

            <div class="global-progress-rail" aria-hidden="true">
                <div class="global-progress-fill"></div>
            </div>
        </nav>`;
}

function renderMobileHeader(containerId, viewKey) {
    const container = document.getElementById(containerId);

    if (!container) return;

    container.innerHTML = `<header class="mobile-header">
            <div class="mobile-header-brand">
                ${renderCompassBrandLockup({
        textClass: 'mobile-header-title-block',
        systemClass: 'mobile-header-system',
        subjectClass: 'mobile-header-context'
    })}
            </div>

            <div class="mobile-header-actions">
                <button
                    class="mobile-menu-btn mobile-search-btn"
                    onclick="openAtlasSearch()"
                    title="Search"
                    aria-label="Search">
                    ${getAtlasSearchIcon()}
                </button>

                <button
                    class="mobile-menu-btn"
                    onclick="openMobileDrawer('${viewKey}')"
                    title="Menu"
                    aria-label="Open menu">
                    ${NAV_SVG.hamburger}
                </button>
            </div>
        </header>`;
}

function renderMobileDrawerNav() {
    const container = document.getElementById('mobile-drawer-nav');

    if (!container) return;

    setText('mobile-drawer-subject-title', MODULE.title);

    const items = NAV_ITEMS.map(item => `
            <button
                class="mobile-nav-item"
                id="mob-nav-${item.id}"
                onclick="mobileNavTo('${item.viewId}')">
                ${item.mobileSvg}
                ${escHtml(item.label)}
            </button>
        `).join('');

    container.innerHTML = `${items}
            <div class="mobile-drawer-divider"></div>

            <button class="mobile-nav-item" onclick="openAtlasSearchFromDrawer()">
                ${getAtlasSearchIcon()}
                Search
            </button>

            <button class="mobile-nav-item" onclick="openVocabBankFromDrawer()">
                ${NAV_SVG.keylangMobile}
                Language Bank
            </button>
        `;
}


// ============================================================
// VIEW NAVIGATION
// ============================================================

function beginModule() {
    document.body.classList.add('module-active');
    goToView('view-orientation');
}

function goToView(viewId) {
    closeCompassWrapUp({ restoreScroll: false });

    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    const target = document.getElementById(viewId);

    if (target) {
        target.classList.add('active');
    }

    window.scrollTo(0, 0);

    document.body.classList.toggle(
        'module-active',
        viewId !== 'view-cover'
    );

    closeUpgradeVisibilityMenus();
    closeAllUpgradePanels();

    if (viewId === 'view-cultural-lens') {
        renderCLGrid();
        renderUpgradeVisibilityControls();
    }

    if (viewId === 'view-discussion') {
        renderDiscussionSets();
        renderUpgradeVisibilityControls();
    }

    if (viewId === 'view-reflection') {
        renderReflectionQuestions();
        updateReflectionCompleteState();
    }
}


// ============================================================
// COMPASS WRAP-UP
// Loaded-page evidence only; never inferred from stored progress.
// ============================================================

function isCompassWrapUpOpen() {
    const canvas = document.getElementById('compass-wrap-up-canvas');

    return Boolean(canvas && !canvas.hidden);
}

function getAtlasHomeUrl() {
    return new URL('../../index.html', window.location.href).href;
}

function renderCompassWrapUp() {
    const activeSession = getCurrentBridgeSession();
    const evidence = getWrapUpEvidence(activeSession.id, false) || {
        exploredItems: [],
        savedLanguageEntryIds: new Set()
    };
    const recap = getCompassWrapUpRecap(evidence.exploredItems);

    const exploredSection = document.getElementById('compass-wrap-up-explored');
    const list = document.getElementById('compass-wrap-up-list');
    const more = document.getElementById('compass-wrap-up-more');
    const savedSection = document.getElementById(
        'compass-wrap-up-saved-section'
    );
    const saved = document.getElementById('compass-wrap-up-saved');
    const empty = document.getElementById('compass-wrap-up-empty');
    const pickup = document.getElementById('compass-wrap-up-pickup');
    const pickupValue = document.getElementById(
        'compass-wrap-up-pickup-value'
    );

    if (exploredSection) {
        exploredSection.hidden = recap.displayedItems.length === 0;
    }

    if (list) {
        list.innerHTML = recap.displayedItems
            .map(item => `<li>${escHtml(item.title)}</li>`)
            .join('');
    }

    if (more) {
        more.hidden = !recap.showMore;
    }

    const savedLanguageCount = evidence.savedLanguageEntryIds.size;

    if (savedSection) {
        savedSection.hidden = savedLanguageCount === 0;
    }

    if (saved) {
        saved.textContent = `${savedLanguageCount} ${savedLanguageCount === 1
            ? 'item'
            : 'items'} saved`;
    }

    if (empty) {
        empty.hidden = !(
            evidence.exploredItems.length === 0 &&
            savedLanguageCount === 0
        );
    }

    if (pickup && pickupValue) {
        pickup.hidden = !recap.anchor;
        pickupValue.textContent = recap.anchor?.title || '';
    }
}

function getCompassWrapUpRecap(exploredItems) {
    const fullList = Array.isArray(exploredItems) ? exploredItems : [];
    const anchor = fullList[fullList.length - 1] || null;
    const priorItems = anchor ? fullList.slice(0, -1) : [];

    return {
        anchor,
        displayedItems: fullList.length >= 6
            ? priorItems.slice(0, 4)
            : priorItems,
        showMore: fullList.length >= 6
    };
}

function openCompassWrapUp() {
    const canvas = document.getElementById('compass-wrap-up-canvas');
    const activeView = document.querySelector('.view.active');

    if (!canvas || !activeView) return;

    wrapUpOriginView = activeView;
    wrapUpPreviousBodyOverflow = document.body.style.overflow;
    wrapUpPreviousRootOverflow = document.documentElement.style.overflow;
    wrapUpPreviousScrollX = window.scrollX;
    wrapUpPreviousScrollY = window.scrollY;
    activeView.appendChild(canvas);
    renderCompassWrapUp();

    canvas.hidden = false;
    canvas.scrollTop = 0;
    document.documentElement.classList.add('compass-wrap-up-active');
    document.body.classList.add('compass-wrap-up-active');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    window.requestAnimationFrame(() => {
        document
            .getElementById('compass-wrap-up-kicker')
            ?.focus({ preventScroll: true });
    });
}

function closeCompassWrapUp({
    restoreFocus = false,
    restoreScroll = true
} = {}) {
    const canvas = document.getElementById('compass-wrap-up-canvas');

    if (!canvas || canvas.hidden) return;

    canvas.hidden = true;
    document.documentElement.classList.remove('compass-wrap-up-active');
    document.body.classList.remove('compass-wrap-up-active');
    document.documentElement.style.overflow = wrapUpPreviousRootOverflow;
    document.body.style.overflow = wrapUpPreviousBodyOverflow;

    const focusTarget = restoreFocus && wrapUpOriginView
        ? wrapUpOriginView.querySelector(
            '.nav-session-indicator, .cover-session-btn, h1, h2'
        )
        : null;

    if (restoreScroll || focusTarget) {
        window.requestAnimationFrame(() => {
            if (restoreScroll) {
                window.scrollTo(
                    wrapUpPreviousScrollX,
                    wrapUpPreviousScrollY
                );
            }

            focusTarget?.focus?.({ preventScroll: true });
        });
    }
}

function keepTeachingFromWrapUp() {
    closeCompassWrapUp({ restoreFocus: true });
}

function finishCompassWrapUp() {
    const Bridge = requireAtlasBridge();
    const activeSession = getCurrentBridgeSession();
    const evidence = getWrapUpEvidence(activeSession.id, false) || {
        exploredItems: [],
        savedLanguageEntryIds: new Set()
    };
    const pickupItem = getCompassWrapUpRecap(evidence.exploredItems).anchor;
    const handoff = Bridge.writeHandoff({
        v: 1,
        sessionId: activeSession.id,
        subjectId: MODULE.id,
        subjectTitle: MODULE.title,
        world: COMPASS_WORLD_ID,
        exploredItems: evidence.exploredItems,
        savedLanguageCount: evidence.savedLanguageEntryIds.size,
        pickupLabel: pickupItem?.title || null,
        pickupRef: pickupItem?.id || null,
        completedAt: Date.now()
    });

    if (!handoff) {
        console.warn('[Compass] Handoff write failed.');
        return;
    }

    clearWrapUpEvidence(activeSession.id);
    window.location.assign(getAtlasHomeUrl());
}


// ============================================================
// UPGRADE VISIBILITY
// ============================================================

function getUpgradeVisibility() {
    const Bridge = requireAtlasBridge();

    if (typeof Bridge.readUpgradeVisibility === 'function') {
        return Bridge.readUpgradeVisibility();
    }

    return 'key';
}

function shouldShowInlineUpgrade(upgrade) {
    if (!upgrade) return false;

    const mode = getUpgradeVisibility();

    if (mode === 'off') return false;
    if (mode === 'all') return true;

    return upgrade.priority === 'key';
}

function getUpgradeVisibilityLabel(mode = getUpgradeVisibility()) {
    if (mode === 'off') return 'Off';
    if (mode === 'all') return 'All';

    return 'Key';
}

function buildUpgradeVisibilityControl(scope) {
    const mode = getUpgradeVisibility();
    const menuId = `${scope}-upgrade-menu`;
    const triggerId = `${scope}-upgrade-trigger`;

    const options = [
        {
            value: 'off',
            label: 'Off',
            copy: 'Hidden'
        },
        {
            value: 'key',
            label: 'Key',
            copy: 'Selected only'
        },
        {
            value: 'all',
            label: 'All',
            copy: 'Show everything'
        }
    ];

    return `
            <div class="upgrade-visibility-control" data-upgrade-control="${scope}">
                <button
                    class="upgrade-visibility-trigger"
                    id="${triggerId}"
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded="false"
                    aria-controls="${menuId}"
                    onclick="toggleUpgradeVisibilityMenu('${scope}', event)">

                    ${UPGRADE_ICON_SVG}

                    <span>Language upgrades</span>

                    <strong>
                        ${getUpgradeVisibilityLabel(mode)}
                    </strong>
                </button>

                <div
                    class="upgrade-visibility-menu"
                    id="${menuId}"
                    role="menu"
                    hidden>

                    ${options.map(option => `
                        <button
                            class="upgrade-visibility-option${mode === option.value ? ' is-selected' : ''}"
                            type="button"
                            role="menuitemradio"
                            aria-checked="${String(mode === option.value)}"
                            onclick="setUpgradeVisibilityPreference('${option.value}', event)">

                            <span class="upgrade-visibility-option-label">
                                ${escHtml(option.label)}
                            </span>

                            <span class="upgrade-visibility-option-copy">
                                ${escHtml(option.copy)}
                            </span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
}

function renderUpgradeVisibilityControls() {
    const discussionMount = document.getElementById(
        'discussion-upgrade-control'
    );

    const culturalLensMount = document.getElementById(
        'cultural-lens-upgrade-control'
    );

    if (discussionMount) {
        discussionMount.innerHTML =
            buildUpgradeVisibilityControl('discussion');
    }

    if (culturalLensMount) {
        culturalLensMount.innerHTML =
            buildUpgradeVisibilityControl('cultural-lens');
    }
}

function closeUpgradeVisibilityMenus(exceptScope = '') {
    document.querySelectorAll('.upgrade-visibility-menu').forEach(menu => {
        const control = menu.closest('.upgrade-visibility-control');
        const scope = control?.dataset.upgradeControl || '';

        if (scope === exceptScope) return;

        menu.hidden = true;

        const trigger = control?.querySelector(
            '.upgrade-visibility-trigger'
        );

        if (trigger) {
            trigger.setAttribute('aria-expanded', 'false');
        }
    });
}

function toggleUpgradeVisibilityMenu(scope, event) {
    event?.stopPropagation();

    const menu = document.getElementById(`${scope}-upgrade-menu`);
    const trigger = document.getElementById(`${scope}-upgrade-trigger`);

    if (!menu || !trigger) return;

    const opening = menu.hidden;

    closeUpgradeVisibilityMenus(scope);

    menu.hidden = !opening;
    trigger.setAttribute('aria-expanded', String(opening));
}

function setUpgradeVisibilityPreference(mode, event) {
    event?.stopPropagation();

    const Bridge = requireAtlasBridge();

    if (typeof Bridge.setUpgradeVisibility !== 'function') {
        console.warn(
            '[Compass] AtlasBridge.setUpgradeVisibility is missing.'
        );
        return;
    }

    Bridge.setUpgradeVisibility(mode);
    applyUpgradeVisibilityPreference();
}

function getExpandedMomentId() {
    return document.querySelector('.moment-card.expanded')?.dataset
        .momentId || '';
}

function restoreExpandedMoment(momentId) {
    if (!momentId) return;

    document.getElementById(
        `moment-card-${momentId}`
    )?.classList.add('expanded');
}

function applyUpgradeVisibilityPreference() {
    const expandedMomentId = getExpandedMomentId();

    closeUpgradeVisibilityMenus();
    closeAllUpgradePanels();

    renderUpgradeVisibilityControls();

    if (activeSetId) {
        const set = discussionSets.find(item => item.id === activeSetId);

        if (set) {
            renderMoments(set);
            restoreExpandedMoment(expandedMomentId);
        }
    }

    const modalOpen = document
        .getElementById('cl-modal-overlay')
        ?.classList.contains('open');

    if (modalOpen) {
        renderCurrentModalUpgrade();
    }
}


// ============================================================
// UPGRADE AND SAVED LANGUAGE
// ============================================================

function findLessonUpgradeById(id) {
    const culturalLensCard = clCards.find(card => card.id === id);

    if (culturalLensCard?.upgrade) {
        return {
            sourceElementId: culturalLensCard.id,
            sourceKind: 'cultural-lens',
            upgrade: culturalLensCard.upgrade
        };
    }

    for (const set of discussionSets) {
        const moment = set.moments.find(item => item.id === id);

        if (moment?.upgrade) {
            return {
                sourceElementId: moment.id,
                sourceKind: 'moment',
                upgrade: moment.upgrade
            };
        }
    }

    return null;
}

function getSourceElementIdFromUpgradeContextId(contextId) {
    const value = String(contextId || '');

    if (value.startsWith('moment-')) {
        return value.slice('moment-'.length);
    }

    if (value.startsWith('cl-')) {
        return value.slice('cl-'.length);
    }

    return value;
}

function getUpgradeSourceFromContextId(contextId) {
    const sourceElementId =
        getSourceElementIdFromUpgradeContextId(contextId);

    const found = findLessonUpgradeById(sourceElementId);

    if (!found) return null;

    return {
        ...found,
        contextId,
        sourceElementId
    };
}

function getSavedLanguageEntryId(contextId) {
    const Bridge = requireAtlasBridge();
    const activeSession = getCurrentBridgeSession();
    const source = getUpgradeSourceFromContextId(contextId);

    if (!source?.upgrade) return '';

    const termSlug = Bridge.slugify(
        source.upgrade.term || source.sourceElementId
    );

    return [
        COMPASS_WORLD_ID,
        'language',
        activeSession.id,
        MODULE.id,
        source.sourceElementId,
        termSlug
    ].join(':');
}

function isUpgradeSaved(contextId) {
    const entryId = getSavedLanguageEntryId(contextId);

    if (!entryId) return false;

    const entry = requireAtlasBridge().readLedger().entries?.[entryId];

    return !!entry && entry.status === 'saved';
}

function buildSavedLanguageEntry(contextId) {
    const activeSession = getCurrentBridgeSession();
    const source = getUpgradeSourceFromContextId(contextId);

    if (!source?.upgrade) return null;

    const entryId = getSavedLanguageEntryId(contextId);

    if (!entryId) return null;

    const timestamp = Date.now();
    const upgrade = source.upgrade;

    return {
        id: entryId,
        kind: 'language',
        status: 'saved',

        sessionId: activeSession.id,
        sessionName: activeSession.name,

        sourceWorld: COMPASS_WORLD_ID,
        sourceItem: MODULE.id,
        sourceRegistryId: getContentRegistryId(),
        sourceTitle: MODULE.title,
        sourceNavTitle: MODULE.navTitle || MODULE.title,
        sourceElementId: source.sourceElementId,
        sourceKind: source.sourceKind,

        term: upgrade.term,
        type: upgrade.type,
        definition: upgrade.definition,
        ordinary: upgrade.ordinary ?? null,
        upgraded: upgrade.upgraded,
        priority: upgrade.priority,
        atlasPrompt: upgrade.atlasPrompt,

        savedAt: timestamp,
        lastTouchedAt: timestamp
    };
}

function updateUpgradeSaveButton(contextId) {
    const button = document.getElementById(`us-${contextId}`);

    if (!button) return;

    const saved = isUpgradeSaved(contextId);

    button.classList.toggle('is-saved', saved);
    button.setAttribute('aria-pressed', String(saved));
    button.title = saved
        ? 'Remove from Language Bank'
        : 'Save to Language Bank';
    button.textContent = saved ? 'Saved' : 'Save';
}

function saveLanguageFromUpgrade(contextId) {
    const entry = buildSavedLanguageEntry(contextId);

    if (!entry) return;

    requireAtlasBridge().upsertLedgerEntry(entry);
    recordSavedLanguageForWrapUp(entry.sessionId, entry.id);

    updateUpgradeSaveButton(contextId);
    publishAtlasCompassItem('language-saved');
}

function unsaveLanguageFromUpgrade(contextId) {
    const Bridge = requireAtlasBridge();
    const activeSession = getCurrentBridgeSession();
    const entryId = getSavedLanguageEntryId(contextId);

    if (!entryId) return;

    const ledger = Bridge.readLedger();

    if (ledger.entries?.[entryId]) {
        delete ledger.entries[entryId];
        Bridge.writeLedger(ledger);
    }

    removeSavedLanguageFromWrapUp(activeSession.id, entryId);

    updateUpgradeSaveButton(contextId);
    publishAtlasCompassItem('language-unsaved');
}

function toggleSavedLanguage(contextId, event) {
    event?.stopPropagation();
    event?.preventDefault();

    if (isUpgradeSaved(contextId)) {
        unsaveLanguageFromUpgrade(contextId);
    } else {
        saveLanguageFromUpgrade(contextId);
    }

    if (
        document
            .getElementById('vb-drawer')
            ?.classList.contains('open')
    ) {
        renderVocabBank();
    }
}

function buildUpgradeChip(upgrade, contextId) {
    if (!shouldShowInlineUpgrade(upgrade)) return '';

    const saved = isUpgradeSaved(contextId);

    return `
            <button
                class="upgrade-chip"
                id="uc-${escHtml(contextId)}"
                onclick="toggleUpgrade(${jsArg(contextId)}, event)"
                aria-expanded="false">
                ${UPGRADE_ICON_SVG}
                Upgrade: ${escHtml(upgrade.term)}
            </button>

            <div class="upgrade-panel" id="up-${escHtml(contextId)}">
                <div class="upgrade-panel-heading">
                    <p class="upgrade-panel-term">
                        ${escHtml(upgrade.term)}
                    </p>
                    <p class="upgrade-panel-type">
                        ${escHtml(upgrade.type)}
                    </p>
                </div>

                <p class="upgrade-panel-definition">
                    ${escHtml(upgrade.definition)}
                </p>

                ${upgrade.ordinary ? `
                    <div class="upgrade-transformation">
                        <div class="upgrade-example-row">
                            <span class="upgrade-example-label">Instead of</span>

                            <p class="upgrade-example upgrade-example-ordinary">
                                ${escHtml(upgrade.ordinary)}
                            </p>
                        </div>

                        <div class="upgrade-example-row upgrade-example-row-primary">
                            <span class="upgrade-example-label">Try</span>

                            <p class="upgrade-example upgrade-example-upgraded">
                                ${escHtml(upgrade.upgraded)}
                            </p>
                        </div>
                    </div>
                ` : `
                    <div class="upgrade-example-row upgrade-example-row-primary">
                        <span class="upgrade-example-label">Try</span>

                        <p class="upgrade-example upgrade-example-upgraded">
                            ${escHtml(upgrade.upgraded)}
                        </p>
                    </div>
                `}

                <div class="upgrade-panel-actions">
                    <button
                        class="upgrade-save-btn${saved ? ' is-saved' : ''}"
                        id="us-${escHtml(contextId)}"
                        type="button"
                        onclick="toggleSavedLanguage(${jsArg(contextId)}, event)"
                        aria-pressed="${String(saved)}"
                        title="${saved
            ? 'Remove from Language Bank'
            : 'Save to Language Bank'}">
                        ${saved ? 'Saved' : 'Save'}
                    </button>
                </div>
            </div>
        `;
}

function gentlyRevealUpgradePanel(panel) {
    if (!panel) return;

    requestAnimationFrame(() => {
        panel.scrollIntoView({
            behavior: getScrollBehavior(),
            block: 'nearest',
            inline: 'nearest'
        });
    });
}

function closeAllUpgradePanels() {
    document.querySelectorAll('.upgrade-panel.open').forEach(panel => {
        panel.classList.remove('open');

        const contextId = panel.id.replace('up-', '');
        const chip = document.getElementById(`uc-${contextId}`);

        if (chip) {
            chip.classList.remove('open');
            chip.setAttribute('aria-expanded', 'false');
        }

        panel
            .closest('.moment-upgrade-wrap')
            ?.classList.remove('upgrade-open');
    });
}

function toggleUpgrade(contextId, event) {
    event?.stopPropagation();

    const chip = document.getElementById(`uc-${contextId}`);
    const panel = document.getElementById(`up-${contextId}`);

    if (!chip || !panel) return;

    const opening = !panel.classList.contains('open');

    closeAllUpgradePanels();

    if (!opening) return;

    panel.classList.add('open');
    panel
        .closest('.moment-upgrade-wrap')
        ?.classList.add('upgrade-open');

    chip.classList.add('open');
    chip.setAttribute('aria-expanded', 'true');

    gentlyRevealUpgradePanel(panel);
}


// ============================================================
// EXPLORED STATE
// ============================================================

function loadProgress() {
    try {
        const Bridge = requireAtlasBridge();
        const activeSession = getCurrentBridgeSession();
        const registry = Bridge.readRegistry();
        const registryId = getContentRegistryId();

        const state =
            registry.sessionStates?.[activeSession.id]?.[registryId];

        const exploredIds = state?.progressRaw?.exploredIds;

        progress = {
            explored: new Set(
                Array.isArray(exploredIds) ? exploredIds : []
            ),
            lessonCompletedAt: state?.progressRaw?.lessonCompletedAt || null
        };
    } catch (error) {
        console.warn('[Compass] Progress load failed:', error);

        progress = {
            explored: new Set(),
            lessonCompletedAt: null
        };
    }
}

function saveProgress() {
    publishAtlasCompassItem('progress-updated');
}

function markExplored(id) {
    const newlyExplored = !progress.explored.has(id);

    progress.explored.add(id);

    if (newlyExplored) {
        recordExploredForWrapUp(id);
    }

    saveProgress();
    updateCoverActionUI();
    updateCLProgress();
    updateDiscussionProgress();
    updateReflectionProgressSummary();
}

function unmarkExplored(id) {
    progress.explored.delete(id);
    removeExploredFromWrapUp(id);
    saveProgress();
    updateCoverActionUI();
    updateCLProgress();
    updateDiscussionProgress();
    updateReflectionProgressSummary();
}

function getItemState(id) {
    return progress.explored.has(id)
        ? 'explored'
        : 'default';
}

function getExploredButtonContent(explored) {
    return `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6l3 3 5-5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"/>
        </svg>
        ${explored ? 'Explored' : 'Mark explored'}`;
}

function updateGlobalProgress() {
    const {
        exploredTotal,
        itemTotal
    } = getSubjectExplorationCounts();

    const complete = isLessonComplete();

    const percentage = complete
        ? 100
        : itemTotal > 0
            ? (exploredTotal / itemTotal) * 100
            : 0;

    document.querySelectorAll('.global-progress-rail').forEach(rail => {
        rail.classList.toggle('is-complete', complete);

        const fill = rail.querySelector('.global-progress-fill');

        if (fill) {
            fill.style.width = `${Math.min(100, percentage)}%`;
        }
    });
}

function updateCoverActionUI() {
    const button = document.getElementById('cover-begin-btn');

    if (button) {
        const label = isLessonComplete()
            ? 'Review lesson'
            : progress.explored.size > 0
                ? 'Continue lesson'
                : 'Begin lesson';

        button.innerHTML = `
                ${label}
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M3 7.5h9M8.5 4l3.5 3.5-3.5 3.5"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"/>
                </svg>
            `;
    }

    updateGlobalProgress();
}

function refreshExploredUI() {
    renderCLGrid();
    renderDiscussionSets();

    if (activeSetId) {
        const set = discussionSets.find(item => item.id === activeSetId);

        if (set) {
            renderMoments(set);
        }
    }

    updateCoverActionUI();
}


// ============================================================
// CULTURAL LENS
// ============================================================

function renderCLGrid() {
    const grid = document.getElementById('cl-grid');

    if (!grid) return;

    grid.innerHTML = '';

    clCards.forEach((card, index) => {
        const state = getItemState(card.id);
        const element = document.createElement('div');

        element.className = `cl-card state-${state}`;
        element.dataset.id = card.id;
        element.dataset.index = String(index);
        element.setAttribute('role', 'button');
        element.setAttribute('tabindex', '0');

        element.onclick = () => openCLModal(index);

        element.onkeydown = event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openCLModal(index);
            }
        };

        element.innerHTML = `
                <div class="cl-card-state-badge" aria-hidden="true">
                    ${state === 'explored'
                ? `<svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                            <path d="M2 5.5l2.5 2.5L9 2.5"
                                stroke="currentColor"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"/>
                        </svg>`
                : `<svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                            <circle cx="4.5" cy="4.5" r="3.5"
                                stroke="currentColor"
                                stroke-width="1.2"/>
                        </svg>`
            }
                </div>

                <h3 class="cl-card-title">
                    ${escHtml(card.title)}
                </h3>

                <p class="cl-card-teaser">
                    ${escHtml(card.teaser)}
                </p>

                <p class="cl-card-location">
                    ${escHtml(card.contextLine)}
                </p>
            `;

        grid.appendChild(element);
    });

    updateCLProgress();
}

function updateCLProgress() {
    const explored = clCards.filter(card =>
        progress.explored.has(card.id)
    ).length;

    const count = document.getElementById('cl-explored-count');
    const status = count?.closest('.subject-utility-status');

    if (!count) return;

    if (status) {
        status.hidden = explored === 0;
    }

    count.style.display = explored > 0
        ? 'inline-flex'
        : 'none';

    const text = count.querySelector('span');

    if (text) {
        text.textContent = `${explored} explored`;
    }
}

function renderCurrentModalUpgrade() {
    const card = clCards[currentModalIndex];
    const row = document.getElementById('modal-upgrade-row');

    if (!card || !row) return;

    row.innerHTML = buildUpgradeChip(
        card.upgrade,
        `cl-${card.id}`
    );
}

function renderFollowTheThread(card) {
    const container = document.getElementById(
        'modal-follow-thread-questions'
    );

    const block = document.getElementById('modal-follow-thread');

    if (!container || !block) return;

    const questions = Array.isArray(card.followTheThread)
        ? card.followTheThread
        : [];

    block.hidden = questions.length === 0;

    container.innerHTML = questions.map(question => `
            <p class="follow-thread-question">
                ${escHtml(question)}
            </p>
        `).join('');
}

function openCLModal(index) {
    const card = clCards[index];

    if (!card) return;

    currentModalIndex = index;

    setText('modal-context-line', card.contextLine);
    setText('modal-title', card.title);
    setText('modal-context', card.context);
    setText('modal-main-question', card.mainQuestion);

    renderFollowTheThread(card);
    renderCurrentModalUpgrade();

    const previousButton = document.getElementById('modal-prev-btn');
    const nextButton = document.getElementById('modal-next-btn');

    if (previousButton) {
        previousButton.disabled = index === 0;
        previousButton.style.opacity = index === 0
            ? '0.35'
            : '1';
    }

    if (nextButton) {
        nextButton.disabled = index === clCards.length - 1;
        nextButton.style.opacity =
            index === clCards.length - 1
                ? '0.35'
                : '1';
    }

    updateCLModalExploredButton();
    resetModalScroll();

    document
        .getElementById('cl-modal-overlay')
        ?.classList.add('open');

    document.body.style.overflow = 'hidden';

    activateFocusTrap(
        document.getElementById('cl-modal-panel')
    );
}

function resetModalScroll() {
    const overlay = document.getElementById('cl-modal-overlay');
    const panel = document.getElementById('cl-modal-panel');
    const body = panel?.querySelector('.modal-body');

    [overlay, panel, body].forEach(element => {
        if (element) {
            element.scrollTop = 0;
        }
    });

    requestAnimationFrame(() => {
        [overlay, panel, body].forEach(element => {
            if (element) {
                element.scrollTop = 0;
            }
        });
    });
}

function closeModal() {
    document
        .getElementById('cl-modal-overlay')
        ?.classList.remove('open');

    document.body.style.overflow = '';

    closeAllUpgradePanels();
    renderCLGrid();
    releaseFocusTrap();
}

function handleModalOverlayClick(event) {
    if (event.target === document.getElementById('cl-modal-overlay')) {
        closeModal();
    }
}

function navigateModal(direction) {
    const nextIndex = currentModalIndex + direction;

    if (nextIndex >= 0 && nextIndex < clCards.length) {
        openCLModal(nextIndex);
    }
}

function updateCLModalExploredButton() {
    const button = document.getElementById('cl-modal-explored-btn');
    const card = clCards[currentModalIndex];

    if (!button || !card) return;

    const explored = progress.explored.has(card.id);

    button.classList.toggle('is-explored', explored);
    button.setAttribute('aria-pressed', String(explored));
    button.setAttribute(
        'aria-label',
        explored ? 'Mark as not explored' : 'Mark explored'
    );

    button.title = explored
        ? 'Mark this card as not explored'
        : 'Mark this card as explored';

    button.innerHTML = getExploredButtonContent(explored);
}

function toggleCLExploredFromModal() {
    const card = clCards[currentModalIndex];

    if (!card) return;

    if (progress.explored.has(card.id)) {
        unmarkExplored(card.id);
        updateCLModalExploredButton();
        renderCLGrid();
        return;
    }

    markExplored(card.id);
    closeModal();
}


// ============================================================
// DISCUSSION
// ============================================================

function getSetIconSvg(type, active) {
    const color = active ? '#fff' : 'var(--accent)';

    if (type === 'react') {
        return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3.4 5A2.4 2.4 0 015.8 2.6h8.4A2.4 2.4 0 0116.6 5v5.8a2.4 2.4 0 01-2.4 2.4h-3.4L7.2 16v-2.8H5.8a2.4 2.4 0 01-2.4-2.4V5Z"
                    stroke="${color}"
                    stroke-width="1.45"
                    stroke-linejoin="round"/>
                <path d="M6.5 8.2h2.1l1.1-1.8l1.3 3.7l1.1-1.9h1.5"
                    stroke="${color}"
                    stroke-width="1.35"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>
            </svg>`;
    }

    if (type === 'explain') {
        return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3a5 5 0 014 8 3 3 0 01-4 2.83A3 3 0 016 11a5 5 0 014-8z"
                    stroke="${color}"
                    stroke-width="1.4"/>
                <path d="M8 17h4M9 14.5v2.5M11 14.5v2.5"
                    stroke="${color}"
                    stroke-width="1.3"
                    stroke-linecap="round"/>
            </svg>`;
    }

    if (type === 'reflect') {
        return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3.2L16 6.6L10 10L4 6.6L10 3.2Z"
                    stroke="${color}"
                    stroke-width="1.35"
                    stroke-linejoin="round"/>
                <path d="M4.4 10L10 13.2L15.6 10"
                    stroke="${color}"
                    stroke-width="1.35"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>
                <path d="M4.4 13.2L10 16.4L15.6 13.2"
                    stroke="${color}"
                    stroke-width="1.35"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>
            </svg>`;
    }

    return '';
}

function renderDiscussionSets() {
    const container = document.getElementById('discussion-sets');

    if (!container) return;

    container.innerHTML = '';

    discussionSets.forEach(set => {
        const element = document.createElement('div');
        const active = activeSetId === set.id;

        element.className =
            `set-card${active ? ' active-set' : ''}`;

        element.setAttribute('role', 'button');
        element.setAttribute('tabindex', '0');

        element.onclick = () => openSet(set.id);

        element.onkeydown = event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openSet(set.id);
            }
        };

        element.innerHTML = `
                <div class="set-icon">
                    ${getSetIconSvg(set.icon, active)}
                </div>

                <p class="set-stage">
                    ${escHtml(set.stage)}
                </p>

                <h3 class="set-title">
                    ${escHtml(set.title)}
                </h3>

                <p class="set-desc">
                    ${escHtml(set.description)}
                </p>
            `;

        container.appendChild(element);
    });

    updateDiscussionProgress();
}

function updateDiscussionProgress() {
    const explored = discussionSets
        .flatMap(set => set.moments)
        .filter(moment => progress.explored.has(moment.id))
        .length;

    const count = document.getElementById('disc-explored-count');
    const status = count?.closest('.subject-utility-status');

    if (!count) return;

    if (status) {
        status.hidden = explored === 0;
    }

    count.style.display = explored > 0
        ? 'inline-flex'
        : 'none';

    const text = count.querySelector('span');

    if (text) {
        text.textContent = `${explored} explored`;
    }
}

function openSet(setId) {
    const set = discussionSets.find(item => item.id === setId);

    if (!set) return;

    activeSetId = setId;

    setText('moments-panel-title', set.title);
    renderMoments(set);

    document
        .getElementById('moments-panel')
        ?.classList.add('open');

    renderDiscussionSets();

    window.setTimeout(() => {
        document
            .getElementById('moments-panel')
            ?.scrollIntoView({
                behavior: getScrollBehavior(),
                block: 'start'
            });
    }, 100);
}

function closeSet() {
    activeSetId = null;

    document
        .getElementById('moments-panel')
        ?.classList.remove('open');

    renderDiscussionSets();

    window.setTimeout(() => {
        document
            .getElementById('discussion-sets')
            ?.scrollIntoView({
                behavior: getScrollBehavior(),
                block: 'start'
            });
    }, 50);
}

function renderMoments(set) {
    const list = document.getElementById('moments-list');

    if (!list) return;

    list.innerHTML = '';

    set.moments.forEach((moment, index) => {
        const state = getItemState(moment.id);
        const explored = state === 'explored';
        const card = document.createElement('div');

        card.className = `moment-card state-${state}`;
        card.id = `moment-card-${moment.id}`;
        card.dataset.momentId = moment.id;

        const upgrade = buildUpgradeChip(
            moment.upgrade,
            `moment-${moment.id}`
        );

        card.innerHTML = `
                <div
                    class="moment-card-header"
                    role="button"
                    tabindex="0"
                    onclick="toggleMoment('${moment.id}')"
                    onkeydown="if(event.key==='Enter'||event.key===' ') { event.preventDefault(); toggleMoment('${moment.id}'); }">

                    <div class="moment-state-dot"></div>

                    <span class="moment-num">
                        ${String(index + 1).padStart(2, '0')}
                    </span>

                    <span class="moment-preview">
                        ${escHtml(moment.preview)}
                    </span>

                    <svg class="moment-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 5l4 4 4-4"
                            stroke="currentColor"
                            stroke-width="1.4"
                            stroke-linecap="round"
                            stroke-linejoin="round"/>
                    </svg>
                </div>

                <div class="moment-body">
                    <p class="moment-text">
                        ${escHtml(moment.question)}
                    </p>

                    <div class="moment-upgrade-wrap">
                        <div class="moment-action-row">
                            <div class="moment-upgrade-slot">
                                ${upgrade}
                            </div>

                            <button
                                class="btn-mark-explored${explored ? ' is-explored' : ''}"
                                id="moment-btn-${moment.id}"
                                onclick="toggleMomentExplored('${moment.id}')"
                                aria-pressed="${String(explored)}"
                                aria-label="${explored ? 'Mark as not explored' : 'Mark explored'}"
                                title="${explored
                ? 'Mark this moment as not explored'
                : 'Mark this moment as explored'}">
                                ${getExploredButtonContent(explored)}
                            </button>
                        </div>
                    </div>
                </div>
            `;

        list.appendChild(card);
    });

    if (set.makeItReal) {
        const card = document.createElement('div');

        card.className = 'make-it-real-card';

        card.innerHTML = `
                <div class="make-it-real-header">
                    <span class="make-it-real-badge">
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                            <path d="M5.5 1L6.3 4.1 9.5 4.5 6.3 4.9 5.5 8 4.7 4.9 1.5 4.5 4.7 4.1Z"
                                stroke="currentColor"
                                stroke-width="1"
                                stroke-linejoin="round"/>
                        </svg>
                        Make It Real
                    </span>

                    <span class="make-it-real-title">
                        ${escHtml(set.makeItReal.title)}
                    </span>
                </div>

                <div class="make-it-real-body">
                    <p class="make-it-real-prompt">
                        ${escHtml(set.makeItReal.prompt)}
                    </p>
                </div>
            `;

        list.appendChild(card);
    }

    const closeButton = document.createElement('button');

    closeButton.className =
        'btn-close-set btn-close-set-bottom';

    closeButton.type = 'button';
    closeButton.onclick = closeSet;

    closeButton.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 2l8 8M10 2l-8 8"
                    stroke="currentColor"
                    stroke-width="1.4"
                    stroke-linecap="round"/>
            </svg>
            Close set
        `;

    list.appendChild(closeButton);
}

function toggleMoment(momentId) {
    const card = document.getElementById(
        `moment-card-${momentId}`
    );

    if (!card) return;

    const opening = !card.classList.contains('expanded');

    document
        .querySelectorAll('.moment-card.expanded')
        .forEach(element => {
            element.classList.remove('expanded');
        });

    closeAllUpgradePanels();

    if (opening) {
        card.classList.add('expanded');
    }
}

function updateMomentCard(momentId) {
    const card = document.getElementById(
        `moment-card-${momentId}`
    );

    if (!card) return;

    const expanded = card.classList.contains('expanded');
    const state = getItemState(momentId);

    card.className =
        `moment-card state-${state}${expanded ? ' expanded' : ''}`;
}

function toggleMomentExplored(momentId) {
    const explored = progress.explored.has(momentId);

    if (explored) {
        unmarkExplored(momentId);
    } else {
        markExplored(momentId);
    }

    const button = document.getElementById(
        `moment-btn-${momentId}`
    );

    const nextExplored = !explored;

    if (button) {
        button.className =
            `btn-mark-explored${nextExplored ? ' is-explored' : ''}`;

        button.setAttribute(
            'aria-pressed',
            String(nextExplored)
        );

        button.setAttribute(
            'aria-label',
            nextExplored
                ? 'Mark as not explored'
                : 'Mark explored'
        );

        button.title = nextExplored
            ? 'Mark this moment as not explored'
            : 'Mark this moment as explored';

        button.innerHTML =
            getExploredButtonContent(nextExplored);
    }

    updateMomentCard(momentId);
    renderDiscussionSets();
    updateDiscussionProgress();
}


// ============================================================
// LANGUAGE BANK
// ============================================================

function openVocabBank() {
    vocabBankActiveTab = 'saved';
    vocabBankEditMode = false;

    renderVocabBank();

    document
        .getElementById('vb-overlay')
        ?.classList.add('open');

    document
        .getElementById('vb-drawer')
        ?.classList.add('open');

    scrollVocabBankToTop();

    document.body.style.overflow = 'hidden';

    activateFocusTrap(
        document.getElementById('vb-drawer')
    );
}

function closeVocabBank() {
    document
        .getElementById('vb-overlay')
        ?.classList.remove('open');

    document
        .getElementById('vb-drawer')
        ?.classList.remove('open');

    document.body.style.overflow = '';

    releaseFocusTrap();
}

function setVocabBankTab(tab) {
    vocabBankActiveTab = tab === 'all'
        ? 'all'
        : 'saved';

    vocabBankEditMode = false;

    renderVocabBank();
    scrollVocabBankToTop();
}

function toggleVocabBankEditMode() {
    vocabBankEditMode = !vocabBankEditMode;
    renderVocabBank();
}

function scrollVocabBankToTop() {
    const list = document.getElementById('vb-list');

    if (!list) return;

    list.scrollTop = 0;

    requestAnimationFrame(() => {
        list.scrollTop = 0;
    });
}

function updateVocabBankTabs() {
    const savedTab = document.getElementById('vb-tab-saved');
    const allTab = document.getElementById('vb-tab-all');

    if (!savedTab || !allTab) return;

    const savedActive = vocabBankActiveTab === 'saved';

    savedTab.classList.toggle('active', savedActive);
    allTab.classList.toggle('active', !savedActive);

    savedTab.setAttribute(
        'aria-selected',
        String(savedActive)
    );

    allTab.setAttribute(
        'aria-selected',
        String(!savedActive)
    );

    savedTab.setAttribute(
        'tabindex',
        savedActive ? '0' : '-1'
    );

    allTab.setAttribute(
        'tabindex',
        savedActive ? '-1' : '0'
    );
}

function getSavedLanguageEntriesForCurrentSubject() {
    const Bridge = requireAtlasBridge();
    const activeSession = getCurrentBridgeSession();
    const ledger = Bridge.readLedger();

    return Object.values(ledger.entries || {})
        .filter(entry =>
            entry &&
            entry.kind === 'language' &&
            entry.status === 'saved' &&
            entry.sessionId === activeSession.id &&
            entry.sourceWorld === COMPASS_WORLD_ID &&
            entry.sourceItem === MODULE.id
        )
        .sort((a, b) =>
            (b.savedAt || b.lastTouchedAt || b.updatedAt || 0) -
            (a.savedAt || a.lastTouchedAt || a.updatedAt || 0)
        );
}

function getUpgradeContextIdFromSource(
    sourceKind,
    sourceElementId
) {
    if (sourceKind === 'cultural-lens') {
        return `cl-${sourceElementId}`;
    }

    if (sourceKind === 'moment') {
        return `moment-${sourceElementId}`;
    }

    return sourceElementId;
}

function getAllLanguageGroups() {
    return [
        {
            title: 'Cultural Lens',
            entries: clCards
                .filter(card => card.upgrade)
                .map(card => ({
                    ...card.upgrade,
                    contextId: `cl-${card.id}`
                }))
        },

        ...discussionSets.map(set => ({
            title: set.title,
            entries: set.moments
                .filter(moment => moment.upgrade)
                .map(moment => ({
                    ...moment.upgrade,
                    contextId: `moment-${moment.id}`
                }))
        }))
    ];
}

function renderVocabEntry({
    term = '',
    type = '',
    definition = '',
    ordinary = null,
    upgraded = '',
    contextId = '',
    showSaveControl = false,
    saveControlMode = 'toggle'
} = {}) {
    const canSave = Boolean(
        showSaveControl && contextId
    );

    const removeMode = saveControlMode === 'remove';
    const saved = canSave
        ? isUpgradeSaved(contextId)
        : false;

    const buttonLabel = removeMode
        ? 'Remove'
        : saved
            ? 'Saved'
            : 'Save';

    const buttonTitle = removeMode
        ? 'Remove from Language Bank'
        : saved
            ? 'Remove from Language Bank'
            : 'Save to Language Bank';

    const buttonClass = [
        'vb-entry-save-btn',
        saved && !removeMode ? 'is-saved' : '',
        removeMode ? 'is-remove' : ''
    ].filter(Boolean).join(' ');

    return `
            <div class="vb-entry">
                <div class="vb-entry-head">
                    <div class="vb-entry-title-wrap">
                        <p class="vb-entry-word">
                            ${escHtml(term)}
                        </p>

                        <p class="vb-entry-type">
                            ${escHtml(type)}
                        </p>
                    </div>

                    ${canSave ? `
                        <button
                            class="${buttonClass}"
                            type="button"
                            onclick="toggleSavedLanguage(${jsArg(contextId)}, event)"
                            aria-pressed="${String(saved)}"
                            title="${escHtml(buttonTitle)}">
                            ${escHtml(buttonLabel)}
                        </button>
                    ` : ''}
                </div>

                <p class="vb-entry-def">
                    ${escHtml(definition)}
                </p>

                ${ordinary ? `
                    <div class="vb-entry-transformation">
                        <p class="vb-entry-example vb-entry-example-ordinary">
                            ${escHtml(ordinary)}
                        </p>

                        <div class="vb-entry-arrow" aria-hidden="true">
                            ↓
                        </div>

                        <p class="vb-entry-example vb-entry-example-upgraded">
                            ${escHtml(upgraded)}
                        </p>
                    </div>
                ` : `
                    <p class="vb-entry-example vb-entry-example-upgraded">
                        ${escHtml(upgraded)}
                    </p>
                `}
            </div>
        `;
}

function renderSavedLanguageTab() {
    const entries =
        getSavedLanguageEntriesForCurrentSubject();

    if (!entries.length) {
        return `
                <div class="vb-empty-state">
                    <p class="vb-empty-title">
                        No saved language yet.
                    </p>

                    <p class="vb-empty-text">
                        Save language from this subject when it becomes useful.
                    </p>

                    <button
                        class="vb-empty-action"
                        type="button"
                        onclick="setVocabBankTab('all')">
                        Browse all language
                    </button>
                </div>
            `;
    }

    return `
            <div class="vb-intro">
                <div class="vb-intro-top">
                    <p class="vb-intro-count">
                        ${entries.length} saved
                    </p>

                    <button
                        class="vb-edit-btn"
                        type="button"
                        onclick="toggleVocabBankEditMode()">
                        ${vocabBankEditMode ? 'Done' : 'Edit'}
                    </button>
                </div>

                <p class="vb-intro-copy">
                    Your saved language for this subject
                </p>
            </div>

            ${entries.map(entry => renderVocabEntry({
        term: entry.term,
        type: entry.type,
        definition: entry.definition,
        ordinary: entry.ordinary,
        upgraded: entry.upgraded,
        contextId: getUpgradeContextIdFromSource(
            entry.sourceKind,
            entry.sourceElementId
        ),
        showSaveControl: vocabBankEditMode,
        saveControlMode: 'remove'
    })).join('')}

            <div class="vb-print-area">
                <button
                    class="vb-print-btn vb-print-btn-bottom"
                    type="button"
                    onclick="copySavedLanguage(this)">
                    Copy saved language
                </button>

                <button
                    class="vb-print-btn vb-print-btn-bottom vb-print-btn-pdf"
                    type="button"
                    onclick="printSavedLanguage()">
                    Print / Save PDF
                </button>
            </div>
        `;
}

function renderAllLanguageTab() {
    const groups = getAllLanguageGroups();

    const totalCount = groups.reduce(
        (total, group) => total + group.entries.length,
        0
    );

    const intro =
        subjectCopy.keyLanguage?.intro ||
        'Language from this subject.';

    return `
            <div class="vb-intro">
                <p class="vb-intro-count">
                    ${totalCount} entries
                </p>

                <p class="vb-intro-copy">
                    ${escHtml(intro)}
                </p>
            </div>

            ${groups.map(group => `
                <p class="vb-section-label">
                    ${escHtml(group.title)}
                </p>

                ${group.entries.map(upgrade => renderVocabEntry({
        term: upgrade.term,
        type: upgrade.type,
        definition: upgrade.definition,
        ordinary: upgrade.ordinary,
        upgraded: upgrade.upgraded,
        contextId: upgrade.contextId,
        showSaveControl: true
    })).join('')}
            `).join('')}

            <div class="vb-print-area">
                <button
                    class="vb-print-btn vb-print-btn-bottom"
                    type="button"
                    onclick="copyAllLanguage(this)">
                    Copy all language
                </button>

                <button
                    class="vb-print-btn vb-print-btn-bottom vb-print-btn-pdf"
                    type="button"
                    onclick="printAllLanguage()">
                    Print / Save PDF
                </button>
            </div>
        `;
}

function renderVocabBank() {
    const list = document.getElementById('vb-list');

    if (!list) return;

    updateVocabBankTabs();

    list.innerHTML = vocabBankActiveTab === 'all'
        ? renderAllLanguageTab()
        : renderSavedLanguageTab();
}

function getLanguageEntryPlainText(entry = {}) {
    const lines = [
        `Term: ${entry.term || ''}`,
        `Type: ${entry.type || ''}`,
        `Meaning: ${entry.definition || ''}`
    ];

    if (entry.ordinary) {
        lines.push(`Ordinary: ${entry.ordinary}`);
    }

    lines.push(
        `Upgraded: ${entry.upgraded || ''}`,
        ''
    );

    return lines.join('\n');
}

function buildAllLanguagePlainText() {
    const groups = getAllLanguageGroups();

    const totalCount = groups.reduce(
        (total, group) => total + group.entries.length,
        0
    );

    const lines = [
        `Compass · ${MODULE.title}`,
        'All Language',
        `${totalCount} entries`,
        ''
    ];

    groups.forEach(group => {
        lines.push(group.title.toUpperCase(), '');

        group.entries.forEach(entry => {
            lines.push(getLanguageEntryPlainText(entry));
        });

        lines.push('');
    });

    return lines
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim() + '\n';
}

function buildSavedLanguagePlainText() {
    const entries =
        getSavedLanguageEntriesForCurrentSubject();

    const lines = [
        `Compass · ${MODULE.title}`,
        'Saved Language',
        `${entries.length} saved`,
        ''
    ];

    entries.forEach(entry => {
        lines.push(getLanguageEntryPlainText(entry));
    });

    return lines
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim() + '\n';
}

async function copyLanguageText(text, button) {
    let copied = false;

    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            copied = true;
        }
    } catch {
        copied = false;
    }

    if (!copied) {
        const textarea = document.createElement('textarea');

        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        textarea.style.left = '-9999px';

        document.body.appendChild(textarea);
        textarea.select();

        try {
            copied = document.execCommand('copy');
        } catch {
            copied = false;
        }

        textarea.remove();
    }

    if (!button) return;

    const originalText = button.textContent;

    button.textContent = copied
        ? 'Copied'
        : 'Copy failed';

    button.disabled = true;

    window.setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
    }, 1400);
}

function copyAllLanguage(button) {
    return copyLanguageText(
        buildAllLanguagePlainText(),
        button
    );
}

function copySavedLanguage(button) {
    return copyLanguageText(
        buildSavedLanguagePlainText(),
        button
    );
}

function renderPrintLanguageEntry(entry = {}) {
    return `
            <div class="print-entry">
                <p class="print-entry-term">
                    ${escHtml(entry.term)}
                    <span class="print-entry-type">
                        ${escHtml(entry.type)}
                    </span>
                </p>

                <p class="print-entry-def">
                    ${escHtml(entry.definition)}
                </p>

                ${entry.ordinary ? `
                    <p class="print-entry-example print-entry-example-ordinary">
                        ${escHtml(entry.ordinary)}
                    </p>
                ` : ''}

                <p class="print-entry-example print-entry-example-upgraded">
                    ${escHtml(entry.upgraded)}
                </p>
            </div>
        `;
}

function printLanguageDocument({
    kicker = 'Compass · Language',
    titleSuffix = 'Language',
    intro = '',
    meta = '',
    sections = []
} = {}) {
    const printArea = document.getElementById(
        'print-key-language'
    );

    if (!printArea) return;

    printArea.innerHTML = `
            <div class="print-doc">
                <p class="print-doc-kicker">
                    ${escHtml(kicker)}
                </p>

                <h1 class="print-doc-title">
                    ${escHtml(MODULE.title)}
                </h1>

                ${intro ? `
                    <p class="print-doc-intro">
                        ${escHtml(intro)}
                    </p>
                ` : ''}

                ${meta ? `
                    <p class="print-doc-meta">
                        ${escHtml(meta)}
                    </p>
                ` : ''}

                ${sections.map(section => `
                    <section>
                        ${section.title ? `
                            <h2 class="print-group-title">
                                ${escHtml(section.title)}
                            </h2>
                        ` : ''}

                        ${section.entries
            .map(renderPrintLanguageEntry)
            .join('')}
                    </section>
                `).join('')}
            </div>
        `;

    const originalTitle = document.title;

    document.title =
        `${MODULE.title} — ${titleSuffix}`;

    document.body.classList.add(
        'printing-key-language'
    );

    const cleanup = () => {
        window.setTimeout(() => {
            document.body.classList.remove(
                'printing-key-language'
            );

            document.title = originalTitle;
            printArea.innerHTML = '';
        }, 2000);

        window.removeEventListener(
            'afterprint',
            cleanup
        );
    };

    window.addEventListener('afterprint', cleanup);

    window.setTimeout(() => {
        window.print();
    }, 300);
}

function printAllLanguage() {
    const groups = getAllLanguageGroups();

    const totalCount = groups.reduce(
        (total, group) => total + group.entries.length,
        0
    );

    printLanguageDocument({
        kicker: 'Compass · All Language',
        titleSuffix: 'All Language',
        intro: subjectCopy.keyLanguage?.intro || '',
        meta: `${totalCount} entries`,
        sections: groups
    });
}

function printSavedLanguage() {
    const entries =
        getSavedLanguageEntriesForCurrentSubject();

    if (!entries.length) return;

    printLanguageDocument({
        kicker: 'Compass · Saved Language',
        titleSuffix: 'Saved Language',
        intro: 'Language saved from this subject.',
        meta: `${entries.length} saved`,
        sections: [
            {
                title: 'Saved language',
                entries
            }
        ]
    });
}

// ============================================================
// SESSION MANAGEMENT
// ============================================================

function loadSessions() {
    syncSessionsFromBridge();
}

function mountSessionPanel() {
    if (!window.AtlasSessionPanel) {
        throw new Error(
            'AtlasSessionPanel is missing. atlas-session-panel.js must load before compass-engine.js.'
        );
    }

    window.AtlasSessionPanel.mount({
        root: '#atlas-session-panel-root',
        contextTitle: MODULE.title,
        contextDescription: session =>
            `This subject is saving explored items and language for ${session.name}.`,
        primaryActionLabel: 'Wrap up this lesson',
        onPrimaryAction: openCompassWrapUp,
        onRenameSession: session => renameSession(session.name),
        onResetSession: session => resetSession(session.name),
        onDeleteSession: session => deleteSession(session.name)
    });
}

function updateSessionUI() {
    const activeSession = requireAtlasBridge().readActiveSession();
    const label = window.AtlasSessionPanel
        ? AtlasSessionPanel.getSessionDisplayName(activeSession)
        : (activeSession.name || 'Shared');
    const ariaLabel = `Open session panel. Working with ${label}`;

    ['cover-session-label', 'mobile-session-label'].forEach(id => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = label;
            element.closest('button')?.setAttribute('aria-label', ariaLabel);
        }
    });

    document
        .querySelectorAll('[id^="nav-session-"]')
        .forEach(element => {
            element.textContent = label;
            element.closest('button')?.setAttribute('aria-label', ariaLabel);
        });

    const returning = document.getElementById(
        'cover-returning'
    );

    if (returning) {
        if (currentSession === 'Default') {
            returning.classList.remove('is-visible');
            returning.textContent = '';
        } else {
            const hasProgress = progress.explored.size > 0;

            returning.classList.add('is-visible');

            returning.innerHTML =
                `${hasProgress ? 'Welcome back' : 'Welcome'}, ` +
                `<span class="cover-returning-name">${escHtml(currentSession)}</span>!`;
        }
    }

    updateCoverActionUI();
}

function openSessionModal(trigger = document.activeElement) {
    window.AtlasSessionPanel?.open(trigger);
}

function showSessionDialog({
    mode = 'confirm',
    variant = 'danger',
    kicker = 'Session action',
    title = 'Are you sure?',
    message = '',
    confirmLabel = 'OK',
    initialValue = '',
    validate = null
} = {}) {
    const dialog = document.getElementById('session-dialog');
    const kickerElement = document.getElementById(
        'session-dialog-kicker'
    );

    const titleElement = document.getElementById(
        'session-dialog-title'
    );

    const messageElement = document.getElementById(
        'session-dialog-message'
    );

    const input = document.getElementById(
        'session-dialog-input'
    );

    const error = document.getElementById(
        'session-dialog-error'
    );

    const cancelButton = document.getElementById(
        'session-dialog-cancel'
    );

    const confirmButton = document.getElementById(
        'session-dialog-ok'
    );

    const promptMode = mode === 'prompt';

    if (
        !dialog ||
        typeof dialog.showModal !== 'function' ||
        !cancelButton ||
        !confirmButton ||
        (promptMode && !input)
    ) {
        return Promise.resolve(
            promptMode
                ? window.prompt(title, initialValue)
                : window.confirm(message || title)
        );
    }

    return new Promise(resolve => {
        const previousFocusTrap = activeFocusTrapRoot;

        activeFocusTrapRoot = null;

        if (dialog.open) {
            dialog.close();
        }

        if (kickerElement) {
            kickerElement.textContent = kicker;
        }

        if (titleElement) {
            titleElement.textContent = title;
        }

        if (messageElement) {
            messageElement.textContent = message;
        }

        confirmButton.textContent = confirmLabel;
        confirmButton.className = variant === 'primary'
            ? 'btn-primary'
            : 'btn-danger-confirm';

        if (error) {
            error.textContent = '';
            error.classList.remove('is-visible');
        }

        if (input) {
            input.value = promptMode
                ? initialValue
                : '';

            input.classList.toggle(
                'is-visible',
                promptMode
            );
        }

        const showError = text => {
            if (!error) return;

            error.textContent = text;
            error.classList.add('is-visible');
        };

        const cleanup = value => {
            confirmButton.removeEventListener(
                'click',
                onConfirm
            );

            cancelButton.removeEventListener(
                'click',
                onCancel
            );

            input?.removeEventListener(
                'keydown',
                onInputKeydown
            );

            dialog.removeEventListener(
                'cancel',
                onDialogCancel
            );

            dialog.removeEventListener(
                'click',
                onBackdropClick
            );

            if (input) {
                input.classList.remove('is-visible');
                input.value = '';
            }

            if (error) {
                error.textContent = '';
                error.classList.remove('is-visible');
            }

            if (dialog.open) {
                dialog.close();
            }

            activeFocusTrapRoot = previousFocusTrap;

            resolve(value);
        };

        const onConfirm = () => {
            if (!promptMode) {
                cleanup(true);
                return;
            }

            const value = input.value.trim();

            if (typeof validate === 'function') {
                const validationError = validate(value);

                if (validationError) {
                    showError(validationError);
                    input.focus({ preventScroll: true });
                    return;
                }
            }

            cleanup(value);
        };

        const onCancel = () => {
            cleanup(promptMode ? null : false);
        };

        const onInputKeydown = event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                onConfirm();
            }
        };

        const onDialogCancel = event => {
            event.preventDefault();
            cleanup(promptMode ? null : false);
        };

        const onBackdropClick = event => {
            const rectangle = dialog.getBoundingClientRect();

            const inside =
                event.clientX >= rectangle.left &&
                event.clientX <= rectangle.right &&
                event.clientY >= rectangle.top &&
                event.clientY <= rectangle.bottom;

            if (!inside) {
                cleanup(promptMode ? null : false);
            }
        };

        confirmButton.addEventListener(
            'click',
            onConfirm
        );

        cancelButton.addEventListener(
            'click',
            onCancel
        );

        input?.addEventListener(
            'keydown',
            onInputKeydown
        );

        dialog.addEventListener(
            'cancel',
            onDialogCancel
        );

        dialog.addEventListener(
            'click',
            onBackdropClick
        );

        try {
            dialog.showModal();

            requestAnimationFrame(() => {
                const target = promptMode
                    ? input
                    : cancelButton;

                target.focus({ preventScroll: true });

                if (promptMode) {
                    input.select();
                }
            });
        } catch {
            activeFocusTrapRoot = previousFocusTrap;

            resolve(
                promptMode
                    ? window.prompt(title, initialValue)
                    : window.confirm(message || title)
            );
        }
    });
}

function showConfirmDialog(options = {}) {
    return showSessionDialog({
        ...options,
        mode: 'confirm',
        variant: options.variant || 'danger'
    });
}

function showPromptDialog(options = {}) {
    return showSessionDialog({
        ...options,
        mode: 'prompt',
        variant: options.variant || 'primary'
    });
}

function refreshSessionUI() {
    renderCLGrid();
    renderDiscussionSets();

    if (activeSetId) {
        const set = discussionSets.find(
            item => item.id === activeSetId
        );

        if (set) {
            renderMoments(set);
        }
    }

    renderUpgradeVisibilityControls();
    updateSessionUI();

    if (isCompassWrapUpOpen()) {
        renderCompassWrapUp();
    }
}

async function resetSession(name) {
    const sessionForDisplay = getBridgeSessionByName(name);
    const displayLabel = sessionForDisplay && window.AtlasSessionPanel
        ? AtlasSessionPanel.getSessionDisplayName(sessionForDisplay)
        : (name === 'Default' ? 'Shared' : name);
    const confirmed = await showConfirmDialog({
        kicker: 'CLEAR SUBJECT ACTIVITY',
        title: 'Clear this subject?',
        message: `This removes explored items and saved language for ${displayLabel} in this subject.`,
        confirmLabel: 'Clear activity'
    });

    if (!confirmed) return;

    const Bridge = requireAtlasBridge();
    const session = getBridgeSessionByName(name);

    if (!session) return;

    const registry = Bridge.readRegistry();
    const registryId = getContentRegistryId();

    if (registry.sessionStates?.[session.id]) {
        delete registry.sessionStates[session.id][registryId];

        if (
            Object.keys(
                registry.sessionStates[session.id]
            ).length === 0
        ) {
            delete registry.sessionStates[session.id];
        }
    }

    registry.recentActivity =
        Array.isArray(registry.recentActivity)
            ? registry.recentActivity.filter(item =>
                !(
                    item.sessionId === session.id &&
                    item.registryId === registryId
                )
            )
            : [];

    Bridge.writeRegistry(registry);

    const ledger = Bridge.readLedger();

    Object.keys(ledger.entries || {}).forEach(entryId => {
        const entry = ledger.entries[entryId];

        if (
            entry?.sessionId === session.id &&
            entry?.sourceWorld === COMPASS_WORLD_ID &&
            entry?.sourceItem === MODULE.id
        ) {
            delete ledger.entries[entryId];
        }
    });

    Bridge.writeLedger(ledger);
    clearWrapUpEvidence(session.id);

    if (session.id === currentSessionId) {
        loadProgress();
    }

    window.AtlasSessionPanel?.refresh();
    refreshSessionUI();
}

async function deleteSession(name) {
    const confirmed = await showConfirmDialog({
        kicker: 'Delete session',
        title: 'Delete this session?',
        message: `This permanently deletes "${name}" and its saved activity from this device.`,
        confirmLabel: 'Delete session'
    });

    if (!confirmed) return;

    const Bridge = requireAtlasBridge();
    const session = getBridgeSessionByName(name);

    if (!session) return;

    const registry = Bridge.readRegistry();

    delete registry.sessionStates[session.id];

    registry.recentActivity =
        Array.isArray(registry.recentActivity)
            ? registry.recentActivity.filter(
                item => item.sessionId !== session.id
            )
            : [];

    Bridge.writeRegistry(registry);

    const ledger = Bridge.readLedger();

    Object.keys(ledger.entries || {}).forEach(entryId => {
        if (ledger.entries[entryId]?.sessionId === session.id) {
            delete ledger.entries[entryId];
        }
    });

    Bridge.writeLedger(ledger);
    clearWrapUpEvidence(session.id);
    Bridge.deleteSession(session.id);

    syncSessionsFromBridge();
    loadProgress();
    window.AtlasSessionPanel?.refresh();
    refreshSessionUI();
}

async function renameSession(oldName) {
    if (oldName === 'Default') return;

    const Bridge = requireAtlasBridge();
    const session = getBridgeSessionByName(oldName);

    if (!session) return;

    const nextName = await showPromptDialog({
        kicker: 'Rename session',
        title: 'Rename this session',
        message: 'Choose a clear learner or group name.',
        initialValue: oldName,
        confirmLabel: 'Save name',

        validate: value => {
            if (!value) {
                return 'Enter a session name.';
            }

            const taken = Bridge.readSessions().some(item =>
                item.id !== session.id &&
                item.name.trim().toLowerCase() ===
                value.trim().toLowerCase()
            );

            return taken
                ? 'A session with that name already exists.'
                : '';
        }
    });

    if (
        nextName === null ||
        !nextName ||
        nextName === oldName
    ) {
        return;
    }

    Bridge.renameSession(session.id, nextName);

    syncSessionsFromBridge();
    loadProgress();
    window.AtlasSessionPanel?.refresh();
    refreshSessionUI();
}


// ============================================================
// MOBILE DRAWER
// ============================================================

function openMobileDrawer(activeView = 'overview') {
    document
        .querySelectorAll('.mobile-nav-item')
        .forEach(element => {
            element.classList.remove('active');
        });

    document
        .getElementById(`mob-nav-${activeView}`)
        ?.classList.add('active');

    document
        .getElementById('mobile-drawer-overlay')
        ?.classList.add('open');

    document
        .getElementById('mobile-drawer')
        ?.classList.add('open');

    document.body.style.overflow = 'hidden';

    activateFocusTrap(
        document.getElementById('mobile-drawer')
    );
}

function closeMobileDrawer() {
    document
        .getElementById('mobile-drawer-overlay')
        ?.classList.remove('open');

    document
        .getElementById('mobile-drawer')
        ?.classList.remove('open');

    document.body.style.overflow = '';

    releaseFocusTrap();
}

function mobileNavTo(viewId) {
    closeMobileDrawer();
    goToView(viewId);
}

function openVocabBankFromDrawer() {
    closeMobileDrawer();

    window.setTimeout(() => {
        openVocabBank();
    }, 80);
}

function openSessionModalFromDrawer() {
    const returnTrigger = document.querySelector(
        '.view.active .mobile-menu-btn:not(.mobile-search-btn)'
    );

    closeMobileDrawer();

    window.setTimeout(() => {
        openSessionModal(returnTrigger);
    }, 80);
}


// ============================================================
// FOCUS MANAGEMENT
// ============================================================

function getFocusableElements(root) {
    if (!root) return [];

    return Array.from(root.querySelectorAll(`
            a[href],
            button:not([disabled]),
            input:not([disabled]),
            textarea:not([disabled]),
            select:not([disabled]),
            [tabindex]:not([tabindex="-1"])
        `)).filter(element =>
        element.getClientRects().length > 0
    );
}

function activateFocusTrap(root) {
    if (!root) return;

    lastFocusedElement =
        document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;

    activeFocusTrapRoot = root;

    if (!root.hasAttribute('tabindex')) {
        root.setAttribute('tabindex', '-1');
    }

    requestAnimationFrame(() => {
        const focusable = getFocusableElements(root);
        const target = focusable[0] || root;

        target?.focus?.({ preventScroll: true });
    });
}

function releaseFocusTrap() {
    const target = lastFocusedElement;

    activeFocusTrapRoot = null;
    lastFocusedElement = null;

    if (
        target &&
        document.contains(target) &&
        typeof target.focus === 'function'
    ) {
        requestAnimationFrame(() => {
            target.focus({ preventScroll: true });
        });
    }
}

function handleFocusTrap(event) {
    if (
        event.key !== 'Tab' ||
        !activeFocusTrapRoot
    ) {
        return;
    }

    const focusable =
        getFocusableElements(activeFocusTrapRoot);

    if (!focusable.length) {
        event.preventDefault();

        activeFocusTrapRoot.focus({
            preventScroll: true
        });

        return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (
        event.shiftKey &&
        document.activeElement === first
    ) {
        event.preventDefault();
        last.focus({ preventScroll: true });
        return;
    }

    if (
        !event.shiftKey &&
        document.activeElement === last
    ) {
        event.preventDefault();
        first.focus({ preventScroll: true });
    }
}


// ============================================================
// APPEARANCE
// ============================================================

const APPEARANCE_SVG = {
    moon: `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true">
            <path d="M14.5 10.2A7 7 0 0 1 6.8 2.5a7 7 0 1 0 7.7 7.7Z"
                stroke="currentColor"
                stroke-width="1.35"
                stroke-linecap="round"
                stroke-linejoin="round"/>
        </svg>`,

    sun: `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="3"
                stroke="currentColor"
                stroke-width="1.35"/>
            <path d="M8.5 1.5v2M8.5 13.5v2M1.5 8.5h2M13.5 8.5h2M3.7 3.7l1.4 1.4M11.9 11.9l1.4 1.4M11.9 5.1l1.4-1.4M3.7 13.3l1.4-1.4"
                stroke="currentColor"
                stroke-width="1.35"
                stroke-linecap="round"/>
        </svg>`,

    moonSm: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M12 8.5A5.5 5.5 0 0 1 5.5 2a5.5 5.5 0 1 0 6.5 6.5Z"
                stroke="currentColor"
                stroke-width="1.3"
                stroke-linecap="round"
                stroke-linejoin="round"/>
        </svg>`,

    sunSm: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="2.5"
                stroke="currentColor"
                stroke-width="1.3"/>
            <path d="M7 1.5v1.5M7 11v1.5M1.5 7H3M11 7h1.5M3.2 3.2l1 1M9.8 9.8l1 1M9.8 4.2l1-1M3.2 10.8l1-1"
                stroke="currentColor"
                stroke-width="1.3"
                stroke-linecap="round"/>
        </svg>`
};

function getAppearanceMode() {
    const Bridge = requireAtlasBridge();

    if (typeof Bridge.readAppearanceMode === 'function') {
        return Bridge.readAppearanceMode();
    }

    return document.documentElement.dataset.theme === 'night'
        ? 'night'
        : 'light';
}

function applyAppearanceMode(mode) {
    document.documentElement.dataset.theme =
        mode === 'night'
            ? 'night'
            : 'light';
}

function setAppearanceMode(mode) {
    const normalized = mode === 'night'
        ? 'night'
        : 'light';

    const Bridge = requireAtlasBridge();

    if (typeof Bridge.setAppearanceMode === 'function') {
        Bridge.setAppearanceMode(normalized);
    } else {
        applyAppearanceMode(normalized);
    }

    updateAppearanceToggleUI();
}

function toggleAppearanceMode() {
    setAppearanceMode(
        getAppearanceMode() === 'night'
            ? 'light'
            : 'night'
    );
}

function updateAppearanceToggleUI() {
    const night = getAppearanceMode() === 'night';

    const label = night
        ? 'Switch to light mode'
        : 'Switch to night mode';

    const standardIcon = night
        ? APPEARANCE_SVG.sun
        : APPEARANCE_SVG.moon;

    const smallIcon = night
        ? APPEARANCE_SVG.sunSm
        : APPEARANCE_SVG.moonSm;

    const coverButton = document.getElementById(
        'cover-appearance-toggle'
    );

    if (coverButton) {
        coverButton.innerHTML = smallIcon;
        coverButton.title = label;
        coverButton.setAttribute('aria-label', label);
    }

    document
        .querySelectorAll('.nav-appearance-toggle')
        .forEach(button => {
            button.innerHTML = standardIcon;
            button.title = label;
            button.setAttribute('aria-label', label);
        });

    const mobileButton = document.getElementById(
        'mobile-appearance-toggle'
    );

    if (mobileButton) {
        mobileButton.innerHTML = standardIcon;
        mobileButton.title = label;
        mobileButton.setAttribute('aria-label', label);
    }
}

function initAppearanceMode() {
    applyAppearanceMode(getAppearanceMode());
    updateAppearanceToggleUI();
}


// ============================================================
// GLOBAL EVENTS
// ============================================================

document.addEventListener('keydown', event => {
    handleFocusTrap(event);

    const culturalLensModalOpen = document
        .getElementById('cl-modal-overlay')
        ?.classList.contains('open');

    if (event.key === 'Escape') {
        const dialog = document.getElementById(
            'session-dialog'
        );

        if (dialog?.open) return;

        if (culturalLensModalOpen) {
            closeModal();
        }

        if (
            document
                .getElementById('vb-drawer')
                ?.classList.contains('open')
        ) {
            closeVocabBank();
        }

        if (
            document
                .getElementById('mobile-drawer')
                ?.classList.contains('open')
        ) {
            closeMobileDrawer();
        }

        closeUpgradeVisibilityMenus();
        closeAllUpgradePanels();
    }

    if (
        culturalLensModalOpen &&
        event.key === 'ArrowRight'
    ) {
        const nextButton =
            document.getElementById('modal-next-btn');

        if (nextButton && !nextButton.disabled) {
            event.preventDefault();
            navigateModal(1);
        }
    }

    if (
        culturalLensModalOpen &&
        event.key === 'ArrowLeft'
    ) {
        const previousButton =
            document.getElementById('modal-prev-btn');

        if (previousButton && !previousButton.disabled) {
            event.preventDefault();
            navigateModal(-1);
        }
    }
});

document.addEventListener('click', event => {
    if (
        !event.target.closest('.upgrade-chip') &&
        !event.target.closest('.upgrade-panel')
    ) {
        closeAllUpgradePanels();
    }

    if (
        !event.target.closest('.upgrade-visibility-control')
    ) {
        closeUpgradeVisibilityMenus();
    }
});


// ============================================================
// INIT
// ============================================================

function init() {
    if (
        typeof mountCompassSubjectShell === 'function'
    ) {
        mountCompassSubjectShell();
    }

    applyCompassFavicon();
    applyCoverConfig();
    applyDerivedLabels();
    applySubjectCopy();

    renderNav(
        'nav-orientation',
        'view-orientation'
    );

    renderNav(
        'nav-cultural-lens',
        'view-cultural-lens'
    );

    renderNav(
        'nav-discussion',
        'view-discussion'
    );

    renderNav(
        'nav-reflection',
        'view-reflection'
    );

    renderMobileHeader(
        'mob-header-orientation',
        'overview'
    );

    renderMobileHeader(
        'mob-header-cultural-lens',
        'cultural-lens'
    );

    renderMobileHeader(
        'mob-header-discussion',
        'discussion'
    );

    renderMobileHeader(
        'mob-header-reflection',
        'reflection'
    );

    renderMobileDrawerNav();

    loadSessions();
    loadProgress();
    mountSessionPanel();

    updateSessionUI();
    renderUpgradeVisibilityControls();
    renderCLGrid();
    renderDiscussionSets();
    updateReflectionCompleteState();
    initAppearanceMode();

    window.addEventListener(
        'atlas:session-change',
        () => {
            syncSessionsFromBridge();
            loadProgress();
            applyAppearanceMode(getAppearanceMode());
            updateAppearanceToggleUI();
            refreshSessionUI();
            publishAtlasCompassItem('opened');
        }
    );

    window.addEventListener(
        'atlas:preferences-change',
        () => {
            applyUpgradeVisibilityPreference();
        }
    );

    window.addEventListener(
        'atlas:appearance-change',
        event => {
            applyAppearanceMode(
                event.detail?.mode || getAppearanceMode()
            );

            updateAppearanceToggleUI();
        }
    );

    window.addEventListener('storage', event => {
        if (!event?.key) return;

        if (
            event.key === 'atlas::activeSessionId' ||
            event.key === 'atlas::sessions'
        ) {
            syncSessionsFromBridge();
            loadProgress();
            applyAppearanceMode(getAppearanceMode());
            updateAppearanceToggleUI();
            refreshSessionUI();
        }

        if (event.key === 'atlas::preferences') {
            applyUpgradeVisibilityPreference();
        }

        if (
            event.key === requireAtlasBridge().keys.appearance ||
            event.key === requireAtlasBridge().keys.appearanceBySession
        ) {
            applyAppearanceMode(getAppearanceMode());
            updateAppearanceToggleUI();
        }
    });

    publishAtlasCompassItem('opened');
}

document.addEventListener('DOMContentLoaded', init);
