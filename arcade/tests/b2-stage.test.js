/* B2 — the Stage's mark layer and its Table form.

   The Stage reads the World View and the compiled layout and produces marks.
   These tests hold the line the Stage must not cross: it draws what the model
   decided, it never re-decides anything, it shows nothing that was not
   disclosed, and it refuses a frame it cannot draw rather than drawing a wrong
   one. They run in Node, because everything up to rendering is pure. */

import test from 'node:test';
import assert from 'node:assert/strict';

import { compileAndFreeze } from '../engines/shared-plan/compiler/index.js';
import {
    createSession, derive, replay, Actions, firstValidCommit, apply
} from '../engines/shared-plan/model/index.js';
import { STAGE, REGIONS, LAYOUT, socketColumns } from '../engines/shared-plan/layout/index.js';
import { buildMarks, MARK_TYPES, LAYERS, StageNotBuiltError } from '../engines/shared-plan/stage/marks/build.js';
import { formAdapter, hasForm, StageFormUnavailable } from '../engines/shared-plan/stage/forms/adapter.js';
import { VOCAB } from '../engines/shared-plan/definition/index.js';
import { allDrafts, draftNames, revisionFor } from './helpers.js';
import { scramble, mapMarkId } from './rename.js';

const RULE_KINDS = Object.keys(VOCAB.RULE_KINDS);
const GROUND_ROLES = new Set(['field', 'texture', 'passage', 'rest', 'support', 'surface', 'setting']);

/* Every fixture whose form has a Stage and whose Plan frame the mark layer can
   already draw. R-B, R-C and H-4 wait for their forms; H-1 waits for load lines.
   Both refusals are tested below rather than quietly skipped. */
const TABLE_FIXTURES = ['r-a', 'h-2', 'h-3', 'h-5', 'h-6', 'h-7'];

function marksFor(name, { log = [] } = {}) {
    const revision = revisionFor(name);
    const game = revision.compiledGame;
    const session = replay(game, revision, log);
    const view = derive(game, session);
    return { game, view, markSet: buildMarks(game, view, formAdapter(game.presentation.stageForm)) };
}

function seatedLog(game, revision) {
    const placements = firstValidCommit(game, revision);
    return game.pieces
        .filter((piece) => placements[piece.key]?.kind === 'place')
        .map((piece) => Actions.place(piece.key, placements[piece.key].place));
}

const boxes = (mark) => [mark.geometry.box, mark.geometry.frame, mark.geometry.band].filter(Boolean);

function inStage(box) {
    return box.x >= 0 && box.y >= 0 && box.x + box.width <= STAGE.width && box.y + box.height <= STAGE.height;
}

test('the Plan frame of a Table world carries a mark for everything the World View shows', () => {
    const { view, markSet } = marksFor('r-a');
    const ids = [...markSet.marks.keys()];
    const byType = (type) => [...markSet.marks.values()].filter((m) => m.type === type);

    assert.equal(markSet.phase, 'plan');
    assert.equal(markSet.beatCount, 0);

    assert.deepEqual(byType('place').map((m) => m.id), view.places.map((p) => `place:${p.key}`));
    assert.deepEqual(byType('piece').map((m) => m.id), view.pieces.map((p) => `piece:${p.key}`));
    assert.deepEqual(byType('voice').map((m) => m.id), view.voices.map((v) => `voice:${v.key}`));
    assert.deepEqual(byType('goal').map((m) => m.id), view.horizon.map((g) => `goal:${g.key}`));
    assert.equal(byType('omen').length, 1, 'R-A has an Omen at its east edge');
    assert.deepEqual(byType('threshold').map((m) => m.id), ['threshold']);
    assert.deepEqual(byType('margin').map((m) => m.id), ['margin']);

    /* One socket for every seat that exists now, and none for capacity a beat
       could open later. */
    assert.equal(
        byType('socket').length,
        view.places.reduce((total, place) => total + place.sockets, 0)
    );

    /* Everything a tutor can say out loud is in the frame. */
    for (const place of view.places) {
        assert.equal(markSet.marks.get(`place:${place.key}`).text.name.value, place.name);
    }
    for (const piece of view.pieces) {
        assert.equal(markSet.marks.get(`piece:${piece.key}`).text.name.value, piece.name);
    }
    for (const voice of view.voices) {
        assert.equal(markSet.marks.get(`voice:${voice.key}`).text.claim.value, voice.claim);
    }
    assert.equal(markSet.marks.get('threshold').text.label.value, view.world.thresholdLabel);
    assert.equal(markSet.marks.get('margin').text.label.value, view.world.marginLabel);

    assert.equal(new Set(ids).size, ids.length, 'mark ids must be unique');
});

test('every fixture the Stage can draw is drawn, and the rest refuse for a stated reason', () => {
    const drawable = draftNames.filter((name) => {
        if (!hasForm(allDrafts[name].presentation.stageForm)) return false;
        try {
            marksFor(name);
            return true;
        } catch (error) {
            assert.ok(error instanceof StageNotBuiltError, `${name} failed for an unexpected reason: ${error.message}`);
            return false;
        }
    });
    assert.deepEqual(drawable, TABLE_FIXTURES, 'the list of worlds the Stage can draw has moved');
});

test('every mark belongs to the vocabulary, sits in a layer and stays on the Stage', () => {
    for (const name of TABLE_FIXTURES) {
        for (const mark of marksFor(name).markSet.marks.values()) {
            const where = `${name}: ${mark.id}`;
            assert.ok(MARK_TYPES.includes(mark.type), `${where} has an unknown type ${mark.type}`);
            assert.ok(LAYERS.includes(mark.layer), `${where} has an unknown layer ${mark.layer}`);
            for (const box of boxes(mark)) assert.ok(inStage(box), `${where} leaves the Stage`);
            for (const entry of Object.values(mark.text)) {
                if (!entry?.box) continue;
                assert.ok(inStage(entry.box), `${where} sets text off the Stage`);
                assert.ok(entry.value.length > 0, `${where} has an empty text box`);
            }
            assert.ok(mark.label.length > 0, `${where} has no spoken label`);
        }
    }
});

test('the Stage reads marks, not mechanics', () => {
    for (const name of TABLE_FIXTURES) {
        const { markSet } = marksFor(name);
        const values = [];
        JSON.stringify([...markSet.marks.values()], (key, value) => {
            if (typeof value === 'string') values.push(value);
            return value;
        });
        for (const kind of RULE_KINDS) {
            assert.ok(!values.includes(kind), `${name}: a mark carried the Rule kind "${kind}"`);
        }
    }
});

test('nothing reaches the Stage that the World View has not disclosed', () => {
    const { view, markSet } = marksFor('h-6');
    assert.equal(view.places.length, 1, 'h-6 opens with one Place');
    assert.equal(view.pieces.length, 2);
    assert.deepEqual(
        [...markSet.marks.values()].filter((m) => m.type === 'place').map((m) => m.id),
        ['place:front']
    );
    for (const dormant of ['third', 'fourth']) {
        assert.equal(markSet.marks.has(`piece:${dormant}`), false, `${dormant} is not born yet`);
    }
    assert.equal(markSet.marks.has('place:annexe'), false, 'a dormant Place has no mark');
});

test('a Piece is drawn where the model put it, and its name fits what the compiler measured', () => {
    const revision = revisionFor('r-a');
    const game = revision.compiledGame;
    const log = seatedLog(game, revision);
    const { view, markSet } = marksFor('r-a', { log });

    let seated = 0;
    for (const piece of view.pieces) {
        const mark = markSet.marks.get(`piece:${piece.key}`);
        const centre = { x: mark.geometry.box.x + mark.geometry.box.width / 2, y: mark.geometry.box.y + mark.geometry.box.height / 2 };
        if (piece.location.kind === 'place') {
            seated += 1;
            const socket = game.layout.places[piece.location.place].sockets[piece.location.socket];
            assert.ok(Math.abs(centre.x - socket.x) <= 1 && Math.abs(centre.y - socket.y) <= 1, `${piece.key} is not on its socket`);
            assert.deepEqual(mark.geometry.at, piece.location);
        } else {
            const slots = piece.location.kind === 'margin' ? game.layout.margin : game.layout.threshold;
            const slot = slots[game.pieces.findIndex((p) => p.key === piece.key)];
            assert.ok(Math.abs(centre.x - slot.x) <= 1, `${piece.key} is not in its own slot`);
        }
    }
    assert.ok(seated > 0, 'the seated frame should seat somebody');

    /* The compiler guarantees a Piece name fits the narrowest slot it measured;
       the chip may never be narrower than that. */
    const narrowestCell = Math.min(...game.places.map((p) => {
        const solved = game.layout.places[p.key];
        return solved.frame.width / socketColumns(solved.sockets.length);
    }));
    const measured = Math.min(...game.layout.threshold.map((s) => s.maxWidth), narrowestCell - 8);
    for (const piece of view.pieces) {
        const nameBox = markSet.marks.get(`piece:${piece.key}`).text.name.box;
        assert.ok(nameBox.width <= measured + 0.5, `${piece.key}: the chip is wider than the slot the compiler measured`);
        assert.ok(nameBox.width >= Math.min(measured, 152) - 0.5, `${piece.key}: the chip is narrower than the name was measured against`);
    }
});

test('a frame the Stage cannot draw yet is refused, never drawn incompletely', () => {
    /* Load lines are Plan content the mark layer has not built. */
    assert.throws(() => marksFor('h-1'), (error) => {
        assert.ok(error instanceof StageNotBuiltError);
        assert.match(error.message, /load lines/u);
        return true;
    });

    /* So is any phase past Plan. */
    const revision = revisionFor('r-a');
    const game = revision.compiledGame;
    let session = replay(game, revision, seatedLog(game, revision));
    session = apply(game, session, Actions.commitPlan());
    assert.throws(
        () => buildMarks(game, derive(game, session), formAdapter(game.presentation.stageForm)),
        /commit phase/u
    );
});

test('a world whose form has no Stage refuses to mount, and says when it will', () => {
    for (const [name, expected] of [['r-b', /Route/u], ['r-c', /Vessel/u]]) {
        const form = allDrafts[name].presentation.stageForm;
        assert.equal(hasForm(form), false, `${name} should have no Stage yet`);
        assert.throws(() => formAdapter(form), (error) => {
            assert.ok(error instanceof StageFormUnavailable);
            assert.match(error.message, expected);
            return true;
        });
    }
});

test('the form paints the space, and only the space', () => {
    const game = revisionFor('r-a').compiledGame;
    const adapter = formAdapter(game.presentation.stageForm);

    const ground = adapter.paintGround(game.layout);
    assert.ok(ground.length > 0);
    for (const shape of ground) {
        assert.ok(GROUND_ROLES.has(shape.role), `a ground shape used the unknown role ${shape.role}`);
        assert.ok(!('text' in shape), 'a form may not draw text');
    }

    for (const place of game.places) {
        const solved = game.layout.places[place.key];
        const [surface] = adapter.placeSurface(solved);
        assert.equal(surface.role, 'surface');
        assert.ok(
            surface.x >= solved.frame.x && surface.x + surface.width <= solved.frame.x + solved.frame.width,
            `${place.key}: its surface is wider than its frame`
        );
        assert.ok(surface.y >= solved.frame.y + LAYOUT.nameBand, `${place.key}: its surface covers its name`);
        if (solved.voiceStrip?.position === 'inside') {
            assert.ok(
                surface.y >= solved.voiceStrip.y + solved.voiceStrip.height,
                `${place.key}: its surface covers the Voice standing there`
            );
        }
        for (const socket of solved.sockets) {
            const [setting] = adapter.socketSetting(socket, solved);
            assert.equal(setting.role, 'setting');
            assert.equal(setting.cx, socket.x);
            assert.equal(setting.cy, socket.y);
        }
    }
});

test('the rename test at mark level: a scrambled world draws the same frame', () => {
    const original = compileAndFreeze(allDrafts['r-a']);
    const { scrambled, keyMap } = scramble(allDrafts['r-a']);
    const renamed = compileAndFreeze(scrambled);
    assert.ok(renamed.ok, 'the scrambled Definition did not compile');

    const build = (result) => {
        const game = result.compiledGame;
        return buildMarks(game, derive(game, createSession(result.revision)), formAdapter(game.presentation.stageForm));
    };
    const before = build(original);
    const after = build(renamed);

    assert.equal(after.marks.size, before.marks.size);
    for (const mark of before.marks.values()) {
        const mapped = after.marks.get(mapMarkId(mark.id, keyMap));
        assert.ok(mapped, `${mark.id} has no counterpart in the renamed world`);
        assert.equal(mapped.type, mark.type);
        assert.equal(mapped.layer, mark.layer);
        assert.deepEqual(mapped.geometry, mark.geometry, `${mark.id}: renaming moved it`);
        assert.deepEqual(mapped.state, mark.state, `${mark.id}: renaming changed its state`);
        for (const [slot, entry] of Object.entries(mark.text)) {
            if (!entry?.box) continue;
            assert.deepEqual(mapped.text[slot].box, entry.box, `${mark.id}: renaming moved its ${slot}`);
        }
    }
});

test('the Horizon, the Threshold and the Margin sit in their own regions', () => {
    const { markSet } = marksFor('r-a');
    for (const mark of markSet.marks.values()) {
        if (mark.type === 'goal') {
            assert.ok(mark.geometry.box.y >= REGIONS.horizon.y, 'a Goal left the Horizon');
            assert.ok(mark.geometry.box.y + mark.geometry.box.height <= REGIONS.horizon.y + REGIONS.horizon.height);
        }
        if (mark.type === 'threshold') assert.deepEqual(mark.geometry.band, REGIONS.threshold);
        if (mark.type === 'margin') assert.deepEqual(mark.geometry.band, REGIONS.margin);
    }
});
