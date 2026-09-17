from pathlib import Path

path = Path('tutors/index.html')
text = path.read_text(encoding='utf-8')


def replace_once(old, new, label):
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 match, found {count}')
    text = text.replace(old, new, 1)


replace_once(
    '<html lang="en" data-theme="light">',
    '<html lang="en" data-theme="light" class="atlas-fonts-pending">',
    'font gate root class'
)

replace_once(
    '''  <meta name="color-scheme" content="light dark">\n  <link rel="icon" type="image/svg+xml"''',
    '''  <meta name="color-scheme" content="light dark">\n\n  <style>\n    html.atlas-fonts-pending {\n      background: #f3f0e9;\n    }\n\n    html.atlas-fonts-pending[data-theme="dark"] {\n      background: #1b1d1c;\n    }\n\n    html.atlas-fonts-pending body {\n      visibility: hidden;\n    }\n  </style>\n\n  <link rel="icon" type="image/svg+xml"''',
    'critical font gate styles'
)

replace_once(
    '''  <link\n    href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&family=Playfair+Display:wght@500;600&display=swap"\n    rel="stylesheet">\n  <link rel="stylesheet" href="/shared/atlas-account-chrome.css?v=20260916-accountchrome5"''',
    '''  <link\n    href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&family=Playfair+Display:wght@500;600&display=swap"\n    rel="stylesheet">\n  <script>\n    (function () {\n      var root = document.documentElement;\n      var revealed = false;\n      var safetyTimer = window.setTimeout(reveal, 2000);\n      var criticalFonts = null;\n\n      function reveal() {\n        if (revealed) return;\n        revealed = true;\n        window.clearTimeout(safetyTimer);\n        root.classList.remove('atlas-fonts-pending');\n      }\n\n      if (document.fonts && typeof document.fonts.load === 'function') {\n        criticalFonts = Promise.all([\n          document.fonts.load('400 16px "DM Sans"'),\n          document.fonts.load('400 48px "DM Serif Display"'),\n          document.fonts.load('500 16px "Playfair Display"')\n        ]);\n      }\n\n      function waitForFonts() {\n        if (!document.fonts) {\n          reveal();\n          return;\n        }\n\n        Promise.resolve(criticalFonts)\n          .then(function () {\n            return document.fonts.ready;\n          })\n          .then(reveal, reveal);\n      }\n\n      if (document.readyState === 'loading') {\n        document.addEventListener(\n          'DOMContentLoaded',\n          waitForFonts,\n          { once: true }\n        );\n      } else {\n        waitForFonts();\n      }\n    })();\n  </script>\n  <link rel="stylesheet" href="/shared/atlas-account-chrome.css?v=20260916-accountchrome5"''',
    'font readiness gate'
)

path.write_text(text, encoding='utf-8')
print('Inside Atlas font readiness gate added.')
