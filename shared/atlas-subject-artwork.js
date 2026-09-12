/* ============================================================
   ATLAS SUBJECT ARTWORK
   Shared contract and Compass runtime for tutor-owned subject art.

   Owns:
   - artwork metadata normalization
   - SVG allow-list validation / sanitization
   - artwork color normalization
   - narrow browser call for subject artwork generation
   - Compass Artwork Studio generation and runtime hardening

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
    const ARTWORK_DISPLAY_KEY =
        'atlas::compass::artworkDisplay';

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

    let compassRuntimeInstalled = false;
    let artworkStudioScrollLock = null;
    let artworkStudioPreviewGeometry = null;

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

    function readArtworkDisplayPreference() {
        try {
            return localStorage.getItem(
                ARTWORK_DISPLAY_KEY
            ) === 'always'
                ? 'always'
                : 'hover';
        } catch {
            return 'hover';
        }
    }

    function applyArtworkDisplayPreference(
        value = readArtworkDisplayPreference()
    ) {
        const mode =
            value === 'always'
                ? 'always'
                : 'hover';

        document.documentElement.dataset
            .subjectArtworkDisplay = mode;

        document
            .querySelectorAll(
                '[data-artwork-display-mode]'
            )
            .forEach(button => {
                const active =
                    button.dataset
                        .artworkDisplayMode === mode;

                button.classList.toggle(
                    'is-selected',
                    active
                );

                button.setAttribute(
                    'aria-pressed',
                    String(active)
                );
            });

        return mode;
    }

    function setArtworkDisplayPreference(value) {
        const mode =
            value === 'always'
                ? 'always'
                : 'hover';

        try {
            localStorage.setItem(
                ARTWORK_DISPLAY_KEY,
                mode
            );
        } catch { }

        applyArtworkDisplayPreference(mode);
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

    function ensureStudioRuntimeStyles() {
        if (
            document.getElementById(
                'atlas-subject-artwork-runtime-style'
            )
        ) {
            return;
        }

        const style = document.createElement('style');
        style.id =
            'atlas-subject-artwork-runtime-style';
        style.textContent = `
            .subject-artwork-studio-backdrop {
                overscroll-behavior: none;
            }

            .subject-artwork-studio {
                overscroll-behavior: contain;
            }

            .subject-artwork-studio-preview {
                overflow: hidden;
            }

            .subject-artwork-preview-card {
                max-width: none !important;
                flex: 0 0 auto;
            }

            .subject-artwork-studio-head-actions {
                display: flex;
                align-items: center;
                gap: 0.7rem;
                flex: 0 0 auto;
            }

            .subject-artwork-display-control {
                display: flex;
                align-items: center;
                gap: 0.48rem;
                color: var(--text-subtle);
                font-size: 0.69rem;
                font-weight: 600;
                white-space: nowrap;
            }

            .subject-artwork-display-options {
                display: inline-flex;
                align-items: center;
                gap: 2px;
                padding: 2px;
                border: 1px solid var(--border-subtle);
                border-radius: 999px;
                background: var(--surface-muted);
            }

            .subject-artwork-display-btn {
                min-height: 28px;
                padding: 0.3rem 0.58rem;
                border: 0;
                border-radius: 999px;
                background: transparent;
                color: var(--text-muted);
                font: inherit;
                font-size: 0.68rem;
                font-weight: 600;
                cursor: pointer;
                transition: var(--t);
            }

            .subject-artwork-display-btn:hover,
            .subject-artwork-display-btn:focus-visible {
                color: var(--text-heading);
                outline: none;
            }

            .subject-artwork-display-btn.is-selected {
                background: var(--surface-raised);
                color: var(--accent);
                box-shadow: var(--shadow-xs);
            }

            html[data-subject-artwork-display="always"]
            .hub-main
            .subject-card--has-art
            .subject-card-art {
                opacity: 0.16;
            }

            html[data-theme="night"]
            [data-subject-artwork-display="always"]
            .hub-main
            .subject-card--has-art
            .subject-card-art,
            html[data-theme="night"][data-subject-artwork-display="always"]
            .hub-main
            .subject-card--has-art
            .subject-card-art {
                opacity: 0.23;
            }

            @media (max-width: 640px) {
                .subject-artwork-display-control-label {
                    display: none;
                }

                .subject-artwork-studio-head-actions {
                    gap: 0.45rem;
                }
            }
        `;

        document.head.appendChild(style);
    }

    function captureStudioScrollLock() {
        const root = document.documentElement;
        const body = document.body;

        return {
            x: window.scrollX || 0,
            y: window.scrollY || 0,

            rootOverflow:
                root.style.overflow,
            rootScrollBehavior:
                root.style.scrollBehavior,

            bodyOverflow:
                body.style.overflow,
            bodyPosition:
                body.style.position,
            bodyTop:
                body.style.top,
            bodyLeft:
                body.style.left,
            bodyRight:
                body.style.right,
            bodyWidth:
                body.style.width
        };
    }

    function lockStudioPage(snapshot) {
        if (!snapshot) return;

        artworkStudioScrollLock = snapshot;

        const root = document.documentElement;
        const body = document.body;

        root.style.overflow = 'hidden';

        body.style.overflow = 'hidden';
        body.style.position = 'fixed';
        body.style.top =
            `-${snapshot.y}px`;
        body.style.left =
            `-${snapshot.x}px`;
        body.style.right = '0';
        body.style.width = '100%';
    }

    function unlockStudioPage() {
        const snapshot =
            artworkStudioScrollLock;

        if (!snapshot) return;

        artworkStudioScrollLock = null;

        const root = document.documentElement;
        const body = document.body;

        root.style.overflow =
            snapshot.rootOverflow;

        body.style.overflow =
            snapshot.bodyOverflow;
        body.style.position =
            snapshot.bodyPosition;
        body.style.top =
            snapshot.bodyTop;
        body.style.left =
            snapshot.bodyLeft;
        body.style.right =
            snapshot.bodyRight;
        body.style.width =
            snapshot.bodyWidth;

        root.style.scrollBehavior = 'auto';

        window.scrollTo({
            left: snapshot.x,
            top: snapshot.y,
            behavior: 'auto'
        });

        root.style.scrollBehavior =
            snapshot.rootScrollBehavior;
    }

    function readSourceCardGeometry(event) {
        const card =
            event?.currentTarget?.closest?.(
                '.subject-card'
            ) || null;

        if (!card) return null;

        const rect = card.getBoundingClientRect();

        if (
            !Number.isFinite(rect.width) ||
            !Number.isFinite(rect.height) ||
            rect.width <= 0 ||
            rect.height <= 0
        ) {
            return null;
        }

        return {
            width: rect.width,
            height: rect.height
        };
    }

    function applyStudioPreviewGeometry() {
        const geometry =
            artworkStudioPreviewGeometry;

        const host =
            document.getElementById(
                'subject-artwork-preview-card'
            );

        const preview =
            host?.closest(
                '.subject-artwork-studio-preview'
            );

        const card =
            host?.querySelector(
                '.subject-card'
            );

        if (
            !geometry ||
            !host ||
            !preview ||
            !card
        ) {
            return;
        }

        host.style.width =
            `${geometry.width}px`;
        host.style.maxWidth = 'none';
        host.style.zoom = '';

        card.style.width = '100%';
        card.style.minHeight =
            `${geometry.height}px`;
        card.style.height =
            `${geometry.height}px`;

        const previewStyle =
            window.getComputedStyle(preview);

        const availableWidth = Math.max(
            0,
            preview.clientWidth -
            (parseFloat(previewStyle.paddingLeft) || 0) -
            (parseFloat(previewStyle.paddingRight) || 0)
        );

        if (
            availableWidth > 0 &&
            geometry.width > availableWidth &&
            window.CSS?.supports?.('zoom', '0.5')
        ) {
            host.style.zoom = String(
                availableWidth / geometry.width
            );
        }
    }

    function resetStudioUseButton() {
        const button =
            document.getElementById(
                'subject-artwork-use'
            );

        if (!button) return;

        button.textContent = 'Use artwork';

        try {
            button.disabled =
                !subjectArtworkStudioState?.svg;
        } catch {
            button.disabled = false;
        }
    }

    function ensureArtworkDisplayControl() {
        const head =
            document.querySelector(
                '.subject-artwork-studio-head'
            );

        const closeButton =
            head?.querySelector(
                '.subject-artwork-studio-close'
            );

        if (!head || !closeButton) return;

        let actions =
            head.querySelector(
                '.subject-artwork-studio-head-actions'
            );

        if (!actions) {
            actions = document.createElement('div');
            actions.className =
                'subject-artwork-studio-head-actions';

            head.insertBefore(
                actions,
                closeButton
            );

            actions.appendChild(closeButton);
        }

        let control =
            actions.querySelector(
                '.subject-artwork-display-control'
            );

        if (!control) {
            control = document.createElement('div');
            control.className =
                'subject-artwork-display-control';
            control.setAttribute(
                'role',
                'group'
            );
            control.setAttribute(
                'aria-label',
                'Artwork display on Compass cards'
            );

            const label =
                document.createElement('span');
            label.className =
                'subject-artwork-display-control-label';
            label.textContent = 'Artwork';

            const options =
                document.createElement('span');
            options.className =
                'subject-artwork-display-options';

            [
                ['hover', 'On hover'],
                ['always', 'Always']
            ].forEach(([mode, text]) => {
                const button =
                    document.createElement('button');

                button.type = 'button';
                button.className =
                    'subject-artwork-display-btn';
                button.dataset.artworkDisplayMode =
                    mode;
                button.textContent = text;
                button.addEventListener(
                    'click',
                    () => {
                        setArtworkDisplayPreference(
                            mode
                        );
                    }
                );

                options.appendChild(button);
            });

            control.append(
                label,
                options
            );

            actions.insertBefore(
                control,
                closeButton
            );
        }

        applyArtworkDisplayPreference();
    }

    function installCompassArtworkRuntime() {
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
            compassRuntimeInstalled ||
            typeof window
                .generateSubjectArtworkStudioPreview !==
                'function' ||
            typeof window
                .openSubjectArtworkStudio !==
                'function' ||
            typeof window
                .closeSubjectArtworkStudio !==
                'function' ||
            typeof window
                .renderSubjectArtworkStudioPreview !==
                'function' ||
            typeof subjectArtworkStudioState ===
                'undefined'
        ) {
            return;
        }

        compassRuntimeInstalled = true;
        ensureStudioRuntimeStyles();
        applyArtworkDisplayPreference();

        window.addEventListener(
            'storage',
            event => {
                if (
                    event.key ===
                    ARTWORK_DISPLAY_KEY
                ) {
                    applyArtworkDisplayPreference();
                }
            }
        );

        const originalRender =
            window.renderSubjectArtworkStudioPreview;

        window.renderSubjectArtworkStudioPreview =
            function (...args) {
                const result =
                    originalRender.apply(
                        this,
                        args
                    );

                applyStudioPreviewGeometry();
                return result;
            };

        const originalOpen =
            window.openSubjectArtworkStudio;

        window.openSubjectArtworkStudio =
            async function (
                subjectId,
                event
            ) {
                const scrollSnapshot =
                    captureStudioScrollLock();

                artworkStudioPreviewGeometry =
                    readSourceCardGeometry(event);

                let result;

                try {
                    result =
                        await originalOpen.call(
                            this,
                            subjectId,
                            event
                        );
                } catch (error) {
                    artworkStudioPreviewGeometry =
                        null;
                    throw error;
                }

                const backdrop =
                    document.getElementById(
                        'subject-artwork-studio-backdrop'
                    );

                if (
                    !backdrop ||
                    backdrop.hidden
                ) {
                    artworkStudioPreviewGeometry =
                        null;
                    return result;
                }

                ensureArtworkDisplayControl();
                resetStudioUseButton();
                lockStudioPage(scrollSnapshot);

                window
                    .renderSubjectArtworkStudioPreview();

                return result;
            };

        const originalClose =
            window.closeSubjectArtworkStudio;

        window.closeSubjectArtworkStudio =
            function (...args) {
                const button =
                    document.getElementById(
                        'subject-artwork-use'
                    );

                if (button) {
                    button.textContent =
                        'Use artwork';
                }

                let result;

                try {
                    result = originalClose.apply(
                        this,
                        args
                    );
                } finally {
                    unlockStudioPage();
                    artworkStudioPreviewGeometry =
                        null;
                }

                return result;
            };

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
                    useButton.textContent =
                        'Use artwork';
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

                    window
                        .renderSubjectArtworkStudioPreview();

                    if (useButton) {
                        useButton.disabled = false;
                        useButton.textContent =
                            'Use artwork';
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
                        useButton.textContent =
                            'Use artwork';
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
            installCompassArtworkRuntime,
            { once: true }
        );
    } else {
        queueMicrotask(
            installCompassArtworkRuntime
        );
    }
})();