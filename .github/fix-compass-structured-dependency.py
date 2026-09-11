from pathlib import Path

path = Path('compass/index.html')
text = path.read_text()

replacements = {
    '<script src="../shared/atlas-structured-subject.js"></script>': '<script src="../shared/atlas-structured-subject.js?v=20260911-1"></script>',
    '<script src="../shared/atlas-tutor-subjects.js"></script>': '<script src="../shared/atlas-tutor-subjects.js?v=20260911-1"></script>'
}

for old, new in replacements.items():
    if old not in text:
        raise SystemExit(f'Expected script tag not found: {old}')
    text = text.replace(old, new, 1)

path.write_text(text)
