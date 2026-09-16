/* Engine One — replay, Undo and snapshot verification.

   The action log is the source of truth and the snapshot is a cache that must
   agree with it. Because the reducer is pure and the logs are small, replaying
   is cheap enough to do on every restore, which makes nondeterminism detectable
   rather than merely unlikely. */

import { createSession } from './state.js';
import { reduce } from './reducer.js';
import { undoBoundaryIndex } from './phases.js';

export function replay(game, revision, actionLog, opts = {}) {
    let session = createSession(revision, opts);
    for (const entry of actionLog) {
        const { at = null, ...action } = entry;
        const result = reduce(game, session, action, { at });
        if (!result.ok) {
            throw new Error(`Replay diverged at ${action.kind}: ${result.refusal.reason}`);
        }
        session = result.session;
    }
    return session;
}

/* Stable ordering so two sessions that mean the same thing serialise the same
   way regardless of the order keys happened to be written. */
function canonical(value) {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === 'object') {
        return Object.keys(value).sort().reduce((out, key) => {
            out[key] = canonical(value[key]);
            return out;
        }, {});
    }
    return value;
}

export function canonicalState(session) {
    return JSON.stringify(canonical({
        phase: session.phase,
        placements: session.placements,
        pinned: session.pinned,
        firedBeats: session.firedBeats,
        commitments: session.commitments,
        completion: session.completion
    }));
}

export function verifyReplay(game, revision, session) {
    const replayed = replay(game, revision, session.actionLog, { sessionId: session.sessionId });
    return canonicalState(replayed) === canonicalState(session);
}

export function canUndo(session) {
    return session.actionLog.length > undoBoundaryIndex(session.actionLog);
}

/* Undo drops the last action and rebuilds from the log, so an undone action
   leaves no trace anywhere. It can never reach back across a Commit or a
   Reveal, because those actions are themselves the boundary. */
export function undo(game, revision, session) {
    if (!canUndo(session)) return session;
    return replay(game, revision, session.actionLog.slice(0, -1), { sessionId: session.sessionId });
}
