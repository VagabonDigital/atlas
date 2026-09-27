'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const loaderSource = fs.readFileSync(
    'compass/shared/compass-subject-loader.js',
    'utf8'
);

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function record({
    revision = 3,
    status = 'building',
    context = { premise: 'cloud context' }
} = {}) {
    return {
        id: 'subject-loader-handoff',
        ownerId: 'local-tutor',
        format: 'structured',
        revision,
        provenance: {
            kind: 'ai-subject-build'
        },
        metadata: {
            title: 'Loader Handoff',
            aiBuildStatus: status,
            generationContext: clone(context)
        },
        document: {
            schemaVersion: 1,
            module: {
                title: 'Loader Handoff',
                navTitle: 'Loader Handoff',
                catalogDescription: 'Test subject',
                bgImage: ''
            },
            subjectCopy: {},
            discussionSets: [],
            culturalLensCards: []
        }
    };
}

function waitTick() {
    return new Promise(resolve => setTimeout(resolve, 0));
}

async function testRenderBeforeForegroundGrantAndRevalidateAfterGrant() {
    let resolveGrant = null;
    const grantPromise = new Promise(resolve => {
        resolveGrant = resolve;
    });

    const getSubjectCalls = [];
    const requestCalls = [];
    const releases = [];
    const traces = [];
    const loadedScripts = [];

    const firstRecord = record({
        revision: 3,
        context: {
            premise: 'initial cloud context'
        }
    });

    const refreshedRecord = record({
        revision: 4,
        context: {
            premise: 'refreshed cloud context'
        }
    });

    let subjectRead = 0;

    const windowObject = {
        location: {
            href:
                'https://example.test/compass/subject/?id=subject-loader-handoff',
            reload() {}
        },

        AtlasTutorSubjects: {
            async getSubject(subjectId) {
                getSubjectCalls.push(subjectId);
                subjectRead += 1;

                return clone(
                    subjectRead === 1
                        ? firstRecord
                        : refreshedRecord
                );
            },

            async getBuildState(subjectId) {
                assert.equal(
                    subjectId,
                    'subject-loader-handoff'
                );

                return {
                    kind: 'full-subject',
                    completedStep: 8,
                    generationContext: {
                        premise:
                            'checkpoint context'
                    }
                };
            }
        },

        AtlasStructuredSubject: {
            validateDocument() {
                return {
                    valid: true,
                    errors: []
                };
            }
        },

        AtlasSubjectBuildWorkerClient: {
            traceDebug(stage, detail) {
                traces.push([
                    stage,
                    clone(detail)
                ]);
            },

            async initialize() {},

            getState() {
                return {
                    supported: true
                };
            },

            requestForegroundOwnership(
                subjectId,
                options
            ) {
                requestCalls.push({
                    subjectId,
                    options: clone(options)
                });

                return grantPromise;
            },

            releaseForegroundOwnership(
                subjectId,
                reason
            ) {
                releases.push({
                    subjectId,
                    reason
                });
            }
        },

        AtlasCloudCache: {
            clear() {}
        },

        AtlasTutorSubjectsCloudAuthority: {
            refresh() {}
        }
    };

    windowObject.window = windowObject;

    const documentObject = {
        body: {
            appendChild(script) {
                loadedScripts.push(
                    String(script.src || '')
                );

                if (
                    String(script.src || '')
                        .includes(
                            'compass-generation-recovery.js'
                        )
                ) {
                    windowObject
                        .AtlasCompassGenerationRecovery = {
                            installRuntime() {
                                return true;
                            }
                        };
                }

                Promise.resolve()
                    .then(() => {
                        script.onload?.();
                    });
            }
        },

        createElement() {
            return {
                src: '',
                onload: null,
                onerror: null,
                remove() {}
            };
        },

        getElementById() {
            return null;
        }
    };

    const context = {
        window: windowObject,
        document: documentObject,
        URL,
        console,
        setTimeout,
        clearTimeout,
        Promise,
        JSON,
        Math,
        Number,
        String,
        Boolean,
        Array,
        Object,
        Error
    };

    vm.runInNewContext(
        loaderSource,
        context,
        {
            filename:
                'compass-subject-loader.js'
        }
    );

    await waitTick();
    await waitTick();
    await waitTick();

    assert.equal(
        requestCalls.length,
        1,
        'Opening an unfinished subject must start exactly one foreground ownership request.'
    );

    assert.deepEqual(
        requestCalls[0],
        {
            subjectId:
                'subject-loader-handoff',
            options: {
                reason:
                    'subject-open'
            }
        }
    );

    assert.ok(
        windowObject
            .AtlasForegroundSubjectBuildHandoffPromise &&
        typeof windowObject
            .AtlasForegroundSubjectBuildHandoffPromise
            .then ===
            'function',
        'Loader must expose the in-flight handoff promise for the engine/recovery layers.'
    );

    assert.equal(
        windowObject
            .AtlasForegroundSubjectBuildHandoff,
        undefined,
        'A foreground grant must not be invented before the Worker actually yields.'
    );

    assert.ok(
        loadedScripts.some(src =>
            src.includes(
                'compass-engine.js'
            )
        ),
        'The subject runtime must proceed to Compass rendering while Worker ownership negotiation is still pending.'
    );

    assert.equal(
        windowObject
            .AtlasCompassSubjectRuntime
            ?.revision,
        3,
        'Initial durable subject should be installed immediately rather than waiting behind Worker yield.'
    );

    resolveGrant({
        completedStep: 8,
        readyToCommit: false,
        generationContext: {
            premise:
                'worker grant context'
        }
    });

    const handoff =
        await windowObject
            .AtlasForegroundSubjectBuildHandoffPromise;

    await waitTick();

    assert.equal(
        handoff?.completedStep,
        8
    );

    assert.equal(
        windowObject
            .AtlasForegroundSubjectBuildHandoff
            ?.subjectId,
        'subject-loader-handoff'
    );

    assert.equal(
        getSubjectCalls.length,
        2,
        'Loader must re-read the durable subject after ownership moves from Worker to page.'
    );

    assert.equal(
        windowObject
            .AtlasCompassSubjectRuntime
            ?.revision,
        4,
        'Post-grant revalidation must replace the initial subject runtime with the latest durable revision.'
    );

    assert.equal(
        windowObject
            .AtlasGenerationContext
            ?.premise,
        'checkpoint context',
        'Canonical build-state generation context must win after handoff revalidation.'
    );

    assert.equal(
        releases.length,
        0,
        'An unfinished revalidated subject must retain foreground ownership for the engine.'
    );

    assert.ok(
        traces.some(
            ([stage]) =>
                stage ===
                    'loader:handoff-installed'
        ),
        'Loader trace must expose successful handoff installation for browser diagnostics.'
    );
}

function testStaticCleanupContracts() {
    assert.match(
        loaderSource,
        /AtlasForegroundSubjectBuildHandoffPromise\s*=\s*\(async \(\) =>/
    );

    assert.match(
        loaderSource,
        /requestForegroundBuildOwnership\([\s\S]*?reason:[\s\S]*?'subject-open'/
    );

    assert.match(
        loaderSource,
        /AtlasForegroundSubjectBuildHandoffPromise[\s\S]*?requestForegroundBuildOwnership\([\s\S]*?installRuntimeSubject\(subject\);[\s\S]*?await loadCompassEngine\(\)/
    );

    assert.match(
        loaderSource,
        /handoff-installed[\s\S]*?AtlasCloudCache[\s\S]*?clear[\s\S]*?AtlasTutorSubjectsCloudAuthority[\s\S]*?refresh[\s\S]*?getSubject\(subjectId\)/
    );

    assert.match(
        loaderSource,
        /subject-completed-during-handoff/
    );

    assert.match(
        loaderSource,
        /subject-bootstrap-failed/
    );

    assert.match(
        loaderSource,
        /async function applyOwnedBuildGenerationContext\([\s\S]*?getBuildState\([\s\S]*?generationContext/
    );
}

(async () => {
    testStaticCleanupContracts();
    await testRenderBeforeForegroundGrantAndRevalidateAfterGrant();

    console.log(
        'Atlas Batch 2 subject-loader handoff passed: unfinished subjects negotiate foreground ownership exactly once without blocking initial Compass rendering, expose the pending handoff, revalidate durable subject state after the Worker grant, restore canonical checkpoint generation context, and retain explicit cleanup paths.'
    );
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
