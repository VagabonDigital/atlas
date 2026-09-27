'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const testsDir = path.join(root, 'tests');
const baselinePath = path.join(
    testsDir,
    'known-failing-contracts.json'
);
const strict = process.argv.includes('--strict');

const baseline = JSON.parse(
    fs.readFileSync(
        baselinePath,
        'utf8'
    )
);

const knownFailures = new Set(
    Array.isArray(baseline.tests)
        ? baseline.tests
        : []
);

const tests = fs.readdirSync(
    testsDir,
    { withFileTypes: true }
)
    .filter(
        entry =>
            entry.isFile() &&
            entry.name.endsWith('.test.js')
    )
    .map(
        entry =>
            path.posix.join(
                'tests',
                entry.name
            )
    )
    .sort();

if (tests.length === 0) {
    console.error(
        'No root Atlas tests were found.'
    );
    process.exitCode = 1;
    return;
}

const missingBaselineTests = [
    ...knownFailures
].filter(
    test => !tests.includes(test)
);

if (missingBaselineTests.length > 0) {
    console.error(
        'Known-failing test baseline contains missing files:'
    );
    for (const test of missingBaselineTests) {
        console.error(`- ${test}`);
    }
    process.exitCode = 1;
    return;
}

const failures = [];
const quarantinedFailures = [];
const recoveredTests = [];
let passed = 0;

function printCaptured(result) {
    if (result.stdout) {
        process.stdout.write(result.stdout);
    }
    if (result.stderr) {
        process.stderr.write(result.stderr);
    }
}

function failureSummary(result) {
    const combined =
        `${result.stderr || ''}\n${result.stdout || ''}`;

    const line = combined
        .split(/\r?\n/u)
        .map(value => value.trim())
        .find(value =>
            /(?:AssertionError|TypeError|ReferenceError|SyntaxError|Error:)/u
                .test(value)
        );

    if (line) return line;

    if (result.error) {
        return result.error.message;
    }

    if (result.signal) {
        return `signal ${result.signal}`;
    }

    return `exit ${result.status}`;
}

for (const test of tests) {
    const expectedToFail =
        knownFailures.has(test);

    process.stdout.write(
        `\n=== ${test} ===\n`
    );

    const result = spawnSync(
        process.execPath,
        [test],
        {
            cwd: root,
            env: process.env,
            encoding: 'utf8'
        }
    );

    const succeeded =
        !result.error &&
        result.status === 0;

    if (succeeded) {
        printCaptured(result);

        if (expectedToFail) {
            recoveredTests.push(test);
            console.error(
                `RECOVERED: remove ${test} from tests/known-failing-contracts.json.`
            );
        } else {
            passed += 1;
        }

        continue;
    }

    if (
        expectedToFail &&
        !strict
    ) {
        quarantinedFailures.push({
            test,
            reason: failureSummary(result)
        });
        console.log(
            `KNOWN FAIL: ${failureSummary(result)}`
        );
        continue;
    }

    printCaptured(result);
    failures.push({
        test,
        reason: failureSummary(result)
    });
}

console.log(
    `\nAtlas root suite: ${tests.length} files; ${passed} current passes; ${quarantinedFailures.length} known historical failures.`
);

if (quarantinedFailures.length > 0) {
    console.log(
        '\nKnown historical failures still executed:'
    );
    for (const failure of quarantinedFailures) {
        console.log(
            `- ${failure.test}: ${failure.reason}`
        );
    }
}

if (strict && quarantinedFailures.length > 0) {
    failures.push(...quarantinedFailures);
}

if (recoveredTests.length > 0) {
    console.error(
        '\nQuarantined tests unexpectedly passed. Remove them from the baseline:'
    );
    for (const test of recoveredTests) {
        console.error(`- ${test}`);
    }
}

if (
    failures.length > 0 ||
    recoveredTests.length > 0
) {
    if (failures.length > 0) {
        console.error(
            `\nUnexpected Atlas test failures: ${failures.length}`
        );
        for (const failure of failures) {
            console.error(
                `- ${failure.test} (${failure.reason})`
            );
        }
    }

    process.exitCode = 1;
} else {
    console.log(
        '\nAtlas supported regression baseline is green.\n'
    );
}
