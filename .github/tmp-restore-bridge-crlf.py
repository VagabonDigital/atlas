from pathlib import Path
import subprocess

path = Path('shared/atlas-bridge.js')
expected_blob = '5e30182cb056f23c67fb296982a21157e3eb1902'
actual_blob = subprocess.check_output(
    ['git', 'hash-object', str(path)],
    text=True
).strip()

if actual_blob != expected_blob:
    raise SystemExit(
        f'shared/atlas-bridge.js changed since audit: '
        f'expected {expected_blob}, found {actual_blob}'
    )

data = path.read_bytes()

if b'APPEARANCE_TRANSITION_CLEANUP_BUFFER_MS = 100' not in data:
    raise SystemExit('cleanup buffer change missing before CRLF restore')

normalized = data.replace(b'\r\n', b'\n')
path.write_bytes(normalized.replace(b'\n', b'\r\n'))
