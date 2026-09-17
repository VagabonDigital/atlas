/* Engine One — Rule evaluation.

   A broken Rule becomes a Seam at a locus. Count capacity is absent here on
   purpose: capacity blocks placement physically in the reducer and can never
   become a Seam.

   A Rule bites only on Pieces the learner has actually committed to the plan.
   A Piece still at the Threshold is undecided, not in breach. At Commit the
   Threshold empties into the Margin, so undecided becomes decided and the Rule
   speaks then. */

export function subjectPieces(game, subject) {
    if (subject.kind === 'piece') return [subject.piece];
    return game.pieces.filter((p) => p.tags.includes(subject.tag)).map((p) => p.key);
}

/* A Seam names the Rule it came from, for analysis, and carries the inscription
   and the locus, for the Stage. It deliberately does not carry the Rule's kind:
   a broken "requires" and a broken "sum limit" must arrive at the renderer as
   the same kind of mark, or the visual grammar starts depending on the Rule
   vocabulary and a new Rule kind becomes Stage work. */
function seam(rule, locus) {
    return { rule: rule.key, inscription: rule.inscription, locus };
}

function atPlace(place) {
    return { kind: 'place', place };
}

function atPiece(piece) {
    return { kind: 'piece', piece };
}

function violationsForRule(ctx, rule) {
    const { game } = ctx;
    const out = [];

    switch (rule.kind) {
        case 'sumLimit': {
            const resource = game.resourceIndex[rule.resource];
            const limit = ctx.limitOf(resource.key);
            if (resource.scope === 'plan') {
                if (ctx.resourceSum(resource.key, 'plan') > limit) out.push(seam(rule, { kind: 'plan' }));
            } else {
                for (const place of game.places) {
                    if (!ctx.isPlaceOpen(place.key)) continue;
                    if (ctx.resourceSum(resource.key, 'place', place.key) > limit) {
                        out.push(seam(rule, atPlace(place.key)));
                    }
                }
            }
            return out;
        }

        case 'allowedIn': {
            for (const key of subjectPieces(game, rule.subject)) {
                const place = ctx.placeOf(key);
                if (place !== null && !rule.places.includes(place)) out.push(seam(rule, atPiece(key)));
            }
            return out;
        }

        case 'requires': {
            if (!ctx.inPlan(rule.piece)) return out;
            const candidates = subjectPieces(game, rule.needs).filter((k) => k !== rule.piece);
            const satisfied = rule.where === 'samePlace'
                ? candidates.some((k) => ctx.placeOf(k) === ctx.placeOf(rule.piece))
                : candidates.some((k) => ctx.inPlan(k));
            if (!satisfied) out.push(seam(rule, atPiece(rule.piece)));
            return out;
        }

        case 'together': {
            const aIn = ctx.inPlan(rule.a);
            const bIn = ctx.inPlan(rule.b);
            if (aIn && bIn) {
                if (ctx.placeOf(rule.a) !== ctx.placeOf(rule.b)) out.push(seam(rule, atPiece(rule.a)));
            } else if (aIn && ctx.isCut(rule.b)) {
                out.push(seam(rule, atPiece(rule.a)));
            } else if (bIn && ctx.isCut(rule.a)) {
                out.push(seam(rule, atPiece(rule.b)));
            }
            return out;
        }

        case 'apart': {
            if (ctx.inPlan(rule.a) && ctx.inPlan(rule.b) && ctx.placeOf(rule.a) === ctx.placeOf(rule.b)) {
                out.push(seam(rule, atPiece(rule.a)));
            }
            return out;
        }

        case 'near': {
            if (ctx.inPlan(rule.a) && ctx.inPlan(rule.b) && !ctx.piecesAdjacent(rule.a, rule.b)) {
                out.push(seam(rule, atPiece(rule.a)));
            }
            return out;
        }

        case 'far': {
            if (ctx.inPlan(rule.a) && ctx.inPlan(rule.b) && ctx.piecesAdjacent(rule.a, rule.b)) {
                out.push(seam(rule, atPiece(rule.a)));
            }
            return out;
        }

        case 'before': {
            if (!ctx.inPlan(rule.a) || !ctx.inPlan(rule.b)) return out;
            const ia = ctx.orderIndex(ctx.placeOf(rule.a));
            const ib = ctx.orderIndex(ctx.placeOf(rule.b));
            if (ia >= ib) out.push(seam(rule, atPiece(rule.a)));
            return out;
        }

        default:
            throw new Error(`Unknown rule kind: ${rule.kind}`);
    }
}

export function activeRules(ctx) {
    return ctx.game.rules.filter((r) => ctx.world.activeRules.has(r.key));
}

/* Which Pieces a Seam concerns. The Stage's local preview needs this: holding a
   Piece must be able to show a Seam it would open or close even when that Seam
   is anchored on a different Piece. It lives here, beside the Rules it reads,
   and is deliberately kept out of `seams()`, which the enumerator calls at every
   leaf of the plan space. */
export function seamParticipants(ctx, seam) {
    const { game } = ctx;
    const rule = game.ruleIndex[seam.rule];
    let keys;

    switch (rule.kind) {
        case 'sumLimit': {
            const pool = seam.locus.kind === 'place'
                ? ctx.piecesIn(seam.locus.place)
                : game.pieces.filter((p) => ctx.inPlan(p.key)).map((p) => p.key);
            keys = pool.filter((k) => (game.pieceIndex[k].resources[rule.resource] ?? 0) > 0);
            break;
        }
        case 'allowedIn':
            keys = [seam.locus.piece];
            break;
        case 'requires':
            keys = [rule.piece, ...subjectPieces(game, rule.needs)];
            break;
        case 'together':
        case 'apart':
        case 'near':
        case 'far':
        case 'before':
            keys = [rule.a, rule.b];
            break;
        default:
            throw new Error(`Unknown rule kind: ${rule.kind}`);
    }

    const wanted = new Set(keys);
    return game.pieces
        .filter((p) => wanted.has(p.key) && ctx.world.bornPieces.has(p.key))
        .map((p) => p.key);
}

export function seams(ctx) {
    return activeRules(ctx).flatMap((rule) => violationsForRule(ctx, rule));
}

/* Capacity is structural, so it is reported separately from Seams: it can only
   arise when a beat shrinks a Place under an existing plan, and it reads as
   overflow rather than as a broken Rule. */
export function overCapacityPlaces(ctx) {
    return ctx.game.places
        .filter((p) => ctx.piecesIn(p.key).length > ctx.capacityOf(p.key))
        .map((p) => ({ place: p.key, held: ctx.piecesIn(p.key).length, capacity: ctx.capacityOf(p.key) }));
}
