/* Engine One — where Voices stand.

   Satellite placement is canonical. A Voice stands with the Place it is
   anchored to, so it is physically near what it is about and never in a
   sidebar. On a Table or a Vessel it stands in a strip under the Place name. On
   a Route, whose frames do not fill the Ground, it stands just above its frame,
   once every frame has been lowered enough to make room. The anchor only fixes
   where a Voice stands: its tethers can still point at a Piece, and a Voice
   never follows a Piece around the world.

   Satellite placement can squeeze a Place's socket rows under the minimum a
   Piece needs. A two-row Table then falls back, deterministically, to one band
   where the gap between its rows was. The band stays inside the world, every
   card in it carries a connector to its anchor Place, and the compiler reports
   the fallback as a warning. A fallback that works is advisory, never an error.

   When nothing keeps the minimum — a one-row Table or a Route has no rows to
   put a band between, and a band can itself be too tight — the compiler refuses
   the world rather than ship a Stage whose Pieces do not fit.

   There is no Voice lane. */

import { LAYOUT, REGIONS, socketRowHeight, solvePlaces } from './solvers.js';
import { wrapLines } from './metrics.js';

/* ---- cards ---- */

/* A card is sized for the longest thing its Voice will ever say, Resolve
   outcome lines included, so it never grows when the world resolves. Whether
   outcome lines fit is part of B2's Resolve composition; here they only
   reserve room. */
function sizeCard(voice, width) {
    const measure = width - 2 * LAYOUT.voiceCardPad;
    const said = [
        voice.claim,
        ...voice.claimVariants,
        ...voice.outcomes.map((o) => o.line),
        voice.fallbackOutcome
    ];
    const needed = Math.max(...said.map((text) => wrapLines(text, 'claim', measure).length));
    const lines = Math.min(LAYOUT.voiceClaimMaxLines, needed);
    return {
        lines,
        height: 2 * LAYOUT.voiceCardPad + 2 * LAYOUT.voiceHeaderLine + LAYOUT.voiceHeaderGap
            + lines * LAYOUT.voiceClaimLine
    };
}

function card(voice, { x, y, width }, { lines, height }, position) {
    const pad = LAYOUT.voiceCardPad;
    const r = LAYOUT.voiceMedallion;
    const textX = x + pad + 2 * r + pad;
    const header = { x: textX, maxWidth: x + width - pad - textX, lineHeight: LAYOUT.voiceHeaderLine };
    return {
        x,
        y,
        width,
        height,
        host: voice.anchor.place,
        position,
        medallion: { x: x + pad + r, y: y + pad + r, radius: r },
        name: { ...header, y: y + pad },
        role: { ...header, y: y + pad + LAYOUT.voiceHeaderLine },
        claim: {
            x: x + pad,
            y: y + pad + 2 * LAYOUT.voiceHeaderLine + LAYOUT.voiceHeaderGap,
            maxWidth: width - 2 * pad,
            lines,
            lineHeight: LAYOUT.voiceClaimLine
        },
        connector: null
    };
}

/* Column edges are rounded, not widths, so cards tile their strip exactly. */
function columns(left, width, count) {
    const cell = (width - (count - 1) * LAYOUT.voiceGap) / count;
    return Array.from({ length: count }, (_, i) => {
        const x = Math.round(left + i * (cell + LAYOUT.voiceGap));
        return { x, width: Math.round(left + i * (cell + LAYOUT.voiceGap) + cell) - x };
    });
}

/* How much of a frame a strip takes from its socket grid. A strip standing
   above the frame takes nothing. */
export function voiceReserve(strip) {
    return strip?.position === 'inside' ? strip.height + LAYOUT.voiceGap : 0;
}

/* ---- satellite ---- */

/* The Voices of one Place, side by side while each card keeps a readable width,
   stacked otherwise. */
function stripFor(frame, guests) {
    const left = frame.x + LAYOUT.voiceInset;
    const width = frame.width - 2 * LAYOUT.voiceInset;
    const sideBySide = (width - (guests.length - 1) * LAYOUT.voiceGap) / guests.length;
    const rows = guests.length > 1 && sideBySide < LAYOUT.voiceCardMinWidth
        ? guests.map((voice) => [voice])
        : [guests];
    const laid = rows.map((row) => {
        const cols = columns(left, width, row.length);
        return row.map((voice, i) => ({ voice, ...cols[i], size: sizeCard(voice, cols[i].width) }));
    });
    const heights = laid.map((row) => Math.max(...row.map((c) => c.size.height)));
    return { laid, heights, height: heights.reduce((a, b) => a + b, 0) + (laid.length - 1) * LAYOUT.voiceGap };
}

function satellite(compiled, solved) {
    const ground = REGIONS.ground;
    const guestsOf = new Map();
    for (const voice of compiled.voices) {
        if (!guestsOf.has(voice.anchor.place)) guestsOf.set(voice.anchor.place, []);
        guestsOf.get(voice.anchor.place).push(voice);
    }
    const strips = new Map([...guestsOf].map(([key, guests]) => [key, stripFor(solved.places[key].frame, guests)]));

    /* A Route's frames do not fill the Ground. Lowering them all by the same
       amount, when there is room below, lets every Voice stand above its Place
       without taking anything from a socket. */
    let shift = 0;
    let above = false;
    if (compiled.topology.kind === 'sequence' && strips.size > 0) {
        const { frame } = Object.values(solved.places)[0];
        const tallest = Math.max(...[...strips.values()].map((s) => s.height));
        const needed = Math.max(0, tallest + LAYOUT.voiceGap - (frame.y - ground.y));
        if (needed <= ground.y + ground.height - (frame.y + frame.height)) {
            shift = needed;
            above = true;
        }
    }

    const frames = {};
    for (const place of compiled.places) {
        const { frame, nameAnchor } = solved.places[place.key];
        frames[place.key] = {
            frame: { ...frame, y: frame.y + shift },
            nameAnchor: { ...nameAnchor, y: nameAnchor.y + shift },
            strip: null
        };
    }

    const placed = new Map();
    for (const [key, strip] of strips) {
        const { frame } = frames[key];
        const position = above ? 'above' : 'inside';
        const top = above ? frame.y - LAYOUT.voiceGap - strip.height : frame.y + LAYOUT.nameBand;
        let y = top;
        strip.laid.forEach((row, r) => {
            for (const c of row) placed.set(c.voice.key, card(c.voice, { x: c.x, y, width: c.width }, c.size, position));
            y += strip.heights[r] + LAYOUT.voiceGap;
        });
        frames[key].strip = {
            x: frame.x + LAYOUT.voiceInset,
            y: top,
            width: frame.width - 2 * LAYOUT.voiceInset,
            height: strip.height,
            position
        };
    }

    return {
        placement: 'satellite',
        frames,
        segments: solved.segments.map((s) => ({ ...s, path: { ...s.path, y1: s.path.y1 + shift, y2: s.path.y2 + shift } })),
        band: null,
        cards: Object.fromEntries(compiled.voices.map((v) => [v.key, placed.get(v.key)]))
    };
}

/* ---- the dense-Table fallback ---- */

/* One row of cards, each as near the centre of its anchor as the others allow. */
function pack(items, left, right) {
    const sorted = [...items].sort((a, b) => a.ideal - b.ideal || a.order - b.order);
    let cursor = left + LAYOUT.voiceGap;
    for (const item of sorted) {
        item.x = Math.max(item.ideal - item.width / 2, cursor);
        cursor = item.x + item.width + LAYOUT.voiceGap;
    }
    let limit = right - LAYOUT.voiceGap;
    for (const item of sorted.reverse()) {
        item.x = Math.min(item.x, limit - item.width);
        limit = item.x - LAYOUT.voiceGap;
    }
}

/* The shortest straight line from a card's edge to its anchor Place's edge. */
function connectorFor(c, frame) {
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const x2 = clamp(c.x + c.width / 2, frame.x, frame.x + frame.width);
    const y2 = clamp(c.y + c.height / 2, frame.y, frame.y + frame.height);
    return {
        x1: Math.round(clamp(x2, c.x, c.x + c.width)),
        y1: Math.round(clamp(y2, c.y, c.y + c.height)),
        x2: Math.round(x2),
        y2: Math.round(y2)
    };
}

/* A card anchored to the upper row hangs from the top of the band, one anchored
   to the lower row stands on its bottom, and a connector joins each to its
   Place, because a card in the band is otherwise as near the row it does not
   belong to as the row it does. */
function betweenRows(compiled, ordered) {
    const ground = REGIONS.ground;
    const perRow = Math.ceil(ordered.length / 2);
    const rows = [ordered.slice(0, perRow), ordered.slice(perRow)];
    const n = compiled.voices.length;
    const width = Math.floor(Math.min(LAYOUT.voiceCardMaxWidth, (ground.width - (n + 1) * LAYOUT.voiceGap) / n));
    const sizes = new Map(compiled.voices.map((v) => [v.key, sizeCard(v, width)]));

    const height = Math.max(...[...sizes.values()].map((s) => s.height)) + 2 * LAYOUT.voiceBandPad;
    const rowHeight = Math.floor((ground.height - height) / 2);
    const band = { x: ground.x, y: ground.y + rowHeight, width: ground.width, height };
    const regions = [
        { x: ground.x, y: ground.y, width: ground.width, height: rowHeight },
        { x: ground.x, y: band.y + height, width: ground.width, height: ground.height - rowHeight - height }
    ];

    const frames = {};
    const rowOf = {};
    rows.forEach((row, r) => {
        const solved = solvePlaces('groups', row, regions[r]);
        for (const place of row) {
            frames[place.key] = { ...solved.places[place.key], strip: null };
            rowOf[place.key] = r;
        }
    });

    const items = compiled.voices.map((voice, order) => {
        const { frame } = frames[voice.anchor.place];
        return { voice, order, width, ideal: frame.x + frame.width / 2 };
    });
    pack(items, band.x, band.x + band.width);

    const cards = {};
    for (const item of [...items].sort((a, b) => a.order - b.order)) {
        const size = sizes.get(item.voice.key);
        const lower = rowOf[item.voice.anchor.place] === 1;
        const y = lower ? band.y + height - LAYOUT.voiceBandPad - size.height : band.y + LAYOUT.voiceBandPad;
        const placed = card(item.voice, { x: Math.round(item.x), y, width }, size, 'band');
        placed.connector = connectorFor(placed, frames[item.voice.anchor.place].frame);
        cards[item.voice.key] = placed;
    }

    return { placement: 'betweenRows', frames, segments: [], band, cards };
}

/* ---- choosing ---- */

function crowdedPlaces(compiled, placement, loadReserve) {
    return compiled.places
        .map((place) => {
            const { frame, strip } = placement.frames[place.key];
            const row = socketRowHeight(frame, place.maxSockets, { top: voiceReserve(strip), bottom: loadReserve });
            return { place: place.key, row };
        })
        .filter(({ row }) => row < LAYOUT.minSocketRow)
        .map(({ place, row }) => ({ place, socketRow: Math.floor(row) }));
}

/* Where every Voice stands, and the Place frames around them. `fallback` names
   the Places satellite placement would have squeezed when a two-row Table uses
   the band instead. `crowded` names any socket row still under the minimum once
   Voices are placed; the compiler refuses a world with any. */
export function placeVoices(compiled, ordered, solved, loadReserve) {
    const local = satellite(compiled, solved);
    if (compiled.voices.length === 0) {
        return { ...local, placement: 'none', fallback: null, crowded: [] };
    }

    const squeezed = crowdedPlaces(compiled, local, loadReserve);
    const twoRowTable = compiled.topology.kind === 'groups' && ordered.length > 3;
    if (squeezed.length === 0 || !twoRowTable) {
        return { ...local, fallback: null, crowded: squeezed };
    }

    const band = betweenRows(compiled, ordered);
    return {
        ...band,
        fallback: { from: 'satellite', squeezed },
        crowded: crowdedPlaces(compiled, band, loadReserve)
    };
}
