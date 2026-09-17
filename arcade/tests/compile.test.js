/* Compiler tests.

   Nothing reaches the runtime without compiling, including a reference
   Definition written by our best designer. These tests check both directions:
   that every authored fixture passes, and that deliberately broken Drafts are
   refused with a stable diagnostic code a repair round can act on. */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
    compile, compileAndFreeze, freeze, verifyRevision, contentHash, phraseForRepair,
    ENGINE_IDENTITY, runtimeSeries
} from '../engines/shared-plan/compiler/index.js';
import { definitionJsonSchema, BUDGETS, TEXT_KINDS } from '../engines/shared-plan/definition/index.js';
import { SESSION_SCHEMA_VERSION } from '../engines/shared-plan/model/index.js';
import { allDrafts, draftNames, referenceNames, revisionFor } from './helpers.js';

const clone = (value) => structuredClone(value);
const codes = (diagnostics) => diagnostics.filter((d) => d.severity === 'error').map((d) => d.code);

/* Recomputes a revision's content hash the way the compiler does, so a test can
   alter a recorded version and still hand verification an internally consistent
   revision. Otherwise every such test would pass for the wrong reason. */
function rehash(revision) {
    const { placeIndex, pieceIndex, resourceIndex, ruleIndex, goalIndex, voiceIndex, beatIndex, ...rest } =
        revision.compiledGame;
    return contentHash({
        compiledGame: { ...rest, beats: rest.beats.map(({ variantIndex, ...b }) => b) },
        engineRuntimeVersion: revision.engineRuntimeVersion,
        definitionSchemaVersion: revision.definitionSchemaVersion,
        compilerVersion: revision.compilerVersion,
        generationContractVersion: revision.generationContractVersion
    });
}

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

test('an honest impossibleWhen is allowed through, with nothing left unverified', () => {
    for (const name of ['r-a', 'r-b']) {
        const { ok, diagnostics } = compile(allDrafts[name]);
        assert.ok(ok, `${name} should compile`);
        /* If honesty could only be checked over part of the space, the compiler
           has to say so rather than pass quietly. These references are small
           enough to verify completely, so neither should appear. */
        assert.ok(
            !diagnostics.some((d) => d.code === 'validate.impossibleWhenUnverified'),
            `${name}: honesty should be fully verifiable`
        );
    }
});

/* H-3 sits at every structural budget and has roughly 840,000 legal plans, far
   past anything that can be walked exhaustively. Adding a Goal with an
   impossibleWhen to it produces the case where honesty genuinely cannot be
   settled by search. */
function unsearchableWorldWith(impossibleWhen) {
    const draft = clone(allDrafts['h-3']);
    draft.goals.push({
        key: 'transformer-sited',
        label: 'The transformer is sited',
        condition: { kind: 'pieceIn', piece: 'transformer', place: 'substation' },
        impossibleWhen,
        reachedLine: 'The transformer went into the substation yard.',
        missedLine: 'The transformer ended up somewhere else entirely.'
    });
    return draft;
}

test('a dishonest impossibleWhen still blocks when the search is incomplete', () => {
    /* Claims the Goal dies the instant the beat lands, which is untrue: the
       condemnation closes only the Northwest Wing, and the substation yard is
       still open. A witness is a verified counterexample, so how much of the
       rest of the space went unsearched cannot weaken it. */
    const draft = unsearchableWorldWith({ kind: 'beatFired', beat: 'condemnation' });

    const { ok, diagnostics } = compile(draft);
    const errors = diagnostics.filter((d) => d.severity === 'error').map((d) => d.code);
    assert.equal(ok, false, 'a world mark that lies must be refused');
    assert.ok(
        errors.includes('validate.dishonestImpossibleWhen'),
        `a witness must block, not warn; got ${errors.join(', ') || '(none)'}`
    );
});

test('honesty that could not be fully checked is reported, not assumed', () => {
    /* Honest: a transformer stranded in the condemned wing can never reach the
       substation yard. But the space is too large to prove it. */
    const draft = unsearchableWorldWith({
        kind: 'all',
        terms: [
            { kind: 'beatFired', beat: 'condemnation' },
            { kind: 'pieceIn', piece: 'transformer', place: 'northwest' }
        ]
    });

    const { ok, diagnostics } = compile(draft);
    assert.ok(ok, 'an unverified mark is a warning, not a refusal');
    assert.ok(
        !diagnostics.some((d) => d.code === 'validate.dishonestImpossibleWhen'),
        'an honest mark must not be reported as a lie'
    );
    assert.ok(
        diagnostics.some((d) => d.code === 'validate.impossibleWhenUnverified' && d.severity === 'warning'),
        'an incomplete honesty search must say it was incomplete'
    );
});

test('a pin-guarded variant is honesty-checked too', () => {
    /* R-B's engine-held variant only fires when the pump is pinned. Checking
       only the unpinned selection would leave it entirely unverified, so a lie
       stated about it must still be caught. */
    const draft = clone(allDrafts['r-b']);
    draft.goals[1].impossibleWhen = {
        kind: 'beatFired', beat: 'the-sever', variant: 'engine-held'
    };

    const { ok, diagnostics } = compile(draft);
    const errors = diagnostics.filter((d) => d.severity === 'error').map((d) => d.code);
    assert.equal(ok, false, 'a lie about a pin-guarded variant must be caught');
    assert.ok(errors.includes('validate.dishonestImpossibleWhen'), errors.join(', ') || '(none)');
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

/* The field list declared by `GameRevision` in arcade/contracts. A frozen
   revision must carry exactly these, so Core can consume any engine's revisions
   through one shared shape. */
const GAME_REVISION_FIELDS = [
    'revisionId', 'engineId', 'contentHash', 'engineRuntimeVersion',
    'definitionSchemaVersion', 'compilerVersion', 'generationContractVersion',
    'compiledGame', 'provenance'
];

test('a frozen revision matches the GameRevision contract exactly', () => {
    const { compiledGame } = compile(allDrafts['r-b']);
    const revision = freeze(compiledGame);

    for (const field of GAME_REVISION_FIELDS) {
        assert.ok(field in revision, `a frozen revision must record ${field}`);
    }
    assert.deepEqual(
        Object.keys(revision).sort(),
        [...GAME_REVISION_FIELDS].sort(),
        'a frozen revision must not invent fields the shared contract does not declare'
    );
    assert.equal(revision.engineId, 'shared-plan');
});

test('the session schema version belongs to the engine, not to a revision', () => {
    const { compiledGame } = compile(allDrafts['r-b']);
    const revision = freeze(compiledGame);

    /* A revision is compiled content and contains no session, so which session
       format an engine speaks is not a property of it. It is recorded as
       provenance and declared through EngineIdentity. */
    assert.ok(!('sessionSchemaVersion' in revision));
    assert.equal(revision.provenance.frozenBySessionSchemaVersion, SESSION_SCHEMA_VERSION);
    assert.equal(ENGINE_IDENTITY.sessionSchemaVersion, SESSION_SCHEMA_VERSION);
});

test('the engine declares an identity of the shape the contract requires', () => {
    assert.deepEqual(
        Object.keys(ENGINE_IDENTITY).sort(),
        ['engineId', 'runtimeVersion', 'sessionSchemaVersion', 'supportedDefinitionSchemaVersions']
    );
    assert.equal(ENGINE_IDENTITY.engineId, 'shared-plan');
    assert.ok(Array.isArray(ENGINE_IDENTITY.supportedDefinitionSchemaVersions));
    assert.ok(ENGINE_IDENTITY.supportedDefinitionSchemaVersions.includes('0'));
});

test('a revision from an incompatible engine runtime fails closed before mounting', () => {
    const revision = clone(revisionFor('r-a'));
    /* Rebuild the hash so the revision is internally consistent: without the
       runtime check it would verify perfectly and then mount against rules it
       was never compiled against. */
    revision.engineRuntimeVersion = '0.9.0';
    revision.contentHash = rehash(revision);

    const check = verifyRevision(revision);
    assert.equal(check.ok, false, 'an incompatible runtime must be refused');
    assert.match(check.problems.join(' '), /cannot interpret/);
});

test('a revision from a patch-level runtime difference still mounts', () => {
    const revision = clone(revisionFor('r-a'));
    /* Refusing every revision on every bugfix would invalidate saved games for
       no reason, so compatibility is decided per release series. */
    revision.engineRuntimeVersion = '0.1.99';
    revision.contentHash = rehash(revision);

    assert.ok(verifyRevision(revision).ok, 'a patch-level difference must not fail closed');
});

test('an unsupported Definition schema is refused against the supported list', () => {
    const revision = clone(revisionFor('r-a'));
    revision.definitionSchemaVersion = '99';
    revision.contentHash = rehash(revision);

    const check = verifyRevision(revision);
    assert.equal(check.ok, false);
    assert.match(check.problems.join(' '), /Definition schema 99 is not supported/);
});

test('a malformed revision fails closed rather than throwing', () => {
    for (const bad of [null, undefined, 42, 'a revision', {}, { compiledGame: null }, { compiledGame: {} }]) {
        const check = verifyRevision(bad);
        assert.equal(check.ok, false, `${JSON.stringify(bad)} should be refused`);
        assert.ok(check.problems.length > 0);
    }
});
