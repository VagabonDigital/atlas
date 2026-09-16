/* Engine One — predicate evaluation.

   One implementation, used by beat guards, Goal conditions, `impossibleWhen`,
   Voice outcome lines, Voice concerns, hindsight notes, the analyser and the
   tests. There is never a second reading of what a predicate means. */

import { comparatorHolds } from './state.js';

export function evaluate(ctx, predicate) {
    switch (predicate.kind) {
        case 'pieceIn':
            return ctx.placeOf(predicate.piece) === predicate.place;

        case 'pieceCut':
            return ctx.isCut(predicate.piece);

        case 'piecePinned':
            return ctx.isPinned(predicate.piece);

        case 'countTagged':
            return comparatorHolds(
                predicate.cmp,
                ctx.taggedCount(predicate.tag, predicate.scope, predicate.place),
                predicate.value
            );

        case 'sumResource':
            return comparatorHolds(
                predicate.cmp,
                ctx.resourceSum(predicate.resource, predicate.scope, predicate.place),
                predicate.value
            );

        case 'beatFired':
            return predicate.variant
                ? ctx.firedVariantSet.has(`${predicate.beat}/${predicate.variant}`)
                : ctx.firedBeatSet.has(predicate.beat);

        case 'adjacent':
            return ctx.piecesAdjacent(predicate.a, predicate.b);

        case 'upstreamOf': {
            const from = ctx.placeOf(predicate.piece);
            if (from === null) return false;
            const target = ctx.orderIndex(predicate.place);
            const at = ctx.orderIndex(from);
            return at >= 0 && target >= 0 && at < target;
        }

        case 'all':
            return predicate.terms.every((term) => evaluate(ctx, term));

        case 'not':
            return !evaluate(ctx, predicate.term);

        default:
            throw new Error(`Unknown predicate kind: ${predicate.kind}`);
    }
}

/* Structural depth and term count, measured by the compiler against the
   budgets. A bare predicate is depth 1. */
export function predicateDepth(predicate) {
    if (predicate.kind === 'all') {
        return 1 + Math.max(...predicate.terms.map(predicateDepth));
    }
    if (predicate.kind === 'not') return 1 + predicateDepth(predicate.term);
    return 1;
}

/* Whether a condition reads the Keep pin. Analysis uses this to tell a variant
   that is unreachable from one that is simply gated on what the learner chose
   to protect. */
export function predicateTouchesPin(predicate) {
    if (predicate.kind === 'piecePinned') return true;
    if (predicate.kind === 'all') return predicate.terms.some(predicateTouchesPin);
    if (predicate.kind === 'not') return predicateTouchesPin(predicate.term);
    return false;
}

/* Every key a predicate mentions, for dead-rule and coverage analysis. */
export function predicateTouches(predicate, out = { pieces: new Set(), places: new Set(), resources: new Set(), beats: new Set(), tags: new Set(), voices: new Set() }) {
    switch (predicate.kind) {
        case 'pieceIn':
            out.pieces.add(predicate.piece);
            out.places.add(predicate.place);
            break;
        case 'pieceCut':
        case 'piecePinned':
            out.pieces.add(predicate.piece);
            break;
        case 'countTagged':
            out.tags.add(predicate.tag);
            if (predicate.place) out.places.add(predicate.place);
            break;
        case 'sumResource':
            out.resources.add(predicate.resource);
            if (predicate.place) out.places.add(predicate.place);
            break;
        case 'beatFired':
            out.beats.add(predicate.beat);
            break;
        case 'adjacent':
            out.pieces.add(predicate.a);
            out.pieces.add(predicate.b);
            break;
        case 'upstreamOf':
            out.pieces.add(predicate.piece);
            out.places.add(predicate.place);
            break;
        case 'all':
            predicate.terms.forEach((t) => predicateTouches(t, out));
            break;
        case 'not':
            predicateTouches(predicate.term, out);
            break;
        default:
            throw new Error(`Unknown predicate kind: ${predicate.kind}`);
    }
    return out;
}
