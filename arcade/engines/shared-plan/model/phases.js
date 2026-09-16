/* Engine One — the phase machine.

   The contract names six phases (Plan, Commit, Perturb, React, Revise,
   Resolve). Only five of them are canonical session states.

   `perturb` is the world changing: the instant `bringChange` is taken. It has
   no Beat Control of its own and no state in which the session can rest, so
   storing it would mean the canonical phase depended on how long a choreography
   had been running. It stays a contract-level phase key — tutor prompts and the
   disclosure ladder use it — while `bringChange` lands the session directly in
   `react`, the frozen, inspectable state the V1 reaction beat is actually about.

   Editability is the load-bearing distinction: the plan is editable in `plan`
   and `revise`, and frozen everywhere else. */

export const SESSION_PHASES = Object.freeze(['plan', 'commit', 'react', 'revise', 'resolve']);

const EDITABLE = Object.freeze(new Set(['plan', 'revise']));

export function isEditable(phase) {
    return EDITABLE.has(phase);
}

export function isTerminal(phase) {
    return phase === 'resolve';
}

/* Which phase each transition action leads to. `setNewPlan` is conditional on an
   unfired aftershock beat, so it is resolved by the reducer rather than here. */
export const PHASE_TRANSITIONS = Object.freeze({
    commitPlan: Object.freeze({ from: Object.freeze(['plan']), to: 'commit' }),
    bringChange: Object.freeze({ from: Object.freeze(['commit']), to: 'react' }),
    openRevision: Object.freeze({ from: Object.freeze(['react']), to: 'revise' }),
    setNewPlan: Object.freeze({ from: Object.freeze(['revise']), to: 'resolve' }),
    resolveNow: Object.freeze({ from: Object.freeze(['commit', 'react', 'revise']), to: 'resolve' })
});

/* Undo may never cross a Commit or a Reveal. Both are recorded as actions, so
   the boundary is simply the position after the most recent one. */
export const UNDO_BOUNDARY_ACTIONS = Object.freeze(new Set(['commitPlan', 'bringChange', 'setNewPlan']));

export function undoBoundaryIndex(actionLog) {
    for (let i = actionLog.length - 1; i >= 0; i -= 1) {
        if (UNDO_BOUNDARY_ACTIONS.has(actionLog[i].kind)) return i + 1;
    }
    return 0;
}
