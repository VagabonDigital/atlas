# Atlas

Atlas is a tutor-first English teaching workspace built around three connected product worlds:

- **Atlas** — gateway, learner continuity, account state and cross-product navigation.
- **Compass** — tutor-owned subjects, Atlas Originals and the shared teaching runtime.
- **Arcade** — lesson games, current public game runtimes and the developing Engine One architecture.

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
| `arcade/` | Arcade hub, current public games and Engine One engineering. |
| `memory/` | Learner Memory surface. |
| `pricing/` | Public Atlas pricing and Pro entry. |
| `tutors/` | **Inside Atlas** public acquisition/product explanation. The folder name is historical. `tutors/admin.html` is the internal Atlas Inbox and is not conceptually part of Inside Atlas. |
| `shared/` | Cross-product browser runtime, account/access, persistence, subject-build, navigation and UI modules. It currently also contains the backend Worker source at `shared/worker.js`. |
| `assets/` | Shared product, branding and Atlas Original media. |
| `tests/` | Root Atlas regression and source-contract tests. |
| `scripts/` | Repository tooling, including the root test runner and Compass cover projection check. |
| `supabase/migrations/` | Source-controlled Atlas database evolution files. See `supabase/README.md`. |
| `prototypes/` | Retained design studies/provenance; not production runtime. |
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

Arcade currently contains two valid generations at once:

1. the current bespoke public games;
2. the developing **Engine One / Shared Plan** architecture.

Engine One engineering includes definitions, frozen revisions, deterministic harnesses, a development workbench and a separate test package. Do not reorganize the public games merely to make the transition look cleaner before Engine One is ready to replace them.

## Testing

Root Atlas has one canonical verification entry point.

```bash
npm test
npm run check:compass-covers
npm run verify
```

### `npm test`

Runs every root `tests/*.test.js` file independently.

The suite contains historical source-shape contracts as well as current runtime/VM regressions. When permanent CI was introduced, 38 historical contracts were already failing against current product source. Those were recorded explicitly in `tests/known-failing-contracts.json`; one has since been repaired, leaving **37 known historical failures**.

Those tests are **still executed**. CI behaves as follows:

- a new failure outside the baseline fails CI;
- a quarantined historical failure remains visible but does not fail normal CI;
- a quarantined test that starts passing fails CI until it is removed from the baseline;
- `npm run test:strict` treats all failures as blocking.

The quarantine is a migration aid, not permission to add new failing tests.

### Compass cover check

```bash
npm run check:compass-covers
```

verifies that shared Compass catalog cover metadata matches the canonical Original subject definitions.

### Arcade tests

Arcade owns a separate Node package:

```bash
cd arcade
npm ci
npm test
npm run test:browser
```

The permanent GitHub workflow runs Arcade's Node suite. Browser tests remain a separate explicit command.

### CI

`.github/workflows/atlas-tests.yml` runs on pull requests and pushes to `main`.

It currently provides:

- **Atlas root verification** — syntax checks, the complete baseline-aware root suite and Compass cover drift verification;
- **Arcade node tests** — the Engine One Node regression suite.

Historical SharedWorker Batch 1–6 workflows have been retired. Their final integration coverage is contained in the permanent root suite.

## Deployment

Atlas has **two distinct deployment boundaries**. Do not conflate them.

### Public Atlas web application

`wrangler.jsonc` configures the static Atlas Worker named `atlas`.

The static asset directory remains the repository root:

```json
"assets": {
  "directory": ".",
  "html_handling": "auto-trailing-slash",
  "not_found_handling": "404-page"
}
```

`.assetsignore` is therefore an important production boundary. Repository-only material — tests, migrations, scripts, prototypes, backend source and Arcade development infrastructure — is excluded from the client-side asset upload.

Cloudflare's GitHub integration currently builds/deploys the public `atlas` Worker from changes on `main`. A successful repository push is still expected to pass the permanent GitHub CI checks as an independent regression signal.

There is also a byte-identical `wrangler.atlas-web.jsonc`. Its external deployment role has not yet been proven; do not delete it until that is verified.

### Atlas AI/backend Worker

Browser AI requests target:

`https://atlas-ai.savvy989.workers.dev`

The source-controlled backend implementation is:

`shared/worker.js`

It owns provider credentials, authenticated Atlas account verification, AI abuse guardrails, Paddle webhooks/customer-portal operations and server-side external-provider requests.

**The repository currently contains no GitHub Actions workflow that deploys this backend Worker.** Do not assume that editing `shared/worker.js` makes the production `atlas-ai` Worker current. Backend Worker deployment must be performed and verified through its actual Cloudflare deployment process.

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

## Deliberately deferred structural work

The repository audit identified legitimate future architecture opportunities that are **not** public-acquisition blockers:

- physically grouping the flat root `shared/` directory by domain;
- separating backend Worker source from browser-shared modules;
- splitting registry responsibility from runtime composition in `atlas-content-registry.js`;
- reducing root-runtime monkey-patch composition;
- consolidating analytics ownership;
- decomposing the large Compass hub/engine when real maintenance pressure justifies it;
- making Compass extension points explicit;
- clarifying Arcade's filesystem after Engine One begins replacing public game runtimes;
- separating Inside Atlas, product showcase assets and internal Inbox ownership currently under `tutors/`;
- grouping/renaming historical root tests by permanent product responsibility;
- replacing fragmented historical cache-version query strings with a deliberate cache strategy.

These are architecture projects, not repository-hygiene obligations.

## Working principle

**Preserve the architecture, remove the archaeology, strengthen operational boundaries, and keep the repository truthful about the product that actually exists.**
