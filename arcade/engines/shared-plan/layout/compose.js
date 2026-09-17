/* Engine One — composing the Stage.

   `solve` lays out a whole game in composition v1: Places and their sockets,
   where every Voice stands, the Omen, the Horizon, Threshold and Margin bands,
   the gutters and the headline anchors. The compiler measures and checks the
   result, and from B2 the Stage only reads it. Nothing here enters Session
   State. */

import {
    STAGE, REGIONS, LAYOUT, OMEN_REGION, socketGrid, socketRowHeight, hasSolver, solvePlaces
} from './solvers.js';
import { placeVoices, voiceReserve } from './voices.js';

/* Slot edges are rounded, not slot widths, so neighbouring slots tile the band
   exactly and never overlap by a pixel. */
function slotRow(region, count) {
    if (count === 0) return [];
    const cellW = region.width / count;
    return Array.from({ length: count }, (_, i) => {
        const left = Math.round(region.x + cellW * i);
        const right = Math.round(region.x + cellW * (i + 1));
        return {
            index: i,
            x: Math.round(region.x + cellW * (i + 0.5)),
            y: Math.round(region.y + region.height / 2),
            left,
            width: right - left,
            maxWidth: Math.round(cellW - LAYOUT.slotPad)
        };
    });
}

/* A band of slots, optionally with one extra slot at its end for the Omen. */
function bandSlots(region, count, withOmen) {
    const slots = slotRow(region, count + (withOmen ? 1 : 0));
    return { items: slots.slice(0, count), omen: withOmen ? slots[count] : null };
}

const overlaps = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

/* A change's headline is inscribed at its locus. Where a Voice stands in the
   way, as it does in a Place that hosts a Voice satellite, the headline takes a
   separate anchor below the Voice strip instead of covering the Voice at the
   moment it leans in. The same holds for a neighbouring strip the headline's
   width reaches. */
function headlineBox(centreX, y, cards) {
    const g = REGIONS.ground;
    const width = LAYOUT.headlineWidth;
    const height = LAYOUT.headlineLines * LAYOUT.headlineLineHeight;
    const x = Math.round(Math.min(Math.max(centreX - width / 2, g.x), g.x + g.width - width));
    let top = Math.round(y);
    for (let moved = true; moved;) {
        moved = false;
        for (const card of cards) {
            if (overlaps({ x, y: top, width, height }, card)) {
                top = card.y + card.height + LAYOUT.voiceGap;
                moved = true;
            }
        }
    }
    return { x, y: top, width, height, lines: LAYOUT.headlineLines };
}

function gutterItem(gutter, y, height, lines) {
    return {
        x: gutter.x + LAYOUT.gutterInset,
        y: Math.round(y),
        width: gutter.width - LAYOUT.gutterInset * 2,
        height,
        maxWidth: LAYOUT.gutterTextWidth,
        lines
    };
}

export function solve(compiled) {
    const topology = compiled.topology.kind;
    if (!hasSolver(topology)) throw new Error(`No layout solver for topology: ${topology}`);

    /* Sequence lays out in travel order; groups and graph keep contract order. */
    const ordered = topology === 'sequence'
        ? compiled.topology.order.map((k) => compiled.placeIndex[k])
        : compiled.places;

    const placeResources = compiled.resources.filter((r) => r.scope === 'place');
    const planResources = compiled.resources.filter((r) => r.scope === 'plan');
    const loadReserve = placeResources.length * LAYOUT.loadBand;

    const voices = placeVoices(compiled, ordered, solvePlaces(topology, ordered, REGIONS.ground), loadReserve);
    const cards = Object.values(voices.cards);

    const places = {};
    for (const place of compiled.places) {
        const { frame, nameAnchor, strip } = voices.frames[place.key];
        const reserve = { top: voiceReserve(strip), bottom: loadReserve };
        places[place.key] = {
            frame,
            nameAnchor,
            voiceStrip: strip,
            sockets: socketGrid(frame, place.maxSockets, reserve),
            socketRow: Math.floor(socketRowHeight(frame, place.maxSockets, reserve)),
            loads: placeResources.map((resource, j) => ({
                resource: resource.key,
                x1: frame.x + 12,
                x2: frame.x + frame.width - 12,
                y: Math.round(
                    frame.y + frame.height - LAYOUT.framePadBottom - loadReserve
                    + LAYOUT.loadBand * j + LAYOUT.loadBand / 2
                ),
                labelMaxWidth: frame.width - 24
            })),
            headline: headlineBox(frame.x + frame.width / 2, frame.y + LAYOUT.nameBand, cards)
        };
    }

    /* Only the first after-commit beat can ever fire from the commit phase, so
       its Omen is the only one the Stage will ever show. */
    const omenBeat = compiled.beats.find((b) => b.trigger === 'afterCommit') ?? null;
    const omenEdge = omenBeat?.omen?.edge ?? null;
    const omenRegion = omenEdge ? OMEN_REGION[omenEdge] : null;

    const horizonRow = bandSlots(REGIONS.horizon, compiled.goals.length, omenRegion === 'horizon');
    const thresholdRow = bandSlots(REGIONS.threshold, compiled.pieces.length, omenRegion === 'threshold');
    const marginRow = bandSlots(REGIONS.margin, compiled.pieces.length, false);

    let omen = null;
    if (omenRegion === 'horizon' || omenRegion === 'threshold') {
        const region = REGIONS[omenRegion];
        const slot = (omenRegion === 'horizon' ? horizonRow : thresholdRow).omen;
        omen = {
            beat: omenBeat.key,
            edge: omenEdge,
            region: omenRegion,
            x: slot.left,
            y: region.y,
            width: slot.width,
            height: region.height,
            maxWidth: slot.maxWidth,
            lines: 2
        };
    } else if (omenRegion) {
        const gutter = REGIONS[omenRegion];
        omen = {
            beat: omenBeat.key,
            edge: omenEdge,
            region: omenRegion,
            ...gutterItem(
                gutter,
                gutter.y + gutter.height - LAYOUT.gutterInset - LAYOUT.gutterOmenHeight,
                LAYOUT.gutterOmenHeight,
                6
            )
        };
    }

    const west = REGIONS.gutterWest;
    const east = REGIONS.gutterEast;

    return {
        stage: STAGE,
        regions: REGIONS,
        places,
        segments: voices.segments,
        voices: {
            placement: voices.placement,
            band: voices.band,
            fallback: voices.fallback,
            crowded: voices.crowded,
            cards: voices.cards
        },
        threshold: thresholdRow.items,
        margin: marginRow.items,
        horizon: horizonRow.items,
        omen,
        clock: gutterItem(west, west.y + LAYOUT.gutterInset, 52, 2),
        sealStamp: gutterItem(west, west.y + LAYOUT.gutterInset + 60, 52, 2),
        planLoads: planResources.map((resource, i) => ({
            resource: resource.key,
            ...gutterItem(east, east.y + LAYOUT.gutterInset + i * LAYOUT.planMeterPitch, LAYOUT.planMeterHeight, 2)
        })),
        bandLabels: {
            threshold: gutterItem(REGIONS.bandLabels, REGIONS.threshold.y, REGIONS.threshold.height, 2),
            margin: gutterItem(REGIONS.bandLabels, REGIONS.margin.y, REGIONS.margin.height, 2)
        },
        headlines: {
            threshold: headlineBox(
                REGIONS.threshold.x + REGIONS.threshold.width / 2,
                REGIONS.ground.y + REGIONS.ground.height - 76,
                []
            )
        },
        entryPoints: {
            north: { x: STAGE.width / 2, y: 0 },
            east: { x: STAGE.width, y: STAGE.height / 2 },
            south: { x: STAGE.width / 2, y: STAGE.height },
            west: { x: 0, y: STAGE.height / 2 },
            threshold: { x: STAGE.width / 2, y: REGIONS.threshold.y },
            horizon: { x: STAGE.width / 2, y: REGIONS.horizon.y }
        }
    };
}
