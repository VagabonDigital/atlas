from pathlib import Path


def replace_once(path, old, new, label):
    file_path = Path(path)
    text = file_path.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 match, found {count}')
    file_path.write_text(text.replace(old, new, 1), encoding='utf-8')


replace_once(
    'README.md',
    """- `shared/` — shared runtime, persistence, cloud authority, navigation and UI modules.\n- `supabase/migrations/` — canonical, source-controlled history of Atlas database schema changes.\n""",
    """- `shared/` — shared runtime, persistence, cloud authority, navigation and UI modules.\n- `tests/` — lightweight runtime contract proofs for shared product architecture.\n- `supabase/migrations/` — canonical, source-controlled history of Atlas database schema changes.\n""",
    'README repository map tests entry'
)

replace_once(
    'README.md',
    """`account_entitlements` is the minimal server-owned foundation for future Free/Pro capability state. Authenticated browser clients can read only their own entitlement row; they cannot mutate entitlement data. A missing row intentionally means the Free baseline. Product code should consume capability-shaped account APIs rather than scatter `plan === 'pro'` checks through Atlas. This foundation does not yet constitute server-side AI quota enforcement.\n\n## Browser persistence trust\n""",
    """`account_entitlements` is the minimal server-owned foundation for future Free/Pro capability state. Authenticated browser clients can read only their own entitlement row; they cannot mutate entitlement data. A missing row intentionally means the Free baseline. Product code should consume capability-shaped account APIs rather than scatter `plan === 'pro'` checks through Atlas. This foundation does not yet constitute server-side AI quota enforcement.\n\n## Canonical access state\n\n`AtlasAccess` is the product-level access resolver above `AtlasAccount`. `AtlasAccount` continues to own identity and raw server entitlement state; `AtlasAccess` converts that into one semantic access contract for Atlas, Compass and Arcade. Product surfaces should consume `AtlasAccess` capabilities rather than inspect Supabase state or `plan_code`.\n\nThe canonical tiers are `anonymous`, `free` and future `pro`. The shared capability vocabulary currently covers durable saving, learner creation, subject creation, subject editing, AI-assisted creation and access to the account library. AI creation also carries a normalized creation-allowance state (`available`, `limited`, `exhausted`, `blocked` or `unknown`) so future quota policy can evolve without changing feature call sites.\n\nAnonymous access resolves locally with all account-owned capabilities blocked. A stored signed-in session upgrades through `AtlasCloud` → `AtlasAccount` → `AtlasAccess`; anonymous visitors do not load the Supabase/auth stack merely to resolve the anonymous tier. While an authenticated account is still resolving entitlement state, or if that entitlement read fails, Atlas preserves authenticated identity but keeps access not-ready and capability checks fail closed rather than misclassifying the tutor as anonymous.\n\n`atlas-access-bootstrap.js` makes this state available through the shared content-registry seam across the Atlas gateway, Compass hub and subjects, and Arcade hub and games. Batch 2.1 establishes state only: shared account gates, return-to-intent and feature-level interception are later Stage 2 responsibilities.\n\nThe executable state proof lives at `tests/atlas-access-contract.test.js` and can be run with `node tests/atlas-access-contract.test.js`. It covers anonymous → Free, account switching through a resolving state, entitlement-read failure, simulated future Pro allowance state and sign-out back to anonymous.\n\n## Browser persistence trust\n""",
    'README canonical access state section'
)

print('Batch 2.1C README contract documentation patched.')
