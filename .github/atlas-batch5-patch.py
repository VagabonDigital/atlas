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
    '''          <div class="archived-subjects-list" id="archived-subjects-list" hidden></div>\n        </section>\n''',
    '''          <div class="archived-subjects-list" id="archived-subjects-list" hidden></div>\n\n          <div class="settings-utility-row" id="restore-atlas-originals-row" hidden>\n            <div class="settings-utility-copy">\n              <span class="settings-utility-title">Restore all Atlas Originals</span>\n              <span class="settings-utility-meta">Bring back archived and deleted Atlas Originals.</span>\n            </div>\n\n            <button class="btn-ghost" id="restore-atlas-originals-button"\n              onclick="restoreAllAtlasOriginals(this)">Restore</button>\n          </div>\n        </section>\n''',
    'settings row'
)

anchor = '''    function toggleArchivedSubjectsSettings() {\n'''
helpers = '''    function renderRestoreAllAtlasOriginalsSetting() {\n      const row = document.getElementById(\n        'restore-atlas-originals-row'\n      );\n\n      const button = document.getElementById(\n        'restore-atlas-originals-button'\n      );\n\n      const Curation = window.AtlasOriginalCuration;\n\n      if (!row || !button) {\n        return;\n      }\n\n      const states =\n        Curation && typeof Curation.listStates === 'function'\n          ? Curation.listStates()\n          : [];\n\n      const applicable = states.length > 0;\n\n      row.hidden = !applicable;\n      button.disabled = !applicable;\n      button.textContent = 'Restore';\n    }\n\n    async function restoreAllAtlasOriginals(button) {\n      const Curation = window.AtlasOriginalCuration;\n\n      if (\n        !Curation ||\n        typeof Curation.listStates !== 'function' ||\n        typeof Curation.restoreAll !== 'function'\n      ) {\n        showToast('Atlas Originals recovery is unavailable.');\n        return;\n      }\n\n      const states = Curation.listStates();\n\n      if (!states.length) {\n        renderRestoreAllAtlasOriginalsSetting();\n        return;\n      }\n\n      if (button) {\n        button.disabled = true;\n        button.textContent = 'Restoring…';\n      }\n\n      try {\n        if (!Curation.restoreAll()) {\n          throw new Error('Atlas Original restoration failed.');\n        }\n\n        await renderArchivedSubjectsSettings();\n        renderRestoreAllAtlasOriginalsSetting();\n        showToast('Atlas Originals restored.');\n      } catch {\n        showToast('Couldn’t restore Atlas Originals.');\n\n        if (button) {\n          button.disabled = false;\n          button.textContent = 'Restore';\n        }\n      }\n    }\n\n'''
text = replace_once(text, anchor, helpers + anchor, 'restore helpers')

text = replace_once(
    text,
    '''        await renderArchivedSubjectsSettings();\n\n        showToast('Subject restored.');\n''',
    '''        await renderArchivedSubjectsSettings();\n        renderRestoreAllAtlasOriginalsSetting();\n\n        showToast('Subject restored.');\n''',
    'individual restore refresh'
)

text = replace_once(
    text,
    '''      renderArchivedSubjectsSettings();\n\n      const input = document.getElementById('atmosphere-input');\n''',
    '''      renderArchivedSubjectsSettings();\n      renderRestoreAllAtlasOriginalsSetting();\n\n      const input = document.getElementById('atmosphere-input');\n''',
    'settings open refresh'
)

path.write_text(text)
