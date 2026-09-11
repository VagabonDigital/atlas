from pathlib import Path


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected exactly one match, found {count}')
    return text.replace(old, new, 1)


hub_path = Path('compass/index.html')
hub = hub_path.read_text()

# Load the dedicated canonical-source curation store in Compass Hub.
hub = replace_once(
    hub,
    '  <script src="../shared/atlas-tutor-subjects.js"></script>\n',
    '  <script src="../shared/atlas-tutor-subjects.js"></script>\n  <script src="../shared/atlas-original-curation.js"></script>\n',
    'Compass curation store script'
)

# Hidden canonical sources stay addressable for provenance/restoration, while
# ordinary hub/catalog reads omit archived or deleted Atlas Originals.
old = '''    function getAtlasSubjects() {\n      const reg = getRegistry();\n      const session = getActiveSession();\n      const sessionStates = ((reg.sessionStates || {})[session.id]) || {};\n\n      return COMPASS_AVAILABLE_SUBJECT_SLUGS\n'''
new = '''    function getAtlasSubjects({ includeCuratedHidden = false } = {}) {\n      const reg = getRegistry();\n      const session = getActiveSession();\n      const sessionStates = ((reg.sessionStates || {})[session.id]) || {};\n      const Curation = window.AtlasOriginalCuration;\n\n      return COMPASS_AVAILABLE_SUBJECT_SLUGS\n'''
hub = replace_once(hub, old, new, 'getAtlasSubjects signature')

fn_start = hub.index('    function getAtlasSubjects({ includeCuratedHidden = false } = {}) {')
fn_end = hub.index('    function getOwnedSubjectLaunchUrl(', fn_start)
fn = hub[fn_start:fn_end]
fn = replace_once(
    fn,
    '''          if (!subject) return null;\n\n          const relativeLaunchUrl = getCompassSubjectLaunchUrl(subject);\n''',
    '''          if (!subject) return null;\n\n          if (\n            !includeCuratedHidden &&\n            Curation &&\n            typeof Curation.isHidden === 'function' &&\n            Curation.isHidden(subject.registryId)\n          ) {\n            return null;\n          }\n\n          const relativeLaunchUrl = getCompassSubjectLaunchUrl(subject);\n''',
    'curation filter inside getAtlasSubjects'
)
hub = hub[:fn_start] + fn + hub[fn_end:]

hub = replace_once(
    hub,
    '''    function getAtlasOriginalSubject(registryId) {\n      const id = String(registryId || '').trim();\n\n      return getAtlasSubjects().find(subject =>\n        subject.registryId === id\n      ) || null;\n    }\n''',
    '''    function getAtlasOriginalSubject(registryId) {\n      const id = String(registryId || '').trim();\n\n      return getAtlasSubjects({ includeCuratedHidden: true }).find(subject =>\n        subject.registryId === id\n      ) || null;\n    }\n''',
    'canonical lookup includes curated hidden sources'
)

# Canonical curation actions. Visibility is user-level only; no catalog item is
# mutated and progress remains in the bridge. Hiding a source removes stale
# session refs so Session Subjects cannot point at a deliberately hidden source.
marker = '    function runAtlasOriginalOwnershipAction(\n'
helpers = r'''    async function removeAtlasOriginalFromAllSessions(registryId) {
      const Subjects = window.AtlasTutorSubjects;
      const id = String(registryId || '').trim();

      if (
        !id ||
        !Subjects ||
        typeof Subjects.getSessionSubjects !== 'function' ||
        typeof Subjects.setSessionSubjects !== 'function'
      ) {
        return;
      }

      for (const session of getSessions()) {
        try {
          const refs = await Subjects.getSessionSubjects(session.id);
          const current = Array.isArray(refs) ? refs : [];
          const next = current.filter(ref =>
            !(
              ref.kind === 'atlas-subject' &&
              ref.id === id
            )
          );

          if (next.length !== current.length) {
            await Subjects.setSessionSubjects(session.id, next);
            clearAtlasSessionDismissal(session.id, id);
          }
        } catch { }
      }
    }

    async function archiveAtlasOriginal(registryId, event) {
      event?.preventDefault();
      event?.stopPropagation();
      closeOwnedSubjectMenus();

      const id = String(registryId || '').trim();
      const subject = getAtlasOriginalSubject(id);
      const Curation = window.AtlasOriginalCuration;

      if (!subject || subject.hasMyVersion) {
        showToast('Only an untouched Atlas Original can be archived here.');
        return;
      }

      if (!Curation || typeof Curation.archive !== 'function') {
        showToast('Atlas Original archive is unavailable.');
        return;
      }

      try {
        if (!Curation.archive(id)) {
          throw new Error('Archive persistence failed.');
        }

        await removeAtlasOriginalFromAllSessions(id);
        await renderHub();
        showToast('Atlas Original archived. Restore it anytime in Settings → Compass.');
      } catch {
        showToast('Couldn’t archive this Atlas Original.');
      }
    }

    function openAtlasOriginalDeleteDialog(registryId, event) {
      event?.preventDefault();
      event?.stopPropagation();

      const id = String(registryId || '').trim();
      const subject = getAtlasOriginalSubject(id);

      if (!subject || subject.hasMyVersion) {
        showToast('Only an untouched Atlas Original can be deleted here.');
        return;
      }

      ownedSubjectDialogReturnFocus =
        event?.currentTarget
          ?.closest('.subject-card-management')
          ?.querySelector('.subject-card-manage-btn') ||
        document.activeElement;

      closeOwnedSubjectMenus();

      const dialog = ensureOwnedSubjectDialog();
      const kicker = dialog.querySelector('#owned-subject-dialog-kicker');
      const title = dialog.querySelector('#owned-subject-dialog-title');
      const copy = dialog.querySelector('#owned-subject-dialog-copy');
      const field = dialog.querySelector('#owned-subject-dialog-field');
      const createFields = dialog.querySelector('#owned-subject-dialog-create-fields');
      const sessionFields = dialog.querySelector('#owned-subject-dialog-session-fields');
      const choiceFields = dialog.querySelector('#owned-subject-dialog-choice-fields');
      const error = dialog.querySelector('#owned-subject-dialog-error');
      const secondary = dialog.querySelector('#owned-subject-dialog-secondary');
      const confirm = dialog.querySelector('#owned-subject-dialog-confirm');

      ownedSubjectDialogState = {
        mode: 'atlas-delete-original',
        registryId: id
      };

      kicker.textContent = 'Atlas Original';
      title.textContent = 'Delete Atlas Original?';
      copy.textContent =
        'This will remove this Atlas Original from your personal Atlas environment. The canonical Atlas source itself will not be deleted.';

      field.hidden = true;
      createFields.hidden = true;
      sessionFields.hidden = true;
      choiceFields.hidden = true;
      error.hidden = true;
      error.textContent = '';
      secondary.hidden = true;
      secondary.textContent = '';

      confirm.hidden = false;
      confirm.className = 'btn-danger';
      confirm.textContent = 'Delete Atlas Original';
      confirm.disabled = false;

      ownedSubjectDialogPreviousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.hidden = false;

      requestAnimationFrame(() => confirm.focus());
    }

'''
hub = replace_once(hub, marker, helpers + marker, 'insert canonical curation actions')

# Untouched canonical cards get Archive/Delete. A My Version gets Restore instead,
# preserving the intentional separation between derived-state destruction and
# source-library curation.
old = '''          (subject.hasMyVersion\n            ? (\n              '<button type="button" role="menuitem" onclick="openRestoreAtlasOriginalHubDialog({registryId:' +\n              jsArg(subject.registryId) +\n              ',event:event})">Restore Atlas Original</button>'\n            )\n            : '') +\n\n          '</div>' +\n'''
new = '''          (subject.hasMyVersion\n            ? (\n              '<button type="button" role="menuitem" onclick="openRestoreAtlasOriginalHubDialog({registryId:' +\n              jsArg(subject.registryId) +\n              ',event:event})">Restore Atlas Original</button>'\n            )\n            : (\n              '<button type="button" role="menuitem" onclick="archiveAtlasOriginal(' +\n              jsArg(subject.registryId) +\n              ', event)">Archive</button>' +\n              '<button class="is-danger" type="button" role="menuitem" onclick="openAtlasOriginalDeleteDialog(' +\n              jsArg(subject.registryId) +\n              ', event)">Delete</button>'\n            )) +\n\n          '</div>' +\n'''
hub = replace_once(hub, old, new, 'canonical Archive/Delete menu')

# Add delete confirmation handling to the existing shared subject dialog.
confirm_start = hub.index('    async function confirmOwnedSubjectDialog(')
confirm_end = hub.index('    function editOwnedSubject(', confirm_start)
confirm_block = hub[confirm_start:confirm_end]
anchor = '      if (!Subjects || !confirm) return;\n\n'
delete_branch = r'''      if (state.mode === 'atlas-delete-original') {
        confirm.disabled = true;
        confirm.textContent = 'Deleting…';

        try {
          const id = String(state.registryId || '').trim();
          const subject = getAtlasOriginalSubject(id);
          const Curation = window.AtlasOriginalCuration;

          if (!id || !subject || subject.hasMyVersion) {
            throw new Error('Atlas Original is no longer eligible for deletion.');
          }

          if (!Curation || typeof Curation.deleteOriginal !== 'function') {
            throw new Error('Atlas Original curation is unavailable.');
          }

          if (!Curation.deleteOriginal(id)) {
            throw new Error('Delete persistence failed.');
          }

          await removeAtlasOriginalFromAllSessions(id);
          closeOwnedSubjectDialog(false);
          await renderHub();
          showToast('Atlas Original deleted from your Atlas library.');
        } catch {
          error.hidden = false;
          error.textContent = 'Couldn’t delete this Atlas Original.';
          confirm.disabled = false;
          confirm.textContent = 'Delete Atlas Original';
        }

        return;
      }

'''
confirm_block = replace_once(
    confirm_block,
    anchor,
    anchor + delete_branch,
    'delete confirmation branch'
)

# Individual Restore Atlas Original also clears any canonical archive/delete
# suppression introduced by this batch.
restore_start = confirm_block.index("      if (state.mode === 'atlas-restore-original') {")
restore_end = confirm_block.index("      if (state.mode === 'atlas-rename') {", restore_start)
restore_block = confirm_block[restore_start:restore_end]
close_anchor = '          closeOwnedSubjectDialog(false);\n'
restore_block = replace_once(
    restore_block,
    close_anchor,
    '''          const Curation = window.AtlasOriginalCuration;\n          if (Curation && typeof Curation.restore === 'function') {\n            if (!Curation.restore(expectedRegistryId)) {\n              throw new Error('Atlas source suppression could not be cleared.');\n            }\n          }\n\n''' + close_anchor,
    'Batch 3 restore clears canonical curation'
)
confirm_block = (
    confirm_block[:restore_start] +
    restore_block +
    confirm_block[restore_end:]
)
hub = hub[:confirm_start] + confirm_block + hub[confirm_end:]

hub_path.write_text(hub)

# ------------------------------------------------------------------
# Atlas Hub Settings: canonical archived originals participate in the
# existing Archived subjects management surface; deleted originals do not.
# ------------------------------------------------------------------
root_path = Path('index.html')
root = root_path.read_text()

root = replace_once(
    root,
    '  <script src="./shared/atlas-tutor-subjects.js"></script>\n',
    '  <script src="./shared/atlas-tutor-subjects.js"></script>\n  <script src="./shared/atlas-original-curation.js"></script>\n',
    'Atlas Hub curation store script'
)

read_start = root.index('    async function readArchivedSubjectsForSettings() {')
read_end = root.index('    async function renderArchivedSubjectsSettings() {', read_start)
new_read = r'''    async function readArchivedSubjectsForSettings() {
      const Subjects = window.AtlasTutorSubjects;
      const Curation = window.AtlasOriginalCuration;
      const archived = [];

      if (
        Subjects &&
        typeof Subjects.listSubjects === 'function' &&
        typeof Subjects.getLibraryState === 'function'
      ) {
        const [subjects, library] = await Promise.all([
          Subjects.listSubjects(),
          Subjects.getLibraryState()
        ]);

        const placements = library?.subjects || {};

        subjects
          .filter(subject =>
            subject?.id &&
            placements[subject.id]?.archived === true
          )
          .forEach(subject => {
            archived.push({
              id: subject.id,
              kind: 'my-subject',
              title:
                subject.metadata?.title ||
                subject.document?.module?.title ||
                'Untitled Subject'
            });
          });
      }

      if (Curation && typeof Curation.listArchived === 'function') {
        const catalog =
          CompassCatalog &&
          typeof CompassCatalog.getCompassCatalogMap === 'function'
            ? CompassCatalog.getCompassCatalogMap()
            : {};

        const catalogItems = Object.values(catalog || {});

        Curation.listArchived().forEach(item => {
          const source = catalogItems.find(subject =>
            subject?.registryId === item.registryId
          );

          if (!source) return;

          archived.push({
            id: item.registryId,
            kind: 'atlas-original',
            title: source.title || 'Atlas Original'
          });
        });
      }

      return archived.sort((a, b) =>
        String(a.title || '').localeCompare(String(b.title || ''))
      );
    }

'''
root = root[:read_start] + new_read + root[read_end:]

root = replace_once(
    root,
    '''            'data-archived-subject-id="' +\n            escAttr(subject.id) +\n            '" ' +\n            'onclick="restoreArchivedSubjectFromSettings(this.dataset.archivedSubjectId, this)">' +\n''',
    '''            'data-archived-subject-id="' +\n            escAttr(subject.id) +\n            '" ' +\n            'data-archived-subject-kind="' +\n            escAttr(subject.kind || 'my-subject') +\n            '" ' +\n            'onclick="restoreArchivedSubjectFromSettings(this.dataset.archivedSubjectId, this.dataset.archivedSubjectKind, this)">' +\n''',
    'archived settings restore kind metadata'
)

restore_start = root.index('    async function restoreArchivedSubjectFromSettings(')
restore_end = root.index('    function openSettingsModal()', restore_start)
new_restore = r'''    async function restoreArchivedSubjectFromSettings(
      subjectId,
      subjectKind,
      button
    ) {
      const Subjects = window.AtlasTutorSubjects;
      const Curation = window.AtlasOriginalCuration;
      const id = String(subjectId || '').trim();
      const kind = String(subjectKind || 'my-subject').trim();

      if (!id) {
        showToast('Archived subjects are unavailable.');
        return;
      }

      if (button) {
        button.disabled = true;
        button.textContent = 'Restoring…';
      }

      try {
        if (kind === 'atlas-original') {
          if (!Curation || typeof Curation.restore !== 'function') {
            throw new Error('Atlas Original curation is unavailable.');
          }

          if (!Curation.restore(id)) {
            throw new Error('Restore operation failed.');
          }
        } else {
          if (
            !Subjects ||
            typeof Subjects.setSubjectLibraryPlacement !== 'function'
          ) {
            throw new Error('My Subjects archive is unavailable.');
          }

          const restored =
            await Subjects.setSubjectLibraryPlacement(
              id,
              {
                archived: false
              }
            );

          if (!restored) {
            throw new Error('Restore operation failed.');
          }

          const registryId = 'compass:' + id;
          const registry = getRegistry();
          const existing = registry?.items?.[registryId];

          if (
            existing &&
            typeof Bridge.upsertItem === 'function'
          ) {
            Bridge.upsertItem({
              ...existing,
              archived: false
            });
          }
        }

        await renderArchivedSubjectsSettings();
        showToast('Subject restored.');
      } catch {
        showToast('Couldn’t restore this subject.');

        if (button) {
          button.disabled = false;
          button.textContent = 'Restore';
        }
      }
    }

'''
root = root[:restore_start] + new_restore + root[restore_end:]
root_path.write_text(root)

# Invariants for Batch 4 boundaries and integration.
assert 'atlas-original-curation.js' in hub
assert 'atlas-original-curation.js' in root
assert "Curation.isHidden(subject.registryId)" in hub
assert "includeCuratedHidden: true" in hub
assert 'archiveAtlasOriginal(' in hub
assert 'openAtlasOriginalDeleteDialog(' in hub
assert "mode: 'atlas-delete-original'" in hub
assert "Curation.deleteOriginal(id)" in hub
assert "removeAtlasOriginalFromAllSessions(id)" in hub
assert "Curation.restore(expectedRegistryId)" in hub
assert "kind: 'atlas-original'" in root
assert "Curation.listArchived()" in root
assert "Curation.restore(id)" in root
assert 'Restore all Atlas Originals' not in root
