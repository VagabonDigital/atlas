/* Engine One — the compiler.

   Owns trust. It does not render and it does not call models: content safety
   and Class C critique are separate steps in the stage plan precisely so this
   stays deterministic and testable offline.

   Draft in; Compiled Game plus diagnostics out. Nothing reaches the runtime
   without passing through here, including a reference Definition written by
   our best designer. */

import { DEFINITION_SCHEMA, checkShape, ENGINE_ID, DEFINITION_SCHEMA_VERSION } from '../definition/index.js';
import { solve, hasSolver, fitReport, collisionReport } from '../layout/index.js';
import { SESSION_SCHEMA_VERSION } from '../model/index.js';
import { makeSink } from './diagnostics.js';
import { normalise } from './normalise.js';
import { resolve } from './resolve.js';
import { validate } from './validate.js';
import { disclosureSchedule, tutorSafeProjection } from './disclosure.js';
import { contentHash } from './hash.js';

export const ENGINE_RUNTIME_VERSION = '0.1.0';
export const COMPILER_VERSION = '0.1.0';
/* Hand-authored Drafts have no Generation Contract. B3 introduces v0. */
export const NO_GENERATION_CONTRACT = 'none';

export { makeSink, formatDiagnostic, phraseForRepair, SEVERITY } from './diagnostics.js';
export { contentHash, canonicalJson } from './hash.js';

function revisionIdFor(game, hash) {
    const slug = game.meta.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/gu, '-')
        .replace(/^-|-$/gu, '')
        .slice(0, 40);
    return `${slug}-${hash.slice(0, 12)}`;
}

/* The identity a Game Revision will carry. Enumeration during validation runs
   against this, before the hash exists, because the hash covers the compiled
   result the search helps produce. */
const PENDING_IDENTITY = Object.freeze({
    revisionId: null,
    contentHash: null,
    engineRuntimeVersion: ENGINE_RUNTIME_VERSION,
    definitionSchemaVersion: DEFINITION_SCHEMA_VERSION
});

export function compile(draft) {
    const report = makeSink();

    if (!draft || typeof draft !== 'object') {
        report({ code: 'parse.notAnObject', locus: '', message: 'A Definition must be an object.' });
        return { ok: false, compiledGame: null, diagnostics: report.entries };
    }

    /* Normalisation runs before the shape check because it fills the structural
       defaults the shape check then measures. */
    const normalised = normalise(draft);
    checkShape(DEFINITION_SCHEMA, normalised, '', report);

    if (normalised.contract?.engineId !== ENGINE_ID) {
        report({
            code: 'parse.wrongEngine',
            locus: 'contract.engineId',
            message: `This compiler only accepts "${ENGINE_ID}" Definitions.`,
            modelMessage: `Set contract.engineId to "${ENGINE_ID}".`
        });
    }

    if (report.hasErrors()) return { ok: false, compiledGame: null, diagnostics: report.entries };

    const game = resolve(normalised, report);
    if (report.hasErrors()) return { ok: false, compiledGame: null, diagnostics: report.entries };

    validate(game, PENDING_IDENTITY, report);
    if (report.hasErrors()) return { ok: false, compiledGame: null, diagnostics: report.entries };

    /* Layout is part of trust, not decoration: text that does not fit is a
       compile error rather than a rendering problem found on a call. */
    if (!hasSolver(game.topology.kind)) {
        report({
            code: 'layout.noSolver',
            locus: 'world.topology',
            message: `No layout solver exists yet for "${game.topology.kind}" worlds.`,
            modelMessage: `Use world.topology "groups" or "sequence".`
        });
        return { ok: false, compiledGame: null, diagnostics: report.entries };
    }

    const layout = solve(game);
    for (const problem of fitReport(game, layout)) {
        report({
            code: 'layout.doesNotFit',
            locus: problem.locus,
            message: `"${problem.text}" does not fit its slot (${problem.reason}): needs ${problem.width}px across ${problem.lines} line(s), has ${problem.maxWidth}px at the smallest legible size.`,
            modelMessage: `Shorten the text at ${problem.locus}; it is too long to render legibly.`
        });
    }
    for (const collision of collisionReport(game, layout)) {
        report({
            code: 'layout.collision',
            locus: 'places',
            message: `${collision.a} overlaps ${collision.b} at 1280x720.`,
            modelMessage: 'Reduce the number of Places.'
        });
    }

    if (report.hasErrors()) return { ok: false, compiledGame: null, diagnostics: report.entries };

    const compiledGame = {
        ...game,
        layout,
        disclosure: disclosureSchedule(game),
        tutorSafe: tutorSafeProjection(game)
    };

    return { ok: true, compiledGame, diagnostics: report.entries };
}

/* Everything played is an immutable Game Revision from the first day, including
   reference Definitions, so there is never a second identity system. */
export function freeze(compiledGame, { generationContractVersion = NO_GENERATION_CONTRACT, provenance } = {}) {
    const hash = contentHash({
        compiledGame: stripVolatile(compiledGame),
        engineRuntimeVersion: ENGINE_RUNTIME_VERSION,
        definitionSchemaVersion: DEFINITION_SCHEMA_VERSION,
        compilerVersion: COMPILER_VERSION,
        generationContractVersion
    });

    return {
        revisionId: revisionIdFor(compiledGame, hash),
        engineId: ENGINE_ID,
        contentHash: hash,
        engineRuntimeVersion: ENGINE_RUNTIME_VERSION,
        definitionSchemaVersion: DEFINITION_SCHEMA_VERSION,
        compilerVersion: COMPILER_VERSION,
        sessionSchemaVersion: SESSION_SCHEMA_VERSION,
        generationContractVersion,
        compiledGame,
        provenance: provenance ?? { authoredBy: 'hand', compiledAt: null }
    };
}

/* Indexes are rebuildable views of the same content, so they are excluded from
   the hash to keep it a hash of meaning rather than of representation. */
function stripVolatile(game) {
    const {
        placeIndex, pieceIndex, resourceIndex, ruleIndex,
        goalIndex, voiceIndex, beatIndex, ...rest
    } = game;
    return { ...rest, beats: rest.beats.map(({ variantIndex, ...b }) => b) };
}

export function compileAndFreeze(draft, options) {
    const result = compile(draft);
    if (!result.ok) return { ...result, revision: null };
    return { ...result, revision: freeze(result.compiledGame, options) };
}

/* The Core host verifies a revision before mounting, and the engine runs a fast
   structural check of the Compiled Game. Anything wrong fails closed before
   play, with a clean message, rather than during a lesson. */
export function verifyRevision(revision) {
    const problems = [];
    if (revision.engineId !== ENGINE_ID) problems.push(`Revision is for engine "${revision.engineId}".`);
    if (revision.definitionSchemaVersion !== DEFINITION_SCHEMA_VERSION) {
        problems.push(`Definition schema ${revision.definitionSchemaVersion} is not supported.`);
    }
    if (revision.sessionSchemaVersion !== SESSION_SCHEMA_VERSION) {
        problems.push(`Session schema ${revision.sessionSchemaVersion} is not supported.`);
    }
    const expected = contentHash({
        compiledGame: stripVolatile(revision.compiledGame),
        engineRuntimeVersion: revision.engineRuntimeVersion,
        definitionSchemaVersion: revision.definitionSchemaVersion,
        compilerVersion: revision.compilerVersion,
        generationContractVersion: revision.generationContractVersion
    });
    if (expected !== revision.contentHash) problems.push('Content hash does not match the compiled game.');
    return { ok: problems.length === 0, problems };
}
