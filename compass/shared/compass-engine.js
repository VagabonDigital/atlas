// ============================================================
// COMPASS SHARED SUBJECT ENGINE
// Shared runtime logic for Compass subject pages.
//
// Subject-specific content lives in each subject page:
// MODULE config, visible subject copy, clCards, and discussionSets.
//
// This file owns shared Compass subject behaviour:
// navigation, rendering, progress UI, session UI, reflection,
// Key Language, modals, drawers, appearance UI, favicon,
// and init.
//
// Cross-surface ecosystem state is delegated to window.AtlasBridge:
// registry access, learning ledger access, shared slugging,
// and Atlas-level storage helpers.
//
// Keep MODULE.id and all card/moment ids stable after release.
// For shared subject-engine changes, update this file once.
// ============================================================

// Compass mark SVG.
// Used by both the header/nav brand mark and the browser favicon.
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
    <circle cx="10" cy="10" r="1.15"
        fill="${color}"/>
</svg>`;
}

const COMPASS_BRAND_ICON_SVG = getCompassMarkSvg();

// Shared Upgrade chip icon.
const UPGRADE_ICON_SVG = `<svg class="upgrade-chip-icon" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.5 1.5 L7.1 4.9 L10.5 5.5 L7.1 6.1 L6.5 9.5 L5.9 6.1 L2.5 5.5 L5.9 4.9 Z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/>
    <path d="M10.5 1.5 L10.9 2.8 L12.2 3.2 L10.9 3.6 L10.5 4.9 L10.1 3.6 L8.8 3.2 L10.1 2.8 Z" stroke="currentColor" stroke-width="0.9" stroke-linejoin="round"/>
</svg>`;

// ============================================================
// LOCKED NAV CONFIG
// Shared desktop and mobile navigation for every subject.
// Update only in the master template, then propagate globally.
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
        </svg>`,
    },
    {
        id: 'cultural-lens',
        label: 'Cultural Lens',
        viewId: 'view-cultural-lens',
        desktopSvg: `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <circle cx="7.5" cy="7.5" r="5.2" stroke="currentColor" stroke-width="1.35"/>
            <path d="M2.3 7.5h10.4M7.5 2.3c1.35 1.45 2.05 3.2 2.05 5.2s-.7 3.75-2.05 5.2M7.5 2.3C6.15 3.75 5.45 5.5 5.45 7.5s.7 3.75 2.05 5.2" stroke="currentColor" stroke-width="1.05" stroke-linecap="round"/>
        </svg>`,
        mobileSvg: `<svg width="17" height="17" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <circle cx="7.5" cy="7.5" r="5.2" stroke="currentColor" stroke-width="1.35"/>
            <path d="M2.3 7.5h10.4M7.5 2.3c1.35 1.45 2.05 3.2 2.05 5.2s-.7 3.75-2.05 5.2M7.5 2.3C6.15 3.75 5.45 5.5 5.45 7.5s.7 3.75 2.05 5.2" stroke="currentColor" stroke-width="1.05" stroke-linecap="round"/>
        </svg>`
    },
    {
        id: 'discussion',
        label: 'Discussion',
        viewId: 'view-discussion',
        desktopSvg: `<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 3a1 1 0 011-1h7a1 1 0 011 1v5a1 1 0 01-1 1H7L4.5 11V9H3a1 1 0 01-1-1V3z" stroke="currentColor"
                stroke-width="1.2" stroke-linejoin="round" />
        </svg>`,
        mobileSvg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 4a1.5 1.5 0 011.5-1.5h7A1.5 1.5 0 0113 4v6a1.5 1.5 0 01-1.5 1.5H8.5L6 14V11.5H4.5A1.5 1.5 0 013 10V4z"
                stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
        </svg>`,
    },
    {
        id: 'reflection',
        label: 'Reflection',
        viewId: 'view-reflection',
        desktopSvg: `<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1v10M3 9l3.5 2.5L10 9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"
                stroke-linejoin="round" />
            <circle cx="6.5" cy="4.5" r="2" stroke="currentColor" stroke-width="1.2" />
        </svg>`,
        mobileSvg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v12M4 12l4 2.5L12 12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"
                stroke-linejoin="round" />
            <circle cx="8" cy="6" r="2.5" stroke="currentColor" stroke-width="1.3" />
        </svg>`,
    },
];

// ============================================================
// COMPASS RUNTIME CONTRACT
// Canonical Compass runtime identifiers used by AtlasBridge.
//
// Compass subject pages publish to the shared Atlas ecosystem as:
// - world: compass
// - item: compass:<MODULE.id>
// - session state: atlas::registry.sessionStates[sessionId][itemId]
// - vocabulary: learning::ledger entries keyed by stable sessionId
//
// Do not create parallel Compass session, registry, or module-index
// storage here. AtlasBridge owns shared ecosystem state.
// ============================================================

const COMPASS_WORLD_ID = 'compass';
const COMPASS_WORLD_TITLE = 'Compass';
const COMPASS_APPEARANCE_MODE_KEY = 'atlas::appearanceMode';

const COMPASS_LABELS = {
    culturalLensUnitSingular: 'culture',
    culturalLensUnitPlural: 'cultures',
    discussionUnitSingular: 'moment',
    discussionUnitPlural: 'moments'
};

// ---- STATE ----
let currentSession = 'Default';
let currentSessionId = 'default';
let sessions = ['Default'];
let progress = {
    viewed: new Set(),
    covered: new Set(),
    lessonCompletedAt: null,
    completionSnapshot: null
};
let currentModalIndex = 0;
let activeSetId = null;

function requireAtlasBridge() {
    if (!window.AtlasBridge) {
        throw new Error('AtlasBridge is missing. Check script path/order: atlas-bridge.js must load before compass-engine.js.');
    }

    return window.AtlasBridge;
}

function storageGet(key) {
    return requireAtlasBridge().storageGet(key);
}

function storageSet(key, value) {
    return requireAtlasBridge().storageSet(key, value);
}

function storageRemove(key) {
    return requireAtlasBridge().storageRemove(key);
}

function getCurrentBridgeSession() {
    const Bridge = requireAtlasBridge();
    const session = Bridge.readActiveSession();

    currentSessionId = session.id;
    currentSession = session.name || 'Default';

    return session;
}

function syncSessionsFromBridge() {
    const Bridge = requireAtlasBridge();
    const bridgeSessions = Bridge.readSessions();

    sessions = bridgeSessions.map(session => session.name);

    const active = Bridge.readActiveSession();

    currentSessionId = active.id;
    currentSession = active.name || 'Default';
}

function getBridgeSessionByName(name) {
    const Bridge = requireAtlasBridge();

    return Bridge.readSessions().find(session => session.name === name) || null;
}

function getContentRegistryId() {
    const Bridge = requireAtlasBridge();

    if (typeof Bridge.getContentRegistryId === 'function') {
        return Bridge.getContentRegistryId(COMPASS_WORLD_ID, MODULE.id);
    }

    return `${COMPASS_WORLD_ID}:${MODULE.id}`;
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

function publishAtlasCompassItem(action = 'updated') {
    try {
        const Bridge = requireAtlasBridge();
        const activeSession = getCurrentBridgeSession();
        const registryId = getContentRegistryId();
        const timestamp = Date.now();

        const culturalLensTotal = clCards.length;
        const momentItems = discussionSets.flatMap(set => set.moments);
        const momentsTotal = momentItems.length;
        const totalCount = culturalLensTotal + momentsTotal;

        const culturalLensViewed = clCards.filter(card => progress.viewed?.has(card.id)).length;
        const culturalLensCovered = clCards.filter(card => progress.covered?.has(card.id)).length;

        const momentsViewed = momentItems.filter(moment => progress.viewed?.has(moment.id)).length;
        const momentsCovered = momentItems.filter(moment => progress.covered?.has(moment.id)).length;

        const viewedCount = culturalLensViewed + momentsViewed;
        const coveredCount = culturalLensCovered + momentsCovered;

        const status = isLessonComplete()
            ? 'complete'
            : viewedCount > 0 || coveredCount > 0
                ? 'in-progress'
                : 'not-started';

        const progressSummary = {
            viewed: viewedCount,
            covered: coveredCount,
            total: totalCount,
            label: `Cultural Lens ${culturalLensCovered}/${culturalLensTotal} · Discussion ${momentsCovered}/${momentsTotal}`,
            culturalLens: {
                viewed: culturalLensViewed,
                covered: culturalLensCovered,
                total: culturalLensTotal
            },
            moments: {
                viewed: momentsViewed,
                covered: momentsCovered,
                total: momentsTotal
            }
        };

        const progressRaw = {
            viewedIds: [...progress.viewed],
            coveredIds: [...progress.covered],
            lessonCompletedAt: progress.lessonCompletedAt || null,
            completionSnapshot: progress.completionSnapshot || null
        };

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
            schemaVersion: MODULE.schemaVersion || 1,
            contentVersion: MODULE.contentVersion || '1.0.0',
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
            contentVersion: MODULE.contentVersion || '1.0.0',
            id: MODULE.id,
            title: MODULE.title,
            navTitle: MODULE.navTitle || MODULE.title,
            status,
            action,
            launchUrl: getAtlasLaunchUrl(),
            progress: progressSummary,
            progressRaw,
            lessonCompletedAt: progress.lessonCompletedAt || null,
            completionSnapshot: progress.completionSnapshot || null,
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

function getUpgradeText(upgradeObj, keys) {
    if (!upgradeObj || !Array.isArray(keys)) return '';

    for (const key of keys) {
        const value = upgradeObj[key];

        if (typeof value === 'string' && value.trim()) {
            return value.trim();
        }
    }

    return '';
}

function findLessonUpgradeById(id) {
    const culturalLensCard = clCards.find(card => card.id === id);

    if (culturalLensCard && culturalLensCard.upgrade) {
        return {
            sourceElementId: culturalLensCard.id,
            sourceKind: 'cultural-lens',
            upgrade: culturalLensCard.upgrade
        };
    }

    for (const set of discussionSets) {
        const moment = set.moments.find(item => item.id === id);

        if (moment && moment.upgrade) {
            return {
                sourceElementId: moment.id,
                sourceKind: 'moment',
                upgrade: moment.upgrade
            };
        }
    }

    return null;
}

function publishLearningLedgerUpgrade(id, status = 'covered') {
    try {
        const Bridge = requireAtlasBridge();
        const activeSession = getCurrentBridgeSession();
        const lessonUpgrade = findLessonUpgradeById(id);

        if (!lessonUpgrade || !lessonUpgrade.upgrade) return;

        const upgrade = lessonUpgrade.upgrade;
        const term = getUpgradeText(upgrade, ['term', 'phrase', 'word']);
        const type = getUpgradeText(upgrade, ['type']);
        const def = getUpgradeText(upgrade, ['def', 'definition', 'meaning']);
        const inAction = getUpgradeText(upgrade, ['in_action', 'inAction', 'example']);
        const reviewPrompt = getUpgradeText(upgrade, ['review_prompt', 'reviewPrompt']);

        if (!term || !def) return;

        const timestamp = Date.now();

        const sourceElementId = lessonUpgrade.sourceElementId;
        const sourceKind = lessonUpgrade.sourceKind || 'unknown';
        const unitSlug = Bridge.slugify(sourceElementId);
        const termSlug = Bridge.slugify(term);

        const entryId = [
            COMPASS_WORLD_ID,
            MODULE.id,
            activeSession.id,
            unitSlug
        ].join(':');

        const ledger = Bridge.readLedger();
        const existingEntry = ledger.entries?.[entryId] || {};

        const entry = {
            schemaVersion: 1,
            id: entryId,

            sourceWorld: COMPASS_WORLD_ID,
            sourceItem: MODULE.id,
            sourceElementId,
            sourceKind,
            contentVersion: MODULE.contentVersion || '1.0.0',

            sessionId: activeSession.id,
            sessionName: activeSession.name,
            status,

            term,
            termSlug,
            upgradeId: termSlug,
            type,
            def,
            inAction,
            reviewPrompt,

            coveredAt: existingEntry.coveredAt || timestamp,
            updatedAt: timestamp,
            lastTouchedAt: timestamp,

            reviewCount: existingEntry.reviewCount || 0,
            lastReviewedAt: existingEntry.lastReviewedAt || null,
            recallBucket: existingEntry.recallBucket || null
        };

        Bridge.upsertLedgerEntry(entry);
    } catch (error) {
        console.warn('[Compass] Learning ledger publish failed:', error);
    }
}

function loadProgress() {
    try {
        const Bridge = requireAtlasBridge();
        const activeSession = getCurrentBridgeSession();
        const registry = Bridge.readRegistry();
        const registryId = getContentRegistryId();
        const state = registry.sessionStates?.[activeSession.id]?.[registryId] || null;
        const raw = state?.progressRaw || {};

        progress = {
            viewed: new Set(Array.isArray(raw.viewedIds) ? raw.viewedIds : []),
            covered: new Set(Array.isArray(raw.coveredIds) ? raw.coveredIds : []),
            lessonCompletedAt: raw.lessonCompletedAt || state?.lessonCompletedAt || null,
            completionSnapshot: raw.completionSnapshot || state?.completionSnapshot || null
        };
    } catch (error) {
        console.warn('[Compass] Progress load failed:', error);

        progress = {
            viewed: new Set(),
            covered: new Set(),
            lessonCompletedAt: null,
            completionSnapshot: null
        };
    }
}

function saveProgress() {
    publishAtlasCompassItem('progress-updated');
}

function loadSessions() {
    syncSessionsFromBridge();
}

function saveSessions() {
    const active = getBridgeSessionByName(currentSession);

    if (active) {
        requireAtlasBridge().setActiveSession(active.id);
    }
}

function markViewed(id) {
    if (!progress.covered.has(id)) {
        progress.viewed.add(id);
        saveProgress();
    }
}

// ============================================================
// COVERAGE & LEDGER RULE
// Covered units are the only source of Learning Ledger entries.
// Viewing cards, opening Upgrade chips, or completing the lesson
// must never publish inferred vocabulary progress.
// ============================================================

// A Cultural Lens card or Discussion moment is the atomic teaching unit.
// Its attached Upgrade belongs to that unit, not to a separate progress track.
// If a unit ever carries multiple Upgrades, revisit this rule.

function markCovered(id) {
    progress.covered.add(id);
    progress.viewed.add(id);
    saveProgress();
    publishLearningLedgerUpgrade(id, 'covered');
    updateLessonCompleteButton();
    updateGlobalProgressRail();
    updateCoverActionUI();
}

function getItemState(id) {
    if (progress.covered.has(id)) return 'covered';
    if (progress.viewed.has(id)) return 'viewed';
    return 'default';
}

const LESSON_COMPLETE_ICON = `<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M3 8.2l3.1 3.1L13 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
        stroke-linejoin="round" />
</svg>`;

const LESSON_UNDO_ICON = `<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M5.2 5.4H3.2V3.4" stroke="currentColor" stroke-width="1.45" stroke-linecap="round"
        stroke-linejoin="round" />
    <path d="M3.4 5.2A5.2 5.2 0 111.9 8.8" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" />
</svg>`;

function getLessonItemIds() {
    return [
        ...clCards.map(card => card.id),
        ...discussionSets.flatMap(set => set.moments.map(moment => moment.id))
    ];
}

function isLessonComplete() {
    return progress.lessonCompletedAt != null;
}

function isFullyCovered() {
    const allIds = getLessonItemIds();
    return allIds.length > 0 && allIds.every(id => progress.covered.has(id));
}

function updateGlobalProgressRail() {
    const allIds = getLessonItemIds();
    const total = allIds.length;
    const covered = total ? allIds.filter(id => progress.covered.has(id)).length : 0;
    const coveragePercent = total ? Math.round((covered / total) * 100) : 0;
    const lessonComplete = isLessonComplete();
    const visualPercent = lessonComplete ? 100 : coveragePercent;

    document.querySelectorAll('.global-progress-rail').forEach(rail => {
        const fill = rail.querySelector('.global-progress-fill');

        if (fill) fill.style.width = `${visualPercent}%`;

        rail.classList.toggle('is-complete', lessonComplete || (total > 0 && covered === total));
        rail.classList.toggle('is-lesson-complete', lessonComplete);
        rail.classList.toggle('is-fully-covered', total > 0 && covered === total);

        rail.setAttribute('aria-valuenow', String(visualPercent));

        if (total === 0) {
            rail.setAttribute(
                'aria-valuetext',
                lessonComplete ? 'Lesson complete.' : 'Lesson progress not started.'
            );
            return;
        }

        rail.setAttribute(
            'aria-valuetext',
            lessonComplete
                ? `Lesson complete. ${covered} of ${total} items covered.`
                : `Lesson progress. ${covered} of ${total} items covered.`
        );
    });
}

function getActiveSessionDisplayName() {
    return currentSession === 'Default' ? '' : currentSession.trim();
}

function updateReflectionCompleteState() {
    const view = document.getElementById('view-reflection');
    const title = document.getElementById('reflection-title');
    const kicker = document.getElementById('reflection-complete-kicker');

    if (!view || !title) return;

    const complete = isLessonComplete();
    const sessionName = getActiveSessionDisplayName();

    view.classList.toggle('reflection-complete', complete);
    title.textContent = complete ? `${MODULE.title} Complete` : subjectCopy.reflection.title;

    if (kicker) {
        kicker.textContent = complete && sessionName
            ? `Congratulations, ${sessionName}!`
            : 'Congratulations!';
    }

    if (!complete) {
        view.classList.remove('reflection-complete-animate');
    }
}

function revealReflectionCompleteState() {
    const view = document.getElementById('view-reflection');

    if (!view) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    view.classList.remove('reflection-complete-animate');
    void view.offsetWidth;
    view.classList.add('reflection-complete-animate');

    requestAnimationFrame(() => {
        view.scrollIntoView({
            behavior: reduceMotion ? 'auto' : 'smooth',
            block: 'start'
        });
    });

    window.setTimeout(() => {
        view.classList.remove('reflection-complete-animate');
    }, 1050);
}

function completeLesson() {
    const allIds = getLessonItemIds();

    if (!allIds.length) return;

    if (progress.lessonCompletedAt) {
        progress.lessonCompletedAt = null;
        progress.completionSnapshot = null;

        saveProgress();
        refreshProgressUI();
        updateLessonCompleteButton();

        return;
    }

    progress.lessonCompletedAt = Date.now();
    progress.completionSnapshot = {
        coveredCount: progress.covered.size,
        totalCount: allIds.length,
        completedAt: progress.lessonCompletedAt
    };

    saveProgress();
    refreshProgressUI();
    updateLessonCompleteButton();
    revealReflectionCompleteState();
}

function updateLessonCompleteButton() {
    const btn = document.getElementById('complete-lesson-btn');

    if (!btn) return;

    const complete = isLessonComplete();

    btn.disabled = false;
    btn.className = `btn-primary${complete ? ' btn-complete-done' : ''}`;

    if (!complete) {
        btn.innerHTML = `${LESSON_COMPLETE_ICON} Mark lesson complete`;
        btn.title = 'Mark this session as complete without changing covered items';
        return;
    }

    btn.innerHTML = `${LESSON_UNDO_ICON} Undo lesson complete`;
    btn.title = 'Mark this session as not complete. Covered items will stay unchanged.';
}

/* ============================================================
    LOCKED TEMPLATE SYSTEM: DOM INJECTION & RENDERING
    Maps module data, content arrays, and shared navigation into
    the static HTML shell.
    ============================================================ */

// ---- DOCUMENT HEAD ----
// Compass subjects do not carry per-subject favicon SVG.
// The shared engine injects the browser favicon from the same Compass mark
// used by the header brand control.

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

// ---- COVER ----
// The cover view uses .view.active like all other views.
// CSS override makes #view-cover display as flex when active.

function applyCoverConfig() {
    document.title = MODULE.title;

    const coverTitle = document.getElementById('cover-title');
    if (coverTitle) coverTitle.innerHTML = MODULE.titleHtml;

    // Set CSS variable used by cover-bg, body::before, and body.module-active::before
    document.documentElement.style.setProperty('--module-bg-image', `url('${MODULE.bgImage}')`);
}

function setText(id, value) {
    const el = document.getElementById(id);

    if (el) el.textContent = value || '';
}

function applySubjectCopy() {
    setText('cover-hook', subjectCopy.cover.hook);

    setText('overview-heading', subjectCopy.overview.heading);
    setText('overview-intro-1', subjectCopy.overview.intro[0]);
    setText('overview-intro-2', subjectCopy.overview.intro[1]);

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
    setText('reflection-question-1', subjectCopy.reflection.questions[0]);
    setText('reflection-question-2', subjectCopy.reflection.questions[1]);
    setText('reflection-question-3', subjectCopy.reflection.questions[2]);
}

// ---- LABELS CALCULATED FROM DATA ----
// Returns a human-readable count label (e.g. "Eight items")
function countLabel(n) {
    const words = [
        'Zero', 'One', 'Two', 'Three', 'Four',
        'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen',
        'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
        'Twenty'
    ];

    return n < words.length ? words[n] : String(n);
}

function applyDerivedLabels() {
    const clCount = clCards.length;
    const clLabel = document.getElementById('path-label-cl');

    if (clLabel) {
        clLabel.textContent = `${countLabel(clCount)} ${clCount === 1 ? COMPASS_LABELS.culturalLensUnitSingular : COMPASS_LABELS.culturalLensUnitPlural}`;
    }

    const totalMoments = discussionSets.reduce((acc, s) => acc + s.moments.length, 0);
    const discLabel = document.getElementById('path-label-disc');

    if (discLabel) {
        discLabel.textContent = `${countLabel(totalMoments)} ${totalMoments === 1 ? COMPASS_LABELS.discussionUnitSingular : COMPASS_LABELS.discussionUnitPlural}`;
    }

    const orientEyebrow = document.getElementById('orient-eyebrow');
    if (orientEyebrow) orientEyebrow.textContent = MODULE.title;
}

// ---- NAV RENDERING ----
// SVG icons shared by desktop and mobile nav actions
const NAV_SVG = {
    session: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="4" r="2.2" stroke="currentColor" stroke-width="1.2" />
        <path d="M1.5 11c0-2.485 2.015-4 4.5-4s4.5 1.515 4.5 4" stroke="currentColor" stroke-width="1.2"
            stroke-linecap="round" />
    </svg>`,

    keylang: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M4.2 3.2h4.1c.9 0 1.7.35 2.2.95.5-.6 1.3-.95 2.2-.95h1.1c.7 0 1.2.5 1.2 1.2v9.2c0 .7-.5 1.2-1.2 1.2h-1.1c-.9 0-1.7.35-2.2.95-.5-.6-1.3-.95-2.2-.95H4.2c-.7 0-1.2-.5-1.2-1.2V4.4c0-.7.5-1.2 1.2-1.2Z"
            stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/>
        <path d="M10.5 4.15v11.1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M5.3 6.2h2.3M5.3 8.4h2.3M12.2 6.2h1.1M12.2 8.4h1.1"
            stroke="currentColor" stroke-width="1.15" stroke-linecap="round"/>
    </svg>`,

    hamburger: `<svg width="17" height="17" viewBox="0 0 17 17" fill="none">
        <path d="M2 4h13M2 8.5h13M2 13h13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>`,

    keylangMobile: `<svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <path d="M4.2 3.2h4.1c.9 0 1.7.35 2.2.95.5-.6 1.3-.95 2.2-.95h1.1c.7 0 1.2.5 1.2 1.2v9.2c0 .7-.5 1.2-1.2 1.2h-1.1c-.9 0-1.7.35-2.2.95-.5-.6-1.3-.95-2.2-.95H4.2c-.7 0-1.2-.5-1.2-1.2V4.4c0-.7.5-1.2 1.2-1.2Z"
            stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/>
        <path d="M10.5 4.15v11.1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M5.3 6.2h2.3M5.3 8.4h2.3M12.2 6.2h1.1M12.2 8.4h1.1"
            stroke="currentColor" stroke-width="1.15" stroke-linecap="round"/>
    </svg>`
};

function getAtlasSearchIcon() {
    return window.AtlasSearch && window.AtlasSearch.icon
        ? window.AtlasSearch.icon
        : `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.3" />
            <path d="M10.5 10.5l3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
        </svg>`;
}

function openAtlasSearch() {
    if (window.AtlasSearch && typeof window.AtlasSearch.open === 'function') {
        window.AtlasSearch.open();
    }
}

function openAtlasSearchFromDrawer() {
    closeMobileDrawer();
    setTimeout(openAtlasSearch, 80);
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

// Render a desktop top-nav into a placeholder div for a given view.
// activeViewId is the view this nav lives in, used to mark the active link.
function renderNav(containerId, activeViewId) {
    const container = document.getElementById(containerId);

    if (!container) return;

    const sessionSpanId = `nav-session-${activeViewId}`;

    const links = NAV_ITEMS.map(item => {
        const isActive = item.viewId === activeViewId;
        const onclick = isActive ? '' : `onclick="goToView('${item.viewId}')"`;

        return `<button class="nav-link${isActive ? ' active' : ''}" title="${escHtml(item.label)}" aria-label="${escHtml(item.label)}" ${onclick}>
            ${item.desktopSvg}
            ${item.label}
        </button>`;
    }).join('\n');

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
            <button class="nav-session-indicator" onclick="openSessionModal()" title="Session settings">
                ${NAV_SVG.session}
                <span id="${sessionSpanId}">Current Session</span>
            </button>
            <button class="nav-keylang-btn nav-search-btn" onclick="openAtlasSearch()" title="Search" aria-label="Search">
                ${getAtlasSearchIcon()}
            </button>
            <button class="nav-keylang-btn" onclick="openVocabBank()" title="Key Language" aria-label="Open Key Language">
                ${NAV_SVG.keylang}
            </button>
            <button class="appearance-toggle nav-appearance-toggle" onclick="toggleAppearanceMode()"
                title="Switch to night mode" aria-label="Switch to night mode">
            </button>
        </div>
        <div class="global-progress-rail" role="progressbar" aria-label="Lesson progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
            <div class="global-progress-fill"></div>
        </div>
    </nav>`;
}

// Render a sticky mobile header for inner views (cultural-lens / discussion / reflection).
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
            <button class="mobile-menu-btn mobile-search-btn" onclick="openAtlasSearch()" title="Search" aria-label="Search">
                ${getAtlasSearchIcon()}
            </button>
            <button class="mobile-menu-btn" onclick="openMobileDrawer('${viewKey}')" title="Menu" aria-label="Open menu">
                ${NAV_SVG.hamburger}
            </button>
        </div>
        <div class="global-progress-rail" role="progressbar" aria-label="Lesson progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
            <div class="global-progress-fill"></div>
        </div>
    </header>`;
}

// Render the shared mobile drawer nav from NAV_ITEMS.
function renderMobileDrawerNav() {
    const container = document.getElementById('mobile-drawer-nav');

    if (!container) return;

    const drawerTitle = document.getElementById('mobile-drawer-subject-title');

    if (drawerTitle) drawerTitle.textContent = MODULE.title;

    const items = NAV_ITEMS.map(item => {
        return `<button class="mobile-nav-item" id="mob-nav-${item.id}" onclick="mobileNavTo('${item.viewId}')">
            ${item.mobileSvg}
            ${item.label}
        </button>`;
    }).join('\n');

    container.innerHTML = `${items}
        <div class="mobile-drawer-divider"></div>
        <button class="mobile-nav-item" onclick="openAtlasSearchFromDrawer()">
            ${getAtlasSearchIcon()}
            Search
        </button>
        <button class="mobile-nav-item" onclick="openVocabBankFromDrawer()">
            ${NAV_SVG.keylangMobile}
            Key Language
        </button>`;
}

// ---- NAVIGATION ----
function beginModule() {
    document.body.classList.add('module-active');
    goToView('view-orientation');
}

function goToView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

    const target = document.getElementById(viewId);

    if (target) target.classList.add('active');

    window.scrollTo(0, 0);

    if (viewId === 'view-cover') {
        document.body.classList.remove('module-active');
    } else {
        document.body.classList.add('module-active');
    }

    if (viewId === 'view-cultural-lens') renderCLGrid();
    if (viewId === 'view-discussion') renderDiscussionSets();

    if (viewId === 'view-reflection') {
        updateReflectionCompleteState();
        updateReflectionProgressSummary();
    }
}

// ---- SESSION MANAGEMENT ----
function updateCoverActionUI() {
    const btn = document.getElementById('cover-begin-btn');

    if (!btn) return;

    const hasProgress =
        progress?.viewed?.size > 0 ||
        progress?.covered?.size > 0;

    const complete = isLessonComplete();

    const label = complete
        ? 'Review lesson'
        : hasProgress
            ? 'Continue lesson'
            : 'Begin lesson';

    btn.innerHTML = `
        ${label}
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M3 7.5h9M8.5 4l3.5 3.5-3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" />
        </svg>
    `;
}

function updateSessionUI() {
    const label = currentSession === 'Default' ? 'Current Session' : currentSession;
    const coverEl = document.getElementById('cover-session-label');

    if (coverEl) coverEl.textContent = label;

    const returningEl = document.getElementById('cover-returning');

    if (returningEl) {
        if (currentSession === 'Default') {
            returningEl.classList.remove('is-visible');
            returningEl.textContent = '';
        } else {
            const hasProgress =
                progress?.viewed?.size > 0 ||
                progress?.covered?.size > 0;

            returningEl.classList.add('is-visible');
            returningEl.innerHTML = `${hasProgress ? 'Welcome back' : 'Welcome'}, <span class="cover-returning-name">${escHtml(currentSession)}</span>!`;
        }
    }

    document.querySelectorAll('[id^="nav-session-"]').forEach(el => {
        el.textContent = label;
    });

    const mobLabel = document.getElementById('mobile-session-label');

    if (mobLabel) mobLabel.textContent = label;

    updateCoverActionUI();
    updateSessionHelperText();
}

function updateSessionHelperText() {
    const helper = document.getElementById('session-helper-text');

    if (!helper) return;

    if (currentSession === 'Default') {
        helper.textContent = 'Hi there — add your name to save this lesson\'s progress under your own session. You can also create sessions for a group, class, or fresh start.';
        return;
    }

    helper.textContent = `Hi, ${currentSession} — this lesson is saving progress to your session. Create another session for a group, class, or fresh start.`;
}

function openSessionModal() {
    renderSessionList();
    document.getElementById('session-modal-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    activateFocusTrap(document.querySelector('.session-modal-panel'));
}

function closeSessionModal() {
    document.getElementById('session-modal-overlay').classList.remove('open');
    document.body.style.overflow = '';
    releaseFocusTrap();
}

function handleSessionOverlayClick(e) {
    if (e.target === document.getElementById('session-modal-overlay')) closeSessionModal();
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
    const kickerEl = document.getElementById('session-dialog-kicker');
    const titleEl = document.getElementById('session-dialog-title');
    const messageEl = document.getElementById('session-dialog-message');
    const inputEl = document.getElementById('session-dialog-input');
    const errorEl = document.getElementById('session-dialog-error');
    const cancelBtn = document.getElementById('session-dialog-cancel');
    const okBtn = document.getElementById('session-dialog-ok');
    const isPrompt = mode === 'prompt';

    if (!dialog || typeof dialog.showModal !== 'function' || !cancelBtn || !okBtn || (isPrompt && !inputEl)) {
        return Promise.resolve(
            isPrompt
                ? window.prompt(title, initialValue)
                : window.confirm(message || title)
        );
    }

    return new Promise(resolve => {
        const previousTrapRoot = activeFocusTrapRoot;
        activeFocusTrapRoot = null;

        if (dialog.open) dialog.close();
        if (kickerEl) kickerEl.textContent = kicker;
        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;

        okBtn.textContent = confirmLabel;
        okBtn.className = variant === 'primary' ? 'btn-primary' : 'btn-danger-confirm';

        if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.remove('is-visible');
        }

        if (inputEl) {
            inputEl.value = isPrompt ? initialValue : '';
            inputEl.classList.toggle('is-visible', isPrompt);
        }

        const showError = text => {
            if (!errorEl) return;

            errorEl.textContent = text;
            errorEl.classList.add('is-visible');
        };

        const cleanup = value => {
            okBtn.removeEventListener('click', onConfirm);
            cancelBtn.removeEventListener('click', onCancel);

            if (inputEl) inputEl.removeEventListener('keydown', onInputKeydown);

            dialog.removeEventListener('cancel', onDialogCancel);
            dialog.removeEventListener('click', onBackdropClick);

            if (inputEl) {
                inputEl.classList.remove('is-visible');
                inputEl.value = '';
            }

            if (errorEl) {
                errorEl.textContent = '';
                errorEl.classList.remove('is-visible');
            }

            if (dialog.open) dialog.close();

            activeFocusTrapRoot = previousTrapRoot;

            resolve(value);
        };

        const onConfirm = () => {
            if (!isPrompt) {
                cleanup(true);
                return;
            }

            const value = inputEl.value.trim();

            if (typeof validate === 'function') {
                const error = validate(value);

                if (error) {
                    showError(error);
                    inputEl.focus({ preventScroll: true });
                    return;
                }
            }

            cleanup(value);
        };

        const onCancel = () => cleanup(isPrompt ? null : false);

        const onInputKeydown = event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                onConfirm();
            }
        };

        const onDialogCancel = event => {
            event.preventDefault();
            cleanup(isPrompt ? null : false);
        };

        const onBackdropClick = event => {
            const rect = dialog.getBoundingClientRect();

            const clickedInside =
                event.clientX >= rect.left &&
                event.clientX <= rect.right &&
                event.clientY >= rect.top &&
                event.clientY <= rect.bottom;

            if (!clickedInside) cleanup(isPrompt ? null : false);
        };

        okBtn.addEventListener('click', onConfirm);
        cancelBtn.addEventListener('click', onCancel);

        if (inputEl) inputEl.addEventListener('keydown', onInputKeydown);

        dialog.addEventListener('cancel', onDialogCancel);
        dialog.addEventListener('click', onBackdropClick);

        try {
            dialog.showModal();

            requestAnimationFrame(() => {
                const focusTarget = isPrompt ? inputEl : cancelBtn;
                focusTarget.focus({ preventScroll: true });

                if (isPrompt) {
                    inputEl.select();
                }
            });
        } catch {
            activeFocusTrapRoot = previousTrapRoot;

            resolve(
                isPrompt
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

function renderSessionList() {
    const list = document.getElementById('session-list');

    list.innerHTML = '';

    sessions.forEach(name => {
        const item = document.createElement('div');

        item.className = 'session-item' + (name === currentSession ? ' active-session' : '');

        item.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="5" r="2.5" stroke="currentColor" stroke-width="1.3"/>
                <path d="M2 12c0-2.485 2.239-4.5 5-4.5s5 2.015 5 4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
            <span class="session-item-name">${escHtml(name)}</span>
            ${name === currentSession ? '<span class="session-item-active-badge">Active</span>' : ''}
            <div class="session-item-actions">
                ${name !== currentSession ? `<button class="session-item-btn" title="Switch" onclick="switchSession(${jsArg(name)})">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>` : ''}
                ${name !== 'Default' ? `<button class="session-item-btn" title="Rename session" onclick="renameSession(${jsArg(name)})">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8.2 2.2l1.6 1.6M2.5 9.5l.5-2.2 5.2-5.2a1.1 1.1 0 011.6 0l.1.1a1.1 1.1 0 010 1.6L4.7 9l-2.2.5Z" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>` : ''}
                <button class="session-item-btn danger" title="Reset progress" onclick="resetSession(${jsArg(name)})">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6a4 4 0 118 0" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M10 2v4H6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                ${name !== 'Default' ? `<button class="session-item-btn danger" title="Delete session" onclick="deleteSession(${jsArg(name)})">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                </button>` : ''}
            </div>`;

        list.appendChild(item);
    });
}

function refreshProgressUI() {
    renderCLGrid();
    renderDiscussionSets();

    if (activeSetId) {
        const set = discussionSets.find(s => s.id === activeSetId);
        if (set) renderMoments(set);
    }

    updateLessonCompleteButton();
    updateGlobalProgressRail();
    updateReflectionProgressSummary();
    updateReflectionCompleteState();
    updateCoverActionUI();
}

function switchSession(name) {
    const session = getBridgeSessionByName(name);

    if (!session) return;

    requireAtlasBridge().setActiveSession(session.id);
    renderSessionList();
}

async function resetSession(name) {
    const confirmed = await showConfirmDialog({
        kicker: 'Reset progress',
        title: 'Reset this subject progress?',
        message: `This will clear saved progress for "${name}" in this subject.`,
        confirmLabel: 'Reset progress'
    });

    if (!confirmed) return;

    const Bridge = requireAtlasBridge();
    const session = getBridgeSessionByName(name);

    if (!session) return;

    const registry = Bridge.readRegistry();
    const registryId = getContentRegistryId();

    if (registry.sessionStates?.[session.id]) {
        delete registry.sessionStates[session.id][registryId];

        if (Object.keys(registry.sessionStates[session.id]).length === 0) {
            delete registry.sessionStates[session.id];
        }
    }

    registry.recentActivity = Array.isArray(registry.recentActivity)
        ? registry.recentActivity.filter(item =>
            !(item.sessionId === session.id && item.registryId === registryId)
        )
        : [];

    Bridge.writeRegistry(registry);

    const ledger = Bridge.readLedger();

    Object.keys(ledger.entries).forEach(entryId => {
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

    if (session.id === currentSessionId) {
        loadProgress();
    }

    renderSessionList();
    refreshProgressUI();
}

async function deleteSession(name) {
    const confirmed = await showConfirmDialog({
        kicker: 'Delete session',
        title: 'Delete this session?',
        message: `This will permanently delete "${name}" and remove its saved progress from this device.`,
        confirmLabel: 'Delete session'
    });

    if (!confirmed) return;

    const Bridge = requireAtlasBridge();
    const session = getBridgeSessionByName(name);

    if (!session) return;

    const registry = Bridge.readRegistry();

    delete registry.sessionStates[session.id];

    registry.recentActivity = Array.isArray(registry.recentActivity)
        ? registry.recentActivity.filter(item => item.sessionId !== session.id)
        : [];

    Bridge.writeRegistry(registry);

    const ledger = Bridge.readLedger();

    Object.keys(ledger.entries).forEach(entryId => {
        const entry = ledger.entries[entryId];

        if (entry?.sessionId === session.id) {
            delete ledger.entries[entryId];
        }
    });

    Bridge.writeLedger(ledger);
    Bridge.deleteSession(session.id);

    syncSessionsFromBridge();
    loadProgress();
    updateSessionUI();
    renderSessionList();
    refreshProgressUI();
}

async function renameSession(oldName) {
    if (oldName === 'Default') return;

    const Bridge = requireAtlasBridge();
    const session = getBridgeSessionByName(oldName);

    if (!session) return;

    const nextName = await showPromptDialog({
        kicker: 'Rename session',
        title: 'Rename this session',
        message: 'Choose a clear name for this saved lesson session.',
        initialValue: oldName,
        confirmLabel: 'Save name',
        validate: value => {
            if (!value) return 'Enter a session name.';

            const taken = Bridge.readSessions().some(item =>
                item.id !== session.id &&
                item.name.trim().toLowerCase() === value.trim().toLowerCase()
            );

            if (taken) {
                return 'A session with that name already exists.';
            }

            return '';
        }
    });

    if (nextName === null) return;
    if (!nextName || nextName === oldName) return;

    Bridge.renameSession(session.id, nextName);

    syncSessionsFromBridge();
    loadProgress();
    updateSessionUI();
    renderSessionList();
    refreshProgressUI();
}

function addSession() {
    const input = document.getElementById('session-name-input');
    const name = input.value.trim();

    if (!name) return;

    const created = requireAtlasBridge().createSession(name);

    if (!created) {
        alert('A session with that name already exists.');
        return;
    }

    input.value = '';
    renderSessionList();
}

// ---- MOBILE DRAWER ----
let _mobileDrawerActiveView = 'overview';

function openMobileDrawer(activeView) {
    _mobileDrawerActiveView = activeView || 'overview';

    document.querySelectorAll('.mobile-nav-item').forEach(el => el.classList.remove('active'));

    const activeEl = document.getElementById(`mob-nav-${activeView}`);

    if (activeEl) activeEl.classList.add('active');

    document.getElementById('mobile-drawer-overlay').classList.add('open');
    document.getElementById('mobile-drawer').classList.add('open');

    document.body.style.overflow = 'hidden';

    activateFocusTrap(document.getElementById('mobile-drawer'));
}

function closeMobileDrawer() {
    document.getElementById('mobile-drawer-overlay').classList.remove('open');
    document.getElementById('mobile-drawer').classList.remove('open');

    document.body.style.overflow = '';

    releaseFocusTrap();
}

function mobileNavTo(viewId) {
    closeMobileDrawer();
    goToView(viewId);
}

function openVocabBankFromDrawer() {
    closeMobileDrawer();
    setTimeout(() => openVocabBank(), 80);
}

function openSessionModalFromDrawer() {
    closeMobileDrawer();
    setTimeout(() => openSessionModal(), 80);
}

// ---- UPGRADE CHIP ----
function buildUpgradeChip(upgradeObj, contextId) {
    const reviewPrompt = getUpgradeText(upgradeObj, ['review_prompt', 'reviewPrompt']);

    return `<button class="upgrade-chip" id="uc-${contextId}" onclick="toggleUpgrade('${contextId}', event)" aria-expanded="false">
        ${UPGRADE_ICON_SVG}
        Upgrade: ${escHtml(upgradeObj.term)}
    </button>
    <div class="upgrade-panel" id="up-${contextId}">
        <p class="upgrade-panel-term">${escHtml(upgradeObj.term)}</p>
        <p class="upgrade-panel-type">${escHtml(upgradeObj.type)}</p>
        <p class="upgrade-panel-def">${escHtml(upgradeObj.def)}</p>
        <p class="upgrade-panel-in-action">${escHtml(upgradeObj.in_action)}</p>
        ${reviewPrompt ? `
            <div class="upgrade-panel-try">
                <p class="upgrade-panel-try-label">Try this</p>
                <p class="upgrade-panel-review-prompt">${escHtml(reviewPrompt)}</p>
            </div>
        ` : ''}
    </div>`;
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

        const wrap = panel.closest('.moment-upgrade-wrap');

        if (wrap) wrap.classList.remove('upgrade-open');
    });
}

function toggleUpgrade(contextId, event) {
    event.stopPropagation();

    const chip = document.getElementById(`uc-${contextId}`);
    const panel = document.getElementById(`up-${contextId}`);

    if (!chip || !panel) return;

    const isOpen = panel.classList.contains('open');

    closeAllUpgradePanels();

    if (!isOpen) {
        panel.classList.add('open');

        const wrap = panel.closest('.moment-upgrade-wrap');

        if (wrap) wrap.classList.add('upgrade-open');

        chip.classList.add('open');
        chip.setAttribute('aria-expanded', 'true');

        gentlyRevealUpgradePanel(panel);
    }
}

// ---- CULTURAL LENS GRID ----
function renderCLGrid() {
    const grid = document.getElementById('cl-grid');

    if (!grid) return;

    grid.innerHTML = '';

    clCards.forEach((card, i) => {
        const state = getItemState(card.id);
        const el = document.createElement('div');

        el.className = `cl-card state-${state}`;
        el.dataset.id = card.id;
        el.dataset.index = i;
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');

        el.onclick = () => openCLModal(i);

        el.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openCLModal(i);
            }
        };

        el.innerHTML = `
            <div class="cl-card-state-badge">
                ${state === 'covered'
                ? `<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5l2.5 2.5L9 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
                : `<svg width="9" height="9" viewBox="0 0 9 9" fill="none"><circle cx="4.5" cy="4.5" r="3.5" stroke="currentColor" stroke-width="1.2"/></svg>`
            }
            </div>
            <p class="cl-card-location">${escHtml(card.location)}</p>
            <h3 class="cl-card-title">${escHtml(card.title)}</h3>
            <p class="cl-card-teaser">${escHtml(card.teaser)}</p>`;

        grid.appendChild(el);
    });

    updateCLProgress();
}

function updateCLProgress() {
    const viewed = clCards.filter(c => progress.viewed.has(c.id)).length;
    const covered = clCards.filter(c => progress.covered.has(c.id)).length;
    const vEl = document.getElementById('cl-viewed-count');
    const cEl = document.getElementById('cl-covered-count');
    const textEl = document.getElementById('cl-progress-text');

    if (viewed > 0 && vEl) {
        vEl.style.display = 'inline-flex';
        vEl.querySelector('span').textContent = `${viewed} viewed`;
    } else if (vEl) {
        vEl.style.display = 'none';
    }

    if (covered > 0 && cEl) {
        cEl.style.display = 'inline-flex';
        cEl.querySelector('span').textContent = `${covered} covered`;
    } else if (cEl) {
        cEl.style.display = 'none';
    }

    if (viewed === 0 && textEl) {
        textEl.textContent = 'Explore the cards below — choose any that interest you.';
    } else if (textEl) {
        textEl.textContent = '';
    }
}

// ---- CULTURAL LENS MODAL ----
function openCLModal(index) {
    currentModalIndex = index;

    const card = clCards[index];

    markViewed(card.id);

    document.getElementById('modal-location').textContent = card.location;
    document.getElementById('modal-title').textContent = card.title;
    document.getElementById('modal-insight').textContent = card.insight;
    document.getElementById('modal-question').textContent = card.question;
    document.getElementById('explore-deeper-text').textContent = card.deeper.text;

    const upgradeRow = document.getElementById('modal-upgrade-row');
    upgradeRow.innerHTML = buildUpgradeChip(card.upgrade, `cl-${card.id}`);

    const qContainer = document.getElementById('explore-questions');
    qContainer.innerHTML = '';

    card.deeper.questions.forEach((q, i) => {
        const item = document.createElement('div');

        item.className = 'explore-question-item';
        item.innerHTML = `<div class="explore-q-marker">${i + 1}</div><p>${escHtml(q)}</p>`;

        qContainer.appendChild(item);
    });

    const exploreToggle = document.getElementById('explore-toggle');

    exploreToggle.classList.remove('open');
    exploreToggle.setAttribute('aria-expanded', 'false');

    document.getElementById('explore-deeper-content').classList.remove('open');

    resetModalScroll();

    document.getElementById('modal-prev-btn').style.opacity = index === 0 ? '0.35' : '1';
    document.getElementById('modal-prev-btn').disabled = index === 0;
    document.getElementById('modal-next-btn').style.opacity = index === clCards.length - 1 ? '0.35' : '1';
    document.getElementById('modal-next-btn').disabled = index === clCards.length - 1;
    document.getElementById('cl-modal-overlay').classList.add('open');

    document.body.style.overflow = 'hidden';

    activateFocusTrap(document.getElementById('cl-modal-panel'));

    renderCLGrid();
    updateCLProgress();
}

function resetModalScroll() {
    const overlay = document.getElementById('cl-modal-overlay');
    const panel = document.getElementById('cl-modal-panel');
    const modalBody = panel ? panel.querySelector('.modal-body') : null;

    [overlay, panel, modalBody].forEach(el => {
        if (el) el.scrollTop = 0;
    });

    requestAnimationFrame(() => {
        [overlay, panel, modalBody].forEach(el => {
            if (el) el.scrollTop = 0;
        });
    });
}

function closeModal() {
    document.getElementById('cl-modal-overlay').classList.remove('open');
    document.body.style.overflow = '';

    renderCLGrid();
    releaseFocusTrap();
}

function handleModalOverlayClick(e) {
    if (e.target === document.getElementById('cl-modal-overlay')) closeModal();
}

function navigateModal(dir) {
    const next = currentModalIndex + dir;

    if (next >= 0 && next < clCards.length) openCLModal(next);
}

function markCLCovered() {
    markCovered(clCards[currentModalIndex].id);
    closeModal();
    renderCLGrid();
    updateCLProgress();
}

function toggleExploreDeeper() {
    const toggle = document.getElementById('explore-toggle');
    const content = document.getElementById('explore-deeper-content');

    if (!toggle || !content) return;

    const wasOpen = toggle.classList.contains('open');

    toggle.classList.toggle('open');
    content.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(!wasOpen));

    if (!wasOpen) {
        requestAnimationFrame(() => {
            content.scrollIntoView({
                behavior: getScrollBehavior(),
                block: 'nearest',
                inline: 'nearest'
            });
        });
    }
}

// ---- DISCUSSION SETS ----
function renderDiscussionSets() {
    const container = document.getElementById('discussion-sets');

    if (!container) return;

    container.innerHTML = '';

    discussionSets.forEach(set => {
        const totalMoments = set.moments.length;
        const viewedCount = set.moments.filter(s => progress.viewed.has(s.id)).length;
        const coveredCount = set.moments.filter(s => progress.covered.has(s.id)).length;
        const el = document.createElement('div');

        el.className = 'set-card' + (activeSetId === set.id ? ' active-set' : '');
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');

        el.onclick = () => openSet(set.id);

        el.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openSet(set.id);
            }
        };

        const iconSvg = getSetIconSvg(set.icon, activeSetId === set.id);

        el.innerHTML = `
            <div class="set-icon">${iconSvg}</div>
            <h3 class="set-title">${escHtml(set.title)}</h3>
            <p class="set-desc">${escHtml(set.desc)}</p>
            <div class="set-progress-mini">
                ${totalMoments} ${totalMoments === 1 ? COMPASS_LABELS.discussionUnitSingular : COMPASS_LABELS.discussionUnitPlural}${viewedCount > 0 ? ` · ${viewedCount} opened` : ''}${coveredCount > 0 ? ` · ${coveredCount} covered` : ''}
            </div>`;

        container.appendChild(el);
    });

    updateDiscussionProgress();
}

function updateDiscussionProgress() {
    const moments = discussionSets.flatMap(set => set.moments);
    const viewed = moments.filter(s => progress.viewed.has(s.id)).length;
    const covered = moments.filter(s => progress.covered.has(s.id)).length;
    const vEl = document.getElementById('disc-viewed-count');
    const cEl = document.getElementById('disc-covered-count');
    const textEl = document.getElementById('disc-progress-text');

    if (viewed > 0 && vEl) {
        vEl.style.display = 'inline-flex';
        vEl.querySelector('span').textContent = `${viewed} opened`;
    } else if (vEl) {
        vEl.style.display = 'none';
    }

    if (covered > 0 && cEl) {
        cEl.style.display = 'inline-flex';
        cEl.querySelector('span').textContent = `${covered} covered`;
    } else if (cEl) {
        cEl.style.display = 'none';
    }

    if (viewed === 0 && textEl) {
        textEl.textContent = `Choose a set below — open any ${COMPASS_LABELS.discussionUnitSingular} that interests you.`;
    } else if (textEl) {
        textEl.textContent = '';
    }
}

function getSetIconSvg(type, active) {
    const col = active ? '#fff' : 'var(--accent)';

    if (type === 'react') {
        return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3.4 5A2.4 2.4 0 015.8 2.6h8.4A2.4 2.4 0 0116.6 5v5.8a2.4 2.4 0 01-2.4 2.4h-3.4L7.2 16v-2.8H5.8a2.4 2.4 0 01-2.4-2.4V5Z"
                stroke="${col}" stroke-width="1.45" stroke-linejoin="round"/>
            <path d="M6.5 8.2h2.1l1.1-1.8l1.3 3.7l1.1-1.9h1.5"
                stroke="${col}" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
    }

    if (type === 'explain') {
        return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 3a5 5 0 014 8 3 3 0 01-4 2.83A3 3 0 016 11a5 5 0 014-8z" stroke="${col}" stroke-width="1.4"/>
            <path d="M8 17h4M9 14.5v2.5M11 14.5v2.5" stroke="${col}" stroke-width="1.3" stroke-linecap="round"/>
        </svg>`;
    }

    if (type === 'reflect') {
        return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 3.2L16 6.6L10 10L4 6.6L10 3.2Z"
                stroke="${col}" stroke-width="1.35" stroke-linejoin="round"/>
            <path d="M4.4 10L10 13.2L15.6 10"
                stroke="${col}" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M4.4 13.2L10 16.4L15.6 13.2"
                stroke="${col}" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
    }

    return '';
}

function openSet(setId) {
    activeSetId = setId;

    const set = discussionSets.find(s => s.id === setId);

    if (!set) return;

    const panel = document.getElementById('moments-panel');

    document.getElementById('moments-panel-title').textContent = set.title;

    renderMoments(set);

    panel.classList.add('open');

    renderDiscussionSets();

    setTimeout(() => {
        panel.scrollIntoView({
            behavior: getScrollBehavior(),
            block: 'start'
        });
    }, 100);
}

function closeSet() {
    activeSetId = null;

    document.getElementById('moments-panel').classList.remove('open');

    renderDiscussionSets();

    setTimeout(() => {
        const setsContainer = document.getElementById('discussion-sets');

        if (setsContainer) {
            setsContainer.scrollIntoView({
                behavior: getScrollBehavior(),
                block: 'start'
            });
        }
    }, 50);
}

function renderMoments(set) {
    const list = document.getElementById('moments-list');

    list.innerHTML = '';

    set.moments.forEach((moment, idx) => {
        const state = getItemState(moment.id);
        const card = document.createElement('div');

        card.className = `moment-card state-${state}`;
        card.id = `moment-card-${moment.id}`;

        const coveredBtnHtml = `<button class="btn-mark-covered ${state === 'covered' ? 'is-covered' : ''}"
            id="moment-btn-${moment.id}"
            onclick="markMomentCovered('${moment.id}')">
            ${state === 'covered'
                ? `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Covered`
                : `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Mark covered`
            }
        </button>`;

        card.innerHTML = `
            <div class="moment-card-header" role="button" tabindex="0" onclick="toggleMoment('${moment.id}')" onkeydown="if(event.key==='Enter'||event.key===' ') { event.preventDefault(); toggleMoment('${moment.id}'); }">
                <div class="moment-state-dot"></div>
                <span class="moment-num">${String(idx + 1).padStart(2, '0')}</span>
                <span class="moment-preview">${escHtml(moment.preview)}</span>
                <svg class="moment-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <div class="moment-body">
                <p class="moment-text">${escHtml(moment.text)}</p>
                <div class="moment-upgrade-wrap">
                    <div class="moment-action-row">
                        <div class="moment-upgrade-slot">
                            ${buildUpgradeChip(moment.upgrade, 'moment-' + moment.id)}
                        </div>
                        ${coveredBtnHtml}
                    </div>
                </div>
            </div>`;

        list.appendChild(card);
    });

    // Make It Real card at end of each set
    const mir = set.makeItReal;

    if (mir) {
        const mirCard = document.createElement('div');

        mirCard.className = 'make-it-real-card';
        mirCard.innerHTML = `
            <div class="make-it-real-header">
                <span class="make-it-real-badge">
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <path d="M5.5 1L6.3 4.1 9.5 4.5 6.3 4.9 5.5 8 4.7 4.9 1.5 4.5 4.7 4.1Z" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/>
                    </svg>
                    Make It Real
                </span>
                <span class="make-it-real-title">${escHtml(mir.title)}</span>
            </div>
            <div class="make-it-real-body">
                <p class="make-it-real-prompt">${escHtml(mir.prompt)}</p>
            </div>`;

        list.appendChild(mirCard);
    }

    const closeSetBottom = document.createElement('button');

    closeSetBottom.className = 'btn-close-set btn-close-set-bottom';
    closeSetBottom.type = 'button';
    closeSetBottom.onclick = closeSet;
    closeSetBottom.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
        </svg>
        Close set
    `;

    list.appendChild(closeSetBottom);
}

function toggleMoment(momentId) {
    const card = document.getElementById(`moment-card-${momentId}`);

    if (!card) return;

    const wasExpanded = card.classList.contains('expanded');

    document.querySelectorAll('.moment-card.expanded').forEach(c => c.classList.remove('expanded'));

    if (!wasExpanded) {
        card.classList.add('expanded');
        markViewed(momentId);
        updateMomentCard(momentId);
        renderDiscussionSets();
    }
}

function updateMomentCard(momentId) {
    const card = document.getElementById(`moment-card-${momentId}`);

    if (!card) return;

    const state = getItemState(momentId);

    card.className = `moment-card state-${state}${card.classList.contains('expanded') ? ' expanded' : ''}`;
}

function markMomentCovered(momentId) {
    markCovered(momentId);

    const btn = document.getElementById(`moment-btn-${momentId}`);

    if (btn) {
        btn.className = 'btn-mark-covered is-covered';
        btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Covered`;
    }

    updateMomentCard(momentId);
    renderDiscussionSets();
}

// ---- KEY LANGUAGE DRAWER ----
function openVocabBank() {
    renderVocabBank();

    document.getElementById('vb-overlay').classList.add('open');
    document.getElementById('vb-drawer').classList.add('open');

    document.body.style.overflow = 'hidden';

    activateFocusTrap(document.getElementById('vb-drawer'));
}

function closeVocabBank() {
    document.getElementById('vb-overlay').classList.remove('open');
    document.getElementById('vb-drawer').classList.remove('open');

    document.body.style.overflow = '';

    releaseFocusTrap();
}

function renderVocabBank() {
    const list = document.getElementById('vb-list');

    list.innerHTML = '';

    const totalCount = clCards.length + discussionSets.reduce((acc, s) => acc + s.moments.length, 0);
    const intro = document.createElement('div');

    intro.innerHTML = `<p style="font-size:0.72rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--accent);margin-bottom:0.3rem;">${totalCount} upgrade terms</p>
        <p style="font-size:0.8rem;color:var(--stone-dark);line-height:1.5;padding-bottom:0.8rem;border-bottom:1px solid var(--stone-light);">${escHtml(subjectCopy.keyLanguage.intro)}</p>`;

    list.appendChild(intro);

    const clLabel = document.createElement('p');

    clLabel.className = 'vb-section-label';
    clLabel.textContent = 'Cultural Lens';

    list.appendChild(clLabel);

    clCards.forEach(card => {
        const up = card.upgrade;
        const entry = document.createElement('div');

        entry.className = 'vb-entry';
        entry.innerHTML = `
            <p class="vb-entry-word">${escHtml(up.term)}</p>
            <p class="vb-entry-type">${escHtml(up.type)}</p>
            <p class="vb-entry-def">${escHtml(up.def)}</p>
            <p class="vb-entry-example">${escHtml(up.in_action)}</p>`;

        list.appendChild(entry);
    });

    discussionSets.forEach(set => {
        const setLabel = document.createElement('p');

        setLabel.className = 'vb-section-label';
        setLabel.textContent = set.title;

        list.appendChild(setLabel);

        set.moments.forEach(moment => {
            const up = moment.upgrade;
            const entry = document.createElement('div');

            entry.className = 'vb-entry';
            entry.innerHTML = `
                <p class="vb-entry-word">${escHtml(up.term)}</p>
                <p class="vb-entry-type">${escHtml(up.type)}</p>
                <p class="vb-entry-def">${escHtml(up.def)}</p>
                <p class="vb-entry-example">${escHtml(up.in_action)}</p>`;

            list.appendChild(entry);
        });
    });

    const printArea = document.createElement('div');

    printArea.className = 'vb-print-area';
    printArea.innerHTML = `
        <button class="vb-print-btn vb-print-btn-bottom" type="button" onclick="copyKeyLanguage(this)">
            Copy Key Language
        </button>
        <button class="vb-print-btn vb-print-btn-bottom vb-print-btn-pdf" type="button" onclick="printKeyLanguage()">
            Print / Save PDF
        </button>`;

    list.appendChild(printArea);
}

function buildKeyLanguagePlainText() {
    const groups = [
        {
            title: 'Cultural Lens',
            entries: clCards.map(card => card.upgrade)
        },
        ...discussionSets.map(set => ({
            title: set.title,
            entries: set.moments.map(moment => moment.upgrade)
        }))
    ];

    const lines = [
        `Compass · ${MODULE.title}`,
        'Key Language',
        ''
    ];

    groups.forEach(group => {
        lines.push(group.title.toUpperCase(), '');

        group.entries.forEach(up => {
            lines.push(
                `Term: ${up.term}`,
                `Type: ${up.type}`,
                `Meaning: ${up.def}`,
                `Example: ${up.in_action}`,
                ''
            );
        });

        lines.push('');
    });

    return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

async function copyKeyLanguage(button) {
    const text = buildKeyLanguagePlainText();
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

    button.textContent = copied ? 'Copied' : 'Copy failed';
    button.disabled = true;

    window.setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
    }, 1400);
}

function printKeyLanguage() {
    const printArea = document.getElementById('print-key-language');

    if (!printArea) return;

    const groups = [
        {
            title: 'Cultural Lens',
            entries: clCards.map(card => card.upgrade)
        },
        ...discussionSets.map(set => ({
            title: set.title,
            entries: set.moments.map(moment => moment.upgrade)
        }))
    ];

    const totalCount = groups.reduce((acc, group) => acc + group.entries.length, 0);

    printArea.innerHTML = `
        <div class="print-doc">
            <p class="print-doc-kicker">Compass · Key Language</p>
            <h1 class="print-doc-title">${escHtml(MODULE.title)}</h1>
            <p class="print-doc-intro">${escHtml(subjectCopy.keyLanguage.intro)}</p>
            <p class="print-doc-meta">${totalCount} upgrade terms</p>
            ${groups.map(group => `
                <section>
                    <h2 class="print-group-title">${escHtml(group.title)}</h2>
                    ${group.entries.map(up => `
                        <div class="print-entry">
                            <p class="print-entry-term">
                                ${escHtml(up.term)}
                                <span class="print-entry-type">${escHtml(up.type)}</span>
                            </p>
                            <p class="print-entry-def">${escHtml(up.def)}</p>
                            <p class="print-entry-example">${escHtml(up.in_action)}</p>
                        </div>
                    `).join('')}
                </section>
            `).join('')}
        </div>
    `;

    const originalTitle = document.title;

    document.title = `${MODULE.title} — Key Language`;
    document.body.classList.add('printing-key-language');

    const cleanupPrint = () => {
        setTimeout(() => {
            document.body.classList.remove('printing-key-language');
            document.title = originalTitle;
            printArea.innerHTML = '';
        }, 2000);

        window.removeEventListener('afterprint', cleanupPrint);
    };

    window.addEventListener('afterprint', cleanupPrint);

    setTimeout(() => {
        window.print();
    }, 300);
}

// ---- UTILITIES ----
function getScrollBehavior() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

let lastFocusedElement = null;
let activeFocusTrapRoot = null;

function getFocusableElements(root) {
    if (!root) return [];

    return Array.from(root.querySelectorAll(`
        a[href],
        button:not([disabled]),
        input:not([disabled]),
        textarea:not([disabled]),
        select:not([disabled]),
        [tabindex]:not([tabindex="-1"])
    `)).filter(el => el.getClientRects().length > 0);
}

function activateFocusTrap(root) {
    if (!root) return;

    lastFocusedElement = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    activeFocusTrapRoot = root;

    if (!root.hasAttribute('tabindex')) {
        root.setAttribute('tabindex', '-1');
    }

    requestAnimationFrame(() => {
        const focusable = getFocusableElements(root);
        const target = focusable[0] || root;

        if (target && typeof target.focus === 'function') {
            target.focus({ preventScroll: true });
        }
    });
}

function releaseFocusTrap() {
    const target = lastFocusedElement;

    activeFocusTrapRoot = null;
    lastFocusedElement = null;

    if (target && document.contains(target) && typeof target.focus === 'function') {
        requestAnimationFrame(() => {
            target.focus({ preventScroll: true });
        });
    }
}

function handleFocusTrap(event) {
    if (event.key !== 'Tab' || !activeFocusTrapRoot) return;

    const focusable = getFocusableElements(activeFocusTrapRoot);

    if (!focusable.length) {
        event.preventDefault();
        activeFocusTrapRoot.focus({ preventScroll: true });
        return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
        return;
    }

    if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
    }
}

function updateReflectionProgressSummary() {
    const summary = document.getElementById('reflection-progress-summary');

    if (!summary) return;

    const clCovered = clCards.filter(card => progress.covered.has(card.id)).length;
    const totalMoments = discussionSets.reduce((acc, set) => acc + set.moments.length, 0);
    const discCovered = discussionSets
        .flatMap(set => set.moments)
        .filter(moment => progress.covered.has(moment.id)).length;

    const clUnit = clCards.length === 1
        ? COMPASS_LABELS.culturalLensUnitSingular
        : COMPASS_LABELS.culturalLensUnitPlural;

    const discUnit = totalMoments === 1
        ? COMPASS_LABELS.discussionUnitSingular
        : COMPASS_LABELS.discussionUnitPlural;

    const isCompact = window.matchMedia('(max-width: 680px)').matches;

    if (isLessonComplete()) {
        summary.textContent = `${clCards.length} ${clUnit} · ${totalMoments} ${discUnit}`;

        return;
    }

    summary.textContent = `${clCovered}/${clCards.length} ${clUnit} covered · ${discCovered}/${totalMoments} ${discUnit} covered`;
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function jsArg(value) {
    return escHtml(JSON.stringify(String(value)));
}

// Keyboard accessibility
document.addEventListener('keydown', (e) => {
    handleFocusTrap(e);

    const clModalOpen = document.getElementById('cl-modal-overlay').classList.contains('open');

    if (e.key === 'Escape') {
        const confirmDialog = document.getElementById('session-dialog');

        if (confirmDialog?.open) return;
        if (clModalOpen) closeModal();
        if (document.getElementById('vb-drawer').classList.contains('open')) closeVocabBank();
        if (document.getElementById('session-modal-overlay').classList.contains('open')) closeSessionModal();
        if (document.getElementById('mobile-drawer').classList.contains('open')) closeMobileDrawer();

        closeAllUpgradePanels();
    }

    if (clModalOpen && e.key === 'ArrowRight') {
        const nextBtn = document.getElementById('modal-next-btn');

        if (!nextBtn.disabled) {
            e.preventDefault();
            navigateModal(1);
        }
    }

    if (clModalOpen && e.key === 'ArrowLeft') {
        const prevBtn = document.getElementById('modal-prev-btn');

        if (!prevBtn.disabled) {
            e.preventDefault();
            navigateModal(-1);
        }
    }
});

// Close upgrade panels on outside click
document.addEventListener('click', (e) => {
    if (!e.target.closest('.upgrade-chip') && !e.target.closest('.upgrade-panel')) {
        closeAllUpgradePanels();
    }
});

// ============================================================
// APPEARANCE MODE
// Shared Atlas appearance preference used by Compass subject pages.
// ============================================================

const APPEARANCE_MODE_KEY = COMPASS_APPEARANCE_MODE_KEY;

// SVG icons for the appearance toggle buttons
const APPEARANCE_SVG = {
    moon: `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true">
        <path d="M14.5 10.2A7 7 0 0 1 6.8 2.5a7 7 0 1 0 7.7 7.7Z" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    sun: `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true">
        <circle cx="8.5" cy="8.5" r="3" stroke="currentColor" stroke-width="1.35"/>
        <path d="M8.5 1.5v2M8.5 13.5v2M1.5 8.5h2M13.5 8.5h2M3.7 3.7l1.4 1.4M11.9 11.9l1.4 1.4M11.9 5.1l1.4-1.4M3.7 13.3l1.4-1.4" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/>
    </svg>`,

    // Smaller variants for the cover pill and mobile footer
    moonSm: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M12 8.5A5.5 5.5 0 0 1 5.5 2a5.5 5.5 0 1 0 6.5 6.5Z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    sunSm: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="2.5" stroke="currentColor" stroke-width="1.3"/>
        <path d="M7 1.5v1.5M7 11v1.5M1.5 7H3M11 7h1.5M3.2 3.2l1 1M9.8 9.8l1 1M9.8 4.2l1-1M3.2 10.8l1-1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    </svg>`
};

function getAppearanceMode() {
    const saved = storageGet(APPEARANCE_MODE_KEY);

    if (saved === 'night' || saved === 'light') return saved;

    return document.documentElement.dataset.theme === 'night' ? 'night' : 'light';
}

function applyAppearanceMode(mode) {
    document.documentElement.dataset.theme = mode;
}

function setAppearanceMode(mode) {
    storageSet(APPEARANCE_MODE_KEY, mode);
    applyAppearanceMode(mode);
    updateAppearanceToggleUI();

    window.dispatchEvent(new CustomEvent('atlas:appearance-change', {
        detail: { mode }
    }));
}

function toggleAppearanceMode() {
    const current = getAppearanceMode();

    setAppearanceMode(current === 'night' ? 'light' : 'night');
}

function updateAppearanceToggleUI() {
    const mode = getAppearanceMode();
    const isNight = mode === 'night';
    const label = isNight ? 'Switch to light mode' : 'Switch to night mode';

    // Icons: cover pill and mobile use smaller SVGs; desktop nav uses standard
    const iconStd = isNight ? APPEARANCE_SVG.sun : APPEARANCE_SVG.moon;
    const iconSm = isNight ? APPEARANCE_SVG.sunSm : APPEARANCE_SVG.moonSm;
    const iconMob = isNight ? APPEARANCE_SVG.sun : APPEARANCE_SVG.moon;

    // Cover toggle
    const coverBtn = document.getElementById('cover-appearance-toggle');

    if (coverBtn) {
        coverBtn.innerHTML = iconSm;
        coverBtn.title = label;
        coverBtn.setAttribute('aria-label', label);
    }

    // Desktop nav toggles (one per rendered nav, class selector)
    document.querySelectorAll('.nav-appearance-toggle').forEach(btn => {
        btn.innerHTML = iconStd;
        btn.title = label;
        btn.setAttribute('aria-label', label);
    });

    // Mobile drawer toggle
    const mobBtn = document.getElementById('mobile-appearance-toggle');

    if (mobBtn) {
        mobBtn.innerHTML = iconMob;
        mobBtn.title = label;
        mobBtn.setAttribute('aria-label', label);
    }
}

function initAppearanceMode() {
    // The early head script already set dataset.theme before first paint.
    // Here we sync storage when available and update all toggle icons.
    const saved = storageGet(APPEARANCE_MODE_KEY);

    if (saved !== 'night' && saved !== 'light') {
        storageSet(APPEARANCE_MODE_KEY, getAppearanceMode());
    }

    updateAppearanceToggleUI();
}

// ============================================================
// INIT
// Boots the shared Compass subject shell, then publishes the
// subject/session state to AtlasBridge.
// ============================================================

function init() {
    applyCompassFavicon();
    applyCoverConfig();
    applyDerivedLabels();
    applySubjectCopy();

    renderNav('nav-orientation', 'view-orientation');
    renderNav('nav-cultural-lens', 'view-cultural-lens');
    renderNav('nav-discussion', 'view-discussion');
    renderNav('nav-reflection', 'view-reflection');

    renderMobileHeader('mob-header-orientation', 'overview');
    renderMobileHeader('mob-header-cultural-lens', 'cultural-lens');
    renderMobileHeader('mob-header-discussion', 'discussion');
    renderMobileHeader('mob-header-reflection', 'reflection');

    renderMobileDrawerNav();

    loadSessions();
    loadProgress();
    updateSessionUI();

    window.addEventListener('atlas:session-change', () => {
        syncSessionsFromBridge();
        loadProgress();
        updateSessionUI();
        refreshProgressUI();
        publishAtlasCompassItem('opened');
    });

    // Cross-tab sync: custom events don't cross tabs, but the native
    // storage event does. When Atlas (or another tab) changes the active
    // session or appearance, reflect it here.
    window.addEventListener('storage', (e) => {
        if (!e || !e.key) return;
        if (e.key === 'atlas::activeSessionId' || e.key === 'atlas::sessions') {
            syncSessionsFromBridge();
            loadProgress();
            updateSessionUI();
            refreshProgressUI();
        }
        if (e.key === 'atlas::appearanceMode') {
            applyAppearanceMode(getAppearanceMode());
            updateAppearanceToggleUI();
        }
    });

    publishAtlasCompassItem('opened');

    renderCLGrid();
    renderDiscussionSets();

    updateLessonCompleteButton();
    updateGlobalProgressRail();

    updateReflectionCompleteState();
    updateReflectionProgressSummary();

    initAppearanceMode();
}

document.addEventListener('DOMContentLoaded', init);