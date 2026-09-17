from pathlib import Path

path = Path('compass/index.html')
text = path.read_text(encoding='utf-8')

old_hint = '''  <script>
    (function () {
      var h = false;
      try {
        h = Boolean(
          localStorage.getItem(
            'sb-jnhjfpagectprceswvqn-auth-token'
          )
        );
      } catch (e) { }

      document.documentElement.dataset.atlasAccountHint =
        h ? 'account' : 'anonymous';

      if (h) {
        document.documentElement.dataset.atlasCompassCloudAuthority =
          'pending';
      }
    })();
  </script>'''

new_hint = '''  <script>
    (function () {
      var authStorageKey =
        'sb-jnhjfpagectprceswvqn-auth-token';
      var hubCachePrefix =
        'atlas::compassHubCache::v1::';
      var hubCacheVersion = 1;
      var authRaw = null;
      var userId = '';

      try {
        authRaw = localStorage.getItem(
          authStorageKey
        );

        if (authRaw) {
          var parsed = JSON.parse(authRaw);
          var candidates = [
            parsed,
            parsed && parsed.session,
            parsed && parsed.currentSession,
            parsed && parsed.data &&
              parsed.data.session
          ];

          for (
            var index = 0;
            index < candidates.length;
            index += 1
          ) {
            var candidate = candidates[index];
            var candidateId = String(
              candidate &&
              candidate.user &&
              candidate.user.id ||
              ''
            ).trim();

            if (candidateId) {
              userId = candidateId;
              break;
            }
          }
        }
      } catch (e) { }

      var h = Boolean(authRaw);

      document.documentElement.dataset.atlasAccountHint =
        h ? 'account' : 'anonymous';

      if (h) {
        document.documentElement.dataset.atlasCompassCloudAuthority =
          'pending';
      }

      if (!userId) return;

      try {
        var cachedRaw = localStorage.getItem(
          hubCachePrefix + userId
        );

        if (!cachedRaw) return;

        var cached = JSON.parse(cachedRaw);

        if (
          !cached ||
          cached.version !== hubCacheVersion ||
          String(cached.userId || '') !== userId
        ) {
          return;
        }

        window.AtlasCompassHubInitialSnapshot =
          cached;

        document.documentElement.dataset.atlasCompassCache =
          'ready';
      } catch (e) { }
    })();
  </script>'''

old_pending_helpers = '''    function isCompassCloudAuthorityPending() {
      return document.documentElement.dataset
        .atlasCompassCloudAuthority === 'pending';
    }

    async function getOwnedSubjects() {
      if (isCompassCloudAuthorityPending()) {
        return [];
      }

      const Subjects = window.AtlasTutorSubjects;

      if (
        !Subjects ||
        typeof Subjects.listSubjects !== 'function'
      ) {
        return [];
      }

      let records = [];
      let libraryState = null;

      try {
        [
          records,
          libraryState
        ] = await Promise.all([
          Subjects.listSubjects(),
          typeof Subjects.getLibraryState === 'function'
            ? Subjects.getLibraryState()
            : Promise.resolve(null)
        ]);
      } catch {
        return [];
      }
'''

new_pending_helpers = '''    function isCompassCloudAuthorityPending() {
      return document.documentElement.dataset
        .atlasCompassCloudAuthority === 'pending';
    }

    function getCompassInitialAccountSnapshot() {
      if (!isCompassCloudAuthorityPending()) {
        return null;
      }

      const snapshot =
        window.AtlasCompassHubInitialSnapshot;

      if (
        !snapshot ||
        snapshot.version !== 1 ||
        !String(snapshot.userId || '').trim()
      ) {
        return null;
      }

      return snapshot;
    }

    function getCompassInitialLibraryState(
      snapshot = getCompassInitialAccountSnapshot()
    ) {
      const candidate =
        snapshot?.library?.state?.library ||
        snapshot?.library?.library ||
        null;

      if (
        !candidate ||
        typeof candidate !== 'object' ||
        Array.isArray(candidate)
      ) {
        return null;
      }

      return candidate;
    }

    function getCompassInitialSubjectSummaries(
      snapshot = getCompassInitialAccountSnapshot()
    ) {
      return Array.isArray(snapshot?.summaries)
        ? snapshot.summaries
        : [];
    }

    async function getOwnedSubjects() {
      const cloudAuthorityPending =
        isCompassCloudAuthorityPending();

      const Subjects = window.AtlasTutorSubjects;

      if (
        !Subjects ||
        typeof Subjects.listSubjects !== 'function'
      ) {
        return [];
      }

      let records = [];
      let libraryState = null;

      try {
        if (cloudAuthorityPending) {
          const snapshot =
            getCompassInitialAccountSnapshot();

          records =
            getCompassInitialSubjectSummaries(
              snapshot
            );

          libraryState =
            getCompassInitialLibraryState(
              snapshot
            );
        } else {
          [
            records,
            libraryState
          ] = await Promise.all([
            Subjects.listSubjects(),
            typeof Subjects.getLibraryState === 'function'
              ? Subjects.getLibraryState()
              : Promise.resolve(null)
          ]);
        }
      } catch {
        return [];
      }
'''

old_working_draft = '''      if (
        typeof Subjects.getWorkingDraft === 'function'
      ) {'''
new_working_draft = '''      if (
        !cloudAuthorityPending &&
        typeof Subjects.getWorkingDraft === 'function'
      ) {'''

old_registry_projection = '''          syncOwnedSubjectRegistryProjection(record);

          const placement ='''
new_registry_projection = '''          if (!cloudAuthorityPending) {
            syncOwnedSubjectRegistryProjection(record);
          }

          const placement ='''

old_owned_marker = '''            subjectId: id,
            isOwned: true,
            provenance:'''
new_owned_marker = '''            subjectId: id,
            isOwned: true,
            isCachedProjection:
              cloudAuthorityPending,
            provenance:'''

old_render_reads = '''      let sessionSubjectRefs = [];
      let libraryState = null;

      try {
        if (Subjects && !cloudAuthorityPending) {
          const results = await Promise.all([
            typeof Subjects.getSessionSubjects === 'function'
              ? Subjects.getSessionSubjects(session.id)
              : Promise.resolve([]),
            typeof Subjects.getLibraryState === 'function'
              ? Subjects.getLibraryState()
              : Promise.resolve(null)
          ]);

          sessionSubjectRefs =
            Array.isArray(results[0])
              ? results[0]
              : [];

          libraryState = results[1];
        }
      } catch {
        sessionSubjectRefs = [];
        libraryState = null;
      }
'''

new_render_reads = '''      let sessionSubjectRefs = [];
      let libraryState =
        cloudAuthorityPending
          ? getCompassInitialLibraryState()
          : null;

      try {
        if (Subjects) {
          if (cloudAuthorityPending) {
            sessionSubjectRefs =
              typeof Subjects.getSessionSubjects === 'function'
                ? await Subjects.getSessionSubjects(
                    session.id
                  )
                : [];
          } else {
            const results = await Promise.all([
              typeof Subjects.getSessionSubjects === 'function'
                ? Subjects.getSessionSubjects(session.id)
                : Promise.resolve([]),
              typeof Subjects.getLibraryState === 'function'
                ? Subjects.getLibraryState()
                : Promise.resolve(null)
            ]);

            sessionSubjectRefs =
              Array.isArray(results[0])
                ? results[0]
                : [];

            libraryState = results[1];
          }
        }
      } catch {
        sessionSubjectRefs = [];

        if (!cloudAuthorityPending) {
          libraryState = null;
        }
      }
'''

old_library_html = '''      const ownedLibraryHtml =
        cloudAuthorityPending
          ? ''
          : libraryCategories
          .map((category, index) =>
            renderSubjectCollection(
              remainingOwnedSubjects.filter(subject =>
                subject.categoryId === category.id
              ),
              category.name,
              {
                canCreate: true,
                categoryId: category.id,
                canManageCategory: true,
                isDefaultCategory:
                  category.id ===
                  libraryState?.defaultCategoryId,
                canMoveCategoryEarlier:
                  index > 0,
                canMoveCategoryLater:
                  index < libraryCategories.length - 1
              }
            )
          )
          .join('');'''

new_library_html = '''      const ownedLibraryHtml =
        libraryCategories
          .map((category, index) =>
            renderSubjectCollection(
              remainingOwnedSubjects.filter(subject =>
                subject.categoryId === category.id
              ),
              category.name,
              {
                canCreate:
                  !cloudAuthorityPending,
                categoryId: category.id,
                canManageCategory:
                  !cloudAuthorityPending,
                isDefaultCategory:
                  category.id ===
                  libraryState?.defaultCategoryId,
                canMoveCategoryEarlier:
                  !cloudAuthorityPending &&
                  index > 0,
                canMoveCategoryLater:
                  !cloudAuthorityPending &&
                  index < libraryCategories.length - 1
              }
            )
          )
          .join('');'''

old_session_render = '''          {
            canAdd: true
          }
        ) +'''
new_session_render = '''          {
            canAdd:
              !cloudAuthorityPending
          }
        ) +'''

old_owned_management = '''      if (subject.isOwned && subject.subjectId) {
        const managementHtml =
          '<div class="subject-card-management">' +'''
new_owned_management = '''      if (subject.isOwned && subject.subjectId) {
        const managementHtml =
          isCompassCloudAuthorityPending()
            ? ''
            : '<div class="subject-card-management">' +'''

old_atlas_management = '''      if (!subject.isOwned && subject.registryId) {
        const managementHtml =
          '<div class="subject-card-management">' +'''
new_atlas_management = '''      if (!subject.isOwned && subject.registryId) {
        const managementHtml =
          isCompassCloudAuthorityPending()
            ? ''
            : '<div class="subject-card-management">' +'''

replacements = [
    (old_hint, new_hint, 'account cache preload'),
    (old_pending_helpers, new_pending_helpers, 'cached subject projection'),
    (old_working_draft, new_working_draft, 'working draft authority guard'),
    (old_registry_projection, new_registry_projection, 'registry projection authority guard'),
    (old_owned_marker, new_owned_marker, 'cached owned marker'),
    (old_render_reads, new_render_reads, 'cached session/library reads'),
    (old_library_html, new_library_html, 'cached library rendering'),
    (old_session_render, new_session_render, 'session action guard'),
    (old_owned_management, new_owned_management, 'owned management guard'),
    (old_atlas_management, new_atlas_management, 'Atlas management guard'),
]

for old, new, label in replacements:
    count = text.count(old)
    if count != 1:
        raise SystemExit(
            f'Expected exactly one {label} anchor, found {count}'
        )
    text = text.replace(old, new, 1)

required = [
    'AtlasCompassHubInitialSnapshot',
    "hubCachePrefix =\n        'atlas::compassHubCache::v1::'",
    'function getCompassInitialAccountSnapshot()',
    'function getCompassInitialLibraryState(',
    'function getCompassInitialSubjectSummaries(',
    'isCachedProjection:\n              cloudAuthorityPending',
    'if (cloudAuthorityPending) {\n            sessionSubjectRefs =',
    'canCreate:\n                  !cloudAuthorityPending',
    'canAdd:\n              !cloudAuthorityPending',
    'isCompassCloudAuthorityPending()\n            ? \'\'',
]

for needle in required:
    if needle not in text:
        raise SystemExit(
            f'Missing cached projection contract: {needle}'
        )

if '''    async function getOwnedSubjects() {
      if (isCompassCloudAuthorityPending()) {
        return [];
      }''' in text:
    raise SystemExit(
        'Pending owned subjects are still suppressed entirely.'
    )

path.write_text(text, encoding='utf-8')
