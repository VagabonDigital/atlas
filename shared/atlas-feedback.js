/* ============================================================
   ATLAS FEEDBACK
   Shared pilot feedback boundary.

   Owns:
   - context-aware feedback capture
   - feedback overlay
   - feedback submission
   - global feedback trigger binding

   Does NOT own:
   - feedback storage
   - tutor identity
   - learner data
   - analytics
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasFeedback) return;

    const ENDPOINT =
        'https://atlas-ai.savvy989.workers.dev/submit-feedback';

    const IDS = {
        overlay: 'atlas-feedback-overlay',
        textarea: 'atlas-feedback-message',
        status: 'atlas-feedback-status',
        submit: 'atlas-feedback-submit'
    };

    let previousFocus = null;
    let previousBodyOverflow = '';
    let submitting = false;

    function captureContext() {
        return {
            world:
                String(
                    document.body?.dataset.atlasWorld || ''
                ),

            surface:
                String(
                    document.body?.dataset.atlasSurface || ''
                ),

            path:
                window.location.pathname +
                window.location.search +
                window.location.hash,

            title:
                document.title || '',

            theme:
                document.documentElement.dataset.theme || '',

            viewport: {
                width:
                    window.innerWidth || 0,

                height:
                    window.innerHeight || 0
            }
        };
    }

    function installStyles() {
        if (
            document.getElementById(
                'atlas-feedback-styles'
            )
        ) {
            return;
        }

        const style =
            document.createElement('style');

        style.id =
            'atlas-feedback-styles';

        style.textContent = `
            #${IDS.overlay} {
                position: fixed;
                inset: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1rem;
                background: rgba(16, 15, 13, 0.48);
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
            }

            #${IDS.overlay}[hidden] {
                display: none;
            }

            .atlas-feedback-panel {
                width: min(520px, 100%);
                padding: 1.35rem;
                border:
                    1px solid
                    var(--border-subtle, rgba(61, 56, 48, 0.16));
                border-radius: 18px;
                background:
                    var(--surface-raised, #fffdf9);
                color:
                    var(--text-body, #504b43);
                box-shadow:
                    0 24px 70px rgba(20, 17, 12, 0.18);
                font-family:
                    var(
                        --font-body,
                        'DM Sans',
                        system-ui,
                        sans-serif
                    );
            }

            .atlas-feedback-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                margin-bottom: 1rem;
            }

            .atlas-feedback-title {
                margin: 0;
                color:
                    var(--text-heading, #211f1b);
                font-family:
                    var(
                        --font-display,
                        'DM Serif Display',
                        Georgia,
                        serif
                    );
                font-size: 1.55rem;
                font-weight: 400;
            }

            .atlas-feedback-close {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 34px;
                height: 34px;
                padding: 0;
                border: 0;
                border-radius: 50%;
                background: transparent;
                color:
                    var(--text-muted, #7b7469);
                cursor: pointer;
            }

            .atlas-feedback-close:hover {
                background:
                    var(--surface-muted, rgba(0, 0, 0, 0.05));
                color:
                    var(--text-heading, #211f1b);
            }

            .atlas-feedback-label {
                display: block;
                margin-bottom: 0.55rem;
                color:
                    var(--text-heading, #211f1b);
                font-size: 0.86rem;
                font-weight: 600;
            }

            #${IDS.textarea} {
                display: block;
                width: 100%;
                min-height: 170px;
                resize: vertical;
                padding: 0.95rem 1rem;
                border:
                    1px solid
                    var(--border-subtle, rgba(61, 56, 48, 0.16));
                border-radius: 12px;
                outline: none;
                background:
                    var(--surface-canvas, #f5f1e9);
                color:
                    var(--text-body, #504b43);
                font: inherit;
                font-size: 0.94rem;
                line-height: 1.55;
            }

            #${IDS.textarea}:focus {
                border-color:
                    var(--accent, #4d7184);
                box-shadow:
                    0 0 0 3px
                    rgba(var(--accent-rgb, 77, 113, 132), 0.12);
            }

            .atlas-feedback-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                margin-top: 1rem;
            }

            #${IDS.status} {
                min-height: 1.2em;
                color:
                    var(--text-muted, #7b7469);
                font-size: 0.78rem;
            }

            #${IDS.submit} {
                flex-shrink: 0;
                padding: 0.68rem 1rem;
                border:
                    1px solid
                    var(--accent, #4d7184);
                border-radius: 9px;
                background:
                    var(--accent, #4d7184);
                color:
                    var(--accent-ink, #ffffff);
                font: inherit;
                font-size: 0.84rem;
                font-weight: 600;
                cursor: pointer;
            }

            #${IDS.submit}:hover:not(:disabled) {
                filter: brightness(0.96);
            }

            #${IDS.submit}:disabled {
                opacity: 0.55;
                cursor: default;
            }

            @media (max-width: 560px) {
                #${IDS.overlay} {
                    align-items: flex-end;
                    padding: 0;
                }

                .atlas-feedback-panel {
                    width: 100%;
                    border-radius: 18px 18px 0 0;
                    padding:
                        1.25rem
                        1rem
                        calc(
                            1rem +
                            env(safe-area-inset-bottom)
                        );
                }

                #${IDS.textarea} {
                    min-height: 150px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    function mountOverlay() {
        if (
            document.getElementById(
                IDS.overlay
            )
        ) {
            return;
        }

        const overlay =
            document.createElement('div');

        overlay.id =
            IDS.overlay;

        overlay.hidden = true;

        overlay.setAttribute(
            'role',
            'dialog'
        );

        overlay.setAttribute(
            'aria-modal',
            'true'
        );

        overlay.setAttribute(
            'aria-labelledby',
            'atlas-feedback-title'
        );

        overlay.innerHTML = `
            <div
                class="atlas-feedback-panel"
                role="document"
            >
                <div class="atlas-feedback-header">
                    <h2
                        class="atlas-feedback-title"
                        id="atlas-feedback-title"
                    >
                        Send feedback
                    </h2>

                    <button
                        class="atlas-feedback-close"
                        type="button"
                        aria-label="Close feedback"
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M2 2l10 10M12 2L2 12"
                                stroke="currentColor"
                                stroke-width="1.35"
                                stroke-linecap="round"
                            />
                        </svg>
                    </button>
                </div>

                <label
                    class="atlas-feedback-label"
                    for="${IDS.textarea}"
                >
                    What happened?
                </label>

                <textarea
                    id="${IDS.textarea}"
                    maxlength="5000"
                    placeholder="What worked, got in the way, surprised you, or made you wish Atlas did something differently?"
                ></textarea>

                <div class="atlas-feedback-footer">
                    <div
                        id="${IDS.status}"
                        role="status"
                        aria-live="polite"
                    ></div>

                    <button
                        id="${IDS.submit}"
                        type="button"
                    >
                        Send
                    </button>
                </div>
            </div>
        `;

        overlay.addEventListener(
            'click',
            event => {
                if (
                    event.target === overlay
                ) {
                    close();
                }
            }
        );

        overlay
            .querySelector(
                '.atlas-feedback-close'
            )
            .addEventListener(
                'click',
                close
            );

        overlay
            .querySelector(
                `#${IDS.submit}`
            )
            .addEventListener(
                'click',
                submit
            );

        document.body.appendChild(
            overlay
        );
    }

    function open() {
        installStyles();
        mountOverlay();

        const overlay =
            document.getElementById(
                IDS.overlay
            );

        const textarea =
            document.getElementById(
                IDS.textarea
            );

        const status =
            document.getElementById(
                IDS.status
            );

        if (
            !overlay ||
            !textarea
        ) {
            return;
        }

        previousFocus =
            document.activeElement;

        previousBodyOverflow =
            document.body.style.overflow;

        document.body.style.overflow =
            'hidden';

        if (status) {
            status.textContent = '';
        }

        overlay.hidden = false;

        requestAnimationFrame(() => {
            textarea.focus();
        });
    }

    function close() {
        if (submitting) return;

        const overlay =
            document.getElementById(
                IDS.overlay
            );

        if (!overlay) return;

        overlay.hidden = true;

        document.body.style.overflow =
            previousBodyOverflow;

        if (
            previousFocus &&
            typeof previousFocus.focus ===
                'function'
        ) {
            previousFocus.focus();
        }

        previousFocus = null;
    }

    async function submit() {
        if (submitting) return;

        const textarea =
            document.getElementById(
                IDS.textarea
            );

        const status =
            document.getElementById(
                IDS.status
            );

        const button =
            document.getElementById(
                IDS.submit
            );

        const message =
            String(
                textarea?.value || ''
            ).trim();

        if (!message) {
            if (status) {
                status.textContent =
                    'Write something first.';
            }

            textarea?.focus();
            return;
        }

        submitting = true;

        if (button) {
            button.disabled = true;
            button.textContent =
                'Sending…';
        }

        if (status) {
            status.textContent = '';
        }

        try {
            const response =
                await fetch(
                    ENDPOINT,
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify({
                                message,

                                context:
                                    captureContext(),

                                clientTimestamp:
                                    new Date()
                                        .toISOString()
                            })
                    }
                );

            let result = null;

            try {
                result =
                    await response.json();
            } catch { }

            if (
                !response.ok ||
                result?.ok !== true
            ) {
                throw new Error(
                    result?.error ||
                    'Feedback could not be sent.'
                );
            }

            textarea.value = '';

            if (status) {
                status.textContent =
                    'Sent — thank you.';
            }

            window.setTimeout(
                close,
                650
            );
        } catch {
            if (status) {
                status.textContent =
                    'Couldn’t send. Try again.';
            }
        } finally {
            submitting = false;

            if (button) {
                button.disabled = false;
                button.textContent =
                    'Send';
            }
        }
    }

    function bindFeedbackButtons() {
        document.addEventListener(
            'click',
            event => {
                const button =
                    event.target.closest(
                        '[data-atlas-feedback]'
                    );

                if (!button) return;

                event.preventDefault();
                open();
            }
        );
    }

    function handleKeydown(event) {
        if (
            event.key !== 'Escape'
        ) {
            return;
        }

        const overlay =
            document.getElementById(
                IDS.overlay
            );

        if (
            overlay &&
            !overlay.hidden
        ) {
            close();
        }
    }

    function start() {
        installStyles();
        mountOverlay();
        bindFeedbackButtons();

        document.addEventListener(
            'keydown',
            handleKeydown
        );
    }

    window.AtlasFeedback = {
        open,
        close,
        submit,
        captureContext
    };

    if (
        document.readyState ===
        'loading'
    ) {
        document.addEventListener(
            'DOMContentLoaded',
            start,
            {
                once: true
            }
        );
    } else {
        start();
    }
})();