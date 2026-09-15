/* ============================================================
   COMPASS BUILD PRESENTATION
   Keeps Atlas-built subjects honest while their core teaching
   environment is still taking shape.

   Start blank keeps the canonical authoring prompts unchanged.
   This layer changes presentation only; it never mutates the
   Structured Subject starter document used for manual authoring.
   ============================================================ */

(function () {
    'use strict';

    const requestedAtLaunch =
        window.AtlasSubjectBuildPresentationRequested === true;

    let buildPresentationRequested = requestedAtLaunch;
    let buildPresentationActive = requestedAtLaunch;
    let buildStateCheckToken = 0;

    const originalRenderAllTutorContentSurfaces =
        window.renderAllTutorContentSurfaces;
    const originalApplySubjectCopy =
        window.applySubjectCopy;
    const originalApplyDerivedLabels =
        window.applyDerivedLabels;
    const originalRenderDiscussionSets =
        window.renderDiscussionSets;
    const originalRenderCLGrid =
        window.renderCLGrid;
    const originalRenderReflectionQuestions =
        window.renderReflectionQuestions;
    const originalUpdateReflectionCompleteState =
        window.updateReflectionCompleteState;
    const originalGoToView =
        window.goToView;
    const originalGenerateMyVersionFullSubject =
        window.generateMyVersionFullSubject;

    function isOwnedSubject() {
        return Boolean(
            window.AtlasCompassSubjectRuntime?.source === 'owned' &&
            String(window.MODULE?.id || '').trim()
        );
    }

    function getBlankTemplate() {
        const Structured = window.AtlasStructuredSubject;

        if (
            !Structured ||
            typeof Structured.createBlankDocument !== 'function'
        ) {
            return null;
        }

        return Structured.createBlankDocument({
            title: 'Atlas subject'
        });
    }

    const blankTemplate = getBlankTemplate();

    function clean(value) {
        return String(value ?? '').trim();
    }

    function sameStrings(left, right) {
        return clean(left) === clean(right);
    }

    function sameStringArray(left, right) {
        const first = Array.isArray(left) ? left : [];
        const second = Array.isArray(right) ? right : [];

        return first.length === second.length &&
            first.every((value, index) =>
                sameStrings(value, second[index])
            );
    }

    function isOverviewPending() {
        if (!buildPresentationActive || !blankTemplate) {
            return false;
        }

        const current = window.subjectCopy?.overview || {};
        const blank = blankTemplate.subjectCopy?.overview || {};

        return sameStrings(current.heading, blank.heading) &&
            sameStringArray(current.intro, blank.intro) &&
            sameStrings(current.question, blank.question);
    }

    function isDiscussionFramingPending() {
        if (!buildPresentationActive || !blankTemplate) {
            return false;
        }

        const current = window.subjectCopy || {};
        const blank = blankTemplate.subjectCopy || {};

        return sameStrings(
                current.discussion?.heading,
                blank.discussion?.heading
            ) &&
            sameStrings(
                current.discussion?.intro,
                blank.discussion?.intro
            ) &&
            sameStrings(
                current.paths?.discussionDescription,
                blank.paths?.discussionDescription
            );
    }

    function isCulturalLensFramingPending() {
        if (!buildPresentationActive || !blankTemplate) {
            return false;
        }

        const current = window.subjectCopy || {};
        const blank = blankTemplate.subjectCopy || {};

        return sameStrings(
                current.culturalLens?.heading,
                blank.culturalLens?.heading
            ) &&
            sameStrings(
                current.culturalLens?.intro,
                blank.culturalLens?.intro
            ) &&
            sameStrings(
                current.paths?.culturalLensDescription,
                blank.paths?.culturalLensDescription
            );
    }

    function isReflectionPending() {
        if (!buildPresentationActive || !blankTemplate) {
            return false;
        }

        const current = window.subjectCopy || {};
        const blank = blankTemplate.subjectCopy || {};

        return sameStrings(
                current.reflection?.title,
                blank.reflection?.title
            ) &&
            sameStrings(
                current.reflection?.summary,
                blank.reflection?.summary
            ) &&
            sameStringArray(
                current.reflection?.questions,
                blank.reflection?.questions
            ) &&
            sameStrings(
                current.paths?.reflectionDescription,
                blank.paths?.reflectionDescription
            );
    }

    function getPendingDiscussionStarter() {
        if (
            !buildPresentationActive ||
            typeof window.getPristineMyVersionDiscussionStarter !==
                'function'
        ) {
            return null;
        }

        try {
            return window.getPristineMyVersionDiscussionStarter();
        } catch {
            return null;
        }
    }

    function getPendingCulturalLensStarter() {
        if (
            !buildPresentationActive ||
            typeof window.getPristineMyVersionCulturalLensStarter !==
                'function'
        ) {
            return null;
        }

        try {
            return window.getPristineMyVersionCulturalLensStarter();
        } catch {
            return null;
        }
    }

    function disableEditable(element) {
        if (!element) return;

        if (
            typeof window.disableLiveTutorContentElement ===
                'function'
        ) {
            window.disableLiveTutorContentElement(element);
        } else {
            element.removeAttribute('contenteditable');
        }
    }

    function setPendingText(id, text) {
        const element = document.getElementById(id);
        if (!element) return;

        element.hidden = false;
        element.textContent = text;
        disableEditable(element);
    }

    function hidePendingField(id) {
        const element = document.getElementById(id);
        if (!element) return;

        element.hidden = true;
        element.textContent = '';
        disableEditable(element);
    }

    function applyOverviewPresentation() {
        if (isOverviewPending()) {
            setPendingText(
                'overview-heading',
                'Setting the scene…'
            );

            const intro = document.getElementById(
                'overview-intro'
            );

            if (intro) {
                intro.hidden = false;
                intro.innerHTML =
                    '<p>Shaping the opening for this subject.</p>';
            }

            hidePendingField('overview-question');
        }

        if (isDiscussionFramingPending()) {
            setPendingText(
                'path-desc-disc',
                'Building the conversation…'
            );
        }

        if (isCulturalLensFramingPending()) {
            setPendingText(
                'path-desc-cl',
                'Gathering perspectives and examples…'
            );
        }

        if (isReflectionPending()) {
            setPendingText(
                'reflection-path-desc',
                'Bringing the subject together…'
            );
        }

        if (getPendingDiscussionStarter()) {
            setPendingText(
                'path-label-disc',
                'Taking shape'
            );
        }

        if (getPendingCulturalLensStarter()) {
            setPendingText(
                'path-label-cl',
                'Taking shape'
            );
        }
    }

    function makeCardPending(card) {
        if (!card) return;

        card.classList.add('atlas-build-pending-card');
        card.removeAttribute('tabindex');
        card.setAttribute('aria-disabled', 'true');
        card.onclick = null;
        card.onkeydown = null;

        card.querySelectorAll('button').forEach(button => {
            button.disabled = true;
            button.setAttribute('tabindex', '-1');
        });
    }

    function applyDiscussionPresentation() {
        if (isDiscussionFramingPending()) {
            setPendingText(
                'discussion-section-heading',
                'Discussion'
            );
            setPendingText(
                'discussion-section-intro',
                'Building the conversation…'
            );
        }

        const starter = getPendingDiscussionStarter();
        if (!starter?.id) return;

        const card = document.querySelector(
            `.set-card[data-set-id="${CSS.escape(starter.id)}"]`
        );

        if (!card) return;

        makeCardPending(card);
        card.setAttribute(
            'aria-label',
            'Discussion taking shape'
        );

        const stage = card.querySelector('.set-stage');
        const title = card.querySelector('.set-title');
        const description = card.querySelector('.set-desc');

        if (stage) {
            stage.textContent = 'Discussion';
            disableEditable(stage);
        }

        if (title) {
            title.textContent = 'Taking shape…';
            disableEditable(title);
        }

        if (description) {
            description.textContent =
                'Finding the first angle for the conversation.';
            disableEditable(description);
        }
    }

    function applyCulturalLensPresentation() {
        if (isCulturalLensFramingPending()) {
            setPendingText(
                'cl-section-heading',
                'Cultural Lens'
            );
            setPendingText(
                'cl-section-intro',
                'Gathering perspectives, examples and stories…'
            );
        }

        const starter = getPendingCulturalLensStarter();
        if (!starter?.id) return;

        const card = document.getElementById(
            `cl-card-${starter.id}`
        );

        if (!card) return;

        makeCardPending(card);
        card.setAttribute(
            'aria-label',
            'Cultural Lens taking shape'
        );

        const title = card.querySelector('.cl-card-title');

        if (title) {
            title.textContent = 'Finding the first lens…';
            disableEditable(title);
        }

        card.querySelectorAll(
            '.cl-card-location, .cl-card-teaser'
        ).forEach(element => {
            element.hidden = true;
            disableEditable(element);
        });
    }

    function applyReflectionPresentation() {
        if (!isReflectionPending()) return;

        setPendingText(
            'reflection-title',
            'Bringing the ideas together…'
        );
        setPendingText(
            'reflection-summary',
            'The final reflection is taking shape.'
        );

        const questions = document.getElementById(
            'reflection-questions'
        );

        if (questions) {
            questions.hidden = true;
            questions.innerHTML = '';
        }

        const completeButton = document.getElementById(
            'complete-lesson-btn'
        );

        if (completeButton) {
            completeButton.disabled = true;
            completeButton.setAttribute(
                'aria-disabled',
                'true'
            );
        }
    }

    function applyPendingBuildPresentation() {
        if (
            !buildPresentationActive ||
            !isOwnedSubject()
        ) {
            return;
        }

        applyOverviewPresentation();
        applyDiscussionPresentation();
        applyCulturalLensPresentation();
        applyReflectionPresentation();
    }

    function installStyle() {
        if (document.getElementById('atlas-build-presentation-style')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'atlas-build-presentation-style';
        style.textContent = `
            .atlas-build-pending-card {
                cursor: default !important;
            }

            .atlas-build-pending-card:hover {
                transform: none !important;
            }

            .atlas-build-pending-card .set-title,
            .atlas-build-pending-card .cl-card-title {
                color: var(--text-muted);
            }
        `;

        document.head.appendChild(style);
    }

    function wrapRenderer(name, afterRender = applyPendingBuildPresentation) {
        const original = window[name];
        if (typeof original !== 'function') return;

        window[name] = function (...args) {
            const result = original.apply(this, args);
            afterRender();
            return result;
        };
    }

    function renderCanonicalSurfaces() {
        if (
            typeof window.renderAllTutorContentSurfaces !==
                'function'
        ) {
            return;
        }

        window.renderAllTutorContentSurfaces();
    }

    async function readFullSubjectBuildState() {
        if (!isOwnedSubject()) return null;

        const Subjects = window.AtlasTutorSubjects;

        if (
            !Subjects ||
            typeof Subjects.getBuildState !== 'function'
        ) {
            return null;
        }

        try {
            const state = await Subjects.getBuildState(
                window.MODULE.id
            );

            return state?.kind === 'full-subject'
                ? state
                : null;
        } catch {
            return null;
        }
    }

    async function syncBuildPresentationState({
        preserveRequest = false
    } = {}) {
        const token = ++buildStateCheckToken;
        const state = await readFullSubjectBuildState();

        if (token !== buildStateCheckToken) {
            return;
        }

        const nextActive = Boolean(
            state ||
            (preserveRequest && buildPresentationRequested) ||
            (
                typeof myVersionGeneratingFullSubject !== 'undefined' &&
                myVersionGeneratingFullSubject
            )
        );

        if (nextActive === buildPresentationActive) {
            if (nextActive) {
                applyPendingBuildPresentation();
            }
            return;
        }

        buildPresentationActive = nextActive;
        renderCanonicalSurfaces();
    }

    function installFullSubjectBuildHook() {
        if (
            typeof originalGenerateMyVersionFullSubject !==
                'function'
        ) {
            return;
        }

        window.generateMyVersionFullSubject = async function (...args) {
            buildPresentationRequested = false;
            buildPresentationActive = true;
            renderCanonicalSurfaces();

            let result = null;

            try {
                result = await originalGenerateMyVersionFullSubject
                    .apply(this, args);

                return result;
            } finally {
                if (result === true) {
                    buildPresentationActive = false;
                    renderCanonicalSurfaces();
                } else {
                    await syncBuildPresentationState();
                }
            }
        };
    }

    installStyle();

    wrapRenderer('renderAllTutorContentSurfaces');
    wrapRenderer('applySubjectCopy');
    wrapRenderer('applyDerivedLabels');
    wrapRenderer('renderDiscussionSets');
    wrapRenderer('renderCLGrid');
    wrapRenderer('renderReflectionQuestions');
    wrapRenderer('updateReflectionCompleteState');
    wrapRenderer('goToView');

    installFullSubjectBuildHook();

    void syncBuildPresentationState({
        preserveRequest: true
    });
})();
