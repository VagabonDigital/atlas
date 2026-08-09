/* ============================================================
   ATLAS TUTOR SUBJECTS
   Shared persistence boundary for independently owned subjects.

   Current storage:
   - My Subjects: localStorage

   Consumers must use this asynchronous API rather than reading or
   writing browser storage directly. The implementation can later move
   to authenticated cloud persistence without changing product surfaces.
   ============================================================ */

(function () {
    'use strict';

    const SCHEMA_VERSION = 1;
    const LOCAL_OWNER_ID = 'local-tutor';
    const SUBJECT_PREFIX = 'atlas::tutorSubjects::subject::';
    const WORKING_DRAFT_PREFIX = 'atlas::tutorSubjects::workingDraft::';
    const ORDER_KEY = 'atlas::tutorSubjects::order';
    const STRUCTURED_FORMAT = 'structured';

    function encodePart(value) {
        return encodeURIComponent(String(value || ''));
    }

    function subjectStorageKey(subjectId) {
        return `${SUBJECT_PREFIX}${encodePart(subjectId)}`;
    }

    function workingDraftStorageKey(subjectId) {
        return `${WORKING_DRAFT_PREFIX}${encodePart(subjectId)}`;
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

    function normalizeSubjectOrder(value) {
        const seen = new Set();

        return (Array.isArray(value) ? value : [])
            .map(id =>
                typeof id === 'string'
                    ? id.trim()
                    : ''
            )
            .filter(id => {
                if (!id || seen.has(id)) {
                    return false;
                }

                seen.add(id);
                return true;
            });
    }

    function readSubjectOrder() {
        return normalizeSubjectOrder(
            readJson(ORDER_KEY)
        );
    }

    function writeSubjectOrder(order) {
        return writeJson(
            ORDER_KEY,
            normalizeSubjectOrder(order)
        );
    }

    function cloneJson(value) {
        try {
            return JSON.parse(JSON.stringify(value));
        } catch {
            return null;
        }
    }

    function normalizeDocument(document) {
        if (
            !document ||
            typeof document !== 'object' ||
            Array.isArray(document)
        ) {
            return null;
        }

        return cloneJson(document);
    }

    function validateStructuredDocument(
        document,
        operation = 'write'
    ) {
        const Structured =
            window.AtlasStructuredSubject;

        if (
            !Structured ||
            typeof Structured.validateDocument !== 'function'
        ) {
            console.error(
                '[AtlasTutorSubjects] Structured Subject validation is unavailable.'
            );
            return false;
        }

        const validation =
            Structured.validateDocument(document);

        if (!validation.valid) {
            console.error(
                `[AtlasTutorSubjects] Structured Subject ${operation} rejected:`,
                validation.errors
            );
            return false;
        }

        return true;
    }

    function normalizeMetadata(metadata) {
        const candidate =
            metadata &&
            typeof metadata === 'object' &&
            !Array.isArray(metadata)
                ? cloneJson(metadata) || {}
                : {};

        const title =
            typeof candidate.title === 'string' &&
            candidate.title.trim()
                ? candidate.title.trim()
                : 'Untitled Subject';

        return {
            ...candidate,
            title,
            navTitle:
                typeof candidate.navTitle === 'string' &&
                candidate.navTitle.trim()
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

    function normalizeProvenance(provenance) {
        if (
            !provenance ||
            typeof provenance !== 'object' ||
            Array.isArray(provenance)
        ) {
            return null;
        }

        return cloneJson(provenance);
    }

    function createSubjectId() {
        if (
            window.crypto &&
            typeof window.crypto.randomUUID === 'function'
        ) {
            return `subject-${window.crypto.randomUUID()}`;
        }

        return `subject-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 10)}`;
    }

    function normalizeRecord(record) {
        if (
            !record ||
            typeof record !== 'object' ||
            Array.isArray(record)
        ) {
            return null;
        }

        const id =
            typeof record.id === 'string'
                ? record.id.trim()
                : '';

        const ownerId =
            typeof record.ownerId === 'string'
                ? record.ownerId.trim()
                : '';

        const format =
            typeof record.format === 'string'
                ? record.format.trim()
                : '';

        const document = normalizeDocument(record.document);

        if (
            !id ||
            !ownerId ||
            format !== STRUCTURED_FORMAT ||
            !document
        ) {
            return null;
        }

        const createdAt = Math.max(
            0,
            Number(record.createdAt) || 0
        );

        const updatedAt = Math.max(
            createdAt,
            Number(record.updatedAt) || createdAt
        );

        return {
            schemaVersion: SCHEMA_VERSION,
            id,
            ownerId,
            format: STRUCTURED_FORMAT,
            metadata: normalizeMetadata(record.metadata),
            document,
            revision: Math.max(
                1,
                Math.floor(Number(record.revision) || 1)
            ),
            createdAt,
            updatedAt,
            provenance: normalizeProvenance(record.provenance)
        };
    }

    function normalizeWorkingDraft(record, subjectId) {
        if (
            !record ||
            typeof record !== 'object' ||
            Array.isArray(record)
        ) {
            return null;
        }

        const id = String(subjectId || '').trim();
        const document = normalizeDocument(record.document);

        if (!id || !document) {
            return null;
        }

        return {
            schemaVersion: SCHEMA_VERSION,
            subjectId: id,
            ownerId: LOCAL_OWNER_ID,
            format: STRUCTURED_FORMAT,
            baseRevision: Math.max(
                1,
                Math.floor(Number(record.baseRevision) || 1)
            ),
            document,
            includedLiveSessionId:
                typeof record.includedLiveSessionId === 'string' &&
                record.includedLiveSessionId.trim()
                    ? record.includedLiveSessionId.trim()
                    : null,
            activeViewId:
                typeof record.activeViewId === 'string' &&
                record.activeViewId.trim()
                    ? record.activeViewId.trim()
                    : 'view-cover',
            startedAt: Math.max(
                0,
                Number(record.startedAt) ||
                Number(record.updatedAt) ||
                Date.now()
            ),
            updatedAt: Math.max(
                0,
                Number(record.updatedAt) || 0
            )
        };
    }

    async function createSubject(input = {}) {
        const format =
            typeof input.format === 'string'
                ? input.format.trim()
                : STRUCTURED_FORMAT;

        const document = normalizeDocument(input.document);

        if (
            format !== STRUCTURED_FORMAT ||
            !document ||
            !validateStructuredDocument(
                document,
                'create'
            )
        ) {
            return null;
        }

        let id = createSubjectId();

        while (readJson(subjectStorageKey(id))) {
            id = createSubjectId();
        }

        const timestamp = Date.now();

        const record = {
            schemaVersion: SCHEMA_VERSION,
            id,
            ownerId: LOCAL_OWNER_ID,
            format,
            metadata: normalizeMetadata(input.metadata),
            document,
            revision: 1,
            createdAt: timestamp,
            updatedAt: timestamp,
            provenance: normalizeProvenance(
                input.provenance
            )
        };

        return writeJson(
            subjectStorageKey(id),
            record
        )
            ? cloneJson(record)
            : null;
    }

    async function getSubject(subjectId) {
        const id = String(subjectId || '').trim();

        if (!id) return null;

        const record = normalizeRecord(
            readJson(subjectStorageKey(id))
        );

        if (
            !record ||
            record.ownerId !== LOCAL_OWNER_ID
        ) {
            return null;
        }

        return cloneJson(record);
    }

    async function listSubjects() {
        const subjects = [];

        try {
            for (
                let index = 0;
                index < localStorage.length;
                index += 1
            ) {
                const key = localStorage.key(index);

                if (
                    !key ||
                    !key.startsWith(SUBJECT_PREFIX)
                ) {
                    continue;
                }

                const record = normalizeRecord(
                    readJson(key)
                );

                if (
                    record &&
                    record.ownerId === LOCAL_OWNER_ID
                ) {
                    subjects.push(record);
                }
            }
        } catch {
            return [];
        }

        const storedOrder = readSubjectOrder();

        const subjectsById = new Map(
            subjects.map(subject => [
                subject.id,
                subject
            ])
        );

        const storedSubjects = storedOrder
            .map(id => subjectsById.get(id))
            .filter(Boolean);

        const storedIds = new Set(
            storedSubjects.map(subject =>
                subject.id
            )
        );

        const unlistedSubjects = subjects
            .filter(subject =>
                !storedIds.has(subject.id)
            )
            .sort(
                (left, right) =>
                    right.updatedAt - left.updatedAt
            );

        const orderedSubjects = [
            ...unlistedSubjects,
            ...storedSubjects
        ];

        const normalizedOrder =
            orderedSubjects.map(subject =>
                subject.id
            );

        if (
            JSON.stringify(normalizedOrder) !==
            JSON.stringify(storedOrder)
        ) {
            writeSubjectOrder(normalizedOrder);
        }

        return cloneJson(orderedSubjects) || [];
    }

    async function getWorkingDraft(subjectId) {
        const subject = await getSubject(subjectId);

        if (!subject) return null;

        return normalizeWorkingDraft(
            readJson(workingDraftStorageKey(subject.id)),
            subject.id
        );
    }

    async function saveWorkingDraft(
        subjectId,
        patch = {}
    ) {
        const subject = await getSubject(subjectId);

        if (!subject) return null;

        const nextPatch =
            patch &&
            typeof patch === 'object' &&
            !Array.isArray(patch)
                ? patch
                : {};

        const document = normalizeDocument(
            nextPatch.document
        );

        if (
            !document ||
            !validateStructuredDocument(
                document,
                'working draft'
            )
        ) {
            return null;
        }

        const current = await getWorkingDraft(subject.id);
        const timestamp = Date.now();

        const next = {
            schemaVersion: SCHEMA_VERSION,
            subjectId: subject.id,
            ownerId: LOCAL_OWNER_ID,
            format: STRUCTURED_FORMAT,
            baseRevision: Math.max(
                1,
                Math.floor(
                    Number(nextPatch.baseRevision) ||
                    Number(current?.baseRevision) ||
                    subject.revision
                )
            ),
            document,
            includedLiveSessionId:
                typeof nextPatch.includedLiveSessionId === 'string' &&
                nextPatch.includedLiveSessionId.trim()
                    ? nextPatch.includedLiveSessionId.trim()
                    : null,
            activeViewId:
                typeof nextPatch.activeViewId === 'string' &&
                nextPatch.activeViewId.trim()
                    ? nextPatch.activeViewId.trim()
                    : current?.activeViewId || 'view-cover',
            startedAt: current?.startedAt || timestamp,
            updatedAt: timestamp
        };

        return writeJson(
            workingDraftStorageKey(subject.id),
            next
        )
            ? cloneJson(next)
            : null;
    }

    async function clearWorkingDraft(subjectId) {
        const id = String(subjectId || '').trim();

        if (!id) return false;

        return removeValue(
            workingDraftStorageKey(id)
        );
    }

    async function updateSubject(
        subjectId,
        patch = {}
    ) {
        const current = await getSubject(subjectId);

        if (!current) return null;

        const nextPatch =
            patch &&
            typeof patch === 'object' &&
            !Array.isArray(patch)
                ? patch
                : {};

        let document = current.document;

        if (
            Object.prototype.hasOwnProperty.call(
                nextPatch,
                'document'
            )
        ) {
            document = normalizeDocument(
                nextPatch.document
            );

            if (!document) return null;
        }

        if (
            !validateStructuredDocument(
                document,
                'update'
            )
        ) {
            return null;
        }

        const metadataPatch =
            nextPatch.metadata &&
            typeof nextPatch.metadata === 'object' &&
            !Array.isArray(nextPatch.metadata)
                ? nextPatch.metadata
                : {};

        const metadata =
            Object.prototype.hasOwnProperty.call(
                nextPatch,
                'metadata'
            )
                ? normalizeMetadata({
                    ...current.metadata,
                    ...metadataPatch
                })
                : current.metadata;

        const provenance =
            Object.prototype.hasOwnProperty.call(
                nextPatch,
                'provenance'
            )
                ? normalizeProvenance(
                    nextPatch.provenance
                )
                : current.provenance;

        const next = {
            ...current,
            metadata,
            document,
            provenance,
            revision: current.revision + 1,
            updatedAt: Date.now()
        };

        return writeJson(
            subjectStorageKey(current.id),
            next
        )
            ? cloneJson(next)
            : null;
    }

    async function moveSubject(
        subjectId,
        offset
    ) {
        const id = String(subjectId || '').trim();
        const movement = Number(offset);

        if (
            !id ||
            (
                movement !== -1 &&
                movement !== 1
            )
        ) {
            return false;
        }

        const subjects = await listSubjects();
        const order = subjects.map(subject =>
            subject.id
        );

        const currentIndex =
            order.indexOf(id);

        if (currentIndex === -1) {
            return false;
        }

        const targetIndex =
            currentIndex + movement;

        if (
            targetIndex < 0 ||
            targetIndex >= order.length
        ) {
            return false;
        }

        [
            order[currentIndex],
            order[targetIndex]
        ] = [
            order[targetIndex],
            order[currentIndex]
        ];

        return writeSubjectOrder(order);
    }

    async function renameSubject(
        subjectId,
        nextTitle
    ) {
        const current = await getSubject(subjectId);
        const title = String(nextTitle || '').trim();

        if (!current || !title) return null;

        const document = normalizeDocument(
            current.document
        );

        if (!document) return null;

        document.module =
            document.module &&
            typeof document.module === 'object' &&
            !Array.isArray(document.module)
                ? document.module
                : {};

        document.module.title = title;
        document.module.navTitle = title;

        return updateSubject(
            current.id,
            {
                metadata: {
                    title,
                    navTitle: title
                },
                document
            }
        );
    }

    async function duplicateSubject(
        subjectId,
        patch = {}
    ) {
        const source = await getSubject(subjectId);

        if (!source) return null;

        const nextPatch =
            patch &&
            typeof patch === 'object' &&
            !Array.isArray(patch)
                ? patch
                : {};

        const metadataPatch =
            nextPatch.metadata &&
            typeof nextPatch.metadata === 'object' &&
            !Array.isArray(nextPatch.metadata)
                ? nextPatch.metadata
                : {};

        const sourceTitle = String(
            source.metadata?.title ||
            source.document?.module?.title ||
            'Untitled Subject'
        ).trim() || 'Untitled Subject';

        const title =
            typeof metadataPatch.title === 'string' &&
            metadataPatch.title.trim()
                ? metadataPatch.title.trim()
                : `${sourceTitle} copy`;

        const navTitle =
            typeof metadataPatch.navTitle === 'string' &&
            metadataPatch.navTitle.trim()
                ? metadataPatch.navTitle.trim()
                : title;

        const metadata = normalizeMetadata({
            ...source.metadata,
            ...metadataPatch,
            title,
            navTitle
        });

        const document = normalizeDocument(
            source.document
        );

        if (!document) return null;

        document.module =
            document.module &&
            typeof document.module === 'object' &&
            !Array.isArray(document.module)
                ? document.module
                : {};

        document.module.title = metadata.title;
        document.module.navTitle = metadata.navTitle;
        document.module.catalogDescription =
            metadata.description;
        document.module.bgImage =
            metadata.coverImage;

        return createSubject({
            format: source.format,
            metadata,
            document,
            provenance:
                Object.prototype.hasOwnProperty.call(
                    nextPatch,
                    'provenance'
                )
                    ? nextPatch.provenance
                    : {
                        kind: 'owned-subject-duplicate',
                        sourceSubjectId: source.id,
                        sourceRevision: source.revision,
                        sourceProvenance:
                            source.provenance || null
                    }
        });
    }

    async function deleteSubject(subjectId) {
        const current = await getSubject(subjectId);

        if (!current) return false;

        const deleted = removeValue(
            subjectStorageKey(current.id)
        );

        if (deleted) {
            removeValue(
                workingDraftStorageKey(current.id)
            );

            writeSubjectOrder(
                readSubjectOrder().filter(id =>
                    id !== current.id
                )
            );
        }

        return deleted;
    }

    window.AtlasTutorSubjects = {
        schemaVersion: SCHEMA_VERSION,
        localOwnerId: LOCAL_OWNER_ID,
        structuredFormat: STRUCTURED_FORMAT,

        createSubject,
        getSubject,
        listSubjects,

        getWorkingDraft,
        saveWorkingDraft,
        clearWorkingDraft,

        updateSubject,
        moveSubject,
        renameSubject,
        duplicateSubject,
        deleteSubject
    };
})();
