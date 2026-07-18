// ============================================================
// ATLAS CONTENT REGISTRY
// Seeds searchable/catalog metadata into AtlasBridge.
//
// Reads:
// - window.CompassCatalogData
//
// Owns:
// - world/item registry seeding
// - stale Compass subject cleanup
//
// Does NOT own:
// - Compass hub rendering
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

    function getBridge() {
        return window.AtlasBridge || null;
    }

    function getCompassCatalogData() {
        const Catalog = window.CompassCatalogData;

        if (!Catalog || typeof Catalog.getCompassSubjects !== 'function') {
            return {
                categories: [],
                subjects: []
            };
        }

        return {
            categories: typeof Catalog.getCompassCategories === 'function'
                ? Catalog.getCompassCategories()
                : [],
            subjects: Catalog.getCompassSubjects()
        };
    }

    function getCategoryTitleMap(categories) {
        return (Array.isArray(categories) ? categories : []).reduce((map, category) => {
            if (category && category.id) {
                map[category.id] = category.title || 'Compass';
            }

            return map;
        }, {});
    }

    function normalizeSubjectForRegistry(subject, categoryTitles) {
        if (!subject || typeof subject !== 'object') return null;

        const id = String(
            subject.id ||
            String(subject.registryId || '').replace(/^compass:/, '')
        ).trim();

        if (!id) return null;

        const registryId = subject.registryId || `compass:${id}`;
        const title = subject.title || subject.navTitle || id;
        const status = subject.status === 'available' ? 'available' : 'soon';
        const categoryId = subject.categoryId || '';
        const categoryTitle = subject.categoryTitle || categoryTitles[categoryId] || 'Compass';

        const launchUrl = status === 'available'
            ? (subject.launchUrl || `compass/${id}/index.html`)
            : '';

        const keywords = Array.isArray(subject.keywords)
            ? subject.keywords
            : [
                title,
                categoryTitle,
                status === 'available' ? 'available' : 'coming soon'
            ];

        return {
            registryId,
            world: 'compass',
            type: 'subject',
            id,
            title,
            navTitle: subject.navTitle || title,
            status,
            launchUrl,
            categoryId,
            categoryTitle,
            keywords
        };
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

        const { categories, subjects } = getCompassCatalogData();

        if (!Array.isArray(subjects) || !subjects.length) {
            return false;
        }

        const categoryTitles = getCategoryTitleMap(categories);
        const validIds = new Set();

        subjects.forEach(subject => {
            const item = normalizeSubjectForRegistry(subject, categoryTitles);

            if (!item) return;

            validIds.add(item.registryId);
            Bridge.upsertItem(item);
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
