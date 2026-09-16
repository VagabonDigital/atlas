/* Engine One — the disclosure schedule and the tutor-safe projection.

   Progressive disclosure is enforced structurally rather than left to authorial
   discipline, because generated Definitions will not pace themselves. Every
   concept is recorded against the event that brings it into the world. */

import { VOCAB } from '../definition/index.js';

export function disclosureSchedule(game) {
    const bornBy = Object.create(null);

    const record = (id, event) => {
        if (!Object.hasOwn(bornBy, id)) bornBy[id] = event;
    };

    for (const place of game.places) if (place.status === 'active') record(`place:${place.key}`, 'initial');
    for (const piece of game.pieces) if (piece.status === 'active') record(`piece:${piece.key}`, 'initial');
    for (const rule of game.rules) if (rule.status === 'active') record(`rule:${rule.key}`, 'initial');
    for (const goal of game.goals) if (goal.status === 'active') record(`goal:${goal.key}`, 'initial');
    for (const voice of game.voices) record(`voice:${voice.key}`, 'initial');

    /* A resource exists once an active Rule makes it bite. */
    for (const resource of game.resources) {
        const rule = game.rules.find((r) => r.kind === 'sumLimit' && r.resource === resource.key);
        if (rule && rule.status === 'active') record(`resource:${resource.key}`, 'initial');
    }

    for (const beat of game.beats) {
        for (const variant of beat.variants) {
            const event = `${beat.key}/${variant.key}`;
            for (const effect of variant.effects) {
                switch (effect.kind) {
                    case 'introducePiece': record(`piece:${effect.piece}`, event); break;
                    case 'reopenPlace': record(`place:${effect.place}`, event); break;
                    case 'activateGoal': record(`goal:${effect.goal}`, event); break;
                    case 'activateRule': {
                        record(`rule:${effect.rule}`, event);
                        const rule = game.ruleIndex[effect.rule];
                        if (rule?.kind === 'sumLimit') record(`resource:${rule.resource}`, event);
                        break;
                    }
                    case 'revealFact': record(`fact:${effect.piece}`, event); break;
                    default: break;
                }
            }
        }
    }

    return bornBy;
}

/* What the tutor may be told before the lesson without being handed the beat.
   A tutor who knows the exact beat will steer the plan toward or away from it,
   so specifics are withheld and only the category travels. */
export function tutorSafeProjection(game) {
    const pressures = [];
    for (const beat of game.beats) {
        const categories = new Set(
            beat.variants.map((v) => VOCAB.PRESSURE_CATEGORY_BY_PRESET[v.staging]).filter(Boolean)
        );
        const severities = new Set(beat.variants.map((v) => v.severity));
        pressures.push({
            beat: beat.key,
            trigger: beat.trigger,
            categories: [...categories],
            severities: [...severities],
            foreshadowed: Boolean(beat.omen)
        });
    }

    return {
        brief: game.tutor.brief,
        prompts: game.tutor.prompts,
        pressures,
        languageFocus: game.design.languageFocus,
        levelBand: game.meta.levelBand,
        targetMinutes: game.meta.targetMinutes
    };
}
