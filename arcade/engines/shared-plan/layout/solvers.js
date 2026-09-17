/* Engine One — layout solvers.

   Pure geometry in logical Stage units: the fixed regions, the layout
   constants, the socket grid and one Place solver per topology kind, shared by
   every Stage Form of that kind. Table and Vessel are both `groups`, so they
   share a solver and differ only in the Ground painter.

   Dormant Places are solved too, and their geometry is reserved but hidden, so
   a Place that opens later arrives in a position that was always waiting for it
   rather than reflowing the world. Sockets are solved to the highest capacity any
   beat can raise a Place to, for the same reason.

   Composition v1. The regions are fixed across every game so tutors learn them
   once. Tutor chrome sits in three corners the world never occupies. Voices
   stand with their Places inside the Ground (voices.js), and `solve`
   (compose.js) puts the whole Stage together.

     ┌ chrome ┐ ┌──────────── Horizon ────────────┐ ┌──── chrome ────┐   y 0–88
     ├gutter W┤ ┌──────────────── Ground ─────────────────┐ ├gutter E┤    y 96–556
     │ clock  │ │  Places, Sockets, Voices, name anchors, │ │ plan   │
     │ stamp  │ │  loads                                  │ │ meters │
     │ omen W │ │                                         │ │ omen E │
     ├ labels ┤ ┌──────── Threshold ─────────┐  ┌── Beat Control ──┐   y 568–720
     │        │ └────────  Margin  ──────────┘  └──────────────────┘ */

export const STAGE = Object.freeze({ width: 1280, height: 720 });

const rect = (x, y, width, height) => Object.freeze({ x, y, width, height });

export const REGIONS = Object.freeze({
    chromeTopLeft: rect(0, 0, 200, 88),
    horizon: rect(216, 16, 668, 64),
    chromeTopRight: rect(900, 0, 380, 88),
    gutterWest: rect(0, 96, 96, 460),
    ground: rect(96, 96, 1088, 460),
    gutterEast: rect(1184, 96, 96, 460),
    bandLabels: rect(0, 568, 96, 136),
    threshold: rect(96, 568, 844, 64),
    margin: rect(96, 640, 844, 64),
    chromeBottomRight: rect(956, 568, 324, 152)
});

export const LAYOUT = Object.freeze({
    placeGap: 28,
    socketRadius: 18,
    /* A Piece standing in a socket is a 36px chip, and a row of them needs 8px
       of air. Voice placement may not squeeze a socket row below this. */
    minSocketRow: 44,
    nameBand: 34,
    framePadBottom: 12,
    loadBand: 24,
    slotPad: 12,
    headlineWidth: Math.round(REGIONS.ground.width * 0.62),
    headlineLines: 2,
    headlineLineHeight: 34,
    gutterInset: 8,
    gutterTextWidth: 76,
    gutterOmenHeight: 140,
    planMeterHeight: 120,
    planMeterPitch: 128,
    /* A Voice card: a medallion with the name and role beside it, then the claim
       across the card at the claim size. */
    voiceCardPad: 6,
    voiceMedallion: 16,
    voiceHeaderLine: 16,
    voiceHeaderGap: 4,
    voiceClaimLine: 20,
    voiceClaimMaxLines: 4,
    voiceCardMinWidth: 200,
    voiceCardMaxWidth: 320,
    voiceGap: 8,
    voiceInset: 8,
    voiceBandPad: 8
});

/* An Omen sits at the edge its change will come from. North and Horizon share
   the top band, South and Threshold share the Threshold band, and East and West
   use the side gutters. */
export const OMEN_REGION = Object.freeze({
    north: 'horizon',
    horizon: 'horizon',
    east: 'gutterEast',
    west: 'gutterWest',
    south: 'threshold',
    threshold: 'threshold'
});

export function socketColumns(count) {
    return Math.min(3, Math.max(1, Math.ceil(Math.sqrt(count))));
}

/* Sockets laid out in a grid below a Place's name band. `top` and `bottom`
   reserve room inside the frame above and below the grid. */
export function socketGrid(frame, count, { top = 0, bottom = 0 } = {}) {
    const cols = socketColumns(count);
    const rows = Math.ceil(count / cols);
    const innerY = frame.y + LAYOUT.nameBand + top;
    const innerH = frame.height - LAYOUT.nameBand - LAYOUT.framePadBottom - top - bottom;
    const cellW = frame.width / cols;
    const cellH = innerH / rows;
    const out = [];
    for (let i = 0; i < count; i += 1) {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const inRow = Math.min(cols, count - r * cols);
        const rowWidth = inRow * cellW;
        const rowX = frame.x + (frame.width - rowWidth) / 2;
        out.push({
            index: i,
            x: Math.round(rowX + cellW * (c + 0.5)),
            y: Math.round(innerY + cellH * (r + 0.5)),
            radius: LAYOUT.socketRadius
        });
    }
    return out;
}

/* The height of one row of the grid `socketGrid` would lay out. */
export function socketRowHeight(frame, count, { top = 0, bottom = 0 } = {}) {
    const rows = Math.ceil(count / socketColumns(count));
    return (frame.height - LAYOUT.nameBand - LAYOUT.framePadBottom - top - bottom) / rows;
}

function frameFor(x, y, width, height) {
    const frame = { x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) };
    return {
        frame,
        nameAnchor: {
            x: frame.x + frame.width / 2,
            y: frame.y + 20,
            maxWidth: frame.width - 16
        }
    };
}

/* Belonging. No spatial relation between Places, so they are composed as a
   balanced field rather than a line. */
function solveGroups(places, region) {
    const rows = places.length <= 3 ? 1 : 2;
    const perRow = Math.ceil(places.length / rows);
    const rowHeight = (region.height - LAYOUT.placeGap * (rows - 1)) / rows;
    const out = {};

    places.forEach((place, i) => {
        const row = Math.floor(i / perRow);
        const col = i % perRow;
        const inRow = Math.min(perRow, places.length - row * perRow);
        const frameW = (region.width - LAYOUT.placeGap * (inRow + 1)) / inRow;
        const x = region.x + LAYOUT.placeGap * (col + 1) + frameW * col;
        const y = region.y + (rowHeight + LAYOUT.placeGap) * row;
        out[place.key] = frameFor(x, y, frameW, rowHeight);
    });

    return { places: out, segments: [] };
}

/* Order. Places run upstream to downstream with a travelled segment between
   each neighbouring pair, so severing one has an obvious downstream. */
function solveSequence(places, region) {
    const n = places.length;
    const frameW = (region.width - LAYOUT.placeGap * (n + 1)) / n;
    const frameH = region.height * 0.62;
    const y = region.y + (region.height - frameH) / 2;
    const out = {};

    places.forEach((place, i) => {
        const x = region.x + LAYOUT.placeGap * (i + 1) + frameW * i;
        out[place.key] = frameFor(x, y, frameW, frameH);
    });

    const segments = [];
    for (let i = 0; i < n - 1; i += 1) {
        const from = out[places[i].key].frame;
        const to = out[places[i + 1].key].frame;
        segments.push({
            from: places[i].key,
            to: places[i + 1].key,
            path: {
                x1: Math.round(from.x + from.width),
                y1: Math.round(from.y + from.height / 2),
                x2: Math.round(to.x),
                y2: Math.round(to.y + to.height / 2)
            }
        });
    }

    return { places: out, segments };
}

const SOLVERS = Object.freeze({
    groups: solveGroups,
    sequence: solveSequence
});

export function hasSolver(topology) {
    return Object.hasOwn(SOLVERS, topology);
}

/* Place frames and name anchors for a topology inside any region. `solve` uses
   the Ground; Voice placement uses it to re-solve a two-row Table around the
   band between its rows. */
export function solvePlaces(topology, orderedPlaces, region) {
    const solver = SOLVERS[topology];
    if (!solver) throw new Error(`No layout solver for topology: ${topology}`);
    return solver(orderedPlaces, region);
}
