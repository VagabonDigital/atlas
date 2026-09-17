#!/usr/bin/env node
/* Runs the Voice placement spike over every fixture that has Voices, plus one
   synthetic case with a Voice anchored to a Piece, which no fixture has yet.

     node spikes/voice-layout/run.js [--out <dir>]

   Prints a comparison table. With --out, also writes report.json and a
   self-contained comparison page with wireframes, report.html. */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { allDrafts } from '../../definitions/index.js';
import { compileAndFreeze, formatDiagnostic } from '../../engines/shared-plan/compiler/index.js';
import { baseline, lane, satellite, hybrid, evaluate } from './strategies.js';
import { renderReport } from './report.js';

const STRATEGIES = [lane, satellite, hybrid];

function fixtures() {
    const cases = Object.entries(allDrafts)
        .filter(([, draft]) => (draft.voices ?? []).length > 0)
        .map(([name, draft]) => ({ name, note: null, draft }));

    const pieceAnchored = structuredClone(allDrafts['r-a']);
    const marta = pieceAnchored.voices.find((v) => v.key === 'marta');
    marta.anchor = { kind: 'piece', piece: 'gregor' };
    cases.push({
        name: 'r-a (piece anchor)',
        note: 'R-A with Marta anchored to Gregor, a Piece, instead of the Hearth Table. The schema allows it; no fixture uses it.',
        draft: pieceAnchored
    });
    return cases;
}

function run() {
    const results = [];
    for (const { name, note, draft } of fixtures()) {
        const compiled = compileAndFreeze(draft);
        if (!compiled.ok) {
            /* Since the B1.1 closure a Voice anchors to a Place, so the synthetic
               Piece-anchor case is refused by the compiler, as it should be. */
            console.log(`${name}: refused by the compiler, skipped:\n  ${compiled.diagnostics.map(formatDiagnostic).join('\n  ')}`);
            continue;
        }
        const game = compiled.compiledGame;
        const base = baseline(game);
        const strategies = STRATEGIES.map((strategy) => {
            const result = strategy(game);
            return { result, metrics: evaluate(game, result, base) };
        });
        results.push({ name, note, game, base, strategies });
    }
    return results;
}

const round = (n) => Math.round(n);

function table(results) {
    const rows = [];
    for (const { name, game, strategies } of results) {
        for (const { result, metrics } of strategies) {
            rows.push({
                fixture: name,
                form: game.presentation.stageForm,
                strategy: result.label,
                variant: result.variant,
                pass: metrics.pass ? 'yes' : 'NO',
                'min row px': `${round(metrics.minCell)} (was ${round(metrics.baseMinCell)})`,
                'socket area': `${round(metrics.retained * 100)}%`,
                'anchor gap': `${round(metrics.meanGap)} / ${round(metrics.maxGap)}`,
                ambiguous: `${metrics.ambiguous}/${metrics.cards.length}`,
                'tether px': round(metrics.meanTether),
                crossings: metrics.meanCrossings.toFixed(2),
                'headline on voice': metrics.headlineConflicts.filter((h) => h.leansIn).length
            });
        }
    }
    return rows;
}

const results = run();
console.table(table(results));
for (const { name, strategies } of results) {
    for (const { result, metrics } of strategies) {
        const issues = [...metrics.problems, ...metrics.collisions];
        if (issues.length) console.log(`${name} / ${result.label}: ${issues.join('; ')}`);
        if (result.fellBackBecause?.length) console.log(`${name} / Hybrid fell back to a band because: ${result.fellBackBecause.join('; ')}`);
    }
}

const outAt = process.argv.indexOf('--out');
if (outAt !== -1) {
    const out = process.argv[outAt + 1];
    await mkdir(out, { recursive: true });
    const json = results.map(({ name, note, game, strategies }) => ({
        fixture: name,
        note,
        stageForm: game.presentation.stageForm,
        topology: game.topology.kind,
        strategies: strategies.map(({ result, metrics }) => ({
            id: result.id,
            variant: result.variant,
            fellBackBecause: result.fellBackBecause ?? null,
            ...metrics,
            cards: metrics.cards.map(({ tethers, ...card }) => ({
                ...card,
                tethers: tethers.map(({ target, meanLength, maxLength, meanCrossings }) => ({ target, meanLength, maxLength, meanCrossings }))
            }))
        }))
    }));
    await writeFile(join(out, 'report.json'), `${JSON.stringify(json, null, 2)}\n`, 'utf8');
    await writeFile(join(out, 'report.html'), renderReport(results), 'utf8');
    console.log(`wrote ${join(out, 'report.json')} and report.html`);
}
