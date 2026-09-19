'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const account = fs.readFileSync(
    'account/index.html',
    'utf8'
);

assert.match(
    account,
    /<meta name="color-scheme" content="light dark">/
);

assert.match(
    account,
    /atlas::activeSessionId[\s\S]*?atlas::appearanceBySession[\s\S]*?atlas::appearanceMode/
);

assert.match(
    account,
    /document\.documentElement\.dataset\.theme\s*=\s*readAtlasAppearance\(\)/
);

assert.match(
    account,
    /html\[data-theme="night"\][\s\S]*?--canvas:[\s\S]*?--surface:[\s\S]*?--text:[\s\S]*?--accent:/
);

assert.match(
    account,
    /background:\s*radial-gradient\([^\n]*var\(--page-glow\)[\s\S]*?var\(--canvas\)/
);

assert.match(
    account,
    /background: var\(--surface-control\);[\s\S]*?color: var\(--text\);/
);

assert.doesNotMatch(
    account,
    /background:\s*white;/
);

assert.match(
    account,
    /window\.addEventListener\(\s*'pageshow',[\s\S]*?refreshAccountAppearance/
);

assert.match(
    account,
    /event\.key === 'atlas::appearanceMode'[\s\S]*?event\.key === 'atlas::appearanceBySession'/
);

console.log(
    'Atlas account theme coherence contract passed.'
);
