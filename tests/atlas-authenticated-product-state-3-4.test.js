'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const root = fs.readFileSync(
    'index.html',
    'utf8'
);
const compass = fs.readFileSync(
    'compass/index.html',
    'utf8'
);
const arcade = fs.readFileSync(
    'arcade/index.html',
    'utf8'
);
const sessionPanel = fs.readFileSync(
    'shared/atlas-session-panel.js',
    'utf8'
);
const contentRegistry = fs.readFileSync(
    'shared/atlas-content-registry.js',
    'utf8'
);
const account = fs.readFileSync(
    'shared/atlas-account.js',
    'utf8'
);
const learnerSessions = fs.readFileSync(
    'shared/atlas-learner-sessions-cloud-authority.js',
    'utf8'
);
const learnerCloudAdapter = fs.readFileSync(
    'shared/atlas-learner-sessions-cloud.js',
    'utf8'
);
const learnerContinuity = fs.readFileSync(
    'shared/atlas-learner-continuity-cloud-authority.js',
    'utf8'
);
const sharedContinuity = fs.readFileSync(
    'shared/atlas-shared-continuity-cloud-authority.js',
    'utf8'
);
const sharedSessionSubjects = fs.readFileSync(
    'shared/atlas-shared-session-subjects-cloud-authority.js',
    'utf8'
);
const tutorSubjects = fs.readFileSync(
    'shared/atlas-tutor-subjects-cloud-authority.js',
    'utf8'
);
const tutorContent = fs.readFileSync(
    'shared/atlas-tutor-content-cloud-authority.js',
    'utf8'
);
const persistenceTrust = fs.readFileSync(
    'shared/atlas-persistence-trust.js',
    'utf8'
);
const search = fs.readFileSync(
    'shared/atlas-search.js',
    'utf8'
);
const accountChromeCss = fs.readFileSync(
    'shared/atlas-account-chrome.css',
    'utf8'
);
const accountChrome = fs.readFileSync(
    'shared/atlas-account-chrome.js',
    'utf8'
);
const personalization = fs.readFileSync(
    'shared/atlas-hub-personalization-cloud-authority.js',
    'utf8'
);

// ---------------------------------------------------------------------------
// Atlas gateway: one product, authenticated state replaces acquisition state.
// ---------------------------------------------------------------------------

assert.match(
    root,
    /const authenticated =\s*hasAuthenticatedAccountContext\(\)[\s\S]*?atlasGatewayState =\s*authenticated \? 'authenticated' : 'anonymous'/
);

assert.match(
    root,
    /const nextHomeMarkup = authenticated\s*\? renderGateway\([\s\S]*?: renderAnonymousGateway\(/
);

assert.match(
    root,
    /function renderGateway\([\s\S]*?Welcome back,[\s\S]*?Choose a world/
);

assert.match(
    root,
    /savedLanguageCount[\s\S]*?Saved language[\s\S]*?Last lesson/
);

// ---------------------------------------------------------------------------
// Learners: account auth must activate the durable learner stack in-place.
// ---------------------------------------------------------------------------

assert.match(
    sessionPanel,
    /async function ensureLearnerCloud\([\s\S]*?atlas-learner-sessions-cloud\.js[\s\S]*?atlas-learner-sessions-cloud-authority\.js[\s\S]*?Authority\.initialize/
);

assert.match(
    sessionPanel,
    /window\.addEventListener\(\s*'atlas:account-change'[\s\S]*?ensureLearnerCloud\(\{ force: true \}\)[\s\S]*?refresh\(\)[\s\S]*?window\.renderHome\?\.\(\)/
);

assert.match(
    sessionPanel,
    /Gate\.requireCapability\(\s*'canCreateLearner'[\s\S]*?action: 'create-learner'/
);

assert.match(
    sessionPanel,
    /function getVisibleSessions\(\)[\s\S]*?if \(hasStoredAtlasAccountSession\(\)\)[\s\S]*?return sessions;[\s\S]*?session\.id ===[\s\S]*?Bridge\.defaultSessionId/
);

assert.match(
    sessionPanel,
    /function getFilteredSessions\(\)[\s\S]*?return getVisibleSessions\(\)\.filter/
);

assert.match(
    sessionPanel,
    /function getVisibleActiveSession\(\)[\s\S]*?hasStoredAtlasAccountSession\(\)[\s\S]*?Bridge\.defaultSessionId/
);

assert.match(
    sessionPanel,
    /const searchable =\s*hasStoredAtlasAccountSession\(\)[\s\S]*?searchLabel\.hidden =\s*!searchable[\s\S]*?searchInput\.hidden =\s*!searchable/
);

assert.match(
    learnerSessions,
    /async function createSession\(name\)[\s\S]*?if \(!authenticated\)[\s\S]*?createLearnerSession\(record\)[\s\S]*?Bridge\.setActiveSession\(saved\.id\)/
);

assert.match(
    learnerSessions,
    /async function saveLearnerMemory\([\s\S]*?updateLearnerSession\([\s\S]*?Bridge\.writeLearnerMemory/
);

// ---------------------------------------------------------------------------
// Continuity: named learners + Shared carry teaching state, language, history.
// ---------------------------------------------------------------------------

assert.match(
    learnerCloudAdapter,
    /atlas-learner-continuity-cloud-authority\.js/
);

assert.match(
    learnerCloudAdapter,
    /atlas-shared-continuity-cloud-authority\.js/
);

for (const continuitySource of [
    learnerContinuity,
    sharedContinuity
]) {
    assert.match(
        continuitySource,
        /function readLocalSnapshot\([\s\S]*?sessionStates[\s\S]*?ledgerEntries[\s\S]*?handoffs[\s\S]*?recentActivity[\s\S]*?languageReviewCompletedThrough/
    );
}

assert.match(
    learnerContinuity,
    /async function initialize\(\{ force = false \} = \{\}\)[\s\S]*?writeLocalSnapshots\([\s\S]*?writeCacheOwner\(userId\)/
);

assert.match(
    sharedContinuity,
    /async function initialize\(\{ force = false \} = \{\}\)[\s\S]*?writeLocalSnapshot\([\s\S]*?writeCacheOwner\(userId\)/
);

// ---------------------------------------------------------------------------
// Session Subjects: learner refs and Shared refs are both durable when signed in.
// ---------------------------------------------------------------------------

assert.match(
    learnerSessions,
    /async function getSessionSubjects\(sessionId\)[\s\S]*?current\.subjectRefs[\s\S]*?writeSessionSubjectCache/
);

assert.match(
    learnerSessions,
    /async function setSessionSubjects\([\s\S]*?subjectRefsSupported/
);

assert.match(
    account,
    /function loadSharedSessionSubjectsCloudAuthority\(\)[\s\S]*?atlas-shared-session-subjects-cloud-authority\.js/
);

assert.match(
    sharedSessionSubjects,
    /signed-in Shared Session Subjects are cloud-authoritative/
);

assert.match(
    sharedSessionSubjects,
    /const TABLE = 'shared_continuity_state'[\s\S]*?subject_refs/
);

// ---------------------------------------------------------------------------
// Compass authenticated state: restore Session Subjects + My Subjects + Originals.
// ---------------------------------------------------------------------------

assert.match(
    compass,
    /const authenticated =\s*Boolean\(getStoredCompassAccountUserId\(\)\)/
);

assert.match(
    compass,
    /const ownedSubjects = authenticated\s*\? await getOwnedSubjects/
);

assert.match(
    compass,
    /getSessionSubjects\(session\.id\)[\s\S]*?getLibraryState\(\)/
);

assert.match(
    compass,
    /const nextHubContentMarkup =\s*authenticated\s*\? \([\s\S]*?sessionSubjects[\s\S]*?ownedLibraryHtml[\s\S]*?remainingAtlasSubjects[\s\S]*?\)\s*:\s*\([\s\S]*?renderAnonymousCreationHero/
);

assert.match(
    compass,
    /kind === 'atlas-original-owned' \|\|\s*kind === 'atlas-my-version'/
);

// Live anonymous -> authenticated Compass must load the same cloud authorities.
assert.match(
    contentRegistry,
    /function installCompassHubLiveAccountBootstrap\(\)[\s\S]*?atlas:account-change[\s\S]*?scheduleCompassHubCloudAuthorityScripts\(\)/
);

assert.match(
    contentRegistry,
    /loadCompassHubCloudAuthorityScripts\([\s\S]*?AtlasTutorSubjectsCloudAuthority[\s\S]*?AtlasTutorContentCloudAuthority[\s\S]*?signalCompassCloudAuthorityReady\(\)/
);

// ---------------------------------------------------------------------------
// My Subjects + My Versions are account-owned and projected back into product UI.
// ---------------------------------------------------------------------------

assert.match(
    tutorSubjects,
    /async function createSubject\([\s\S]*?AtlasCloud/
);

assert.match(
    tutorSubjects,
    /async function getSessionSubjects\([\s\S]*?SESSION_SUBJECTS_PREFIX/
);

assert.match(
    tutorContent,
    /function projectCloudVersions\(versions\)[\s\S]*?hasMyVersion: true[\s\S]*?myVersionRevision[\s\S]*?myVersionUpdatedAt/
);

assert.match(
    tutorContent,
    /async function refreshProjection\(\)[\s\S]*?Cloud\.listTutorContentVersions\(\)[\s\S]*?projectCloudVersions\(versions\)[\s\S]*?refreshVisibleSurfaces\(\)/
);

assert.match(
    search,
    /item\?\.ownershipKind === 'my-subject'[\s\S]*?return 'My Subject'/
);

assert.match(
    search,
    /item\?\.ownershipKind === 'my-version' \|\|\s*item\?\.hasMyVersion === true[\s\S]*?return 'My Version'/
);

// ---------------------------------------------------------------------------
// Account isolation: durable browser projections swap with account identity.
// ---------------------------------------------------------------------------

assert.match(
    persistenceTrust,
    /const EXACT_LOCAL_KEYS = new Set\(\[[\s\S]*?'atlas::sessions'[\s\S]*?'atlas::handoffs'[\s\S]*?'atlas::registry'[\s\S]*?'learning::ledger'[\s\S]*?'atlas::learnerMemory'[\s\S]*?'atlas::tutorSubjects::library'/
);

assert.match(
    persistenceTrust,
    /const LOCAL_PREFIXES = \[[\s\S]*?'atlas::tutorSubjects::subject::'[\s\S]*?'atlas::tutorSubjects::sessionSubjects::'[\s\S]*?'atlas::tutorContent::version::'/
);

assert.match(
    persistenceTrust,
    /function syncScopeForUser\(userId\)[\s\S]*?stashGenericLocalState\(previousScope\)[\s\S]*?restoreScopedLocalState\(nextScope\)[\s\S]*?clearTransientAtlasSessionState\(\)[\s\S]*?dispatchScopeChange\(previousScope, nextScope\)/
);

assert.match(
    persistenceTrust,
    /window\.addEventListener\('atlas:account-change'[\s\S]*?syncScopeForUser\(event\?\.detail\?\.userId \|\| null\)/
);

assert.match(
    persistenceTrust,
    /AtlasLearnerSessionsCloudAuthority[\s\S]*?AtlasLearnerContinuityCloudAuthority[\s\S]*?AtlasSharedContinuityCloudAuthority[\s\S]*?AtlasSharedSessionSubjectsCloudAuthority[\s\S]*?AtlasTutorContentCloudSync/
);

// ---------------------------------------------------------------------------
// Arcade must switch out of public Preview state immediately on live auth.
// ---------------------------------------------------------------------------

assert.match(
    arcade,
    /const authenticated =\s*Boolean\(\s*getStoredPresentationUserId\(\)\s*\)/
);

assert.match(
    arcade,
    /atlasArcadeAccessState =\s*authenticated\s*\? 'authenticated'\s*:\s*'anonymous'/
);

assert.match(
    arcade,
    /window\.addEventListener\(\s*'atlas:account-change',\s*refresh\s*\)/
);

// ---------------------------------------------------------------------------
// Mobile/global navigation polish discovered during authenticated-state QA.
// ---------------------------------------------------------------------------

assert.match(
    accountChromeCss,
    /mobile-header-btn\.atlas-account-control\[data-account-state="sign-in"\][\s\S]*?border-radius: 20px;[\s\S]*?font-size: 0\.76rem;[\s\S]*?font-weight: 500;[\s\S]*?padding-inline: 0\.7rem;/
);

const mobileAccountIndex = root.indexOf(
    'data-atlas-account-control="mobile"'
);
const mobileSearchIndex = root.indexOf(
    'data-atlas-search',
    mobileAccountIndex
);
const mobileMenuIndex = root.indexOf(
    'aria-label="Menu"',
    mobileSearchIndex
);

assert.ok(
    mobileAccountIndex >= 0 &&
    mobileSearchIndex > mobileAccountIndex &&
    mobileMenuIndex > mobileSearchIndex,
    'Mobile account control should precede Search, with Search beside Menu'
);

assert.match(
    accountChrome,
    /const searchButton =\s*mobileActions\.querySelector\([\s\S]*?\[data-atlas-search\][\s\S]*?insertBefore\(\s*control,\s*searchButton\s*\)/
);

assert.match(
    personalization,
    /if \(!userId\)[\s\S]*?if \(previousUserId\)[\s\S]*?writeLocalState\(emptyState\(\)\)[\s\S]*?writeCacheOwner\(''\)/
);

const drawerSettingsIndex = root.indexOf(
    'onclick="closeDrawer();openSettingsModal()"'
);
const drawerFeedbackIndex = root.indexOf(
    'data-atlas-feedback'
);

assert.ok(
    drawerSettingsIndex >= 0 &&
    drawerFeedbackIndex >= 0 &&
    drawerSettingsIndex < drawerFeedbackIndex,
    'Settings should appear above Message the Atlas team in the mobile drawer'
);

console.log(
    'Stage 3.4 authenticated product state contract passed: signed-in Atlas restores learners, continuity, Session Subjects, My Subjects, My Versions, saved language/history, durable teaching state, account isolation, signed-out learner privacy, and live in-place product rendering.'
);
