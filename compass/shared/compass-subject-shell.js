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
                <span id="cover-eyebrow-label">COMPASS SUBJECT</span>
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
                    <div class="main-path-card main-path-card--discussion" role="button" tabindex="0"
                        onclick="goToView('view-discussion')"
                        onkeydown="if(event.key==='Enter'||event.key===' ') { event.preventDefault(); goToView('view-discussion'); }">

                        <div class="path-icon path-icon--discussion" aria-hidden="true">
                            <svg class="path-illustration path-illustration--discussion"
                                viewBox="0 0 160 140" fill="none">
                                <path class="discussion-bubble"
                                    d="M38 28h72c15.5 0 28 12.5 28 28v31c0 15.5-12.5 28-28 28H82l-25 17 5-17H38c-15.5 0-28-12.5-28-28V56c0-15.5 12.5-28 28-28Z"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linejoin="round" />
                                <path class="discussion-line discussion-line--one"
                                    d="M43 62h57"
                                    pathLength="1"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round" />
                                <path class="discussion-line discussion-line--two"
                                    d="M43 82h39"
                                    pathLength="1"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round" />
                            </svg>
                        </div>

                        <p class="path-label" id="path-label-disc"></p>
                        <h2 class="path-title" id="path-title-disc">Discussion</h2>
                        <p class="path-desc" id="path-desc-disc"></p>

                        <div class="path-arrow" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M3 9h12M11 5l4 4-4 4" stroke="currentColor" stroke-width="1.5"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </div>
                    </div>

                    <div class="main-path-card main-path-card--cultural-lens" role="button" tabindex="0"
                        onclick="goToView('view-cultural-lens')"
                        onkeydown="if(event.key==='Enter'||event.key===' ') { event.preventDefault(); goToView('view-cultural-lens'); }">

                        <div class="path-icon path-icon--cultural-lens" aria-hidden="true">
                            <svg class="path-illustration path-illustration--cultural-lens"
                                viewBox="0 0 160 140" fill="none">
                                <g class="cultural-globe">
                                    <circle cx="80" cy="70" r="40"
                                        stroke="currentColor"
                                        stroke-width="2" />
                                    <path d="M40 70h80"
                                        stroke="currentColor"
                                        stroke-width="1.7"
                                        stroke-linecap="round" />
                                    <path
                                        d="M80 30c14 11 21 24.5 21 40s-7 29-21 40
                                        M80 30c-14 11-21 24.5-21 40s7 29 21 40"
                                        stroke="currentColor"
                                        stroke-width="1.7"
                                        stroke-linecap="round" />
                                </g>
                                <path class="cultural-orbit"
                                    d="M27 91c14 19 42 31 70 25 18-4 32-13 42-26"
                                    pathLength="1"
                                    stroke="currentColor"
                                    stroke-width="1.7"
                                    stroke-linecap="round" />
                                <circle class="cultural-orbit-dot"
                                    cx="139" cy="90" r="3"
                                    fill="currentColor" />
                            </svg>
                        </div>

                        <p class="path-label" id="path-label-cl"></p>
                        <h2 class="path-title" id="path-title-cl">Cultural Lens</h2>
                        <p class="path-desc" id="path-desc-cl"></p>

                        <div class="path-arrow" aria-hidden="true">
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

                    <div class="reflection-icon-small" aria-hidden="true">
                        <svg class="reflection-illustration"
                            viewBox="0 0 160 88" fill="none">
                            <path class="reflection-stem"
                                d="M80 10V66"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round" />
                            <circle class="reflection-ring"
                                cx="80" cy="34" r="13"
                                stroke="currentColor"
                                stroke-width="2" />
                            <path class="reflection-chevron"
                                d="M50 56l30 22 30-22"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round" />
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

        <div class="section-wrap" id="discussion-browse-view">
            <div class="section-stage">
                <div class="section-header">
                    <p class="section-eyebrow" id="discussion-section-eyebrow">Discussion</p>
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

        <section class="discussion-focus-view" id="discussion-focus-view"
            aria-labelledby="discussion-focus-title" hidden>

            <header class="discussion-focus-header">
                <button class="discussion-focus-back" id="discussion-focus-back-btn"
                    type="button" onclick="handleDiscussionFocusBack()"
                    title="Back to browse"
                    aria-label="Return to Discussion browse">

                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                        <path d="M9 3.5L5 7.5l4 4M5.5 7.5H12"
                            stroke="currentColor"
                            stroke-width="1.45"
                            stroke-linecap="round"
                            stroke-linejoin="round"/>
                    </svg>

                    <span class="discussion-focus-back-desktop-label">
                        Back to browse
                    </span>

                    <span class="discussion-focus-back-mobile-label"
                        id="discussion-focus-back-mobile-label">
                        Browse
                    </span>
                </button>

                <div class="discussion-focus-provenance">
                    <span class="discussion-focus-stage" id="discussion-focus-stage"></span>

                    <span class="discussion-focus-separator" aria-hidden="true">
                        ·
                    </span>

                    <span class="discussion-focus-set-title" id="discussion-focus-set-title"></span>
                </div>

                <p class="discussion-focus-position" id="discussion-focus-position"></p>
            </header>

            <main class="discussion-focus-main" id="discussion-focus-main">
                <article class="discussion-focus-content">
                    <p class="discussion-focus-activity-eyebrow">
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                            <path d="M6.5 1.5L7.2 5.1L10.8 5.8L7.2 6.5L6.5 10.1L5.8 6.5L2.2 5.8L5.8 5.1Z"
                                stroke="currentColor"
                                stroke-width="1.1"
                                stroke-linejoin="round"/>
                        </svg>

                        <span id="discussion-focus-activity-eyebrow-label">
                            Make It Real
                        </span>
                    </p>

                    <div class="discussion-focus-card-header">
                        <h1 class="discussion-focus-title" id="discussion-focus-title"
                            tabindex="-1"></h1>
                    </div>

                    <p class="discussion-focus-question" id="discussion-focus-question"></p>

                    <div class="discussion-focus-upgrade focus-view-upgrade"
                        id="discussion-focus-upgrade"></div>

                    <div class="discussion-focus-continuation-controls"
                        id="discussion-focus-continuation-controls" hidden></div>
                </article>
            </main>

            <footer class="discussion-focus-footer">
                <button class="discussion-focus-nav-btn discussion-focus-prev"
                    id="discussion-focus-prev-btn" type="button"
                    onclick="navigateDiscussionFocus(-1)">

                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M8.5 3L4.5 7l4 4"
                            stroke="currentColor"
                            stroke-width="1.4"
                            stroke-linecap="round"
                            stroke-linejoin="round"/>
                    </svg>

                    Previous
                </button>

                <button class="btn-mark-explored discussion-focus-explored-btn"
                    id="discussion-focus-explored-btn" type="button"
                    onclick="toggleDiscussionFocusExplored()"
                    aria-pressed="false">

                    <svg class="explored-state-icon" width="13" height="13"
                        viewBox="0 0 13 13" fill="none" aria-hidden="true">
                        <circle cx="6.5" cy="6.5" r="4.35"
                            stroke="currentColor"
                            stroke-width="1.35"/>
                    </svg>

                    Mark explored
                </button>

                <button class="discussion-focus-nav-btn discussion-focus-next"
                    id="discussion-focus-next-btn" type="button"
                    onclick="navigateDiscussionFocus(1)">

                    Next

                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M5.5 3l4 4-4 4"
                            stroke="currentColor"
                            stroke-width="1.4"
                            stroke-linecap="round"
                            stroke-linejoin="round"/>
                    </svg>
                </button>
            </footer>
        </section>
    </div>

    <!-- ============================================================
     VIEW 4: CULTURAL LENS
     ============================================================ -->

    <div id="view-cultural-lens" class="view view-inner-bg">
        <div id="mob-header-cultural-lens" class="mobile-header-shell"></div>
        <div id="nav-cultural-lens" class="nav-shell"></div>

        <div class="section-wrap" id="cultural-lens-browse-view">
            <div class="section-stage">
                <div class="section-header">
                    <p class="section-eyebrow" id="cl-section-eyebrow">Cultural Lens</p>
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

        <section class="discussion-focus-view cultural-lens-focus-view"
            id="cultural-lens-focus-view"
            aria-labelledby="cultural-lens-focus-title" hidden>

            <header class="discussion-focus-header">
                <button class="discussion-focus-back" id="cultural-lens-focus-back-btn"
                    type="button" onclick="handleCulturalLensFocusBack()"
                    title="Back to browse"
                    aria-label="Return to Cultural Lens browse">

                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                        <path d="M9 3.5L5 7.5l4 4M5.5 7.5H12"
                            stroke="currentColor"
                            stroke-width="1.45"
                            stroke-linecap="round"
                            stroke-linejoin="round"/>
                    </svg>

                    <span class="discussion-focus-back-desktop-label">
                        Back to browse
                    </span>

                    <span class="discussion-focus-back-mobile-label"
                        id="cultural-lens-focus-back-mobile-label">
                        Browse
                    </span>
                </button>

                <div class="discussion-focus-provenance">
                    <span class="discussion-focus-stage" id="cultural-lens-focus-stage"></span>

                    <span class="discussion-focus-separator" aria-hidden="true">
                        ·
                    </span>

                    <span class="discussion-focus-set-title"
                        id="cultural-lens-focus-heading"></span>
                </div>

                <p class="discussion-focus-position"
                    id="cultural-lens-focus-position"></p>
            </header>

            <main class="discussion-focus-main cultural-lens-focus-main"
                id="cultural-lens-focus-main">

                <article class="discussion-focus-content cultural-lens-focus-content">
                    <p class="cultural-lens-focus-context-line"
                        id="cultural-lens-focus-context-line"></p>

                    <div class="discussion-focus-card-header cultural-lens-focus-card-header">
                        <h1 class="discussion-focus-title cultural-lens-focus-title"
                            id="cultural-lens-focus-title" tabindex="-1"></h1>

                        <div class="discussion-focus-continuation-controls"
                            id="cultural-lens-focus-continuation-controls" hidden></div>
                    </div>

                    <p class="cultural-lens-focus-context"
                        id="cultural-lens-focus-context"></p>

                    <div class="cultural-lens-focus-question-block"
                        id="cultural-lens-focus-question-block">
                        <p class="cultural-lens-focus-question-label"
                            id="cultural-lens-focus-question-label">
                            Question
                        </p>

                        <div class="cultural-lens-focus-questions"
                            id="cultural-lens-focus-questions"></div>
                    </div>

                    <div class="cultural-lens-focus-tools">
                        <div class="discussion-focus-upgrade focus-view-upgrade cultural-lens-focus-upgrade"
                            id="cultural-lens-focus-upgrade"></div>

                        <section class="cultural-lens-focus-thread-panel"
                            id="cultural-lens-focus-thread-panel" hidden
                            aria-labelledby="cultural-lens-focus-thread-label">

                            <h2 class="cultural-lens-focus-thread-label"
                                id="cultural-lens-focus-thread-label">
                                Follow the Thread
                            </h2>

                            <div class="cultural-lens-focus-thread-questions"
                                id="cultural-lens-focus-thread-questions"></div>
                        </section>
                    </div>
                </article>
            </main>

            <footer class="discussion-focus-footer">
                <button class="discussion-focus-nav-btn discussion-focus-prev"
                    id="cultural-lens-focus-prev-btn" type="button"
                    onclick="navigateCulturalLensFocus(-1)">

                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M8.5 3L4.5 7l4 4"
                            stroke="currentColor"
                            stroke-width="1.4"
                            stroke-linecap="round"
                            stroke-linejoin="round"/>
                    </svg>

                    Previous
                </button>

                <button class="btn-mark-explored discussion-focus-explored-btn"
                    id="cultural-lens-focus-explored-btn" type="button"
                    onclick="toggleCulturalLensFocusExplored()"
                    aria-pressed="false">

                    <svg class="explored-state-icon" width="13" height="13"
                        viewBox="0 0 13 13" fill="none" aria-hidden="true">
                        <circle cx="6.5" cy="6.5" r="4.35"
                            stroke="currentColor"
                            stroke-width="1.35"/>
                    </svg>

                    Mark explored
                </button>

                <button class="discussion-focus-nav-btn discussion-focus-next"
                    id="cultural-lens-focus-next-btn" type="button"
                    onclick="navigateCulturalLensFocus(1)">

                    Next

                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M5.5 3l4 4-4 4"
                            stroke="currentColor"
                            stroke-width="1.4"
                            stroke-linecap="round"
                            stroke-linejoin="round"/>
                    </svg>
                </button>
            </footer>
        </section>
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
                    <svg class="reflection-illustration"
                        viewBox="0 0 160 88" fill="none">
                        <path class="reflection-stem"
                            d="M80 10V66"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round" />
                        <circle class="reflection-ring"
                            cx="80" cy="34" r="13"
                            stroke="currentColor"
                            stroke-width="2" />
                        <path class="reflection-chevron"
                            d="M50 56l30 22 30-22"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </div>

                <button id="reflection-complete-mark" class="reflection-complete-mark"
                    type="button"
                    onclick="returnToAtlasFromReflection()"
                    title="Return to Atlas"
                    aria-label="Return to Atlas">
                    <svg width="52" height="52" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M2.5 12V6.4C2.5 3.7 4.5 1.7 7 1.7C9.5 1.7 11.5 3.7 11.5 6.4V12"
                            stroke="currentColor"
                            stroke-width="1.25"
                            stroke-linecap="round"/>
                        <path d="M5 12V6.8C5 5.65 5.9 4.75 7 4.75C8.1 4.75 9 5.65 9 6.8V12"
                            stroke="currentColor"
                            stroke-width="1.15"
                            stroke-linecap="round"/>
                        <path d="M2 12H12"
                            stroke="currentColor"
                            stroke-width="1.25"
                            stroke-linecap="round"/>
                    </svg>
                </button>

                <p id="reflection-complete-kicker" class="reflection-complete-kicker">Wrapped up for now</p>
                <h2 id="reflection-title" aria-live="polite"></h2>
                <p id="reflection-summary" class="reflection-summary"></p>

                <div id="reflection-questions" class="reflection-questions"></div>

                <p id="reflection-progress-summary" class="reflection-progress-summary"></p>

                <div class="reflection-actions">
                    <button id="complete-lesson-btn" class="btn-primary" type="button" onclick="completeLesson()">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M8 2.25V12.5"
                                stroke="currentColor"
                                stroke-width="1.35"
                                stroke-linecap="round"/>
                            <circle cx="8" cy="5.25" r="2.15"
                                stroke="currentColor"
                                stroke-width="1.35"/>
                            <path d="M4.5 10.25L8 13l3.5-2.75"
                                stroke="currentColor"
                                stroke-width="1.35"
                                stroke-linecap="round"
                                stroke-linejoin="round"/>
                        </svg>
                        Wrap up this subject
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
     LIVE MANIPULATION STATUS
     Appears only when this session has temporary content changes.
     ============================================================ -->

    <div class="atlas-live-changes-control"
        id="atlas-live-changes-control" hidden>
        <span class="atlas-live-changes-info"
            tabindex="0"
            aria-describedby="atlas-live-changes-explanation">
            <span class="atlas-live-changes-count"
                id="atlas-live-changes-count">
                Live changes
            </span>

            <span class="atlas-live-changes-tooltip"
                id="atlas-live-changes-explanation"
                role="tooltip">
                Autosaved for this session and subject. They’ll still be here when you return, until you choose Restore.
            </span>
        </span>

        <button class="atlas-live-changes-restore"
            type="button"
            onclick="restoreLiveTutorContent()">
            Restore
        </button>
    </div>

    <!-- ============================================================
     MY VERSION AUTHORING
     Appears only while the tutor is deliberately editing My Version.
     ============================================================ -->

    <div class="atlas-my-version-bar"
        id="atlas-my-version-bar" hidden>
        <div class="atlas-my-version-copy">
            <strong>Editing My Version</strong>
            <span id="atlas-my-version-status">No changes yet</span>
        </div>

        <div class="atlas-my-version-actions">
            <button class="atlas-my-version-secondary"
                id="atlas-my-version-cover-action"
                type="button"
                onclick="handleMyVersionCoverAction()">
                Cover
            </button>

            <button class="atlas-my-version-secondary"
                id="atlas-my-version-cancel"
                type="button"
                onclick="cancelMyVersionEditing()">
                Cancel
            </button>

            <button class="atlas-my-version-primary"
                id="atlas-my-version-save"
                type="button"
                onclick="saveMyVersion()"
                disabled>
                Save My Version
            </button>
        </div>
    </div>

    <div class="atlas-my-version-dialog"
        id="atlas-my-version-start-dialog" hidden
        role="dialog"
        aria-modal="true"
        aria-labelledby="atlas-my-version-start-title"
        onclick="if(event.target === this) closeMyVersionStartDialog()">
        <div class="atlas-my-version-dialog-panel">
            <p class="atlas-my-version-dialog-kicker">MY VERSION</p>

            <h2 id="atlas-my-version-start-title">
                Start from here?
            </h2>

            <p class="atlas-my-version-dialog-copy">
                This lesson already has temporary changes. Choose what becomes the starting point for your reusable version.
            </p>

            <p class="atlas-my-version-dialog-meta"
                id="atlas-my-version-start-count"></p>

            <div class="atlas-my-version-dialog-actions">
                <button class="atlas-my-version-dialog-primary"
                    type="button"
                    onclick="beginMyVersionEditing(true)">
                    Use these Live Changes
                </button>

                <button class="atlas-my-version-dialog-secondary"
                    type="button"
                    onclick="beginMyVersionEditing(false)">
                    Keep them with this learner
                </button>

                <button class="atlas-my-version-dialog-cancel"
                    type="button"
                    onclick="closeMyVersionStartDialog()">
                    Cancel
                </button>
            </div>
        </div>
    </div>

    <div class="atlas-my-version-dialog"
        id="atlas-my-version-cover-dialog" hidden
        role="dialog"
        aria-modal="true"
        aria-labelledby="atlas-my-version-cover-title"
        onclick="if(event.target === this) closeMyVersionCoverDialog()">
        <div class="atlas-my-version-dialog-panel">
            <p class="atlas-my-version-dialog-kicker">MY VERSION</p>

            <h2 id="atlas-my-version-cover-title">
                Subject details
            </h2>

            <p class="atlas-my-version-dialog-copy">
                Edit the title and hook directly on the cover. These details control how your version appears in Atlas and Compass.
            </p>

            <label class="atlas-my-version-field">
                <span>Cover image URL or path</span>

                <input id="atlas-my-version-image-input"
                    type="text"
                    inputmode="url"
                    autocomplete="off">
            </label>

            <label class="atlas-my-version-field">
                <span>Library introduction</span>

                <textarea id="atlas-my-version-description-input"
                    rows="4"
                    maxlength="220"
                    autocomplete="off"></textarea>
            </label>

            <p class="atlas-my-version-dialog-error"
                id="atlas-my-version-cover-error" hidden></p>

            <div class="atlas-my-version-dialog-actions atlas-my-version-dialog-actions--compact">
                <button class="atlas-my-version-dialog-secondary"
                    type="button"
                    onclick="closeMyVersionCoverDialog()">
                    Cancel
                </button>

                <button class="atlas-my-version-dialog-primary"
                    type="button"
                    onclick="applyMyVersionCoverChanges()">
                    Apply details
                </button>
            </div>

            <div class="atlas-my-version-restore-section"
                id="atlas-my-version-restore-section" hidden>
                <p class="atlas-my-version-restore-label">
                    Version management
                </p>

                <p class="atlas-my-version-restore-copy">
                    Return this subject to the Atlas version and remove My Version.
                </p>

                <button class="atlas-my-version-restore-action"
                    type="button"
                    onclick="openRestoreAtlasOriginalDialog()">
                    Restore Atlas Original
                </button>
            </div>
        </div>
    </div>

    <div class="atlas-my-version-dialog"
        id="atlas-restore-original-dialog" hidden
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="atlas-restore-original-title"
        onclick="if(event.target === this) cancelRestoreAtlasOriginal()">
        <div class="atlas-my-version-dialog-panel">
            <p class="atlas-my-version-dialog-kicker">MY VERSION</p>

            <h2 id="atlas-restore-original-title">
                Restore Atlas Original?
            </h2>

            <p class="atlas-my-version-dialog-copy">
                This removes My Version, including any unpublished changes, and makes the Atlas subject your default again. Learner progress and Live Changes are not affected.
            </p>

            <div class="atlas-my-version-dialog-actions atlas-my-version-dialog-actions--compact">
                <button class="atlas-my-version-dialog-secondary"
                    type="button"
                    onclick="cancelRestoreAtlasOriginal()">
                    Keep My Version
                </button>

                <button class="atlas-my-version-dialog-danger"
                    id="atlas-restore-original-confirm"
                    type="button"
                    onclick="restoreAtlasOriginal()">
                    Restore original
                </button>
            </div>
        </div>
    </div>

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

    <!-- Shared safe-first session panel mounts here. -->
    <div id="atlas-session-panel-root"></div>
    `;
}
