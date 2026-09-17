/* Engine One — history projection for Then/Now.

   "Then" is the plan as it was set, in the world as it stood before the change
   that followed it. During revision that is the plan being revised; at Resolve it
   is the position the learner originally took, matching the Imprint.

   It cannot be read straight off a commitment snapshot, for two reasons. A Keep
   pin declared just after committing is not in the snapshot taken at commit. And
   when setting a revised plan fires an aftershock, the snapshot and the change
   happen in the same action, so the world "before the change" only exists
   between them. Replaying the action log recovers both exactly, without adding
   anything to canonical Session State or changing the reducer. */

import { createSession, cloneSession } from './state.js';
import { reduce } from './reducer.js';
import { derive } from './derive.js';

function canonicalPlacements(placements) {
    return JSON.stringify(Object.keys(placements).sort().map((key) => [key, placements[key]]));
}

function replayFailure(action, refusal) {
    return new Error(`deriveThen: the action log did not replay at ${action.kind}: ${refusal.reason}`);
}

export function thenSession(game, revision, session) {
    if (session.commitments.length === 0) return null;
    const target = session.phase === 'resolve' ? 0 : session.commitments.length - 1;

    let current = createSession(revision, { sessionId: session.sessionId });
    let then = null;
    let settling = false;

    for (const entry of session.actionLog) {
        const { at = null, ...action } = entry;
        const before = current;
        const result = reduce(game, current, action, { at });
        if (!result.ok) throw replayFailure(action, result.refusal);
        current = result.session;

        if (then === null) {
            if (current.commitments.length !== target + 1) continue;
            if (action.kind === 'setNewPlan') {
                /* The same action may have fired an aftershock; "then" is the
                   instant between the plan being set and that change landing. */
                then = {
                    ...cloneSession(current),
                    phase: 'commit',
                    firedBeats: before.firedBeats.map((f) => ({ ...f })),
                    completion: null
                };
                break;
            }
            then = cloneSession(current);
            settling = true;
            continue;
        }

        /* A Keep pin declared while the plan is being set belongs to the plan as
           set. Anything else ends that moment. */
        if (settling && current.phase === 'commit' && (action.kind === 'pin' || action.kind === 'unpin')) {
            then = cloneSession(current);
            continue;
        }
        break;
    }

    if (then === null) {
        throw new Error('deriveThen: the action log never produced the commitment it should contain');
    }
    const replayed = canonicalPlacements(then.commitments[target].placements);
    const recorded = canonicalPlacements(session.commitments[target].placements);
    if (replayed !== recorded) {
        throw new Error('deriveThen: replaying the log did not reproduce the recorded commitment');
    }
    return then;
}

/* The World View of "then". It carries no primary actions: the Beat Control
   always acts on "now". */
export function deriveThen(game, revision, session) {
    const then = thenSession(game, revision, session);
    if (then === null) return null;
    return { ...derive(game, then), primaryActions: [], then: true };
}
