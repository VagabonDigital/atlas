from pathlib import Path


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected exactly one match, found {count}')
    return text.replace(old, new, 1)

path = Path('index.html')
text = path.read_text()

text = replace_once(
    text,
    '          <div class="archived-subjects-list" id="archived-subjects-list" hidden></div>\n        </section>\n',
    '          <div class="archived-subjects-list" id="archived-subjects-list" hidden></div>\n\n'
    '          <div class="settings-utility-row" id="restore-atlas-originals-row" hidden>\n'
    '            <div class="settings-utility-copy">\n'
    '              <span class="settings-utility-title">Restore all Atlas Originals</span>\n'
    '              <span class="settings-utility-meta">Bring back archived and deleted Atlas Originals.</span>\n'
    '            </div>\n\n'
    '            <button class="btn-ghost" id="restore-atlas-originals-button"\n'
    '              onclick="restoreAllAtlasOriginals(this)">Restore</button>\n'
    '          </div>\n'
    '        </section>\n',
    'settings row'
)

anchor = '    function toggleArchivedSubjectsSettings() {\n'
helpers = '''    function renderRestoreAllAtlasOriginalsSetting() {
      const row = document.getElementById(
        'restore-atlas-originals-row'
      );

      const button = document.getElementById(
        'restore-atlas-originals-button'
      );

      const Curation = window.AtlasOriginalCuration;

      if (!row || !button) {
        return;
      }

      const states =
        Curation && typeof Curation.listStates === 'function'
          ? Curation.listStates()
          : [];

      const applicable = states.length > 0;

      row.hidden = !applicable;
      button.disabled = !applicable;
      button.textContent = 'Restore';
    }

    async function restoreAllAtlasOriginals(button) {
      const Curation = window.AtlasOriginalCuration;

      if (
        !Curation ||
        typeof Curation.listStates !== 'function' ||
        typeof Curation.restoreAll !== 'function'
      ) {
        showToast('Atlas Originals recovery is unavailable.');
        return;
      }

      const states = Curation.listStates();

      if (!states.length) {
        renderRestoreAllAtlasOriginalsSetting();
        return;
      }

      if (button) {
        button.disabled = true;
        button.textContent = 'Restoring…';
      }

      try {
        if (!Curation.restoreAll()) {
          throw new Error('Atlas Original restoration failed.');
        }

        await renderArchivedSubjectsSettings();
        renderRestoreAllAtlasOriginalsSetting();
        showToast('Atlas Originals restored.');
      } catch {
        showToast('Couldn’t restore Atlas Originals.');

        if (button) {
          button.disabled = false;
          button.textContent = 'Restore';
        }
      }
    }

'''
text = replace_once(text, anchor, helpers + anchor, 'restore helpers')

text = replace_once(
    text,
    "        await renderArchivedSubjectsSettings();\n        showToast('Subject restored.');\n",
    "        await renderArchivedSubjectsSettings();\n        renderRestoreAllAtlasOriginalsSetting();\n        showToast('Subject restored.');\n",
    'individual restore refresh'
)

text = replace_once(
    text,
    "      renderArchivedSubjectsSettings();\n\n      const input = document.getElementById('atmosphere-input');\n",
    "      renderArchivedSubjectsSettings();\n      renderRestoreAllAtlasOriginalsSetting();\n\n      const input = document.getElementById('atmosphere-input');\n",
    'settings open refresh'
)

path.write_text(text)
