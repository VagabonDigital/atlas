// ============================================================
// ATLAS CONTENT REGISTRY
// Seeds searchable/catalog metadata into AtlasBridge.
//
// Owns:
// - world catalog metadata
// - subject/game registry seeding
// - stale Compass subject cleanup
//
// Does NOT own:
// - UI rendering
// - sessions/progress
// - lesson content
// - search modal behavior
// ============================================================

(function () {
    'use strict';

    if (window.AtlasContentRegistry) return;

    let registered = false;

    const COMPASS_WORLD = {
        registryId: 'compass',
        id: 'compass',
        world: 'compass',
        type: 'world',
        title: 'Compass',
        description: 'Conversation subjects for thoughtful English, cultural reflection, and human communication.',
        status: 'available',
        launchUrl: 'compass/index.html'
    };

    const COMPASS_CATEGORIES = {
        'you-your-mind': 'You & Your Mind',
        'people-relationships': 'People & Relationships',
        'society-the-world': 'Society & the World',
        'work-time': 'Work & Time',
        'culture-life': 'Culture & Life'
    };

    const BUILT_COMPASS_SUBJECTS = new Set([
        'communication-expression',
        'body-language-emotions',
        'personality-character-traits',
        'family-belonging',
        'travel-exploration',
        'food-table'
    ]);

    const COMPASS_SUBJECTS = [
        ['personality-character-traits', 'Personality & Character Traits', 'you-your-mind', 10],
        ['identity-self-image', 'Identity & Self-Image', 'you-your-mind', 20],
        ['thinking-reasoning', 'Thinking & Reasoning', 'you-your-mind', 30],
        ['mindset-motivation', 'Mindset & Motivation', 'you-your-mind', 40],
        ['dreams-ambitions', 'Dreams & Ambitions', 'you-your-mind', 50],
        ['personal-growth-reflection', 'Personal Growth & Reflection', 'you-your-mind', 60],
        ['creativity-imagination', 'Creativity & Imagination', 'you-your-mind', 70],
        ['health-wellbeing', 'Health & Wellbeing', 'you-your-mind', 80],

        ['communication-expression', 'Communication & Expression', 'people-relationships', 10],
        ['body-language-emotions', 'Body Language & Emotions', 'people-relationships', 20],
        ['relationships-connection', 'Relationships & Connection', 'people-relationships', 30],
        ['love-romance', 'Love & Romance', 'people-relationships', 40],
        ['trust-loyalty', 'Trust & Loyalty', 'people-relationships', 50],
        ['conflict-resolution', 'Conflict & Resolution', 'people-relationships', 60],
        ['cultural-etiquette-social-norms', 'Cultural Etiquette & Social Norms', 'people-relationships', 70],
        ['conformity-rebellion', 'Conformity & Rebellion', 'people-relationships', 80],
        ['humour-wit', 'Humour & Wit', 'people-relationships', 90],
        ['family-belonging', 'Family & Belonging', 'people-relationships', 100],

        ['justice-ethics', 'Justice & Ethics', 'society-the-world', 10],
        ['society-values', 'Society & Values', 'society-the-world', 20],
        ['media-influence', 'Media & Influence', 'society-the-world', 30],
        ['history-human-experience', 'History & Human Experience', 'society-the-world', 40],
        ['environment-sustainability', 'Environment & Sustainability', 'society-the-world', 50],
        ['technology-innovation', 'Technology & Innovation', 'society-the-world', 60],
        ['education-learning', 'Education & Learning', 'society-the-world', 70],
        ['travel-exploration', 'Travel & Exploration', 'society-the-world', 80],
        ['home-place', 'Home & Place', 'society-the-world', 90],

        ['work-purpose', 'Work & Purpose', 'work-time', 10],
        ['workplace-dynamics-professionalism', 'Workplace Dynamics & Professionalism', 'work-time', 20],
        ['time-priorities', 'Time & Priorities', 'work-time', 30],
        ['habits-daily-routines', 'Habits & Daily Routines', 'work-time', 40],

        ['money-what-it-means', 'Money & What It Means', 'culture-life', 10],
        ['food-table', 'Food & The Table', 'culture-life', 20],
        ['music-what-it-means', 'Music & What It Means', 'culture-life', 30],
        ['stories-screen', 'Stories & Screen', 'culture-life', 40],
        ['sport-play-competition', 'Sport, Play & Competition', 'culture-life', 50],
        ['mortality-the-unknown', 'Mortality & The Unknown', 'culture-life', 60]
    ];

    function getBridge() {
        return window.AtlasBridge || null;
    }

    function pruneStaleCompassSubjects(Bridge, validIds) {
        if (
            !Bridge ||
            typeof Bridge.readRegistry !== 'function' ||
            typeof Bridge.writeRegistry !== 'function'
        ) {
            return;
        }

        try {
            const registry = Bridge.readRegistry();
            let changed = false;

            Object.keys(registry.items || {}).forEach(registryId => {
                const item = registry.items[registryId];

                if (
                    item &&
                    item.world === 'compass' &&
                    item.type === 'subject' &&
                    !validIds.has(registryId)
                ) {
                    delete registry.items[registryId];
                    changed = true;
                }
            });

            if (Array.isArray(registry.recentActivity)) {
                const nextRecent = registry.recentActivity.filter(activity => {
                    const id = activity && activity.registryId ? activity.registryId : '';
                    return !id.startsWith('compass:') || validIds.has(id);
                });

                if (nextRecent.length !== registry.recentActivity.length) {
                    registry.recentActivity = nextRecent;
                    changed = true;
                }
            }

            if (changed) {
                Bridge.writeRegistry(registry);
            }
        } catch (e) { }
    }

    function registerCompass() {
        const Bridge = getBridge();

        if (
            !Bridge ||
            typeof Bridge.upsertWorld !== 'function' ||
            typeof Bridge.upsertItem !== 'function'
        ) {
            return false;
        }

        Bridge.upsertWorld(COMPASS_WORLD);

        const validIds = new Set();

        COMPASS_SUBJECTS.forEach(([id, title, categoryId, order]) => {
            const registryId = `compass:${id}`;
            const built = BUILT_COMPASS_SUBJECTS.has(id);
            const categoryTitle = COMPASS_CATEGORIES[categoryId] || 'Compass';

            validIds.add(registryId);

            Bridge.upsertItem({
                registryId,
                world: 'compass',
                type: 'subject',
                id,
                title,
                status: built ? 'available' : 'soon',
                launchUrl: built ? `compass/${id}/index.html` : '',
                categoryId,
                categoryTitle,
                order,
                keywords: [
                    title,
                    categoryTitle,
                    built ? 'available' : 'coming soon'
                ]
            });
        });

        pruneStaleCompassSubjects(Bridge, validIds);

        return true;
    }

    function registerAll() {
        if (registered) return true;

        const ok = registerCompass();

        if (ok) {
            registered = true;
        }

        return ok;
    }

    window.AtlasContentRegistry = {
        registerAll,
        registerCompass
    };

    registerAll();
})();
