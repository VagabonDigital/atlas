from pathlib import Path


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")
    return text.replace(old, new, 1)


bootstrap_path = Path('shared/atlas-access-bootstrap.js')
bootstrap = bootstrap_path.read_text()

old_session_helper = '''    function hasStoredAccountSession() {
        try {
            return Boolean(localStorage.getItem(AUTH_STORAGE_KEY));
        } catch {
            return false;
        }
    }
'''
new_session_helper = old_session_helper + '''
    function shouldYieldForHubFirstPaint() {
        return Boolean(
            hasStoredAccountSession() &&
            document.body?.dataset?.atlasSurface === 'hub'
        );
    }

    function yieldUntilHubFirstPaint() {
        if (!shouldYieldForHubFirstPaint()) {
            return Promise.resolve();
        }

        return new Promise(resolve => {
            window.requestAnimationFrame(() => {
                window.setTimeout(resolve, 0);
            });
        });
    }
'''
bootstrap = replace_once(
    bootstrap,
    old_session_helper,
    new_session_helper,
    'hub first-paint yield helpers'
)

old_account_start = '''            if (!hasStoredAccountSession()) {
                return Access.bootstrapAnonymous();
            }

            await ensureAccountStack();
'''
new_account_start = '''            if (!hasStoredAccountSession()) {
                return Access.bootstrapAnonymous();
            }

            await yieldUntilHubFirstPaint();
            await ensureAccountStack();
'''
bootstrap = replace_once(
    bootstrap,
    old_account_start,
    new_account_start,
    'defer stored-account hub bootstrap'
)
bootstrap_path.write_text(bootstrap)

registry_path = Path('shared/atlas-content-registry.js')
registry = registry_path.read_text()
registry = replace_once(
    registry,
    '/shared/atlas-access-bootstrap.js?v=20260917-capability1',
    '/shared/atlas-access-bootstrap.js?v=20260917-navspeed1',
    'access bootstrap cache bust'
)
registry_path.write_text(registry)

index_path = Path('index.html')
index = index_path.read_text()
index = replace_once(
    index,
    './shared/atlas-content-registry.js?v=20260916-accountchrome5',
    './shared/atlas-content-registry.js?v=20260917-navspeed1',
    'Atlas registry cache bust'
)
index_path.write_text(index)

compass_path = Path('compass/index.html')
compass = compass_path.read_text()
compass = replace_once(
    compass,
    '../shared/atlas-content-registry.js?v=20260916-compassperf1',
    '../shared/atlas-content-registry.js?v=20260917-navspeed1',
    'Compass registry cache bust'
)
compass_path.write_text(compass)

# Contract assertions.
bootstrap = bootstrap_path.read_text()
registry = registry_path.read_text()
index = index_path.read_text()
compass = compass_path.read_text()

assert 'function yieldUntilHubFirstPaint()' in bootstrap
assert 'await yieldUntilHubFirstPaint();\n            await ensureAccountStack();' in bootstrap
assert '/shared/atlas-access-bootstrap.js?v=20260917-navspeed1' in registry
assert './shared/atlas-content-registry.js?v=20260917-navspeed1' in index
assert '../shared/atlas-content-registry.js?v=20260917-navspeed1' in compass
