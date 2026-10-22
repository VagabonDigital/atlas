# Family Feud

![Family Feud cover](./assets/family-feud-cover.png)

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
named learner is Player 2, with Player 1/Player 2 fallbacks. No extra name setup.

## Content and matching

The six included boards are **illustrative fixtures, not genuine survey results**.
This is disclosed on the stage throughout play. No respondents or raw responses
are fabricated. Replace these boards with audited, genuine survey data before
using this as a production survey game. Each concept includes aliases, boundaries,
excluded neighbours and a place for original responses. Replay prefers unseen
boards and explicitly discloses when reuse is necessary.

Matching is local: normalized aliases, conservative edit distance, then bounded
authored paraphrase/framing rules against the six concepts. It does not call an
LLM, infer broadly associated concepts, or expose hidden suggestions. New natural
paraphrases will need codebook additions based on human playtesting. Clear misses,
multi-answer ambiguity, duplicates and technical errors have separate outcomes.
Technical failures preserve the exact entry and turn for retry.

## Verification

```sh
node --test arcade/family-feud/dev/rules.test.mjs
node arcade/family-feud/dev/browser-check.cjs
```

Browser checks require Playwright and Chromium. Set `FF_PLAYWRIGHT` to an installed
Playwright module path if it is not on Node's module path, and optionally
`FF_BROWSER` to an installed Chromium executable. Run the local server first.
Screenshots are written to `dev/evidence/` (ignored).

The focused checks cover all authored aliases, representative paraphrases and
typos, unrelated neighbours, concept collisions, elimination and solo continuation,
starter rules, scoring, all-found and missed-board endings, complete three-round
play, replay, win/draw, Finish, and an injected one-shot resolver failure/retry.
Browser inspection covers 1280×720 and 1024×768, muted and reduced-motion operation.
The game has no debug controls, answer reveal shortcuts, or hidden text in shutter DOM.

## Atlas Continue

Starting a match creates a versioned Family Feud snapshot under the active Atlas
learner session in the existing AtlasBridge registry. Continue becomes eligible
immediately. The snapshot preserves board IDs, round, current contestant, starting
contestant, scores, round contributions, strikes, revealed answers and contestant
names. Answers, passes, board reveals and round transitions checkpoint the match.
Refreshing the page or returning through Atlas restores the same unfinished match,
including its current playing, missed-board or round-end controls.

Changing the active Atlas learner session loads that learner's own match (or the
start screen when none exists); pending answer animations cannot apply results
across learner sessions. The final result marks the match complete, clears the
resumable snapshot and removes Continue eligibility. Recent Activity remains, and
Play Again starts a fresh three-round match. This uses AtlasBridge's existing
browser-local continuity, not cross-device or server-side game storage.

Previously seen board IDs continue to be stored in browser-local storage to
prefer fresh boards in later matches. Sound starts off and can be enabled with
the top-right control. Keyboard Enter submits; all other actions use standard
focusable buttons. No human judging role.
