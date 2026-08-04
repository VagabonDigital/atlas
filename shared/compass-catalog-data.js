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
        { id: 'culture-life', title: 'Culture & Life', order: 50 }
    ];

    const COMPASS_PILOT_ORDER = [
        'travel-exploration',
        'food-table',
        'humour-wit',
        'work-purpose',
        'technology-innovation',
        'stories-screen'
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
            hook: 'Explore what makes people laugh, why the same joke can feel friendly or hurtful, and how humour changes depending on who tells it and who hears it.'
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
            hook: 'Explore the technology people use every day — what it makes easier, what it changes, and what we gain, lose, depend on, or refuse.'
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
            hook: 'Explore what travel is really like — the surprises, problems, habits, people, and choices that can change a trip and stay with us afterwards.'
        },
        {
            id: 'home-place',
            title: 'Home & Place',
            categoryId: 'society-the-world',
            order: 90,
            hook: 'Talk about what makes somewhere home — neighbourhoods, roots and restlessness, the place you’d never leave and the one you’d never return to.'
        },

        {
            id: 'work-purpose',
            title: 'Work & Purpose',
            categoryId: 'work-time',
            order: 10,
            available: true,
            artId: 'work-toolkit',
            hook: 'Talk about the work people really do — hidden skills, fair pay, everyday effort, and what makes a job feel worth doing.'
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
            hook: 'Explore food, sharing, table rules, and who does the work — plus how meals can show care and become part of family and memory.'
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
            hook: 'Explore why stories stay with us — what pulls us in, what makes us stop, the endings we judge, and the characters and moments we remember.'
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
