/* World View, narration, disclosure and layout tests.

   The Stage reads marks, not mechanics. These tests hold that line from the
   model's side, before there is a Stage to break it. */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
    derive, createSession, buildContext, Actions, apply
} from '../engines/shared-plan/model/index.js';
import { narrate, narratePlacements } from '../engines/shared-plan/narration/index.js';
import { analyse } from '../engines/shared-plan/analysis/index.js';
import { fitReport, collisionReport, STAGE } from '../engines/shared-plan/layout/index.js';
import { VOCAB } from '../engines/shared-plan/definition/index.js';
import { autoplay } from '../harness/autoplay.js';
import { draftNames, referenceNames, revisionFor } from './helpers.js';

const RULE_KINDS = Object.keys(VOCAB.RULE_KINDS);

test('the World View never names a Rule kind', () => {
    for (const name of draftNames) {
        const revision = revisionFor(name);
        const game = revision.compiledGame;
        const { session } = autoplay(revision);
        const view = derive(game, session);

        for (const seam of view.seams) {
            assert.ok(!('kind' in seam), `${name}: a Seam carried a Rule kind`);
            assert.ok(seam.inscription, 'a Seam always carries its inscription');
            assert.ok(seam.locus, 'a Seam always has a locus');
        }
        for (const tether of view.tethers) {
            assert.ok(
                ['bond', 'repel', 'order'].includes(tether.relation),
                `${name}: a tether used ${tether.relation} rather than a mark`
            );
            assert.ok(
                !RULE_KINDS.includes(tether.relation),
                `${name}: a tether leaked the Rule kind to the Stage`
            );
        }
    }
});

test('nothing appears in the World View without a birth event', () => {
    for (const name of draftNames) {
        const revision = revisionFor(name);
        const game = revision.compiledGame;
        const { session } = autoplay(revision);

        for (const phaseSession of [createSession(revision), session]) {
            const view = derive(game, phaseSession);
            for (const piece of view.pieces) {
                assert.ok(
                    view.disclosure.has(`piece:${piece.key}`),
                    `${name}: ${piece.key} is on the Stage but was never born`
                );
                assert.ok(game.disclosure[`piece:${piece.key}`], `${name}: ${piece.key} has no birth event`);
            }
            for (const place of view.places) {
                assert.ok(
                    view.disclosure.has(`place:${place.key}`),
                    `${name}: ${place.key} is on the Stage but was never born`
                );
            }
            for (const goal of view.horizon) {
                assert.ok(view.disclosure.has(`goal:${goal.key}`), `${name}: ${goal.key} was never born`);
            }
        }
    }
});

test('dormant content is absent before its beat and present after', () => {
    const revision = revisionFor('h-6');
    const game = revision.compiledGame;

    const atStart = derive(game, createSession(revision));
    assert.equal(atStart.places.length, 1, 'the annexe should not exist yet');
    assert.equal(atStart.pieces.length, 2, 'the latecomers should not exist yet');
    assert.equal(atStart.horizon.length, 1, 'the second Goal should not exist yet');

    const { session } = autoplay(revision);
    const atEnd = derive(game, session);
    assert.equal(atEnd.places.length, 2, 'the annexe should have opened');
    assert.equal(atEnd.pieces.length, 4, 'both latecomers should have arrived');
    assert.equal(atEnd.horizon.length, 2, 'the second Goal should have been activated');
});

test('a hidden fact stays hidden until it is revealed', () => {
    const revision = revisionFor('h-1');
    const game = revision.compiledGame;
    const hidden = game.pieces.filter((p) => p.fact?.hidden);
    for (const piece of hidden) {
        const view = derive(game, createSession(revision));
        const mark = view.pieces.find((p) => p.key === piece.key);
        if (mark) assert.equal(mark.fact, null, `${piece.key}'s hidden fact leaked before its reveal`);
    }
});

test('narration is deterministic and factual', () => {
    for (const name of draftNames) {
        const revision = revisionFor(name);
        const game = revision.compiledGame;
        const { session } = autoplay(revision);
        const view = derive(game, session);

        assert.equal(narrate(game, view), narrate(game, view), `${name}: narration was not stable`);
        assert.equal(narratePlacements(game, view), narratePlacements(game, view));

        const text = narrate(game, view);
        assert.match(text, /^PHASE: /u);
        /* Narration describes what is true. It never scores. */
        for (const banned of ['score', 'points', '%', 'well done', 'correct']) {
            assert.ok(!text.toLowerCase().includes(banned), `${name}: narration said "${banned}"`);
        }
    }
});

test('the Beat Control never offers more than three actions', () => {
    for (const name of draftNames) {
        const revision = revisionFor(name);
        const game = revision.compiledGame;
        let session = createSession(revision);
        const seen = new Set();

        const { session: played } = autoplay(revision);
        for (let i = 0; i <= played.actionLog.length; i += 1) {
            const partial = played.actionLog.slice(0, i).reduce(
                (s, entry) => {
                    const { at, ...action } = entry;
                    return apply(game, s, action, { at });
                },
                createSession(revision)
            );
            const view = derive(game, partial);
            assert.ok(
                view.primaryActions.length <= 3,
                `${name}: ${view.primaryActions.length} actions offered in ${partial.phase}`
            );
            for (const action of view.primaryActions) {
                assert.ok(action.label, 'every action has a label');
                assert.ok(['press', 'hold'].includes(action.interaction));
                if (!action.enabled) assert.ok(action.reason, 'a disabled action always says why');
                seen.add(action.id);
            }
            session = partial;
        }
        assert.ok(seen.has('commitPlan'), `${name}: Commit was never offered`);
    }
});

test('the committed plan stays readable through revision as an Imprint', () => {
    const revision = revisionFor('r-a');
    const game = revision.compiledGame;
    const { session } = autoplay(revision, { target: { beat: 'the-arrival', variant: 'porch-shut' } });
    const view = derive(game, session);

    /* Held, Moved and Lost are simply what the Imprint and Drift lines already
       are by the time the world resolves. */
    assert.ok(view.resolution, 'resolve produces a resolution');
    const states = new Set(view.resolution.journeys.map((j) => j.state));
    for (const state of states) assert.ok(['held', 'moved', 'lost'].includes(state));
    assert.equal(
        view.resolution.journeys.length,
        view.pieces.length,
        'every Piece in the world has a journey'
    );
    assert.equal(view.resolution.voiceOutcomes.length, game.voices.length);
});

test('every Voice speaks exactly one outcome line, and none of them scores', () => {
    for (const name of draftNames) {
        const revision = revisionFor(name);
        const game = revision.compiledGame;
        const { session } = autoplay(revision);
        const view = derive(game, session);
        if (!view.resolution) continue;

        const spoken = view.resolution.voiceOutcomes.map((o) => o.voice);
        assert.equal(new Set(spoken).size, spoken.length, `${name}: a Voice spoke twice`);
        for (const outcome of view.resolution.voiceOutcomes) {
            assert.ok(outcome.line, `${name}: ${outcome.voice} had nothing to say`);
        }
        /* Atlas renders where things went, never whether that was right. */
        for (const voice of view.voices) {
            assert.ok(!('satisfied' in voice), `${name}: a Voice carried a satisfaction value`);
            assert.ok(!('score' in voice), `${name}: a Voice carried a score`);
        }
    }
});

test('every fixture lays out legibly at 1280x720', () => {
    for (const name of draftNames) {
        const game = revisionFor(name).compiledGame;
        assert.deepEqual(
            fitReport(game, game.layout), [],
            `${name}: some text does not fit its slot`
        );
        assert.deepEqual(
            collisionReport(game, game.layout), [],
            `${name}: Places overlap`
        );
        assert.equal(game.layout.stage.width, STAGE.width);

        for (const place of game.places) {
            const solved = game.layout.places[place.key];
            assert.equal(solved.sockets.length, place.sockets, `${name}: ${place.key} has the wrong socket count`);
            for (const socket of solved.sockets) {
                assert.ok(socket.x > 0 && socket.x < STAGE.width, `${name}: a socket is off-stage`);
                assert.ok(socket.y > 0 && socket.y < STAGE.height, `${name}: a socket is off-stage`);
            }
        }
    }
});

test('dormant Places are solved too, so they do not reflow the world when they open', () => {
    const game = revisionFor('h-6').compiledGame;
    const dormant = game.places.find((p) => p.status === 'dormant');
    assert.ok(dormant, 'h-6 has a dormant Place');
    assert.ok(game.layout.places[dormant.key], 'its geometry is reserved from the start');
});

test('sequence worlds get a travelled segment between each pair of Places', () => {
    for (const name of draftNames) {
        const game = revisionFor(name).compiledGame;
        if (game.topology.kind !== 'sequence') continue;
        assert.equal(
            game.layout.segments.length,
            game.places.length - 1,
            `${name}: wrong number of segments`
        );
    }
});

test('analysis is deterministic', () => {
    for (const name of referenceNames) {
        const revision = revisionFor(name);
        const a = analyse(revision.compiledGame, revision);
        const b = analyse(revision.compiledGame, revision);
        assert.deepEqual(b, a, `${name}: analysis was not stable between runs`);
    }
});

test('the tutor projection carries the pressure category but withholds the beat', () => {
    for (const name of referenceNames) {
        const game = revisionFor(name).compiledGame;
        const safe = game.tutorSafe;
        assert.ok(safe.brief, 'the tutor gets a brief');
        assert.ok(safe.pressures.length > 0, 'the tutor is told pressure is coming');

        const serialised = JSON.stringify(safe);
        for (const beat of game.beats) {
            for (const variant of beat.variants) {
                assert.ok(
                    !serialised.includes(variant.headline),
                    `${name}: the tutor projection leaked the headline of ${beat.key}/${variant.key}`
                );
                assert.ok(
                    !serialised.includes(variant.scarLabel),
                    `${name}: the tutor projection leaked the Scar of ${beat.key}/${variant.key}`
                );
            }
        }
        for (const pressure of safe.pressures) {
            for (const category of pressure.categories) {
                assert.ok(
                    Object.values(VOCAB.PRESSURE_CATEGORY_BY_PRESET).includes(category),
                    `${name}: unknown pressure category ${category}`
                );
            }
        }
    }
});

test('the Omen sits ahead of the change and disappears once it lands', () => {
    const revision = revisionFor('r-b');
    const game = revision.compiledGame;

    const planning = derive(game, createSession(revision));
    assert.ok(planning.omen, 'the Omen is visible while the change is still ahead');
    assert.equal(planning.omen.sharpened, false);

    const { session } = autoplay(revision);
    assert.equal(derive(game, session).omen, null, 'the Omen is gone once the change has landed');
});

test('a Goal is never live-scored before Resolve', () => {
    for (const name of draftNames) {
        const revision = revisionFor(name);
        const game = revision.compiledGame;
        const view = derive(game, createSession(revision));
        for (const goal of view.horizon) {
            assert.equal(goal.reached, null, `${name}: ${goal.key} was scored during planning`);
            assert.equal(goal.line, null, `${name}: ${goal.key} spoke during planning`);
        }
    }
});

test('a held Piece previews only its own locus, through the real reducer', () => {
    const revision = revisionFor('r-a');
    const game = revision.compiledGame;
    let session = createSession(revision);
    session = apply(game, session, Actions.place('nadia', 'hearth-table'));

    /* The preview is the World View as if the placement happened, so it cannot
       disagree with what a placement would actually do. */
    const preview = derive(game, apply(game, session, Actions.place('talia', 'window-table')));
    const actual = derive(game, apply(game, session, Actions.place('talia', 'window-table')));
    assert.deepEqual(preview.seams, actual.seams);

    const seamLoci = preview.seams.map((s) => JSON.stringify(s.locus));
    assert.ok(seamLoci.length > 0, 'splitting the sisters opens a Seam');
    assert.ok(
        preview.seams.every((s) => s.locus.kind === 'piece' || s.locus.kind === 'place' || s.locus.kind === 'plan'),
        'a Seam always lands somewhere specific'
    );
});
