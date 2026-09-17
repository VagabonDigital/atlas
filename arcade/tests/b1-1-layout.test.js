/* B1.1 — composition v1 and the raised-capacity socket fix.

   The layout is precompiled into every revision, so the Stage only ever reads
   positions. These tests hold the regions, the slots and the socket geometry to
   what the Stage will draw, before there is a Stage to draw them. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { derive, createSession } from '../engines/shared-plan/model/index.js';
import {
    solve, fitReport, collisionReport, STAGE, REGIONS, LAYOUT, OMEN_REGION
} from '../engines/shared-plan/layout/index.js';
import { compileAndFreeze, verifyRevision, COMPILER_VERSION } from '../engines/shared-plan/compiler/index.js';
import { autoplay } from '../harness/autoplay.js';
import { allDrafts, draftNames, referenceNames, revisionFor } from './helpers.js';
import { statesAlong, walkStates } from './walks.js';

const inside = (inner, outer) => inner.x >= outer.x && inner.y >= outer.y
    && inner.x + inner.width <= outer.x + outer.width
    && inner.y + inner.height <= outer.y + outer.height;

test('sockets are solved for the largest capacity any beat can raise a Place to', () => {
    for (const name of draftNames) {
        const game = revisionFor(name).compiledGame;
        for (const place of game.places) {
            const raised = game.beats
                .flatMap((b) => b.variants)
                .flatMap((v) => v.effects)
                .filter((e) => e.kind === 'setCapacity' && e.place === place.key)
                .map((e) => e.sockets);
            assert.equal(place.maxSockets, Math.max(place.sockets, ...raised), `${name}: ${place.key}`);
            assert.equal(game.layout.places[place.key].sockets.length, place.maxSockets);
        }
    }

    const grown = revisionFor('h-7').compiledGame;
    const hall = grown.places.find((p) => p.key === 'hall');
    const porch = grown.places.find((p) => p.key === 'porch');
    assert.equal(hall.sockets, 2, 'the authored capacity is kept');
    assert.equal(hall.maxSockets, 5, 'the after-commit beat raises the hall to five');
    assert.equal(porch.maxSockets, 4, 'the aftershock raises the porch to four');

    /* Shrinking never removes geometry: Pieces left standing past a reduced
       capacity still need somewhere to be drawn. */
    const shrunk = revisionFor('r-c').compiledGame;
    assert.equal(shrunk.places.find((p) => p.key === 'sled').maxSockets, 4);
});

function assertSocketsDrawable(name, game, session) {
    const view = derive(game, session);
    for (const place of view.places) {
        const geometry = game.layout.places[place.key].sockets;
        assert.ok(
            place.sockets <= geometry.length,
            `${name}: ${place.key} has capacity ${place.sockets} but only ${geometry.length} drawable sockets`
        );
    }
    for (const piece of view.pieces) {
        if (piece.location.kind !== 'place') continue;
        const geometry = game.layout.places[piece.location.place].sockets;
        assert.ok(
            geometry[piece.location.socket],
            `${name}: ${piece.key} stands in socket ${piece.location.socket} of ${piece.location.place}, which has no geometry`
        );
    }
    return view;
}

test('every socket a Piece can stand in has geometry, including sockets a beat opens', () => {
    for (const name of draftNames) {
        const revision = revisionFor(name);
        const game = revision.compiledGame;
        for (const session of statesAlong(game, revision, autoplay(revision).session.actionLog)) {
            assertSocketsDrawable(name, game, session);
        }
        for (const seed of [1, 7, 42]) {
            for (const session of walkStates(revision, seed)) assertSocketsDrawable(name, game, session);
        }
    }

    /* The regression itself: H-7 seats guests beyond the hall's authored two. */
    const revision = revisionFor('h-7');
    const game = revision.compiledGame;
    let highest = -1;
    for (const session of statesAlong(game, revision, autoplay(revision).session.actionLog)) {
        for (const piece of assertSocketsDrawable('h-7', game, session).pieces) {
            if (piece.location.kind === 'place' && piece.location.place === 'hall') {
                highest = Math.max(highest, piece.location.socket);
            }
        }
    }
    assert.ok(highest >= 2, `h-7 never used a raised socket (highest hall socket ${highest})`);
});

test('composition v1 has a fixed set of regions, with chrome in three corners', () => {
    assert.deepEqual(Object.keys(REGIONS).sort(), [
        'bandLabels', 'chromeBottomRight', 'chromeTopLeft', 'chromeTopRight',
        'ground', 'gutterEast', 'gutterWest', 'horizon', 'margin', 'threshold'
    ]);
    const { chromeTopLeft: tl, chromeTopRight: tr, chromeBottomRight: br } = REGIONS;
    assert.deepEqual([tl.x, tl.y], [0, 0]);
    assert.deepEqual([tr.x + tr.width, tr.y], [STAGE.width, 0]);
    assert.deepEqual([br.x + br.width, br.y + br.height], [STAGE.width, STAGE.height]);

    for (const name of draftNames) {
        const game = revisionFor(name).compiledGame;
        assert.deepEqual(game.layout.regions, REGIONS, `${name}: regions vary by game`);
        assert.deepEqual(collisionReport(game, game.layout), [], `${name}: collisions`);
        assert.deepEqual(fitReport(game, game.layout), [], `${name}: text does not fit`);
    }
});

test('an Omen takes the slot at the edge its change comes from', () => {
    const expected = {
        'r-a': 'gutterEast', 'r-b': 'horizon', 'r-c': 'horizon',
        'h-1': 'horizon', 'h-2': null, 'h-3': 'gutterWest', 'h-4': null,
        'h-5': 'threshold', 'h-6': 'gutterEast', 'h-7': 'threshold'
    };
    assert.deepEqual(Object.keys(expected).sort(), [...draftNames].sort(), 'every fixture has an expectation');

    for (const name of draftNames) {
        const revision = revisionFor(name);
        const game = revision.compiledGame;
        const { omen } = game.layout;
        const shown = derive(game, createSession(revision)).omen;

        if (expected[name] === null) {
            assert.equal(omen, null, `${name}: an Omen slot was reserved with no Omen to show`);
            assert.equal(shown, null);
            continue;
        }
        assert.equal(omen.region, expected[name], `${name}: Omen in the wrong region`);
        assert.equal(OMEN_REGION[omen.edge], omen.region);
        assert.equal(shown.edge, omen.edge, `${name}: the layout reserved a different Omen from the one shown`);
        assert.ok(inside(omen, REGIONS[omen.region]), `${name}: the Omen leaves its region`);

        if (omen.region === 'horizon' || omen.region === 'threshold') {
            const band = omen.region === 'horizon' ? game.layout.horizon : game.layout.threshold;
            const last = band.at(-1);
            assert.equal(omen.x, last.left + last.width, `${name}: the Omen does not follow the band's last slot`);
            assert.equal(omen.x + omen.width, REGIONS[omen.region].x + REGIONS[omen.region].width);
        }
    }
});

test('bands have a slot for every Goal and every Piece, tiled without gaps or overlaps', () => {
    for (const name of draftNames) {
        const game = revisionFor(name).compiledGame;
        const { layout } = game;
        assert.equal(layout.horizon.length, game.goals.length, `${name}: horizon slots`);
        assert.equal(layout.threshold.length, game.pieces.length, `${name}: threshold slots`);
        assert.equal(layout.margin.length, game.pieces.length, `${name}: margin slots`);

        for (const [slots, region] of [[layout.horizon, REGIONS.horizon], [layout.threshold, REGIONS.threshold], [layout.margin, REGIONS.margin]]) {
            assert.equal(slots[0].left, region.x);
            for (let i = 1; i < slots.length; i += 1) {
                assert.equal(slots[i].left, slots[i - 1].left + slots[i - 1].width, `${name}: slots ${i - 1} and ${i} do not meet`);
            }
            const last = slots.at(-1);
            if (!(game.layout.omen && REGIONS[game.layout.omen.region] === region)) {
                assert.equal(last.left + last.width, region.x + region.width, `${name}: the band is not filled`);
            }
        }
    }
});

test('plan meters stack down the east gutter; place loads sit below the sockets', () => {
    for (const name of draftNames) {
        const game = revisionFor(name).compiledGame;
        const { layout } = game;
        const planResources = game.resources.filter((r) => r.scope === 'plan');
        const placeResources = game.resources.filter((r) => r.scope === 'place');

        assert.deepEqual(layout.planLoads.map((m) => m.resource), planResources.map((r) => r.key), `${name}: plan meters`);
        layout.planLoads.forEach((meter, i) => {
            assert.ok(inside(meter, REGIONS.gutterEast), `${name}: meter ${meter.resource} leaves the gutter`);
            assert.equal(meter.y, REGIONS.gutterEast.y + LAYOUT.gutterInset + i * LAYOUT.planMeterPitch);
        });

        for (const place of game.places) {
            const solved = layout.places[place.key];
            assert.deepEqual(solved.loads.map((l) => l.resource), placeResources.map((r) => r.key), `${name}: ${place.key} loads`);
            const lowestSocket = Math.max(...solved.sockets.map((s) => s.y + s.radius));
            for (const load of solved.loads) {
                assert.ok(load.y > lowestSocket, `${name}: ${place.key} load line crosses its sockets`);
                assert.ok(load.y < solved.frame.y + solved.frame.height, `${name}: ${place.key} load line leaves its frame`);
                assert.ok(load.x1 >= solved.frame.x && load.x2 <= solved.frame.x + solved.frame.width);
            }
        }
    }

    for (const [name, count] of [['r-b', 1], ['r-c', 1], ['h-1', 1]]) {
        assert.equal(revisionFor(name).compiledGame.layout.planLoads.length, count, `${name}: plan meter count`);
    }
    for (const name of ['r-c', 'h-1']) {
        const game = revisionFor(name).compiledGame;
        assert.ok(game.places.every((p) => game.layout.places[p.key].loads.length === 1), `${name}: place loads`);
    }
});

test('a crowded gutter still holds two plan meters and an Omen apart', () => {
    const game = revisionFor('r-b').compiledGame;
    const [weight] = game.resources;
    for (const edge of ['east', 'west']) {
        const crowded = {
            ...game,
            resources: [{ ...weight, key: 'first' }, { ...weight, key: 'second' }],
            beats: game.beats.map((b) => (b.omen ? { ...b, omen: { ...b.omen, edge } } : b))
        };
        const layout = solve(crowded);
        assert.equal(layout.planLoads.length, 2);
        assert.equal(layout.omen.region, OMEN_REGION[edge]);
        assert.deepEqual(collisionReport(crowded, layout), [], `a ${edge} Omen collides in a crowded gutter`);
    }
});

test('headlines are inscribed inside the Ground at a fixed measure', () => {
    const ground = REGIONS.ground;
    for (const name of draftNames) {
        const { layout } = revisionFor(name).compiledGame;
        const boxes = [
            ...Object.entries(layout.places).map(([key, p]) => [key, p.headline]),
            ['threshold', layout.headlines.threshold]
        ];
        for (const [key, box] of boxes) {
            assert.equal(box.width, LAYOUT.headlineWidth);
            assert.equal(box.lines, LAYOUT.headlineLines);
            assert.ok(box.x >= ground.x && box.x + box.width <= ground.x + ground.width, `${name}: ${key} headline leaves the Ground`);
            assert.ok(box.y >= ground.y && box.y < ground.y + ground.height, `${name}: ${key} headline is not in the Ground`);
        }
    }
    assert.equal(LAYOUT.headlineWidth, 675);
});

test('gutter and band-label anchors stay inside their regions', () => {
    for (const name of draftNames) {
        const { layout } = revisionFor(name).compiledGame;
        assert.ok(inside(layout.clock, REGIONS.gutterWest), `${name}: clock`);
        assert.ok(inside(layout.sealStamp, REGIONS.gutterWest), `${name}: seal stamp`);
        assert.ok(inside(layout.bandLabels.threshold, REGIONS.bandLabels), `${name}: threshold label`);
        assert.ok(inside(layout.bandLabels.margin, REGIONS.bandLabels), `${name}: margin label`);
        assert.equal(layout.bandLabels.threshold.y, REGIONS.threshold.y, `${name}: the label does not face its band`);
        assert.equal(layout.bandLabels.margin.y, REGIONS.margin.y);
    }
});

function fitFailures(mutate, name) {
    const draft = structuredClone(allDrafts[name]);
    mutate(draft);
    const result = compileAndFreeze(draft);
    return {
        ok: result.ok,
        loci: result.diagnostics.filter((d) => d.code === 'layout.doesNotFit').map((d) => d.locus)
    };
}

test('text that fits its budget but not its slot is refused at the slot it would render in', () => {
    /* Each string is within its text budget, so only the layout can catch it. */
    const cases = [
        { name: 'r-a', locus: 'world.clockLabel', mutate: (d) => { d.world.clockLabel = 'Extraordinarily'; } },
        { name: 'r-a', locus: 'world.thresholdLabel', mutate: (d) => { d.world.thresholdLabel = 'Disembarkation'; } },
        { name: 'r-a', locus: 'world.marginLabel', mutate: (d) => { d.world.marginLabel = 'Disembarkation'; } },
        {
            name: 'r-a',
            locus: 'beats.the-arrival.omen.text',
            mutate: (d) => { d.beats[0].omen.text = 'Unconscionableness'; }
        },
        {
            name: 'r-b',
            locus: 'resources.weight.label',
            mutate: (d) => { d.resources[0].label = 'Displacement'; }
        }
    ];
    for (const { name, locus, mutate } of cases) {
        const { ok, loci } = fitFailures(mutate, name);
        assert.equal(ok, false, `${name}: ${locus} should not compile`);
        assert.deepEqual(loci, [locus], `${name}: expected exactly one fit failure at ${locus}`);
    }

    /* The same word is fine where the slot is wide: a north Omen gets a Horizon
       slot, not a gutter. */
    const { ok } = fitFailures((d) => {
        d.beats[0].omen = { edge: 'north', text: 'Unconscionableness' };
    }, 'r-a');
    assert.equal(ok, true, 'a long word in a wide slot should compile');
});

test('the collision report catches what the solvers are trusted never to produce', () => {
    const game = revisionFor('r-a').compiledGame;

    const stacked = structuredClone(game.layout);
    const [first, second] = stacked.places['hearth-table'].sockets;
    Object.assign(second, { x: first.x, y: first.y });
    assert.ok(
        collisionReport(game, stacked).some((c) => c.a === 'hearth-table socket 0' && c.b === 'hearth-table socket 1'),
        'stacked sockets went unnoticed'
    );

    const strayClock = structuredClone(game.layout);
    strayClock.clock.x = REGIONS.ground.x + 10;
    assert.ok(collisionReport(game, strayClock).some((c) => c.a === 'clock' && c.b === 'gutterWest'));

    const strayOmen = structuredClone(revisionFor('h-7').compiledGame.layout);
    strayOmen.omen.x -= 40;
    assert.ok(
        collisionReport(revisionFor('h-7').compiledGame, strayOmen).some((c) => c.a.startsWith('threshold slot') && c.b === 'omen'),
        'an Omen pushed over a Threshold slot went unnoticed'
    );
});

test('the frozen reference revisions are current', () => {
    /* Layout geometry is part of the Compiled Game, so any layout change makes the
       frozen files stale. Regenerate them with harness/build-revisions.js. */
    for (const name of referenceNames) {
        const file = new URL(`../definitions/revisions/${name}.json`, import.meta.url);
        const frozen = JSON.parse(readFileSync(file, 'utf8'));
        const check = verifyRevision(frozen);
        assert.ok(check.ok, `${name}: the frozen revision does not verify: ${check.problems.join('; ')}`);
        const fresh = revisionFor(name);
        assert.equal(frozen.compilerVersion, COMPILER_VERSION, `${name}: frozen by a different compiler`);
        assert.equal(frozen.contentHash, fresh.contentHash, `${name}: the frozen revision is stale`);
        assert.equal(frozen.revisionId, fresh.revisionId);
    }
});
