/* Engine One — Session State and the evaluation context.

   Canonical Session State is deliberately small: phase, placements, the pin,
   fired beat history, commitment snapshots, the action log and completion.
   Everything else — capacities, limits, availability, violations, valid
   destinations, change marks — is derived. */

import { deriveWorld } from './effects.js';

export const SESSION_SCHEMA_VERSION = '0';

export const THRESHOLD = Object.freeze({ kind: 'threshold' });
export const MARGIN = Object.freeze({ kind: 'margin' });

export function atPlace(place, socket) {
    return Object.freeze({ kind: 'place', place, socket });
}

export function createSession(revision, { sessionId = null } = {}) {
    return {
        sessionSchemaVersion: SESSION_SCHEMA_VERSION,
        sessionId,
        revisionId: revision.revisionId,
        contentHash: revision.contentHash,
        engineRuntimeVersion: revision.engineRuntimeVersion,
        definitionSchemaVersion: revision.definitionSchemaVersion,
        phase: 'plan',
        /* Sparse: only Pieces the learner has acted on, plus the commit sweep.
           An unlisted born Piece is at the Threshold. */
        placements: Object.create(null),
        pinned: null,
        firedBeats: [],
        commitments: [],
        actionLog: [],
        completion: null
    };
}

export function cloneSession(session) {
    return {
        ...session,
        placements: { ...session.placements },
        firedBeats: session.firedBeats.map((f) => ({ ...f })),
        commitments: session.commitments.map((c) => ({ ...c, placements: { ...c.placements } })),
        actionLog: session.actionLog.map((a) => ({ ...a }))
    };
}

export function buildContext(game, session) {
    const world = deriveWorld(game, session.firedBeats);

    const locationOf = (pieceKey) => {
        if (!world.bornPieces.has(pieceKey)) return null;
        return session.placements[pieceKey] ?? THRESHOLD;
    };
    const placeOf = (pieceKey) => {
        const loc = locationOf(pieceKey);
        return loc && loc.kind === 'place' ? loc.place : null;
    };
    const inPlan = (pieceKey) => placeOf(pieceKey) !== null;
    const isCut = (pieceKey) => {
        const loc = locationOf(pieceKey);
        return Boolean(loc) && loc.kind === 'margin';
    };

    const byPlace = new Map();
    for (const place of game.places) byPlace.set(place.key, []);
    for (const piece of game.pieces) {
        const place = placeOf(piece.key);
        if (place !== null && byPlace.has(place)) byPlace.get(place).push(piece.key);
    }

    const firedVariantSet = new Set(session.firedBeats.map((f) => `${f.beat}/${f.variant}`));
    const firedBeatSet = new Set(session.firedBeats.map((f) => f.beat));

    const piecesIn = (placeKey) => byPlace.get(placeKey) ?? [];

    const resourceSum = (resourceKey, scope, placeKey) => {
        const keys = scope === 'place'
            ? piecesIn(placeKey)
            : game.pieces.filter((p) => inPlan(p.key)).map((p) => p.key);
        let total = 0;
        for (const key of keys) {
            total += game.pieceIndex[key].resources[resourceKey] ?? 0;
        }
        return total;
    };

    const taggedCount = (tag, scope, placeKey) => {
        let keys;
        if (scope === 'place') keys = piecesIn(placeKey);
        else if (scope === 'margin') keys = game.pieces.filter((p) => isCut(p.key)).map((p) => p.key);
        else keys = game.pieces.filter((p) => inPlan(p.key)).map((p) => p.key);
        return keys.filter((k) => game.pieceIndex[k].tags.includes(tag)).length;
    };

    const orderIndex = (placeKey) => game.topology.order.indexOf(placeKey);

    const adjacentPlaces = (placeKey) => game.topology.adjacency[placeKey] ?? [];

    /* Two Pieces count as adjacent when they share a Place or sit in Places the
       site template joins. "Near" is about how close they ended up, and nothing
       is closer than the same Place. */
    const piecesAdjacent = (a, b) => {
        const pa = placeOf(a);
        const pb = placeOf(b);
        if (pa === null || pb === null) return false;
        if (pa === pb) return true;
        return adjacentPlaces(pa).includes(pb);
    };

    return {
        game,
        session,
        world,
        locationOf,
        placeOf,
        inPlan,
        isCut,
        isPinned: (pieceKey) => session.pinned === pieceKey,
        piecesIn,
        resourceSum,
        taggedCount,
        orderIndex,
        adjacentPlaces,
        piecesAdjacent,
        firedVariantSet,
        firedBeatSet,
        isPlaceOpen: (placeKey) => world.bornPlaces.has(placeKey) && !world.closedPlaces.has(placeKey),
        capacityOf: (placeKey) => world.capacity[placeKey] ?? 0,
        limitOf: (resourceKey) => world.resourceLimit[resourceKey] ?? 0
    };
}

/* The Pieces that currently exist, in contract order. */
export function bornPieces(game, ctx) {
    return game.pieces.filter((p) => ctx.world.bornPieces.has(p.key));
}

export function comparatorHolds(cmp, left, right) {
    switch (cmp) {
        case 'eq': return left === right;
        case 'ne': return left !== right;
        case 'lt': return left < right;
        case 'lte': return left <= right;
        case 'gt': return left > right;
        case 'gte': return left >= right;
        default: throw new Error(`Unknown comparator: ${cmp}`);
    }
}
