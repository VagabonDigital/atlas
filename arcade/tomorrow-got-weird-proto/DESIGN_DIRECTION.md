# Tomorrow Got Weird — PROTO
## Future-Hopping Experience · Concept & Design Direction

**Date:** 24 October 2026  
**Status:** Working concept — **not** a settled game specification or an instruction to implement every idea below.  
**Owner:** Atlas Arcade Studio  
**Prototype:** `arcade/tomorrow-got-weird-proto/`  
**Public original:** `arcade/tomorrow-got-weird/`

> **Central ambition:** Stop presenting the future as something to read about. Start presenting it as somewhere two people have arrived — and must respond to together.

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

**Next:** Define the actual **two-person interaction for the Upgrade Clinic**, then build and inspect one complete episode covering arrival, shared decision, authored complication, response and departure.

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
