/* Engine One — the action vocabulary and its legality rules.

   Legality is separated from the reducer so the Stage can ask "may I?" without
   producing a state, and so the analyser can enumerate legal moves using the
   same answers the runtime will give. */

import { isEditable, PHASE_TRANSITIONS } from './phases.js';
import { seams, overCapacityPlaces } from './rules.js';

export const ACTION_KINDS = Object.freeze([
    'place', 'cut', 'returnToThreshold', 'pin', 'unpin',
    'commitPlan', 'bringChange', 'openRevision', 'setNewPlan', 'resolveNow'
]);

export const Actions = Object.freeze({
    place: (piece, place) => ({ kind: 'place', piece, place }),
    cut: (piece) => ({ kind: 'cut', piece }),
    returnToThreshold: (piece) => ({ kind: 'returnToThreshold', piece }),
    pin: (piece) => ({ kind: 'pin', piece }),
    unpin: () => ({ kind: 'unpin' }),
    commitPlan: () => ({ kind: 'commitPlan' }),
    bringChange: () => ({ kind: 'bringChange' }),
    openRevision: () => ({ kind: 'openRevision' }),
    setNewPlan: (confirm = false) => ({ kind: 'setNewPlan', confirm }),
    resolveNow: () => ({ kind: 'resolveNow' })
});

function refuse(reason) {
    return { ok: false, reason };
}

const ALLOWED = { ok: true };

/* A Piece the world has fixed, withdrawn or sealed in stays exactly where it
   is. A closed Place keeps what it was holding: those Pieces are stranded, not
   returned, which is what makes a closure cost something. */
function inertReason(ctx, pieceKey) {
    const piece = ctx.game.pieceIndex[pieceKey];
    if (ctx.world.lockedPieces.has(pieceKey)) return `${piece.name} is locked in place.`;
    if (ctx.world.unavailablePieces.has(pieceKey)) return `${piece.name} is no longer available.`;
    const loc = ctx.locationOf(pieceKey);
    if (loc && loc.kind === 'place' && ctx.world.closedPlaces.has(loc.place)) {
        return `${piece.name} is stranded in ${ctx.game.placeIndex[loc.place].name}.`;
    }
    return null;
}

export function freeSocket(ctx, placeKey) {
    const taken = new Set(
        ctx.piecesIn(placeKey)
            .map((k) => ctx.locationOf(k))
            .filter((loc) => loc && loc.kind === 'place')
            .map((loc) => loc.socket)
    );
    const capacity = ctx.capacityOf(placeKey);
    for (let i = 0; i < capacity; i += 1) if (!taken.has(i)) return i;
    return null;
}

export function checkAction(ctx, action) {
    const { game } = ctx;

    switch (action.kind) {
        case 'place': {
            if (!isEditable(ctx.session.phase)) return refuse('The plan is not editable in this phase.');
            const piece = game.pieceIndex[action.piece];
            const place = game.placeIndex[action.place];
            if (!piece) return refuse(`No such Piece: ${action.piece}.`);
            if (!place) return refuse(`No such Place: ${action.place}.`);
            if (!ctx.world.bornPieces.has(piece.key)) return refuse(`${piece.name} is not in the world yet.`);
            const inert = inertReason(ctx, piece.key);
            if (inert) return refuse(inert);
            if (!ctx.isPlaceOpen(place.key)) return refuse(`${place.name} is closed.`);
            if (ctx.world.lockedPlaces.has(place.key)) return refuse(`${place.name} is locked.`);
            if (ctx.placeOf(piece.key) === place.key) return refuse(`${piece.name} is already in ${place.name}.`);
            if (freeSocket(ctx, place.key) === null) return refuse(`${place.name} is full.`);
            return ALLOWED;
        }

        case 'cut': {
            if (!isEditable(ctx.session.phase)) return refuse('The plan is not editable in this phase.');
            const piece = game.pieceIndex[action.piece];
            if (!piece) return refuse(`No such Piece: ${action.piece}.`);
            if (!ctx.world.bornPieces.has(piece.key)) return refuse(`${piece.name} is not in the world yet.`);
            const inert = inertReason(ctx, piece.key);
            if (inert) return refuse(inert);
            if (ctx.isCut(piece.key)) return refuse(`${piece.name} is already set aside.`);
            return ALLOWED;
        }

        case 'returnToThreshold': {
            /* The Threshold empties at Commit and never refills, so returning to
               it only means anything while the plan is first being built. */
            if (ctx.session.phase !== 'plan') return refuse('The Threshold is only open during planning.');
            const piece = game.pieceIndex[action.piece];
            if (!piece) return refuse(`No such Piece: ${action.piece}.`);
            if (!ctx.world.bornPieces.has(piece.key)) return refuse(`${piece.name} is not in the world yet.`);
            const inert = inertReason(ctx, piece.key);
            if (inert) return refuse(inert);
            const loc = ctx.locationOf(piece.key);
            if (loc.kind === 'threshold') return refuse(`${piece.name} is already at the Threshold.`);
            return ALLOWED;
        }

        case 'pin': {
            if (ctx.session.phase !== 'plan' && ctx.session.phase !== 'commit') {
                return refuse('The Keep pin is declared as the plan is set.');
            }
            const piece = game.pieceIndex[action.piece];
            if (!piece) return refuse(`No such Piece: ${action.piece}.`);
            if (!ctx.inPlan(piece.key)) return refuse(`${piece.name} is not part of the plan.`);
            return ALLOWED;
        }

        case 'unpin':
            if (ctx.session.phase !== 'plan' && ctx.session.phase !== 'commit') {
                return refuse('The Keep pin is declared as the plan is set.');
            }
            if (ctx.session.pinned === null) return refuse('Nothing is pinned.');
            return ALLOWED;

        case 'commitPlan': {
            if (!PHASE_TRANSITIONS.commitPlan.from.includes(ctx.session.phase)) {
                return refuse('The plan has already been committed.');
            }
            /* Commitment is a statement of position, so there has to be a
               position: at least one Piece standing somewhere. */
            const placed = game.pieces.filter((p) => ctx.inPlan(p.key));
            if (placed.length === 0) return refuse('Nothing has been placed yet.');
            const broken = seams(ctx);
            if (broken.length > 0) {
                return refuse(`The first plan must hold together: ${broken.map((s) => s.inscription).join('; ')}.`);
            }
            if (overCapacityPlaces(ctx).length > 0) return refuse('A Place is holding more than it can.');
            return ALLOWED;
        }

        case 'bringChange': {
            if (!PHASE_TRANSITIONS.bringChange.from.includes(ctx.session.phase)) {
                return refuse('There is nothing to bring yet.');
            }
            if (!nextBeat(ctx, 'afterCommit')) return refuse('This world has no change to bring.');
            return ALLOWED;
        }

        case 'openRevision':
            if (!PHASE_TRANSITIONS.openRevision.from.includes(ctx.session.phase)) {
                return refuse('Revision is not available in this phase.');
            }
            return ALLOWED;

        case 'setNewPlan': {
            if (!PHASE_TRANSITIONS.setNewPlan.from.includes(ctx.session.phase)) {
                return refuse('There is no revision open.');
            }
            /* Capacity always blocks physically; a Place cannot hold more than
               it has room for, even after the world shrinks it. */
            if (overCapacityPlaces(ctx).length > 0) return refuse('A Place is holding more than it can.');
            const broken = seams(ctx);
            if (broken.length > 0 && !action.confirm) {
                return {
                    ok: false,
                    reason: 'This plan carries broken Rules.',
                    needsConfirm: true,
                    seams: broken
                };
            }
            return ALLOWED;
        }

        case 'resolveNow':
            if (!PHASE_TRANSITIONS.resolveNow.from.includes(ctx.session.phase)) {
                return refuse('Nothing has been committed yet.');
            }
            return ALLOWED;

        default:
            return refuse(`Unknown action: ${action.kind}.`);
    }
}

/* The next unfired beat for a trigger, in contract order. */
export function nextBeat(ctx, trigger) {
    return ctx.game.beats.find((b) => b.trigger === trigger && !ctx.firedBeatSet.has(b.key)) ?? null;
}

/* The first variant whose guard holds. The compiler proves the final variant is
   unconditional, so this always returns something. */
export function selectVariant(ctx, beat, evaluate) {
    for (const variant of beat.variants) {
        if (!variant.guard || evaluate(ctx, variant.guard)) return variant;
    }
    throw new Error(`Beat ${beat.key} has no unconditional fallback variant.`);
}
