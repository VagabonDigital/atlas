from pathlib import Path

path = Path('index.html')
text = path.read_text(encoding='utf-8')


def replace_once(old, new, label):
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 match, found {count}')
    text = text.replace(old, new, 1)


replace_once(
    """    let pendingRestoreBackup = null;\n""",
    """    let pendingRestoreBackup = null;\n    let settingsPreviousHtmlOverflow = '';\n    let settingsPreviousBodyOverflow = '';\n""",
    'settings scroll state'
)

replace_once(
    """    function openSettingsModal() {\n      const session = getActiveSession();\n      const currentUrl = readSessionAtmosphereImage(session.id);\n\n      renderArchivedSubjectsSettings();\n      renderRestoreAllAtlasOriginalsSetting();\n""",
    """    function openSettingsModal() {\n      const session = getActiveSession();\n      const currentUrl = readSessionAtmosphereImage(session.id);\n      const archivedToggle = document.getElementById(\n        'archived-subjects-toggle'\n      );\n      const archivedList = document.getElementById(\n        'archived-subjects-list'\n      );\n\n      if (archivedList) archivedList.hidden = true;\n      if (archivedToggle) archivedToggle.textContent = 'View';\n\n      renderArchivedSubjectsSettings();\n      renderRestoreAllAtlasOriginalsSetting();\n""",
    'reset archive view on open'
)

replace_once(
    """      document.getElementById('settings-modal').classList.add('open');\n      document.body.style.overflow = 'hidden';\n\n      setTimeout(() => {\n""",
    """      document.getElementById('settings-modal').classList.add('open');\n\n      settingsPreviousHtmlOverflow =\n        document.documentElement.style.overflow;\n      settingsPreviousBodyOverflow =\n        document.body.style.overflow;\n\n      document.documentElement.style.overflow = 'hidden';\n      document.body.style.overflow = 'hidden';\n\n      setTimeout(() => {\n""",
    'lock settings background scroll'
)

replace_once(
    """    function closeSettingsModal() {\n      document.getElementById('settings-modal').classList.remove('open');\n      document.body.style.overflow = '';\n      cancelRestoreBackup();\n      applyEffectiveAtmosphereImage();\n    }\n""",
    """    function closeSettingsModal() {\n      document.getElementById('settings-modal').classList.remove('open');\n\n      document.documentElement.style.overflow =\n        settingsPreviousHtmlOverflow;\n      document.body.style.overflow =\n        settingsPreviousBodyOverflow;\n\n      cancelRestoreBackup();\n      applyEffectiveAtmosphereImage();\n    }\n""",
    'restore settings background scroll'
)

replace_once(
    """    function setBackupStatus(message, isError) {\n      const status = document.getElementById('data-backup-status');\n      if (!status) return;\n\n      status.textContent = message || '';\n      status.classList.toggle('error', Boolean(isError));\n      status.hidden = !message;\n    }\n\n    function setBackupBusy(busy) {\n""",
    """    function setBackupStatus(message, isError) {\n      const status = document.getElementById('data-backup-status');\n      if (!status) return;\n\n      status.textContent = message || '';\n      status.classList.toggle('error', Boolean(isError));\n      status.hidden = !message;\n    }\n\n    function scrollBackupStatusIntoView() {\n      const modal = document.getElementById('settings-modal');\n      const status = document.getElementById('data-backup-status');\n\n      if (\n        !modal?.classList.contains('open') ||\n        !status ||\n        status.hidden\n      ) {\n        return;\n      }\n\n      const behavior = window.matchMedia(\n        '(prefers-reduced-motion: reduce)'\n      ).matches\n        ? 'auto'\n        : 'smooth';\n\n      window.requestAnimationFrame(() => {\n        status.scrollIntoView({\n          behavior,\n          block: 'nearest'\n        });\n      });\n    }\n\n    function setBackupBusy(busy) {\n""",
    'backup status scroll helper'
)

replace_once(
    """      } finally {\n        setBackupBusy(false);\n      }\n    }\n\n    function handleChooseRestoreBackup() {\n""",
    """      } finally {\n        setBackupBusy(false);\n        scrollBackupStatusIntoView();\n      }\n    }\n\n    function handleChooseRestoreBackup() {\n""",
    'reveal backup result'
)

path.write_text(text, encoding='utf-8')
print('Atlas Settings micro-tweaks applied.')
