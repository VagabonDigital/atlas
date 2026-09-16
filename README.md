# Atlas

Atlas is a tutor-first English teaching workspace built around three connected product worlds:

- **Atlas** — gateway, learner continuity and account-level teaching state.
- **Compass** — tutor-owned subjects and Atlas Originals.
- **Arcade** — reusable lesson games and interactive activities.

## Repository map

- `index.html` — Atlas gateway.
- `account/` — permanent account lifecycle surface: sign in, account creation, email confirmation return, password recovery, plan identity and sign out.
- `compass/` — Compass hub, Atlas Originals and subject runtime.
- `arcade/` — Arcade hub and game runtimes.
- `memory/` — learner-memory surface.
- `tutors/` — tutor-facing public/pilot surfaces.
- `shared/` — shared runtime, persistence, cloud authority, navigation and UI modules.
- `tests/` — lightweight runtime contract proofs for shared product architecture.
- `supabase/migrations/` — canonical, source-controlled history of Atlas database schema changes.

## Persistence model

Atlas JavaScript running in the browser communicates directly with the Supabase backend. Supabase provides authentication, the Postgres database and the API boundary used by Atlas.

For signed-in tutors, durable account-owned state is stored in Supabase, including My Subjects, My Versions, learner records, Session Subjects, curation, hub personalization and teaching continuity. Browser storage remains appropriate for deliberately local or transient state such as the active learner tab/session, working drafts, short-lived undo state and cosmetic preferences.

## Account lifecycle and entitlements

`AtlasCloud` owns the shared Supabase browser client. `AtlasAccountCloud` contains Supabase-specific account lifecycle operations and entitlement reads. `AtlasAccount` is the product-facing account contract used by Atlas surfaces.

Email/password signup requires email confirmation. Signup confirmation and password-recovery links return to `/account/`, which handles normal sign-in, account creation and recovery states without introducing a separate auth product.

`account_entitlements` is the minimal server-owned foundation for future Free/Pro capability state. Authenticated browser clients can read only their own entitlement row; they cannot mutate entitlement data. A missing row intentionally means the Free baseline. Product code should consume capability-shaped account APIs rather than scatter `plan === 'pro'` checks through Atlas. This foundation does not yet constitute server-side AI quota enforcement.

## Canonical access state

`AtlasAccess` is the product-level access resolver above `AtlasAccount`. `AtlasAccount` continues to own identity and raw server entitlement state; `AtlasAccess` converts that into one semantic access contract for Atlas, Compass and Arcade. Product surfaces should consume `AtlasAccess` capabilities rather than inspect Supabase state or `plan_code`.

The canonical tiers are `anonymous`, `free` and future `pro`. The shared capability vocabulary currently covers durable saving, learner creation, subject creation, subject editing, AI-assisted creation and access to the account library. AI creation also carries a normalized creation-allowance state (`available`, `limited`, `exhausted`, `blocked` or `unknown`) so future quota policy can evolve without changing feature call sites.

Anonymous access resolves locally with all account-owned capabilities blocked. A stored signed-in session upgrades through `AtlasCloud` → `AtlasAccount` → `AtlasAccess`; anonymous visitors do not load the Supabase/auth stack merely to resolve the anonymous tier. While an authenticated account is still resolving entitlement state, or if that entitlement read fails, Atlas preserves authenticated identity but keeps access not-ready and capability checks fail closed rather than misclassifying the tutor as anonymous.

`atlas-access-bootstrap.js` makes this state available through the shared content-registry seam across the Atlas gateway, Compass hub and subjects, and Arcade hub and games. Batch 2.1 establishes state only: shared account gates, return-to-intent and feature-level interception are later Stage 2 responsibilities.

The executable state proof lives at `tests/atlas-access-contract.test.js` and can be run with `node tests/atlas-access-contract.test.js`. It covers anonymous → Free, account switching through a resolving state, entitlement-read failure, simulated future Pro allowance state and sign-out back to anonymous.

## Shared account gate foundation

`AtlasAccountGate` is the reusable account-entry UI above `AtlasAccess` and `AtlasAccount`. It owns the shared sign-in/create-account dialog, password-reset entry, email-confirmation success state and the compact signed-in account menu. The account menu exposes private identity only on demand (email, Free/Pro status, account settings and sign out) rather than placing tutor identity permanently in teaching chrome.

Anonymous product surfaces remain lightweight. `AtlasAccessBootstrap.prepareAccount()` upgrades the anonymous access runtime into the existing `AtlasCloud` → `AtlasAccount` → `AtlasAccess` stack only when the tutor deliberately opens account UI. The gate does not duplicate Supabase or account lifecycle logic.

Batch 2.2A establishes the shared account UI contract only. Header placement and cross-world lifecycle proof belong to Batch 2.2B; return-to-intent belongs to Batch 2.3; protected-action interception belongs to Batch 2.4. The executable foundation proof lives at `tests/atlas-account-gate-contract.test.js`.

Batch 2.2B places that contract into the public product without contaminating teaching canvases. Atlas, Compass and Arcade hubs receive one shared right-side account control: anonymous tutors see **Sign in**; authenticated tutors see a compact account icon opening the shared account menu. Atlas's pilot feedback button is removed from the prime desktop header slot while the secondary mobile-drawer contact remains available. Inside Atlas exposes **Explore Atlas**, **Sign in** and **Create free account** when anonymous, collapsing to Explore Atlas plus the account control when authenticated. Subject and game surfaces receive no promotional account chrome. The executable placement/state proof lives at `tests/atlas-account-chrome-contract.test.js`.

Return-to-intent is still intentionally deferred to Batch 2.3, and capability-driven protected-action interception remains Batch 2.4.

## Return-to-intent foundation

`AtlasReturnIntent` is the canonical temporary contract for preserving what an anonymous tutor meant to do before authentication interrupted them. Each intent receives an opaque ID and stores only a supported action type, a normalized same-origin Atlas destination, small JSON-safe context, creation time and expiry. The destination is persisted as a relative path/query/hash rather than an arbitrary absolute redirect URL. Account routes are rejected as return destinations so an auth round-trip cannot loop back into the account surface.

Return intents are stored independently by ID in browser-local storage so separate tabs do not overwrite one another and a confirmation email opened in another same-browser tab can recover the exact intent. If localStorage is unavailable, the runtime can preserve same-page intent state in memory but makes no claim of cross-tab durability. Intents expire after 24 hours by default, cannot live longer than seven days, reject oversized or non-plain context, validate again when read, and are consume-once when the later resume layer chooses to consume them. Tampered, malformed and expired records fail closed and are removed.

Batch 2.3A establishes storage and validation only. It does not wire the account gate, add auth callback/query parameters, navigate to destinations or intercept protected features. Same-page authentication resume belongs to Batch 2.3B; confirmation/deep-link handoff belongs to Batch 2.3C; feature actions begin creating return intents in Batch 2.4. The executable contract proof lives at `tests/atlas-return-intent-contract.test.js`.

## Browser persistence trust

`AtlasPersistenceTrust` complements database RLS at the browser boundary. Generic Atlas browser projections and local working-state keys are scoped to either a specific authenticated account or the signed-out/local workspace. When account identity changes, Atlas stashes the outgoing scope, restores the incoming scope and clears transient tab/session state before publishing the new account state. This prevents Account A learner/cache/draft projections from becoming visible to Account B while preserving deliberately local anonymous work and account-local drafts.

Existing cloud authorities retain their own server-authoritative recovery behavior. Background persistence failures emit explicit cloud-error events; `AtlasPersistenceTrust` normalizes them into `atlas:persistence-failure` for observability and adds a visible failure message for learner writes that previously only emitted an event. Direct My Subjects/My Versions actions continue to throw on failed cloud writes rather than silently falling back to local storage.

## Backup and data ownership

Signed-in manual backups use **Atlas Backup v3**. Durable account-owned data is read from canonical Supabase/cloud authority state at export time rather than trusting browser projections. The package includes learner records and Session Subjects, named-learner and Shared teaching continuity, My Subjects and library state, My Versions, Atlas Original curation, and Hub personalization. Deliberately local authoring working drafts and a small set of cosmetic preferences are included separately under the backup workspace section.

Transient runtime state is intentionally excluded: active learner/tab selection, live manipulation, Wrap Up drafts, pending-delete undo journals, generation checkpoints/build state, catalog projections, launch URLs, auth tokens, entitlement/plan state and other server-controlled access data. The package is validated before download. Manual export is an account data-ownership feature and is not a Pro capability.

Signed-out browser-local export remains on the legacy v2 path until the anonymous/public access architecture is rebuilt.

### Backup v3 restore

Backup v3 restore is an authenticated recovery/import operation, not a database replacement tool. Atlas previews the package against the destination account first. Stable entity IDs remain strict: an existing learner, learner-continuity record, My Subject or My Version with the same stable ID blocks the restore rather than being overwritten. A same-ID My Subjects category with a different name is also an explicit conflict.

A destination account does **not** need to be empty. Account-level singleton state is merged transactionally with destination values taking precedence on overlap: My Subjects library/order and placement, Shared teaching continuity, Atlas Original curation, and Hub personalization/favourites. Source-only state is added; unrelated destination state is preserved. A second import of the same backup is therefore blocked by the stable entities created by the first import rather than silently duplicating or replacing them.

A conflict-free durable restore is applied inside one `atlas_restore_v3` PostgreSQL transaction under the signed-in user's RLS identity. The backup source account is provenance only: data may be reconstructed into a different Atlas account, but auth identity, plan and entitlement state never transfer. My Subject identity is therefore account-scoped as `(owner_user_id, id)` rather than globally keyed by subject ID.

Local working drafts use the same stable-ID conflict rule. Ordinary portable preferences are destination-preserving: existing destination preferences and per-session appearance values win where both sides have a value, while source-only appearance entries can be added. Local restore writes are rolled back if the durable transaction fails. If the destination already contains meaningful Atlas data, the client downloads a safety Backup v3 before applying the restore.

## Stage 1 trust contract

Stage 1 establishes the durable account boundary Atlas relies on before public access work begins:

- Auth identity is centralized behind `AtlasAccount`; confirmation and recovery return to the permanent `/account/` route.
- RLS protects every durable account-owned table, while the browser projection boundary prevents same-browser account leakage.
- Durable write failures are observable and user-visible where the action matters; Atlas does not silently pretend an account save succeeded.
- Manual Backup v3 export reads canonical cloud truth and remains available as a basic data-ownership feature.
- Backup v3 restore is validated, previewed, transaction-scoped and destination-preserving: stable-ID collisions block, unrelated destination data survives, and account-level singleton state merges rather than requiring an empty account.
- Auth credentials, entitlement/plan state and transient lesson/runtime state are outside the backup/restore contract.

## Supabase migrations

Files in `supabase/migrations/` are the permanent database blueprint/history. They are **not** runtime scripts and are not automatically executed by GitHub. A migration becomes live only when its SQL is applied to Supabase, either manually or through the Supabase migration tooling.

Saved queries in the Supabase SQL Editor are optional convenience copies and are not the source of truth. The source-controlled migration files are the canonical schema history; the live Supabase schema is the deployed database truth.

## Database access boundary

Durable account tables are RLS-protected. The ordinary Atlas product-state tables expose only `SELECT`, `INSERT`, `UPDATE` and `DELETE` to authenticated Atlas clients. `account_entitlements` is stricter: authenticated clients receive `SELECT` only, with server/admin infrastructure retaining mutation authority. Anonymous clients have no durable account-table access. Broad default browser-role table grants are disabled for future Atlas migrations, and the `rls_auto_enable` event-trigger helper remains only as an internal DDL safety net rather than an exposed RPC.

The `atlas_restore_v3` recovery function is `SECURITY INVOKER`, executable only by authenticated clients, and writes only through the caller's normal RLS identity. It is not an admin bypass.

## Auth hardening

Production email/password accounts require a minimum password length of 8 characters and email confirmation. `https://atlasfortutors.com/account/` is an allowed auth redirect. Supabase leaked-password checking is not enabled because that hosted Auth feature is unavailable on the current Free project; enable it if the infrastructure tier later supports it. Auth email currently uses Supabase's default mail service, so custom SMTP remains a public-launch hardening task rather than part of the account runtime.

## Legacy data migration

Production Atlas does not automatically claim pre-account browser-local tutor data into a signed-in account. Signed-in durable state is cloud-authoritative. If a legacy tutor later needs an import, build and run a deliberate one-off migration/import flow rather than restoring the old staged migration runtime.

## Working principle

Keep durable state authority explicit, keep transient browser state local, and avoid UI rendering that mutates persistence as a side effect. Database changes should be additive, reviewable migrations rather than edits to old migration history.

## Runtime organization

Shared production modules use canonical single-entry files rather than wrapper/core/sync chains. `atlas-content-registry.js`, `atlas-session-panel.js`, and `atlas-tutor-content-cloud-authority.js` each own their complete runtime behavior. Compass background and cross-module repaint requests flow through the coalesced `atlas:compass-hub-refresh-request` boundary; rendering itself stays read-only.
