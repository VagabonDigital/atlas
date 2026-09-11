// ============================================================
// COMPASS CATALOG DATA
// The quiet map beneath the library.
//
// This file names the paths before they are opened.
// It does not teach, render, remember, or decide.
// It gives Atlas and Compass one shared index of what exists,
// what is ready, and what is still beyond the threshold.
//
// The gateway searches it.
// The library displays it.
// The bridge registers it.
// The lessons remain their own worlds.
// ============================================================

(function () {
    'use strict';

    if (window.CompassCatalogData) return;

    const COMPASS_CATEGORIES = [
        { id: 'you-your-mind', title: 'You & Your Mind', order: 10 },
        { id: 'people-relationships', title: 'People & Relationships', order: 20 },
        { id: 'society-the-world', title: 'Society & the World', order: 30 },
        { id: 'work-time', title: 'Work & Time', order: 40 },
        { id: 'culture-life', title: 'Culture & Life', order: 50 },
        { id: 'language-communication', title: 'Language & Communication', order: 60 }
    ];

    const COMPASS_PILOT_ORDER = [
        'game-theory',
        'odyssey-worth-the-hype',
        'stories-screen',
        'work-purpose',
        'business-meetings-clear-updates',
        'food-table',
        'technology-innovation',
        'modal-verbs-real-situations',
        'toefl-writing',
        'words-that-stick',
        'travel-exploration',
        'humour-wit',
        'job-interviews-clear-answers',
        'octopuses-change-colour'
    ];

    const COMPASS_SUBJECT_ART = {
        'travel-route': `
            <svg class="subject-artwork subject-artwork--travel"
                viewBox="0 0 180 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">

                <g class="travel-map">
                    <path
                        d="M20 35L63 24L107 38L160 25V107L111 120L66 106L20 119V35Z"
                        stroke="currentColor"
                        stroke-width="2.1"
                        stroke-linecap="round"
                        stroke-linejoin="round"/>

                    <path
                        d="M63 24L66 106M107 38L111 120"
                        stroke="currentColor"
                        stroke-width="1.75"
                        stroke-linecap="round"/>
                </g>

                <path class="travel-route"
                    d="M34 101C49 90 50 75 67 69C84 63 89 86 107 81C124 77 126 66 144 69"
                    pathLength="1"
                    stroke="currentColor"
                    stroke-width="2.7"
                    stroke-linecap="round"/>

                <circle class="travel-start"
                    cx="34"
                    cy="101"
                    r="4"
                    fill="currentColor"/>

                <g class="travel-pin">
                    <path
                        d="M144 30C136.3 30 130 35.8 130 43.3C130 53.1 144 69 144 69C144 69 158 53.1 158 43.3C158 35.8 151.7 30 144 30Z"
                        stroke="currentColor"
                        stroke-width="2.2"
                        stroke-linejoin="round"/>

                    <circle
                        cx="144"
                        cy="43"
                        r="4.5"
                        stroke="currentColor"
                        stroke-width="2"/>
                </g>

                <path class="travel-spark"
                    d="M158 15L160.5 22.5L168 25L160.5 27.5L158 35L155.5 27.5L148 25L155.5 22.5L158 15Z"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linejoin="round"/>
            </svg>
        `,

        'shared-pot': `
            <svg class="subject-artwork subject-artwork--food"
                viewBox="0 0 180 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">

                <g class="food-pot">
                    <path class="food-pot-body"
                        d="M54 70C55 93 66 111 90 111C114 111 125 93 126 70"
                        stroke="currentColor"
                        stroke-width="2.3"
                        stroke-linecap="round"
                        stroke-linejoin="round"/>

                    <ellipse class="food-pot-rim"
                        cx="90"
                        cy="70"
                        rx="36"
                        ry="10"
                        stroke="currentColor"
                        stroke-width="2.3"/>

                    <path class="food-pot-handle food-pot-handle--left"
                        d="M55 77C45 75 39 79 40 86C41 93 49 95 58 89"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"/>

                    <path class="food-pot-handle food-pot-handle--right"
                        d="M125 77C135 75 141 79 140 86C139 93 131 95 122 89"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"/>
                </g>

                <g class="food-lid">
                    <path
                        d="M61 56C67 43 78 36 90 36C102 36 113 43 119 56C104 62 76 62 61 56Z"
                        stroke="currentColor"
                        stroke-width="2.2"
                        stroke-linejoin="round"/>

                    <path
                        d="M83 36C84 30 87 27 90 27C93 27 96 30 97 36"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"/>
                </g>

                <g class="food-bowl food-bowl--left">
                    <ellipse
                        cx="35"
                        cy="101"
                        rx="19"
                        ry="6"
                        stroke="currentColor"
                        stroke-width="2"/>

                    <path
                        d="M16 101C18 114 25 121 35 121C45 121 52 114 54 101"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"/>
                </g>

                <g class="food-bowl food-bowl--right">
                    <ellipse
                        cx="143"
                        cy="96"
                        rx="17"
                        ry="5.5"
                        stroke="currentColor"
                        stroke-width="2"/>

                    <path
                        d="M126 96C128 108 134 114 143 114C152 114 158 108 160 96"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"/>
                </g>

                <g class="food-steam">
                    <path
                        d="M72 49C66 42 75 37 70 29"
                        pathLength="1"
                        stroke="currentColor"
                        stroke-width="1.9"
                        stroke-linecap="round"/>

                    <path
                        d="M89 46C83 39 93 34 88 24"
                        pathLength="1"
                        stroke="currentColor"
                        stroke-width="1.9"
                        stroke-linecap="round"/>

                    <path
                        d="M106 49C100 42 110 37 105 29"
                        pathLength="1"
                        stroke="currentColor"
                        stroke-width="1.9"
                        stroke-linecap="round"/>
                </g>
            </svg>
        `,

        'humour-reactions': `
            <svg class="subject-artwork subject-artwork--humour"
                viewBox="0 0 180 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">

                <g class="humour-jester">
                    <g class="humour-jester-point humour-jester-point--left">
                        <path
                            d="M65 91C52 78 40 61 38 42C53 48 68 63 77 84"
                            stroke="currentColor"
                            stroke-width="2.2"
                            stroke-linecap="round"
                            stroke-linejoin="round"/>

                        <circle
                            cx="38"
                            cy="42"
                            r="5.5"
                            stroke="currentColor"
                            stroke-width="2"/>

                        <circle
                            cx="38"
                            cy="42"
                            r="1.5"
                            fill="currentColor"/>
                    </g>

                    <g class="humour-jester-point humour-jester-point--centre">
                        <path
                            d="M76 84C77 62 84 38 94 20C106 40 112 63 108 86"
                            stroke="currentColor"
                            stroke-width="2.2"
                            stroke-linecap="round"
                            stroke-linejoin="round"/>

                        <circle
                            cx="94"
                            cy="20"
                            r="5.5"
                            stroke="currentColor"
                            stroke-width="2"/>

                        <circle
                            cx="94"
                            cy="20"
                            r="1.5"
                            fill="currentColor"/>
                    </g>

                    <g class="humour-jester-point humour-jester-point--right">
                        <path
                            d="M106 86C121 70 139 58 154 56C150 75 139 91 121 98"
                            stroke="currentColor"
                            stroke-width="2.2"
                            stroke-linecap="round"
                            stroke-linejoin="round"/>

                        <circle
                            cx="154"
                            cy="56"
                            r="5.5"
                            stroke="currentColor"
                            stroke-width="2"/>

                        <circle
                            cx="154"
                            cy="56"
                            r="1.5"
                            fill="currentColor"/>
                    </g>

                    <path class="humour-jester-band"
                        d="M54 87C73 81 103 82 126 92L120 110C100 118 75 116 54 107L54 87Z"
                        stroke="currentColor"
                        stroke-width="2.3"
                        stroke-linejoin="round"/>

                    <path class="humour-jester-fold"
                        d="M59 98C77 104 101 105 120 99"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"/>

                    <path class="humour-jester-spark"
                        d="M143 21L146 30L155 33L146 36L143 45L140 36L131 33L140 30L143 21Z"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linejoin="round"/>
                </g>
            </svg>
        `,

        'work-toolkit': `
            <svg class="subject-artwork subject-artwork--work"
                viewBox="0 0 180 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">

                <g class="work-document">
                    <rect
                        x="69"
                        y="27"
                        width="42"
                        height="46"
                        rx="5"
                        stroke="currentColor"
                        stroke-width="2"/>

                    <path
                        d="M79 41H101M79 50H101M79 59H94"
                        stroke="currentColor"
                        stroke-width="1.7"
                        stroke-linecap="round"/>
                </g>

                <path class="work-handle"
                    d="M68 51V42C68 34 74 28 82 28H98C106 28 112 34 112 42V51"
                    stroke="currentColor"
                    stroke-width="2.3"
                    stroke-linecap="round"/>

                <g class="work-briefcase">
                    <rect
                        x="27"
                        y="49"
                        width="126"
                        height="70"
                        rx="12"
                        stroke="currentColor"
                        stroke-width="2.3"/>

                    <path
                        d="M27 75H153"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"/>

                    <path
                        d="M79 75V83C79 87 82 90 86 90H94C98 90 101 87 101 83V75"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linejoin="round"/>

                    <rect class="work-latch work-latch--left"
                        x="54"
                        y="69"
                        width="13"
                        height="13"
                        rx="3"
                        stroke="currentColor"
                        stroke-width="1.9"/>

                    <rect class="work-latch work-latch--right"
                        x="113"
                        y="69"
                        width="13"
                        height="13"
                        rx="3"
                        stroke="currentColor"
                        stroke-width="1.9"/>

                    <path
                        d="M42 103H138"
                        stroke="currentColor"
                        stroke-width="1.7"
                        stroke-linecap="round"/>
                </g>
            </svg>
        `,

        'technology-circuit': `
            <svg class="subject-artwork subject-artwork--technology"
                viewBox="0 0 180 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">

                <rect class="technology-chip"
                    x="53"
                    y="34"
                    width="74"
                    height="72"
                    rx="14"
                    stroke="currentColor"
                    stroke-width="2.2"/>

                <rect class="technology-core"
                    x="70"
                    y="51"
                    width="40"
                    height="38"
                    rx="8"
                    stroke="currentColor"
                    stroke-width="2"/>

                <path class="technology-trace technology-trace--left-top"
                    d="M53 52H35V40H24"
                    pathLength="1"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>

                <path class="technology-trace technology-trace--left-bottom"
                    d="M53 87H35V101H22"
                    pathLength="1"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>

                <path class="technology-trace technology-trace--right-top"
                    d="M127 51H145V39H158"
                    pathLength="1"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>

                <path class="technology-trace technology-trace--right-bottom"
                    d="M127 87H145V101H159"
                    pathLength="1"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>

                <path class="technology-trace technology-trace--top"
                    d="M76 34V20M104 34V20"
                    pathLength="1"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"/>

                <path class="technology-trace technology-trace--bottom"
                    d="M76 106V120M104 106V120"
                    pathLength="1"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"/>

                <circle class="technology-node"
                    cx="24"
                    cy="40"
                    r="3.5"
                    fill="currentColor"/>

                <circle class="technology-node"
                    cx="22"
                    cy="101"
                    r="3.5"
                    fill="currentColor"/>

                <circle class="technology-node"
                    cx="158"
                    cy="39"
                    r="3.5"
                    fill="currentColor"/>

                <circle class="technology-node"
                    cx="159"
                    cy="101"
                    r="3.5"
                    fill="currentColor"/>

                <path class="technology-spark"
                    d="M139 13L142 22L151 25L142 28L139 37L136 28L127 25L136 22L139 13Z"
                    stroke="currentColor"
                    stroke-width="1.9"
                    stroke-linejoin="round"/>
            </svg>
        `,

        'stories-book-screen': `
            <svg class="subject-artwork subject-artwork--stories"
                viewBox="0 0 180 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">

                <g class="stories-screen">
                    <rect
                        x="48"
                        y="17"
                        width="112"
                        height="72"
                        rx="14"
                        stroke="currentColor"
                        stroke-width="2.2"/>

                    <path class="stories-play"
                        d="M94 38L116 53L94 68V38Z"
                        stroke="currentColor"
                        stroke-width="2.1"
                        stroke-linejoin="round"/>

                    <path
                        d="M91 89V100M117 89V100M79 103H129"
                        stroke="currentColor"
                        stroke-width="1.9"
                        stroke-linecap="round"/>
                </g>

                <g class="stories-book">
                    <path class="stories-page stories-page--left"
                        d="M19 72C37 67 56 69 77 80V122C57 112 38 110 19 116V72Z"
                        stroke="currentColor"
                        stroke-width="2.2"
                        stroke-linejoin="round"/>

                    <path class="stories-page stories-page--right"
                        d="M77 80C96 69 116 67 136 72V116C116 110 96 112 77 122V80Z"
                        stroke="currentColor"
                        stroke-width="2.2"
                        stroke-linejoin="round"/>

                    <path
                        d="M77 80V122"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"/>

                    <path
                        d="M33 86C45 83 55 84 66 89M33 97C45 94 55 95 66 100"
                        stroke="currentColor"
                        stroke-width="1.6"
                        stroke-linecap="round"/>

                    <path
                        d="M89 89C100 84 111 83 122 86M89 100C100 95 111 94 122 97"
                        stroke="currentColor"
                        stroke-width="1.6"
                        stroke-linecap="round"/>
                </g>

                <path class="stories-thread"
                    d="M34 113C42 126 61 132 79 126C96 120 104 109 117 105"
                    pathLength="1"
                    stroke="currentColor"
                    stroke-width="1.9"
                    stroke-linecap="round"/>
            </svg>
        `,

        'odyssey-voyage': `
            <svg class="subject-artwork subject-artwork--odyssey"
                viewBox="0 0 180 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">

                <g class="odyssey-ship">
                    <path
                        d="M38 91H143L128 108H57L38 91Z"
                        stroke="currentColor"
                        stroke-width="2.3"
                        stroke-linejoin="round"/>

                    <path
                        d="M89 35V91"
                        stroke="currentColor"
                        stroke-width="2.2"
                        stroke-linecap="round"/>

                    <path
                        d="M92 41C108 47 120 59 125 77H92V41Z"
                        stroke="currentColor"
                        stroke-width="2.1"
                        stroke-linejoin="round"/>

                    <path
                        d="M86 49C74 54 64 64 59 76H86V49Z"
                        stroke="currentColor"
                        stroke-width="1.9"
                        stroke-linejoin="round"/>

                    <path
                        d="M48 91C58 83 69 82 79 88"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"/>
                </g>

                <path class="odyssey-wave odyssey-wave--one"
                    d="M24 116C37 108 48 108 60 116C72 124 84 124 96 116C108 108 120 108 132 116C143 123 153 123 161 118"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"/>

                <path class="odyssey-wave odyssey-wave--two"
                    d="M32 126C44 120 55 120 66 126C78 132 90 132 102 126C114 120 126 120 138 126"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"/>

                <path class="odyssey-star"
                    d="M145 24L148 33L157 36L148 39L145 48L142 39L133 36L142 33L145 24Z"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linejoin="round"/>
            </svg>
        `,

        'modal-language': `
            <svg class="subject-artwork subject-artwork--modal"
                viewBox="0 0 180 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">

                <g class="modal-bubble modal-bubble--question">
                    <path
                        d="M28 35H95C103 35 109 41 109 49V73C109 81 103 87 95 87H63L47 100V87H28C20 87 14 81 14 73V49C14 41 20 35 28 35Z"
                        stroke="currentColor"
                        stroke-width="2.2"
                        stroke-linejoin="round"/>

                    <path
                        d="M53 54C54 47 60 44 67 44C75 44 80 48 80 54C80 62 70 63 68 69"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"/>

                    <circle
                        cx="68"
                        cy="76"
                        r="1.8"
                        fill="currentColor"/>
                </g>

                <g class="modal-bubble modal-bubble--rule">
                    <path
                        d="M103 64H151C159 64 165 70 165 78V99C165 107 159 113 151 113H134L122 123V113H103C95 113 89 107 89 99V78C89 70 95 64 103 64Z"
                        stroke="currentColor"
                        stroke-width="2.2"
                        stroke-linejoin="round"/>

                    <path
                        d="M127 76V94"
                        stroke="currentColor"
                        stroke-width="2.2"
                        stroke-linecap="round"/>

                    <circle
                        cx="127"
                        cy="102"
                        r="1.8"
                        fill="currentColor"/>
                </g>

                <path class="modal-shift"
                    d="M104 43C121 42 133 48 140 58"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"/>

                <path
                    d="M135 52L141 59L132 60"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>
            </svg>
        `,

        'octopus-signals': `
            <svg class="subject-artwork subject-artwork--octopus"
                viewBox="0 0 180 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">

                <path
                    d="M58 67C58 43 71 26 90 26C109 26 122 43 122 67C122 78 118 86 112 91H68C62 86 58 78 58 67Z"
                    stroke="currentColor"
                    stroke-width="2.3"
                    stroke-linejoin="round"/>

                <circle
                    cx="80"
                    cy="61"
                    r="3.5"
                    stroke="currentColor"
                    stroke-width="1.9"/>

                <circle
                    cx="100"
                    cy="61"
                    r="3.5"
                    stroke="currentColor"
                    stroke-width="1.9"/>

                <path
                    d="M69 88C60 99 58 110 65 120"
                    stroke="currentColor"
                    stroke-width="2.1"
                    stroke-linecap="round"/>

                <path
                    d="M80 90C73 103 77 116 87 122"
                    stroke="currentColor"
                    stroke-width="2.1"
                    stroke-linecap="round"/>

                <path
                    d="M91 91C88 105 92 117 101 122"
                    stroke="currentColor"
                    stroke-width="2.1"
                    stroke-linecap="round"/>

                <path
                    d="M102 90C111 101 112 114 105 123"
                    stroke="currentColor"
                    stroke-width="2.1"
                    stroke-linecap="round"/>

                <path
                    d="M111 87C124 94 130 106 124 118"
                    stroke="currentColor"
                    stroke-width="2.1"
                    stroke-linecap="round"/>

                <circle cx="70" cy="48" r="2" fill="currentColor"/>
                <circle cx="88" cy="38" r="2.5" fill="currentColor"/>
                <circle cx="107" cy="49" r="2" fill="currentColor"/>
                <circle cx="76" cy="75" r="1.8" fill="currentColor"/>
                <circle cx="104" cy="76" r="1.8" fill="currentColor"/>
            </svg>
        `,

        'interview-answers': `
            <svg class="subject-artwork subject-artwork--interview"
                viewBox="0 0 180 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">

                <g>
                    <path
                        d="M67 18H126C133 18 138 23 138 30V52C138 59 133 64 126 64H103L92 74V64H67C60 64 55 59 55 52V30C55 23 60 18 67 18Z"
                        stroke="currentColor"
                        stroke-width="2.2"
                        stroke-linejoin="round"/>

                    <path
                        d="M72 34H120M72 45H108"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"/>
                </g>

                <circle
                    cx="48"
                    cy="76"
                    r="11"
                    stroke="currentColor"
                    stroke-width="2.1"/>

                <path
                    d="M27 111C29 94 37 86 48 86C59 86 67 94 69 111"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"/>

                <circle
                    cx="128"
                    cy="76"
                    r="11"
                    stroke="currentColor"
                    stroke-width="2.1"/>

                <path
                    d="M107 111C109 94 117 86 128 86C139 86 147 94 149 111"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"/>

                <path
                    d="M20 111H160"
                    stroke="currentColor"
                    stroke-width="2.1"
                    stroke-linecap="round"/>

                <path
                    d="M76 99H100L106 111H70L76 99Z"
                    stroke="currentColor"
                    stroke-width="1.9"
                    stroke-linejoin="round"/>
            </svg>
        `,

        'meeting-decisions': `
            <svg class="subject-artwork subject-artwork--meeting"
                viewBox="0 0 180 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">

                <circle cx="46" cy="48" r="10"
                    stroke="currentColor"
                    stroke-width="2"/>

                <circle cx="90" cy="38" r="10"
                    stroke="currentColor"
                    stroke-width="2"/>

                <circle cx="134" cy="48" r="10"
                    stroke="currentColor"
                    stroke-width="2"/>

                <path
                    d="M29 79C31 66 37 59 46 59C55 59 61 66 63 79"
                    stroke="currentColor"
                    stroke-width="2.1"
                    stroke-linecap="round"/>

                <path
                    d="M73 72C75 59 81 52 90 52C99 52 105 59 107 72"
                    stroke="currentColor"
                    stroke-width="2.1"
                    stroke-linecap="round"/>

                <path
                    d="M117 79C119 66 125 59 134 59C143 59 149 66 151 79"
                    stroke="currentColor"
                    stroke-width="2.1"
                    stroke-linecap="round"/>

                <path
                    d="M35 84H145L132 116H48L35 84Z"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linejoin="round"/>

                <path
                    d="M73 96H107"
                    stroke="currentColor"
                    stroke-width="1.9"
                    stroke-linecap="round"/>

                <path
                    d="M78 105H101"
                    stroke="currentColor"
                    stroke-width="1.9"
                    stroke-linecap="round"/>

                <path
                    d="M118 26H151C155 26 158 29 158 33V45C158 49 155 52 151 52H140L134 58V52H118C114 52 111 49 111 45V33C111 29 114 26 118 26Z"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linejoin="round"/>
            </svg>
        `,

        'toefl-writing': `
            <svg class="subject-artwork subject-artwork--toefl"
                viewBox="0 0 180 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">

                <rect
                    x="43"
                    y="23"
                    width="94"
                    height="67"
                    rx="6"
                    stroke="currentColor"
                    stroke-width="2.2"/>

                <path
                    d="M57 40H105M57 51H116M57 62H101M57 73H110"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"/>

                <circle
                    cx="121"
                    cy="39"
                    r="9"
                    stroke="currentColor"
                    stroke-width="1.8"/>

                <path
                    d="M121 34V39L125 42"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>

                <path
                    d="M34 99H146L157 116H23L34 99Z"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linejoin="round"/>

                <path
                    d="M52 106H128M66 112H114"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"/>

                <path
                    d="M43 90H137"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"/>
            </svg>
        `,

        'words-that-stick': `
            <svg class="subject-artwork subject-artwork--vocabulary"
                viewBox="0 0 180 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">

                <path
                    d="M42 35C58 29 75 31 90 40V112C74 102 58 100 42 106V35Z"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linejoin="round"/>

                <path
                    d="M138 35C122 29 105 31 90 40V112C106 102 122 100 138 106V35Z"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linejoin="round"/>

                <path
                    d="M90 40V112"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"/>

                <circle
                    cx="90"
                    cy="66"
                    r="7"
                    stroke="currentColor"
                    stroke-width="2"/>

                <path
                    d="M83 66H66L57 55M97 66H114L123 55M83 70H67L57 82M97 70H113L123 82"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>

                <circle cx="55" cy="53" r="3" fill="currentColor"/>
                <circle cx="125" cy="53" r="3" fill="currentColor"/>
                <circle cx="55" cy="84" r="3" fill="currentColor"/>
                <circle cx="125" cy="84" r="3" fill="currentColor"/>
            </svg>
        `,

        'game-theory': `
            <svg class="subject-artwork subject-artwork--game-theory"
                viewBox="0 0 180 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">

                <g class="game-theory-die">
                    <path
                        d="M90 19L137 45L90 72L43 45L90 19Z"
                        stroke="currentColor"
                        stroke-width="2.3"
                        stroke-linejoin="round"/>

                    <path
                        d="M43 45L90 72V121L43 95V45Z"
                        stroke="currentColor"
                        stroke-width="2.3"
                        stroke-linejoin="round"/>

                    <path
                        d="M137 45L90 72V121L137 95V45Z"
                        stroke="currentColor"
                        stroke-width="2.3"
                        stroke-linejoin="round"/>

                    <circle cx="73" cy="39" r="3" fill="currentColor"/>
                    <circle cx="107" cy="39" r="3" fill="currentColor"/>
                    <circle cx="90" cy="55" r="3" fill="currentColor"/>

                    <circle cx="58" cy="64" r="3" fill="currentColor"/>
                    <circle cx="75" cy="74" r="3" fill="currentColor"/>
                    <circle cx="58" cy="80" r="3" fill="currentColor"/>
                    <circle cx="75" cy="90" r="3" fill="currentColor"/>
                    <circle cx="58" cy="96" r="3" fill="currentColor"/>
                    <circle cx="75" cy="106" r="3" fill="currentColor"/>

                    <circle cx="121" cy="64" r="3" fill="currentColor"/>
                    <circle cx="105" cy="77" r="3" fill="currentColor"/>
                    <circle cx="121" cy="83" r="3" fill="currentColor"/>
                    <circle cx="105" cy="96" r="3" fill="currentColor"/>
                    <circle cx="121" cy="102" r="3" fill="currentColor"/>
                </g>

                <path
                    d="M28 82C20 69 22 54 33 43"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"/>

                <path
                    d="M27 43H34V50"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>

                <path
                    d="M152 58C160 71 158 86 147 97"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"/>

                <path
                    d="M153 97H146V90"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>
            </svg>
        `
    };

    const RAW_SUBJECTS = [
        {
            id: 'personality-character-traits',
            title: 'Personality & Character Traits',
            categoryId: 'you-your-mind',
            order: 10,
            hook: 'Talk about first impressions, the small signs we use to judge people, and what makes us trust, doubt, or change our opinion of someone.'
        },
        {
            id: 'identity-self-image',
            title: 'Identity & Self-Image',
            categoryId: 'you-your-mind',
            order: 20,
            hook: 'Talk about how people present themselves, how they want to be seen, and the gap between the real you and the shown you.'
        },
        {
            id: 'thinking-reasoning',
            title: 'Thinking & Reasoning',
            categoryId: 'you-your-mind',
            order: 30,
            hook: 'Look at logic, judgment, intuition, bias, doubt, and how people convince themselves they are being reasonable.'
        },
        {
            id: 'mindset-motivation',
            title: 'Mindset & Motivation',
            categoryId: 'you-your-mind',
            order: 40,
            hook: 'Talk about drive, discipline, procrastination, effort, and what makes people start, persist, or stall.'
        },
        {
            id: 'dreams-ambitions',
            title: 'Dreams & Ambitions',
            categoryId: 'you-your-mind',
            order: 50,
            hook: 'Talk about goals, the imagined future self, ambition vs. contentment, and the dreams people chase, change, or abandon.'
        },
        {
            id: 'personal-growth-reflection',
            title: 'Personal Growth & Reflection',
            categoryId: 'you-your-mind',
            order: 60,
            hook: 'Explore how people change over time — the turning points, the things people grow out of, and the gap between who they were and who they became.'
        },
        {
            id: 'creativity-imagination',
            title: 'Creativity & Imagination',
            categoryId: 'you-your-mind',
            order: 70,
            hook: 'Explore ideas, originality, taste, inspiration, creative courage and block, and how imagination becomes something real.'
        },
        {
            id: 'health-wellbeing',
            title: 'Health & Wellbeing',
            categoryId: 'you-your-mind',
            order: 80,
            hook: 'Explore how societies decide what “being healthy” means — the fads, the quack cures, and the advice that was confident and wrong.'
        },

        {
            id: 'communication-expression',
            title: 'Communication & Expression',
            categoryId: 'people-relationships',
            order: 10,
            hook: 'Explore how words, tone, timing, and silence change a message — how we express ourselves, misunderstand others, and repair what went wrong.'
        },
        {
            id: 'body-language-emotions',
            title: 'Body Language & Emotions',
            categoryId: 'people-relationships',
            order: 20,
            hook: 'Explore how faces, voices, and body movements show feelings — what people cannot hide, what they show on purpose, and what others get wrong.'
        },
        {
            id: 'relationships-connection',
            title: 'Relationships & Connection',
            categoryId: 'people-relationships',
            order: 30,
            hook: 'Talk about closeness, friendship, drifting apart, one-sided effort, and what keeps a bond alive over time.'
        },
        {
            id: 'love-romance',
            title: 'Love & Romance',
            categoryId: 'people-relationships',
            order: 40,
            hook: 'Talk about attraction, chemistry, falling in and out of love, longing, heartbreak, and how courtship differs by culture and era.'
        },
        {
            id: 'trust-loyalty',
            title: 'Trust & Loyalty',
            categoryId: 'people-relationships',
            order: 50,
            hook: 'Look at how trust is earned, signalled, and read — who we rely on, and why it is so slow to rebuild once broken.'
        },
        {
            id: 'conflict-resolution',
            title: 'Conflict & Resolution',
            categoryId: 'people-relationships',
            order: 60,
            hook: 'Look at how people clash and what happens after — escalation, avoidance, who apologises first, and the rift that never closed.'
        },
        {
            id: 'cultural-etiquette-social-norms',
            title: 'Cultural Etiquette & Social Norms',
            categoryId: 'people-relationships',
            order: 70,
            hook: 'Compare the written and unwritten rules people follow — manners, greetings, gifts — and what happens when codes collide.'
        },
        {
            id: 'conformity-rebellion',
            title: 'Conformity & Rebellion',
            categoryId: 'people-relationships',
            order: 80,
            hook: 'Talk about fitting in, pushing back, social pressure, and the moments when people decide not to follow the script.'
        },
        {
            id: 'humour-wit',
            title: 'Humour & Wit',
            categoryId: 'people-relationships',
            order: 90,
            available: true,
            artId: 'humour-reactions',
            hook: 'What makes something funny can change from one room to another — timing, trust, culture, power, and personality can turn the same joke into something brilliant, awkward, kind, cruel, or pointless.'
        },
        {
            id: 'family-belonging',
            title: 'Family & Belonging',
            categoryId: 'people-relationships',
            order: 100,
            hook: 'Talk about family rules, roles, traditions, and the small signs that someone belongs — plus what families keep, change, or pass on.'
        },

        {
            id: 'justice-ethics',
            title: 'Justice & Ethics',
            categoryId: 'society-the-world',
            order: 10,
            hook: 'Discuss fairness, responsibility, punishment and mercy, and what people do when the right answer is not simple.'
        },
        {
            id: 'society-values',
            title: 'Society & Values',
            categoryId: 'society-the-world',
            order: 20,
            hook: 'Explore status, class, reputation, respect, success, and the values a society rewards or quietly punishes.'
        },
        {
            id: 'media-influence',
            title: 'Media & Influence',
            categoryId: 'society-the-world',
            order: 30,
            hook: 'Explore persuasion, advertising, the feed, outrage, trust, and how repetition shapes what people believe and want.'
        },
        {
            id: 'history-human-experience',
            title: 'History & Human Experience',
            categoryId: 'society-the-world',
            order: 40,
            hook: 'Use the past to discuss memory, change, and what societies remember, bury, and repeat across generations.'
        },
        {
            id: 'environment-sustainability',
            title: 'Environment & Sustainability',
            categoryId: 'society-the-world',
            order: 50,
            hook: 'Discuss how people relate to the natural world — reverence vs. exploitation, the throwaway vs. repair instinct, and the question of limits.'
        },
        {
            id: 'technology-innovation',
            title: 'Technology & Innovation',
            categoryId: 'society-the-world',
            order: 60,
            available: true,
            artId: 'technology-circuit',
            hook: 'Everyday technology solves problems while creating new habits, dependencies, boundaries, and trade-offs — changing what feels easy, what we rely on, and what we are willing to give up in return.'
        },
        {
            id: 'game-theory',
            title: 'Understanding Game Theory: Strategy, Trust & Choice',
            navTitle: 'Game Theory',
            categoryId: 'society-the-world',
            order: 65,
            available: true,
            artId: 'game-theory',
            hook: 'Game theory reveals how incentives, trust, cooperation and competition shape choices in everyday relationships, business and society—and why the best strategy is not always obvious.'
        },
        {
            id: 'education-learning',
            title: 'Education & Learning',
            categoryId: 'society-the-world',
            order: 70,
            hook: 'Explore what school is really for, how learning should happen, the teacher who mattered, and what school got wrong.'
        },
        {
            id: 'travel-exploration',
            title: 'Travel & Exploration',
            categoryId: 'society-the-world',
            order: 80,
            available: true,
            artId: 'travel-route',
            hook: 'A journey is shaped by more than a destination — surprises, problems, habits, people, and choices can challenge expectations, change a trip, and stay with us long after we return home.'
        },
        {
            id: 'home-place',
            title: 'Home & Place',
            categoryId: 'society-the-world',
            order: 90,
            hook: 'Talk about what makes somewhere home — neighbourhoods, roots and restlessness, the place you’d never leave and the one you’d never return to.'
        },
        {
            id: 'octopuses-change-colour',
            title: 'How Octopuses Change Colour',
            navTitle: 'Octopuses',
            categoryId: 'society-the-world',
            order: 100,
            available: true,
            artId: 'octopus-signals',
            hook: 'Explore how octopuses use colour, patterns, and skin texture to hide, communicate, and react to danger — and what their transformations reveal about intelligence and perception.'
        },

        {
            id: 'work-purpose',
            title: 'Work & Purpose',
            categoryId: 'work-time',
            order: 10,
            available: true,
            artId: 'work-toolkit',
            hook: 'A working life is built from more than a job title — hidden skills, fair pay, everyday effort, status, purpose, and trade-offs all shape whether work feels worthwhile, tolerable, or simply necessary.'
        },
        {
            id: 'workplace-dynamics-professionalism',
            title: 'Workplace Dynamics & Professionalism',
            categoryId: 'work-time',
            order: 20,
            hook: 'Discuss hierarchy, office politics, what “professional” means, and the unwritten rules between colleagues.'
        },
        {
            id: 'time-priorities',
            title: 'Time & Priorities',
            categoryId: 'work-time',
            order: 30,
            hook: 'Talk about how time feels, waiting and lateness, busyness as status, and what people make time for — and what they don’t.'
        },
        {
            id: 'habits-daily-routines',
            title: 'Habits & Daily Routines',
            categoryId: 'work-time',
            order: 40,
            hook: 'Talk about the texture of an ordinary day — the rituals you’d defend, the routine you didn’t know you had, how days differ across people and eras.'
        },
        {
            id: 'job-interviews-clear-answers',
            title: 'Job Interviews: Clear Answers Under Pressure',
            navTitle: 'Job Interviews',
            categoryId: 'work-time',
            order: 50,
            available: true,
            artId: 'interview-answers',
            hook: 'The choices, examples and speaking strategies that help candidates give clear, concise answers, stay composed, and respond effectively when interviewers ask difficult follow-up questions.'
        },
        {
            id: 'business-meetings-clear-updates',
            title: 'Business Meetings: Clear Updates, Questions & Decisions',
            navTitle: 'Business Meetings',
            categoryId: 'work-time',
            order: 60,
            available: true,
            artId: 'meeting-decisions',
            hook: 'The language and judgement behind effective meetings: giving concise updates, asking clarifying questions, challenging ideas professionally, and helping a group reach clear decisions.'
        },

        {
            id: 'money-what-it-means',
            title: 'Money & What It Means',
            categoryId: 'culture-life',
            order: 10,
            hook: 'Explore the social charge of money — why it’s taboo, splitting the bill, generosity vs. stinginess, and the windfall daydream.'
        },
        {
            id: 'food-table',
            title: 'Food & The Table',
            categoryId: 'culture-life',
            order: 20,
            available: true,
            artId: 'shared-pot',
            hook: 'Meals carry more than food: sharing, table rules, hospitality, and who does the work can reveal care, status, belonging, family habits, generosity, and the memories people keep long afterwards.'
        },
        {
            id: 'music-what-it-means',
            title: 'Music & What It Means',
            categoryId: 'culture-life',
            order: 30,
            hook: 'Explore how music moves us and marks our lives — the song that takes you back, taste tribes, and the track you played to death.'
        },
        {
            id: 'stories-screen',
            title: 'Stories & Screen',
            categoryId: 'culture-life',
            order: 40,
            available: true,
            artId: 'stories-book-screen',
            hook: 'Some stories disappear quickly; others stay vivid for years. Characters, choices, endings, images, and tiny moments can pull us in, divide us, and keep changing meaning long after the story ends.'
        },
        {
            id: 'sport-play-competition',
            title: 'Sport, Play & Competition',
            categoryId: 'culture-life',
            order: 50,
            hook: 'Explore why humans play and compete — fandom and tribe, rivalry, winning and losing, and what being a good (or terrible) loser says.'
        },
        {
            id: 'mortality-the-unknown',
            title: 'Mortality & The Unknown',
            categoryId: 'culture-life',
            order: 60,
            hook: 'Explore how people face what they can’t know — attitudes to death across cultures, superstition and ritual, and the appeal of the unexplained.'
        },
        {
            id: 'odyssey-worth-the-hype',
            title: 'The Odyssey: Worth the Hype?',
            navTitle: 'The Odyssey',
            categoryId: 'culture-life',
            order: 70,
            available: true,
            artId: 'odyssey-voyage',
            hook: 'Explore why a film adaptation of The Odyssey might capture our imagination — through epic journeys, unforgettable characters, and timeless questions about home, loyalty, temptation, and survival.'
        },

        {
            id: 'modal-verbs-real-situations',
            title: 'Using Modal Verbs in Real Situations',
            navTitle: 'Modal Verbs',
            categoryId: 'language-communication',
            order: 10,
            available: true,
            artId: 'modal-language',
            hook: 'Designed for A2 learners, with everyday situations where modal verbs change meaning and tone: asking for help, giving advice, talking about rules, and expressing ability, possibility, or obligation.'
        },
        {
            id: 'toefl-writing',
            title: 'TOEFL Writing: From Sentence to Argument',
            navTitle: 'TOEFL Writing',
            categoryId: 'language-communication',
            order: 20,
            available: true,
            artId: 'toefl-writing',
            hook: 'A practical look at turning clear sentences into organised, developed responses, with attention to tone, accuracy, structure and the decisions strong timed writing demands.'
        },
        {
            id: 'words-that-stick',
            title: 'Words That Stick: Advanced Vocabulary Through Roots & Stories',
            navTitle: 'Words That Stick',
            categoryId: 'language-communication',
            order: 30,
            available: true,
            artId: 'words-that-stick',
            hook: 'The origins, patterns and stories behind ambitious English words, with a focus on precise meaning, memorable connections and using new vocabulary naturally in real conversations.'
        }
    ];

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function getCategoryTitle(categoryId) {
        const category = COMPASS_CATEGORIES.find(item => item.id === categoryId);
        return category ? category.title : 'Compass';
    }

    const COMPASS_SUBJECTS = RAW_SUBJECTS.map(subject => {
        const available = subject.available === true;
        const categoryTitle = getCategoryTitle(subject.categoryId);

        return {
            id: subject.id,
            registryId: `compass:${subject.id}`,
            title: subject.title,
            navTitle: subject.navTitle || subject.title,
            categoryId: subject.categoryId,
            categoryTitle,
            order: subject.order,
            durationLabel: subject.durationLabel || '45–60 min',
            status: available ? 'available' : 'soon',
            launchUrl: available ? `compass/${subject.id}/index.html` : '',
            artId: subject.artId || '',
            hook: subject.hook || '',
            description: subject.hook || '',
            keywords: [
                subject.title,
                categoryTitle,
                subject.id.replace(/-/g, ' '),
                subject.hook || '',
                available ? 'available' : 'coming soon'
            ]
        };
    });

    function getCompassCategories() {
        return clone(COMPASS_CATEGORIES);
    }

    function getCompassSubjects() {
        const subjects = clone(COMPASS_SUBJECTS);
        const subjectsById = new Map(
            subjects.map(subject => [subject.id, subject])
        );

        const pilotSubjects = COMPASS_PILOT_ORDER
            .map(subjectId => subjectsById.get(subjectId))
            .filter(Boolean);

        const pilotIds = new Set(COMPASS_PILOT_ORDER);

        const remainingSubjects = subjects.filter(
            subject => !pilotIds.has(subject.id)
        );

        return [
            ...pilotSubjects,
            ...remainingSubjects
        ];
    }

    function getCompassCatalogMap() {
        return COMPASS_SUBJECTS.reduce((map, subject) => {
            map[subject.registryId] = clone(subject);
            return map;
        }, {});
    }

    function getCompassSubjectArt(artId) {
        return COMPASS_SUBJECT_ART[artId] || '';
    }

    function getBuiltCompassSubjectSlugs() {
        const availableIds = new Set(
            COMPASS_SUBJECTS
                .filter(subject => subject.status === 'available')
                .map(subject => subject.id)
        );

        return COMPASS_PILOT_ORDER.filter(
            subjectId => availableIds.has(subjectId)
        );
    }

    window.CompassCatalogData = {
        getCompassCategories,
        getCompassSubjects,
        getCompassCatalogMap,
        getCompassSubjectArt,
        getBuiltCompassSubjectSlugs
    };
})();