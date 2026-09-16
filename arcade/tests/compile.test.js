/* Compiler tests.

   Nothing reaches the runtime without compiling, including a reference
   Definition written by our best designer. These tests check both directions:
   that every authored fixture passes, and that deliberately broken Drafts are
   refused with a stable diagnostic code a repair round can act on. */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
    compile, compileAndFreeze, freeze, verifyRevision, contentHash, phraseForRepair
} from '../engines/shared-plan/compiler/index.js';
import { definitionJsonSchema, BUDGETS, TEXT_KINDS } from '../engines/shared-plan/definition/index.js';
import { allDrafts, draftNames, referenceNames, revisionFor } from './helpers.js';

const clone = (value) => structuredClone(value);
const codes = (diagnostics) => diagnostics.filter((d) => d.severity === 'error').map((d) => d.code);

test('every reference and hostile fixture compiles', () => {
    for (const name of draftNames) {
        const { ok, diagnostics } = compile(allDrafts[name]);
        const errors = diagnostics.filter((d) => d.severity === 'error');
        assert.ok(ok, `${name} did not compile: ${errors.map((e) => `${e.code} ${e.message}`).join('; ')}`);
    }
});

test('compiling is deterministic and content-addressed', () => {
    for (const name of referenceNames) {
        const a = compileAndFreeze(allDrafts[name]);
        const b = compileAndFreeze(allDrafts[name]);
        assert.equal(a.revision.contentHash, b.revision.contentHash, `${name} hashed differently twice`);
        assert.equal(a.revision.revisionId, b.revision.revisionId);
        assert.ok(verifyRevision(a.revision).ok, `${name} failed its own verification`);
    }
});

test('a revision whose content is altered fails verification', () => {
    const revision = clone(revisionFor('r-a'));
    revision.compiledGame.places[0].name = 'Tampered';
    const check = verifyRevision(revision);
    assert.equal(check.ok, false);
    assert.match(check.problems.join(' '), /hash/i);
});

test('indexes are excluded from the hash, because they are a view of the content', () => {
    const revision = clone(revisionFor('r-a'));
    delete revision.compiledGame.placeIndex.hearth_unused;
    revision.compiledGame.placeIndex = { ...revision.compiledGame.placeIndex };
    assert.ok(verifyRevision(revision).ok);
});

test('the Definition schema exports JSON Schema for structured output', () => {
    const schema = definitionJsonSchema();
    assert.equal(schema.type, 'object');
    assert.ok(schema.required.includes('places'));
    assert.ok(schema.required.includes('beats'));
    assert.equal(schema.additionalProperties, false);

    /* Budgets are single-sourced, so the exported schema and the compiler
       cannot drift apart. */
    assert.equal(schema.properties.pieces.maxItems, BUDGETS.pieces.max);
    assert.equal(schema.properties.places.maxItems, BUDGETS.places.max);
    assert.equal(schema.properties.beats.maxItems, BUDGETS.beats.max);
    assert.equal(schema.properties.places.items.properties.name.maxLength, TEXT_KINDS.placeName.chars);
    assert.equal(schema.properties.pieces.items.properties.name.maxLength, TEXT_KINDS.pieceName.chars);
});

const adversarial = {
    'a reference that points at nothing': (d) => {
        d.rules[0].a = 'nobody';
        return 'resolve.unknownRef';
    },
    'two entries sharing a key': (d) => {
        d.pieces[1].key = d.pieces[0].key;
        return 'resolve.duplicateKey';
    },
    'a guarded final variant': (d) => {
        d.beats[0].variants.at(-1).guard = { kind: 'pieceCut', piece: 'imre' };
        return 'validate.noFallbackVariant';
    },
    'text over its budget': (d) => {
        d.places[0].name = 'An Extremely Long Place Name Indeed';
        return 'budget.chars';
    },
    'a dormant Piece no beat ever introduces': (d) => {
        d.beats[0].variants = d.beats[0].variants.map((v) => ({
            ...v,
            effects: v.effects.filter((e) => e.kind !== 'introducePiece')
        }));
        return 'validate.dormantNeverBorn';
    },
    'a Rule that needs a topology this world does not have': (d) => {
        d.rules.push({ key: 'ordered', kind: 'before', a: 'nadia', b: 'talia', inscription: 'Nadia before Talia' });
        return 'validate.ruleTopology';
    },
    'a Stage Form that disagrees with the topology': (d) => {
        d.presentation.stageForm = 'route';
        return 'validate.formTopology';
    },
    'an accent the kit does not have': (d) => {
        d.presentation.accent = 'graphite';
        return 'validate.kitAccent';
    },
    'a value outside a closed vocabulary': (d) => {
        d.beats[0].variants[0].staging = 'explosion';
        return 'shape.enum';
    },
    'a field the contract does not define': (d) => {
        d.places[0].colour = '#ff0000';
        return 'shape.unknownField';
    },
    'a Piece with nowhere it is allowed to stand': (d) => {
        /* Sofia is both a guest and a child, so confining guests to the porch
           while children must eat indoors leaves her no legal Place. */
        d.rules.push({ key: 'nowhere', kind: 'allowedIn', subject: { kind: 'tag', tag: 'guest' }, places: ['porch-table'], inscription: 'Everyone on the porch' });
        return 'validate.noLegalDestination';
    },
    'Rules that admit no legal plan at all': (d) => {
        d.resources = [{ key: 'noise', label: 'Noise', unit: 'units', scope: 'plan', limit: 0, render: 'loadLine' }];
        for (const piece of d.pieces) piece.resources = [{ resource: 'noise', value: 1 }];
        d.rules.push({ key: 'silence', kind: 'sumLimit', resource: 'noise', inscription: 'No noise at all' });
        return 'validate.noValidCommit';
    },
    'a world with nothing to bring': (d) => {
        d.beats[0].trigger = 'afterRevision';
        return 'validate.noPrimaryBeat';
    },
    'a condition nested beyond the budget': (d) => {
        d.goals[0].condition = {
            kind: 'all',
            terms: [{ kind: 'not', term: { kind: 'all', terms: [{ kind: 'pieceCut', piece: 'imre' }] } }]
        };
        return 'budget.predicateDepth';
    },
    'a claim variant that does not exist': (d) => {
        /* Zsofia has no claimVariants at all, so index 0 already has nothing
           to point at. */
        d.beats[0].variants[1].effects = [{ kind: 'shiftVoice', voice: 'zsofia', claimVariant: 0 }];
        return 'validate.missingClaimVariant';
    },
    'a Definition for a different engine': (d) => {
        d.contract.engineId = 'investigation';
        return 'parse.wrongEngine';
    }
};

test('deliberately broken Drafts are refused with a stable code', () => {
    for (const [description, mutate] of Object.entries(adversarial)) {
        const draft = clone(allDrafts['r-a']);
        const expected = mutate(draft);
        const { ok, diagnostics } = compile(draft);
        assert.equal(ok, false, `${description}: compiled when it should not have`);
        assert.ok(
            codes(diagnostics).includes(expected),
            `${description}: expected ${expected}, got ${codes(diagnostics).join(', ') || '(none)'}`
        );
    }
});

test('a dishonest impossibleWhen is refused', () => {
    const draft = clone(allDrafts['r-a']);
    /* Claim the Goal dies the moment the beat lands, which is untrue: most
       plans can still seat Gregor at the hearth afterwards. */
    draft.goals[1].impossibleWhen = { kind: 'beatFired', beat: 'the-arrival' };
    const { ok, diagnostics } = compile(draft);
    assert.equal(ok, false, 'a world mark that lies was allowed through');
    assert.ok(codes(diagnostics).includes('validate.dishonestImpossibleWhen'));
});

test('an honest impossibleWhen is allowed through', () => {
    const { ok } = compile(allDrafts['r-a']);
    assert.ok(ok);
});

test('graph worlds are refused cleanly while their solver is unbuilt', () => {
    const draft = clone(allDrafts['r-a']);
    draft.world.topology = 'graph';
    draft.world.siteTemplate = 'quadOfFour';
    draft.presentation.stageForm = 'site';
    draft.places.forEach((place, i) => { place.slot = ['q1', 'q2', 'q3'][i]; });
    const { ok, diagnostics } = compile(draft);
    assert.equal(ok, false);
    assert.ok(codes(diagnostics).includes('layout.noSolver'), 'should fail closed, not crash');
});

test('a draft that is not an object is refused rather than throwing', () => {
    for (const bad of [null, undefined, 42, 'a definition', []]) {
        const result = compile(bad);
        assert.equal(result.ok, false);
        assert.ok(result.diagnostics.length > 0);
    }
});

test('diagnostics carry a model-directed message for repair', () => {
    const draft = clone(allDrafts['r-a']);
    draft.rules[0].a = 'nobody';
    const { diagnostics } = compile(draft);
    for (const entry of diagnostics) {
        assert.ok(entry.code, 'every diagnostic has a code');
        assert.ok(entry.message, 'every diagnostic has a human message');
        assert.ok(entry.modelMessage, 'every diagnostic has a model message');
    }
    const phrasing = phraseForRepair(diagnostics);
    assert.match(phrasing, /did not compile/);
    assert.match(phrasing, /nobody/);
});

test('the compiler fills structural defaults without inventing meaning', () => {
    const draft = clone(allDrafts['r-a']);
    delete draft.pieces[0].tags;
    delete draft.pieces[0].status;
    delete draft.resources;
    const { ok, compiledGame } = compile(draft);
    assert.ok(ok);
    assert.deepEqual(compiledGame.pieces[0].tags, []);
    /* Existing from the start is the absence of a choice; dormancy is always
       declared. */
    assert.equal(compiledGame.pieces[0].status, 'active');
    assert.deepEqual(compiledGame.resources, []);
});

test('keys are slugged and text is normalised before measurement', () => {
    const draft = clone(allDrafts['r-a']);
    draft.places[0].key = '  Hearth Table  ';
    draft.rules[2].places[0] = 'Hearth Table';
    draft.goals[1].condition = { kind: 'pieceIn', piece: 'gregor', place: 'Hearth Table' };
    draft.goals[1].impossibleWhen.terms[1].place = 'porch-table';
    draft.voices[0].tethers[1].place = 'Hearth Table';
    draft.voices[0].anchor.place = 'Hearth Table';
    draft.voices[0].outcomes[0].condition.place = 'Hearth Table';
    draft.meta.title = '  The   Long    Table  ';

    const { ok, compiledGame, diagnostics } = compile(draft);
    assert.ok(ok, codes(diagnostics).join(', '));
    assert.equal(compiledGame.places[0].key, 'hearth-table');
    assert.equal(compiledGame.meta.title, 'The Long Table');
});

test('the content hash ignores key order but not content', () => {
    const a = contentHash({ x: 1, y: [2, 3] });
    const b = contentHash({ y: [2, 3], x: 1 });
    const c = contentHash({ x: 1, y: [3, 2] });
    assert.equal(a, b);
    assert.notEqual(a, c);
});

test('freezing records every version the revision depends on', () => {
    const { compiledGame } = compile(allDrafts['r-b']);
    const revision = freeze(compiledGame);
    for (const field of [
        'engineRuntimeVersion', 'definitionSchemaVersion', 'compilerVersion',
        'sessionSchemaVersion', 'generationContractVersion', 'contentHash', 'revisionId'
    ]) {
        assert.ok(revision[field], `a frozen revision must record ${field}`);
    }
    assert.equal(revision.engineId, 'shared-plan');
});
