from pathlib import Path

path = Path('README.md')
text = path.read_text(encoding='utf-8')

anchor = """Return-to-intent is still intentionally deferred to Batch 2.3, and capability-driven protected-action interception remains Batch 2.4.\n\n## Browser persistence trust\n"""

replacement = """Return-to-intent is still intentionally deferred to Batch 2.3, and capability-driven protected-action interception remains Batch 2.4.\n\n## Return-to-intent foundation\n\n`AtlasReturnIntent` is the canonical temporary contract for preserving what an anonymous tutor meant to do before authentication interrupted them. Each intent receives an opaque ID and stores only a supported action type, a normalized same-origin Atlas destination, small JSON-safe context, creation time and expiry. The destination is persisted as a relative path/query/hash rather than an arbitrary absolute redirect URL. Account routes are rejected as return destinations so an auth round-trip cannot loop back into the account surface.\n\nReturn intents are stored independently by ID in browser-local storage so separate tabs do not overwrite one another and a confirmation email opened in another same-browser tab can recover the exact intent. If localStorage is unavailable, the runtime can preserve same-page intent state in memory but makes no claim of cross-tab durability. Intents expire after 24 hours by default, cannot live longer than seven days, reject oversized or non-plain context, validate again when read, and are consume-once when the later resume layer chooses to consume them. Tampered, malformed and expired records fail closed and are removed.\n\nBatch 2.3A establishes storage and validation only. It does not wire the account gate, add auth callback/query parameters, navigate to destinations or intercept protected features. Same-page authentication resume belongs to Batch 2.3B; confirmation/deep-link handoff belongs to Batch 2.3C; feature actions begin creating return intents in Batch 2.4. The executable contract proof lives at `tests/atlas-return-intent-contract.test.js`.\n\n## Browser persistence trust\n"""

count = text.count(anchor)
if count != 1:
    raise SystemExit(f'Expected one return-intent README anchor, found {count}')

path.write_text(text.replace(anchor, replacement, 1), encoding='utf-8')
print('Batch 2.3A return intent contract documented.')
