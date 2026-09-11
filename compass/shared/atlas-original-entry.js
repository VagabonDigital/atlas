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

    function writeHead({ includeAI = true } = {}) {
        if (isLightweightAction()) return;

        document.write(
            '<script src="../../shared/atlas-bridge.js"><\/script>' +
            '<script src="../../shared/atlas-tutor-content.js"><\/script>' +
            '<script src="../../shared/atlas-tutor-subjects.js"><\/script>' +
            '<script src="../../shared/atlas-structured-subject.js"><\/script>' +
            (includeAI
                ? '<script src="../../shared/atlas-ai.js"><\/script>'
                : '') +
            '<script src="../../shared/compass-catalog-data.js"><\/script>' +
            '<script src="../../shared/atlas-content-registry.js"><\/script>' +
            '<link rel="stylesheet" href="../shared/compass-subject.css">' +
            '<link rel="stylesheet" href="../../shared/atlas-modal-theme.css?v=20260721-world-modals">' +
            '<link rel="stylesheet" href="../../shared/atlas-search.css?v=20260721-world-modals">' +
            '<link rel="stylesheet" href="../../shared/atlas-session-panel.css?v=20260721-world-modals">'
        );
    }

    function writeBody() {
        const action = getAction();

        if (isLightweightAction(action)) {
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
            '<script src="../../shared/atlas-session-panel.js"><\/script>' +
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
