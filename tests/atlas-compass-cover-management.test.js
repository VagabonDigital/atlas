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

assert.doesNotMatch(
    source,
    /\.subject-card--cover:is\(:hover, :focus-within\)/,
    'Pointer-restored focus must not pin an image-led card in its expanded state.'
);

assert.match(
    source,
    /\.subject-card--cover:is\(:hover, :has\(:focus-visible\)\)/,
    'Keyboard-visible focus must continue to expose the expanded image-led card state.'
);

assert.match(
    source,
    /\.subject-card--cover:is\(:hover, :has\(:focus-visible\)\) \{[\s\S]*?transform: none;/,
    'Image-led card hover must not add whole-card lift during the reveal.'
);

assert.match(
    source,
    /\.subject-card--cover:hover \.btn-launch \{\s*transform: none;\s*\}/,
    'Image-led card hover must not add a separate launch-button lift.'
);

assert.match(
    source,
    /--subject-cover-border: rgba\(74, 91, 84, 0\.09\);/,
    'Image-led cards must retain a stable resting border during hover.'
);

assert.match(
    source,
    /transition: box-shadow 320ms ease;/,
    'Image-led cards must not animate border color during hover.'
);

assert.doesNotMatch(
    source,
    /transition: flex-basis/,
    'Image-led cover reveal must not animate flex-basis.'
);

assert.match(
    source,
    /\.subject-card-cover \{[\s\S]*?position: absolute;[\s\S]*?height: var\(--subject-cover-rest\)/,
    'Image-led cover media must keep a fixed render box.'
);

assert.match(
    source,
    /\.subject-card-content::before \{[\s\S]*?transform: translate3d\([\s\S]*?var\(--subject-cover-shift\)/,
    'The image/content seam must move on a translated content surface.'
);

assert.match(
    source,
    /\.subject-card--cover \.subject-card-header \{[\s\S]*?var\(--subject-cover-shift\)/,
    'Card heading movement must use compositor transforms.'
);

assert.match(
    source,
    /\.subject-card--cover \.subject-card-hook \{[\s\S]*?var\(--subject-cover-shift\)/,
    'Card hook movement must use compositor transforms.'
);

assert.match(
    source,
    /clip-path: inset\([\s\S]*?var\(--subject-hook-hidden, 0px\)[\s\S]*?\);/,
    'The compact hook state must be clipped rather than line-clamped.'
);

assert.match(
    source,
    /--subject-hook-hidden/,
    'Hub sizing must publish the measured hidden hook depth.'
);

assert.doesNotMatch(
    source,
    /\.subject-card--cover:is\(:hover, :has\(:focus-visible\)\)[\s\S]*?-webkit-line-clamp: unset/,
    'Hover must not toggle line-clamp state for image-led cards.'
);

assert.match(
    source,
    /clip-path 420ms[\s\S]*cubic-bezier\(0\.25, 0\.8, 0\.25, 1\)/,
    'The copy reveal must use the same compositor timing as the seam.'
);

assert.match(
    source,
    /\.subject-card-cover img \{[\s\S]*?transform: scale\(1\.035\);[\s\S]*?transition:[\s\S]*?transform 420ms/,
    'Image-led cards may add character with compositor-only image scaling.'
);

assert.match(
    source,
    /\.subject-card--cover:is\(:hover, :has\(:focus-visible\)\)[\s\S]*?\.subject-card-cover img \{\s*transform: scale\(1\);/,
    'Hover must settle the cover image without resizing its layout box.'
);

assert.match(
    source,
    /transform 420ms[\s\S]*cubic-bezier\(0\.25, 0\.8, 0\.25, 1\)/,
    'The compositor reveal must retain the gentler 420ms timing curve.'
);

assert.match(
    source,
    /window\.AtlasAI\.searchCovers/,
    'The Hub cover picker must use the existing Atlas cover-search API.'
);

assert.match(
    source,
    /function getHubCoverPickerCurrentHttpUrl\(\)/,
    'The Hub cover picker must resolve the currently applied cover URL.'
);

assert.match(
    source,
    /record\?\.document\?\.module\?\.bgImage \|\|[\s\S]*record\?\.metadata\?\.coverImage/,
    'The Hub cover picker must read the canonical owned-subject cover.'
);

assert.match(
    source,
    /parsedUrl\.protocol !== 'http:'[\s\S]*parsedUrl\.protocol !== 'https:'/,
    'The Hub cover picker must only expose normal HTTP(S) covers in the URL field.'
);

assert.match(
    source,
    /if \(urlMode\) \{\s*populateHubCoverPickerCurrentUrl\(\);\s*\}/,
    'The Hub URL provider must populate the current cover when opened.'
);

assert.match(
    source,
    /!input \|\|[\s\S]*String\(input\.value \|\| ''\)\.trim\(\)/,
    'The Hub URL provider must preserve an in-progress replacement URL.'
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
