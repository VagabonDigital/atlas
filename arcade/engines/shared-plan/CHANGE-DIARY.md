# Engine One change diary

Every engine change is logged with the Definition that prompted it and classified as **generic capability** or **special case** (Build Architecture §8.2). An accepted special case is a failure to fix, not a cost to absorb. A falling rate of entries is part of the evidence that this is an engine.

This diary starts at B1.1. B1 was built, audited and frozen before it existed; its contract adjustments are recorded in the B1 audit reports and are not reconstructed here.

---

## B1.1: Stage-facing additions before B2 — CLOSED

**Date:** 2026-09-17. Delivered at Review 1, approved, then closed with the decisions in the second table.
**Prompted by:** B2 Stage planning against all three references, the raised-capacity defect found while planning it (now fixture H-7), and the Voice placement spike.
**Scope rule:** an isolated, additive reopening of B1. The reducer, canonical Session State and every pre-existing World View field are unchanged.
**Evidence that semantics are unchanged:** a baseline of 1,799 steps across the nine pre-existing fixtures was captured before any edit and replayed after Review 1 and again after closure. Each replay compared canonical Session State and every pre-existing World View field at every step, plus the analysis reports of R-A, R-B and R-C. Nothing differed either time. All 73 B1 tests still pass, alongside 34 new ones.

### Delivered at Review 1

| Change | Where | Prompted by | Class |
|---|---|---|---|
| `PrimaryActionDescriptor.placement`, `RuntimeHostContext.motion`, `RuntimeController.invoke` | `arcade/contracts/engine-faces.d.ts` | Core's chrome slot must invoke engine actions and pass reduced or no motion (all references) | Generic |
| `beatCount` and `lastChange` in the World View | `model/derive.js` | Choreography stages a change from the World View alone, without reading the Definition (all references) | Generic |
| Seam `involves`, from `seamParticipants` | `model/rules.js`, `model/derive.js` | The local preview must show a Seam anchored on a different Piece from the one held (R-A, the sisters) | Generic |
| Piece and Place `affinity` marks | `model/derive.js` | Allowed-in Rules drawn as shared marks rather than named Rules (R-A children indoors, R-B supplies onward, H-6 a dormant Rule waking) | Generic |
| `resolution.journeys[].path` | `model/derive.js` | The hindsight thread follows a Piece through every commitment, not just the first and last (H-4, aftershock) | Generic |
| `primaryActions[].placement`; Resolve now moves to the menu | `model/derive.js` | Engine One keeps to at most three game controls | Generic |
| `deriveThen` and `thenSession`, the history projection | `model/history.js` | Then/Now. A Keep pin declared after committing is missing from the commitment snapshot, and an aftershock fires in the same action that sets the revised plan, so "then" is recovered by replaying the log (R-B, H-4) | Generic |
| `variantTouches` and `locusId` | `model/touches.js` | Staging and Voice brightening need every locus a change alters, including downstream of a sever (R-B) | Generic |
| `places[].maxSockets`; sockets solved to it | `compiler/resolve.js`, `layout/solvers.js` | **Defect:** a beat that raised capacity opened sockets with no geometry (H-7) | Generic, defect fix |
| Composition v1: fixed regions, an Omen slot per edge, gutters, band labels and headline boxes. Every rendered label is measured in its own slot, and collision checks now cover gutters, bands and band labels. | `layout/solvers.js`, `layout/compose.js`, `layout/index.js` | The B2 Stage needs a fixed position for every mark (all references) | Generic |
| Band slots tile exactly | `layout/compose.js` | **Defect:** slot widths were rounded independently, so neighbouring slots could overlap by a pixel | Generic, defect fix |
| H-7 "Room To Grow" | `definitions/hostile/index.js` | Regression fixture for raised capacity; also puts a South Omen in the Threshold band | Fixture, not engine |

### Closure decisions

| Change | Where | Prompted by | Class |
|---|---|---|---|
| **Satellite placement is canonical.** On a Table or a Vessel a Voice stands in a strip under its Place's name. On a Route it stands above its frame, and every frame is lowered by the same amount to make room. | `layout/voices.js`, `layout/compose.js` | Voices stand near what they concern, never in a sidebar (Design Vision); spike evidence across R-A, R-B, R-C, H-1, H-2 and H-3 | Generic |
| **Dense-Table fallback.** When satellite placement would leave any socket row under 44px in a two-row Table, every Voice stands in one band where the gap between the rows was, and each card carries a connector to its anchor Place. There is no Voice lane. | `layout/voices.js` | H-1, H-3 | Generic |
| **Advisory warnings.** `layout.voiceBandFallback` when a world uses the band. `layout.voiceCrowdsSockets` when a socket row stays under 44px and no fallback is left (a one-row Table or a Route). Neither stops a world compiling. | `layout/index.js`, `compiler/index.js` | H-1 and H-3 (fallback); a crowded variant of R-A in the tests (no fallback) | Generic |
| **Headline anchor.** A change headline at a Place is anchored below any Voice strip it would otherwise cover. | `layout/compose.js`, `layout/index.js` | Rain shuts the porch while Dezso stands there (R-A) | Generic |
| Voice name, role, claim and claim variants are measured on the card they stand on, replacing the provisional 240px measure. Cards reserve height for outcome lines. | `layout/index.js`, `layout/voices.js`, `layout/metrics.js` (`wrapLines`) | All references | Generic |
| **A Voice's `anchor` is narrowed to a Place.** Tethers can still reach Pieces or Places, and a Voice never follows a Piece. | `definition/schema.js` | No placement keeps a Piece-anchored Voice near its concern (spike, synthetic R-A) | Generic, contract narrowing |
| `solve` moved from `layout/solvers.js` to `layout/compose.js` | `layout/` | Voice placement needs the solvers without a circular import | Structure only |
| `compilerVersion` 0.1.0 → 0.1.1 | `compiler/index.js` | B1.1 changed compiled output | Versioning |

**What the compiled layout now carries for Voices.**
- `layout.voices`: `placement` (`satellite`, `betweenRows` or `none`), `band`, `fallback` (with the Places satellite would have squeezed), `crowded`, and one card per Voice. A card holds its box, host, position, medallion, name, role, claim and a connector for band cards.
- Every Place: `voiceStrip`, `socketRow`, and a `headline` with a height.

**Versions.**
- Compiler: now 0.1.1.
- Engine runtime (0.1.0), Definition schema version (0) and session schema: unchanged. Reducer and session behaviour are unchanged, and every Definition that compiled before still compiles, since none anchored a Voice to a Piece.

**Final reference revisions.** These supersede the ones regenerated for Review 1.

| Reference | B1 | B1.1 final (compiler 0.1.1) |
|---|---|---|
| R-A | `the-long-table-6d3f5ab854dd` | `the-long-table-53068dfe2e07` (`53068dfe2e07282a2d7ccb460070ae24`) |
| R-B | `last-ferry-d43cf217599e` | `last-ferry-159162fb310b` (`159162fb310b03aab895f1b8ffd19074`) |
| R-C | `twenty-kilos-0bfa6a9ef005` | `twenty-kilos-7cc6b83701af` (`7cc6b83701af14b46430622e9c52f27e`) |

### Carried into B2 as requirements

- **Resolve text must fit its composition.** When the Resolve composition has real geometry, B2 provides slots and compiler fit checks for all text actually rendered there, including Voice outcome lines, Goal result lines and hindsight material. **B2 may not exit while any of it can overflow its authored composition.** As measured at B1.1, Goal result lines already need more than the two lines a Horizon slot holds in 6 of 6 cases in R-B and 5 of 6 in R-C.
- **The Stage uses the solved layout.** It draws a connector for every band card and inscribes each change headline at the anchor the layout solved for it.
- **Piece facts have no measured slot yet.** B2 measures them wherever it renders them.
- **Voices anchored to dormant Places.** A Voice may anchor to a dormant Place, so its card is reserved in a frame the Stage does not show yet. B2 decides how such a Voice appears before its Place does.

### Logged only

- A commitment's `pinned` is snapshotted at commit, so it misses a Keep pin declared afterwards. Nothing in the engine reads it, and `deriveThen` replays the log instead. Fixing it would change the reducer, so it is left alone.

---

## B2: the Stage foundation

**Date:** 2026-09-17
**Prompted by:** the first Stage checkpoint: R-A's Plan frame drawn through the real pipeline, from a frozen revision to a Table world.

### Corrections carried in first

| Change | Where | Prompted by | Class |
|---|---|---|---|
| **Definition schema 0 → 1**, and this build reads schema 1 only | `definition/schema.js`, `identity.js`, every Draft | Narrowing a Voice's anchor narrowed what a Definition may say. A revision's provenance has to name the language it was compiled from, so the narrowing is a version, and schema 0 content now fails closed at compile and at verification | Generic, contract version |
| Versions and identity moved out of the compiler | `identity.js`, `compiler/index.js` | The runtime declares its identity without loading the compiler | Structure only |
| **compilerVersion 0.1.1 → 0.2.0** | `identity.js` | It reads a different Definition language and refuses worlds 0.1.1 accepted | Versioning |
| **Voice placement that keeps no socket row at the minimum is refused** (`layout.voicesDoNotFit`), replacing the advisory `layout.voiceCrowdsSockets` | `layout/voices.js`, `layout/index.js`, `compiler/index.js` | Fail closed rather than compile a Stage whose Pieces do not fit. A working band fallback stays a warning | Generic |

### The Stage

| Change | Where | Class |
|---|---|---|
| **The mark layer.** `buildMarks` is the only Stage code that reads a World View. It resolves geometry once and emits a MarkSet from a closed vocabulary | `stage/marks/` | Generic |
| **The Table form.** A floor with grain, a passage at the Threshold, a resting place at the Margin, a surface under each Place and a setting under each socket, and the arc a link takes | `stage/forms/table.js` | Generic |
| **Form registry.** Route, Vessel and Site refuse to mount and say when they arrive, rather than borrowing another form's ground | `stage/forms/adapter.js` | Generic |
| **The renderer.** Marks keyed by id, SVG for geometry and real elements for every piece of text, sized in container units so nothing is scaled by transform | `stage/render/` | Generic |
| **The neutral kit.** The token contract, complete for day and night | `stage/kits/` | Generic |
| **The still frame.** Revision and session in, one correct frame out | `stage/still.js` | Generic |
| **The Runtime Face.** Identity and `mountPreviewStill`; `mount` refuses until the live Stage exists | `runtime-face.js` | Generic |
| Workbench and development server | `engines/shared-plan-workbench/`, `dev/serve.js` | Dev only |
| Playwright, dev-only, for the browser suite | `package.json` | Tooling |

**Boundaries held mechanically.** The Stage imports only the model, the layout and the Definition. A form never imports the model, so a painter can never see a World View. The mark layer never imports the renderer. Only a form adapter names a Stage Form. Pure Stage modules read no clock, no randomness and no document. Every kit defines every token for both appearances, and no Stage stylesheet names a game or a form. B1's no-hack scan already covers `stage/*.js`.

**Refusals, not wrong frames.** A World View carrying anything the mark layer cannot draw yet — load lines, Seams, history or Resolve marks, any phase past Plan — raises `StageNotBuiltError`. A form with no Stage raises `StageFormUnavailable`. Both surface in the workbench instead of a half-drawn world.

**Reference revisions after the schema change** (schema 1, compiler 0.2.0, runtime 0.1.0):

| Reference | B1.1 closure | B2 |
|---|---|---|
| R-A | `the-long-table-53068dfe2e07` | `the-long-table-9e74e971c13f` |
| R-B | `last-ferry-159162fb310b` | `last-ferry-4c2b14a4a624` |
| R-C | `twenty-kilos-7cc6b83701af` | `twenty-kilos-3c626494ee69` |

### Open for human judgement

- **Glyphs are not drawn yet.** At the tightest slot widths a glyph inside a Piece chip would eat into the name width the compiler guarantees (H-3's longest names over eight Pieces leave nothing spare). Deciding between a taller chip, which raises the 44px socket minimum, a narrower name budget, or glyphs only where there is room, comes before glyphs v0.
- **Place descriptors and Piece facts have no anchor** in composition v1. They are carried into the MarkSet but nothing draws them.
- A Place with fewer sockets sits lower than its neighbours, because its single socket row is centred in the frame.
