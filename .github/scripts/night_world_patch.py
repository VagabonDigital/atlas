from pathlib import Path

path = Path('index.html')
text = path.read_text()

replacements = [
    (
        """      --world-card-surface: rgba(255, 253, 249, 0.96);\n      --world-card-border: rgba(49, 45, 38, 0.11);\n      --compass-card-start: rgba(255, 253, 249, 1);\n""",
        """      --world-card-surface: rgba(255, 253, 249, 0.96);\n      --world-card-border: rgba(49, 45, 38, 0.11);\n      --tutor-card-start: rgba(255, 253, 249, 1);\n      --tutor-card-end: rgba(77, 113, 132, 0.010);\n      --compass-card-start: rgba(255, 253, 249, 1);\n""",
        'day tutor tokens'
    ),
    (
        """      --world-card-surface: rgba(37, 40, 38, 0.96);\n      --world-card-border: var(--border-faint);\n      --compass-card-start: rgba(37, 40, 38, 0.98);\n""",
        """      --world-card-surface: rgba(37, 40, 38, 0.96);\n      --world-card-border: var(--border-faint);\n      --tutor-card-start: rgba(37, 40, 38, 0.98);\n      --tutor-card-end: rgba(143, 178, 194, 0.016);\n      --compass-card-start: rgba(37, 40, 38, 0.98);\n""",
        'night tutor tokens'
    ),
    (
        """      background: var(--world-card-surface);\n      box-shadow: var(--shadow-sm);\n""",
        """      --door-c1: var(--tutor-card-start);\n      --door-c2: var(--tutor-card-end);\n      background: linear-gradient(145deg,\n          var(--door-c1),\n          var(--door-c2));\n      box-shadow: var(--shadow-sm);\n""",
        'Inside Atlas surface'
    ),
    (
        """    .door-arcade::before {\n      --rail-1: var(--arcade-mark-start);\n      --rail-2: var(--arcade-mark-end);\n      background: linear-gradient(90deg,\n          var(--rail-1),\n          var(--rail-2));\n      opacity: 0.40;\n    }\n\n    .door:hover {\n""",
        """    .door-arcade::before {\n      --rail-1: var(--arcade-mark-start);\n      --rail-2: var(--arcade-mark-end);\n      background: linear-gradient(90deg,\n          var(--rail-1),\n          var(--rail-2));\n      opacity: 0.40;\n    }\n\n    html[data-theme=\"night\"] .tutor-entry::before {\n      opacity: 0.76;\n    }\n\n    html[data-theme=\"night\"] .door-compass::before {\n      opacity: 0.68;\n    }\n\n    html[data-theme=\"night\"] .door-arcade::before {\n      opacity: 0.62;\n    }\n\n    .door:hover {\n""",
        'night rail overrides'
    ),
]

for old, new, label in replacements:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'Expected one {label} block, found {count}')
    text = text.replace(old, new, 1)

path.write_text(text)
