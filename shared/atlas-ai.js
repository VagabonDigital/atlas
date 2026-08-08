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

    window.AtlasAI = {
        setDevToken,
        clearDevToken,
        generateMoment,
        generateCulturalLensCard
    };
})();
