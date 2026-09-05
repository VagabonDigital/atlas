/* ============================================================
   ATLAS FEEDBACK
   Shared pilot contact boundary.

   Owns:
   - contact overlay
   - message submission
   - global contact trigger binding

   Does NOT own:
   - message storage
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
        name: 'atlas-feedback-name',
        email: 'atlas-feedback-email',
        status: 'atlas-feedback-status',
        submit: 'atlas-feedback-submit'
    };

    let previousFocus = null;
    let previousBodyOverflow = '';
    let submitting = false;

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
                margin-bottom: 0.45rem;
                color:
                    var(--text-heading, #211f1b);
                font-size: 0.95rem;
                font-weight: 600;
            }

            .atlas-feedback-copy {
                margin: 0 0 0.9rem;
                color:
                    var(--text-muted, #7b7469);
                font-size: 0.88rem;
                line-height: 1.55;
            }

            #${IDS.textarea} {
                display: block;
                width: 100%;
                min-height: 158px;
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

            .atlas-feedback-contact-field {
                margin-top: 1rem;
            }

            .atlas-feedback-contact-label {
                display: block;
                margin-bottom: 0.45rem;
                color:
                    var(--text-heading, #211f1b);
                font-size: 0.86rem;
                font-weight: 600;
            }

            .atlas-feedback-contact-input {
                display: block;
                width: 100%;
                padding: 0.72rem 0.85rem;
                border:
                    1px solid
                    var(--border-subtle, rgba(61, 56, 48, 0.16));
                border-radius: 10px;
                outline: none;
                background:
                    var(--surface-canvas, #f5f1e9);
                color:
                    var(--text-body, #504b43);
                font: inherit;
                font-size: 0.88rem;
            }

            .atlas-feedback-contact-input:focus {
                border-color:
                    var(--accent, #4d7184);
                box-shadow:
                    0 0 0 3px
                    rgba(var(--accent-rgb, 77, 113, 132), 0.12);
            }

            .atlas-feedback-contact-helper {
                margin: 0.4rem 0 0;
                color:
                    var(--text-muted, #7b7469);
                font-size: 0.74rem;
                line-height: 1.45;
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
                        Message the Atlas team
                    </h2>

                    <button
                        class="atlas-feedback-close"
                        type="button"
                        aria-label="Close message form"
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
                    What would you like to share?
                </label>

                <p class="atlas-feedback-copy">
                    Questions, ideas, problems, feature requests, or something that worked particularly well — we'd love to hear it!
                </p>

                <textarea
                    id="${IDS.textarea}"
                    maxlength="5000"
                    placeholder="Share a question, idea, problem, suggestion, or something that worked well…"
                ></textarea>

                <div class="atlas-feedback-contact-field">
                    <label
                        class="atlas-feedback-contact-label"
                        for="${IDS.name}"
                    >
                        Name (optional)
                    </label>

                    <input
                        class="atlas-feedback-contact-input"
                        id="${IDS.name}"
                        type="text"
                        maxlength="120"
                        autocomplete="name"
                        placeholder="Your name"
                    >
                </div>

                <div class="atlas-feedback-contact-field">
                    <label
                        class="atlas-feedback-contact-label"
                        for="${IDS.email}"
                    >
                        Email for a reply (optional)
                    </label>

                    <input
                        class="atlas-feedback-contact-input"
                        id="${IDS.email}"
                        type="email"
                        maxlength="320"
                        autocomplete="email"
                        placeholder="you@example.com"
                    >

                    <p class="atlas-feedback-contact-helper">
                        Only used if you'd like us to respond.
                    </p>
                </div>

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

        const nameInput =
            document.getElementById(
                IDS.name
            );

        const emailInput =
            document.getElementById(
                IDS.email
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

        const replyName =
            String(
                nameInput?.value || ''
            ).trim();

        const replyEmail =
            String(
                emailInput?.value || ''
            ).trim();

        if (!message) {
            if (status) {
                status.textContent =
                    'Write something first.';
            }

            textarea?.focus();
            return;
        }

        if (
            replyEmail &&
            emailInput &&
            !emailInput.checkValidity()
        ) {
            if (status) {
                status.textContent =
                    'Enter a valid email or leave it blank.';
            }

            emailInput.focus();
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
                                replyName,
                                replyEmail
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
                    'Message could not be sent.'
                );
            }

            textarea.value = '';

            if (nameInput) {
                nameInput.value = '';
            }

            if (emailInput) {
                emailInput.value = '';
            }

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
        submit
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