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
    let tutorRenderAuthorityDepth = 0;
    let suppressLiveResolutionDepth = 0;

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
            return originalConfigureLiveTutorContentElement(
                element,
                options
            );
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

    handleLiveTutorHistoryShortcut = function (event) {
        if (
            !(event.ctrlKey || event.metaKey) ||
            event.altKey
        ) {
            return;
        }

        const liveTarget = event.target instanceof Element
            ? event.target.closest('[data-atlas-live-editable="true"]')
            : null;

        if (liveTarget?.dataset.atlasTutorNativeDirty === 'true') {
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
    // DIRTY EDIT PRESERVATION
    // A background render may rebuild the element before blur. Preserve
    // the unfinished text, focus and caret on the same rendered surface.
    // ------------------------------------------------------------

    function getFieldCandidates(fieldKey) {
        return Array.from(
            document.querySelectorAll(
                '[data-atlas-tutor-field-key]'
            )
        ).filter(element =>
            element.dataset.atlasTutorFieldKey === fieldKey
        );
    }

    function getEditableLocator(element) {
        if (!element) return null;

        const elementId = String(element.id || '');
        const fieldKey = element.dataset?.atlasTutorFieldKey || '';
        const candidates = fieldKey
            ? getFieldCandidates(fieldKey)
            : [];
        let ancestor = element.parentElement;
        let ancestorId = '';

        while (ancestor && ancestor !== document.body) {
            if (ancestor.id) {
                ancestorId = ancestor.id;
                break;
            }
            ancestor = ancestor.parentElement;
        }

        return {
            elementId,
            ancestorId,
            candidateIndex: Math.max(0, candidates.indexOf(element))
        };
    }

    function captureSelectionOffsets(element) {
        const selection = window.getSelection();

        if (
            !selection ||
            !selection.rangeCount ||
            !selection.anchorNode ||
            !selection.focusNode ||
            !element.contains(selection.anchorNode) ||
            !element.contains(selection.focusNode)
        ) {
            return null;
        }

        function getOffset(node, offset) {
            const range = document.createRange();
            range.selectNodeContents(element);

            try {
                range.setEnd(node, offset);
                return range.toString().length;
            } catch {
                return null;
            }
        }

        const anchor = getOffset(
            selection.anchorNode,
            selection.anchorOffset
        );
        const focus = getOffset(
            selection.focusNode,
            selection.focusOffset
        );

        if (anchor === null || focus === null) return null;
        return { anchor, focus };
    }

    function findTextPosition(element, targetOffset) {
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT
        );
        let remaining = Math.max(0, Number(targetOffset) || 0);
        let node = walker.nextNode();
        let lastNode = null;

        while (node) {
            lastNode = node;
            const length = node.nodeValue?.length || 0;

            if (remaining <= length) {
                return { node, offset: remaining };
            }

            remaining -= length;
            node = walker.nextNode();
        }

        if (lastNode) {
            return {
                node: lastNode,
                offset: lastNode.nodeValue?.length || 0
            };
        }

        return { node: element, offset: 0 };
    }

    function restoreSelectionOffsets(element, snapshot) {
        if (!snapshot) return;

        const selection = window.getSelection();
        if (!selection) return;

        const anchor = findTextPosition(element, snapshot.anchor);
        const focus = findTextPosition(element, snapshot.focus);

        try {
            selection.setBaseAndExtent(
                anchor.node,
                anchor.offset,
                focus.node,
                focus.offset
            );
        } catch {
            const range = document.createRange();
            range.setStart(anchor.node, anchor.offset);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    function captureDirtyTutorEdit() {
        const element = document.activeElement;

        if (
            !element ||
            element.dataset?.atlasTutorNativeDirty !== 'true' ||
            element.getAttribute?.('data-atlas-live-editable') !== 'true'
        ) {
            return null;
        }

        const fieldKey = element.dataset.atlasTutorFieldKey;
        if (!fieldKey) return null;

        const multiline =
            element.dataset.atlasTutorMultiline !== 'false';

        return {
            fieldKey,
            multiline,
            locator: getEditableLocator(element),
            value: readLiveEditableText(element, multiline),
            startValue:
                element.dataset.atlasTutorStartValue || '',
            cancelled:
                element.dataset.atlasTutorCancel === 'true',
            selection: captureSelectionOffsets(element)
        };
    }

    function findEditableForSnapshot(snapshot) {
        if (!snapshot) return null;

        const matchesField = element =>
            element?.dataset?.atlasTutorFieldKey === snapshot.fieldKey;

        if (snapshot.locator?.elementId) {
            const exact = document.getElementById(
                snapshot.locator.elementId
            );
            if (matchesField(exact)) return exact;
        }

        if (snapshot.locator?.ancestorId) {
            const root = document.getElementById(
                snapshot.locator.ancestorId
            );
            const scoped = root
                ? Array.from(
                    root.querySelectorAll(
                        '[data-atlas-tutor-field-key]'
                    )
                ).find(matchesField)
                : null;
            if (scoped) return scoped;
        }

        const candidates = getFieldCandidates(snapshot.fieldKey);
        const candidateIndex = Math.min(
            snapshot.locator?.candidateIndex || 0,
            Math.max(0, candidates.length - 1)
        );

        return candidates[candidateIndex] || null;
    }

    function restoreDirtyTutorEdit(snapshot) {
        if (!snapshot) return;

        const element = findEditableForSnapshot(snapshot);
        if (!element) return;

        const activeElement = document.activeElement;

        if (
            activeElement &&
            activeElement !== element &&
            activeElement.dataset?.atlasTutorFieldKey === snapshot.fieldKey &&
            activeElement.getAttribute?.('data-atlas-live-editable') === 'true'
        ) {
            activeElement.dataset.atlasTutorCancel = 'true';
        }

        writeLiveEditableText(element, snapshot.value);

        try {
            element.focus({ preventScroll: true });
        } catch {
            element.focus();
        }

        // Focus creates a new transaction; restore the interrupted one.
        element.dataset.atlasTutorStartValue = snapshot.startValue;
        element.dataset.atlasTutorNativeDirty = 'true';

        if (snapshot.cancelled) {
            element.dataset.atlasTutorCancel = 'true';
        } else {
            delete element.dataset.atlasTutorCancel;
        }

        restoreSelectionOffsets(element, snapshot.selection);
    }

    function wrapTutorRender(renderer) {
        return function (...args) {
            const outermost = tutorRenderAuthorityDepth === 0;
            const snapshot = outermost
                ? captureDirtyTutorEdit()
                : null;

            tutorRenderAuthorityDepth += 1;

            try {
                return renderer.apply(this, args);
            } finally {
                tutorRenderAuthorityDepth -= 1;

                if (outermost) {
                    restoreDirtyTutorEdit(snapshot);
                }
            }
        };
    }

    renderAllTutorContentSurfaces = wrapTutorRender(
        renderAllTutorContentSurfaces
    );
    applyCoverConfig = wrapTutorRender(applyCoverConfig);
    applySubjectCopy = wrapTutorRender(applySubjectCopy);
    renderDiscussionSets = wrapTutorRender(renderDiscussionSets);
    renderMoments = wrapTutorRender(renderMoments);
    renderDiscussionFocus = wrapTutorRender(renderDiscussionFocus);
    renderCLGrid = wrapTutorRender(renderCLGrid);
    renderCulturalLensFocus = wrapTutorRender(
        renderCulturalLensFocus
    );
    renderReflectionQuestions = wrapTutorRender(
        renderReflectionQuestions
    );

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
