'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const catalogSource = fs.readFileSync(
    'shared/compass-catalog-data.js',
    'utf8'
);
const registry = fs.readFileSync(
    'shared/atlas-content-registry.js',
    'utf8'
);
const compass = fs.readFileSync(
    'compass/index.html',
    'utf8'
);
const engine = fs.readFileSync(
    'compass/shared/compass-engine.js',
    'utf8'
);
const search = fs.readFileSync(
    'shared/atlas-search.js',
    'utf8'
);
const capabilityGate = fs.readFileSync(
    'shared/atlas-capability-gate.js',
    'utf8'
);
const originalEntry = fs.readFileSync(
    'compass/shared/atlas-original-entry.js',
    'utf8'
);

const window = {};
vm.runInNewContext(
    catalogSource,
    { window },
    { filename: 'shared/compass-catalog-data.js' }
);

const subjects = Array.from(
    window.CompassCatalogData.getCompassSubjects()
);

const built = subjects.filter(
    subject => subject.status === 'available'
);

const publicFullIds = built
    .filter(subject => subject.publicAccess === 'full')
    .map(subject => subject.id)
    .sort();

assert.deepEqual(
    publicFullIds,
    [
        'business-meetings-clear-updates',
        'octopuses-change-colour',
        'odyssey-worth-the-hype',
        'words-that-stick'
    ],
    'anonymous Compass must expose exactly the four agreed full subjects'
);

assert.ok(
    built.length > publicFullIds.length,
    'the built catalogue must still contain preview-only subjects'
);

for (const subject of built) {
    assert.ok(
        ['full', 'preview'].includes(subject.publicAccess),
        `built subject ${subject.id} must declare public access`
    );
}

for (const id of publicFullIds) {
    assert.equal(
        window.CompassCatalogData
            .getCompassSubjectPublicAccess(id),
        'full'
    );
}

assert.equal(
    window.CompassCatalogData
        .getCompassSubjectPublicAccess(
            'game-theory'
        ),
    'preview'
);
assert.equal(
    window.CompassCatalogData
        .getCompassSubjectPublicAccess(
            'compass:game-theory'
        ),
    'preview'
);
assert.equal(
    window.CompassCatalogData
        .getCompassSubjectPublicAccess(
            'not-a-subject'
        ),
    'preview'
);

assert.match(
    registry,
    /const publicAccess =\s*subject\.publicAccess === 'full'\s*\? 'full'\s*:\s*'preview';/
);
assert.match(
    registry,
    /status,\s*publicAccess,\s*launchUrl/
);

assert.match(
    compass,
    /subject\.publicAccess === 'preview'[\s\S]*?!getStoredCompassAccountUserId\(\)[\s\S]*?actionLabel: 'Preview'/
);
assert.match(
    compass,
    /publicAccess:\s*subject\.publicAccess === 'full'\s*\? 'full'\s*:\s*'preview'/
);
assert.match(
    compass,
    /const authenticated =\s*Boolean\(getStoredCompassAccountUserId\(\)\);/
);
assert.match(
    compass,
    /atlasCompassAccessState =\s*authenticated\s*\? 'authenticated'\s*:\s*'anonymous'/
);
assert.match(
    compass,
    /const ownedSubjects = authenticated\s*\? await getOwnedSubjects/
);
assert.match(
    compass,
    /const Subjects = authenticated\s*\? window\.AtlasTutorSubjects\s*:\s*null;/
);
assert.match(
    compass,
    /if \(authenticated && !useInitialSnapshot\)/
);
assert.match(
    compass,
    /const nextHubContentMarkup =\s*authenticated\s*\? \([\s\S]*?getActiveSessionSubjectCollectionTitle\(\)[\s\S]*?ownedLibraryHtml[\s\S]*?: renderSubjectCollection\([\s\S]*?remainingAtlasSubjects,[\s\S]*?'Atlas Subjects'/
);
assert.match(
    compass,
    /getStoredCompassAccountUserId\(\)\s*\? \(\s*'<div class="subject-card-management">/
);
assert.match(
    compass,
    /Explore real Atlas Subjects and see where the conversation goes\./
);

assert.match(
    compass,
    /function renderAnonymousCreationHero\(\)[\s\S]*?<h2 class="subject-library-title">My Subjects<\/h2>[\s\S]*?Create exactly what your lesson needs\.[\s\S]*?Create a subject/
);
assert.match(
    compass,
    /renderAnonymousCreationHero\(\)\s*\+\s*renderSubjectCollection\(\s*remainingAtlasSubjects,\s*'Atlas Subjects'/
);
assert.match(
    compass,
    /function openAnonymousCreatePreview\([\s\S]*?openCreateSubjectDialog\([\s\S]*?anonymousPreview: true/
);
assert.match(
    compass,
    /function syncAnonymousCreatePreviewState\([\s\S]*?Ready to build\. Create and save this subject with a free Atlas account\.[\s\S]*?Create this subject/
);
assert.match(
    compass,
    /input\?\.addEventListener\([\s\S]*?'input'[\s\S]*?syncAnonymousCreatePreviewState\(/
);
assert.match(
    compass,
    /function chooseCompassSubjectIdea\([\s\S]*?syncAnonymousCreatePreviewState\(\s*dialog\s*\)/
);
assert.match(
    compass,
    /const anonymousPreview =\s*options\.anonymousPreview === true\s*&&\s*!getStoredCompassAccountUserId\(\);/
);
assert.match(
    compass,
    /!options\.skipCapabilityGate\s*&&\s*!anonymousPreview[\s\S]*?'canCreateSubject'[\s\S]*?'open-create-dialog'/
);
assert.match(
    compass,
    /state\.anonymousPreview[\s\S]*?requireAnonymousCreatePreviewAccess\([\s\S]*?createMode[\s\S]*?confirm/
);
assert.match(
    compass,
    /requireAnonymousCreatePreviewAccess[\s\S]*?'canCreateSubject'[\s\S]*?'create-subject'[\s\S]*?'continue-create-preview'/
);
assert.match(
    compass,
    /COMPASS_CREATE_PREVIEW_DRAFT_PREFIX[\s\S]*?collectCompassCreateDialogDraft[\s\S]*?storeCompassCreatePreviewDraft[\s\S]*?consumeCompassCreatePreviewDraft/
);
assert.match(
    compass,
    /context\.operation ===\s*'continue-create-preview'[\s\S]*?consumeCompassCreatePreviewDraft[\s\S]*?openCreateSubjectDialog/
);
assert.match(
    compass,
    /context\.operation ===\s*'continue-create-preview'[\s\S]*?draft\.createMode === 'blank'[\s\S]*?confirmOwnedSubjectDialog\(/
);
assert.match(
    compass,
    /function renderAnonymousCreationHero\(\)[\s\S]*?Create a subject/
);
assert.doesNotMatch(
    compass,
    /function renderAnonymousCreationHero\(\)[\s\S]*?Preview creation/
);
assert.doesNotMatch(
    compass,
    /ANONYMOUS_COMPASS_PREVIEW_IDEAS|getAnonymousCompassPreviewSuggestions/
);
assert.match(
    compass,
    /const anonymousSuggestionPreview =[\s\S]*?anonymousPreview === true/
);
assert.match(
    compass,
    /if \(!anonymousSuggestionPreview\) \{[\s\S]*?'canUseAI'[\s\S]*?'suggest-subject-ideas'[\s\S]*?\}/
);
assert.match(
    compass,
    /await window\.AtlasAI\s*\.suggestSubjectIdeas\(\{[\s\S]*?mode:[\s\S]*?selectedMode\.id[\s\S]*?topicFocus[\s\S]*?languageLevel[\s\S]*?allowAnonymous:[\s\S]*?anonymousSuggestionPreview/
);

assert.match(
    engine,
    /function getCompassSubjectPublicAccess\(\)/
);
assert.match(
    engine,
    /Catalog\.getCompassSubjectPublicAccess\(\s*MODULE\.id\s*\)/
);
assert.match(
    engine,
    /function isAnonymousCompassSubjectPreview\(\)/
);
assert.match(
    engine,
    /getCompassSubjectPublicAccess\(\) !== 'full'/
);
assert.match(
    engine,
    /Create free account to explore/
);
assert.match(
    engine,
    /Gate\.requireAuthentication\(\{[\s\S]*?action: 'open-gated-content'[\s\S]*?operation: 'begin-compass-subject'[\s\S]*?subjectId: MODULE\.id[\s\S]*?mode: 'create'/
);
assert.match(
    engine,
    /function beginModule\(\{\s*skipPublicAccessGate = false\s*\} = \{\}\)/
);
assert.match(
    engine,
    /goToView\(\s*'view-orientation',\s*\{ skipPublicAccessGate \}\s*\);/
);
assert.match(
    engine,
    /function goToView\(\s*viewId,\s*\{ skipPublicAccessGate = false \} = \{\}\s*\)/
);
assert.match(
    engine,
    /viewId !== 'view-cover'[\s\S]*?!skipPublicAccessGate[\s\S]*?isAnonymousCompassSubjectPreview\(\)[\s\S]*?requestCompassSubjectAccess\([\s\S]*?return;/
);
assert.match(
    engine,
    /isAnonymousCompassSubjectPreview\(\)[\s\S]*?requestCompassSubjectAccess\([\s\S]*?return;/
);
assert.match(
    engine,
    /beginModule\(\{\s*skipPublicAccessGate: true\s*\}\)/
);
assert.match(
    engine,
    /COMPASS SUBJECT · PREVIEW/
);
assert.match(
    engine,
    /atlasCompassPublicAccess =\s*preview \? 'preview' : 'full'/
);

assert.match(
    search,
    /function itemContextLabel\(item\)/
);
assert.match(
    search,
    /item\?\.world === 'compass'[\s\S]*?item\?\.type === 'subject'[\s\S]*?item\?\.publicAccess === 'preview'[\s\S]*?return 'Preview'/
);
assert.equal(
    (
        search.match(
            /sub: itemContextLabel\(item\)/g
        ) || []
    ).length,
    2,
    'Recent and typed Search results must expose preview context'
);

assert.match(
    capabilityGate,
    /async function requireAuthentication\(/
);
assert.match(
    capabilityGate,
    /interruptForAuthentication\(\{/
);
assert.match(
    capabilityGate,
    /OUTCOMES,\s*requireAuthentication,\s*requireCapability/
);

assert.match(
    originalEntry,
    /atlas-content-registry\\.js\\?v=20260920-googleid1/
);

console.log(
    'Stage 3.2 anonymous Compass contract passed: real catalogue, four full subjects, preview routing, live anonymous suggestion exploration, clear ready-to-build state, protected creation boundary with automatic post-auth resume, and Search visibility.'
);
