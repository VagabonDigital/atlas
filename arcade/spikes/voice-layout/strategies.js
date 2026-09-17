/* Voice placement spike — where Voices stand.

   CLOSED at the end of B1.1. Satellite placement became canonical, with the
   between-rows band as the only fallback, and is implemented in
   engines/shared-plan/layout/voices.js. This directory is kept as the evidence
   behind that decision and is not maintained; the lane below is not a
   placement the engine offers.

   Dev-only. Nothing in the engine imports this directory, and nothing here is
   wired into `solve`. It compares ways of placing Voices on composition v1 so
   the spatial trade-off is visible before the layout architecture commits:

     lane       a band across the top of the Ground. Place frames are solved in
                what is left and each Voice sits above its anchor's column.
     satellite  each Voice stands with the Place it is anchored to: in a strip
                under the Place name, or, on a Route, where frames do not fill
                the Ground, just above the frame.
     hybrid     satellite whenever every Voice fits; otherwise one band laid next
                to the anchors: between the two rows of a two-row Table, or
                across the top.

   Everything is measured with the compiler's own solvers and font metrics, so
   the numbers are the ones a compile would see. */

import {
    solvePlaces, socketGrid, socketColumns, REGIONS, LAYOUT, measure
} from '../../engines/shared-plan/layout/index.js';
import { variantTouches } from '../../engines/shared-plan/model/index.js';

/* A Voice card: a medallion with the name and role beside it, then the claim at
   the card's full width, set at the claim scale. */
export const CARD = Object.freeze({
    pad: 6,
    medallion: 16,
    headerLine: 16,
    claimLine: 20,
    maxLines: 4,
    minWidth: 200,
    maxWidth: 320,
    gap: 8
});

/* A Piece standing in a socket is a 36px chip; a row of them needs 8px of air. */
export const MIN_CELL = 44;

const FRAME_INSET = 8;
const BAND_PAD = 8;
const BAND_GAP = 12;
const HEADLINE_LINE = 34;
/* Another frame within this much of a card's own anchor is as near, to the eye. */
const AMBIGUITY_SLACK = 12;

/* Greedy word wrap, the way a browser sets a paragraph. A line wider than the
   measure means a single word that cannot be broken. */
export function wrap(text, role, width) {
    const space = measure(' ', role);
    const lines = [];
    let words = [];
    let current = 0;
    for (const word of text.trim().split(/\s+/u)) {
        const w = measure(word, role);
        if (words.length > 0 && current + space + w > width) {
            lines.push({ text: words.join(' '), width: current });
            words = [];
            current = 0;
        }
        current = words.length > 0 ? current + space + w : w;
        words.push(word);
    }
    if (words.length > 0) lines.push({ text: words.join(' '), width: current });
    return lines;
}

/* Sized for the longest thing the Voice will ever say, Resolve outcome lines
   included, so nothing reflows when the world resolves. */
export function measureCard(voice, width) {
    const inner = width - 2 * CARD.pad;
    const headerWidth = inner - 2 * CARD.medallion - CARD.pad;
    const said = [voice.claim, ...voice.claimVariants];
    const outcomes = [...voice.outcomes.map((o) => o.line), voice.fallbackOutcome];
    const saidWraps = said.map((text) => wrap(text, 'claim', inner));
    const outcomeWraps = outcomes.map((text) => wrap(text, 'claim', inner));
    const claimLines = Math.max(...saidWraps.map((l) => l.length));
    const outcomeLines = Math.max(...outcomeWraps.map((l) => l.length));

    const problems = [];
    for (const [label, text] of [['name', voice.name], ['role', voice.role]]) {
        if (measure(text, 'micro') > headerWidth) {
            problems.push(`${voice.key}: ${label} "${text}" is wider than its ${Math.round(headerWidth)}px header`);
        }
    }
    const check = (label, texts, wraps) => texts.forEach((text, i) => {
        const lines = wraps[i];
        if (lines.some((l) => l.width > inner)) {
            problems.push(`${voice.key}: a word in the ${label} "${text}" is wider than ${Math.round(inner)}px`);
        } else if (lines.length > CARD.maxLines) {
            problems.push(`${voice.key}: the ${label} "${text}" needs ${lines.length} lines at ${Math.round(inner)}px`);
        }
    });
    check('claim', said, saidWraps);
    check('outcome line', outcomes, outcomeWraps);

    const lines = Math.min(CARD.maxLines, Math.max(claimLines, outcomeLines));
    return {
        key: voice.key,
        voice,
        width,
        height: 2 * CARD.pad + 2 * CARD.headerLine + 4 + lines * CARD.claimLine,
        inner,
        claimLines,
        outcomeLines,
        claimWrap: saidWraps[0],
        problems
    };
}

function orderedPlaces(game) {
    return game.topology.kind === 'sequence'
        ? game.topology.order.map((k) => game.placeIndex[k])
        : game.places;
}

const loadReserve = (game) => game.resources.filter((r) => r.scope === 'place').length * LAYOUT.loadBand;

function withSockets(frame, place, { top = 0, bottom = 0 } = {}) {
    const count = place.maxSockets;
    const cols = socketColumns(count);
    const rows = Math.ceil(count / cols);
    const innerHeight = frame.height - LAYOUT.nameBand - LAYOUT.framePadBottom - top - bottom;
    return {
        frame,
        top,
        sockets: socketGrid(frame, count, { top, bottom }),
        cellWidth: frame.width / cols,
        cellHeight: innerHeight / rows,
        socketArea: frame.width * Math.max(0, innerHeight)
    };
}

/* What a Voice is anchored to, as a rectangle. A Piece has no fixed position,
   so the nearest stable stand-in is its Threshold slot, where it starts. */
function anchorRect(game, places, voice) {
    if (voice.anchor.kind === 'place') return places[voice.anchor.place].frame;
    const slot = game.layout.threshold[game.pieces.findIndex((p) => p.key === voice.anchor.piece)];
    return { x: slot.left, y: REGIONS.threshold.y, width: slot.width, height: REGIONS.threshold.height };
}

/* One row of cards, each as near its ideal centre as the others allow. */
function packRow(items, left, right) {
    const sorted = [...items].sort((a, b) => a.ideal - b.ideal || a.order - b.order);
    let cursor = left + CARD.gap;
    for (const item of sorted) {
        item.x = Math.max(item.ideal - item.card.width / 2, cursor);
        cursor = item.x + item.card.width + CARD.gap;
    }
    let limit = right - CARD.gap;
    for (const item of [...sorted].reverse()) {
        item.x = Math.min(item.x, limit - item.card.width);
        limit = item.x - CARD.gap;
    }
    return sorted.length === 0 || sorted[0].x >= left + CARD.gap - 0.5;
}

export function baseline(game) {
    const solved = solvePlaces(game.topology.kind, orderedPlaces(game), REGIONS.ground);
    const bottom = loadReserve(game);
    const places = Object.fromEntries(
        game.places.map((p) => [p.key, withSockets(solved.places[p.key].frame, p, { bottom })])
    );
    return {
        id: 'baseline', label: 'No Voices', variant: 'composition v1',
        places, segments: solved.segments, bands: [], cards: [], problems: []
    };
}

function bandItems(game) {
    const n = game.voices.length;
    const width = Math.min(CARD.maxWidth, (REGIONS.ground.width - (n + 1) * CARD.gap) / n);
    return game.voices.map((voice, order) => ({ order, card: measureCard(voice, width) }));
}

function placeInBand(game, meta, places, segments, band, items, yFor) {
    for (const item of items) {
        const target = anchorRect(game, places, item.card.voice);
        item.ideal = target.x + target.width / 2;
    }
    const problems = [];
    if (!packRow(items, band.x, band.x + band.width)) problems.push('the band cannot hold every Voice side by side');
    const cards = items.map((item) => ({ ...item.card, x: item.x, y: yFor(item), host: null, placement: 'band' }));
    for (const card of cards) problems.push(...card.problems);
    return { ...meta, places, segments, bands: [band], cards, problems };
}

export function lane(game) {
    const ground = REGIONS.ground;
    if (game.voices.length === 0) return { ...baseline(game), id: 'lane', label: 'Lane', variant: 'no Voices' };
    const items = bandItems(game);
    const height = Math.max(...items.map((i) => i.card.height)) + 2 * BAND_PAD;
    const band = { x: ground.x, y: ground.y, width: ground.width, height };
    const region = {
        x: ground.x,
        y: band.y + height + BAND_GAP,
        width: ground.width,
        height: ground.height - height - BAND_GAP
    };
    const solved = solvePlaces(game.topology.kind, orderedPlaces(game), region);
    const bottom = loadReserve(game);
    const places = Object.fromEntries(
        game.places.map((p) => [p.key, withSockets(solved.places[p.key].frame, p, { bottom })])
    );
    return placeInBand(game, { id: 'lane', label: 'Lane', variant: 'across the top of the Ground' },
        places, solved.segments, band, items, () => band.y + BAND_PAD);
}

/* A two-row Table with one band where the gap between the rows was. Both rows
   touch it, so every card sits against the edge of its own anchor. */
export function betweenRows(game) {
    const ground = REGIONS.ground;
    const ordered = orderedPlaces(game);
    const perRow = Math.ceil(ordered.length / 2);
    const rows = [ordered.slice(0, perRow), ordered.slice(perRow)];
    const items = bandItems(game);
    const height = Math.max(...items.map((i) => i.card.height)) + 2 * BAND_PAD;
    const rowHeight = (ground.height - height) / 2;
    const band = { x: ground.x, y: ground.y + rowHeight, width: ground.width, height };
    const regions = [
        { x: ground.x, y: ground.y, width: ground.width, height: rowHeight },
        { x: ground.x, y: band.y + height, width: ground.width, height: rowHeight }
    ];
    const bottom = loadReserve(game);
    const places = {};
    const rowOf = {};
    rows.forEach((row, r) => {
        const solved = solvePlaces('groups', row, regions[r]);
        for (const place of row) {
            places[place.key] = withSockets(solved.places[place.key].frame, place, { bottom });
            rowOf[place.key] = r;
        }
    });
    return placeInBand(game, { id: 'betweenRows', label: 'Between rows', variant: 'band between the rows' },
        places, [], band, items, (item) => {
            const { anchor } = item.card.voice;
            const lower = anchor.kind === 'place' && rowOf[anchor.place] === 1;
            return lower ? band.y + height - BAND_PAD - item.card.height : band.y + BAND_PAD;
        });
}

/* The cards a Place's Voices need, side by side if each keeps a readable
   width, stacked otherwise. Width depends only on the frame's width. */
function strip(frame, guests) {
    const inner = frame.width - 2 * FRAME_INSET;
    const sideBySide = (inner - (guests.length - 1) * CARD.gap) / guests.length;
    const stacked = guests.length > 1 && sideBySide < CARD.minWidth;
    const width = stacked ? inner : sideBySide;
    const rows = (stacked ? guests.map((g) => [g]) : [guests]).map((row) => row.map((voice) => measureCard(voice, width)));
    const rowHeights = rows.map((row) => Math.max(...row.map((c) => c.height)));
    return { width, rows, rowHeights, height: rowHeights.reduce((a, b) => a + b, 0) + (rows.length - 1) * CARD.gap };
}

export function satellite(game) {
    const ground = REGIONS.ground;
    const solved = solvePlaces(game.topology.kind, orderedPlaces(game), ground);
    const bottom = loadReserve(game);
    const problems = [];

    const guestsOf = new Map();
    for (const voice of game.voices) {
        if (voice.anchor.kind !== 'place') {
            problems.push(`${voice.key}: anchored to a Piece, so there is no Place for the Voice to stand in`);
            continue;
        }
        if (!guestsOf.has(voice.anchor.place)) guestsOf.set(voice.anchor.place, []);
        guestsOf.get(voice.anchor.place).push(voice);
    }
    const strips = new Map([...guestsOf].map(([key, guests]) => [key, strip(solved.places[key].frame, guests)]));

    /* A Route's frames do not fill the Ground. If lowering every frame by the
       same amount makes room above them, the Voices stand above their Places
       and no socket gives anything up. */
    let shift = 0;
    let above = false;
    if (game.topology.kind === 'sequence' && strips.size > 0) {
        const frame = Object.values(solved.places)[0].frame;
        const tallest = Math.max(...[...strips.values()].map((s) => s.height));
        const freeAbove = frame.y - ground.y;
        const freeBelow = ground.y + ground.height - (frame.y + frame.height);
        const needed = Math.max(0, tallest + CARD.gap - freeAbove);
        if (needed <= freeBelow) {
            shift = Math.ceil(needed);
            above = true;
        }
    }
    const lowered = (r) => ({ ...r, y: r.y + shift });
    const segments = solved.segments.map((s) => ({ ...s, path: { ...s.path, y1: s.path.y1 + shift, y2: s.path.y2 + shift } }));

    const places = {};
    const cards = [];
    for (const place of game.places) {
        const frame = lowered(solved.places[place.key].frame);
        const s = strips.get(place.key);
        if (!s) {
            places[place.key] = withSockets(frame, place, { bottom });
            continue;
        }
        let y = above ? frame.y - CARD.gap - s.height : frame.y + LAYOUT.nameBand;
        s.rows.forEach((row, r) => {
            row.forEach((card, i) => {
                cards.push({
                    ...card,
                    x: frame.x + FRAME_INSET + i * (s.width + CARD.gap),
                    y,
                    host: place.key,
                    placement: above ? 'above' : 'inside'
                });
                problems.push(...card.problems);
            });
            y += s.rowHeights[r] + CARD.gap;
        });
        places[place.key] = withSockets(frame, place, { top: above ? 0 : s.height + CARD.gap, bottom });
    }

    const variant = above ? `above the frame, frames lowered ${shift}px` : 'inside the frame';
    return { id: 'satellite', label: 'Satellite', variant, shift, places, segments, bands: [], cards, problems };
}

export function hybrid(game) {
    const local = satellite(game);
    const verdict = evaluate(game, local, baseline(game));
    if (verdict.pass) {
        return { ...local, id: 'hybrid', label: 'Hybrid', variant: `satellite, ${local.variant}`, fellBackBecause: [] };
    }
    const twoRows = game.topology.kind === 'groups' && game.places.length > 3;
    const band = twoRows ? betweenRows(game) : lane(game);
    return {
        ...band,
        id: 'hybrid',
        label: 'Hybrid',
        variant: twoRows ? 'band between the rows' : 'band across the top',
        fellBackBecause: [...verdict.problems, ...verdict.collisions]
    };
}

/* ---- measurement ---- */

const overlaps = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
const inside = (a, b) => a.x >= b.x - 0.5 && a.y >= b.y - 0.5
    && a.x + a.width <= b.x + b.width + 0.5 && a.y + a.height <= b.y + b.height + 0.5;
const mean = (xs) => (xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length);

function rectGap(a, b) {
    const dx = Math.max(0, b.x - (a.x + a.width), a.x - (b.x + b.width));
    const dy = Math.max(0, b.y - (a.y + a.height), a.y - (b.y + b.height));
    return Math.hypot(dx, dy);
}

/* Liang–Barsky: does the segment pass through the rectangle's interior? */
function segmentCrosses(a, b, r) {
    let t0 = 0;
    let t1 = 1;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const clip = (p, q) => {
        if (p === 0) return q > 0;
        const t = q / p;
        if (p < 0) {
            if (t > t1) return false;
            if (t > t0) t0 = t;
        } else {
            if (t < t0) return false;
            if (t < t1) t1 = t;
        }
        return true;
    };
    return clip(-dx, a.x - r.x) && clip(dx, r.x + r.width - a.x)
        && clip(-dy, a.y - r.y) && clip(dy, r.y + r.height - a.y) && t0 < t1;
}

export function medallionCentre(card) {
    return { x: card.x + CARD.pad + CARD.medallion, y: card.y + CARD.pad + CARD.medallion };
}

/* How far a tether has to reach. A Piece can be at its Threshold slot, in the
   Margin or in any socket of any Place, so every one of those is measured; the
   Threshold slot, where it starts, is the one drawn. */
function tetherReach(game, result, card, target) {
    const from = medallionCentre(card);
    const positions = [];
    if (target.kind === 'place') {
        const f = result.places[target.place].frame;
        positions.push({ x: f.x + f.width / 2, y: f.y + f.height / 2, within: target.place });
    } else {
        const i = game.pieces.findIndex((p) => p.key === target.piece);
        positions.push({ x: game.layout.threshold[i].x, y: game.layout.threshold[i].y, within: null });
        positions.push({ x: game.layout.margin[i].x, y: game.layout.margin[i].y, within: null });
        for (const place of game.places) {
            for (const s of result.places[place.key].sockets) positions.push({ x: s.x, y: s.y, within: place.key });
        }
    }
    const lengths = positions.map((p) => Math.hypot(p.x - from.x, p.y - from.y));
    const crossings = positions.map((p) => game.places.filter((place) => {
        if (place.key === p.within) return false;
        if (card.host === place.key && card.placement === 'inside') return false;
        return segmentCrosses(from, p, result.places[place.key].frame);
    }).length);
    return {
        target,
        from,
        drawTo: positions[0],
        meanLength: mean(lengths),
        maxLength: Math.max(...lengths),
        meanCrossings: mean(crossings)
    };
}

/* Where a change's headline would be inscribed if the Stage kept composition
   v1's rule: across the top of the locus frame, under its name. */
function headlineBox(frame) {
    const g = REGIONS.ground;
    const x = Math.min(Math.max(frame.x + frame.width / 2 - LAYOUT.headlineWidth / 2, g.x), g.x + g.width - LAYOUT.headlineWidth);
    return { x, y: frame.y + LAYOUT.nameBand, width: LAYOUT.headlineWidth, height: LAYOUT.headlineLines * HEADLINE_LINE };
}

export function evaluate(game, result, base) {
    const problems = [...result.problems];
    const collisions = [];
    const ground = REGIONS.ground;
    const frames = game.places.map((p) => ({ key: p.key, rect: result.places[p.key].frame }));

    for (const card of result.cards) {
        if (!inside(card, ground)) collisions.push(`${card.key} leaves the Ground`);
        for (const f of frames) {
            if (card.host === f.key && card.placement === 'inside') {
                if (!inside(card, f.rect)) collisions.push(`${card.key} spills out of ${f.key}`);
            } else if (overlaps(card, f.rect)) {
                collisions.push(`${card.key} covers ${f.key}`);
            }
        }
        if (card.host && card.placement === 'inside') {
            const covered = result.places[card.host].sockets.some((s) => overlaps(card, {
                x: s.x - s.radius, y: s.y - s.radius, width: 2 * s.radius, height: 2 * s.radius
            }));
            if (covered) collisions.push(`${card.key} covers a socket in ${card.host}`);
        }
    }
    for (let i = 0; i < result.cards.length; i += 1) {
        for (let j = i + 1; j < result.cards.length; j += 1) {
            if (overlaps(result.cards[i], result.cards[j])) {
                collisions.push(`${result.cards[i].key} overlaps ${result.cards[j].key}`);
            }
        }
    }
    for (const band of result.bands) {
        for (const f of frames) if (overlaps(band, f.rect)) collisions.push(`the band covers ${f.key}`);
    }

    for (const place of game.places) {
        const p = result.places[place.key];
        if (p.cellHeight < MIN_CELL) {
            problems.push(`${place.key}: socket rows are ${Math.round(p.cellHeight)}px, under the ${MIN_CELL}px a Piece needs`);
        }
    }

    const sum = (r) => game.places.reduce((total, p) => total + r.places[p.key].socketArea, 0);
    const minCell = Math.min(...game.places.map((p) => result.places[p.key].cellHeight));
    const baseMinCell = Math.min(...game.places.map((p) => base.places[p.key].cellHeight));

    /* A change whose headline lands on a Voice at the moment that Voice leans in. */
    const headlineConflicts = [];
    for (const beat of game.beats) {
        for (const variant of beat.variants) {
            if (variant.locus.kind !== 'place') continue;
            const box = headlineBox(result.places[variant.locus.place].frame);
            const touched = new Set(variantTouches(game, variant));
            for (const card of result.cards) {
                if (!overlaps(card, box)) continue;
                const leansIn = card.voice.tethers.some((t) => touched.has(t.kind === 'piece' ? `piece:${t.piece}` : `place:${t.place}`));
                headlineConflicts.push({ beat: beat.key, variant: variant.key, voice: card.key, leansIn });
            }
        }
    }

    const cards = result.cards.map((card) => {
        const anchorGap = rectGap(card, anchorRect(game, result.places, card.voice));
        /* Nearness only says "this is mine" if nothing else is about as near. */
        const ambiguousWith = frames
            .filter((f) => !(card.voice.anchor.kind === 'place' && f.key === card.voice.anchor.place))
            .filter((f) => rectGap(card, f.rect) <= anchorGap + AMBIGUITY_SLACK)
            .map((f) => f.key);
        return {
            key: card.key,
            name: card.voice.name,
            placement: card.placement,
            width: card.width,
            claimLines: card.claimLines,
            outcomeLines: card.outcomeLines,
            anchorGap,
            ambiguousWith,
            tethers: card.voice.tethers.map((t) => tetherReach(game, result, card, t))
        };
    });
    const tethers = cards.flatMap((c) => c.tethers);

    return {
        pass: problems.length === 0 && collisions.length === 0,
        problems,
        collisions,
        minCell,
        baseMinCell,
        retained: sum(result) / sum(base),
        meanGap: mean(cards.map((c) => c.anchorGap)),
        maxGap: cards.length ? Math.max(...cards.map((c) => c.anchorGap)) : 0,
        ambiguous: cards.filter((c) => c.ambiguousWith.length > 0).length,
        meanTether: mean(tethers.map((t) => t.meanLength)),
        meanCrossings: mean(tethers.map((t) => t.meanCrossings)),
        headlineConflicts,
        cards
    };
}
