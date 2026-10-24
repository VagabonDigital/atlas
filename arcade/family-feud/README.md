# Family Feud

![Family Feud cover](../../assets/hub/family-feud.webp)

A complete shared-screen, three-round game. All Family Feud code lives here;
navigation and the session panel are provided by the existing shared Arcade/Atlas owners.

## Play locally

From the Atlas repository root:

```sh
node arcade/family-feud/dev/serve.mjs
```

Open `http://127.0.0.1:4177/arcade/family-feud/`. No build or production dependency install is required.
The server is a loopback-only development utility, not deployment infrastructure.
Finish returns to Arcade. Session names are captured on Start Match; the bridge's
named learner is Player 2, with Player 1/Player 2 fallbacks. The learner opens Round 1; later rounds start with the trailing player (or alternate when tied). No extra name setup.

## Content and matching

The first nine curated content batches contain **forty-five real six-answer US Season 26
survey boards**: archived survey numbers 19, 85, 111, 121, 137, 3, 61, 117, 136, 151,
35, 50, 54, 92, 104, 21, 107, 135, 144, 153, 8, 12, 72, 147, 159, 40, 82, 118,
130, 152, 26, 36, 64, 91, 141, 39, 58, 62, 74, 109, 6, 70, 131, 139 and 143. Original
question wording, six ranked answer labels and point values are preserved in
`content.mjs`. Their source is the
[Season 26 six-answer archive](https://mstiescott.neocities.org/feud26_6).
Atlas did **not** conduct these surveys. They are archive transcriptions, not
Atlas respondent data.

The repository-only research collection
`dev/season26-six-answer-raw.json` currently contains 161 six-answer survey
records. It is excluded from the deployed static site by the
`arcade/family-feud/dev/` rule in the root `.assetsignore` file. This raw source is separate from the
playable, hand-curated `boards` collection in `content.mjs`. Expand the
playable library only after screening a question for plausible successful guesses,
verifying its source numbers and writing and testing its answer codebook.
This is an editorial selection judgement, not a measured learner success rate.

The seven former **illustrative development boards** remain under
`legacyBoards` exclusively to restore previously saved matches. New matches
never select them. Their illustrative provenance remains visible if an old
match is resumed.

Matching remains local: normalized aliases, conservative edit distance, then
bounded authored paraphrase/framing rules against the six concepts. Each
source answer has Atlas-authored accepted expressions, a meaning boundary and
explicitly excluded near neighbours. Recognition changes **do not** alter the
original display label or score. It does not call an LLM or guess loosely
associated meanings. Multi-answer ambiguity, duplicates and technical errors
have separate outcomes; errors preserve the exact entry and turn for retry.
Add new natural paraphrases on the basis of manual playtesting.

Replay prefers unseen selected boards and clearly discloses reuse when the
forty-five-board pool is exhausted.
## Verification

```sh
node --test arcade/family-feud/dev/rules.test.mjs arcade/family-feud/dev/continuity.test.mjs
node arcade/family-feud/dev/browser-check.cjs
```

Browser checks require Playwright and Chromium. Set `FF_PLAYWRIGHT` to an installed
Playwright module path if it is not on Node's module path, and optionally
`FF_BROWSER` to an installed Chromium executable. Run the local server first.
Screenshots are written to `dev/evidence/` (ignored).

The focused checks cover sourced data fidelity, curated alias and exclusion
matching, saved legacy-board restoration, save/restore, refresh,
learner-session switching,
all three rounds, completion and replay as well as authored aliases, paraphrases,
typos, unrelated neighbours, concept collisions, elimination and solo continuation,
starter rules, scoring, all-found and missed-board endings, complete three-round
play, replay, win/draw, Finish, and an injected one-shot resolver failure/retry.
Browser inspection covers 1280×720 and 1024×768, muted and reduced-motion operation.
The game has no debug controls, answer reveal shortcuts, or hidden text in shutter DOM.

## Atlas Continue

Starting a match creates a versioned Family Feud snapshot under the active Atlas
learner session in the existing AtlasBridge registry. An untouched opening board
is saved but reports zero progress: the Arcade and Atlas Continue surfaces become
eligible only after the first valid guess or pass. The snapshot preserves board
IDs, round, current contestant, starting
contestant, scores, round contributions, strikes, revealed answers and contestant
names. Answers, passes, board reveals and round transitions checkpoint the match.
Reopening the page (including through Atlas Continue) shows the cover first.
**Continue Match** then restores the exact unfinished playing, missed-board or
round-end state without creating a new match, resetting scores or opening a round.

Changing the active Atlas learner session loads that learner's own match (or the
start screen when none exists); pending answer animations cannot apply results
across learner sessions. The final result marks the match complete, clears the
resumable snapshot and removes Continue eligibility. Recent Activity remains, and
Play Again starts a fresh three-round match. During an unfinished match, the
muted **New Match** game-header control opens a confirmation dialog. Confirming
starts a new three-round match for the selected learner only, replacing their
unfinished snapshot and resetting current scores and reveals without clearing
the browser's previously seen boards or another learner's match. Cancelling
leaves gameplay untouched. Pending animations cannot apply old-match results
after confirmation or cross-session switching. This uses AtlasBridge's existing
browser-local continuity, not cross-device or server-side game storage.

The cover features a clickable Season 26 authenticity plaque above the six
answer shutters. Its native popover explains the use of genuine TV questions,
rankings and points, and naturally phrased guesses. It is hidden during play.

Previously seen board IDs continue to be stored in browser-local storage to
prefer fresh boards in later matches. Sound starts off and can be enabled with
the top-right control. Keyboard Enter submits; all other actions use standard
focusable buttons. No human judging role.
