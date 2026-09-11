/* ============================================================
   COMPASS GENERATION AUTHORITY
   Human actions stay authoritative while owned subjects continue
   generating in the background.

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
    const originalInsertMyVersionDiscussionSet =
        insertMyVersionDiscussionSet;
    const originalInsertMyVersionMoment =
        insertMyVersionMoment;
    const originalInsertMyVersionCulturalLensCard =
        insertMyVersionCulturalLensCard;

    let allowAuthoringOpenWithLiveChanges = false;
    let tutorRenderAuthorityDepth = 0;

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
    // Expanded subject tools edit the reusable subject.
    // Minimized subject tools edit the current lesson temporarily.
    // ------------------------------------------------------------

    resolveTutorContentValue = function (originalValue, fieldKey) {
        let value = String(originalValue ?? '');

        if (myVersionEditing) {
            if (hasOwn(myVersionDraftOverrides, fieldKey)) {
                value = String(myVersionDraftOverrides[fieldKey] ?? '');
            }

            if (
                !myVersionAuthoringOpen &&
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
         * Reuse the engine's canonical native-edit setup while bypassing
         * its old "editing session means authoring" gate. The authority-
         * sensitive handlers are replaced immediately afterwards.
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
    // DIRTY NATIVE EDIT PRESERVATION
    // Generation rerenders must not erase text or steal the caret.
    // ------------------------------------------------------------

    function getEditableLocator(element) {
        if (!element) return null;

        const elementId = String(element.id || '');
        let ancestor = element.parentElement;
        let ancestorId = '';

        while (ancestor && ancestor !== document.body) {
            if (ancestor.id) {
                ancestorId = ancestor.id;
                break;
            }
            ancestor = ancestor.parentElement;
        }

        return { elementId, ancestorId };
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
            element?.dataset?.atlasTutorFieldKey ===
                snapshot.fieldKey;

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

        return Array.from(
            document.querySelectorAll(
                '[data-atlas-tutor-field-key]'
            )
        ).find(matchesField) || null;
    }

    function restoreDirtyTutorEdit(snapshot) {
        if (!snapshot) return;

        const element = findEditableForSnapshot(snapshot);
        if (!element) return;

        writeLiveEditableText(element, snapshot.value);

        try {
            element.focus({ preventScroll: true });
        } catch {
            element.focus();
        }

        // Focus initializes a new transaction; restore the interrupted one.
        element.dataset.atlasTutorStartValue = snapshot.startValue;
        element.dataset.atlasTutorNativeDirty = 'true';

        if (snapshot.cancelled) {
            element.dataset.atlasTutorCancel = 'true';
        } else {
            delete element.dataset.atlasTutorCancel;
        }

        restoreSelectionOffsets(element, snapshot.selection);
    }

    function restoreCommittedTutorFocus(snapshot) {
        if (!snapshot) return;

        window.requestAnimationFrame(() => {
            const element = findEditableForSnapshot(snapshot);
            if (!element) return;

            try {
                element.focus({ preventScroll: true });
            } catch {
                element.focus();
            }

            restoreSelectionOffsets(element, snapshot.selection);
        });
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

    /*
     * A pristine starter can otherwise be structurally replaced while a
     * tutor is still typing into it. Commit only that threatened dirty
     * edit first, then let the normal insert logic re-check pristineness.
     * The starter will remain and the generated item will be appended.
     */
    function settleDirtyStarterEdit(matchesStarterField) {
        const snapshot = captureDirtyTutorEdit();

        if (
            !snapshot ||
            typeof matchesStarterField !== 'function' ||
            !matchesStarterField(snapshot.fieldKey)
        ) {
            return null;
        }

        const element = document.activeElement;
        if (element instanceof HTMLElement) {
            element.blur();
        }

        return snapshot;
    }

    insertMyVersionDiscussionSet = function (set, options = {}) {
        const starter = options?.replaceStarter
            ? getPristineMyVersionDiscussionStarter()
            : null;

        const momentIds = new Set(
            (starter?.moments || []).map(moment => moment.id)
        );

        const snapshot = starter
            ? settleDirtyStarterEdit(fieldKey =>
                fieldKey.startsWith(`discussion.set.${starter.id}.`) ||
                Array.from(momentIds).some(momentId =>
                    fieldKey.startsWith(`discussion.${momentId}.`) ||
                    fieldKey.startsWith(`upgrade.moment.${momentId}.`)
                )
            )
            : null;

        const result = originalInsertMyVersionDiscussionSet(
            set,
            options
        );

        restoreCommittedTutorFocus(snapshot);
        return result;
    };

    insertMyVersionMoment = function (setId, moment, options = {}) {
        const starter = options?.replaceStarter
            ? getPristineMyVersionMomentStarter(setId)
            : null;

        const snapshot = starter
            ? settleDirtyStarterEdit(fieldKey =>
                fieldKey.startsWith(`discussion.${starter.id}.`) ||
                fieldKey.startsWith(`upgrade.moment.${starter.id}.`)
            )
            : null;

        const result = originalInsertMyVersionMoment(
            setId,
            moment,
            options
        );

        restoreCommittedTutorFocus(snapshot);
        return result;
    };

    insertMyVersionCulturalLensCard = function (card, options = {}) {
        const starter = options?.replaceStarter
            ? getPristineMyVersionCulturalLensStarter()
            : null;

        const snapshot = starter
            ? settleDirtyStarterEdit(fieldKey =>
                fieldKey.startsWith(`culturalLens.${starter.id}.`) ||
                fieldKey.startsWith(
                    `upgrade.cultural-lens.${starter.id}.`
                )
            )
            : null;

        const result = originalInsertMyVersionCulturalLensCard(
            card,
            options
        );

        restoreCommittedTutorFocus(snapshot);
        return result;
    };

    // ------------------------------------------------------------
    // GENERATION AUTHORITY
    // During the automatic full build, an existing tutor override is
    // already authoritative even if it predates the current AI request.
    // For explicit manual regeneration, only edits made while the request
    // is in flight are protected; the user's regenerate action may replace
    // the section they explicitly asked Atlas to regenerate.
    // ------------------------------------------------------------

    function overrideChangedSince(
        startingOverrides,
        currentOverrides,
        fieldKey
    ) {
        const existedAtStart = hasOwn(startingOverrides, fieldKey);
        const existsNow = hasOwn(currentOverrides, fieldKey);

        if (existedAtStart !== existsNow) return true;

        return (
            existsNow &&
            currentOverrides[fieldKey] !==
                startingOverrides[fieldKey]
        );
    }

    function fieldIsHumanAuthoritative(
        startingOverrides,
        currentOverrides,
        fieldKey
    ) {
        return (
            overrideChangedSince(
                startingOverrides,
                currentOverrides,
                fieldKey
            ) ||
            (
                myVersionGeneratingFullSubject &&
                hasOwn(startingOverrides, fieldKey)
            )
        );
    }

    function prefixIsHumanAuthoritative(
        startingOverrides,
        currentOverrides,
        prefix
    ) {
        const keys = new Set([
            ...Object.keys(startingOverrides || {}),
            ...Object.keys(currentOverrides || {})
        ]);

        for (const fieldKey of keys) {
            if (!fieldKey.startsWith(prefix)) continue;

            if (
                fieldIsHumanAuthoritative(
                    startingOverrides,
                    currentOverrides,
                    fieldKey
                )
            ) {
                return true;
            }
        }

        return false;
    }

    function clearOverridePrefix(overrides, prefix) {
        Object.keys(overrides).forEach(fieldKey => {
            if (fieldKey.startsWith(prefix)) {
                delete overrides[fieldKey];
            }
        });
    }

    function jsonMatches(left, right) {
        try {
            return JSON.stringify(left) === JSON.stringify(right);
        } catch {
            return false;
        }
    }

    function canGenerateOwnedSubject() {
        return Boolean(
            myVersionEditing &&
            !myVersionSaving &&
            isOwnedSubjectRuntime()
        );
    }

    generateMyVersionSubjectFraming = async function (brief = '') {
        if (!canGenerateOwnedSubject()) return null;

        const startingOverrides = cloneTutorContentOverrides(
            myVersionDraftOverrides
        );

        const generated = await requireAtlasAI()
            .generateSubjectFraming({
                subject: {
                    title: getEffectiveSubjectTitle()
                },
                brief: String(brief || '').trim()
            });

        return commitMyVersionDocumentMutation(
            (document, overrides) => {
                if (
                    !document.module ||
                    typeof document.module !== 'object' ||
                    Array.isArray(document.module) ||
                    !document.subjectCopy ||
                    typeof document.subjectCopy !== 'object' ||
                    Array.isArray(document.subjectCopy)
                ) {
                    return null;
                }

                document.subjectCopy.cover =
                    document.subjectCopy.cover &&
                    typeof document.subjectCopy.cover === 'object' &&
                    !Array.isArray(document.subjectCopy.cover)
                        ? document.subjectCopy.cover
                        : {};

                if (
                    !fieldIsHumanAuthoritative(
                        startingOverrides,
                        overrides,
                        'module.catalogDescription'
                    )
                ) {
                    document.module.catalogDescription =
                        generated.catalogDescription;
                    delete overrides['module.catalogDescription'];
                }

                if (
                    !fieldIsHumanAuthoritative(
                        startingOverrides,
                        overrides,
                        'cover.hook'
                    )
                ) {
                    document.subjectCopy.cover.hook = generated.hook;
                    delete overrides['cover.hook'];
                }

                return {
                    catalogDescription: generated.catalogDescription,
                    hook: generated.hook
                };
            }
        );
    };

    generateMyVersionOverview = async function (brief = '') {
        if (!canGenerateOwnedSubject()) return null;

        const startingOverrides = cloneTutorContentOverrides(
            myVersionDraftOverrides
        );
        const generated = await requireAtlasAI().generateOverview({
            subject: {
                title: getEffectiveSubjectTitle(),
                description: getEffectiveSubjectCatalogDescription(),
                hook: resolveTutorContentValue(
                    subjectCopy.cover?.hook || '',
                    'cover.hook'
                ).trim()
            },
            brief: String(brief || '').trim()
        });

        return commitMyVersionDocumentMutation(
            (document, overrides) => {
                if (
                    !document.subjectCopy ||
                    typeof document.subjectCopy !== 'object' ||
                    Array.isArray(document.subjectCopy)
                ) {
                    return null;
                }

                document.subjectCopy.overview =
                    document.subjectCopy.overview &&
                    typeof document.subjectCopy.overview === 'object' &&
                    !Array.isArray(document.subjectCopy.overview)
                        ? document.subjectCopy.overview
                        : {};

                if (
                    !fieldIsHumanAuthoritative(
                        startingOverrides,
                        overrides,
                        'overview.heading'
                    )
                ) {
                    document.subjectCopy.overview.heading =
                        generated.heading;
                    delete overrides['overview.heading'];
                }

                if (
                    !prefixIsHumanAuthoritative(
                        startingOverrides,
                        overrides,
                        'overview.intro.'
                    )
                ) {
                    document.subjectCopy.overview.intro = [generated.intro];
                    clearOverridePrefix(overrides, 'overview.intro.');
                }

                if (
                    !fieldIsHumanAuthoritative(
                        startingOverrides,
                        overrides,
                        'overview.question'
                    )
                ) {
                    document.subjectCopy.overview.question =
                        generated.question;
                    delete overrides['overview.question'];
                }

                return {
                    heading: generated.heading,
                    intro: generated.intro,
                    question: generated.question
                };
            }
        );
    };

    function getOverviewGenerationContext() {
        const overview = subjectCopy.overview || {};
        const intro = Array.isArray(overview.intro)
            ? overview.intro
                .map((paragraph, index) =>
                    resolveTutorContentValue(
                        paragraph,
                        `overview.intro.${index}`
                    ).trim()
                )
                .filter(Boolean)
                .join('\n\n')
            : '';

        return {
            overview,
            intro
        };
    }

    generateMyVersionDiscussionFraming = async function (brief = '') {
        if (!canGenerateOwnedSubject()) return null;

        const startingOverrides = cloneTutorContentOverrides(
            myVersionDraftOverrides
        );
        const { overview, intro } = getOverviewGenerationContext();
        const generated = await requireAtlasAI()
            .generateDiscussionFraming({
                subject: {
                    title: getEffectiveSubjectTitle(),
                    description: getEffectiveSubjectCatalogDescription(),
                    hook: resolveTutorContentValue(
                        subjectCopy.cover?.hook || '',
                        'cover.hook'
                    ).trim()
                },
                overview: {
                    heading: resolveTutorContentValue(
                        overview.heading || '',
                        'overview.heading'
                    ).trim(),
                    intro,
                    question: resolveTutorContentValue(
                        overview.question || '',
                        'overview.question'
                    ).trim()
                },
                brief: String(brief || '').trim()
            });

        return commitMyVersionDocumentMutation(
            (document, overrides) => {
                if (
                    !document.subjectCopy ||
                    typeof document.subjectCopy !== 'object' ||
                    Array.isArray(document.subjectCopy)
                ) {
                    return null;
                }

                document.subjectCopy.discussion =
                    document.subjectCopy.discussion &&
                    typeof document.subjectCopy.discussion === 'object' &&
                    !Array.isArray(document.subjectCopy.discussion)
                        ? document.subjectCopy.discussion
                        : {};
                document.subjectCopy.paths =
                    document.subjectCopy.paths &&
                    typeof document.subjectCopy.paths === 'object' &&
                    !Array.isArray(document.subjectCopy.paths)
                        ? document.subjectCopy.paths
                        : {};

                if (
                    !fieldIsHumanAuthoritative(
                        startingOverrides,
                        overrides,
                        'discussion.heading'
                    )
                ) {
                    document.subjectCopy.discussion.heading =
                        generated.heading;
                    delete overrides['discussion.heading'];
                }

                if (
                    !fieldIsHumanAuthoritative(
                        startingOverrides,
                        overrides,
                        'discussion.intro'
                    )
                ) {
                    document.subjectCopy.discussion.intro =
                        generated.intro;
                    delete overrides['discussion.intro'];
                }

                if (
                    !fieldIsHumanAuthoritative(
                        startingOverrides,
                        overrides,
                        'paths.discussionDescription'
                    )
                ) {
                    document.subjectCopy.paths.discussionDescription =
                        generated.pathDescription;
                    delete overrides['paths.discussionDescription'];
                }

                return {
                    heading: generated.heading,
                    intro: generated.intro,
                    pathDescription: generated.pathDescription
                };
            }
        );
    };

    generateMyVersionCulturalLensFraming = async function (brief = '') {
        if (!canGenerateOwnedSubject()) return null;

        const startingOverrides = cloneTutorContentOverrides(
            myVersionDraftOverrides
        );
        const { overview, intro } = getOverviewGenerationContext();
        const generated = await requireAtlasAI()
            .generateCulturalLensFraming({
                subject: {
                    title: getEffectiveSubjectTitle(),
                    description: getEffectiveSubjectCatalogDescription(),
                    hook: resolveTutorContentValue(
                        subjectCopy.cover?.hook || '',
                        'cover.hook'
                    ).trim()
                },
                overview: {
                    heading: resolveTutorContentValue(
                        overview.heading || '',
                        'overview.heading'
                    ).trim(),
                    intro,
                    question: resolveTutorContentValue(
                        overview.question || '',
                        'overview.question'
                    ).trim()
                },
                brief: String(brief || '').trim()
            });

        return commitMyVersionDocumentMutation(
            (document, overrides) => {
                if (
                    !document.subjectCopy ||
                    typeof document.subjectCopy !== 'object' ||
                    Array.isArray(document.subjectCopy)
                ) {
                    return null;
                }

                document.subjectCopy.culturalLens =
                    document.subjectCopy.culturalLens &&
                    typeof document.subjectCopy.culturalLens === 'object' &&
                    !Array.isArray(document.subjectCopy.culturalLens)
                        ? document.subjectCopy.culturalLens
                        : {};
                document.subjectCopy.paths =
                    document.subjectCopy.paths &&
                    typeof document.subjectCopy.paths === 'object' &&
                    !Array.isArray(document.subjectCopy.paths)
                        ? document.subjectCopy.paths
                        : {};

                if (
                    !fieldIsHumanAuthoritative(
                        startingOverrides,
                        overrides,
                        'culturalLens.heading'
                    )
                ) {
                    document.subjectCopy.culturalLens.heading =
                        generated.heading;
                    delete overrides['culturalLens.heading'];
                }

                if (
                    !fieldIsHumanAuthoritative(
                        startingOverrides,
                        overrides,
                        'culturalLens.intro'
                    )
                ) {
                    document.subjectCopy.culturalLens.intro =
                        generated.intro;
                    delete overrides['culturalLens.intro'];
                }

                if (
                    !fieldIsHumanAuthoritative(
                        startingOverrides,
                        overrides,
                        'paths.culturalLensDescription'
                    )
                ) {
                    document.subjectCopy.paths.culturalLensDescription =
                        generated.pathDescription;
                    delete overrides['paths.culturalLensDescription'];
                }

                return {
                    heading: generated.heading,
                    intro: generated.intro,
                    pathDescription: generated.pathDescription
                };
            }
        );
    };

    generateMyVersionReflection = async function (brief = '') {
        if (!canGenerateOwnedSubject()) return null;

        const startingOverrides = cloneTutorContentOverrides(
            myVersionDraftOverrides
        );
        const startingQuestions = cloneTutorSubjectDocument(
            myVersionDraftDocument
                ?.subjectCopy
                ?.reflection
                ?.questions ||
            subjectCopy.reflection?.questions ||
            []
        ) || [];
        const originalQuestions = cloneTutorSubjectDocument(
            myVersionOriginalDocument
                ?.subjectCopy
                ?.reflection
                ?.questions ||
            []
        ) || [];
        const startingStructureIsHuman = Boolean(
            myVersionGeneratingFullSubject &&
            !jsonMatches(startingQuestions, originalQuestions)
        );

        const overview = subjectCopy.overview || {};
        const discussion = subjectCopy.discussion || {};
        const culturalLens = subjectCopy.culturalLens || {};
        const { intro: overviewIntro } = getOverviewGenerationContext();

        const starterSet = getPristineMyVersionDiscussionStarter();
        const existingSets = discussionSets
            .map(set => materializeMyVersionDiscussionSet(set))
            .filter(Boolean)
            .filter(set => !starterSet || set.id !== starterSet.id)
            .map(set => ({
                title: String(set.title || '').trim(),
                stage: String(set.stage || '').trim(),
                description: String(set.description || '').trim(),
                moments: Array.isArray(set.moments)
                    ? set.moments.map(moment => ({
                        preview: String(moment.preview || '').trim(),
                        question: String(moment.question || '').trim()
                    }))
                    : []
            }));

        const starterCard = getPristineMyVersionCulturalLensStarter();
        const existingCards = clCards
            .map(card => materializeMyVersionCulturalLensCard(card))
            .filter(Boolean)
            .filter(card => !starterCard || card.id !== starterCard.id)
            .map(card => ({
                title: String(card.title || '').trim(),
                contextLine: String(card.contextLine || '').trim(),
                teaser: String(card.teaser || '').trim(),
                questions: Array.isArray(card.questions)
                    ? card.questions
                        .map(question => String(question || '').trim())
                        .filter(Boolean)
                    : []
            }));

        const generated = await requireAtlasAI().generateReflection({
            subject: {
                title: getEffectiveSubjectTitle(),
                description: getEffectiveSubjectCatalogDescription(),
                hook: resolveTutorContentValue(
                    subjectCopy.cover?.hook || '',
                    'cover.hook'
                ).trim()
            },
            overview: {
                heading: resolveTutorContentValue(
                    overview.heading || '',
                    'overview.heading'
                ).trim(),
                intro: overviewIntro,
                question: resolveTutorContentValue(
                    overview.question || '',
                    'overview.question'
                ).trim()
            },
            discussion: {
                heading: resolveTutorContentValue(
                    discussion.heading || '',
                    'discussion.heading'
                ).trim(),
                intro: resolveTutorContentValue(
                    discussion.intro || '',
                    'discussion.intro'
                ).trim(),
                sets: existingSets
            },
            culturalLens: {
                heading: resolveTutorContentValue(
                    culturalLens.heading || '',
                    'culturalLens.heading'
                ).trim(),
                intro: resolveTutorContentValue(
                    culturalLens.intro || '',
                    'culturalLens.intro'
                ).trim(),
                cards: existingCards
            },
            brief: String(brief || '').trim()
        });

        return commitMyVersionDocumentMutation(
            (document, overrides) => {
                if (
                    !document.subjectCopy ||
                    typeof document.subjectCopy !== 'object' ||
                    Array.isArray(document.subjectCopy)
                ) {
                    return null;
                }

                document.subjectCopy.reflection =
                    document.subjectCopy.reflection &&
                    typeof document.subjectCopy.reflection === 'object' &&
                    !Array.isArray(document.subjectCopy.reflection)
                        ? document.subjectCopy.reflection
                        : {};
                document.subjectCopy.paths =
                    document.subjectCopy.paths &&
                    typeof document.subjectCopy.paths === 'object' &&
                    !Array.isArray(document.subjectCopy.paths)
                        ? document.subjectCopy.paths
                        : {};

                if (
                    !fieldIsHumanAuthoritative(
                        startingOverrides,
                        overrides,
                        'reflection.title'
                    )
                ) {
                    document.subjectCopy.reflection.title = generated.title;
                    delete overrides['reflection.title'];
                }

                if (
                    !fieldIsHumanAuthoritative(
                        startingOverrides,
                        overrides,
                        'reflection.summary'
                    )
                ) {
                    document.subjectCopy.reflection.summary =
                        generated.summary;
                    delete overrides['reflection.summary'];
                }

                const currentQuestions = cloneTutorSubjectDocument(
                    document.subjectCopy.reflection.questions || []
                ) || [];
                const questionsAreHumanAuthoritative =
                    startingStructureIsHuman ||
                    prefixIsHumanAuthoritative(
                        startingOverrides,
                        overrides,
                        'reflection.questions.'
                    ) ||
                    !jsonMatches(startingQuestions, currentQuestions);

                if (!questionsAreHumanAuthoritative) {
                    document.subjectCopy.reflection.questions =
                        generated.questions.slice();
                    clearOverridePrefix(
                        overrides,
                        'reflection.questions.'
                    );
                }

                if (
                    !fieldIsHumanAuthoritative(
                        startingOverrides,
                        overrides,
                        'paths.reflectionDescription'
                    )
                ) {
                    document.subjectCopy.paths.reflectionDescription =
                        generated.pathDescription;
                    delete overrides['paths.reflectionDescription'];
                }

                return {
                    title: generated.title,
                    summary: generated.summary,
                    questions: generated.questions.slice(),
                    pathDescription: generated.pathDescription
                };
            }
        );
    };

    installMobileLiveChangesOffset();

    if (myVersionEditing) {
        renderAllTutorContentSurfaces();
    } else {
        updateLiveTutorContentControl();
    }
})();
