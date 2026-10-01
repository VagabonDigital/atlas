# Forbidden Words

Two players, private cards, two continuous 60-second turns per round. The canonical
product specification supplied for this build is `GAME.md` in the handoff workspace.

## Ownership

- `index.html`, `join.html`, `app.mjs`, `game.css`: tutor and sealed learner views.
- `server/cards.mjs`: 141 learner-appropriate cards; never served as a static asset.
- `server/game.mjs`: rules, role changes, timing, scoring and explicit role projections.
- `server/http.mjs`: this game's HTTP transport and seat authorization.
- `dev/`: local PostgreSQL-backed verification, isolated from deployed runtime.
- `shared/worker.js`: the existing Atlas backend dispatches `/forbidden-words/*` and
  supplies its existing authenticated-account verifier. It does not contain game rules.
- `supabase/migrations/20261001201937_forbidden_words_sessions.sql`: private storage,
  owner creation quota, revision-based atomic commits and database clock.

Existing Arcade chrome, catalog, access/sign-in and scoped resource-share URL building
remain their existing owners. The learner page loads no tutor workspace/navigation code.
The generic resource share grant is not treated as session authorization.

## Session contract

The tutor is authorized through the existing Atlas Supabase account verification.
The invite carries 256 random bits in the URL fragment, not a query parameter. The
first learner claims the seat with a separate 256-bit browser credential. Only its
SHA-256 hash is persisted as the seat identity. An invite cannot claim a second seat.
Retrying a claim with the same credential is safe. A tutor may replace a lost learner
seat between turns or while paused, rotating the invitation and revoking the old seat.

All browser commands go through the backend. The table and RPC functions have no
`anon`, `authenticated`, or PUBLIC read/write/execute grants. RLS is enabled. The
service role is only used on the backend. State responses are explicit allow-lists:
the Guesser gets a random card nonce, never deck order, a card index, target, forbidden
words, future cards, credential hashes or unresolved history. Correct target feedback
is safe to reveal; unresolved cards are only included after the round.

Every request reads database time and the current revision. The Worker applies the
game command, then commits only if the revision is unchanged. Conflicts reload and
retry. Correct/Skip/Oops additionally require that the deadline has not passed at the
database commit. Card nonces prevent stale clicks from resolving the next card; bounded
command receipts make ambiguous network retries idempotent. Commands carry round and
turn scope so delayed controls cannot affect later turns.
Creation is idempotent
for the requested session ID and owner. Per-seat request budgets are persisted, so
they work across Worker isolates. Creation allows three unfinished sessions and at
most twenty retained sessions per owner.

A turn starts at database time + 3 seconds and ends exactly 60 seconds later. Clients
render from that deadline and a measured server-time offset. Polling every 650 ms
synchronizes scores and roles; timer rendering is local and continuous. A paused turn
stores remaining duration. Disconnection does not reset or silently pause the clock.
Browser actions disable while connection is stale; uncertain commands retry with the
same ID. Reload restores the same seat, card, score and deadline. Expired/revoked seats
show an entry error rather than keeping an actionable stale board. Poll failures back
off to five seconds. Both players must mark ready for turn two; reconnecting completes
that readiness handshake if both already marked ready.

Sessions expire after six hours. Expired records are inaccessible and are removed on
subsequent session creation. There is no fixed round limit. Best score covers completed
rounds in this session. The final unresolved card can be credited once by its previous
Describer until the next turn/round begins. Finish ends play for both seats.

## Local verification

From the repository root:

```sh
npm ci --ignore-scripts --prefix arcade/forbidden-words/dev
npm run verify
npm test --prefix arcade/forbidden-words/dev
npm start --prefix arcade/forbidden-words/dev
```

Open `http://localhost:4173/arcade/forbidden-words/` and use its learner link in a second
tab. `PORT` changes the local port. This server binds loopback only. It uses the real
game handler and real PostgreSQL functions through PGlite, with a local-only identity
stub. It does **not** contact or modify production. Its HTML metadata selects the local
API and verification identity; those tags do not exist in the production HTML.
The local database is in-memory by default. Set `FW_DEV_DATABASE` to a local directory
to verify persistence across a dev-server restart. Never commit that directory.

The root rule tests cover timing, role projections, resolution, idempotence, scoring,
pause, late credit, results, review and alternating starts. The integration test runs
the actual migration and checks PostgreSQL grants/RLS, concurrent duplicate commands,
seat claims, recovery, role reversal, deadline rejection and expiry. It also dispatches
through the actual Atlas Worker with a mocked external HTTP transport backed by the
same isolated database. CI runs both the root suite and the integration suite.

Browser verification performed during this build: tutor landing and learner entry;
three-second countdown; both real-time 60-second turns; Correct/Skip/Oops with a
continuous clock; concealed Guesser cards in both role assignments; shared score;
Pause/Resume; role readiness; optional final-card credit; results and unresolved review;
replay starting-player alternation; Finish; learner reload recovery; desktop and
390 × 844 learner layouts. No speech recognition or actual lesson audio adjudication
is involved. Browser inspection is not a claim of human-pair lesson playtesting.

## Release boundary

This implementation is not deployed by merely changing the repository.

1. Apply the new migration through Atlas's intentional Supabase migration process.
   Do not change an applied migration. Run database advisors and verify the grants.
2. Run `npm run build:atlas-ai-worker`, then replace the code in the existing
   `atlas-ai` backend Worker with the complete generated `shared/worker.cloudflare.js`.
   Existing bindings, variables and secrets remain unchanged. No new Worker, service,
   binding or secret is required.
3. Publish the static Atlas application, including the catalog entry. Preserve the
   `.assetsignore` exclusions for `server/`, `dev/`, migration sources and dependencies.
4. On the deployed origins, smoke-test authenticated tutor creation and anonymous
   learner claim on separate devices. Confirm that direct HTTP requests to the card
   source/server paths return no source, and that role-specific API responses remain
   private. Check production latency and reconnect behavior over ordinary lesson networks.

Production migration application, backend deployment and live authenticated smoke tests
were not performed as part of the local implementation verification.

The persisted deck references card indices. Keep existing card order stable when
updating the deck while sessions remain active; append new cards rather than reordering.
