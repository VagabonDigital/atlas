/* Engine One — the model.

   Owns reality: actions, the phase machine, the reducer, predicates, effects,
   the Undo boundary, derivation of the World View and replay.

   It imports nothing but the Definition module. No DOM, no time, no randomness,
   no network, no persistence, no layout geometry. */

export { SESSION_PHASES, isEditable, isTerminal, undoBoundaryIndex } from './phases.js';
export {
    SESSION_SCHEMA_VERSION,
    THRESHOLD,
    MARGIN,
    atPlace,
    createSession,
    cloneSession,
    buildContext,
    bornPieces,
    comparatorHolds
} from './state.js';
export { evaluate, predicateDepth, predicateTouches, predicateTouchesPin } from './predicates.js';
export { baseWorld, deriveWorld, variantOf } from './effects.js';
export { seams, overCapacityPlaces, activeRules, subjectPieces, seamParticipants } from './rules.js';
export { locusId, variantTouches } from './touches.js';
export { thenSession, deriveThen } from './history.js';
export { ACTION_KINDS, Actions, checkAction, freeSocket, nextBeat, selectVariant } from './actions.js';
export { reduce, apply } from './reducer.js';
export {
    DEFAULT_NODE_BUDGET,
    syntheticSession,
    enumerateArrangements,
    sampleArrangements,
    commitEvidence,
    arrangementSignature,
    firstValidCommit,
    variantForCommit,
    frozenAfterBeat,
    familySignature,
    enumerateRevisions
} from './enumerate.js';
export { derive } from './derive.js';
export { replay, canonicalState, verifyReplay, canUndo, undo } from './replay.js';
