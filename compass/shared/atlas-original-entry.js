// ============================================================
// ATLAS ORIGINAL ENTRY
// Shared bootstrap for canonical Compass / Atlas Subject pages.
// Keeps management actions lightweight and normal teaching pages complete.
// New Atlas Originals should use this shared entry instead of duplicating
// action-specific boot logic in their individual index.html files.
// ============================================================

(function () {
    'use strict';

    function getAction() {
        try {
            return String(
                new URL(window.location.href)
                    .searchParams
                    .get('atlasHubAction') || ''
            ).trim();
        } catch {
            return '';
        }
    }

    function isLightweightAction(action = getAction()) {
        return [
            'own',
            'duplicate',
            'restore-version'
        ].includes(action);
    }

    function getHostWindow() {
        try {
            if (window.parent && window.parent !== window) {
                void window.parent.location.href;
                return window.parent;
            }
        } catch { }

        return window;
    }

    function installAtlasOriginalArtworkPersistence() {
        const Host = getHostWindow();
        const Subjects = Host.AtlasTutorSubjects;
        const Catalog = Host.CompassCatalogData;
        const Artwork = Host.AtlasSubjectArtwork;

        if (
            !Subjects ||
            Subjects.__atlasOriginalArtworkPersistencePatched ||
            typeof Subjects.createSubject !== 'function' ||
            !Catalog ||
            typeof Catalog.getCompassCatalogMap !== 'function' ||
            typeof Catalog.getCompassSubjectArt !== 'function' ||
            !Artwork ||
            typeof Artwork.normalize !== 'function'
        ) {
            return;
        }

        const originalCreateSubject = Subjects.createSubject;

        Subjects.createSubject = async function (input = {}) {
            const candidate =
                input &&
                typeof input === 'object' &&
                !Array.isArray(input)
                    ? input
                    : {};

            const provenance =
                candidate.provenance &&
                typeof candidate.provenance === 'object' &&
                !Array.isArray(candidate.provenance)
                    ? candidate.provenance
                    : null;

            const metadata =
                candidate.metadata &&
                typeof candidate.metadata === 'object' &&
                !Array.isArray(candidate.metadata)
                    ? candidate.metadata
                    : {};

            let preparedCandidate = candidate;
            let preparedMetadata = metadata;

            if (
                provenance?.sourceWorld === 'compass' &&
                provenance?.kind === 'atlas-duplicate'
            ) {
                const sourceTitle = String(
                    metadata.title ||
                    candidate.document?.module?.title ||
                    'Untitled Subject'
                ).trim() || 'Untitled Subject';

                const duplicateTitle = `${sourceTitle} copy`;

                const document =
                    candidate.document &&
                    typeof candidate.document === 'object' &&
                    !Array.isArray(candidate.document)
                        ? {
                            ...candidate.document,
                            module: {
                                ...(
                                    candidate.document.module &&
                                    typeof candidate.document.module === 'object' &&
                                    !Array.isArray(candidate.document.module)
                                        ? candidate.document.module
                                        : {}
                                ),
                                title: duplicateTitle,
                                navTitle: duplicateTitle
                            }
                        }
                        : candidate.document;

                preparedMetadata = {
                    ...metadata,
                    title: duplicateTitle,
                    navTitle: duplicateTitle
                };

                preparedCandidate = {
                    ...candidate,
                    metadata: preparedMetadata,
                    document
                };
            }

            const sourceSubjectId = String(
                provenance?.sourceSubjectId || ''
            ).trim();

            const isAtlasOriginalCopy = Boolean(
                provenance?.sourceWorld === 'compass' &&
                sourceSubjectId &&
                [
                    'atlas-original-owned',
                    'atlas-my-version',
                    'atlas-duplicate'
                ].includes(String(provenance?.kind || ''))
            );

            if (
                !isAtlasOriginalCopy ||
                Artwork.normalize(preparedMetadata.artwork)
            ) {
                return originalCreateSubject.call(
                    this,
                    preparedCandidate
                );
            }

            const catalog =
                Catalog.getCompassCatalogMap();

            const source =
                catalog?.[`compass:${sourceSubjectId}`] ||
                Object.values(catalog || {}).find(item =>
                    item?.id === sourceSubjectId
                );

            const artId = String(
                source?.artId || ''
            ).trim();

            const svg = artId
                ? Catalog.getCompassSubjectArt(artId)
                : '';

            const artwork = svg
                ? Artwork.normalize({
                    type: 'atlas-svg',
                    version: 1,
                    svg,
                    color: 'atlas',
                    idea: ''
                })
                : null;

            if (!artwork) {
                return originalCreateSubject.call(
                    this,
                    preparedCandidate
                );
            }

            return originalCreateSubject.call(
                this,
                {
                    ...preparedCandidate,
                    metadata: {
                        ...preparedMetadata,
                        artwork
                    }
                }
            );
        };

        Subjects.__atlasOriginalArtworkPersistencePatched = true;
    }

    function writeHead({ includeAI = true } = {}) {
        if (isLightweightAction()) return;

        document.write(
            '<script src="../../shared/atlas-bridge.js"><\/script>' +
            '<script src="/shared/atlas-analytics.js?v=20260919-observability1"><\/script>' +
            '<script src="../../shared/atlas-tutor-content.js"><\/script>' +
            '<script src="../../shared/atlas-tutor-subjects.js"><\/script>' +
            '<script src="../../shared/atlas-structured-subject.js"><\/script>' +
            (includeAI
                ? '<script src="../../shared/atlas-ai.js"><\/script>'
                : '') +
            '<script src="../../shared/compass-catalog-data.js"><\/script>' +
            '<script src="../../shared/atlas-resource-share.js?v=20260918-share1"><\/script>' +
            '<script src="../../shared/atlas-content-registry.js?v=20260920-accountstable6"><\/script>' +
            '<link rel="stylesheet" href="../shared/compass-subject.css">' +
            '<link rel="stylesheet" href="../../shared/atlas-modal-theme.css?v=20260919-tapfix1">' +
            '<link rel="stylesheet" href="../../shared/atlas-search.css?v=20260721-world-modals">' +
            '<link rel="stylesheet" href="../../shared/atlas-session-panel.css?v=20260721-world-modals">'
        );
    }

    function writeBody() {
        const action = getAction();

        if (isLightweightAction(action)) {
            if (action === 'own' || action === 'duplicate') {
                installAtlasOriginalArtworkPersistence();
            }

            document.write(
                action === 'restore-version'
                    ? '<script src="../shared/atlas-original-restore-worker.js"><\/script>'
                    : '<script src="../shared/atlas-original-action-worker.js"><\/script>'
            );
            return;
        }

        document.write(
            '<script src="../shared/compass-subject-shell.js"><\/script>' +
            '<script src="../../shared/atlas-search.js"><\/script>' +
            '<script src="../../shared/atlas-session-panel.js?v=20260916-runtime3"><\/script>' +
            '<script src="../shared/compass-engine.js"><\/script>'
        );
    }

    window.AtlasOriginalEntry = Object.freeze({
        getAction,
        isLightweightAction,
        writeHead,
        writeBody
    });
})();
