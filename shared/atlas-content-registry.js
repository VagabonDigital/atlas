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
// - Tutor Layer → Compass create handoff
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

    const TUTOR_CREATE_HANDOFF_KEY =
        'atlas::tutorCreateHandoff::v1';

    const TUTOR_CREATE_SOURCE_KIND =
        'tutor-layer-handoff';

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

                const isOwnedSubject =
                    item &&
                    item.world === 'compass' &&
                    item.type === 'subject' &&
                    item.ownershipKind === 'my-subject';

                if (
                    item &&
                    item.world === 'compass' &&
                    item.type === 'subject' &&
                    !validIds.has(registryId) &&
                    !isOwnedSubject
                ) {
                    delete registry.items[registryId];
                    changed = true;
                }
            });

            if (Array.isArray(registry.recentActivity)) {
                const nextRecent = registry.recentActivity.filter(activity => {
                    const id =
                        activity && activity.registryId
                            ? activity.registryId
                            : '';

                    if (
                        !id.startsWith('compass:') ||
                        validIds.has(id)
                    ) {
                        return true;
                    }

                    const item =
                        registry.items?.[id] || null;

                    return (
                        activity?.ownershipKind === 'my-subject' ||
                        item?.ownershipKind === 'my-subject'
                    );
                });

                if (
                    nextRecent.length !==
                    registry.recentActivity.length
                ) {
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

    function getTutorCreateSeedIntroduction(subjectTitle = '') {
        const context =
            window.AtlasGenerationContext &&
            typeof window.AtlasGenerationContext === 'object' &&
            !Array.isArray(window.AtlasGenerationContext)
                ? window.AtlasGenerationContext
                : {};

        const source =
            context.source &&
            typeof context.source === 'object' &&
            !Array.isArray(context.source)
                ? context.source
                : null;

        if (
            !source ||
            source.kind !== TUTOR_CREATE_SOURCE_KIND
        ) {
            return '';
        }

        const seededTitle =
            String(source.title || '').trim();

        const currentTitle =
            String(subjectTitle || '').trim();

        if (
            seededTitle &&
            currentTitle &&
            seededTitle !== currentTitle
        ) {
            return '';
        }

        return String(
            context.premise || ''
        ).trim();
    }

    function patchTutorCreateGeneration() {
        const AI = window.AtlasAI;

        if (
            !AI ||
            AI.__atlasTutorCreateHandoffPatched ||
            typeof AI.generateOverview !== 'function'
        ) {
            return;
        }

        const originalGenerateOverview =
            AI.generateOverview;

        AI.generateOverview = async function (...args) {
            const options = args[0];

            const introduction =
                getTutorCreateSeedIntroduction(
                    options?.subject?.title
                );

            const generated =
                await originalGenerateOverview.apply(
                    this,
                    args
                );

            if (
                !introduction ||
                !generated ||
                typeof generated !== 'object' ||
                Array.isArray(generated)
            ) {
                return generated;
            }

            return {
                ...generated,
                intro: introduction
            };
        };

        AI.__atlasTutorCreateHandoffPatched = true;
    }

    function cleanTutorCreateHandoffUrl() {
        try {
            const url = new URL(window.location.href);

            if (
                url.searchParams.get('create') !== 'tutor'
            ) {
                return false;
            }

            url.searchParams.delete('create');

            window.history.replaceState(
                window.history.state,
                '',
                url.href
            );

            return true;
        } catch {
            return false;
        }
    }

    function readTutorCreateHandoff() {
        let raw = null;

        try {
            raw = sessionStorage.getItem(
                TUTOR_CREATE_HANDOFF_KEY
            );

            sessionStorage.removeItem(
                TUTOR_CREATE_HANDOFF_KEY
            );
        } catch {
            return null;
        }

        if (!raw) return null;

        let candidate = null;

        try {
            candidate = JSON.parse(raw);
        } catch {
            return null;
        }

        if (
            !candidate ||
            typeof candidate !== 'object' ||
            Array.isArray(candidate) ||
            Number(candidate.version) !== 1
        ) {
            return null;
        }

        const title =
            String(candidate.title || '').trim();

        if (!title) return null;

        return {
            version: 1,
            title,
            introduction:
                String(
                    candidate.introduction || ''
                ).trim()
        };
    }

    function openTutorCreateHandoff() {
        let isTutorCreate = false;

        try {
            isTutorCreate =
                new URL(window.location.href)
                    .searchParams
                    .get('create') === 'tutor';
        } catch { }

        if (!isTutorCreate) return;

        const handoff = readTutorCreateHandoff();
        cleanTutorCreateHandoffUrl();

        if (
            !handoff ||
            typeof window.openCreateSubjectDialog !== 'function'
        ) {
            return;
        }

        window.scrollTo(0, 0);

        window.openCreateSubjectDialog(
            null,
            '',
            null,
            ''
        );

        const dialog = document.getElementById(
            'owned-subject-dialog'
        );

        const input = dialog?.querySelector(
            '#owned-subject-dialog-input'
        );

        if (!dialog || !input) return;

        input.value = handoff.title;

        if (
            handoff.introduction &&
            typeof ownedSubjectDialogState !== 'undefined' &&
            ownedSubjectDialogState?.mode === 'create'
        ) {
            ownedSubjectDialogState.suggestion = {
                title: handoff.title,
                premise: handoff.introduction,
                source: {
                    kind: TUTOR_CREATE_SOURCE_KIND,
                    title: handoff.title
                }
            };

            const releaseHandoffIntroduction = () => {
                if (
                    String(input.value || '').trim() ===
                    handoff.title
                ) {
                    return;
                }

                if (
                    typeof ownedSubjectDialogState !== 'undefined' &&
                    ownedSubjectDialogState?.mode === 'create' &&
                    ownedSubjectDialogState.suggestion?.source?.kind ===
                    TUTOR_CREATE_SOURCE_KIND
                ) {
                    ownedSubjectDialogState.suggestion = null;
                }

                input.removeEventListener(
                    'input',
                    releaseHandoffIntroduction
                );
            };

            input.addEventListener(
                'input',
                releaseHandoffIntroduction
            );
        }

        requestAnimationFrame(() => {
            window.scrollTo(0, 0);
            input.focus();
            input.setSelectionRange(
                input.value.length,
                input.value.length
            );
        });
    }

    function installTutorCreateHandoff() {
        patchTutorCreateGeneration();

        window.addEventListener(
            'load',
            openTutorCreateHandoff,
            { once: true }
        );
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

    installTutorCreateHandoff();
    registerAll();
})();
