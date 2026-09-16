from pathlib import Path

path = Path('compass/shared/compass-engine.js')
text = path.read_text(encoding='utf-8')
old = "        resetTitle: 'Clear this subject?',"
new = "        resetTitle: 'Clear activity?',"
count = text.count(old)
if count != 1:
    raise SystemExit(f'Expected exactly one reset title match, found {count}.')
path.write_text(text.replace(old, new, 1), encoding='utf-8')
print('Updated Compass clear confirmation title.')
