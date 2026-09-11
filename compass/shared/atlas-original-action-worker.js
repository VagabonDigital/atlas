// ============================================================
// ATLAS ORIGINAL ACTION WORKER
// Lightweight ownership bridge for Compass Hub actions.
//
// Runs only for atlasHubAction=own|duplicate after subject-data.js.
// It deliberately avoids mounting the full Compass lesson runtime.
// ============================================================

(function () {
    'use strict';

    function cloneJson(value) {
        if (!value || typeof value !== 'object') return null;

        try {
            return JSON.parse(JSON.stringify(value));
        } catch {
            return null;
        }
    }

    function cloneOverrides(value) {
        return {
            ...(value && typeof value === 'object' && !Array.isArray(value)
                ? value
                : {})
        };
    }

    function getCatalogDescription() {
        try {
            const Catalog = window.CompassCatalogData;

            if (!Catalog) return '';

            const catalog =
                typeof Catalog.getCompassCatalogMap === 'function'
                    ? Catalog.getCompassCatalogMap()
                    : {};

            const subject =
                catalog?.[`compass:${MODULE.id}`] ||
                Object.values(catalog || {}).find(item =>
                    item?.id === MODULE.id
                );

            return String(
                subject?.description ||
                subject?.hook ||
                ''
            ).trim();
        } catch {
            return '';
        }
    }

    function createAtlasSubjectDocument() {
        return {
            schemaVersion: 1,
            module: {
                title: MODULE.title,
                navTitle: MODULE.navTitle || MODULE.title,
                bgImage: MODULE.bgImage,
                catalogDescription:
                    typeof MODULE.catalogDescription === 'string'
                        ? MODULE.catalogDescription
                        : getCatalogDescription()
            },
            subjectCopy: cloneJson(subjectCopy),
            discussionSets: cloneJson(discussionSets),
            culturalLensCards: cloneJson(clCards)
        };
    }

    const ATLAS_SUBJECT_DOCUMENT =
        createAtlasSubjectDocument();

    function normalizeTutorSubjectDocument(document) {
        const fallback = cloneJson(
            ATLAS_SUBJECT_DOCUMENT
        );

        const candidate = cloneJson(document);

        if (!candidate) return fallback;

        const discussionDocumentIsValid =
            Array.isArray(candidate.discussionSets) &&
            candidate.discussionSets.length > 0 &&
            candidate.discussionSets.every(set =>
                set &&
                typeof set === 'object' &&
                typeof set.id === 'string' &&
                set.id.trim() &&
                Array.isArray(set.moments) &&
                set.moments.length > 0
            );

        const culturalLensDocumentIsValid =
            Array.isArray(candidate.culturalLensCards) &&
            candidate.culturalLensCards.length > 0;

        return {
            schemaVersion: 1,
            module: {
                ...fallback.module,
                ...(candidate.module &&
                typeof candidate.module === 'object' &&
                !Array.isArray(candidate.module)
                    ? candidate.module
                    : {})
            },
            subjectCopy:
                candidate.subjectCopy &&
                typeof candidate.subjectCopy === 'object' &&
                !Array.isArray(candidate.subjectCopy)
                    ? candidate.subjectCopy
                    : fallback.subjectCopy,
            discussionSets: discussionDocumentIsValid
                ? candidate.discussionSets
                : fallback.discussionSets,
            culturalLensCards: culturalLensDocumentIsValid
                ? candidate.culturalLensCards
                : fallback.culturalLensCards
        };
    }

    function getDiscussionMoment(document, momentId) {
        for (const set of document?.discussionSets || []) {
            const moment = (set.moments || []).find(
                item => item.id === momentId
            );

            if (moment) return moment;
        }

        return null;
    }

    function getCulturalLensCard(document, cardId) {
        return (document?.culturalLensCards || []).find(
            card => card.id === cardId
        ) || null;
    }

    function applyPublishedOverride(
        document,
        fieldKey,
        value
    ) {
        const nextValue = String(value ?? '');

        const exactTargets = {
            'module.title': [document?.module, 'title'],
            'module.bgImage': [document?.module, 'bgImage'],
            'module.catalogDescription': [
                document?.module,
                'catalogDescription'
            ],
            'cover.hook': [
                document?.subjectCopy?.cover,
                'hook'
            ],
            'overview.heading': [
                document?.subjectCopy?.overview,
                'heading'
            ],
            'overview.question': [
                document?.subjectCopy?.overview,
                'question'
            ],
            'paths.discussionTitle': [
                document?.subjectCopy?.paths,
                'discussionTitle'
            ],
            'paths.discussionDescription': [
                document?.subjectCopy?.paths,
                'discussionDescription'
            ],
            'paths.culturalLensTitle': [
                document?.subjectCopy?.paths,
                'culturalLensTitle'
            ],
            'paths.culturalLensDescription': [
                document?.subjectCopy?.paths,
                'culturalLensDescription'
            ],
            'paths.reflectionTitle': [
                document?.subjectCopy?.paths,
                'reflectionTitle'
            ],
            'paths.reflectionDescription': [
                document?.subjectCopy?.paths,
                'reflectionDescription'
            ],
            'culturalLens.heading': [
                document?.subjectCopy?.culturalLens,
                'heading'
            ],
            'culturalLens.intro': [
                document?.subjectCopy?.culturalLens,
                'intro'
            ],
            'discussion.heading': [
                document?.subjectCopy?.discussion,
                'heading'
            ],
            'discussion.intro': [
                document?.subjectCopy?.discussion,
                'intro'
            ],
            'reflection.title': [
                document?.subjectCopy?.reflection,
                'title'
            ],
            'reflection.summary': [
                document?.subjectCopy?.reflection,
                'summary'
            ]
        };

        if (Object.prototype.hasOwnProperty.call(
            exactTargets,
            fieldKey
        )) {
            const [target, field] = exactTargets[fieldKey];

            if (!target) return false;

            target[field] = nextValue;
            return true;
        }

        let match = fieldKey.match(
            /^overview\.intro\.(\d+)$/
        );

        if (match) {
            const intro =
                document?.subjectCopy?.overview?.intro;
            const index = Number(match[1]);

            if (
                !Array.isArray(intro) ||
                index >= intro.length
            ) {
                return false;
            }

            intro[index] = nextValue;
            return true;
        }

        match = fieldKey.match(
            /^reflection\.questions\.(\d+)$/
        );

        if (match) {
            const questions =
                document?.subjectCopy?.reflection?.questions;
            const index = Number(match[1]);

            if (
                !Array.isArray(questions) ||
                index >= questions.length
            ) {
                return false;
            }

            questions[index] = nextValue;
            return true;
        }

        match = fieldKey.match(
            /^discussion\.set\.([^.]+)\.makeItReal\.(label|title|prompt)$/
        );

        if (match) {
            const set = (document?.discussionSets || []).find(
                item => item.id === match[1]
            );

            if (!set?.makeItReal) return false;

            set.makeItReal[match[2]] = nextValue;
            return true;
        }

        match = fieldKey.match(
            /^discussion\.set\.([^.]+)\.(stage|title|description)$/
        );

        if (match) {
            const set = (document?.discussionSets || []).find(
                item => item.id === match[1]
            );

            if (!set) return false;

            set[match[2]] = nextValue;
            return true;
        }

        match = fieldKey.match(
            /^discussion\.([^.]+)\.(preview|question)$/
        );

        if (match) {
            const moment = getDiscussionMoment(
                document,
                match[1]
            );

            if (!moment) return false;

            moment[match[2]] = nextValue;
            return true;
        }

        match = fieldKey.match(
            /^discussion\.([^.]+)\.followUp\.([^.]+)\.(prompt|label)$/
        );

        if (match) {
            const moment = getDiscussionMoment(
                document,
                match[1]
            );

            if (!moment) return false;

            const followUps = Array.isArray(moment.followUps)
                ? moment.followUps
                : moment.followUp
                    ? [moment.followUp]
                    : [];

            const followUp = followUps.find(
                item => item.id === match[2]
            );

            if (!followUp) return false;

            followUp[match[3]] = nextValue;
            return true;
        }

        match = fieldKey.match(
            /^culturalLens\.([^.]+)\.(contextLine|title|teaser|context|questionLabel|followTheThreadLabel|mainQuestion)$/
        );

        if (match) {
            const card = getCulturalLensCard(
                document,
                match[1]
            );

            if (!card) return false;

            if (
                match[2] === 'mainQuestion' &&
                Array.isArray(card.questions)
            ) {
                return true;
            }

            card[match[2]] = nextValue;
            return true;
        }

        match = fieldKey.match(
            /^culturalLens\.([^.]+)\.questions\.(\d+)$/
        );

        if (match) {
            const card = getCulturalLensCard(
                document,
                match[1]
            );
            const index = Number(match[2]);

            if (
                !Array.isArray(card?.questions) ||
                index >= card.questions.length
            ) {
                return false;
            }

            card.questions[index] = nextValue;
            return true;
        }

        match = fieldKey.match(
            /^culturalLens\.([^.]+)\.followTheThread\.(\d+)$/
        );

        if (match) {
            const card = getCulturalLensCard(
                document,
                match[1]
            );
            const index = Number(match[2]);

            if (
                !Array.isArray(card?.followTheThread) ||
                index >= card.followTheThread.length
            ) {
                return false;
            }

            card.followTheThread[index] = nextValue;
            return true;
        }

        match = fieldKey.match(
            /^upgrade\.(moment|cultural-lens)\.([^.]+)\.(term|type|definition|ordinary|upgraded|atlasPrompt|insteadOfLabel|tryLabel)$/
        );

        if (match) {
            const target = match[1] === 'moment'
                ? getDiscussionMoment(
                    document,
                    match[2]
                )
                : getCulturalLensCard(
                    document,
                    match[2]
                );

            if (!target?.upgrade) return false;

            target.upgrade[match[3]] = nextValue;
            return true;
        }

        return false;
    }

    function materializeTutorSubjectDocument(
        sourceDocument,
        sourceOverrides,
        label = 'Tutor subject'
    ) {
        const document = normalizeTutorSubjectDocument(
            sourceDocument || ATLAS_SUBJECT_DOCUMENT
        );

        const overrides = cloneOverrides(sourceOverrides);

        const unmappedOverrideKeys =
            Object.entries(overrides)
                .filter(([fieldKey, value]) =>
                    !applyPublishedOverride(
                        document,
                        fieldKey,
                        value
                    )
                )
                .map(([fieldKey]) => fieldKey);

        if (unmappedOverrideKeys.length) {
            throw new Error(
                `[Compass] ${label} materialization has unmapped overrides: ${unmappedOverrideKeys.join(', ')}`
            );
        }

        return cloneJson(document);
    }

    function postResult(
        requestId,
        action,
        ok,
        subjectId = '',
        message = ''
    ) {
        window.parent.postMessage(
            {
                type: 'atlas:hub-subject-action-complete',
                requestId,
                action,
                ok,
                ...(subjectId ? { subjectId } : {}),
                ...(message ? { message } : {})
            },
            window.location.origin
        );
    }

    async function run() {
        let url;

        try {
            url = new URL(window.location.href);
        } catch {
            return;
        }

        const action = String(
            url.searchParams.get('atlasHubAction') || ''
        ).trim();

        const requestId = String(
            url.searchParams.get('atlasHubRequest') || ''
        ).trim();

        if (
            !requestId ||
            (action !== 'own' && action !== 'duplicate')
        ) {
            return;
        }

        try {
            const Content = window.AtlasTutorContent;
            const Subjects = window.AtlasTutorSubjects;

            if (
                !Content ||
                typeof Content.getVersion !== 'function' ||
                !Subjects ||
                typeof Subjects.createSubject !== 'function'
            ) {
                throw new Error(
                    'Atlas ownership persistence is unavailable.'
                );
            }

            const sourceContentId =
                `compass:${MODULE.id}`;

            const publishedVersion =
                await Content.getVersion(
                    sourceContentId
                );

            const document = publishedVersion
                ? materializeTutorSubjectDocument(
                    publishedVersion.document ||
                        ATLAS_SUBJECT_DOCUMENT,
                    publishedVersion.overrides,
                    'My Version'
                )
                : createAtlasSubjectDocument();

            if (!document) {
                throw new Error(
                    'Atlas source could not be materialized.'
                );
            }

            const ownershipAction =
                action === 'own';

            const subject =
                await Subjects.createSubject({
                    format: 'structured',
                    metadata: {
                        title:
                            String(
                                document.module?.title ||
                                MODULE.title
                            ).trim() || MODULE.title,
                        navTitle:
                            String(
                                document.module?.navTitle ||
                                document.module?.title ||
                                MODULE.navTitle ||
                                MODULE.title
                            ).trim(),
                        description:
                            String(
                                document.module
                                    ?.catalogDescription || ''
                            ).trim(),
                        coverImage:
                            String(
                                document.module?.bgImage || ''
                            ).trim()
                    },
                    document,
                    provenance: {
                        kind: ownershipAction
                            ? (
                                publishedVersion
                                    ? 'atlas-my-version'
                                    : 'atlas-original-owned'
                            )
                            : 'atlas-duplicate',
                        sourceWorld: 'compass',
                        sourceSubjectId: MODULE.id,
                        sourceContentId,
                        sourceContentVersion:
                            typeof MODULE.contentVersion ===
                                'string'
                                ? MODULE.contentVersion
                                : '',
                        sourceVersionRevision:
                            publishedVersion
                                ? Math.max(
                                    0,
                                    Math.floor(
                                        Number(
                                            publishedVersion.revision
                                        ) || 0
                                    )
                                )
                                : 0
                    }
                });

            if (!subject) {
                throw new Error(
                    'AtlasTutorSubjects failed to create the owned subject.'
                );
            }

            postResult(
                requestId,
                action,
                true,
                subject.id
            );
        } catch (error) {
            console.error(
                '[Compass] Fast Atlas ownership action failed:',
                error
            );

            postResult(
                requestId,
                action,
                false,
                '',
                'Couldn’t prepare this subject.'
            );
        }
    }

    run();
})();