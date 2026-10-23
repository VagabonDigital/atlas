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

`questions.mjs` contains 40 authored seed questions, four per rung, with answers, explanations, family/difficulty metadata, evidence and source links. Difficulty is editorial; the existing Atlas session state stores exposure, outcomes and Question Care events for later calibration. Current-session exposure prevents immediate repetition inside a run, while tutor-wide and cross-session exposure are soft preferences: previously seen authored questions become eligible again when fresher options are exhausted. Exhaustion never generates unverified questions.

`continuity.mjs` uses the existing AtlasBridge session identity and registry. Reopening an unfinished run shows the cover with **Continue Run**, which enters the hydrated question and lifeline state without starting a new run. During an active game, the muted **New Run** control requires confirmation before abandoning that run and starting again at Question 1. It clears only the active run snapshot for the current Atlas learner session; previously encountered questions, results, event history and session-best data remain intact. It never alters another learner's game. Existing **Play Again** handles completed runs. The shared session panel owns account/cloud behavior. Signed-in cloud synchronization was not exercised in the local browser review.

The shared chrome change adds opt-outs to `arcade-game-chrome.js` so Millionaire can use the existing floating Back/Session controls without Search or appearance controls. Other callers retain their defaults. The existing `shared/arcade-catalog-data.js` owns the new game metadata, while `arcade/index.html` adds its cover and presents Play / Play again rather than an unsupported Resume action.

## Artwork

`assets/stage.png` is original generated stage artwork created with the built-in image generation tool using the approved entrance reference for visual direction: a blue-and-gold television quiz studio, two empty chairs facing a central console, an original compass-star emblem, audience silhouettes, theatrical spotlights and a reflective floor, with no text or interface controls. Interface geometry, emblem SVG, animation and typography are implemented locally.

## Repository integration

The canonical files are in the Atlas repository at `arcade/millionaire/`. The separate project workspace's `build/arcade/millionaire/` directory is a staging copy, not a repository path. Open `http://127.0.0.1:4173/arcade/index.html` and choose Millionaire, or use the direct game URL above.

Integration browser checks confirmed the hub card and cover, launch to Question 1, and return to Arcade. All four existing game entrances loaded with their default shared chrome. Truth Trap also entered active play with Session, Search and appearance controls; its Session panel opened successfully. Preview/account-gated games were checked at their entrances only. The existing Google sign-in client rejects the localhost origin, so signed-in session/cloud continuity remains unverified.
