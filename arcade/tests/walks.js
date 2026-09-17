/* Session walks shared by the B1.1 tests.

   Every state along a scripted log, and seeded random walks through legal
   actions, so a failing property names a seed that reproduces it exactly. */

import {
    Actions, apply, reduce, createSession, buildContext, checkAction
} from '../engines/shared-plan/model/index.js';
import { rng, pick } from './helpers.js';

export function statesAlong(game, revision, actionLog) {
    let session = createSession(revision);
    const states = [session];
    for (const entry of actionLog) {
        const { at = null, ...action } = entry;
        session = apply(game, session, action, { at });
        states.push(session);
    }
    return states;
}

export function legalActions(game, session) {
    const ctx = buildContext(game, session);
    const candidates = [];
    for (const piece of game.pieces) {
        for (const place of game.places) candidates.push(Actions.place(piece.key, place.key));
        candidates.push(Actions.cut(piece.key), Actions.returnToThreshold(piece.key), Actions.pin(piece.key));
    }
    candidates.push(Actions.unpin(), Actions.commitPlan(), Actions.bringChange(),
        Actions.openRevision(), Actions.setNewPlan(true), Actions.resolveNow());
    return candidates.filter((a) => checkAction(ctx, a).ok);
}

export function walkStates(revision, seed, length = 60) {
    const game = revision.compiledGame;
    const random = rng(seed);
    let session = createSession(revision);
    const states = [session];
    for (let i = 0; i < length; i += 1) {
        const options = legalActions(game, session);
        if (options.length === 0) break;
        session = reduce(game, session, pick(random, options), { at: i }).session;
        states.push(session);
        if (session.phase === 'resolve') break;
    }
    return states;
}
