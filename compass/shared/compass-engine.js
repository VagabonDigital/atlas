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
            <circle
                cx="10"
                cy="10"
                r="7.45"
                stroke="${color}"
                stroke-width="1.7"/>
            <path
                d="M13.65 6.35L11.2 11.2L6.35 13.65L8.8 8.8L13.65 6.35Z"
                stroke="${color}"
                stroke-width="1.6"
                stroke-linejoin="round"/>
            <path
                d="M13.65 6.35L11.2 11.2L8.8 8.8Z"
                fill="${color}"/>
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

const SAVED_UPGRADE_ICON_SVG = `<svg class="upgrade-chip-icon upgrade-chip-saved-icon" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.2 6.7L5.15 9.5L10.8 3.45"
            stroke="currentColor"
            stroke-width="1.45"
            stroke-linecap="round"
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
        labelKey: 'discussionTitle',
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
        labelKey: 'culturalLensTitle',
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
            <path d="M1.5 10.5c0-2.2 2-4 4.5-4s4.5 1.8 4.5 4"
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
                stroke-width="1.4"
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
    culturalLensGenericUnitSingular: 'card',
    culturalLensGenericUnitPlural: 'cards',
    discussionUnitSingular: 'moment',
    discussionUnitPlural: 'moments',
    discussionGenericUnitSingular: 'set',
    discussionGenericUnitPlural: 'sets'
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

let currentCulturalLensIndex = 0;
let culturalLensFocusUpgradeOpen = false;
let culturalLensFocusScrollX = 0;
let culturalLensFocusScrollY = 0;
let culturalLensFocusReturnElement = null;
let culturalLensFocusReturnCardId = '';
let culturalLensFocusPreviousBodyOverflow = '';
let culturalLensFocusPreviousRootOverflow = '';

let activeSetId = null;

const DISCUSSION_FOCUS_MAKE_IT_REAL_ID = 'make-it-real';

const DISCUSSION_FOLLOW_UP_LABELS = {
    'go-deeper': 'Go deeper',
    'another-angle': 'Another angle',
    'add-a-twist': 'Add a twist',
    'custom': 'Custom path'
};

const DISCUSSION_FOLLOW_UP_KINDS = Object.keys(
    DISCUSSION_FOLLOW_UP_LABELS
);

const DISCUSSION_FOLLOW_UP_LIMIT = 3;
const DISCUSSION_FOLLOW_UP_LABEL_LIMIT = 24;

const MY_VERSION_UPGRADE_PRIORITIES = {
    key: 'Key language',
    standard: 'All language only'
};

let discussionFocusSetId = null;
let discussionFocusMomentId = null;
let discussionFocusFollowUpOpen = false;
let discussionFocusFollowUpId = null;
let discussionFocusUpgradeOpen = false;
let discussionFocusScrollX = 0;
let discussionFocusScrollY = 0;
let discussionFocusReturnElement = null;
let discussionFocusPreviousBodyOverflow = '';
let discussionFocusPreviousRootOverflow = '';

let vocabBankActiveTab = 'saved';
let vocabBankEditMode = false;
let vocabBankPreviousBodyOverflow = '';
let vocabBankPreviousRootOverflow = '';

let lastFocusedElement = null;
let activeFocusTrapRoot = null;

let tutorContentVersion = null;
let tutorContentWorkingDraft = null;
let tutorContentLiveDraft = null;
let tutorContentWriteQueue = Promise.resolve();
let liveTutorPointerStartedInside = false;

const LIVE_TUTOR_HISTORY_LIMIT = 100;
const liveTutorHistoryByScope = new Map();
let liveTutorMutationRevision = 0;

const MY_VERSION_UNLOCK_HOLD_MS = 1500;
const MY_VERSION_HISTORY_LIMIT = 100;
const MY_VERSION_WORKING_DRAFT_SAVE_DELAY_MS = 180;
const ATLAS_SUBJECT_DOCUMENT = createAtlasSubjectDocument();
const myVersionPressedShiftCodes = new Set();
const myVersionHistory = {
    undo: [],
    redo: []
};

let myVersionEditing = false;
let myVersionDraftOverrides = {};
let myVersionOriginalOverrides = {};
let myVersionDraftDocument = null;
let myVersionOriginalDocument = null;
let myVersionDirty = false;
let myVersionIncludesLiveChanges = false;
let myVersionIncludedLiveSessionId = null;
let myVersionSaving = false;
let myVersionUnlockTimer = null;
let myVersionUnlockConsumed = false;
let myVersionExpandBarOnEditStart = false;
let myVersionWorkingDraftSaveTimer = null;
let myVersionPendingWorkingDraftOverrides = null;
let myVersionResumeViewId = null;
let myVersionUpgradeOptionsOpenContextId = null;
let myVersionCreatedSubjectId = null;

const myVersionGeneratingMomentSetIds = new Set();
const myVersionMomentGenerationErrors = new Map();

const myVersionGeneratingPathwayMomentIds = new Set();
const myVersionPathwayGenerationErrors = new Map();

let myVersionGeneratingCulturalLensCard = false;
let myVersionCulturalLensGenerationError = '';

let myVersionGeneratingDiscussionSet = false;
let myVersionDiscussionSetGenerationError = '';

let myVersionGeneratingSubjectFraming = false;
let myVersionSubjectFramingGenerationError = '';

let myVersionGeneratingOverview = false;
let myVersionOverviewGenerationError = '';

let myVersionGeneratingDiscussionFraming = false;
let myVersionDiscussionFramingGenerationError = '';

let myVersionGeneratingCulturalLensFraming = false;
let myVersionCulturalLensFramingGenerationError = '';

let myVersionGeneratingReflection = false;
let myVersionReflectionGenerationError = '';

let myVersionEnrichingDiscussion = false;
let myVersionDiscussionEnrichmentError = '';
let myVersionDiscussionEnrichmentProgress = null;

let myVersionEnrichingCulturalLens = false;
let myVersionCulturalLensEnrichmentError = '';
let myVersionCulturalLensEnrichmentProgress = null;

const FULL_SUBJECT_DISCUSSION_STAGES = [
    'First Look',
    'Look Closer',
    'Wider View'
];

const FULL_SUBJECT_CULTURAL_LENS_CARD_COUNT = 6;
const FULL_SUBJECT_GENERATION_STAGE_COUNT = 9;

let myVersionGeneratingFullSubject = false;
let myVersionFullSubjectGenerationError = '';
let myVersionFullSubjectGenerationProgress = null;
let myVersionFullSubjectGenerationNotice = '';


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

function requireAtlasTutorContent() {
    if (!window.AtlasTutorContent) {
        throw new Error(
            'AtlasTutorContent is missing. atlas-tutor-content.js must load before compass-engine.js.'
        );
    }

    return window.AtlasTutorContent;
}

function requireAtlasTutorSubjects() {
    if (!window.AtlasTutorSubjects) {
        throw new Error(
            'AtlasTutorSubjects is missing. atlas-tutor-subjects.js must load before compass-engine.js.'
        );
    }

    return window.AtlasTutorSubjects;
}

function requireAtlasStructuredSubject() {
    if (!window.AtlasStructuredSubject) {
        throw new Error(
            'AtlasStructuredSubject is missing. atlas-structured-subject.js must load before compass-engine.js.'
        );
    }

    return window.AtlasStructuredSubject;
}

function requireAtlasAI() {
    if (
        !window.AtlasAI ||
        typeof window.AtlasAI.generateMoment !== 'function' ||
        typeof window.AtlasAI.generateCulturalLensCard !== 'function' ||
        typeof window.AtlasAI.generateDiscussionSet !== 'function' ||
        typeof window.AtlasAI.generateSubjectFraming !== 'function' ||
        typeof window.AtlasAI.generateOverview !== 'function' ||
        typeof window.AtlasAI.generateDiscussionFraming !== 'function' ||
        typeof window.AtlasAI.generateCulturalLensFraming !== 'function' ||
        typeof window.AtlasAI.generateReflection !== 'function' ||
        typeof window.AtlasAI.generateMomentUpgrade !== 'function' ||
        typeof window.AtlasAI.generateCulturalLensUpgrade !== 'function' ||
        typeof window.AtlasAI.generateMakeItReal !== 'function' ||
        typeof window.AtlasAI.generateDiscussionPathway !== 'function'
    ) {
        throw new Error(
            'AtlasAI is missing or incomplete. atlas-ai.js must load before AI-assisted authorship.'
        );
    }

    return window.AtlasAI;
}

function getCompassSubjectRuntime() {
    const runtime = window.AtlasCompassSubjectRuntime;

    return runtime &&
        typeof runtime === 'object' &&
        !Array.isArray(runtime)
        ? runtime
        : { source: 'atlas' };
}

function isOwnedSubjectRuntime() {
    return getCompassSubjectRuntime().source === 'owned';
}

function consumeOwnedSubjectAuthoringIntent() {
    if (!isOwnedSubjectRuntime()) {
        return '';
    }

    try {
        const url = new URL(window.location.href);
        const intent =
            url.searchParams.get('author');

        if (
            ![
                'create',
                'edit',
                'generate'
            ].includes(intent)
        ) {
            return '';
        }

        url.searchParams.delete('author');

        try {
            window.history.replaceState(
                window.history.state,
                '',
                url.href
            );
        } catch { }

        return intent;
    } catch {
        return '';
    }
}

function getTutorContentId() {
    return `${COMPASS_WORLD_ID}:${MODULE.id}`;
}

function hasTutorContentOverride(record, fieldKey) {
    return Boolean(
        record?.overrides &&
        Object.prototype.hasOwnProperty.call(
            record.overrides,
            fieldKey
        )
    );
}

function resolveTutorContentValue(originalValue, fieldKey) {
    let value = String(originalValue ?? '');

    if (myVersionEditing) {
        if (
            Object.prototype.hasOwnProperty.call(
                myVersionDraftOverrides,
                fieldKey
            )
        ) {
            return String(
                myVersionDraftOverrides[fieldKey] ?? ''
            );
        }

        return value;
    }

    if (hasTutorContentOverride(tutorContentVersion, fieldKey)) {
        value = tutorContentVersion.overrides[fieldKey];
    }

    if (hasTutorContentOverride(tutorContentLiveDraft, fieldKey)) {
        value = tutorContentLiveDraft.overrides[fieldKey];
    }

    return value;
}

async function loadTutorContentState() {
    const Store = requireAtlasTutorContent();
    const contentId = getTutorContentId();

    if (isOwnedSubjectRuntime()) {
        const Subjects = requireAtlasTutorSubjects();

        const [workingDraft, liveDraft] = await Promise.all([
            Subjects.getWorkingDraft(MODULE.id),
            Store.getLiveDraft(
                currentSessionId,
                contentId
            )
        ]);

        tutorContentVersion = null;
        tutorContentWorkingDraft = workingDraft;
        tutorContentLiveDraft = liveDraft;
        liveTutorMutationRevision += 1;

        if (!myVersionEditing && workingDraft) {
            resumeMyVersionWorkingDraft(workingDraft);
        } else if (myVersionEditing) {
            applyTutorSubjectDocument(
                myVersionDraftDocument ||
                ATLAS_SUBJECT_DOCUMENT
            );
        } else {
            applyTutorSubjectDocument(
                ATLAS_SUBJECT_DOCUMENT
            );
        }

        updateLiveTutorContentControl();
        return;
    }

    const [version, workingDraft, liveDraft] = await Promise.all([
        Store.getVersion(contentId),
        Store.getWorkingDraft(contentId),
        Store.getLiveDraft(currentSessionId, contentId)
    ]);

    tutorContentVersion = version;
    tutorContentWorkingDraft = workingDraft;
    tutorContentLiveDraft = liveDraft;
    liveTutorMutationRevision += 1;

    if (!myVersionEditing && workingDraft) {
        resumeMyVersionWorkingDraft(workingDraft);
    } else if (myVersionEditing) {
        applyTutorSubjectDocument(
            myVersionDraftDocument ||
            tutorContentVersion?.document ||
            ATLAS_SUBJECT_DOCUMENT
        );
    } else {
        applyTutorSubjectDocument(
            tutorContentVersion?.document ||
            ATLAS_SUBJECT_DOCUMENT
        );
    }

    updateLiveTutorContentControl();
}

function queueTutorContentWrite(write) {
    tutorContentWriteQueue = tutorContentWriteQueue
        .then(write)
        .catch(error => {
            console.warn(
                '[Compass] Tutor content write failed:',
                error
            );
        });

    return tutorContentWriteQueue;
}


function cloneTutorContentOverrides(overrides = {}) {
    return {
        ...(overrides || {})
    };
}

function cloneTutorSubjectDocument(document) {
    if (!document || typeof document !== 'object') {
        return null;
    }

    try {
        return JSON.parse(JSON.stringify(document));
    } catch {
        return null;
    }
}

function getAtlasSubjectCatalogDescription() {
    try {
        const Catalog = window.CompassCatalogData;

        if (!Catalog) return '';

        const catalog = typeof Catalog.getCompassCatalogMap === 'function'
            ? Catalog.getCompassCatalogMap()
            : {};

        const subject =
            catalog?.[`${COMPASS_WORLD_ID}:${MODULE.id}`] ||
            Object.values(catalog || {}).find(item =>
                item?.id === MODULE.id
            );

        return String(
            subject?.description ||
            subject?.hook ||
            ''
        ).trim();
    } catch {
        return '';
    }
}

function createAtlasSubjectDocument() {
    return {
        schemaVersion: 1,
        module: {
            title: MODULE.title,
            navTitle: MODULE.navTitle || MODULE.title,
            bgImage: MODULE.bgImage,
            catalogDescription:
                typeof MODULE.catalogDescription === 'string'
                    ? MODULE.catalogDescription
                    : getAtlasSubjectCatalogDescription()
        },
        subjectCopy: cloneTutorSubjectDocument(subjectCopy),
        discussionSets: cloneTutorSubjectDocument(discussionSets),
        culturalLensCards: cloneTutorSubjectDocument(clCards)
    };
}

function normalizeTutorSubjectDocument(document) {
    const fallback = cloneTutorSubjectDocument(
        ATLAS_SUBJECT_DOCUMENT
    );

    const candidate = cloneTutorSubjectDocument(document);

    if (!candidate) return fallback;

    const discussionDocumentIsValid =
        Array.isArray(candidate.discussionSets) &&
        candidate.discussionSets.length > 0 &&
        candidate.discussionSets.every(set =>
            set &&
            typeof set === 'object' &&
            typeof set.id === 'string' &&
            set.id.trim() &&
            Array.isArray(set.moments) &&
            set.moments.length > 0
        );

    const culturalLensDocumentIsValid =
        Array.isArray(candidate.culturalLensCards) &&
        candidate.culturalLensCards.length > 0;

    return {
        schemaVersion: 1,
        module: {
            ...fallback.module,
            ...(candidate.module &&
            typeof candidate.module === 'object' &&
            !Array.isArray(candidate.module)
                ? candidate.module
                : {})
        },
        subjectCopy:
            candidate.subjectCopy &&
            typeof candidate.subjectCopy === 'object' &&
            !Array.isArray(candidate.subjectCopy)
                ? candidate.subjectCopy
                : fallback.subjectCopy,
        discussionSets: discussionDocumentIsValid
            ? candidate.discussionSets
            : fallback.discussionSets,
        culturalLensCards: culturalLensDocumentIsValid
            ? candidate.culturalLensCards
            : fallback.culturalLensCards
    };
}

function replaceTutorSubjectObject(target, source) {
    Object.keys(target).forEach(key => {
        delete target[key];
    });

    Object.assign(
        target,
        cloneTutorSubjectDocument(source) || {}
    );
}

function replaceTutorSubjectArray(target, source) {
    target.splice(
        0,
        target.length,
        ...(cloneTutorSubjectDocument(source) || [])
    );
}

function applyTutorSubjectDocument(document) {
    const normalized = normalizeTutorSubjectDocument(document);

    replaceTutorSubjectObject(
        subjectCopy,
        normalized.subjectCopy
    );

    replaceTutorSubjectArray(
        discussionSets,
        normalized.discussionSets
    );

    replaceTutorSubjectArray(
        clCards,
        normalized.culturalLensCards
    );

    reconcileTutorSubjectDocumentState();

    return normalized;
}

function reconcileTutorSubjectDocumentState() {
    const activeSet = discussionSets.find(
        set => set.id === activeSetId
    );

    if (!activeSet && activeSetId) {
        activeSetId = null;

        document
            .getElementById('moments-panel')
            ?.classList.remove('open');
    }

    if (!isDiscussionFocusOpen()) return;

    const focusSet = discussionSets.find(
        set => set.id === discussionFocusSetId
    );

    const focusEntry = getDiscussionFocusSequence(
        focusSet
    ).find(entry => entry.id === discussionFocusMomentId);

    if (!focusSet || !focusEntry) {
        closeDiscussionFocus({
            restoreScroll: false,
            restoreFocus: false
        });
    }
}

function getPublishedTutorSubjectDocument() {
    return normalizeTutorSubjectDocument(
        tutorContentVersion?.document ||
        ATLAS_SUBJECT_DOCUMENT
    );
}

function tutorSubjectDocumentsMatch(left, right) {
    try {
        return JSON.stringify(
            normalizeTutorSubjectDocument(left)
        ) === JSON.stringify(
            normalizeTutorSubjectDocument(right)
        );
    } catch {
        return false;
    }
}

function tutorContentOverridesMatch(left, right) {
    const leftEntries = Object.entries(left || {});
    const rightEntries = Object.entries(right || {});

    if (leftEntries.length !== rightEntries.length) {
        return false;
    }

    return leftEntries.every(([fieldKey, value]) =>
        Object.prototype.hasOwnProperty.call(
            right || {},
            fieldKey
        ) && right[fieldKey] === value
    );
}

function hasSavedMyVersion() {
    return Boolean(tutorContentVersion);
}

function getLiveTutorContentChangeCount() {
    return Object.keys(
        tutorContentLiveDraft?.overrides || {}
    ).length;
}

function getActiveCompassViewId() {
    return document.querySelector('.view.active')?.id || 'view-cover';
}

function getMyVersionWorkingDraftPatch(overrides) {
    if (isOwnedSubjectRuntime()) {
        return {
            baseRevision: Math.max(
                1,
                Math.floor(
                    Number(
                        getCompassSubjectRuntime().revision
                    ) || 1
                )
            ),
            document: materializeTutorSubjectDocument(
                myVersionDraftDocument ||
                getPublishedTutorSubjectDocument(),
                overrides,
                'My Subject draft'
            ),
            includedLiveSessionId: myVersionIncludedLiveSessionId,
            activeViewId: getActiveCompassViewId()
        };
    }

    return {
        baseContentVersion: MODULE.contentVersion,
        replaceOverrides: true,
        overrides: cloneTutorContentOverrides(overrides),
        document: cloneTutorSubjectDocument(
            myVersionDraftDocument ||
            getPublishedTutorSubjectDocument()
        ),
        includedLiveSessionId: myVersionIncludedLiveSessionId,
        activeViewId: getActiveCompassViewId()
    };
}

function clearMyVersionWorkingDraftSaveTimer() {
    if (myVersionWorkingDraftSaveTimer !== null) {
        window.clearTimeout(myVersionWorkingDraftSaveTimer);
        myVersionWorkingDraftSaveTimer = null;
    }
}

function saveMyVersionWorkingDraftNow(
    overrides = myVersionDraftOverrides
) {
    if (!myVersionEditing) {
        return Promise.resolve(null);
    }

    const contentId = getTutorContentId();
    const patch = getMyVersionWorkingDraftPatch(overrides);

    return queueTutorContentWrite(async () => {
        const saved = isOwnedSubjectRuntime()
            ? await requireAtlasTutorSubjects()
                .saveWorkingDraft(MODULE.id, patch)
            : await requireAtlasTutorContent()
                .saveWorkingDraft(contentId, patch);

        if (saved && myVersionEditing) {
            tutorContentWorkingDraft = saved;
        }

        return saved;
    });
}

function scheduleMyVersionWorkingDraftSave(
    overrides = myVersionDraftOverrides
) {
    if (!myVersionEditing) return;

    myVersionPendingWorkingDraftOverrides =
        cloneTutorContentOverrides(overrides);

    clearMyVersionWorkingDraftSaveTimer();

    myVersionWorkingDraftSaveTimer = window.setTimeout(() => {
        myVersionWorkingDraftSaveTimer = null;

        const pending = myVersionPendingWorkingDraftOverrides;
        myVersionPendingWorkingDraftOverrides = null;

        saveMyVersionWorkingDraftNow(
            pending || myVersionDraftOverrides
        );
    }, MY_VERSION_WORKING_DRAFT_SAVE_DELAY_MS);
}

function flushMyVersionWorkingDraftSave() {
    clearMyVersionWorkingDraftSaveTimer();

    const pending = myVersionPendingWorkingDraftOverrides;
    myVersionPendingWorkingDraftOverrides = null;

    return saveMyVersionWorkingDraftNow(
        pending || myVersionDraftOverrides
    );
}

function resumeMyVersionWorkingDraft(workingDraft) {
    if (!workingDraft) return false;

    myVersionOriginalOverrides = cloneTutorContentOverrides(
        tutorContentVersion?.overrides
    );

    myVersionDraftOverrides = cloneTutorContentOverrides(
        workingDraft.overrides
    );

    myVersionOriginalDocument =
        getPublishedTutorSubjectDocument();

    myVersionDraftDocument = normalizeTutorSubjectDocument(
        workingDraft.document ||
        myVersionOriginalDocument
    );

    applyTutorSubjectDocument(myVersionDraftDocument);

    myVersionIncludedLiveSessionId =
        workingDraft.includedLiveSessionId || null;

    myVersionIncludesLiveChanges = Boolean(
        myVersionIncludedLiveSessionId
    );

    myVersionResumeViewId =
        workingDraft.activeViewId || 'view-cover';

    myVersionEditing = true;
    myVersionSaving = false;
    resetMyVersionHistory();
    refreshMyVersionDirtyState();

    return true;
}

function restoreMyVersionWorkingDraftView() {
    if (!myVersionEditing || !myVersionResumeViewId) return;

    const requestedViewId = myVersionResumeViewId;
    myVersionResumeViewId = null;

    const target = document.getElementById(requestedViewId);

    const safeViewId = target?.classList.contains('view')
        ? requestedViewId
        : 'view-cover';

    goToView(safeViewId);
}

function setMyVersionAuthorBarMinimized(minimized) {
    const bar = document.getElementById(
        'atlas-my-version-bar'
    );

    const toggle = document.getElementById(
        'atlas-my-version-bar-toggle'
    );

    if (!bar || !toggle) {
        return;
    }

    const nextMinimized = Boolean(minimized);

    if (nextMinimized) {
        closeMyVersionMobileTools();
    }

    bar.classList.toggle(
        'is-minimized',
        nextMinimized
    );

    toggle.setAttribute(
        'aria-expanded',
        String(!nextMinimized)
    );

    toggle.setAttribute(
        'aria-label',
        nextMinimized
            ? 'Open subject tools'
            : 'Minimize subject tools'
    );
}

function toggleMyVersionAuthorBar() {
    if (!myVersionEditing) {
        return;
    }

    const bar = document.getElementById(
        'atlas-my-version-bar'
    );

    if (!bar) {
        return;
    }

    setMyVersionAuthorBarMinimized(
        !bar.classList.contains(
            'is-minimized'
        )
    );
}

function toggleMyVersionMobileTools() {
    const bar = document.getElementById(
        'atlas-my-version-bar'
    );

    const toggle = document.getElementById(
        'atlas-my-version-tools-toggle'
    );

    if (!bar || !toggle) {
        return;
    }

    const open =
        !bar.classList.contains(
            'is-mobile-tools-open'
        );

    bar.classList.toggle(
        'is-mobile-tools-open',
        open
    );

    toggle.setAttribute(
        'aria-expanded',
        String(open)
    );

    toggle.setAttribute(
        'aria-label',
        open
            ? 'Close subject tools'
            : 'Open subject tools'
    );
}

function closeMyVersionMobileTools() {
    const bar = document.getElementById(
        'atlas-my-version-bar'
    );

    const toggle = document.getElementById(
        'atlas-my-version-tools-toggle'
    );

    bar?.classList.remove(
        'is-mobile-tools-open'
    );

    if (toggle) {
        toggle.setAttribute(
            'aria-expanded',
            'false'
        );

        toggle.setAttribute(
            'aria-label',
            'Open subject tools'
        );
    }
}

function updateMyVersionAuthorBar() {
    const bar = document.getElementById(
        'atlas-my-version-bar'
    );

    const status = document.getElementById(
        'atlas-my-version-status'
    );

    const coverActionButton = document.getElementById(
        'atlas-my-version-cover-action'
    );

    const framingButton = document.getElementById(
        'atlas-my-version-generate-framing'
    );

    const overviewButton = document.getElementById(
        'atlas-my-version-generate-overview'
    );

    const discussionFramingButton = document.getElementById(
        'atlas-my-version-generate-discussion-framing'
    );

    const discussionEnrichButton = document.getElementById(
        'atlas-my-version-enrich-discussion'
    );

    const culturalLensFramingButton = document.getElementById(
        'atlas-my-version-generate-cultural-lens-framing'
    );

    const culturalLensEnrichButton = document.getElementById(
        'atlas-my-version-enrich-cultural-lens'
    );

    const reflectionButton = document.getElementById(
        'atlas-my-version-generate-reflection'
    );

    const saveButton = document.getElementById(
        'atlas-my-version-save'
    );

    const cancelButton = document.getElementById(
        'atlas-my-version-cancel'
    );

    const mobileTutorToolsLabel = document.getElementById(
        'mobile-tutor-tools-entry-label'
    );

    const coverTutorToolsButton = document.querySelector(
        '.cover-tutor-tools-btn'
    );

    const authoringLabel = bar?.querySelector(
        '.atlas-my-version-copy strong'
    );

    const ownedSubject = isOwnedSubjectRuntime();

    const mobileEditLabel = ownedSubject
        ? 'Edit subject'
        : hasSavedMyVersion()
            ? 'Edit My Version'
            : 'Create My Version';

    if (mobileTutorToolsLabel) {
        mobileTutorToolsLabel.textContent =
            mobileEditLabel;
    }

    if (coverTutorToolsButton) {
        coverTutorToolsButton.title =
            mobileEditLabel;

        coverTutorToolsButton.setAttribute(
            'aria-label',
            mobileEditLabel
        );
    }

    const activeViewId = getActiveCompassViewId();
    const onCover = activeViewId === 'view-cover';
    const onOverview =
        activeViewId === 'view-orientation';
    const onDiscussion =
        activeViewId === 'view-discussion';
    const onCulturalLens =
        activeViewId === 'view-cultural-lens';
    const onReflection =
        activeViewId === 'view-reflection';

    const discussionFocusOpen =
        isDiscussionFocusOpen();

    const culturalLensFocusOpen =
        isCulturalLensFocusOpen();

    const enrichmentActive =
        myVersionEnrichingDiscussion ||
        myVersionEnrichingCulturalLens ||
        myVersionGeneratingFullSubject;

    document.body.classList.toggle(
        'atlas-my-version-editing',
        myVersionEditing
    );

    if (bar) {
        bar.hidden = !myVersionEditing;
    }

    if (authoringLabel) {
        authoringLabel.textContent = ownedSubject
            ? 'Editing My Subject'
            : 'Editing My Version';
    }

    if (status) {
        status.textContent =
            myVersionGeneratingFullSubject
                ? getMyVersionFullSubjectGenerationStatus()
                : myVersionFullSubjectGenerationError
                    ? myVersionFullSubjectGenerationError
                    : myVersionFullSubjectGenerationNotice
                        ? myVersionFullSubjectGenerationNotice
                        : myVersionGeneratingSubjectFraming
                ? 'Generating hook and introduction…'
                : myVersionGeneratingOverview
                    ? 'Generating overview…'
                    : myVersionGeneratingDiscussionFraming
                        ? 'Generating discussion framing…'
                        : myVersionEnrichingDiscussion
                            ? `Enriching discussion${
                                myVersionDiscussionEnrichmentProgress
                                    ? ` · ${myVersionDiscussionEnrichmentProgress.current} of ${myVersionDiscussionEnrichmentProgress.total}`
                                    : ''
                            }…`
                            : myVersionGeneratingCulturalLensFraming
                            ? 'Generating Cultural Lens framing…'
                            : myVersionEnrichingCulturalLens
                                ? `Enriching Cultural Lens${
                                    myVersionCulturalLensEnrichmentProgress
                                        ? ` · ${myVersionCulturalLensEnrichmentProgress.current} of ${myVersionCulturalLensEnrichmentProgress.total}`
                                        : ''
                                }…`
                                : myVersionGeneratingReflection
                                ? 'Generating reflection…'
                                : (
                            ownedSubject &&
                            onCover &&
                            myVersionSubjectFramingGenerationError
                        )
                            ? myVersionSubjectFramingGenerationError
                            : (
                                ownedSubject &&
                                onOverview &&
                                myVersionOverviewGenerationError
                            )
                                ? myVersionOverviewGenerationError
                                : (
                                    ownedSubject &&
                                    onDiscussion &&
                                    myVersionDiscussionEnrichmentError
                                )
                                    ? myVersionDiscussionEnrichmentError
                                    : (
                                        ownedSubject &&
                                        onDiscussion &&
                                        myVersionDiscussionFramingGenerationError
                                    )
                                        ? myVersionDiscussionFramingGenerationError
                                        : (
                                            ownedSubject &&
                                            onCulturalLens &&
                                            myVersionCulturalLensEnrichmentError
                                        )
                                            ? myVersionCulturalLensEnrichmentError
                                            : (
                                                ownedSubject &&
                                                onCulturalLens &&
                                                myVersionCulturalLensFramingGenerationError
                                            )
                                                ? myVersionCulturalLensFramingGenerationError
                                                : (
                                            ownedSubject &&
                                            onReflection &&
                                            myVersionReflectionGenerationError
                                        )
                                            ? myVersionReflectionGenerationError
                                            : myVersionSaving
                                        ? 'Saving…'
                                        : myVersionDirty
                                            ? 'Unpublished changes · autosaved'
                                            : 'No changes yet';
    }

    if (coverActionButton) {
        coverActionButton.disabled = myVersionSaving;
        coverActionButton.textContent = onCover
            ? 'Subject details'
            : 'Cover';
    }

    if (framingButton) {
        const showFramingButton =
            ownedSubject &&
            onCover &&
            myVersionEditing;

        framingButton.hidden =
            !showFramingButton;

        framingButton.disabled =
            myVersionSaving ||
            myVersionGeneratingSubjectFraming ||
            enrichmentActive;

        framingButton.setAttribute(
            'aria-busy',
            String(
                myVersionGeneratingSubjectFraming
            )
        );

        framingButton.innerHTML =
            myVersionGeneratingSubjectFraming
                ? `
                    <svg class="moment-author-generate-spinner"
                        width="14" height="14"
                        viewBox="0 0 15 15"
                        fill="none" aria-hidden="true">
                        <circle cx="7.5" cy="7.5" r="5"
                            stroke="currentColor"
                            stroke-width="1.45"
                            stroke-linecap="round"
                            stroke-dasharray="20 12"/>
                    </svg>
                    Generating…
                `
                : `
                    <svg width="14" height="14"
                        viewBox="0 0 15 15"
                        fill="none" aria-hidden="true">
                        <path d="M7.5 1.75L8.15 5.35L11.75 6L8.15 6.65L7.5 10.25L6.85 6.65L3.25 6L6.85 5.35L7.5 1.75Z"
                            stroke="currentColor"
                            stroke-width="1.15"
                            stroke-linejoin="round"/>
                        <path d="M11.5 9.5L11.82 11.18L13.5 11.5L11.82 11.82L11.5 13.5L11.18 11.82L9.5 11.5L11.18 11.18L11.5 9.5Z"
                            stroke="currentColor"
                            stroke-width="0.95"
                            stroke-linejoin="round"/>
                    </svg>
                    Generate hook + intro
                `;
    }

    if (overviewButton) {
        const showOverviewButton =
            ownedSubject &&
            onOverview &&
            myVersionEditing;

        overviewButton.hidden =
            !showOverviewButton;

        overviewButton.disabled =
            myVersionSaving ||
            myVersionGeneratingOverview ||
            enrichmentActive;

        overviewButton.setAttribute(
            'aria-busy',
            String(
                myVersionGeneratingOverview
            )
        );

        overviewButton.innerHTML =
            myVersionGeneratingOverview
                ? `
                    <svg class="moment-author-generate-spinner"
                        width="14" height="14"
                        viewBox="0 0 15 15"
                        fill="none" aria-hidden="true">
                        <circle cx="7.5" cy="7.5" r="5"
                            stroke="currentColor"
                            stroke-width="1.45"
                            stroke-linecap="round"
                            stroke-dasharray="20 12"/>
                    </svg>
                    Generating…
                `
                : `
                    <svg width="14" height="14"
                        viewBox="0 0 15 15"
                        fill="none" aria-hidden="true">
                        <path d="M7.5 1.75L8.15 5.35L11.75 6L8.15 6.65L7.5 10.25L6.85 6.65L3.25 6L6.85 5.35L7.5 1.75Z"
                            stroke="currentColor"
                            stroke-width="1.15"
                            stroke-linejoin="round"/>
                        <path d="M11.5 9.5L11.82 11.18L13.5 11.5L11.82 11.82L11.5 13.5L11.18 11.82L9.5 11.5L11.18 11.18L11.5 9.5Z"
                            stroke="currentColor"
                            stroke-width="0.95"
                            stroke-linejoin="round"/>
                    </svg>
                    Generate overview
                `;
    }

    if (discussionFramingButton) {
        const showDiscussionFramingButton =
            ownedSubject &&
            onDiscussion &&
            !discussionFocusOpen &&
            myVersionEditing;

        discussionFramingButton.hidden =
            !showDiscussionFramingButton;

        discussionFramingButton.disabled =
            myVersionSaving ||
            myVersionGeneratingDiscussionFraming ||
            enrichmentActive;

        discussionFramingButton.setAttribute(
            'aria-busy',
            String(
                myVersionGeneratingDiscussionFraming
            )
        );

        discussionFramingButton.innerHTML =
            myVersionGeneratingDiscussionFraming
                ? `
                    <svg class="moment-author-generate-spinner"
                        width="14" height="14"
                        viewBox="0 0 15 15"
                        fill="none" aria-hidden="true">
                        <circle cx="7.5" cy="7.5" r="5"
                            stroke="currentColor"
                            stroke-width="1.45"
                            stroke-linecap="round"
                            stroke-dasharray="20 12"/>
                    </svg>
                    Generating…
                `
                : `
                    <svg width="14" height="14"
                        viewBox="0 0 15 15"
                        fill="none" aria-hidden="true">
                        <path d="M7.5 1.75L8.15 5.35L11.75 6L8.15 6.65L7.5 10.25L6.85 6.65L3.25 6L6.85 5.35L7.5 1.75Z"
                            stroke="currentColor"
                            stroke-width="1.15"
                            stroke-linejoin="round"/>
                        <path d="M11.5 9.5L11.82 11.18L13.5 11.5L11.82 11.82L11.5 13.5L11.18 11.82L9.5 11.5L11.18 11.18L11.5 9.5Z"
                            stroke="currentColor"
                            stroke-width="0.95"
                            stroke-linejoin="round"/>
                    </svg>
                    Generate discussion framing
                `;
    }

    if (discussionEnrichButton) {
        const remainingUpgrades =
            getMyVersionDiscussionLanguageUpgradeCandidateIds()
                .length;

        const remainingActivities =
            getMyVersionDiscussionMakeItRealCandidateSetIds()
                .length;

        const showDiscussionEnrichButton =
            ownedSubject &&
            onDiscussion &&
            !discussionFocusOpen &&
            myVersionEditing &&
            (
                remainingUpgrades > 0 ||
                remainingActivities > 0 ||
                myVersionEnrichingDiscussion
            );

        discussionEnrichButton.hidden =
            !showDiscussionEnrichButton;

        discussionEnrichButton.disabled =
            myVersionSaving ||
            myVersionGeneratingDiscussionFraming ||
            enrichmentActive;

        discussionEnrichButton.setAttribute(
            'aria-busy',
            String(
                myVersionEnrichingDiscussion
            )
        );

        discussionEnrichButton.innerHTML =
            myVersionEnrichingDiscussion
                ? `
                    <svg class="moment-author-generate-spinner"
                        width="14" height="14"
                        viewBox="0 0 15 15"
                        fill="none" aria-hidden="true">
                        <circle cx="7.5" cy="7.5" r="5"
                            stroke="currentColor"
                            stroke-width="1.45"
                            stroke-linecap="round"
                            stroke-dasharray="20 12"/>
                    </svg>
                    Enriching…
                `
                : `
                    <svg width="14" height="14"
                        viewBox="0 0 15 15"
                        fill="none" aria-hidden="true">
                        <path d="M7.5 1.75L8.15 5.35L11.75 6L8.15 6.65L7.5 10.25L6.85 6.65L3.25 6L6.85 5.35L7.5 1.75Z"
                            stroke="currentColor"
                            stroke-width="1.15"
                            stroke-linejoin="round"/>
                        <path d="M11.5 9.5L11.82 11.18L13.5 11.5L11.82 11.82L11.5 13.5L11.18 11.82L9.5 11.5L11.18 11.18L11.5 9.5Z"
                            stroke="currentColor"
                            stroke-width="0.95"
                            stroke-linejoin="round"/>
                    </svg>
                    Enrich discussion
                `;
    }

    if (culturalLensFramingButton) {
        const showCulturalLensFramingButton =
            ownedSubject &&
            onCulturalLens &&
            !culturalLensFocusOpen &&
            myVersionEditing;

        culturalLensFramingButton.hidden =
            !showCulturalLensFramingButton;

        culturalLensFramingButton.disabled =
            myVersionSaving ||
            myVersionGeneratingCulturalLensFraming ||
            enrichmentActive;

        culturalLensFramingButton.setAttribute(
            'aria-busy',
            String(
                myVersionGeneratingCulturalLensFraming
            )
        );

        culturalLensFramingButton.innerHTML =
            myVersionGeneratingCulturalLensFraming
                ? `
                    <svg class="moment-author-generate-spinner"
                        width="14" height="14"
                        viewBox="0 0 15 15"
                        fill="none" aria-hidden="true">
                        <circle cx="7.5" cy="7.5" r="5"
                            stroke="currentColor"
                            stroke-width="1.45"
                            stroke-linecap="round"
                            stroke-dasharray="20 12"/>
                    </svg>
                    Generating…
                `
                : `
                    <svg width="14" height="14"
                        viewBox="0 0 15 15"
                        fill="none" aria-hidden="true">
                        <path d="M7.5 1.75L8.15 5.35L11.75 6L8.15 6.65L7.5 10.25L6.85 6.65L3.25 6L6.85 5.35L7.5 1.75Z"
                            stroke="currentColor"
                            stroke-width="1.15"
                            stroke-linejoin="round"/>
                        <path d="M11.5 9.5L11.82 11.18L13.5 11.5L11.82 11.82L11.5 13.5L11.18 11.82L9.5 11.5L11.18 11.18L11.5 9.5Z"
                            stroke="currentColor"
                            stroke-width="0.95"
                            stroke-linejoin="round"/>
                    </svg>
                    Generate Cultural Lens framing
                `;
    }

    if (culturalLensEnrichButton) {
        const remainingUpgrades =
            getMyVersionCulturalLensLanguageUpgradeCandidateIds()
                .length;

        const showCulturalLensEnrichButton =
            ownedSubject &&
            onCulturalLens &&
            !culturalLensFocusOpen &&
            myVersionEditing &&
            (
                remainingUpgrades > 0 ||
                myVersionEnrichingCulturalLens
            );

        culturalLensEnrichButton.hidden =
            !showCulturalLensEnrichButton;

        culturalLensEnrichButton.disabled =
            myVersionSaving ||
            myVersionGeneratingCulturalLensFraming ||
            enrichmentActive;

        culturalLensEnrichButton.setAttribute(
            'aria-busy',
            String(
                myVersionEnrichingCulturalLens
            )
        );

        culturalLensEnrichButton.innerHTML =
            myVersionEnrichingCulturalLens
                ? `
                    <svg class="moment-author-generate-spinner"
                        width="14" height="14"
                        viewBox="0 0 15 15"
                        fill="none" aria-hidden="true">
                        <circle cx="7.5" cy="7.5" r="5"
                            stroke="currentColor"
                            stroke-width="1.45"
                            stroke-linecap="round"
                            stroke-dasharray="20 12"/>
                    </svg>
                    Enriching…
                `
                : `
                    <svg width="14" height="14"
                        viewBox="0 0 15 15"
                        fill="none" aria-hidden="true">
                        <path d="M7.5 1.75L8.15 5.35L11.75 6L8.15 6.65L7.5 10.25L6.85 6.65L3.25 6L6.85 5.35L7.5 1.75Z"
                            stroke="currentColor"
                            stroke-width="1.15"
                            stroke-linejoin="round"/>
                        <path d="M11.5 9.5L11.82 11.18L13.5 11.5L11.82 11.82L11.5 13.5L11.18 11.82L9.5 11.5L11.18 11.18L11.5 9.5Z"
                            stroke="currentColor"
                            stroke-width="0.95"
                            stroke-linejoin="round"/>
                    </svg>
                    Enrich Cultural Lens
                `;
    }

    if (reflectionButton) {
        const showReflectionButton =
            ownedSubject &&
            onReflection &&
            myVersionEditing;

        reflectionButton.hidden =
            !showReflectionButton;

        reflectionButton.disabled =
            myVersionSaving ||
            myVersionGeneratingReflection ||
            enrichmentActive;

        reflectionButton.setAttribute(
            'aria-busy',
            String(
                myVersionGeneratingReflection
            )
        );

        reflectionButton.innerHTML =
            myVersionGeneratingReflection
                ? `
                    <svg class="moment-author-generate-spinner"
                        width="14" height="14"
                        viewBox="0 0 15 15"
                        fill="none" aria-hidden="true">
                        <circle cx="7.5" cy="7.5" r="5"
                            stroke="currentColor"
                            stroke-width="1.45"
                            stroke-linecap="round"
                            stroke-dasharray="20 12"/>
                    </svg>
                    Generating…
                `
                : `
                    <svg width="14" height="14"
                        viewBox="0 0 15 15"
                        fill="none" aria-hidden="true">
                        <path d="M7.5 1.75L8.15 5.35L11.75 6L8.15 6.65L7.5 10.25L6.85 6.65L3.25 6L6.85 5.35L7.5 1.75Z"
                            stroke="currentColor"
                            stroke-width="1.15"
                            stroke-linejoin="round"/>
                        <path d="M11.5 9.5L11.82 11.18L13.5 11.5L11.82 11.82L11.5 13.5L11.18 11.82L9.5 11.5L11.18 11.18L11.5 9.5Z"
                            stroke="currentColor"
                            stroke-width="0.95"
                            stroke-linejoin="round"/>
                    </svg>
                    Generate reflection
                `;
    }

    if (saveButton) {
        saveButton.disabled =
            myVersionSaving ||
            enrichmentActive ||
            !myVersionDirty;

        saveButton.textContent = myVersionSaving
            ? 'Saving…'
            : ownedSubject
                ? 'Save My Subject'
                : 'Save My Version';
    }

    if (cancelButton) {
        cancelButton.disabled =
            myVersionSaving ||
            enrichmentActive;
    }

    updateCoverActionUI();
}

function refreshMyVersionDirtyState(
    overrides = myVersionDraftOverrides,
    draftDocument = myVersionDraftDocument
) {
    myVersionDirty =
        !tutorContentOverridesMatch(
            overrides,
            myVersionOriginalOverrides
        ) ||
        !tutorSubjectDocumentsMatch(
            draftDocument,
            myVersionOriginalDocument
        ) ||
        myVersionIncludesLiveChanges;

    updateMyVersionAuthorBar();
}

function resetMyVersionHistory() {
    myVersionHistory.undo.length = 0;
    myVersionHistory.redo.length = 0;
}

function createMyVersionHistorySnapshot({
    overrides = myVersionDraftOverrides,
    document = myVersionDraftDocument
} = {}) {
    return {
        overrides: cloneTutorContentOverrides(overrides),
        document: normalizeTutorSubjectDocument(document)
    };
}

function recordMyVersionHistory(before, after) {
    myVersionHistory.undo.push({
        before: createMyVersionHistorySnapshot(before),
        after: createMyVersionHistorySnapshot(after)
    });

    if (
        myVersionHistory.undo.length >
        MY_VERSION_HISTORY_LIMIT
    ) {
        myVersionHistory.undo.shift();
    }

    myVersionHistory.redo.length = 0;
}

function applyMyVersionHistorySnapshot(snapshot) {
    const normalized = createMyVersionHistorySnapshot(snapshot);

    myVersionDraftOverrides = normalized.overrides;
    myVersionDraftDocument = normalized.document;

    applyTutorSubjectDocument(myVersionDraftDocument);
    refreshMyVersionDirtyState();
    scheduleMyVersionWorkingDraftSave();
    renderAllTutorContentSurfaces();
}

function undoMyVersionContent() {
    const action = myVersionHistory.undo.pop();

    if (!action) return false;

    myVersionHistory.redo.push(action);
    applyMyVersionHistorySnapshot(action.before);

    return true;
}

function redoMyVersionContent() {
    const action = myVersionHistory.redo.pop();

    if (!action) return false;

    myVersionHistory.undo.push(action);
    applyMyVersionHistorySnapshot(action.after);

    return true;
}

function commitMyVersionDraftContent(fieldKey, value) {
    if (!myVersionEditing || !fieldKey) return false;

    if (!myVersionGeneratingFullSubject) {
        myVersionFullSubjectGenerationError = '';
    }

    const nextValue = String(value ?? '');

    const requiresValue =
        fieldKey === 'module.title' ||
        /^paths\.(discussionTitle|culturalLensTitle|reflectionTitle)$/
            .test(fieldKey) ||
        /^culturalLens\..+\.title$/
            .test(fieldKey) ||
        /^discussion\.set\..+\.makeItReal\.(label|title|prompt)$/
            .test(fieldKey) ||
        /^discussion\..+\.followUp\..+\.prompt$/
            .test(fieldKey) ||
        /^upgrade\.(moment|cultural-lens)\..+\.(term|definition|ordinary|upgraded|atlasPrompt)$/
            .test(fieldKey);

    if (requiresValue && !nextValue.trim()) {
        renderAllTutorContentSurfaces();
        return false;
    }

    const before = createMyVersionHistorySnapshot();
    const beforeOverrides = before.overrides;

    if (
        Object.prototype.hasOwnProperty.call(
            beforeOverrides,
            fieldKey
        ) && beforeOverrides[fieldKey] === nextValue
    ) {
        return false;
    }

    const after = createMyVersionHistorySnapshot({
        overrides: {
            ...beforeOverrides,
            [fieldKey]: nextValue
        },
        document: before.document
    });

    recordMyVersionHistory(before, after);
    myVersionDraftOverrides = after.overrides;
    myVersionDraftDocument = after.document;
    refreshMyVersionDirtyState();
    scheduleMyVersionWorkingDraftSave();
    renderAllTutorContentSurfaces();

    return true;
}

function closeMyVersionStartDialog() {
    const dialog = document.getElementById(
        'atlas-my-version-start-dialog'
    );

    if (!dialog || dialog.hidden) return;

    dialog.hidden = true;

    if (activeFocusTrapRoot === dialog) {
        releaseFocusTrap();
    }
}

function openMyVersionStartDialog() {
    const dialog = document.getElementById(
        'atlas-my-version-start-dialog'
    );

    if (!dialog) return;

    const ownedSubject = isOwnedSubjectRuntime();
    const kicker = dialog.querySelector(
        '.atlas-my-version-dialog-kicker'
    );
    const copy = dialog.querySelector(
        '.atlas-my-version-dialog-copy'
    );

    const count = getLiveTutorContentChangeCount();
    const countLabel = count === 1
        ? '1 Live Change'
        : `${count} Live Changes`;

    if (kicker) {
        kicker.textContent = ownedSubject
            ? 'MY SUBJECT'
            : 'MY VERSION';
    }

    if (copy) {
        copy.textContent = ownedSubject
            ? 'This lesson already has temporary changes. Choose whether they become part of your subject or stay with this learner.'
            : 'This lesson already has temporary changes. Choose what becomes the starting point for your reusable version.';
    }

    setText(
        'atlas-my-version-start-count',
        `${countLabel} for ${currentSession === 'Default'
            ? 'Shared'
            : currentSession}`
    );

    dialog.hidden = false;
    activateFocusTrap(dialog);
}

function beginMyVersionEditing(includeLiveChanges = false) {
    if (myVersionEditing || myVersionSaving) return;

    const shouldStartOnCover =
        !isOwnedSubjectRuntime() &&
        !hasSavedMyVersion();

    const versionOverrides = cloneTutorContentOverrides(
        tutorContentVersion?.overrides
    );

    const liveOverrides = includeLiveChanges
        ? cloneTutorContentOverrides(
            tutorContentLiveDraft?.overrides
        )
        : {};

    myVersionOriginalOverrides = versionOverrides;
    myVersionDraftOverrides = {
        ...versionOverrides,
        ...liveOverrides
    };

    myVersionOriginalDocument =
        getPublishedTutorSubjectDocument();

    myVersionDraftDocument = cloneTutorSubjectDocument(
        myVersionOriginalDocument
    );

    applyTutorSubjectDocument(myVersionDraftDocument);

    myVersionIncludesLiveChanges =
        includeLiveChanges &&
        Object.keys(liveOverrides).length > 0;

    myVersionIncludedLiveSessionId =
        myVersionIncludesLiveChanges
            ? currentSessionId
            : null;

    const expandAuthorBar =
        myVersionExpandBarOnEditStart;

    myVersionExpandBarOnEditStart = false;

    closeMyVersionStartDialog();

    if (shouldStartOnCover) {
        goToView('view-cover');
    }

    myVersionEditing = true;
    myVersionSaving = false;
    resetMyVersionHistory();
    refreshMyVersionDirtyState();
    renderAllTutorContentSurfaces();

    if (expandAuthorBar) {
        setMyVersionAuthorBarMinimized(false);
    }

    saveMyVersionWorkingDraftNow();
}

function openMyVersionSubjectDetailsFromMobile() {
    if (!myVersionEditing || myVersionSaving) {
        return;
    }

    closeMyVersionMobileTools();
    openMyVersionCoverDialog();
}

function requestMyVersionEditing({
    expandAuthorBar = false
} = {}) {
    if (myVersionEditing || myVersionSaving) {
        return;
    }

    myVersionExpandBarOnEditStart =
        Boolean(expandAuthorBar);

    closeMyVersionMobileTools();

    if (getLiveTutorContentChangeCount() > 0) {
        openMyVersionStartDialog();
        return;
    }

    beginMyVersionEditing(false);
}

function finishMyVersionEditingState() {
    clearMyVersionWorkingDraftSaveTimer();
    myVersionPendingWorkingDraftOverrides = null;
    myVersionResumeViewId = null;
    myVersionUpgradeOptionsOpenContextId = null;
    myVersionEditing = false;
    myVersionDraftOverrides = {};
    myVersionOriginalOverrides = {};
    myVersionDraftDocument = null;
    myVersionOriginalDocument = null;
    myVersionDirty = false;
    myVersionIncludesLiveChanges = false;
    myVersionIncludedLiveSessionId = null;
    myVersionSaving = false;
    myVersionGeneratingFullSubject = false;
    myVersionFullSubjectGenerationError = '';
    myVersionFullSubjectGenerationProgress = null;
    myVersionFullSubjectGenerationNotice = '';
    tutorContentWorkingDraft = null;
    applyTutorSubjectDocument(
        getPublishedTutorSubjectDocument()
    );
    resetMyVersionHistory();
    closeMyVersionStartDialog();
    closeMyVersionCoverDialog();
    closeRestoreAtlasOriginalDialog();
    setMyVersionAuthorBarMinimized(true);
    updateMyVersionAuthorBar();
}

async function cancelMyVersionEditing() {
    if (!myVersionEditing || myVersionSaving) return;

    clearMyVersionWorkingDraftSaveTimer();
    myVersionPendingWorkingDraftOverrides = null;

    await tutorContentWriteQueue;

    if (isOwnedSubjectRuntime()) {
        await requireAtlasTutorSubjects()
            .clearWorkingDraft(MODULE.id);
    } else {
        await requireAtlasTutorContent()
            .clearWorkingDraft(getTutorContentId());
    }

    finishMyVersionEditingState();
    renderAllTutorContentSurfaces();
}

async function saveMyVersion() {
    if (
        !myVersionEditing ||
        myVersionSaving ||
        !myVersionDirty
    ) {
        return;
    }

    const activeElement = document.activeElement;

    if (isLiveTutorContentTarget(activeElement)) {
        activeElement.blur();
    }

    normalizeMyVersionQuestionCollectionsForSave();

    await flushMyVersionWorkingDraftSave();
    await tutorContentWriteQueue;

    myVersionSaving = true;
    updateMyVersionAuthorBar();

    const contentId = getTutorContentId();
    const includedSessionId =
        myVersionIncludedLiveSessionId;
    const ownedSubject = isOwnedSubjectRuntime();

    let saved = null;

    if (ownedSubject) {
        const document = materializeTutorSubjectDocument(
            myVersionDraftDocument ||
            getPublishedTutorSubjectDocument(),
            myVersionDraftOverrides,
            'My Subject'
        );

        saved = await requireAtlasTutorSubjects()
            .updateSubject(
                MODULE.id,
                {
                    metadata: {
                        title:
                            String(
                                document.module?.title ||
                                MODULE.title
                            ).trim() || MODULE.title,
                        navTitle:
                            String(
                                document.module?.navTitle ||
                                document.module?.title ||
                                MODULE.navTitle ||
                                MODULE.title
                            ).trim(),
                        description:
                            String(
                                document.module
                                    ?.catalogDescription || ''
                            ).trim(),
                        coverImage:
                            String(
                                document.module?.bgImage || ''
                            ).trim()
                    },
                    document
                }
            );
    } else {
        saved = await requireAtlasTutorContent()
            .saveVersion(
                contentId,
                {
                    baseContentVersion: MODULE.contentVersion,
                    replaceOverrides: true,
                    overrides: myVersionDraftOverrides,
                    document: cloneTutorSubjectDocument(
                        myVersionDraftDocument
                    )
                }
            );
    }

    if (!saved) {
        myVersionSaving = false;
        updateMyVersionAuthorBar();

        const status = document.getElementById(
            'atlas-my-version-status'
        );

        if (status) {
            status.textContent = 'Couldn’t save';
        }

        return;
    }

    if (ownedSubject) {
        syncOwnedSubjectRuntime(saved);
    } else {
        tutorContentVersion = saved;
    }

    if (
        myVersionIncludesLiveChanges &&
        includedSessionId
    ) {
        await requireAtlasTutorContent()
            .clearLiveDraft(
                includedSessionId,
                contentId
            );

        if (includedSessionId === currentSessionId) {
            tutorContentLiveDraft = null;
            clearLiveTutorHistory();
        }
    }

    if (ownedSubject) {
        await requireAtlasTutorSubjects()
            .clearWorkingDraft(MODULE.id);
    } else {
        await requireAtlasTutorContent()
            .clearWorkingDraft(contentId);
    }

    finishMyVersionEditingState();
    renderAllTutorContentSurfaces();
    publishAtlasCompassItem('updated');
}

function handleMyVersionCoverAction() {
    if (!myVersionEditing || myVersionSaving) return;

    if (getActiveCompassViewId() === 'view-cover') {
        openMyVersionCoverDialog();
        return;
    }

    goToView('view-cover');
}

function closeMyVersionCoverDialog() {
    const dialog = document.getElementById(
        'atlas-my-version-cover-dialog'
    );

    if (!dialog || dialog.hidden) return;

    dialog.hidden = true;

    if (activeFocusTrapRoot === dialog) {
        releaseFocusTrap();
    }
}

function closeMyVersionManagementDialog() {
    const dialog = document.getElementById(
        'atlas-my-version-management-dialog'
    );

    if (!dialog || dialog.hidden) return;

    dialog.hidden = true;

    if (activeFocusTrapRoot === dialog) {
        releaseFocusTrap();
    }
}

function openMyVersionManagementDialog() {
    if (
        isOwnedSubjectRuntime() ||
        !myVersionEditing ||
        myVersionSaving ||
        !hasSavedMyVersion()
    ) {
        return;
    }

    const dialog = document.getElementById(
        'atlas-my-version-management-dialog'
    );

    if (!dialog) return;

    closeMyVersionCoverDialog();

    myVersionCreatedSubjectId = null;
    updateCreateSubjectFromMyVersionUI();

    dialog.hidden = false;
    activateFocusTrap(dialog);
}

function returnToMyVersionSubjectDetails() {
    closeMyVersionManagementDialog();

    if (
        myVersionEditing &&
        !myVersionSaving
    ) {
        openMyVersionCoverDialog();
    }
}

function hasUnappliedMyVersionCoverChanges() {
    const imageInput = document.getElementById(
        'atlas-my-version-image-input'
    );

    const descriptionInput = document.getElementById(
        'atlas-my-version-description-input'
    );

    if (!imageInput || !descriptionInput) {
        return false;
    }

    return (
        String(imageInput.value || '').trim() !==
            getEffectiveSubjectCoverImage() ||
        String(descriptionInput.value || '').trim() !==
            getEffectiveSubjectCatalogDescription()
    );
}

function updateCreateSubjectFromMyVersionUI() {
    const applyButton = document.getElementById(
        'atlas-my-version-cover-confirm'
    );

    if (applyButton) {
        applyButton.disabled =
            !hasUnappliedMyVersionCoverChanges() ||
            myVersionSaving;
    }

    const button = document.getElementById(
        'atlas-create-subject-from-version'
    );

    const copy = document.getElementById(
        'atlas-create-subject-from-version-copy'
    );

    const status = document.getElementById(
        'atlas-create-subject-from-version-status'
    );

    const openButton = document.getElementById(
        'atlas-created-subject-open'
    );

    if (!button || !copy) return;

    if (myVersionCreatedSubjectId) {
        button.hidden = true;

        copy.textContent =
            'Your My Version is unchanged.';

        if (status) {
            status.hidden = false;
            status.textContent = '✓ New subject created';
        }

        if (openButton) {
            openButton.hidden = false;
        }

        return;
    }

    button.hidden = false;

    const available =
        !isOwnedSubjectRuntime() &&
        hasSavedMyVersion();

    const hasUnpublishedChanges =
        myVersionDirty ||
        hasUnappliedMyVersionCoverChanges();

    button.textContent = 'Create as new subject';
    button.disabled =
        !available ||
        hasUnpublishedChanges ||
        myVersionSaving;

    if (!available) {
        copy.textContent =
            'Save My Version before creating a separate subject.';
    } else if (hasUnpublishedChanges) {
        copy.textContent =
            'Save My Version first so the new subject includes your latest changes.';
    } else {
        copy.textContent =
            'Keep this saved My Version as a separate subject. Your My Version stays here.';
    }

    if (status) {
        status.hidden = true;
        status.textContent = '';
    }

    if (openButton) {
        openButton.hidden = true;
    }
}

async function createSubjectFromMyVersion() {
    if (
        isOwnedSubjectRuntime() ||
        !myVersionEditing ||
        myVersionSaving ||
        !hasSavedMyVersion()
    ) {
        return;
    }

    const button = document.getElementById(
        'atlas-create-subject-from-version'
    );

    const status = document.getElementById(
        'atlas-create-subject-from-version-status'
    );

    if (
        myVersionDirty ||
        hasUnappliedMyVersionCoverChanges()
    ) {
        updateCreateSubjectFromMyVersionUI();

        if (status) {
            status.hidden = false;
            status.textContent =
                'Apply any detail changes and save My Version first.';
        }

        return;
    }

    if (button) {
        button.disabled = true;
        button.textContent = 'Creating…';
    }

    if (status) {
        status.hidden = true;
        status.textContent = '';
    }

    try {
        const subject =
            await createSubjectFromPublishedMyVersion();

        myVersionCreatedSubjectId = subject.id;

        try {
            publishOwnedSubjectProjection(subject);
        } catch (error) {
            console.warn(
                '[Compass] Created subject could not be projected immediately:',
                error
            );
        }

        updateCreateSubjectFromMyVersionUI();
    } catch (error) {
        console.error(
            '[Compass] Create as new subject failed:',
            error
        );

        myVersionCreatedSubjectId = null;
        updateCreateSubjectFromMyVersionUI();

        if (status) {
            status.hidden = false;
            status.textContent =
                'Couldn’t create the new subject.';
        }
    }
}

function openCreatedSubjectFromMyVersion() {
    if (!myVersionCreatedSubjectId) return;

    const launchUrl = getOwnedSubjectLaunchUrl(
        myVersionCreatedSubjectId
    );

    if (!launchUrl) return;

    window.location.assign(launchUrl);
}

function openMyVersionCoverDialog() {
    if (!myVersionEditing || myVersionSaving) return;

    const dialog = document.getElementById(
        'atlas-my-version-cover-dialog'
    );

    const imageInput = document.getElementById(
        'atlas-my-version-image-input'
    );

    const descriptionInput = document.getElementById(
        'atlas-my-version-description-input'
    );

    const managementEntry = document.getElementById(
        'atlas-my-version-management-entry'
    );

    const error = document.getElementById(
        'atlas-my-version-cover-error'
    );

    if (!dialog || !imageInput || !descriptionInput) return;

    const ownedSubject = isOwnedSubjectRuntime();
    const kicker = dialog.querySelector(
        '.atlas-my-version-dialog-kicker'
    );
    const copy = dialog.querySelector(
        '.atlas-my-version-dialog-copy'
    );

    if (kicker) {
        kicker.textContent = ownedSubject
            ? 'MY SUBJECT'
            : 'MY VERSION';
    }

    if (copy) {
        copy.textContent = ownedSubject
            ? 'Edit the title and hook directly on the cover. These details control how your subject appears in Atlas and Compass.'
            : 'Edit the title and hook directly on the cover. These details control how your version appears in Atlas and Compass.';
    }

    imageInput.value = getEffectiveSubjectCoverImage();
    descriptionInput.value =
        getEffectiveSubjectCatalogDescription();

    myVersionCreatedSubjectId = null;

    if (managementEntry) {
        managementEntry.hidden =
            ownedSubject || !hasSavedMyVersion();
    }

    if (error) {
        error.hidden = true;
        error.textContent = '';
    }

    updateCreateSubjectFromMyVersionUI();

    dialog.hidden = false;
    activateFocusTrap(dialog);
}

function applyMyVersionCoverChanges() {
    if (!myVersionEditing || myVersionSaving) return;

    const imageInput = document.getElementById(
        'atlas-my-version-image-input'
    );

    const descriptionInput = document.getElementById(
        'atlas-my-version-description-input'
    );

    const error = document.getElementById(
        'atlas-my-version-cover-error'
    );

    const image = String(imageInput?.value || '').trim();
    const description = String(
        descriptionInput?.value || ''
    ).trim();

    try {
        const parsed = new URL(image, window.location.href);
        const allowedProtocols = new Set([
            'http:',
            'https:',
            'data:',
            'blob:',
            'file:'
        ]);

        if (!allowedProtocols.has(parsed.protocol)) {
            throw new Error('Unsupported image URL.');
        }
    } catch {
        if (error) {
            error.hidden = false;
            error.textContent =
                'Use a valid image URL or relative image path.';
        }

        return;
    }

    if (image !== getEffectiveSubjectCoverImage()) {
        commitMyVersionDraftContent(
            'module.bgImage',
            image
        );
    }

    if (
        description !==
        getEffectiveSubjectCatalogDescription()
    ) {
        commitMyVersionDraftContent(
            'module.catalogDescription',
            description
        );
    }

    closeMyVersionCoverDialog();
}

function closeRestoreAtlasOriginalDialog() {
    const dialog = document.getElementById(
        'atlas-restore-original-dialog'
    );

    if (!dialog || dialog.hidden) return;

    dialog.hidden = true;

    if (activeFocusTrapRoot === dialog) {
        releaseFocusTrap();
    }
}

function openRestoreAtlasOriginalDialog() {
    if (
        isOwnedSubjectRuntime() ||
        !myVersionEditing ||
        myVersionSaving ||
        !hasSavedMyVersion()
    ) {
        return;
    }

    const dialog = document.getElementById(
        'atlas-restore-original-dialog'
    );

    const restoreButton = document.getElementById(
        'atlas-restore-original-confirm'
    );

    if (!dialog) return;

    closeMyVersionManagementDialog();
    closeMyVersionCoverDialog();

    if (restoreButton) {
        restoreButton.disabled = false;
        restoreButton.textContent = 'Restore original';
    }

    dialog.hidden = false;
    activateFocusTrap(dialog);
}

function cancelRestoreAtlasOriginal() {
    closeRestoreAtlasOriginalDialog();

    if (
        !isOwnedSubjectRuntime() &&
        myVersionEditing &&
        !myVersionSaving &&
        hasSavedMyVersion()
    ) {
        openMyVersionManagementDialog();
    }
}

async function restoreAtlasOriginal() {
    if (
        isOwnedSubjectRuntime() ||
        !myVersionEditing ||
        myVersionSaving ||
        !hasSavedMyVersion()
    ) {
        return;
    }

    const restoreButton = document.getElementById(
        'atlas-restore-original-confirm'
    );

    if (restoreButton) {
        restoreButton.disabled = true;
        restoreButton.textContent = 'Restoring…';
    }

    clearMyVersionWorkingDraftSaveTimer();
    myVersionPendingWorkingDraftOverrides = null;
    myVersionSaving = true;
    updateMyVersionAuthorBar();

    await tutorContentWriteQueue;

    const contentId = getTutorContentId();
    const Store = requireAtlasTutorContent();

    const [versionDeleted] = await Promise.all([
        Store.deleteVersion(contentId),
        Store.clearWorkingDraft(contentId)
    ]);

    if (!versionDeleted) {
        myVersionSaving = false;
        updateMyVersionAuthorBar();

        if (restoreButton) {
            restoreButton.disabled = false;
            restoreButton.textContent = 'Restore original';
        }

        return;
    }

    tutorContentVersion = null;
    tutorContentWorkingDraft = null;
    finishMyVersionEditingState();
    renderAllTutorContentSurfaces();
    publishAtlasCompassItem('restored-original');
}

function isMyVersionUnlockBlockedTarget(target) {
    return Boolean(
        target instanceof Element &&
        target.closest(`
            input,
            textarea,
            select,
            [contenteditable="true"],
            [contenteditable="plaintext-only"]
        `)
    );
}

function clearMyVersionUnlockTimer() {
    if (myVersionUnlockTimer !== null) {
        window.clearTimeout(myVersionUnlockTimer);
        myVersionUnlockTimer = null;
    }
}

function resetMyVersionUnlockKeys() {
    clearMyVersionUnlockTimer();
    myVersionPressedShiftCodes.clear();
    myVersionUnlockConsumed = false;
}

function handleMyVersionUnlockKeyDown(event) {
    if (
        myVersionEditing ||
        myVersionSaving ||
        myVersionUnlockConsumed ||
        isMyVersionUnlockBlockedTarget(event.target) ||
        !['ShiftLeft', 'ShiftRight'].includes(event.code)
    ) {
        return;
    }

    myVersionPressedShiftCodes.add(event.code);

    if (
        myVersionPressedShiftCodes.size !== 2 ||
        myVersionUnlockTimer !== null
    ) {
        return;
    }

    myVersionUnlockTimer = window.setTimeout(() => {
        myVersionUnlockTimer = null;

        if (myVersionPressedShiftCodes.size !== 2) {
            return;
        }

        myVersionUnlockConsumed = true;

        requestMyVersionEditing({
            expandAuthorBar: true
        });
    }, MY_VERSION_UNLOCK_HOLD_MS);
}

function handleMyVersionUnlockKeyUp(event) {
    if (!['ShiftLeft', 'ShiftRight'].includes(event.code)) {
        return;
    }

    myVersionPressedShiftCodes.delete(event.code);
    clearMyVersionUnlockTimer();

    if (myVersionPressedShiftCodes.size < 2) {
        myVersionUnlockConsumed = false;
    }
}

function createTutorAuthoredContentId(prefix) {
    const suffix =
        window.crypto &&
        typeof window.crypto.randomUUID === 'function'
            ? window.crypto.randomUUID()
            : `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 10)}`;

    return `${prefix}-${suffix}`;
}

function getMyVersionDocumentSet(document, setId) {
    return document?.discussionSets?.find(
        set => set.id === setId
    ) || null;
}

function getDiscussionActivityLabel(set) {
    if (!set?.makeItReal) return '';

    const fieldKey = getDiscussionMakeItRealFieldKey(
        set.id,
        'label'
    );

    return resolveTutorContentValue(
        set.makeItReal.label || 'Make It Real',
        fieldKey
    );
}

function getDiscussionMomentFollowUps(moment) {
    if (!moment) return [];

    const source = Array.isArray(moment.followUps)
        ? moment.followUps
        : moment.followUp
            ? [moment.followUp]
            : [];

    return source
        .filter(followUp =>
            followUp &&
            typeof followUp === 'object' &&
            followUp.id &&
            followUp.prompt
        )
        .slice(0, DISCUSSION_FOLLOW_UP_LIMIT);
}

function getDiscussionFollowUpCustomLabel(
    momentId,
    followUp
) {
    if (!followUp?.id) return '';

    const fieldKey = getDiscussionFollowUpFieldKey(
        momentId,
        followUp.id,
        'label'
    );

    return normalizeLiveEditableText(
        resolveTutorContentValue(
            followUp.label || '',
            fieldKey
        ),
        false
    ).slice(0, DISCUSSION_FOLLOW_UP_LABEL_LIMIT);
}

function getDiscussionFollowUpLabel(momentId, followUp) {
    if (!followUp?.id) return '';

    const defaultLabel =
        DISCUSSION_FOLLOW_UP_LABELS[followUp.kind] ||
        'Follow-up';

    if (followUp.kind !== 'custom') {
        return defaultLabel;
    }

    return getDiscussionFollowUpCustomLabel(
        momentId,
        followUp
    ) || defaultLabel;
}

function ensureMyVersionMomentFollowUps(moment) {
    if (!moment) return [];

    if (!Array.isArray(moment.followUps)) {
        moment.followUps = moment.followUp
            ? [moment.followUp]
            : [];
    }

    delete moment.followUp;

    return moment.followUps;
}

function removeMyVersionFollowUpOverrides(
    overrides,
    momentId,
    followUpId
) {
    const prefix = getDiscussionFollowUpFieldKey(
        momentId,
        followUpId,
        ''
    );

    Object.keys(overrides).forEach(fieldKey => {
        if (fieldKey.startsWith(prefix)) {
            delete overrides[fieldKey];
        }
    });
}

function removeMyVersionSetActivityOverrides(
    overrides,
    setId
) {
    const prefix =
        `discussion.set.${setId}.makeItReal.`;

    Object.keys(overrides).forEach(fieldKey => {
        if (fieldKey.startsWith(prefix)) {
            delete overrides[fieldKey];
        }
    });
}

function removeMyVersionMomentOverrides(
    overrides,
    momentId
) {
    const prefixes = [
        `discussion.${momentId}.`,
        `upgrade.moment.${momentId}.`
    ];

    Object.keys(overrides).forEach(fieldKey => {
        if (prefixes.some(prefix => fieldKey.startsWith(prefix))) {
            delete overrides[fieldKey];
        }
    });
}

function getUpgradeContextIdentity(contextId) {
    const value = String(contextId || '');

    if (value.startsWith('moment-')) {
        return {
            sourceKind: 'moment',
            sourceElementId: value.slice('moment-'.length)
        };
    }

    if (value.startsWith('cl-')) {
        return {
            sourceKind: 'cultural-lens',
            sourceElementId: value.slice('cl-'.length)
        };
    }

    return null;
}

function getMyVersionUpgradeTarget(document, contextId) {
    const identity = getUpgradeContextIdentity(contextId);

    if (!identity) return null;

    if (identity.sourceKind === 'moment') {
        return getMyVersionDocumentMoment(
            document,
            identity.sourceElementId
        )?.moment || null;
    }

    return document?.culturalLensCards?.find(
        card => card.id === identity.sourceElementId
    ) || null;
}

function removeMyVersionUpgradeOverrides(
    overrides,
    contextId,
    fields = null
) {
    const identity = getUpgradeContextIdentity(contextId);

    if (!identity) return;

    const prefix = [
        'upgrade',
        identity.sourceKind,
        identity.sourceElementId,
        ''
    ].join('.');

    Object.keys(overrides).forEach(fieldKey => {
        if (!fieldKey.startsWith(prefix)) return;

        if (!Array.isArray(fields)) {
            delete overrides[fieldKey];
            return;
        }

        const field = fieldKey.slice(prefix.length);

        if (fields.includes(field)) {
            delete overrides[fieldKey];
        }
    });
}

function refreshMyVersionUpgradeFocus(
    contextId,
    isOpen
) {
    const identity = getUpgradeContextIdentity(contextId);

    if (!identity) return;

    if (
        identity.sourceKind === 'moment' &&
        getDiscussionFocusMoment()?.id ===
            identity.sourceElementId
    ) {
        discussionFocusUpgradeOpen = Boolean(isOpen);
        renderDiscussionFocus();
    }

    if (
        identity.sourceKind === 'cultural-lens' &&
        getCurrentCulturalLensCard()?.id ===
            identity.sourceElementId
    ) {
        culturalLensFocusUpgradeOpen = Boolean(isOpen);
        renderCulturalLensFocus();
    }

    if (!isOpen) return;

    requestAnimationFrame(() => {
        const titleId = identity.sourceKind === 'moment'
            ? 'discussion-focus-title'
            : 'cultural-lens-focus-title';

        document.getElementById(titleId)?.focus({
            preventScroll: true
        });
    });
}

function addMyVersionUpgrade(contextId) {
    const added = commitMyVersionDocumentMutation(
        document => {
            const target = getMyVersionUpgradeTarget(
                document,
                contextId
            );

            if (!target || target.upgrade) {
                return null;
            }

            target.upgrade = {
                term: 'New expression',
                type: 'expression',
                definition: 'Add a clear meaning.',
                priority: 'key'
            };

            return { contextId };
        }
    );

    if (!added) return;

    refreshMyVersionUpgradeFocus(contextId, true);
}

function removeMyVersionUpgrade(contextId) {
    const removed = commitMyVersionDocumentMutation(
        (document, overrides) => {
            const target = getMyVersionUpgradeTarget(
                document,
                contextId
            );

            if (!target?.upgrade) {
                return null;
            }

            delete target.upgrade;

            removeMyVersionUpgradeOverrides(
                overrides,
                contextId
            );

            return { contextId };
        }
    );

    if (!removed) return;

    myVersionUpgradeOptionsOpenContextId = null;
    refreshMyVersionUpgradeFocus(contextId, false);
}

function addMyVersionUpgradeExamples(contextId) {
    commitMyVersionDocumentMutation(document => {
        const target = getMyVersionUpgradeTarget(
            document,
            contextId
        );

        if (
            !target?.upgrade ||
            target.upgrade.ordinary ||
            target.upgrade.upgraded
        ) {
            return null;
        }

        target.upgrade.ordinary =
            '“Add the ordinary version.”';

        target.upgrade.upgraded =
            '“Rewrite it with the new expression.”';

        return { contextId };
    });
}

function removeMyVersionUpgradeExamples(contextId) {
    commitMyVersionDocumentMutation(
        (document, overrides) => {
            const target = getMyVersionUpgradeTarget(
                document,
                contextId
            );

            if (!target?.upgrade) return null;

            const hadExamples = Boolean(
                target.upgrade.ordinary ||
                target.upgrade.upgraded
            );

            if (!hadExamples) return null;

            delete target.upgrade.ordinary;
            delete target.upgrade.upgraded;

            removeMyVersionUpgradeOverrides(
                overrides,
                contextId,
                [
                    'ordinary',
                    'upgraded',
                    'insteadOfLabel',
                    'tryLabel'
                ]
            );

            return { contextId };
        }
    );
}

function addMyVersionUpgradeReviewPrompt(contextId) {
    myVersionUpgradeOptionsOpenContextId = contextId;

    commitMyVersionDocumentMutation(document => {
        const target = getMyVersionUpgradeTarget(
            document,
            contextId
        );

        if (
            !target?.upgrade ||
            target.upgrade.atlasPrompt
        ) {
            return null;
        }

        target.upgrade.atlasPrompt =
            'How could the learner use this expression in a new situation?';

        return { contextId };
    });
}

function removeMyVersionUpgradeReviewPrompt(contextId) {
    myVersionUpgradeOptionsOpenContextId = contextId;

    commitMyVersionDocumentMutation(
        (document, overrides) => {
            const target = getMyVersionUpgradeTarget(
                document,
                contextId
            );

            if (!target?.upgrade?.atlasPrompt) {
                return null;
            }

            delete target.upgrade.atlasPrompt;

            removeMyVersionUpgradeOverrides(
                overrides,
                contextId,
                ['atlasPrompt']
            );

            return { contextId };
        }
    );
}

function changeMyVersionUpgradePriority(
    contextId,
    priority
) {
    if (
        !Object.prototype.hasOwnProperty.call(
            MY_VERSION_UPGRADE_PRIORITIES,
            priority
        )
    ) {
        return;
    }

    myVersionUpgradeOptionsOpenContextId = contextId;

    commitMyVersionDocumentMutation(document => {
        const target = getMyVersionUpgradeTarget(
            document,
            contextId
        );

        if (
            !target?.upgrade ||
            target.upgrade.priority === priority
        ) {
            return null;
        }

        target.upgrade.priority = priority;

        return { contextId };
    });
}

function setMyVersionUpgradeOptionsOpen(
    contextId,
    isOpen
) {
    myVersionUpgradeOptionsOpenContextId = isOpen
        ? contextId
        : null;
}

function materializeMyVersionMoment(moment) {
    const copy = cloneTutorSubjectDocument(moment);

    if (!copy) return null;

    copy.preview = resolveTutorContentValue(
        moment.preview,
        getDiscussionPreviewFieldKey(moment.id)
    );

    copy.question = resolveTutorContentValue(
        moment.question,
        getDiscussionQuestionFieldKey(moment.id)
    );

    const followUps = getDiscussionMomentFollowUps(moment);

    delete copy.followUp;

    if (followUps.length) {
        copy.followUps = followUps.map(followUp => ({
            ...cloneTutorSubjectDocument(followUp),
            label: getDiscussionFollowUpLabel(
                moment.id,
                followUp
            ),
            prompt: resolveTutorContentValue(
                followUp.prompt,
                getDiscussionFollowUpFieldKey(
                    moment.id,
                    followUp.id
                )
            )
        }));
    } else {
        delete copy.followUps;
    }

    if (moment.upgrade) {
        const source = {
            sourceKind: 'moment',
            sourceElementId: moment.id,
            upgrade: moment.upgrade
        };

        [
            'term',
            'type',
            'definition',
            'ordinary',
            'upgraded',
            'atlasPrompt'
        ].forEach(field => {
            if (
                moment.upgrade[field] !== null &&
                moment.upgrade[field] !== undefined
            ) {
                copy.upgrade[field] = resolveTutorContentValue(
                    moment.upgrade[field],
                    getUpgradeFieldKey(source, field)
                );
            }
        });

        copy.upgrade.insteadOfLabel =
            resolveTutorContentValue(
                'Instead of',
                getUpgradeFieldKey(
                    source,
                    'insteadOfLabel'
                )
            );

        copy.upgrade.tryLabel =
            resolveTutorContentValue(
                'Try',
                getUpgradeFieldKey(source, 'tryLabel')
            );
    }

    return copy;
}

function commitMyVersionDocumentMutation(mutator) {
    if (
        !myVersionEditing ||
        myVersionSaving ||
        typeof mutator !== 'function'
    ) {
        return null;
    }

    if (!myVersionGeneratingFullSubject) {
        myVersionFullSubjectGenerationError = '';
    }

    const before = createMyVersionHistorySnapshot();
    const nextDocument = cloneTutorSubjectDocument(
        before.document
    );

    const nextOverrides = cloneTutorContentOverrides(
        before.overrides
    );

    const result = mutator(
        nextDocument,
        nextOverrides
    );

    if (!result) return null;

    const after = createMyVersionHistorySnapshot({
        overrides: nextOverrides,
        document: nextDocument
    });

    if (
        tutorContentOverridesMatch(
            before.overrides,
            after.overrides
        ) &&
        tutorSubjectDocumentsMatch(
            before.document,
            after.document
        )
    ) {
        return null;
    }

    recordMyVersionHistory(before, after);
    myVersionDraftOverrides = after.overrides;
    myVersionDraftDocument = after.document;

    applyTutorSubjectDocument(myVersionDraftDocument);
    refreshMyVersionDirtyState();
    scheduleMyVersionWorkingDraftSave();
    renderAllTutorContentSurfaces();

    return result;
}

function getMyVersionDocumentCulturalLensCard(
    document,
    cardId
) {
    return document?.culturalLensCards?.find(
        card => card.id === cardId
    ) || null;
}

function removeMyVersionCulturalLensQuestionOverrides(
    overrides,
    cardId
) {
    const prefixes = [
        `culturalLens.${cardId}.mainQuestion`,
        `culturalLens.${cardId}.questions.`
    ];

    Object.keys(overrides).forEach(fieldKey => {
        if (prefixes.some(prefix =>
            fieldKey.startsWith(prefix)
        )) {
            delete overrides[fieldKey];
        }
    });
}

function getCulturalLensQuestionEntries(card) {
    if (!card) return [];

    if (Array.isArray(card.questions)) {
        return card.questions.map((question, index) => ({
            index,
            originalValue: question,
            fieldKey: getCulturalLensQuestionFieldKey(
                card.id,
                index
            )
        }));
    }

    if (
        typeof card.mainQuestion === 'string' &&
        card.mainQuestion.trim()
    ) {
        return [{
            index: 0,
            originalValue: card.mainQuestion,
            fieldKey: getCulturalLensFieldKey(
                card.id,
                'mainQuestion'
            )
        }];
    }

    return [];
}

function materializeMyVersionCulturalLensQuestions(
    card,
    overrides
) {
    if (!card) return [];

    const questions = getCulturalLensQuestionEntries(card)
        .map(entry => resolveTutorContentValue(
            entry.originalValue,
            entry.fieldKey
        ));

    card.questions = questions;
    delete card.mainQuestion;

    removeMyVersionCulturalLensQuestionOverrides(
        overrides,
        card.id
    );

    return card.questions;
}

function removeMyVersionReflectionQuestionOverrides(
    overrides
) {
    const prefix = 'reflection.questions.';

    Object.keys(overrides).forEach(fieldKey => {
        if (fieldKey.startsWith(prefix)) {
            delete overrides[fieldKey];
        }
    });
}

function materializeMyVersionReflectionQuestions(
    document,
    overrides
) {
    const reflection = document?.subjectCopy?.reflection;

    if (!reflection) return [];

    const source = Array.isArray(reflection.questions)
        ? reflection.questions
        : [];

    const questions = source.map((question, index) =>
        resolveTutorContentValue(
            question,
            getReflectionQuestionFieldKey(index)
        )
    );

    reflection.questions = questions;
    removeMyVersionReflectionQuestionOverrides(overrides);

    return reflection.questions;
}

function removeMyVersionCulturalLensThreadOverrides(
    overrides,
    cardId
) {
    const prefix =
        `culturalLens.${cardId}.followTheThread.`;

    Object.keys(overrides).forEach(fieldKey => {
        if (fieldKey.startsWith(prefix)) {
            delete overrides[fieldKey];
        }
    });
}

function materializeMyVersionCulturalLensThread(
    card,
    overrides
) {
    if (!card) return [];

    const source = Array.isArray(card.followTheThread)
        ? card.followTheThread
        : [];

    const questions = source.map((question, index) =>
        resolveTutorContentValue(
            question,
            getCulturalLensThreadFieldKey(
                card.id,
                index
            )
        )
    );

    card.followTheThread = questions;

    removeMyVersionCulturalLensThreadOverrides(
        overrides,
        card.id
    );

    return card.followTheThread;
}

function removeMyVersionCulturalLensCardOverrides(
    overrides,
    card
) {
    if (!card?.id) return;

    const prefix = `culturalLens.${card.id}.`;

    Object.keys(overrides).forEach(fieldKey => {
        if (fieldKey.startsWith(prefix)) {
            delete overrides[fieldKey];
        }
    });

    removeMyVersionUpgradeOverrides(
        overrides,
        `cl-${card.id}`
    );
}

function materializeMyVersionCulturalLensCard(card) {
    const copy = cloneTutorSubjectDocument(card);

    if (!copy) return null;

    [
        'contextLine',
        'title',
        'teaser',
        'context'
    ].forEach(field => {
        copy[field] = resolveTutorContentValue(
            card[field],
            getCulturalLensFieldKey(card.id, field)
        );
    });

    const mainQuestions = getCulturalLensQuestionEntries(card)
        .map(entry => resolveTutorContentValue(
            entry.originalValue,
            entry.fieldKey
        ))
        .filter(question => question.trim());

    delete copy.mainQuestion;

    if (mainQuestions.length) {
        copy.questions = mainQuestions;

        copy.questionLabel = resolveTutorContentValue(
            card.questionLabel ?? 'Question',
            getCulturalLensFieldKey(
                card.id,
                'questionLabel'
            )
        );
    } else {
        delete copy.questions;
        delete copy.questionLabel;
    }

    copy.followTheThreadLabel =
        resolveTutorContentValue(
            card.followTheThreadLabel ??
                'Follow the Thread',
            getCulturalLensFieldKey(
                card.id,
                'followTheThreadLabel'
            )
        );

    const threadQuestions = Array.isArray(
        card.followTheThread
    )
        ? card.followTheThread
            .map((question, index) =>
                resolveTutorContentValue(
                    question,
                    getCulturalLensThreadFieldKey(
                        card.id,
                        index
                    )
                )
            )
            .filter(question => question.trim())
        : [];

    if (threadQuestions.length) {
        copy.followTheThread = threadQuestions;
    } else {
        delete copy.followTheThread;
        delete copy.followTheThreadLabel;
    }

    const upgrade = getEffectiveUpgradeSourceFromContextId(
        `cl-${card.id}`
    )?.upgrade;

    if (upgrade) {
        copy.upgrade = cloneTutorSubjectDocument(upgrade);
    } else {
        delete copy.upgrade;
    }

    return copy;
}

function getPristineMyVersionCulturalLensStarter() {
    if (
        !isOwnedSubjectRuntime() ||
        clCards.length !== 1
    ) {
        return null;
    }

    const source = clCards[0];
    const card =
        materializeMyVersionCulturalLensCard(
            source
        );

    if (!card) return null;

    const starter =
        requireAtlasStructuredSubject()
            .createCulturalLensCard({
                id: source.id
            });

    const questions =
        Array.isArray(card.questions)
            ? card.questions
            : [];

    const followTheThread =
        Array.isArray(card.followTheThread)
            ? card.followTheThread
            : [];

    const pristine =
        card.title === starter.title &&
        card.contextLine === starter.contextLine &&
        card.teaser === starter.teaser &&
        card.context === starter.context &&
        questions.length ===
            starter.questions.length &&
        questions.every(
            (question, index) =>
                question === starter.questions[index]
        ) &&
        (
            card.questionLabel === undefined ||
            card.questionLabel === 'Question'
        ) &&
        followTheThread.length === 0 &&
        !card.upgrade;

    return pristine
        ? source
        : null;
}

function assignFreshMyVersionCulturalLensCardId(card) {
    const copy = cloneTutorSubjectDocument(card);

    if (!copy) return null;

    copy.id = createTutorAuthoredContentId(
        'cultural-lens-card'
    );

    return copy;
}

function insertMyVersionCulturalLensCard(
    card,
    { replaceStarter = false } = {}
) {
    const nativeCard =
        cloneTutorSubjectDocument(card);

    if (
        !nativeCard ||
        typeof nativeCard.id !== 'string' ||
        !nativeCard.id.trim() ||
        typeof nativeCard.title !== 'string' ||
        typeof nativeCard.contextLine !== 'string' ||
        typeof nativeCard.teaser !== 'string' ||
        typeof nativeCard.context !== 'string' ||
        !Array.isArray(nativeCard.questions) ||
        !Array.isArray(nativeCard.followTheThread)
    ) {
        return null;
    }

    const starterCard =
        replaceStarter
            ? getPristineMyVersionCulturalLensStarter()
            : null;

    const added = commitMyVersionDocumentMutation(
        (document, overrides) => {
            if (
                document.culturalLensCards.some(
                    item => item.id === nativeCard.id
                )
            ) {
                return null;
            }

            if (starterCard) {
                const starterIndex =
                    document.culturalLensCards.findIndex(
                        item => item.id === starterCard.id
                    );

                if (starterIndex >= 0) {
                    const [removedCard] =
                        document.culturalLensCards.splice(
                            starterIndex,
                            1,
                            nativeCard
                        );

                    removeMyVersionCulturalLensCardOverrides(
                        overrides,
                        removedCard
                    );

                    return {
                        cardId: nativeCard.id
                    };
                }
            }

            document.culturalLensCards.push(
                nativeCard
            );

            return {
                cardId: nativeCard.id
            };
        }
    );

    if (!added) return null;

    return nativeCard;
}

function addMyVersionCulturalLensCard() {
    const starterCard =
        getPristineMyVersionCulturalLensStarter();

    if (starterCard) {
        const index = clCards.findIndex(
            card => card.id === starterCard.id
        );

        if (index >= 0) {
            openCulturalLensFocus(index);
        }

        return starterCard;
    }

    const nativeCard =
        requireAtlasStructuredSubject()
            .createCulturalLensCard();

    return insertMyVersionCulturalLensCard(
        nativeCard
    );
}

async function generateMyVersionSubjectFraming(
    brief = ''
) {
    if (
        !myVersionEditing ||
        myVersionSaving ||
        !isOwnedSubjectRuntime()
    ) {
        return null;
    }

    const generated =
        await requireAtlasAI()
            .generateSubjectFraming({
                subject: {
                    title:
                        getEffectiveSubjectTitle()
                },

                brief:
                    String(
                        brief || ''
                    ).trim()
            });

    return commitMyVersionDocumentMutation(
        (document, overrides) => {
            if (
                !document.module ||
                typeof document.module !== 'object' ||
                Array.isArray(document.module) ||
                !document.subjectCopy ||
                typeof document.subjectCopy !== 'object' ||
                Array.isArray(document.subjectCopy)
            ) {
                return null;
            }

            document.subjectCopy.cover =
                document.subjectCopy.cover &&
                typeof document.subjectCopy.cover === 'object' &&
                !Array.isArray(
                    document.subjectCopy.cover
                )
                    ? document.subjectCopy.cover
                    : {};

            document.module.catalogDescription =
                generated.catalogDescription;

            document.subjectCopy.cover.hook =
                generated.hook;

            delete overrides[
                'module.catalogDescription'
            ];

            delete overrides[
                'cover.hook'
            ];

            return {
                catalogDescription:
                    generated.catalogDescription,

                hook:
                    generated.hook
            };
        }
    );
}

async function generateMyVersionSubjectFramingFromUI() {
    if (
        !myVersionEditing ||
        myVersionSaving ||
        !isOwnedSubjectRuntime() ||
        myVersionGeneratingSubjectFraming
    ) {
        return null;
    }

    myVersionSubjectFramingGenerationError = '';
    myVersionGeneratingSubjectFraming = true;

    updateMyVersionAuthorBar();

    try {
        const framing =
            await generateMyVersionSubjectFraming();

        if (!framing) {
            throw new Error(
                'Atlas AI did not create subject framing.'
            );
        }

        return framing;
    } catch (error) {
        console.error(
            '[Compass] AI subject framing generation failed:',
            error
        );

        if (myVersionEditing) {
            myVersionSubjectFramingGenerationError =
                'Couldn’t generate framing. Try again.';
        }

        return null;
    } finally {
        myVersionGeneratingSubjectFraming = false;

        if (myVersionEditing) {
            updateMyVersionAuthorBar();
        }
    }
}

async function generateMyVersionOverview(
    brief = ''
) {
    if (
        !myVersionEditing ||
        myVersionSaving ||
        !isOwnedSubjectRuntime()
    ) {
        return null;
    }

    const generated =
        await requireAtlasAI()
            .generateOverview({
                subject: {
                    title:
                        getEffectiveSubjectTitle(),

                    description:
                        getEffectiveSubjectCatalogDescription(),

                    hook:
                        resolveTutorContentValue(
                            subjectCopy.cover?.hook || '',
                            'cover.hook'
                        ).trim()
                },

                brief:
                    String(
                        brief || ''
                    ).trim()
            });

    return commitMyVersionDocumentMutation(
        (document, overrides) => {
            if (
                !document.subjectCopy ||
                typeof document.subjectCopy !== 'object' ||
                Array.isArray(document.subjectCopy)
            ) {
                return null;
            }

            document.subjectCopy.overview =
                document.subjectCopy.overview &&
                typeof document.subjectCopy.overview === 'object' &&
                !Array.isArray(
                    document.subjectCopy.overview
                )
                    ? document.subjectCopy.overview
                    : {};

            document.subjectCopy.overview.heading =
                generated.heading;

            document.subjectCopy.overview.intro = [
                generated.intro
            ];

            document.subjectCopy.overview.question =
                generated.question;

            delete overrides[
                'overview.heading'
            ];

            delete overrides[
                'overview.question'
            ];

            Object.keys(overrides)
                .forEach(fieldKey => {
                    if (
                        fieldKey.startsWith(
                            'overview.intro.'
                        )
                    ) {
                        delete overrides[fieldKey];
                    }
                });

            return {
                heading:
                    generated.heading,

                intro:
                    generated.intro,

                question:
                    generated.question
            };
        }
    );
}

async function generateMyVersionOverviewFromUI() {
    if (
        !myVersionEditing ||
        myVersionSaving ||
        !isOwnedSubjectRuntime() ||
        myVersionGeneratingOverview
    ) {
        return null;
    }

    myVersionOverviewGenerationError = '';
    myVersionGeneratingOverview = true;

    updateMyVersionAuthorBar();

    try {
        const overview =
            await generateMyVersionOverview();

        if (!overview) {
            throw new Error(
                'Atlas AI did not create an Overview.'
            );
        }

        return overview;
    } catch (error) {
        console.error(
            '[Compass] AI Overview generation failed:',
            error
        );

        if (myVersionEditing) {
            myVersionOverviewGenerationError =
                'Couldn’t generate the overview. Try again.';
        }

        return null;
    } finally {
        myVersionGeneratingOverview = false;

        if (myVersionEditing) {
            updateMyVersionAuthorBar();
        }
    }
}

async function generateMyVersionDiscussionFraming(
    brief = ''
) {
    if (
        !myVersionEditing ||
        myVersionSaving ||
        !isOwnedSubjectRuntime()
    ) {
        return null;
    }

    const overview =
        subjectCopy.overview || {};

    const overviewIntro =
        Array.isArray(overview.intro)
            ? overview.intro
                .map((paragraph, index) =>
                    resolveTutorContentValue(
                        paragraph,
                        `overview.intro.${index}`
                    ).trim()
                )
                .filter(Boolean)
                .join('\n\n')
            : '';

    const generated =
        await requireAtlasAI()
            .generateDiscussionFraming({
                subject: {
                    title:
                        getEffectiveSubjectTitle(),

                    description:
                        getEffectiveSubjectCatalogDescription(),

                    hook:
                        resolveTutorContentValue(
                            subjectCopy.cover?.hook || '',
                            'cover.hook'
                        ).trim()
                },

                overview: {
                    heading:
                        resolveTutorContentValue(
                            overview.heading || '',
                            'overview.heading'
                        ).trim(),

                    intro:
                        overviewIntro,

                    question:
                        resolveTutorContentValue(
                            overview.question || '',
                            'overview.question'
                        ).trim()
                },

                brief:
                    String(
                        brief || ''
                    ).trim()
            });

    return commitMyVersionDocumentMutation(
        (document, overrides) => {
            if (
                !document.subjectCopy ||
                typeof document.subjectCopy !== 'object' ||
                Array.isArray(document.subjectCopy)
            ) {
                return null;
            }

            document.subjectCopy.discussion =
                document.subjectCopy.discussion &&
                typeof document.subjectCopy.discussion === 'object' &&
                !Array.isArray(
                    document.subjectCopy.discussion
                )
                    ? document.subjectCopy.discussion
                    : {};

            document.subjectCopy.discussion.heading =
                generated.heading;

            document.subjectCopy.discussion.intro =
                generated.intro;

            document.subjectCopy.paths =
                document.subjectCopy.paths &&
                typeof document.subjectCopy.paths === 'object' &&
                !Array.isArray(
                    document.subjectCopy.paths
                )
                    ? document.subjectCopy.paths
                    : {};

            document.subjectCopy.paths.discussionDescription =
                generated.pathDescription;

            delete overrides[
                'discussion.heading'
            ];

            delete overrides[
                'discussion.intro'
            ];

            delete overrides[
                'paths.discussionDescription'
            ];

            return {
                heading:
                    generated.heading,

                intro:
                    generated.intro,

                pathDescription:
                    generated.pathDescription
            };
        }
    );
}

async function generateMyVersionDiscussionFramingFromUI() {
    if (
        !myVersionEditing ||
        myVersionSaving ||
        !isOwnedSubjectRuntime() ||
        myVersionGeneratingDiscussionFraming
    ) {
        return null;
    }

    myVersionDiscussionFramingGenerationError = '';
    myVersionGeneratingDiscussionFraming = true;

    updateMyVersionAuthorBar();

    try {
        const framing =
            await generateMyVersionDiscussionFraming();

        if (!framing) {
            throw new Error(
                'Atlas AI did not create Discussion framing.'
            );
        }

        return framing;
    } catch (error) {
        console.error(
            '[Compass] AI Discussion framing generation failed:',
            error
        );

        if (myVersionEditing) {
            myVersionDiscussionFramingGenerationError =
                'Couldn’t generate Discussion framing. Try again.';
        }

        return null;
    } finally {
        myVersionGeneratingDiscussionFraming = false;

        if (myVersionEditing) {
            updateMyVersionAuthorBar();
        }
    }
}

async function generateMyVersionCulturalLensFraming(
    brief = ''
) {
    if (
        !myVersionEditing ||
        myVersionSaving ||
        !isOwnedSubjectRuntime()
    ) {
        return null;
    }

    const overview =
        subjectCopy.overview || {};

    const overviewIntro =
        Array.isArray(overview.intro)
            ? overview.intro
                .map((paragraph, index) =>
                    resolveTutorContentValue(
                        paragraph,
                        `overview.intro.${index}`
                    ).trim()
                )
                .filter(Boolean)
                .join('\n\n')
            : '';

    const generated =
        await requireAtlasAI()
            .generateCulturalLensFraming({
                subject: {
                    title:
                        getEffectiveSubjectTitle(),

                    description:
                        getEffectiveSubjectCatalogDescription(),

                    hook:
                        resolveTutorContentValue(
                            subjectCopy.cover?.hook || '',
                            'cover.hook'
                        ).trim()
                },

                overview: {
                    heading:
                        resolveTutorContentValue(
                            overview.heading || '',
                            'overview.heading'
                        ).trim(),

                    intro:
                        overviewIntro,

                    question:
                        resolveTutorContentValue(
                            overview.question || '',
                            'overview.question'
                        ).trim()
                },

                brief:
                    String(
                        brief || ''
                    ).trim()
            });

    return commitMyVersionDocumentMutation(
        (document, overrides) => {
            if (
                !document.subjectCopy ||
                typeof document.subjectCopy !== 'object' ||
                Array.isArray(document.subjectCopy)
            ) {
                return null;
            }

            document.subjectCopy.culturalLens =
                document.subjectCopy.culturalLens &&
                typeof document.subjectCopy.culturalLens === 'object' &&
                !Array.isArray(
                    document.subjectCopy.culturalLens
                )
                    ? document.subjectCopy.culturalLens
                    : {};

            document.subjectCopy.culturalLens.heading =
                generated.heading;

            document.subjectCopy.culturalLens.intro =
                generated.intro;

            document.subjectCopy.paths =
                document.subjectCopy.paths &&
                typeof document.subjectCopy.paths === 'object' &&
                !Array.isArray(
                    document.subjectCopy.paths
                )
                    ? document.subjectCopy.paths
                    : {};

            document.subjectCopy.paths.culturalLensDescription =
                generated.pathDescription;

            delete overrides[
                'culturalLens.heading'
            ];

            delete overrides[
                'culturalLens.intro'
            ];

            delete overrides[
                'paths.culturalLensDescription'
            ];

            return {
                heading:
                    generated.heading,

                intro:
                    generated.intro,

                pathDescription:
                    generated.pathDescription
            };
        }
    );
}

async function generateMyVersionCulturalLensFramingFromUI() {
    if (
        !myVersionEditing ||
        myVersionSaving ||
        !isOwnedSubjectRuntime() ||
        myVersionGeneratingCulturalLensFraming
    ) {
        return null;
    }

    myVersionCulturalLensFramingGenerationError = '';
    myVersionGeneratingCulturalLensFraming = true;

    updateMyVersionAuthorBar();

    try {
        const framing =
            await generateMyVersionCulturalLensFraming();

        if (!framing) {
            throw new Error(
                'Atlas AI did not create Cultural Lens framing.'
            );
        }

        return framing;
    } catch (error) {
        console.error(
            '[Compass] AI Cultural Lens framing generation failed:',
            error
        );

        if (myVersionEditing) {
            myVersionCulturalLensFramingGenerationError =
                'Couldn’t generate Cultural Lens framing. Try again.';
        }

        return null;
    } finally {
        myVersionGeneratingCulturalLensFraming = false;

        if (myVersionEditing) {
            updateMyVersionAuthorBar();
        }
    }
}

async function generateMyVersionReflection(
    brief = ''
) {
    if (
        !myVersionEditing ||
        myVersionSaving ||
        !isOwnedSubjectRuntime()
    ) {
        return null;
    }

    const overview =
        subjectCopy.overview || {};

    const discussion =
        subjectCopy.discussion || {};

    const culturalLens =
        subjectCopy.culturalLens || {};

    const overviewIntro =
        Array.isArray(overview.intro)
            ? overview.intro
                .map((paragraph, index) =>
                    resolveTutorContentValue(
                        paragraph,
                        `overview.intro.${index}`
                    ).trim()
                )
                .filter(Boolean)
                .join('\n\n')
            : '';

    const starterSet =
        getPristineMyVersionDiscussionStarter();

    const existingSets =
        discussionSets
            .map(set =>
                materializeMyVersionDiscussionSet(
                    set
                )
            )
            .filter(Boolean)
            .filter(set =>
                !starterSet ||
                set.id !== starterSet.id
            )
            .map(set => ({
                title:
                    String(
                        set.title || ''
                    ).trim(),

                stage:
                    String(
                        set.stage || ''
                    ).trim(),

                description:
                    String(
                        set.description || ''
                    ).trim(),

                moments:
                    Array.isArray(set.moments)
                        ? set.moments.map(moment => ({
                            preview:
                                String(
                                    moment.preview || ''
                                ).trim(),

                            question:
                                String(
                                    moment.question || ''
                                ).trim()
                        }))
                        : []
            }));

    const starterCard =
        getPristineMyVersionCulturalLensStarter();

    const existingCards =
        clCards
            .map(card =>
                materializeMyVersionCulturalLensCard(
                    card
                )
            )
            .filter(Boolean)
            .filter(card =>
                !starterCard ||
                card.id !== starterCard.id
            )
            .map(card => ({
                title:
                    String(
                        card.title || ''
                    ).trim(),

                contextLine:
                    String(
                        card.contextLine || ''
                    ).trim(),

                teaser:
                    String(
                        card.teaser || ''
                    ).trim(),

                questions:
                    Array.isArray(card.questions)
                        ? card.questions
                            .map(question =>
                                String(
                                    question || ''
                                ).trim()
                            )
                            .filter(Boolean)
                        : []
            }));

    const generated =
        await requireAtlasAI()
            .generateReflection({
                subject: {
                    title:
                        getEffectiveSubjectTitle(),

                    description:
                        getEffectiveSubjectCatalogDescription(),

                    hook:
                        resolveTutorContentValue(
                            subjectCopy.cover?.hook || '',
                            'cover.hook'
                        ).trim()
                },

                overview: {
                    heading:
                        resolveTutorContentValue(
                            overview.heading || '',
                            'overview.heading'
                        ).trim(),

                    intro:
                        overviewIntro,

                    question:
                        resolveTutorContentValue(
                            overview.question || '',
                            'overview.question'
                        ).trim()
                },

                discussion: {
                    heading:
                        resolveTutorContentValue(
                            discussion.heading || '',
                            'discussion.heading'
                        ).trim(),

                    intro:
                        resolveTutorContentValue(
                            discussion.intro || '',
                            'discussion.intro'
                        ).trim(),

                    sets:
                        existingSets
                },

                culturalLens: {
                    heading:
                        resolveTutorContentValue(
                            culturalLens.heading || '',
                            'culturalLens.heading'
                        ).trim(),

                    intro:
                        resolveTutorContentValue(
                            culturalLens.intro || '',
                            'culturalLens.intro'
                        ).trim(),

                    cards:
                        existingCards
                },

                brief:
                    String(
                        brief || ''
                    ).trim()
            });

    return commitMyVersionDocumentMutation(
        (document, overrides) => {
            if (
                !document.subjectCopy ||
                typeof document.subjectCopy !== 'object' ||
                Array.isArray(document.subjectCopy)
            ) {
                return null;
            }

            document.subjectCopy.reflection =
                document.subjectCopy.reflection &&
                typeof document.subjectCopy.reflection === 'object' &&
                !Array.isArray(
                    document.subjectCopy.reflection
                )
                    ? document.subjectCopy.reflection
                    : {};

            document.subjectCopy.reflection.title =
                generated.title;

            document.subjectCopy.reflection.summary =
                generated.summary;

            document.subjectCopy.reflection.questions =
                generated.questions.slice();

            document.subjectCopy.paths =
                document.subjectCopy.paths &&
                typeof document.subjectCopy.paths === 'object' &&
                !Array.isArray(
                    document.subjectCopy.paths
                )
                    ? document.subjectCopy.paths
                    : {};

            document.subjectCopy.paths.reflectionDescription =
                generated.pathDescription;

            delete overrides[
                'reflection.title'
            ];

            delete overrides[
                'reflection.summary'
            ];

            removeMyVersionReflectionQuestionOverrides(
                overrides
            );

            delete overrides[
                'paths.reflectionDescription'
            ];

            return {
                title:
                    generated.title,

                summary:
                    generated.summary,

                questions:
                    generated.questions.slice(),

                pathDescription:
                    generated.pathDescription
            };
        }
    );
}

async function generateMyVersionReflectionFromUI() {
    if (
        !myVersionEditing ||
        myVersionSaving ||
        !isOwnedSubjectRuntime() ||
        myVersionGeneratingReflection
    ) {
        return null;
    }

    myVersionReflectionGenerationError = '';
    myVersionGeneratingReflection = true;

    updateMyVersionAuthorBar();

    try {
        const reflection =
            await generateMyVersionReflection();

        if (!reflection) {
            throw new Error(
                'Atlas AI did not create Reflection.'
            );
        }

        return reflection;
    } catch (error) {
        console.error(
            '[Compass] AI Reflection generation failed:',
            error
        );

        if (myVersionEditing) {
            myVersionReflectionGenerationError =
                'Couldn’t generate Reflection. Try again.';
        }

        return null;
    } finally {
        myVersionGeneratingReflection = false;

        if (myVersionEditing) {
            updateMyVersionAuthorBar();
        }
    }
}

async function generateMyVersionCulturalLensCard(
    brief = ''
) {
    if (
        !myVersionEditing ||
        myVersionSaving ||
        !isOwnedSubjectRuntime()
    ) {
        return null;
    }

    const culturalLens =
        subjectCopy.culturalLens || {};

    const starterCard =
        getPristineMyVersionCulturalLensStarter();

    const existingCards =
        clCards
            .map(card =>
                materializeMyVersionCulturalLensCard(
                    card
                )
            )
            .filter(Boolean)
            .filter(card =>
                !starterCard ||
                card.id !== starterCard.id
            )
            .map(card => ({
                title:
                    String(
                        card.title || ''
                    ).trim(),

                contextLine:
                    String(
                        card.contextLine || ''
                    ).trim(),

                teaser:
                    String(
                        card.teaser || ''
                    ).trim()
            }));

    const generated =
        await requireAtlasAI()
            .generateCulturalLensCard({
                subject: {
                    title:
                        getEffectiveSubjectTitle(),

                    description:
                        getEffectiveSubjectCatalogDescription()
                },

                culturalLens: {
                    heading:
                        resolveTutorContentValue(
                            culturalLens.heading ||
                                'Cultural Lens',
                            'culturalLens.heading'
                        ).trim(),

                    intro:
                        resolveTutorContentValue(
                            culturalLens.intro || '',
                            'culturalLens.intro'
                        ).trim(),

                    cards:
                        existingCards
                },

                brief:
                    String(
                        brief || ''
                    ).trim()
            });

    const nativeCard =
        requireAtlasStructuredSubject()
            .createCulturalLensCard(
                generated
            );

    return insertMyVersionCulturalLensCard(
        nativeCard,
        {
            replaceStarter:
                Boolean(starterCard)
        }
    );
}

async function generateMyVersionCulturalLensCardFromUI() {
    if (
        !myVersionEditing ||
        myVersionSaving ||
        !isOwnedSubjectRuntime() ||
        myVersionGeneratingCulturalLensCard
    ) {
        return null;
    }

    myVersionCulturalLensGenerationError = '';
    myVersionGeneratingCulturalLensCard = true;

    renderCLGrid();

    try {
        const generatedCard =
            await generateMyVersionCulturalLensCard();

        if (
            !generatedCard &&
            myVersionEditing
        ) {
            throw new Error(
                'Atlas AI did not create a Cultural Lens card.'
            );
        }

        return generatedCard;
    } catch (error) {
        console.error(
            '[Compass] AI Cultural Lens generation failed:',
            error
        );

        if (myVersionEditing) {
            myVersionCulturalLensGenerationError =
                'Couldn’t generate a card. Try again.';
        }

        return null;
    } finally {
        myVersionGeneratingCulturalLensCard = false;

        if (myVersionEditing) {
            renderCLGrid();
        }
    }
}

function setMyVersionFullSubjectGenerationProgress(
    current,
    label
) {
    myVersionFullSubjectGenerationProgress = {
        current,
        total:
            FULL_SUBJECT_GENERATION_STAGE_COUNT,
        label
    };

    updateMyVersionAuthorBar();
}

function getMyVersionFullSubjectGenerationStatus() {
    const progress =
        myVersionFullSubjectGenerationProgress;

    if (!progress) {
        return 'Building subject…';
    }

    let operationProgress = '';

    if (
        myVersionEnrichingDiscussion &&
        myVersionDiscussionEnrichmentProgress
    ) {
        operationProgress =
            ` · ${myVersionDiscussionEnrichmentProgress.current} of ${myVersionDiscussionEnrichmentProgress.total}`;
    } else if (
        myVersionEnrichingCulturalLens &&
        myVersionCulturalLensEnrichmentProgress
    ) {
        operationProgress =
            ` · ${myVersionCulturalLensEnrichmentProgress.current} of ${myVersionCulturalLensEnrichmentProgress.total}`;
    }

    return (
        `Building subject · ${progress.current} of ${progress.total} · ` +
        `${progress.label}${operationProgress}`
    );
}

async function generateMyVersionFullSubject() {
    if (
        !myVersionEditing ||
        myVersionSaving ||
        !isOwnedSubjectRuntime() ||
        myVersionGeneratingFullSubject
    ) {
        return null;
    }

    myVersionGeneratingFullSubject = true;
    myVersionFullSubjectGenerationError = '';
    myVersionFullSubjectGenerationNotice = '';

    try {
        setMyVersionFullSubjectGenerationProgress(
            1,
            'Hook and introduction'
        );

        const framing =
            await generateMyVersionSubjectFraming();

        if (!framing) {
            throw new Error(
                'Subject framing generation failed.'
            );
        }

        setMyVersionFullSubjectGenerationProgress(
            2,
            'Overview'
        );

        const overview =
            await generateMyVersionOverview();

        if (!overview) {
            throw new Error(
                'Overview generation failed.'
            );
        }

        setMyVersionFullSubjectGenerationProgress(
            3,
            'Discussion framing'
        );

        const discussionFraming =
            await generateMyVersionDiscussionFraming();

        if (!discussionFraming) {
            throw new Error(
                'Discussion framing generation failed.'
            );
        }

        for (
            let index = 0;
            index < FULL_SUBJECT_DISCUSSION_STAGES.length;
            index += 1
        ) {
            const stage =
                FULL_SUBJECT_DISCUSSION_STAGES[index];

            setMyVersionFullSubjectGenerationProgress(
                4,
                `${stage} · ${index + 1} of ${FULL_SUBJECT_DISCUSSION_STAGES.length}`
            );

            const set =
                await generateMyVersionDiscussionSet(
                    `Create the ${stage} discussion set.`,
                    {
                        reveal: false
                    }
                );

            if (!set) {
                throw new Error(
                    `${stage} generation failed.`
                );
            }
        }

        setMyVersionFullSubjectGenerationProgress(
            5,
            'Cultural Lens framing'
        );

        const culturalLensFraming =
            await generateMyVersionCulturalLensFraming();

        if (!culturalLensFraming) {
            throw new Error(
                'Cultural Lens framing generation failed.'
            );
        }

        for (
            let index = 0;
            index < FULL_SUBJECT_CULTURAL_LENS_CARD_COUNT;
            index += 1
        ) {
            setMyVersionFullSubjectGenerationProgress(
                6,
                `Cultural Lens card ${index + 1} of ${FULL_SUBJECT_CULTURAL_LENS_CARD_COUNT}`
            );

            const card =
                await generateMyVersionCulturalLensCard();

            if (!card) {
                throw new Error(
                    `Cultural Lens card ${index + 1} generation failed.`
                );
            }
        }

        setMyVersionFullSubjectGenerationProgress(
            7,
            'Reflection'
        );

        const reflection =
            await generateMyVersionReflection();

        if (!reflection) {
            throw new Error(
                'Reflection generation failed.'
            );
        }

        /*
         * The complete teaching environment now exists.
         * Enrichment is deliberately the finishing layer.
         */

        setMyVersionFullSubjectGenerationProgress(
            8,
            'Finishing Discussion'
        );

        try {
            await enrichMyVersionDiscussionFromUI();
        } catch (error) {
            console.error(
                '[Compass] Discussion finishing pass could not complete:',
                error
            );
        }

        setMyVersionFullSubjectGenerationProgress(
            9,
            'Finishing Cultural Lens'
        );

        try {
            await enrichMyVersionCulturalLensFromUI();
        } catch (error) {
            console.error(
                '[Compass] Cultural Lens finishing pass could not complete:',
                error
            );
        }

        refreshMyVersionFullSubjectReadyNotice(
            true
        );

        return true;
    } catch (error) {
        console.error(
            '[Compass] Full subject generation paused:',
            error
        );

        if (myVersionEditing) {
            const failedAt =
                myVersionFullSubjectGenerationProgress
                    ?.label ||
                'this step';

            myVersionFullSubjectGenerationError =
                `Generation paused at ${failedAt}. Your work is autosaved — continue from here.`;
        }

        return null;
    } finally {
        myVersionGeneratingFullSubject = false;
        myVersionFullSubjectGenerationProgress = null;

        if (myVersionEditing) {
            updateMyVersionAuthorBar();
        }
    }
}

function duplicateMyVersionCulturalLensCard(cardId) {
    const source = clCards.find(
        card => card.id === cardId
    );

    const duplicate =
        assignFreshMyVersionCulturalLensCardId(
            materializeMyVersionCulturalLensCard(source)
        );

    if (!duplicate) return;

    const duplicated = commitMyVersionDocumentMutation(
        document => {
            const index =
                document.culturalLensCards.findIndex(
                    card => card.id === cardId
                );

            if (index < 0) return null;

            document.culturalLensCards.splice(
                index + 1,
                0,
                duplicate
            );

            return { cardId: duplicate.id };
        }
    );

    if (!duplicated) return;

    window.setTimeout(() => {
        const index = clCards.findIndex(
            card => card.id === duplicate.id
        );

        if (index >= 0) {
            openCulturalLensFocus(index);
        }
    }, 0);
}

function moveMyVersionCulturalLensCard(
    cardId,
    direction
) {
    const offset = direction < 0 ? -1 : 1;

    commitMyVersionDocumentMutation(document => {
        const index =
            document.culturalLensCards.findIndex(
                card => card.id === cardId
            );

        const nextIndex = index + offset;

        if (
            index < 0 ||
            nextIndex < 0 ||
            nextIndex >=
                document.culturalLensCards.length
        ) {
            return null;
        }

        const [card] =
            document.culturalLensCards.splice(
                index,
                1
            );

        document.culturalLensCards.splice(
            nextIndex,
            0,
            card
        );

        return { cardId };
    });
}

function removeMyVersionCulturalLensCard(cardId) {
    commitMyVersionDocumentMutation(
        (document, overrides) => {
            if (
                document.culturalLensCards.length <= 1
            ) {
                return null;
            }

            const index =
                document.culturalLensCards.findIndex(
                    card => card.id === cardId
                );

            if (index < 0) return null;

            const [removedCard] =
                document.culturalLensCards.splice(
                    index,
                    1
                );

            removeMyVersionCulturalLensCardOverrides(
                overrides,
                removedCard
            );

            return { cardId };
        }
    );
}

function addMyVersionCulturalLensCardField(
    cardId,
    field
) {
    if (!myVersionEditing) return;

    const defaults = {
        contextLine: 'New context',
        teaser: 'Add a short preview.'
    };

    if (
        !Object.prototype.hasOwnProperty.call(
            defaults,
            field
        )
    ) {
        return;
    }

    const changed = commitMyVersionDraftContent(
        getCulturalLensFieldKey(cardId, field),
        defaults[field]
    );

    if (!changed) return;

    requestAnimationFrame(() => {
        const card = document.getElementById(
            `cl-card-${cardId}`
        );

        const element = card?.querySelector(
            field === 'contextLine'
                ? '.cl-card-location'
                : '.cl-card-teaser'
        );

        if (!element) return;

        element.focus({ preventScroll: true });

        const selection = window.getSelection();
        const range = document.createRange();

        range.selectNodeContents(element);
        selection?.removeAllRanges();
        selection?.addRange(range);
    });
}

function focusAndSelectMyVersionText(selector) {
    requestAnimationFrame(() => {
        const element = document.querySelector(selector);

        if (!element) return;

        element.focus({ preventScroll: true });

        const selection = window.getSelection();
        const range = document.createRange();

        range.selectNodeContents(element);
        selection?.removeAllRanges();
        selection?.addRange(range);
    });
}

function addMyVersionCulturalLensQuestion(cardId) {
    const added = commitMyVersionDocumentMutation(
        (document, overrides) => {
            const card =
                getMyVersionDocumentCulturalLensCard(
                    document,
                    cardId
                );

            if (!card) return null;

            const questions =
                materializeMyVersionCulturalLensQuestions(
                    card,
                    overrides
                );

            questions.push(
                'What would you like to explore?'
            );

            return {
                cardId,
                index: questions.length - 1
            };
        }
    );

    if (!added) return;

    focusAndSelectMyVersionText(
        `[data-cultural-lens-question-index="${added.index}"]`
    );
}

function moveMyVersionCulturalLensQuestion(
    cardId,
    index,
    direction
) {
    const offset = direction < 0 ? -1 : 1;

    commitMyVersionDocumentMutation(
        (document, overrides) => {
            const card =
                getMyVersionDocumentCulturalLensCard(
                    document,
                    cardId
                );

            if (!card) return null;

            const questions =
                materializeMyVersionCulturalLensQuestions(
                    card,
                    overrides
                );

            const nextIndex = index + offset;

            if (
                index < 0 ||
                nextIndex < 0 ||
                nextIndex >= questions.length
            ) {
                return null;
            }

            const [question] = questions.splice(
                index,
                1
            );

            questions.splice(
                nextIndex,
                0,
                question
            );

            return {
                cardId,
                index: nextIndex
            };
        }
    );
}

function removeMyVersionCulturalLensQuestion(
    cardId,
    index
) {
    commitMyVersionDocumentMutation(
        (document, overrides) => {
            const card =
                getMyVersionDocumentCulturalLensCard(
                    document,
                    cardId
                );

            if (!card) return null;

            const questions =
                materializeMyVersionCulturalLensQuestions(
                    card,
                    overrides
                );

            if (
                index < 0 ||
                index >= questions.length
            ) {
                return null;
            }

            questions.splice(index, 1);

            if (!questions.length) {
                delete card.questions;
                delete card.questionLabel;

                delete overrides[
                    getCulturalLensFieldKey(
                        cardId,
                        'questionLabel'
                    )
                ];
            }

            return { cardId };
        }
    );
}

function addMyVersionReflectionQuestion() {
    const added = commitMyVersionDocumentMutation(
        (document, overrides) => {
            const questions =
                materializeMyVersionReflectionQuestions(
                    document,
                    overrides
                );

            questions.push(
                'What would you like the learner to reflect on?'
            );

            return {
                index: questions.length - 1
            };
        }
    );

    if (!added) return;

    focusAndSelectMyVersionText(
        `[data-reflection-question-index="${added.index}"]`
    );
}

function moveMyVersionReflectionQuestion(
    index,
    direction
) {
    const offset = direction < 0 ? -1 : 1;

    commitMyVersionDocumentMutation(
        (document, overrides) => {
            const questions =
                materializeMyVersionReflectionQuestions(
                    document,
                    overrides
                );

            const nextIndex = index + offset;

            if (
                index < 0 ||
                nextIndex < 0 ||
                nextIndex >= questions.length
            ) {
                return null;
            }

            const [question] = questions.splice(
                index,
                1
            );

            questions.splice(
                nextIndex,
                0,
                question
            );

            return { index: nextIndex };
        }
    );
}

function removeMyVersionReflectionQuestion(index) {
    commitMyVersionDocumentMutation(
        (document, overrides) => {
            const questions =
                materializeMyVersionReflectionQuestions(
                    document,
                    overrides
                );

            if (
                index < 0 ||
                index >= questions.length
            ) {
                return null;
            }

            questions.splice(index, 1);

            return { index };
        }
    );
}

function addMyVersionCulturalLensThreadQuestion(
    cardId
) {
    const added = commitMyVersionDocumentMutation(
        (document, overrides) => {
            const card =
                getMyVersionDocumentCulturalLensCard(
                    document,
                    cardId
                );

            if (!card) return null;

            const questions =
                materializeMyVersionCulturalLensThread(
                    card,
                    overrides
                );

            questions.push(
                'What could you explore next?'
            );

            return {
                cardId,
                index: questions.length - 1
            };
        }
    );

    if (!added) return;

    requestAnimationFrame(() => {
        const element = document.querySelector(
            `[data-cultural-lens-thread-index="${added.index}"]`
        );

        if (!element) return;

        element.focus({ preventScroll: true });

        const selection = window.getSelection();
        const range = document.createRange();

        range.selectNodeContents(element);
        selection?.removeAllRanges();
        selection?.addRange(range);
    });
}

function moveMyVersionCulturalLensThreadQuestion(
    cardId,
    index,
    direction
) {
    const offset = direction < 0 ? -1 : 1;

    commitMyVersionDocumentMutation(
        (document, overrides) => {
            const card =
                getMyVersionDocumentCulturalLensCard(
                    document,
                    cardId
                );

            if (!card) return null;

            const questions =
                materializeMyVersionCulturalLensThread(
                    card,
                    overrides
                );

            const nextIndex = index + offset;

            if (
                index < 0 ||
                nextIndex < 0 ||
                nextIndex >= questions.length
            ) {
                return null;
            }

            const [question] = questions.splice(
                index,
                1
            );

            questions.splice(
                nextIndex,
                0,
                question
            );

            return {
                cardId,
                index: nextIndex
            };
        }
    );
}

function removeMyVersionCulturalLensThreadQuestion(
    cardId,
    index
) {
    commitMyVersionDocumentMutation(
        (document, overrides) => {
            const card =
                getMyVersionDocumentCulturalLensCard(
                    document,
                    cardId
                );

            if (!card) return null;

            const questions =
                materializeMyVersionCulturalLensThread(
                    card,
                    overrides
                );

            if (
                index < 0 ||
                index >= questions.length
            ) {
                return null;
            }

            questions.splice(index, 1);

            if (!questions.length) {
                delete card.followTheThread;

                delete overrides[
                    getCulturalLensFieldKey(
                        cardId,
                        'followTheThreadLabel'
                    )
                ];
            }

            return { cardId };
        }
    );
}

function normalizeMyVersionQuestionCollectionsForSave() {
    if (!myVersionEditing || !myVersionDraftDocument) {
        return;
    }

    const nextDocument = cloneTutorSubjectDocument(
        myVersionDraftDocument
    );

    const nextOverrides = cloneTutorContentOverrides(
        myVersionDraftOverrides
    );

    (nextDocument.culturalLensCards || []).forEach(
        card => {
            const mainQuestions =
                materializeMyVersionCulturalLensQuestions(
                    card,
                    nextOverrides
                )
                .filter(question => question.trim());

            if (mainQuestions.length) {
                card.questions = mainQuestions;
            } else {
                delete card.questions;
                delete card.mainQuestion;
                delete card.questionLabel;

                delete nextOverrides[
                    getCulturalLensFieldKey(
                        card.id,
                        'questionLabel'
                    )
                ];
            }

            const threadQuestions =
                materializeMyVersionCulturalLensThread(
                    card,
                    nextOverrides
                )
                .filter(question => question.trim());

            if (threadQuestions.length) {
                card.followTheThread = threadQuestions;
            } else {
                delete card.followTheThread;
                delete card.followTheThreadLabel;

                delete nextOverrides[
                    getCulturalLensFieldKey(
                        card.id,
                        'followTheThreadLabel'
                    )
                ];
            }
        }
    );

    const reflectionQuestions =
        materializeMyVersionReflectionQuestions(
            nextDocument,
            nextOverrides
        )
        .filter(question => question.trim());

    nextDocument.subjectCopy.reflection.questions =
        reflectionQuestions;

    myVersionDraftDocument =
        normalizeTutorSubjectDocument(nextDocument);

    myVersionDraftOverrides = nextOverrides;
    myVersionPendingWorkingDraftOverrides =
        cloneTutorContentOverrides(nextOverrides);

    applyTutorSubjectDocument(
        myVersionDraftDocument
    );

    refreshMyVersionDirtyState();
}

function removeMyVersionDiscussionSetOverrides(
    overrides,
    set
) {
    if (!set?.id) return;

    const setPrefix = `discussion.set.${set.id}.`;

    Object.keys(overrides).forEach(fieldKey => {
        if (fieldKey.startsWith(setPrefix)) {
            delete overrides[fieldKey];
        }
    });

    (set.moments || []).forEach(moment => {
        removeMyVersionMomentOverrides(
            overrides,
            moment.id
        );
    });
}

function materializeMyVersionDiscussionSet(set) {
    const copy = cloneTutorSubjectDocument(set);

    if (!copy) return null;

    ['stage', 'title', 'description'].forEach(field => {
        copy[field] = resolveTutorContentValue(
            set[field],
            getDiscussionSetFieldKey(set.id, field)
        );
    });

    copy.moments = (set.moments || [])
        .map(materializeMyVersionMoment)
        .filter(Boolean);

    if (set.makeItReal) {
        copy.makeItReal = {
            ...cloneTutorSubjectDocument(set.makeItReal),
            label: getDiscussionActivityLabel(set),
            title: resolveTutorContentValue(
                set.makeItReal.title,
                getDiscussionMakeItRealFieldKey(
                    set.id,
                    'title'
                )
            ),
            prompt: resolveTutorContentValue(
                set.makeItReal.prompt,
                getDiscussionMakeItRealFieldKey(
                    set.id,
                    'prompt'
                )
            )
        };
    }

    return copy;
}

function getPristineMyVersionDiscussionStarter() {
    if (
        !isOwnedSubjectRuntime() ||
        discussionSets.length !== 1
    ) {
        return null;
    }

    const source = discussionSets[0];
    const set =
        materializeMyVersionDiscussionSet(
            source
        );

    if (
        !set ||
        !Array.isArray(set.moments) ||
        set.moments.length !== 1
    ) {
        return null;
    }

    const starter =
        requireAtlasStructuredSubject()
            .createDiscussionSet({
                id: source.id,
                moments: [
                    {
                        id: set.moments[0].id
                    }
                ]
            });

    const moment = set.moments[0];
    const starterMoment = starter.moments[0];

    const pristine =
        set.title === starter.title &&
        set.stage === starter.stage &&
        set.icon === starter.icon &&
        set.description === starter.description &&
        !set.makeItReal &&
        moment.preview === starterMoment.preview &&
        moment.question === starterMoment.question &&
        !moment.followUp &&
        (
            !Array.isArray(moment.followUps) ||
            moment.followUps.length === 0
        ) &&
        !moment.upgrade;

    return pristine
        ? source
        : null;
}

function assignFreshMyVersionDiscussionSetIds(set) {
    const copy = cloneTutorSubjectDocument(set);

    if (!copy) return null;

    copy.id = createTutorAuthoredContentId(
        'discussion-set'
    );

    copy.moments = (copy.moments || []).map(moment => {
        const nextMoment = {
            ...moment,
            id: createTutorAuthoredContentId('moment')
        };

        if (Array.isArray(nextMoment.followUps)) {
            nextMoment.followUps = nextMoment.followUps.map(
                followUp => ({
                    ...followUp,
                    id: createTutorAuthoredContentId(
                        'follow-up'
                    )
                })
            );
        }

        if (nextMoment.followUp) {
            nextMoment.followUp = {
                ...nextMoment.followUp,
                id: createTutorAuthoredContentId(
                    'follow-up'
                )
            };
        }

        return nextMoment;
    });

    return copy;
}

function insertMyVersionDiscussionSet(
    set,
    {
        replaceStarter = false,
        reveal = true
    } = {}
) {
    const nativeSet =
        cloneTutorSubjectDocument(set);

    if (
        !nativeSet ||
        typeof nativeSet.id !== 'string' ||
        !nativeSet.id.trim() ||
        typeof nativeSet.title !== 'string' ||
        typeof nativeSet.stage !== 'string' ||
        typeof nativeSet.icon !== 'string' ||
        typeof nativeSet.description !== 'string' ||
        !Array.isArray(nativeSet.moments) ||
        !nativeSet.moments.length ||
        nativeSet.moments.some(moment =>
            !moment ||
            typeof moment !== 'object' ||
            typeof moment.id !== 'string' ||
            !moment.id.trim() ||
            typeof moment.preview !== 'string' ||
            typeof moment.question !== 'string'
        )
    ) {
        return null;
    }

    const starterSet =
        replaceStarter
            ? getPristineMyVersionDiscussionStarter()
            : null;

    const added = commitMyVersionDocumentMutation(
        (document, overrides) => {
            if (
                document.discussionSets.some(
                    item => item.id === nativeSet.id
                )
            ) {
                return null;
            }

            if (starterSet) {
                const starterIndex =
                    document.discussionSets.findIndex(
                        item => item.id === starterSet.id
                    );

                if (starterIndex >= 0) {
                    const [removedSet] =
                        document.discussionSets.splice(
                            starterIndex,
                            1,
                            nativeSet
                        );

                    removeMyVersionDiscussionSetOverrides(
                        overrides,
                        removedSet
                    );

                    return {
                        setId: nativeSet.id
                    };
                }
            }

            document.discussionSets.push(
                nativeSet
            );

            return {
                setId: nativeSet.id
            };
        }
    );

    if (!added) return null;

    if (reveal) {
        window.setTimeout(() => {
            openSet(nativeSet.id);
        }, 0);
    }

    return nativeSet;
}

function addMyVersionDiscussionSet() {
    const starterSet =
        getPristineMyVersionDiscussionStarter();

    if (starterSet) {
        openSet(starterSet.id);
        return starterSet;
    }

    const nativeSet =
        requireAtlasStructuredSubject()
            .createDiscussionSet({
                stage: 'New Set'
            });

    return insertMyVersionDiscussionSet(
        nativeSet
    );
}

async function generateMyVersionDiscussionSet(
    brief = '',
    options = {}
) {
    if (
        !myVersionEditing ||
        myVersionSaving ||
        !isOwnedSubjectRuntime()
    ) {
        return null;
    }

    const discussion =
        subjectCopy.discussion || {};

    const starterSet =
        getPristineMyVersionDiscussionStarter();

    const existingSets =
        discussionSets
            .map(set =>
                materializeMyVersionDiscussionSet(
                    set
                )
            )
            .filter(Boolean)
            .filter(set =>
                !starterSet ||
                set.id !== starterSet.id
            )
            .map(set => ({
                title:
                    String(
                        set.title || ''
                    ).trim(),

                stage:
                    String(
                        set.stage || ''
                    ).trim(),

                description:
                    String(
                        set.description || ''
                    ).trim(),

                moments:
                    set.moments.map(
                        ({
                            preview,
                            question
                        }) => ({
                            preview:
                                String(
                                    preview || ''
                                ).trim(),

                            question:
                                String(
                                    question || ''
                                ).trim()
                        })
                    )
            }));

    const generated =
        await requireAtlasAI()
            .generateDiscussionSet({
                subject: {
                    title:
                        getEffectiveSubjectTitle(),

                    description:
                        getEffectiveSubjectCatalogDescription()
                },

                discussion: {
                    heading:
                        resolveTutorContentValue(
                            discussion.heading ||
                                'Discussion',
                            'discussion.heading'
                        ).trim(),

                    intro:
                        resolveTutorContentValue(
                            discussion.intro || '',
                            'discussion.intro'
                        ).trim(),

                    sets:
                        existingSets
                },

                brief:
                    String(
                        brief || ''
                    ).trim()
            });

    const iconByStage = {
        'First Look':
            'first-look',

        'Look Closer':
            'closer-look',

        'Wider View':
            'wider-view'
    };

    const nativeSet =
        requireAtlasStructuredSubject()
            .createDiscussionSet({
                ...generated,

                icon:
                    iconByStage[
                        generated.stage
                    ] || 'first-look'
            });

    return insertMyVersionDiscussionSet(
        nativeSet,
        {
            replaceStarter:
                Boolean(starterSet),

            reveal:
                options?.reveal !== false
        }
    );
}

async function generateMyVersionDiscussionSetFromUI() {
    if (
        !myVersionEditing ||
        myVersionSaving ||
        !isOwnedSubjectRuntime() ||
        myVersionGeneratingDiscussionSet
    ) {
        return null;
    }

    myVersionDiscussionSetGenerationError = '';
    myVersionGeneratingDiscussionSet = true;

    renderDiscussionSets();

    try {
        const generatedSet =
            await generateMyVersionDiscussionSet();

        if (
            !generatedSet &&
            myVersionEditing
        ) {
            throw new Error(
                'Atlas AI did not create a Discussion set.'
            );
        }

        return generatedSet;
    } catch (error) {
        console.error(
            '[Compass] AI Discussion set generation failed:',
            error
        );

        if (myVersionEditing) {
            myVersionDiscussionSetGenerationError =
                'Couldn’t generate a set. Try again.';
        }

        return null;
    } finally {
        myVersionGeneratingDiscussionSet = false;

        if (myVersionEditing) {
            renderDiscussionSets();
        }
    }
}

function duplicateMyVersionDiscussionSet(setId) {
    const source = discussionSets.find(
        set => set.id === setId
    );

    const duplicate = assignFreshMyVersionDiscussionSetIds(
        materializeMyVersionDiscussionSet(source)
    );

    if (!duplicate) return;

    const duplicated = commitMyVersionDocumentMutation(
        document => {
            const index = document.discussionSets.findIndex(
                set => set.id === setId
            );

            if (index < 0) return null;

            document.discussionSets.splice(
                index + 1,
                0,
                duplicate
            );

            return { setId: duplicate.id };
        }
    );

    if (!duplicated) return;

    window.setTimeout(() => {
        openSet(duplicate.id);
    }, 0);
}

function moveMyVersionDiscussionSet(
    setId,
    direction
) {
    const offset = direction < 0 ? -1 : 1;

    commitMyVersionDocumentMutation(document => {
        const index = document.discussionSets.findIndex(
            set => set.id === setId
        );

        const nextIndex = index + offset;

        if (
            index < 0 ||
            nextIndex < 0 ||
            nextIndex >= document.discussionSets.length
        ) {
            return null;
        }

        const [set] = document.discussionSets.splice(
            index,
            1
        );

        document.discussionSets.splice(
            nextIndex,
            0,
            set
        );

        return { setId };
    });
}

function removeMyVersionDiscussionSet(setId) {
    commitMyVersionDocumentMutation(
        (document, overrides) => {
            if (document.discussionSets.length <= 1) {
                return null;
            }

            const index = document.discussionSets.findIndex(
                set => set.id === setId
            );

            if (index < 0) return null;

            const [removedSet] =
                document.discussionSets.splice(index, 1);

            removeMyVersionDiscussionSetOverrides(
                overrides,
                removedSet
            );

            return { setId };
        }
    );
}

function getPristineMyVersionMomentStarter(setId) {
    if (!isOwnedSubjectRuntime()) {
        return null;
    }

    const sourceSet = discussionSets.find(
        set => set.id === setId
    );

    const set =
        materializeMyVersionDiscussionSet(
            sourceSet
        );

    if (
        !set ||
        !Array.isArray(set.moments) ||
        set.moments.length !== 1
    ) {
        return null;
    }

    const moment = set.moments[0];

    const starter =
        requireAtlasStructuredSubject()
            .createMoment({
                id: moment.id
            });

    const pristine =
        moment.preview === starter.preview &&
        moment.question === starter.question &&
        !moment.followUp &&
        (
            !Array.isArray(moment.followUps) ||
            moment.followUps.length === 0
        ) &&
        !moment.upgrade;

    return pristine
        ? sourceSet.moments[0]
        : null;
}

function insertMyVersionMoment(
    setId,
    moment,
    { replaceStarter = false } = {}
) {
    const nativeMoment =
        cloneTutorSubjectDocument(moment);

    if (
        !nativeMoment ||
        typeof nativeMoment.id !== 'string' ||
        !nativeMoment.id.trim() ||
        typeof nativeMoment.preview !== 'string' ||
        typeof nativeMoment.question !== 'string'
    ) {
        return null;
    }

    const starterMoment =
        replaceStarter
            ? getPristineMyVersionMomentStarter(
                setId
            )
            : null;

    const added = commitMyVersionDocumentMutation(
        (document, overrides) => {
            const set = getMyVersionDocumentSet(
                document,
                setId
            );

            if (
                !set ||
                set.moments.some(
                    item => item.id === nativeMoment.id
                )
            ) {
                return null;
            }

            if (starterMoment) {
                const starterIndex =
                    set.moments.findIndex(
                        item =>
                            item.id ===
                            starterMoment.id
                    );

                if (starterIndex >= 0) {
                    const [removedMoment] =
                        set.moments.splice(
                            starterIndex,
                            1,
                            nativeMoment
                        );

                    removeMyVersionMomentOverrides(
                        overrides,
                        removedMoment.id
                    );

                    return {
                        setId,
                        momentId: nativeMoment.id
                    };
                }
            }

            set.moments.push(nativeMoment);

            return {
                setId,
                momentId: nativeMoment.id
            };
        }
    );

    if (!added) return null;

    activeSetId = setId;

    window.setTimeout(() => {
        openDiscussionFocus(
            setId,
            nativeMoment.id,
            document.getElementById(
                `moment-card-${nativeMoment.id}`
            )
        );
    }, 0);

    return nativeMoment;
}

function addMyVersionMoment(setId) {
    const starterMoment =
        getPristineMyVersionMomentStarter(
            setId
        );

    if (starterMoment) {
        openDiscussionFocus(
            setId,
            starterMoment.id,
            document.getElementById(
                `moment-card-${starterMoment.id}`
            )
        );

        return starterMoment;
    }

    const nativeMoment =
        requireAtlasStructuredSubject()
            .createMoment();

    return insertMyVersionMoment(
        setId,
        nativeMoment
    );
}

async function generateMyVersionMoment(
    setId,
    brief = ''
) {
    if (
        !myVersionEditing ||
        myVersionSaving ||
        !isOwnedSubjectRuntime()
    ) {
        return null;
    }

    const sourceSet = discussionSets.find(
        set => set.id === setId
    );

    const contextSet =
        materializeMyVersionDiscussionSet(
            sourceSet
        );

    if (!contextSet) return null;

    const starterMoment =
        getPristineMyVersionMomentStarter(
            setId
        );

    const existingMoments =
        contextSet.moments
            .filter(moment =>
                !starterMoment ||
                moment.id !== starterMoment.id
            )
            .map(
                ({
                    preview,
                    question
                }) => ({
                    preview,
                    question
                })
            );

    const generated =
        await requireAtlasAI()
            .generateMoment({
                subject: {
                    title:
                        getEffectiveSubjectTitle(),
                    description:
                        getEffectiveSubjectCatalogDescription()
                },

                set: {
                    title:
                        contextSet.title,
                    stage:
                        contextSet.stage,
                    description:
                        contextSet.description,
                    moments:
                        existingMoments
                },

                brief:
                    String(brief || '').trim()
            });

    const nativeMoment =
        requireAtlasStructuredSubject()
            .createMoment(generated);

    return insertMyVersionMoment(
        setId,
        nativeMoment,
        {
            replaceStarter:
                Boolean(starterMoment)
        }
    );
}

function getMyVersionExistingLanguage(
    excludedContextId = ''
) {
    const excluded =
        getUpgradeContextIdentity(
            excludedContextId
        );

    return [
        ...discussionSets.flatMap(set =>
            Array.isArray(set.moments)
                ? set.moments
                : []
        )
            .filter(moment =>
                !(
                    excluded?.sourceKind === 'moment' &&
                    moment.id === excluded.sourceElementId
                )
            )
            .map(moment =>
                materializeMyVersionMoment(
                    moment
                )
            )
            .filter(moment =>
                moment?.upgrade
            )
            .map(moment => ({
                term:
                    String(
                        moment.upgrade.term || ''
                    ).trim(),

                type:
                    String(
                        moment.upgrade.type || ''
                    ).trim(),

                priority:
                    String(
                        moment.upgrade.priority ||
                            'standard'
                    ).trim()
            })),

        ...clCards
            .filter(card =>
                !(
                    excluded?.sourceKind === 'cultural-lens' &&
                    card.id === excluded.sourceElementId
                )
            )
            .map(card =>
                materializeMyVersionCulturalLensCard(
                    card
                )
            )
            .filter(card =>
                card?.upgrade
            )
            .map(card => ({
                term:
                    String(
                        card.upgrade.term || ''
                    ).trim(),

                type:
                    String(
                        card.upgrade.type || ''
                    ).trim(),

                priority:
                    String(
                        card.upgrade.priority ||
                            'standard'
                    ).trim()
            }))
    ].filter(item => item.term);
}

async function generateMyVersionMomentUpgrade(
    momentId,
    brief = '',
    options = {}
) {
    if (
        !myVersionEditing ||
        myVersionSaving ||
        !isOwnedSubjectRuntime()
    ) {
        return null;
    }

    const sourceSet = discussionSets.find(
        set =>
            Array.isArray(set.moments) &&
            set.moments.some(
                moment => moment.id === momentId
            )
    );

    const contextSet =
        materializeMyVersionDiscussionSet(
            sourceSet
        );

    const contextMoment =
        contextSet?.moments.find(
            moment => moment.id === momentId
        );

    if (
        !contextSet ||
        !contextMoment ||
        contextMoment.upgrade
    ) {
        return null;
    }

    const existingLanguage =
        getMyVersionExistingLanguage(
            `moment-${momentId}`
        );

    const generated =
        await requireAtlasAI()
            .generateMomentUpgrade({
                subject: {
                    title:
                        getEffectiveSubjectTitle(),

                    description:
                        getEffectiveSubjectCatalogDescription()
                },

                set: {
                    title:
                        String(
                            contextSet.title || ''
                        ).trim(),

                    stage:
                        String(
                            contextSet.stage || ''
                        ).trim(),

                    description:
                        String(
                            contextSet.description || ''
                        ).trim()
                },

                moment: {
                    preview:
                        String(
                            contextMoment.preview || ''
                        ).trim(),

                    question:
                        String(
                            contextMoment.question || ''
                        ).trim()
                },

                existingLanguage,

                brief:
                    String(
                        brief || ''
                    ).trim()
            });

    const contextId =
        `moment-${momentId}`;

    const committed =
        commitMyVersionDocumentMutation(
            (document, overrides) => {
                const target =
                    getMyVersionUpgradeTarget(
                        document,
                        contextId
                    );

                if (
                    !target ||
                    target.upgrade
                ) {
                    return null;
                }

                removeMyVersionUpgradeOverrides(
                    overrides,
                    contextId
                );

                target.upgrade = {
                    term:
                        generated.term,

                    type:
                        generated.type,

                    definition:
                        generated.definition,

                    ordinary:
                        generated.ordinary,

                    upgraded:
                        generated.upgraded,

                    priority:
                        generated.priority,

                    atlasPrompt:
                        generated.atlasPrompt
                };

                return {
                    contextId,
                    upgrade:
                        cloneTutorSubjectDocument(
                            target.upgrade
                        )
                };
            }
        );

    if (!committed) return null;

    if (options?.reveal !== false) {
        refreshMyVersionUpgradeFocus(
            contextId,
            true
        );
    }

    return committed.upgrade;
}

function getMyVersionDiscussionLanguageUpgradeCandidateIds() {
    if (
        !myVersionEditing ||
        !isOwnedSubjectRuntime()
    ) {
        return [];
    }

    return discussionSets.flatMap(set => {
        const starterMoment =
            getPristineMyVersionMomentStarter(
                set.id
            );

        return (
            Array.isArray(set.moments)
                ? set.moments
                : []
        )
            .map(moment =>
                materializeMyVersionMoment(
                    moment
                )
            )
            .filter(Boolean)
            .filter(moment =>
                !starterMoment ||
                moment.id !== starterMoment.id
            )
            .filter(moment =>
                !moment.upgrade
            )
            .map(moment => moment.id);
    });
}

function getMyVersionDiscussionMakeItRealCandidateSetIds() {
    if (
        !myVersionEditing ||
        !isOwnedSubjectRuntime()
    ) {
        return [];
    }

    const pristineStarter =
        getPristineMyVersionDiscussionStarter();

    return discussionSets
        .filter(set =>
            !pristineStarter ||
            set.id !== pristineStarter.id
        )
        .map(set =>
            materializeMyVersionDiscussionSet(
                set
            )
        )
        .filter(Boolean)
        .filter(set =>
            !set.makeItReal
        )
        .map(set => set.id);
}

async function generateMyVersionMakeItReal(
    setId,
    brief = ''
) {
    if (
        !myVersionEditing ||
        myVersionSaving ||
        !isOwnedSubjectRuntime()
    ) {
        return null;
    }

    const sourceSet = discussionSets.find(
        set => set.id === setId
    );

    const contextSet =
        materializeMyVersionDiscussionSet(
            sourceSet
        );

    if (
        !contextSet ||
        contextSet.makeItReal
    ) {
        return null;
    }

    const existingActivities =
        discussionSets
            .filter(set =>
                set.id !== setId
            )
            .map(set =>
                materializeMyVersionDiscussionSet(
                    set
                )
            )
            .filter(set =>
                set?.makeItReal
            )
            .map(set => ({
                setTitle:
                    String(
                        set.title || ''
                    ).trim(),

                title:
                    String(
                        set.makeItReal.title || ''
                    ).trim(),

                prompt:
                    String(
                        set.makeItReal.prompt || ''
                    ).trim()
            }));

    const generated =
        await requireAtlasAI()
            .generateMakeItReal({
                subject: {
                    title:
                        getEffectiveSubjectTitle(),

                    description:
                        getEffectiveSubjectCatalogDescription()
                },

                set: {
                    title:
                        String(
                            contextSet.title || ''
                        ).trim(),

                    stage:
                        String(
                            contextSet.stage || ''
                        ).trim(),

                    description:
                        String(
                            contextSet.description || ''
                        ).trim(),

                    moments:
                        Array.isArray(
                            contextSet.moments
                        )
                            ? contextSet.moments
                                .map(moment => ({
                                    preview:
                                        String(
                                            moment.preview || ''
                                        ).trim(),

                                    question:
                                        String(
                                            moment.question || ''
                                        ).trim()
                                }))
                            : []
                },

                existingActivities,

                brief:
                    String(
                        brief || ''
                    ).trim()
            });

    const committed =
        commitMyVersionDocumentMutation(
            (document, overrides) => {
                const set =
                    getMyVersionDocumentSet(
                        document,
                        setId
                    );

                if (
                    !set ||
                    set.makeItReal
                ) {
                    return null;
                }

                removeMyVersionSetActivityOverrides(
                    overrides,
                    setId
                );

                set.makeItReal = {
                    label: 'Make It Real',
                    title:
                        generated.title,
                    prompt:
                        generated.prompt
                };

                return {
                    setId,
                    makeItReal:
                        cloneTutorSubjectDocument(
                            set.makeItReal
                        )
                };
            }
        );

    return committed?.makeItReal || null;
}

async function runMyVersionEnrichmentOperationWithRetry(
    operation,
    label
) {
    let lastError = null;

    for (
        let attempt = 1;
        attempt <= 2;
        attempt += 1
    ) {
        try {
            const result = await operation();

            if (result) {
                return result;
            }

            lastError = new Error(
                `${label} returned no result.`
            );
        } catch (error) {
            lastError = error;
        }

        if (attempt === 1) {
            console.warn(
                `[Compass] ${label} failed. Retrying once.`,
                lastError
            );

            await new Promise(resolve => {
                window.setTimeout(resolve, 600);
            });
        }
    }

    console.error(
        `[Compass] ${label} failed after retry:`,
        lastError
    );

    return null;
}

function getMyVersionRemainingEnrichmentCount() {
    return (
        getMyVersionDiscussionLanguageUpgradeCandidateIds()
            .length +
        getMyVersionDiscussionMakeItRealCandidateSetIds()
            .length +
        getMyVersionCulturalLensLanguageUpgradeCandidateIds()
            .length
    );
}

function refreshMyVersionFullSubjectReadyNotice(
    force = false
) {
    if (
        !force &&
        !myVersionFullSubjectGenerationNotice
    ) {
        return;
    }

    const remaining =
        getMyVersionRemainingEnrichmentCount();

    myVersionFullSubjectGenerationNotice =
        remaining > 0
            ? `Subject ready ✓ · ${remaining} finishing touch${remaining === 1 ? '' : 'es'} remaining`
            : 'Subject ready ✓ · Generation complete';

    updateMyVersionAuthorBar();
}

async function enrichMyVersionDiscussionFromUI() {
    if (
        !myVersionEditing ||
        myVersionSaving ||
        !isOwnedSubjectRuntime() ||
        myVersionEnrichingDiscussion ||
        myVersionEnrichingCulturalLens
    ) {
        return null;
    }

    const operations = [
        ...getMyVersionDiscussionLanguageUpgradeCandidateIds()
            .map(momentId => ({
                kind: 'upgrade',
                id: momentId
            })),

        ...getMyVersionDiscussionMakeItRealCandidateSetIds()
            .map(setId => ({
                kind: 'make-it-real',
                id: setId
            }))
    ];

    if (!operations.length) {
        refreshMyVersionFullSubjectReadyNotice();
        return [];
    }

    const completedOperations = [];
    const failedOperations = [];

    myVersionDiscussionEnrichmentError = '';
    myVersionEnrichingDiscussion = true;
    myVersionDiscussionEnrichmentProgress = {
        current: 0,
        total: operations.length
    };

    updateMyVersionAuthorBar();

    try {
        for (
            let index = 0;
            index < operations.length;
            index += 1
        ) {
            const operation = operations[index];

            myVersionDiscussionEnrichmentProgress = {
                current: index + 1,
                total: operations.length
            };

            updateMyVersionAuthorBar();

            const label =
                operation.kind === 'upgrade'
                    ? `Discussion language upgrade ${index + 1}`
                    : `Discussion activity ${index + 1}`;

            const result =
                await runMyVersionEnrichmentOperationWithRetry(
                    () =>
                        operation.kind === 'upgrade'
                            ? generateMyVersionMomentUpgrade(
                                operation.id,
                                '',
                                { reveal: false }
                            )
                            : generateMyVersionMakeItReal(
                                operation.id
                            ),
                    label
                );

            if (result) {
                completedOperations.push(
                    operation
                );
            } else {
                failedOperations.push(
                    operation
                );
            }
        }

        if (failedOperations.length) {
            myVersionDiscussionEnrichmentError =
                `${failedOperations.length} finishing touch${failedOperations.length === 1 ? '' : 'es'} still remaining.`;
        }

        return completedOperations;
    } finally {
        myVersionEnrichingDiscussion = false;
        myVersionDiscussionEnrichmentProgress = null;

        if (myVersionEditing) {
            refreshMyVersionFullSubjectReadyNotice();
            updateMyVersionAuthorBar();
        }
    }
}

async function generateMyVersionCulturalLensUpgrade(
    cardId,
    brief = '',
    options = {}
) {
    if (
        !myVersionEditing ||
        myVersionSaving ||
        !isOwnedSubjectRuntime()
    ) {
        return null;
    }

    const sourceCard = clCards.find(
        card => card.id === cardId
    );

    const contextCard =
        materializeMyVersionCulturalLensCard(
            sourceCard
        );

    if (
        !contextCard ||
        contextCard.upgrade
    ) {
        return null;
    }

    const culturalLens =
        subjectCopy.culturalLens || {};

    const existingLanguage =
        getMyVersionExistingLanguage(
            `cl-${cardId}`
        );

    const generated =
        await requireAtlasAI()
            .generateCulturalLensUpgrade({
                subject: {
                    title:
                        getEffectiveSubjectTitle(),

                    description:
                        getEffectiveSubjectCatalogDescription()
                },

                culturalLens: {
                    heading:
                        resolveTutorContentValue(
                            culturalLens.heading ||
                                'Cultural Lens',
                            'culturalLens.heading'
                        ).trim(),

                    intro:
                        resolveTutorContentValue(
                            culturalLens.intro || '',
                            'culturalLens.intro'
                        ).trim()
                },

                card: {
                    title:
                        String(
                            contextCard.title || ''
                        ).trim(),

                    contextLine:
                        String(
                            contextCard.contextLine || ''
                        ).trim(),

                    teaser:
                        String(
                            contextCard.teaser || ''
                        ).trim(),

                    context:
                        String(
                            contextCard.context || ''
                        ).trim(),

                    questions:
                        Array.isArray(
                            contextCard.questions
                        )
                            ? contextCard.questions.slice()
                            : [],

                    followTheThread:
                        Array.isArray(
                            contextCard.followTheThread
                        )
                            ? contextCard.followTheThread.slice()
                            : []
                },

                existingLanguage,

                brief:
                    String(
                        brief || ''
                    ).trim()
            });

    const contextId =
        `cl-${cardId}`;

    const committed =
        commitMyVersionDocumentMutation(
            (document, overrides) => {
                const target =
                    getMyVersionUpgradeTarget(
                        document,
                        contextId
                    );

                if (
                    !target ||
                    target.upgrade
                ) {
                    return null;
                }

                removeMyVersionUpgradeOverrides(
                    overrides,
                    contextId
                );

                target.upgrade = {
                    term:
                        generated.term,

                    type:
                        generated.type,

                    definition:
                        generated.definition,

                    ordinary:
                        generated.ordinary,

                    upgraded:
                        generated.upgraded,

                    priority:
                        generated.priority,

                    atlasPrompt:
                        generated.atlasPrompt
                };

                return {
                    contextId,
                    upgrade:
                        cloneTutorSubjectDocument(
                            target.upgrade
                        )
                };
            }
        );

    if (!committed) return null;

    if (options?.reveal !== false) {
        refreshMyVersionUpgradeFocus(
            contextId,
            true
        );
    }

    return committed.upgrade;
}

function getMyVersionCulturalLensLanguageUpgradeCandidateIds() {
    if (
        !myVersionEditing ||
        !isOwnedSubjectRuntime()
    ) {
        return [];
    }

    const starterCard =
        getPristineMyVersionCulturalLensStarter();

    return clCards
        .map(card =>
            materializeMyVersionCulturalLensCard(
                card
            )
        )
        .filter(Boolean)
        .filter(card =>
            !starterCard ||
            card.id !== starterCard.id
        )
        .filter(card =>
            !card.upgrade
        )
        .map(card => card.id);
}

async function enrichMyVersionCulturalLensFromUI() {
    if (
        !myVersionEditing ||
        myVersionSaving ||
        !isOwnedSubjectRuntime() ||
        myVersionEnrichingDiscussion ||
        myVersionEnrichingCulturalLens
    ) {
        return null;
    }

    const candidateIds =
        getMyVersionCulturalLensLanguageUpgradeCandidateIds();

    if (!candidateIds.length) {
        refreshMyVersionFullSubjectReadyNotice();
        return [];
    }

    const completedIds = [];
    const failedIds = [];

    myVersionCulturalLensEnrichmentError = '';
    myVersionEnrichingCulturalLens = true;
    myVersionCulturalLensEnrichmentProgress = {
        current: 0,
        total: candidateIds.length
    };

    updateMyVersionAuthorBar();

    try {
        for (
            let index = 0;
            index < candidateIds.length;
            index += 1
        ) {
            const cardId = candidateIds[index];

            myVersionCulturalLensEnrichmentProgress = {
                current: index + 1,
                total: candidateIds.length
            };

            updateMyVersionAuthorBar();

            const upgrade =
                await runMyVersionEnrichmentOperationWithRetry(
                    () =>
                        generateMyVersionCulturalLensUpgrade(
                            cardId,
                            '',
                            { reveal: false }
                        ),
                    `Cultural Lens language upgrade ${index + 1}`
                );

            if (upgrade) {
                completedIds.push(cardId);
            } else {
                failedIds.push(cardId);
            }
        }

        if (failedIds.length) {
            myVersionCulturalLensEnrichmentError =
                `${failedIds.length} finishing touch${failedIds.length === 1 ? '' : 'es'} still remaining.`;
        }

        return completedIds;
    } finally {
        myVersionEnrichingCulturalLens = false;
        myVersionCulturalLensEnrichmentProgress = null;

        if (myVersionEditing) {
            refreshMyVersionFullSubjectReadyNotice();
            updateMyVersionAuthorBar();
        }
    }
}

async function generateMyVersionMomentFromUI(setId) {
    if (
        !myVersionEditing ||
        myVersionSaving ||
        !isOwnedSubjectRuntime() ||
        myVersionGeneratingMomentSetIds.has(setId)
    ) {
        return null;
    }

    myVersionMomentGenerationErrors.delete(setId);
    myVersionGeneratingMomentSetIds.add(setId);

    const refreshSetControls = () => {
        if (activeSetId !== setId) return;

        const currentSet = discussionSets.find(
            set => set.id === setId
        );

        if (currentSet) {
            renderMoments(currentSet);
        }
    };

    refreshSetControls();

    try {
        const generatedMoment =
            await generateMyVersionMoment(setId);

        if (!generatedMoment && myVersionEditing) {
            throw new Error(
                'Atlas AI did not create a Moment.'
            );
        }

        return generatedMoment;
    } catch (error) {
        console.error(
            '[Compass] AI Moment generation failed:',
            error
        );

        if (myVersionEditing) {
            myVersionMomentGenerationErrors.set(
                setId,
                'Couldn’t generate a moment. Try again.'
            );
        }

        return null;
    } finally {
        myVersionGeneratingMomentSetIds.delete(setId);
        refreshSetControls();
    }
}

function duplicateMyVersionMoment(setId, momentId) {
    const sourceSet = discussionSets.find(
        set => set.id === setId
    );

    const sourceMoment = sourceSet?.moments.find(
        moment => moment.id === momentId
    );

    const duplicate = materializeMyVersionMoment(
        sourceMoment
    );

    if (!duplicate) return;

    duplicate.id = createTutorAuthoredContentId('moment');

    if (Array.isArray(duplicate.followUps)) {
        duplicate.followUps = duplicate.followUps.map(
            followUp => ({
                ...followUp,
                id: createTutorAuthoredContentId(
                    'follow-up'
                )
            })
        );
    }

    const duplicated = commitMyVersionDocumentMutation(
        document => {
            const set = getMyVersionDocumentSet(
                document,
                setId
            );

            const index = set?.moments.findIndex(
                moment => moment.id === momentId
            ) ?? -1;

            if (!set || index < 0) return null;

            set.moments.splice(
                index + 1,
                0,
                duplicate
            );

            return {
                setId,
                momentId: duplicate.id
            };
        }
    );

    if (!duplicated) return;

    activeSetId = setId;

    window.setTimeout(() => {
        openDiscussionFocus(
            setId,
            duplicate.id,
            document.getElementById(
                `moment-card-${duplicate.id}`
            )
        );
    }, 0);
}

function moveMyVersionMoment(setId, momentId, direction) {
    const offset = direction < 0 ? -1 : 1;

    commitMyVersionDocumentMutation(document => {
        const set = getMyVersionDocumentSet(
            document,
            setId
        );

        const index = set?.moments.findIndex(
            moment => moment.id === momentId
        ) ?? -1;

        const nextIndex = index + offset;

        if (
            !set ||
            index < 0 ||
            nextIndex < 0 ||
            nextIndex >= set.moments.length
        ) {
            return null;
        }

        const [moment] = set.moments.splice(index, 1);
        set.moments.splice(nextIndex, 0, moment);

        return {
            setId,
            momentId
        };
    });
}

function removeMyVersionMoment(setId, momentId) {
    commitMyVersionDocumentMutation(
        (document, overrides) => {
            const set = getMyVersionDocumentSet(
                document,
                setId
            );

            if (!set || set.moments.length <= 1) {
                return null;
            }

            const index = set.moments.findIndex(
                moment => moment.id === momentId
            );

            if (index < 0) return null;

            set.moments.splice(index, 1);
            removeMyVersionMomentOverrides(
                overrides,
                momentId
            );

            return {
                setId,
                momentId
            };
        }
    );
}

function getMyVersionDocumentMoment(document, momentId) {
    for (const set of document?.discussionSets || []) {
        const moment = set.moments?.find(
            item => item.id === momentId
        );

        if (moment) {
            return { set, moment };
        }
    }

    return null;
}

async function generateMyVersionMomentPathway(
    momentId,
    brief = '',
    options = {}
) {
    if (
        !myVersionEditing ||
        myVersionSaving ||
        !isOwnedSubjectRuntime()
    ) {
        return null;
    }

    const sourceSet = discussionSets.find(
        set =>
            Array.isArray(set.moments) &&
            set.moments.some(
                moment => moment.id === momentId
            )
    );

    const contextSet =
        materializeMyVersionDiscussionSet(
            sourceSet
        );

    const contextMoment =
        contextSet?.moments?.find(
            moment => moment.id === momentId
        ) || null;

    if (!contextSet || !contextMoment) {
        return null;
    }

    const currentFollowUps =
        getDiscussionMomentFollowUps(
            contextMoment
        );

    if (
        currentFollowUps.length >=
        DISCUSSION_FOLLOW_UP_LIMIT
    ) {
        return null;
    }

    const existingPathways =
        discussionSets
            .map(set =>
                materializeMyVersionDiscussionSet(
                    set
                )
            )
            .filter(Boolean)
            .flatMap(set =>
                (set.moments || []).flatMap(moment =>
                    getDiscussionMomentFollowUps(
                        moment
                    ).map(followUp => ({
                        setTitle:
                            String(
                                set.title || ''
                            ).trim(),

                        momentQuestion:
                            String(
                                moment.question || ''
                            ).trim(),

                        kind:
                            String(
                                followUp.kind || ''
                            ).trim(),

                        prompt:
                            String(
                                followUp.prompt || ''
                            ).trim()
                    }))
                )
            );

    const generated =
        await requireAtlasAI()
            .generateDiscussionPathway({
                subject: {
                    title:
                        getEffectiveSubjectTitle(),

                    description:
                        getEffectiveSubjectCatalogDescription()
                },

                set: {
                    title:
                        String(
                            contextSet.title || ''
                        ).trim(),

                    stage:
                        String(
                            contextSet.stage || ''
                        ).trim(),

                    description:
                        String(
                            contextSet.description || ''
                        ).trim()
                },

                moment: {
                    preview:
                        String(
                            contextMoment.preview || ''
                        ).trim(),

                    question:
                        String(
                            contextMoment.question || ''
                        ).trim()
                },

                existingPathways,

                brief:
                    String(
                        brief || ''
                    ).trim()
            });

    const followUpId =
        createTutorAuthoredContentId(
            'follow-up'
        );

    const committed =
        commitMyVersionDocumentMutation(
            document => {
                const result =
                    getMyVersionDocumentMoment(
                        document,
                        momentId
                    );

                if (!result) return null;

                const followUps =
                    ensureMyVersionMomentFollowUps(
                        result.moment
                    );

                if (
                    followUps.length >=
                    DISCUSSION_FOLLOW_UP_LIMIT
                ) {
                    return null;
                }

                followUps.push({
                    id: followUpId,
                    kind:
                        generated.kind,
                    prompt:
                        generated.prompt
                });

                return {
                    momentId,
                    followUp:
                        cloneTutorSubjectDocument(
                            followUps[
                                followUps.length - 1
                            ]
                        )
                };
            }
        );

    if (!committed?.followUp) {
        return null;
    }

    if (options?.reveal !== false) {
        setDiscussionFocusFollowUp(
            followUpId,
            `follow-up-${followUpId}`
        );
    }

    return committed.followUp;
}

async function generateMyVersionMomentPathwayFromUI(
    momentId
) {
    if (
        !myVersionEditing ||
        myVersionSaving ||
        !isOwnedSubjectRuntime() ||
        myVersionGeneratingPathwayMomentIds.has(
            momentId
        )
    ) {
        return null;
    }

    myVersionPathwayGenerationErrors.delete(
        momentId
    );

    myVersionGeneratingPathwayMomentIds.add(
        momentId
    );

    renderDiscussionFocusContinuationControls();

    try {
        const generated =
            await generateMyVersionMomentPathway(
                momentId
            );

        if (!generated && myVersionEditing) {
            throw new Error(
                'Atlas AI did not create a pathway.'
            );
        }

        return generated;
    } catch (error) {
        console.error(
            '[Compass] AI Discussion pathway generation failed:',
            error
        );

        if (myVersionEditing) {
            myVersionPathwayGenerationErrors.set(
                momentId,
                'Couldn’t generate a pathway. Try again.'
            );
        }

        return null;
    } finally {
        myVersionGeneratingPathwayMomentIds.delete(
            momentId
        );

        if (myVersionEditing) {
            renderDiscussionFocusContinuationControls();
        }
    }
}

function addMyVersionMomentFollowUp(momentId) {
    const followUpId = createTutorAuthoredContentId(
        'follow-up'
    );

    const added = commitMyVersionDocumentMutation(
        document => {
            const result = getMyVersionDocumentMoment(
                document,
                momentId
            );

            if (!result) return null;

            const followUps = ensureMyVersionMomentFollowUps(
                result.moment
            );

            if (
                followUps.length >=
                DISCUSSION_FOLLOW_UP_LIMIT
            ) {
                return null;
            }

            followUps.push({
                id: followUpId,
                kind: 'go-deeper',
                prompt: 'What could you explore next?'
            });

            return {
                momentId,
                followUpId
            };
        }
    );

    if (!added) return;

    setDiscussionFocusFollowUp(
        followUpId,
        `follow-up-${followUpId}`
    );
}

function removeMyVersionMomentFollowUp(
    momentId,
    followUpId
) {
    const removed = commitMyVersionDocumentMutation(
        (document, overrides) => {
            const result = getMyVersionDocumentMoment(
                document,
                momentId
            );

            if (!result) return null;

            const followUps = ensureMyVersionMomentFollowUps(
                result.moment
            );

            const index = followUps.findIndex(
                followUp => followUp.id === followUpId
            );

            if (index < 0) return null;

            followUps.splice(index, 1);

            removeMyVersionFollowUpOverrides(
                overrides,
                momentId,
                followUpId
            );

            if (!followUps.length) {
                delete result.moment.followUps;
            }

            return {
                momentId,
                followUpId
            };
        }
    );

    if (!removed) return;

    discussionFocusFollowUpId = null;
    discussionFocusFollowUpOpen = false;
    renderDiscussionFocus();
}

function moveMyVersionMomentFollowUp(
    momentId,
    followUpId,
    direction
) {
    const offset = direction < 0 ? -1 : 1;

    commitMyVersionDocumentMutation(document => {
        const result = getMyVersionDocumentMoment(
            document,
            momentId
        );

        if (!result) return null;

        const followUps = ensureMyVersionMomentFollowUps(
            result.moment
        );

        const index = followUps.findIndex(
            followUp => followUp.id === followUpId
        );

        const nextIndex = index + offset;

        if (
            index < 0 ||
            nextIndex < 0 ||
            nextIndex >= followUps.length
        ) {
            return null;
        }

        const [followUp] = followUps.splice(index, 1);
        followUps.splice(nextIndex, 0, followUp);

        return {
            momentId,
            followUpId
        };
    });
}

function changeMyVersionMomentFollowUpKind(
    momentId,
    followUpId,
    kind
) {
    if (!DISCUSSION_FOLLOW_UP_KINDS.includes(kind)) {
        return;
    }

    commitMyVersionDocumentMutation(
        (document, overrides) => {
            const result = getMyVersionDocumentMoment(
                document,
                momentId
            );

            if (!result) return null;

            const followUps = ensureMyVersionMomentFollowUps(
                result.moment
            );

            const followUp = followUps.find(
                item => item.id === followUpId
            );

            if (!followUp || followUp.kind === kind) {
                return null;
            }

            followUp.kind = kind;
            delete followUp.label;

            delete overrides[
                getDiscussionFollowUpFieldKey(
                    momentId,
                    followUpId,
                    'label'
                )
            ];

            return {
                momentId,
                followUpId
            };
        }
    );
}

function commitMyVersionMomentFollowUpLabel(
    momentId,
    followUpId,
    value
) {
    const nextLabel = normalizeLiveEditableText(
        value,
        false
    ).slice(0, DISCUSSION_FOLLOW_UP_LABEL_LIMIT);

    commitMyVersionDraftContent(
        getDiscussionFollowUpFieldKey(
            momentId,
            followUpId,
            'label'
        ),
        nextLabel
    );
}

function addMyVersionSetActivity(setId) {
    const added = commitMyVersionDocumentMutation(
        document => {
            const set = getMyVersionDocumentSet(
                document,
                setId
            );

            if (!set || set.makeItReal) {
                return null;
            }

            set.makeItReal = {
                label: 'Make It Real',
                title: 'New closing activity',
                prompt: 'What would you like the learner to do?'
            };

            return { setId };
        }
    );

    if (!added) return;

    activeSetId = setId;

    window.setTimeout(() => {
        openDiscussionFocus(
            setId,
            DISCUSSION_FOCUS_MAKE_IT_REAL_ID,
            document.getElementById(
                `make-it-real-card-${setId}`
            )
        );
    }, 0);
}

function removeMyVersionSetActivity(setId) {
    commitMyVersionDocumentMutation(
        (document, overrides) => {
            const set = getMyVersionDocumentSet(
                document,
                setId
            );

            if (!set?.makeItReal) {
                return null;
            }

            delete set.makeItReal;

            removeMyVersionSetActivityOverrides(
                overrides,
                setId
            );

            return { setId };
        }
    );
}

function getLiveTutorHistoryScopeKey(
    sessionId = currentSessionId,
    contentId = getTutorContentId()
) {
    return `${sessionId}::${contentId}`;
}

function getLiveTutorHistory() {
    const scopeKey = getLiveTutorHistoryScopeKey();

    if (!liveTutorHistoryByScope.has(scopeKey)) {
        liveTutorHistoryByScope.set(scopeKey, {
            undo: [],
            redo: []
        });
    }

    return liveTutorHistoryByScope.get(scopeKey);
}

function cloneLiveTutorOverrides() {
    return {
        ...(tutorContentLiveDraft?.overrides || {})
    };
}

function cacheLiveTutorOverrides(overrides) {
    const nextOverrides = {
        ...(overrides || {})
    };

    if (Object.keys(nextOverrides).length === 0) {
        tutorContentLiveDraft = null;
        updateLiveTutorContentControl();
        return;
    }

    const current = tutorContentLiveDraft || {
        schemaVersion: 1,
        ownerId: 'local-tutor',
        sessionId: currentSessionId,
        contentId: getTutorContentId(),
        baseContentVersion: MODULE.contentVersion,
        revision: 0,
        updatedAt: 0,
        overrides: {}
    };

    tutorContentLiveDraft = {
        ...current,
        sessionId: currentSessionId,
        contentId: getTutorContentId(),
        updatedAt: Date.now(),
        overrides: nextOverrides
    };

    updateLiveTutorContentControl();
}

function recordLiveTutorHistory(before, after) {
    const history = getLiveTutorHistory();

    history.undo.push({
        before: { ...before },
        after: { ...after }
    });

    if (history.undo.length > LIVE_TUTOR_HISTORY_LIMIT) {
        history.undo.shift();
    }

    history.redo.length = 0;
}

function clearLiveTutorHistory() {
    liveTutorHistoryByScope.delete(
        getLiveTutorHistoryScopeKey()
    );
}

function persistLiveTutorSnapshot(
    overrides,
    sessionId,
    contentId,
    mutationRevision
) {
    const snapshot = {
        ...(overrides || {})
    };

    queueTutorContentWrite(async () => {
        const Store = requireAtlasTutorContent();

        await Store.clearLiveDraft(
            sessionId,
            contentId
        );

        const saved = Object.keys(snapshot).length
            ? await Store.saveLiveDraft(
                sessionId,
                contentId,
                {
                    baseContentVersion: MODULE.contentVersion,
                    overrides: snapshot
                }
            )
            : null;

        if (
            mutationRevision === liveTutorMutationRevision &&
            sessionId === currentSessionId &&
            contentId === getTutorContentId()
        ) {
            tutorContentLiveDraft = saved;
            updateLiveTutorContentControl();
        }
    });
}

function applyLiveTutorHistorySnapshot(overrides) {
    const sessionId = currentSessionId;
    const contentId = getTutorContentId();
    const mutationRevision = ++liveTutorMutationRevision;

    cacheLiveTutorOverrides(overrides);
    renderAllTutorContentSurfaces();

    persistLiveTutorSnapshot(
        overrides,
        sessionId,
        contentId,
        mutationRevision
    );
}

function undoLiveTutorContent() {
    const history = getLiveTutorHistory();
    const action = history.undo.pop();

    if (!action) return false;

    history.redo.push(action);
    applyLiveTutorHistorySnapshot(action.before);

    return true;
}

function redoLiveTutorContent() {
    const history = getLiveTutorHistory();
    const action = history.redo.pop();

    if (!action) return false;

    history.undo.push(action);
    applyLiveTutorHistorySnapshot(action.after);

    return true;
}

function handleLiveTutorHistoryShortcut(event) {
    if (
        !(event.ctrlKey || event.metaKey) ||
        event.altKey
    ) {
        return;
    }

    const liveTarget = event.target instanceof Element
        ? event.target.closest(
            '[data-atlas-live-editable="true"]'
        )
        : null;

    if (
        liveTarget?.dataset.atlasTutorNativeDirty === 'true'
    ) {
        return;
    }

    const key = String(event.key || '').toLowerCase();
    const wantsUndo = key === 'z' && !event.shiftKey;
    const wantsRedo = (
        (key === 'z' && event.shiftKey) ||
        (key === 'y' && !event.shiftKey)
    );

    if (!wantsUndo && !wantsRedo) return;

    const handled = myVersionEditing
        ? (
            wantsRedo
                ? redoMyVersionContent()
                : undoMyVersionContent()
        )
        : (
            wantsRedo
                ? redoLiveTutorContent()
                : undoLiveTutorContent()
        );

    if (!handled) return;

    event.preventDefault();
    event.stopPropagation();
}

function commitLiveTutorContent(fieldKey, value) {
    const requiresValue =
        /^paths\.(discussionTitle|culturalLensTitle|reflectionTitle)$/
            .test(fieldKey);

    if (requiresValue && !String(value ?? '').trim()) {
        renderAllTutorContentSurfaces();
        return false;
    }

    const sessionId = currentSessionId;
    const contentId = getTutorContentId();
    const before = cloneLiveTutorOverrides();
    const after = {
        ...before,
        [fieldKey]: value
    };
    const mutationRevision = ++liveTutorMutationRevision;

    recordLiveTutorHistory(before, after);
    cacheLiveTutorOverrides(after);

    queueTutorContentWrite(async () => {
        const saved = await requireAtlasTutorContent()
            .saveLiveDraft(
                sessionId,
                contentId,
                {
                    baseContentVersion: MODULE.contentVersion,
                    overrides: {
                        [fieldKey]: value
                    }
                }
            );

        if (
            saved &&
            mutationRevision === liveTutorMutationRevision &&
            sessionId === currentSessionId &&
            contentId === getTutorContentId()
        ) {
            tutorContentLiveDraft = saved;
            updateLiveTutorContentControl();
        }
    });
}

function getDiscussionPreviewFieldKey(momentId) {
    return `discussion.${momentId}.preview`;
}

function getDiscussionQuestionFieldKey(momentId) {
    return `discussion.${momentId}.question`;
}

function getDiscussionFollowUpFieldKey(
    momentId,
    followUpId,
    field = 'prompt'
) {
    return [
        'discussion',
        momentId,
        'followUp',
        followUpId,
        field
    ].join('.');
}

function getDiscussionSetFieldKey(setId, field) {
    return `discussion.set.${setId}.${field}`;
}

function getDiscussionMakeItRealFieldKey(setId, field) {
    return `discussion.set.${setId}.makeItReal.${field}`;
}

function getCulturalLensFieldKey(cardId, field) {
    return `culturalLens.${cardId}.${field}`;
}

function getCulturalLensQuestionFieldKey(cardId, index) {
    return `culturalLens.${cardId}.questions.${index}`;
}

function getCulturalLensThreadFieldKey(cardId, index) {
    return `culturalLens.${cardId}.followTheThread.${index}`;
}

function getReflectionQuestionFieldKey(index) {
    return `reflection.questions.${index}`;
}

function updateLiveTutorContentControl() {
    const control = document.getElementById(
        'atlas-live-changes-control'
    );

    const count = document.getElementById(
        'atlas-live-changes-count'
    );

    const changeCount = getLiveTutorContentChangeCount();

    if (control) {
        control.hidden =
            myVersionEditing || changeCount === 0;
    }

    if (count) {
        count.textContent = changeCount === 1
            ? '1 live change'
            : `${changeCount} live changes`;
    }
}

function renderAllTutorContentSurfaces() {
    applyCoverConfig();
    applyDerivedLabels();
    applySubjectCopy();
    renderAllCompassNavigation();
    applySubjectIdentityChrome();
    updateSessionUI();
    updateAppearanceToggleUI();
    renderCLGrid();
    renderDiscussionSets();

    if (activeSetId) {
        const set = discussionSets.find(
            item => item.id === activeSetId
        );

        if (set) {
            setText(
                'moments-panel-title',
                resolveTutorContentValue(
                    set.title,
                    getDiscussionSetFieldKey(set.id, 'title')
                )
            );

            renderMoments(set);
        }
    }

    if (isDiscussionFocusOpen()) {
        renderDiscussionFocus();
    }

    if (isCulturalLensFocusOpen()) {
        renderCulturalLensFocus();
    }

    updateReflectionCompleteState();
    updateLiveTutorContentControl();
    updateMyVersionAuthorBar();
}

async function restoreLiveTutorContent() {
    const activeElement = document.activeElement;

    if (isLiveTutorContentTarget(activeElement)) {
        activeElement.blur();
    }

    await tutorContentWriteQueue;

    const cleared = await requireAtlasTutorContent()
        .clearLiveDraft(
            currentSessionId,
            getTutorContentId()
        );

    if (!cleared) return;

    tutorContentLiveDraft = null;
    liveTutorMutationRevision += 1;
    clearLiveTutorHistory();
    renderAllTutorContentSurfaces();
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

function getOwnedSubjectLaunchUrl(subjectId) {
    const id = String(subjectId || '').trim();

    if (!id) return '';

    try {
        const destination = new URL(
            '../subject/index.html',
            window.location.href
        );

        destination.searchParams.set('id', id);
        destination.searchParams.set(
            'from',
            getLaunchOriginId()
        );

        return destination.href;
    } catch {
        return '';
    }
}

function publishOwnedSubjectProjection(subject) {
    if (!subject?.id) return null;

    const Bridge = requireAtlasBridge();
    const metadata = subject.metadata || {};
    const module = subject.document?.module || {};

    const title = String(
        metadata.title ||
        module.title ||
        'Untitled Subject'
    ).trim() || 'Untitled Subject';

    const navTitle = String(
        metadata.navTitle ||
        module.navTitle ||
        title
    ).trim() || title;

    const description = String(
        metadata.description ||
        module.catalogDescription ||
        ''
    ).trim();

    const coverImage = String(
        metadata.coverImage ||
        module.bgImage ||
        ''
    ).trim();

    return Bridge.upsertItem({
        registryId:
            typeof Bridge.getContentRegistryId === 'function'
                ? Bridge.getContentRegistryId(
                    COMPASS_WORLD_ID,
                    subject.id
                )
                : `${COMPASS_WORLD_ID}:${subject.id}`,
        world: COMPASS_WORLD_ID,
        type: 'subject',
        schemaVersion: Math.max(
            1,
            Math.floor(
                Number(subject.document?.schemaVersion) || 1
            )
        ),
        contentVersion:
            `owned-r${Math.max(
                1,
                Math.floor(Number(subject.revision) || 1)
            )}`,
        id: subject.id,
        title,
        navTitle,
        description,
        hook: description,
        coverImage,
        ownershipKind: 'my-subject',
        hasMyVersion: false,
        status: 'available',
        launchUrl: getOwnedSubjectLaunchUrl(subject.id)
    });
}

function getLaunchOriginId() {
    try {
        const origin = new URL(
            window.location.href
        ).searchParams.get('from');

        return ['atlas', 'compass', 'arcade'].includes(origin)
            ? origin
            : 'compass';
    } catch {
        return 'compass';
    }
}

function getLaunchOriginModel() {
    const origin = getLaunchOriginId();

    const origins = {
        atlas: {
            label: 'Atlas',
            url: '../../index.html'
        },
        compass: {
            label: 'Compass',
            url: '../index.html'
        },
        arcade: {
            label: 'Arcade',
            url: '../../arcade/index.html'
        }
    };

    return origins[origin] || origins.compass;
}

function applyLaunchOriginUI() {
    const origin = getLaunchOriginModel();
    const button = document.getElementById('cover-back-link');

    setText('cover-back-label', `Back to ${origin.label}`);

    if (button) {
        button.title = `Back to ${origin.label}`;
        button.setAttribute(
            'aria-label',
            `Back to ${origin.label}`
        );
    }
}

function returnToLaunchOrigin() {
    const origin = getLaunchOriginModel();

    try {
        window.location.assign(
            new URL(origin.url, window.location.href).href
        );
    } catch {
        window.location.assign(origin.url);
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
        const publishedTitle = getPublishedSubjectTitle();
        const publishedDescription =
            getPublishedSubjectCatalogDescription();
        const publishedCoverImage =
            getPublishedSubjectCoverImage();
        const hasMyVersion = hasSavedMyVersion();

        const ownershipKind = isOwnedSubjectRuntime()
            ? 'my-subject'
            : hasMyVersion
                ? 'my-version'
                : 'atlas';

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
            title: publishedTitle,
            navTitle: publishedTitle,
            description: publishedDescription,
            hook: publishedDescription,
            coverImage: publishedCoverImage,
            ownershipKind,
            hasMyVersion,
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
            title: publishedTitle,
            navTitle: publishedTitle,
            description: publishedDescription,
            hook: publishedDescription,
            coverImage: publishedCoverImage,
            ownershipKind,
            hasMyVersion,
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
            ownershipKind,
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

function normalizeLiveEditableText(value, multiline) {
    const normalized = String(value ?? '')
        .replace(/\u00a0/g, ' ')
        .replace(/\u200b/g, '')
        .replace(/\r\n?/g, '\n');

    if (!multiline) {
        return normalized
            .replace(/\s+/g, ' ')
            .trim();
    }

    return normalized
        .split('\n')
        .map(line => line.replace(/[ \t]+$/g, ''))
        .join('\n')
        .trim();
}

function readLiveEditableText(element, multiline) {
    return normalizeLiveEditableText(
        element?.innerText ?? element?.textContent ?? '',
        multiline
    );
}

function writeLiveEditableText(element, value) {
    if (!element) return;

    element.textContent = String(value ?? '');
    element.dataset.atlasLiveEmpty = String(
        element.textContent.length === 0
    );
}

function insertPlainTextAtSelection(text) {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    range.deleteContents();

    const node = document.createTextNode(text);

    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);
}

function isLiveTutorContentTarget(target) {
    return Boolean(
        target instanceof Element &&
        target.closest('[data-atlas-live-editable="true"]')
    );
}

function disableLiveTutorContentElement(element) {
    if (!element) return;

    element.removeAttribute('contenteditable');
    element.removeAttribute('role');
    element.removeAttribute('aria-multiline');
    element.removeAttribute('spellcheck');
    element.removeAttribute('data-atlas-live-editable');
    element.removeAttribute('data-atlas-live-empty');

    delete element.dataset.atlasTutorFieldKey;
    delete element.dataset.atlasTutorMultiline;
    delete element.dataset.atlasTutorStartValue;
    delete element.dataset.atlasTutorCancel;
    delete element.dataset.atlasTutorNativeDirty;

    const originalTabIndex =
        element.dataset.atlasTutorOriginalTabindex;

    if (originalTabIndex === '') {
        element.removeAttribute('tabindex');
    } else if (originalTabIndex !== undefined) {
        element.setAttribute('tabindex', originalTabIndex);
    }

    delete element.dataset.atlasTutorOriginalTabindex;

    element.onclick = null;
    element.onfocus = null;
    element.oninput = null;
    element.onbeforeinput = null;
    element.onpaste = null;
    element.onkeydown = null;
    element.onblur = null;
}

function configureLiveTutorContentElement(
    element,
    {
        fieldKey,
        value,
        multiline = true
    }
) {
    if (!element || !fieldKey) {
        disableLiveTutorContentElement(element);
        return;
    }

    writeLiveEditableText(element, value);

    if (
        element.dataset.atlasTutorOriginalTabindex === undefined
    ) {
        element.dataset.atlasTutorOriginalTabindex =
            element.getAttribute('tabindex') || '';
    }

    element.setAttribute('contenteditable', 'plaintext-only');
    element.setAttribute('role', 'textbox');
    element.setAttribute('aria-multiline', String(multiline));
    element.setAttribute('spellcheck', 'true');
    element.setAttribute('data-atlas-live-editable', 'true');
    element.dataset.atlasTutorFieldKey = fieldKey;
    element.dataset.atlasTutorMultiline = String(multiline);
    element.tabIndex = 0;

    element.onclick = event => {
        event.stopPropagation();
    };

    element.onfocus = () => {
        element.dataset.atlasTutorStartValue =
            readLiveEditableText(element, multiline);

        delete element.dataset.atlasTutorCancel;
        element.dataset.atlasTutorNativeDirty = 'false';
    };

    element.oninput = () => {
        const nextValue = readLiveEditableText(
            element,
            multiline
        );

        element.dataset.atlasLiveEmpty = String(
            nextValue.length === 0
        );

        element.dataset.atlasTutorNativeDirty = 'true';

        if (myVersionEditing) {
            const startValue =
                element.dataset.atlasTutorStartValue || '';

            const previewOverrides =
                nextValue === startValue
                    ? myVersionDraftOverrides
                    : {
                        ...myVersionDraftOverrides,
                        [fieldKey]: nextValue
                    };

            refreshMyVersionDirtyState(
                previewOverrides
            );

            scheduleMyVersionWorkingDraftSave(
                previewOverrides
            );
        }
    };

    element.onbeforeinput = event => {
        if (String(event.inputType || '').startsWith('format')) {
            event.preventDefault();
        }
    };

    element.onpaste = event => {
        event.preventDefault();

        const pasted = event.clipboardData
            ?.getData('text/plain') || '';

        const plainText = multiline
            ? pasted.replace(/\r\n?/g, '\n')
            : pasted.replace(/\s+/g, ' ');

        insertPlainTextAtSelection(plainText);
        element.dispatchEvent(new Event('input'));
    };

    element.onkeydown = event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.stopPropagation();
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();

            element.dataset.atlasTutorCancel = 'true';

            writeLiveEditableText(
                element,
                element.dataset.atlasTutorStartValue || ''
            );

            element.blur();
            return;
        }

        if (!multiline && event.key === 'Enter') {
            event.preventDefault();
            element.blur();
        }
    };

    element.onblur = () => {
        const cancelled =
            element.dataset.atlasTutorCancel === 'true';

        const startValue =
            element.dataset.atlasTutorStartValue || '';

        const nextValue = readLiveEditableText(
            element,
            multiline
        );

        writeLiveEditableText(element, nextValue);

        delete element.dataset.atlasTutorStartValue;
        delete element.dataset.atlasTutorCancel;
        delete element.dataset.atlasTutorNativeDirty;

        if (cancelled || nextValue === startValue) {
            return;
        }

        if (myVersionEditing) {
            commitMyVersionDraftContent(
                fieldKey,
                nextValue
            );
        } else {
            commitLiveTutorContent(fieldKey, nextValue);
        }
    };
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
            <rect
                x="5"
                y="5"
                width="90"
                height="90"
                rx="24"
                fill="#4F7772"/>
            <circle
                cx="50"
                cy="50"
                r="28"
                fill="none"
                stroke="#DFF4EE"
                stroke-width="7"/>
            <path
                d="M71 29L57 57L29 71L43 43Z"
                fill="#FFFFFF"
                stroke="#FFFFFF"
                stroke-width="2"
                stroke-linejoin="round"/>
            <path
                d="M71 29L57 57L50 50Z"
                fill="#A9D9CF"/>
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

function resolvePublishedTutorContentValue(
    originalValue,
    fieldKey
) {
    if (hasTutorContentOverride(tutorContentVersion, fieldKey)) {
        return String(
            tutorContentVersion.overrides[fieldKey] ?? ''
        );
    }

    return String(originalValue ?? '');
}

function getMaterializationDiscussionMoment(
    document,
    momentId
) {
    for (const set of document?.discussionSets || []) {
        const moment = (set.moments || []).find(
            item => item.id === momentId
        );

        if (moment) return moment;
    }

    return null;
}

function getMaterializationCulturalLensCard(
    document,
    cardId
) {
    return (document?.culturalLensCards || []).find(
        card => card.id === cardId
    ) || null;
}

function applyPublishedMyVersionOverride(
    document,
    fieldKey,
    value
) {
    const nextValue = String(value ?? '');

    const exactTargets = {
        'module.title': [document?.module, 'title'],
        'module.bgImage': [document?.module, 'bgImage'],
        'module.catalogDescription': [
            document?.module,
            'catalogDescription'
        ],
        'cover.hook': [
            document?.subjectCopy?.cover,
            'hook'
        ],
        'overview.heading': [
            document?.subjectCopy?.overview,
            'heading'
        ],
        'overview.question': [
            document?.subjectCopy?.overview,
            'question'
        ],
        'paths.discussionTitle': [
            document?.subjectCopy?.paths,
            'discussionTitle'
        ],
        'paths.discussionDescription': [
            document?.subjectCopy?.paths,
            'discussionDescription'
        ],
        'paths.culturalLensTitle': [
            document?.subjectCopy?.paths,
            'culturalLensTitle'
        ],
        'paths.culturalLensDescription': [
            document?.subjectCopy?.paths,
            'culturalLensDescription'
        ],
        'paths.reflectionTitle': [
            document?.subjectCopy?.paths,
            'reflectionTitle'
        ],
        'paths.reflectionDescription': [
            document?.subjectCopy?.paths,
            'reflectionDescription'
        ],
        'culturalLens.heading': [
            document?.subjectCopy?.culturalLens,
            'heading'
        ],
        'culturalLens.intro': [
            document?.subjectCopy?.culturalLens,
            'intro'
        ],
        'discussion.heading': [
            document?.subjectCopy?.discussion,
            'heading'
        ],
        'discussion.intro': [
            document?.subjectCopy?.discussion,
            'intro'
        ],
        'reflection.title': [
            document?.subjectCopy?.reflection,
            'title'
        ],
        'reflection.summary': [
            document?.subjectCopy?.reflection,
            'summary'
        ]
    };

    if (Object.prototype.hasOwnProperty.call(
        exactTargets,
        fieldKey
    )) {
        const [target, field] = exactTargets[fieldKey];

        if (!target) return false;

        target[field] = nextValue;
        return true;
    }

    let match = fieldKey.match(/^overview\.intro\.(\d+)$/);

    if (match) {
        const intro = document?.subjectCopy?.overview?.intro;
        const index = Number(match[1]);

        if (!Array.isArray(intro) || index >= intro.length) {
            return false;
        }

        intro[index] = nextValue;
        return true;
    }

    match = fieldKey.match(/^reflection\.questions\.(\d+)$/);

    if (match) {
        const questions =
            document?.subjectCopy?.reflection?.questions;
        const index = Number(match[1]);

        if (
            !Array.isArray(questions) ||
            index >= questions.length
        ) {
            return false;
        }

        questions[index] = nextValue;
        return true;
    }

    match = fieldKey.match(
        /^discussion\.set\.([^.]+)\.makeItReal\.(label|title|prompt)$/
    );

    if (match) {
        const set = (document?.discussionSets || []).find(
            item => item.id === match[1]
        );

        if (!set?.makeItReal) return false;

        set.makeItReal[match[2]] = nextValue;
        return true;
    }

    match = fieldKey.match(
        /^discussion\.set\.([^.]+)\.(stage|title|description)$/
    );

    if (match) {
        const set = (document?.discussionSets || []).find(
            item => item.id === match[1]
        );

        if (!set) return false;

        set[match[2]] = nextValue;
        return true;
    }

    match = fieldKey.match(
        /^discussion\.([^.]+)\.(preview|question)$/
    );

    if (match) {
        const moment = getMaterializationDiscussionMoment(
            document,
            match[1]
        );

        if (!moment) return false;

        moment[match[2]] = nextValue;
        return true;
    }

    match = fieldKey.match(
        /^discussion\.([^.]+)\.followUp\.([^.]+)\.(prompt|label)$/
    );

    if (match) {
        const moment = getMaterializationDiscussionMoment(
            document,
            match[1]
        );

        if (!moment) return false;

        const followUps = Array.isArray(moment.followUps)
            ? moment.followUps
            : moment.followUp
                ? [moment.followUp]
                : [];

        const followUp = followUps.find(
            item => item.id === match[2]
        );

        if (!followUp) return false;

        followUp[match[3]] = nextValue;
        return true;
    }

    match = fieldKey.match(
        /^culturalLens\.([^.]+)\.(contextLine|title|teaser|context|questionLabel|followTheThreadLabel|mainQuestion)$/
    );

    if (match) {
        const card = getMaterializationCulturalLensCard(
            document,
            match[1]
        );

        if (!card) return false;

        if (
            match[2] === 'mainQuestion' &&
            Array.isArray(card.questions)
        ) {
            return true;
        }

        card[match[2]] = nextValue;
        return true;
    }

    match = fieldKey.match(
        /^culturalLens\.([^.]+)\.questions\.(\d+)$/
    );

    if (match) {
        const card = getMaterializationCulturalLensCard(
            document,
            match[1]
        );
        const index = Number(match[2]);

        if (
            !Array.isArray(card?.questions) ||
            index >= card.questions.length
        ) {
            return false;
        }

        card.questions[index] = nextValue;
        return true;
    }

    match = fieldKey.match(
        /^culturalLens\.([^.]+)\.followTheThread\.(\d+)$/
    );

    if (match) {
        const card = getMaterializationCulturalLensCard(
            document,
            match[1]
        );
        const index = Number(match[2]);

        if (
            !Array.isArray(card?.followTheThread) ||
            index >= card.followTheThread.length
        ) {
            return false;
        }

        card.followTheThread[index] = nextValue;
        return true;
    }

    match = fieldKey.match(
        /^upgrade\.(moment|cultural-lens)\.([^.]+)\.(term|type|definition|ordinary|upgraded|atlasPrompt|insteadOfLabel|tryLabel)$/
    );

    if (match) {
        const sourceKind = match[1];
        const sourceElementId = match[2];
        const field = match[3];

        const target = sourceKind === 'moment'
            ? getMaterializationDiscussionMoment(
                document,
                sourceElementId
            )
            : getMaterializationCulturalLensCard(
                document,
                sourceElementId
            );

        if (!target?.upgrade) return false;

        target.upgrade[field] = nextValue;
        return true;
    }

    return false;
}

function materializeTutorSubjectDocument(
    sourceDocument,
    sourceOverrides,
    label = 'Tutor subject'
) {
    const document = normalizeTutorSubjectDocument(
        sourceDocument ||
        ATLAS_SUBJECT_DOCUMENT
    );

    const overrides = cloneTutorContentOverrides(
        sourceOverrides
    );

    const unmappedOverrideKeys = Object.entries(overrides)
        .filter(([fieldKey, value]) =>
            !applyPublishedMyVersionOverride(
                document,
                fieldKey,
                value
            )
        )
        .map(([fieldKey]) => fieldKey);

    if (unmappedOverrideKeys.length) {
        throw new Error(
            `[Compass] ${label} materialization has unmapped overrides: ${unmappedOverrideKeys.join(', ')}`
        );
    }

    return cloneTutorSubjectDocument(document);
}

function materializePublishedMyVersionDocument() {
    if (!tutorContentVersion) return null;

    return materializeTutorSubjectDocument(
        tutorContentVersion.document ||
        ATLAS_SUBJECT_DOCUMENT,
        tutorContentVersion.overrides,
        'My Version'
    );
}

function syncOwnedSubjectRuntime(subject) {
    if (
        !isOwnedSubjectRuntime() ||
        !subject?.document
    ) {
        return false;
    }

    const normalized = normalizeTutorSubjectDocument(
        subject.document
    );

    replaceTutorSubjectObject(
        ATLAS_SUBJECT_DOCUMENT,
        normalized
    );

    const title = String(
        normalized.module?.title || MODULE.title
    ).trim() || MODULE.title;

    MODULE.title = title;
    MODULE.titleHtml = escHtml(title);
    MODULE.navTitle = String(
        normalized.module?.navTitle ||
        title
    ).trim() || title;
    MODULE.bgImage = String(
        normalized.module?.bgImage || ''
    ).trim();
    MODULE.catalogDescription = String(
        normalized.module?.catalogDescription || ''
    ).trim();
    MODULE.schemaVersion = Math.max(
        1,
        Math.floor(
            Number(normalized.schemaVersion) || 1
        )
    );
    MODULE.contentVersion =
        `owned-r${Math.max(
            1,
            Math.floor(Number(subject.revision) || 1)
        )}`;

    window.AtlasCompassSubjectRuntime = {
        ...getCompassSubjectRuntime(),
        revision: Math.max(
            1,
            Math.floor(Number(subject.revision) || 1)
        )
    };

    return true;
}

async function createSubjectFromPublishedMyVersion() {
    if (!tutorContentVersion) {
        throw new Error(
            '[Compass] Cannot create an owned subject because this Atlas subject has no published My Version.'
        );
    }

    const document =
        materializePublishedMyVersionDocument();

    if (!document) {
        throw new Error(
            '[Compass] Published My Version could not be materialized.'
        );
    }

    const Subjects = requireAtlasTutorSubjects();

    const subject = await Subjects.createSubject({
        format: 'structured',

        metadata: {
            title:
                String(
                    document.module?.title || MODULE.title
                ).trim() || MODULE.title,

            navTitle:
                String(
                    document.module?.navTitle ||
                    document.module?.title ||
                    MODULE.navTitle ||
                    MODULE.title
                ).trim(),

            description:
                String(
                    document.module?.catalogDescription || ''
                ).trim(),

            coverImage:
                String(
                    document.module?.bgImage || ''
                ).trim()
        },

        document,

        provenance: {
            kind: 'atlas-my-version',
            sourceWorld: COMPASS_WORLD_ID,
            sourceSubjectId: MODULE.id,
            sourceContentId: getTutorContentId(),
            sourceContentVersion:
                typeof MODULE.contentVersion === 'string'
                    ? MODULE.contentVersion
                    : '',
            sourceVersionRevision:
                Math.max(
                    0,
                    Math.floor(
                        Number(tutorContentVersion.revision) || 0
                    )
                )
        }
    });

    if (!subject) {
        throw new Error(
            '[Compass] AtlasTutorSubjects failed to create the owned subject.'
        );
    }

    return subject;
}

function getEffectiveSubjectTitle() {
    const draftTitle =
        isOwnedSubjectRuntime() &&
        myVersionEditing &&
        typeof myVersionDraftDocument?.module?.title === 'string'
            ? myVersionDraftDocument.module.title
            : MODULE.title;

    return resolveTutorContentValue(
        draftTitle,
        'module.title'
    ).trim() || MODULE.title;
}

function getPublishedSubjectTitle() {
    return resolvePublishedTutorContentValue(
        MODULE.title,
        'module.title'
    ).trim() || MODULE.title;
}

function getEffectiveSubjectCoverImage() {
    const draftImage =
        isOwnedSubjectRuntime() &&
        myVersionEditing &&
        typeof myVersionDraftDocument?.module?.bgImage === 'string'
            ? myVersionDraftDocument.module.bgImage
            : MODULE.bgImage;

    return resolveTutorContentValue(
        draftImage,
        'module.bgImage'
    ).trim() || MODULE.bgImage;
}

function getPublishedSubjectCoverImage() {
    return resolvePublishedTutorContentValue(
        MODULE.bgImage,
        'module.bgImage'
    ).trim() || MODULE.bgImage;
}

function getEffectiveSubjectCatalogDescription() {
    const draftDescription =
        isOwnedSubjectRuntime() &&
        myVersionEditing &&
        typeof myVersionDraftDocument?.module
            ?.catalogDescription === 'string'
            ? myVersionDraftDocument
                .module
                .catalogDescription
            : ATLAS_SUBJECT_DOCUMENT
                .module
                .catalogDescription || '';

    return resolveTutorContentValue(
        draftDescription,
        'module.catalogDescription'
    ).trim();
}

function getPublishedSubjectCatalogDescription() {
    const originalDescription =
        ATLAS_SUBJECT_DOCUMENT
            .module
            .catalogDescription || '';

    return resolvePublishedTutorContentValue(
        originalDescription,
        'module.catalogDescription'
    ).trim();
}

function getEffectivePathTitle(pathKey, fallback) {
    const originalValue =
        subjectCopy.paths?.[pathKey] || fallback;

    return resolveTutorContentValue(
        originalValue,
        `paths.${pathKey}`
    ).trim() || fallback;
}

function getDiscussionPathTitle() {
    return getEffectivePathTitle(
        'discussionTitle',
        'Discussion'
    );
}

function getCulturalLensPathTitle() {
    return getEffectivePathTitle(
        'culturalLensTitle',
        'Cultural Lens'
    );
}

function getReflectionPathTitle() {
    return getEffectivePathTitle(
        'reflectionTitle',
        'Reflection'
    );
}

function getNavItemLabel(item) {
    if (!item?.labelKey) {
        return item?.label || '';
    }

    return getEffectivePathTitle(
        item.labelKey,
        item.label
    );
}

function applySubjectIdentityChrome() {
    const title = getEffectiveSubjectTitle();
    const ownedSubject = isOwnedSubjectRuntime();
    const subjectLabel = myVersionEditing
        ? ownedSubject
            ? `${title} · Editing My Subject`
            : `${title} · Editing My Version`
        : ownedSubject
            ? `${title} · My Subject`
            : hasSavedMyVersion()
                ? `${title} · My Version`
                : title;

    document
        .querySelectorAll(
            '.nav-brand-subject, .mobile-header-context'
        )
        .forEach(element => {
            element.textContent = subjectLabel;
        });

    setText('mobile-drawer-subject-title', subjectLabel);

    setText(
        'cover-eyebrow-label',
        myVersionEditing
            ? ownedSubject
                ? 'EDITING MY SUBJECT'
                : 'EDITING MY VERSION'
            : ownedSubject
                ? 'MY SUBJECT'
                : hasSavedMyVersion()
                    ? 'MY VERSION'
                    : 'COMPASS SUBJECT'
    );
}

function applyCoverConfig() {
    const title = getEffectiveSubjectTitle();
    const coverImage =
        getEffectiveSubjectCoverImage() ||
        'https://thumbs.dreamstime.com/b/compass-gold-center-blue-arrow-purple-compass-rose-set-against-rainbow-colors-vintage-compass-colorful-background-359049338.jpg?w=992';

    document.title = title;

    const coverTitle = document.getElementById('cover-title');

    if (coverTitle) {
        if (myVersionEditing) {
            configureLiveTutorContentElement(
                coverTitle,
                {
                    fieldKey: 'module.title',
                    value: title,
                    multiline: false
                }
            );
        } else {
            disableLiveTutorContentElement(coverTitle);

            if (
                hasTutorContentOverride(
                    tutorContentVersion,
                    'module.title'
                )
            ) {
                coverTitle.textContent = title;
            } else {
                coverTitle.innerHTML = MODULE.titleHtml;
            }
        }
    }

    document.documentElement.style.setProperty(
        '--module-bg-image',
        `url(${JSON.stringify(coverImage)})`
    );
}

function renderOverviewIntro() {
    const container = document.getElementById('overview-intro');

    if (!container) return;

    const paragraphs = Array.isArray(subjectCopy.overview.intro)
        ? subjectCopy.overview.intro
        : [];

    const visibleParagraphs = paragraphs
        .map((paragraph, index) => ({ paragraph, index }))
        .filter(({ paragraph }) =>
            typeof paragraph === 'string' && paragraph.trim()
        );

    container.innerHTML = visibleParagraphs
        .map(({ index }) => `<p data-overview-intro-index="${index}"></p>`)
        .join('');

    visibleParagraphs.forEach(({ paragraph, index }) => {
        const fieldKey = `overview.intro.${index}`;
        const value = resolveTutorContentValue(
            paragraph,
            fieldKey
        );

        configureLiveTutorContentElement(
            container.querySelector(
                `[data-overview-intro-index="${index}"]`
            ),
            {
                fieldKey,
                value,
                multiline: true
            }
        );
    });
}

function renderReflectionQuestions() {
    const container = document.getElementById(
        'reflection-questions'
    );

    if (!container) return;

    const source = Array.isArray(
        subjectCopy.reflection.questions
    )
        ? subjectCopy.reflection.questions
        : [];

    const questions = source.map((question, index) => {
        const fieldKey = getReflectionQuestionFieldKey(
            index
        );

        return {
            index,
            fieldKey,
            value: resolveTutorContentValue(
                question,
                fieldKey
            )
        };
    });

    const visibleQuestions = myVersionEditing
        ? questions
        : questions.filter(question =>
            question.value.trim()
        );

    container.hidden =
        !myVersionEditing &&
        visibleQuestions.length === 0;

    container.classList.toggle(
        'is-empty-authoring',
        myVersionEditing &&
        visibleQuestions.length === 0
    );

    if (container.hidden) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = visibleQuestions.map(
        (question, position) => `
            <div class="reflection-q"
                data-reflection-question-row="${question.index}">
                <p class="reflection-q-text"
                    data-reflection-question-index="${question.index}"></p>

                ${myVersionEditing
                    ? `
                        <div class="reflection-question-author-controls">
                            <button class="moment-author-control"
                                type="button"
                                data-reflection-question-action="up"
                                data-reflection-question-index="${question.index}"
                                aria-label="Move reflection question earlier"
                                title="Move earlier"
                                ${position === 0 ? 'disabled' : ''}>
                                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path d="M4 10l4-4 4 4"
                                        stroke="currentColor"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"/>
                                </svg>
                            </button>

                            <button class="moment-author-control"
                                type="button"
                                data-reflection-question-action="down"
                                data-reflection-question-index="${question.index}"
                                aria-label="Move reflection question later"
                                title="Move later"
                                ${position === visibleQuestions.length - 1
                                    ? 'disabled'
                                    : ''}>
                                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path d="M4 6l4 4 4-4"
                                        stroke="currentColor"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"/>
                                </svg>
                            </button>

                            <button class="moment-author-control moment-author-control--danger"
                                type="button"
                                data-reflection-question-action="remove"
                                data-reflection-question-index="${question.index}"
                                aria-label="Remove reflection question"
                                title="Remove question">
                                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path d="M3.5 4.5h9M6 4.5V3.2c0-.66.54-1.2 1.2-1.2h1.6c.66 0 1.2.54 1.2 1.2v1.3M5 6.5l.45 6.1c.05.78.7 1.4 1.49 1.4h2.12c.79 0 1.44-.62 1.49-1.4L11 6.5"
                                        stroke="currentColor"
                                        stroke-width="1.25"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    `
                    : ''}
            </div>
        `
    ).join('');

    if (myVersionEditing) {
        container.insertAdjacentHTML(
            'beforeend',
            `
                <button class="reflection-question-add"
                    type="button"
                    data-reflection-question-add>
                    <svg width="15" height="15" viewBox="0 0 15 15"
                        fill="none" aria-hidden="true">
                        <path d="M7.5 2.5v10M2.5 7.5h10"
                            stroke="currentColor"
                            stroke-width="1.45"
                            stroke-linecap="round"/>
                    </svg>
                    Add reflection question
                </button>
            `
        );
    }

    visibleQuestions.forEach(question => {
        configureLiveTutorContentElement(
            container.querySelector(
                `[data-reflection-question-index="${question.index}"]`
            ),
            {
                fieldKey: question.fieldKey,
                value: question.value,
                multiline: true
            }
        );
    });

    container.querySelectorAll(
        '[data-reflection-question-action]'
    ).forEach(button => {
        const index = Number(
            button.dataset.reflectionQuestionIndex
        );

        button.onclick = () => {
            const action =
                button.dataset.reflectionQuestionAction;

            if (action === 'up') {
                moveMyVersionReflectionQuestion(
                    index,
                    -1
                );
                return;
            }

            if (action === 'down') {
                moveMyVersionReflectionQuestion(
                    index,
                    1
                );
                return;
            }

            removeMyVersionReflectionQuestion(index);
        };
    });

    container.querySelector(
        '[data-reflection-question-add]'
    )?.addEventListener('click', () => {
        addMyVersionReflectionQuestion();
    });
}

function configureStaticTutorContentField(
    elementId,
    originalValue,
    fieldKey,
    {
        multiline = true,
        allowAbsent = false,
        myVersionOnly = false
    } = {}
) {
    const element = document.getElementById(elementId);

    if (!element) return;

    const fieldExists =
        (
            typeof originalValue === 'string' &&
            originalValue.trim()
        ) ||
        hasTutorContentOverride(tutorContentVersion, fieldKey) ||
        hasTutorContentOverride(tutorContentLiveDraft, fieldKey);

    if (!fieldExists && !allowAbsent) {
        element.hidden = true;
        element.textContent = '';
        disableLiveTutorContentElement(element);
        return;
    }

    const value = resolveTutorContentValue(
        originalValue,
        fieldKey
    );

    element.hidden = false;

    if (myVersionOnly && !myVersionEditing) {
        writeLiveEditableText(element, value);
        disableLiveTutorContentElement(element);
        return;
    }

    configureLiveTutorContentElement(
        element,
        {
            fieldKey,
            value,
            multiline
        }
    );
}

function applySubjectCopy() {
    configureStaticTutorContentField(
        'cover-hook',
        subjectCopy.cover.hook,
        'cover.hook',
        { multiline: false }
    );

    configureStaticTutorContentField(
        'overview-heading',
        subjectCopy.overview.heading,
        'overview.heading',
        { multiline: false }
    );

    renderOverviewIntro();

    configureStaticTutorContentField(
        'overview-question',
        subjectCopy.overview.question,
        'overview.question',
        { multiline: true }
    );

    configureStaticTutorContentField(
        'path-title-disc',
        subjectCopy.paths.discussionTitle || 'Discussion',
        'paths.discussionTitle',
        {
            multiline: false,
            myVersionOnly: true
        }
    );

    configureStaticTutorContentField(
        'path-desc-disc',
        subjectCopy.paths.discussionDescription,
        'paths.discussionDescription',
        {
            multiline: true,
            myVersionOnly: true
        }
    );

    configureStaticTutorContentField(
        'path-title-cl',
        subjectCopy.paths.culturalLensTitle || 'Cultural Lens',
        'paths.culturalLensTitle',
        {
            multiline: false,
            myVersionOnly: true
        }
    );

    configureStaticTutorContentField(
        'path-desc-cl',
        subjectCopy.paths.culturalLensDescription,
        'paths.culturalLensDescription',
        {
            multiline: true,
            myVersionOnly: true
        }
    );

    setText(
        'discussion-section-eyebrow',
        getDiscussionPathTitle()
    );

    setText(
        'cl-section-eyebrow',
        getCulturalLensPathTitle()
    );

    configureStaticTutorContentField(
        'reflection-path-title',
        subjectCopy.paths.reflectionTitle,
        'paths.reflectionTitle',
        {
            multiline: false,
            myVersionOnly: true
        }
    );

    configureStaticTutorContentField(
        'reflection-path-desc',
        subjectCopy.paths.reflectionDescription,
        'paths.reflectionDescription',
        {
            multiline: true,
            myVersionOnly: true
        }
    );

    configureStaticTutorContentField(
        'cl-section-heading',
        subjectCopy.culturalLens.heading,
        'culturalLens.heading',
        { multiline: false }
    );

    configureStaticTutorContentField(
        'cl-section-intro',
        subjectCopy.culturalLens.intro,
        'culturalLens.intro',
        { multiline: true }
    );

    configureStaticTutorContentField(
        'discussion-section-heading',
        subjectCopy.discussion.heading,
        'discussion.heading',
        { multiline: false }
    );

    configureStaticTutorContentField(
        'discussion-section-intro',
        subjectCopy.discussion.intro,
        'discussion.intro',
        {
            multiline: true,
            allowAbsent: myVersionEditing
        }
    );

    configureStaticTutorContentField(
        'reflection-title',
        subjectCopy.reflection.title,
        'reflection.title',
        { multiline: false }
    );

    configureStaticTutorContentField(
        'reflection-summary',
        subjectCopy.reflection.summary,
        'reflection.summary',
        { multiline: true }
    );

    renderReflectionQuestions();
    updateLiveTutorContentControl();
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

    const complete =
        isLessonComplete() && !myVersionEditing;

    view.classList.toggle('reflection-complete', complete);
    updateReflectionProgressSummary();

    const reflectionTitle = document.getElementById(
        'reflection-title'
    );

    if (complete) {
        disableLiveTutorContentElement(reflectionTitle);

        setText(
            'reflection-title',
            `You explored ${getEffectiveSubjectTitle()}`
        );
    } else {
        configureLiveTutorContentElement(
            reflectionTitle,
            {
                fieldKey: 'reflection.title',
                value: resolveTutorContentValue(
                    subjectCopy.reflection.title,
                    'reflection.title'
                ),
                multiline: false
            }
        );
    }

    button.disabled = false;
    button.classList.toggle('btn-complete-done', complete);
    button.setAttribute('aria-pressed', String(complete));
    button.innerHTML = complete
        ? `
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none"
                    aria-hidden="true">
                    <path d="M5.25 4.25H2.5V1.5"
                        stroke="currentColor"
                        stroke-width="1.35"
                        stroke-linecap="round"
                        stroke-linejoin="round"/>
                    <path d="M2.75 4.1A5.75 5.75 0 1 1 2.4 10"
                        stroke="currentColor"
                        stroke-width="1.35"
                        stroke-linecap="round"/>
                </svg>
                Undo wrap up
            `
        : `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                    aria-hidden="true">
                    <path d="M8 2.25V12.5"
                        stroke="currentColor"
                        stroke-width="1.35"
                        stroke-linecap="round"/>
                    <circle cx="8" cy="5.25" r="2.15"
                        stroke="currentColor"
                        stroke-width="1.35"/>
                    <path d="M4.5 10.25L8 13l3.5-2.75"
                        stroke="currentColor"
                        stroke-width="1.35"
                        stroke-linecap="round"
                        stroke-linejoin="round"/>
                </svg>
                Wrap up this subject
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

function isUsingAtlasPathTitle(pathKey, fallback) {
    const atlasTitle = String(
        ATLAS_SUBJECT_DOCUMENT
            .subjectCopy
            ?.paths
            ?.[pathKey] || fallback
    ).trim();

    return getEffectivePathTitle(
        pathKey,
        fallback
    ) === atlasTitle;
}

function applyDerivedLabels() {
    const culturalLensUsesAtlasTitle = isUsingAtlasPathTitle(
        'culturalLensTitle',
        'Cultural Lens'
    );

    const culturalLensCount = clCards.length;
    const culturalLensUnit = culturalLensUsesAtlasTitle
        ? culturalLensCount === 1
            ? COMPASS_LABELS.culturalLensUnitSingular
            : COMPASS_LABELS.culturalLensUnitPlural
        : culturalLensCount === 1
            ? COMPASS_LABELS.culturalLensGenericUnitSingular
            : COMPASS_LABELS.culturalLensGenericUnitPlural;

    const culturalLensLabel = document.getElementById(
        'path-label-cl'
    );

    if (culturalLensLabel) {
        culturalLensLabel.textContent =
            `${countLabel(culturalLensCount)} ${culturalLensUnit}`;
    }

    const discussionUsesAtlasTitle = isUsingAtlasPathTitle(
        'discussionTitle',
        'Discussion'
    );

    const discussionCount = discussionUsesAtlasTitle
        ? discussionSets.reduce(
            (total, set) => total + set.moments.length,
            0
        )
        : discussionSets.length;

    const discussionUnit = discussionUsesAtlasTitle
        ? discussionCount === 1
            ? COMPASS_LABELS.discussionUnitSingular
            : COMPASS_LABELS.discussionUnitPlural
        : discussionCount === 1
            ? COMPASS_LABELS.discussionGenericUnitSingular
            : COMPASS_LABELS.discussionGenericUnitPlural;

    const discussionLabel = document.getElementById(
        'path-label-disc'
    );

    if (discussionLabel) {
        discussionLabel.textContent =
            `${countLabel(discussionCount)} ${discussionUnit}`;
    }

    setText(
        'orient-eyebrow',
        getEffectiveSubjectTitle()
    );
}


// ============================================================
// NAVIGATION RENDERING
// ============================================================

function getAtlasSearchIcon() {
    return `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <circle
                cx="6.5"
                cy="6.5"
                r="4.2"
                stroke="currentColor"
                stroke-width="1.3"/>
            <path
                d="M9.8 9.8l2.8 2.8"
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
        subject: getEffectiveSubjectTitle()
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

function renderAllCompassNavigation() {
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
}

function renderNav(containerId, activeViewId) {
    const container = document.getElementById(containerId);

    if (!container) return;

    const sessionSpanId = `nav-session-${activeViewId}`;

    const links = NAV_ITEMS.map(item => {
        const active = item.viewId === activeViewId;
        const label = getNavItemLabel(item);
        const click = active
            ? ''
            : `onclick="goToView('${item.viewId}')"`;

        return `<button
                class="nav-link${active ? ' active' : ''}"
                title="${escHtml(label)}"
                aria-label="${escHtml(label)}"
                ${click}>
                ${item.desktopSvg}
                ${escHtml(label)}
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

            <div class="nav-links">
                <div class="nav-links-rail">${links}</div>
            </div>

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

    setText(
        'mobile-drawer-subject-title',
        getEffectiveSubjectTitle()
    );

    const items = NAV_ITEMS.map(item => {
        const label = getNavItemLabel(item);

        return `
            <button
                class="mobile-nav-item"
                id="mob-nav-${item.id}"
                onclick="mobileNavTo('${item.viewId}')">
                ${item.mobileSvg}
                ${escHtml(label)}
            </button>
        `;
    }).join('');

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
    closeDiscussionFocus({
        restoreScroll: false,
        restoreFocus: false
    });

    closeCulturalLensFocus({
        restoreScroll: false,
        restoreFocus: false
    });

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

    if (myVersionEditing) {
        scheduleMyVersionWorkingDraftSave();
        updateMyVersionAuthorBar();
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

function returnToAtlasFromReflection() {
    const reflectionView = document.getElementById('view-reflection');

    if (!reflectionView?.classList.contains('reflection-complete')) {
        return;
    }

    window.location.assign(getAtlasHomeUrl());
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
        subjectTitle: getPublishedSubjectTitle(),
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

                    <span class="upgrade-visibility-copy">
                        <span>Language upgrades</span>

                        <strong>
                            ${getUpgradeVisibilityLabel(mode)}
                        </strong>
                    </span>
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

    if (isDiscussionFocusOpen()) {
        discussionFocusUpgradeOpen = false;
        renderDiscussionFocus();
    }

    if (isCulturalLensFocusOpen()) {
        culturalLensFocusUpgradeOpen = false;
        renderCulturalLensFocus();
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

function getUpgradeFieldKey(source, field) {
    return [
        'upgrade',
        source.sourceKind,
        source.sourceElementId,
        field
    ].join('.');
}

function getEffectiveUpgradeSourceFromContextId(contextId) {
    const source = getUpgradeSourceFromContextId(contextId);

    if (!source?.upgrade) return null;

    const resolveField = (field, fallback = '') =>
        resolveTutorContentValue(
            source.upgrade[field] ?? fallback,
            getUpgradeFieldKey(source, field)
        );

    const ordinary = source.upgrade.ordinary !== null &&
        source.upgrade.ordinary !== undefined
            ? resolveField('ordinary')
            : '';

    const upgraded = source.upgrade.upgraded !== null &&
        source.upgrade.upgraded !== undefined
            ? resolveField('upgraded')
            : '';

    const atlasPrompt =
        source.upgrade.atlasPrompt !== null &&
        source.upgrade.atlasPrompt !== undefined
            ? resolveField('atlasPrompt')
            : '';

    const hasOrdinaryExample = Boolean(
        ordinary.trim() && upgraded.trim()
    );

    const hasUpgradedExample = Boolean(
        upgraded.trim()
    );

    return {
        ...source,
        hasOrdinaryExample,
        hasUpgradedExample,
        upgrade: {
            ...source.upgrade,
            term: resolveField('term'),
            type:
                resolveField('type', 'expression').trim() ||
                'expression',
            definition: resolveField('definition'),
            ordinary: hasOrdinaryExample
                ? ordinary
                : null,
            upgraded: hasUpgradedExample
                ? upgraded
                : '',
            atlasPrompt,
            priority:
                MY_VERSION_UPGRADE_PRIORITIES[
                    source.upgrade.priority
                ]
                    ? source.upgrade.priority
                    : 'standard',
            insteadOfLabel: resolveTutorContentValue(
                source.upgrade.insteadOfLabel || 'Instead of',
                getUpgradeFieldKey(
                    source,
                    'insteadOfLabel'
                )
            ),
            tryLabel: resolveTutorContentValue(
                source.upgrade.tryLabel || 'Try',
                getUpgradeFieldKey(source, 'tryLabel')
            )
        }
    };
}

function configureUpgradeLiveField(
    element,
    source,
    field,
    originalValue,
    multiline
) {
    if (!element || !source?.upgrade) return;

    const fieldKey = getUpgradeFieldKey(source, field);

    configureLiveTutorContentElement(
        element,
        {
            fieldKey,
            value: resolveTutorContentValue(
                originalValue,
                fieldKey
            ),
            multiline
        }
    );
}

function configureUpgradeLiveSurface(mount, contextId) {
    const source = getUpgradeSourceFromContextId(contextId);

    if (!mount || !source?.upgrade) return;

    const typeElement = mount.querySelector(
        '.discussion-focus-upgrade-type'
    );

    if (myVersionEditing) {
        configureUpgradeLiveField(
            typeElement,
            source,
            'type',
            source.upgrade.type || 'expression',
            false
        );
    } else {
        disableLiveTutorContentElement(typeElement);
    }

    configureUpgradeLiveField(
        mount.querySelector(
            '.discussion-focus-upgrade-definition'
        ),
        source,
        'definition',
        source.upgrade.definition,
        true
    );

    if (
        source.upgrade.ordinary !== null &&
        source.upgrade.ordinary !== undefined
    ) {
        configureUpgradeLiveField(
            mount.querySelector(
                '.upgrade-example-ordinary'
            ),
            source,
            'ordinary',
            source.upgrade.ordinary,
            true
        );
    }

    if (
        source.upgrade.upgraded !== null &&
        source.upgrade.upgraded !== undefined
    ) {
        configureUpgradeLiveField(
            mount.querySelector(
                '.upgrade-example-upgraded'
            ),
            source,
            'upgraded',
            source.upgrade.upgraded,
            true
        );
    }

    const labels = mount.querySelectorAll(
        '.upgrade-example-label'
    );

    if (
        source.upgrade.ordinary !== null &&
        source.upgrade.ordinary !== undefined
    ) {
        configureUpgradeLiveField(
            labels[0],
            source,
            'insteadOfLabel',
            source.upgrade.insteadOfLabel || 'Instead of',
            false
        );

        configureUpgradeLiveField(
            labels[1],
            source,
            'tryLabel',
            source.upgrade.tryLabel || 'Try',
            false
        );
    } else if (labels[0]) {
        configureUpgradeLiveField(
            labels[0],
            source,
            'tryLabel',
            source.upgrade.tryLabel || 'Try',
            false
        );
    }

    if (
        myVersionEditing &&
        source.upgrade.atlasPrompt !== null &&
        source.upgrade.atlasPrompt !== undefined
    ) {
        configureUpgradeLiveField(
            mount.querySelector(
                '.upgrade-author-review-prompt'
            ),
            source,
            'atlasPrompt',
            source.upgrade.atlasPrompt,
            true
        );
    }
}

function buildUpgradeExamplesMarkup(upgrade) {
    if (upgrade?.ordinary && upgrade?.upgraded) {
        return `
            <div class="upgrade-transformation">
                <div class="upgrade-example-row">
                    <span class="upgrade-example-label">
                        ${escHtml(upgrade.insteadOfLabel || 'Instead of')}
                    </span>

                    <p class="upgrade-example upgrade-example-ordinary">
                        ${escHtml(upgrade.ordinary)}
                    </p>
                </div>

                <div class="upgrade-example-row upgrade-example-row-primary">
                    <span class="upgrade-example-label">
                        ${escHtml(upgrade.tryLabel || 'Try')}
                    </span>

                    <p class="upgrade-example upgrade-example-upgraded">
                        ${escHtml(upgrade.upgraded)}
                    </p>
                </div>
            </div>
        `;
    }

    if (upgrade?.upgraded) {
        return `
            <div class="upgrade-example-row upgrade-example-row-primary">
                <span class="upgrade-example-label">
                    ${escHtml(upgrade.tryLabel || 'Try')}
                </span>

                <p class="upgrade-example upgrade-example-upgraded">
                    ${escHtml(upgrade.upgraded)}
                </p>
            </div>
        `;
    }

    return '';
}

function buildMyVersionUpgradeAuthoringControls(
    contextId,
    upgrade
) {
    if (!myVersionEditing) return '';

    const hasExamples = Boolean(
        upgrade?.ordinary || upgrade?.upgraded
    );

    const hasReviewPrompt = Boolean(
        String(upgrade?.atlasPrompt || '').trim()
    );

    const priority =
        MY_VERSION_UPGRADE_PRIORITIES[upgrade?.priority]
            ? upgrade.priority
            : 'standard';

    const optionsOpen =
        myVersionUpgradeOptionsOpenContextId === contextId;

    return `
        <div class="upgrade-author-actions">
            <button class="upgrade-author-secondary"
                type="button"
                onclick="${hasExamples
                    ? `removeMyVersionUpgradeExamples(${jsArg(contextId)})`
                    : `addMyVersionUpgradeExamples(${jsArg(contextId)})`}">
                ${hasExamples
                    ? 'Remove examples'
                    : 'Add contrast examples'}
            </button>
        </div>

        <details class="upgrade-author-more"
            ${optionsOpen ? 'open' : ''}
            ontoggle="setMyVersionUpgradeOptionsOpen(${jsArg(contextId)}, this.open)">
            <summary>More options</summary>

            <div class="upgrade-author-more-content">
                <label class="upgrade-author-priority-field">
                    <span>Visibility</span>

                    <select onchange="changeMyVersionUpgradePriority(${jsArg(contextId)}, this.value)">
                        ${Object.entries(
                            MY_VERSION_UPGRADE_PRIORITIES
                        ).map(([value, label]) => `
                            <option value="${escHtml(value)}"
                                ${value === priority
                                    ? 'selected'
                                    : ''}>
                                ${escHtml(label)}
                            </option>
                        `).join('')}
                    </select>
                </label>

                <p class="upgrade-author-priority-hint">
                    Key language appears in the default Key view. All language only appears when the tutor chooses All.
                </p>

                ${hasReviewPrompt ? `
                    <div class="upgrade-author-review">
                        <div class="upgrade-author-review-header">
                            <span>Atlas review question</span>

                            <button type="button"
                                onclick="removeMyVersionUpgradeReviewPrompt(${jsArg(contextId)})">
                                Remove
                            </button>
                        </div>

                        <p class="upgrade-author-review-prompt">
                            ${escHtml(upgrade.atlasPrompt)}
                        </p>
                    </div>
                ` : `
                    <button class="upgrade-author-add-review"
                        type="button"
                        onclick="addMyVersionUpgradeReviewPrompt(${jsArg(contextId)})">
                        Add Atlas review question
                    </button>
                `}
            </div>
        </details>

        <div class="upgrade-panel-actions upgrade-panel-actions--authoring">
            <button class="upgrade-author-danger"
                type="button"
                onclick="removeMyVersionUpgrade(${jsArg(contextId)})">
                Remove language support
            </button>
        </div>
    `;
}

function buildUpgradeFooterControls(
    contextId,
    upgrade,
    saved
) {
    if (myVersionEditing) {
        return buildMyVersionUpgradeAuthoringControls(
            contextId,
            upgrade
        );
    }

    return `
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
    `;
}

function buildAddUpgradeControl(contextId) {
    if (!myVersionEditing) return '';

    return `
        <button class="upgrade-author-add"
            type="button"
            onclick="addMyVersionUpgrade(${jsArg(contextId)})">
            <svg width="14" height="14" viewBox="0 0 14 14"
                fill="none" aria-hidden="true">
                <path d="M7 2.5v9M2.5 7h9"
                    stroke="currentColor"
                    stroke-width="1.35"
                    stroke-linecap="round"/>
            </svg>

            Add language support
        </button>
    `;
}

function getSavedLanguageEntryId(contextId) {
    const Bridge = requireAtlasBridge();
    const activeSession = getCurrentBridgeSession();
    const source = getEffectiveUpgradeSourceFromContextId(
        contextId
    );

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

function getUpgradeReviewPrompt(upgrade) {
    const authoredPrompt = String(
        upgrade?.atlasPrompt || ''
    ).trim();

    if (authoredPrompt) return authoredPrompt;

    const term = String(upgrade?.term || 'this expression')
        .trim();

    return `What does “${term}” mean, and how could you use it in a new situation?`;
}

function buildSavedLanguageEntry(contextId) {
    const activeSession = getCurrentBridgeSession();
    const source = getEffectiveUpgradeSourceFromContextId(
        contextId
    );

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
        sourceTitle: getPublishedSubjectTitle(),
        sourceNavTitle: getPublishedSubjectTitle(),
        sourceElementId: source.sourceElementId,
        sourceKind: source.sourceKind,

        term: upgrade.term,
        type: upgrade.type,
        definition: upgrade.definition,
        ordinary: upgrade.ordinary ?? null,
        upgraded: upgrade.upgraded,
        priority: upgrade.priority,
        atlasPrompt: getUpgradeReviewPrompt(upgrade),

        savedAt: timestamp,
        lastTouchedAt: timestamp
    };
}

function updateUpgradeSaveButton(contextId) {
    const saved = isUpgradeSaved(contextId);

    const button = document.getElementById(`us-${contextId}`);

    if (button) {
        button.classList.toggle('is-saved', saved);
        button.setAttribute('aria-pressed', String(saved));
        button.title = saved
            ? 'Remove from Language Bank'
            : 'Save to Language Bank';
        button.textContent = saved ? 'Saved' : 'Save';
    }

    document
        .querySelectorAll('[data-upgrade-context-id]')
        .forEach(trigger => {
            if (
                trigger.dataset.upgradeContextId !== contextId
            ) {
                return;
            }

            const term = trigger.dataset.upgradeTerm || '';

            trigger.classList.toggle('is-saved', saved);

            trigger.setAttribute(
                'aria-label',
                saved
                    ? `Open saved Language Upgrade: ${term}`
                    : `Open Language Upgrade: ${term}`
            );

            const iconMount = trigger.querySelector(
                '.discussion-focus-upgrade-trigger-icon'
            );

            const label = trigger.querySelector(
                '.discussion-focus-upgrade-trigger-label'
            );

            if (iconMount) {
                iconMount.innerHTML = saved
                    ? SAVED_UPGRADE_ICON_SVG
                    : UPGRADE_ICON_SVG;
            }

            if (label) {
                label.textContent =
                    `${saved ? 'Saved' : 'Upgrade'}: ${term}`;
            }
        });
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

function removeSavedLanguageEntryById(entryId, event) {
    event?.stopPropagation();
    event?.preventDefault();

    const Bridge = requireAtlasBridge();
    const activeSession = getCurrentBridgeSession();
    const cleanEntryId = String(entryId || '').trim();

    if (!cleanEntryId) return;

    const ledger = Bridge.readLedger();

    if (ledger.entries?.[cleanEntryId]) {
        delete ledger.entries[cleanEntryId];
        Bridge.writeLedger(ledger);
    }

    removeSavedLanguageFromWrapUp(
        activeSession.id,
        cleanEntryId
    );

    renderVocabBank();
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

                ${buildUpgradeExamplesMarkup(upgrade)}

                ${buildUpgradeFooterControls(
                    contextId,
                    upgrade,
                    saved
                )}
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
    const focusMainsToReset = new Set();

    document.querySelectorAll('.upgrade-panel.open').forEach(panel => {
        const focusMain = panel
            .closest('.discussion-focus-view')
            ?.querySelector('.discussion-focus-main');

        if (
            panel.closest('.focus-view-upgrade') &&
            focusMain
        ) {
            focusMainsToReset.add(focusMain);
        }

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

    focusMainsToReset.forEach(main => {
        main.scrollTo({
            top: 0,
            behavior: getScrollBehavior()
        });
    });
}

function toggleUpgrade(contextId, event) {
    event?.stopPropagation();

    const chip = document.getElementById(`uc-${contextId}`);
    const panel = document.getElementById(`up-${contextId}`);

    if (!chip || !panel) return;

    const opening = !panel.classList.contains('open');

    const focusMain = panel
        .closest('.discussion-focus-view')
        ?.querySelector('.discussion-focus-main');

    const inFocusView = Boolean(
        panel.closest('.focus-view-upgrade') &&
        focusMain
    );

    closeAllUpgradePanels();

    if (!opening) return;

    panel.classList.add('open');
    panel
        .closest('.moment-upgrade-wrap')
        ?.classList.add('upgrade-open');

    chip.classList.add('open');
    chip.setAttribute('aria-expanded', 'true');

    if (inFocusView) {
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                focusMain.scrollTo({
                    top: focusMain.scrollHeight,
                    behavior: getScrollBehavior()
                });
            });
        });

        return;
    }

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
    const icon = explored
        ? `<svg class="explored-state-icon" width="13" height="13"
                viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <path d="M2.35 6.7L5.2 9.35L10.65 3.65"
                    stroke="currentColor"
                    stroke-width="1.55"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>
            </svg>`
        : `<svg class="explored-state-icon" width="13" height="13"
                viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <circle cx="6.5" cy="6.5" r="4.35"
                    stroke="currentColor"
                    stroke-width="1.35"/>
            </svg>`;

    return `${icon}
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
        const label = myVersionEditing
            ? 'Continue editing'
            : isLessonComplete()
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

    if (isDiscussionFocusOpen()) {
        updateDiscussionFocusExploredButton();
    }

    if (isCulturalLensFocusOpen()) {
        updateCulturalLensFocusExploredButton();
    }

    updateCoverActionUI();
}


// ============================================================
// CULTURAL LENS
// ============================================================

function configureMyVersionCulturalLensCard(
    element,
    card,
    index,
    title,
    teaser,
    contextLine
) {
    if (!myVersionEditing) return;

    element.classList.add('cl-card--authoring');
    element.setAttribute('role', 'group');
    element.removeAttribute('tabindex');
    element.setAttribute(
        'aria-label',
        `Edit card ${index + 1}: ${title}`
    );
    element.onclick = null;
    element.onkeydown = null;

    configureLiveTutorContentElement(
        element.querySelector('.cl-card-title'),
        {
            fieldKey: getCulturalLensFieldKey(
                card.id,
                'title'
            ),
            value: title,
            multiline: false
        }
    );

    const teaserElement = element.querySelector(
        '.cl-card-teaser'
    );

    if (teaserElement) {
        configureLiveTutorContentElement(
            teaserElement,
            {
                fieldKey: getCulturalLensFieldKey(
                    card.id,
                    'teaser'
                ),
                value: teaser,
                multiline: true
            }
        );
    }

    const contextLineElement = element.querySelector(
        '.cl-card-location'
    );

    if (contextLineElement) {
        configureLiveTutorContentElement(
            contextLineElement,
            {
                fieldKey: getCulturalLensFieldKey(
                    card.id,
                    'contextLine'
                ),
                value: contextLine,
                multiline: false
            }
        );
    }

    element.querySelectorAll(
        '[data-cultural-lens-add-field]'
    ).forEach(button => {
        button.onclick = () => {
            addMyVersionCulturalLensCardField(
                card.id,
                button.dataset.culturalLensAddField
            );
        };
    });

    const controls = document.createElement('div');
    controls.className = 'cl-card-author-controls';

    const openButton = document.createElement('button');

    openButton.type = 'button';
    openButton.className = [
        'moment-author-control',
        'cl-card-author-open'
    ].join(' ');
    openButton.title = 'Edit card contents';
    openButton.setAttribute(
        'aria-label',
        'Edit card contents'
    );
    openButton.innerHTML = `
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="3.25" cy="4.5" r="0.72"
                fill="currentColor"/>
            <circle cx="3.25" cy="8" r="0.72"
                fill="currentColor"/>
            <circle cx="3.25" cy="11.5" r="0.72"
                fill="currentColor"/>

            <path d="M5.5 4.5h7M5.5 8h7M5.5 11.5h7"
                stroke="currentColor"
                stroke-width="1.25"
                stroke-linecap="round"/>
        </svg>
    `;

    openButton.onclick = () => {
        openCulturalLensFocus(
            index,
            openButton
        );
    };

    controls.appendChild(openButton);

    const actions = [
        {
            label: 'Move card earlier',
            disabled: index === 0,
            className: '',
            icon: `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M4 10l4-4 4 4"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"/>
                </svg>`,
            run: () => moveMyVersionCulturalLensCard(
                card.id,
                -1
            )
        },
        {
            label: 'Move card later',
            disabled: index === clCards.length - 1,
            className: '',
            icon: `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M4 6l4 4 4-4"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"/>
                </svg>`,
            run: () => moveMyVersionCulturalLensCard(
                card.id,
                1
            )
        },
        {
            label: 'Duplicate card',
            disabled: false,
            className: '',
            icon: `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <rect x="5" y="5" width="7" height="7" rx="1.5"
                        stroke="currentColor"
                        stroke-width="1.3"/>
                    <path d="M4 10H3.5A1.5 1.5 0 012 8.5v-5A1.5 1.5 0 013.5 2h5A1.5 1.5 0 0110 3.5V4"
                        stroke="currentColor"
                        stroke-width="1.3"
                        stroke-linecap="round"/>
                </svg>`,
            run: () => duplicateMyVersionCulturalLensCard(
                card.id
            )
        },
        {
            label: clCards.length <= 1
                ? 'Keep at least one card'
                : 'Remove card',
            disabled: clCards.length <= 1,
            className: 'moment-author-control--danger',
            icon: `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3.5 4.5h9M6 4.5V3.2c0-.66.54-1.2 1.2-1.2h1.6c.66 0 1.2.54 1.2 1.2v1.3M5 6.5l.45 6.1c.05.78.7 1.4 1.49 1.4h2.12c.79 0 1.44-.62 1.49-1.4L11 6.5"
                        stroke="currentColor"
                        stroke-width="1.25"
                        stroke-linecap="round"
                        stroke-linejoin="round"/>
                </svg>`,
            run: () => removeMyVersionCulturalLensCard(
                card.id
            )
        }
    ];

    actions.forEach(action => {
        const button = document.createElement('button');

        button.type = 'button';
        button.className = [
            'moment-author-control',
            action.className
        ].filter(Boolean).join(' ');
        button.disabled = action.disabled;
        button.title = action.label;
        button.setAttribute('aria-label', action.label);
        button.innerHTML = action.icon;
        button.onclick = action.run;

        controls.appendChild(button);
    });

    element.appendChild(controls);
}

function renderMyVersionAddCulturalLensCardControl(grid) {
    if (!myVersionEditing) return;

    const block = document.createElement('div');
    block.className =
        'cl-card-author-create-block';

    const controls = document.createElement('div');
    controls.className =
        'moment-author-create-row';

    const addButton = document.createElement('button');

    addButton.type = 'button';
    addButton.className =
        'moment-author-add cl-card-author-add';

    addButton.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 15 15"
            fill="none" aria-hidden="true">
            <path d="M7.5 2.5v10M2.5 7.5h10"
                stroke="currentColor"
                stroke-width="1.45"
                stroke-linecap="round"/>
        </svg>
        Add card
    `;

    addButton.onclick = () => {
        myVersionCulturalLensGenerationError = '';

        addMyVersionCulturalLensCard();
    };

    controls.appendChild(addButton);

    if (isOwnedSubjectRuntime()) {
        const generating =
            myVersionGeneratingCulturalLensCard;

        const generateButton =
            document.createElement('button');

        generateButton.type = 'button';

        generateButton.className = [
            'moment-author-add',
            'moment-author-add--ai',
            'cl-card-author-add',
            generating
                ? 'is-generating'
                : ''
        ].filter(Boolean).join(' ');

        generateButton.disabled = generating;

        generateButton.setAttribute(
            'aria-busy',
            String(generating)
        );

        generateButton.innerHTML = generating
            ? `
                <svg class="moment-author-generate-spinner"
                    width="15" height="15"
                    viewBox="0 0 15 15"
                    fill="none" aria-hidden="true">
                    <circle cx="7.5" cy="7.5" r="5"
                        stroke="currentColor"
                        stroke-width="1.45"
                        stroke-linecap="round"
                        stroke-dasharray="20 12"/>
                </svg>
                Generating…
            `
            : `
                <svg width="15" height="15"
                    viewBox="0 0 15 15"
                    fill="none" aria-hidden="true">
                    <path d="M7.5 1.75L8.15 5.35L11.75 6L8.15 6.65L7.5 10.25L6.85 6.65L3.25 6L6.85 5.35L7.5 1.75Z"
                        stroke="currentColor"
                        stroke-width="1.15"
                        stroke-linejoin="round"/>
                    <path d="M11.5 9.5L11.82 11.18L13.5 11.5L11.82 11.82L11.5 13.5L11.18 11.82L9.5 11.5L11.18 11.18L11.5 9.5Z"
                        stroke="currentColor"
                        stroke-width="0.95"
                        stroke-linejoin="round"/>
                </svg>
                Generate card
            `;

        generateButton.onclick = () => {
            generateMyVersionCulturalLensCardFromUI();
        };

        controls.appendChild(generateButton);
    }

    block.appendChild(controls);

    if (myVersionCulturalLensGenerationError) {
        const error = document.createElement('p');

        error.className =
            'moment-author-generate-error';

        error.setAttribute('role', 'alert');

        error.textContent =
            myVersionCulturalLensGenerationError;

        block.appendChild(error);
    }

    grid.appendChild(block);
}

function renderCLGrid() {
    const grid = document.getElementById('cl-grid');

    if (!grid) return;

    grid.innerHTML = '';

    clCards.forEach((card, index) => {
        const state = getItemState(card.id);

        const title = resolveTutorContentValue(
            card.title,
            getCulturalLensFieldKey(card.id, 'title')
        );

        const teaser = resolveTutorContentValue(
            card.teaser,
            getCulturalLensFieldKey(card.id, 'teaser')
        );

        const contextLine = resolveTutorContentValue(
            card.contextLine,
            getCulturalLensFieldKey(card.id, 'contextLine')
        );

        const hasTeaser = Boolean(teaser.trim());
        const hasContextLine = Boolean(
            contextLine.trim()
        );

        const element = document.createElement('div');

        element.className = `cl-card state-${state}`;
        element.id = `cl-card-${card.id}`;
        element.dataset.id = card.id;
        element.dataset.index = String(index);
        element.setAttribute('role', 'button');
        element.setAttribute('tabindex', '0');

        element.onclick = () => {
            openCulturalLensFocus(
                index,
                element
            );
        };

        element.onkeydown = event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();

                openCulturalLensFocus(
                    index,
                    element
                );
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
                    ${escHtml(title)}
                </h3>

                ${hasTeaser
                    ? `
                        <p class="cl-card-teaser">
                            ${escHtml(teaser)}
                        </p>
                    `
                    : myVersionEditing
                        ? `
                            <button class="cl-card-author-add-field"
                                type="button"
                                data-cultural-lens-add-field="teaser">
                                + Add teaser
                            </button>
                        `
                        : ''}

                ${hasContextLine
                    ? `
                        <p class="cl-card-location">
                            ${escHtml(contextLine)}
                        </p>
                    `
                    : myVersionEditing
                        ? `
                            <button class="cl-card-author-add-field"
                                type="button"
                                data-cultural-lens-add-field="contextLine">
                                + Add eyebrow
                            </button>
                        `
                        : ''}
            `;

        configureMyVersionCulturalLensCard(
            element,
            card,
            index,
            title,
            teaser,
            contextLine
        );

        grid.appendChild(element);
    });

    renderMyVersionAddCulturalLensCardControl(grid);
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

function isCulturalLensFocusOpen() {
    const focusView = document.getElementById(
        'cultural-lens-focus-view'
    );

    return Boolean(
        focusView &&
        !focusView.hidden
    );
}

function isCompactFocusView() {
    return window.matchMedia(
        '(max-width: 680px)'
    ).matches;
}

function handleCulturalLensFocusBack() {
    if (
        isCompactFocusView() &&
        culturalLensFocusUpgradeOpen
    ) {
        setCulturalLensFocusUpgrade(
            false,
            'trigger'
        );
        return;
    }

    closeCulturalLensFocus();
}

function handleDiscussionFocusBack() {
    if (isCompactFocusView()) {
        if (discussionFocusUpgradeOpen) {
            setDiscussionFocusUpgrade(
                false,
                'trigger'
            );
            return;
        }

        if (discussionFocusFollowUpOpen) {
            const followUpId =
                discussionFocusFollowUpId;

            setDiscussionFocusFollowUp(
                null,
                followUpId
                    ? `follow-up-${followUpId}`
                    : null
            );
            return;
        }
    }

    closeDiscussionFocus();
}

function getCurrentCulturalLensCard() {
    return clCards[currentCulturalLensIndex] || null;
}

function getCulturalLensFocusUpgrade() {
    const upgrade = getCurrentCulturalLensCard()?.upgrade;

    if (myVersionEditing) {
        return upgrade || null;
    }

    return shouldShowInlineUpgrade(upgrade)
        ? upgrade
        : null;
}

function setCulturalLensFocusUpgrade(
    isOpen,
    focusTarget
) {
    culturalLensFocusUpgradeOpen = Boolean(
        isOpen && getCulturalLensFocusUpgrade()
    );

    closeAllUpgradePanels();
    renderCulturalLensFocus();

    requestAnimationFrame(() => {
        const target = focusTarget === 'back'
            ? document.querySelector(
                '[data-cultural-lens-focus-action="upgrade-back"]'
            )
            : document.getElementById(
                'cultural-lens-focus-upgrade-trigger'
            );

        target?.focus({
            preventScroll: true
        });
    });
}

function renderCulturalLensFocusContinuationControls() {
    const mount = document.getElementById(
        'cultural-lens-focus-continuation-controls'
    );

    if (!mount) return;

    if (!culturalLensFocusUpgradeOpen) {
        mount.innerHTML = '';
        mount.hidden = true;
        return;
    }

    mount.innerHTML = `
        <button class="discussion-focus-continuation-btn is-return"
            type="button"
            data-cultural-lens-focus-action="upgrade-back">

            <svg width="14" height="14" viewBox="0 0 14 14"
                fill="none" aria-hidden="true">
                <path d="M9 3.5L5.5 7 9 10.5"
                    stroke="currentColor"
                    stroke-width="1.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>
            </svg>

            <span>Back to conversation</span>
        </button>
    `;

    mount.hidden = false;

    mount.querySelector(
        '[data-cultural-lens-focus-action="upgrade-back"]'
    )?.addEventListener('click', () => {
        setCulturalLensFocusUpgrade(
            false,
            'trigger'
        );
    });
}

function renderCulturalLensFocusUpgrade() {
    const card = getCurrentCulturalLensCard();
    let upgrade = getCulturalLensFocusUpgrade();

    const mount = document.getElementById(
        'cultural-lens-focus-upgrade'
    );

    const tools = document.querySelector(
        '.cultural-lens-focus-tools'
    );

    if (!mount) return;

    if (!card) {
        culturalLensFocusUpgradeOpen = false;
        mount.innerHTML = '';
        mount.hidden = true;
        tools?.classList.remove('has-visible-upgrade');
        return;
    }

    const contextId = `cl-${card.id}`;

    if (!upgrade) {
        culturalLensFocusUpgradeOpen = false;
        mount.innerHTML = buildAddUpgradeControl(contextId);
        mount.hidden = !myVersionEditing;

        tools?.classList.toggle(
            'has-visible-upgrade',
            myVersionEditing
        );

        return;
    }

    tools?.classList.add('has-visible-upgrade');

    const effectiveSource =
        getEffectiveUpgradeSourceFromContextId(contextId);

    upgrade = effectiveSource?.upgrade || upgrade;

    const saved = isUpgradeSaved(contextId);

    if (!culturalLensFocusUpgradeOpen) {
        mount.innerHTML = `
            <button
                class="upgrade-chip discussion-focus-upgrade-trigger${saved ? ' is-saved' : ''}"
                id="cultural-lens-focus-upgrade-trigger"
                type="button"
                data-upgrade-context-id="${escHtml(contextId)}"
                data-upgrade-term="${escHtml(upgrade.term)}"
                onclick="setCulturalLensFocusUpgrade(true, 'back')"
                aria-label="${saved
                ? 'Open saved Language Upgrade'
                : 'Open Language Upgrade'}: ${escHtml(upgrade.term)}">

                <span class="discussion-focus-upgrade-trigger-icon"
                    aria-hidden="true">
                    ${saved
                ? SAVED_UPGRADE_ICON_SVG
                : UPGRADE_ICON_SVG}
                </span>

                <span class="discussion-focus-upgrade-trigger-label">
                    ${saved ? 'Saved' : 'Upgrade'}:
                    ${escHtml(upgrade.term)}
                </span>

                <svg class="discussion-focus-upgrade-chevron"
                    width="14" height="14" viewBox="0 0 14 14"
                    fill="none" aria-hidden="true">
                    <path d="M5 3.5L8.5 7 5 10.5"
                        stroke="currentColor"
                        stroke-width="1.35"
                        stroke-linecap="round"
                        stroke-linejoin="round"/>
                </svg>
            </button>
        `;

        mount.hidden = false;
        return;
    }

    mount.innerHTML = `
        <div class="discussion-focus-upgrade-detail">
            <p class="discussion-focus-upgrade-type">
                ${escHtml(upgrade.type)}
            </p>

            <p class="discussion-focus-upgrade-definition">
                ${escHtml(upgrade.definition)}
            </p>

            ${buildUpgradeExamplesMarkup(upgrade)}

            ${buildUpgradeFooterControls(
                contextId,
                upgrade,
                saved
            )}
        </div>
    `;

    mount.hidden = false;
    configureUpgradeLiveSurface(mount, contextId);
}

function renderCulturalLensFocusQuestions(
    isUpgrade = false
) {
    const card = getCurrentCulturalLensCard();

    const block = document.getElementById(
        'cultural-lens-focus-question-block'
    );

    const label = document.getElementById(
        'cultural-lens-focus-question-label'
    );

    const container = document.getElementById(
        'cultural-lens-focus-questions'
    );

    if (!card || !block || !label || !container) {
        return;
    }

    const questions = getCulturalLensQuestionEntries(card)
        .map(entry => ({
            ...entry,
            value: resolveTutorContentValue(
                entry.originalValue,
                entry.fieldKey
            )
        }));

    const visibleQuestions = myVersionEditing
        ? questions
        : questions.filter(question =>
            question.value.trim()
        );

    block.hidden =
        isUpgrade ||
        (
            !myVersionEditing &&
            visibleQuestions.length === 0
        );

    block.classList.toggle(
        'is-empty-authoring',
        !isUpgrade &&
        myVersionEditing &&
        visibleQuestions.length === 0
    );

    if (block.hidden) {
        label.hidden = true;
        container.innerHTML = '';
        disableLiveTutorContentElement(label);
        return;
    }

    const questionLabelFieldKey =
        getCulturalLensFieldKey(
            card.id,
            'questionLabel'
        );

    const questionLabelValue =
        resolveTutorContentValue(
            card.questionLabel ?? 'Question',
            questionLabelFieldKey
        );

    if (visibleQuestions.length) {
        if (myVersionEditing) {
            label.hidden = false;

            configureLiveTutorContentElement(
                label,
                {
                    fieldKey: questionLabelFieldKey,
                    value: questionLabelValue,
                    multiline: false
                }
            );
        } else {
            setText(
                'cultural-lens-focus-question-label',
                questionLabelValue
            );

            label.hidden = !questionLabelValue.trim();
            disableLiveTutorContentElement(label);
        }
    } else {
        label.hidden = true;
        disableLiveTutorContentElement(label);
    }

    container.innerHTML = visibleQuestions.map(
        (question, position) => `
            <div class="cultural-lens-question-author-row"
                data-cultural-lens-question-row="${question.index}">
                <p class="discussion-focus-question cultural-lens-focus-question"
                    data-cultural-lens-question-index="${question.index}"></p>

                ${myVersionEditing
                    ? `
                        <div class="cultural-lens-question-author-controls">
                            <button class="moment-author-control"
                                type="button"
                                data-cultural-lens-question-action="up"
                                data-cultural-lens-question-index="${question.index}"
                                aria-label="Move question earlier"
                                title="Move earlier"
                                ${position === 0 ? 'disabled' : ''}>
                                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path d="M4 10l4-4 4 4"
                                        stroke="currentColor"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"/>
                                </svg>
                            </button>

                            <button class="moment-author-control"
                                type="button"
                                data-cultural-lens-question-action="down"
                                data-cultural-lens-question-index="${question.index}"
                                aria-label="Move question later"
                                title="Move later"
                                ${position === visibleQuestions.length - 1
                                    ? 'disabled'
                                    : ''}>
                                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path d="M4 6l4 4 4-4"
                                        stroke="currentColor"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"/>
                                </svg>
                            </button>

                            <button class="moment-author-control moment-author-control--danger"
                                type="button"
                                data-cultural-lens-question-action="remove"
                                data-cultural-lens-question-index="${question.index}"
                                aria-label="Remove question"
                                title="Remove question">
                                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path d="M3.5 4.5h9M6 4.5V3.2c0-.66.54-1.2 1.2-1.2h1.6c.66 0 1.2.54 1.2 1.2v1.3M5 6.5l.45 6.1c.05.78.7 1.4 1.49 1.4h2.12c.79 0 1.44-.62 1.49-1.4L11 6.5"
                                        stroke="currentColor"
                                        stroke-width="1.25"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    `
                    : ''}
            </div>
        `
    ).join('');

    if (myVersionEditing) {
        container.insertAdjacentHTML(
            'beforeend',
            `
                <button class="cultural-lens-question-add"
                    type="button"
                    data-cultural-lens-question-add>
                    <svg width="15" height="15" viewBox="0 0 15 15"
                        fill="none" aria-hidden="true">
                        <path d="M7.5 2.5v10M2.5 7.5h10"
                            stroke="currentColor"
                            stroke-width="1.45"
                            stroke-linecap="round"/>
                    </svg>
                    Add question
                </button>
            `
        );
    }

    visibleQuestions.forEach(question => {
        configureLiveTutorContentElement(
            container.querySelector(
                `[data-cultural-lens-question-index="${question.index}"]`
            ),
            {
                fieldKey: question.fieldKey,
                value: question.value,
                multiline: true
            }
        );
    });

    container.querySelectorAll(
        '[data-cultural-lens-question-action]'
    ).forEach(button => {
        const index = Number(
            button.dataset.culturalLensQuestionIndex
        );

        button.onclick = () => {
            const action =
                button.dataset.culturalLensQuestionAction;

            if (action === 'up') {
                moveMyVersionCulturalLensQuestion(
                    card.id,
                    index,
                    -1
                );
                return;
            }

            if (action === 'down') {
                moveMyVersionCulturalLensQuestion(
                    card.id,
                    index,
                    1
                );
                return;
            }

            removeMyVersionCulturalLensQuestion(
                card.id,
                index
            );
        };
    });

    container.querySelector(
        '[data-cultural-lens-question-add]'
    )?.addEventListener('click', () => {
        addMyVersionCulturalLensQuestion(card.id);
    });
}

function renderCulturalLensFocusFollowTheThread() {
    const card = getCurrentCulturalLensCard();

    const panel = document.getElementById(
        'cultural-lens-focus-thread-panel'
    );

    const container = document.getElementById(
        'cultural-lens-focus-thread-questions'
    );

    if (
        !card ||
        !panel ||
        !container
    ) {
        return;
    }

    const sourceQuestions = Array.isArray(
        card.followTheThread
    )
        ? card.followTheThread
        : [];

    const questions = sourceQuestions.map(
        (question, index) => {
            const fieldKey =
                getCulturalLensThreadFieldKey(
                    card.id,
                    index
                );

            return {
                index,
                fieldKey,
                originalValue: question,
                value: resolveTutorContentValue(
                    question,
                    fieldKey
                )
            };
        }
    );

    const visibleQuestions = myVersionEditing
        ? questions
        : questions.filter(
            question => question.value.trim()
        );

    panel.hidden =
        !myVersionEditing &&
        visibleQuestions.length === 0;

    if (panel.hidden) {
        container.innerHTML = '';
        return;
    }

    const threadLabelFieldKey =
        getCulturalLensFieldKey(
            card.id,
            'followTheThreadLabel'
        );

    configureLiveTutorContentElement(
        document.getElementById(
            'cultural-lens-focus-thread-label'
        ),
        {
            fieldKey: threadLabelFieldKey,
            value: resolveTutorContentValue(
                card.followTheThreadLabel ||
                    'Follow the Thread',
                threadLabelFieldKey
            ),
            multiline: false
        }
    );

    container.innerHTML = visibleQuestions.map(
        (question, position) => `
            <div class="cultural-lens-thread-author-row"
                data-cultural-lens-thread-row="${question.index}">

                <p class="cultural-lens-focus-thread-question"
                    data-cultural-lens-thread-index="${question.index}"></p>

                ${myVersionEditing
                    ? `
                        <div class="cultural-lens-thread-author-controls">
                            <button class="moment-author-control"
                                type="button"
                                data-cultural-lens-thread-action="up"
                                data-cultural-lens-thread-index="${question.index}"
                                aria-label="Move question earlier"
                                title="Move earlier"
                                ${position === 0 ? 'disabled' : ''}>
                                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path d="M4 10l4-4 4 4"
                                        stroke="currentColor"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"/>
                                </svg>
                            </button>

                            <button class="moment-author-control"
                                type="button"
                                data-cultural-lens-thread-action="down"
                                data-cultural-lens-thread-index="${question.index}"
                                aria-label="Move question later"
                                title="Move later"
                                ${position === visibleQuestions.length - 1
                                    ? 'disabled'
                                    : ''}>
                                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path d="M4 6l4 4 4-4"
                                        stroke="currentColor"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"/>
                                </svg>
                            </button>

                            <button class="moment-author-control moment-author-control--danger"
                                type="button"
                                data-cultural-lens-thread-action="remove"
                                data-cultural-lens-thread-index="${question.index}"
                                aria-label="Remove question"
                                title="Remove question">
                                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path d="M3.5 4.5h9M6 4.5V3.2c0-.66.54-1.2 1.2-1.2h1.6c.66 0 1.2.54 1.2 1.2v1.3M5 6.5l.45 6.1c.05.78.7 1.4 1.49 1.4h2.12c.79 0 1.44-.62 1.49-1.4L11 6.5"
                                        stroke="currentColor"
                                        stroke-width="1.25"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    `
                    : ''}
            </div>
        `
    ).join('');

    if (myVersionEditing) {
        container.insertAdjacentHTML(
            'beforeend',
            `
                <button class="cultural-lens-thread-add"
                    type="button"
                    data-cultural-lens-thread-add>
                    <svg width="15" height="15" viewBox="0 0 15 15"
                        fill="none" aria-hidden="true">
                        <path d="M7.5 2.5v10M2.5 7.5h10"
                            stroke="currentColor"
                            stroke-width="1.45"
                            stroke-linecap="round"/>
                    </svg>
                    Add follow-up question
                </button>
            `
        );
    }

    visibleQuestions.forEach(question => {
        configureLiveTutorContentElement(
            container.querySelector(
                `[data-cultural-lens-thread-index="${question.index}"]`
            ),
            {
                fieldKey: question.fieldKey,
                value: question.value,
                multiline: true
            }
        );
    });

    container.querySelectorAll(
        '[data-cultural-lens-thread-action]'
    ).forEach(button => {
        const index = Number(
            button.dataset.culturalLensThreadIndex
        );

        button.onclick = () => {
            const action =
                button.dataset.culturalLensThreadAction;

            if (action === 'up') {
                moveMyVersionCulturalLensThreadQuestion(
                    card.id,
                    index,
                    -1
                );
                return;
            }

            if (action === 'down') {
                moveMyVersionCulturalLensThreadQuestion(
                    card.id,
                    index,
                    1
                );
                return;
            }

            removeMyVersionCulturalLensThreadQuestion(
                card.id,
                index
            );
        };
    });

    container.querySelector(
        '[data-cultural-lens-thread-add]'
    )?.addEventListener('click', () => {
        addMyVersionCulturalLensThreadQuestion(
            card.id
        );
    });
}

function updateCulturalLensFocusExploredButton() {
    const button = document.getElementById(
        'cultural-lens-focus-explored-btn'
    );

    const card = getCurrentCulturalLensCard();

    if (!button || !card) return;

    const explored = progress.explored.has(card.id);

    button.classList.toggle(
        'is-explored',
        explored
    );

    button.setAttribute(
        'aria-pressed',
        String(explored)
    );

    button.setAttribute(
        'aria-label',
        explored
            ? 'Mark as not explored'
            : 'Mark explored'
    );

    button.title = explored
        ? 'Mark this card as not explored'
        : 'Mark this card as explored';

    button.innerHTML =
        getExploredButtonContent(explored);
}

function renderCulturalLensFocus() {
    const card = getCurrentCulturalLensCard();

    if (!card) return;

    const focusView = document.getElementById(
        'cultural-lens-focus-view'
    );

    const upgrade = getCulturalLensFocusUpgrade();

    if (!upgrade) {
        culturalLensFocusUpgradeOpen = false;
    }

    const isUpgrade = Boolean(
        upgrade && culturalLensFocusUpgradeOpen
    );

    const effectiveUpgrade = isUpgrade
        ? getEffectiveUpgradeSourceFromContextId(
            `cl-${card.id}`
        )?.upgrade || upgrade
        : upgrade;

    focusView?.classList.toggle(
        'is-upgrade',
        isUpgrade
    );

    const culturalLensPathTitle =
        getCulturalLensPathTitle();

    setText(
        'cultural-lens-focus-stage',
        culturalLensPathTitle
    );

    const culturalLensHeadingFieldKey =
        'culturalLens.heading';

    configureLiveTutorContentElement(
        document.getElementById(
            'cultural-lens-focus-heading'
        ),
        {
            fieldKey: culturalLensHeadingFieldKey,
            value: resolveTutorContentValue(
                subjectCopy.culturalLens.heading || 'Cultural Lens',
                culturalLensHeadingFieldKey
            ),
            multiline: false
        }
    );

    const backButton = document.getElementById(
        'cultural-lens-focus-back-btn'
    );

    const compactBackToConversation =
        isCompactFocusView() && isUpgrade;

    setText(
        'cultural-lens-focus-back-mobile-label',
        isUpgrade
            ? 'Conversation'
            : 'Browse'
    );

    if (backButton) {
        backButton.title = compactBackToConversation
            ? 'Back to conversation'
            : 'Back to browse';

        backButton.setAttribute(
            'aria-label',
            compactBackToConversation
                ? `Return to the conversation in ${culturalLensPathTitle}`
                : `Return to ${culturalLensPathTitle} browse`
        );
    }

    setText(
        'cultural-lens-focus-position',
        `${currentCulturalLensIndex + 1} of ${clCards.length}`
    );

    const culturalLensEditableFields = [
        {
            elementId: 'cultural-lens-focus-context-line',
            field: 'contextLine',
            originalValue: card.contextLine,
            multiline: false
        },
        {
            elementId: 'cultural-lens-focus-title',
            field: 'title',
            originalValue: card.title,
            multiline: false
        },
        {
            elementId: 'cultural-lens-focus-context',
            field: 'context',
            originalValue: card.context,
            multiline: true
        }
    ];

    culturalLensEditableFields.forEach(field => {
        const element = document.getElementById(
            field.elementId
        );

        if (isUpgrade) {
            const isUpgradeTitle = field.field === 'title';

            if (isUpgradeTitle && myVersionEditing) {
                const fieldKey = getUpgradeFieldKey(
                    {
                        sourceKind: 'cultural-lens',
                        sourceElementId: card.id
                    },
                    'term'
                );

                configureLiveTutorContentElement(
                    element,
                    {
                        fieldKey,
                        value: effectiveUpgrade.term,
                        multiline: false
                    }
                );
            } else {
                setText(
                    field.elementId,
                    isUpgradeTitle
                        ? effectiveUpgrade.term
                        : field.originalValue
                );

                disableLiveTutorContentElement(element);
            }

            return;
        }

        const fieldKey = getCulturalLensFieldKey(
            card.id,
            field.field
        );

        configureLiveTutorContentElement(
            element,
            {
                fieldKey,
                value: resolveTutorContentValue(
                    field.originalValue,
                    fieldKey
                ),
                multiline: field.multiline
            }
        );
    });

    renderCulturalLensFocusQuestions(isUpgrade);

    const previousButton = document.getElementById(
        'cultural-lens-focus-prev-btn'
    );

    const nextButton = document.getElementById(
        'cultural-lens-focus-next-btn'
    );

    const previousCard = clCards[currentCulturalLensIndex - 1];
    const nextCard = clCards[currentCulturalLensIndex + 1];

    if (previousButton) {
        previousButton.disabled = !previousCard;

        previousButton.setAttribute(
            'aria-label',
            previousCard
                ? `Previous culture: ${previousCard.title}`
                : 'No previous culture'
        );
    }

    if (nextButton) {
        nextButton.disabled = !nextCard;

        nextButton.setAttribute(
            'aria-label',
            nextCard
                ? `Next culture: ${nextCard.title}`
                : 'No next culture'
        );
    }

    renderCulturalLensFocusContinuationControls();
    renderCulturalLensFocusUpgrade();
    renderCulturalLensFocusFollowTheThread();
    updateCulturalLensFocusExploredButton();
}

function openCulturalLensFocus(
    index,
    trigger = document.activeElement
) {
    const card = clCards[index];

    const focusView = document.getElementById(
        'cultural-lens-focus-view'
    );

    const browseView = document.getElementById(
        'cultural-lens-browse-view'
    );

    if (
        !card ||
        !focusView ||
        !browseView
    ) {
        return;
    }

    if (!isCulturalLensFocusOpen()) {
        culturalLensFocusScrollX = window.scrollX;
        culturalLensFocusScrollY = window.scrollY;

        culturalLensFocusPreviousBodyOverflow =
            document.body.style.overflow;

        culturalLensFocusPreviousRootOverflow =
            document.documentElement.style.overflow;

        culturalLensFocusReturnElement =
            trigger instanceof HTMLElement
                ? trigger
                : null;

        culturalLensFocusReturnCardId = card.id;
    }

    currentCulturalLensIndex = index;
    culturalLensFocusUpgradeOpen = false;

    closeUpgradeVisibilityMenus();
    closeAllUpgradePanels();

    renderCulturalLensFocus();

    browseView.setAttribute(
        'aria-hidden',
        'true'
    );

    browseView.setAttribute('inert', '');

    focusView.hidden = false;

    document.documentElement.classList.add(
        'cultural-lens-focus-active'
    );

    document.body.classList.add(
        'cultural-lens-focus-active'
    );

    document.documentElement.style.overflow =
        'hidden';

    document.body.style.overflow =
        'hidden';

    const main = document.getElementById(
        'cultural-lens-focus-main'
    );

    if (main) {
        main.scrollTop = 0;
    }

    if (myVersionEditing) {
        updateMyVersionAuthorBar();
    }

    requestAnimationFrame(() => {
        document
            .getElementById('cultural-lens-focus-back-btn')
            ?.focus({ preventScroll: true });
    });
}

function closeCulturalLensFocus({
    restoreScroll = true,
    restoreFocus = true
} = {}) {
    const focusView = document.getElementById(
        'cultural-lens-focus-view'
    );

    const browseView = document.getElementById(
        'cultural-lens-browse-view'
    );

    if (
        !focusView ||
        focusView.hidden
    ) {
        return;
    }

    const returnElement =
        culturalLensFocusReturnElement;

    const returnCardId =
        culturalLensFocusReturnCardId;

    closeAllUpgradePanels();

    focusView.classList.remove(
        'is-upgrade'
    );

    focusView.hidden = true;

    document.documentElement.classList.remove(
        'cultural-lens-focus-active'
    );

    document.body.classList.remove(
        'cultural-lens-focus-active'
    );

    document.documentElement.style.overflow =
        culturalLensFocusPreviousRootOverflow;

    document.body.style.overflow =
        culturalLensFocusPreviousBodyOverflow;

    browseView?.removeAttribute(
        'aria-hidden'
    );

    browseView?.removeAttribute(
        'inert'
    );

    culturalLensFocusUpgradeOpen = false;
    culturalLensFocusReturnElement = null;
    culturalLensFocusReturnCardId = '';

    applySubjectCopy();
    renderCLGrid();

    if (myVersionEditing) {
        updateMyVersionAuthorBar();
    }

    if (!restoreScroll && !restoreFocus) {
        return;
    }

    requestAnimationFrame(() => {
        if (restoreScroll) {
            window.scrollTo(
                culturalLensFocusScrollX,
                culturalLensFocusScrollY
            );
        }

        if (!restoreFocus) return;

        const originalStillExists =
            returnElement &&
            document.contains(returnElement);

        const target = originalStillExists
            ? returnElement
            : document.getElementById(
                `cl-card-${returnCardId}`
            );

        target?.focus?.({
            preventScroll: true
        });
    });
}

function navigateCulturalLensFocus(direction) {
    const nextIndex =
        currentCulturalLensIndex + direction;

    if (
        nextIndex < 0 ||
        nextIndex >= clCards.length
    ) {
        return;
    }

    currentCulturalLensIndex = nextIndex;
    culturalLensFocusUpgradeOpen = false;

    closeAllUpgradePanels();
    renderCulturalLensFocus();

    const main = document.getElementById(
        'cultural-lens-focus-main'
    );

    if (main) {
        main.scrollTo({
            top: 0,
            behavior: getScrollBehavior()
        });
    }
}

function toggleCulturalLensFocusExplored() {
    const card = getCurrentCulturalLensCard();

    if (!card) return;

    if (progress.explored.has(card.id)) {
        unmarkExplored(card.id);
    } else {
        markExplored(card.id);
    }

    renderCLGrid();
    updateCulturalLensFocusExploredButton();
}


// ============================================================
// DISCUSSION FOCUS VIEW
// Shared teaching surface opened from the Discussion browser.
// ============================================================

function isDiscussionFocusOpen() {
    const focusView = document.getElementById(
        'discussion-focus-view'
    );

    return Boolean(
        focusView &&
        !focusView.hidden
    );
}

function getDiscussionFocusSet() {
    return discussionSets.find(
        set => set.id === discussionFocusSetId
    ) || null;
}

function getDiscussionFocusSequence(
    set = getDiscussionFocusSet()
) {
    if (!set) return [];

    const moments = set.moments.map(moment => ({
        type: 'moment',
        id: moment.id,
        item: moment
    }));

    if (!set.makeItReal) {
        return moments;
    }

    return [
        ...moments,
        {
            type: 'make-it-real',
            id: DISCUSSION_FOCUS_MAKE_IT_REAL_ID,
            item: set.makeItReal
        }
    ];
}

function getDiscussionFocusEntry() {
    return getDiscussionFocusSequence().find(
        entry => entry.id === discussionFocusMomentId
    ) || null;
}

function getDiscussionFocusMoment() {
    const entry = getDiscussionFocusEntry();

    return entry?.type === 'moment'
        ? entry.item
        : null;
}

function getDiscussionFocusFollowUps() {
    return getDiscussionMomentFollowUps(
        getDiscussionFocusMoment()
    );
}

function getDiscussionFocusFollowUp() {
    if (!discussionFocusFollowUpId) return null;

    return getDiscussionFocusFollowUps().find(
        followUp =>
            followUp.id === discussionFocusFollowUpId
    ) || null;
}

function getDiscussionFocusUpgrade() {
    const upgrade = getDiscussionFocusMoment()?.upgrade;

    if (myVersionEditing) {
        return upgrade || null;
    }

    return shouldShowInlineUpgrade(upgrade)
        ? upgrade
        : null;
}

function focusDiscussionFocusContinuationControl(action) {
    const mount = document.getElementById(
        'discussion-focus-continuation-controls'
    );

    const target = mount?.querySelector(
        `[data-discussion-focus-continuation-action="${action}"]`
    );

    target?.focus({
        preventScroll: true
    });
}

function setDiscussionFocusFollowUp(
    followUpId,
    focusAction
) {
    const exists = getDiscussionFocusFollowUps().some(
        followUp => followUp.id === followUpId
    );

    discussionFocusFollowUpId = exists
        ? followUpId
        : null;

    discussionFocusFollowUpOpen = Boolean(
        discussionFocusFollowUpId
    );

    discussionFocusUpgradeOpen = false;

    closeAllUpgradePanels();
    renderDiscussionFocus();

    requestAnimationFrame(() => {
        focusDiscussionFocusContinuationControl(
            focusAction
        );
    });
}

function setDiscussionFocusUpgrade(
    isOpen,
    focusTarget
) {
    discussionFocusUpgradeOpen = Boolean(
        isOpen && getDiscussionFocusUpgrade()
    );

    closeAllUpgradePanels();
    renderDiscussionFocus();

    requestAnimationFrame(() => {
        const target = focusTarget === 'back'
            ? document.querySelector(
                '[data-discussion-focus-continuation-action="upgrade-back"]'
            )
            : document.getElementById(
                'discussion-focus-upgrade-trigger'
            );

        target?.focus({
            preventScroll: true
        });
    });
}

function renderDiscussionFocusContinuationControls() {
    const mount = document.getElementById(
        'discussion-focus-continuation-controls'
    );

    if (!mount) return;

    if (discussionFocusUpgradeOpen) {
        mount.innerHTML = `
            <button class="discussion-focus-continuation-btn is-return"
                type="button"
                data-discussion-focus-continuation-action="upgrade-back">

                <svg width="14" height="14" viewBox="0 0 14 14"
                    fill="none" aria-hidden="true">
                    <path d="M9 3.5L5.5 7 9 10.5"
                        stroke="currentColor"
                        stroke-width="1.4"
                        stroke-linecap="round"
                        stroke-linejoin="round"/>
                </svg>

                <span>Back to conversation</span>
            </button>
        `;

        mount.hidden = false;

        mount.querySelector(
            '[data-discussion-focus-continuation-action="upgrade-back"]'
        )?.addEventListener('click', () => {
            setDiscussionFocusUpgrade(
                false,
                'trigger'
            );
        });

        return;
    }

    const moment = getDiscussionFocusMoment();
    const followUps = getDiscussionFocusFollowUps();
    const activeFollowUp = getDiscussionFocusFollowUp();

    if (!moment) {
        discussionFocusFollowUpId = null;
        discussionFocusFollowUpOpen = false;
        mount.innerHTML = '';
        mount.hidden = true;
        return;
    }

    if (activeFollowUp) {
        const index = followUps.findIndex(
            followUp => followUp.id === activeFollowUp.id
        );

        const authorTools = myVersionEditing
            ? `
                <div class="discussion-pathway-author-tools">
                    <label class="discussion-pathway-kind-label">
                        <span>Path type</span>

                        <select class="discussion-pathway-kind-select"
                            data-discussion-pathway-kind>
                            ${DISCUSSION_FOLLOW_UP_KINDS.map(kind => `
                                <option value="${escHtml(kind)}"
                                    ${kind === activeFollowUp.kind
                                        ? 'selected'
                                        : ''}>
                                    ${escHtml(
                                        DISCUSSION_FOLLOW_UP_LABELS[kind]
                                    )}
                                </option>
                            `).join('')}
                        </select>
                    </label>

                    ${activeFollowUp.kind === 'custom'
                        ? `
                            <label class="discussion-pathway-name-label">
                                <span>Path name</span>

                                <input class="discussion-pathway-name-input"
                                    type="text"
                                    maxlength="${DISCUSSION_FOLLOW_UP_LABEL_LIMIT}"
                                    value="${escHtml(
                                        getDiscussionFollowUpCustomLabel(
                                            moment.id,
                                            activeFollowUp
                                        )
                                    )}"
                                    placeholder="Name this path"
                                    aria-label="Custom path name, ${DISCUSSION_FOLLOW_UP_LABEL_LIMIT} characters maximum"
                                    data-discussion-pathway-name>
                            </label>
                        `
                        : ''}

                    <button class="discussion-pathway-author-btn"
                        type="button"
                        data-discussion-pathway-action="up"
                        aria-label="Move pathway earlier"
                        title="Move earlier"
                        ${index <= 0 ? 'disabled' : ''}>
                        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M4 10l4-4 4 4"
                                stroke="currentColor"
                                stroke-width="1.35"
                                stroke-linecap="round"
                                stroke-linejoin="round"/>
                        </svg>
                    </button>

                    <button class="discussion-pathway-author-btn"
                        type="button"
                        data-discussion-pathway-action="down"
                        aria-label="Move pathway later"
                        title="Move later"
                        ${index >= followUps.length - 1
                            ? 'disabled'
                            : ''}>
                        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M4 6l4 4 4-4"
                                stroke="currentColor"
                                stroke-width="1.35"
                                stroke-linecap="round"
                                stroke-linejoin="round"/>
                        </svg>
                    </button>

                    <button class="discussion-pathway-author-btn is-danger"
                        type="button"
                        data-discussion-pathway-action="remove"
                        aria-label="Remove pathway"
                        title="Remove pathway">
                        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M3.5 4.5h9M6 4.5V3.2c0-.66.54-1.2 1.2-1.2h1.6c.66 0 1.2.54 1.2 1.2v1.3M5 6.5l.45 6.1c.05.78.7 1.4 1.49 1.4h2.12c.79 0 1.44-.62 1.49-1.4L11 6.5"
                                stroke="currentColor"
                                stroke-width="1.25"
                                stroke-linecap="round"
                                stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            `
            : '';

        mount.innerHTML = `
            <button class="discussion-focus-continuation-btn is-return"
                type="button"
                data-discussion-focus-continuation-action="opening">

                <svg width="14" height="14" viewBox="0 0 14 14"
                    fill="none" aria-hidden="true">
                    <path d="M9 3.5L5.5 7 9 10.5"
                        stroke="currentColor"
                        stroke-width="1.4"
                        stroke-linecap="round"
                        stroke-linejoin="round"/>
                </svg>

                <span>Back to opening</span>
            </button>

            ${authorTools}
        `;

        mount.hidden = false;

        mount.querySelector(
            '[data-discussion-focus-continuation-action="opening"]'
        )?.addEventListener('click', () => {
            setDiscussionFocusFollowUp(
                null,
                `follow-up-${activeFollowUp.id}`
            );
        });

        mount.querySelector(
            '[data-discussion-pathway-kind]'
        )?.addEventListener('change', event => {
            const nextKind = event.target.value;

            changeMyVersionMomentFollowUpKind(
                moment.id,
                activeFollowUp.id,
                nextKind
            );

            if (nextKind !== 'custom') return;

            requestAnimationFrame(() => {
                const input = document.querySelector(
                    '[data-discussion-pathway-name]'
                );

                input?.focus({ preventScroll: true });
                input?.select();
            });
        });

        const customNameInput = mount.querySelector(
            '[data-discussion-pathway-name]'
        );

        customNameInput?.addEventListener(
            'change',
            event => {
                commitMyVersionMomentFollowUpLabel(
                    moment.id,
                    activeFollowUp.id,
                    event.target.value
                );
            }
        );

        customNameInput?.addEventListener(
            'keydown',
            event => {
                if (event.key !== 'Enter') return;

                event.preventDefault();
                event.currentTarget.blur();
            }
        );

        mount.querySelector(
            '[data-discussion-pathway-action="up"]'
        )?.addEventListener('click', () => {
            moveMyVersionMomentFollowUp(
                moment.id,
                activeFollowUp.id,
                -1
            );
        });

        mount.querySelector(
            '[data-discussion-pathway-action="down"]'
        )?.addEventListener('click', () => {
            moveMyVersionMomentFollowUp(
                moment.id,
                activeFollowUp.id,
                1
            );
        });

        mount.querySelector(
            '[data-discussion-pathway-action="remove"]'
        )?.addEventListener('click', () => {
            removeMyVersionMomentFollowUp(
                moment.id,
                activeFollowUp.id
            );
        });

        return;
    }

    if (!followUps.length && !myVersionEditing) {
        discussionFocusFollowUpOpen = false;
        mount.innerHTML = '';
        mount.hidden = true;
        return;
    }

    const pathwayButtons = followUps.map(followUp => {
        const label = getDiscussionFollowUpLabel(
            moment.id,
            followUp
        );

        return `
            <button class="discussion-focus-continuation-btn"
                type="button"
                data-discussion-focus-continuation-action="follow-up-${escHtml(followUp.id)}">

                <svg class="discussion-focus-continuation-kind-icon"
                    width="14" height="14" viewBox="0 0 14 14"
                    fill="none" aria-hidden="true">
                    <path d="M3.65 7H4.8
                        C7.1 7 7.35 3.2 10.35 3.2
                        M4.8 7
                        C7.1 7 7.35 10.8 10.35 10.8"
                        stroke="currentColor"
                        stroke-width="1.15"
                        stroke-linecap="round"
                        stroke-linejoin="round"/>
                    <circle cx="2.5" cy="7" r="1.15"
                        stroke="currentColor"
                        stroke-width="1.05"/>
                    <circle cx="11.5" cy="3.2" r="1.15"
                        stroke="currentColor"
                        stroke-width="1.05"/>
                    <circle cx="11.5" cy="10.8" r="1.15"
                        stroke="currentColor"
                        stroke-width="1.05"/>
                </svg>

                <span>${escHtml(label)}</span>

                <svg class="discussion-focus-continuation-chevron"
                    width="14" height="14" viewBox="0 0 14 14"
                    fill="none" aria-hidden="true">
                    <path d="M5 3.5L8.5 7 5 10.5"
                        stroke="currentColor"
                        stroke-width="1.4"
                        stroke-linecap="round"
                        stroke-linejoin="round"/>
                </svg>
            </button>
        `;
    }).join('');

    const canAddPathway =
        myVersionEditing &&
        followUps.length < DISCUSSION_FOLLOW_UP_LIMIT;

    const pathwayGenerating =
        myVersionGeneratingPathwayMomentIds.has(
            moment.id
        );

    const pathwayGenerationError =
        myVersionPathwayGenerationErrors.get(
            moment.id
        ) || '';

    const addButton =
        canAddPathway
            ? `
                <button class="discussion-pathway-add-btn"
                    type="button"
                    data-discussion-pathway-action="add"
                    ${pathwayGenerating
                        ? 'disabled'
                        : ''}>
                    <svg width="14" height="14" viewBox="0 0 14 14"
                        fill="none" aria-hidden="true">
                        <path d="M7 2.5v9M2.5 7h9"
                            stroke="currentColor"
                            stroke-width="1.35"
                            stroke-linecap="round"/>
                    </svg>

                    <span>Add pathway</span>
                </button>
            `
            : '';

    const generateButton =
        canAddPathway &&
        isOwnedSubjectRuntime()
            ? `
                <button class="discussion-pathway-add-btn moment-author-add--ai"
                    type="button"
                    data-discussion-pathway-action="generate"
                    aria-busy="${pathwayGenerating}"
                    ${pathwayGenerating
                        ? 'disabled'
                        : ''}>
                    ${pathwayGenerating
                        ? `
                            <svg class="moment-author-generate-spinner"
                                width="14" height="14"
                                viewBox="0 0 15 15"
                                fill="none" aria-hidden="true">
                                <circle cx="7.5" cy="7.5" r="5"
                                    stroke="currentColor"
                                    stroke-width="1.45"
                                    stroke-linecap="round"
                                    stroke-dasharray="20 12"/>
                            </svg>

                            <span>Generating…</span>
                        `
                        : `
                            <svg width="14" height="14"
                                viewBox="0 0 15 15"
                                fill="none" aria-hidden="true">
                                <path d="M7.5 1.75L8.15 5.35L11.75 6L8.15 6.65L7.5 10.25L6.85 6.65L3.25 6L6.85 5.35L7.5 1.75Z"
                                    stroke="currentColor"
                                    stroke-width="1.15"
                                    stroke-linejoin="round"/>
                                <path d="M11.5 9.5L11.82 11.18L13.5 11.5L11.82 11.82L11.5 13.5L11.18 11.82L9.5 11.5L11.18 11.18L11.5 9.5Z"
                                    stroke="currentColor"
                                    stroke-width="0.95"
                                    stroke-linejoin="round"/>
                            </svg>

                            <span>Generate pathway</span>
                        `}
                </button>
            `
            : '';

    mount.innerHTML = `
        <div class="discussion-pathway-list">
            ${pathwayButtons}
            ${addButton}
            ${generateButton}

            ${pathwayGenerationError
                ? `
                    <p class="discussion-pathway-generate-error"
                        role="alert">
                        ${escHtml(pathwayGenerationError)}
                    </p>
                `
                : ''}
        </div>
    `;

    mount.hidden = false;

    followUps.forEach(followUp => {
        mount.querySelector(
            `[data-discussion-focus-continuation-action="follow-up-${CSS.escape(followUp.id)}"]`
        )?.addEventListener('click', () => {
            setDiscussionFocusFollowUp(
                followUp.id,
                'opening'
            );
        });
    });

    mount.querySelector(
        '[data-discussion-pathway-action="add"]'
    )?.addEventListener('click', () => {
        myVersionPathwayGenerationErrors.delete(
            moment.id
        );

        addMyVersionMomentFollowUp(moment.id);
    });

    mount.querySelector(
        '[data-discussion-pathway-action="generate"]'
    )?.addEventListener('click', () => {
        generateMyVersionMomentPathwayFromUI(
            moment.id
        );
    });
}

function renderDiscussionFocusUpgrade() {
    const mount = document.getElementById(
        'discussion-focus-upgrade'
    );

    const moment = getDiscussionFocusMoment();
    let upgrade = getDiscussionFocusUpgrade();

    if (!mount) return;

    if (!moment) {
        discussionFocusUpgradeOpen = false;
        mount.innerHTML = '';
        mount.hidden = true;
        return;
    }

    const contextId = `moment-${moment.id}`;

    if (!upgrade) {
        discussionFocusUpgradeOpen = false;
        mount.innerHTML = buildAddUpgradeControl(contextId);
        mount.hidden = !myVersionEditing;
        return;
    }

    const effectiveSource =
        getEffectiveUpgradeSourceFromContextId(contextId);

    upgrade = effectiveSource?.upgrade || upgrade;

    const saved = isUpgradeSaved(contextId);

    if (!discussionFocusUpgradeOpen) {
        mount.innerHTML = `
            <button
                class="upgrade-chip discussion-focus-upgrade-trigger${saved ? ' is-saved' : ''}"
                id="discussion-focus-upgrade-trigger"
                type="button"
                data-upgrade-context-id="${escHtml(contextId)}"
                data-upgrade-term="${escHtml(upgrade.term)}"
                onclick="setDiscussionFocusUpgrade(true, 'back')"
                aria-label="${saved
                ? 'Open saved Language Upgrade'
                : 'Open Language Upgrade'}: ${escHtml(upgrade.term)}">

                <span class="discussion-focus-upgrade-trigger-icon"
                    aria-hidden="true">
                    ${saved
                ? SAVED_UPGRADE_ICON_SVG
                : UPGRADE_ICON_SVG}
                </span>

                <span class="discussion-focus-upgrade-trigger-label">
                    ${saved ? 'Saved' : 'Upgrade'}:
                    ${escHtml(upgrade.term)}
                </span>

                <svg class="discussion-focus-upgrade-chevron"
                    width="14" height="14" viewBox="0 0 14 14"
                    fill="none" aria-hidden="true">
                    <path d="M5 3.5L8.5 7 5 10.5"
                        stroke="currentColor"
                        stroke-width="1.35"
                        stroke-linecap="round"
                        stroke-linejoin="round"/>
                </svg>
            </button>
        `;

        mount.hidden = false;
        return;
    }

    mount.innerHTML = `
        <div class="discussion-focus-upgrade-detail">
            <p class="discussion-focus-upgrade-type">
                ${escHtml(upgrade.type)}
            </p>

            <p class="discussion-focus-upgrade-definition">
                ${escHtml(upgrade.definition)}
            </p>

            ${buildUpgradeExamplesMarkup(upgrade)}

            ${buildUpgradeFooterControls(
                contextId,
                upgrade,
                saved
            )}
        </div>
    `;

    mount.hidden = false;
    configureUpgradeLiveSurface(mount, contextId);
}

function updateDiscussionFocusExploredButton() {
    const button = document.getElementById(
        'discussion-focus-explored-btn'
    );

    const moment = getDiscussionFocusMoment();

    if (!button) return;

    button.hidden = !moment;

    if (!moment) return;

    const explored = progress.explored.has(moment.id);

    button.classList.toggle(
        'is-explored',
        explored
    );

    button.setAttribute(
        'aria-pressed',
        String(explored)
    );

    button.setAttribute(
        'aria-label',
        explored
            ? 'Mark as not explored'
            : 'Mark explored'
    );

    button.title = explored
        ? 'Mark this moment as not explored'
        : 'Mark this moment as explored';

    button.innerHTML =
        getExploredButtonContent(explored);
}

function renderDiscussionFocus() {
    const set = getDiscussionFocusSet();
    const entry = getDiscussionFocusEntry();

    if (!set || !entry) return;

    const sequence = getDiscussionFocusSequence(set);

    const index = sequence.findIndex(
        item => item.id === entry.id
    );

    const isMakeItReal =
        entry.type === 'make-it-real';

    const focusView = document.getElementById(
        'discussion-focus-view'
    );

    const followUp = getDiscussionFocusFollowUp();
    const upgrade = getDiscussionFocusUpgrade();

    if (!followUp) {
        discussionFocusFollowUpId = null;
        discussionFocusFollowUpOpen = false;
    }

    if (!upgrade) {
        discussionFocusUpgradeOpen = false;
    }

    const isUpgrade = Boolean(
        upgrade && discussionFocusUpgradeOpen
    );

    const isFollowUp = Boolean(
        followUp &&
        discussionFocusFollowUpOpen &&
        !isUpgrade
    );

    focusView?.classList.toggle(
        'is-make-it-real',
        isMakeItReal
    );

    focusView?.classList.toggle(
        'is-follow-up',
        isFollowUp
    );

    focusView?.classList.toggle(
        'is-upgrade',
        isUpgrade
    );

    const activityLabel = isMakeItReal
        ? getDiscussionActivityLabel(set)
        : isFollowUp
            ? getDiscussionFollowUpLabel(
                entry.item.id,
                followUp
            )
            : '';

    const activityLabelElement = document.getElementById(
        'discussion-focus-activity-eyebrow-label'
    );

    setText(
        'discussion-focus-activity-eyebrow-label',
        activityLabel
    );

    configureLiveTutorContentElement(
        activityLabelElement,
        {
            fieldKey: isMakeItReal
                ? getDiscussionMakeItRealFieldKey(
                    set.id,
                    'label'
                )
                : '',
            value: activityLabel,
            multiline: false
        }
    );

    const discussionPathTitle =
        getDiscussionPathTitle();

    setText(
        'discussion-focus-stage',
        discussionPathTitle
    );

    const setTitleFieldKey = getDiscussionSetFieldKey(
        set.id,
        'title'
    );

    configureLiveTutorContentElement(
        document.getElementById(
            'discussion-focus-set-title'
        ),
        {
            fieldKey: setTitleFieldKey,
            value: resolveTutorContentValue(
                set.title,
                setTitleFieldKey
            ),
            multiline: false
        }
    );

    const titleElement = document.getElementById(
        'discussion-focus-title'
    );

    const questionElement = document.getElementById(
        'discussion-focus-question'
    );

    const effectiveUpgrade = isUpgrade
        ? getEffectiveUpgradeSourceFromContextId(
            `moment-${entry.item.id}`
        )?.upgrade || upgrade
        : upgrade;

    const titleOriginalValue = isUpgrade
        ? effectiveUpgrade.term
        : isMakeItReal
            ? entry.item.title
            : entry.item.preview;

    const questionOriginalValue = isUpgrade
        ? ''
        : isMakeItReal
            ? entry.item.prompt
            : isFollowUp
                ? followUp.prompt
                : entry.item.question;

    const titleFieldKey = isUpgrade
        ? myVersionEditing
            ? getUpgradeFieldKey(
                {
                    sourceKind: 'moment',
                    sourceElementId: entry.item.id
                },
                'term'
            )
            : ''
        : isMakeItReal
            ? getDiscussionMakeItRealFieldKey(
                set.id,
                'title'
            )
            : getDiscussionPreviewFieldKey(entry.item.id);

    const questionFieldKey = isUpgrade
        ? ''
        : isMakeItReal
            ? getDiscussionMakeItRealFieldKey(
                set.id,
                'prompt'
            )
            : isFollowUp
                ? getDiscussionFollowUpFieldKey(
                    entry.item.id,
                    followUp.id
                )
                : getDiscussionQuestionFieldKey(
                    entry.item.id
                );

    const titleValue = titleFieldKey
        ? resolveTutorContentValue(
            titleOriginalValue,
            titleFieldKey
        )
        : titleOriginalValue;

    const questionValue = questionFieldKey
        ? resolveTutorContentValue(
            questionOriginalValue,
            questionFieldKey
        )
        : questionOriginalValue;

    setText(
        'discussion-focus-title',
        titleValue
    );

    setText(
        'discussion-focus-question',
        questionValue
    );

    configureLiveTutorContentElement(
        titleElement,
        {
            fieldKey: titleFieldKey,
            value: titleValue,
            multiline: false
        }
    );

    configureLiveTutorContentElement(
        questionElement,
        {
            fieldKey: questionFieldKey,
            value: questionValue,
            multiline: true
        }
    );

    setText(
        'discussion-focus-position',
        isMakeItReal
            ? 'Activity'
            : `${index + 1} of ${set.moments.length}`
    );

    const backButton = document.getElementById(
        'discussion-focus-back-btn'
    );

    const compactBackDestination =
        isCompactFocusView()
            ? isUpgrade
                ? 'conversation'
                : isFollowUp
                    ? 'opening'
                    : 'browse'
            : 'browse';

    setText(
        'discussion-focus-back-mobile-label',
        isUpgrade
            ? 'Conversation'
            : isFollowUp
                ? 'Opening'
                : 'Browse'
    );

    if (backButton) {
        backButton.title =
            `Back to ${compactBackDestination}`;

        backButton.setAttribute(
            'aria-label',
            compactBackDestination === 'conversation'
                ? `Return to the conversation in ${discussionPathTitle}`
                : compactBackDestination === 'opening'
                    ? 'Return to the opening question'
                    : `Return to ${discussionPathTitle} browse`
        );
    }

    const previousButton = document.getElementById(
        'discussion-focus-prev-btn'
    );

    const nextButton = document.getElementById(
        'discussion-focus-next-btn'
    );

    const previousEntry = sequence[index - 1];
    const nextEntry = sequence[index + 1];

    const getEntryLabel = item => {
        if (!item) return '';

        return item.type === 'make-it-real'
            ? `${getDiscussionActivityLabel(set)}: ${item.item.title}`
            : `moment: ${item.item.preview}`;
    };

    if (previousButton) {
        previousButton.disabled = index <= 0;

        previousButton.setAttribute(
            'aria-label',
            previousEntry
                ? `Previous ${getEntryLabel(previousEntry)}`
                : 'No previous item'
        );
    }

    if (nextButton) {
        const nextLabel =
            nextEntry?.type === 'make-it-real'
                ? getDiscussionActivityLabel(set)
                : 'Next';

        nextButton.hidden = !nextEntry;
        nextButton.disabled = !nextEntry;

        nextButton.setAttribute(
            'aria-label',
            nextEntry
                ? `Next ${getEntryLabel(nextEntry)}`
                : 'No next item'
        );

        nextButton.innerHTML = `
                ${escHtml(nextLabel)}

                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M5.5 3l4 4-4 4"
                        stroke="currentColor"
                        stroke-width="1.4"
                        stroke-linecap="round"
                        stroke-linejoin="round"/>
                </svg>
            `;
    }

    renderDiscussionFocusContinuationControls();
    renderDiscussionFocusUpgrade();
    updateDiscussionFocusExploredButton();
}

function openDiscussionFocus(
    setId,
    momentId,
    trigger = document.activeElement
) {
    const set = discussionSets.find(
        item => item.id === setId
    );

    const entry = getDiscussionFocusSequence(set).find(
        item => item.id === momentId
    );

    const focusView = document.getElementById(
        'discussion-focus-view'
    );

    const browseView = document.getElementById(
        'discussion-browse-view'
    );

    if (
        !set ||
        !entry ||
        !focusView ||
        !browseView
    ) {
        return;
    }

    if (!isDiscussionFocusOpen()) {
        discussionFocusScrollX = window.scrollX;
        discussionFocusScrollY = window.scrollY;

        discussionFocusPreviousBodyOverflow =
            document.body.style.overflow;

        discussionFocusPreviousRootOverflow =
            document.documentElement.style.overflow;

        discussionFocusReturnElement =
            trigger instanceof HTMLElement
                ? trigger
                : null;
    }

    activeSetId = set.id;
    discussionFocusSetId = set.id;
    discussionFocusMomentId = entry.id;
    discussionFocusFollowUpId = null;
    discussionFocusFollowUpOpen = false;
    discussionFocusUpgradeOpen = false;

    closeUpgradeVisibilityMenus();
    closeAllUpgradePanels();

    renderDiscussionFocus();

    browseView.setAttribute(
        'aria-hidden',
        'true'
    );

    browseView.setAttribute('inert', '');

    focusView.hidden = false;

    document.documentElement.classList.add(
        'discussion-focus-active'
    );

    document.body.classList.add(
        'discussion-focus-active'
    );

    document.documentElement.style.overflow =
        'hidden';

    document.body.style.overflow =
        'hidden';

    const main = document.getElementById(
        'discussion-focus-main'
    );

    if (main) {
        main.scrollTop = 0;
    }

    if (myVersionEditing) {
        updateMyVersionAuthorBar();
    }

    requestAnimationFrame(() => {
        document
            .getElementById('discussion-focus-back-btn')
            ?.focus({ preventScroll: true });
    });
}

function closeDiscussionFocus({
    restoreScroll = true,
    restoreFocus = true
} = {}) {
    const focusView = document.getElementById(
        'discussion-focus-view'
    );

    const browseView = document.getElementById(
        'discussion-browse-view'
    );

    if (
        !focusView ||
        focusView.hidden
    ) {
        return;
    }

    const returnSetId =
        discussionFocusSetId;

    const returnItemId =
        discussionFocusMomentId;

    const originalReturnElement =
        discussionFocusReturnElement;

    closeAllUpgradePanels();

    focusView.hidden = true;

    focusView.classList.remove(
        'is-make-it-real',
        'is-follow-up',
        'is-upgrade'
    );

    document.documentElement.classList.remove(
        'discussion-focus-active'
    );

    document.body.classList.remove(
        'discussion-focus-active'
    );

    document.documentElement.style.overflow =
        discussionFocusPreviousRootOverflow;

    document.body.style.overflow =
        discussionFocusPreviousBodyOverflow;

    browseView?.removeAttribute(
        'aria-hidden'
    );

    browseView?.removeAttribute(
        'inert'
    );

    applySubjectCopy();
    renderDiscussionSets();

    const returnSet = discussionSets.find(
        item => item.id === returnSetId
    );

    if (returnSet) {
        setText(
            'moments-panel-title',
            resolveTutorContentValue(
                returnSet.title,
                getDiscussionSetFieldKey(
                    returnSet.id,
                    'title'
                )
            )
        );

        renderMoments(returnSet);
    }

    discussionFocusSetId = null;
    discussionFocusMomentId = null;
    discussionFocusFollowUpId = null;
    discussionFocusFollowUpOpen = false;
    discussionFocusUpgradeOpen = false;
    discussionFocusReturnElement = null;

    if (myVersionEditing) {
        updateMyVersionAuthorBar();
    }

    if (!restoreScroll && !restoreFocus) {
        return;
    }

    requestAnimationFrame(() => {
        if (restoreScroll) {
            window.scrollTo(
                discussionFocusScrollX,
                discussionFocusScrollY
            );
        }

        if (!restoreFocus) return;

        const originalStillExists =
            originalReturnElement &&
            document.contains(originalReturnElement);

        const fallbackId =
            returnItemId === DISCUSSION_FOCUS_MAKE_IT_REAL_ID
                ? `make-it-real-card-${returnSetId}`
                : `moment-card-${returnItemId}`;

        const target = originalStillExists
            ? originalReturnElement
            : document.getElementById(fallbackId);

        target?.focus?.({
            preventScroll: true
        });
    });
}

function navigateDiscussionFocus(direction) {
    const set = getDiscussionFocusSet();
    const entry = getDiscussionFocusEntry();

    if (!set || !entry) return;

    const sequence = getDiscussionFocusSequence(set);

    const currentIndex = sequence.findIndex(
        item => item.id === entry.id
    );

    if (currentIndex < 0) return;

    const nextIndex = currentIndex + direction;

    if (
        nextIndex < 0 ||
        nextIndex >= sequence.length
    ) {
        return;
    }

    discussionFocusMomentId =
        sequence[nextIndex].id;

    discussionFocusFollowUpId = null;
    discussionFocusFollowUpOpen = false;
    discussionFocusUpgradeOpen = false;

    closeAllUpgradePanels();
    renderDiscussionFocus();

    const main = document.getElementById(
        'discussion-focus-main'
    );

    if (main) {
        main.scrollTo({
            top: 0,
            behavior: getScrollBehavior()
        });
    }
}

function toggleDiscussionFocusExplored() {
    const set = getDiscussionFocusSet();
    const moment = getDiscussionFocusMoment();

    if (!set || !moment) return;

    if (progress.explored.has(moment.id)) {
        unmarkExplored(moment.id);
    } else {
        markExplored(moment.id);
    }

    renderDiscussionSets();
    renderMoments(set);
    updateDiscussionFocusExploredButton();
}


// ============================================================
// DISCUSSION
// ============================================================

function getSetIconSvg(type, active) {
    const color = active ? '#fff' : 'var(--accent)';

    if (type === 'first-look') {
        return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="3.25"
                    stroke="${color}"
                    stroke-width="1.35"/>
                <circle cx="10" cy="10" r="0.75"
                    fill="${color}"/>
                <path d="M10 2.5V5M10 15V17.5M2.5 10H5M15 10H17.5"
                    stroke="${color}"
                    stroke-width="1.35"
                    stroke-linecap="round"/>
            </svg>`;
    }

    if (type === 'closer-look') {
        return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="8.4" cy="8.4" r="4.15"
                    stroke="${color}"
                    stroke-width="1.35"/>
                <path d="M11.55 11.55L16.15 16.15"
                    stroke="${color}"
                    stroke-width="1.45"
                    stroke-linecap="round"/>
                <path d="M8.4 6.15V10.65M6.15 8.4H10.65"
                    stroke="${color}"
                    stroke-width="1.2"
                    stroke-linecap="round"/>
            </svg>`;
    }

    if (type === 'wider-view') {
        return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="14.45" cy="5.45" r="1.45"
                    stroke="${color}"
                    stroke-width="1.25"/>
                <path d="M2.75 14.65C4.9 11.95 7.2 10.6 9.6 10.6C11.8 10.6 13.65 11.65 15.15 13.6"
                    stroke="${color}"
                    stroke-width="1.35"
                    stroke-linecap="round"/>
                <path d="M9.55 15.15C11.45 13.1 13.45 12.05 15.45 12.05C16.25 12.05 16.95 12.25 17.55 12.65"
                    stroke="${color}"
                    stroke-width="1.35"
                    stroke-linecap="round"/>
                <path d="M2.8 15.55H17.2"
                    stroke="${color}"
                    stroke-width="1.25"
                    stroke-linecap="round"/>
            </svg>`;
    }

    return '';
}

function addMyVersionDiscussionSetField(setId, field) {
    if (!myVersionEditing) return;

    const defaults = {
        stage: 'New Set',
        description: 'Describe what this set explores.'
    };

    if (!Object.prototype.hasOwnProperty.call(defaults, field)) {
        return;
    }

    const changed = commitMyVersionDraftContent(
        getDiscussionSetFieldKey(setId, field),
        defaults[field]
    );

    if (!changed) return;

    requestAnimationFrame(() => {
        const card = document.querySelector(
            `.set-card[data-set-id="${CSS.escape(setId)}"]`
        );

        const element = card?.querySelector(
            field === 'stage'
                ? '.set-stage'
                : '.set-desc'
        );

        if (!element) return;

        element.focus({ preventScroll: true });

        const selection = window.getSelection();
        const range = document.createRange();

        range.selectNodeContents(element);
        selection?.removeAllRanges();
        selection?.addRange(range);
    });
}

function configureMyVersionDiscussionSetCard(
    card,
    set,
    index,
    stage,
    title,
    description
) {
    if (!myVersionEditing) return;

    const active = activeSetId === set.id;

    card.classList.add('set-card--authoring');
    card.setAttribute('role', 'group');
    card.removeAttribute('tabindex');
    card.setAttribute(
        'aria-label',
        `Edit set ${index + 1}: ${title}`
    );
    card.onclick = null;
    card.onkeydown = null;

    const stageElement = card.querySelector('.set-stage');

    if (stageElement) {
        configureLiveTutorContentElement(
            stageElement,
            {
                fieldKey: getDiscussionSetFieldKey(
                    set.id,
                    'stage'
                ),
                value: stage,
                multiline: false
            }
        );
    }

    configureLiveTutorContentElement(
        card.querySelector('.set-title'),
        {
            fieldKey: getDiscussionSetFieldKey(
                set.id,
                'title'
            ),
            value: title,
            multiline: false
        }
    );

    const descriptionElement = card.querySelector(
        '.set-desc'
    );

    if (descriptionElement) {
        configureLiveTutorContentElement(
            descriptionElement,
            {
                fieldKey: getDiscussionSetFieldKey(
                    set.id,
                    'description'
                ),
                value: description,
                multiline: true
            }
        );
    }

    card.querySelectorAll(
        '[data-set-author-add-field]'
    ).forEach(button => {
        button.onclick = () => {
            addMyVersionDiscussionSetField(
                set.id,
                button.dataset.setAuthorAddField
            );
        };
    });

    const controls = document.createElement('div');
    controls.className = 'set-author-controls';

    const toggleButton = document.createElement('button');
    const toggleLabel = active
        ? 'Hide set contents'
        : 'Show set contents';

    toggleButton.type = 'button';
    toggleButton.className = [
        'moment-author-control',
        'set-author-toggle',
        active ? 'is-active' : ''
    ].filter(Boolean).join(' ');
    toggleButton.title = toggleLabel;
    toggleButton.setAttribute('aria-label', toggleLabel);
    toggleButton.setAttribute(
        'aria-pressed',
        String(active)
    );
    toggleButton.innerHTML = `
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="3.25" cy="4.5" r="0.72"
                fill="currentColor"/>
            <circle cx="3.25" cy="8" r="0.72"
                fill="currentColor"/>
            <circle cx="3.25" cy="11.5" r="0.72"
                fill="currentColor"/>

            <path d="M5.5 4.5h7M5.5 8h7M5.5 11.5h7"
                stroke="currentColor"
                stroke-width="1.25"
                stroke-linecap="round"/>
        </svg>
    `;

    toggleButton.onclick = () => {
        if (active) {
            closeSet();
        } else {
            openSet(set.id);
        }
    };

    controls.appendChild(toggleButton);

    const actions = [
        {
            label: 'Move set earlier',
            disabled: index === 0,
            className: '',
            icon: `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M4 10l4-4 4 4"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"/>
                </svg>`,
            run: () => moveMyVersionDiscussionSet(
                set.id,
                -1
            )
        },
        {
            label: 'Move set later',
            disabled: index === discussionSets.length - 1,
            className: '',
            icon: `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M4 6l4 4 4-4"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"/>
                </svg>`,
            run: () => moveMyVersionDiscussionSet(
                set.id,
                1
            )
        },
        {
            label: 'Duplicate set',
            disabled: false,
            className: '',
            icon: `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <rect x="5" y="5" width="7" height="7" rx="1.5"
                        stroke="currentColor"
                        stroke-width="1.3"/>
                    <path d="M4 10H3.5A1.5 1.5 0 012 8.5v-5A1.5 1.5 0 013.5 2h5A1.5 1.5 0 0110 3.5V4"
                        stroke="currentColor"
                        stroke-width="1.3"
                        stroke-linecap="round"/>
                </svg>`,
            run: () => duplicateMyVersionDiscussionSet(
                set.id
            )
        },
        {
            label: discussionSets.length <= 1
                ? 'Keep at least one set'
                : 'Remove set',
            disabled: discussionSets.length <= 1,
            className: 'moment-author-control--danger',
            icon: `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3.5 4.5h9M6 4.5V3.2c0-.66.54-1.2 1.2-1.2h1.6c.66 0 1.2.54 1.2 1.2v1.3M5 6.5l.45 6.1c.05.78.7 1.4 1.49 1.4h2.12c.79 0 1.44-.62 1.49-1.4L11 6.5"
                        stroke="currentColor"
                        stroke-width="1.25"
                        stroke-linecap="round"
                        stroke-linejoin="round"/>
                </svg>`,
            run: () => removeMyVersionDiscussionSet(
                set.id
            )
        }
    ];

    actions.forEach(action => {
        const button = document.createElement('button');

        button.type = 'button';
        button.className = [
            'moment-author-control',
            action.className
        ].filter(Boolean).join(' ');
        button.disabled = action.disabled;
        button.title = action.label;
        button.setAttribute('aria-label', action.label);
        button.innerHTML = action.icon;
        button.onclick = action.run;

        controls.appendChild(button);
    });

    card.appendChild(controls);
}

function renderMyVersionAddDiscussionSetControl(container) {
    if (!myVersionEditing) return;

    const block = document.createElement('div');
    block.className =
        'set-author-create-block';

    const controls = document.createElement('div');
    controls.className =
        'moment-author-create-row';

    const addButton = document.createElement('button');

    addButton.type = 'button';
    addButton.className =
        'moment-author-add set-author-add';

    addButton.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 15 15"
            fill="none" aria-hidden="true">
            <path d="M7.5 2.5v10M2.5 7.5h10"
                stroke="currentColor"
                stroke-width="1.45"
                stroke-linecap="round"/>
        </svg>
        Add set
    `;

    addButton.onclick = () => {
        myVersionDiscussionSetGenerationError = '';

        addMyVersionDiscussionSet();
    };

    controls.appendChild(addButton);

    if (isOwnedSubjectRuntime()) {
        const generating =
            myVersionGeneratingDiscussionSet;

        const generateButton =
            document.createElement('button');

        generateButton.type = 'button';

        generateButton.className = [
            'moment-author-add',
            'moment-author-add--ai',
            'set-author-add',
            generating
                ? 'is-generating'
                : ''
        ].filter(Boolean).join(' ');

        generateButton.disabled = generating;

        generateButton.setAttribute(
            'aria-busy',
            String(generating)
        );

        generateButton.innerHTML = generating
            ? `
                <svg class="moment-author-generate-spinner"
                    width="15" height="15"
                    viewBox="0 0 15 15"
                    fill="none" aria-hidden="true">
                    <circle cx="7.5" cy="7.5" r="5"
                        stroke="currentColor"
                        stroke-width="1.45"
                        stroke-linecap="round"
                        stroke-dasharray="20 12"/>
                </svg>
                Generating…
            `
            : `
                <svg width="15" height="15"
                    viewBox="0 0 15 15"
                    fill="none" aria-hidden="true">
                    <path d="M7.5 1.75L8.15 5.35L11.75 6L8.15 6.65L7.5 10.25L6.85 6.65L3.25 6L6.85 5.35L7.5 1.75Z"
                        stroke="currentColor"
                        stroke-width="1.15"
                        stroke-linejoin="round"/>
                    <path d="M11.5 9.5L11.82 11.18L13.5 11.5L11.82 11.82L11.5 13.5L11.18 11.82L9.5 11.5L11.18 11.18L11.5 9.5Z"
                        stroke="currentColor"
                        stroke-width="0.95"
                        stroke-linejoin="round"/>
                </svg>
                Generate set
            `;

        generateButton.onclick = () => {
            generateMyVersionDiscussionSetFromUI();
        };

        controls.appendChild(generateButton);
    }

    block.appendChild(controls);

    if (myVersionDiscussionSetGenerationError) {
        const error = document.createElement('p');

        error.className =
            'moment-author-generate-error';

        error.setAttribute('role', 'alert');

        error.textContent =
            myVersionDiscussionSetGenerationError;

        block.appendChild(error);
    }

    container.appendChild(block);
}

function renderDiscussionSets() {
    const container = document.getElementById('discussion-sets');

    if (!container) return;

    container.innerHTML = '';

    discussionSets.forEach((set, index) => {
        const stage = resolveTutorContentValue(
            set.stage,
            getDiscussionSetFieldKey(set.id, 'stage')
        );

        const title = resolveTutorContentValue(
            set.title,
            getDiscussionSetFieldKey(set.id, 'title')
        );

        const description = resolveTutorContentValue(
            set.description,
            getDiscussionSetFieldKey(set.id, 'description')
        );

        const hasStage = Boolean(stage.trim());
        const hasDescription = Boolean(
            description.trim()
        );

        const element = document.createElement('div');
        const active = activeSetId === set.id;

        element.className =
            `set-card${active ? ' active-set' : ''}`;

        element.dataset.setId = set.id;
        element.setAttribute('role', 'button');
        element.setAttribute('tabindex', '0');
        element.setAttribute(
            'aria-label',
            `${active ? 'Close' : 'Open'} ${title}`
        );

        element.onclick = () => {
            if (activeSetId === set.id) {
                closeSet();
            } else {
                openSet(set.id);
            }
        };

        element.onkeydown = event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();

                if (activeSetId === set.id) {
                    closeSet();
                } else {
                    openSet(set.id);
                }
            }
        };

        element.innerHTML = `
                <div class="set-icon">
                    ${getSetIconSvg(set.icon, active)}
                </div>

                ${hasStage
                    ? `
                        <p class="set-stage">
                            ${escHtml(stage)}
                        </p>
                    `
                    : myVersionEditing
                        ? `
                            <button class="set-author-add-field set-author-add-field--stage"
                                type="button"
                                data-set-author-add-field="stage">
                                + Add stage
                            </button>
                        `
                        : ''}

                <h3 class="set-title">
                    ${escHtml(title)}
                </h3>

                ${hasDescription
                    ? `
                        <p class="set-desc">
                            ${escHtml(description)}
                        </p>
                    `
                    : myVersionEditing
                        ? `
                            <button class="set-author-add-field set-author-add-field--description"
                                type="button"
                                data-set-author-add-field="description">
                                + Add description
                            </button>
                        `
                        : ''}
            `;

        configureMyVersionDiscussionSetCard(
            element,
            set,
            index,
            stage,
            title,
            description
        );

        container.appendChild(element);
    });

    renderMyVersionAddDiscussionSetControl(container);
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

    setText(
        'moments-panel-title',
        resolveTutorContentValue(
            set.title,
            getDiscussionSetFieldKey(set.id, 'title')
        )
    );

    renderMoments(set);

    document
        .getElementById('moments-panel')
        ?.classList.add('open');

    renderDiscussionSets();

    window.setTimeout(() => {
        const isMobile =
            window.matchMedia('(max-width: 680px)').matches;

        const mobileNav = document.querySelector(
            '#mob-header-discussion .mobile-header'
        );

        const firstMoment = document.querySelector(
            '#moments-list .moment-card'
        );

        if (isMobile && firstMoment) {
            const momentRect =
                firstMoment.getBoundingClientRect();

            const navHeight =
                mobileNav?.getBoundingClientRect().height || 0;

            const absoluteTop =
                window.pageYOffset + momentRect.top;

            window.scrollTo({
                top: Math.max(0, absoluteTop - navHeight),
                behavior: getScrollBehavior()
            });

            return;
        }

        const sets = document.getElementById('discussion-sets');
        const desktopNav = document.querySelector(
            '#nav-discussion .top-nav'
        );

        if (sets) {
            const setsRect = sets.getBoundingClientRect();
            const absoluteTop =
                window.pageYOffset + setsRect.top;

            const navHeight = Math.max(
                desktopNav?.getBoundingClientRect().height || 0,
                56
            );

            window.scrollTo({
                top: Math.max(
                    0,
                    absoluteTop - navHeight - 20
                ),
                behavior: getScrollBehavior()
            });
        }
    }, 150);
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

function configureMyVersionMomentCard(
    card,
    set,
    moment,
    index,
    preview
) {
    if (!myVersionEditing) return;

    card.classList.add('moment-card--authoring');
    card.setAttribute('role', 'group');
    card.removeAttribute('tabindex');
    card.setAttribute(
        'aria-label',
        `Edit moment ${index + 1}: ${preview}`
    );
    card.onclick = null;
    card.onkeydown = null;

    const header = card.querySelector(
        '.moment-card-header'
    );

    if (header) {
        header.setAttribute('role', 'button');
        header.setAttribute('tabindex', '0');
        header.setAttribute(
            'aria-label',
            `Edit moment ${index + 1}: ${preview}`
        );

        header.onclick = () => {
            openDiscussionFocus(
                set.id,
                moment.id,
                header
            );
        };

        header.onkeydown = event => {
            if (
                event.key === 'Enter' ||
                event.key === ' '
            ) {
                event.preventDefault();

                openDiscussionFocus(
                    set.id,
                    moment.id,
                    header
                );
            }
        };
    }

    const controls = document.createElement('div');
    controls.className = 'moment-author-controls';

    const actions = [
        {
            label: 'Move moment up',
            disabled: index === 0,
            className: '',
            icon: `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M4 10l4-4 4 4"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"/>
                </svg>`,
            run: () => moveMyVersionMoment(
                set.id,
                moment.id,
                -1
            )
        },
        {
            label: 'Move moment down',
            disabled: index === set.moments.length - 1,
            className: '',
            icon: `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M4 6l4 4 4-4"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"/>
                </svg>`,
            run: () => moveMyVersionMoment(
                set.id,
                moment.id,
                1
            )
        },
        {
            label: 'Duplicate moment',
            disabled: false,
            className: '',
            icon: `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <rect x="5" y="5" width="7" height="7" rx="1.5"
                        stroke="currentColor"
                        stroke-width="1.3"/>
                    <path d="M4 10H3.5A1.5 1.5 0 012 8.5v-5A1.5 1.5 0 013.5 2h5A1.5 1.5 0 0110 3.5V4"
                        stroke="currentColor"
                        stroke-width="1.3"
                        stroke-linecap="round"/>
                </svg>`,
            run: () => duplicateMyVersionMoment(
                set.id,
                moment.id
            )
        },
        {
            label: set.moments.length <= 1
                ? 'A set must keep at least one moment'
                : 'Remove moment',
            disabled: set.moments.length <= 1,
            className: 'moment-author-control--danger',
            icon: `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3.5 4.5h9M6 4.5V3.2c0-.66.54-1.2 1.2-1.2h1.6c.66 0 1.2.54 1.2 1.2v1.3M5 6.5l.45 6.1c.05.78.7 1.4 1.49 1.4h2.12c.79 0 1.44-.62 1.49-1.4L11 6.5"
                        stroke="currentColor"
                        stroke-width="1.25"
                        stroke-linecap="round"
                        stroke-linejoin="round"/>
                </svg>`,
            run: () => removeMyVersionMoment(
                set.id,
                moment.id
            )
        }
    ];

    actions.forEach(action => {
        const button = document.createElement('button');

        button.type = 'button';
        button.className = [
            'moment-author-control',
            action.className
        ].filter(Boolean).join(' ');
        button.disabled = action.disabled;
        button.title = action.label;
        button.setAttribute('aria-label', action.label);
        button.innerHTML = action.icon;
        button.onclick = action.run;

        controls.appendChild(button);
    });

    card.appendChild(controls);
}

function renderMyVersionAddMomentControl(list, set) {
    if (!myVersionEditing) return;

    const controls = document.createElement('div');
    controls.className = 'moment-author-create-row';

    const addButton = document.createElement('button');

    addButton.type = 'button';
    addButton.className = 'moment-author-add';
    addButton.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 15 15"
            fill="none" aria-hidden="true">
            <path d="M7.5 2.5v10M2.5 7.5h10"
                stroke="currentColor"
                stroke-width="1.45"
                stroke-linecap="round"/>
        </svg>
        Add moment
    `;

    addButton.onclick = () => {
        myVersionMomentGenerationErrors.delete(
            set.id
        );

        addMyVersionMoment(set.id);
    };

    controls.appendChild(addButton);

    if (isOwnedSubjectRuntime()) {
        const generating =
            myVersionGeneratingMomentSetIds.has(
                set.id
            );

        const generateButton =
            document.createElement('button');

        generateButton.type = 'button';
        generateButton.className = [
            'moment-author-add',
            'moment-author-add--ai',
            generating
                ? 'is-generating'
                : ''
        ].filter(Boolean).join(' ');

        generateButton.disabled = generating;
        generateButton.setAttribute(
            'aria-busy',
            String(generating)
        );

        generateButton.innerHTML = generating
            ? `
                <svg class="moment-author-generate-spinner"
                    width="15" height="15"
                    viewBox="0 0 15 15"
                    fill="none" aria-hidden="true">
                    <circle cx="7.5" cy="7.5" r="5"
                        stroke="currentColor"
                        stroke-width="1.45"
                        stroke-linecap="round"
                        stroke-dasharray="20 12"/>
                </svg>
                Generating…
            `
            : `
                <svg width="15" height="15"
                    viewBox="0 0 15 15"
                    fill="none" aria-hidden="true">
                    <path d="M7.5 1.75L8.15 5.35L11.75 6L8.15 6.65L7.5 10.25L6.85 6.65L3.25 6L6.85 5.35L7.5 1.75Z"
                        stroke="currentColor"
                        stroke-width="1.15"
                        stroke-linejoin="round"/>
                    <path d="M11.5 9.5L11.82 11.18L13.5 11.5L11.82 11.82L11.5 13.5L11.18 11.82L9.5 11.5L11.18 11.18L11.5 9.5Z"
                        stroke="currentColor"
                        stroke-width="0.95"
                        stroke-linejoin="round"/>
                </svg>
                Generate moment
            `;

        generateButton.onclick = () => {
            generateMyVersionMomentFromUI(
                set.id
            );
        };

        controls.appendChild(generateButton);
    }

    list.appendChild(controls);

    const errorMessage =
        myVersionMomentGenerationErrors.get(
            set.id
        );

    if (errorMessage) {
        const error = document.createElement('p');

        error.className =
            'moment-author-generate-error';

        error.setAttribute('role', 'alert');
        error.textContent = errorMessage;

        list.appendChild(error);
    }
}

function renderMoments(set) {
    const list = document.getElementById('moments-list');

    if (!list) return;

    list.innerHTML = '';

    set.moments.forEach((moment, index) => {
        const state = getItemState(moment.id);
        const preview = resolveTutorContentValue(
            moment.preview,
            getDiscussionPreviewFieldKey(moment.id)
        );

        const card = document.createElement('div');

        card.className =
            `moment-card moment-choice-card state-${state}`;

        card.id = `moment-card-${moment.id}`;
        card.dataset.momentId = moment.id;

        card.setAttribute(
            'role',
            'button'
        );

        card.setAttribute(
            'tabindex',
            '0'
        );

        card.setAttribute(
            'aria-label',
            `Open moment ${index + 1}: ${preview}`
        );

        card.onclick = () => {
            openDiscussionFocus(
                set.id,
                moment.id,
                card
            );
        };

        card.onkeydown = event => {
            if (
                event.key === 'Enter' ||
                event.key === ' '
            ) {
                event.preventDefault();

                openDiscussionFocus(
                    set.id,
                    moment.id,
                    card
                );
            }
        };

        card.innerHTML = `
                <div class="moment-card-header">
                    <div class="moment-state-dot"></div>

                    <span class="moment-num">
                        ${String(index + 1).padStart(2, '0')}
                    </span>

                    <span class="moment-preview">
                        ${escHtml(preview)}
                    </span>

                    <svg class="moment-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M5 3l4 4-4 4"
                            stroke="currentColor"
                            stroke-width="1.4"
                            stroke-linecap="round"
                            stroke-linejoin="round"/>
                    </svg>
                </div>
            `;

        configureMyVersionMomentCard(
            card,
            set,
            moment,
            index,
            preview
        );

        list.appendChild(card);
    });

    renderMyVersionAddMomentControl(list, set);
    renderMyVersionSetActivityControl(list, set);
}

function configureMyVersionSetActivityCard(
    card,
    set,
    activityLabel,
    activityTitle
) {
    if (!myVersionEditing) return;

    card.classList.add(
        'make-it-real-card--authoring'
    );

    card.setAttribute('role', 'group');
    card.removeAttribute('tabindex');
    card.setAttribute(
        'aria-label',
        `Edit ${activityLabel}: ${activityTitle}`
    );
    card.onclick = null;
    card.onkeydown = null;

    const header = card.querySelector(
        '.make-it-real-header'
    );

    if (header) {
        header.setAttribute('role', 'button');
        header.setAttribute('tabindex', '0');
        header.setAttribute(
            'aria-label',
            `Edit ${activityLabel}: ${activityTitle}`
        );

        header.onclick = () => {
            openDiscussionFocus(
                set.id,
                DISCUSSION_FOCUS_MAKE_IT_REAL_ID,
                header
            );
        };

        header.onkeydown = event => {
            if (
                event.key === 'Enter' ||
                event.key === ' '
            ) {
                event.preventDefault();

                openDiscussionFocus(
                    set.id,
                    DISCUSSION_FOCUS_MAKE_IT_REAL_ID,
                    header
                );
            }
        };
    }

    const controls = document.createElement('div');
    controls.className = 'moment-author-controls';

    const removeButton = document.createElement('button');

    removeButton.type = 'button';
    removeButton.className = [
        'moment-author-control',
        'moment-author-control--danger'
    ].join(' ');
    removeButton.title = 'Remove closing activity';
    removeButton.setAttribute(
        'aria-label',
        'Remove closing activity'
    );
    removeButton.innerHTML = `
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3.5 4.5h9M6 4.5V3.2c0-.66.54-1.2 1.2-1.2h1.6c.66 0 1.2.54 1.2 1.2v1.3M5 6.5l.45 6.1c.05.78.7 1.4 1.49 1.4h2.12c.79 0 1.44-.62 1.49-1.4L11 6.5"
                stroke="currentColor"
                stroke-width="1.25"
                stroke-linecap="round"
                stroke-linejoin="round"/>
        </svg>
    `;

    removeButton.onclick = () => {
        removeMyVersionSetActivity(set.id);
    };

    controls.appendChild(removeButton);
    card.appendChild(controls);
}

function renderMyVersionSetActivityControl(list, set) {
    if (set.makeItReal) {
        const activityLabel =
            getDiscussionActivityLabel(set);

        const activityTitle = resolveTutorContentValue(
            set.makeItReal.title,
            getDiscussionMakeItRealFieldKey(
                set.id,
                'title'
            )
        );

        const card = document.createElement('div');

        card.className =
            'make-it-real-card make-it-real-choice-card';

        card.id = `make-it-real-card-${set.id}`;

        card.setAttribute(
            'role',
            'button'
        );

        card.setAttribute(
            'tabindex',
            '0'
        );

        card.setAttribute(
            'aria-label',
            `Open ${activityLabel}: ${activityTitle}`
        );

        card.onclick = () => {
            openDiscussionFocus(
                set.id,
                DISCUSSION_FOCUS_MAKE_IT_REAL_ID,
                card
            );
        };

        card.onkeydown = event => {
            if (
                event.key === 'Enter' ||
                event.key === ' '
            ) {
                event.preventDefault();

                openDiscussionFocus(
                    set.id,
                    DISCUSSION_FOCUS_MAKE_IT_REAL_ID,
                    card
                );
            }
        };

        card.innerHTML = `
                <div class="make-it-real-header">
                    <span class="make-it-real-badge">
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                            <path d="M5.5 1L6.3 4.1 9.5 4.5 6.3 4.9 5.5 8 4.7 4.9 1.5 4.5 4.7 4.1Z"
                                stroke="currentColor"
                                stroke-width="1"
                                stroke-linejoin="round"/>
                        </svg>
                        ${escHtml(activityLabel)}
                    </span>

                    <span class="make-it-real-title">
                        ${escHtml(activityTitle)}
                    </span>

                    <svg class="moment-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M5 3l4 4-4 4"
                            stroke="currentColor"
                            stroke-width="1.4"
                            stroke-linecap="round"
                            stroke-linejoin="round"/>
                    </svg>
                </div>
            `;

        configureMyVersionSetActivityCard(
            card,
            set,
            activityLabel,
            activityTitle
        );

        list.appendChild(card);
        return;
    }

    if (!myVersionEditing) return;

    const addButton = document.createElement('button');

    addButton.type = 'button';
    addButton.className =
        'moment-author-add moment-author-add--activity';

    addButton.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <path d="M7.5 2.5v10M2.5 7.5h10"
                stroke="currentColor"
                stroke-width="1.45"
                stroke-linecap="round"/>
        </svg>
        Add closing activity
    `;

    addButton.onclick = () => {
        addMyVersionSetActivity(set.id);
    };

    list.appendChild(addButton);
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

    vocabBankPreviousBodyOverflow =
        document.body.style.overflow;

    vocabBankPreviousRootOverflow =
        document.documentElement.style.overflow;

    renderVocabBank();

    document
        .getElementById('vb-overlay')
        ?.classList.add('open');

    document
        .getElementById('vb-drawer')
        ?.classList.add('open');

    scrollVocabBankToTop();

    document.documentElement.style.overflow = 'hidden';
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

    document.documentElement.style.overflow =
        vocabBankPreviousRootOverflow;

    document.body.style.overflow =
        vocabBankPreviousBodyOverflow;

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
            title: getCulturalLensPathTitle(),
            entries: clCards
                .filter(card => card.upgrade)
                .map(card => {
                    const contextId = `cl-${card.id}`;

                    return {
                        ...getEffectiveUpgradeSourceFromContextId(
                            contextId
                        ).upgrade,
                        contextId
                    };
                })
        },

        ...discussionSets.map(set => ({
            title: resolveTutorContentValue(
                set.title,
                getDiscussionSetFieldKey(set.id, 'title')
            ),
            entries: set.moments
                .filter(moment => moment.upgrade)
                .map(moment => {
                    const contextId = `moment-${moment.id}`;

                    return {
                        ...getEffectiveUpgradeSourceFromContextId(
                            contextId
                        ).upgrade,
                        contextId
                    };
                })
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
    entryId = '',
    showSaveControl = false,
    saveControlMode = 'toggle'
} = {}) {
    const canSave = Boolean(
        showSaveControl &&
        (contextId || entryId)
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
                            onclick="${removeMode
                                ? `removeSavedLanguageEntryById(${jsArg(entryId)}, event)`
                                : `toggleSavedLanguage(${jsArg(contextId)}, event)`}"
                            aria-pressed="${String(saved)}"
                            title="${escHtml(buttonTitle)}">
                            ${escHtml(buttonLabel)}
                        </button>
                    ` : ''}
                </div>

                <p class="vb-entry-def">
                    ${escHtml(definition)}
                </p>

                ${ordinary && upgraded ? `
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
                ` : upgraded ? `
                    <p class="vb-entry-example vb-entry-example-upgraded">
                        ${escHtml(upgraded)}
                    </p>
                ` : ''}
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
        entryId: entry.id,
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

    if (entry.upgraded) {
        lines.push(`Upgraded: ${entry.upgraded}`);
    }

    lines.push('');

    return lines.join('\n');
}

function buildAllLanguagePlainText() {
    const groups = getAllLanguageGroups();

    const totalCount = groups.reduce(
        (total, group) => total + group.entries.length,
        0
    );

    const lines = [
        `Compass · ${getEffectiveSubjectTitle()}`,
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
        `Compass · ${getEffectiveSubjectTitle()}`,
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

                ${entry.upgraded ? `
                    <p class="print-entry-example print-entry-example-upgraded">
                        ${escHtml(entry.upgraded)}
                    </p>
                ` : ''}
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
                    ${escHtml(getEffectiveSubjectTitle())}
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
        `${getEffectiveSubjectTitle()} — ${titleSuffix}`;

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
        contextTitle: getEffectiveSubjectTitle(),
        contextDescription: session =>
            `This subject is saving explored items and language for ${session.name}.`,
        primaryActionLabel: 'Wrap up this lesson',
        onPrimaryAction: openCompassWrapUp,
        resetKicker: 'CLEAR SUBJECT ACTIVITY',
        resetTitle: 'Clear this subject?',
        resetMessage: session =>
            `This removes explored items and saved language for ${session.name} in this subject.`,
        resetConfirmLabel: 'Clear activity',
        onResetSession: session => resetSession(session.name)
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
    const openedFromCover =
        trigger instanceof Element &&
        Boolean(trigger.closest('.cover-session-btn'));

    window.AtlasSessionPanel?.open(
        trigger,
        {
            initialView: openedFromCover
                ? 'manage'
                : 'safe'
        }
    );
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

    if (isDiscussionFocusOpen()) {
        renderDiscussionFocus();
    }

    if (isCulturalLensFocusOpen()) {
        renderCulturalLensFocus();
    }

    if (isCompassWrapUpOpen()) {
        renderCompassWrapUp();
    }
}

async function resetSession(name) {
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

function requestMyVersionEditingFromMobile() {
    closeMobileDrawer();

    window.setTimeout(() => {
        requestMyVersionEditing();
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
    moon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 17 17" fill="none" aria-hidden="true">
            <path d="M14.5 10.2A7 7 0 0 1 6.8 2.5a7 7 0 1 0 7.7 7.7Z"
                stroke="currentColor"
                stroke-width="1.35"
                stroke-linecap="round"
                stroke-linejoin="round"/>
        </svg>`,

    sun: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 17 17" fill="none" aria-hidden="true">
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
    return requireAtlasBridge().readAppearanceMode();
}

function applyAppearanceMode(mode) {
    return requireAtlasBridge().applyAppearanceMode(mode);
}

function setAppearanceMode(mode) {
    const normalized = mode === 'night'
        ? 'night'
        : 'light';

    const Bridge = requireAtlasBridge();

    Bridge.setAppearanceMode(normalized);

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

document.addEventListener('pointerdown', event => {
    const activeElement = document.activeElement;

    liveTutorPointerStartedInside = Boolean(
        isLiveTutorContentTarget(activeElement) &&
        activeElement.contains(event.target)
    );
}, true);

document.addEventListener('click', event => {
    const activeElement = document.activeElement;

    if (!isLiveTutorContentTarget(activeElement)) {
        liveTutorPointerStartedInside = false;
        return;
    }

    /*
     * A selection gesture may begin inside the editable text and finish
     * outside its visible rectangle. Keep the field active so the tutor
     * can copy, replace, define, or otherwise use the selected language.
     */
    if (liveTutorPointerStartedInside) {
        liveTutorPointerStartedInside = false;
        return;
    }

    const rect = activeElement.getBoundingClientRect();
    const tolerance = 10;

    const pointerIsNearElement =
        event.clientX >= rect.left - tolerance &&
        event.clientX <= rect.right + tolerance &&
        event.clientY >= rect.top - tolerance &&
        event.clientY <= rect.bottom + tolerance;

    liveTutorPointerStartedInside = false;

    if (!pointerIsNearElement) {
        activeElement.blur();
    }
}, true);

document.addEventListener('keydown', event => {
    handleFocusTrap(event);

    if (
        event.key === 'Escape' &&
        !document
            .getElementById('atlas-my-version-start-dialog')
            ?.hidden
    ) {
        event.preventDefault();
        closeMyVersionStartDialog();
        return;
    }

    if (
        event.key === 'Escape' &&
        !document
            .getElementById('atlas-restore-original-dialog')
            ?.hidden
    ) {
        event.preventDefault();
        cancelRestoreAtlasOriginal();
        return;
    }

    if (
        event.key === 'Escape' &&
        !document
            .getElementById('atlas-my-version-management-dialog')
            ?.hidden
    ) {
        event.preventDefault();
        closeMyVersionManagementDialog();
        return;
    }

    if (
        event.key === 'Escape' &&
        !document
            .getElementById('atlas-my-version-cover-dialog')
            ?.hidden
    ) {
        event.preventDefault();
        closeMyVersionCoverDialog();
        return;
    }

    if (isLiveTutorContentTarget(event.target)) {
        return;
    }

    const culturalLensFocusOpen =
        isCulturalLensFocusOpen();

    const discussionFocusOpen =
        isDiscussionFocusOpen();

    if (event.key === 'Escape') {
        if (discussionFocusOpen) {
            if (discussionFocusUpgradeOpen) {
                setDiscussionFocusUpgrade(
                    false,
                    'trigger'
                );
                return;
            }

            const upgradeOpen = document.querySelector(
                '#discussion-focus-upgrade .upgrade-panel.open'
            );

            if (upgradeOpen) {
                closeAllUpgradePanels();
                return;
            }

            if (discussionFocusFollowUpOpen) {
                const followUpId =
                    discussionFocusFollowUpId;

                setDiscussionFocusFollowUp(
                    null,
                    followUpId
                        ? `follow-up-${followUpId}`
                        : null
                );

                return;
            }

            closeDiscussionFocus();
            return;
        }

        if (culturalLensFocusOpen) {
            if (culturalLensFocusUpgradeOpen) {
                setCulturalLensFocusUpgrade(
                    false,
                    'trigger'
                );
                return;
            }

            closeCulturalLensFocus();
            return;
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
        discussionFocusOpen &&
        event.key === 'ArrowRight'
    ) {
        const nextButton = document.getElementById(
            'discussion-focus-next-btn'
        );

        if (nextButton && !nextButton.disabled) {
            event.preventDefault();
            navigateDiscussionFocus(1);
        }
    }

    if (
        discussionFocusOpen &&
        event.key === 'ArrowLeft'
    ) {
        const previousButton = document.getElementById(
            'discussion-focus-prev-btn'
        );

        if (
            previousButton &&
            !previousButton.disabled
        ) {
            event.preventDefault();
            navigateDiscussionFocus(-1);
        }
    }

    if (
        culturalLensFocusOpen &&
        event.key === 'ArrowRight'
    ) {
        const nextButton = document.getElementById(
            'cultural-lens-focus-next-btn'
        );

        if (nextButton && !nextButton.disabled) {
            event.preventDefault();
            navigateCulturalLensFocus(1);
        }
    }

    if (
        culturalLensFocusOpen &&
        event.key === 'ArrowLeft'
    ) {
        const previousButton = document.getElementById(
            'cultural-lens-focus-prev-btn'
        );

        if (
            previousButton &&
            !previousButton.disabled
        ) {
            event.preventDefault();
            navigateCulturalLensFocus(-1);
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

async function init() {
    if (
        typeof mountCompassSubjectShell === 'function'
    ) {
        mountCompassSubjectShell();
    }

    applyCompassFavicon();
    applyCoverConfig();
    applyDerivedLabels();
    applyLaunchOriginUI();

    renderAllCompassNavigation();

    document.addEventListener(
        'keydown',
        handleLiveTutorHistoryShortcut,
        true
    );

    document.addEventListener(
        'keydown',
        handleMyVersionUnlockKeyDown,
        true
    );

    document.addEventListener(
        'keyup',
        handleMyVersionUnlockKeyUp,
        true
    );

    window.addEventListener(
        'blur',
        resetMyVersionUnlockKeys
    );

    loadSessions();
    loadProgress();
    await loadTutorContentState();

    const ownedSubjectAuthoringIntent =
        consumeOwnedSubjectAuthoringIntent();

    applyCoverConfig();
    applyDerivedLabels();
    applySubjectCopy();
    renderAllCompassNavigation();
    applySubjectIdentityChrome();
    mountSessionPanel();

    updateSessionUI();
    renderUpgradeVisibilityControls();
    renderCLGrid();
    renderDiscussionSets();
    updateReflectionCompleteState();
    initAppearanceMode();
    restoreMyVersionWorkingDraftView();

    if (
        ownedSubjectAuthoringIntent &&
        !myVersionEditing
    ) {
        beginMyVersionEditing(false);
    }

    if (
        ownedSubjectAuthoringIntent === 'generate' &&
        myVersionEditing
    ) {
        window.setTimeout(() => {
            generateMyVersionFullSubject();
        }, 0);
    }

    window.addEventListener(
        'atlas:session-change',
        async () => {
            syncSessionsFromBridge();
            loadProgress();
            await loadTutorContentState();
            renderAllTutorContentSurfaces();
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
        () => {
            updateAppearanceToggleUI();
        }
    );

    window.addEventListener('storage', async event => {
        if (!event?.key) return;

        if (event.key === 'atlas::sessions') {
            syncSessionsFromBridge();
            loadProgress();
            await loadTutorContentState();
            renderAllTutorContentSurfaces();
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
