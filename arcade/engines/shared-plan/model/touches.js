/* Engine One — what a change touched.

   The Stage keeps the regions a change landed on sharp and lets the rest of the
   Ground recede. Deciding which regions those are means reading effects, and
   reading effects is the model's job, so the answer arrives in the World View as
   plain locus identifiers rather than as something the renderer works out. */

import { subjectPieces } from './rules.js';

export function locusId(locus) {
    switch (locus.kind) {
        case 'piece': return `piece:${locus.piece}`;
        case 'place': return `place:${locus.place}`;
        case 'voice': return `voice:${locus.voice}`;
        case 'threshold': return 'threshold';
        case 'plan': return 'plan';
        default: throw new Error(`Unknown locus kind: ${locus.kind}`);
    }
}

function addResourceScope(game, out, resourceKey) {
    const resource = game.resourceIndex[resourceKey];
    if (resource.scope === 'plan') {
        out.add('plan');
    } else {
        for (const place of game.places) out.add(`place:${place.key}`);
    }
}

function addRuleParticipants(game, out, rule) {
    switch (rule.kind) {
        case 'sumLimit':
            addResourceScope(game, out, rule.resource);
            return;
        case 'allowedIn':
            for (const key of subjectPieces(game, rule.subject)) out.add(`piece:${key}`);
            for (const place of rule.places) out.add(`place:${place}`);
            return;
        case 'requires':
            out.add(`piece:${rule.piece}`);
            for (const key of subjectPieces(game, rule.needs)) out.add(`piece:${key}`);
            return;
        case 'together':
        case 'apart':
        case 'near':
        case 'far':
        case 'before':
            out.add(`piece:${rule.a}`);
            out.add(`piece:${rule.b}`);
            return;
        default:
            throw new Error(`Unknown rule kind: ${rule.kind}`);
    }
}

/* Every locus a variant's change lands on: its authored locus plus everything
   its effects alter. Sorted, so the result is stable across runs. */
export function variantTouches(game, variant) {
    const out = new Set([locusId(variant.locus)]);

    for (const effect of variant.effects) {
        switch (effect.kind) {
            case 'closePlace':
            case 'reopenPlace':
            case 'setCapacity':
            case 'lockPlace':
                out.add(`place:${effect.place}`);
                break;
            case 'makeUnavailable':
            case 'lockPiece':
            case 'revealFact':
                out.add(`piece:${effect.piece}`);
                break;
            case 'introducePiece':
                out.add(`piece:${effect.piece}`);
                out.add('threshold');
                break;
            case 'activateGoal':
                out.add(`goal:${effect.goal}`);
                break;
            case 'shiftVoice':
                out.add(`voice:${effect.voice}`);
                break;
            case 'adjustResourceLimit':
                addResourceScope(game, out, effect.resource);
                break;
            case 'activateRule':
                addRuleParticipants(game, out, game.ruleIndex[effect.rule]);
                break;
            case 'severAfter': {
                out.add(`place:${effect.place}`);
                const order = game.topology.order;
                const cut = order.indexOf(effect.place);
                for (let i = cut + 1; i < order.length; i += 1) out.add(`place:${order[i]}`);
                break;
            }
            default:
                throw new Error(`Unknown effect kind: ${effect.kind}`);
        }
    }

    return [...out].sort();
}
