from pathlib import Path


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected exactly one match, found {count}')
    return text.replace(old, new, 1)


hub_path = Path('compass/index.html')
hub = hub_path.read_text()

# ------------------------------------------------------------------
# Batch 3: individual restore from the Compass Hub.
# ------------------------------------------------------------------

# Reverse Batch 1's session-home migration when an owned Atlas-derived
# subject is restored to its canonical Atlas source.
marker = "    function runAtlasOriginalOwnershipAction(\n"
helpers = r'''    async function migrateOwnedSubjectSessionHomesToAtlas(
      subjectId,
      registryId
    ) {
      const Subjects = window.AtlasTutorSubjects;

      if (
        !Subjects ||
        typeof Subjects.getSessionSubjects !== 'function' ||
        typeof Subjects.setSessionSubjects !== 'function'
      ) {
        return;
      }

      for (const session of getSessions()) {
        try {
          const refs = await Subjects.getSessionSubjects(session.id);
          let changed = false;

          const next = (Array.isArray(refs) ? refs : []).map(ref => {
            if (
              ref.kind === 'my-subject' &&
              ref.id === subjectId
            ) {
              changed = true;
              return {
                kind: 'atlas-subject',
                id: registryId
              };
            }

            return ref;
          });

          if (changed) {
            await Subjects.setSessionSubjects(session.id, next);
            clearAtlasSessionDismissal(session.id, registryId);
          }
        } catch { }
      }
    }

    function restoreAtlasVersionFromHub(registryId) {
      const subject = getAtlasOriginalSubject(registryId);

      if (!subject?.launchUrl) {
        return Promise.reject(
          new Error('The Atlas source could not be opened.')
        );
      }

      return new Promise((resolve, reject) => {
        const requestId =
          'atlas-hub-restore-' +
          Date.now().toString(36) +
          '-' +
          Math.random().toString(36).slice(2, 8);

        const actionUrl = getAtlasOriginalActionUrl(
          subject,
          'restore-version',
          requestId
        );

        if (!actionUrl) {
          reject(new Error('The Atlas source could not be prepared.'));
          return;
        }

        const frame = document.createElement('iframe');
        frame.hidden = true;
        frame.setAttribute('aria-hidden', 'true');
        frame.src = actionUrl;

        const timeout = window.setTimeout(() => {
          const pending = atlasOriginalActionRequests.get(requestId);

          if (!pending) return;

          atlasOriginalActionRequests.delete(requestId);
          pending.frame.remove();
          pending.reject?.(
            new Error('Restoring the Atlas source timed out.')
          );
        }, 20000);

        atlasOriginalActionRequests.set(requestId, {
          frame,
          timeout,
          registryId,
          action: 'restore-version',
          resolve,
          reject
        });

        document.body.appendChild(frame);
      });
    }

    function getOwnedAtlasSourceRegistryId(record) {
      const provenance =
        record?.provenance &&
        typeof record.provenance === 'object' &&
        !Array.isArray(record.provenance)
          ? record.provenance
          : null;

      if (
        !provenance ||
        provenance.sourceWorld !== COMPASS_ID ||
        !String(provenance.sourceSubjectId || '').trim()
      ) {
        return '';
      }

      return String(
        provenance.sourceContentId ||
        (
          COMPASS_ID + ':' +
          String(provenance.sourceSubjectId).trim()
        )
      ).trim();
    }

    function openRestoreAtlasOriginalHubDialog({
      registryId,
      subjectId = '',
      event = null
    } = {}) {
      event?.preventDefault();
      event?.stopPropagation();

      const sourceRegistryId = String(registryId || '').trim();
      const ownedSubjectId = String(subjectId || '').trim();

      if (!sourceRegistryId) {
        showToast('The Atlas source could not be found.');
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
        mode: 'atlas-restore-original',
        registryId: sourceRegistryId,
        subjectId: ownedSubjectId
      };

      kicker.textContent = ownedSubjectId
        ? 'Originally from Atlas'
        : 'My Version';
      title.textContent = 'Restore Atlas Original?';
      copy.textContent =
        'This will discard your changes to this subject and return the original Atlas version to Atlas Originals.';

      field.hidden = true;
      createFields.hidden = true;
      sessionFields.hidden = true;
      choiceFields.hidden = true;
      error.hidden = true;
      error.textContent = '';
      secondary.hidden = true;
      secondary.textContent = '';

      confirm.hidden = false;
      confirm.className = 'btn-primary';
      confirm.textContent = 'Restore original';
      confirm.disabled = false;

      ownedSubjectDialogPreviousBodyOverflow =
        document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.hidden = false;

      requestAnimationFrame(() => {
        confirm.focus();
      });
    }

'''
hub = replace_once(
    hub,
    marker,
    helpers + marker,
    'insert Batch 3 restore helpers'
)

# Resolve hidden subject-runtime restore requests before the ownership branch,
# because restore intentionally returns no newly-created subject id.
old = """      if (!data.ok || !data.subjectId) {\n        showToast(data.message || 'Couldn’t prepare this subject.');\n        return;\n      }\n\n      const Subjects = window.AtlasTutorSubjects;\n"""
new = """      if (pending.action === 'restore-version') {\n        if (!data.ok) {\n          pending.reject?.(\n            new Error(\n              data.message ||\n              'Couldn’t restore the Atlas source.'\n            )\n          );\n          return;\n        }\n\n        pending.resolve?.(true);\n        return;\n      }\n\n      if (!data.ok || !data.subjectId) {\n        showToast(data.message || 'Couldn’t prepare this subject.');\n        return;\n      }\n\n      const Subjects = window.AtlasTutorSubjects;\n"""
hub = replace_once(
    hub,
    old,
    new,
    'handle restore-version bridge response'
)

# Add the destructive restore confirmation behavior to the shared Hub dialog.
old = """      if (!Subjects || !confirm) return;\n\n      if (state.mode === 'atlas-rename') {\n"""
new = r'''      if (!Subjects || !confirm) return;

      if (state.mode === 'atlas-restore-original') {
        confirm.disabled = true;
        confirm.textContent = 'Restoring…';

        try {
          const expectedRegistryId =
            String(state.registryId || '').trim();

          if (!expectedRegistryId) {
            throw new Error('Missing Atlas source identity.');
          }

          if (state.subjectId) {
            const record =
              typeof Subjects.getSubject === 'function'
                ? await Subjects.getSubject(state.subjectId)
                : null;

            const actualRegistryId =
              getOwnedAtlasSourceRegistryId(record);

            if (
              !record ||
              !actualRegistryId ||
              actualRegistryId !== expectedRegistryId
            ) {
              throw new Error('Atlas provenance could not be verified.');
            }

            const source =
              getAtlasOriginalSubject(actualRegistryId);

            if (!source) {
              throw new Error('The Atlas source is unavailable.');
            }

            if (source.hasMyVersion) {
              await restoreAtlasVersionFromHub(
                actualRegistryId
              );
            }

            await migrateOwnedSubjectSessionHomesToAtlas(
              state.subjectId,
              actualRegistryId
            );

            const ownedRegistryId =
              getOwnedSubjectRegistryId(state.subjectId);

            const deleted =
              await Subjects.deleteSubject(state.subjectId);

            if (!deleted) {
              throw new Error(
                'The owned subject could not be removed.'
              );
            }

            try {
              if (
                ownedRegistryId &&
                typeof Bridge.removeItem === 'function'
              ) {
                Bridge.removeItem(ownedRegistryId);
              }
            } catch { }
          } else {
            const source =
              getAtlasOriginalSubject(expectedRegistryId);

            if (!source || !source.hasMyVersion) {
              throw new Error('There is no My Version to restore.');
            }

            await restoreAtlasVersionFromHub(
              expectedRegistryId
            );
          }

          closeOwnedSubjectDialog(false);
          await renderHub();
          showToast('Atlas Original restored.');
        } catch (restoreError) {
          console.error(
            '[Compass Hub] Restore Atlas Original failed:',
            restoreError
          );

          error.hidden = false;
          error.textContent =
            'Couldn’t restore the Atlas Original.';
          confirm.disabled = false;
          confirm.textContent = 'Restore original';
        }

        return;
      }

      if (state.mode === 'atlas-rename') {
'''
hub = replace_once(
    hub,
    old,
    new,
    'add restore confirmation behavior'
)

# Owned Atlas-derived My Subjects get the additional restoration action.
old = """          (subject.isSessionRelevant\n            ? (\n              '<button type=\"button\" role=\"menuitem\" ' +\n              'onclick=\"removeOwnedSubjectFromActiveSession(' +\n              jsArg(subject.subjectId) +\n              ', event)\">' +\n              'Remove from ' +\n              escHtml(\n                getActiveSessionSubjectCollectionTitle()\n              ) +\n              '</button>'\n            )\n            : (\n              '<button type=\"button\" role=\"menuitem\" ' +\n              'onclick=\"addOwnedSubjectToActiveSession(' +\n              jsArg(subject.subjectId) +\n              ', event)\">' +\n              'Add to ' +\n              escHtml(\n                getActiveSessionSubjectCollectionTitle()\n              ) +\n              '</button>'\n            )) +\n\n\n          '<button type=\"button\" role=\"menuitem\" ' +\n"""
new = """          (subject.isSessionRelevant\n            ? (\n              '<button type=\"button\" role=\"menuitem\" ' +\n              'onclick=\"removeOwnedSubjectFromActiveSession(' +\n              jsArg(subject.subjectId) +\n              ', event)\">' +\n              'Remove from ' +\n              escHtml(\n                getActiveSessionSubjectCollectionTitle()\n              ) +\n              '</button>'\n            )\n            : (\n              '<button type=\"button\" role=\"menuitem\" ' +\n              'onclick=\"addOwnedSubjectToActiveSession(' +\n              jsArg(subject.subjectId) +\n              ', event)\">' +\n              'Add to ' +\n              escHtml(\n                getActiveSessionSubjectCollectionTitle()\n              ) +\n              '</button>'\n            )) +\n\n          (subject.provenance &&\n            subject.provenance.sourceWorld === COMPASS_ID &&\n            subject.provenance.sourceSubjectId\n              ? (\n                '<button type=\"button\" role=\"menuitem\" ' +\n                'onclick=\"openRestoreAtlasOriginalHubDialog({registryId:' +\n                jsArg(\n                  subject.provenance.sourceContentId ||\n                  (COMPASS_ID + ':' + subject.provenance.sourceSubjectId)\n                ) +\n                ',subjectId:' +\n                jsArg(subject.subjectId) +\n                ',event:event})\">Restore Atlas Original</button>'\n              )\n              : '') +\n\n\n          '<button type=\"button\" role=\"menuitem\" ' +\n"""
hub = replace_once(
    hub,
    old,
    new,
    'add owned Restore Atlas Original menu action'
)

# My Version on the canonical Atlas card gets the same restoration action.
old = """          (subject.isSessionRelevant\n            ? (\n              '<button type=\"button\" role=\"menuitem\" onclick=\"removeAtlasSubjectFromActiveSession(' +\n              jsArg(subject.registryId) +\n              ', event)\">Remove from ' +\n              escHtml(getActiveSessionSubjectCollectionTitle()) +\n              '</button>'\n            )\n            : (\n              '<button type=\"button\" role=\"menuitem\" onclick=\"addAtlasSubjectToActiveSession(' +\n              jsArg(subject.registryId) +\n              ', event)\">Add to ' +\n              escHtml(getActiveSessionSubjectCollectionTitle()) +\n              '</button>'\n            )) +\n\n          '</div>' +\n"""
new = """          (subject.isSessionRelevant\n            ? (\n              '<button type=\"button\" role=\"menuitem\" onclick=\"removeAtlasSubjectFromActiveSession(' +\n              jsArg(subject.registryId) +\n              ', event)\">Remove from ' +\n              escHtml(getActiveSessionSubjectCollectionTitle()) +\n              '</button>'\n            )\n            : (\n              '<button type=\"button\" role=\"menuitem\" onclick=\"addAtlasSubjectToActiveSession(' +\n              jsArg(subject.registryId) +\n              ', event)\">Add to ' +\n              escHtml(getActiveSessionSubjectCollectionTitle()) +\n              '</button>'\n            )) +\n\n          (subject.hasMyVersion\n            ? (\n              '<button type=\"button\" role=\"menuitem\" onclick=\"openRestoreAtlasOriginalHubDialog({registryId:' +\n              jsArg(subject.registryId) +\n              ',event:event})\">Restore Atlas Original</button>'\n            )\n            : '') +\n\n          '</div>' +\n"""
hub = replace_once(
    hub,
    old,
    new,
    'add My Version Restore Atlas Original menu action'
)

hub_path.write_text(hub)


engine_path = Path('compass/shared/compass-engine.js')
engine = engine_path.read_text()

# Allow the hidden canonical subject runtime to execute the existing restore
# implementation. This is intentionally not a new restore system.
engine = replace_once(
    engine,
    "        !['own', 'duplicate'].includes(hubAction)",
    "        !['own', 'duplicate', 'restore-version'].includes(hubAction)",
    'allow restore-version Hub action'
)

old = """    if (!hubAction || !requestId) return;\n\n    (async () => {\n        try {\n            const subject =\n                await createOwnedSubjectFromAtlasHub(\n                    hubAction\n                );\n\n            window.parent.postMessage(\n                {\n                    type:\n                        'atlas:hub-subject-action-complete',\n                    requestId,\n                    action: hubAction,\n                    ok: true,\n                    subjectId: subject.id\n                },\n                window.location.origin\n            );\n"""
new = r'''    if (!hubAction || !requestId) return;

    (async () => {
        try {
            if (hubAction === 'restore-version') {
                if (
                    isOwnedSubjectRuntime() ||
                    !hasSavedMyVersion()
                ) {
                    throw new Error(
                        '[Compass] There is no canonical My Version to restore.'
                    );
                }

                if (!myVersionEditing) {
                    beginMyVersionEditing(false);
                }

                await restoreAtlasOriginal();

                if (hasSavedMyVersion()) {
                    throw new Error(
                        '[Compass] Atlas Original restore did not complete.'
                    );
                }

                window.parent.postMessage(
                    {
                        type:
                            'atlas:hub-subject-action-complete',
                        requestId,
                        action: hubAction,
                        ok: true
                    },
                    window.location.origin
                );

                return;
            }

            const subject =
                await createOwnedSubjectFromAtlasHub(
                    hubAction
                );

            window.parent.postMessage(
                {
                    type:
                        'atlas:hub-subject-action-complete',
                    requestId,
                    action: hubAction,
                    ok: true,
                    subjectId: subject.id
                },
                window.location.origin
            );
'''
engine = replace_once(
    engine,
    old,
    new,
    'delegate restore-version to existing subject restore flow'
)

engine_path.write_text(engine)

# Batch 3 invariants.
assert hub.count('Restore Atlas Original</button>') >= 2
assert "mode: 'atlas-restore-original'" in hub
assert 'getOwnedAtlasSourceRegistryId(record)' in hub
assert 'migrateOwnedSubjectSessionHomesToAtlas' in hub
assert "action: 'restore-version'" in hub
assert "hubAction === 'restore-version'" in engine
assert "['own', 'duplicate', 'restore-version']" in engine
assert 'await restoreAtlasOriginal();' in engine
