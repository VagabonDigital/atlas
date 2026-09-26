'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const workerSource = fs
    .readFileSync(
        'shared/worker.js',
        'utf8'
    )
    .replace(
        'export default {',
        'globalThis.__atlasWorker = {'
    );

let providerFactory = null;
let finishCalls = [];
let providerRequests = [];

function jsonResponse(body, status = 200) {
    return new Response(
        JSON.stringify(body),
        {
            status,
            headers: {
                'Content-Type':
                    'application/json'
            }
        }
    );
}

async function mockFetch(input, init = {}) {
    const url =
        typeof input === 'string'
            ? input
            : input.url;

    if (
        url ===
        'https://supabase.test/auth/v1/user'
    ) {
        return jsonResponse({
            id: 'user-test',
            email: 'test@example.com'
        });
    }

    if (
        url ===
        'https://supabase.test/rest/v1/rpc/atlas_begin_ai_operation_v1'
    ) {
        return jsonResponse({
            allowed: true,
            usageClass:
                'subject_build_internal',
            actionType:
                'key_language_planner'
        });
    }

    if (
        url ===
        'https://supabase.test/rest/v1/rpc/atlas_finish_ai_operation_v1'
    ) {
        finishCalls.push(
            JSON.parse(
                String(init.body || '{}')
            )
        );

        return jsonResponse({
            ok: true
        });
    }

    if (
        url ===
        'https://api.openai.com/v1/responses'
    ) {
        providerRequests.push(
            JSON.parse(
                String(init.body || '{}')
            )
        );

        return providerFactory();
    }

    throw new Error(
        `Unexpected fetch: ${url}`
    );
}

const context = {
    console: {
        log() {},
        warn() {},
        error() {}
    },
    fetch:
        mockFetch,
    Request,
    Response,
    Headers,
    URL,
    AbortController,
    TextEncoder,
    TextDecoder,
    crypto,
    setTimeout,
    clearTimeout
};

context.globalThis = context;

vm.runInNewContext(
    workerSource,
    context,
    {
        filename:
            'shared/worker.js'
    }
);

const worker =
    context.__atlasWorker;

const env = {
    ATLAS_SUPABASE_URL:
        'https://supabase.test',
    ATLAS_SUPABASE_SECRET_KEY:
        'service-role-test',
    OPENAI_API_KEY:
        'openai-test',
    ATLAS_AI_MODEL:
        'gpt-5.6-luna',
    ALLOWED_ORIGIN:
        'https://atlasfortutors.com'
};

function plannerRequest() {
    return new Request(
        'https://atlas-ai.test/select-key-language-opportunities',
        {
            method: 'POST',
            headers: {
                'Authorization':
                    'Bearer user-token',
                'Origin':
                    'https://atlasfortutors.com',
                'Content-Type':
                    'application/json',
                'X-Atlas-Request-Id':
                    'request-test',
                'X-Atlas-Subject-Id':
                    'subject-test'
            },
            body: JSON.stringify({
                section:
                    'discussion',
                limit:
                    2,
                candidates: [
                    {
                        id: 'a',
                        preview: 'A'
                    },
                    {
                        id: 'b',
                        preview: 'B'
                    },
                    {
                        id: 'c',
                        preview: 'C'
                    },
                    {
                        id: 'd',
                        preview: 'D'
                    }
                ]
            })
        }
    );
}

async function runScenario(factory) {
    providerFactory = factory;
    finishCalls = [];
    providerRequests = [];

    const response =
        await worker.fetch(
            plannerRequest(),
            env
        );

    const body =
        await response.json();

    return {
        response,
        body,
        finishCalls:
            finishCalls.slice(),
        providerRequests:
            providerRequests.slice()
    };
}

async function verify() {
    const nonJsonGateway =
        await runScenario(
            () =>
                new Response(
                    'Bad Gateway',
                    {
                        status: 502,
                        headers: {
                            'Content-Type':
                                'text/plain'
                        }
                    }
                )
        );

    assert.equal(
        nonJsonGateway.response.status,
        200,
        'A non-JSON provider gateway failure should not surface as a planner 500/502.'
    );

    assert.equal(
        nonJsonGateway.body.ok,
        true
    );

    assert.equal(
        nonJsonGateway.body.providerStatus,
        502
    );

    assert.equal(
        nonJsonGateway.body.planner?.source,
        'deterministic-fallback'
    );

    assert.equal(
        nonJsonGateway.body.planner?.reason,
        'provider-error-response-not-json'
    );

    assert.deepEqual(
        Array.from(
            nonJsonGateway.body.payload.ids
        ),
        ['b', 'd']
    );

    assert.equal(
        nonJsonGateway.finishCalls[0]
            ?.p_succeeded,
        true,
        'A successful deterministic fallback should complete the Atlas operation.'
    );

    assert.equal(
        nonJsonGateway.finishCalls[0]
            ?.p_provider_status,
        502,
        'The original provider status should remain observable even though Atlas recovered.'
    );

    const malformedStructuredOutput =
        await runScenario(
            () =>
                jsonResponse({
                    status:
                        'completed',
                    output: [
                        {
                            type:
                                'message',
                            content: [
                                {
                                    type:
                                        'output_text',
                                    text:
                                        '{"ids":['
                                }
                            ]
                        }
                    ]
                })
        );

    assert.equal(
        malformedStructuredOutput.response.status,
        200
    );

    assert.equal(
        malformedStructuredOutput.body
            .planner?.reason,
        'invalid-structured-output'
    );

    assert.deepEqual(
        Array.from(
            malformedStructuredOutput.body
                .payload.ids
        ),
        ['b', 'd']
    );

    const successfulSelection =
        await runScenario(
            () =>
                jsonResponse({
                    status:
                        'completed',
                    output: [
                        {
                            type:
                                'message',
                            content: [
                                {
                                    type:
                                        'output_text',
                                    text:
                                        JSON.stringify({
                                            ids: [
                                                'a',
                                                'c'
                                            ]
                                        })
                                }
                            ]
                        }
                    ]
                })
        );

    assert.equal(
        successfulSelection.response.status,
        200
    );

    assert.equal(
        successfulSelection.body.planner?.source,
        'model'
    );

    assert.deepEqual(
        Array.from(
            successfulSelection.body.payload.ids
        ),
        ['a', 'c']
    );

    assert.equal(
        successfulSelection.providerRequests[0]
            ?.max_output_tokens,
        512,
        'The planner needs enough output budget to avoid avoidable truncation.'
    );

    assert.equal(
        successfulSelection.providerRequests[0]
            ?.reasoning?.effort,
        'low'
    );
}

verify()
    .then(() => {
        console.log(
            'Atlas Key Language Worker resilience passed: provider gateway failures and malformed structured output recover server-side without browser-facing 500/502 responses, while provider status remains observable.'
        );
    })
    .catch(error => {
        console.error(error);
        process.exitCode = 1;
    });
