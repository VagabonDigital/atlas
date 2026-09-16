/* Property-based invariant tests for the model.

   These are the CI gates named in the build architecture: every Piece in exactly
   one location, capacity never exceeded by a placement, effects never moving
   Pieces, Undo never crossing Commit or Reveal, and replay equalling the
   snapshot.

   Each property is checked over seeded random walks of legal actions across
   every reference and hostile fixture, so a failure is reproducible from the
   seed it reports. */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
    Actions, reduce, derive, buildContext, createSession,
    checkAction, seams, overCapacityPlaces, canUndo, undo,
    verifyReplay, canonicalState, variantOf, isEditable
} from '../engines/shared-plan/model/index.js';
import { draftNames, revisionFor, rng, pick } from './helpers.js';

const SEEDS = [1, 7, 42, 1337, 90210];
const WALK_LENGTH = 60;

/* Every action the rules currently allow, so the walk only ever tries moves the
   runtime would accept. */
function legalActions(game, session) {
    const ctx = buildContext(game, session);
    const candidates = [];

    for (const piece of game.pieces) {
        for (const place of game.places) candidates.push(Actions.place(piece.key, place.key));
        candidates.push(Actions.cut(piece.key));
        candidates.push(Actions.returnToThreshold(piece.key));
        candidates.push(Actions.pin(piece.key));
    }
    candidates.push(Actions.unpin());
    candidates.push(Actions.commitPlan());
    candidates.push(Actions.bringChange());
    candidates.push(Actions.openRevision());
    candidates.push(Actions.setNewPlan(true));
    candidates.push(Actions.resolveNow());

    return candidates.filter((action) => checkAction(ctx, action).ok);
}

function walk(revision, seed, onStep) {
    const game = revision.compiledGame;
    const random = rng(seed);
    let session = createSession(revision, { sessionId: `seed-${seed}` });

    for (let i = 0; i < WALK_LENGTH; i += 1) {
        const options = legalActions(game, session);
        if (options.length === 0) break;
        const action = pick(random, options);
        const before = session;
        const result = reduce(game, session, action, { at: i });
        assert.ok(result.ok, `legal action ${action.kind} was refused: ${result.refusal?.reason}`);
        session = result.session;
        onStep?.({ before, after: session, action, game, revision });
        if (session.phase === 'resolve') break;
    }
    return session;
}

test('every born Piece is in exactly one location', () => {
    for (const name of draftNames) {
        const revision = revisionFor(name);
        for (const seed of SEEDS) {
            walk(revision, seed, ({ after, game }) => {
                const view = derive(game, after);
                const keys = view.pieces.map((p) => p.key);
                assert.equal(new Set(keys).size, keys.length, `${name}: a Piece appeared twice`);

                const ctx = buildContext(game, after);
                for (const piece of view.pieces) {
                    const loc = ctx.locationOf(piece.key);
                    assert.ok(loc, `${name}: ${piece.key} has no location`);
                    assert.ok(
                        ['threshold', 'place', 'margin'].includes(loc.kind),
                        `${name}: ${piece.key} is in an unknown kind of location`
                    );
                }

                /* A Piece standing in a Place is listed by that Place and by no
                   other, so the Places partition the plan. */
                const seen = new Map();
                for (const place of game.places) {
                    for (const key of ctx.piecesIn(place.key)) {
                        assert.ok(!seen.has(key), `${name}: ${key} is in two Places at once`);
                        seen.set(key, place.key);
                    }
                }
            });
        }
    }
});

test('a placement never exceeds the capacity in force at the time', () => {
    for (const name of draftNames) {
        const revision = revisionFor(name);
        for (const seed of SEEDS) {
            walk(revision, seed, ({ after, action, game }) => {
                if (action.kind !== 'place') return;
                const ctx = buildContext(game, after);
                const held = ctx.piecesIn(action.place).length;
                assert.ok(
                    held <= ctx.capacityOf(action.place),
                    `${name}: ${action.place} holds ${held} of ${ctx.capacityOf(action.place)} after a placement`
                );
            });
        }
    }
});

test('a socket is never occupied by two Pieces', () => {
    for (const name of draftNames) {
        const revision = revisionFor(name);
        for (const seed of SEEDS) {
            walk(revision, seed, ({ after, game }) => {
                const ctx = buildContext(game, after);
                for (const place of game.places) {
                    const sockets = ctx.piecesIn(place.key).map((k) => ctx.locationOf(k).socket);
                    assert.equal(
                        new Set(sockets).size, sockets.length,
                        `${name}: two Pieces share a socket in ${place.key}`
                    );
                }
            });
        }
    }
});

test('no effect ever moves a Piece', () => {
    for (const name of draftNames) {
        const revision = revisionFor(name);
        const game = revision.compiledGame;
        for (const seed of SEEDS) {
            walk(revision, seed, ({ before, after, action }) => {
                if (action.kind !== 'bringChange' && action.kind !== 'setNewPlan') return;
                if (after.firedBeats.length === before.firedBeats.length) return;
                assert.deepEqual(
                    after.placements, before.placements,
                    `${name}: firing a beat changed where Pieces are`
                );
            });
        }

        /* The guarantee is structural as well as observed: no effect in the
           vocabulary carries a destination at all. */
        for (const beat of game.beats) {
            for (const variant of beat.variants) {
                for (const effect of variant.effects) {
                    assert.ok(
                        !Object.hasOwn(effect, 'to') && !Object.hasOwn(effect, 'location'),
                        `${name}: effect ${effect.kind} names a destination`
                    );
                }
            }
        }
    }
});

test('Undo never crosses a Commit or a Reveal', () => {
    for (const name of draftNames) {
        const revision = revisionFor(name);
        const game = revision.compiledGame;
        for (const seed of SEEDS) {
            let session = walk(revision, seed);
            /* Unwind as far as Undo will go and check it never reaches back past
               the most recent boundary. */
            const boundaries = session.actionLog
                .map((entry, i) => ({ kind: entry.kind, i }))
                .filter((e) => ['commitPlan', 'bringChange', 'setNewPlan'].includes(e.kind));

            if (boundaries.length === 0) continue;
            const lastBoundary = boundaries.at(-1).i;

            let guard = 0;
            while (canUndo(session) && guard < 100) {
                session = undo(game, revision, session);
                guard += 1;
            }
            assert.ok(
                session.actionLog.length >= lastBoundary + 1,
                `${name}: Undo reached back past the last Commit or Reveal`
            );
            assert.equal(
                session.actionLog.at(-1).kind,
                boundaries.at(-1).kind,
                `${name}: the action left at the boundary is not the boundary action`
            );
        }
    }
});

test('replay of the action log equals the snapshot', () => {
    for (const name of draftNames) {
        const revision = revisionFor(name);
        const game = revision.compiledGame;
        for (const seed of SEEDS) {
            const session = walk(revision, seed);
            assert.ok(
                verifyReplay(game, revision, session),
                `${name}: replaying the log did not reproduce the session`
            );
        }
    }
});

test('a refused action changes nothing', () => {
    for (const name of draftNames) {
        const revision = revisionFor(name);
        const game = revision.compiledGame;
        const session = walk(revision, 3);
        const before = canonicalState(session);
        const result = reduce(game, session, Actions.place('no-such-piece', 'no-such-place'), { at: 0 });
        assert.equal(result.ok, false);
        assert.equal(canonicalState(result.session), before);
        assert.equal(result.session.actionLog.length, session.actionLog.length);
    }
});

test('the plan is editable only while planning or revising', () => {
    for (const name of draftNames) {
        const revision = revisionFor(name);
        for (const seed of SEEDS) {
            walk(revision, seed, ({ after, game }) => {
                const ctx = buildContext(game, after);
                const movable = game.pieces.some(
                    (p) => game.places.some((pl) => checkAction(ctx, Actions.place(p.key, pl.key)).ok)
                        || checkAction(ctx, Actions.cut(p.key)).ok
                );
                if (movable) {
                    assert.ok(
                        isEditable(after.phase),
                        `${name}: a Piece could be moved during ${after.phase}`
                    );
                }
            });
        }
    }
});

test('a Piece stranded in a closed Place cannot be moved', () => {
    for (const name of draftNames) {
        const revision = revisionFor(name);
        for (const seed of SEEDS) {
            walk(revision, seed, ({ after, game }) => {
                const ctx = buildContext(game, after);
                for (const piece of game.pieces) {
                    const loc = ctx.locationOf(piece.key);
                    if (!loc || loc.kind !== 'place') continue;
                    if (!ctx.world.closedPlaces.has(loc.place)) continue;
                    assert.equal(
                        checkAction(ctx, Actions.cut(piece.key)).ok, false,
                        `${name}: ${piece.key} escaped a closed Place`
                    );
                }
            });
        }
    }
});

test('the first commit is always free of broken Rules', () => {
    for (const name of draftNames) {
        const revision = revisionFor(name);
        const game = revision.compiledGame;
        for (const seed of SEEDS) {
            walk(revision, seed, ({ before, after, action }) => {
                if (action.kind !== 'commitPlan') return;
                const ctx = buildContext(game, before);
                assert.equal(seams(ctx).length, 0, `${name}: committed a plan with broken Rules`);
                assert.equal(overCapacityPlaces(ctx).length, 0, `${name}: committed an overfull plan`);
                assert.equal(after.commitments.length, 1);
            });
        }
    }
});

test('a fired variant always has an applicable effect list', () => {
    for (const name of draftNames) {
        const revision = revisionFor(name);
        const game = revision.compiledGame;
        for (const seed of SEEDS) {
            const session = walk(revision, seed);
            for (const fired of session.firedBeats) {
                const variant = variantOf(game, fired);
                assert.ok(variant, `${name}: fired a variant that does not exist`);
                assert.ok(Array.isArray(variant.effects));
            }
            /* A beat never fires twice. */
            const keys = session.firedBeats.map((f) => f.beat);
            assert.equal(new Set(keys).size, keys.length, `${name}: a beat fired more than once`);
        }
    }
});
