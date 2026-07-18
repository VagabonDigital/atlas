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

    const COMPASS_SUBJECTS = [
        // real subject objects go here
    ];

    function getCompassCategories() {
        return COMPASS_CATEGORIES.map(item => ({ ...item }));
    }

    function getCompassSubjects() {
        return COMPASS_SUBJECTS.map(item => ({ ...item }));
    }

    function getCompassCatalogMap() {
        return COMPASS_SUBJECTS.reduce((map, subject) => {
            map[subject.registryId] = { ...subject };
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
