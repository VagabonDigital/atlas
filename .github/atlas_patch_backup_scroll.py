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
    """    function scrollBackupStatusIntoView() {\n      const modal = document.getElementById('settings-modal');\n      const status = document.getElementById('data-backup-status');\n\n      if (\n        !modal?.classList.contains('open') ||\n        !status ||\n        status.hidden\n      ) {\n        return;\n      }\n\n      const behavior = window.matchMedia(\n        '(prefers-reduced-motion: reduce)'\n      ).matches\n        ? 'auto'\n        : 'smooth';\n\n      window.requestAnimationFrame(() => {\n        status.scrollIntoView({\n          behavior,\n          block: 'nearest'\n        });\n      });\n    }\n""",
    """    function scrollBackupStatusIntoView() {\n      const modal = document.getElementById('settings-modal');\n      const modalBody = modal?.querySelector('.modal-body');\n      const status = document.getElementById('data-backup-status');\n\n      if (\n        !modal?.classList.contains('open') ||\n        !modalBody ||\n        !status ||\n        status.hidden\n      ) {\n        return;\n      }\n\n      const behavior = window.matchMedia(\n        '(prefers-reduced-motion: reduce)'\n      ).matches\n        ? 'auto'\n        : 'smooth';\n\n      window.requestAnimationFrame(() => {\n        window.requestAnimationFrame(() => {\n          modalBody.scrollTo({\n            top: modalBody.scrollHeight,\n            behavior\n          });\n        });\n      });\n    }\n""",
    'scroll backup area to bottom'
)

replace_once(
    """    async function handleDownloadBackup() {\n      setBackupBusy(true);\n      setBackupStatus('Preparing backup…', false);\n\n      try {\n""",
    """    async function handleDownloadBackup() {\n      setBackupBusy(true);\n      setBackupStatus('Preparing backup…', false);\n      scrollBackupStatusIntoView();\n\n      try {\n""",
    'start backup scroll on reveal'
)

path.write_text(text, encoding='utf-8')
print('Atlas backup scroll polish applied.')
