from pathlib import Path


def replace_exact(path, old, new, expected, label):
    file_path = Path(path)
    text = file_path.read_text(encoding='utf-8')
    count = text.count(old)
    if count != expected:
        raise SystemExit(f'{label}: expected {expected} match(es), found {count}')
    file_path.write_text(text.replace(old, new), encoding='utf-8')


replace_exact(
    'account/index.html',
    '../shared/atlas-account.js?v=20260916-account1',
    '../shared/atlas-account.js?v=20260916-stage1close1',
    1,
    'account page account runtime'
)

replace_exact(
    'index.html',
    './shared/atlas-content-registry.js?v=20260916-runtime3',
    './shared/atlas-content-registry.js?v=20260916-stage1close1',
    1,
    'Atlas root content registry'
)

replace_exact(
    'compass/index.html',
    '../shared/atlas-content-registry.js?v=20260916-runtime3',
    '../shared/atlas-content-registry.js?v=20260916-stage1close1',
    1,
    'Compass content registry'
)

replace_exact(
    'shared/atlas-content-registry.js',
    '/shared/atlas-root-runtime.js?v=20260916-runtime3',
    '/shared/atlas-root-runtime.js?v=20260916-stage1close1',
    2,
    'root runtime bootstrap cache key'
)

replace_exact(
    'shared/atlas-content-registry.js',
    '/shared/atlas-account.js?v=20260916-runtime3',
    '/shared/atlas-account.js?v=20260916-stage1close1',
    1,
    'Compass account runtime cache key'
)

replace_exact(
    'shared/atlas-root-runtime.js',
    '/shared/atlas-account.js?v=20260915-production2',
    '/shared/atlas-account.js?v=20260916-stage1close1',
    1,
    'Atlas root account runtime cache key'
)

print('Stage 1 closure runtime cache keys updated.')
