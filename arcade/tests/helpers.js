/* Shared test helpers.

   The engine itself never reads a clock or a random number. Tests may, but only
   from a seeded generator, so a failing property test names a seed that
   reproduces it exactly. */

import { allDrafts, references } from '../definitions/index.js';
import { compileAndFreeze, formatDiagnostic } from '../engines/shared-plan/compiler/index.js';
import { analyse } from '../engines/shared-plan/analysis/index.js';

export { allDrafts, references };

/* A small linear congruential generator. Deterministic and seedable. */
export function rng(seed) {
    let state = seed >>> 0;
    return () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 0x100000000;
    };
}

export function pick(random, items) {
    return items[Math.floor(random() * items.length)];
}

const compiled = new Map();

export function revisionFor(name) {
    if (!compiled.has(name)) {
        const result = compileAndFreeze(allDrafts[name]);
        if (!result.ok) {
            const detail = result.diagnostics.map(formatDiagnostic).join('\n  ');
            throw new Error(`Fixture "${name}" did not compile:\n  ${detail}`);
        }
        compiled.set(name, result.revision);
    }
    return compiled.get(name);
}

/* Analysing a world at every budget means searching hundreds of thousands of
   plans. It is deterministic, so a fixture only needs analysing once per run;
   tests that assert determinism call `analyse` directly instead. */
const analyses = new Map();

export function analysisFor(name) {
    if (!analyses.has(name)) {
        const revision = revisionFor(name);
        analyses.set(name, analyse(revision.compiledGame, revision));
    }
    return analyses.get(name);
}

export const draftNames = Object.keys(allDrafts);
export const referenceNames = Object.keys(references);
