/* ============================================================
   COMPASS SUBJECT SHELL
   Shared DOM scaffold for every Compass subject page.

   This file owns the reusable subject interface:
   cover, orientation, Discussion, Cultural Lens, Reflection,
   mobile drawer, modals, session UI, and Language Bank drawer.

   Subject-specific content lives in each subject's subject-data.js.
   Shared behaviour lives in compass-engine.js.
   ============================================================ */

function mountCompassSubjectShell() {
    document.body.innerHTML = `
    <!-- ============================================================
     VIEW 1: COVER
     ============================================================ -->

    <div id="view-cover" class="view active">
        <div class="cover-bg"></div>
        <div class="cover-overlay"></div>
        <div class="cover-pattern"></div>

        <button class="cover-back-link" id="cover-back-link" type="button" onclick="returnToLaunchOrigin()">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M8.5 3L4.5 7l4 4M5 7h5"
                    stroke="currentColor" stroke-width="1.35"
                    stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span id="cover-back-label">Back to Compass</span>
        </button>

        <div class="cover-utility-row">
            <button class="cover-appearance-toggle" id="cover-appearance-toggle" onclick="toggleAppearanceMode()"
                title="Switch to night mode" aria-label="Switch to night mode">
            </button>

            <button class="cover-session-btn" onclick="openSessionModal()"
                aria-label="Open session panel. Working with Shared">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="4" r="2.2" stroke="currentColor" stroke-width="1.2" />
                    <path d="M1.5 11c0-2.485 2.015-4 4.5-4s4.5 1.515 4.5 4" stroke="currentColor"
                        stroke-width="1.2" stroke-linecap="round" />
                </svg>
                <span id="cover-session-label">Shared</span>
            </button>
        </div>

        <div class="cover-card">
            <div class="cover-eyebrow">
                <span class="cover-eyebrow-line"></span>
                COMPASS SUBJECT
            </div>

            <h1 class="cover-title" id="cover-title"></h1>
            <p class="cover-hook" id="cover-hook"></p>
            <p class="cover-returning" id="cover-returning"></p>

            <div class="cover-actions">
                <button class="btn-begin" id="cover-begin-btn" onclick="beginModule()">
                    Begin lesson
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                        <path d="M3 7.5h9M8.5 4l3.5 3.5-3.5 3.5" stroke="currentColor" stroke-width="1.5"
                            stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <!-- ============================================================
     VIEW 2: ORIENTATION
     ============================================================ -->

    <div id="view-orientation" class="view view-inner-bg">
        <div id="mob-header-orientation" class="mobile-header-shell"></div>
        <div id="nav-orientation" class="nav-shell"></div>

        <div class="orientation-wrap">
            <div class="section-stage">

                <div class="subject-intro-block">
                    <p class="section-eyebrow" id="orient-eyebrow"></p>
                    <h1 id="overview-heading"></h1>
                    <div id="overview-intro" class="overview-intro"></div>
                    <p id="overview-question" class="overview-question"></p>
                </div>

                <div class="main-paths">
                    <div class="main-path-card" role="button" tabindex="0"
                        onclick="goToView('view-discussion')"
                        onkeydown="if(event.key==='Enter'||event.key===' ') { event.preventDefault(); goToView('view-discussion'); }">

                        <div class="path-icon">
                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                                <path d="M4 6a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2h-4l-4 3v-3H6a2 2 0 01-2-2V6z"
                                    stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                                <path d="M8 9h6M8 12h4" stroke="currentColor" stroke-width="1.3"
                                    stroke-linecap="round" />
                            </svg>
                        </div>

                        <p class="path-label" id="path-label-disc"></p>
                        <h2 class="path-title">Discussion</h2>
                        <p class="path-desc" id="path-desc-disc"></p>

                        <div class="path-arrow">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M3 9h12M11 5l4 4-4 4" stroke="currentColor" stroke-width="1.5"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </div>
                    </div>

                    <div class="main-path-card" role="button" tabindex="0"
                        onclick="goToView('view-cultural-lens')"
                        onkeydown="if(event.key==='Enter'||event.key===' ') { event.preventDefault(); goToView('view-cultural-lens'); }">

                        <div class="path-icon">
                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                                <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5" />
                                <circle cx="11" cy="11" r="3" stroke="currentColor" stroke-width="1.5" />
                                <path d="M4 11h2M16 11h2M11 4v2M11 16v2" stroke="currentColor" stroke-width="1.5"
                                    stroke-linecap="round" />
                            </svg>
                        </div>

                        <p class="path-label" id="path-label-cl"></p>
                        <h2 class="path-title">Cultural Lens</h2>
                        <p class="path-desc" id="path-desc-cl"></p>

                        <div class="path-arrow">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M3 9h12M11 5l4 4-4 4" stroke="currentColor" stroke-width="1.5"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="reflection-path-card" role="button" tabindex="0"
                    onclick="goToView('view-reflection')"
                    onkeydown="if(event.key==='Enter'||event.key===' ') { event.preventDefault(); goToView('view-reflection'); }">

                    <div class="reflection-icon-small">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M9 2L9 16M4 13l5 3 5-3" stroke="currentColor" stroke-width="1.4"
                                stroke-linecap="round" stroke-linejoin="round" />
                            <circle cx="9" cy="7" r="3" stroke="currentColor" stroke-width="1.4" />
                        </svg>
                    </div>

                    <div class="reflection-path-text">
                        <h4 id="reflection-path-title"></h4>
                        <p id="reflection-path-desc"></p>
                    </div>

                    <div class="card-arrow-badge" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M4 8h8M9 5l3 3-3 3" stroke="currentColor" stroke-width="1.35"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- ============================================================
     VIEW 3: DISCUSSION
     ============================================================ -->

    <div id="view-discussion" class="view view-inner-bg">
        <div id="mob-header-discussion" class="mobile-header-shell"></div>
        <div id="nav-discussion" class="nav-shell"></div>

        <div class="section-wrap">
            <div class="section-stage">
                <div class="section-header">
                    <p class="section-eyebrow">Discussion</p>
                    <h2 id="discussion-section-heading"></h2>
                    <p id="discussion-section-intro"></p>

                    <div class="subject-utility-row">
                        <div class="subject-utility-status">
                            <span class="progress-pill explored" id="disc-explored-count" style="display:none">
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                    <path d="M2 5l2.5 2.5L8 2.5" stroke="currentColor" stroke-width="1.4"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <span>0 explored</span>
                            </span>
                        </div>

                        <div id="discussion-upgrade-control" class="upgrade-control-mount"></div>
                    </div>
                </div>

                <div class="discussion-sets" id="discussion-sets"></div>

                <div class="moments-panel" id="moments-panel">
                    <div class="moments-panel-header">
                        <h3 class="moments-panel-title" id="moments-panel-title">Set</h3>

                        <button class="btn-close-set" onclick="closeSet()">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.4"
                                    stroke-linecap="round" />
                            </svg>
                            Close set
                        </button>
                    </div>

                    <div id="moments-list"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- ============================================================
     VIEW 4: CULTURAL LENS
     ============================================================ -->

    <div id="view-cultural-lens" class="view view-inner-bg">
        <div id="mob-header-cultural-lens" class="mobile-header-shell"></div>
        <div id="nav-cultural-lens" class="nav-shell"></div>

        <div class="section-wrap">
            <div class="section-stage">
                <div class="section-header">
                    <p class="section-eyebrow">Cultural Lens</p>
                    <h2 id="cl-section-heading"></h2>
                    <p id="cl-section-intro"></p>

                    <div class="subject-utility-row">
                        <div class="subject-utility-status">
                            <span class="progress-pill explored" id="cl-explored-count" style="display:none">
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                    <path d="M2 5l2.5 2.5L8 2.5" stroke="currentColor" stroke-width="1.4"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <span>0 explored</span>
                            </span>
                        </div>

                        <div id="cultural-lens-upgrade-control" class="upgrade-control-mount"></div>
                    </div>
                </div>

                <div class="cl-grid" id="cl-grid"></div>
            </div>
        </div>
    </div>

    <!-- ============================================================
    VIEW 5: REFLECTION
    ============================================================ -->
    <div id="view-reflection" class="view view-inner-bg">
        <div id="mob-header-reflection" class="mobile-header-shell"></div>
        <div id="nav-reflection" class="nav-shell"></div>

        <div class="reflection-wrap">
            <div class="section-stage">
                <div class="reflection-icon-large" aria-hidden="true">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                        <path d="M14 3V25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                        <path d="M6 19l8 6 8-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="14" cy="10" r="4.5" stroke="currentColor" stroke-width="1.8"/>
                    </svg>
                </div>

                <div id="reflection-complete-mark" class="reflection-complete-mark" aria-hidden="true">
                    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
                        <path d="M26 8L44 26L26 44L8 26L26 8Z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
                        <path d="M26 15L37 26L26 37L15 26L26 15Z" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round" opacity=".78"/>
                        <circle cx="26" cy="26" r="3" fill="currentColor"/>
                    </svg>
                </div>

                <p id="reflection-complete-kicker" class="reflection-complete-kicker">Wrapped up for now</p>
                <h2 id="reflection-title" aria-live="polite"></h2>
                <p id="reflection-summary" class="reflection-summary"></p>

                <div id="reflection-questions" class="reflection-questions"></div>

                <p id="reflection-progress-summary" class="reflection-progress-summary"></p>

                <div class="reflection-actions">
                    <button id="complete-lesson-btn" class="btn-primary" type="button" onclick="completeLesson()">
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8.2l3.1 3.1L13 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Wrap up
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- ============================================================
     COMPASS WRAP-UP CANVAS
     Moves into the active view so that view's existing shell remains.
     ============================================================ -->

    <section class="compass-wrap-up-canvas" id="compass-wrap-up-canvas"
        aria-labelledby="compass-wrap-up-kicker" hidden>
        <div class="compass-wrap-up-stage">
            <p class="compass-wrap-up-kicker" id="compass-wrap-up-kicker" tabindex="-1">Today</p>

            <div class="compass-wrap-up-section" id="compass-wrap-up-explored">
                <h2>You explored</h2>
                <ul class="compass-wrap-up-list" id="compass-wrap-up-list"></ul>
                <p class="compass-wrap-up-more" id="compass-wrap-up-more" hidden>plus more from today</p>
            </div>

            <div class="compass-wrap-up-section" id="compass-wrap-up-saved-section">
                <h2>Saved language</h2>
                <p class="compass-wrap-up-saved" id="compass-wrap-up-saved">0 items saved</p>
            </div>

            <div class="compass-wrap-up-section" id="compass-wrap-up-empty" hidden>
                <p class="compass-wrap-up-saved">Nothing was added to today’s recap.</p>
            </div>

            <div class="compass-wrap-up-pickup" id="compass-wrap-up-pickup" hidden>
                <p class="compass-wrap-up-pickup-label">We ended on</p>
                <p class="compass-wrap-up-pickup-value" id="compass-wrap-up-pickup-value"></p>
            </div>

            <div class="compass-wrap-up-actions">
                <button class="btn-primary" type="button" onclick="finishCompassWrapUp()">
                    Finish and return to Atlas
                </button>
                <button class="btn-ghost" type="button" onclick="keepTeachingFromWrapUp()">
                    Keep teaching
                </button>
            </div>
        </div>
    </section>

    <!-- ============================================================
     MOBILE NAVIGATION DRAWER
     ============================================================ -->

    <div class="mobile-drawer-overlay" id="mobile-drawer-overlay" onclick="closeMobileDrawer()"></div>

    <div class="mobile-drawer" id="mobile-drawer">
        <div class="mobile-drawer-header">
            <span class="mobile-drawer-title" id="mobile-drawer-subject-title"></span>

            <button class="mobile-drawer-close" onclick="closeMobileDrawer()" aria-label="Close menu">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5"
                        stroke-linecap="round" />
                </svg>
            </button>
        </div>

        <div class="mobile-drawer-nav" id="mobile-drawer-nav"></div>

        <div class="mobile-drawer-footer">
            <div class="mobile-footer-actions">
                <button class="mobile-session-btn" onclick="openSessionModalFromDrawer()"
                    aria-label="Open session panel. Working with Shared">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="5" r="2.5" stroke="currentColor" stroke-width="1.3" />
                        <path d="M2 12c0-2.485 2.239-4.5 5-4.5s5 2.015 5 4.5" stroke="currentColor"
                            stroke-width="1.3" stroke-linecap="round" />
                    </svg>
                    <span id="mobile-session-label">Shared</span>
                </button>

                <button class="mobile-appearance-toggle" id="mobile-appearance-toggle"
                    onclick="toggleAppearanceMode()" title="Switch to night mode"
                    aria-label="Switch to night mode">
                </button>
            </div>
        </div>
    </div>

    <!-- ============================================================
     CULTURAL LENS MODAL
     ============================================================ -->

    <div class="modal-overlay" id="cl-modal-overlay" onclick="handleModalOverlayClick(event)">
        <div class="modal-panel" id="cl-modal-panel">

            <div class="modal-header">
                <div class="modal-heading">
                    <p class="modal-context-line" id="modal-context-line"></p>
                    <h2 class="modal-title" id="modal-title"></h2>
                </div>

                <button class="modal-close-x" onclick="closeModal()" aria-label="Close modal">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                        <path d="M3 3l9 9M12 3l-9 9" stroke="currentColor" stroke-width="1.6"
                            stroke-linecap="round" />
                    </svg>
                </button>
            </div>

            <div class="modal-body">
                <p class="modal-context" id="modal-context"></p>

                <div class="modal-question-block">
                    <p class="modal-question-label">Discussion question</p>
                    <p class="modal-question" id="modal-main-question"></p>
                </div>

                <div class="follow-thread-block" id="modal-follow-thread">
                    <p class="follow-thread-label">Follow the Thread</p>
                    <div class="follow-thread-questions" id="modal-follow-thread-questions"></div>
                </div>

                <div class="upgrade-row" id="modal-upgrade-row">
                    <!-- Injected by JS -->
                </div>
            </div>

            <div class="modal-footer">
                <div class="modal-footer-nav">
                    <button class="btn-ghost" id="modal-prev-btn" onclick="navigateModal(-1)">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M7 2L3 6l4 4" stroke="currentColor" stroke-width="1.4"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        Previous
                    </button>

                    <button class="btn-ghost" id="modal-next-btn" onclick="navigateModal(1)">
                        Next
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M5 2l4 4-4 4" stroke="currentColor" stroke-width="1.4"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>

                <div class="modal-footer-actions">
                    <button class="btn-mark-explored" id="cl-modal-explored-btn"
                        onclick="toggleCLExploredFromModal()" aria-pressed="false">

                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.5"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>

                        Mark explored
                    </button>

                    <button class="btn-ghost modal-footer-close" onclick="closeModal()">
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- ============================================================
     LANGUAGE BANK DRAWER
     ============================================================ -->

    <div class="vb-overlay" id="vb-overlay" onclick="closeVocabBank()"></div>

    <div class="vb-drawer" id="vb-drawer">
        <div class="vb-header">
            <div class="vb-heading">
                <h3>Language Bank</h3>
                <p class="vb-subtitle">Save language from this subject.</p>
            </div>

            <div class="vb-actions">
                <button class="vb-close-btn" onclick="closeVocabBank()" aria-label="Close Language Bank">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5"
                            stroke-linecap="round" />
                    </svg>
                </button>
            </div>
        </div>

        <div class="vb-tabs" role="tablist" aria-label="Language Bank views">
            <button class="vb-tab-btn" id="vb-tab-saved" type="button" role="tab"
                onclick="setVocabBankTab('saved')">
                Saved language
            </button>

            <button class="vb-tab-btn" id="vb-tab-all" type="button" role="tab"
                onclick="setVocabBankTab('all')">
                All language
            </button>
        </div>

        <div class="vb-list" id="vb-list"></div>
    </div>

    <div id="print-key-language" class="print-key-language" aria-hidden="true"></div>

    <!-- ============================================================
     SESSION ACTION DIALOG
     ============================================================ -->

    <dialog class="session-dialog" id="session-dialog"
        aria-labelledby="session-dialog-title"
        aria-describedby="session-dialog-message">

        <div class="session-dialog-panel">
            <p class="session-dialog-kicker" id="session-dialog-kicker">
                Session action
            </p>

            <h3 class="session-dialog-title" id="session-dialog-title">
                Are you sure?
            </h3>

            <p class="session-dialog-message" id="session-dialog-message"></p>

            <input class="session-input session-dialog-input" id="session-dialog-input"
                type="text" maxlength="40" autocomplete="off">

            <p class="session-dialog-error" id="session-dialog-error" role="alert"></p>

            <div class="session-dialog-actions">
                <button class="btn-ghost" type="button" id="session-dialog-cancel">
                    Cancel
                </button>

                <button class="btn-danger-confirm" type="button" id="session-dialog-ok">
                    OK
                </button>
            </div>
        </div>
    </dialog>

    <!-- Shared safe-first session panel mounts here. -->
    <div id="atlas-session-panel-root"></div>
    `;
}
