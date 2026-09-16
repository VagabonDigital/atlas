/* Engine One — effects.

   World conditions are never stored in the Session. They are folded from the
   fired beat variants every time they are needed, so the action log stays the
   single source of truth and a snapshot can always be re-verified against it.

   No effect moves a Piece. That is guaranteed by the vocabulary rather than by
   validation: there is simply no effect kind that writes a location. */

export function baseWorld(game) {
    const world = {
        closedPlaces: new Set(),
        severedAfter: new Set(),
        capacity: Object.create(null),
        resourceLimit: Object.create(null),
        unavailablePieces: new Set(),
        bornPieces: new Set(),
        bornPlaces: new Set(),
        activeRules: new Set(),
        activeGoals: new Set(),
        lockedPieces: new Set(),
        lockedPlaces: new Set(),
        revealedFacts: new Set(),
        voiceClaim: Object.create(null),
        justArrived: new Set()
    };

    for (const place of game.places) {
        world.capacity[place.key] = place.sockets;
        if (place.status === 'active') world.bornPlaces.add(place.key);
        else world.closedPlaces.add(place.key);
    }
    for (const piece of game.pieces) {
        if (piece.status === 'active') world.bornPieces.add(piece.key);
    }
    for (const resource of game.resources) {
        world.resourceLimit[resource.key] = resource.limit;
    }
    for (const rule of game.rules) {
        if (rule.status === 'active') world.activeRules.add(rule.key);
    }
    for (const goal of game.goals) {
        if (goal.status === 'active') world.activeGoals.add(goal.key);
    }
    for (const voice of game.voices) {
        world.voiceClaim[voice.key] = null;
    }
    return world;
}

function applyEffect(game, world, effect) {
    switch (effect.kind) {
        case 'closePlace':
            world.closedPlaces.add(effect.place);
            return;
        case 'reopenPlace':
            world.closedPlaces.delete(effect.place);
            world.bornPlaces.add(effect.place);
            return;
        case 'setCapacity':
            world.capacity[effect.place] = effect.sockets;
            return;
        case 'adjustResourceLimit':
            world.resourceLimit[effect.resource] = effect.limit;
            return;
        case 'makeUnavailable':
            world.unavailablePieces.add(effect.piece);
            return;
        case 'introducePiece':
            world.bornPieces.add(effect.piece);
            world.justArrived.add(effect.piece);
            return;
        case 'activateRule':
            world.activeRules.add(effect.rule);
            return;
        case 'activateGoal':
            world.activeGoals.add(effect.goal);
            return;
        case 'lockPiece':
            world.lockedPieces.add(effect.piece);
            return;
        case 'lockPlace':
            world.lockedPlaces.add(effect.place);
            return;
        case 'revealFact':
            world.revealedFacts.add(effect.piece);
            return;
        case 'shiftVoice':
            world.voiceClaim[effect.voice] = effect.claimVariant;
            return;
        case 'severAfter': {
            /* Sequence only: marks the segment and closes every Place
               downstream of the named one. */
            world.severedAfter.add(effect.place);
            const order = game.topology.order;
            const cut = order.indexOf(effect.place);
            if (cut >= 0) {
                for (let i = cut + 1; i < order.length; i += 1) world.closedPlaces.add(order[i]);
            }
            return;
        }
        default:
            throw new Error(`Unknown effect kind: ${effect.kind}`);
    }
}

export function variantOf(game, fired) {
    const beat = game.beatIndex[fired.beat];
    if (!beat) throw new Error(`Unknown beat: ${fired.beat}`);
    const variant = beat.variantIndex[fired.variant];
    if (!variant) throw new Error(`Unknown variant: ${fired.beat}.${fired.variant}`);
    return variant;
}

/* Folds every fired variant, in the order it fired, over the base world.
   `justArrived` reflects only the most recent beat, since it is a presentation
   mark for the Piece that has just entered. */
export function deriveWorld(game, firedBeats) {
    const world = baseWorld(game);
    firedBeats.forEach((fired, i) => {
        const variant = variantOf(game, fired);
        if (i === firedBeats.length - 1) world.justArrived = new Set();
        for (const effect of variant.effects) applyEffect(game, world, effect);
    });
    return world;
}
