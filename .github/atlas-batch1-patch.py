from pathlib import Path
import re


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected exactly one match, found {count}')
    return text.replace(old, new, 1)


hub_path = Path('compass/index.html')
hub = hub_path.read_text()

hub = replace_once(
    hub,
    '  <script src="../shared/atlas-structured-subject.js"></script>\n  <script src="../shared/atlas-tutor-subjects.js"></script>',
    '  <script src="../shared/atlas-structured-subject.js"></script>\n  <script src="../shared/atlas-tutor-content.js"></script>\n  <script src="../shared/atlas-tutor-subjects.js"></script>',
    'load AtlasTutorContent in Compass Hub'
)

hub = replace_once(
    hub,
    "            subjectId: id,\n            isOwned: true,\n            registryId,",
    "            subjectId: id,\n            isOwned: true,\n            provenance:\n              record.provenance &&\n              typeof record.provenance === 'object' &&\n              !Array.isArray(record.provenance)\n                ? record.provenance\n                : {},\n            registryId,",
    'owned provenance projection'
)

insertion_marker = "    async function addOwnedSubjectToActiveSession(\n"
helpers = r'''    const atlasOriginalActionRequests = new Map();

    function getAtlasOriginalSubject(registryId) {
      const id = String(registryId || '').trim();

      return getAtlasSubjects().find(subject =>
        subject.registryId === id
      ) || null;
    }

    function getAtlasOriginalActionUrl(subject, action, requestId) {
      if (!subject?.launchUrl) return '';

      try {
        const url = new URL(subject.launchUrl, window.location.href);
        url.searchParams.set('atlasHubAction', action);
        url.searchParams.set('atlasHubRequest', requestId);
        return url.href;
      } catch {
        return '';
      }
    }

    function editAtlasOriginal(registryId, event) {
      event?.preventDefault();
      event?.stopPropagation();
      closeOwnedSubjectMenus();

      const subject = getAtlasOriginalSubject(registryId);

      if (!subject?.launchUrl) {
        showToast('That subject could not be opened.');
        return;
      }

      try {
        const url = new URL(subject.launchUrl, window.location.href);
        url.searchParams.set('author', 'edit');
        navigateTo(url.href);
      } catch {
        navigateTo(subject.launchUrl);
      }
    }

    async function addAtlasSubjectToActiveSession(registryId, event) {
      event?.preventDefault();
      event?.stopPropagation();
      closeOwnedSubjectMenus();

      const Subjects = window.AtlasTutorSubjects;
      const session = getActiveSession();

      if (!Subjects || typeof Subjects.addSessionSubject !== 'function') {
        showToast('Session subjects are unavailable.');
        return;
      }

      try {
        const saved = await Subjects.addSessionSubject(
          session.id,
          {
            kind: 'atlas-subject',
            id: registryId
          }
        );

        if (!saved) {
          throw new Error('Session subject assignment failed.');
        }

        clearAtlasSessionDismissal(session.id, registryId);
        await renderHub();
        showToast('Added to ' + getActiveSessionSubjectCollectionTitle() + '.');
      } catch {
        showToast('Couldn’t add this subject.');
      }
    }

    async function migrateAtlasOriginalSessionHomes(registryId, subjectId) {
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
              ref.kind === 'atlas-subject' &&
              ref.id === registryId
            ) {
              changed = true;
              return {
                kind: 'my-subject',
                id: subjectId
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

    function runAtlasOriginalOwnershipAction(
      registryId,
      action,
      event,
      { categoryId = '' } = {}
    ) {
      event?.preventDefault();
      event?.stopPropagation();
      closeOwnedSubjectMenus();

      if (action !== 'own' && action !== 'duplicate') return;

      const subject = getAtlasOriginalSubject(registryId);

      if (!subject) {
        showToast('That Atlas subject could not be found.');
        return;
      }

      const requestId =
        'atlas-hub-' +
        Date.now().toString(36) +
        '-' +
        Math.random().toString(36).slice(2, 8);

      const actionUrl = getAtlasOriginalActionUrl(
        subject,
        action,
        requestId
      );

      if (!actionUrl) {
        showToast('That subject could not be prepared.');
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
        showToast('That subject took too long to prepare. Try again.');
      }, 20000);

      atlasOriginalActionRequests.set(requestId, {
        frame,
        timeout,
        registryId,
        action,
        categoryId: String(categoryId || '').trim()
      });

      document.body.appendChild(frame);
      showToast(
        action === 'duplicate'
          ? 'Duplicating subject…'
          : 'Adding to My Subjects…'
      );
    }

    window.addEventListener('message', async event => {
      if (event.origin !== window.location.origin) return;

      const data = event.data;

      if (
        !data ||
        data.type !== 'atlas:hub-subject-action-complete' ||
        !data.requestId
      ) {
        return;
      }

      const pending = atlasOriginalActionRequests.get(data.requestId);

      if (!pending) return;

      window.clearTimeout(pending.timeout);
      atlasOriginalActionRequests.delete(data.requestId);
      pending.frame.remove();

      if (!data.ok || !data.subjectId) {
        showToast(data.message || 'Couldn’t prepare this subject.');
        return;
      }

      const Subjects = window.AtlasTutorSubjects;

      try {
        if (pending.action === 'own') {
          await migrateAtlasOriginalSessionHomes(
            pending.registryId,
            data.subjectId
          );

          if (
            pending.categoryId &&
            Subjects &&
            typeof Subjects.setSubjectLibraryPlacement === 'function'
          ) {
            await Subjects.setSubjectLibraryPlacement(
              data.subjectId,
              {
                libraryIncluded: true,
                categoryId: pending.categoryId
              }
            );
          }
        }

        await renderHub();

        showToast(
          pending.action === 'duplicate'
            ? 'Duplicate added to My Subjects.'
            : 'Added to My Subjects.'
        );
      } catch {
        await renderHub();
        showToast('Subject created, but its placement could not be updated.');
      }
    });

    async function openAtlasSubjectRenameDialog(registryId, event) {
      event?.preventDefault();
      event?.stopPropagation();

      ownedSubjectDialogReturnFocus =
        event?.currentTarget
          ?.closest('.subject-card-management')
          ?.querySelector('.subject-card-manage-btn') ||
        document.activeElement;

      closeOwnedSubjectMenus();

      const subject = getAtlasOriginalSubject(registryId);

      if (!subject) {
        showToast('That Atlas subject could not be found.');
        return;
      }

      const dialog = ensureOwnedSubjectDialog();
      const kicker = dialog.querySelector('#owned-subject-dialog-kicker');
      const title = dialog.querySelector('#owned-subject-dialog-title');
      const copy = dialog.querySelector('#owned-subject-dialog-copy');
      const field = dialog.querySelector('#owned-subject-dialog-field');
      const input = dialog.querySelector('#owned-subject-dialog-input');
      const fieldLabel = dialog.querySelector('#owned-subject-dialog-field-label');
      const createFields = dialog.querySelector('#owned-subject-dialog-create-fields');
      const sessionFields = dialog.querySelector('#owned-subject-dialog-session-fields');
      const choiceFields = dialog.querySelector('#owned-subject-dialog-choice-fields');
      const error = dialog.querySelector('#owned-subject-dialog-error');
      const confirm = dialog.querySelector('#owned-subject-dialog-confirm');

      ownedSubjectDialogState = {
        mode: 'atlas-rename',
        registryId
      };

      kicker.textContent = 'Atlas Subject';
      title.textContent = 'Rename subject';
      copy.textContent = 'Change the name of this subject.';
      field.hidden = false;
      fieldLabel.textContent = 'Subject title';
      input.value = subject.title;
      input.placeholder = '';
      createFields.hidden = true;
      sessionFields.hidden = true;
      choiceFields.hidden = true;
      error.hidden = true;
      error.textContent = '';
      confirm.hidden = false;
      confirm.className = 'btn-primary';
      confirm.textContent = 'Save name';
      confirm.disabled = false;

      ownedSubjectDialogPreviousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.hidden = false;

      requestAnimationFrame(() => {
        input.focus();
        input.select();
      });
    }

    async function openMoveAtlasSubjectCategoryDialog(registryId, event) {
      event?.preventDefault();
      event?.stopPropagation();

      ownedSubjectDialogReturnFocus =
        event?.currentTarget
          ?.closest('.subject-card-management')
          ?.querySelector('.subject-card-manage-btn') ||
        document.activeElement;

      closeOwnedSubjectMenus();

      const Subjects = window.AtlasTutorSubjects;

      if (!Subjects || typeof Subjects.getLibraryState !== 'function') {
        showToast('Categories are unavailable.');
        return;
      }

      let library;

      try {
        library = await Subjects.getLibraryState();
      } catch {
        showToast('Couldn’t load categories.');
        return;
      }

      const categories = (Array.isArray(library?.categoryOrder)
        ? library.categoryOrder
        : []
      )
        .map(categoryId =>
          library.categories?.find(category => category.id === categoryId)
        )
        .filter(Boolean);

      if (!categories.length) {
        showToast('There are no categories available.');
        return;
      }

      const subject = getAtlasOriginalSubject(registryId);
      const dialog = ensureOwnedSubjectDialog();
      const kicker = dialog.querySelector('#owned-subject-dialog-kicker');
      const title = dialog.querySelector('#owned-subject-dialog-title');
      const copy = dialog.querySelector('#owned-subject-dialog-copy');
      const field = dialog.querySelector('#owned-subject-dialog-field');
      const createFields = dialog.querySelector('#owned-subject-dialog-create-fields');
      const sessionFields = dialog.querySelector('#owned-subject-dialog-session-fields');
      const choiceFields = dialog.querySelector('#owned-subject-dialog-choice-fields');
      const select = dialog.querySelector('#owned-subject-dialog-session-subject');
      const selectLabel = sessionFields?.querySelector('span');
      const error = dialog.querySelector('#owned-subject-dialog-error');
      const confirm = dialog.querySelector('#owned-subject-dialog-confirm');

      ownedSubjectDialogState = {
        mode: 'atlas-category-own',
        registryId
      };

      kicker.textContent = 'My Subjects';
      title.textContent = 'Move to category';
      copy.textContent = subject
        ? 'Take “' + subject.title + '” into your library and choose where it belongs.'
        : 'Choose where this subject belongs in your library.';
      field.hidden = true;
      createFields.hidden = true;
      choiceFields.hidden = true;
      sessionFields.hidden = false;

      if (selectLabel) selectLabel.textContent = 'Move to';

      select.innerHTML = '';

      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
      });

      error.hidden = true;
      error.textContent = '';
      confirm.hidden = false;
      confirm.className = 'btn-primary';
      confirm.textContent = 'Move subject';
      confirm.disabled = false;

      ownedSubjectDialogPreviousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.hidden = false;

      requestAnimationFrame(() => select.focus());
    }

'''
hub = replace_once(
    hub,
    insertion_marker,
    helpers + insertion_marker,
    'Atlas Original management helpers'
)

dialog_marker = "      if (state.mode === 'archive-restore') {\n"
dialog_modes = r'''      if (state.mode === 'atlas-rename') {
        const nextTitle = String(input?.value || '').trim();

        if (!nextTitle) {
          error.hidden = false;
          error.textContent = 'Give the subject a name.';
          input?.focus();
          return;
        }

        const Store = window.AtlasTutorContent;
        const subject = getAtlasOriginalSubject(state.registryId);

        if (!Store || typeof Store.saveVersion !== 'function' || !subject) {
          error.hidden = false;
          error.textContent = 'Couldn’t rename this subject.';
          return;
        }

        confirm.disabled = true;
        confirm.textContent = 'Saving…';

        try {
          const current = typeof Store.getVersion === 'function'
            ? await Store.getVersion(state.registryId)
            : null;

          const saved = await Store.saveVersion(
            state.registryId,
            {
              baseContentVersion:
                current?.baseContentVersion ||
                subject.contentVersion ||
                '',
              overrides: {
                'module.title': nextTitle
              },
              ...(current?.document
                ? { document: current.document }
                : {})
            }
          );

          if (!saved) throw new Error('Rename failed.');

          try {
            const registry = getRegistry();
            const existing = (registry.items || {})[state.registryId] || {
              registryId: state.registryId,
              world: COMPASS_ID,
              type: 'subject',
              status: 'available',
              launchUrl: subject.launchUrl
            };

            Bridge.upsertItem({
              ...existing,
              title: nextTitle,
              hasMyVersion: true
            });
          } catch { }

          closeOwnedSubjectDialog(false);
          await renderHub();
          showToast('Subject renamed.');
        } catch {
          error.hidden = false;
          error.textContent = 'Couldn’t rename this subject.';
          confirm.disabled = false;
          confirm.textContent = 'Save name';
        }

        return;
      }

      if (state.mode === 'atlas-category-own') {
        const select = dialog.querySelector(
          '#owned-subject-dialog-session-subject'
        );

        const categoryId = String(select?.value || '').trim();

        if (!categoryId) {
          error.hidden = false;
          error.textContent = 'Choose a category.';
          return;
        }

        const registryId = state.registryId;
        closeOwnedSubjectDialog(false);
        runAtlasOriginalOwnershipAction(
          registryId,
          'own',
          null,
          { categoryId }
        );
        return;
      }

'''
hub = replace_once(
    hub,
    dialog_marker,
    dialog_modes + dialog_marker,
    'Atlas Original dialog modes'
)

old_session_push = """          sessionSubjects.push({
            ...atlasById.get(ref.id),
            isSessionRelevant: true
          });"""
new_session_push = """          sessionSubjects.push({
            ...atlasById.get(ref.id),
            isSessionRelevant: true,
            canMoveAtlasCategory:
              (libraryState?.categories?.length || 0) > 1
          });"""
hub = replace_once(
    hub,
    old_session_push,
    new_session_push,
    'session Atlas category capability'
)

old_remaining = """      const remainingAtlasSubjects =
        atlasSubjects.filter(subject =>
          !promotedAtlasIds.has(subject.registryId)
        );"""
new_remaining = """      const ownedAtlasSourceIds = new Set(
        ownedSubjects
          .filter(subject => {
            const kind = String(
              subject.provenance?.kind || ''
            ).trim();

            return (
              kind === 'atlas-original-owned' ||
              kind === 'atlas-my-version'
            );
          })
          .map(subject =>
            String(
              subject.provenance?.sourceContentId ||
              (
                subject.provenance?.sourceSubjectId
                  ? COMPASS_ID + ':' +
                    subject.provenance.sourceSubjectId
                  : ''
              )
            ).trim()
          )
          .filter(Boolean)
      );

      const remainingAtlasSubjects =
        atlasSubjects
          .filter(subject =>
            !promotedAtlasIds.has(subject.registryId) &&
            !ownedAtlasSourceIds.has(subject.registryId)
          )
          .map(subject => ({
            ...subject,
            canMoveAtlasCategory:
              (libraryState?.categories?.length || 0) > 1
          }));"""
hub = replace_once(
    hub,
    old_remaining,
    new_remaining,
    'owned Atlas source suppression'
)

pattern = re.compile(
    r"      if \(\n        subject\.isSessionRelevant &&\n        !subject\.isOwned &&\n        subject\.registryId\n      \) \{.*?\n      \}\n\n      return \(\n        '<a class=\"' \+",
    re.S
)

replacement = r'''      if (!subject.isOwned && subject.registryId) {
        const managementHtml =
          '<div class="subject-card-management">' +

          '<button class="subject-card-manage-btn" ' +
          'type="button" ' +
          'aria-label="' +
          escHtml('Manage ' + subject.title) +
          '" aria-haspopup="menu" aria-expanded="false" ' +
          'onclick="toggleOwnedSubjectMenu(this, event)">' +
          '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
          '<circle cx="3.2" cy="8" r="1.15" fill="currentColor"/>' +
          '<circle cx="8" cy="8" r="1.15" fill="currentColor"/>' +
          '<circle cx="12.8" cy="8" r="1.15" fill="currentColor"/>' +
          '</svg>' +
          '</button>' +

          '<div class="subject-card-menu" role="menu" hidden>' +

          '<button type="button" role="menuitem" onclick="editAtlasOriginal(' +
          jsArg(subject.registryId) +
          ', event)">Edit subject</button>' +

          '<button type="button" role="menuitem" onclick="openAtlasSubjectRenameDialog(' +
          jsArg(subject.registryId) +
          ', event)">Rename</button>' +

          '<button type="button" role="menuitem" onclick="runAtlasOriginalOwnershipAction(' +
          jsArg(subject.registryId) +
          ', \'duplicate\', event)">Duplicate</button>' +

          (subject.canMoveEarlier
            ? (
              '<button type="button" role="menuitem" onclick="moveShelfSubject(' +
              jsArg(subject.moveScope) + ', ' +
              jsArg(subject.moveSubjectKind) + ', ' +
              jsArg(subject.moveSubjectId) + ', ' +
              jsArg(subject.moveEarlierTargetKind) + ', ' +
              jsArg(subject.moveEarlierTargetId) +
              ', -1, event)">Move earlier</button>'
            )
            : '') +

          (subject.canMoveLater
            ? (
              '<button type="button" role="menuitem" onclick="moveShelfSubject(' +
              jsArg(subject.moveScope) + ', ' +
              jsArg(subject.moveSubjectKind) + ', ' +
              jsArg(subject.moveSubjectId) + ', ' +
              jsArg(subject.moveLaterTargetKind) + ', ' +
              jsArg(subject.moveLaterTargetId) +
              ', 1, event)">Move later</button>'
            )
            : '') +

          (subject.canMoveAtlasCategory
            ? (
              '<button type="button" role="menuitem" onclick="openMoveAtlasSubjectCategoryDialog(' +
              jsArg(subject.registryId) +
              ', event)">Move to category…</button>'
            )
            : '') +

          '<button type="button" role="menuitem" onclick="runAtlasOriginalOwnershipAction(' +
          jsArg(subject.registryId) +
          ', \'own\', event)">Add to My Subjects</button>' +

          (subject.isSessionRelevant
            ? (
              '<button type="button" role="menuitem" onclick="removeAtlasSubjectFromActiveSession(' +
              jsArg(subject.registryId) +
              ', event)">Remove from ' +
              escHtml(getActiveSessionSubjectCollectionTitle()) +
              '</button>'
            )
            : (
              '<button type="button" role="menuitem" onclick="addAtlasSubjectToActiveSession(' +
              jsArg(subject.registryId) +
              ', event)">Add to ' +
              escHtml(getActiveSessionSubjectCollectionTitle()) +
              '</button>'
            )) +

          '</div>' +
          '</div>';

        return (
          '<article class="' +
          cardClasses +
          ' subject-card--owned" style="' +
          progressStyle +
          '">' +
          '<a class="subject-card-open-layer" href="' +
          escHtml(subject.launchUrl) +
          '" aria-label="' +
          actionLabel +
          '"></a>' +
          managementHtml +
          cardContents +
          '</article>'
        );
      }

      return (
        '<a class="' +'''

hub, count = pattern.subn(replacement, hub, count=1)
if count != 1:
    raise RuntimeError(
        f'Atlas Original card menu: expected one branch, found {count}'
    )

hub_path.write_text(hub)

engine_path = Path('compass/shared/compass-engine.js')
engine = engine_path.read_text()

bridge = r'''

// ============================================================
// COMPASS HUB · ATLAS ORIGINAL ACTION BRIDGE
// Hub controls are alternate entrances into the existing authorship model.
// ============================================================

async function createOwnedSubjectFromAtlasHub(action) {
    await loadTutorContentState();

    const publishedVersion = tutorContentVersion;

    const document = publishedVersion
        ? materializePublishedMyVersionDocument()
        : createAtlasSubjectDocument();

    if (!document) {
        throw new Error(
            '[Compass] Atlas source could not be materialized.'
        );
    }

    const Subjects = requireAtlasTutorSubjects();
    const sourceContentId = getTutorContentId();
    const ownershipAction = action === 'own';

    const subject = await Subjects.createSubject({
        format: 'structured',
        metadata: {
            title:
                String(
                    document.module?.title || MODULE.title
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
                    document.module?.catalogDescription || ''
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
            sourceWorld: COMPASS_WORLD_ID,
            sourceSubjectId: MODULE.id,
            sourceContentId,
            sourceContentVersion:
                typeof MODULE.contentVersion === 'string'
                    ? MODULE.contentVersion
                    : '',
            sourceVersionRevision:
                publishedVersion
                    ? Math.max(
                        0,
                        Math.floor(
                            Number(publishedVersion.revision) || 0
                        )
                    )
                    : 0
        }
    });

    if (!subject) {
        throw new Error(
            '[Compass] AtlasTutorSubjects failed to create the owned subject.'
        );
    }

    return subject;
}

function consumeCompassHubAtlasAction() {
    let url;

    try {
        url = new URL(window.location.href);
    } catch {
        return;
    }

    const hubAction = String(
        url.searchParams.get('atlasHubAction') || ''
    ).trim();
    const requestId = String(
        url.searchParams.get('atlasHubRequest') || ''
    ).trim();
    const authorIntent = String(
        url.searchParams.get('author') || ''
    ).trim();

    if (!hubAction && authorIntent !== 'edit') return;

    if (
        hubAction &&
        !['own', 'duplicate'].includes(hubAction)
    ) {
        return;
    }

    url.searchParams.delete('atlasHubAction');
    url.searchParams.delete('atlasHubRequest');

    if (!isOwnedSubjectRuntime()) {
        url.searchParams.delete('author');
    }

    try {
        window.history.replaceState(
            window.history.state,
            '',
            url.href
        );
    } catch { }

    if (
        !hubAction &&
        authorIntent === 'edit' &&
        !isOwnedSubjectRuntime()
    ) {
        requestMyVersionEditing({
            expandAuthorBar: false
        });
        return;
    }

    if (!hubAction || !requestId) return;

    (async () => {
        try {
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
        } catch (error) {
            console.error(
                '[Compass] Hub Atlas action failed:',
                error
            );

            window.parent.postMessage(
                {
                    type:
                        'atlas:hub-subject-action-complete',
                    requestId,
                    action: hubAction,
                    ok: false,
                    message:
                        'Couldn’t prepare this subject.'
                },
                window.location.origin
            );
        }
    })();
}

window.addEventListener(
    'load',
    () => {
        window.setTimeout(
            consumeCompassHubAtlasAction,
            0
        );
    }
);
'''

if 'COMPASS HUB · ATLAS ORIGINAL ACTION BRIDGE' in engine:
    raise RuntimeError('Compass hub action bridge already exists')

engine = engine.rstrip() + bridge + '\n'
engine_path.write_text(engine)
