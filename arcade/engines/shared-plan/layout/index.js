/* Engine One — layout.

   Pure geometry, shared by the compiler (legibility fit) and, from B2, by the
   Stage (positions). It knows nothing about material kits beyond font metrics,
   and it never produces coordinates that enter Session State. */

import { solve, hasSolver, STAGE, REGIONS } from './solvers.js';
import { measure, wrappedFit, SCALE_ROLES } from './metrics.js';

export { solve, hasSolver, STAGE, REGIONS, measure, wrappedFit, SCALE_ROLES };

function socketColumns(sockets) {
    return Math.min(3, Math.max(1, Math.ceil(Math.sqrt(sockets))));
}

const VOICE_WIDTH = 240;

/* Measures every string that will be rendered against the slot it will be
   rendered in, at the smallest legible scale for that position, allowing the
   number of lines that position actually gives it. */
export function fitReport(compiled, layout) {
    const problems = [];
    const check = (text, scaleRole, maxWidth, lines, locus) => {
        if (!text) return;
        const result = wrappedFit(text, scaleRole, maxWidth, lines);
        if (!result.ok) {
            problems.push({
                locus,
                text,
                scaleRole,
                lines,
                width: Math.round(Math.max(result.longestWord, result.total)),
                maxWidth: Math.round(result.capacity),
                reason: result.longestWord > maxWidth ? 'a single word is too wide' : 'the text is too long'
            });
        }
    };

    for (const place of compiled.places) {
        const solved = layout.places[place.key];
        check(place.name, 'name', solved.nameAnchor.maxWidth, 1, `places.${place.key}.name`);
        if (place.descriptor) {
            check(place.descriptor, 'micro', solved.frame.width - 16, 2, `places.${place.key}.descriptor`);
        }
    }

    /* A Piece's name has to be readable in the socket cell of the narrowest
       Place it could stand in, because that is where it will actually be read. */
    const narrowestCell = Math.min(
        ...compiled.places.map((p) => layout.places[p.key].frame.width / socketColumns(p.sockets))
    );
    const thresholdWidth = layout.threshold[0]?.maxWidth ?? REGIONS.threshold.width;
    for (const piece of compiled.pieces) {
        check(piece.name, 'micro', narrowestCell - 8, 2, `pieces.${piece.key}.name`);
        check(piece.name, 'micro', thresholdWidth, 2, `pieces.${piece.key}.name@threshold`);
    }

    const narrowestFrame = Math.min(...compiled.places.map((p) => layout.places[p.key].frame.width));
    for (const rule of compiled.rules) {
        check(rule.inscription, 'inscription', narrowestFrame - 12, 2, `rules.${rule.key}.inscription`);
    }

    const goalWidth = layout.horizon[0]?.maxWidth ?? REGIONS.horizon.width;
    for (const goal of compiled.goals) {
        check(goal.label, 'goal', goalWidth, 2, `goals.${goal.key}.label`);
    }

    for (const voice of compiled.voices) {
        check(voice.claim, 'claim', VOICE_WIDTH, 3, `voices.${voice.key}.claim`);
        voice.claimVariants.forEach((variant, i) => {
            check(variant, 'claim', VOICE_WIDTH, 3, `voices.${voice.key}.claimVariants[${i}]`);
        });
    }

    const headlineWidth = REGIONS.ground.width * 0.62;
    for (const beat of compiled.beats) {
        for (const variant of beat.variants) {
            check(variant.headline, 'headline', headlineWidth, 2, `beats.${beat.key}.${variant.key}.headline`);
            check(variant.scarLabel, 'micro', narrowestFrame - 12, 1, `beats.${beat.key}.${variant.key}.scarLabel`);
        }
        if (beat.omen) {
            check(beat.omen.text, 'micro', 220, 2, `beats.${beat.key}.omen.text`);
        }
    }

    return problems;
}

/* Frames must not overlap at the logical stage size. The solvers cannot produce
   an overlap by construction; this proves it stays true if they change. */
export function collisionReport(compiled, layout) {
    const frames = compiled.places.map((p) => ({ key: p.key, ...layout.places[p.key].frame }));
    const collisions = [];
    for (let i = 0; i < frames.length; i += 1) {
        for (let j = i + 1; j < frames.length; j += 1) {
            const a = frames[i];
            const b = frames[j];
            const overlaps = a.x < b.x + b.width && b.x < a.x + a.width
                && a.y < b.y + b.height && b.y < a.y + a.height;
            if (overlaps) collisions.push({ a: a.key, b: b.key });
        }
    }
    for (const frame of frames) {
        const withinStage = frame.x >= 0 && frame.y >= 0
            && frame.x + frame.width <= STAGE.width
            && frame.y + frame.height <= STAGE.height;
        if (!withinStage) collisions.push({ a: frame.key, b: 'stage' });
    }
    return collisions;
}
