from pathlib import Path

path = Path('README.md')
text = path.read_text(encoding='utf-8')

anchor = """The executable state proof lives at `tests/atlas-access-contract.test.js` and can be run with `node tests/atlas-access-contract.test.js`. It covers anonymous → Free, account switching through a resolving state, entitlement-read failure, simulated future Pro allowance state and sign-out back to anonymous.\n\n## Browser persistence trust\n"""

replacement = """The executable state proof lives at `tests/atlas-access-contract.test.js` and can be run with `node tests/atlas-access-contract.test.js`. It covers anonymous → Free, account switching through a resolving state, entitlement-read failure, simulated future Pro allowance state and sign-out back to anonymous.\n\n## Shared account gate foundation\n\n`AtlasAccountGate` is the reusable account-entry UI above `AtlasAccess` and `AtlasAccount`. It owns the shared sign-in/create-account dialog, password-reset entry, email-confirmation success state and the compact signed-in account menu. The account menu exposes private identity only on demand (email, Free/Pro status, account settings and sign out) rather than placing tutor identity permanently in teaching chrome.\n\nAnonymous product surfaces remain lightweight. `AtlasAccessBootstrap.prepareAccount()` upgrades the anonymous access runtime into the existing `AtlasCloud` → `AtlasAccount` → `AtlasAccess` stack only when the tutor deliberately opens account UI. The gate does not duplicate Supabase or account lifecycle logic.\n\nBatch 2.2A establishes the shared account UI contract only. Header placement and cross-world lifecycle proof belong to Batch 2.2B; return-to-intent belongs to Batch 2.3; protected-action interception belongs to Batch 2.4. The executable foundation proof lives at `tests/atlas-account-gate-contract.test.js`.\n\n## Browser persistence trust\n"""

count = text.count(anchor)
if count != 1:
    raise SystemExit(f'Expected one README access-state anchor, found {count}')

path.write_text(text.replace(anchor, replacement, 1), encoding='utf-8')
print('Batch 2.2A README contract documented.')
