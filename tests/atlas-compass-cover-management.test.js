'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync(
    'compass/index.html',
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

console.log(
    'Compass Hub cover-management contract verified.'
);
