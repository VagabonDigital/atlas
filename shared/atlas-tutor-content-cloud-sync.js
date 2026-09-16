/* ============================================================
   ATLAS TUTOR CONTENT — CLOUD SYNC

   Transitional cutover layer for committed My Versions.

   Signed-in rules:
   - existing cloud versions are authoritative;
   - pre-account local committed versions may claim only missing rows;
   - fresh browsers project cloud My Versions into AtlasBridge so Compass
     immediately shows the same title / My Version state cross-browser;
   - working drafts and live manipulation remain browser/session-local;
   - override-only versions are allowed to use an empty document object,
     which Compass safely materializes against the canonical Atlas Original.
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

    const Local = Authority.local;
    const VERSION_PREFIX = 'atlas::tutorContent::version::';

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

    let initialClaimPromise = null;
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

    function listLocalVersionIds() {
        const ids = [];
        const seen = new Set();

        try {
            for (let index = 0; index < localStorage.length; index += 1) {
                const key = localStorage.key(index);
                if (!key || !key.startsWith(VERSION_PREFIX)) continue;

                let id = '';
                try {
                    id = decodeURIComponent(
                        key.slice(VERSION_PREFIX.length)
                    ).trim();
                } catch {
                    continue;
                }

                if (!id || seen.has(id)) continue;
                seen.add(id);
                ids.push(id);
            }
        } catch { }

        return ids.sort();
    }

    function cloudReadyEvent(detail) {
        try {
            window.dispatchEvent(
                new CustomEvent(
                    'atlas:tutor-content-cloud-ready',
                    { detail }
                )
            );
        } catch { }
    }

    function cloudErrorEvent(error, action, contentId = '') {
        try {
            window.dispatchEvent(
                new CustomEvent(
                    'atlas:tutor-content-cloud-error',
                    {
                        detail: {
                            action,
                            contentId,
                            code: error?.code || '',
                            message:
                                error?.message ||
                                String(error || 'My Version cloud sync failed.')
                        }
                    }
                )
            );
        } catch { }

        console.error(
            '[AtlasTutorContentCloudSync]',
            action,
            contentId,
            error
        );
    }

    function localRecordForCloud(record, contentId) {
        if (!record || typeof record !== 'object') return null;

        const id = cleanId(contentId || record.contentId);
        if (!id) return null;

        return {
            schemaVersion: Math.max(
                1,
                Math.floor(Number(record.schemaVersion) || 2)
            ),
            ownerId: 'local-tutor',
            contentId: id,
            baseContentVersion:
                typeof record.baseContentVersion === 'string'
                    ? record.baseContentVersion
                    : '',
            revision: Math.max(
                0,
                Math.floor(Number(record.revision) || 0)
            ),
            updatedAt: Math.max(
                0,
                Number(record.updatedAt) || 0
            ),
            overrides: isPlainObject(record.overrides)
                ? cloneJson(record.overrides)
                : {},
            document: isPlainObject(record.document)
                ? cloneJson(record.document)
                : {}
        };
    }

    async function claimOne(contentId, knownCloud = null) {
        const id = cleanId(contentId);
        if (!id) return null;

        if (!(await useCloud())) {
            return typeof Local.getVersion === 'function'
                ? Local.getVersion(id)
                : null;
        }

        let remote = knownCloud;

        if (!remote) {
            remote = await Cloud.getTutorContentVersion(id);
        }

        if (remote) return remote;

        const local =
            typeof Local.getVersion === 'function'
                ? await Local.getVersion(id)
                : null;

        if (!local) return null;

        const candidate = localRecordForCloud(local, id);
        if (!candidate) return null;

        try {
            return await Cloud.createTutorContentVersion(candidate);
        } catch (error) {
            if (error?.code !== '23505') throw error;

            return Cloud.getTutorContentVersion(id);
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

    async function claimLegacyVersions() {
        if (!(await useCloud())) {
            return {
                active: false,
                claimed: 0,
                cloudCount: 0,
                localCount: listLocalVersionIds().length
            };
        }

        if (initialClaimPromise) return initialClaimPromise;

        initialClaimPromise = (async () => {
            const remoteBefore =
                await Cloud.listTutorContentVersions();

            const remoteById = new Map(
                (remoteBefore || []).map(version => [
                    cleanId(version?.contentId),
                    version
                ])
            );

            const localIds = listLocalVersionIds();
            let claimed = 0;

            for (const contentId of localIds) {
                if (remoteById.has(contentId)) continue;

                try {
                    const claimedVersion =
                        await claimOne(contentId);

                    if (claimedVersion) {
                        remoteById.set(
                            contentId,
                            claimedVersion
                        );
                        claimed += 1;
                    }
                } catch (error) {
                    cloudErrorEvent(
                        error,
                        'legacy-claim',
                        contentId
                    );
                }
            }

            const versions =
                await Cloud.listTutorContentVersions();

            projectCloudVersions(versions);
            refreshVisibleSurfaces();

            const detail = {
                active: true,
                claimed,
                localCount: localIds.length,
                cloudCount: versions.length
            };

            cloudReadyEvent(detail);
            return detail;
        })().catch(error => {
            initialClaimPromise = null;
            cloudErrorEvent(error, 'initialize');
            throw error;
        });

        return initialClaimPromise;
    }

    async function getVersion(contentId) {
        const id = cleanId(contentId);
        if (!id) return null;

        if (!(await useCloud())) {
            return cloudApi.getVersion
                ? cloudApi.getVersion(id)
                : null;
        }

        await claimLegacyVersions();
        return Cloud.getTutorContentVersion(id);
    }

    async function getWorkingDraft(contentId) {
        const id = cleanId(contentId);
        if (!id || !cloudApi.getWorkingDraft) return null;

        if (await useCloud()) {
            await claimLegacyVersions();
        }

        return cloudApi.getWorkingDraft(id);
    }

    async function saveVersion(contentId, patch = {}) {
        const id = cleanId(contentId);
        if (!id || !cloudApi.saveVersion) return null;

        if (!(await useCloud())) {
            return cloudApi.saveVersion(id, patch);
        }

        await claimLegacyVersions();

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

        if (await useCloud()) {
            await claimLegacyVersions();
        }

        const deleted = await cloudApi.deleteVersion(id);

        if (deleted && await useCloud()) {
            await refreshProjection();
        }

        return deleted;
    }

    async function exportPortableData() {
        if (await useCloud()) {
            await claimLegacyVersions();
        }

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
        claimLegacyVersions,
        refreshProjection,
        claimOne,
        getState() {
            return {
                active: true,
                localVersionCount: listLocalVersionIds().length,
                claimStarted: Boolean(initialClaimPromise)
            };
        }
    });

    void claimLegacyVersions().catch(() => undefined);
})();
