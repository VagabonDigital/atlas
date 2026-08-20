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
    const PORTABLE_SCHEMA_VERSION = 1;
    const LOCAL_OWNER_ID = 'local-tutor';
    const SUBJECT_PREFIX = 'atlas::tutorSubjects::subject::';
    const WORKING_DRAFT_PREFIX = 'atlas::tutorSubjects::workingDraft::';
    const SESSION_SUBJECTS_PREFIX = 'atlas::tutorSubjects::sessionSubjects::';
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

    function sessionSubjectsStorageKey(sessionId) {
        return `${SESSION_SUBJECTS_PREFIX}${encodePart(sessionId)}`;
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

        for (let index = 0; index < localStorage.length; index += 1) {
            const key = localStorage.key(index);

            if (key && key.startsWith(prefix)) {
                keys.push(key);
            }
        }

        return keys.sort();
    }

    function readJsonStrict(key) {
        const raw = localStorage.getItem(key);

        if (raw === null) {
            throw new Error(`Missing Tutor Subjects record: ${key}`);
        }

        try {
            return JSON.parse(raw);
        } catch {
            throw new Error(`Invalid Tutor Subjects JSON: ${key}`);
        }
    }

    function readPortableRecord(key, prefix, identityField) {
        const record = readJsonStrict(key);
        let storageId = '';

        try {
            storageId = decodeURIComponent(key.slice(prefix.length));
        } catch {
            throw new Error(`Invalid Tutor Subjects key: ${key}`);
        }

        if (record?.[identityField] !== storageId) {
            throw new Error(
                `Tutor Subjects record does not match its key: ${key}`
            );
        }

        return record;
    }

    function hasExactKeys(value, expectedKeys) {
        const keys = Object.keys(value).sort();
        const expected = [...expectedKeys].sort();

        return keys.length === expected.length &&
            keys.every((key, index) => key === expected[index]);
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

    function normalizeSubjectRef(value) {
        if (
            !value ||
            typeof value !== 'object' ||
            Array.isArray(value)
        ) {
            return null;
        }

        const kind =
            typeof value.kind === 'string'
                ? value.kind.trim()
                : '';

        const id =
            typeof value.id === 'string'
                ? value.id.trim()
                : '';

        if (
            !id ||
            (
                kind !== 'my-subject' &&
                kind !== 'atlas-subject'
            )
        ) {
            return null;
        }

        return { kind, id };
    }

    function normalizeSessionSubjectRefs(value) {
        const seen = new Set();

        return (Array.isArray(value) ? value : [])
            .map(normalizeSubjectRef)
            .filter(ref => {
                if (!ref) return false;

                const key = `${ref.kind}:${ref.id}`;

                if (seen.has(key)) {
                    return false;
                }

                seen.add(key);
                return true;
            });
    }

    function readSessionSubjects(sessionId) {
        const id = String(sessionId || '').trim();

        if (!id) return [];

        return normalizeSessionSubjectRefs(
            readJson(sessionSubjectsStorageKey(id))
        );
    }

    function writeSessionSubjects(
        sessionId,
        subjectRefs
    ) {
        const id = String(sessionId || '').trim();

        if (!id) return false;

        const refs =
            normalizeSessionSubjectRefs(subjectRefs);

        if (refs.length === 0) {
            return removeValue(
                sessionSubjectsStorageKey(id)
            );
        }

        return writeJson(
            sessionSubjectsStorageKey(id),
            refs
        );
    }

    function removeMySubjectFromSessionSubjects(
        subjectId
    ) {
        const id = String(subjectId || '').trim();

        if (!id) return;

        listKeysWithPrefix(
            SESSION_SUBJECTS_PREFIX
        ).forEach(key => {
            const refs =
                normalizeSessionSubjectRefs(
                    readJson(key)
                );

            const next = refs.filter(ref =>
                !(
                    ref.kind === 'my-subject' &&
                    ref.id === id
                )
            );

            if (next.length === refs.length) {
                return;
            }

            if (next.length === 0) {
                removeValue(key);
                return;
            }

            writeJson(key, next);
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

    function validatePortableDocument(document, label, errors) {
        const Structured = window.AtlasStructuredSubject;

        if (
            !Structured ||
            typeof Structured.validateDocument !== 'function'
        ) {
            errors.push(
                'Structured Subject validation is unavailable.'
            );
            return;
        }

        const validation = Structured.validateDocument(document);

        if (!validation.valid) {
            validation.errors.forEach(error => {
                errors.push(`${label}: ${error}`);
            });
        }
    }

    function validatePortableSubject(record, label, errors) {
        if (
            !record ||
            typeof record !== 'object' ||
            Array.isArray(record)
        ) {
            errors.push(`${label} must be an object.`);
            return null;
        }

        const id =
            typeof record.id === 'string'
                ? record.id.trim()
                : '';

        if (!id) {
            errors.push(`${label} requires id.`);
            return null;
        }

        if (!hasExactKeys(record, [
            'schemaVersion',
            'id',
            'ownerId',
            'format',
            'metadata',
            'document',
            'revision',
            'createdAt',
            'updatedAt',
            'provenance'
        ])) {
            errors.push(`${label} has an invalid shape.`);
        }

        if (record.schemaVersion !== SCHEMA_VERSION) {
            errors.push(
                `${label} must use Tutor Subjects schema ${SCHEMA_VERSION}.`
            );
        }

        if (record.ownerId !== LOCAL_OWNER_ID) {
            errors.push(`${label} has an unsupported owner.`);
        }

        if (record.format !== STRUCTURED_FORMAT) {
            errors.push(`${label} has an unsupported format.`);
        }

        if (
            !record.metadata ||
            typeof record.metadata !== 'object' ||
            Array.isArray(record.metadata)
        ) {
            errors.push(`${label}.metadata must be an object.`);
        }

        if (
            !Number.isInteger(record.revision) ||
            record.revision < 1
        ) {
            errors.push(`${label}.revision must be a positive integer.`);
        }

        ['createdAt', 'updatedAt'].forEach(field => {
            if (
                !Number.isFinite(record[field]) ||
                record[field] < 0
            ) {
                errors.push(`${label}.${field} must be a non-negative number.`);
            }
        });

        if (
            Number.isFinite(record.createdAt) &&
            Number.isFinite(record.updatedAt) &&
            record.updatedAt < record.createdAt
        ) {
            errors.push(`${label}.updatedAt cannot precede createdAt.`);
        }

        if (
            record.provenance !== null &&
            (
                typeof record.provenance !== 'object' ||
                Array.isArray(record.provenance)
            )
        ) {
            errors.push(`${label}.provenance must be null or an object.`);
        }

        validatePortableDocument(
            record.document,
            `${label}.document`,
            errors
        );

        const normalized = normalizeRecord(record);

        if (!normalized || !cloneJson(record)) {
            errors.push(`${label} cannot be serialized safely.`);
            return null;
        }

        return normalized;
    }

    function validatePortableWorkingDraft(record, label, errors) {
        if (
            !record ||
            typeof record !== 'object' ||
            Array.isArray(record)
        ) {
            errors.push(`${label} must be an object.`);
            return null;
        }

        const subjectId =
            typeof record.subjectId === 'string'
                ? record.subjectId.trim()
                : '';

        if (!subjectId) {
            errors.push(`${label} requires subjectId.`);
            return null;
        }

        if (!hasExactKeys(record, [
            'schemaVersion',
            'subjectId',
            'ownerId',
            'format',
            'baseRevision',
            'document',
            'includedLiveSessionId',
            'activeViewId',
            'startedAt',
            'updatedAt'
        ])) {
            errors.push(`${label} has an invalid shape.`);
        }

        if (record.schemaVersion !== SCHEMA_VERSION) {
            errors.push(
                `${label} must use Tutor Subjects schema ${SCHEMA_VERSION}.`
            );
        }

        if (record.ownerId !== LOCAL_OWNER_ID) {
            errors.push(`${label} has an unsupported owner.`);
        }

        if (record.format !== STRUCTURED_FORMAT) {
            errors.push(`${label} has an unsupported format.`);
        }

        if (
            !Number.isInteger(record.baseRevision) ||
            record.baseRevision < 1
        ) {
            errors.push(`${label}.baseRevision must be a positive integer.`);
        }

        if (
            record.includedLiveSessionId !== null &&
            (
                typeof record.includedLiveSessionId !== 'string' ||
                !record.includedLiveSessionId.trim()
            )
        ) {
            errors.push(
                `${label}.includedLiveSessionId must be null or a non-empty string.`
            );
        }

        if (
            typeof record.activeViewId !== 'string' ||
            !record.activeViewId.trim()
        ) {
            errors.push(`${label}.activeViewId must be a non-empty string.`);
        }

        ['startedAt', 'updatedAt'].forEach(field => {
            if (
                !Number.isFinite(record[field]) ||
                record[field] < 0
            ) {
                errors.push(`${label}.${field} must be a non-negative number.`);
            }
        });

        validatePortableDocument(
            record.document,
            `${label}.document`,
            errors
        );

        const normalized = normalizeWorkingDraft(record, subjectId);

        if (!normalized || !cloneJson(record)) {
            errors.push(`${label} cannot be serialized safely.`);
            return null;
        }

        return normalized;
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

    async function getSessionSubjects(sessionId) {
        return cloneJson(
            readSessionSubjects(sessionId)
        ) || [];
    }

    async function setSessionSubjects(
        sessionId,
        subjectRefs
    ) {
        const id = String(sessionId || '').trim();

        if (!id || !Array.isArray(subjectRefs)) {
            return null;
        }

        const refs =
            normalizeSessionSubjectRefs(subjectRefs);

        return writeSessionSubjects(id, refs)
            ? cloneJson(refs)
            : null;
    }

    async function addSessionSubject(
        sessionId,
        subjectRef
    ) {
        const ref = normalizeSubjectRef(subjectRef);

        if (!ref) return null;

        const current =
            readSessionSubjects(sessionId);

        const next =
            normalizeSessionSubjectRefs([
                ...current,
                ref
            ]);

        return writeSessionSubjects(
            sessionId,
            next
        )
            ? cloneJson(next)
            : null;
    }

    async function removeSessionSubject(
        sessionId,
        subjectRef
    ) {
        const ref = normalizeSubjectRef(subjectRef);

        if (!ref) return null;

        const next =
            readSessionSubjects(sessionId)
                .filter(item =>
                    !(
                        item.kind === ref.kind &&
                        item.id === ref.id
                    )
                );

        return writeSessionSubjects(
            sessionId,
            next
        )
            ? cloneJson(next)
            : null;
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

            removeMySubjectFromSessionSubjects(
                current.id
            );

            writeSubjectOrder(
                readSubjectOrder().filter(id =>
                    id !== current.id
                )
            );
        }

        return deleted;
    }

    function validatePortableData(payload) {
        const errors = [];

        if (
            !payload ||
            typeof payload !== 'object' ||
            Array.isArray(payload)
        ) {
            return {
                valid: false,
                errors: ['Tutor Subjects data must be an object.']
            };
        }

        if (payload.schemaVersion !== PORTABLE_SCHEMA_VERSION) {
            errors.push(
                `Tutor Subjects portable schema must be ${PORTABLE_SCHEMA_VERSION}.`
            );
        }

        if (
            !hasExactKeys(payload, [
                'schemaVersion',
                'subjects',
                'workingDrafts',
                'order'
            ]) &&
            !hasExactKeys(payload, [
                'schemaVersion',
                'subjects',
                'workingDrafts',
                'order',
                'sessionSubjects'
            ])
        ) {
            errors.push('Tutor Subjects data has an invalid shape.');
        }

        if (!Array.isArray(payload.subjects)) {
            errors.push('Tutor Subjects subjects must be an array.');
        }

        if (!Array.isArray(payload.workingDrafts)) {
            errors.push('Tutor Subjects workingDrafts must be an array.');
        }

        if (!Array.isArray(payload.order)) {
            errors.push('Tutor Subjects order must be an array.');
        }

        const subjects = [];
        const workingDrafts = [];
        const sessionSubjects = {};
        const subjectIds = new Set();
        const draftIds = new Set();

        (Array.isArray(payload.subjects) ? payload.subjects : [])
            .forEach((record, index) => {
                const label = `Tutor Subject ${index + 1}`;
                const normalized = validatePortableSubject(
                    record,
                    label,
                    errors
                );

                if (!normalized) return;

                if (subjectIds.has(normalized.id)) {
                    errors.push(`${label} duplicates id ${normalized.id}.`);
                    return;
                }

                subjectIds.add(normalized.id);
                subjects.push(normalized);
            });

        (Array.isArray(payload.workingDrafts)
            ? payload.workingDrafts
            : []
        ).forEach((record, index) => {
            const label = `Tutor Subject working draft ${index + 1}`;
            const normalized = validatePortableWorkingDraft(
                record,
                label,
                errors
            );

            if (!normalized) return;

            if (draftIds.has(normalized.subjectId)) {
                errors.push(
                    `${label} duplicates subjectId ${normalized.subjectId}.`
                );
                return;
            }

            if (!subjectIds.has(normalized.subjectId)) {
                errors.push(
                    `${label} does not belong to a restored My Subject.`
                );
            }

            draftIds.add(normalized.subjectId);
            workingDrafts.push(normalized);
        });

        const rawSessionSubjects =
            payload.sessionSubjects === undefined
                ? {}
                : payload.sessionSubjects;

        if (
            !rawSessionSubjects ||
            typeof rawSessionSubjects !== 'object' ||
            Array.isArray(rawSessionSubjects)
        ) {
            errors.push(
                'Tutor Subjects sessionSubjects must be an object.'
            );
        } else {
            Object.entries(rawSessionSubjects)
                .forEach(([sessionId, refs]) => {
                    const normalizedSessionId =
                        String(sessionId || '').trim();

                    if (
                        !normalizedSessionId ||
                        normalizedSessionId !== sessionId
                    ) {
                        errors.push(
                            'Tutor Subjects sessionSubjects requires valid session IDs.'
                        );
                        return;
                    }

                    if (!Array.isArray(refs)) {
                        errors.push(
                            `Tutor Subjects session ${sessionId} must be an array.`
                        );
                        return;
                    }

                    const normalizedRefs =
                        normalizeSessionSubjectRefs(refs);

                    const refsAreValid =
                        normalizedRefs.length === refs.length &&
                        refs.every((ref, index) => {
                            const normalized =
                                normalizedRefs[index];

                            return (
                                ref &&
                                typeof ref === 'object' &&
                                !Array.isArray(ref) &&
                                hasExactKeys(ref, ['kind', 'id']) &&
                                normalized &&
                                normalized.kind === ref.kind &&
                                normalized.id === ref.id
                            );
                        });

                    if (!refsAreValid) {
                        errors.push(
                            `Tutor Subjects session ${sessionId} has invalid subject references.`
                        );
                        return;
                    }

                    normalizedRefs.forEach(ref => {
                        if (
                            ref.kind === 'my-subject' &&
                            !subjectIds.has(ref.id)
                        ) {
                            errors.push(
                                `Tutor Subjects session ${sessionId} references missing My Subject ${ref.id}.`
                            );
                        }
                    });

                    sessionSubjects[sessionId] =
                        normalizedRefs;
                });
        }

        const order = Array.isArray(payload.order)
            ? payload.order
            : [];
        const normalizedOrder = normalizeSubjectOrder(order);

        if (
            normalizedOrder.length !== order.length ||
            normalizedOrder.some((id, index) => id !== order[index])
        ) {
            errors.push(
                'Tutor Subjects order must contain unique, non-empty subject IDs.'
            );
        }

        if (
            normalizedOrder.length !== subjectIds.size ||
            normalizedOrder.some(id => !subjectIds.has(id))
        ) {
            errors.push(
                'Tutor Subjects order must contain every restored My Subject exactly once.'
            );
        }

        return {
            valid: errors.length === 0,
            errors,
            ...(errors.length === 0
                ? {
                    data: {
                        schemaVersion: PORTABLE_SCHEMA_VERSION,
                        subjects,
                        workingDrafts,
                        order: normalizedOrder,
                        sessionSubjects
                    }
                }
                : {})
        };
    }

    async function exportPortableData() {
        const subjects = listKeysWithPrefix(SUBJECT_PREFIX)
            .map(key => readPortableRecord(
                key,
                SUBJECT_PREFIX,
                'id'
            ));
        const subjectIds = new Set(
            subjects
                .map(record =>
                    typeof record?.id === 'string'
                        ? record.id.trim()
                        : ''
                )
                .filter(Boolean)
        );
        const workingDrafts = listKeysWithPrefix(
            WORKING_DRAFT_PREFIX
        )
            .map(key => readPortableRecord(
                key,
                WORKING_DRAFT_PREFIX,
                'subjectId'
            ))
            .filter(record => subjectIds.has(record?.subjectId));

        let storedOrder = [];
        const rawOrder = localStorage.getItem(ORDER_KEY);

        if (rawOrder !== null) {
            try {
                storedOrder = normalizeSubjectOrder(
                    JSON.parse(rawOrder)
                );
            } catch {
                throw new Error('Invalid Tutor Subjects ordering JSON.');
            }
        }

        const orderedIds = storedOrder.filter(id =>
            subjectIds.has(id)
        );
        const orderedIdSet = new Set(orderedIds);
        const unlistedIds = subjects
            .filter(record => !orderedIdSet.has(record.id))
            .sort(
                (left, right) =>
                    Number(right.updatedAt || 0) -
                    Number(left.updatedAt || 0)
            )
            .map(record => record.id);

        const sessionSubjects = {};

        listKeysWithPrefix(
            SESSION_SUBJECTS_PREFIX
        ).forEach(key => {
            let sessionId = '';

            try {
                sessionId = decodeURIComponent(
                    key.slice(
                        SESSION_SUBJECTS_PREFIX.length
                    )
                );
            } catch {
                throw new Error(
                    `Invalid Tutor Subjects session key: ${key}`
                );
            }

            if (!sessionId) {
                throw new Error(
                    `Invalid Tutor Subjects session key: ${key}`
                );
            }

            sessionSubjects[sessionId] =
                readJsonStrict(key);
        });

        const validation = validatePortableData({
            schemaVersion: PORTABLE_SCHEMA_VERSION,
            subjects,
            workingDrafts,
            order: [...unlistedIds, ...orderedIds],
            sessionSubjects
        });

        if (!validation.valid) {
            throw new Error(validation.errors.join(' '));
        }

        return validation.data;
    }

    async function restorePortableData(payload) {
        const validation = validatePortableData(payload);

        if (!validation.valid) {
            throw new Error(validation.errors.join(' '));
        }

        const existingKeys = [
            ...listKeysWithPrefix(SUBJECT_PREFIX),
            ...listKeysWithPrefix(WORKING_DRAFT_PREFIX),
            ...listKeysWithPrefix(SESSION_SUBJECTS_PREFIX)
        ];

        existingKeys.forEach(key => {
            localStorage.removeItem(key);
        });
        localStorage.removeItem(ORDER_KEY);

        validation.data.subjects.forEach(record => {
            localStorage.setItem(
                subjectStorageKey(record.id),
                JSON.stringify(record)
            );
        });

        validation.data.workingDrafts.forEach(record => {
            localStorage.setItem(
                workingDraftStorageKey(record.subjectId),
                JSON.stringify(record)
            );
        });

        localStorage.setItem(
            ORDER_KEY,
            JSON.stringify(validation.data.order)
        );

        Object.entries(
            validation.data.sessionSubjects
        ).forEach(([sessionId, refs]) => {
            localStorage.setItem(
                sessionSubjectsStorageKey(sessionId),
                JSON.stringify(refs)
            );
        });

        return true;
    }

    window.AtlasTutorSubjects = {
        schemaVersion: SCHEMA_VERSION,
        localOwnerId: LOCAL_OWNER_ID,
        structuredFormat: STRUCTURED_FORMAT,

        createSubject,
        getSubject,
        listSubjects,

        getSessionSubjects,
        setSessionSubjects,
        addSessionSubject,
        removeSessionSubject,

        getWorkingDraft,
        saveWorkingDraft,
        clearWorkingDraft,

        updateSubject,
        moveSubject,
        renameSubject,
        duplicateSubject,
        deleteSubject,

        exportPortableData,
        validatePortableData,
        restorePortableData
    };
})();
