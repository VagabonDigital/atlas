/* ============================================================
   ATLAS TUTOR CONTENT — CLOUD PROJECTION

   Keeps committed cloud My Versions projected into AtlasBridge so Compass
   reflects the same titles and My Version state across browsers.

   Signed-in cloud data is authoritative. This layer does not import or claim
   legacy browser-local committed versions. Working drafts and live
   manipulation remain browser/session-local by design.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasTutorContentCloudSync) return;

    const Store = window.AtlasTutorContent;
    const Authority = window.AtlasTutorContentCloudAuthority;
    const Cloud = window.AtlasCloud;

    if (!Store || !Authority || !Cloud || !Authority.local) {
        console.error(
            '[AtlasTutorContentCloudSync] Tutor Content cloud dependencies are unavailable.'
        );
        return;
    }

    const cloudApi = {
        getVersion:
            typeof Store.getVersion === 'function'
                ? Store.getVersion.bind(Store)
                : null,
        getWorkingDraft:
            typeof Store.getWorkingDraft === 'function'
                ? Store.getWorkingDraft.bind(Store)
                : null,
        saveVersion:
            typeof Store.saveVersion === 'function'
                ? Store.saveVersion.bind(Store)
                : null,
        deleteVersion:
            typeof Store.deleteVersion === 'function'
                ? Store.deleteVersion.bind(Store)
                : null,
        exportPortableData:
            typeof Store.exportPortableData === 'function'
                ? Store.exportPortableData.bind(Store)
                : null
    };

    let projectionPromise = null;

    function isPlainObject(value) {
        return Boolean(
            value &&
            typeof value === 'object' &&
            !Array.isArray(value)
        );
    }

    function cloneJson(value) {
        if (value === null || value === undefined) return value;
        return JSON.parse(JSON.stringify(value));
    }

    function cleanId(value) {
        return String(value || '').trim();
    }

    async function useCloud() {
        try {
            return Boolean(await Authority.useCloud());
        } catch {
            return false;
        }
    }

    function getCatalogSubjects() {
        const Catalog = window.CompassCatalogData;

        if (!Catalog) return [];

        if (typeof Catalog.getCompassSubjects === 'function') {
            const subjects = Catalog.getCompassSubjects();
            return Array.isArray(subjects) ? subjects : [];
        }

        if (typeof Catalog.getCompassCatalogMap === 'function') {
            return Object.values(
                Catalog.getCompassCatalogMap() || {}
            );
        }

        return [];
    }

    function canonicalRegistryId(subject) {
        const explicit = cleanId(subject?.registryId);
        if (explicit) return explicit;

        const id = cleanId(subject?.id);
        return id ? `compass:${id}` : '';
    }

    function projectCloudVersions(versions) {
        const Bridge = window.AtlasBridge;

        if (
            !Bridge ||
            typeof Bridge.readRegistry !== 'function' ||
            typeof Bridge.writeRegistry !== 'function'
        ) {
            return false;
        }

        try {
            window.AtlasContentRegistry?.registerCompass?.();
        } catch { }

        const registry = Bridge.readRegistry();
        registry.items = isPlainObject(registry.items)
            ? registry.items
            : {};

        const versionById = new Map(
            (Array.isArray(versions) ? versions : [])
                .filter(version =>
                    cleanId(version?.contentId).startsWith('compass:')
                )
                .map(version => [
                    cleanId(version.contentId),
                    version
                ])
        );

        getCatalogSubjects().forEach(subject => {
            const registryId = canonicalRegistryId(subject);
            if (!registryId) return;

            const existing = registry.items[registryId];
            if (!existing || existing.ownershipKind === 'my-subject') {
                return;
            }

            const canonicalTitle = String(
                subject?.title ||
                subject?.navTitle ||
                existing.title ||
                registryId
            ).trim();

            const canonicalNavTitle = String(
                subject?.navTitle ||
                canonicalTitle
            ).trim();

            const version = versionById.get(registryId) || null;

            if (!version) {
                const next = {
                    ...existing,
                    title: canonicalTitle,
                    navTitle: canonicalNavTitle,
                    hasMyVersion: false
                };

                delete next.myVersionRevision;
                delete next.myVersionUpdatedAt;

                registry.items[registryId] = next;
                return;
            }

            const overrides = isPlainObject(version.overrides)
                ? version.overrides
                : {};

            const document = isPlainObject(version.document)
                ? version.document
                : {};

            const title = String(
                overrides['module.title'] ??
                document?.module?.title ??
                canonicalTitle
            ).trim() || canonicalTitle;

            const navTitle = String(
                document?.module?.navTitle ||
                title ||
                canonicalNavTitle
            ).trim() || title;

            const description = String(
                overrides['module.catalogDescription'] ??
                document?.module?.catalogDescription ??
                overrides['cover.hook'] ??
                subject?.hook ??
                existing.description ??
                ''
            ).trim();

            registry.items[registryId] = {
                ...existing,
                title,
                navTitle,
                ...(description ? { description } : {}),
                hasMyVersion: true,
                myVersionRevision: Math.max(
                    0,
                    Math.floor(Number(version.revision) || 0)
                ),
                myVersionUpdatedAt: Math.max(
                    0,
                    Number(version.updatedAt) || 0
                )
            };
        });

        Bridge.writeRegistry(registry);
        return true;
    }

    function refreshVisibleSurfaces() {
        window.requestAnimationFrame(() => {
            try {
                if (typeof window.renderHub === 'function') {
                    void window.renderHub();
                }
            } catch { }

            try {
                if (typeof window.renderHome === 'function') {
                    window.renderHome();
                }
            } catch { }
        });
    }

    async function refreshProjection() {
        if (!(await useCloud())) return [];

        if (projectionPromise) return projectionPromise;

        projectionPromise = Cloud.listTutorContentVersions()
            .then(versions => {
                projectCloudVersions(versions);
                refreshVisibleSurfaces();
                return versions || [];
            })
            .finally(() => {
                projectionPromise = null;
            });

        return projectionPromise;
    }

    async function getVersion(contentId) {
        const id = cleanId(contentId);
        if (!id) return null;

        if (!(await useCloud())) {
            return cloudApi.getVersion
                ? cloudApi.getVersion(id)
                : null;
        }

        return Cloud.getTutorContentVersion(id);
    }

    async function getWorkingDraft(contentId) {
        const id = cleanId(contentId);
        if (!id || !cloudApi.getWorkingDraft) return null;


        return cloudApi.getWorkingDraft(id);
    }

    async function saveVersion(contentId, patch = {}) {
        const id = cleanId(contentId);
        if (!id || !cloudApi.saveVersion) return null;

        if (!(await useCloud())) {
            return cloudApi.saveVersion(id, patch);
        }

        const current = await Cloud.getTutorContentVersion(id);
        const candidatePatch =
            !current &&
            !Object.prototype.hasOwnProperty.call(
                patch && typeof patch === 'object' ? patch : {},
                'document'
            )
                ? {
                    ...(patch && typeof patch === 'object' ? patch : {}),
                    document: {}
                }
                : patch;

        const saved = await cloudApi.saveVersion(
            id,
            candidatePatch
        );

        if (saved) {
            await refreshProjection();
        }

        return saved;
    }

    async function deleteVersion(contentId) {
        const id = cleanId(contentId);
        if (!id || !cloudApi.deleteVersion) return false;


        const deleted = await cloudApi.deleteVersion(id);

        if (deleted && await useCloud()) {
            await refreshProjection();
        }

        return deleted;
    }

    async function exportPortableData() {

        return cloudApi.exportPortableData
            ? cloudApi.exportPortableData()
            : null;
    }

    Store.getVersion = getVersion;
    Store.getWorkingDraft = getWorkingDraft;
    Store.saveVersion = saveVersion;
    Store.deleteVersion = deleteVersion;
    Store.exportPortableData = exportPortableData;
    Store.__atlasCloudSync = true;

    window.AtlasTutorContentCloudSync = Object.freeze({
        refreshProjection,
        getState() {
            return { active: true };
        }
    });

    void refreshProjection().catch(() => undefined);
})();
