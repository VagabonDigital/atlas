/* A scripted, deterministic player.

   It drives any Definition through the whole loop without a Stage: plan, commit,
   bring the change, open revision, repair, set the new plan, resolve. It picks
   its plans with the enumerator, so it plays legally but not cleverly.

   It is not a model of a learner. It exists so that every reference and every
   hostile fixture can be run end to end from a script and narrated, and so that
   a contrasting game proves it needs no engine change to be playable. */

import {
    Actions, reduce, derive, buildContext, evaluate,
    firstValidCommit, sampleArrangements, enumerateRevisions, variantForCommit,
    overCapacityPlaces, seams, createSession
} from '../engines/shared-plan/model/index.js';

/* Finds a legal commit that makes a named variant fire, trying each candidate
   Keep pin as well as no pin, so pin-guarded variants are reachable too.
   Without this a scripted playthrough only ever sees whichever variant the
   first legal plan happens to select. */
export function findCommitFor(game, revision, beatKey, variantKey, { limit = 5000 } = {}) {
    const beat = game.beatIndex[beatKey];
    if (!beat) return null;

    /* Depth-first order makes nearby arrangements very similar, so a small
       sample can miss a variant that is perfectly reachable. The budget is
       generous for that reason, and a miss is reported as "not found", never as
       proof of unreachability — the analyser settles that question. */
    const { arrangements } = sampleArrangements(game, revision, { target: limit, nodeBudget: 400000 });

    for (const placements of arrangements) {
        if (variantForCommit(game, revision, beat, placements).key === variantKey) {
            return { placements, pin: null };
        }
        const inPlan = Object.entries(placements)
            .filter(([, loc]) => loc.kind === 'place')
            .map(([key]) => key);
        for (const pin of inPlan) {
            const ctx = buildContext(game, { ...createSession(revision), placements, pinned: pin, phase: 'commit' });
            const chosen = beat.variants.find((v) => !v.guard || evaluate(ctx, v.guard));
            if (chosen?.key === variantKey) return { placements, pin };
        }
    }
    return null;
}

function step(game, session, action, trace, note) {
    const result = reduce(game, session, action, { at: trace.length });
    trace.push({
        action,
        note,
        ok: result.ok,
        refusal: result.refusal?.reason ?? null,
        phase: result.session.phase
    });
    return result;
}

function must(game, session, action, trace, note) {
    const result = step(game, session, action, trace, note);
    if (!result.ok) throw new Error(`${action.kind} refused: ${result.refusal.reason}`);
    return result.session;
}

/* Emits the moves that turn the current arrangement into the target one. Every
   Piece that is standing somewhere it should not be leaves first, so a socket is
   never contested. */
function moveToward(game, session, target, trace) {
    let current = session;
    let ctx = buildContext(game, current);

    for (const piece of game.pieces) {
        if (!ctx.world.bornPieces.has(piece.key)) continue;
        const now = ctx.locationOf(piece.key);
        const want = target[piece.key];
        if (now.kind !== 'place') continue;
        if (want && want.kind === 'place' && want.place === now.place) continue;
        const result = step(game, current, Actions.cut(piece.key), trace, 'clear the socket');
        if (result.ok) current = result.session;
        ctx = buildContext(game, current);
    }

    for (const piece of game.pieces) {
        if (!ctx.world.bornPieces.has(piece.key)) continue;
        const want = target[piece.key];
        if (!want || want.kind !== 'place') continue;
        const now = ctx.locationOf(piece.key);
        if (now.kind === 'place' && now.place === want.place) continue;
        const result = step(game, current, Actions.place(piece.key, want.place), trace, 'take up the new position');
        if (result.ok) current = result.session;
        ctx = buildContext(game, current);
    }

    return current;
}

/* Last resort when no seam-free revision exists: shed whatever is overflowing so
   the plan is at least physically possible, and accept the broken Rules. */
function relieveOverflow(game, session, trace) {
    let current = session;
    for (let guard = 0; guard < 32; guard += 1) {
        const ctx = buildContext(game, current);
        const overflow = overCapacityPlaces(ctx);
        if (overflow.length === 0) return current;
        const place = overflow[0].place;
        const movable = ctx.piecesIn(place).filter(
            (k) => !ctx.world.lockedPieces.has(k) && !ctx.world.unavailablePieces.has(k)
        );
        if (movable.length === 0) return current;
        const result = step(game, current, Actions.cut(movable.at(-1)), trace, 'shed the overflow');
        if (!result.ok) return current;
        current = result.session;
    }
    return current;
}

export function autoplay(revision, { pin = null, target = null, maxBeats = 4 } = {}) {
    const game = revision.compiledGame;
    const trace = [];
    let session = createSession(revision, { sessionId: 'harness' });

    let opening = null;
    let chosenPin = pin;
    if (target) {
        const found = findCommitFor(game, revision, target.beat, target.variant);
        if (!found) throw new Error(`No legal commit makes ${target.beat}/${target.variant} fire.`);
        opening = found.placements;
        chosenPin = pin ?? found.pin;
    } else {
        opening = firstValidCommit(game, revision);
    }
    if (!opening) throw new Error('No valid commit exists, so this world cannot be played.');

    session = moveToward(game, session, opening, trace);

    if (chosenPin) {
        const result = step(game, session, Actions.pin(chosenPin), trace, 'declare what to protect');
        if (result.ok) session = result.session;
    }

    session = must(game, session, Actions.commitPlan(), trace, 'set the plan in ink');

    for (let beat = 0; beat < maxBeats; beat += 1) {
        if (session.phase !== 'commit' && session.phase !== 'react') break;

        if (session.phase === 'commit') {
            const result = step(game, session, Actions.bringChange(), trace, 'bring the change');
            if (!result.ok) break;
            session = result.session;
        }

        session = must(game, session, Actions.openRevision(), trace, 'open revision');

        const { arrangements } = enumerateRevisions(
            game, revision, session.placements, session.firedBeats, { limit: 1 }
        );
        if (arrangements.length > 0) {
            session = moveToward(game, session, arrangements[0], trace);
        } else {
            session = relieveOverflow(game, session, trace);
        }

        const ctx = buildContext(game, session);
        const broken = seams(ctx).length > 0;
        const result = step(
            game, session, Actions.setNewPlan(broken), trace,
            broken ? 'set the new plan, broken Rules and all' : 'set the new plan'
        );
        if (!result.ok) {
            session = must(game, session, Actions.resolveNow(), trace, 'end it cleanly');
            break;
        }
        session = result.session;
    }

    if (session.phase !== 'resolve') {
        session = must(game, session, Actions.resolveNow(), trace, 'end it cleanly');
    }

    return { session, trace, view: derive(game, session) };
}
