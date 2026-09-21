/* ============================================================
   ATLAS AI
   Shared browser boundary for AI-assisted authorship.

   Owns:
   - calls to the Atlas AI backend
   - request normalization
   - response validation

   Does NOT own:
   - provider credentials
   - Atlas IDs
   - document mutation
   - persistence
   - ownership
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasAI) return;

    const BASE_URL =
        'https://atlas-ai.savvy989.workers.dev';

    const REQUEST_TIMEOUT_MS = 45000;
    const REQUEST_RETRY_DELAYS_MS = [750, 2000];
    const nativeFetch = window.fetch.bind(window);

    function isTransientAtlasAIStatus(status) {
        const code = Number(status) || 0;

        return (
            code === 408 ||
            code === 429 ||
            (code >= 500 && code <= 599)
        );
    }

    function waitForAtlasAIRetry(delayMs) {
        return new Promise(resolve => {
            window.setTimeout(
                resolve,
                Math.max(0, Number(delayMs) || 0)
            );
        });
    }

    function createAtlasAITimeoutError(
        timeoutMs = REQUEST_TIMEOUT_MS
    ) {
        const error = new Error(
            `Atlas AI request timed out after ${timeoutMs}ms.`
        );

        error.name = 'AtlasAIRequestTimeoutError';
        return error;
    }

    function createAtlasAIAbortError(signal) {
        if (signal?.reason instanceof Error) {
            return signal.reason;
        }

        const error = new Error(
            'Atlas AI request was aborted.'
        );

        error.name = 'AbortError';
        return error;
    }

    function createAtlasAIRequestId() {
        if (
            window.crypto &&
            typeof window.crypto.randomUUID === 'function'
        ) {
            return window.crypto.randomUUID();
        }

        return [
            'atlas-ai',
            Date.now().toString(36),
            Math.random().toString(36).slice(2, 12)
        ].join('-');
    }

    function getAtlasAISubjectId() {
        const runtime =
            window.AtlasCompassSubjectRuntime;

        if (
            !runtime ||
            runtime.source !== 'owned'
        ) {
            return '';
        }

        return cleanString(
            runtime.subjectId ||
            window.MODULE?.id ||
            ''
        );
    }

    async function createAtlasAIRequestHeaders(
        requestInit,
        requestId,
        subjectIdOverride = ''
    ) {
        const Cloud = window.AtlasCloud;

        if (
            !Cloud ||
            typeof Cloud.getSession !== 'function'
        ) {
            const error = new Error(
                'Atlas AI requires a signed-in Atlas account.'
            );
            error.code = 'ATLAS_AI_AUTH_REQUIRED';
            throw error;
        }

        const session = await Cloud.getSession();
        const accessToken =
            cleanString(session?.access_token);

        if (!accessToken) {
            const error = new Error(
                'Atlas AI requires a signed-in Atlas account.'
            );
            error.code = 'ATLAS_AI_AUTH_REQUIRED';
            throw error;
        }

        const headers =
            new Headers(
                requestInit.headers || {}
            );

        headers.set(
            'Authorization',
            `Bearer ${accessToken}`
        );

        headers.set(
            'X-Atlas-Request-Id',
            requestId
        );

        const subjectId =
            cleanString(
                subjectIdOverride
            ) ||
            getAtlasAISubjectId();

        if (subjectId) {
            headers.set(
                'X-Atlas-Subject-Id',
                subjectId
            );
        } else {
            headers.delete(
                'X-Atlas-Subject-Id'
            );
        }

        return headers;
    }

    async function requestAtlasAI(
        input,
        init = {},
        options = {}
    ) {
        const requestInit =
            init &&
            typeof init === 'object'
                ? init
                : {};

        const requestOptions =
            options &&
            typeof options === 'object'
                ? options
                : {};

        const callerSignal =
            requestInit.signal || null;

        const retryDelays =
            requestOptions.retryTransient === false
                ? []
                : REQUEST_RETRY_DELAYS_MS;

        const timeoutMs =
            Math.max(
                1000,
                Math.floor(
                    Number(
                        requestOptions.timeoutMs
                    ) || REQUEST_TIMEOUT_MS
                )
            );

        const requestId =
            createAtlasAIRequestId();

        const requestHeaders =
            await createAtlasAIRequestHeaders(
                requestInit,
                requestId,
                requestOptions.subjectId
            );

        let lastTransientError = null;

        for (
            let attempt = 0;
            attempt <= retryDelays.length;
            attempt += 1
        ) {
            if (callerSignal?.aborted) {
                throw createAtlasAIAbortError(
                    callerSignal
                );
            }

            const controller =
                new AbortController();

            let timedOut = false;
            let callerAborted = false;

            const handleCallerAbort = () => {
                callerAborted = true;
                controller.abort();
            };

            if (callerSignal) {
                callerSignal.addEventListener(
                    'abort',
                    handleCallerAbort,
                    { once: true }
                );
            }

            const timeoutId =
                window.setTimeout(
                    () => {
                        timedOut = true;
                        controller.abort();
                    },
                    timeoutMs
                );

            let response = null;
            let requestError = null;

            try {
                response = await nativeFetch(
                    input,
                    {
                        ...requestInit,
                        headers: requestHeaders,
                        signal: controller.signal
                    }
                );
            } catch (error) {
                requestError = error;
            } finally {
                window.clearTimeout(timeoutId);

                if (callerSignal) {
                    callerSignal.removeEventListener(
                        'abort',
                        handleCallerAbort
                    );
                }
            }

            if (
                callerAborted ||
                callerSignal?.aborted
            ) {
                throw createAtlasAIAbortError(
                    callerSignal
                );
            }

            if (response) {
                if (
                    !isTransientAtlasAIStatus(
                        response.status
                    ) ||
                    attempt >=
                        retryDelays.length
                ) {
                    return response;
                }

                await waitForAtlasAIRetry(
                    retryDelays[
                        attempt
                    ]
                );

                continue;
            }

            const transientNetworkFailure =
                timedOut ||
                requestError?.name === 'TypeError';

            if (!transientNetworkFailure) {
                throw requestError || new Error(
                    'Atlas AI request failed.'
                );
            }

            lastTransientError = timedOut
                ? createAtlasAITimeoutError(
                    timeoutMs
                )
                : requestError;

            if (
                attempt >=
                retryDelays.length
            ) {
                throw lastTransientError;
            }

            await waitForAtlasAIRetry(
                retryDelays[
                    attempt
                ]
            );
        }

        throw lastTransientError || new Error(
            'Atlas AI request failed.'
        );
    }
    function cleanString(value) {
        return String(value ?? '').trim();
    }

    function buildLanguageUpgradeBrief(
        localBrief = '',
        existingLanguage = []
    ) {
        const existingTypes =
            Array.isArray(existingLanguage)
                ? existingLanguage
                    .map(item =>
                        cleanString(item?.type)
                    )
                    .filter(Boolean)
                : [];

        const diversityGuidance =
            existingTypes.length
                ? `EXISTING LANGUAGE TYPES: ${existingTypes.join(', ')}. Use this only as a soft diversity signal. If another language form is equally strong, prefer variety; never sacrifice quality to satisfy variety.`
                : '';

        return [
            cleanString(localBrief),
            'LANGUAGE UPGRADE SELECTION: Choose the strongest teachable language item for this exact context. It may be a single word (noun, verb, or adjective) or a multi-word item (collocation, phrasal verb, idiom, phrase, or expression). Give single-word and multi-word items equal status. Do not default to multi-word expressions. Do not choose a longer phrase when a natural single word is stronger, and do not choose an obscure or overly sophisticated single-word synonym merely for variety.',
            diversityGuidance
        ]
            .filter(Boolean)
            .join('\n');
    }

    function buildGenerationBrief(localBrief = '') {
        const context =
            window.AtlasGenerationContext &&
            typeof window.AtlasGenerationContext === 'object' &&
            !Array.isArray(window.AtlasGenerationContext)
                ? window.AtlasGenerationContext
                : {};

        const levelGuidance = {
            'a1-a2':
                'Use very simple, concrete learner-facing English. Keep questions short and focused on one idea at a time. Prefer common vocabulary and simple sentence patterns. Avoid unnecessary abstraction, idioms, nested hypotheticals and multi-part questions. Keep Cultural Lens, Reflection and Language Upgrades equally accessible.',

            'b1':
                'Use clear everyday learner-facing English. Keep questions easy to enter, limit unnecessary complexity and favour concrete language before abstract discussion.',

            'b2':
                'Use natural B2 learner-facing English with varied but accessible vocabulary. Allow thoughtful discussion without unnecessary complexity.',

            'c1-plus':
                'Use natural advanced learner-facing English. Nuance and more complex ideas are welcome, but keep the material conversational rather than academic.'
        };

        const styleGuidance = {
            balanced:
                'Keep the tone natural, warm and varied.',

            playful:
                'Keep the tone playful, lively and imaginative. Use humour and occasional emojis when they genuinely help.',

            relaxed:
                'Keep the tone relaxed, personal and low-pressure, with easy conversational entry points.',

            thoughtful:
                'Keep the tone thoughtful and reflective without becoming academic or artificially abstract.',

            practical:
                'Keep the conversation concrete and useful, favouring real-life situations, decisions and examples.'
        };

        const parts = [];

        if (levelGuidance[context.languageLevel]) {
            parts.push(
                'LANGUAGE LEVEL: ' +
                levelGuidance[context.languageLevel]
            );
        }

        if (styleGuidance[context.style]) {
            parts.push(
                'STYLE: ' +
                styleGuidance[context.style]
            );
        }

        const selectedPremise =
            cleanString(context.premise);

        if (selectedPremise) {
            parts.push(
                'SELECTED SUBJECT PREMISE: ' +
                selectedPremise +
                ' Preserve this core conversational promise throughout the subject. Treat it as editorial direction, not text to copy verbatim.'
            );
        }

        const source =
            context.source &&
            typeof context.source === 'object' &&
            !Array.isArray(context.source)
                ? context.source
                : null;

        if (source) {
            const sourceSummary =
                cleanString(source.summary);

            const sourceFacts =
                Array.isArray(source.keyFacts)
                    ? source.keyFacts
                        .map(cleanString)
                        .filter(Boolean)
                        .slice(0, 4)
                    : [];

            const sourceReference =
                [
                    cleanString(source.title),
                    cleanString(source.publisher),
                    cleanString(source.publishedAt)
                ]
                    .filter(Boolean)
                    .join(' · ');

            if (
                sourceSummary ||
                sourceFacts.length
            ) {
                parts.push(
                    [
                        'CURRENT AFFAIRS ANCHOR: Build the subject around this specific recent development. Establish what happened and why it matters before broadening; do not turn it into an evergreen topic.',
                        'SOURCE CONTEXT: ' +
                        [
                            sourceSummary,
                            ...sourceFacts
                        ]
                            .filter(Boolean)
                            .join(' '),
                        sourceReference
                            ? 'SOURCE: ' +
                              sourceReference
                            : ''
                    ]
                        .filter(Boolean)
                        .join('\n')
                );
            }
        }

        const tutorBrief =
            cleanString(context.brief);

        if (tutorBrief) {
            parts.push(
                'TUTOR INTENT: ' +
                tutorBrief
            );
        }

        const currentBrief =
            cleanString(localBrief);

        if (currentBrief) {
            parts.push(
                'CURRENT REQUEST: ' +
                currentBrief
            );
        }

        return parts.join('\n');
    }

    function withGenerationContext(generator) {
        return function (input = {}) {
            const candidate =
                input &&
                typeof input === 'object' &&
                !Array.isArray(input)
                    ? input
                    : {};

            return generator({
                ...candidate,

                brief:
                    buildGenerationBrief(
                        candidate.brief
                    )
            });
        };
    }

    async function generateMoment(
        input = {}
    ) {

        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const response = await requestAtlasAI(
            `${BASE_URL}/generate-moment`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({
                    subject:
                        candidate.subject || {},

                    set:
                        candidate.set || {},

                    brief:
                        cleanString(
                            candidate.brief
                        )
                })
            }
        );

        let result = null;

        try {
            result =
                await response.json();
        } catch { }

        if (
            !response.ok ||
            result?.ok !== true
        ) {
            throw new Error(
                result?.error ||
                `Atlas AI request failed with status ${response.status}.`
            );
        }

        const preview =
            cleanString(
                result.payload?.preview
            );

        const question =
            cleanString(
                result.payload?.question
            );

        if (!preview || !question) {
            throw new Error(
                'Atlas AI returned an invalid Moment payload.'
            );
        }

        return {
            preview,
            question
        };
    }

    async function generateCulturalLensCard(
        input = {}
    ) {

        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const response = await requestAtlasAI(
            `${BASE_URL}/generate-cultural-lens-card`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({
                    subject:
                        candidate.subject || {},

                    culturalLens:
                        candidate.culturalLens || {},

                    brief:
                        cleanString(
                            candidate.brief
                        )
                })
            }
        );

        let result = null;

        try {
            result =
                await response.json();
        } catch { }

        if (
            !response.ok ||
            result?.ok !== true
        ) {
            throw new Error(
                result?.error ||
                `Atlas AI request failed with status ${response.status}.`
            );
        }

        const title =
            cleanString(
                result.payload?.title
            );

        const contextLine =
            cleanString(
                result.payload?.contextLine
            );

        const teaser =
            cleanString(
                result.payload?.teaser
            );

        const context =
            cleanString(
                result.payload?.context
            );

        const questions =
            Array.isArray(
                result.payload?.questions
            )
                ? result.payload.questions
                    .map(cleanString)
                    .filter(Boolean)
                : [];

        const followTheThread =
            Array.isArray(
                result.payload?.followTheThread
            )
                ? result.payload.followTheThread
                    .map(cleanString)
                    .filter(Boolean)
                : [];

        if (
            !title ||
            !contextLine ||
            !teaser ||
            !context ||
            questions.length !== 1 ||
            followTheThread.length !== 2
        ) {
            throw new Error(
                'Atlas AI returned an invalid Cultural Lens card payload.'
            );
        }

        return {
            title,
            contextLine,
            teaser,
            context,
            questions,
            followTheThread
        };
    }

    async function generateDiscussionSet(
        input = {}
    ) {

        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const response = await requestAtlasAI(
            `${BASE_URL}/generate-discussion-set`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({
                    subject:
                        candidate.subject || {},

                    discussion:
                        candidate.discussion || {},

                    brief:
                        cleanString(
                            candidate.brief
                        )
                })
            }
        );

        let result = null;

        try {
            result =
                await response.json();
        } catch { }

        if (
            !response.ok ||
            result?.ok !== true
        ) {
            throw new Error(
                result?.error ||
                `Atlas AI request failed with status ${response.status}.`
            );
        }

        const title =
            cleanString(
                result.payload?.title
            );

        const stage =
            cleanString(
                result.payload?.stage
            );

        const description =
            cleanString(
                result.payload?.description
            );

        const allowedStages =
            new Set([
                'First Look',
                'Look Closer',
                'Wider View'
            ]);

        const moments =
            Array.isArray(
                result.payload?.moments
            )
                ? result.payload.moments
                    .map(moment => ({
                        preview:
                            cleanString(
                                moment?.preview
                            ),

                        question:
                            cleanString(
                                moment?.question
                            )
                    }))
                : [];

        if (
            !title ||
            !allowedStages.has(stage) ||
            !description ||
            moments.length !== 5 ||
            moments.some(moment =>
                !moment.preview ||
                !moment.question
            )
        ) {
            throw new Error(
                'Atlas AI returned an invalid Discussion set payload.'
            );
        }

        return {
            title,
            stage,
            description,
            moments
        };
    }

    async function generateSubjectFraming(
        input = {}
    ) {

        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const response = await requestAtlasAI(
            `${BASE_URL}/generate-subject-framing`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({
                    subject: {
                        title:
                            cleanString(
                                candidate.subject?.title
                            )
                    },

                    brief:
                        [
                            cleanString(
                                candidate.brief
                            ),
                            'CATALOG DESCRIPTION: Write one concise sentence, ideally 24–32 words. This is compact subject-card copy, not a full introduction. Give enough texture to establish the conversational promise without becoming a mini-essay. Never exceed 220 characters.'
                        ]
                            .filter(Boolean)
                            .join('\n')
                })
            }
        );

        let result = null;

        try {
            result =
                await response.json();
        } catch { }

        if (
            !response.ok ||
            result?.ok !== true
        ) {
            throw new Error(
                result?.error ||
                `Atlas AI request failed with status ${response.status}.`
            );
        }

        let catalogDescription =
            cleanString(
                result.payload
                    ?.catalogDescription
            );

        let hook =
            cleanString(
                result.payload?.hook
            );

        if (
            catalogDescription.length > 220
        ) {
            const retryResponse = await requestAtlasAI(
                `${BASE_URL}/generate-subject-framing`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify({
                        subject: {
                            title:
                                cleanString(
                                    candidate.subject?.title
                                )
                        },

                        brief:
                            [
                                cleanString(
                                    candidate.brief
                                ),
                                'RETRY REQUIRED: The catalog description must be one concise sentence and must not exceed 220 characters under any circumstances. Aim for roughly 24–32 words. Keep enough texture to establish the conversational promise, but return a genuinely shorter description rather than a truncated sentence.'
                            ]
                                .filter(Boolean)
                                .join('\n')
                    })
                }
            );

            let retryResult = null;

            try {
                retryResult =
                    await retryResponse.json();
            } catch { }

            if (
                !retryResponse.ok ||
                retryResult?.ok !== true
            ) {
                throw new Error(
                    retryResult?.error ||
                    `Atlas AI request failed with status ${retryResponse.status}.`
                );
            }

            catalogDescription =
                cleanString(
                    retryResult.payload
                        ?.catalogDescription
                );

            hook =
                cleanString(
                    retryResult.payload?.hook
                );
        }

        if (
            !catalogDescription ||
            catalogDescription.length > 220 ||
            !hook
        ) {
            throw new Error(
                'Atlas AI returned an invalid subject framing payload.'
            );
        }

        return {
            catalogDescription,
            hook
        };
    }

    async function generateOverview(
        input = {}
    ) {

        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const response = await requestAtlasAI(
            `${BASE_URL}/generate-overview`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({
                    subject: {
                        title:
                            cleanString(
                                candidate.subject?.title
                            ),

                        description:
                            cleanString(
                                candidate.subject?.description
                            ),

                        hook:
                            cleanString(
                                candidate.subject?.hook
                            )
                    },

                    brief:
                        cleanString(
                            candidate.brief
                        )
                })
            }
        );

        let result = null;

        try {
            result =
                await response.json();
        } catch { }

        if (
            !response.ok ||
            result?.ok !== true
        ) {
            throw new Error(
                result?.error ||
                `Atlas AI request failed with status ${response.status}.`
            );
        }

        const heading =
            cleanString(
                result.payload?.heading
            );

        const intro =
            cleanString(
                result.payload?.intro
            );

        const question =
            cleanString(
                result.payload?.question
            );

        if (
            !heading ||
            !intro ||
            !question
        ) {
            throw new Error(
                'Atlas AI returned an invalid Overview payload.'
            );
        }

        return {
            heading,
            intro,
            question
        };
    }

    async function generateCulturalLensFraming(
        input = {}
    ) {

        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const response = await requestAtlasAI(
            `${BASE_URL}/generate-cultural-lens-framing`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({
                    subject: {
                        title:
                            cleanString(
                                candidate.subject?.title
                            ),

                        description:
                            cleanString(
                                candidate.subject?.description
                            ),

                        hook:
                            cleanString(
                                candidate.subject?.hook
                            )
                    },

                    overview: {
                        heading:
                            cleanString(
                                candidate.overview?.heading
                            ),

                        intro:
                            cleanString(
                                candidate.overview?.intro
                            ),

                        question:
                            cleanString(
                                candidate.overview?.question
                            )
                    },

                    brief:
                        cleanString(
                            candidate.brief
                        )
                })
            }
        );

        let result = null;

        try {
            result =
                await response.json();
        } catch { }

        if (
            !response.ok ||
            result?.ok !== true
        ) {
            throw new Error(
                result?.error ||
                `Atlas AI request failed with status ${response.status}.`
            );
        }

        const heading =
            cleanString(
                result.payload?.heading
            );

        const intro =
            cleanString(
                result.payload?.intro
            );

        const pathDescription =
            cleanString(
                result.payload?.pathDescription
            );

        if (
            !heading ||
            !intro ||
            !pathDescription
        ) {
            throw new Error(
                'Atlas AI returned an invalid Cultural Lens framing payload.'
            );
        }

        return {
            heading,
            intro,
            pathDescription
        };
    }

    async function generateDiscussionPathway(
        input = {}
    ) {

        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const response = await requestAtlasAI(
            `${BASE_URL}/generate-discussion-pathway`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({
                    subject:
                        candidate.subject || {},

                    set:
                        candidate.set || {},

                    moment:
                        candidate.moment || {},

                    existingPathways:
                        Array.isArray(
                            candidate.existingPathways
                        )
                            ? candidate.existingPathways
                            : [],

                    brief:
                        cleanString(
                            candidate.brief
                        )
                })
            }
        );

        let result = null;

        try {
            result =
                await response.json();
        } catch { }

        if (
            !response.ok ||
            result?.ok !== true
        ) {
            throw new Error(
                result?.error ||
                `Atlas AI request failed with status ${response.status}.`
            );
        }

        const kind =
            cleanString(
                result.payload?.kind
            );

        const prompt =
            cleanString(
                result.payload?.prompt
            );

        const allowedKinds =
            new Set([
                'go-deeper',
                'another-angle',
                'add-a-twist'
            ]);

        if (
            !allowedKinds.has(kind) ||
            !prompt
        ) {
            throw new Error(
                'Atlas AI returned an invalid Discussion pathway payload.'
            );
        }

        return {
            kind,
            prompt
        };
    }

    async function generateMakeItReal(
        input = {}
    ) {

        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const response = await requestAtlasAI(
            `${BASE_URL}/generate-make-it-real`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({
                    subject:
                        candidate.subject || {},

                    set:
                        candidate.set || {},

                    existingActivities:
                        Array.isArray(
                            candidate.existingActivities
                        )
                            ? candidate.existingActivities
                            : [],

                    brief:
                        cleanString(
                            candidate.brief
                        )
                })
            }
        );

        let result = null;

        try {
            result =
                await response.json();
        } catch { }

        if (
            !response.ok ||
            result?.ok !== true
        ) {
            throw new Error(
                result?.error ||
                `Atlas AI request failed with status ${response.status}.`
            );
        }

        const title =
            cleanString(
                result.payload?.title
            );

        const prompt =
            cleanString(
                result.payload?.prompt
            );

        if (!title || !prompt) {
            throw new Error(
                'Atlas AI returned an invalid Make It Real payload.'
            );
        }

        return {
            title,
            prompt
        };
    }

    function selectFallbackKeyLanguageOpportunities(
        candidates,
        limit
    ) {
        const ids =
            Array.isArray(candidates)
                ? candidates
                    .map(item =>
                        cleanString(item?.id)
                    )
                    .filter(Boolean)
                : [];

        const targetCount =
            Math.min(
                Math.max(
                    0,
                    Math.floor(
                        Number(limit) || 0
                    )
                ),
                ids.length
            );

        if (!targetCount) {
            return [];
        }

        if (targetCount >= ids.length) {
            return ids.slice();
        }

        return Array.from(
            {
                length: targetCount
            },
            (_, index) => {
                const position =
                    Math.floor(
                        (
                            index + 0.5
                        ) *
                        ids.length /
                        targetCount
                    );

                return ids[
                    Math.min(
                        ids.length - 1,
                        position
                    )
                ];
            }
        );
    }

    async function selectKeyLanguageOpportunities(
        input = {}
    ) {
        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const section =
            candidate.section === 'cultural-lens'
                ? 'cultural-lens'
                : 'discussion';

        const limit =
            Math.max(
                0,
                Math.min(
                    12,
                    Math.floor(
                        Number(candidate.limit) || 0
                    )
                )
            );

        const candidates =
            Array.isArray(candidate.candidates)
                ? candidate.candidates
                    .filter(item =>
                        item &&
                        typeof item === 'object' &&
                        !Array.isArray(item) &&
                        cleanString(item.id)
                    )
                    .slice(0, 40)
                : [];

        if (!limit || !candidates.length) {
            return [];
        }

        let response = null;

        try {
            response = await requestAtlasAI(
                `${BASE_URL}/select-key-language-opportunities`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify({
                        section,
                        limit,
                        candidates,
                        brief:
                            cleanString(
                                candidate.brief
                            )
                    })
                },
                {
                    retryTransient: false,
                    timeoutMs: 12000
                }
            );
        } catch (error) {
            const transientPlannerFailure =
                error?.name === 'AtlasAIRequestTimeoutError' ||
                error?.name === 'TypeError';

            if (!transientPlannerFailure) {
                throw error;
            }

            console.warn(
                '[AtlasAI] Key Language planner was unavailable; using a deterministic fallback selection.',
                error
            );

            return selectFallbackKeyLanguageOpportunities(
                candidates,
                limit
            );
        }

        if (
            response.status === 404 ||
            isTransientAtlasAIStatus(
                response.status
            )
        ) {
            console.warn(
                '[AtlasAI] Key Language planner was unavailable; using a deterministic fallback selection.'
            );

            return selectFallbackKeyLanguageOpportunities(
                candidates,
                limit
            );
        }

        let result = null;

        try {
            result =
                await response.json();
        } catch { }

        if (
            !response.ok ||
            result?.ok !== true
        ) {
            throw new Error(
                result?.error ||
                `Atlas AI request failed with status ${response.status}.`
            );
        }

        const allowedIds =
            new Set(
                candidates.map(item =>
                    cleanString(item.id)
                )
            );

        const ids =
            Array.isArray(result.payload?.ids)
                ? result.payload.ids
                    .map(cleanString)
                    .filter(id =>
                        id &&
                        allowedIds.has(id)
                    )
                : [];

        const uniqueIds =
            Array.from(new Set(ids));

        if (
            uniqueIds.length !==
            Math.min(
                limit,
                allowedIds.size
            )
        ) {
            throw new Error(
                'Atlas AI returned an invalid Key language selection.'
            );
        }

        return uniqueIds;
    }

    async function generateCulturalLensUpgrade(
        input = {}
    ) {

        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const response = await requestAtlasAI(
            `${BASE_URL}/generate-cultural-lens-upgrade`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({
                    subject:
                        candidate.subject || {},

                    culturalLens:
                        candidate.culturalLens || {},

                    card:
                        candidate.card || {},

                    existingLanguage:
                        Array.isArray(
                            candidate.existingLanguage
                        )
                            ? candidate.existingLanguage
                            : [],

                    brief:
                        buildLanguageUpgradeBrief(
                            candidate.brief,
                            candidate.existingLanguage
                        )
                })
            }
        );

        let result = null;

        try {
            result =
                await response.json();
        } catch { }

        if (
            !response.ok ||
            result?.ok !== true
        ) {
            throw new Error(
                result?.error ||
                `Atlas AI request failed with status ${response.status}.`
            );
        }

        const term =
            cleanString(
                result.payload?.term
            );

        const type =
            cleanString(
                result.payload?.type
            );

        const definition =
            cleanString(
                result.payload?.definition
            );

        const ordinary =
            cleanString(
                result.payload?.ordinary
            );

        const upgraded =
            cleanString(
                result.payload?.upgraded
            );

        const priority =
            cleanString(
                result.payload?.priority
            );

        const atlasPrompt =
            cleanString(
                result.payload?.atlasPrompt
            );

        const allowedTypes =
            new Set([
                'expression',
                'phrase',
                'phrasal verb',
                'collocation',
                'idiom',
                'adjective',
                'verb',
                'noun'
            ]);

        const allowedPriorities =
            new Set([
                'key',
                'standard'
            ]);

        if (
            !term ||
            !allowedTypes.has(type) ||
            !definition ||
            !ordinary ||
            !upgraded ||
            !allowedPriorities.has(priority) ||
            !atlasPrompt
        ) {
            throw new Error(
                'Atlas AI returned an invalid Language Upgrade payload.'
            );
        }

        return {
            term,
            type,
            definition,
            ordinary,
            upgraded,
            priority,
            atlasPrompt
        };
    }

    async function generateMomentUpgrade(
        input = {}
    ) {

        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const response = await requestAtlasAI(
            `${BASE_URL}/generate-moment-upgrade`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({
                    subject:
                        candidate.subject || {},

                    set:
                        candidate.set || {},

                    moment:
                        candidate.moment || {},

                    existingLanguage:
                        Array.isArray(
                            candidate.existingLanguage
                        )
                            ? candidate.existingLanguage
                            : [],

                    brief:
                        buildLanguageUpgradeBrief(
                            candidate.brief,
                            candidate.existingLanguage
                        )
                })
            }
        );

        let result = null;

        try {
            result =
                await response.json();
        } catch { }

        if (
            !response.ok ||
            result?.ok !== true
        ) {
            throw new Error(
                result?.error ||
                `Atlas AI request failed with status ${response.status}.`
            );
        }

        const term =
            cleanString(
                result.payload?.term
            );

        const type =
            cleanString(
                result.payload?.type
            );

        const definition =
            cleanString(
                result.payload?.definition
            );

        const ordinary =
            cleanString(
                result.payload?.ordinary
            );

        const upgraded =
            cleanString(
                result.payload?.upgraded
            );

        const priority =
            cleanString(
                result.payload?.priority
            );

        const atlasPrompt =
            cleanString(
                result.payload?.atlasPrompt
            );

        const allowedTypes =
            new Set([
                'expression',
                'phrase',
                'phrasal verb',
                'collocation',
                'idiom',
                'adjective',
                'verb',
                'noun'
            ]);

        const allowedPriorities =
            new Set([
                'key',
                'standard'
            ]);

        if (
            !term ||
            !allowedTypes.has(type) ||
            !definition ||
            !ordinary ||
            !upgraded ||
            !allowedPriorities.has(priority) ||
            !atlasPrompt
        ) {
            throw new Error(
                'Atlas AI returned an invalid Language Upgrade payload.'
            );
        }

        return {
            term,
            type,
            definition,
            ordinary,
            upgraded,
            priority,
            atlasPrompt
        };
    }

    async function recommendSubjects(
        input = {}
    ) {
        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const candidates =
            Array.isArray(
                candidate.candidates
            )
                ? candidate.candidates
                    .map(subject => ({
                        key:
                            cleanString(
                                subject?.key
                            ),

                        title:
                            cleanString(
                                subject?.title
                            ),

                        description:
                            cleanString(
                                subject?.description
                            )
                    }))
                    .filter(subject =>
                        subject.key &&
                        subject.title
                    )
                : [];

        const candidateKeys =
            new Set(
                candidates.map(subject =>
                    subject.key
                )
            );

        const sessionSubjectKeys =
            Array.isArray(
                candidate.sessionSubjectKeys
            )
                ? candidate.sessionSubjectKeys
                    .map(cleanString)
                    .filter(key =>
                        candidateKeys.has(key)
                    )
                : [];

        const response = await requestAtlasAI(
            `${BASE_URL}/recommend-subjects`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({
                    notes:
                        cleanString(
                            candidate.notes
                        ),

                    sessionSubjectKeys,

                    candidates
                })
            }
        );

        let result = null;

        try {
            result =
                await response.json();
        } catch { }

        if (
            !response.ok ||
            result?.ok !== true
        ) {
            throw new Error(
                result?.error ||
                `Atlas AI request failed with status ${response.status}.`
            );
        }

        const message =
            cleanString(
                result.payload?.message
            );

        const recommendations =
            Array.isArray(
                result.payload?.recommendations
            )
                ? result.payload.recommendations
                    .map(recommendation => ({
                        key:
                            cleanString(
                                recommendation?.key
                            ),

                        reason:
                            cleanString(
                                recommendation?.reason
                            )
                    }))
                : [];

        if (
            !message ||
            recommendations.length !== 3 ||
            recommendations.some(
                recommendation =>
                    !candidateKeys.has(
                        recommendation.key
                    ) ||
                    !recommendation.reason
            ) ||
            new Set(
                recommendations.map(
                    recommendation =>
                        recommendation.key
                )
            ).size !== 3
        ) {
            throw new Error(
                'Atlas AI returned an invalid subject recommendation payload.'
            );
        }

        return {
            message,
            recommendations
        };
    }

    async function suggestSubjectIdeas(
        input = {}
    ) {
        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const sessionSubjects =
            Array.isArray(
                candidate.sessionSubjects
            )
                ? candidate.sessionSubjects
                    .map(subject => ({
                        title:
                            cleanString(
                                subject?.title
                            ),

                        description:
                            cleanString(
                                subject?.description
                            )
                    }))
                    .filter(subject =>
                        subject.title
                    )
                : [];

        const existingSubjects =
            Array.isArray(
                candidate.existingSubjects
            )
                ? candidate.existingSubjects
                    .map(subject => ({
                        title:
                            cleanString(
                                subject?.title
                            ),

                        description:
                            cleanString(
                                subject?.description
                            )
                    }))
                    .filter(subject =>
                        subject.title
                    )
                : [];

        const recentSuggestions =
            Array.isArray(
                candidate.recentSuggestions
            )
                ? candidate.recentSuggestions
                    .map(idea => ({
                        title:
                            cleanString(
                                idea?.title
                            ),

                        reason:
                            cleanString(
                                idea?.reason
                            )
                    }))
                    .filter(idea =>
                        idea.title
                    )
                : [];

        const response = await requestAtlasAI(
            `${BASE_URL}/suggest-subject-ideas`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({
                    mode:
                        cleanString(
                            candidate.mode
                        ),

                    interests:
                        cleanString(
                            candidate.interests
                        ),

                    topicFocus:
                        cleanString(
                            candidate.topicFocus
                        ),

                    languageLevel:
                        cleanString(
                            candidate.languageLevel
                        ) || 'b2',

                    sessionSubjects,
                    existingSubjects,
                    recentSuggestions
                })
            }
        );

        let result = null;

        try {
            result =
                await response.json();
        } catch { }

        if (
            !response.ok ||
            result?.ok !== true
        ) {
            throw new Error(
                result?.error ||
                `Atlas AI request failed with status ${response.status}.`
            );
        }

        const message =
            cleanString(
                result.payload?.message
            );

        const ideas =
            Array.isArray(
                result.payload?.ideas
            )
                ? result.payload.ideas
                    .map(idea => ({
                        title:
                            cleanString(
                                idea?.title
                            ),

                        reason:
                            cleanString(
                                idea?.reason
                            ),

                        source:
                            idea?.source &&
                            typeof idea.source === 'object' &&
                            !Array.isArray(idea.source)
                                ? {
                                    publisher:
                                        cleanString(
                                            idea.source.publisher
                                        ),

                                    title:
                                        cleanString(
                                            idea.source.title
                                        ),

                                    url:
                                        cleanString(
                                            idea.source.url
                                        ),

                                    publishedAt:
                                        cleanString(
                                            idea.source.publishedAt
                                        ),

                                    summary:
                                        cleanString(
                                            idea.source.summary
                                        ),

                                    keyFacts:
                                        Array.isArray(
                                            idea.source.keyFacts
                                        )
                                            ? idea.source.keyFacts
                                                .map(cleanString)
                                                .filter(Boolean)
                                                .slice(0, 4)
                                            : []
                                }
                                : null
                    }))
                : [];

        if (
            !message ||
            ideas.length !== 3 ||
            ideas.some(idea =>
                !idea.title ||
                !idea.reason
            ) ||
            (
                cleanString(candidate.mode) ===
                'current-affairs' &&
                ideas.some(idea =>
                    !idea.source ||
                    !idea.source.publisher ||
                    !idea.source.title ||
                    !idea.source.url ||
                    !idea.source.publishedAt ||
                    !idea.source.summary ||
                    idea.source.keyFacts.length < 2
                )
            ) ||
            new Set(
                ideas.map(idea =>
                    idea.title.toLowerCase()
                )
            ).size !== 3
        ) {
            throw new Error(
                'Atlas AI returned an invalid subject idea payload.'
            );
        }

        return {
            message,
            ideas
        };
    }

    async function generateReflection(
        input = {}
    ) {

        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const response = await requestAtlasAI(
            `${BASE_URL}/generate-reflection`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({
                    subject:
                        candidate.subject || {},

                    overview:
                        candidate.overview || {},

                    discussion:
                        candidate.discussion || {},

                    culturalLens:
                        candidate.culturalLens || {},

                    brief:
                        cleanString(
                            candidate.brief
                        )
                })
            }
        );

        let result = null;

        try {
            result =
                await response.json();
        } catch { }

        if (
            !response.ok ||
            result?.ok !== true
        ) {
            throw new Error(
                result?.error ||
                `Atlas AI request failed with status ${response.status}.`
            );
        }

        const title =
            cleanString(
                result.payload?.title
            );

        const summary =
            cleanString(
                result.payload?.summary
            );

        const questions =
            Array.isArray(
                result.payload?.questions
            )
                ? result.payload.questions
                    .map(cleanString)
                    .filter(Boolean)
                : [];

        const pathDescription =
            cleanString(
                result.payload?.pathDescription
            );

        if (
            !title ||
            !summary ||
            questions.length !== 2 ||
            !pathDescription
        ) {
            throw new Error(
                'Atlas AI returned an invalid Reflection payload.'
            );
        }

        return {
            title,
            summary,
            questions,
            pathDescription
        };
    }

    async function generateDiscussionFraming(
        input = {}
    ) {

        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const response = await requestAtlasAI(
            `${BASE_URL}/generate-discussion-framing`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({
                    subject: {
                        title:
                            cleanString(
                                candidate.subject?.title
                            ),

                        description:
                            cleanString(
                                candidate.subject?.description
                            ),

                        hook:
                            cleanString(
                                candidate.subject?.hook
                            )
                    },

                    overview: {
                        heading:
                            cleanString(
                                candidate.overview?.heading
                            ),

                        intro:
                            cleanString(
                                candidate.overview?.intro
                            ),

                        question:
                            cleanString(
                                candidate.overview?.question
                            )
                    },

                    brief:
                        cleanString(
                            candidate.brief
                        )
                })
            }
        );

        let result = null;

        try {
            result =
                await response.json();
        } catch { }

        if (
            !response.ok ||
            result?.ok !== true
        ) {
            throw new Error(
                result?.error ||
                `Atlas AI request failed with status ${response.status}.`
            );
        }

        const heading =
            cleanString(
                result.payload?.heading
            );

        const intro =
            cleanString(
                result.payload?.intro
            );

        const pathDescription =
            cleanString(
                result.payload?.pathDescription
            );

        if (
            !heading ||
            !intro ||
            !pathDescription
        ) {
            throw new Error(
                'Atlas AI returned an invalid Discussion framing payload.'
            );
        }

        return {
            heading,
            intro,
            pathDescription
        };
    }

    async function generateSubjectArtwork(
        input = {}
    ) {
        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const subject = {
            title:
                cleanString(
                    candidate.subject?.title
                ),

            description:
                cleanString(
                    candidate.subject?.description
                )
        };

        if (!subject.title) {
            throw new Error(
                'A subject title is required.'
            );
        }

        const response = await requestAtlasAI(
            `${BASE_URL}/generate-subject-artwork`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({
                    subject,

                    idea:
                        cleanString(
                            candidate.idea
                        ).slice(0, 240)
                })
            },
            {
                subjectId:
                    cleanString(
                        candidate.subjectId
                    )
            }
        );

        let result = null;

        try {
            result =
                await response.json();
        } catch { }

        if (
            !response.ok ||
            result?.ok !== true
        ) {
            throw new Error(
                result?.error ||
                `Atlas AI request failed with status ${response.status}.`
            );
        }

        const svg =
            cleanString(
                result.payload?.svg
            );

        if (!svg) {
            throw new Error(
                'Atlas AI returned invalid subject artwork.'
            );
        }

        return { svg };
    }

    async function generateCurrentAffairsReading(
        input = {}
    ) {
        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const source =
            candidate.source &&
            typeof candidate.source === 'object' &&
            !Array.isArray(candidate.source)
                ? {
                    publisher:
                        cleanString(
                            candidate.source.publisher
                        ),

                    title:
                        cleanString(
                            candidate.source.title
                        ),

                    url:
                        cleanString(
                            candidate.source.url
                        ),

                    publishedAt:
                        cleanString(
                            candidate.source.publishedAt
                        ),

                    summary:
                        cleanString(
                            candidate.source.summary
                        ),

                    keyFacts:
                        Array.isArray(
                            candidate.source.keyFacts
                        )
                            ? candidate.source.keyFacts
                                .map(cleanString)
                                .filter(Boolean)
                                .slice(0, 4)
                            : []
                }
                : null;

        if (!source) {
            throw new Error(
                'A Current Affairs source is required.'
            );
        }

        const response = await requestAtlasAI(
            `${BASE_URL}/generate-current-affairs-reading`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({
                    source,

                    languageLevel:
                        cleanString(
                            candidate.languageLevel
                        ) || 'b2'
                })
            }
        );

        let result = null;

        try {
            result =
                await response.json();
        } catch { }

        if (
            !response.ok ||
            result?.ok !== true
        ) {
            throw new Error(
                result?.error ||
                `Current Affairs reading failed with status ${response.status}.`
            );
        }

        const readMore =
            cleanString(
                result.payload?.readMore
            );

        const readMoreQuestions =
            Array.isArray(
                result.payload?.readMoreQuestions
            )
                ? result.payload.readMoreQuestions
                    .map(cleanString)
                    .filter(Boolean)
                    .slice(0, 2)
                : [];

        const imageUrl =
            cleanString(
                result.payload?.imageUrl
            );

        if (
            !readMore ||
            readMoreQuestions.length !== 2
        ) {
            throw new Error(
                'Atlas AI returned an invalid Current Affairs reading.'
            );
        }

        return {
            readMore,
            readMoreQuestions,
            imageUrl
        };
    }

    async function searchCovers(
        input = {}
    ) {
        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const requestedProvider =
            cleanString(
                candidate.provider
            ).toLowerCase();

        const provider =
            requestedProvider === 'pexels'
                ? 'pexels'
                : 'web';

        const query =
            cleanString(
                candidate.query
            );

        const page =
            Math.max(
                1,
                Math.floor(
                    Number(
                        candidate.page
                    ) || 1
                )
            );

        if (!query) {
            throw new Error(
                'A cover search term is required.'
            );
        }

        const response = await requestAtlasAI(
            `${BASE_URL}/search-covers`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({
                    provider,
                    query,
                    page
                })
            }
        );

        let result = null;

        try {
            result =
                await response.json();
        } catch { }

        if (
            !response.ok ||
            result?.ok !== true
        ) {
            throw new Error(
                result?.error ||
                `Cover search failed with status ${response.status}.`
            );
        }

        const payload =
            result.payload &&
            typeof result.payload === 'object' &&
            !Array.isArray(result.payload)
                ? result.payload
                : {};

        const photos =
            Array.isArray(
                payload.photos
            )
                ? payload.photos
                    .map(photo => ({
                        id:
                            cleanString(
                                photo?.id
                            ),

                        width:
                            Number(
                                photo?.width
                            ) || 0,

                        height:
                            Number(
                                photo?.height
                            ) || 0,

                        imageUrl:
                            cleanString(
                                photo?.imageUrl
                            ),

                        previewUrl:
                            cleanString(
                                photo?.previewUrl ||
                                photo?.imageUrl
                            ),

                        photographer:
                            cleanString(
                                photo?.photographer
                            ),

                        photographerUrl:
                            cleanString(
                                photo?.photographerUrl
                            ),

                        sourceUrl:
                            cleanString(
                                photo?.sourceUrl
                            ),

                        sourceName:
                            cleanString(
                                photo?.sourceName
                            ),

                        sourceDomain:
                            cleanString(
                                photo?.sourceDomain
                            ),

                        alt:
                            cleanString(
                                photo?.alt
                            )
                    }))
                    .filter(photo =>
                        photo.id &&
                        photo.imageUrl &&
                        photo.previewUrl
                    )
                : [];

        return {
            provider:
                cleanString(
                    payload.provider
                ) || provider,

            query:
                cleanString(
                    payload.query
                ) || query,

            page:
                Math.max(
                    1,
                    Number(
                        payload.page
                    ) || page
                ),

            perPage:
                Number(
                    payload.perPage
                ) || photos.length,

            totalResults:
                Number.isFinite(
                    Number(
                        payload.totalResults
                    )
                )
                    ? Number(
                        payload.totalResults
                    )
                    : null,

            hasMore:
                Boolean(
                    payload.hasMore
                ),

            photos
        };
    }

    window.AtlasAI = {
        generateMoment:
            withGenerationContext(generateMoment),

        generateCulturalLensCard:
            withGenerationContext(generateCulturalLensCard),

        generateDiscussionSet:
            withGenerationContext(generateDiscussionSet),

        generateSubjectFraming:
            withGenerationContext(generateSubjectFraming),

        generateOverview:
            withGenerationContext(generateOverview),

        generateDiscussionFraming:
            withGenerationContext(generateDiscussionFraming),

        generateCulturalLensFraming:
            withGenerationContext(generateCulturalLensFraming),

        generateReflection:
            withGenerationContext(generateReflection),

        selectKeyLanguageOpportunities:
            withGenerationContext(selectKeyLanguageOpportunities),

        generateMomentUpgrade:
            withGenerationContext(generateMomentUpgrade),

        generateCulturalLensUpgrade:
            withGenerationContext(generateCulturalLensUpgrade),

        generateMakeItReal:
            withGenerationContext(generateMakeItReal),

        generateDiscussionPathway:
            withGenerationContext(generateDiscussionPathway),

        generateSubjectArtwork,

        generateCurrentAffairsReading,

        searchCovers,

        recommendSubjects,

        suggestSubjectIdeas
    };
})();
