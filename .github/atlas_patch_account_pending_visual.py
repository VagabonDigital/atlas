from pathlib import Path


def replace_once(path, old, new, label):
    file_path = Path(path)
    text = file_path.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected one match in {path}, found {count}')
    file_path.write_text(text.replace(old, new, 1), encoding='utf-8')


# Pending access state remains non-interactive, but it should not look disabled.
replace_once(
    'shared/atlas-account-chrome.css',
    '''.atlas-account-control:disabled {
    opacity: 0.52;
    cursor: wait;
}
''',
    '''.atlas-account-control:disabled {
    opacity: 1;
    cursor: default;
}
''',
    'account pending visual treatment'
)

# Roll the chrome cache key through every parent loader/surface and the
# permanent placement proof so browsers and tests agree on this rollout.
for path in [
    'shared/atlas-account-chrome.js',
    'shared/atlas-content-registry.js',
    'index.html',
    'compass/index.html',
    'arcade/index.html',
    'tutors/index.html',
    'tests/atlas-account-chrome-contract.test.js',
]:
    file_path = Path(path)
    text = file_path.read_text(encoding='utf-8')
    count = text.count('20260916-accountchrome2')
    if count < 1:
        raise SystemExit(f'account chrome cache key: expected at least one match in {path}, found {count}')
    file_path.write_text(
        text.replace('20260916-accountchrome2', '20260916-accountchrome3'),
        encoding='utf-8'
    )

print('Account pending visual polish applied.')