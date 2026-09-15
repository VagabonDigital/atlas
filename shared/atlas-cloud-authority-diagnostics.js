/* ============================================================
   ATLAS CLOUD AUTHORITY — CANARY DIAGNOSTICS
   Dev-only error surfacing for the cloud-authority Compass canary.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasCloudAuthorityDiagnostics) return;

    const current = window.AtlasTutorSubjects;
    if (!current) return;

    const OPERATIONS = [
        'createSubject',
        'updateSubject',
        'renameSubject',
        'duplicateSubject',
        'deleteSubject',
        'moveSubject',
        'createLibraryCategory',
        'renameLibraryCategory',
        'moveLibraryCategory',
        'deleteLibraryCategory',
        'setSubjectLibraryPlacement',
        'saveWorkingDraft',
        'saveBuildState',
        'saveBuildCheckpoint',
        'exportPortableData'
    ];

    let lastFailure = null;

    function ensurePanel() {
        let panel = document.getElementById('atlas-cloud-authority-diagnostic');
        if (panel) return panel;

        panel = document.createElement('pre');
        panel.id = 'atlas-cloud-authority-diagnostic';
        panel.style.cssText = [
            'position:fixed',
            'z-index:2147483647',
            'left:16px',
            'right:16px',
            'bottom:16px',
            'max-height:38vh',
            'overflow:auto',
            'margin:0',
            'padding:14px 16px',
            'border:1px solid #b42318',
            'border-radius:10px',
            'background:#fff4f2',
            'color:#7a271a',
            'box-shadow:0 12px 40px rgba(0,0,0,.18)',
            'font:13px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace',
            'white-space:pre-wrap'
        ].join(';');
        panel.hidden = true;
        document.body.appendChild(panel);
        return panel;
    }

    function describeError(operation, error, returnedValue) {
        const code = String(error?.code || '').trim();
        const message = String(
            error?.message ||
            (returnedValue !== undefined
                ? `Operation returned ${String(returnedValue)}.`
                : 'Unknown cloud-authority failure.')
        ).trim();

        return {
            operation,
            code,
            message,
            returnedValue
        };
    }

    function report(operation, error = null, returnedValue = undefined) {
        const detail = describeError(operation, error, returnedValue);
        lastFailure = detail;

        console.error(
            `[Atlas cloud-authority canary] ${operation} failed`,
            error || detail
        );

        try {
            const panel = ensurePanel();
            panel.textContent = [
                'ATLAS CLOUD AUTHORITY CANARY FAILURE',
                `operation: ${detail.operation}`,
                detail.code ? `code: ${detail.code}` : '',
                `message: ${detail.message}`
            ].filter(Boolean).join('\n');
            panel.hidden = false;
        } catch { }
    }

    const wrapped = { ...current };

    OPERATIONS.forEach(name => {
        if (typeof current[name] !== 'function') return;
        const original = current[name].bind(current);

        wrapped[name] = async function (...args) {
            try {
                const result = await original(...args);
                if (result === null || result === false) {
                    report(name, null, result);
                }
                return result;
            } catch (error) {
                report(name, error);
                throw error;
            }
        };
    });

    window.AtlasTutorSubjects = wrapped;
    window.AtlasCloudAuthorityDiagnostics = Object.freeze({
        active: true,
        getLastFailure() {
            return lastFailure ? { ...lastFailure } : null;
        },
        clear() {
            lastFailure = null;
            const panel = document.getElementById('atlas-cloud-authority-diagnostic');
            if (panel) panel.hidden = true;
        }
    });
})();
