/* Engine One — identity and versions.

   What this build is, which content it can interpret, and the version stamps a
   Game Revision records. It lives apart from the compiler so the runtime can
   declare its identity without loading the compiler. */

import { ENGINE_ID, DEFINITION_SCHEMA_VERSION } from './definition/index.js';
import { SESSION_SCHEMA_VERSION } from './model/index.js';

export const ENGINE_RUNTIME_VERSION = '0.1.0';

/* 0.1.0  B1.
   0.1.1  B1.1 compiled output: raised-capacity sockets, composition v1 and
          Voice placement.
   0.2.0  Reads Definition schema 1 only, and refuses a world whose Voices
          cannot keep the minimum socket geometry. */
export const COMPILER_VERSION = '0.2.0';

/* Hand-authored Drafts have no Generation Contract. B3 introduces v0. */
export const NO_GENERATION_CONTRACT = 'none';

/* Which Definition schema versions this build can interpret. The contract makes
   this a list rather than a single value because an engine is expected to keep
   reading older content across runtime releases.

   Schema 0 is not on it. Schema 0 let a Voice anchor to a Piece, which no Stage
   can place, and nothing compiled from it carries the layout the Stage reads.
   It was never released, so no content outside this repository is stranded. */
export const SUPPORTED_DEFINITION_SCHEMA_VERSIONS = Object.freeze([DEFINITION_SCHEMA_VERSION]);

/* The shape `EngineIdentity` in arcade/contracts declares. The session schema
   version belongs here — to the engine, which is what speaks it — and not on a
   Game Revision, which is compiled content and has no session in it. */
export const ENGINE_IDENTITY = Object.freeze({
    engineId: ENGINE_ID,
    runtimeVersion: ENGINE_RUNTIME_VERSION,
    supportedDefinitionSchemaVersions: SUPPORTED_DEFINITION_SCHEMA_VERSIONS,
    sessionSchemaVersion: SESSION_SCHEMA_VERSION
});

/* Runtime compatibility is decided per release series, not per patch.
   Refusing a revision because the runtime moved from 0.1.0 to 0.1.1 would
   invalidate every saved game on every bugfix; accepting one across a breaking
   change would mount content this build interprets differently from the
   compiler that produced it. While the major version is 0 the minor position is
   the breaking one, which is the usual reading of a 0.x version. */
export function runtimeSeries(version) {
    const [major = '0', minor = '0'] = String(version).split('.');
    return major === '0' ? `0.${minor}` : major;
}
