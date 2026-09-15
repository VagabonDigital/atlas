/* ============================================================
   ATLAS TUTOR SUBJECTS — CLOUD AUTHORITY

   Authenticated authority for committed My Subjects + My Subjects library.

   Cloud authoritative when signed in:
   - committed subject records
   - subject ordering
   - library categories / placement / archive state

   Browser-local by design:
   - working drafts
   - generation build state/checkpoints
   - current session subject collections (Stage 1)
   - pending-delete undo journal

   Signed-out behavior remains on the existing AtlasTutorSubjects boundary.
   No authenticated cloud write silently falls back to localStorage.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasTutorSubjectsCloudAuthority) return;

    const Local = window.AtlasTutorSubjects;

    if (!Local) {
        console.error('[AtlasTutorSubjectsCloudAuthority] AtlasTutorSubjects is unavailable.');
        return;
    }

    const SCHEMA_VERSION = 1;
    const PORTABLE_SCHEMA_VERSION = 1;
    const LOCAL_OWNER_ID = 'local-tutor';
    const STRUCTURED_FORMAT = 'structured';
    const DEFAULT_CATEGORY_ID = 'default';
    const DEFAULT_CATEGORY_NAME = 'My Subjects';
    const LIBRARY_SCHEMA_VERSION = 1;

    const WORKING_DRAFT_PREFIX = 'atlas::tutorSubjects::workingDraft::';
    const BUILD_STATE_PREFIX = 'atlas::tutorSubjects::buildState::';
    const BUILD_CHECKPOINT_PREFIX = 'atlas::tutorSubjects::buildCheckpoint::';
    const SESSION_SUBJECTS_PREFIX = 'atlas::tutorSubjects::sessionSubjects::';
    const PENDING_DELETE_PREFIX = 'atlas::tutorSubjects::pendingDelete::';

    const pendingDeleteTimers = new Map();
    let snapshotPromise = null;

    const original = Object.fromEntries(
        Object.entries(Local).map(([key, value]) => [
            key,
            typeof value === 'function' ? value.bind(Local) : value
        ])
    );

    function cloneJson(value) {
        if (value === null || value === undefined) return value;
        return JSON.parse(JSON.stringify(value));
    }

    function encodePart(value) {
        return encodeURIComponent(String(value || ''));
    }

    function workingDraftStorageKey(subjectId) {
        return `${WORKING_DRAFT_PREFIX}${encodePart(subjectId)}`;
    }

    function buildStateStorageKey(subjectId) {
        return `${BUILD_STATE_PREFIX}${encodePart(subjectId)}`;
    }

    function buildCheckpointStorageKey(subjectId) {
        return `${BUILD_CHECKPOINT_PREFIX}${encodePart(subjectId)}`;
    }

    function pendingDeleteStorageKey(subjectId) {
        return `${PENDING_DELETE_PREFIX}${encodePart(subjectId)}`;
    }

    function readJson(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function writeJson(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    }

    function removeValue(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch {
            return false;
        }
    }

    function listKeysWithPrefix(prefix) {
        const keys = [];
        try {
            for (let index = 0; index < localStorage.length; index += 1) {
                const key = localStorage.key(index);
                if (key && key.startsWith(prefix)) keys.push(key);
            }
        } catch { }
        return keys.sort();
    }

    function normalizeSubjectOrder(value) {
        const seen = new Set();
        return (Array.isArray(value) ? value : [])
            .map(id => typeof id === 'string' ? id.trim() : '')
            .filter(id => {
                if (!id || seen.has(id)) return false;
                seen.add(id);
                return true;
            });
    }

    function normalizeMetadata(metadata) {
        const candidate =
            metadata && typeof metadata === 'object' && !Array.isArray(metadata)
                ? cloneJson(metadata) || {}
                : {};

        const title =
            typeof candidate.title === 'string' && candidate.title.trim()
                ? candidate.title.trim()
                : 'Untitled Subject';

        return {
            ...candidate,
            title,
            navTitle:
                typeof candidate.navTitle === 'string' && candidate.navTitle.trim()
                    ? candidate.navTitle.trim()
                    : title,
            description:
                typeof candidate.description === 'string'
                    ? candidate.description.trim()
                    : '',
            coverImage:
                typeof candidate.coverImage === 'string'
                    ? candidate.coverImage.trim()
                    : ''
        };
    }

    function validateDocument(document, operation) {
        const Structured = window.AtlasStructuredSubject;
        if (!Structured || typeof Structured.validateDocument !== 'function') {
            throw new Error('Structured Subject validation is unavailable.');
        }

        const validation = Structured.validateDocument(document);
        if (!validation.valid) {
            const error = new Error(
                `Structured Subject ${operation || 'write'} rejected: ${validation.errors.join(' ')}`
            );
            error.code = 'ATLAS_SUBJECT_INVALID';
            throw error;
        }
        return true;
    }

    function createSubjectId() {
        if (window.crypto && typeof window.crypto.randomUUID === 'function') {
            return `subject-${window.crypto.randomUUID()}`;
        }
        return `subject-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }

    function createCategoryId() {
        if (window.crypto && typeof window.crypto.randomUUID === 'function') {
            return `category-${window.crypto.randomUUID()}`;
        }
        return `category-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }

    async function getAccountState() {
        if (!window.AtlasAccount || !window.AtlasCloud) {
            return {
                ready: true,
                authenticated: false,
                userId: null,
                email: null
            };
        }

        await AtlasAccount.initialize();
        return AtlasAccount.getState();
    }

    async function useCloud() {
        return Boolean((await getAccountState()).authenticated);
    }

    function defaultLibrary(subjectIds = []) {
        const subjects = {};
        normalizeSubjectOrder(subjectIds).forEach(id => {
            subjects[id] = {
                libraryIncluded: true,
                categoryId: DEFAULT_CATEGORY_ID,
                archived: false
            };
        });

        return {
            schemaVersion: LIBRARY_SCHEMA_VERSION,
            defaultCategoryId: DEFAULT_CATEGORY_ID,
            categories: [{ id: DEFAULT_CATEGORY_ID, name: DEFAULT_CATEGORY_NAME }],
            categoryOrder: [DEFAULT_CATEGORY_ID],
            subjects
        };
    }

    function normalizeLibrary(library, subjectIds = []) {
        const candidate =
            library && typeof library === 'object' && !Array.isArray(library)
                ? cloneJson(library)
                : defaultLibrary();

        const categories = Array.isArray(candidate.categories)
            ? candidate.categories
                .filter(item => item && typeof item.id === 'string' && item.id.trim() && typeof item.name === 'string' && item.name.trim())
                .map(item => ({ id: item.id.trim(), name: item.name.trim() }))
            : [];

        if (!categories.some(category => category.id === DEFAULT_CATEGORY_ID)) {
            categories.unshift({ id: DEFAULT_CATEGORY_ID, name: DEFAULT_CATEGORY_NAME });
        }

        const categoryMap = new Map(categories.map(item => [item.id, item]));
        const categoryOrder = [];
        const seenCategories = new Set();

        (Array.isArray(candidate.categoryOrder) ? candidate.categoryOrder : [])
            .forEach(id => {
                const key = String(id || '').trim();
                if (!key || seenCategories.has(key) || !categoryMap.has(key)) return;
                seenCategories.add(key);
                categoryOrder.push(key);
            });

        if (!seenCategories.has(DEFAULT_CATEGORY_ID)) {
            categoryOrder.unshift(DEFAULT_CATEGORY_ID);
            seenCategories.add(DEFAULT_CATEGORY_ID);
        }

        categories.forEach(category => {
            if (!seenCategories.has(category.id)) {
                seenCategories.add(category.id);
                categoryOrder.push(category.id);
            }
        });

        const validCategoryIds = new Set(categoryOrder);
        const rawSubjects =
            candidate.subjects && typeof candidate.subjects === 'object' && !Array.isArray(candidate.subjects)
                ? candidate.subjects
                : {};
        const subjects = {};

        normalizeSubjectOrder(subjectIds).forEach(id => {
            const raw = rawSubjects[id] && typeof rawSubjects[id] === 'object'
                ? rawSubjects[id]
                : {};
            const libraryIncluded = raw.libraryIncluded !== false;
            const archived = raw.archived === true;
            const requestedCategoryId = typeof raw.categoryId === 'string'
                ? raw.categoryId.trim()
                : '';

            subjects[id] = {
                libraryIncluded,
                categoryId: libraryIncluded
                    ? (validCategoryIds.has(requestedCategoryId)
                        ? requestedCategoryId
                        : DEFAULT_CATEGORY_ID)
                    : null,
                archived
            };
        });

        return {
            schemaVersion: LIBRARY_SCHEMA_VERSION,
            defaultCategoryId: DEFAULT_CATEGORY_ID,
            categories: categoryOrder.map(id => categoryMap.get(id)).filter(Boolean),
            categoryOrder,
            subjects
        };
    }

    function normalizeCloudState(row, subjects) {
        const ids = (Array.isArray(subjects) ? subjects : [])
            .map(subject => String(subject?.id || '').trim())
            .filter(Boolean);
        const state = row?.state && typeof row.state === 'object' && !Array.isArray(row.state)
            ? row.state
            : {};
        const order = normalizeSubjectOrder([
            ...(Array.isArray(state.order) ? state.order : []),
            ...ids
        ]).filter(id => ids.includes(id));

        return {
            library: normalizeLibrary(state.library, ids),
            order,
            revision: row?.revision || null,
            schemaVersion: row?.schemaVersion || 1
        };
    }

    async function loadCloudSnapshot() {
        const [subjects, libraryRow] = await Promise.all([
            AtlasCloud.listOwnedSubjects(),
            AtlasCloud.getSubjectLibraryState()
        ]);

        const normalized = normalizeCloudState(libraryRow, subjects);
        const byId = new Map((subjects || []).map(subject => [subject.id, subject]));
        const ordered = [];
        const seen = new Set();

        normalized.order.forEach(id => {
            const subject = byId.get(id);
            if (!subject || seen.has(id)) return;
            seen.add(id);
            ordered.push(subject);
        });

        (subjects || [])
            .filter(subject => !seen.has(subject.id))
            .sort((left, right) => Number(right.updatedAt || 0) - Number(left.updatedAt || 0))
            .forEach(subject => ordered.push(subject));

        return {
            subjects: cloneJson(ordered),
            library: cloneJson(normalized.library),
            order: cloneJson(normalized.order),
            revision: normalized.revision,
            schemaVersion: normalized.schemaVersion
        };
    }

    async function getCloudSnapshot(force = false) {
        if (force) snapshotPromise = null;
        if (!snapshotPromise) {
            snapshotPromise = loadCloudSnapshot().catch(error => {
                snapshotPromise = null;
                throw error;
            });
        }
        return snapshotPromise;
    }

    function invalidateSnapshot() {
        snapshotPromise = null;
    }

    async function ensureCloudLibraryRow() {
        const existing = await AtlasCloud.getSubjectLibraryState();
        if (existing) return existing;

        const subjects = await AtlasCloud.listOwnedSubjects();
        const ids = subjects.map(subject => subject.id);
        const state = {
            library: defaultLibrary(ids),
            order: normalizeSubjectOrder(ids)
        };

        try {
            return await AtlasCloud.createSubjectLibraryState(state, 1);
        } catch (error) {
            if (error?.code !== '23505') throw error;
            const appeared = await AtlasCloud.getSubjectLibraryState();
            if (!appeared) throw error;
            return appeared;
        }
    }

    async function mutateCloudLibrary(mutator) {
        let lastConflict = null;

        for (let attempt = 0; attempt < 3; attempt += 1) {
            const row = await ensureCloudLibraryRow();
            const subjects = await AtlasCloud.listOwnedSubjects();
            const normalized = normalizeCloudState(row, subjects);
            const draft = {
                library: cloneJson(normalized.library),
                order: cloneJson(normalized.order)
            };

            const result = await mutator(draft, subjects);
            if (result === false) return null;

            const subjectIds = subjects.map(subject => subject.id);
            draft.order = normalizeSubjectOrder(draft.order)
                .filter(id => subjectIds.includes(id));
            draft.library = normalizeLibrary(draft.library, subjectIds);

            try {
                const updated = await AtlasCloud.updateSubjectLibraryState(
                    draft,
                    row.revision,
                    1
                );
                invalidateSnapshot();
                return { row: updated, state: draft, result };
            } catch (error) {
                if (error?.code !== 'ATLAS_REVISION_CONFLICT') throw error;
                lastConflict = error;
            }
        }

        throw lastConflict || new Error('Atlas could not update cloud library state.');
    }

    function readPendingDelete(subjectId) {
        const id = String(subjectId || '').trim();
        if (!id) return null;
        const raw = readJson(pendingDeleteStorageKey(id));
        if (!raw || raw.subjectId !== id) return null;
        const createdAt = Number(raw.createdAt);
        const deleteAt = Number(raw.deleteAt);
        if (!Number.isFinite(createdAt) || !Number.isFinite(deleteAt) || deleteAt < createdAt) {
            removeValue(pendingDeleteStorageKey(id));
            return null;
        }
        return {
            schemaVersion: SCHEMA_VERSION,
            subjectId: id,
            createdAt,
            deleteAt
        };
    }

    function listPendingDeleteRecords() {
        return listKeysWithPrefix(PENDING_DELETE_PREFIX)
            .map(key => {
                try {
                    const id = decodeURIComponent(key.slice(PENDING_DELETE_PREFIX.length));
                    return readPendingDelete(id);
                } catch {
                    return null;
                }
            })
            .filter(Boolean)
            .sort((left, right) => left.createdAt - right.createdAt);
    }

    function clearPendingDeleteTimer(subjectId) {
        const id = String(subjectId || '').trim();
        const timer = pendingDeleteTimers.get(id);
        if (timer) clearTimeout(timer);
        pendingDeleteTimers.delete(id);
    }

    function schedulePendingDelete(record) {
        if (!record?.subjectId) return;
        clearPendingDeleteTimer(record.subjectId);
        const delay = Math.max(0, Number(record.deleteAt) - Date.now());
        const timer = setTimeout(() => {
            void finalizePendingDelete(record.subjectId);
        }, delay);
        pendingDeleteTimers.set(record.subjectId, timer);
    }

    async function getSubject(subjectId) {
        const id = String(subjectId || '').trim();
        if (!id) return null;

        if (!(await useCloud())) {
            return original.getSubject ? original.getSubject(id) : null;
        }

        if (readPendingDelete(id)) return null;
        return AtlasCloud.getOwnedSubject(id);
    }

    async function listSubjects() {
        if (!(await useCloud())) {
            return original.listSubjects ? original.listSubjects() : [];
        }

        const pendingIds = new Set(listPendingDeleteRecords().map(record => record.subjectId));
        const snapshot = await getCloudSnapshot();
        return cloneJson(snapshot.subjects.filter(subject => !pendingIds.has(subject.id)));
    }

    async function getLibraryState() {
        if (!(await useCloud())) {
            return original.getLibraryState ? original.getLibraryState() : null;
        }
        return cloneJson((await getCloudSnapshot()).library);
    }

    async function getSubjectLibraryState(subjectId) {
        const id = String(subjectId || '').trim();
        if (!id) return null;
        if (!(await useCloud())) {
            return original.getSubjectLibraryState ? original.getSubjectLibraryState(id) : null;
        }
        const snapshot = await getCloudSnapshot();
        return cloneJson(snapshot.library?.subjects?.[id] || null);
    }

    async function createSubject(input = {}) {
        if (!(await useCloud())) {
            return original.createSubject ? original.createSubject(input) : null;
        }

        const format = typeof input.format === 'string' ? input.format.trim() : STRUCTURED_FORMAT;
        const document = cloneJson(input.document);
        if (format !== STRUCTURED_FORMAT || !document || typeof document !== 'object' || Array.isArray(document)) {
            return null;
        }
        validateDocument(document, 'create');

        const timestamp = Date.now();
        const record = {
            schemaVersion: SCHEMA_VERSION,
            id: createSubjectId(),
            ownerId: LOCAL_OWNER_ID,
            format: STRUCTURED_FORMAT,
            metadata: normalizeMetadata(input.metadata),
            document,
            revision: 1,
            createdAt: timestamp,
            updatedAt: timestamp,
            provenance:
                input.provenance && typeof input.provenance === 'object' && !Array.isArray(input.provenance)
                    ? cloneJson(input.provenance)
                    : null
        };

        const created = await AtlasCloud.createOwnedSubject(record);

        try {
            const placement =
                input.libraryPlacement && typeof input.libraryPlacement === 'object' && !Array.isArray(input.libraryPlacement)
                    ? input.libraryPlacement
                    : {};

            await mutateCloudLibrary(draft => {
                draft.order = [created.id, ...draft.order.filter(id => id !== created.id)];
                draft.library.subjects[created.id] = {
                    libraryIncluded: placement.libraryIncluded !== false,
                    categoryId:
                        placement.libraryIncluded === false
                            ? null
                            : String(placement.categoryId || '').trim() || DEFAULT_CATEGORY_ID,
                    archived: placement.archived === true
                };
                return true;
            });
        } catch (error) {
            try {
                await AtlasCloud.deleteOwnedSubject(created.id, created.revision);
            } catch { }
            invalidateSnapshot();
            throw error;
        }

        invalidateSnapshot();
        return AtlasCloud.getOwnedSubject(created.id);
    }

    async function updateSubject(subjectId, patch = {}) {
        if (!(await useCloud())) {
            return original.updateSubject ? original.updateSubject(subjectId, patch) : null;
        }

        const current = await getSubject(subjectId);
        if (!current) return null;

        const nextPatch = patch && typeof patch === 'object' && !Array.isArray(patch) ? patch : {};
        let document = cloneJson(current.document);

        if (Object.prototype.hasOwnProperty.call(nextPatch, 'document')) {
            document = cloneJson(nextPatch.document);
            if (!document || typeof document !== 'object' || Array.isArray(document)) return null;
        }
        validateDocument(document, 'update');

        const metadata = Object.prototype.hasOwnProperty.call(nextPatch, 'metadata')
            ? normalizeMetadata({
                ...current.metadata,
                ...(nextPatch.metadata && typeof nextPatch.metadata === 'object' && !Array.isArray(nextPatch.metadata)
                    ? nextPatch.metadata
                    : {})
            })
            : current.metadata;

        const provenance = Object.prototype.hasOwnProperty.call(nextPatch, 'provenance')
            ? (nextPatch.provenance && typeof nextPatch.provenance === 'object' && !Array.isArray(nextPatch.provenance)
                ? cloneJson(nextPatch.provenance)
                : null)
            : current.provenance;

        const updated = await AtlasCloud.updateOwnedSubject(
            {
                ...current,
                metadata,
                document,
                provenance
            },
            current.revision
        );
        invalidateSnapshot();
        return updated;
    }

    async function renameSubject(subjectId, nextTitle) {
        if (!(await useCloud())) {
            return original.renameSubject ? original.renameSubject(subjectId, nextTitle) : null;
        }

        const current = await getSubject(subjectId);
        const title = String(nextTitle || '').trim();
        if (!current || !title) return null;

        const document = cloneJson(current.document);
        document.module = document.module && typeof document.module === 'object' && !Array.isArray(document.module)
            ? document.module
            : {};
        document.module.title = title;
        document.module.navTitle = title;

        return updateSubject(current.id, {
            metadata: { title, navTitle: title },
            document
        });
    }

    async function duplicateSubject(subjectId, patch = {}) {
        if (!(await useCloud())) {
            return original.duplicateSubject ? original.duplicateSubject(subjectId, patch) : null;
        }

        const source = await getSubject(subjectId);
        if (!source) return null;

        const nextPatch = patch && typeof patch === 'object' && !Array.isArray(patch) ? patch : {};
        const metadataPatch = nextPatch.metadata && typeof nextPatch.metadata === 'object' && !Array.isArray(nextPatch.metadata)
            ? nextPatch.metadata
            : {};
        const sourceTitle = String(source.metadata?.title || source.document?.module?.title || 'Untitled Subject').trim() || 'Untitled Subject';
        const title = typeof metadataPatch.title === 'string' && metadataPatch.title.trim()
            ? metadataPatch.title.trim()
            : `${sourceTitle} copy`;
        const navTitle = typeof metadataPatch.navTitle === 'string' && metadataPatch.navTitle.trim()
            ? metadataPatch.navTitle.trim()
            : title;
        const metadata = normalizeMetadata({ ...source.metadata, ...metadataPatch, title, navTitle });
        const document = cloneJson(source.document);
        document.module = document.module && typeof document.module === 'object' && !Array.isArray(document.module)
            ? document.module
            : {};
        document.module.title = metadata.title;
        document.module.navTitle = metadata.navTitle;
        document.module.catalogDescription = metadata.description;
        document.module.bgImage = metadata.coverImage;

        const sourcePlacement = await getSubjectLibraryState(source.id);
        return createSubject({
            format: source.format,
            metadata,
            document,
            libraryPlacement:
                sourcePlacement?.libraryIncluded !== false && sourcePlacement?.categoryId
                    ? { libraryIncluded: true, categoryId: sourcePlacement.categoryId }
                    : undefined,
            provenance: Object.prototype.hasOwnProperty.call(nextPatch, 'provenance')
                ? nextPatch.provenance
                : {
                    kind: 'owned-subject-duplicate',
                    sourceSubjectId: source.id,
                    sourceRevision: source.revision,
                    sourceProvenance: source.provenance || null
                }
        });
    }

    async function createLibraryCategory(name) {
        if (!(await useCloud())) {
            return original.createLibraryCategory ? original.createLibraryCategory(name) : null;
        }

        const nextName = String(name || '').trim();
        if (!nextName) return null;
        const category = { id: createCategoryId(), name: nextName };

        const mutation = await mutateCloudLibrary(draft => {
            if (draft.library.categories.some(item => item.name.toLocaleLowerCase() === nextName.toLocaleLowerCase())) {
                return false;
            }
            draft.library.categories.push(category);
            draft.library.categoryOrder = [category.id, ...draft.library.categoryOrder.filter(id => id !== category.id)];
            return cloneJson(category);
        });

        return mutation ? cloneJson(category) : null;
    }

    async function renameLibraryCategory(categoryId, name) {
        if (!(await useCloud())) {
            return original.renameLibraryCategory ? original.renameLibraryCategory(categoryId, name) : null;
        }

        const id = String(categoryId || '').trim();
        const nextName = String(name || '').trim();
        if (!id || !nextName) return null;

        const mutation = await mutateCloudLibrary(draft => {
            const index = draft.library.categories.findIndex(category => category.id === id);
            if (index < 0) return false;
            if (draft.library.categories.some(category => category.id !== id && category.name.toLocaleLowerCase() === nextName.toLocaleLowerCase())) {
                return false;
            }
            draft.library.categories[index] = { ...draft.library.categories[index], name: nextName };
            return cloneJson(draft.library.categories[index]);
        });

        return mutation ? cloneJson(mutation.result) : null;
    }

    async function moveLibraryCategory(categoryId, offset) {
        if (!(await useCloud())) {
            return original.moveLibraryCategory ? original.moveLibraryCategory(categoryId, offset) : false;
        }

        const id = String(categoryId || '').trim();
        const movement = Number(offset);
        if (!id || (movement !== -1 && movement !== 1)) return false;

        const mutation = await mutateCloudLibrary(draft => {
            const index = draft.library.categoryOrder.indexOf(id);
            const target = index + movement;
            if (index < 0 || target < 0 || target >= draft.library.categoryOrder.length) return false;
            [draft.library.categoryOrder[index], draft.library.categoryOrder[target]] = [
                draft.library.categoryOrder[target],
                draft.library.categoryOrder[index]
            ];
            return true;
        });
        return Boolean(mutation);
    }

    async function deleteLibraryCategory(categoryId) {
        if (!(await useCloud())) {
            return original.deleteLibraryCategory ? original.deleteLibraryCategory(categoryId) : null;
        }

        const id = String(categoryId || '').trim();
        if (!id || id === DEFAULT_CATEGORY_ID) return null;

        const mutation = await mutateCloudLibrary(draft => {
            const category = draft.library.categories.find(item => item.id === id);
            if (!category) return false;
            let movedSubjectCount = 0;
            Object.entries(draft.library.subjects).forEach(([subjectId, placement]) => {
                if (placement.categoryId !== id) return;
                draft.library.subjects[subjectId] = { ...placement, categoryId: DEFAULT_CATEGORY_ID };
                movedSubjectCount += 1;
            });
            draft.library.categories = draft.library.categories.filter(item => item.id !== id);
            draft.library.categoryOrder = draft.library.categoryOrder.filter(item => item !== id);
            return { category, movedSubjectCount };
        });

        return mutation ? cloneJson(mutation.result) : null;
    }

    async function setSubjectLibraryPlacement(subjectId, patch = {}) {
        if (!(await useCloud())) {
            return original.setSubjectLibraryPlacement ? original.setSubjectLibraryPlacement(subjectId, patch) : null;
        }

        const subject = await getSubject(subjectId);
        if (!subject) return null;
        const nextPatch = patch && typeof patch === 'object' && !Array.isArray(patch) ? patch : {};

        if (Object.prototype.hasOwnProperty.call(nextPatch, 'libraryIncluded') && nextPatch.libraryIncluded === false) {
            const sessionIds = original.getSubjectSessionIds
                ? await original.getSubjectSessionIds({ kind: 'my-subject', id: subject.id })
                : [];
            if (sessionIds.length === 0) return null;
        }

        const mutation = await mutateCloudLibrary(draft => {
            const current = draft.library.subjects[subject.id];
            if (!current) return false;
            const libraryIncluded = Object.prototype.hasOwnProperty.call(nextPatch, 'libraryIncluded')
                ? nextPatch.libraryIncluded !== false
                : current.libraryIncluded;
            const archived = Object.prototype.hasOwnProperty.call(nextPatch, 'archived')
                ? nextPatch.archived === true
                : current.archived;
            let categoryId = current.categoryId;

            if (!libraryIncluded) {
                categoryId = null;
            } else if (Object.prototype.hasOwnProperty.call(nextPatch, 'categoryId')) {
                const requested = String(nextPatch.categoryId || '').trim();
                if (requested && !draft.library.categories.some(category => category.id === requested)) return false;
                categoryId = requested || DEFAULT_CATEGORY_ID;
            } else if (!categoryId) {
                categoryId = DEFAULT_CATEGORY_ID;
            }

            const placement = { libraryIncluded, categoryId, archived };
            draft.library.subjects[subject.id] = placement;
            return cloneJson(placement);
        });

        return mutation ? cloneJson(mutation.result) : null;
    }

    async function moveSubject(subjectId, offset, targetSubjectId = '') {
        if (!(await useCloud())) {
            return original.moveSubject ? original.moveSubject(subjectId, offset, targetSubjectId) : false;
        }

        const id = String(subjectId || '').trim();
        const movement = Number(offset);
        if (!id || (movement !== -1 && movement !== 1)) return false;

        const mutation = await mutateCloudLibrary((draft, subjects) => {
            const placement = draft.library.subjects[id];
            if (!placement || placement.libraryIncluded === false || placement.archived === true || !placement.categoryId) return false;

            const visibleIds = new Set(subjects.map(subject => subject.id));
            const categoryIds = draft.order.filter(candidateId => {
                if (!visibleIds.has(candidateId)) return false;
                const candidatePlacement = draft.library.subjects[candidateId];
                return candidatePlacement && candidatePlacement.libraryIncluded !== false && candidatePlacement.archived !== true && candidatePlacement.categoryId === placement.categoryId;
            });

            const currentCategoryIndex = categoryIds.indexOf(id);
            if (currentCategoryIndex < 0) return false;
            let targetId = String(targetSubjectId || '').trim();
            if (!targetId) targetId = categoryIds[currentCategoryIndex + movement] || '';
            const currentIndex = draft.order.indexOf(id);
            const targetIndex = draft.order.indexOf(targetId);
            if (currentIndex < 0 || targetIndex < 0) return false;
            [draft.order[currentIndex], draft.order[targetIndex]] = [draft.order[targetIndex], draft.order[currentIndex]];
            return true;
        });

        return Boolean(mutation);
    }

    async function deleteSubject(subjectId) {
        if (!(await useCloud())) {
            return original.deleteSubject ? original.deleteSubject(subjectId) : false;
        }

        const id = String(subjectId || '').trim();
        const current = await AtlasCloud.getOwnedSubject(id);
        if (!current) return false;

        const deleted = await AtlasCloud.deleteOwnedSubject(id, current.revision);
        if (!deleted) return false;

        clearPendingDeleteTimer(id);
        removeValue(workingDraftStorageKey(id));
        removeValue(buildStateStorageKey(id));
        removeValue(buildCheckpointStorageKey(id));
        removeValue(pendingDeleteStorageKey(id));

        try {
            await mutateCloudLibrary(draft => {
                delete draft.library.subjects[id];
                draft.order = draft.order.filter(candidateId => candidateId !== id);
                return true;
            });
        } finally {
            invalidateSnapshot();
        }

        // Current session collections remain browser-local in Stage 1.
        // Remove deleted My Subject references from every local session.
        listKeysWithPrefix(SESSION_SUBJECTS_PREFIX).forEach(key => {
            const refs = readJson(key);
            if (!Array.isArray(refs)) return;
            const next = refs.filter(ref => !(ref?.kind === 'my-subject' && ref?.id === id));
            if (next.length === refs.length) return;
            if (next.length === 0) removeValue(key);
            else writeJson(key, next);
        });

        return true;
    }

    async function beginPendingDelete(subjectId, graceMs = 7000) {
        if (!(await useCloud())) {
            return original.beginPendingDelete ? original.beginPendingDelete(subjectId, graceMs) : null;
        }

        const current = await AtlasCloud.getOwnedSubject(String(subjectId || '').trim());
        if (!current) return null;
        const existing = readPendingDelete(current.id);
        if (existing) {
            schedulePendingDelete(existing);
            return cloneJson(existing);
        }

        const now = Date.now();
        const record = {
            schemaVersion: SCHEMA_VERSION,
            subjectId: current.id,
            createdAt: now,
            deleteAt: now + Math.max(1000, Number(graceMs) || 7000)
        };
        if (!writeJson(pendingDeleteStorageKey(current.id), record)) return null;
        schedulePendingDelete(record);
        invalidateSnapshot();
        return cloneJson(record);
    }

    async function cancelPendingDelete(subjectId) {
        if (!(await useCloud())) {
            return original.cancelPendingDelete ? original.cancelPendingDelete(subjectId) : null;
        }
        const id = String(subjectId || '').trim();
        const record = readPendingDelete(id);
        if (!record) return null;
        clearPendingDeleteTimer(id);
        if (!removeValue(pendingDeleteStorageKey(id))) return null;
        invalidateSnapshot();
        return AtlasCloud.getOwnedSubject(id);
    }

    async function getPendingDelete(subjectId) {
        if (!(await useCloud())) {
            return original.getPendingDelete ? original.getPendingDelete(subjectId) : null;
        }
        return cloneJson(readPendingDelete(subjectId));
    }

    async function listPendingDeletes() {
        if (!(await useCloud())) {
            return original.listPendingDeletes ? original.listPendingDeletes() : [];
        }
        return cloneJson(listPendingDeleteRecords()) || [];
    }

    async function finalizePendingDelete(subjectId) {
        if (!(await useCloud())) {
            return original.finalizePendingDelete ? original.finalizePendingDelete(subjectId) : false;
        }
        const id = String(subjectId || '').trim();
        const record = readPendingDelete(id);
        if (!record) return false;
        if (record.deleteAt > Date.now()) {
            schedulePendingDelete(record);
            return false;
        }
        const deleted = await deleteSubject(id);
        if (deleted) return true;
        if (!(await AtlasCloud.getOwnedSubject(id))) {
            clearPendingDeleteTimer(id);
            removeValue(pendingDeleteStorageKey(id));
            return true;
        }
        return false;
    }

    async function reconcilePendingDeletes() {
        if (!(await useCloud())) {
            return original.reconcilePendingDeletes ? original.reconcilePendingDeletes() : { pending: [], finalized: [] };
        }
        const pending = [];
        const finalized = [];
        for (const record of listPendingDeleteRecords()) {
            if (!(await AtlasCloud.getOwnedSubject(record.subjectId))) {
                clearPendingDeleteTimer(record.subjectId);
                removeValue(pendingDeleteStorageKey(record.subjectId));
                continue;
            }
            if (record.deleteAt <= Date.now()) {
                if (await finalizePendingDelete(record.subjectId)) {
                    finalized.push(record.subjectId);
                    continue;
                }
            }
            schedulePendingDelete(record);
            pending.push(record);
        }
        return { pending: cloneJson(pending), finalized: cloneJson(finalized) };
    }

    function normalizeWorkingDraft(record, subjectId) {
        if (!record || typeof record !== 'object' || Array.isArray(record)) return null;
        const id = String(subjectId || '').trim();
        if (!id || !record.document || typeof record.document !== 'object' || Array.isArray(record.document)) return null;
        return {
            schemaVersion: SCHEMA_VERSION,
            subjectId: id,
            ownerId: LOCAL_OWNER_ID,
            format: STRUCTURED_FORMAT,
            baseRevision: Math.max(1, Math.floor(Number(record.baseRevision) || 1)),
            document: cloneJson(record.document),
            includedLiveSessionId:
                typeof record.includedLiveSessionId === 'string' && record.includedLiveSessionId.trim()
                    ? record.includedLiveSessionId.trim()
                    : null,
            activeViewId:
                typeof record.activeViewId === 'string' && record.activeViewId.trim()
                    ? record.activeViewId.trim()
                    : 'view-cover',
            startedAt: Math.max(0, Number(record.startedAt) || Number(record.updatedAt) || Date.now()),
            updatedAt: Math.max(0, Number(record.updatedAt) || 0)
        };
    }

    function normalizeBuildState(record, subjectId) {
        if (!record || typeof record !== 'object' || Array.isArray(record)) return null;
        const id = String(subjectId || '').trim();
        if (!id || record.kind !== 'full-subject') return null;
        return {
            schemaVersion: SCHEMA_VERSION,
            subjectId: id,
            kind: 'full-subject',
            completedStep: Math.max(0, Math.floor(Number(record.completedStep) || 0)),
            autoSaveOnComplete: record.autoSaveOnComplete !== false,
            startedAt: Math.max(0, Number(record.startedAt) || Number(record.updatedAt) || Date.now()),
            updatedAt: Math.max(0, Number(record.updatedAt) || 0)
        };
    }

    function normalizeBuildCheckpoint(record, subjectId) {
        if (!record || typeof record !== 'object' || Array.isArray(record)) return null;
        const workingDraft = normalizeWorkingDraft(record.workingDraft, subjectId);
        const buildState = normalizeBuildState(record.buildState, subjectId);
        if (!workingDraft || !buildState) return null;
        return {
            schemaVersion: SCHEMA_VERSION,
            subjectId: String(subjectId || '').trim(),
            workingDraft,
            buildState,
            updatedAt: Math.max(Number(record.updatedAt) || 0, workingDraft.updatedAt, buildState.updatedAt)
        };
    }

    async function getWorkingDraft(subjectId) {
        if (!(await useCloud())) {
            return original.getWorkingDraft ? original.getWorkingDraft(subjectId) : null;
        }
        const subject = await getSubject(subjectId);
        if (!subject) return null;
        const storedDraft = normalizeWorkingDraft(readJson(workingDraftStorageKey(subject.id)), subject.id);
        const checkpoint = normalizeBuildCheckpoint(readJson(buildCheckpointStorageKey(subject.id)), subject.id);
        if (checkpoint && (!storedDraft || checkpoint.workingDraft.updatedAt > storedDraft.updatedAt)) {
            writeJson(workingDraftStorageKey(subject.id), checkpoint.workingDraft);
            return cloneJson(checkpoint.workingDraft);
        }
        return cloneJson(storedDraft);
    }

    async function saveWorkingDraft(subjectId, patch = {}) {
        if (!(await useCloud())) {
            return original.saveWorkingDraft ? original.saveWorkingDraft(subjectId, patch) : null;
        }
        const subject = await getSubject(subjectId);
        if (!subject) return null;
        const document = cloneJson(patch?.document);
        if (!document || typeof document !== 'object' || Array.isArray(document)) return null;
        validateDocument(document, 'working draft');
        const current = await getWorkingDraft(subject.id);
        const timestamp = Date.now();
        const next = {
            schemaVersion: SCHEMA_VERSION,
            subjectId: subject.id,
            ownerId: LOCAL_OWNER_ID,
            format: STRUCTURED_FORMAT,
            baseRevision: Math.max(1, Math.floor(Number(patch?.baseRevision) || Number(current?.baseRevision) || subject.revision)),
            document,
            includedLiveSessionId:
                typeof patch?.includedLiveSessionId === 'string' && patch.includedLiveSessionId.trim()
                    ? patch.includedLiveSessionId.trim()
                    : null,
            activeViewId:
                typeof patch?.activeViewId === 'string' && patch.activeViewId.trim()
                    ? patch.activeViewId.trim()
                    : current?.activeViewId || 'view-cover',
            startedAt: current?.startedAt || timestamp,
            updatedAt: timestamp
        };
        return writeJson(workingDraftStorageKey(subject.id), next) ? cloneJson(next) : null;
    }

    async function getBuildState(subjectId) {
        if (!(await useCloud())) {
            return original.getBuildState ? original.getBuildState(subjectId) : null;
        }
        const subject = await getSubject(subjectId);
        if (!subject) return null;
        const storedState = normalizeBuildState(readJson(buildStateStorageKey(subject.id)), subject.id);
        const checkpoint = normalizeBuildCheckpoint(readJson(buildCheckpointStorageKey(subject.id)), subject.id);
        if (checkpoint && (!storedState || checkpoint.buildState.updatedAt > storedState.updatedAt)) {
            writeJson(buildStateStorageKey(subject.id), checkpoint.buildState);
            return cloneJson(checkpoint.buildState);
        }
        return cloneJson(storedState);
    }

    async function saveBuildState(subjectId, patch = {}) {
        if (!(await useCloud())) {
            return original.saveBuildState ? original.saveBuildState(subjectId, patch) : null;
        }
        const subject = await getSubject(subjectId);
        if (!subject) return null;
        const current = await getBuildState(subject.id);
        const timestamp = Date.now();
        const next = normalizeBuildState({
            ...current,
            ...(patch && typeof patch === 'object' && !Array.isArray(patch) ? patch : {}),
            kind: patch?.kind || current?.kind || 'full-subject',
            startedAt: current?.startedAt || timestamp,
            updatedAt: timestamp
        }, subject.id);
        if (!next) return null;
        return writeJson(buildStateStorageKey(subject.id), next) ? cloneJson(next) : null;
    }

    async function saveBuildCheckpoint(subjectId, checkpoint = {}) {
        if (!(await useCloud())) {
            return original.saveBuildCheckpoint ? original.saveBuildCheckpoint(subjectId, checkpoint) : null;
        }
        const subject = await getSubject(subjectId);
        if (!subject) return null;
        const workingPatch = checkpoint?.workingDraft && typeof checkpoint.workingDraft === 'object'
            ? checkpoint.workingDraft
            : {};
        const buildPatch = checkpoint?.buildState && typeof checkpoint.buildState === 'object'
            ? checkpoint.buildState
            : {};
        const document = cloneJson(workingPatch.document);
        if (!document || typeof document !== 'object' || Array.isArray(document)) return null;
        validateDocument(document, 'build checkpoint');
        const currentDraft = await getWorkingDraft(subject.id);
        const currentState = await getBuildState(subject.id);
        const timestamp = Date.now();
        const workingDraft = {
            schemaVersion: SCHEMA_VERSION,
            subjectId: subject.id,
            ownerId: LOCAL_OWNER_ID,
            format: STRUCTURED_FORMAT,
            baseRevision: Math.max(1, Math.floor(Number(workingPatch.baseRevision) || Number(currentDraft?.baseRevision) || subject.revision)),
            document,
            includedLiveSessionId:
                typeof workingPatch.includedLiveSessionId === 'string' && workingPatch.includedLiveSessionId.trim()
                    ? workingPatch.includedLiveSessionId.trim()
                    : null,
            activeViewId:
                typeof workingPatch.activeViewId === 'string' && workingPatch.activeViewId.trim()
                    ? workingPatch.activeViewId.trim()
                    : currentDraft?.activeViewId || 'view-cover',
            startedAt: currentDraft?.startedAt || timestamp,
            updatedAt: timestamp
        };
        const buildState = normalizeBuildState({
            ...currentState,
            ...buildPatch,
            kind: buildPatch.kind || currentState?.kind || 'full-subject',
            startedAt: currentState?.startedAt || timestamp,
            updatedAt: timestamp
        }, subject.id);
        if (!buildState) return null;
        const next = {
            schemaVersion: SCHEMA_VERSION,
            subjectId: subject.id,
            workingDraft,
            buildState,
            updatedAt: timestamp
        };
        if (!writeJson(buildCheckpointStorageKey(subject.id), next)) return null;
        writeJson(workingDraftStorageKey(subject.id), workingDraft);
        writeJson(buildStateStorageKey(subject.id), buildState);
        return cloneJson(next);
    }

    async function clearWorkingDraft(subjectId) {
        if (!(await useCloud())) {
            return original.clearWorkingDraft ? original.clearWorkingDraft(subjectId) : false;
        }
        const id = String(subjectId || '').trim();
        if (!id) return false;
        const draftRemoved = removeValue(workingDraftStorageKey(id));
        const stateRemoved = removeValue(buildStateStorageKey(id));
        const checkpointRemoved = removeValue(buildCheckpointStorageKey(id));
        return draftRemoved && stateRemoved && checkpointRemoved;
    }

    async function clearBuildState(subjectId) {
        if (!(await useCloud())) {
            return original.clearBuildState ? original.clearBuildState(subjectId) : false;
        }
        const id = String(subjectId || '').trim();
        if (!id) return false;
        return removeValue(buildStateStorageKey(id)) && removeValue(buildCheckpointStorageKey(id));
    }

    async function removeSessionSubject(sessionId, subjectRef) {
        if (!(await useCloud())) {
            return original.removeSessionSubject ? original.removeSessionSubject(sessionId, subjectRef) : null;
        }
        const ref = subjectRef && typeof subjectRef === 'object'
            ? { kind: String(subjectRef.kind || ''), id: String(subjectRef.id || '').trim() }
            : null;
        const id = String(sessionId || '').trim();
        if (!ref?.id || !id) return null;

        if (ref.kind === 'my-subject') {
            const subject = await getSubject(ref.id);
            if (!subject) return null;
            const placement = await getSubjectLibraryState(ref.id);
            if (placement && placement.libraryIncluded === false && placement.archived !== true) {
                const sessionIds = original.getSubjectSessionIds
                    ? await original.getSubjectSessionIds(ref)
                    : [];
                if (sessionIds.filter(candidate => candidate !== id).length === 0) return null;
            }
        }

        const current = original.getSessionSubjects
            ? await original.getSessionSubjects(id)
            : [];
        const next = current.filter(item => !(item.kind === ref.kind && item.id === ref.id));
        return original.setSessionSubjects ? original.setSessionSubjects(id, next) : null;
    }

    async function exportPortableData() {
        if (!(await useCloud())) {
            return original.exportPortableData ? original.exportPortableData() : null;
        }

        await reconcilePendingDeletes();
        const snapshot = await getCloudSnapshot(true);
        const pendingIds = new Set(listPendingDeleteRecords().map(record => record.subjectId));
        const subjects = snapshot.subjects.filter(subject => !pendingIds.has(subject.id));
        const subjectIds = new Set(subjects.map(subject => subject.id));
        const workingDrafts = listKeysWithPrefix(WORKING_DRAFT_PREFIX)
            .map(key => {
                try {
                    const id = decodeURIComponent(key.slice(WORKING_DRAFT_PREFIX.length));
                    return normalizeWorkingDraft(readJson(key), id);
                } catch {
                    return null;
                }
            })
            .filter(record => record && subjectIds.has(record.subjectId));

        const sessionSubjects = {};
        listKeysWithPrefix(SESSION_SUBJECTS_PREFIX).forEach(key => {
            try {
                const sessionId = decodeURIComponent(key.slice(SESSION_SUBJECTS_PREFIX.length));
                const refs = readJson(key);
                if (!sessionId || !Array.isArray(refs)) return;
                sessionSubjects[sessionId] = refs.filter(ref => !(
                    ref?.kind === 'my-subject' && pendingIds.has(ref?.id)
                ));
            } catch { }
        });

        const payload = {
            schemaVersion: PORTABLE_SCHEMA_VERSION,
            subjects: cloneJson(subjects),
            workingDrafts: cloneJson(workingDrafts),
            order: snapshot.order.filter(id => subjectIds.has(id)),
            sessionSubjects: cloneJson(sessionSubjects),
            library: normalizeLibrary(snapshot.library, [...subjectIds])
        };

        if (typeof original.validatePortableData === 'function') {
            const validation = original.validatePortableData(payload);
            if (!validation.valid) throw new Error(validation.errors.join(' '));
            return validation.data;
        }
        return payload;
    }

    async function restorePortableData(payload) {
        if (!(await useCloud())) {
            return original.restorePortableData ? original.restorePortableData(payload) : false;
        }
        const error = new Error(
            'Authenticated cloud restore is not enabled yet. Atlas stopped before writing split-brain local data.'
        );
        error.code = 'ATLAS_CLOUD_RESTORE_PENDING';
        throw error;
    }

    const api = {
        ...Local,
        getSubject,
        listSubjects,
        createSubject,
        updateSubject,
        renameSubject,
        duplicateSubject,
        deleteSubject,
        moveSubject,
        getLibraryState,
        getSubjectLibraryState,
        createLibraryCategory,
        renameLibraryCategory,
        moveLibraryCategory,
        deleteLibraryCategory,
        setSubjectLibraryPlacement,
        getWorkingDraft,
        saveWorkingDraft,
        clearWorkingDraft,
        getBuildState,
        saveBuildState,
        saveBuildCheckpoint,
        clearBuildState,
        removeSessionSubject,
        beginPendingDelete,
        cancelPendingDelete,
        getPendingDelete,
        listPendingDeletes,
        finalizePendingDelete,
        reconcilePendingDeletes,
        exportPortableData,
        restorePortableData,
        cloudReadAuthority: true,
        cloudWriteAuthority: true
    };

    window.AtlasTutorSubjects = api;

    window.AtlasTutorSubjectsCloudAuthority = Object.freeze({
        active: true,
        refresh: invalidateSnapshot,
        getSnapshot: () => getCloudSnapshot(true)
    });

    void reconcilePendingDeletes().catch(error => {
        console.warn('[AtlasTutorSubjectsCloudAuthority] Pending-delete reconciliation failed.', error);
    });
})();
