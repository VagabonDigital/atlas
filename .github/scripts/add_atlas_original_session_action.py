from pathlib import Path

path = Path('compass/index.html')
text = path.read_text()

anchor = """    async function removeAtlasSubjectFromActiveSession(
      registryId,
      event
    ) {
"""
if anchor not in text:
    raise SystemExit('removeAtlasSubjectFromActiveSession anchor not found')

add_fn = """    async function addAtlasSubjectToActiveSession(
      registryId,
      event
    ) {
      event?.preventDefault();
      event?.stopPropagation();

      closeOwnedSubjectMenus();

      const Subjects = window.AtlasTutorSubjects;
      const session = getActiveSession();

      if (
        !Subjects ||
        typeof Subjects.addSessionSubject !== 'function'
      ) {
        showToast('Session subjects are unavailable.');
        return;
      }

      try {
        const saved =
          await Subjects.addSessionSubject(
            session.id,
            {
              kind: 'atlas-subject',
              id: registryId
            }
          );

        if (!saved) {
          throw new Error(
            'Session subject assignment failed.'
          );
        }

        await renderHub();

        showToast(
          'Added to ' +
          getActiveSessionSubjectCollectionTitle() +
          '.'
        );
      } catch {
        showToast('Couldn’t add this subject.');
      }
    }

"""
text = text.replace(anchor, add_fn + anchor, 1)

old_condition = """      if (
        subject.isSessionRelevant &&
        !subject.isOwned &&
        subject.registryId
      ) {
"""
new_condition = """      if (
        !subject.isOwned &&
        subject.registryId
      ) {
"""
count = text.count(old_condition)
if count != 1:
    raise SystemExit(f'Expected one Atlas Original management condition, found {count}')
text = text.replace(old_condition, new_condition, 1)

old_menu = """          '<button type=\"button\" role=\"menuitem\" ' +
          'onclick=\"removeAtlasSubjectFromActiveSession(' +
          jsArg(subject.registryId) +
          ', event)\">' +
          'Remove from ' +
          escHtml(
            getActiveSessionSubjectCollectionTitle()
          ) +
          '</button>' +
"""
new_menu = """          (
            subject.isSessionRelevant
              ? (
                '<button type=\"button\" role=\"menuitem\" ' +
                'onclick=\"removeAtlasSubjectFromActiveSession(' +
                jsArg(subject.registryId) +
                ', event)\">' +
                'Remove from ' +
                escHtml(
                  getActiveSessionSubjectCollectionTitle()
                ) +
                '</button>'
              )
              : (
                '<button type=\"button\" role=\"menuitem\" ' +
                'onclick=\"addAtlasSubjectToActiveSession(' +
                jsArg(subject.registryId) +
                ', event)\">' +
                'Add to ' +
                escHtml(
                  getActiveSessionSubjectCollectionTitle()
                ) +
                '</button>'
              )
          ) +
"""
count = text.count(old_menu)
if count != 1:
    raise SystemExit(f'Expected one Atlas Original session menu block, found {count}')
text = text.replace(old_menu, new_menu, 1)

path.write_text(text)
