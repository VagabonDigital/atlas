// ============================================================
// ARCADE CATALOG DATA
// The playable index beneath the Arcade hub.
//
// This file owns the games Arcade can launch and the artwork that
// identifies them. Arcade renders it. Atlas can reuse it.
// The bridge remains responsible for session state and progress.
// ============================================================

(function () {
    'use strict';

    if (window.ArcadeCatalogData) return;

    const ARCADE_GAME_ART = {
        tomorrow: `
            <svg class="game-artwork game-artwork--tomorrow"
                viewBox="0 0 180 150"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">

                <path class="tomorrow-orbit"
                    d="M27 104C49 129 87 136 122 120C141 111 153 95 158 77"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"/>

                <g class="tomorrow-dial">
                    <circle
                        cx="112"
                        cy="70"
                        r="39"
                        stroke="currentColor"
                        stroke-width="2.4"/>

                    <path
                        d="M112 31V41M112 99V109M73 70H83M141 70H151"
                        stroke="currentColor"
                        stroke-width="2.1"
                        stroke-linecap="round"/>

                    <path class="tomorrow-hand"
                        d="M112 70L135 48M112 70L94 82"
                        stroke="currentColor"
                        stroke-width="2.8"
                        stroke-linecap="round"/>

                    <circle
                        cx="112"
                        cy="70"
                        r="4"
                        fill="currentColor"/>
                </g>

                <path class="tomorrow-rift"
                    d="M57 32L70 47L61 59L75 74L65 89"
                    stroke="currentColor"
                    stroke-width="2.6"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>

                <path class="tomorrow-spark"
                    d="M145 27L148 36L157 39L148 42L145 51L142 42L133 39L142 36L145 27Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linejoin="round"/>
            </svg>
        `,

        truth: `
            <svg class="game-artwork game-artwork--truth"
                viewBox="0 0 180 150"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">

                <g class="truth-card truth-card--one">
                    <rect
                        x="38"
                        y="25"
                        width="99"
                        height="29"
                        rx="9"
                        stroke="currentColor"
                        stroke-width="2.3"/>

                    <circle
                        cx="54"
                        cy="39.5"
                        r="4"
                        fill="currentColor"/>

                    <path
                        d="M67 39.5H119"
                        stroke="currentColor"
                        stroke-width="2.3"
                        stroke-linecap="round"/>
                </g>

                <g class="truth-card truth-card--two">
                    <rect
                        x="48"
                        y="63"
                        width="99"
                        height="29"
                        rx="9"
                        stroke="currentColor"
                        stroke-width="2.3"/>

                    <circle
                        cx="64"
                        cy="77.5"
                        r="4"
                        fill="currentColor"/>

                    <path
                        d="M77 77.5H129"
                        stroke="currentColor"
                        stroke-width="2.3"
                        stroke-linecap="round"/>
                </g>

                <g class="truth-card truth-card--lie">
                    <rect
                        x="59"
                        y="101"
                        width="85"
                        height="28"
                        rx="9"
                        stroke="currentColor"
                        stroke-width="2.3"/>

                    <path
                        d="M75 111L84 120M84 111L75 120"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"/>

                    <path
                        d="M96 115.5H128"
                        stroke="currentColor"
                        stroke-width="2.3"
                        stroke-linecap="round"/>
                </g>

                <path class="truth-trapdoor truth-trapdoor--left"
                    d="M54 136H95L85 144H43L54 136Z"
                    stroke="currentColor"
                    stroke-width="2.1"
                    stroke-linejoin="round"/>

                <path class="truth-trapdoor truth-trapdoor--right"
                    d="M100 136H141L151 144H109L100 136Z"
                    stroke="currentColor"
                    stroke-width="2.1"
                    stroke-linejoin="round"/>
            </svg>
        `,

        choice: `
            <svg class="game-artwork game-artwork--choice"
                viewBox="0 0 180 150"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">

                <path class="choice-branch choice-branch--left"
                    d="M90 127V89L61 59"
                    stroke="currentColor"
                    stroke-width="2.7"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>

                <path class="choice-branch choice-branch--right"
                    d="M90 89L119 59"
                    stroke="currentColor"
                    stroke-width="2.7"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>

                <circle class="choice-pivot"
                    cx="90"
                    cy="89"
                    r="5"
                    fill="currentColor"/>

                <g class="choice-option choice-option--left">
                    <rect
                        x="20"
                        y="24"
                        width="62"
                        height="39"
                        rx="14"
                        stroke="currentColor"
                        stroke-width="2.4"/>

                    <circle
                        cx="51"
                        cy="43.5"
                        r="8"
                        stroke="currentColor"
                        stroke-width="2.3"/>
                </g>

                <g class="choice-option choice-option--right">
                    <rect
                        x="98"
                        y="24"
                        width="62"
                        height="39"
                        rx="14"
                        stroke="currentColor"
                        stroke-width="2.4"/>

                    <path
                        d="M129 34L139 43.5L129 53L119 43.5L129 34Z"
                        stroke="currentColor"
                        stroke-width="2.3"
                        stroke-linejoin="round"/>
                </g>

                <path class="choice-ground"
                    d="M71 133H109"
                    stroke="currentColor"
                    stroke-width="2.3"
                    stroke-linecap="round"/>
            </svg>
        `
    };

    const ARCADE_GAMES = [
        {
            registryId: 'arcade:tomorrow-got-weird',
            title: 'Tomorrow Got Weird',
            premise: 'Step into strange future scenarios and decide what you would do next.',
            unitLabel: 'Scenarios',
            total: 25,
            artId: 'tomorrow',
            accent: '#7c3aed',
            order: 1,
            launchUrl: './tomorrow-got-weird/index.html'
        },
        {
            registryId: 'arcade:truth-trap',
            title: 'Truth Trap',
            premise: 'Two facts are true. One is a lie. Spot the fake and explain your reasoning.',
            unitLabel: 'Rounds',
            total: 20,
            artId: 'truth',
            accent: '#0891b2',
            order: 2,
            launchUrl: './truth-trap/index.html'
        },
        {
            registryId: 'arcade:would-you-rather',
            title: 'Would You Rather',
            premise: 'Choose between impossible options and explain what made you decide.',
            unitLabel: 'Questions',
            total: 50,
            artId: 'choice',
            accent: '#e85d3f',
            order: 3,
            launchUrl: './would-you-rather/index.html'
        }
    ];

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function getArcadeGames() {
        return clone(ARCADE_GAMES);
    }

    function getArcadeGameMap() {
        return ARCADE_GAMES.reduce((map, game) => {
            map[game.registryId] = clone(game);
            return map;
        }, {});
    }

    function getArcadeGameArt(artId) {
        return ARCADE_GAME_ART[artId] || '';
    }

    window.ArcadeCatalogData = {
        getArcadeGames,
        getArcadeGameMap,
        getArcadeGameArt
    };
})();
