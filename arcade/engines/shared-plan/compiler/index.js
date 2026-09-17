/* Engine One — the compiler.

   Owns trust. It does not render and it does not call models: content safety
   and Class C critique are separate steps in the stage plan precisely so this
   stays deterministic and testable offline.

   Draft in; Compiled Game plus diagnostics out. Nothing reaches the runtime
   without passing through here, including a reference Definition written by
   our best designer. */

import { DEFINITION_SCHEMA, checkShape, ENGINE_ID, DEFINITION_SCHEMA_VERSION } from '../definition/index.js';
import { solve, hasSolver, fitReport, collisionReport, voiceReport } from '../layout/index.js';
import { SESSION_SCHEMA_VERSION } from '../model/index.js';
import {
    ENGINE_RUNTIME_VERSION, COMPILER_VERSION, NO_GENERATION_CONTRACT, SUPPORTED_DEFINITION_SCHEMA_VERSIONS,
    runtimeSeries
} from '../identity.js';
import { makeSink } from './diagnostics.js';
import { normalise } from './normalise.js';
import { resolve } from './resolve.js';
import { validate } from './validate.js';
import { disclosureSchedule, tutorSafeProjection } from './disclosure.js';
import { contentHash } from './hash.js';

/* Versions and identity live in identity.js, so the runtime can declare them
   without loading the compiler. They are re-exported here unchanged. */
export {
    ENGINE_RUNTIME_VERSION, COMPILER_VERSION, NO_GENERATION_CONTRACT, SUPPORTED_DEFINITION_SCHEMA_VERSIONS,
    ENGINE_IDENTITY, runtimeSeries
} from '../identity.js';

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
    /* A working dense-Table fallback is a legible composition, only a less local
       one, so it is a warning. A world whose Voices leave no room for its Pieces
       is refused. Each note carries its own severity. */
    for (const note of voiceReport(game, layout)) report(note);

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

    /* Exactly the fields `GameRevision` declares in arcade/contracts, and no
       others. The session schema version is deliberately not among them: a
       revision is compiled content and contains no session, so which session
       format an engine speaks belongs to `EngineIdentity`. It is recorded in
       provenance, which is the contract's own place for free-form metadata. */
    return {
        revisionId: revisionIdFor(compiledGame, hash),
        engineId: ENGINE_ID,
        contentHash: hash,
        engineRuntimeVersion: ENGINE_RUNTIME_VERSION,
        definitionSchemaVersion: DEFINITION_SCHEMA_VERSION,
        compilerVersion: COMPILER_VERSION,
        generationContractVersion,
        compiledGame,
        provenance: {
            authoredBy: 'hand',
            compiledAt: null,
            frozenBySessionSchemaVersion: SESSION_SCHEMA_VERSION,
            ...provenance
        }
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

    /* Fail closed before play, with a clean message. A malformed revision must
       be refused here rather than throwing somewhere inside the hash. */
    if (!revision || typeof revision !== 'object') {
        return { ok: false, problems: ['Revision is not an object.'] };
    }
    const game = revision.compiledGame;
    if (!game || typeof game !== 'object' || !Array.isArray(game.beats) || !Array.isArray(game.places)) {
        return { ok: false, problems: ['Revision carries no usable Compiled Game.'] };
    }

    if (revision.engineId !== ENGINE_ID) problems.push(`Revision is for engine "${revision.engineId}".`);

    if (!SUPPORTED_DEFINITION_SCHEMA_VERSIONS.includes(revision.definitionSchemaVersion)) {
        problems.push(
            `Definition schema ${revision.definitionSchemaVersion} is not supported `
            + `(this build reads ${SUPPORTED_DEFINITION_SCHEMA_VERSIONS.join(', ')}).`
        );
    }

    /* The hash is computed from the revision's own recorded versions, so a
       revision built by an incompatible runtime hashes perfectly well against
       itself. Without this check it would mount and be interpreted by rules it
       was never compiled against. */
    if (runtimeSeries(revision.engineRuntimeVersion) !== runtimeSeries(ENGINE_RUNTIME_VERSION)) {
        problems.push(
            `Revision was compiled by engine runtime ${revision.engineRuntimeVersion}, `
            + `which this build (${ENGINE_RUNTIME_VERSION}) cannot interpret.`
        );
    }

    const expected = contentHash({
        compiledGame: stripVolatile(game),
        engineRuntimeVersion: revision.engineRuntimeVersion,
        definitionSchemaVersion: revision.definitionSchemaVersion,
        compilerVersion: revision.compilerVersion,
        generationContractVersion: revision.generationContractVersion
    });
    if (expected !== revision.contentHash) problems.push('Content hash does not match the compiled game.');
    return { ok: problems.length === 0, problems };
}
