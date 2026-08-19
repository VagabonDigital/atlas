/* ============================================================
   COMPASS SUBJECT LOADER
   Loads a Structured Subject into the shared Compass runtime.

   Current dynamic source:
   - independently owned My Subjects via AtlasTutorSubjects

   The shared Compass engine remains the teaching runtime.
   This loader only resolves subject data before that engine executes.
   ============================================================ */

(function () {
    'use strict';

    function cloneJson(value) {
        try {
            return JSON.parse(JSON.stringify(value));
        } catch {
            return null;
        }
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function getRequestedSubjectId() {
        try {
            return new URL(window.location.href)
                .searchParams
                .get('id')
                ?.trim() || '';
        } catch {
            return '';
        }
    }

    function getStatusElement() {
        return document.getElementById(
            'compass-subject-load-status'
        );
    }

    function showLoadError(message) {
        const status = getStatusElement();

        if (!status) return;

        status.textContent = message;
        status.setAttribute('role', 'alert');
    }

    function requireAtlasTutorSubjects() {
        if (!window.AtlasTutorSubjects) {
            throw new Error(
                'AtlasTutorSubjects is missing. atlas-tutor-subjects.js must load before compass-subject-loader.js.'
            );
        }

        return window.AtlasTutorSubjects;
    }

    function normalizeOwnedStructuredSubject(record) {
        if (
            !record ||
            typeof record !== 'object' ||
            record.format !== 'structured'
        ) {
            return null;
        }

        const document = cloneJson(record.document);
        const Structured =
            window.AtlasStructuredSubject;

        if (
            !document ||
            !Structured ||
            typeof Structured.validateDocument !== 'function'
        ) {
            return null;
        }

        const validation =
            Structured.validateDocument(document);

        if (!validation.valid) {
            console.error(
                '[Compass] Owned Structured Subject validation failed:',
                validation.errors
            );
            return null;
        }

        if (
            !document.module ||
            typeof document.module !== 'object' ||
            !document.subjectCopy ||
            typeof document.subjectCopy !== 'object' ||
            !Array.isArray(document.discussionSets) ||
            !Array.isArray(document.culturalLensCards)
        ) {
            return null;
        }

        const title = String(
            document.module.title ||
            record.metadata?.title ||
            'Untitled Subject'
        ).trim() || 'Untitled Subject';

        const navTitle = String(
            document.module.navTitle ||
            record.metadata?.navTitle ||
            title
        ).trim() || title;

        const bgImage = String(
            document.module.bgImage ||
            record.metadata?.coverImage ||
            ''
        ).trim();

        const catalogDescription = String(
            document.module.catalogDescription ||
            record.metadata?.description ||
            ''
        ).trim();

        return {
            runtime: {
                source: 'owned',
                subjectId: record.id,
                ownerId: record.ownerId,
                format: record.format,
                revision: record.revision,
                generationContext:
                    cloneJson(
                        record.metadata?.generationContext
                    ) || {}
            },

            module: {
                id: record.id,
                schemaVersion:
                    Math.max(
                        1,
                        Math.floor(
                            Number(document.schemaVersion) || 1
                        )
                    ),
                contentVersion: `owned-r${record.revision}`,
                title,
                titleHtml: escapeHtml(title),
                navTitle,
                bgImage,
                catalogDescription
            },

            subjectCopy: cloneJson(document.subjectCopy) || {},
            discussionSets:
                cloneJson(document.discussionSets) || [],
            culturalLensCards:
                cloneJson(document.culturalLensCards) || []
        };
    }

    function installRuntimeSubject(subject) {
        window.AtlasCompassSubjectRuntime = subject.runtime;

        window.AtlasGenerationContext =
            cloneJson(
                subject.runtime?.generationContext
            ) || {};

        window.MODULE = subject.module;
        window.subjectCopy = subject.subjectCopy;
        window.discussionSets = subject.discussionSets;
        window.clCards = subject.culturalLensCards;
    }

    function loadCompassEngine() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');

            script.src = new URL(
                '../shared/compass-engine.js',
                window.location.href
            ).href;

            script.onload = resolve;
            script.onerror = () => reject(
                new Error('Compass engine could not be loaded.')
            );

            document.body.appendChild(script);
        });
    }

    async function bootstrap() {
        const subjectId = getRequestedSubjectId();

        if (!subjectId) {
            showLoadError(
                'This subject link is missing its subject ID.'
            );
            return;
        }

        try {
            const record = await requireAtlasTutorSubjects()
                .getSubject(subjectId);

            if (!record) {
                showLoadError(
                    'This subject could not be found.'
                );
                return;
            }

            const subject =
                normalizeOwnedStructuredSubject(record);

            if (!subject) {
                showLoadError(
                    'This subject is not a valid Structured Subject.'
                );
                return;
            }

            installRuntimeSubject(subject);
            await loadCompassEngine();
        } catch (error) {
            console.error(
                '[Compass] Subject bootstrap failed:',
                error
            );

            showLoadError(
                'This subject could not be opened.'
            );
        }
    }

    bootstrap();
})();
