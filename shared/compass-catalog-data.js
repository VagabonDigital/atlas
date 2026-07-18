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

    const AVAILABLE = new Set([
        'communication-expression',
        'body-language-emotions',
        'personality-character-traits',
        'family-belonging',
        'travel-exploration',
        'food-table'
    ]);

    const RAW_SUBJECTS = [
        ['personality-character-traits', 'Personality & Character Traits', 'you-your-mind', 10, 'Talk about temperament, charm, stubbornness, reliability, and the stable traits that make someone “who they are.”'],
        ['identity-self-image', 'Identity & Self-Image', 'you-your-mind', 20, 'Talk about how people present themselves, how they want to be seen, and the gap between the real you and the shown you.'],
        ['thinking-reasoning', 'Thinking & Reasoning', 'you-your-mind', 30, 'Look at logic, judgment, intuition, bias, doubt, and how people convince themselves they are being reasonable.'],
        ['mindset-motivation', 'Mindset & Motivation', 'you-your-mind', 40, 'Talk about drive, discipline, procrastination, effort, and what makes people start, persist, or stall.'],
        ['dreams-ambitions', 'Dreams & Ambitions', 'you-your-mind', 50, 'Talk about goals, the imagined future self, ambition vs. contentment, and the dreams people chase, change, or abandon.'],
        ['personal-growth-reflection', 'Personal Growth & Reflection', 'you-your-mind', 60, 'Explore how people change over time — the turning points, the things people grow out of, and the gap between who they were and who they became.'],
        ['creativity-imagination', 'Creativity & Imagination', 'you-your-mind', 70, 'Explore ideas, originality, taste, inspiration, creative courage and block, and how imagination becomes something real.'],
        ['health-wellbeing', 'Health & Wellbeing', 'you-your-mind', 80, 'Explore how societies decide what “being healthy” means — the fads, the quack cures, and the advice that was confident and wrong.'],

        ['communication-expression', 'Communication & Expression', 'people-relationships', 10, 'Explore how people explain themselves, choose words, handle misunderstanding, and shape the feeling of a conversation.'],
        ['body-language-emotions', 'Body Language & Emotions', 'people-relationships', 20, 'Read the small signals people send through posture, expression, eye contact, distance, and emotional tone.'],
        ['relationships-connection', 'Relationships & Connection', 'people-relationships', 30, 'Talk about closeness, friendship, drifting apart, one-sided effort, and what keeps a bond alive over time.'],
        ['love-romance', 'Love & Romance', 'people-relationships', 40, 'Talk about attraction, chemistry, falling in and out of love, longing, heartbreak, and how courtship differs by culture and era.'],
        ['trust-loyalty', 'Trust & Loyalty', 'people-relationships', 50, 'Look at how trust is earned, signalled, and read — who we rely on, and why it is so slow to rebuild once broken.'],
        ['conflict-resolution', 'Conflict & Resolution', 'people-relationships', 60, 'Look at how people clash and what happens after — escalation, avoidance, who apologises first, and the rift that never closed.'],
        ['cultural-etiquette-social-norms', 'Cultural Etiquette & Social Norms', 'people-relationships', 70, 'Compare the written and unwritten rules people follow — manners, greetings, gifts — and what happens when codes collide.'],
        ['conformity-rebellion', 'Conformity & Rebellion', 'people-relationships', 80, 'Talk about fitting in, pushing back, social pressure, and the moments when people decide not to follow the script.'],
        ['humour-wit', 'Humour & Wit', 'people-relationships', 90, 'Explore why people find different things funny, how humour bonds or wounds, and why the line between a joke and an insult moves.'],
        ['family-belonging', 'Family & Belonging', 'people-relationships', 100, 'Talk about kin, inherited obligation, family roles and scripts, what gets passed down, and the belonging you didn’t choose.'],

        ['justice-ethics', 'Justice & Ethics', 'society-the-world', 10, 'Discuss fairness, responsibility, punishment and mercy, and what people do when the right answer is not simple.'],
        ['society-values', 'Society & Values', 'society-the-world', 20, 'Explore status, class, reputation, respect, success, and the values a society rewards or quietly punishes.'],
        ['media-influence', 'Media & Influence', 'society-the-world', 30, 'Explore persuasion, advertising, the feed, outrage, trust, and how repetition shapes what people believe and want.'],
        ['history-human-experience', 'History & Human Experience', 'society-the-world', 40, 'Use the past to discuss memory, change, and what societies remember, bury, and repeat across generations.'],
        ['environment-sustainability', 'Environment & Sustainability', 'society-the-world', 50, 'Discuss how people relate to the natural world — reverence vs. exploitation, the throwaway vs. repair instinct, and the question of limits.'],
        ['technology-innovation', 'Technology & Innovation', 'society-the-world', 60, 'Discuss how invention reshapes life — convenience vs. dependence, the device in your hand, and what each leap gives and takes.'],
        ['education-learning', 'Education & Learning', 'society-the-world', 70, 'Explore what school is really for, how learning should happen, the teacher who mattered, and what school got wrong.'],
        ['travel-exploration', 'Travel & Exploration', 'society-the-world', 80, 'Explore the pull of elsewhere — discovery, escape, culture shock, tourist vs. traveller, and what a journey reveals.'],
        ['home-place', 'Home & Place', 'society-the-world', 90, 'Talk about what makes somewhere home — neighbourhoods, roots and restlessness, the place you’d never leave and the one you’d never return to.'],

        ['work-purpose', 'Work & Purpose', 'work-time', 10, 'Talk about what work means to people — vocation, duty, pride, or just a wage — and why the same job feels different to different people.'],
        ['workplace-dynamics-professionalism', 'Workplace Dynamics & Professionalism', 'work-time', 20, 'Discuss hierarchy, office politics, what “professional” means, and the unwritten rules between colleagues.'],
        ['time-priorities', 'Time & Priorities', 'work-time', 30, 'Talk about how time feels, waiting and lateness, busyness as status, and what people make time for — and what they don’t.'],
        ['habits-daily-routines', 'Habits & Daily Routines', 'work-time', 40, 'Talk about the texture of an ordinary day — the rituals you’d defend, the routine you didn’t know you had, how days differ across people and eras.'],

        ['money-what-it-means', 'Money & What It Means', 'culture-life', 10, 'Explore the social charge of money — why it’s taboo, splitting the bill, generosity vs. stinginess, and the windfall daydream.'],
        ['food-table', 'Food & The Table', 'culture-life', 20, 'Explore food as memory and belonging — the dish that means home, hospitality, the awkward dinner, and the politics of who cooks and who’s fed.'],
        ['music-what-it-means', 'Music & What It Means', 'culture-life', 30, 'Explore how music moves us and marks our lives — the song that takes you back, taste tribes, and the track you played to death.'],
        ['stories-screen', 'Stories & Screen', 'culture-life', 40, 'Explore why story grips us — the characters we can’t forget, why endings matter, and the world you didn’t want to leave.'],
        ['sport-play-competition', 'Sport, Play & Competition', 'culture-life', 50, 'Explore why humans play and compete — fandom and tribe, rivalry, winning and losing, and what being a good (or terrible) loser says.'],
        ['mortality-the-unknown', 'Mortality & The Unknown', 'culture-life', 60, 'Explore how people face what they can’t know — attitudes to death across cultures, superstition and ritual, and the appeal of the unexplained.']
    ];

    const COMPASS_SUBJECTS = RAW_SUBJECTS.map(([id, title, categoryId, order, hook]) => {
        const available = AVAILABLE.has(id);

        return {
            id,
            registryId: `compass:${id}`,
            title,
            categoryId,
            order,
            durationLabel: '45–60 min',
            status: available ? 'available' : 'soon',
            launchUrl: available ? `compass/${id}/index.html` : '',
            hook,
            keywords: [
                title,
                categoryId.replace(/-/g, ' '),
                hook,
                available ? 'available' : 'coming soon'
            ]
        };
    });

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

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
