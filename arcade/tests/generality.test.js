/* Generality tests.

   These are the mechanical guards against the engine quietly becoming a
   disguised implementation of one attractive scenario. They are enforced here
   rather than by review, because review is exactly what misses this. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, sep } from 'node:path';

import { compile, compileAndFreeze } from '../engines/shared-plan/compiler/index.js';
import { analyse } from '../engines/shared-plan/analysis/index.js';
import { derive } from '../engines/shared-plan/model/index.js';
import { narrate } from '../engines/shared-plan/narration/index.js';
import { autoplay } from '../harness/autoplay.js';
import { allDrafts, references, referenceNames } from './helpers.js';

const here = dirname(fileURLToPath(import.meta.url));
const engineRoot = join(here, '..', 'engines', 'shared-plan');

function sourceFiles(dir) {
    const out = [];
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) out.push(...sourceFiles(full));
        else if (entry.endsWith('.js')) out.push(full);
    }
    return out;
}

/* ---- the rename test ---- */

const REF_FIELDS = new Set([
    'key', 'piece', 'place', 'a', 'b', 'resource', 'rule', 'goal', 'voice', 'beat', 'variant', 'tag'
]);
const LIST_FIELDS = new Set(['places', 'tags', 'languageFocus']);
const NAME_FIELDS = new Set(['name']);

function collectKeys(draft) {
    const keys = new Set();
    for (const section of ['places', 'pieces', 'resources', 'rules', 'goals', 'voices', 'beats']) {
        for (const item of draft[section] ?? []) {
            keys.add(item.key);
            for (const variant of item.variants ?? []) keys.add(variant.key);
            for (const tag of item.tags ?? []) keys.add(tag);
        }
    }
    for (const rule of draft.rules ?? []) {
        if (rule.subject?.tag) keys.add(rule.subject.tag);
        if (rule.needs?.tag) keys.add(rule.needs.tag);
    }
    return keys;
}

/* Machine-rewrites a Draft with scrambled keys and names. Nothing about the
   world's structure changes, so anything the engine reports about it must be
   identical up to the renaming. */
function scramble(draft) {
    const keys = [...collectKeys(draft)].sort();
    const keyMap = new Map(keys.map((key, i) => [key, `k${i}`]));
    let nameCounter = 0;
    const nameMap = new Map();

    const walk = (value, field) => {
        if (Array.isArray(value)) {
            return value.map((entry) => (
                LIST_FIELDS.has(field) && typeof entry === 'string'
                    ? (keyMap.get(entry) ?? entry)
                    : walk(entry, field)
            ));
        }
        if (value && typeof value === 'object') {
            const out = {};
            for (const [k, v] of Object.entries(value)) out[k] = walk(v, k);
            return out;
        }
        if (typeof value === 'string') {
            if (REF_FIELDS.has(field)) return keyMap.get(value) ?? value;
            if (NAME_FIELDS.has(field)) {
                if (!nameMap.has(value)) nameMap.set(value, `Name ${(nameCounter += 1)}`);
                return nameMap.get(value);
            }
        }
        return value;
    };

    return { scrambled: walk(draft, ''), keyMap };
}

const mapKey = (keyMap, key) => keyMap.get(key) ?? key;

function mapReport(report, keyMap) {
    return {
        validCommits: report.validCommits,
        commitsTruncated: report.commitsTruncated,
        deadRules: report.deadRules.map((k) => mapKey(keyMap, k)).sort(),
        dominance: Object.fromEntries(
            Object.entries(report.dominance).map(([k, v]) => [
                mapKey(keyMap, k),
                { where: mapKey(keyMap, v.where), share: v.share }
            ])
        ),
        goalReachAtCommit: Object.fromEntries(
            Object.entries(report.goalReachAtCommit).map(([k, v]) => [mapKey(keyMap, k), v])
        ),
        beats: report.beats.map((b) => ({
            beat: mapKey(keyMap, b.beat),
            trigger: b.trigger,
            touchRate: b.touchRate,
            variantShare: Object.fromEntries(
                Object.entries(b.variantShare).map(([k, v]) => [mapKey(keyMap, k), v])
            ),
            unreachableVariants: b.unreachableVariants.map((k) => mapKey(keyMap, k)).sort(),
            pinGatedVariants: b.pinGatedVariants.map((k) => mapKey(keyMap, k)).sort()
        }))
    };
}

test('the rename test: scrambled keys and names produce an isomorphic analysis', () => {
    for (const name of referenceNames) {
        const original = compileAndFreeze(references[name]);
        const { scrambled, keyMap } = scramble(references[name]);
        const renamed = compileAndFreeze(scrambled);

        assert.ok(renamed.ok, `${name}: the scrambled Definition did not compile`);

        const before = mapReport(analyse(original.compiledGame, original.revision), keyMap);
        const after = mapReport(analyse(renamed.compiledGame, renamed.revision), new Map());

        assert.deepEqual(after, before, `${name}: analysis was not isomorphic under renaming`);
    }
});

test('the rename test: the solved layout is identical, because geometry is structural', () => {
    for (const name of referenceNames) {
        const original = compile(references[name]);
        const { scrambled, keyMap } = scramble(references[name]);
        const renamed = compile(scrambled);

        for (const place of original.compiledGame.places) {
            const mapped = mapKey(keyMap, place.key);
            assert.deepEqual(
                renamed.compiledGame.layout.places[mapped].frame,
                original.compiledGame.layout.places[place.key].frame,
                `${name}: renaming moved ${place.key}`
            );
        }
        assert.equal(
            renamed.compiledGame.layout.segments.length,
            original.compiledGame.layout.segments.length
        );
    }
});

test('the rename test: a playthrough differs only in text', () => {
    for (const name of referenceNames) {
        const original = compileAndFreeze(references[name]);
        const { scrambled } = scramble(references[name]);
        const renamed = compileAndFreeze(scrambled);

        const a = autoplay(original.revision);
        const b = autoplay(renamed.revision);

        assert.equal(b.trace.length, a.trace.length, `${name}: the scrambled world played differently`);
        assert.deepEqual(
            b.trace.map((t) => t.action.kind),
            a.trace.map((t) => t.action.kind),
            `${name}: the scrambled world needed different actions`
        );

        const linesA = narrate(original.compiledGame, derive(original.compiledGame, a.session)).split('\n').length;
        const linesB = narrate(renamed.compiledGame, derive(renamed.compiledGame, b.session)).split('\n').length;
        assert.equal(linesB, linesA, `${name}: the scrambled world narrated a different shape`);
    }
});

/* ---- the form-swap test ---- */

test('the form-swap test: a groups world plays the same in its sibling form', () => {
    /* Table and Vessel are both `groups`, so they share a solver and differ only
       in the Ground painter B2 will add. Swapping one for the other must change
       nothing mechanical at all. */
    for (const name of ['r-a', 'r-c']) {
        const original = compileAndFreeze(allDrafts[name]);
        const swapped = structuredClone(allDrafts[name]);
        swapped.presentation.stageForm =
            original.compiledGame.presentation.stageForm === 'table' ? 'vessel' : 'table';

        const result = compileAndFreeze(swapped);
        assert.ok(result.ok, `${name}: did not compile in its sibling form`);

        const a = autoplay(original.revision);
        const b = autoplay(result.revision);
        assert.deepEqual(
            b.trace.map((t) => t.action.kind),
            a.trace.map((t) => t.action.kind),
            `${name}: swapping the form changed how it plays`
        );
        assert.deepEqual(
            analyse(result.compiledGame, result.revision).beats,
            analyse(original.compiledGame, original.revision).beats,
            `${name}: swapping the form changed the analysis`
        );
    }
});

/* ---- the no-hack rule ---- */

function stringLiterals(source) {
    const out = [];
    /* Good enough for engine source, which contains no exotic quoting. */
    const pattern = /(['"])((?:\\.|(?!\1)[^\\\r\n])*)\1/gu;
    let match;
    while ((match = pattern.exec(source)) !== null) out.push(match[2]);
    return out;
}

test('the no-hack rule: no engine source mentions anything from a reference game', () => {
    const forbidden = new Map();
    for (const [name, draft] of Object.entries(references)) {
        for (const key of collectKeys(draft)) forbidden.set(key.toLowerCase(), `${name} key "${key}"`);
        for (const section of ['places', 'pieces', 'voices', 'resources']) {
            for (const item of draft[section] ?? []) {
                const label = item.name ?? item.label;
                if (label) forbidden.set(label.toLowerCase(), `${name} name "${label}"`);
            }
        }
    }

    /* The closed vocabularies are the one place English words belong: glyphs are
       tagged by meaning so a model can search them, and reference games draw on
       the same everyday words. Whether a vocabulary entry is too specific to one
       game is a design-review question, not something a string match can answer.
       Everywhere else, a literal naming a reference game is a hack. */
    const vocabularyTable = join(engineRoot, 'definition', 'vocabularies.js');

    const offences = [];
    for (const file of sourceFiles(engineRoot)) {
        if (file === vocabularyTable) continue;
        const source = readFileSync(file, 'utf8');
        for (const literal of stringLiterals(source)) {
            const hit = forbidden.get(literal.trim().toLowerCase());
            if (hit) offences.push(`${relative(engineRoot, file)}: "${literal}" is ${hit}`);
        }
    }

    assert.deepEqual(offences, [], `engine source refers to specific games:\n  ${offences.join('\n  ')}`);
});

test('no engine module imports a Definition', () => {
    const offences = [];
    for (const file of sourceFiles(engineRoot)) {
        const source = readFileSync(file, 'utf8');
        if (/from\s+['"][^'"]*definitions\//u.test(source)) {
            offences.push(relative(engineRoot, file));
        }
    }
    assert.deepEqual(offences, [], 'only tests and the workbench may import Definitions');
});

/* ---- dependency boundaries ---- */

const FORBIDDEN_IMPORTS = {
    model: ['layout', 'stage', 'authoring', 'compiler', 'analysis', 'narration', 'arcade'],
    layout: ['model', 'stage', 'authoring', 'compiler', 'analysis'],
    definition: ['model', 'layout', 'stage', 'authoring', 'compiler', 'analysis'],
    narration: ['compiler', 'analysis', 'layout', 'stage', 'authoring'],
    analysis: ['stage', 'authoring', 'compiler']
};

test('dependency boundaries hold', () => {
    const offences = [];
    for (const [moduleName, banned] of Object.entries(FORBIDDEN_IMPORTS)) {
        for (const file of sourceFiles(join(engineRoot, moduleName))) {
            const source = readFileSync(file, 'utf8');
            const imports = [...source.matchAll(/from\s+['"]([^'"]+)['"]/gu)].map((m) => m[1]);
            for (const spec of imports) {
                for (const target of banned) {
                    if (spec.includes(`/${target}/`) || spec.endsWith(`/${target}.js`)) {
                        offences.push(`${moduleName}/${relative(join(engineRoot, moduleName), file)} imports ${spec}`);
                    }
                }
            }
        }
    }
    assert.deepEqual(offences, [], `dependency rules broken:\n  ${offences.join('\n  ')}`);
});

test('the model reads no clock and no random source', () => {
    const offences = [];
    for (const file of sourceFiles(join(engineRoot, 'model'))) {
        const source = readFileSync(file, 'utf8');
        for (const banned of ['Math.random', 'Date.now', 'new Date', 'performance.now', 'crypto.']) {
            if (source.includes(banned)) {
                offences.push(`model/${relative(join(engineRoot, 'model'), file)} uses ${banned}`);
            }
        }
    }
    assert.deepEqual(offences, [], `the model must be pure:\n  ${offences.join('\n  ')}`);
});

test('the model touches no DOM', () => {
    const offences = [];
    for (const file of sourceFiles(join(engineRoot, 'model'))) {
        const source = readFileSync(file, 'utf8');
        for (const banned of ['document.', 'window.', 'HTMLElement', 'localStorage']) {
            if (source.includes(banned)) {
                offences.push(`model/${relative(join(engineRoot, 'model'), file)} uses ${banned}`);
            }
        }
    }
    assert.deepEqual(offences, [], `the model must not know about a browser:\n  ${offences.join('\n  ')}`);
});

test('every topology kind and every vocabulary entry is exercised by a fixture', () => {
    const seenRules = new Set();
    const seenPredicates = new Set();
    const seenEffects = new Set();
    const seenTopologies = new Set();
    const seenStaging = new Set();
    const seenResourceCounts = new Set();

    const walkPredicate = (p) => {
        if (!p) return;
        seenPredicates.add(p.kind);
        (p.terms ?? []).forEach(walkPredicate);
        if (p.term) walkPredicate(p.term);
    };

    for (const draft of Object.values(allDrafts)) {
        seenTopologies.add(draft.world.topology);
        seenResourceCounts.add((draft.resources ?? []).length);
        for (const rule of draft.rules ?? []) seenRules.add(rule.kind);
        for (const goal of draft.goals ?? []) {
            walkPredicate(goal.condition);
            walkPredicate(goal.impossibleWhen);
        }
        for (const voice of draft.voices ?? []) {
            walkPredicate(voice.concern);
            for (const outcome of voice.outcomes ?? []) walkPredicate(outcome.condition);
        }
        for (const beat of draft.beats ?? []) {
            for (const variant of beat.variants) {
                walkPredicate(variant.guard);
                seenStaging.add(variant.staging);
                for (const effect of variant.effects ?? []) seenEffects.add(effect.kind);
            }
        }
    }

    /* Graph belongs to R-D in B5, along with its solver and the near/far Rules
       and the adjacent predicate that only mean something there. */
    assert.deepEqual([...seenTopologies].sort(), ['groups', 'sequence']);
    assert.deepEqual([...seenResourceCounts].sort(), [0, 1, 2], 'resource counts 0, 1 and 2 must all appear');

    for (const kind of ['sumLimit', 'allowedIn', 'requires', 'together', 'apart', 'before']) {
        assert.ok(seenRules.has(kind), `no fixture uses the "${kind}" Rule`);
    }
    for (const kind of ['pieceIn', 'pieceCut', 'piecePinned', 'countTagged', 'sumResource', 'beatFired', 'all', 'not']) {
        assert.ok(seenPredicates.has(kind), `no fixture uses the "${kind}" predicate`);
    }
    for (const kind of [
        'closePlace', 'reopenPlace', 'setCapacity', 'adjustResourceLimit', 'makeUnavailable',
        'introducePiece', 'activateRule', 'activateGoal', 'lockPiece', 'lockPlace',
        'revealFact', 'shiftVoice', 'severAfter'
    ]) {
        assert.ok(seenEffects.has(kind), `no fixture uses the "${kind}" effect`);
    }
    for (const preset of ['arrival', 'closure', 'rupture', 'drought', 'revelation']) {
        assert.ok(seenStaging.has(preset), `no fixture uses the "${preset}" staging preset`);
    }
});
