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
- `supabase/migrations/` — canonical, source-controlled history of Atlas database schema changes.

## Persistence model

Atlas JavaScript running in the browser communicates directly with the Supabase backend. Supabase provides authentication, the Postgres database and the API boundary used by Atlas.

For signed-in tutors, durable account-owned state is stored in Supabase, including My Subjects, My Versions, learner records, Session Subjects, curation, hub personalization and teaching continuity. Browser storage remains appropriate for deliberately local or transient state such as the active learner tab/session, working drafts, short-lived undo state and cosmetic preferences.

## Account lifecycle and entitlements

`AtlasCloud` owns the shared Supabase browser client. `AtlasAccountCloud` contains Supabase-specific account lifecycle operations and entitlement reads. `AtlasAccount` is the product-facing account contract used by Atlas surfaces.

Email/password signup requires email confirmation. Signup confirmation and password-recovery links return to `/account/`, which handles normal sign-in, account creation and recovery states without introducing a separate auth product.

`account_entitlements` is the minimal server-owned foundation for future Free/Pro capability state. Authenticated browser clients can read only their own entitlement row; they cannot mutate entitlement data. A missing row intentionally means the Free baseline. Product code should consume capability-shaped account APIs rather than scatter `plan === 'pro'` checks through Atlas. This foundation does not yet constitute server-side AI quota enforcement.

## Supabase migrations

Files in `supabase/migrations/` are the permanent database blueprint/history. They are **not** runtime scripts and are not automatically executed by GitHub. A migration becomes live only when its SQL is applied to Supabase, either manually or through the Supabase migration tooling.

Saved queries in the Supabase SQL Editor are optional convenience copies and are not the source of truth. The source-controlled migration files are the canonical schema history; the live Supabase schema is the deployed database truth.

## Database access boundary

Durable account tables are RLS-protected. The ordinary Atlas product-state tables expose only `SELECT`, `INSERT`, `UPDATE` and `DELETE` to authenticated Atlas clients. `account_entitlements` is stricter: authenticated clients receive `SELECT` only, with server/admin infrastructure retaining mutation authority. Anonymous clients have no durable account-table access. Broad default browser-role table grants are disabled for future Atlas migrations, and the `rls_auto_enable` event-trigger helper remains only as an internal DDL safety net rather than an exposed RPC.

## Auth hardening

Production email/password accounts require a minimum password length of 8 characters and email confirmation. `https://atlasfortutors.com/account/` is an allowed auth redirect. Supabase leaked-password checking is not enabled because that hosted Auth feature is unavailable on the current Free project; enable it if the infrastructure tier later supports it. Auth email currently uses Supabase's default mail service, so custom SMTP remains a public-launch hardening task rather than part of the account runtime.

## Legacy data migration

Production Atlas does not automatically claim pre-account browser-local tutor data into a signed-in account. Signed-in durable state is cloud-authoritative. If a legacy tutor later needs an import, build and run a deliberate one-off migration/import flow rather than restoring the old staged migration runtime.

## Working principle

Keep durable state authority explicit, keep transient browser state local, and avoid UI rendering that mutates persistence as a side effect. Database changes should be additive, reviewable migrations rather than edits to old migration history.

## Runtime organization

Shared production modules use canonical single-entry files rather than wrapper/core/sync chains. `atlas-content-registry.js`, `atlas-session-panel.js`, and `atlas-tutor-content-cloud-authority.js` each own their complete runtime behavior. Compass background and cross-module repaint requests flow through the coalesced `atlas:compass-hub-refresh-request` boundary; rendering itself stays read-only.
