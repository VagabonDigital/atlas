'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const atlasAI = fs.readFileSync(
    'shared/atlas-ai.js',
    'utf8'
);

const artwork = fs.readFileSync(
    'shared/atlas-subject-artwork.js',
    'utf8'
);

const hub = fs.readFileSync(
    'compass/index.html',
    'utf8'
);

async function verifyAuthenticatedArtworkRequest() {
    let captured = null;

    const window = {
        fetch: async (input, init) => {
            captured = {
                input,
                init
            };

            return {
                ok: true,
                status: 200,
                async json() {
                    return {
                        ok: true,
                        payload: {
                            svg:
                                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 140"><circle cx="90" cy="70" r="20" fill="currentColor"/></svg>'
                        }
                    };
                }
            };
        },

        AtlasCloud: {
            async getSession() {
                return {
                    access_token:
                        'signed-test-token'
                };
            }
        },

        crypto: {
            randomUUID() {
                return '11111111-2222-4333-8444-555555555555';
            }
        },

        setTimeout,
        clearTimeout
    };

    vm.runInNewContext(
        atlasAI,
        {
            window,
            Headers,
            AbortController,
            console
        },
        {
            filename: 'shared/atlas-ai.js'
        }
    );

    const generated =
        await window.AtlasAI
            .generateSubjectArtwork({
                subjectId:
                    'subject-test-owned-123',

                subject: {
                    title:
                        'Can You Learn English While You Sleep?',

                    description:
                        'A sleep-learning subject.'
                },

                idea:
                    'A moon over a pillow'
            });

    assert.ok(
        generated.svg.includes('<svg')
    );

    assert.equal(
        captured.input,
        'https://atlas-ai.savvy989.workers.dev/generate-subject-artwork'
    );

    assert.equal(
        captured.init.headers.get(
            'Authorization'
        ),
        'Bearer signed-test-token'
    );

    assert.equal(
        captured.init.headers.get(
            'X-Atlas-Request-Id'
        ),
        '11111111-2222-4333-8444-555555555555'
    );

    assert.equal(
        captured.init.headers.get(
            'X-Atlas-Subject-Id'
        ),
        'subject-test-owned-123'
    );
}

assert.match(
    atlasAI,
    /async function generateSubjectArtwork[\s\S]*?requestAtlasAI\([\s\S]*?\/generate-subject-artwork/
);

assert.match(
    atlasAI,
    /subjectIdOverride[\s\S]*?X-Atlas-Subject-Id/
);

assert.match(
    artwork,
    /window\.AtlasAI[\s\S]*?AI\.generateSubjectArtwork\([\s\S]*?sanitizeSvg/
);

assert.match(
    artwork,
    /subjectId:\s*state\.subjectId/
);

assert.doesNotMatch(
    artwork,
    /AI_BASE_URL/
);

assert.doesNotMatch(
    artwork,
    /fetch\(\s*\`\$\{AI_BASE_URL\}\/generate-subject-artwork/
);

assert.match(
    hub,
    /atlas-subject-artwork\.js\?v=20260921-artworkauth1/
);

assert.match(
    hub,
    /atlas-ai\.js\?v=20260921-artworkauth1/
);

verifyAuthenticatedArtworkRequest()
    .then(() => {
        console.log(
            'Atlas artwork auth contract passed: Artwork uses the shared authenticated AI transport with bearer auth, request identity, owned-subject attribution, and client SVG validation.'
        );
    })
    .catch(error => {
        console.error(error);
        process.exitCode = 1;
    });
