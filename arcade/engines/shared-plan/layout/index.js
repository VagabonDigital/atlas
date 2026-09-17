/* Engine One — layout.

   Pure geometry, shared by the compiler (legibility fit) and, from B2, by the
   Stage (positions). It knows nothing about material kits beyond font metrics,
   and it never produces coordinates that enter Session State. */

import {
    solvePlaces, socketGrid, socketColumns, socketRowHeight, hasSolver, STAGE, REGIONS, LAYOUT, OMEN_REGION
} from './solvers.js';
import { solve } from './compose.js';
import { measure, wrappedFit, wrapLines, SCALE_ROLES } from './metrics.js';

export {
    solve, solvePlaces, socketGrid, socketColumns, socketRowHeight, hasSolver, STAGE, REGIONS, LAYOUT, OMEN_REGION,
    measure, wrappedFit, wrapLines, SCALE_ROLES
};

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
    /* For a box whose height is set by its line count, measured the way the
       lines will actually break. */
    const checkWrapped = (text, scaleRole, maxWidth, lines, locus) => {
        const wrapped = wrapLines(text, scaleRole, maxWidth);
        const widest = Math.max(...wrapped.map((l) => l.width));
        if (widest <= maxWidth && wrapped.length <= lines) return;
        const wordTooWide = widest > maxWidth;
        problems.push({
            locus,
            text,
            scaleRole,
            lines,
            width: Math.round(wordTooWide ? widest : measure(text, scaleRole)),
            maxWidth: Math.round(wordTooWide ? maxWidth : maxWidth * lines),
            reason: wordTooWide ? 'a single word is too wide' : `the text needs ${wrapped.length} lines`
        });
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
        ...compiled.places.map((p) => layout.places[p.key].frame.width / socketColumns(p.maxSockets))
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

    /* A Voice is measured on the card it stands on. Its outcome lines reserve
       room on that card but are not measured here: fitting Resolve text is part
       of B2's Resolve composition. */
    for (const voice of compiled.voices) {
        const card = layout.voices.cards[voice.key];
        check(voice.name, 'micro', card.name.maxWidth, 1, `voices.${voice.key}.name`);
        check(voice.role, 'micro', card.role.maxWidth, 1, `voices.${voice.key}.role`);
        checkWrapped(voice.claim, 'claim', card.claim.maxWidth, LAYOUT.voiceClaimMaxLines, `voices.${voice.key}.claim`);
        voice.claimVariants.forEach((variant, i) => {
            checkWrapped(variant, 'claim', card.claim.maxWidth, LAYOUT.voiceClaimMaxLines, `voices.${voice.key}.claimVariants[${i}]`);
        });
    }

    for (const beat of compiled.beats) {
        for (const variant of beat.variants) {
            check(variant.headline, 'headline', LAYOUT.headlineWidth, LAYOUT.headlineLines, `beats.${beat.key}.${variant.key}.headline`);
            check(variant.scarLabel, 'micro', narrowestFrame - 12, 1, `beats.${beat.key}.${variant.key}.scarLabel`);
        }
    }

    /* Only the Omen the Stage can actually show is measured, against the slot its
       edge gives it. */
    if (layout.omen) {
        const beat = compiled.beatIndex[layout.omen.beat];
        check(beat.omen.text, 'micro', layout.omen.maxWidth, layout.omen.lines, `beats.${beat.key}.omen.text`);
    }

    check(compiled.world.clockLabel, 'micro', layout.clock.maxWidth, layout.clock.lines, 'world.clockLabel');
    check(compiled.world.thresholdLabel, 'micro', layout.bandLabels.threshold.maxWidth, layout.bandLabels.threshold.lines, 'world.thresholdLabel');
    check(compiled.world.marginLabel, 'micro', layout.bandLabels.margin.maxWidth, layout.bandLabels.margin.lines, 'world.marginLabel');

    for (const meter of layout.planLoads) {
        const resource = compiled.resourceIndex[meter.resource];
        check(resource.label, 'micro', meter.maxWidth, meter.lines, `resources.${resource.key}.label`);
        check(resource.unit, 'micro', meter.maxWidth, 1, `resources.${resource.key}.unit`);
    }
    for (const resource of compiled.resources.filter((r) => r.scope === 'place')) {
        const narrowestLoad = Math.min(
            ...compiled.places.map((p) => layout.places[p.key].loads.find((l) => l.resource === resource.key).labelMaxWidth)
        );
        check(`${resource.label} ${resource.unit}`, 'micro', narrowestLoad, 1, `resources.${resource.key}.label`);
    }

    return problems;
}

function overlaps(a, b) {
    return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

function inside(inner, outer) {
    return inner.x >= outer.x && inner.y >= outer.y
        && inner.x + inner.width <= outer.x + outer.width
        && inner.y + inner.height <= outer.y + outer.height;
}

function pairwise(items, out) {
    for (let i = 0; i < items.length; i += 1) {
        for (let j = i + 1; j < items.length; j += 1) {
            if (overlaps(items[i].box, items[j].box)) out.push({ a: items[i].name, b: items[j].name });
        }
    }
}

/* Nothing the layout places may overlap anything else it places, and nothing
   may leave the region it belongs to. The solvers cannot produce an overlap by
   construction; this proves it stays true when they change. */
export function collisionReport(compiled, layout) {
    const collisions = [];
    const stage = { x: 0, y: 0, width: STAGE.width, height: STAGE.height };

    const regions = Object.entries(layout.regions).map(([name, box]) => ({ name, box }));
    for (const region of regions) {
        if (!inside(region.box, stage)) collisions.push({ a: region.name, b: 'stage' });
    }
    pairwise(regions, collisions);

    const frames = compiled.places.map((p) => ({ name: p.key, box: layout.places[p.key].frame }));
    for (const frame of frames) {
        if (!inside(frame.box, layout.regions.ground)) collisions.push({ a: frame.name, b: 'ground' });
    }
    pairwise(frames, collisions);

    const socketBox = (s) => ({ x: s.x - s.radius, y: s.y - s.radius, width: s.radius * 2, height: s.radius * 2 });
    for (const place of compiled.places) {
        const solved = layout.places[place.key];
        const sockets = solved.sockets.map((s) => ({ name: `${place.key} socket ${s.index}`, box: socketBox(s) }));
        for (const socket of sockets) {
            if (!inside(socket.box, solved.frame)) collisions.push({ a: socket.name, b: place.key });
        }
        pairwise(sockets, collisions);
    }

    const box = (item) => ({ x: item.x, y: item.y, width: item.width, height: item.height });
    const west = [
        { name: 'clock', box: box(layout.clock) },
        { name: 'seal stamp', box: box(layout.sealStamp) }
    ];
    const east = layout.planLoads.map((m) => ({ name: `plan meter ${m.resource}`, box: box(m) }));
    if (layout.omen?.region === 'gutterWest') west.push({ name: 'omen', box: box(layout.omen) });
    if (layout.omen?.region === 'gutterEast') east.push({ name: 'omen', box: box(layout.omen) });
    for (const item of west) {
        if (!inside(item.box, layout.regions.gutterWest)) collisions.push({ a: item.name, b: 'gutterWest' });
    }
    for (const item of east) {
        if (!inside(item.box, layout.regions.gutterEast)) collisions.push({ a: item.name, b: 'gutterEast' });
    }
    pairwise(west, collisions);
    pairwise(east, collisions);

    /* Band slots, including an Omen that has taken the last slot of its band. */
    const band = (label, slots, regionName) => {
        const region = layout.regions[regionName];
        const items = slots.map((slot) => ({
            name: `${label} slot ${slot.index}`,
            box: { x: slot.left, y: region.y, width: slot.width, height: region.height }
        }));
        if (layout.omen?.region === regionName) items.push({ name: 'omen', box: box(layout.omen) });
        for (const item of items) {
            if (!inside(item.box, region)) collisions.push({ a: item.name, b: regionName });
        }
        pairwise(items, collisions);
    };
    band('goal', layout.horizon, 'horizon');
    band('threshold', layout.threshold, 'threshold');
    band('margin', layout.margin, 'margin');

    const labels = Object.entries(layout.bandLabels).map(([name, item]) => ({ name: `${name} label`, box: box(item) }));
    for (const item of labels) {
        if (!inside(item.box, layout.regions.bandLabels)) collisions.push({ a: item.name, b: 'bandLabels' });
    }
    pairwise(labels, collisions);

    /* Voices. A card standing inside its Place stays inside it and clear of its
       sockets; any other card stays in the Ground and clear of every Place; no
       two cards touch; the fallback band is clear of every Place. */
    const cards = Object.entries(layout.voices.cards).map(([key, card]) => ({ name: `${key} card`, card, box: box(card) }));
    for (const { name, card, box: cardBox } of cards) {
        if (card.position === 'inside') {
            const host = layout.places[card.host];
            if (!inside(cardBox, host.frame)) collisions.push({ a: name, b: card.host });
            for (const socket of host.sockets) {
                if (overlaps(cardBox, socketBox(socket))) collisions.push({ a: name, b: `${card.host} socket ${socket.index}` });
            }
        } else {
            if (!inside(cardBox, layout.regions.ground)) collisions.push({ a: name, b: 'ground' });
            for (const frame of frames) {
                if (overlaps(cardBox, frame.box)) collisions.push({ a: name, b: frame.name });
            }
        }
    }
    pairwise(cards, collisions);
    if (layout.voices.band) {
        if (!inside(layout.voices.band, layout.regions.ground)) collisions.push({ a: 'voice band', b: 'ground' });
        for (const frame of frames) {
            if (overlaps(layout.voices.band, frame.box)) collisions.push({ a: 'voice band', b: frame.name });
        }
    }

    /* A change headline never covers a Voice, and stays in the Ground. */
    for (const place of compiled.places) {
        const headline = layout.places[place.key].headline;
        const name = `${place.key} headline`;
        if (!inside(headline, layout.regions.ground)) collisions.push({ a: name, b: 'ground' });
        for (const { name: cardName, box: cardBox } of cards) {
            if (overlaps(headline, cardBox)) collisions.push({ a: name, b: cardName });
        }
    }

    return collisions;
}

const list = (keys) => keys.join(', ');

/* Where Voices ended up, as the compiler reports it. A working fallback is a
   warning. A world where no placement keeps the minimum socket geometry is an
   error: the Stage it would produce has Pieces that do not fit. */
export function voiceReport(compiled, layout) {
    const { fallback, crowded } = layout.voices;
    if (crowded.length > 0) {
        const places = crowded.map((c) => c.place);
        const bandTried = fallback
            ? ' The band between the rows, the only fallback, is too tight as well.'
            : ' This world has no fallback, because it has no second row to put a band between.';
        return [{
            severity: 'error',
            code: 'layout.voicesDoNotFit',
            locus: 'voices',
            message: `The Voices cannot stand in this world without leaving socket rows in ${list(crowded.map((c) => `${c.place} (${c.socketRow}px)`))} under the ${LAYOUT.minSocketRow}px a Piece needs.${bandTried}`,
            modelMessage: `Anchor fewer Voices to ${list(places)}, give those Places fewer sockets, or use fewer Places.`
        }];
    }
    if (fallback) {
        const places = fallback.squeezed.map((s) => s.place);
        return [{
            severity: 'warning',
            code: 'layout.voiceBandFallback',
            locus: 'voices',
            message: `Voices stand in a band between the rows instead of inside their Places, because standing in ${list(places)} would leave socket rows under ${LAYOUT.minSocketRow}px.`,
            modelMessage: `Let every Voice stand inside its own Place: anchor fewer Voices to ${list(places)}, or give those Places fewer sockets.`
        }];
    }
    return [];
}
