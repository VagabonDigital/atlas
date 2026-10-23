# Forbidden Words

Two players, private cards, two continuous 60-second turns per round. The canonical
product specification supplied for this build is `GAME.md` in the handoff workspace.

## Ownership

- `index.html`, `join.html`, `app.mjs`, `game.css`: tutor and sealed learner views.
- `server/cards.mjs`: 141 learner-appropriate cards; never served as a static asset.
- `server/game.mjs`: rules, role changes, timing, scoring and explicit role projections.
- `server/http.mjs`: this game's existing HTTP transport and seat authorization.
- `server/live-room.mjs`: authoritative Durable Object, durable game state,
  private hibernating WebSockets and one-use connection tickets.
- `server/live-http.mjs`: staged, gated Worker transport enforcing authentic
  tutor identity, existing cross-game quotas and approved WebSocket origins.
- `dev/`: local PostgreSQL-backed verification, isolated from deployed runtime.
- `shared/worker.js`: the existing Atlas backend dispatches `/forbidden-words/*` and
  supplies its existing authenticated-account verifier. It does not contain game rules.
- `supabase/migrations/20261001201937_forbidden_words_sessions.sql`: private storage,
  owner creation quota, revision-based atomic commits and database clock.

Existing Arcade chrome, catalog, access/sign-in and scoped resource-share URL building
remain their existing owners. The learner page loads no tutor workspace/navigation code.
The generic resource share grant is not treated as session authorization.

## Live-room backend (Batches 2–3, not deployed)

The backend source now includes `ForbiddenWordsLiveRoom`, generated into the
existing `shared/worker.js` and configured as a SQLite-backed Durable Object
through declarative Wrangler exports. A public route is now staged under `/forbidden-words/live/*`, but returns
404 unless `ATLAS_FORBIDDEN_WORDS_LIVE_ENABLED` is explicitly set to `true`.
The current HTTP/Supabase game remains the only production game.

The private Durable Object accepts internal `/initialize` (owner + Atlas learner),
`/ticket` (validated tutor or learner identity), and `/socket` (one-use
30-second ticket carried in the WebSocket subprotocol, never in a URL).
The room persists the existing game state through hibernation and streams
role-projected updates; its alarm drives deadlines, disconnect pauses and
six-hour expiration. The Worker authenticates tutors and reserves exactly one minimal Supabase
metadata row through the existing atomic quota RPC; it never stores live cards
or gameplay state there. The old HTTP handler rejects these reservation rows.
On End Game, the room marks the reservation finished (retrying after transient
RPC failure). Live room state remains exclusively in the Durable Object.

WebSocket upgrade tickets are one-use, consumed transactionally and echoed as
the selected subprotocol; no token goes into a URL. During timed play, heartbeat
messages update presence and the existing 12-second threshold preserves a brief
disconnect grace. Reconnection restores the same game without resetting cards
or scores. This remains **undeployed and not browser-integrated**; the real
Cloudflare runtime and two-browser acceptance gates are still outstanding.

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

A turn starts at database time + 3 seconds and ends exactly 120 seconds later. Clients
render from that deadline and a measured server-time offset. Polling every 650 ms
synchronizes scores and roles; timer rendering is local and continuous. A paused turn
stores remaining duration. If either seat misses its 12-second presence
window during timed play, the server automatically pauses the turn and
restores the time since the last confirmed heartbeat. Both players must
reconnect before the tutor can explicitly resume; neither browser may
continue scoring while paused. The initial 12-second window avoids pauses
from momentary connection hiccups; a browser cannot detect a sudden tab
closure instantly without a live connection channel. Browser actions disable
while the connection is stale; uncertain commands retry with the same ID. Reload restores the same seat, card, score and deadline. Expired/revoked seats
show an entry error rather than keeping an actionable stale board. Poll failures back
off to five seconds. Both players must mark ready for turn two; reconnecting completes
that readiness handshake if both already marked ready.

Sessions expire after six hours. Expired records are inaccessible and are removed on
subsequent session creation. There is no fixed round limit. Best score covers completed
rounds in this session. The final unresolved card can be credited once by its previous
Describer until the next turn/round begins. End Game is tutor-controlled and confirmed in the browser. It is available while
waiting, at role switches/results, or during a paused countdown/active turn;
live unpaused turns cannot be ended. Ending immediately closes the shared
room for both seats, clears the current private card and paused clock, and
does not allow that game to resume. The learner can observe the finished
state, but a new seat cannot claim the finished invitation. Copy Link always
copies the current invitation; Replace Learner Link instead rotates the
invitation, revokes the existing seat and preserves game progress.

## Atlas learner ownership

Tutor rooms are bound to an immutable Atlas learner session ID in the
server-owned game state. The tutor's authenticated request must carry the
matching learner ID for every request; the Worker rejects a mismatch. The
learner seat never receives the Atlas learner ID. Replacing the invited
participant is **not** changing the Atlas learner context and keeps the room's
learner ID, score and progress unchanged.

The tutor browser stores a room reference under the account **and** Atlas
learner ID. On selection change, the game stops polling the previous room,
ignores in-flight responses from the previous selection, and resumes only the
room bookmarked for the newly selected learner. It never ends the previous
room or silently creates a replacement. A learner without a recorded room sees
an explicit Create Game action. Returning to a learner on the same browser
restores that learner's room while it remains valid (rooms still expire after
six hours). Different browsers do not share these local bookmarks; a future
cross-device room discovery feature would need a separate authenticated
server lookup.

Every new room requires a valid Atlas learner ID at creation, and the backend
rejects unassigned older rooms rather than silently linking them to a learner.
The obsolete one-time legacy binding command and its recovery UI are retired.

The existing server quota (three unfinished rooms per owner) still applies;
switching learners alone never consumes a room. Account ownership/authorisation,
seat restrictions, timer rules, and privacy projections are unchanged.

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
   `atlas-ai` backend Worker with the complete `shared/worker.js`.
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
