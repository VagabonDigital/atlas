from pathlib import Path
import re

ROOT = Path('.')


def read(path):
    return Path(path).read_text(encoding='utf-8')


def write(path, text):
    Path(path).write_text(text, encoding='utf-8')


def replace_once(text, old, new, label):
    if text.count(old) != 1:
        raise RuntimeError(f'{label}: expected exactly one literal match, found {text.count(old)}')
    return text.replace(old, new, 1)


def sub_once(text, pattern, repl, label, flags=re.S):
    new, count = re.subn(pattern, repl, text, count=1, flags=flags)
    if count != 1:
        raise RuntimeError(f'{label}: expected exactly one regex match, found {count}')
    return new


# ---------------------------------------------------------------------------
# Preflight: the three standalone migration helpers must already be dead code.
# If anything still loads or calls them, stop rather than guessing.
# ---------------------------------------------------------------------------
legacy_files = {
    'shared/atlas-subject-migration.js',
    'shared/atlas-library-migration.js',
    'shared/atlas-learner-session-migration.js',
}
legacy_terms = (
    'atlas-subject-migration.js',
    'atlas-library-migration.js',
    'atlas-learner-session-migration.js',
    'AtlasSubjectMigration',
    'AtlasLibraryMigration',
    'AtlasLearnerSessionMigration',
)

references = []
for path in ROOT.rglob('*'):
    if not path.is_file() or '.git' in path.parts:
        continue
    rel = path.as_posix()
    if rel in legacy_files or rel.startswith('.github/scripts/batch2_'):
        continue
    try:
        content = path.read_text(encoding='utf-8')
    except (UnicodeDecodeError, OSError):
        continue
    for term in legacy_terms:
        if term in content:
            references.append(f'{rel}: {term}')

if references:
    raise RuntimeError('Standalone migration helpers still have call-sites:\n' + '\n'.join(references))

for rel in legacy_files:
    path = Path(rel)
    if not path.exists():
        raise RuntimeError(f'Expected legacy migration file missing before cleanup: {rel}')
    path.unlink()


# ---------------------------------------------------------------------------
# My Versions: remove automatic local -> cloud claiming, preserve cloud
# projection and normal signed-in cloud authority.
# ---------------------------------------------------------------------------
path = 'shared/atlas-tutor-content-cloud-sync.js'
text = read(path)
text = sub_once(
    text,
    r'/\* ============================================================\n   ATLAS TUTOR CONTENT — CLOUD SYNC\n.*?   ============================================================ \*/',
    '''/* ============================================================\n   ATLAS TUTOR CONTENT — CLOUD PROJECTION\n\n   Keeps committed cloud My Versions projected into AtlasBridge so Compass\n   reflects the same titles and My Version state across browsers.\n\n   Signed-in cloud data is authoritative. This layer does not import or claim\n   legacy browser-local committed versions. Working drafts and live\n   manipulation remain browser/session-local by design.\n   ============================================================ */''',
    'My Versions header'
)
text = replace_once(
    text,
    "    const Local = Authority.local;\n    const VERSION_PREFIX = 'atlas::tutorContent::version::';\n\n",
    '',
    'remove My Versions legacy constants'
)
text = replace_once(
    text,
    '    let initialClaimPromise = null;\n    let projectionPromise = null;\n',
    '    let projectionPromise = null;\n',
    'remove My Versions claim promise'
)
text = sub_once(
    text,
    r'\n    function listLocalVersionIds\(\) \{.*?\n    \}\n\n    function cloudReadyEvent',
    '\n    function cloudReadyEvent',
    'remove local My Version scan'
)
text = sub_once(
    text,
    r'\n    function cloudReadyEvent\(detail\) \{.*?\n    \}\n\n    function cloudErrorEvent\(error, action, contentId = \'\'\) \{.*?\n    \}\n\n    function localRecordForCloud',
    '\n    function localRecordForCloud',
    'remove migration-only My Version events'
)
text = sub_once(
    text,
    r'\n    function localRecordForCloud\(record, contentId\) \{.*?\n    \}\n\n    async function claimOne\(contentId, knownCloud = null\) \{.*?\n    \}\n\n    function getCatalogSubjects',
    '\n    function getCatalogSubjects',
    'remove My Version claim helpers'
)
text = sub_once(
    text,
    r'\n    async function claimLegacyVersions\(\) \{.*?\n    \}\n\n    async function getVersion',
    '\n    async function getVersion',
    'remove My Version legacy claim routine'
)
text = text.replace(
    '        await claimLegacyVersions();\n        return Cloud.getTutorContentVersion(id);',
    '        return Cloud.getTutorContentVersion(id);'
)
text = re.sub(
    r'\n        if \(await useCloud\(\)\) \{\n            await claimLegacyVersions\(\);\n        \}\n',
    '\n',
    text
)
text = text.replace('        await claimLegacyVersions();\n\n', '')
text = sub_once(
    text,
    r'    window\.AtlasTutorContentCloudSync = Object\.freeze\(\{.*?\n    \}\);\n\n    void claimLegacyVersions\(\)\.catch\(\(\) => undefined\);',
    '''    window.AtlasTutorContentCloudSync = Object.freeze({\n        refreshProjection,\n        getState() {\n            return { active: true };\n        }\n    });\n\n    void refreshProjection().catch(() => undefined);''',
    'replace My Version sync export'
)
for forbidden in (
    'claimLegacyVersions', 'claimOne(', 'VERSION_PREFIX',
    'listLocalVersionIds', 'localRecordForCloud', 'legacy-claim'
):
    if forbidden in text:
        raise RuntimeError(f'My Version cleanup left legacy token: {forbidden}')
write(path, text)

# Loader comment only: Batch 3 will collapse the wrapper itself.
path = 'shared/atlas-tutor-content-cloud-authority.js'
text = read(path)
text = text.replace(
    'Keeps the proven cloud authority implementation stable while layering\n   transitional legacy-claim + cross-browser My Version projection on top.',
    'Keeps the proven cloud authority implementation stable while layering\n   cross-browser My Version projection on top.'
)
write(path, text)


# ---------------------------------------------------------------------------
# Named learners + Session Subjects: cloud is now the signed-in authority.
# Keep local storage only as the existing synchronous UI cache and signed-out
# fallback; stop importing local-only learners or subject refs.
# ---------------------------------------------------------------------------
path = 'shared/atlas-learner-sessions-cloud-authority.js'
text = read(path)
text = text.replace(
    '   - legacy local-only named sessions and Session Subjects are preserved\n     until they have been safely claimed by the signed-in account',
    '   - signed-in named learners and Session Subjects are cloud-authoritative\n   - browser-local records remain only for signed-out behavior and UI caching'
)
text = text.replace('readLegacySessionSubjects', 'readSessionSubjectCache')
text = text.replace('writeLegacySessionSubjects', 'writeSessionSubjectCache')
text = text.replace('clearLegacySessionSubjects', 'clearSessionSubjectCache')
text = replace_once(
    text,
    '''        const localSessions = Bridge.readSessions();\n        const localNamed = localSessions.filter(\n            session => session.id !== Bridge.defaultSessionId\n        );\n        const sessionsById = new Map(\n            localNamed.map(session => [session.id, session])\n        );\n\n        remoteRecords.forEach(record => {\n            sessionsById.set(\n                record.id,\n                bridgeSessionFromRecord(record)\n            );\n        });\n\n        Bridge.writeSessions(\n            Array.from(sessionsById.values())\n        );''',
    '''        Bridge.writeSessions(\n            remoteRecords.map(bridgeSessionFromRecord)\n        );''',
    'make learner list cloud-authoritative'
)
text = sub_once(
    text,
    r'        const existingMemory =\n            Bridge\.readJson\(Bridge\.keys\.learnerMemory, \{\}\);\n        const nextMemory =\n            existingMemory &&\n            typeof existingMemory === \'object\' &&\n            !Array\.isArray\(existingMemory\)\n                \? \{ \.\.\.existingMemory \}\n                : \{\};',
    '        const nextMemory = {};',
    'make learner memory cloud-authoritative'
)
text = replace_once(
    text,
    '''            if (\n                !record?.subjectRefsSupported ||\n                !record.subjectRefsMigrated\n            ) {\n                return;\n            }''',
    '''            if (!record?.subjectRefsSupported) {\n                return;\n            }''',
    'cache all cloud learner subject refs'
)
text = sub_once(
    text,
    r'\n    async function claimLegacySubjectRefs\(record\) \{.*?\n    \}\n\n    function patchSubjectSessionApi',
    '\n    function patchSubjectSessionApi',
    'remove learner subject-ref claim helper'
)
text = sub_once(
    text,
    r'            const resolved = \[\];\n\n            for \(const record of remote\) \{.*?\n            \}\n\n            hydrateBridge\(resolved\);',
    '''            remote.forEach(record => {\n                recordsById.set(record.id, record);\n            });\n\n            hydrateBridge(remote);''',
    'remove learner subject-ref claim loop'
)
text = replace_once(
    text,
    '''            if (\n                record.subjectRefsSupported &&\n                record.subjectRefsMigrated\n            ) {\n                writeSessionSubjectCache(\n                    id,\n                    record.subjectRefs\n                );\n            }''',
    '''            if (record.subjectRefsSupported) {\n                writeSessionSubjectCache(\n                    id,\n                    record.subjectRefs\n                );\n            }''',
    'cloud learner subject cache read'
)
text = sub_once(
    text,
    r'        let current =\n            await getCloudRecord\(id\);\n\n        if \(\n            !current \|\|\n            !current\.subjectRefsSupported\n        \) \{\n            return cloneJson\(\n                await fallbackGetSessionSubjects\(id\)\n            \) \|\| \[\];\n        \}\n\n        if \(!current\.subjectRefsMigrated\) \{.*?\n        return cloneJson\(\n            readSessionSubjectCache\(id\)\n        \) \|\| \[\];',
    '''        const current =\n            await getCloudRecord(id);\n\n        if (\n            !current ||\n            !current.subjectRefsSupported\n        ) {\n            return cloneJson(\n                await fallbackGetSessionSubjects(id)\n            ) || [];\n        }\n\n        writeSessionSubjectCache(\n            id,\n            current.subjectRefs\n        );\n\n        return cloneJson(\n            current.subjectRefs\n        ) || [];''',
    'make named learner Session Subjects cloud-authoritative'
)
text = sub_once(
    text,
    r'            const refs =\n                record\.subjectRefsSupported &&\n                record\.subjectRefsMigrated\n                    \? record\.subjectRefs\n                    : readSessionSubjectCache\(\n                        record\.id\n                    \);',
    '''            const refs = record.subjectRefsSupported\n                ? record.subjectRefs\n                : [];''',
    'remove learner subject-ref legacy lookup'
)
for forbidden in ('claimLegacySubjectRefs', 'session-subject-migration', 'local-only named sessions'):
    if forbidden in text:
        raise RuntimeError(f'Learner-session cleanup left legacy token: {forbidden}')
write(path, text)


# ---------------------------------------------------------------------------
# Named learner continuity: remove first-login local -> cloud claim and legacy
# review watermark fallback. Normal post-login persistence remains unchanged.
# ---------------------------------------------------------------------------
path = 'shared/atlas-learner-continuity-cloud-authority.js'
text = read(path)
text = sub_once(
    text,
    r'\n    function legacyLocalReviewCompletionKey\(sessionId\) \{.*?\n    \}\n\n    function readNumberFromStorage',
    '\n    function readNumberFromStorage',
    'remove learner continuity legacy review key'
)
text = sub_once(
    text,
    r'    function readReviewedThrough\(sessionId, userId\) \{.*?\n    \}',
    '''    function readReviewedThrough(sessionId, userId) {\n        return readNumberFromStorage(\n            reviewCompletionKey(userId, sessionId)\n        );\n    }''',
    'remove learner continuity legacy review fallback'
)
text = sub_once(
    text,
    r'\n            const localIdsBefore =\n                getLocalNamedSessionIds\(\);\n            const localBefore = new Map\(\);\n\n            if \(!belongsToDifferentAccount\) \{.*?\n            \}\n\n            const remoteRecords = await listRemote\(\);',
    '\n            const remoteRecords = await listRemote();',
    'remove learner continuity pre-cloud snapshot claim setup'
)
text = sub_once(
    text,
    r'\n            if \(!belongsToDifferentAccount\) \{\n                for \(const \[sessionId, state\] of localBefore\) \{.*?\n                \}\n            \}\n\n            writeCacheOwner\(userId\);',
    '\n            writeCacheOwner(userId);',
    'remove learner continuity local claim loop'
)
for forbidden in ('legacyLocalReviewCompletionKey', 'legacy-claim', 'localBefore'):
    if forbidden in text:
        raise RuntimeError(f'Learner continuity cleanup left legacy token: {forbidden}')
write(path, text)


# ---------------------------------------------------------------------------
# Shared continuity: a signed-in account no longer claims a pre-account Shared
# browser cache. Remote wins; a missing remote row starts empty and is created
# only by new signed-in teaching activity.
# ---------------------------------------------------------------------------
path = 'shared/atlas-shared-continuity-cloud-authority.js'
text = read(path)
text = sub_once(
    text,
    r'\n    function legacyReviewCompletionKey\(\) \{.*?\n    \}\n\n    function readStoredNumber',
    '\n    function readStoredNumber',
    'remove Shared legacy review key'
)
text = sub_once(
    text,
    r'    function readReviewedThrough\(userId\) \{.*?\n    \}',
    '''    function readReviewedThrough(userId) {\n        return readStoredNumber(\n            reviewCompletionKey(userId)\n        );\n    }''',
    'remove Shared legacy review fallback'
)
text = sub_once(
    text,
    r'            const localBefore =\n                !belongsToDifferentAccount\n                    \? readLocalSnapshot\(userId\)\n                    : emptyState\(\);\n\n            const remote = await fetchRemote\(\);\n\n            if \(remote\) \{.*?\n            \}\n\n            writeCacheOwner\(userId\);',
    '''            const remote = await fetchRemote();\n\n            if (remote) {\n                remoteRecord = remote;\n                lastSnapshotJson = JSON.stringify(remote.state);\n                writeLocalSnapshot(userId, remote.state);\n            } else {\n                clearLocalSharedContinuity();\n                remoteRecord = null;\n                lastSnapshotJson = JSON.stringify(emptyState());\n            }\n\n            writeCacheOwner(userId);''',
    'remove Shared continuity local claim branch'
)
for forbidden in ('legacyReviewCompletionKey', 'localBefore'):
    if forbidden in text:
        raise RuntimeError(f'Shared continuity cleanup left legacy token: {forbidden}')
write(path, text)


# ---------------------------------------------------------------------------
# Shared Session Subjects: remote refs are authoritative for signed-in users.
# Keep the historical DB migrated flag, but stop using it as an import gate.
# ---------------------------------------------------------------------------
path = 'shared/atlas-shared-session-subjects-cloud-authority.js'
text = read(path)
text = text.replace(
    '   - legacy Shared refs are claimed only when meaningful refs exist\n   - a fresh empty browser never seals an unmigrated account empty',
    '   - signed-in cloud refs always win over browser cache\n   - browser-local Shared refs are only a signed-out/cache concern'
)
text = text.replace('            migrated: row.subject_refs_migrated === true,\n', '')
text = text.replace("                'owner_user_id, subject_refs, subject_refs_migrated, updated_at'", "                'owner_user_id, subject_refs, updated_at'")
text = text.replace('                if (latest?.migrated) {', '                if (latest) {')
text = sub_once(
    text,
    r'            const localBefore = readLocalRefs\(\);\n            let remote = await fetchRemote\(\);\n\n            if \(remote\?\.migrated\) \{.*?\n            \}\n\n            writeCacheOwner\(userId\);',
    '''            const remote = await fetchRemote();\n            remoteRecord = remote;\n            writeLocalRefs(remote?.refs || []);\n\n            writeCacheOwner(userId);''',
    'remove Shared Session Subjects initialization claim'
)
text = sub_once(
    text,
    r'            const localBefore = readLocalRefs\(\);\n            let latest = await fetchRemote\(\);\n\n            if \(latest\?\.migrated\) \{.*?\n            \}\n\n            writeCacheOwner\(currentUserId\);',
    '''            const localBefore = readLocalRefs();\n            const latest = await fetchRemote();\n            remoteRecord = latest;\n            const cloudRefs = latest?.refs || [];\n\n            if (!sameRefs(localBefore, cloudRefs)) {\n                writeLocalRefs(cloudRefs);\n                refreshSurface();\n            }\n\n            writeCacheOwner(currentUserId);''',
    'remove Shared Session Subjects refresh claim'
)
text = sub_once(
    text,
    r'            migrated: remoteRecord\?\.migrated === true,\n            count: remoteRecord\?\.migrated\n                \? remoteRecord\.refs\.length\n                : readLocalRefs\(\)\.length',
    '''            count: authenticated\n                ? (remoteRecord?.refs?.length || 0)\n                : readLocalRefs().length''',
    'remove Shared Session Subjects migrated runtime state'
)
for forbidden in ('?.migrated', '.migrated', 'Critical migration boundary', 'legacy Shared refs'):
    if forbidden in text:
        raise RuntimeError(f'Shared Session Subjects cleanup left legacy token: {forbidden}')
write(path, text)


# ---------------------------------------------------------------------------
# README: state the final production rule so future work does not reintroduce
# automatic local-to-cloud migration by accident.
# ---------------------------------------------------------------------------
path = 'README.md'
text = read(path)
anchor = 'Saved queries in the Supabase SQL Editor are optional convenience copies and are not the source of truth. The source-controlled migration files are the canonical schema history; the live Supabase schema is the deployed database truth.\n'
addition = anchor + '\n## Legacy data migration\n\nProduction Atlas does not automatically claim pre-account browser-local tutor data into a signed-in account. Signed-in durable state is cloud-authoritative. If a legacy tutor later needs an import, build and run a deliberate one-off migration/import flow rather than restoring the old staged migration runtime.\n'
text = replace_once(text, anchor, addition, 'README legacy migration policy')
write(path, text)


# ---------------------------------------------------------------------------
# Final static guardrails.
# ---------------------------------------------------------------------------
for rel in legacy_files:
    if Path(rel).exists():
        raise RuntimeError(f'Legacy migration file survived cleanup: {rel}')

for rel in [
    'shared/atlas-tutor-content-cloud-sync.js',
    'shared/atlas-learner-sessions-cloud-authority.js',
    'shared/atlas-learner-continuity-cloud-authority.js',
    'shared/atlas-shared-continuity-cloud-authority.js',
    'shared/atlas-shared-session-subjects-cloud-authority.js',
]:
    content = read(rel)
    if 'legacy-claim' in content:
        raise RuntimeError(f'legacy-claim remains in {rel}')

print('Batch 2 legacy migration cleanup prepared successfully.')
