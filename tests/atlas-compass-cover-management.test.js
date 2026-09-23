'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync(
    'compass/index.html',
    'utf8'
);
const engine = fs.readFileSync(
    'compass/shared/compass-engine.js',
    'utf8'
);
const originalEntry = fs.readFileSync(
    'compass/shared/atlas-original-entry.js',
    'utf8'
);
const subjectLoader = fs.readFileSync(
    'compass/shared/compass-subject-loader.js',
    'utf8'
);

const renderStart =
    source.indexOf(
        'function renderSubjectCard'
    );

const renderEnd =
    source.indexOf(
        '\n    function ',
        renderStart + 1
    );

assert.ok(
    renderStart >= 0 &&
    renderEnd > renderStart,
    'Compass Hub must expose renderSubjectCard.'
);

const renderSubjectCard =
    source.slice(
        renderStart,
        renderEnd
    );

assert.match(
    renderSubjectCard,
    /openOwnedSubjectCoverPicker/,
    'Owned-subject management must open the cover picker.'
);

assert.match(
    renderSubjectCard,
    /Change cover/,
    'Owned-subject management must label the action Change cover.'
);

assert.doesNotMatch(
    renderSubjectCard,
    /openSubjectArtworkStudio/,
    'The Hub must no longer expose the Artwork Studio from subject cards.'
);

assert.match(
    source,
    /function openSubjectArtworkStudio/,
    'The Artwork Studio implementation must remain while disconnected.'
);

assert.match(
    source,
    /context\.operation === 'open-subject-cover'/,
    'Return-to-intent must support reopening the Hub cover picker.'
);

assert.match(
    source,
    /window\.AtlasAI\.searchCovers/,
    'The Hub cover picker must use the existing Atlas cover-search API.'
);

assert.match(
    source,
    /coverImage:\s*normalizedUrl/,
    'Changing a cover must update subject cover metadata.'
);

assert.match(
    source,
    /bgImage:\s*normalizedUrl/,
    'Changing a cover must update the canonical subject cover.'
);

assert.match(
    engine,
    /function getMyVersionCoverPickerCurrentHttpUrl\(\)/,
    'The subject cover picker must expose the current cover URL.'
);

assert.match(
    engine,
    /getEffectiveSubjectCoverImage\(\)/,
    'Current cover URL must come from the effective subject cover.'
);

assert.match(
    engine,
    /parsedUrl\.protocol !== 'http:'[\s\S]*parsedUrl\.protocol !== 'https:'/,
    'Only normal HTTP(S) covers should populate the URL field.'
);

assert.match(
    engine,
    /if \(urlMode\) \{\s*populateMyVersionCoverPickerCurrentUrl\(\);\s*\}/,
    'Opening the URL provider must populate the current HTTP(S) cover when the field is empty.'
);

assert.match(
    engine,
    /!input \|\|[\s\S]*String\(input\.value \|\| ''\)\.trim\(\)/,
    'Existing URL edits must not be overwritten when switching picker providers.'
);

assert.match(
    originalEntry,
    /compass-engine\.js\?v=20260923-currentcoverurl1/,
    'Atlas Original subjects must load the current-cover URL picker engine revision.'
);

assert.match(
    subjectLoader,
    /compass-engine\.js\?v=20260923-currentcoverurl1/,
    'Owned subjects must load the current-cover URL picker engine revision.'
);

console.log(
    'Compass cover-management contract verified.'
);
