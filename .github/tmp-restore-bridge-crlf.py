from pathlib import Path
import hashlib
import subprocess

path = Path('shared/atlas-bridge.js')
current_expected_blob = '5e30182cb056f23c67fb296982a21157e3eb1902'
base_commit = 'e881d1a1a8de2184b7b45c3accf6dccb51b9b289'
base_expected_blob = '7fe14f227ab9173335ee6f31f382fab287fc19d6'

actual_blob = subprocess.check_output(
    ['git', 'hash-object', str(path)],
    text=True
).strip()

if actual_blob != current_expected_blob:
    raise SystemExit(
        f'shared/atlas-bridge.js changed since audit: '
        f'expected {current_expected_blob}, found {actual_blob}'
    )

base = subprocess.check_output([
    'git',
    'show',
    f'{base_commit}:shared/atlas-bridge.js'
])

base_blob = subprocess.run(
    ['git', 'hash-object', '--stdin'],
    input=base,
    stdout=subprocess.PIPE,
    check=True
).stdout.decode().strip()

if base_blob != base_expected_blob:
    raise SystemExit(
        f'pre-change Bridge blob mismatch: '
        f'expected {base_expected_blob}, found {base_blob}'
    )

if base.count(b'\r\n') < 1000 or base.count(b'\n') != base.count(b'\r\n'):
    raise SystemExit('pre-change Bridge is not consistently CRLF')

old_constants = (
    b"    const APPEARANCE_TRANSITION_MS = 280;\r\n"
    b"    let appearanceTransitionTimer = null;"
)
new_constants = (
    b"    const APPEARANCE_TRANSITION_MS = 280;\r\n"
    b"    const APPEARANCE_TRANSITION_CLEANUP_BUFFER_MS = 100;\r\n"
    b"    let appearanceTransitionTimer = null;"
)

old_cleanup = (
    b"        appearanceTransitionTimer = setTimeout(() => {\r\n"
    b"            root.classList.remove('theme-changing');\r\n"
    b"            appearanceTransitionTimer = null;\r\n"
    b"        }, APPEARANCE_TRANSITION_MS);"
)
new_cleanup = (
    b"        // Keep the transition contract alive for a few compositor frames\r\n"
    b"        // after the visible 280ms motion completes. Removing the class on\r\n"
    b"        // the exact final frame can force a style reset before the last paint.\r\n"
    b"        appearanceTransitionTimer = setTimeout(() => {\r\n"
    b"            root.classList.remove('theme-changing');\r\n"
    b"            appearanceTransitionTimer = null;\r\n"
    b"        }, APPEARANCE_TRANSITION_MS + APPEARANCE_TRANSITION_CLEANUP_BUFFER_MS);"
)

if base.count(old_constants) != 1:
    raise SystemExit('Bridge constants guard failed')
if base.count(old_cleanup) != 1:
    raise SystemExit('Bridge cleanup guard failed')

patched = base.replace(old_constants, new_constants, 1)
patched = patched.replace(old_cleanup, new_cleanup, 1)

if patched.count(b'\n') != patched.count(b'\r\n'):
    raise SystemExit('patched Bridge line endings are not consistently CRLF')

path.write_bytes(patched)
