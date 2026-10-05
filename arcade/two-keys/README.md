# Two Keys

Four complete two-player cooperative missions for Atlas Arcade. One authenticated
tutor owns the operation; one anonymous learner claims its private invitation.
Either person can take either puzzle role. Tutor controls manage the session,
not the other player's clues.

## Run locally

From the Atlas repository root, with Node.js 22 or newer:

```sh
npm ci --ignore-scripts --prefix arcade/two-keys/dev
npm start --prefix arcade/two-keys/dev
```

Open http://localhost:4175/arcade/two-keys/, choose a mission, and use **Invite your
partner** to open the other position in another browser tab or browser. Confirm
readiness in both positions. Keep your existing voice call open for normal play.

This loopback-only development server runs the real game handler and migration
against PGlite PostgreSQL. Its fixed local tutor identity is injected only by the
development server. Production HTML does not enable this bypass. Local state
survives server restarts in the ignored `dev/.local-db/` directory. Tests use
isolated databases. Neither local mode nor tests contact production Supabase.

## Architecture

- `app.mjs`, `game.css`, `index.html`, and `join.html`: responsive player surfaces.
  The learner entry loads no Atlas account, registry, search, or tutor chrome.
- `server/game.mjs`: seeded puzzles, commands, outcomes, and explicit private
  projections. Seeds, complete mappings, and partner clues never enter client
  assets or ordinary role projections. Authored rescue hints intentionally reveal
  a small connection when requested.
- `server/http.mjs`: Atlas tutor authentication, single learner seat, polling,
  idempotent commands, bounded request/receipt history, and revision-safe commits.
- `supabase/migrations/20261004202142_two_keys_sessions.sql`: private session
  storage and service-role-only RPCs. Browser roles have no table or RPC access.
- `scripts/build-atlas-ai-worker.js`: generates the game-local backend into the
  existing `shared/worker.js`, dispatched under `/two-keys/`. There is no new
  Worker, identity system, or general multiplayer service.
- Existing Arcade catalog/access/chrome/share conventions provide launch and
  invitation context. AtlasBridge stores exposure under the active Atlas session.
  It is not used as cross-device transport.

The backend owns seed selection, roles, stages, mistakes, final windows, and
success. Independent actions can proceed when the sender's own serial and
run/stage remain current; stale consequential commands are rejected. Database
revision checks serialize competing updates, including seat claims. Final
windows and partner presence are rechecked at commit time. A lost response is
retried with the same action ID. Visible progress is retained during reconnect;
controls pause while either position is offline. Invitations expire after six
hours. A disconnected learner seat can be replaced by the tutor with a new
invitation, invalidating the former credential.

## Missions and reciprocal exchanges

| Mission | Required exchange |
| --- | --- |
| The Glass Vault | Remote circuits identify physical doors; local dials change remote pressure readings; both seats release the vault. |
| The Black Gallery | Pulses connect transformed security nodes to landmarks; physical mirrors redirect remote beams; local shields determine remote emitter controls; blackout enables extraction. |
| Room Zero | Physical components produce remote signatures; remote fields reveal local alignment marks; physical coupling determines the remote energy path. |
| Midnight Express | Remote pulses reveal physical cargo correspondences; physical notches identify a remote candidate; local routing changes remote power/scans; extraction-point timing enables a coordinated release. |

All missions have authored focus, connection, and rescue hints, local mechanism
reset, new-seed restart, and shared resolution. Gallery and Express support
three-alert lockdown and Retry. There is no global countdown. Generous final
coordination windows last 15 seconds. Sound is optional and never carries a clue.

## Verification — 2026-10-05

```sh
npm test --prefix arcade/two-keys/dev
npm run build:atlas-ai-worker
npm run check:atlas-ai-worker
npm run verify
npm run check:compass-covers
```

The game suite passes all seven tests, including:

- 640 successful complete runs: four missions × 80 seeds × both role assignments.
- Deterministic repeatability and changed solutions across seeds.
- Private projections, role/owner restrictions, disconnect guards, stale input,
  duplicate input, lockdown/retry, assembly rejection, hints, and reset.
- Real PostgreSQL grants/RLS, competing anonymous seat claims, revision races,
  deadline rejection, persisted recovery, and expiration.
- The actual generated Atlas Worker dispatch, with its external authentication
  and RPC transport replaced by local fixtures; disallowed-origin rejection.

Browser verification used two live private positions against the real local
handler/database, operating visible controls rather than injecting solutions:

- All four missions reached shared success. Vault used tutor A / learner B;
  Gallery, Zero, and Express used swapped roles.
- Observed remote pulses, physical changes, mapped controls, incorrect actions,
  safe scan timing, final coordination, and mission-specific success feedback.
- Exercised role swap, both readiness controls, hints through rescue, Gallery
  lockdown, Retry, local reset, mission exit, Play Another, Finish, and reopen.
- Closed the learner tab, observed the partner-wait overlay and inert controls,
  then reopened the clean learner URL. The same mirror position and corresponding
  remote beam reading returned. Server restart/reload also retained progress.
- Inspected desktop 1365 × 900 and portrait 390 × 844 layouts, including physical
  and remote player surfaces. Checked viewport width against document width;
  no horizontal overflow in the inspected portrait states.
- Final exercised tutor and learner consoles contained no errors or warnings.
- Completed exposure indicators survived the six-hour session boundary through
  the existing Atlas active-session continuity record.

Evidence screenshots are in `dev/evidence/` (excluded from deployment):
`gallery-desktop.jpg`, `gallery-mobile.jpg`, and `mission-library.jpg`.

The generated Worker check and Compass cover check pass. Atlas root verification
reports **13 failures out of 91 files**, exactly matching a separate `npm test`
run on the untouched source checkout. No new failing file remains. The baseline
failures are:

```text
arcade-truth-trap-entry-state.test.js
atlas-account-management-5-1a.test.js
atlas-account-management-feedback-5-1a.test.js
atlas-account-message-entry-5-1a.test.js
atlas-acquisition-gate-polish-5-1a.test.js
atlas-anonymous-gateway-3-1.test.js
atlas-capability-wiring-2-4b.test.js
atlas-compass-presentation-prewarm.test.js
atlas-confirmation-return-journey-5-1a.test.js
atlas-fresh-subject-entry-fast.test.js
atlas-google-auth-contract.test.js
atlas-signup-continuation-ux-5-1a.test.js
forbidden-words.test.js
```

This is ready for human pair evaluation of pacing, perceived difficulty, role
balance, and enjoyment. Automated solves and one operator exercising both browser
positions do not establish the native-pair enjoyment or average-duration targets.
The four reciprocal mechanics and private information boundaries are preserved;
no product-rule change was needed.

## Release boundary

This build is source-integrated and locally verified, **not deployed**. Apply the
new migration through Atlas's existing database release process, regenerate and
publish the existing Worker, and publish the static assets through the existing
Atlas release process. Existing Atlas authentication and Supabase service-role
configuration are reused. Never deploy `dev/` or `server/` as public static
assets; `.assetsignore` excludes both. No service credential belongs in the
frontend. Real hosted authentication and cross-device Internet latency remain
post-deployment smoke checks.

## Visual assets

The supplied product-interaction and world-atmosphere references guided the
midnight/charcoal architecture, cyan system light, gold payoff, and tangible
mechanisms. All game labels, clues, controls, and animation are live HTML/CSS/SVG,
not text baked into images.

Five original raster environments were generated using the built-in imagegen
tool. No external stock image was used. Prompt design summaries:

- `museum.png`: private glass/concrete museum at night, reflecting courtyard,
  gold containment to the right, negative space to the left, no people or text.
- `vault.png`: precision glass vault, layered recesses, central empty plinth,
  blank steel console foreground, deep blue and gold light.
- `gallery.png`: private black-marble gallery, empty lower floor, side columns,
  distant amber display, no foreground sculptures or laser puzzle elements.
- `zero.png`: secret research chamber, empty brushed-metal workbench foreground,
  sealed circular door, cool blue and amber lighting.
- `express.png`: midnight luxury train cargo interior, walnut and gunmetal,
  night-streaked side windows, empty wall for live compartments.

The generated assets were inspected individually and in the running interfaces.
