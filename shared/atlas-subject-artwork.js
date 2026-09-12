/* ============================================================
   ATLAS SUBJECT ARTWORK
   Shared contract and generation runtime for tutor-owned Compass
   card artwork.

   Owns:
   - artwork metadata normalization
   - SVG allow-list validation / sanitization
   - artwork color normalization
   - narrow browser call for subject artwork generation
   - Compass Artwork Studio generation wiring

   Does NOT own:
   - provider credentials
   - subject persistence
   - canonical Atlas artwork
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasSubjectArtwork) return;

    const SCHEMA_VERSION = 1;
    const TYPE = 'atlas-svg';
    const VIEWBOX = '0 0 180 140';
    const MAX_SVG_LENGTH = 16000;
    const MAX_ELEMENTS = 90;
    const MAX_IDEA_LENGTH = 240;
    const AI_BASE_URL =
        'https://atlas-ai.savvy989.workers.dev';

    const ALLOWED_TAGS = new Set([
        'svg',
        'g',
        'path',
        'circle',
        'ellipse',
        'rect',
        'line',
        'polyline',
        'polygon'
    ]);

    const ALLOWED_ATTRIBUTES = new Set([
        'xmlns',
        'viewBox',
        'fill',
        'stroke',
        'stroke-width',
        'stroke-linecap',
        'stroke-linejoin',
        'stroke-dasharray',
        'stroke-dashoffset',
        'pathLength',
        'vector-effect',
        'opacity',
        'class',
        'transform',
        'd',
        'cx',
        'cy',
        'r',
        'rx',
        'ry',
        'x',
        'y',
        'width',
        'height',
        'x1',
        'y1',
        'x2',
        'y2',
        'points'
    ]);

    function cleanString(value) {
        return String(value ?? '').trim();
    }

    function normalizeViewBox(value) {
        return cleanString(value)
            .split(/\s+/)
            .join(' ');
    }

    function normalizeColor(value) {
        const raw = cleanString(value);

        if (
            !raw ||
            raw.toLowerCase() === 'atlas' ||
            raw.toLowerCase() === 'default'
        ) {
            return 'atlas';
        }

        if (/^#[0-9a-f]{3}$/i.test(raw)) {
            return (
                '#' +
                raw
                    .slice(1)
                    .split('')
                    .map(char => char + char)
                    .join('')
            ).toLowerCase();
        }

        if (/^#[0-9a-f]{6}$/i.test(raw)) {
            return raw.toLowerCase();
        }

        return 'atlas';
    }

    function hasUnsafeValue(value) {
        return /javascript:|data:|url\s*\(/i.test(
            String(value || '')
        );
    }

    function isAllowedPaint(value) {
        const paint = cleanString(value);

        return (
            paint === 'none' ||
            paint === 'currentColor'
        );
    }

    function sanitizeSvg(value) {
        const source = cleanString(value);

        if (
            !source ||
            source.length > MAX_SVG_LENGTH ||
            typeof DOMParser !== 'function'
        ) {
            return '';
        }

        let document;

        try {
            document = new DOMParser().parseFromString(
                source,
                'image/svg+xml'
            );
        } catch {
            return '';
        }

        if (
            !document ||
            document.querySelector('parsererror')
        ) {
            return '';
        }

        const root = document.documentElement;

        if (
            !root ||
            root.localName !== 'svg' ||
            normalizeViewBox(
                root.getAttribute('viewBox')
            ) !== VIEWBOX
        ) {
            return '';
        }

        const elements = [
            root,
            ...root.querySelectorAll('*')
        ];

        if (elements.length > MAX_ELEMENTS) {
            return '';
        }

        for (const element of elements) {
            if (!ALLOWED_TAGS.has(element.localName)) {
                return '';
            }

            for (const attribute of [
                ...element.attributes
            ]) {
                const name = attribute.name;
                const attrValue = attribute.value;

                if (
                    name.toLowerCase().startsWith('on') ||
                    !ALLOWED_ATTRIBUTES.has(name) ||
                    hasUnsafeValue(attrValue)
                ) {
                    return '';
                }

                if (
                    (
                        name === 'fill' ||
                        name === 'stroke'
                    ) &&
                    !isAllowedPaint(attrValue)
                ) {
                    return '';
                }

                if (
                    name === 'class' &&
                    !/^[a-zA-Z0-9 _-]*$/.test(
                        attrValue
                    )
                ) {
                    return '';
                }
            }
        }

        root.setAttribute(
            'viewBox',
            VIEWBOX
        );

        root.setAttribute(
            'xmlns',
            'http://www.w3.org/2000/svg'
        );

        try {
            return new XMLSerializer()
                .serializeToString(root);
        } catch {
            return '';
        }
    }

    function normalize(value) {
        if (
            !value ||
            typeof value !== 'object' ||
            Array.isArray(value)
        ) {
            return null;
        }

        const svg = sanitizeSvg(value.svg);

        if (!svg) {
            return null;
        }

        return {
            type: TYPE,
            version: SCHEMA_VERSION,
            svg,
            color: normalizeColor(value.color),
            idea: cleanString(value.idea)
                .slice(0, MAX_IDEA_LENGTH)
        };
    }

    function resolveColor(value) {
        const color = normalizeColor(value);

        return color === 'atlas'
            ? ''
            : color;
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

        const response = await fetch(
            `${AI_BASE_URL}/generate-subject-artwork`,
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
                        ).slice(
                            0,
                            MAX_IDEA_LENGTH
                        )
                })
            }
        );

        let result = null;

        try {
            result = await response.json();
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

        const svg = sanitizeSvg(
            result.payload?.svg
        );

        if (!svg) {
            throw new Error(
                'Atlas AI returned invalid subject artwork.'
            );
        }

        return { svg };
    }

    window.AtlasSubjectArtwork =
        Object.freeze({
            schemaVersion: SCHEMA_VERSION,
            type: TYPE,
            viewBox: VIEWBOX,
            normalize,
            sanitizeSvg,
            normalizeColor,
            resolveColor,
            generateSubjectArtwork
        });

    function installCompassArtworkGeneration() {
        const Artwork =
            window.AtlasSubjectArtwork;

        const AI =
            window.AtlasAI;

        if (
            AI &&
            typeof AI.generateSubjectArtwork !==
                'function'
        ) {
            AI.generateSubjectArtwork =
                generateSubjectArtwork;
        }

        if (
            typeof window
                .generateSubjectArtworkStudioPreview !==
                'function' ||
            typeof subjectArtworkStudioState ===
                'undefined' ||
            typeof renderSubjectArtworkStudioPreview ===
                'undefined'
        ) {
            return;
        }

        window.generateSubjectArtworkStudioPreview =
            async function () {
                const state =
                    subjectArtworkStudioState;

                if (!state) return;

                const idea =
                    cleanString(
                        document.getElementById(
                            'subject-artwork-idea'
                        )?.value
                    ).slice(
                        0,
                        MAX_IDEA_LENGTH
                    );

                const error =
                    document.getElementById(
                        'subject-artwork-studio-error'
                    );

                const useButton =
                    document.getElementById(
                        'subject-artwork-use'
                    );

                const generateButton =
                    document.getElementById(
                        'subject-artwork-generate'
                    );

                const previousSvg =
                    state.svg;

                state.idea = idea;

                if (error) {
                    error.hidden = true;
                    error.textContent = '';
                }

                if (generateButton) {
                    generateButton.disabled = true;
                    generateButton.textContent =
                        'Generating…';
                }

                if (useButton) {
                    useButton.disabled = true;
                }

                try {
                    const generated =
                        await generateSubjectArtwork({
                            subject: {
                                title:
                                    state.subject?.title || '',

                                description:
                                    state.subject?.hook || ''
                            },

                            idea
                        });

                    const normalized =
                        Artwork.normalize({
                            type: TYPE,
                            version: SCHEMA_VERSION,
                            svg: generated.svg,
                            color: state.color,
                            idea
                        });

                    if (!normalized) {
                        throw new Error(
                            'Generated artwork failed validation.'
                        );
                    }

                    state.svg = normalized.svg;
                    state.idea = idea;

                    renderSubjectArtworkStudioPreview();

                    if (useButton) {
                        useButton.disabled = false;
                    }

                    if (generateButton) {
                        generateButton.textContent =
                            'Try another';
                    }
                } catch (generationError) {
                    console.error(
                        '[Compass] Subject artwork generation failed:',
                        generationError
                    );

                    state.svg = previousSvg;

                    if (error) {
                        error.hidden = false;
                        error.textContent =
                            'Couldn’t generate artwork just now. Try again.';
                    }

                    if (useButton) {
                        useButton.disabled =
                            !state.svg;
                    }

                    if (generateButton) {
                        generateButton.textContent =
                            state.svg
                                ? 'Try another'
                                : 'Generate artwork';
                    }
                } finally {
                    if (generateButton) {
                        generateButton.disabled = false;
                    }
                }
            };
    }

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            installCompassArtworkGeneration,
            { once: true }
        );
    } else {
        queueMicrotask(
            installCompassArtworkGeneration
        );
    }
})();