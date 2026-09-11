from pathlib import Path

path = Path('index.html')
text = path.read_text()

def replace_once(old, new, label):
    global text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected exactly one match, found {count}')
    text = text.replace(old, new, 1)

replace_once(
'''              <span class="settings-utility-title">Restore all Atlas Originals</span>\n              <span class="settings-utility-meta">Bring back archived and deleted Atlas Originals.</span>\n''',
'''              <span class="settings-utility-title">Restore all Atlas Subjects</span>\n              <span class="settings-utility-meta">Bring back archived and deleted Atlas Original subjects.</span>\n''',
'restore terminology'
)

replace_once(
'''            <button class="btn-ghost" id="restore-atlas-originals-button"\n              onclick="restoreAllAtlasOriginals(this)">Restore</button>\n''',
'''            <button class="btn-ghost" id="restore-atlas-originals-button" type="button"\n              onclick="restoreAllAtlasOriginals(this)">Restore</button>\n''',
'restore button type'
)

replace_once(
'''      if (\n        !Curation ||\n        typeof Curation.listStates !== 'function' ||\n        typeof Curation.restoreAll !== 'function'\n      ) {\n        showToast('Atlas Originals recovery is unavailable.');\n        return;\n      }\n''',
'''      if (\n        !Curation ||\n        typeof Curation.listStates !== 'function' ||\n        typeof Curation.restore !== 'function'\n      ) {\n        showToast('Atlas Subjects recovery is unavailable.');\n        return;\n      }\n''',
'restore capability guard'
)

replace_once(
'''      try {\n        if (!Curation.restoreAll()) {\n          throw new Error('Atlas Original restoration failed.');\n        }\n\n        await renderArchivedSubjectsSettings();\n        renderRestoreAllAtlasOriginalsSetting();\n        showToast('Atlas Originals restored.');\n''',
'''      try {\n        for (const state of states) {\n          if (!Curation.restore(state.registryId)) {\n            throw new Error('Atlas Subject restoration failed.');\n          }\n        }\n\n        await renderArchivedSubjectsSettings();\n        renderRestoreAllAtlasOriginalsSetting();\n        showToast('Atlas Subjects restored.');\n''',
'restore implementation'
)

replace_once(
'''      } catch {\n        showToast('Couldn’t restore Atlas Originals.');\n''',
'''      } catch {\n        showToast('Couldn’t restore Atlas Subjects.');\n''',
'restore failure copy'
)

replace_once(
'''      setTimeout(() => {\n        const el = document.getElementById('atmosphere-input');\n        if (el) el.focus();\n      }, 50);\n''',
'''      setTimeout(() => {\n        const el = document.querySelector('#settings-modal .modal-close');\n        if (el) el.focus({ preventScroll: true });\n      }, 50);\n''',
'settings initial focus'
)

path.write_text(text)
