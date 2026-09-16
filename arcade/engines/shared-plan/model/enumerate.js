/* Engine One — exhaustive enumeration of the plan space.

   The runtime never searches. Analysis verifies by search, before play. This
   module is the one search, and it lives in the model because both the compiler
   (which must prove a valid commit exists, and that `impossibleWhen` is honest)
   and the analyser (which measures whether the dilemma is real) need it. Putting
   it anywhere else would create a second reading of the rules.

   Budgets exist for analysability as much as for pedagogy: at most 8 Pieces
   across at most 5 Places is tractable once capacity, allowed-Place and
   resource pruning are applied. If a future capability makes this intractable,
   that is evidence the capability does not belong in this engine. */

import { buildContext, MARGIN, atPlace } from './state.js';
import { seams, overCapacityPlaces, subjectPieces } from './rules.js';
import { evaluate } from './predicates.js';
import { selectVariant } from './actions.js';

export const DEFAULT_NODE_BUDGET = 400000;

export function syntheticSession(revisionLike, placements, extra = {}) {
    return {
        sessionSchemaVersion: '0',
        sessionId: null,
        revisionId: revisionLike.revisionId ?? null,
        contentHash: revisionLike.contentHash ?? null,
        engineRuntimeVersion: revisionLike.engineRuntimeVersion ?? null,
        definitionSchemaVersion: revisionLike.definitionSchemaVersion ?? null,
        phase: 'commit',
        placements: { ...placements },
        pinned: null,
        firedBeats: [],
        commitments: [],
        actionLog: [],
        completion: null,
        ...extra
    };
}

/* Which Places a Piece may legally stand in, from the active allowedIn Rules.
   Used for pruning; the real Rule check still runs at every leaf. */
function allowedPlacesFor(game, world, pieceKey) {
    const open = game.places
        .filter((p) => world.bornPlaces.has(p.key) && !world.closedPlaces.has(p.key) && !world.lockedPlaces.has(p.key))
        .map((p) => p.key);

    const constraints = game.rules.filter(
        (r) => r.kind === 'allowedIn'
            && world.activeRules.has(r.key)
            && subjectPieces(game, r.subject).includes(pieceKey)
    );
    if (constraints.length === 0) return open;
    return open.filter((placeKey) => constraints.every((r) => r.places.includes(placeKey)));
}

/* A resource limit only constrains the plan when an active sumLimit Rule makes
   it bite. A resource that exists only to be counted by a Goal must not prune
   the search, or arrangements the runtime would accept would go missing. */
function limitedResources(game, world, scope) {
    return game.resources.filter(
        (r) => r.scope === scope
            && game.rules.some((rule) => rule.kind === 'sumLimit'
                && rule.resource === r.key
                && world.activeRules.has(rule.key))
    );
}

/* Depth-first assignment of every Piece to a Place or the Margin, pruning on
   the monotone constraints (capacity and resource sums only ever grow) and
   validating each complete arrangement against the real Rule implementation. */
export function enumerateArrangements(game, revisionLike, options = {}) {
    const {
        firedBeats = [],
        fixed = {},
        limit = Infinity,
        nodeBudget = DEFAULT_NODE_BUDGET,
        requireNonEmpty = true,
        onArrangement = null,
        rotate = 0
    } = options;

    const probe = buildContext(game, syntheticSession(revisionLike, {}, { firedBeats }));
    const world = probe.world;

    const unordered = game.pieces.filter(
        (p) => world.bornPieces.has(p.key) && !Object.hasOwn(fixed, p.key)
    );

    /* Which Piece is assigned first shapes the whole tree, and in a world with
       only two Places rotating the Places alone has a period of two. Rotating
       the assignment order as well gives a genuinely different walk per round,
       which is what stops a truncated sample from reporting "every legal plan
       cuts the rations" when it only means "this corner of the tree does".

       Round zero is always the contract order, so the default search — the one
       that answers "does any legal plan exist?" — stays the cheapest walk and
       does not shift under a change to the sampling strategy. */
    const pieceShift = rotate > 0 && unordered.length > 0 ? rotate % unordered.length : 0;
    const movable = [...unordered.slice(pieceShift), ...unordered.slice(0, pieceShift)];

    /* Depth-first search explores one subtree exhaustively before touching the
       next, so the first N arrangements it yields are all minor variations of
       each other. When the search is truncated that makes the sample a biased
       picture of the plan space. Rotating which Place each Piece tries first
       gives a structurally different walk for the same world, so a caller can
       stratify a sample across several rotations and still be deterministic. */
    const allowed = new Map();
    movable.forEach((piece, i) => {
        const places = allowedPlacesFor(game, world, piece.key);
        /* Offsetting by the Piece's own index as well as the round means
           different Pieces shift differently within one round. Multiplying by
           the index instead would collapse to no shift at all whenever the
           product divides evenly, which is every round in a two-Place world. */
        const shift = rotate > 0 && places.length > 0 ? (rotate + i) % places.length : 0;
        allowed.set(piece.key, [...places.slice(shift), ...places.slice(0, shift)]);
    });

    const placeResources = limitedResources(game, world, 'place');
    const planResources = limitedResources(game, world, 'plan');

    const held = Object.create(null);
    const placeSums = Object.create(null);
    const planSums = Object.create(null);
    for (const place of game.places) {
        held[place.key] = 0;
        placeSums[place.key] = Object.create(null);
        for (const r of placeResources) placeSums[place.key][r.key] = 0;
    }
    for (const r of planResources) planSums[r.key] = 0;

    /* Seed the counters with the Pieces the caller has pinned in place. */
    const current = Object.create(null);
    for (const [key, loc] of Object.entries(fixed)) {
        current[key] = loc;
        if (loc.kind === 'place') {
            held[loc.place] += 1;
            for (const r of placeResources) {
                placeSums[loc.place][r.key] += game.pieceIndex[key].resources[r.key] ?? 0;
            }
            for (const r of planResources) planSums[r.key] += game.pieceIndex[key].resources[r.key] ?? 0;
        }
    }

    const results = [];
    let nodes = 0;
    let truncated = false;

    const planLimitOk = () => planResources.every((r) => planSums[r.key] <= (world.resourceLimit[r.key] ?? 0));

    const recurse = (i) => {
        if (truncated || results.length >= limit) return;
        nodes += 1;
        if (nodes > nodeBudget) {
            truncated = true;
            return;
        }

        if (i === movable.length) {
            const placedCount = Object.values(current).filter((l) => l.kind === 'place').length;
            if (requireNonEmpty && placedCount === 0) return;
            const session = syntheticSession(revisionLike, current, { firedBeats });
            const ctx = buildContext(game, session);
            if (seams(ctx).length > 0) return;
            if (overCapacityPlaces(ctx).length > 0) return;
            const arrangement = { ...current };
            results.push(arrangement);
            if (onArrangement) onArrangement(arrangement, ctx);
            return;
        }

        const piece = movable[i];
        const compiled = game.pieceIndex[piece.key];

        for (const placeKey of allowed.get(piece.key)) {
            if (held[placeKey] >= (world.capacity[placeKey] ?? 0)) continue;

            let resourceOk = true;
            for (const r of placeResources) {
                const next = placeSums[placeKey][r.key] + (compiled.resources[r.key] ?? 0);
                if (next > (world.resourceLimit[r.key] ?? 0)) { resourceOk = false; break; }
            }
            if (!resourceOk) continue;
            for (const r of planResources) {
                if (planSums[r.key] + (compiled.resources[r.key] ?? 0) > (world.resourceLimit[r.key] ?? 0)) {
                    resourceOk = false; break;
                }
            }
            if (!resourceOk) continue;

            current[piece.key] = atPlace(placeKey, held[placeKey]);
            held[placeKey] += 1;
            for (const r of placeResources) placeSums[placeKey][r.key] += compiled.resources[r.key] ?? 0;
            for (const r of planResources) planSums[r.key] += compiled.resources[r.key] ?? 0;

            recurse(i + 1);

            held[placeKey] -= 1;
            for (const r of placeResources) placeSums[placeKey][r.key] -= compiled.resources[r.key] ?? 0;
            for (const r of planResources) planSums[r.key] -= compiled.resources[r.key] ?? 0;
            delete current[piece.key];

            if (truncated || results.length >= limit) return;
        }

        /* Or leave it behind. */
        current[piece.key] = MARGIN;
        if (planLimitOk()) recurse(i + 1);
        delete current[piece.key];
    };

    recurse(0);
    return { arrangements: results, truncated, nodes };
}

export function firstValidCommit(game, revisionLike) {
    const { arrangements } = enumerateArrangements(game, revisionLike, { limit: 1, nodeBudget: 60000 });
    return arrangements[0] ?? null;
}

export function arrangementSignature(arrangement) {
    return Object.keys(arrangement).sort()
        .map((key) => {
            const loc = arrangement[key];
            return `${key}:${loc.kind === 'place' ? loc.place : loc.kind}`;
        })
        .join('|');
}

/* A stratified sample of the plan space: several rotations of the same
   deterministic search, deduplicated. When the space is small enough to
   enumerate completely this returns exactly the same set as a single pass. When
   it is not, the sample spans structurally different plans instead of one
   corner of the tree, which is what makes the analysis metrics mean anything. */
export function sampleArrangements(game, revisionLike, options = {}) {
    const { target = 600, rounds = 6, ...rest } = options;
    const perRound = Math.max(1, Math.ceil(target / rounds));
    const seen = new Map();
    let truncated = false;
    let nodes = 0;

    for (let round = 0; round < rounds; round += 1) {
        const result = enumerateArrangements(game, revisionLike, {
            ...rest,
            rotate: round,
            limit: perRound
        });
        nodes += result.nodes;
        if (result.truncated) truncated = true;
        for (const arrangement of result.arrangements) {
            seen.set(arrangementSignature(arrangement), arrangement);
        }
        /* A round that came back short has exhausted its walk, so the space is
           smaller than the sample target and further rounds add nothing new. */
        if (!result.truncated && result.arrangements.length < perRound && round > 0) break;
    }

    return { arrangements: [...seen.values()], truncated, nodes };
}

/* Which variant a beat would select for a given committed arrangement. */
export function variantForCommit(game, revisionLike, beat, placements, pinned = null) {
    const ctx = buildContext(game, syntheticSession(revisionLike, placements, { pinned }));
    return selectVariant(ctx, beat, evaluate);
}

/* After a beat fires, Pieces the world has fixed, withdrawn or stranded cannot
   move, so they are held constant while the rest of the plan is re-enumerated. */
export function frozenAfterBeat(game, revisionLike, placements, firedBeats) {
    const ctx = buildContext(game, syntheticSession(revisionLike, placements, { firedBeats }));
    const frozen = Object.create(null);
    for (const piece of game.pieces) {
        if (!ctx.world.bornPieces.has(piece.key)) continue;
        const loc = ctx.locationOf(piece.key);
        const stuck = ctx.world.lockedPieces.has(piece.key)
            || ctx.world.unavailablePieces.has(piece.key)
            || (loc.kind === 'place' && ctx.world.closedPlaces.has(loc.place));
        if (stuck) frozen[piece.key] = loc;
    }
    return { frozen, ctx };
}

/* A revision family is the set of Pieces the learner keeps in the plan. Two
   arrangements that keep the same Pieces in different Places are the same
   answer to "what do I save?", which is the question revision is about. */
export function familySignature(arrangement) {
    return Object.entries(arrangement)
        .filter(([, loc]) => loc.kind === 'place')
        .map(([key]) => key)
        .sort()
        .join('|');
}

export function enumerateRevisions(game, revisionLike, placements, firedBeats, options = {}) {
    const { frozen } = frozenAfterBeat(game, revisionLike, placements, firedBeats);
    return enumerateArrangements(game, revisionLike, {
        firedBeats,
        fixed: frozen,
        nodeBudget: options.nodeBudget ?? 120000,
        limit: options.limit ?? Infinity,
        requireNonEmpty: false
    });
}
