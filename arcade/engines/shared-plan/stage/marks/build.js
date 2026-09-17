/* Engine One — the mark layer.

   `buildMarks` is the only Stage code that reads a World View. It turns the
   World View and the compiled layout into a MarkSet: marks from a closed
   vocabulary, each with its geometry already resolved to logical Stage units.
   Everything after it (rendering now; choreography and hit-testing later) works
   with marks and never learns which game, which Rule kinds or which Stage Form
   it is drawing. The form contributes plain shapes through its adapter.

   It reads marks, not mechanics. The World View has already decided what is
   disclosed, broken or relevant, and nothing here decides any of it again.

   Built so far: everything a Plan frame shows before a Rule breaks. A World View
   carrying anything this layer cannot draw yet is refused rather than drawn
   incompletely, so a frame is never silently wrong. */

import { LAYOUT, REGIONS, socketColumns } from '../../layout/index.js';
import { markId } from './ids.js';

/* The marks this layer can build. The rest of the B2 vocabulary (seams, load
   lines, scars, imprints, drift and return lines, headlines, the seal and clock,
   journeys and outcomes) joins as the phases that show them are built. */
export const MARK_TYPES = Object.freeze([
    'place', 'socket', 'piece', 'tether', 'affinity', 'voice', 'goal', 'omen', 'threshold', 'margin'
]);

/* Paint order, back to front. */
export const LAYERS = Object.freeze([
    'places', 'sockets', 'bands', 'links', 'pieces', 'affinity', 'voices', 'horizon', 'edges'
]);

/* A Piece is a chip carrying its name. Its name box is never wider than the
   narrowest slot the compiler measured Piece names against, so a name that
   compiled is a name that fits, wherever the Piece stands. */
const CHIP = Object.freeze({ height: 36, inset: 4, maxTextWidth: 152 });

/* Marks for allowed-in Rules are engine shapes, numbered by the Rule's position
   among allowed-in Rules. At most six Rules exist. */
const AFFINITY_SHAPES = Object.freeze(['circle', 'square', 'triangle', 'diamond', 'pentagon', 'hexagon']);
const AFFINITY_SIZE = 12;

export class StageNotBuiltError extends Error {
    constructor(missing) {
        super(`This frame needs Stage marks that are not built yet: ${missing.join(', ')}.`);
        this.name = 'StageNotBuiltError';
        this.missing = missing;
    }
}

function refuseUnbuilt(view) {
    const missing = [];
    if (view.phase !== 'plan') missing.push(`the ${view.phase} phase`);
    if (view.seams.length > 0) missing.push('Seams');
    if (view.overflow.length > 0) missing.push('overflowing Places');
    if (view.scars.length > 0 || view.imprint.length > 0 || view.driftLines.length > 0 || view.returnLines.length > 0) {
        missing.push('history marks');
    }
    if (view.resolution) missing.push('Resolve marks');
    if (view.world.clockStarted) missing.push('the clock');
    if ([...view.disclosure].some((entry) => entry.startsWith('resource:'))) missing.push('load lines');
    if (missing.length > 0) throw new StageNotBuiltError(missing);
}

const round = (n) => Math.round(n);
const box = ({ x, y, width, height }) => ({ x: round(x), y: round(y), width: round(width), height: round(height) });

/* A run of text and the box it is set in. `scale` is a layout scale role, so
   the Stage sets type at the sizes the compiler measured. */
function text(value, scale, area, { align = 'center', valign = 'center', lines = 1, emphasis = false } = {}) {
    return { value, scale, emphasis, align, valign, lines, box: box(area) };
}

function initialsOf(name) {
    return name.split(/\s+/u).filter(Boolean).slice(0, 2).map((word) => word[0].toUpperCase()).join('');
}

function chipGeometry(game) {
    const { layout } = game;
    const narrowestCell = Math.min(...game.places.map((p) => {
        const solved = layout.places[p.key];
        return solved.frame.width / socketColumns(solved.sockets.length);
    }));
    const textWidth = Math.floor(Math.min(
        ...layout.threshold.map((slot) => slot.maxWidth),
        narrowestCell - 2 * CHIP.inset,
        CHIP.maxTextWidth
    ));
    return { width: textWidth + 2 * CHIP.inset, height: CHIP.height, textWidth };
}

function centredBox(x, y, width, height) {
    return box({ x: x - width / 2, y: y - height / 2, width, height });
}

export function buildMarks(game, view, adapter) {
    refuseUnbuilt(view);
    const { layout } = game;
    const marks = new Map();
    const add = (mark) => marks.set(mark.id, mark);

    const chip = chipGeometry(game);
    const contractIndex = new Map(game.pieces.map((p, i) => [p.key, i]));
    const goalIndex = new Map(game.goals.map((g, i) => [g.key, i]));

    /* ---- Places and their sockets ---- */
    const occupied = new Map();
    for (const piece of view.pieces) {
        if (piece.location.kind !== 'place') continue;
        if (!occupied.has(piece.location.place)) occupied.set(piece.location.place, new Set());
        occupied.get(piece.location.place).add(piece.location.socket);
    }

    for (const place of view.places) {
        const solved = layout.places[place.key];
        const { frame } = solved;
        add({
            id: markId.place(place.key),
            type: 'place',
            layer: 'places',
            geometry: { frame: box(frame), surface: adapter.placeSurface(solved) },
            state: { open: place.open, closed: place.closed, locked: place.locked, stranded: place.stranded },
            text: {
                name: text(place.name, 'name', { x: frame.x + 8, y: frame.y, width: solved.nameAnchor.maxWidth, height: LAYOUT.nameBand }, { emphasis: true })
            },
            label: `${place.name}, ${place.held} of ${place.sockets} taken`
        });

        /* Sockets beyond the current capacity are reserved for a beat that may
           open them later; they do not exist on the Stage until then. */
        solved.sockets.slice(0, place.sockets).forEach((socket, index) => {
            add({
                id: markId.socket(place.key, index),
                type: 'socket',
                layer: 'sockets',
                geometry: { x: socket.x, y: socket.y, radius: socket.radius, setting: adapter.socketSetting(socket, solved) },
                state: { open: place.open, occupied: occupied.get(place.key)?.has(index) ?? false },
                text: {},
                label: `${place.name}, socket ${index + 1}`
            });
        });
    }

    /* ---- the Threshold and the Margin ---- */
    const labelArea = (item) => ({ x: item.x + (item.width - item.maxWidth) / 2, y: item.y, width: item.maxWidth, height: item.height });
    add({
        id: markId.threshold(),
        type: 'threshold',
        layer: 'bands',
        geometry: { region: box(REGIONS.threshold) },
        state: { waiting: view.pieces.filter((p) => p.location.kind === 'threshold').length },
        text: { label: text(view.world.thresholdLabel, 'micro', labelArea(layout.bandLabels.threshold), { align: 'start', lines: layout.bandLabels.threshold.lines, emphasis: true }) },
        label: view.world.thresholdLabel
    });
    add({
        id: markId.margin(),
        type: 'margin',
        layer: 'bands',
        geometry: { region: box(REGIONS.margin) },
        state: { resting: view.pieces.filter((p) => p.location.kind === 'margin').length },
        text: { label: text(view.world.marginLabel, 'micro', labelArea(layout.bandLabels.margin), { align: 'start', lines: layout.bandLabels.margin.lines, emphasis: true }) },
        label: view.world.marginLabel
    });

    /* ---- Pieces ---- */
    const pieceBoxes = new Map();
    for (const piece of view.pieces) {
        const where = piece.location;
        let centre;
        if (where.kind === 'place') {
            centre = layout.places[where.place].sockets[where.socket];
        } else {
            const slots = where.kind === 'margin' ? layout.margin : layout.threshold;
            centre = slots[contractIndex.get(piece.key)];
        }
        const chipBox = centredBox(centre.x, centre.y, chip.width, chip.height);
        pieceBoxes.set(piece.key, chipBox);
        add({
            id: markId.piece(piece.key),
            type: 'piece',
            layer: 'pieces',
            geometry: { box: chipBox, at: { ...where } },
            state: {
                material: piece.material,
                pinned: piece.pinned,
                locked: piece.locked,
                unavailable: piece.unavailable,
                justArrived: piece.justArrived
            },
            text: {
                name: text(piece.name, 'micro', { x: chipBox.x + CHIP.inset, y: chipBox.y, width: chip.textWidth, height: chip.height }, { lines: 2, emphasis: true }),
                /* Carried so the frame is complete; composition v1 has no slot
                   for a fact yet, so nothing draws it. */
                fact: piece.fact ? { value: piece.fact, box: null } : null
            },
            label: piece.name
        });

        piece.affinity.forEach((index, n) => {
            add({
                id: markId.affinity(markId.piece(piece.key), index),
                type: 'affinity',
                layer: 'affinity',
                geometry: {
                    x: chipBox.x + chipBox.width - 12 - n * (AFFINITY_SIZE + 4),
                    y: chipBox.y,
                    size: AFFINITY_SIZE,
                    shape: AFFINITY_SHAPES[index % AFFINITY_SHAPES.length]
                },
                state: { index },
                text: {},
                label: `mark ${index + 1} on ${piece.name}`
            });
        });
    }

    for (const place of view.places) {
        const { frame } = layout.places[place.key];
        place.affinity.forEach((index, n) => {
            add({
                id: markId.affinity(markId.place(place.key), index),
                type: 'affinity',
                layer: 'affinity',
                geometry: {
                    x: frame.x + frame.width - 18 - n * (AFFINITY_SIZE + 4),
                    y: frame.y,
                    size: AFFINITY_SIZE,
                    shape: AFFINITY_SHAPES[index % AFFINITY_SHAPES.length]
                },
                state: { index },
                text: {},
                label: `mark ${index + 1} on ${place.name}`
            });
        });
    }

    /* ---- tethers: pairings are embodied in the world from Plan onwards ---- */
    for (const tether of view.tethers) {
        const a = pieceBoxes.get(tether.a);
        const b = pieceBoxes.get(tether.b);
        if (!a || !b) continue;
        add({
            id: markId.tether(tether.rule),
            type: 'tether',
            layer: 'links',
            geometry: { path: adapter.tetherPath(a, b) },
            state: { relation: tether.relation, relevant: tether.relevant },
            text: {},
            label: tether.inscription
        });
    }

    /* ---- Voices stand where the compiler placed them ---- */
    for (const voice of view.voices) {
        const card = layout.voices.cards[voice.key];
        const m = card.medallion;
        add({
            id: markId.voice(voice.key),
            type: 'voice',
            layer: 'voices',
            geometry: {
                box: box(card),
                medallion: { x: m.x, y: m.y, radius: m.radius },
                connector: card.connector,
                position: card.position
            },
            state: { brightened: voice.brightened },
            text: {
                initials: text(initialsOf(voice.name), 'micro', { x: m.x - m.radius, y: m.y - m.radius, width: 2 * m.radius, height: 2 * m.radius }, { emphasis: true }),
                name: text(voice.name, 'micro', { x: card.name.x, y: card.name.y, width: card.name.maxWidth, height: card.name.lineHeight }, { align: 'start', emphasis: true }),
                role: text(voice.role, 'micro', { x: card.role.x, y: card.role.y, width: card.role.maxWidth, height: card.role.lineHeight }, { align: 'start' }),
                claim: text(voice.claim, 'claim', {
                    x: card.claim.x,
                    y: card.claim.y,
                    width: card.claim.maxWidth,
                    height: card.claim.lines * card.claim.lineHeight
                }, { align: 'start', valign: 'start', lines: card.claim.lines })
            },
            label: `${voice.name}, ${voice.role}: ${voice.claim}`
        });
    }

    /* ---- the Horizon ---- */
    for (const goal of view.horizon) {
        const slot = layout.horizon[goalIndex.get(goal.key)];
        const area = { x: slot.left + (slot.width - slot.maxWidth) / 2, y: REGIONS.horizon.y, width: slot.maxWidth, height: REGIONS.horizon.height };
        add({
            id: markId.goal(goal.key),
            type: 'goal',
            layer: 'horizon',
            geometry: { box: box(area), slot: { x: slot.left, width: slot.width } },
            state: { crossed: goal.crossed, reached: goal.reached },
            text: { label: text(goal.label, 'goal', area, { lines: 2 }) },
            label: goal.label
        });
    }

    /* ---- the Omen, at the edge its change will come from ---- */
    if (view.omen && layout.omen) {
        const o = layout.omen;
        add({
            id: markId.omen(o.beat),
            type: 'omen',
            layer: 'edges',
            geometry: { box: box(o), edge: view.omen.edge, region: o.region },
            state: { sharpened: view.omen.sharpened },
            text: {
                text: text(view.omen.text, 'micro', { x: o.x + (o.width - o.maxWidth) / 2, y: o.y, width: o.maxWidth, height: o.height }, { lines: o.lines })
            },
            label: view.omen.text
        });
    }

    return { phase: view.phase, beatCount: view.beatCount, focus: null, marks };
}
