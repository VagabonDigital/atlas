from pathlib import Path

path = Path('compass/index.html')
text = path.read_text(encoding='utf-8')


def replace_once(old, new, label):
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 match, found {count}')
    text = text.replace(old, new, 1)


replace_once(
    """    .subject-card--has-art .subject-card-header,\n    .subject-card--has-art .subject-card-hook {\n      max-width: 68%;\n    }\n""",
    """    .subject-card--has-art .subject-card-header {\n      max-width: 78%;\n    }\n\n    .subject-card--has-art .subject-card-hook {\n      max-width: 68%;\n    }\n""",
    'desktop artwork title allowance'
)

replace_once(
    """              <div class=\"subject-artwork-studio-kicker\">\n                Subject artwork\n              </div>\n""",
    """              <div class=\"subject-artwork-studio-kicker\">\n                Atlas Art Studio\n              </div>\n""",
    'art studio kicker'
)

path.write_text(text, encoding='utf-8')
print('Compass artwork geometry and studio identity updated.')
