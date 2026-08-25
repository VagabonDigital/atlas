/* ============================================================
   ATLAS COVER INTELLIGENCE

   Finds and curates existing photographs for owned Compass subjects.
   No image generation occurs here.

   The Worker owns provider credentials and visual ranking.
   ============================================================ */

(function () {
    'use strict';

    const BASE_URL =
        'https://atlas-ai.savvy989.workers.dev';

    const state = {
        pending: false,
        autoAttempted: false,
        candidates: [],
        candidateIndex: -1,
        usedPhotoIds: new Set(),
        lastError: ''
    };

    const initialAuthorIntent = (() => {
        try {
            return new URL(window.location.href)
                .searchParams
                .get('author')
                ?.trim() || '';
        } catch {
            return '';
        }
    })();

    function cleanString(value) {
        return typeof value === 'string'
            ? value.trim()
            : '';
    }

    function isOwnedSubject() {
        return window.AtlasCompassSubjectRuntime?.source ===
            'owned';
    }

    function isEditingSubject() {
        const bar = document.getElementById(
            'atlas-my-version-bar'
        );

        return Boolean(bar && !bar.hidden);
    }

    function getSubjectContext() {
        return {
            title: cleanString(
                typeof window.getEffectiveSubjectTitle === 'function'
                    ? window.getEffectiveSubjectTitle()
                    : window.MODULE?.title
            ),

            description: cleanString(
                typeof window.getEffectiveSubjectCatalogDescription === 'function'
                    ? window.getEffectiveSubjectCatalogDescription()
                    : window.MODULE?.catalogDescription
            ),

            hook: cleanString(
                typeof window.resolveTutorContentValue === 'function'
                    ? window.resolveTutorContentValue(
                        window.subjectCopy?.cover?.hook || '',
                        'cover.hook'
                    )
                    : window.subjectCopy?.cover?.hook
            )
        };
    }

    function getCurrentCoverImage() {
        return cleanString(
            typeof window.getEffectiveSubjectCoverImage === 'function'
                ? window.getEffectiveSubjectCoverImage()
                : window.MODULE?.bgImage
        );
    }

    function extractPexelsPhotoId(imageUrl) {
        return cleanString(imageUrl)
            .match(
                /images\.pexels\.com\/photos\/(\d+)\//i
            )?.[1] || '';
    }

    function normalizeCandidate(candidate) {
        const id = cleanString(candidate?.id);
        const imageUrl = cleanString(
            candidate?.imageUrl
        );

        if (!id || !imageUrl) return null;

        return {
            id,
            imageUrl,
            previewUrl:
                cleanString(candidate?.previewUrl),
            photographer:
                cleanString(candidate?.photographer),
            photographerUrl:
                cleanString(candidate?.photographerUrl),
            sourceUrl:
                cleanString(candidate?.sourceUrl),
            alt:
                cleanString(candidate?.alt),
            query:
                cleanString(candidate?.query)
        };
    }

    function rememberCurrentCover() {
        const id = extractPexelsPhotoId(
            getCurrentCoverImage()
        );

        if (id) state.usedPhotoIds.add(id);
    }

    async function resolveCandidates() {
        if (state.pending) return [];

        const subject = getSubjectContext();

        if (!subject.title) {
            throw new Error(
                'A subject title is required to find a cover.'
            );
        }

        rememberCurrentCover();
        state.pending = true;
        state.lastError = '';
        updateRetryUI();

        try {
            const response = await fetch(
                `${BASE_URL}/resolve-cover`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        subject,
                        excludePhotoIds:
                            Array.from(state.usedPhotoIds)
                                .slice(-24)
                    })
                }
            );

            const result = await response.json();

            if (!response.ok || !result?.ok) {
                throw new Error(
                    result?.error ||
                    'Atlas could not find a cover.'
                );
            }

            const candidates =
                Array.isArray(result?.payload?.candidates)
                    ? result.payload.candidates
                        .map(normalizeCandidate)
                        .filter(Boolean)
                    : [];

            if (!candidates.length) {
                throw new Error(
                    'Atlas did not return a usable cover.'
                );
            }

            state.candidates = candidates;
            state.candidateIndex = -1;

            return candidates;
        } catch (error) {
            state.lastError =
                cleanString(error?.message) ||
                'Atlas could not find a cover.';

            throw error;
        } finally {
            state.pending = false;
            updateRetryUI();
        }
    }

    function applyCandidate(
        candidate,
        {
            commit = true
        } = {}
    ) {
        const next = normalizeCandidate(candidate);

        if (!next) return false;

        state.usedPhotoIds.add(next.id);

        if (
            commit &&
            isEditingSubject() &&
            typeof window.commitMyVersionDraftContent === 'function'
        ) {
            window.commitMyVersionDraftContent(
                'module.bgImage',
                next.imageUrl
            );

            if (
                typeof window.applyCoverConfig === 'function'
            ) {
                window.applyCoverConfig();
            }
        }

        const input = document.getElementById(
            'atlas-my-version-image-input'
        );

        if (input) {
            input.value = next.imageUrl;
            input.dispatchEvent(
                new Event('input', {
                    bubbles: true
                })
            );
        }

        updateRetryUI();
        return true;
    }

    async function useNextCandidate({
        commit = true
    } = {}) {
        let nextIndex = state.candidateIndex + 1;

        while (
            nextIndex < state.candidates.length &&
            state.usedPhotoIds.has(
                state.candidates[nextIndex]?.id
            )
        ) {
            nextIndex += 1;
        }

        if (nextIndex >= state.candidates.length) {
            await resolveCandidates();
            nextIndex = 0;
        }

        const candidate =
            state.candidates[nextIndex];

        if (!candidate) return false;

        state.candidateIndex = nextIndex;

        return applyCandidate(
            candidate,
            { commit }
        );
    }

    async function autoResolveCover() {
        if (
            state.autoAttempted ||
            state.pending ||
            initialAuthorIntent !== 'generate' ||
            !isOwnedSubject() ||
            !isEditingSubject()
        ) {
            return;
        }

        if (getCurrentCoverImage()) {
            state.autoAttempted = true;
            return;
        }

        const subject = getSubjectContext();

        /*
         * Subject framing is the first full-generation stage.
         * Once its Library introduction exists, the cover can resolve
         * while every later subject stage continues independently.
         */
        if (!subject.title || !subject.description) {
            return;
        }

        state.autoAttempted = true;

        try {
            await resolveCandidates();
            await useNextCandidate({
                commit: true
            });
        } catch (error) {
            console.warn(
                '[Atlas Cover Intelligence] Automatic resolution failed:',
                error
            );
        }
    }

    async function retryFromUI() {
        if (
            state.pending ||
            !isOwnedSubject() ||
            !isEditingSubject()
        ) {
            return;
        }

        const status = document.getElementById(
            'atlas-cover-intelligence-status'
        );

        if (status) status.textContent = '';

        try {
            await useNextCandidate({
                commit: false
            });

            if (status) {
                status.textContent =
                    'Cover ready — Apply details to keep it.';
            }
        } catch (error) {
            console.error(
                '[Atlas Cover Intelligence] Retry failed:',
                error
            );

            if (status) {
                status.textContent =
                    state.lastError ||
                    'Couldn’t find another cover.';
            }
        }
    }

    function updateRetryUI() {
        const button = document.getElementById(
            'atlas-cover-intelligence-retry'
        );

        if (!button) return;

        const inputValue = cleanString(
            document.getElementById(
                'atlas-my-version-image-input'
            )?.value
        );

        button.disabled = state.pending;
        button.textContent = state.pending
            ? 'Finding cover…'
            : inputValue || getCurrentCoverImage()
                ? 'Try another cover ↻'
                : 'Find a cover';
    }

    function installRetryUI() {
        const input = document.getElementById(
            'atlas-my-version-image-input'
        );

        if (
            !input ||
            document.getElementById(
                'atlas-cover-intelligence-retry'
            )
        ) {
            return;
        }

        const field = input.closest(
            '.atlas-my-version-field'
        );

        if (!field) return;

        const row = document.createElement('div');
        row.style.cssText =
            'display:flex;align-items:center;gap:.7rem;margin-top:.5rem;flex-wrap:wrap;';

        const button = document.createElement('button');
        button.id = 'atlas-cover-intelligence-retry';
        button.className =
            'atlas-my-version-dialog-secondary';
        button.type = 'button';
        button.addEventListener(
            'click',
            retryFromUI
        );

        const status = document.createElement('span');
        status.id = 'atlas-cover-intelligence-status';
        status.setAttribute('role', 'status');
        status.style.cssText =
            'font-size:.76rem;line-height:1.4;color:var(--text-muted);';

        row.appendChild(button);
        row.appendChild(status);
        field.appendChild(row);

        updateRetryUI();
    }

    function start() {
        let checks = 0;

        const timer = window.setInterval(() => {
            checks += 1;
            installRetryUI();
            autoResolveCover();

            const retryUIReady = Boolean(
                document.getElementById(
                    'atlas-cover-intelligence-retry'
                )
            );

            const autoPending =
                initialAuthorIntent === 'generate' &&
                !state.autoAttempted;

            if (
                checks >= 480 ||
                (retryUIReady && !autoPending)
            ) {
                window.clearInterval(timer);
            }
        }, 250);
    }

    window.AtlasCoverIntelligence = {
        resolveCandidates,
        retry: retryFromUI
    };

    start();
})();
