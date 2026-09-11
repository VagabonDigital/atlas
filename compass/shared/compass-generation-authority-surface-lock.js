/* ============================================================
   COMPASS GENERATION AUTHORITY — SURFACE LOCK
   Keeps an unfinished tutor edit attached to the same rendered
   surface when duplicate field keys exist (for example, a card
   and its open focus view) during background rerenders.
   ============================================================ */

(function () {
    'use strict';

    let surfaceRenderDepth = 0;

    function getFieldCandidates(fieldKey) {
        return Array.from(
            document.querySelectorAll(
                '[data-atlas-tutor-field-key]'
            )
        ).filter(element =>
            element.dataset.atlasTutorFieldKey === fieldKey
        );
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

        if (anchor === null || focus === null) {
            return null;
        }

        return { anchor, focus };
    }

    function findTextPosition(element, targetOffset) {
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT
        );

        let remaining = Math.max(
            0,
            Number(targetOffset) || 0
        );

        let node = walker.nextNode();
        let lastNode = null;

        while (node) {
            lastNode = node;

            const length = node.nodeValue?.length || 0;

            if (remaining <= length) {
                return {
                    node,
                    offset: remaining
                };
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

        return {
            node: element,
            offset: 0
        };
    }

    function restoreSelectionOffsets(
        element,
        selectionSnapshot
    ) {
        if (!selectionSnapshot) return;

        const selection = window.getSelection();

        if (!selection) return;

        const anchor = findTextPosition(
            element,
            selectionSnapshot.anchor
        );

        const focus = findTextPosition(
            element,
            selectionSnapshot.focus
        );

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

    function captureDirtySurfaceEdit() {
        const element = document.activeElement;

        if (
            !element ||
            element.dataset?.atlasTutorNativeDirty !== 'true' ||
            element.getAttribute?.(
                'data-atlas-live-editable'
            ) !== 'true'
        ) {
            return null;
        }

        const fieldKey =
            element.dataset.atlasTutorFieldKey;

        if (!fieldKey) return null;

        const multiline =
            element.dataset.atlasTutorMultiline !== 'false';

        const candidates =
            getFieldCandidates(fieldKey);

        const ancestor =
            element.parentElement?.closest('[id]') || null;

        return {
            fieldKey,
            multiline,
            value: readLiveEditableText(
                element,
                multiline
            ),
            startValue:
                element.dataset.atlasTutorStartValue || '',
            cancelled:
                element.dataset.atlasTutorCancel === 'true',
            elementId:
                String(element.id || ''),
            ancestorId:
                String(ancestor?.id || ''),
            candidateIndex:
                Math.max(0, candidates.indexOf(element)),
            selection:
                captureSelectionOffsets(element)
        };
    }

    function findSnapshotElement(snapshot) {
        if (!snapshot) return null;

        if (snapshot.elementId) {
            const exact = document.getElementById(
                snapshot.elementId
            );

            if (
                exact?.dataset?.atlasTutorFieldKey ===
                    snapshot.fieldKey
            ) {
                return exact;
            }
        }

        if (snapshot.ancestorId) {
            const ancestor = document.getElementById(
                snapshot.ancestorId
            );

            const inside = ancestor
                ? Array.from(
                    ancestor.querySelectorAll(
                        '[data-atlas-tutor-field-key]'
                    )
                ).find(element =>
                    element.dataset.atlasTutorFieldKey ===
                        snapshot.fieldKey
                )
                : null;

            if (inside) return inside;
        }

        const candidates =
            getFieldCandidates(snapshot.fieldKey);

        return candidates[
            Math.min(
                snapshot.candidateIndex,
                Math.max(0, candidates.length - 1)
            )
        ] || null;
    }

    function restoreDirtySurfaceEdit(snapshot) {
        if (!snapshot) return;

        const element = findSnapshotElement(snapshot);

        if (!element) return;

        const activeElement = document.activeElement;

        if (
            activeElement &&
            activeElement !== element &&
            activeElement.dataset?.atlasTutorFieldKey ===
                snapshot.fieldKey &&
            activeElement.getAttribute?.(
                'data-atlas-live-editable'
            ) === 'true'
        ) {
            /*
             * The earlier authority layer may have focused the first
             * duplicate field. Cancel that temporary restoration before
             * returning focus to the tutor's actual surface.
             */
            activeElement.dataset.atlasTutorCancel = 'true';
        }

        writeLiveEditableText(
            element,
            snapshot.value
        );

        try {
            element.focus({ preventScroll: true });
        } catch {
            element.focus();
        }

        element.dataset.atlasTutorStartValue =
            snapshot.startValue;

        element.dataset.atlasTutorNativeDirty = 'true';

        if (snapshot.cancelled) {
            element.dataset.atlasTutorCancel = 'true';
        } else {
            delete element.dataset.atlasTutorCancel;
        }

        restoreSelectionOffsets(
            element,
            snapshot.selection
        );
    }

    function wrapSurfaceRender(renderer) {
        return function (...args) {
            const outermost =
                surfaceRenderDepth === 0;

            const snapshot = outermost
                ? captureDirtySurfaceEdit()
                : null;

            surfaceRenderDepth += 1;

            try {
                return renderer.apply(this, args);
            } finally {
                surfaceRenderDepth -= 1;

                if (outermost) {
                    restoreDirtySurfaceEdit(snapshot);
                }
            }
        };
    }

    renderAllTutorContentSurfaces = wrapSurfaceRender(
        renderAllTutorContentSurfaces
    );

    applyCoverConfig = wrapSurfaceRender(
        applyCoverConfig
    );

    applySubjectCopy = wrapSurfaceRender(
        applySubjectCopy
    );

    renderDiscussionSets = wrapSurfaceRender(
        renderDiscussionSets
    );

    renderMoments = wrapSurfaceRender(
        renderMoments
    );

    renderDiscussionFocus = wrapSurfaceRender(
        renderDiscussionFocus
    );

    renderCLGrid = wrapSurfaceRender(
        renderCLGrid
    );

    renderCulturalLensFocus = wrapSurfaceRender(
        renderCulturalLensFocus
    );

    renderReflectionQuestions = wrapSurfaceRender(
        renderReflectionQuestions
    );
})();
