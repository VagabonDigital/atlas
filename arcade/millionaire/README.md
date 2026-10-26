# Millionaire

Shared-screen Atlas Arcade game for one tutor Host and one learner Contestant.

From the Atlas repository root, run:

```sh
node arcade/millionaire/dev/server.mjs
```

Open `http://127.0.0.1:4173/arcade/millionaire/`. The static development server binds only to localhost. No build or package install is required.

Run the focused rules/content/continuity checks with:

```sh
node --test arcade/millionaire/dev/game.test.mjs
```

## Inspection

On localhost, `dev/index.html` links to deterministic states using the real game transitions. Inspection does not persist game events. Supported `?inspect=` values: neutral, selected, locked, correct, incorrect, safety, walk, hypothetical, host, win, summary, narrow. These controls are unavailable on production hostnames.

Browser verification covered the entrance and rules; selection, lock and reveal without geometry changes; all lifelines; pre-reveal Question Care replacement; walk-away and hypothetical reveal; a complete ten-question victory; fresh replay, session best and Finish. Visual inspection covered 1280×720 and 1024×768 lesson viewports, including safety, incorrect, final-win and adviser treatments. No console errors were reported in the inspected flows. The later Reset Session control still requires a live browser check.

## Content and Atlas boundary

`questions.mjs` contains 818 curated authentic research questions and is the only source for fresh questions, replacements and replay. `dev/wwtbam.json` owns all 1,000 review decisions: 668 approved, 150 repaired and approved, 182 rejected, none pending. Original source metadata, original wording/options for repairs, and all 25 inherited rulings remain preserved. See `dev/curation.md` for checkpoint results and limitations.

Regenerate after archive edits with `node arcade/millionaire/dev/build-questions.mjs`; use `--check` to detect drift. The static browser projection excludes rejected entries and review working notes. Source links are only references actually consulted; an empty list is deliberate, not a claim of independent external verification.

`legacy-questions.mjs` retains the 40 original seed IDs and contents solely to hydrate an already-displayed saved question. Option order, answer, selection, hidden options and lifelines survive resume. Subsequent progression, replacement and new runs use the authentic bank exclusively.

Rung counts (1–10): **48, 112, 189, 157, 112, 103, 46, 23, 16, 12**. Difficulty is editorial, not calibrated from learner outcomes. Upper rungs remain the smallest pools. The existing Atlas session state stores exposure, outcomes and Question Care events for later calibration. Current-session exposure prevents immediate repetition inside a run, while tutor-wide and cross-session exposure are soft preferences: previously seen questions become eligible again when fresher options are exhausted. Exhaustion never generates unverified questions.

`continuity.mjs` uses the existing AtlasBridge session identity and registry. Reopening an unfinished run shows the cover with **Continue Run**, which enters the hydrated question and lifeline state without starting a new run. Simply seeing Question 1 saves the run but is not learning progress; the Arcade and Atlas Continue cards are eligible after the first selected answer, used lifeline or another meaningful game action. During an active game, the muted **New Run** control requires confirmation before abandoning that run and starting again at Question 1. It clears only the active run snapshot for the current Atlas learner session; previously encountered questions, results, event history and session-best data remain intact. It never alters another learner's game. Existing **Play Again** handles completed runs. The shared session panel owns account/cloud behavior. Signed-in cloud synchronization was not exercised in the local browser review.

The shared chrome change adds opt-outs to `arcade-game-chrome.js` so Millionaire can use the existing floating Back/Session controls without Search or appearance controls. Other callers retain their defaults. The existing `shared/arcade-catalog-data.js` owns the new game metadata, while `arcade/index.html` adds its cover and presents Play / Play again rather than an unsupported Resume action.

## Authentic-bank verification (issue #168)

The focused suite passes 19 tests, covering archive/projection parity, preserved source records and inherited rulings, all 40 legacy questions across applicable saved phases, authentic-only progression/replacement/replay, answer hiding, lifelines, prizes, safety levels, walking away, and six complete repeat runs with final-rung replacement. The projection drift check also passes.

Targeted local browser checks covered fresh authentic selection, Narrow It Down, selected-answer reload and Continue Run, Host’s Take, lock/reveal with explanation, progression and New Question replacement. A long replacement prompt remained readable with all four options visible at the emulated 1280×720 layout. No browser console errors were captured. Signed-in cloud synchronization and learner-outcome difficulty calibration were not exercised.

## Artwork

`assets/stage.png` is original generated stage artwork created with the built-in image generation tool using the approved entrance reference for visual direction: a blue-and-gold television quiz studio, two empty chairs facing a central console, an original compass-star emblem, audience silhouettes, theatrical spotlights and a reflective floor, with no text or interface controls. Interface geometry, emblem SVG, animation and typography are implemented locally.

## Repository integration

The canonical files are in the Atlas repository at `arcade/millionaire/`. The separate project workspace's `build/arcade/millionaire/` directory is a staging copy, not a repository path. Open `http://127.0.0.1:4173/arcade/index.html` and choose Millionaire, or use the direct game URL above.

Integration browser checks confirmed the hub card and cover, launch to Question 1, and return to Arcade. All four existing game entrances loaded with their default shared chrome. Truth Trap also entered active play with Session, Search and appearance controls; its Session panel opened successfully. Preview/account-gated games were checked at their entrances only. The existing Google sign-in client rejects the localhost origin, so signed-in session/cloud continuity remains unverified.
