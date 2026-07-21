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

    const RAW_SUBJECTS = [
        {
            id: 'personality-character-traits',
            title: 'Personality & Character Traits',
            categoryId: 'you-your-mind',
            order: 10,
            available: true,
            hook: 'Talk about temperament, charm, stubbornness, reliability, and the stable traits that make someone “who they are.”'
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
            available: true,
            hook: 'Explore how people explain themselves, choose words, handle misunderstanding, and shape the feeling of a conversation.'
        },
        {
            id: 'body-language-emotions',
            title: 'Body Language & Emotions',
            categoryId: 'people-relationships',
            order: 20,
            available: true,
            hook: 'Read the small signals people send through posture, expression, eye contact, distance, and emotional tone.'
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
            hook: 'Explore why people find different things funny, how humour bonds or wounds, and why the line between a joke and an insult moves.'
        },
        {
            id: 'family-belonging',
            title: 'Family & Belonging',
            categoryId: 'people-relationships',
            order: 100,
            available: true,
            hook: 'Talk about kin, inherited obligation, family roles and scripts, what gets passed down, and the belonging you didn’t choose.'
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
            hook: 'Discuss how invention reshapes life — convenience vs. dependence, the device in your hand, and what each leap gives and takes.'
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
            hook: 'Explore the pull of elsewhere — discovery, escape, culture shock, tourist vs. traveller, and what a journey reveals.'
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
            hook: 'Talk about what work means to people — vocation, duty, pride, or just a wage — and why the same job feels different to different people.'
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
            hook: 'Explore food as memory and belonging — the dish that means home, hospitality, the awkward dinner, and the politics of who cooks and who’s fed.'
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
            hook: 'Explore why story grips us — the characters we can’t forget, why endings matter, and the world you didn’t want to leave.'
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
        return clone(COMPASS_SUBJECTS);
    }

    function getCompassCatalogMap() {
        return COMPASS_SUBJECTS.reduce((map, subject) => {
            map[subject.registryId] = clone(subject);
            return map;
        }, {});
    }

    function getBuiltCompassSubjectSlugs() {
        return COMPASS_SUBJECTS
            .filter(subject => subject.status === 'available')
            .map(subject => subject.id);
    }

    window.CompassCatalogData = {
        getCompassCategories,
        getCompassSubjects,
        getCompassCatalogMap,
        getBuiltCompassSubjectSlugs
    };
})();
