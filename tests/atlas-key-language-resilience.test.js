'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const atlasAI = fs.readFileSync(
    'shared/atlas-ai.js',
    'utf8'
);

const engine = fs.readFileSync(
    'compass/shared/compass-engine.js',
    'utf8'
);

const recovery = fs.readFileSync(
    'compass/shared/compass-generation-recovery.js',
    'utf8'
);

const subjectCss = fs.readFileSync(
    'compass/shared/compass-subject.css',
    'utf8'
);

async function verifyPlannerFallback() {
    let requestCount = 0;
    let requestId = 0;

    const window = {
        fetch: async () => {
            requestCount += 1;

            return {
                ok: false,
                status: 502,
                async json() {
                    return {
                        ok: false,
                        error: 'Temporary provider failure.'
                    };
                }
            };
        },

        AtlasCloud: {
            async getSession() {
                return {
                    access_token: 'test-token'
                };
            }
        },

        AtlasCompassSubjectRuntime: {
            source: 'owned',
            subjectId: 'subject-test'
        },

        crypto: {
            randomUUID() {
                requestId += 1;
                return `request-${requestId}-abcdefgh`;
            }
        },

        setTimeout(callback) {
            callback();
            return 1;
        },

        clearTimeout() {}
    };

    const context = {
        window,
        Headers,
        AbortController,
        console: {
            warn() {},
            error() {},
            log() {}
        }
    };

    vm.runInNewContext(
        atlasAI,
        context,
        {
            filename: 'shared/atlas-ai.js'
        }
    );

    const selected =
        await window.AtlasAI
            .selectKeyLanguageOpportunities({
                section: 'discussion',
                limit: 2,
                candidates: [
                    { id: 'a' },
                    { id: 'b' },
                    { id: 'c' },
                    { id: 'd' }
                ]
            });

    assert.deepEqual(
        Array.from(selected),
        ['b', 'd'],
        'Transient Key planner failure should use deterministic local selection.'
    );

    assert.equal(
        requestCount,
        3,
        'The normal bounded Atlas AI retry policy should run before Key planning falls back.'
    );
}

assert.match(
    atlasAI,
    /select-key-language-opportunities[\s\S]*?isTransientAtlasAIStatus[\s\S]*?selectFallbackKeyLanguageOpportunities/
);

assert.match(
    engine,
    /phase: 'selecting-key'/
);

assert.match(
    engine,
    /Choosing key Discussion language/
);

assert.match(
    engine,
    /Choosing key Cultural Lens language/
);

assert.match(
    recovery,
    /is-recovering-full-subject/
);

assert.match(
    subjectCss,
    /is-recovering-full-subject[\s\S]*?atlas-my-version-ai:not\(#atlas-full-subject-retry\)/
);

verifyPlannerFallback()
    .then(() => {
        console.log(
            'Atlas Key language resilience contract passed: transient planner failure falls back locally, selection has visible progress, and recovery controls remain contained.'
        );
    })
    .catch(error => {
        console.error(error);
        process.exitCode = 1;
    });
