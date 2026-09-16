/* Engine One — the reducer.

   Pure. No DOM, no time, no randomness, no persistence. Timestamps are supplied
   by the caller, stored in the log and never read back into state. */

import { buildContext, cloneSession, atPlace, MARGIN, THRESHOLD } from './state.js';
import { checkAction, freeSocket, nextBeat, selectVariant } from './actions.js';
import { evaluate } from './predicates.js';

function snapshot(session, at) {
    return { at, placements: { ...session.placements }, pinned: session.pinned };
}

/* Returns { ok, session, refusal }. A refused action leaves the session
   untouched and is never written to the log, so replay and state always agree. */
export function reduce(game, session, action, { at = null } = {}) {
    const ctx = buildContext(game, session);
    const verdict = checkAction(ctx, action);
    if (!verdict.ok) return { ok: false, session, refusal: verdict };

    const next = cloneSession(session);

    switch (action.kind) {
        case 'place':
            next.placements[action.piece] = atPlace(action.place, freeSocket(ctx, action.place));
            break;

        case 'cut':
            next.placements[action.piece] = MARGIN;
            break;

        case 'returnToThreshold':
            next.placements[action.piece] = THRESHOLD;
            break;

        case 'pin':
            next.pinned = action.piece;
            break;

        case 'unpin':
            next.pinned = null;
            break;

        case 'commitPlan': {
            /* The Threshold empties into the Margin, one Piece at a time, so
               what was not chosen is named rather than silently dropped. */
            for (const piece of game.pieces) {
                if (!ctx.world.bornPieces.has(piece.key)) continue;
                if (ctx.locationOf(piece.key).kind === 'threshold') next.placements[piece.key] = MARGIN;
            }
            next.phase = 'commit';
            next.commitments.push(snapshot(next, 'commit'));
            break;
        }

        case 'bringChange': {
            const beat = nextBeat(ctx, 'afterCommit');
            const variant = selectVariant(ctx, beat, evaluate);
            next.firedBeats.push({ beat: beat.key, variant: variant.key });
            next.phase = 'react';
            break;
        }

        case 'openRevision':
            next.phase = 'revise';
            break;

        case 'setNewPlan': {
            next.commitments.push(snapshot(next, 'revise'));
            const afterCtx = buildContext(game, next);
            const aftershock = nextBeat(afterCtx, 'afterRevision');
            if (aftershock) {
                const variant = selectVariant(afterCtx, aftershock, evaluate);
                next.firedBeats.push({ beat: aftershock.key, variant: variant.key });
                next.phase = 'react';
            } else {
                next.phase = 'resolve';
                next.completion = { reason: 'played' };
            }
            break;
        }

        case 'resolveNow':
            next.phase = 'resolve';
            next.completion = { reason: 'resolvedEarly' };
            break;

        default:
            throw new Error(`Unhandled action: ${action.kind}`);
    }

    next.actionLog.push({ ...action, at });
    return { ok: true, session: next, refusal: null };
}

/* Convenience for scripted sessions and tests: throws on refusal rather than
   quietly returning the old state. */
export function apply(game, session, action, opts) {
    const result = reduce(game, session, action, opts);
    if (!result.ok) {
        throw new Error(`Action ${action.kind} refused: ${result.refusal.reason}`);
    }
    return result.session;
}
