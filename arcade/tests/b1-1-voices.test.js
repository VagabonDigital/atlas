/* B1.1 closure — where Voices stand.

   Satellite placement is canonical and a Voice anchors to a Place. A dense
   two-row Table falls back to one band between its rows, with a connector from
   every card to its Place and an advisory warning. There is no Voice lane.
   These tests hold that contract before the Stage draws any of it. */

import test from 'node:test';
import assert from 'node:assert/strict';

import { compile, compileAndFreeze } from '../engines/shared-plan/compiler/index.js';
import { definitionJsonSchema } from '../engines/shared-plan/definition/index.js';
import {
    solve, fitReport, collisionReport, voiceReport, LAYOUT, REGIONS
} from '../engines/shared-plan/layout/index.js';
import { allDrafts, draftNames, revisionFor } from './helpers.js';

const inside = (a, b) => a.x >= b.x && a.y >= b.y
    && a.x + a.width <= b.x + b.width && a.y + a.height <= b.y + b.height;
const overlaps = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

function onBoundary(x, y, r) {
    const withinX = x >= r.x && x <= r.x + r.width;
    const withinY = y >= r.y && y <= r.y + r.height;
    return (withinX && (y === r.y || y === r.y + r.height)) || (withinY && (x === r.x || x === r.x + r.width));
}

/* Does a segment pass through a rectangle's interior? */
function crosses({ x1, y1, x2, y2 }, r) {
    let t0 = 0;
    let t1 = 1;
    const dx = x2 - x1;
    const dy = y2 - y1;
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
    return clip(-dx, x1 - r.x) && clip(dx, r.x + r.width - x1)
        && clip(-dy, y1 - r.y) && clip(dy, r.y + r.height - y1) && t0 < t1;
}

const WITH_VOICES = ['r-a', 'r-b', 'r-c', 'h-1', 'h-2', 'h-3'];
const BAND = ['h-1', 'h-3'];

test('a Voice anchors to a Place, while its tethers can still reach a Piece', () => {
    const draft = structuredClone(allDrafts['r-a']);
    draft.voices[0].anchor = { kind: 'piece', piece: 'gregor' };
    const { ok, diagnostics } = compile(draft);
    assert.equal(ok, false, 'a Voice anchored to a Piece must be refused');
    const errors = diagnostics.filter((d) => d.severity === 'error');
    assert.deepEqual(errors.map((d) => [d.code, d.locus]), [['shape.union', 'voices[0].anchor.kind']]);

    const voice = definitionJsonSchema().properties.voices.items.properties;
    assert.deepEqual(voice.anchor.oneOf.map((v) => v.properties.kind.const), ['place']);
    assert.deepEqual(voice.tethers.items.oneOf.map((v) => v.properties.kind.const).sort(), ['piece', 'place']);

    /* Marta stands at the Hearth Table and still cares about Gregor, a Piece. */
    const marta = revisionFor('r-a').compiledGame.voiceIndex.marta;
    assert.deepEqual(marta.anchor, { kind: 'place', place: 'hearth-table' });
    assert.ok(marta.tethers.some((t) => t.kind === 'piece' && t.piece === 'gregor'));
});

test('satellite is the placement wherever it keeps every socket row, and there is no lane', () => {
    const expected = {
        'r-a': 'satellite', 'r-b': 'satellite', 'r-c': 'satellite', 'h-2': 'satellite',
        'h-1': 'betweenRows', 'h-3': 'betweenRows',
        'h-4': 'none', 'h-5': 'none', 'h-6': 'none', 'h-7': 'none'
    };
    assert.deepEqual(Object.keys(expected).sort(), [...draftNames].sort(), 'every fixture has an expectation');

    for (const name of draftNames) {
        const game = revisionFor(name).compiledGame;
        const { voices, places } = game.layout;
        assert.equal(voices.placement, expected[name], `${name}: wrong placement`);
        assert.deepEqual(Object.keys(voices.cards), game.voices.map((v) => v.key), `${name}: every Voice needs exactly one card`);
        for (const card of Object.values(voices.cards)) {
            assert.ok(['inside', 'above', 'band'].includes(card.position), `${name}: unknown position ${card.position}`);
        }
        assert.equal(voices.band === null, voices.placement !== 'betweenRows', `${name}: a band exists only as the fallback`);
        assert.deepEqual(voices.crowded, [], `${name}: a socket row is under the minimum`);
        for (const place of game.places) {
            assert.ok(places[place.key].socketRow >= LAYOUT.minSocketRow, `${name}: ${place.key} rows are ${places[place.key].socketRow}px`);
        }
    }
});

test('a satellite Voice stands with its own Place', () => {
    for (const name of WITH_VOICES) {
        const game = revisionFor(name).compiledGame;
        const { layout } = game;
        if (layout.voices.placement !== 'satellite') continue;

        for (const voice of game.voices) {
            const card = layout.voices.cards[voice.key];
            const host = layout.places[voice.anchor.place];
            const where = `${name}: ${voice.key}`;
            assert.equal(card.host, voice.anchor.place, `${where} stands somewhere other than its anchor`);
            assert.equal(card.connector, null, `${where} is a satellite and needs no connector`);
            assert.ok(card.x >= host.frame.x && card.x + card.width <= host.frame.x + host.frame.width, `${where} strays from its Place`);

            if (card.position === 'inside') {
                assert.ok(inside(card, host.frame), `${where} spills out of its Place`);
                assert.ok(card.y >= host.frame.y + LAYOUT.nameBand, `${where} covers the Place name`);
                for (const socket of host.sockets) {
                    assert.ok(socket.y - socket.radius >= card.y + card.height, `${where} covers socket ${socket.index}`);
                }
                assert.ok(inside(card, host.voiceStrip), `${where} is outside its Place's Voice strip`);
            } else {
                assert.equal(card.position, 'above', `${where} is neither inside nor above its Place`);
                assert.equal(game.topology.kind, 'sequence', `${where} stands above a frame outside a Route`);
                assert.ok(card.y + card.height <= host.frame.y, `${where} is not above its Place`);
                assert.ok(inside(card, REGIONS.ground), `${where} leaves the Ground`);
            }
        }
    }
});

test('a Route lowers its frames to seat Voices above them and gives up no sockets', () => {
    const seated = revisionFor('r-b').compiledGame.layout;
    const draft = structuredClone(allDrafts['r-b']);
    draft.voices = [];
    const bare = compileAndFreeze(draft).compiledGame.layout;

    const shift = seated.places.quay.frame.y - bare.places.quay.frame.y;
    assert.ok(shift > 0, 'the frames should have been lowered');
    for (const [key, place] of Object.entries(bare.places)) {
        const moved = seated.places[key];
        assert.deepEqual(
            { ...moved.frame, y: moved.frame.y - shift }, place.frame,
            `${key} changed size or column, not just height on the Ground`
        );
        assert.equal(moved.socketRow, place.socketRow, `${key} gave up socket room`);
        assert.deepEqual(moved.sockets.map((s) => ({ ...s, y: s.y - shift })), place.sockets);
    }
    seated.segments.forEach((segment, i) => {
        const before = bare.segments[i].path;
        assert.deepEqual(segment.path, { ...before, y1: before.y1 + shift, y2: before.y2 + shift });
    });
});

test('a dense two-row Table falls back to one band between its rows, with a connector per Voice', () => {
    for (const name of BAND) {
        const game = revisionFor(name).compiledGame;
        const { layout } = game;
        const { band, cards, fallback } = layout.voices;

        /* In the world, not a sidebar: the band spans the Ground between the rows. */
        assert.ok(inside(band, REGIONS.ground), `${name}: the band leaves the Ground`);
        assert.equal(band.x, REGIONS.ground.x);
        assert.equal(band.width, REGIONS.ground.width);
        const perRow = Math.ceil(game.places.length / 2);
        game.places.forEach((place, i) => {
            const frame = layout.places[place.key].frame;
            if (i < perRow) assert.ok(frame.y + frame.height <= band.y, `${name}: ${place.key} reaches into the band`);
            else assert.ok(frame.y >= band.y + band.height, `${name}: ${place.key} reaches into the band`);
        });

        assert.ok(fallback.squeezed.length > 0, `${name}: the fallback must say what satellite would have squeezed`);
        for (const { place, socketRow } of fallback.squeezed) {
            assert.ok(socketRow < LAYOUT.minSocketRow, `${name}: ${place} was not actually squeezed`);
        }

        for (const voice of game.voices) {
            const card = cards[voice.key];
            const frame = layout.places[voice.anchor.place].frame;
            const where = `${name}: ${voice.key}`;
            assert.equal(card.position, 'band');
            assert.ok(inside(card, band), `${where} is outside the band`);

            const c = card.connector;
            assert.ok(c, `${where} has no connector to its Place`);
            assert.ok(onBoundary(c.x1, c.y1, card), `${where}'s connector does not start on its card`);
            assert.ok(onBoundary(c.x2, c.y2, frame), `${where}'s connector does not end on its own Place`);
            for (const other of game.voices.filter((v) => v.key !== voice.key)) {
                assert.ok(!crosses(c, cards[other.key]), `${where}'s connector crosses ${other.key}`);
            }
            for (const place of game.places.filter((p) => p.key !== voice.anchor.place)) {
                assert.ok(!crosses(c, layout.places[place.key].frame), `${where}'s connector crosses ${place.key}`);
            }
        }
    }
});

test('the fallback is reported as one stable, advisory warning', () => {
    for (const name of WITH_VOICES) {
        const { ok, diagnostics } = compile(allDrafts[name]);
        assert.ok(ok, `${name}: Voice placement must never stop a world compiling`);
        const notes = diagnostics.filter((d) => d.code.startsWith('layout.voice'));
        if (BAND.includes(name)) {
            assert.deepEqual(
                notes.map((d) => [d.code, d.severity, d.locus]),
                [['layout.voiceBandFallback', 'warning', 'voices']],
                `${name}: expected exactly the fallback warning`
            );
        } else {
            assert.deepEqual(notes, [], `${name}: a satellite world has nothing to report`);
        }
    }
});

test('a world whose Voices leave its Pieces no room, with no fallback, is refused', () => {
    /* A one-row Table has no rows to put a band between. With all three of R-A's
       Voices at the Hearth Table and two of them carrying longer outcome lines,
       all within budget, its socket rows drop under the minimum. Nothing collides,
       so only this rule stands between the author and an unusable Stage. */
    const draft = structuredClone(allDrafts['r-a']);
    const longer = [
        'Gregor stayed exactly where you seated him, and nobody asked whether he was comfortable.',
        'Sofia spent the evening watching the window, and I spent it watching Sofia instead.'
    ];
    draft.voices.forEach((voice, i) => {
        voice.anchor = { kind: 'place', place: 'hearth-table' };
        if (i < longer.length) voice.fallbackOutcome = longer[i];
    });

    const { ok, diagnostics } = compile(draft);
    assert.equal(ok, false, 'a Stage whose Pieces do not fit must not compile');
    assert.deepEqual(
        diagnostics.filter((d) => d.severity === 'error').map((d) => [d.code, d.locus]),
        [['layout.voicesDoNotFit', 'voices']],
        'the refusal must come from Voice placement alone'
    );
    const refusal = diagnostics.find((d) => d.code === 'layout.voicesDoNotFit');
    assert.match(refusal.message, /hearth-table \(43px\)/u);
    assert.match(refusal.message, /no fallback/u);
});

test('a band that is itself too tight is no fallback, so the world is refused', () => {
    /* H-1 with both resources measured per Place and one Voice given a longer
       outcome line: satellite placement squeezes its hosts, and the band between
       the rows is too tall to leave either row enough room. */
    const game = revisionFor('h-1').compiledGame;
    const tight = {
        ...game,
        resources: game.resources.map((resource) => ({ ...resource, scope: 'place' })),
        voices: game.voices.map((voice, i) => (i === 0
            ? { ...voice, fallbackOutcome: 'Iron went over the side first, then the rest followed it down, one by one, into the water.' }
            : voice))
    };
    const layout = solve(tight);
    assert.equal(layout.voices.placement, 'betweenRows');
    assert.ok(layout.voices.fallback, 'the band was tried');
    assert.ok(layout.voices.crowded.length > 0, 'and it was too tight');
    assert.deepEqual(
        voiceReport(tight, layout).map((n) => [n.code, n.severity, n.locus]),
        [['layout.voicesDoNotFit', 'error', 'voices']],
        'a failed fallback is refused, and never reported as a working one'
    );
});

test('a change headline never covers a Voice', () => {
    for (const name of draftNames) {
        const { layout } = revisionFor(name).compiledGame;
        const cards = Object.entries(layout.voices.cards);
        for (const [key, place] of Object.entries(layout.places)) {
            for (const [voice, card] of cards) {
                assert.ok(!overlaps(place.headline, card), `${name}: the ${key} headline covers ${voice}`);
            }
            if (place.voiceStrip?.position === 'inside') {
                assert.ok(
                    place.headline.y >= place.voiceStrip.y + place.voiceStrip.height,
                    `${name}: ${key}'s headline is not anchored below its Voice strip`
                );
            }
            assert.ok(inside(place.headline, REGIONS.ground), `${name}: the ${key} headline leaves the Ground`);
        }
    }

    /* Rain takes the porch, where Dezso stands: the headline goes under him. */
    const game = revisionFor('r-a').compiledGame;
    const porch = game.layout.places['porch-table'];
    const dezso = game.layout.voices.cards.dezso;
    assert.ok(porch.headline.y >= dezso.y + dezso.height);

    const covering = structuredClone(game.layout);
    covering.places['porch-table'].headline.y = porch.frame.y + LAYOUT.nameBand;
    assert.ok(
        collisionReport(game, covering).some((c) => c.a === 'porch-table headline' && c.b === 'dezso card'),
        'a headline over a Voice went unnoticed'
    );
});

test('a Voice is measured on the card it stands on', () => {
    const game = revisionFor('r-a').compiledGame;
    assert.deepEqual(fitReport(game, game.layout), []);

    const narrow = structuredClone(game.layout);
    narrow.voices.cards.marta.claim.maxWidth = 80;
    narrow.voices.cards.marta.name.maxWidth = 20;
    const loci = fitReport(game, narrow).map((p) => p.locus);
    for (const locus of ['voices.marta.name', 'voices.marta.claim', 'voices.marta.claimVariants[0]']) {
        assert.ok(loci.includes(locus), `${locus} was not measured against its card`);
    }
});
