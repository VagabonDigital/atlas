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

    function getTutorCreateIntroductionFromContext(context) {
        const candidate =
            context &&
            typeof context === 'object' &&
            !Array.isArray(context)
                ? context
                : {};

        const source =
            candidate.source &&
            typeof candidate.source === 'object' &&
            !Array.isArray(candidate.source)
                ? candidate.source
                : null;

        if (
            !source ||
            source.kind !== TUTOR_CREATE_SOURCE_KIND
        ) {
            return '';
        }

        return String(
            source.introduction ||
            candidate.premise ||
            ''
        ).trim();
    }

    function getTutorCreateSeedIntroduction() {
        return getTutorCreateIntroductionFromContext(
            window.AtlasGenerationContext
        );
    }

    function cloneWithTutorCreateIntroduction(
        document,
        introduction
    ) {
        const exactIntroduction =
            String(introduction || '').trim();

        if (
            !exactIntroduction ||
            !document ||
            typeof document !== 'object' ||
            Array.isArray(document)
        ) {
            return document;
        }

        let next = null;

        try {
            next = JSON.parse(
                JSON.stringify(document)
            );
        } catch {
            return document;
        }

        next.subjectCopy =
            next.subjectCopy &&
            typeof next.subjectCopy === 'object' &&
            !Array.isArray(next.subjectCopy)
                ? next.subjectCopy
                : {};

        next.subjectCopy.overview =
            next.subjectCopy.overview &&
            typeof next.subjectCopy.overview === 'object' &&
            !Array.isArray(next.subjectCopy.overview)
                ? next.subjectCopy.overview
                : {};

        next.subjectCopy.overview.intro = [
            exactIntroduction
        ];

        return next;
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
            const introduction =
                getTutorCreateSeedIntroduction();

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

    function patchTutorCreatePersistence() {
        const Subjects = window.AtlasTutorSubjects;

        if (
            !Subjects ||
            Subjects.__atlasTutorCreateHandoffPatched
        ) {
            return;
        }

        const originalCreateSubject =
            Subjects.createSubject;

        const originalSaveWorkingDraft =
            Subjects.saveWorkingDraft;

        const originalUpdateSubject =
            Subjects.updateSubject;

        if (typeof originalCreateSubject === 'function') {
            Subjects.createSubject = async function (input = {}) {
                const candidate =
                    input &&
                    typeof input === 'object' &&
                    !Array.isArray(input)
                        ? input
                        : {};

                const introduction =
                    getTutorCreateIntroductionFromContext(
                        candidate.metadata?.generationContext
                    );

                if (!introduction || !candidate.document) {
                    return originalCreateSubject.call(
                        this,
                        input
                    );
                }

                return originalCreateSubject.call(
                    this,
                    {
                        ...candidate,
                        document:
                            cloneWithTutorCreateIntroduction(
                                candidate.document,
                                introduction
                            )
                    }
                );
            };
        }

        if (
            typeof originalSaveWorkingDraft === 'function' &&
            typeof Subjects.getSubject === 'function'
        ) {
            Subjects.saveWorkingDraft = async function (
                subjectId,
                patch = {}
            ) {
                const candidate =
                    patch &&
                    typeof patch === 'object' &&
                    !Array.isArray(patch)
                        ? patch
                        : {};

                let introduction = '';

                try {
                    const subject =
                        await Subjects.getSubject(subjectId);

                    introduction =
                        getTutorCreateIntroductionFromContext(
                            subject?.metadata?.generationContext
                        );
                } catch { }

                if (!introduction || !candidate.document) {
                    return originalSaveWorkingDraft.call(
                        this,
                        subjectId,
                        patch
                    );
                }

                return originalSaveWorkingDraft.call(
                    this,
                    subjectId,
                    {
                        ...candidate,
                        document:
                            cloneWithTutorCreateIntroduction(
                                candidate.document,
                                introduction
                            )
                    }
                );
            };
        }

        if (
            typeof originalUpdateSubject === 'function' &&
            typeof Subjects.getSubject === 'function'
        ) {
            Subjects.updateSubject = async function (
                subjectId,
                patch = {}
            ) {
                const candidate =
                    patch &&
                    typeof patch === 'object' &&
                    !Array.isArray(patch)
                        ? patch
                        : {};

                let context =
                    candidate.metadata?.generationContext ||
                    null;

                if (!context) {
                    try {
                        const subject =
                            await Subjects.getSubject(subjectId);

                        context =
                            subject?.metadata?.generationContext ||
                            null;
                    } catch { }
                }

                const introduction =
                    getTutorCreateIntroductionFromContext(
                        context
                    );

                if (!introduction || !candidate.document) {
                    return originalUpdateSubject.call(
                        this,
                        subjectId,
                        patch
                    );
                }

                return originalUpdateSubject.call(
                    this,
                    subjectId,
                    {
                        ...candidate,
                        document:
                            cloneWithTutorCreateIntroduction(
                                candidate.document,
                                introduction
                            )
                    }
                );
            };
        }

        Subjects.__atlasTutorCreateHandoffPatched = true;
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
                    title: handoff.title,
                    introduction: handoff.introduction
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
        patchTutorCreatePersistence();

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
