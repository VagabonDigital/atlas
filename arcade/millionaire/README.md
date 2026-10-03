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

Browser verification covered the entrance and rules; selection, lock and reveal without geometry changes; all lifelines; recognition and factual-error replacement; walk-away and hypothetical reveal; a complete ten-question victory; fresh replay, session best and Finish. Visual inspection covered 1280×720 and 1024×768 lesson viewports, including safety, incorrect, final-win and adviser treatments. No console errors were reported in the inspected flows.

## Content and Atlas boundary

`questions.mjs` contains 40 authored seed questions, four per rung, with answers, explanations, family/difficulty metadata, evidence and source links. Difficulty is editorial; the existing Atlas session state stores exposure, outcomes and recognition/void events for later calibration. Both learner exposure and the tutor's cross-session exposure inform selection. Exhaustion never generates unverified questions.

`continuity.mjs` uses the existing AtlasBridge session identity and registry. The shared session panel owns account/cloud behavior. Signed-in cloud synchronization was not exercised in this local browser review.

The shared chrome change adds opt-outs to `arcade-game-chrome.js` so Millionaire can use the existing floating Back/Session controls without Search or appearance controls. Other callers retain their defaults. The existing `shared/arcade-catalog-data.js` owns the new game metadata, while `arcade/index.html` adds its cover and presents Play / Play again rather than an unsupported Resume action.

## Artwork

`assets/stage.png` is original generated stage artwork created with the built-in image generation tool using the approved entrance reference for visual direction: a blue-and-gold television quiz studio, two empty chairs facing a central console, an original compass-star emblem, audience silhouettes, theatrical spotlights and a reflective floor, with no text or interface controls. Interface geometry, emblem SVG, animation and typography are implemented locally.

## Repository integration

The canonical files are in the Atlas repository at `arcade/millionaire/`. The separate project workspace's `build/arcade/millionaire/` directory is a staging copy, not a repository path. Open `http://127.0.0.1:4173/arcade/index.html` and choose Millionaire, or use the direct game URL above.

Integration browser checks confirmed the hub card and cover, launch to Question 1, and return to Arcade. All four existing game entrances loaded with their default shared chrome. Truth Trap also entered active play with Session, Search and appearance controls; its Session panel opened successfully. Preview/account-gated games were checked at their entrances only. The existing Google sign-in client rejects the localhost origin, so signed-in session/cloud continuity remains unverified.
