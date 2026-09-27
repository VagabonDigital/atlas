'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const testsDir = path.join(root, 'tests');

const tests = fs.readdirSync(testsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.test.js'))
    .map((entry) => entry.name)
    .sort();

if (tests.length === 0) {
    console.error('No root Atlas tests were found.');
    process.exitCode = 1;
    return;
}

const failures = [];

for (const test of tests) {
    const relativePath = path.posix.join('tests', test);
    process.stdout.write(`\n=== ${relativePath} ===\n`);

    const result = spawnSync(
        process.execPath,
        [relativePath],
        {
            cwd: root,
            env: process.env,
            stdio: 'inherit'
        }
    );

    if (result.error) {
        failures.push({
            test: relativePath,
            reason: result.error.message
        });
        continue;
    }

    if (result.status !== 0) {
        failures.push({
            test: relativePath,
            reason: result.signal
                ? `signal ${result.signal}`
                : `exit ${result.status}`
        });
    }
}

if (failures.length > 0) {
    console.error(
        `\nAtlas verification failed in ${failures.length} of ${tests.length} test files:\n`
    );
    for (const failure of failures) {
        console.error(`- ${failure.test} (${failure.reason})`);
    }
    process.exitCode = 1;
} else {
    console.log(`\nAtlas root suite passed: ${tests.length} test files.\n`);
}
