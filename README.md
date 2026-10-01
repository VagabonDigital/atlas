# Atlas

Atlas is a tutor-first English teaching workspace built around three connected product worlds:

- **Atlas** — gateway, learner continuity, account state and cross-product navigation.
- **Compass** — tutor-owned subjects, Atlas Originals and the shared teaching runtime.
- **Arcade** — lesson games, the Arcade hub and current public game runtimes.

The core product loop is **Create → Shape → Teach → Continuity**. Repository structure should support that loop without making tutors or developers reason about historical implementation stages.

## Repository map

| Path | Current responsibility |
| --- | --- |
| `index.html` | Atlas gateway / workspace entry. |
| `account/` | Account lifecycle: sign in, signup, confirmation, recovery and account management. |
| `account/subscription/` | Subscription and billing-management surface. |
| `compass/` | Compass hub, Atlas Originals and owned/generated subject entry. |
| `compass/subject/` | Generic owned/generated subject runtime route. |
| `compass/shared/` | Compass-shared teaching runtime and presentation infrastructure. |
| `arcade/` | Arcade hub, shared game chrome/access and current public game runtimes. |
| `memory/` | Learner Memory surface. |
| `pricing/` | Public Atlas pricing and Pro entry. |
| `inside-atlas/` | **Inside Atlas** public acquisition/product explanation. |
| `admin/` | Internal Atlas administration surface; currently hosts the Atlas Inbox. Privileged backend operations remain authorization-protected independently of this public route. |
| `shared/` | Cross-product browser runtime, account/access, persistence, subject-build, navigation and UI modules. It currently also contains the backend Worker source at `shared/worker.js`. |
| `assets/` | Shared product, branding and Atlas Original media. |
| `tests/` | Root Atlas regression and source-contract tests. |
| `scripts/` | Repository tooling, including the root test runner and Compass cover projection check. |
| `supabase/migrations/` | Source-controlled Atlas database evolution files. See `supabase/README.md`. |
| `.github/workflows/` | Permanent repository CI. |

## Runtime architecture

### Account, access and capabilities

`AtlasCloud` owns the shared Supabase browser client. `AtlasAccountCloud` owns Supabase-specific account operations. `AtlasAccount` exposes product-facing identity and entitlement state.

`AtlasAccess` resolves that state into product capabilities used by Atlas, Compass and Arcade. Product code should consume capability state rather than scatter plan-string checks through the application.

Anonymous access remains local/lightweight. Signed-in durable account state is cloud-authoritative.

### Durable and local state

Supabase owns durable signed-in account data, including:

- My Subjects;
- My Versions;
- learner records and Session Subjects;
- Atlas Original curation;
- hub personalization;
- learner/shared teaching continuity;
- entitlement and server-owned commercial state.

Browser storage is appropriate for deliberately local or transient state such as:

- active learner/tab state;
- working drafts;
- short-lived undo/recovery state;
- transient generation checkpoints;
- cosmetic preferences.

`AtlasPersistenceTrust` scopes browser projections so local state from one account is not presented as another account's state.

### Subject generation

Fresh AI subject generation uses a SharedWorker-based build architecture with:

- Web Locks for single-writer coordination;
- IndexedDB checkpoints;
- BroadcastChannel/storage signaling;
- resurrection/reconnect behavior;
- durable owned-subject persistence.

This complexity is intentional. The subject-build regression family protects failure modes such as navigation during generation, worker death/recreation, cross-tab coordination and later resume.

### Compass

Each Atlas Original keeps canonical subject content in:

`compass/<subject>/subject-data.js`

The generic owned/generated subject route lives at:

`compass/subject/`

`scripts/sync-compass-covers.js` projects canonical Original cover metadata into the shared Compass catalog so hubs do not need to load every subject definition.

### Arcade

Arcade currently ships the hub plus bespoke public game runtimes. Shared Arcade infrastructure lives under `arcade/shared/`, while canonical game catalog metadata lives in `shared/arcade-catalog-data.js`.

New games should follow the current Arcade product and production direction rather than a retained generalized engine layer.

Forbidden Words keeps its browser UI, card pool and game rules in `arcade/forbidden-words/`.
Its `server/` modules run only inside the existing Atlas backend Worker, which dispatches
`/forbidden-words/*` through the existing account-verification boundary. Supabase owns the
private session records and atomic revision commits; anonymous learners receive a scoped,
claimed seat credential, never account access. Server modules and `dev/` verification tools
are excluded from static deployment. See `arcade/forbidden-words/README.md` for verification
and the separate database/backend/frontend release steps.

## Testing

Root Atlas has one canonical verification entry point.

```bash
npm test
npm run check:compass-covers
npm run verify
```

### `npm test`

Runs every root `tests/*.test.js` file independently.

The suite contains historical source-shape contracts as well as current runtime/VM regressions. Every discovered root test is blocking: any test failure makes `npm test` exit non-zero and fails CI.

There is no known-failure quarantine and no separate strict mode. A green root test run means the complete root suite passed.

### Compass cover check

```bash
npm run check:compass-covers
```

verifies that shared Compass catalog cover metadata matches the canonical Original subject definitions.


### CI

`.github/workflows/atlas-tests.yml` runs on pull requests and pushes to `main`.

It currently provides:

- **Atlas root verification** — syntax checks, the complete baseline-aware root suite and Compass cover drift verification;

Historical SharedWorker Batch 1–6 workflows have been retired. Their final integration coverage is contained in the permanent root suite.

## Deployment

Atlas has **two distinct deployment boundaries**. Do not conflate them.

### Public Atlas web application

`wrangler.atlas-web.jsonc` is the canonical configuration for the static Atlas Worker named `atlas`.

The static asset directory remains the repository root:

```json
"assets": {
  "directory": ".",
  "html_handling": "auto-trailing-slash",
  "not_found_handling": "404-page"
}
```

`.assetsignore` is therefore an important production boundary. Repository-only material — tests, migrations, scripts and backend source — is excluded from the client-side asset upload.

Cloudflare's GitHub integration currently builds/deploys the public `atlas` Worker from changes on `main`. A successful repository push is still expected to pass the permanent GitHub CI checks as an independent regression signal.

Cloudflare's production deploy and version commands explicitly use `wrangler.atlas-web.jsonc`; keep that filename aligned with the external build configuration.

### Atlas AI/backend Worker

Browser AI requests target:

`https://atlas-ai.savvy989.workers.dev`

The source-controlled backend implementation is:

`shared/worker.js`

That file is also the exact single-file payload used by the existing manual Cloudflare
code-editor workflow. Game-specific backend modules remain with their games for ownership,
testing and maintenance; `npm run build:atlas-ai-worker` refreshes the generated Forbidden
Words section inside `shared/worker.js` before deployment. This preserves one obvious Worker
file while keeping game logic maintainable in its owning game directory.

Despite its physical location under `shared/`, `shared/worker.js` is backend source, not
browser-shared runtime, and is explicitly excluded from the static asset deployment.

It owns provider credentials, authenticated Atlas account verification, AI abuse guardrails, Paddle webhooks/customer-portal operations and server-side external-provider requests.

**The repository currently contains no GitHub Actions workflow that deploys this backend Worker.** Do not assume that editing backend source makes the production `atlas-ai` Worker current. Before a manual Cloudflare deployment, run `npm run build:atlas-ai-worker`, then copy the complete contents of `shared/worker.js` into the existing `atlas-ai` Worker and deploy without changing its existing bindings, variables or secrets. `npm run verify` fails if the generated Forbidden Words section is stale.

The physical location/name of `shared/worker.js` is historical and may be improved in a future backend-architecture pass. Do not move it as routine repository hygiene.

## Supabase and database changes

Atlas browser code communicates with Supabase for authentication and durable account-owned data. Server-only operations use protected backend boundaries.

Read `supabase/README.md` before changing database structure.

Key rule:

> **Once a migration has been applied to production, its source file is immutable. Any correction or extension becomes a new migration.**

The existing numbered migration directory and the historical production Supabase migration ledger do not map one-to-one because some earlier source files were curated after deployment. The repository audit found the relevant inspected production tables/functions present; do not rewrite production history merely to make the two ledgers visually identical.

No current GitHub workflow automatically applies `supabase/migrations/` to production.

## Backup and data ownership

Signed-in manual backups use Atlas Backup v3 and read durable account-owned data from canonical cloud authorities.

Backup/restore intentionally excludes authentication credentials, plan/entitlement ownership and transient runtime state. Restore is an authenticated import/merge operation with stable-ID conflict protection; it is not a database replacement mechanism.

Signed-out browser-local export remains a separate legacy/local path.

## Repository operating principles

When changing Atlas:

1. **Re-read current `main` before editing.** Multiple product changes can land concurrently.
2. **Preserve runtime evidence over source appearance.** A strange-looking file can still be active.
3. **Run `npm run verify` before trusting a root-runtime change.**
4. **Keep browser runtime, backend runtime and database authority explicit.**
5. **Do not edit an applied Supabase migration.**
6. **Do not add product runtime dependencies under paths excluded by `.assetsignore`.**
7. **Prefer small reversible commits over broad cleanup/refactor bundles.**
8. **Do not reorganize architecture merely to reduce file count or make the tree symmetrical.**

## Repository structure guardrails

Keep repository structure aligned to stable ownership rather than temporary implementation stages:

1. Top-level directories should represent durable product surfaces or infrastructure responsibilities, not experiments or one-off tasks.
2. Product-local shared code belongs with that product (for example, `compass/shared/` or `arcade/shared/`). Only genuinely cross-product browser runtime belongs in root `shared/`.
3. Public route directories are product interfaces as well as filesystem structure. Do not move or rename them for neatness without treating the URL change as a migration.
4. New experiments, generated evidence and temporary tooling should not become permanent architecture unless they acquire an ongoing responsibility.
5. When ownership materially changes, update this repository map in the same change so the README continues to describe current `main`.

## Deliberately deferred structural work

The repository audit identified legitimate future architecture opportunities that are **not** public-acquisition blockers:

- physically grouping the flat root `shared/` directory by domain;
- separating backend Worker source from browser-shared modules;
- splitting registry responsibility from runtime composition in `atlas-content-registry.js`;
- reducing root-runtime monkey-patch composition;
- consolidating analytics ownership;
- decomposing the large Compass hub/engine when real maintenance pressure justifies it;
- making Compass extension points explicit;
- grouping/renaming historical root tests by permanent product responsibility;
- replacing fragmented historical cache-version query strings with a deliberate cache strategy.

These are architecture projects, not repository-hygiene obligations.

## Working principle

**Preserve the architecture, remove the archaeology, strengthen operational boundaries, and keep the repository truthful about the product that actually exists.**
