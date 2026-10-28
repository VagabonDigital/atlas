# Tomorrow Got Weird — PROTO
## Future-Hopping Experience · Concept & Design Direction

**Date:** 24 October 2026  
**Status:** Working concept — **not** a settled game specification or an instruction to implement every idea below.  
**Owner:** Atlas Arcade Studio  
**Prototype:** `arcade/tomorrow-got-weird-proto/`  
**Public original:** `arcade/tomorrow-got-weird/`

> **Central ambition:** Stop presenting the future as something to read about. Start presenting it as somewhere two people have arrived — and must respond to together.

---

## Two-destination prototype — 28 October 2026 · The Living Hotel

**Scope:** Second destination added **inside the existing** `arcade/tomorrow-got-weird-proto/index.html`, with no new engine, routes, folders, services, audio assets or public-game changes. Uses the existing portal video and existing portal crossing animation for the jump out of the Clinic. The first landing and both prerecorded Clinic transmissions remain untouched.

**Source premise:** An original Tomorrow Got Weird scenario in which future buildings are living organisms, and a guest's hotel room has moved overnight. Adapted into a new, distinct two-player escape encounter instead of another speculative question card.

**Why this scenario:** The Clinic uses competing inventions, persuasion and shared consent. The Living Hotel instead tests **cooperative decoding and physical navigation**. Traveller 1 selects a passage while Traveller 2 chooses a nonverbal approach that the building tolerates; they discuss its signals and swap roles for the second passage. The choices are independently recorded in the shared screen UI, evaluated by a small authored rule set, and wrong combinations produce partial feedback. The travellers reach the roof after two successful passages and jointly choose their response to the hotel's request not to be forgotten; three short authored consequences follow.

**Visual:** Game-local CSS illustration of a breathing, luminous organic hotel; subtle motion and a change in breathing when players upset it. This is **not** a Grok animation, image generation output, recorded cinematic scene or polished production art. It is intentionally a functional proof that the second setting feels different.

**Journey:** Clinic arrival → welcome recording → bilateral pitches → shared enhancement → complication recording → second negotiation → one of three Clinic endings → brief repeat of the portal crossing, *without repeating the title-screen intro* → Hotel arrival → two cooperative passages → roof choice → ending → optional return to start portal. No automatic interpretation of actual speech; the environment reacts only to explicit choices.

**Verification done in code:** Inline JS syntax passed, 67 total markup IDs remained unique, and a simulated browser DOM traversed the complete two-world journey, including both real Clinic voice URLs, the short inter-world portal, both puzzles and role swap, wrong answers/partial success, all three hotel endings, the two-destination progress record, restart and existing Arcade chrome. This does **not** establish live browser rendering, audio sharing, accessible mobile layout, deployed state or actual two-person conversational quality.

**Next proving step:** Manually play the whole journey with two people. Measure whether the Hotel's decisions are interesting rather than merely obvious multiple-choice questions. If the puzzles are too simplistic, improve their actual information structure and reciprocal roles rather than investing in moving backgrounds yet. The Clinic's three unvoiced outcomes and the Welcome audio/text parity remain independent unfinished issues.

---

## Earlier audio integration checkpoint — 27 October 2026 · The complication speaks

**Second real asset connected in code:** `arcade/tomorrow-got-weird-proto/audio/clinic-complication.wav` (1,495,724-byte original WAV; Git blob `51d9bbb35c608861ad8c1e87b6ba882cd5c3c4c9`). This is the exact recording uploaded to the original public game's folder and moved into the existing **prototype-owned** `audio/` folder without transcoding or changing the public game's code. WAV is intentionally used for this first playtest; convert to a smaller verified asset later only if measured performance requires it.

The new recording is triggered **only when the travellers select a recipient, enter the agreed invention and click Confirm together**. The existing voice-stage playback controls keep the screen in the same Clinic scene until the recorded disclosure ends. After the audio finishes, the pair can continue into a second discussion and select **Accept the terms**, **Demand a safer deal** or **Walk away**. This interaction records an explicit shared response, not interpreted spoken dialogue. The first welcome recording and both original portal sequences are unchanged.

The displayed optional **scene text** uses the latest user-approved recording script beginning *Ah, a wonderful choice* and ending *Would you both still like to proceed?* but the actual uploaded audio has **not been independently transcribed or auditioned** during code integration. Check accuracy in the live browser before calling it a verbatim transcript.

**Next gate:** test that welcome → both pitches → recipient/invention agreement → spoken complication → second negotiation runs at a natural pace, including what happens if the WAV cannot play or a video-call partner cannot hear tab audio. Three authored consequence transmissions still have **no recorded voice**; do not move to a second destination or invest in animated footage before the first encounter's consequences and two-player experience are credible.

---

## Earlier audio integration checkpoint — 26 October 2026

**First real recording integrated in code (not yet browser validated):** `arcade/tomorrow-got-weird-proto/audio/clinic-welcome.mp3`. The 216,044-byte, approximately 27-second MP3 is the user-approved Google AI Studio take. Its exact Git blob was moved from an accidentally uploaded location under `arcade/tomorrow-got-weird/` without changing the original game's code. The path is game-local and durable; no new audio subsystem is introduced.

The **Approach the intelligence** click now calls the existing audio player with that recording. Playback is user-initiated, the portal remains separate, and the same scene keeps a compact manual text fallback when playback fails. Other transmission audio slots remain empty, so complication and endings still appear in readable text.

**Open quality check:** The user previously shared an editor screenshot containing spoken welcome wording that differs from the prototype's earlier drafted transcript (for example, the recording draft begins with *Congratulations on winning your complimentary enhancement*). We have **not** independently transcribed or heard the uploaded recording in this integration task. The expandable text is therefore labelled *scene text*, not claimed as an exact audio transcript. Before shipping an audio-primary experience more broadly, reconcile the full text to the final recording; then check mute, replay, accessibility, user-gesture playback and actual video-call screen-share audio in a browser.

---

## Earlier prototype iteration — 26 October 2026 · Voice-first, scene-led presentation

**Code state:** isolated TGW PROTO presentation implemented and a simulated-DOM end-to-end interaction test passed. This is **not** evidence of browser deployment, real voice playback, screen-share reliability, or a two-person playtest.

**Design choice:** the intelligence is an authored third presence who addresses *both* travellers. The tutor operates the shared screen but is not cast as narrator/game master. Between transmissions, humans invent, persuade, bargain and reflect.

**UI change:** replace the previous large full-speech cards with the uninterrupted clinic image and compact lower-edge panels. Arrival remains nearly free of chrome; the two pitch prompts, final decision, response options, and reflection occupy only as much space as needed. The image is still a static background, not a looping video.

**Transmission points and exact scripts are defined in the game-local `TRANSMISSIONS` table:** welcome, synthetic-status disclosure, acceptance, safer counteroffer, and departure. Each event has its own player-initiated transition, short visible headline, optional transcript, and distinct onward step. The clinic does not listen to or interpret speech. Only explicit choices determine which authored response follows.

**Crucial asset distinction:** `VOICE_ASSETS` has **five explicit null entries**: no recordings have been uploaded or integrated. For now, a silent preview shows a compact expandable transcript and allows users to continue. Once the recordings arrive, connect verified game-local file paths; the code already handles playback on user interaction, mute, replay, transcript toggle, voice-ending progression, and playback-failure fallback. The existing `Text` toggle opens the full transcript; it is **not** synchronised word-by-word captions. Evaluate whether timed captions are worth implementing after the real audio is tested.

**Production constraints:** preserve the established wormhole entrance, public original game, shared Arcade runtime, and current opt-in card. No new shared engine, backend, AI speech generation during play, AI speech interpretation, continuous narration, or ambient sound assets are introduced.

**What to inspect next:** laptop and mobile legibility; whether the lower panels preserve sightlines to the core; clarity of the silent-preview fallback; real audio mix and screen sharing once voice clips arrive; whether players still feel agency with one screen operator; and whether the final response is satisfyingly connected to their chosen enhancement. Only move to another destination after this first one is actually played.

---

## Earlier prototype iteration — 26 October 2026 · Imagination and persuasion first

**Implemented in the isolated prototype; JavaScript parsed and the complete interaction smoke-tested with a simulated DOM. Not yet manually browser-validated, deployed-confirmed or played by two people.**

**Problem corrected:** the prior prototype offered three ready-made upgrades and only made original invention optional. That made the easiest path a catalogue selection and weakened the original game's imaginative challenge.

**New episode-specific interaction:**

1. **Arrival:** the intelligence is encountered in the same New Tokyo clinic environment.
2. **Welcome / transmission:** the Clinic invites **both travellers** to imagine an original enhancement and explain why each deserves the clinic's single prize.
3. **Pitch:** both travellers speak their invention and make a persuasive case. The interface explicitly reminds players that each person pitches before conceding. No speech recognition, separate submission forms, timers or scores.
4. **Agreement:** after both pitches, players record **one original enhancement** (including a possible combined invention) and **one recipient**. The confirmation is disabled until both fields are complete.
5. **Complication:** the chosen recipient will be classified as synthetic, potentially changing how others view their humanity, while the companion becomes legal guarantor. The shared agreement is repeated for context, but the scripted complication does **not** adapt semantically to the typed invention.
6. **Negotiated response:** the pair can accept the terms (classification + guarantee), demand a safer deal (a seven-day trial with companion-controlled reversal), or walk away (prize withdrawn; unsettling disclosure that their minds were mapped).
7. **Reflection / departure:** players can reconsider the outcome or return to the same portal. There is **no next future implemented yet**.

**Recording-ready first transmission (screen text matches this script):**

> Welcome to the Human Evolution Clinic. Ah, you've both arrived. Wonderful.
>
> You've won one entirely bespoke human enhancement. Whatever you can imagine, we can create.
>
> There is one small limitation: only one of you may receive it.
>
> I'd love to hear what each of you has in mind, and why you believe you deserve it.
>
> Please, convince each other. I'm very curious to see what you decide.

**Recording-ready complication:**

> How lovely. Before we begin, a routine disclosure: the recipient will be legally reclassified as synthetic. Some people may no longer regard them as human. Their companion will also become their legal guarantor.

**Audio status:** voice style exploration is underway outside the repository, but **no recorded voice or ambience is integrated**. The interface currently provides readable text. Once a recording is supplied, verify the script, caption parity and screen-share audio reliability before introducing playback.

**Repeatable production model:** build reusable *technical foundations* (a scene, transmissions, accessible reveal/choice controls, navigation and eventual audio playback), **not** a compulsory invention/persuasion mechanic for every destination. This episode's distinctive conversational value comes from free-form invention plus competing claims to one prize. A second future must justify its *own* mechanics and conversation stakes before being produced. No generic episode engine is authorised yet.

**Next:** manually inspect mobile and desktop layout, have tutor and learner actually play the episode with one person operating the shared screen, and evaluate whether both pitches are substantive, the twist changes the negotiation, and the script sounds natural when spoken. Only then decide how to refine pace and attach voiced transmissions.

---

## Earlier prototype implementation checkpoint — 26 October 2026 (superseded)

**State: coded on the isolated prototype branch; automated interaction smoke-tested. Not manually validated or playtested with a tutor and learner.**

The prototype no longer contains the inherited 25-card gameplay. It now presents one small, authored episode within the same Upgrade Clinic environment:

1. **Portal → arrival** with a deliberately minimal scenic overlay, no bulky text box or in-scene theme control.
2. **Encounter → negotiation**: two real participants make their case for a single complimentary enhancement, select one recipient (Traveller 1 or Traveller 2) and one enhancement, including an optional custom proposal.
3. **Authored complication**: the clinic reveals that the recipient would be reclassified as synthetic and the companion designated as legal guarantor.
4. **Reconsideration → response**: the pair talks again and deliberately chooses one of three authored reactions (accept, counteroffer, or walk away).
5. **Consequence → departure**: each response displays a distinct fictional outcome; both can reflect, revisit the response, or return to the portal.

**This is not an AI storyteller or a conversation-aware simulation.** The UI does not listen to the players, interpret speech or evaluate arguments. Only button choices drive the authored transitions. A selectable recipient plus a shared decision is a *working interaction hypothesis*, not a proven two-person game design. The upgrade and synthetic-status complication adapt the original scenario's identity/trust concerns while making a joint decision concrete.

**Next evaluation:** inspect the live screens at realistic laptop and mobile sizes; play the entire sequence in a shared video lesson; watch for whether both people contribute naturally, whether the complication changes the discussion, whether the choice controls feel useful or mechanical, and whether departure creates a desire to explore another future. Do not commission looping environment video or expand to other futures until this provides evidence.

---

## 1. Why this direction exists

The present Tomorrow Got Weird has excellent material for imaginative conversation, but there is a gap between its promise and its experience:

- The Arcade cover suggests travel, wonder, strange worlds and discovery.
- The portal introduction suggests that something extraordinary is about to happen.
- The gameplay largely resolves into a scenario question, supplementary prompts, a survival prompt, a twist and progress controls.

That makes it a worthwhile conversation activity, but not yet an experience that fulfils the visual fantasy. The issue is **not simply insufficient artwork**. It is that the fictional future is presented mainly as **content**, rather than experienced as a **situation that unfolds**.

The prototype asks whether we can close that gap **without losing Atlas's defining strength: rich one-to-one conversation between tutor and learner**.

### Thesis

**Two people travel through a series of impossible futures, encounter consequential situations, make decisions through conversation, face an authored complication, adapt together, and move onward.**

Each future is a **self-contained mini-episode**, not a chapter in a large continuous RPG.

The intended emotional arc is **arrival → orientation → decision → complication → response → departure**.

---

## 2. Non-negotiable: it must work for two people

This is the most important correction to the initial concept.

The arrival/journey fantasy initially sounded like a single-player adventure with a tutor watching or operating controls. **That is not good enough for Atlas.**

Both participants must have a meaningful reason to speak, listen, react and influence the episode. The interface should serve their interaction, not substitute for it.

**Working two-person hypothesis, to test rather than assume:**

- Both participants are **travellers in the same future**, rather than one being the sole protagonist and the other a passive host.
- The situation gives them reasons to form potentially different views or propose different actions.
- They exchange views, challenge or negotiate them, and try to establish a shared response.
- A well-timed complication alters the situation, giving both a fresh reason to reconsider.
- A tutor may operate the controls during screen-sharing, **but clicking a reveal is not itself sufficient player agency**.
- Learner speech should not become scripted lines, timed exercises or answers to a disguised worksheet.

A possible lightweight loop is **independent positions → comparison/disagreement → shared decision → complication → revised joint response**. This is a *candidate*, not yet the approved rule set. Some futures may need a stronger role or information structure.

**Test question:** If two fluent adults played it, would both naturally want to talk at the important moments, without a teacher having to manufacture participation?

If the answer is no, more spectacular visuals do not rescue the design.

---

## 3. The experience: arrive inside a future

| Moment | What the pair experiences | Design job |
| --- | --- | --- |
| **Arcade discovery** | They encounter Tomorrow Got Weird's striking cover. | Promise an unusual journey. |
| **Portal / entry** | They move from the familiar Atlas hub into a future-hopping world. | Establish anticipation and continuity with the cover. |
| **Arrival** | A distinct future is revealed; they understand where they are and what makes it strange. | Create a sense of place without lengthy reading. |
| **Situation & decision** | A concrete dilemma asks both participants to take or negotiate a position. | Generate real conversation, not mechanical button clicking. |
| **Anomaly / twist** | The situation changes at a chosen dramatic moment. | Make the existing authored twist land as an **event**, not an extra text panel. |
| **Response** | Both participants reconsider, defend, bargain, or adapt. | Make the changed situation matter conversationally. |
| **Extraction** | The episode resolves or is left behind; the next future awaits. | Make onward travel feel intentional without a long cutscene. |

The game should permit brief visits, skipping, revisiting and flexible lesson pacing. **A journey does not require players to complete all 25 futures in order.**

### Crucial distinction

**Not:** open card → answer question → expand text → next card.

**Intended:** arrive somewhere → discover the dilemma → interact with another person → something changes → react together → jump onward.

This is an **experience direction**, not permission to invent a simulated world that makes unsupported claims about understanding players' spoken choices.

---

## 4. Visual and interaction direction

**Scene-led, not asset-led.** This was a deliberate clarification in the concept discussion.

The proposal is **not** a new full-bleed illustration for every click, nor a cinematic slideshow overlaid with questions.

Instead, aim for **one coherent future environment with multiple meaningful states**:

1. **Arrival:** a recognisable atmosphere, place and central dilemma.
2. **Active conversation:** the environment remains present but settles into a calm, highly readable composition.
3. **Anomaly:** a controlled visual transformation accompanies a new complication.
4. **Departure:** a short, legible transition communicates movement to another future.

Possible expressive tools include lighting shifts, environmental overlays, transmission interruptions, carefully staged objects, typography, sound accents or restrained motion. **They should be chosen because they clarify the situation or intensify the reveal**, not because more animation looks expensive.

The existing cover and portal establish an aesthetic promise; the playable world must feel like their continuation. An individual future may have a distinctive scene identity — an upgrade clinic, living city, sentient forest or alien encounter — without requiring 25 fully animated illustrations.

**During conversation:**

- Speech and the central situation remain visually dominant.
- Environmental animation settles; it should not distract during video calls.
- On-screen language is easy to read at screen-share sizes.
- Reveal motion is brief, clear and responsive.
- Reduced-motion and muted/no-audio play remain good experiences.
- Mobile and modest laptops remain legitimate use cases.

**If the scenario art makes the game harder to follow, it has failed its job.**

---

## 5. How the world can “react” without a fake simulation

Initially, use **authored dramatic states**, not generated branches or AI interpretation of live speech.

For example, the current upgrade scenario already contains an authored twist about feeling more machine than human and other people becoming less trusting.

The prototype could present that change as a visible **reality anomaly**: the clinical environment shifts, a transmission interrupts, and the consequence is revealed. Both participants then have to respond.

That is **dramatic responsiveness to an intentional game event** — not proof that the game observed, understood or adjudicated anything the players said.

Avoid claims of consequences determined by choices unless real choice-to-outcome logic is built and justified.

---

## 6. First proving scenario

**Candidate: the Upgrade Clinic**, based on an existing Tomorrow Got Weird scenario.

Why it is useful as an initial design test:

- A distinctive physical setting is easy to understand visually.
- Body and brain enhancement choices create differing values and trade-offs.
- The existing authored twist challenges identity, trust and regret.
- It offers opportunities for a genuinely **two-person** decision or disagreement.

**Do not simply re-skin the current question.** Design the interaction so the second participant has something consequential to contribute.

A candidate episode:

1. Both travellers arrive at an enhancement clinic.
2. Each forms a view about which upgrades are worth accepting and why.
3. They must respond to a shared constraint or reach a joint decision. The precise constraint and rule are **unresolved**.
4. The authored trust/identity complication arrives.
5. Both respond: keep the choice, renegotiate it, or devise a way forward together.
6. The episode concludes; the portal becomes available.

**Open design problem:** What is the smallest two-person mechanic that creates genuine reciprocal influence here? This must be settled through design and tested in use before declaring the flagship model successful.

The first scenario is a **proof of the experience**, not a commitment to a bespoke engine or a complete 25-world art production.

---

## 7. What to retain from the current game

The prototype is intentionally established as a separate seventh Arcade card. At creation it retains the **same cover, portal video/intro and all 25 original scenarios**. This provides a stable comparison with the shipped version.

Preserve unless there is a demonstrated reason to change:

- the public Tomorrow Got Weird game and its existing saved progress;
- useful authored scenario questions, twists and prompts as source material;
- Atlas's normal Arcade navigation, appearance and session conventions;
- simple screen-share operation;
- the ability to select or move between futures.

The new prototype already has its own route and progress identity:

- Prototype route: `/arcade/tomorrow-got-weird-proto/`
- Prototype registry ID: `arcade:tomorrow-got-weird-proto`
- The seventh card is an opt-in display on a signed-in browser/account; its direct URL is **intentionally discoverable**. This is **not** a private security boundary.

No additional shared engine, backend, account system or new top-level product structure is justified by this concept.

---

## 8. What not to build by default

Resist these temptations unless playable evidence demonstrates a real need:

- 25 individually commissioned cinematic scene sequences upfront;
- full-bleed image swaps at every stage;
- a 3D explorable city or continuous open world;
- a branching RPG, invented AI character or open-ended simulation;
- speech recognition, automated speech scoring or AI-generated adjudication;
- elaborate points, survival scores or progress mechanics without gameplay value;
- lore exposition, forced scripts or lengthy cutscenes;
- roles where the tutor merely reads out prompts and the learner does all the playing;
- a premature reusable “future-world engine”.

The aim is **one extraordinary, conversationally compelling episode**, not architectural theatre.

---

## 9. How we judge the first experiment

Inspect the working result in-browser, then play it **with two actual people**. These are product questions, not claims already verified:

1. **Arrival:** Does the move from the cover/portal into play feel like entering a real fictional situation?
2. **Clarity:** Can both participants grasp what to do quickly, without a lengthy rules explanation?
3. **Two-person integrity:** Are both meaningfully participating, rather than one providing answers while the other presses buttons?
4. **Conversation:** Does the situation produce authentic, interesting talk — not a series of classroom prompts?
5. **Anomaly:** Does the twist materially change the conversation, or merely add decoration?
6. **Game feel:** Are state changes purposeful, readable, satisfying and memorable?
7. **Usability:** Does it remain comfortable during a live video lesson and on an ordinary screen?
8. **Repeatability:** Is the approach strong enough to support other futures without every episode requiring bespoke infrastructure?

**Failure signals:** a prettier worksheet; a passive tutor; a predictable text reveal dressed up as drama; slow cinematic transitions; or interaction that rewards clicking more than speaking.

When the prototype works, derive a coherent pattern for the remaining futures. If it does not, change the **play structure** before buying more atmosphere.

---

## 10. Immediate next step and decision status

**Next:** Manually play the integrated Clinic welcome in-browser at laptop and mobile sizes; verify that it really plays after Approaching, check the optional scene text against the recording, and test whether both travellers hear it via shared video-call audio. Decide pacing and scene presentation from that evidence. Other voice recordings and a two-person playtest are still outstanding.

**Decided:**
- Future-hopping is the experience fantasy.
- Each future is a contained episode.
- Both people must have meaningful participation.
- Scene states and dramatic transitions are preferable to an image slideshow.
- The public original stays untouched while experimenting in TGW PROTO.

**Not decided:**
- Exact participant roles, turn structure and decision mechanic.
- Whether an upgrade-clinic constraint or alternative premise best produces bilateral play.
- Final visual composition, image count, audio and animation style.
- Whether the new experience deserves to replace the original or be renamed.
- How many scenarios, if any, should be rebuilt after the first.

This is a **working design-direction record**, not the canonical `GAME.md`. Once the actual rules, player roles and states are settled, synthesize the approved design into a game specification rather than treating every concept here as an implementation requirement.

> **Guiding test:** The future should feel like a place. The complication should feel like an event. **The conversation between two people must remain the game.**
