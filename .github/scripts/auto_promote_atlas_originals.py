from pathlib import Path
import re

path = Path('compass/index.html')
text = path.read_text()

# 1) Remove the explicit add-to-session action. Atlas Originals should stay clean
# until meaningful progress makes them session-relevant.
pattern = re.compile(
    r"\n    async function addAtlasSubjectToActiveSession\(.*?\n    async function removeAtlasSubjectFromActiveSession\(",
    re.S,
)
match = pattern.search(text)
if not match:
    raise SystemExit('Could not find Atlas add/remove function boundary')
text = text[:match.start()] + "\n    async function removeAtlasSubjectFromActiveSession(" + text[match.end():]

# 2) Add progress-dismissal helpers immediately before the remove action.
anchor = "    async function removeAtlasSubjectFromActiveSession(\n"
if text.count(anchor) != 1:
    raise SystemExit(f'Expected one Atlas remove function anchor, found {text.count(anchor)}')

helpers = r'''    const ATLAS_SESSION_DISMISSALS_KEY =
      'atlas::compass::atlasSessionDismissals';

    function getAtlasSubjectProgressCount(subject) {
      const progress = subject?.state?.progress || {};
      const raw = subject?.state?.progressRaw || {};

      return Math.max(
        Math.max(0, Number(progress.explored) || 0),
        Array.isArray(raw.exploredIds)
          ? raw.exploredIds.length
          : 0
      );
    }

    function readAtlasSessionDismissals() {
      try {
        const parsed = JSON.parse(
          localStorage.getItem(
            ATLAS_SESSION_DISMISSALS_KEY
          ) || '{}'
        );

        return parsed &&
          typeof parsed === 'object' &&
          !Array.isArray(parsed)
            ? parsed
            : {};
      } catch {
        return {};
      }
    }

    function writeAtlasSessionDismissal(
      sessionId,
      registryId,
      progressCount
    ) {
      try {
        const store = readAtlasSessionDismissals();
        const sessionKey = String(sessionId || '').trim();
        const subjectKey = String(registryId || '').trim();

        if (!sessionKey || !subjectKey) return false;

        store[sessionKey] =
          store[sessionKey] &&
          typeof store[sessionKey] === 'object' &&
          !Array.isArray(store[sessionKey])
            ? store[sessionKey]
            : {};

        store[sessionKey][subjectKey] = {
          progressCount: Math.max(
            0,
            Number(progressCount) || 0
          )
        };

        localStorage.setItem(
          ATLAS_SESSION_DISMISSALS_KEY,
          JSON.stringify(store)
        );

        return true;
      } catch {
        return false;
      }
    }

    function clearAtlasSessionDismissal(
      sessionId,
      registryId
    ) {
      try {
        const store = readAtlasSessionDismissals();
        const sessionKey = String(sessionId || '').trim();
        const subjectKey = String(registryId || '').trim();

        if (!store[sessionKey]?.[subjectKey]) {
          return;
        }

        delete store[sessionKey][subjectKey];

        if (!Object.keys(store[sessionKey]).length) {
          delete store[sessionKey];
        }

        localStorage.setItem(
          ATLAS_SESSION_DISMISSALS_KEY,
          JSON.stringify(store)
        );
      } catch { }
    }

    function getAtlasSessionDismissal(
      sessionId,
      registryId
    ) {
      const record =
        readAtlasSessionDismissals()
          ?.[String(sessionId || '').trim()]
          ?.[String(registryId || '').trim()];

      return record && typeof record === 'object'
        ? record
        : null;
    }

    async function syncAtlasOriginalSessionSubjects(
      session,
      atlasSubjects,
      sessionSubjectRefs
    ) {
      const Subjects = window.AtlasTutorSubjects;

      if (
        !Subjects ||
        typeof Subjects.addSessionSubject !== 'function'
      ) {
        return sessionSubjectRefs;
      }

      let refs = Array.isArray(sessionSubjectRefs)
        ? [...sessionSubjectRefs]
        : [];

      const activeAtlasIds = new Set(
        refs
          .filter(ref => ref.kind === 'atlas-subject')
          .map(ref => ref.id)
      );

      for (const subject of atlasSubjects) {
        if (
          !subject?.registryId ||
          activeAtlasIds.has(subject.registryId)
        ) {
          continue;
        }

        const progressCount =
          getAtlasSubjectProgressCount(subject);

        const dismissal =
          getAtlasSessionDismissal(
            session.id,
            subject.registryId
          );

        const dismissedAt = Math.max(
          0,
          Number(dismissal?.progressCount) || 0
        );

        if (dismissal && progressCount < dismissedAt) {
          writeAtlasSessionDismissal(
            session.id,
            subject.registryId,
            progressCount
          );
          continue;
        }

        if (
          progressCount <= 0 ||
          (dismissal && progressCount <= dismissedAt)
        ) {
          continue;
        }

        try {
          const saved =
            await Subjects.addSessionSubject(
              session.id,
              {
                kind: 'atlas-subject',
                id: subject.registryId
              }
            );

          if (Array.isArray(saved)) {
            refs = saved;
            activeAtlasIds.add(subject.registryId);
            clearAtlasSessionDismissal(
              session.id,
              subject.registryId
            );
          }
        } catch { }
      }

      return refs;
    }

'''
text = text.replace(anchor, helpers + anchor, 1)

# 3) When the tutor removes an Atlas Original, remember the exact progress level.
remove_saved_anchor = """        if (!saved) {
          throw new Error(
            'Session subject removal failed.'
          );
        }

        await renderHub();
"""
replacement = """        if (!saved) {
          throw new Error(
            'Session subject removal failed.'
          );
        }

        const atlasSubject =
          getAtlasSubjects().find(subject =>
            subject.registryId === registryId
          );

        writeAtlasSessionDismissal(
          session.id,
          registryId,
          getAtlasSubjectProgressCount(atlasSubject)
        );

        await renderHub();
"""
start = text.index("    async function removeAtlasSubjectFromActiveSession(")
end = text.index("    async function removeOwnedSubjectFromActiveSession(", start)
atlas_remove = text[start:end]
if remove_saved_anchor not in atlas_remove:
    raise SystemExit('Could not find Atlas removal success block')
atlas_remove = atlas_remove.replace(remove_saved_anchor, replacement, 1)
text = text[:start] + atlas_remove + text[end:]

# 4) Auto-promote meaningful Atlas progress before the hub builds its shelves.
render_anchor = """      if (renderRevision !== hubRenderRevision) {
        return;
      }

      const ownedById = new Map(
"""
render_replacement = """      if (renderRevision !== hubRenderRevision) {
        return;
      }

      sessionSubjectRefs =
        await syncAtlasOriginalSessionSubjects(
          session,
          atlasSubjects,
          sessionSubjectRefs
        );

      if (renderRevision !== hubRenderRevision) {
        return;
      }

      const ownedById = new Map(
"""
if text.count(render_anchor) != 1:
    raise SystemExit(f'Expected one render sync anchor, found {text.count(render_anchor)}')
text = text.replace(render_anchor, render_replacement, 1)

# 5) Restore clean Atlas cards: management only appears once an Original is in Session Subjects.
old_condition = """      if (
        !subject.isOwned &&
        subject.registryId
      ) {
"""
new_condition = """      if (
        subject.isSessionRelevant &&
        !subject.isOwned &&
        subject.registryId
      ) {
"""
if text.count(old_condition) != 1:
    raise SystemExit(f'Expected one broad Atlas management condition, found {text.count(old_condition)}')
text = text.replace(old_condition, new_condition, 1)

# 6) Session Atlas menu: provenance plus the one valid management action.
old_menu = r'''          (
            subject.isSessionRelevant
              ? (
                '<button type="button" role="menuitem" ' +
                'onclick="removeAtlasSubjectFromActiveSession(' +
                jsArg(subject.registryId) +
                ', event)">' +
                'Remove from ' +
                escHtml(
                  getActiveSessionSubjectCollectionTitle()
                ) +
                '</button>'
              )
              : (
                '<button type="button" role="menuitem" ' +
                'onclick="addAtlasSubjectToActiveSession(' +
                jsArg(subject.registryId) +
                ', event)">' +
                'Add to ' +
                escHtml(
                  getActiveSessionSubjectCollectionTitle()
                ) +
                '</button>'
              )
          ) +
'''
new_menu = r'''          '<div class="subject-card-menu-meta">Atlas Original</div>' +

          '<button type="button" role="menuitem" ' +
          'onclick="removeAtlasSubjectFromActiveSession(' +
          jsArg(subject.registryId) +
          ', event)">' +
          'Remove from ' +
          escHtml(
            getActiveSessionSubjectCollectionTitle()
          ) +
          '</button>' +
'''
if text.count(old_menu) != 1:
    raise SystemExit(f'Expected one conditional Atlas Original menu, found {text.count(old_menu)}')
text = text.replace(old_menu, new_menu, 1)

# 7) Quiet provenance styling inside menus, not on the card face.
css_anchor = "    .subject-card-menu button {\n"
if text.count(css_anchor) != 1:
    raise SystemExit(f'Expected one subject-card-menu button rule, found {text.count(css_anchor)}')
css = """    .subject-card-menu-meta {
      padding: 0.58rem 0.72rem 0.38rem;
      color: var(--text-subtle);
      font-size: 0.66rem;
      font-weight: 600;
      letter-spacing: 0.085em;
      line-height: 1.2;
      text-transform: uppercase;
    }

"""
text = text.replace(css_anchor, css + css_anchor, 1)

path.write_text(text)
