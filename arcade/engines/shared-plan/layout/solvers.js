/* Engine One — layout solvers.

   Pure geometry in logical Stage units. One solver per topology kind, shared by
   every Stage Form of that kind: Table and Vessel are both `groups`, so they
   share a solver and differ only in the Ground painter that B2 will add.

   Dormant Places are solved too, and their geometry is reserved but hidden, so
   a Place that opens later arrives in a position that was always waiting for it
   rather than reflowing the world. */

export const STAGE = Object.freeze({ width: 1280, height: 720 });

export const REGIONS = Object.freeze({
    horizon: Object.freeze({ x: 80, y: 24, width: 1120, height: 64 }),
    ground: Object.freeze({ x: 80, y: 104, width: 1120, height: 452 }),
    threshold: Object.freeze({ x: 80, y: 572, width: 1120, height: 64 }),
    margin: Object.freeze({ x: 80, y: 652, width: 1120, height: 56 })
});

const PLACE_GAP = 28;
const SOCKET_RADIUS = 18;
const NAME_BAND = 34;

function socketGrid(frame, sockets) {
    const cols = Math.min(3, Math.max(1, Math.ceil(Math.sqrt(sockets))));
    const rows = Math.ceil(sockets / cols);
    const innerY = frame.y + NAME_BAND;
    const innerH = frame.height - NAME_BAND - 12;
    const cellW = frame.width / cols;
    const cellH = innerH / rows;
    const out = [];
    for (let i = 0; i < sockets; i += 1) {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const inRow = Math.min(cols, sockets - r * cols);
        const rowWidth = inRow * cellW;
        const rowX = frame.x + (frame.width - rowWidth) / 2;
        out.push({
            index: i,
            x: Math.round(rowX + cellW * (c + 0.5)),
            y: Math.round(innerY + cellH * (r + 0.5)),
            radius: SOCKET_RADIUS
        });
    }
    return out;
}

function frameFor(x, y, width, height, place) {
    const frame = { x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) };
    return {
        frame,
        nameAnchor: {
            x: frame.x + frame.width / 2,
            y: frame.y + 20,
            maxWidth: frame.width - 16
        },
        sockets: socketGrid(frame, place.sockets)
    };
}

/* Belonging. No spatial relation between Places, so they are composed as a
   balanced field rather than a line. */
function solveGroups(places) {
    const g = REGIONS.ground;
    const rows = places.length <= 3 ? 1 : 2;
    const perRow = Math.ceil(places.length / rows);
    const rowHeight = (g.height - PLACE_GAP * (rows - 1)) / rows;
    const out = {};

    places.forEach((place, i) => {
        const row = Math.floor(i / perRow);
        const col = i % perRow;
        const inRow = Math.min(perRow, places.length - row * perRow);
        const frameW = (g.width - PLACE_GAP * (inRow + 1)) / inRow;
        const x = g.x + PLACE_GAP * (col + 1) + frameW * col;
        const y = g.y + (rowHeight + PLACE_GAP) * row;
        out[place.key] = frameFor(x, y, frameW, rowHeight, place);
    });

    return { places: out, segments: [] };
}

/* Order. Places run upstream to downstream with a travelled segment between
   each neighbouring pair, so severing one has an obvious downstream. */
function solveSequence(places) {
    const g = REGIONS.ground;
    const n = places.length;
    const frameW = (g.width - PLACE_GAP * (n + 1)) / n;
    const frameH = g.height * 0.62;
    const y = g.y + (g.height - frameH) / 2;
    const out = {};

    places.forEach((place, i) => {
        const x = g.x + PLACE_GAP * (i + 1) + frameW * i;
        out[place.key] = frameFor(x, y, frameW, frameH, place);
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

function slotRow(region, count) {
    if (count === 0) return [];
    const cellW = region.width / count;
    return Array.from({ length: count }, (_, i) => ({
        index: i,
        x: Math.round(region.x + cellW * (i + 0.5)),
        y: Math.round(region.y + region.height / 2),
        maxWidth: Math.round(cellW - 12)
    }));
}

export function solve(compiled) {
    const topology = compiled.topology.kind;
    const solver = SOLVERS[topology];
    if (!solver) throw new Error(`No layout solver for topology: ${topology}`);

    /* Sequence lays out in travel order; groups and graph keep contract order. */
    const ordered = topology === 'sequence'
        ? compiled.topology.order.map((k) => compiled.placeIndex[k])
        : compiled.places;

    const solved = solver(ordered);

    return {
        stage: STAGE,
        regions: REGIONS,
        places: solved.places,
        segments: solved.segments,
        threshold: slotRow(REGIONS.threshold, compiled.pieces.length),
        margin: slotRow(REGIONS.margin, compiled.pieces.length),
        horizon: slotRow(REGIONS.horizon, Math.max(1, compiled.goals.length)),
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
