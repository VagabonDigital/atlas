/* ============================================================
   COMPASS GENERATION AUTHORITY
   Already-rendered tutor content behaves the same while an owned
   subject is still generating as it does after generation finishes.

   Expanded subject tools = reusable My Subject edits.
   Minimized subject tools = temporary Live Changes.

   Loaded only by the dynamic owned-subject loader, after the
   shared Compass engine has established its canonical runtime.
   ============================================================ */

(function () {
    'use strict';

    const hasOwn = (object, key) =>
        Object.prototype.hasOwnProperty.call(object || {}, key);

    const originalConfigureLiveTutorContentElement =
        configureLiveTutorContentElement;
    const originalResolveTutorContentValue =
        resolveTutorContentValue;
    const originalHandleLiveTutorHistoryShortcut =
        handleLiveTutorHistoryShortcut;
    const originalSetMyVersionAuthorBarMinimized =
        setMyVersionAuthorBarMinimized;
    const originalBeginMyVersionEditing =
        beginMyVersionEditing;
    const originalNormalizeMyVersionQuestionCollectionsForSave =
        normalizeMyVersionQuestionCollectionsForSave;
    const originalRecordMyVersionHistory =
        recordMyVersionHistory;
    const originalCommitMyVersionDraftContent =
        commitMyVersionDraftContent;

    const originalRenderAllTutorContentSurfaces =
        renderAllTutorContentSurfaces;
    const originalApplyCoverConfig = applyCoverConfig;
    const originalApplySubjectCopy = applySubjectCopy;
    const originalRenderDiscussionSets = renderDiscussionSets;
    const originalRenderMoments = renderMoments;
    const originalRenderDiscussionFocus = renderDiscussionFocus;
    const originalRenderCLGrid = renderCLGrid;
    const originalRenderCulturalLensFocus =
        renderCulturalLensFocus;
    const originalRenderReflectionQuestions =
        renderReflectionQuestions;

    const reusableGenerationReaders = [
        'generateMyVersionSubjectFraming',
        'generateMyVersionOverview',
        'generateMyVersionDiscussionFraming',
        'generateMyVersionDiscussionSet',
        'generateMyVersionMoment',
        'generateMyVersionMomentPathway',
        'generateMyVersionMomentUpgrade',
        'generateMyVersionMakeItReal',
        'generateMyVersionCulturalLensFraming',
        'generateMyVersionCulturalLensCard',
        'generateMyVersionCulturalLensUpgrade',
        'generateMyVersionReflection'
    ];

    let allowAuthoringOpenWithLiveChanges = false;
    let suppressLiveResolutionDepth = 0;
    let deferredTutorContentRender = false;
    let foregroundHistoryEvent = false;
    let foregroundMutationDepth = 0;

    function isAuthoring() {
        return Boolean(
            myVersionEditing &&
            myVersionAuthoringOpen
        );
    }

    function isTeachingTimeLiveField(fieldKey) {
        const key = String(fieldKey || '');

        if (!key || key === 'module.title') {
            return false;
        }

        if (
            /^upgrade\.(moment|cultural-lens)\..+\.(type|atlasPrompt)$/
                .test(key)
        ) {
            return false;
        }

        if (
            /^paths\.(discussionTitle|discussionDescription|culturalLensTitle|culturalLensDescription|reflectionTitle|reflectionDescription)$/
                .test(key)
        ) {
            return false;
        }

        return true;
    }

    function installMobileLiveChangesOffset() {
        if (document.getElementById('atlas-generation-authority-style')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'atlas-generation-authority-style';
        style.textContent = `
            @media (max-width: 680px) {
                .atlas-live-changes-control.is-with-minimized-author-bar {
                    right: 4.25rem;
                }
            }
        `;

        document.head.appendChild(style);
    }

    // ------------------------------------------------------------
    // HISTORY AUTHORITY
    // Full-subject generation is background model evolution, not tutor
    // undo history. Direct tutor interactions remain foreground history,
    // including while the automatic build is still running.
    // ------------------------------------------------------------

    function markForegroundHistoryEvent() {
        foregroundHistoryEvent = true;

        queueMicrotask(() => {
            foregroundHistoryEvent = false;
        });
    }

    [
        'click',
        'change',
        'input',
        'paste',
        'keydown'
    ].forEach(eventName => {
        document.addEventListener(
            eventName,
            markForegroundHistoryEvent,
            true
        );
    });

    commitMyVersionDraftContent = function (...args) {
        foregroundMutationDepth += 1;

        try {
            return originalCommitMyVersionDraftContent
                .apply(this, args);
        } finally {
            foregroundMutationDepth -= 1;
        }
    };

    recordMyVersionHistory = function (before, after) {
        const automaticBuildMutation =
            myVersionGeneratingFullSubject &&
            foregroundMutationDepth === 0 &&
            !foregroundHistoryEvent;

        if (automaticBuildMutation) {
            return;
        }

        return originalRecordMyVersionHistory(
            before,
            after
        );
    };

    // ------------------------------------------------------------
    // ACTIVE EDIT AUTHORITY
    // The browser owns an active text-edit transaction. Background
    // generation may update the model, but it may not replace that DOM
    // editor. One canonical render is flushed after blur / Escape.
    // ------------------------------------------------------------

    function getActiveTutorTextEditor() {
        const element = document.activeElement;

        if (
            !(element instanceof Element) ||
            element.getAttribute('data-atlas-live-editable') !== 'true' ||
            !hasOwn(element.dataset, 'atlasTutorStartValue')
        ) {
            return null;
        }

        return element;
    }

    function flushDeferredTutorContentRender() {
        if (
            !deferredTutorContentRender ||
            getActiveTutorTextEditor()
        ) {
            return;
        }

        deferredTutorContentRender = false;
        originalRenderAllTutorContentSurfaces();
    }

    function wrapTutorContentRender(renderer, fullRender = false) {
        return function (...args) {
            if (getActiveTutorTextEditor()) {
                deferredTutorContentRender = true;
                return;
            }

            if (fullRender) {
                deferredTutorContentRender = false;
            }

            return renderer.apply(this, args);
        };
    }

    function installEditTransactionFlush(element) {
        if (!element || typeof element.onblur !== 'function') {
            return;
        }

        const originalBlur = element.onblur;

        element.onblur = function (...args) {
            try {
                return originalBlur.apply(this, args);
            } finally {
                flushDeferredTutorContentRender();
            }
        };
    }

    renderAllTutorContentSurfaces = wrapTutorContentRender(
        originalRenderAllTutorContentSurfaces,
        true
    );
    applyCoverConfig = wrapTutorContentRender(
        originalApplyCoverConfig
    );
    applySubjectCopy = wrapTutorContentRender(
        originalApplySubjectCopy
    );
    renderDiscussionSets = wrapTutorContentRender(
        originalRenderDiscussionSets
    );
    renderMoments = wrapTutorContentRender(
        originalRenderMoments
    );
    renderDiscussionFocus = wrapTutorContentRender(
        originalRenderDiscussionFocus
    );
    renderCLGrid = wrapTutorContentRender(
        originalRenderCLGrid
    );
    renderCulturalLensFocus = wrapTutorContentRender(
        originalRenderCulturalLensFocus
    );
    renderReflectionQuestions = wrapTutorContentRender(
        originalRenderReflectionQuestions
    );

    // ------------------------------------------------------------
    // EDIT AUTHORITY
    // ------------------------------------------------------------

    resolveTutorContentValue = function (originalValue, fieldKey) {
        let value = String(originalValue ?? '');

        if (myVersionEditing) {
            if (hasOwn(myVersionDraftOverrides, fieldKey)) {
                value = String(myVersionDraftOverrides[fieldKey] ?? '');
            }

            if (
                !myVersionAuthoringOpen &&
                suppressLiveResolutionDepth === 0 &&
                hasTutorContentOverride(tutorContentLiveDraft, fieldKey)
            ) {
                return String(
                    tutorContentLiveDraft.overrides[fieldKey] ?? ''
                );
            }

            return value;
        }

        return originalResolveTutorContentValue(
            originalValue,
            fieldKey
        );
    };

    configureLiveTutorContentElement = function (element, options) {
        const fieldKey = options?.fieldKey;

        if (!myVersionEditing || myVersionAuthoringOpen) {
            const result =
                originalConfigureLiveTutorContentElement(
                    element,
                    options
                );

            installEditTransactionFlush(element);
            return result;
        }

        if (
            !element ||
            !fieldKey ||
            !isTeachingTimeLiveField(fieldKey)
        ) {
            if (element && options) {
                writeLiveEditableText(element, options.value);
            }

            disableLiveTutorContentElement(element);
            return;
        }

        /*
         * Reuse the engine's finished-subject Live Change editor while
         * bypassing only its old "any active My Subject build disables
         * live editing" gate.
         */
        const editingState = myVersionEditing;
        myVersionEditing = false;

        try {
            originalConfigureLiveTutorContentElement(element, options);
        } finally {
            myVersionEditing = editingState;
        }

        const multiline = options.multiline !== false;

        element.oninput = () => {
            const nextValue = readLiveEditableText(element, multiline);

            element.dataset.atlasLiveEmpty = String(
                nextValue.length === 0
            );
            element.dataset.atlasTutorNativeDirty = 'true';
        };

        element.onblur = () => {
            try {
                const cancelled =
                    element.dataset.atlasTutorCancel === 'true';
                const startValue =
                    element.dataset.atlasTutorStartValue || '';
                const nextValue = readLiveEditableText(
                    element,
                    multiline
                );

                writeLiveEditableText(element, nextValue);

                delete element.dataset.atlasTutorStartValue;
                delete element.dataset.atlasTutorCancel;
                delete element.dataset.atlasTutorNativeDirty;

                if (cancelled || nextValue === startValue) {
                    return;
                }

                commitLiveTutorContent(fieldKey, nextValue);
            } finally {
                flushDeferredTutorContentRender();
            }
        };
    };

    updateLiveTutorContentControl = function () {
        const control = document.getElementById(
            'atlas-live-changes-control'
        );
        const count = document.getElementById(
            'atlas-live-changes-count'
        );
        const changeCount = getLiveTutorContentChangeCount();

        if (control) {
            control.hidden =
                changeCount === 0 || isAuthoring();

            control.classList.toggle(
                'is-with-minimized-author-bar',
                Boolean(
                    myVersionEditing &&
                    !myVersionAuthoringOpen
                )
            );
        }

        if (count) {
            count.textContent = changeCount === 1
                ? '1 live change'
                : `${changeCount} live changes`;
        }
    };

    function isNativeUndoTarget(target) {
        if (!(target instanceof Element)) {
            return false;
        }

        return Boolean(
            target.closest(`
                input,
                textarea,
                select,
                [contenteditable="true"],
                [contenteditable="plaintext-only"]
            `)
        );
    }

    handleLiveTutorHistoryShortcut = function (event) {
        if (
            !(event.ctrlKey || event.metaKey) ||
            event.altKey
        ) {
            return;
        }

        /*
         * While a text/control editor owns focus, native undo/redo owns
         * the shortcut for the entire focus transaction. Application
         * history resumes after the editor blurs.
         */
        if (isNativeUndoTarget(event.target)) {
            return;
        }

        const key = String(event.key || '').toLowerCase();
        const wantsUndo = key === 'z' && !event.shiftKey;
        const wantsRedo =
            (key === 'z' && event.shiftKey) ||
            (key === 'y' && !event.shiftKey);

        if (!wantsUndo && !wantsRedo) return;

        const handled = isAuthoring()
            ? (
                wantsRedo
                    ? redoMyVersionContent()
                    : undoMyVersionContent()
            )
            : (
                wantsRedo
                    ? redoLiveTutorContent()
                    : undoLiveTutorContent()
            );

        if (!handled) return;

        event.preventDefault();
        event.stopPropagation();
    };

    document.removeEventListener(
        'keydown',
        originalHandleLiveTutorHistoryShortcut,
        true
    );
    document.addEventListener(
        'keydown',
        handleLiveTutorHistoryShortcut,
        true
    );

    // ------------------------------------------------------------
    // LIVE CHANGES -> SUBJECT AUTHORING TRANSITION
    // Match the finished-subject choice instead of silently promoting
    // temporary lesson changes when the tutor expands subject tools.
    // ------------------------------------------------------------

    function liveChangesMatchDraft(overrides) {
        return Object.entries(overrides).every(
            ([fieldKey, value]) =>
                hasOwn(myVersionDraftOverrides, fieldKey) &&
                myVersionDraftOverrides[fieldKey] === value
        );
    }

    function mergeLiveChangesIntoActiveDraft() {
        const liveOverrides = cloneTutorContentOverrides(
            tutorContentLiveDraft?.overrides
        );

        if (!Object.keys(liveOverrides).length) {
            return false;
        }

        const before = createMyVersionHistorySnapshot();
        const nextOverrides = {
            ...before.overrides,
            ...liveOverrides
        };

        if (!liveChangesMatchDraft(liveOverrides)) {
            const after = createMyVersionHistorySnapshot({
                overrides: nextOverrides,
                document: before.document
            });

            recordMyVersionHistory(before, after);
            myVersionDraftOverrides = after.overrides;
            myVersionDraftDocument = after.document;
        }

        myVersionIncludesLiveChanges = true;
        myVersionIncludedLiveSessionId = currentSessionId;

        refreshMyVersionDirtyState();
        scheduleMyVersionWorkingDraftSave();

        return true;
    }

    beginMyVersionEditing = function (includeLiveChanges = false) {
        if (!myVersionEditing) {
            allowAuthoringOpenWithLiveChanges = true;

            try {
                return originalBeginMyVersionEditing(
                    includeLiveChanges
                );
            } finally {
                allowAuthoringOpenWithLiveChanges = false;
            }
        }

        if (myVersionSaving || myVersionAuthoringOpen) {
            closeMyVersionStartDialog();
            return;
        }

        if (includeLiveChanges) {
            mergeLiveChangesIntoActiveDraft();
        }

        closeMyVersionStartDialog();
        originalSetMyVersionAuthorBarMinimized(false);
        updateLiveTutorContentControl();
    };

    setMyVersionAuthorBarMinimized = function (minimized) {
        const nextMinimized = Boolean(minimized);

        if (
            !nextMinimized &&
            !allowAuthoringOpenWithLiveChanges &&
            myVersionEditing &&
            !myVersionAuthoringOpen &&
            getLiveTutorContentChangeCount() > 0
        ) {
            openMyVersionStartDialog();
            updateLiveTutorContentControl();
            return;
        }

        const result = originalSetMyVersionAuthorBarMinimized(
            nextMinimized
        );

        updateLiveTutorContentControl();
        return result;
    };

    // ------------------------------------------------------------
    // KEEP LIVE CHANGES TEMPORARY
    // Live Changes may be visible while the reusable subject continues
    // building, but they must not be materialized into the saved subject
    // or used as prompt context for later permanent generation.
    // ------------------------------------------------------------

    function withReusableSubjectReads(operation) {
        suppressLiveResolutionDepth += 1;

        try {
            return operation();
        } finally {
            suppressLiveResolutionDepth -= 1;
        }
    }

    normalizeMyVersionQuestionCollectionsForSave = function (...args) {
        return withReusableSubjectReads(() =>
            originalNormalizeMyVersionQuestionCollectionsForSave
                .apply(this, args)
        );
    };

    reusableGenerationReaders.forEach(functionName => {
        const original = window[functionName];

        if (typeof original !== 'function') return;

        window[functionName] = function (...args) {
            return withReusableSubjectReads(() =>
                original.apply(this, args)
            );
        };
    });

    installMobileLiveChangesOffset();

    if (myVersionEditing) {
        renderAllTutorContentSurfaces();
    } else {
        updateLiveTutorContentControl();
    }
})();
