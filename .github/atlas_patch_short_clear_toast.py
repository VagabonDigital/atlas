from pathlib import Path

path = Path('compass/shared/compass-engine.js')
text = path.read_text(encoding='utf-8')
old = "        `${getEffectiveSubjectTitle()} activity cleared for ${displayName}.`"
new = "        `Activity cleared for ${displayName}.`"
count = text.count(old)
if count != 1:
    raise SystemExit(f'Expected exactly 1 clear-toast match, found {count}')
path.write_text(text.replace(old, new, 1), encoding='utf-8')
print('Shortened Compass clear toast copy.')
