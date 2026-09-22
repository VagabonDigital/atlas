'use strict';

// Project canonical MODULE.bgImage into the existing shared catalog. Subject
// files remain the source of truth; no runtime lesson fetch is needed on hubs.
// Run after changing an Original cover; --check is a read-only drift check.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const catalogPath = path.join(root, 'shared/compass-catalog-data.js');
const source = fs.readFileSync(catalogPath, 'utf8').replace(/\r\n/g, '\n');
const start = source.indexOf('    const RAW_SUBJECTS = [');
const end = source.indexOf('\n    ];', start);
let count = 0;
const projected = source.slice(start, end).replace(
    /(\n        \{\n            id: '([^']+)',)(?:\n            coverImage: [^\n]+,)?/g,
    (match, identity, id) => {
        const file = path.join(root, 'compass', id, 'subject-data.js');
        if (!fs.existsSync(file)) return identity;
        count++;
        const subject = fs.readFileSync(file, 'utf8');
        const image = vm.runInNewContext(subject + '\nMODULE.bgImage', {}, { timeout: 1000 });
        return identity + '\n            coverImage: ' + JSON.stringify(image || '') + ',';
    }
);
if (!count) throw new Error('No canonical subject definitions found.');
const next = source.slice(0, start) + projected + source.slice(end);
if (process.argv.includes('--check')) {
    if (next !== source) {
        console.error('Compass cover metadata differs from subject files. Run node scripts/sync-compass-covers.js');
        process.exitCode = 1;
    } else console.log('Compass catalog covers match canonical subject definitions.');
} else {
    fs.writeFileSync(catalogPath, next);
    console.log('Compass catalog cover metadata synchronized from subject definitions.');
}
