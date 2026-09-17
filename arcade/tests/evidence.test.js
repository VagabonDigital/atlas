/* Evidence tests.

   The analyser verifies by search. These tests hold the line between what a
   search has proved and what it has merely not yet seen, because every
   threshold calibrated in a later phase will be calibrated against these
   numbers, and a sample reported as exhaustive would calibrate against a
   fiction. */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
    enumerateArrangements, sampleArrangements, commitEvidence, arrangementSignature,
    buildContext, syntheticSession, seams
} from '../engines/shared-plan/model/index.js';
import { analyse, formatAnalysis } from '../engines/shared-plan/analysis/index.js';
import { compile } from '../engines/shared-plan/compiler/index.js';
import { allDrafts, draftNames, revisionFor, analysisFor } from './helpers.js';

/* Measured directly: the reference games are small enough to walk completely,
   the hostile maxima are not. That split is the whole reason the distinction
   has to be reported rather than assumed. */
const EXHAUSTIVE_FIXTURES = ['r-a', 'r-b', 'r-c', 'h-2', 'h-4', 'h-5', 'h-6'];
const TOO_LARGE_FIXTURES = ['h-1', 'h-3'];

test('a search that stops at its result limit reports itself incomplete', () => {
    const revision = revisionFor('r-a');
    const game = revision.compiledGame;

    const capped = enumerateArrangements(game, revision, { limit: 5, nodeBudget: 1000000 });
    assert.equal(capped.arrangements.length, 5);
    assert.equal(capped.complete, false, 'hitting the result limit is not exhausting the space');
    assert.equal(capped.stoppedBy, 'limit');
    assert.equal(capped.truncated, true);
});

test('a search that stops at its node budget reports itself incomplete', () => {
    const revision = revisionFor('r-c');
    const game = revision.compiledGame;

    const starved = enumerateArrangements(game, revision, { limit: Infinity, nodeBudget: 50 });
    assert.equal(starved.complete, false);
    assert.equal(starved.stoppedBy, 'nodeBudget');
    assert.equal(starved.truncated, true);
});

test('a search that walks the whole space reports itself complete', () => {
    const revision = revisionFor('r-a');
    const game = revision.compiledGame;

    const full = enumerateArrangements(game, revision, { limit: Infinity, nodeBudget: 1000000 });
    assert.equal(full.complete, true);
    assert.equal(full.stoppedBy, 'exhausted');
    assert.equal(full.truncated, false);
    assert.ok(full.arrangements.length > 0);
});

test('an exhaustive walk finds strictly more plans than a capped sample', () => {
    const revision = revisionFor('r-a');
    const game = revision.compiledGame;

    const full = enumerateArrangements(game, revision, { limit: Infinity, nodeBudget: 1000000 });
    const sampled = sampleArrangements(game, revision, { target: 60, nodeBudget: 400000 });

    assert.ok(
        sampled.arrangements.length < full.arrangements.length,
        'this fixture must actually exercise the incomplete case'
    );
    assert.equal(sampled.complete, false, 'a capped sample must never claim completeness');

    /* Whatever the sample did find has to be real. */
    const real = new Set(full.arrangements.map(arrangementSignature));
    for (const arrangement of sampled.arrangements) {
        assert.ok(real.has(arrangementSignature(arrangement)), 'the sample produced a plan that is not legal');
    }
});

test('a stratified sample is complete only when a round exhausted the space', () => {
    const small = revisionFor('h-6');
    const sampledSmall = sampleArrangements(small.compiledGame, small, { target: 600, nodeBudget: 400000 });
    assert.equal(sampledSmall.complete, true, 'a space smaller than the round cap is fully seen');

    const large = revisionFor('h-1');
    const sampledLarge = sampleArrangements(large.compiledGame, large, { target: 600, nodeBudget: 400000 });
    assert.equal(sampledLarge.complete, false, 'a space far larger than the cap is never fully seen');
});

test('commitEvidence prefers exact evidence and labels it honestly', () => {
    for (const name of EXHAUSTIVE_FIXTURES) {
        const revision = revisionFor(name);
        const evidence = commitEvidence(revision.compiledGame, revision);
        assert.equal(evidence.exhaustive, true, `${name} is small enough to walk completely`);

        const full = enumerateArrangements(revision.compiledGame, revision, {
            limit: Infinity, nodeBudget: 50000000
        });
        assert.equal(
            evidence.arrangements.length, full.arrangements.length,
            `${name}: exhaustive evidence must be the whole space`
        );
    }

    for (const name of TOO_LARGE_FIXTURES) {
        const revision = revisionFor(name);
        const evidence = commitEvidence(revision.compiledGame, revision);
        assert.equal(evidence.exhaustive, false, `${name} cannot be walked completely and must say so`);
        assert.ok(evidence.arrangements.length > 0, `${name} still yields usable evidence`);
    }
});

test('the analysis report says which kind of evidence it rests on', () => {
    for (const name of draftNames) {
        const revision = revisionFor(name);
        const report = analysisFor(name);

        assert.equal(typeof report.commitsExamined, 'number');
        assert.equal(typeof report.commitsExhaustive, 'boolean');
        assert.ok(!('validCommits' in report), 'a count of a sample must not be named as a count of everything');

        const text = formatAnalysis(revision.compiledGame, report);
        if (report.commitsExhaustive) {
            assert.match(text, /\(exhaustive\)/, `${name}: exact evidence should say so`);
        } else {
            assert.match(text, /SAMPLED/, `${name}: sampled evidence must be marked`);
            assert.ok(
                report.notes.some((n) => n.includes('Evidence is a sample')),
                `${name}: sampled evidence must carry a note`
            );
        }
    }
});

test('a Rule is only called dead on exhaustive evidence', () => {
    for (const name of TOO_LARGE_FIXTURES) {
        const report = analysisFor(name);
        assert.equal(report.commitsExhaustive, false);
        assert.deepEqual(
            report.deadRules, [],
            `${name}: a dead-Rule claim is a claim about the whole space and cannot come from a sample`
        );
    }

    /* The claim is still made where the evidence supports it, so this is not
       simply silence. */
    const draft = structuredClone(allDrafts['r-b']);
    draft.rules.push({
        key: 'decoration',
        kind: 'allowedIn',
        subject: { kind: 'tag', tag: 'gear' },
        places: ['quay', 'midpoint', 'far-shore'],
        inscription: 'Gear goes anywhere'
    });
    const { ok, compiledGame } = compile(draft);
    assert.ok(ok);
    const report = analyse(compiledGame, {});
    assert.equal(report.commitsExhaustive, true);
    assert.ok(report.deadRules.includes('decoration'), 'a Rule that rejects nothing must still be reported');
});

test('an unselected variant is only called unreachable on exhaustive evidence', () => {
    const revision = revisionFor('h-1');
    const report = analysisFor('h-1');
    assert.equal(report.commitsExhaustive, false);

    const text = formatAnalysis(revision.compiledGame, report);
    assert.ok(!text.includes('never fires for any legal plan'), 'a sample cannot prove unreachability');
    for (const beat of report.beats) {
        if (beat.variantsNotSelected.length > 0) {
            assert.match(text, /not selected in the sample/);
        }
    }
});

/* An independent, deliberately naive answer to "does this Rule bind?": lift the
   Rule, walk the entire remaining space with no budget and no early exit, and
   look for any plan the Rule would have rejected.

   The analyser's version stops at the first witness and walks under a node
   budget. This exists to prove those two optimisations changed which answer
   comes out, not merely how fast it arrives. */
function ruleBindsBruteForce(game, revision, ruleKey) {
    const rules = game.rules.filter((r) => r.key !== ruleKey);
    const probe = {
        ...game,
        rules,
        ruleIndex: rules.reduce((out, r) => { out[r.key] = r; return out; }, Object.create(null))
    };

    const { arrangements, complete } = enumerateArrangements(probe, revision, {
        limit: Infinity,
        nodeBudget: 50000000
    });
    if (!complete) return { determined: false, binds: null };

    const binds = arrangements.some((placements) => {
        const ctx = buildContext(game, syntheticSession(revision, placements, { phase: 'commit' }));
        return seams(ctx).some((s) => s.rule === ruleKey);
    });
    return { determined: true, binds };
}

test('the early-exit dead-Rule search agrees with an exhaustive brute-force search', () => {
    /* h-1 and h-3 are excluded because their spaces cannot be walked at all,
       which is the very fact this audit established. Everywhere the question is
       computable, the two implementations must agree exactly. */
    for (const name of EXHAUSTIVE_FIXTURES) {
        const revision = revisionFor(name);
        const game = revision.compiledGame;
        const report = analysisFor(name);

        for (const rule of game.rules) {
            if (rule.status !== 'active') continue;
            const truth = ruleBindsBruteForce(game, revision, rule.key);
            assert.equal(truth.determined, true, `${name}: ${rule.key} should be decidable`);

            const calledDead = report.deadRules.includes(rule.key);
            const calledUndetermined = report.undeterminedRules.includes(rule.key);

            if (truth.binds) {
                assert.equal(calledDead, false, `${name}: ${rule.key} binds but was called dead`);
                assert.equal(
                    calledUndetermined, false,
                    `${name}: ${rule.key} binds and is decidable, so it must not be undetermined`
                );
            } else {
                assert.equal(
                    calledDead, true,
                    `${name}: ${rule.key} rejects no plan anywhere and must be reported dead`
                );
            }
        }
    }
});

test('stopping early at a witness never produces a dead-Rule claim', () => {
    /* The unsafe direction is claiming a Rule dead from an incomplete walk. A
       dead claim requires the whole space to have been seen, and stopping early
       only ever happens when a witness was found. */
    for (const name of draftNames) {
        const revision = revisionFor(name);
        const report = analysisFor(name);
        for (const key of report.deadRules) {
            const truth = ruleBindsBruteForce(revision.compiledGame, revision, key);
            if (!truth.determined) continue;
            assert.equal(truth.binds, false, `${name}: ${key} was called dead but actually binds`);
        }
    }
});

test('family statistics always declare the size of the subsample behind them', () => {
    for (const name of draftNames) {
        const report = analysisFor(name);
        for (const beat of report.beats) {
            assert.equal(typeof beat.revisionSampleSize, 'number');
            assert.ok(beat.revisionSampleSize > 0, `${name}: no revision subsample recorded`);
            assert.equal(typeof beat.revisionsTruncated, 'boolean');
        }
    }
});
