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

    const DEV_TOKEN_KEY =
        'atlas::aiDevToken';

    function cleanString(value) {
        return String(value ?? '').trim();
    }

    function getDevToken() {
        try {
            return sessionStorage.getItem(
                DEV_TOKEN_KEY
            ) || '';
        } catch {
            return '';
        }
    }

    function setDevToken(value) {
        const token =
            cleanString(value);

        if (!token) return false;

        try {
            sessionStorage.setItem(
                DEV_TOKEN_KEY,
                token
            );

            return true;
        } catch {
            return false;
        }
    }

    function clearDevToken() {
        try {
            sessionStorage.removeItem(
                DEV_TOKEN_KEY
            );

            return true;
        } catch {
            return false;
        }
    }

    async function generateMoment(
        input = {}
    ) {
        const token = getDevToken();

        if (!token) {
            throw new Error(
                'Atlas AI development token is not configured.'
            );
        }

        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const response = await fetch(
            `${BASE_URL}/generate-moment`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json',

                    'X-Atlas-AI-Token':
                        token
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
        const token = getDevToken();

        if (!token) {
            throw new Error(
                'Atlas AI development token is not configured.'
            );
        }

        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const response = await fetch(
            `${BASE_URL}/generate-cultural-lens-card`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json',

                    'X-Atlas-AI-Token':
                        token
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
        const token = getDevToken();

        if (!token) {
            throw new Error(
                'Atlas AI development token is not configured.'
            );
        }

        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const response = await fetch(
            `${BASE_URL}/generate-discussion-set`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json',

                    'X-Atlas-AI-Token':
                        token
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
        const token = getDevToken();

        if (!token) {
            throw new Error(
                'Atlas AI development token is not configured.'
            );
        }

        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const response = await fetch(
            `${BASE_URL}/generate-subject-framing`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json',

                    'X-Atlas-AI-Token':
                        token
                },

                body: JSON.stringify({
                    subject: {
                        title:
                            cleanString(
                                candidate.subject?.title
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

        const catalogDescription =
            cleanString(
                result.payload
                    ?.catalogDescription
            );

        const hook =
            cleanString(
                result.payload?.hook
            );

        if (
            !catalogDescription ||
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
        const token = getDevToken();

        if (!token) {
            throw new Error(
                'Atlas AI development token is not configured.'
            );
        }

        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const response = await fetch(
            `${BASE_URL}/generate-overview`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json',

                    'X-Atlas-AI-Token':
                        token
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
        const token = getDevToken();

        if (!token) {
            throw new Error(
                'Atlas AI development token is not configured.'
            );
        }

        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const response = await fetch(
            `${BASE_URL}/generate-cultural-lens-framing`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json',

                    'X-Atlas-AI-Token':
                        token
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

    async function generateReflection(
        input = {}
    ) {
        const token = getDevToken();

        if (!token) {
            throw new Error(
                'Atlas AI development token is not configured.'
            );
        }

        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const response = await fetch(
            `${BASE_URL}/generate-reflection`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json',

                    'X-Atlas-AI-Token':
                        token
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
        const token = getDevToken();

        if (!token) {
            throw new Error(
                'Atlas AI development token is not configured.'
            );
        }

        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const response = await fetch(
            `${BASE_URL}/generate-discussion-framing`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json',

                    'X-Atlas-AI-Token':
                        token
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

    window.AtlasAI = {
        setDevToken,
        clearDevToken,
        generateMoment,
        generateCulturalLensCard,
        generateDiscussionSet,
        generateSubjectFraming,
        generateOverview,
        generateDiscussionFraming,
        generateCulturalLensFraming,
        generateReflection
    };
})();