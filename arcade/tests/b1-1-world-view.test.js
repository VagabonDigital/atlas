/* B1.1 — Stage-facing World View additions and the Then/Now history projection.

   Every addition here is additive: the reducer and canonical Session State are
   untouched, and the existing World View fields are unchanged. These tests hold
   the new fields to what the Stage will rely on. */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
    Actions, apply, reduce, derive, createSession, buildContext,
    canonicalState, variantTouches, locusId, deriveThen, subjectPieces, isEditable
} from '../engines/shared-plan/model/index.js';
import { autoplay, findCommitFor } from '../harness/autoplay.js';
import { draftNames, revisionFor } from './helpers.js';
import { statesAlong, walkStates } from './walks.js';

const PAIR_RULES = new Set(['together', 'apart', 'near', 'far', 'before']);

test('beatCount and lastChange follow the fired beats exactly', () => {
    for (const name of draftNames) {
        const revision = revisionFor(name);
        const game = revision.compiledGame;
        for (const session of statesAlong(game, revision, autoplay(revision).session.actionLog)) {
            const view = derive(game, session);
            assert.equal(view.beatCount, session.firedBeats.length, `${name}: beatCount drifted`);

            const last = session.firedBeats.at(-1);
            if (!last) {
                assert.equal(view.lastChange, null, `${name}: a change was reported before any beat fired`);
                continue;
            }
            const variant = game.beatIndex[last.beat].variantIndex[last.variant];
            assert.equal(view.lastChange.beat, last.beat);
            assert.equal(view.lastChange.variant, last.variant);
            assert.equal(view.lastChange.trigger, game.beatIndex[last.beat].trigger);
            assert.equal(view.lastChange.staging, variant.staging);
            assert.equal(view.lastChange.severity, variant.severity);
            assert.equal(view.lastChange.entryEdge, variant.entryEdge);
            assert.deepEqual(view.lastChange.locus, variant.locus);
            assert.equal(view.lastChange.headline, variant.headline);
            assert.equal(view.lastChange.scarLabel, variant.scarLabel);
            assert.deepEqual(view.lastChange.touched, variantTouches(game, variant));
        }
    }
});

test('a change touches its locus and everything its effects alter', () => {
    for (const name of draftNames) {
        const game = revisionFor(name).compiledGame;
        for (const beat of game.beats) {
            for (const variant of beat.variants) {
                const touched = new Set(variantTouches(game, variant));
                const where = `${name} ${beat.key}/${variant.key}`;
                assert.ok(touched.has(locusId(variant.locus)), `${where}: the locus is not touched`);
                for (const effect of variant.effects) {
                    if (effect.place) assert.ok(touched.has(`place:${effect.place}`), `${where}: ${effect.kind} place`);
                    if (effect.piece) assert.ok(touched.has(`piece:${effect.piece}`), `${where}: ${effect.kind} piece`);
                    if (effect.voice) assert.ok(touched.has(`voice:${effect.voice}`), `${where}: ${effect.kind} voice`);
                    if (effect.goal) assert.ok(touched.has(`goal:${effect.goal}`), `${where}: ${effect.kind} goal`);
                    if (effect.kind === 'introducePiece') assert.ok(touched.has('threshold'), `${where}: arrival at the Threshold`);
                }
                assert.deepEqual([...touched], [...touched].sort(), `${where}: touched loci are not sorted`);
            }
        }
    }

    /* Severing touches everything downstream, not just the named stop. */
    const route = revisionFor('r-b').compiledGame;
    const severed = route.beatIndex['the-sever'].variantIndex['weather-wins'];
    const touched = variantTouches(route, severed);
    for (const place of ['quay', 'midpoint', 'far-shore']) {
        assert.ok(touched.includes(`place:${place}`), `severing after the quay must touch ${place}`);
    }
});

test('every Seam names the Pieces it concerns', () => {
    const observed = new Set();
    for (const name of draftNames) {
        const revision = revisionFor(name);
        const game = revision.compiledGame;
        for (const seed of [1, 42]) {
            for (const session of walkStates(revision, seed)) {
                const view = derive(game, session);
                const born = new Set(view.pieces.map((p) => p.key));
                for (const seam of view.seams) {
                    const rule = game.ruleIndex[seam.rule];
                    observed.add(rule.kind);
                    assert.ok(seam.involves.length > 0, `${name}: a Seam of ${seam.rule} involves nobody`);
                    for (const key of seam.involves) {
                        assert.ok(born.has(key), `${name}: ${seam.rule} involves ${key}, which does not exist yet`);
                    }
                    if (seam.locus.kind === 'piece') {
                        assert.ok(seam.involves.includes(seam.locus.piece), `${name}: ${seam.rule} omits its own locus`);
                    }
                    if (PAIR_RULES.has(rule.kind)) {
                        assert.deepEqual(
                            [...seam.involves].sort(), [rule.a, rule.b].filter((k) => born.has(k)).sort(),
                            `${name}: ${seam.rule} should involve exactly its two Pieces`
                        );
                    }
                }
            }
        }
    }
    /* Every Rule kind the fixtures use must actually have been seen broken. */
    for (const kind of ['sumLimit', 'allowedIn', 'requires', 'together', 'apart', 'before']) {
        assert.ok(observed.has(kind), `no ${kind} Seam was ever observed, so this test proved nothing about it`);
    }
});

test('any Seam a single move opens or closes is at the target or involves the moved Piece', () => {
    /* This is the property the Stage's local preview depends on: filtering to the
       target Place plus "involves the held Piece" never hides a consequence. */
    const changedKinds = new Set();
    for (const name of draftNames) {
        const revision = revisionFor(name);
        const game = revision.compiledGame;
        const seamId = (s) => `${s.rule}@${locusId(s.locus)}`;

        for (const session of walkStates(revision, 7, 40)) {
            if (!isEditable(session.phase)) continue;
            const before = derive(game, session);
            const beforeSeams = new Map(before.seams.map((s) => [seamId(s), s]));

            for (const piece of before.pieces) {
                const targets = [
                    ...game.places.map((p) => ({ action: Actions.place(piece.key, p.key), place: p.key })),
                    { action: Actions.cut(piece.key), place: null }
                ];
                for (const { action, place } of targets) {
                    const result = reduce(game, session, action);
                    if (!result.ok) continue;
                    const after = derive(game, result.session);
                    const afterSeams = new Map(after.seams.map((s) => [seamId(s), s]));

                    const changed = [
                        ...[...afterSeams].filter(([id]) => !beforeSeams.has(id)).map(([, s]) => s),
                        ...[...beforeSeams].filter(([id]) => !afterSeams.has(id)).map(([, s]) => s)
                    ];
                    for (const seam of changed) {
                        changedKinds.add(game.ruleIndex[seam.rule].kind);
                        const atTarget = place !== null && seam.locus.kind === 'place' && seam.locus.place === place;
                        assert.ok(
                            atTarget || seam.involves.includes(piece.key),
                            `${name}: moving ${piece.key} changed ${seamId(seam)}, which the preview filter would hide`
                        );
                    }
                }
            }
        }
    }
    for (const kind of ['sumLimit', 'allowedIn', 'requires', 'together', 'apart', 'before']) {
        assert.ok(changedKinds.has(kind), `no single move ever opened or closed a ${kind} Seam, so this test proved nothing about it`);
    }
});

test('affinity marks connect restricted Pieces to the Places they may enter', () => {
    const table = revisionFor('r-a');
    const view = derive(table.compiledGame, createSession(table));
    const piece = (k) => view.pieces.find((p) => p.key === k);
    const place = (k) => view.places.find((p) => p.key === k);
    assert.deepEqual(piece('sofia').affinity, [0], 'the only child carries the children-inside mark');
    assert.deepEqual(piece('nadia').affinity, [], 'unrestricted Pieces carry no mark');
    assert.deepEqual(place('hearth-table').affinity, [0]);
    assert.deepEqual(place('window-table').affinity, [0]);
    assert.deepEqual(place('porch-table').affinity, []);

    const route = revisionFor('r-b');
    const routeView = derive(route.compiledGame, createSession(route));
    for (const key of ['medkit', 'grain', 'lamps']) {
        assert.deepEqual(routeView.pieces.find((p) => p.key === key).affinity, [0], `${key} is a supply`);
    }
    assert.deepEqual(routeView.pieces.find((p) => p.key === 'pump').affinity, []);
    for (const key of ['midpoint', 'far-shore']) {
        assert.deepEqual(routeView.places.find((p) => p.key === key).affinity, [0], `${key} takes supplies`);
    }
    assert.deepEqual(routeView.places.find((p) => p.key === 'quay').affinity, []);

    /* A dormant allowed-in Rule shows no mark until a beat wakes it, and then keeps
       the index it always had. */
    const dormant = revisionFor('h-6');
    const dg = dormant.compiledGame;
    const start = derive(dg, createSession(dormant));
    assert.ok(start.places.every((p) => p.affinity.length === 0));
    assert.ok(start.pieces.every((p) => p.affinity.length === 0));
    const end = derive(dg, autoplay(dormant).session);
    assert.deepEqual(end.places.find((p) => p.key === 'annexe').affinity, [0]);
    for (const late of ['third', 'fourth']) {
        assert.deepEqual(end.pieces.find((p) => p.key === late).affinity, [0], `${late} should carry the woken mark`);
    }

    /* In every world, a shared mark means the Piece is allowed in that Place. */
    for (const name of draftNames) {
        const revision = revisionFor(name);
        const game = revision.compiledGame;
        const allowedIn = game.rules.filter((r) => r.kind === 'allowedIn');
        for (const session of walkStates(revision, 90210, 30)) {
            const v = derive(game, session);
            const ctx = buildContext(game, session);
            for (const p of v.pieces) {
                for (const index of p.affinity) {
                    const rule = allowedIn[index];
                    assert.ok(ctx.world.activeRules.has(rule.key), `${name}: mark ${index} shown for a dormant Rule`);
                    assert.ok(subjectPieces(game, rule.subject).includes(p.key), `${name}: ${p.key} wrongly marked`);
                }
            }
            for (const pl of v.places) {
                for (const index of pl.affinity) {
                    assert.ok(allowedIn[index].places.includes(pl.key), `${name}: ${pl.key} wrongly marked`);
                }
            }
        }
    }
});

test('journeys record where each Piece stood at every commitment and at the end', () => {
    for (const name of draftNames) {
        const revision = revisionFor(name);
        const game = revision.compiledGame;
        const { session } = autoplay(revision);
        const view = derive(game, session);
        assert.ok(view.resolution, `${name}: autoplay should end at Resolve`);
        for (const journey of view.resolution.journeys) {
            assert.equal(journey.path.length, session.commitments.length + 1, `${name}: ${journey.piece} path length`);
            session.commitments.forEach((commitment, i) => {
                assert.equal(journey.path[i].at, commitment.at);
                assert.deepEqual(journey.path[i].location, commitment.placements[journey.piece] ?? null);
            });
            assert.deepEqual(journey.path[0].location, journey.from, `${name}: ${journey.piece} path does not start where it was set`);
            assert.deepEqual(journey.path.at(-1), { at: 'final', location: journey.to });
        }
    }
});

test('primary action descriptors carry the placement the contract requires', () => {
    for (const name of draftNames) {
        const revision = revisionFor(name);
        const game = revision.compiledGame;
        for (const session of walkStates(revision, 1337)) {
            const actions = derive(game, session).primaryActions;
            assert.equal(actions[0].placement, 'primary', `${name}: the first descriptor must be the primary action`);
            assert.equal(actions.filter((a) => a.placement === 'primary').length, 1, `${name}: exactly one primary`);
            for (const action of actions) {
                assert.ok(['primary', 'secondary', 'menu'].includes(action.placement));
                assert.ok(['press', 'hold'].includes(action.interaction));
                assert.equal(typeof action.enabled, 'boolean');
                assert.ok(action.id && action.label);
                if (!action.enabled) assert.ok(action.reason, `${name}: ${action.id} is disabled without a reason`);
                if (action.id === 'resolveNow') assert.equal(action.placement, 'menu');
            }
        }
    }
});

/* ---- Then/Now ---- */

function firstStateIn(states, phase, occurrence = 1) {
    let seen = 0;
    for (const state of states) {
        if (state.phase === phase) {
            seen += 1;
            if (seen === occurrence) return state;
        }
    }
    return null;
}

function placementsOf(view) {
    return Object.fromEntries(view.pieces.map((p) => [p.key, p.location]));
}

test('there is no "then" before a plan has been committed', () => {
    for (const name of draftNames) {
        const revision = revisionFor(name);
        assert.equal(deriveThen(revision.compiledGame, revision, createSession(revision)), null);
    }
});

test('during revision, "then" is the plan being revised, in the world before the change', () => {
    const revision = revisionFor('r-a');
    const game = revision.compiledGame;
    const { session } = autoplay(revision, { target: { beat: 'the-arrival', variant: 'porch-shut' } });
    const revising = firstStateIn(statesAlong(game, revision, session.actionLog), 'revise');

    const then = deriveThen(game, revision, revising);
    assert.equal(then.then, true);
    assert.equal(then.phase, 'commit');
    assert.equal(then.beatCount, 0, 'the change has not happened yet in "then"');
    assert.deepEqual(then.primaryActions, [], '"then" never offers actions');
    assert.equal(then.places.find((p) => p.key === 'porch-table').closed, false, 'the porch was still open then');
    assert.ok(!then.pieces.some((p) => p.key === 'orsolya'), 'the arrival had not arrived then');

    const committed = revising.commitments[0].placements;
    for (const [key, location] of Object.entries(placementsOf(then))) {
        assert.deepEqual(location, committed[key], `${key} is not where it was committed`);
    }
});

test('a Keep pin declared just after committing belongs to "then"', () => {
    const revision = revisionFor('r-b');
    const game = revision.compiledGame;
    const found = findCommitFor(game, revision, 'the-sever', 'engine-held');
    assert.ok(found, 'r-b must have a plan that selects engine-held');

    let session = createSession(revision);
    for (const [key, location] of Object.entries(found.placements)) {
        if (location.kind === 'place') session = apply(game, session, Actions.place(key, location.place));
    }
    session = apply(game, session, Actions.commitPlan());
    session = apply(game, session, Actions.pin('pump'));
    session = apply(game, session, Actions.bringChange());
    session = apply(game, session, Actions.openRevision());

    const then = deriveThen(game, revision, session);
    assert.equal(then.pieces.find((p) => p.key === 'pump').pinned, true, 'the pin declared at commit is part of the plan as set');
});

test('after an aftershock, "then" is the revised plan in the world before the aftershock', () => {
    const revision = revisionFor('h-4');
    const game = revision.compiledGame;
    const states = statesAlong(game, revision, autoplay(revision).session.actionLog);
    const secondRevision = firstStateIn(states, 'revise', 2);
    assert.ok(secondRevision, 'h-4 must reach a second revision');

    const then = deriveThen(game, revision, secondRevision);
    assert.equal(then.beatCount, 1, '"then" sits between the revised plan and the aftershock');
    assert.equal(then.pieces.find((p) => p.key === 'nurse').unavailable, false, 'the nurse had not been recalled yet');
    const revised = secondRevision.commitments[1].placements;
    for (const [key, location] of Object.entries(placementsOf(then))) {
        if (revised[key]) assert.deepEqual(location, revised[key], `${key} is not where the revised plan set it`);
    }
});

test('at Resolve, "then" is the position originally taken', () => {
    for (const name of draftNames) {
        const revision = revisionFor(name);
        const game = revision.compiledGame;
        const { session } = autoplay(revision);
        const then = deriveThen(game, revision, session);
        assert.equal(then.beatCount, 0, `${name}: the original position predates every change`);
        const original = session.commitments[0].placements;
        for (const [key, location] of Object.entries(placementsOf(then))) {
            if (original[key]) assert.deepEqual(location, original[key], `${name}: ${key}`);
        }
    }
});

test('deriving "then" leaves the session untouched', () => {
    for (const name of draftNames) {
        const revision = revisionFor(name);
        const game = revision.compiledGame;
        for (const session of statesAlong(game, revision, autoplay(revision).session.actionLog)) {
            const before = canonicalState(session);
            const logLength = session.actionLog.length;
            deriveThen(game, revision, session);
            assert.equal(canonicalState(session), before, `${name}: deriveThen mutated the session`);
            assert.equal(session.actionLog.length, logLength);
        }
    }
});
