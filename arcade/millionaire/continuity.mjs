const REGISTRY_ID = 'arcade:millionaire';
const empty = () => ({ version: 2, exposures: {}, tutorExposures: {}, events: [], results: [], activeRun: null });

// All identity and persistence belong to AtlasBridge. Millionaire adds only
// game fields to existing session states; no learner links or parallel IDs.
export function continuity(Bridge) {
  const readState = id => Bridge.readRegistry().sessionStates?.[id]?.[REGISTRY_ID] || {};
  const read = id => ({ ...empty(), ...readState(id).millionaire });
  const write = (id, data, extra = {}) => Bridge.upsertSessionState(id, REGISTRY_ID, {
    millionaire: data, ...extra
  });
  const runLabel = rung => `Question ${Math.max(1, Math.min(10, Number(rung) || 1))} of 10`;
  const runTitle = rung => `Millionaire · ${runLabel(rung)}`;
  const runProgress = rung => ({ covered: Math.max(1, Math.min(10, Number(rung) || 1)), total: 10, openEnded: false });

  return {
    context() { return Bridge.readActiveSession(); },
    register() {
      Bridge.upsertItem({ registryId: REGISTRY_ID, world: 'arcade', type: 'game', title: 'Millionaire',
        premise: 'Ten questions. Three lifelines. How far can you go?', status: 'available',
        total: 10, unitLabel: 'questions', launchUrl: new URL('./index.html', location.href).href });
    },
    seen(id) {
      const registry = Bridge.readRegistry();
      const tutor = read(Bridge.defaultSessionId).tutorExposures;
      // Existing learner states also cover tutor exposure predating the tutor index.
      return [...new Set([...Object.keys(tutor), ...Object.keys(read(id).exposures),
        ...Object.values(registry.sessionStates || {}).flatMap(states => Object.keys(states[REGISTRY_ID]?.millionaire?.exposures || {}))])];
    },
    activeRun(id) {
      return read(id).activeRun || null;
    },
    saveRun(id, snapshot, view) {
      if (!id || !snapshot || !view) return;
      const data = read(id);
      data.activeRun = snapshot;
      write(id, data, {
        title: runTitle(view.rung),
        status: 'in-progress',
        progress: runProgress(view.rung),
        currentLabel: runLabel(view.rung),
        lastTouchedAt: Date.now()
      });
    },
    clearRun(id) {
      if (!id) return;
      const state = readState(id);
      const data = read(id);
      data.activeRun = null;
      const complete = String(state.status || '').toLowerCase() === 'complete';
      write(id, data, complete ? {
        title: 'Millionaire',
        status: 'complete',
        currentLabel: null,
        lastTouchedAt: Date.now()
      } : {
        title: 'Millionaire',
        status: 'available',
        progress: { covered: 0, total: 10, openEnded: false },
        currentLabel: null,
        lastTouchedAt: Date.now()
      });
    },
    record(session, event) {
      const data = read(session.id);
      data.events = [...data.events, event].slice(-1000);
      if (event.type === 'exposure') {
        const previous = data.exposures[event.questionId];
        data.exposures[event.questionId] = { count: (previous?.count || 0) + 1, lastSeenAt: event.timestamp };
      }
      if (event.type === 'result') {
        data.results = [...data.results.filter(r => r.runId !== event.runId), event].slice(-100);
        data.activeRun = null;
      }
      if (event.type === 'void-after-reveal') {
        data.results = data.results.filter(r => r.runId !== event.runId);
        data.events = data.events.map(e => e.runId === event.runId && e.questionId === event.questionId && ['result', 'reveal'].includes(e.type)
          ? { ...e, voided: true } : e);
      }
      const result = data.results.at(-1) || null;
      const finished = event.type === 'result';
      write(session.id, data, {
        title: finished ? 'Millionaire' : runTitle(event.rung),
        status: finished ? 'complete' : 'in-progress',
        progress: finished
          ? { covered: 10, total: 10, openEnded: false }
          : runProgress(event.rung),
        currentLabel: finished ? null : runLabel(event.rung),
        lastResult: result ? { prize: result.prize, outcome: result.outcome, highest: result.highest } : null,
        lastTouchedAt: Date.now()
      });
      if (event.type === 'exposure') {
        const tutor = read(Bridge.defaultSessionId);
        const previous = tutor.tutorExposures[event.questionId];
        tutor.tutorExposures[event.questionId] = { count: (previous?.count || 0) + 1, lastSeenAt: event.timestamp };
        write(Bridge.defaultSessionId, tutor);
      }
      if (['start', 'result'].includes(event.type)) Bridge.touchRecentActivity({
        sessionId: session.id, registryId: REGISTRY_ID, world: 'arcade', type: 'game',
        title: 'Millionaire', action: event.type === 'result' ? 'played' : 'opened',
        launchUrl: new URL('./index.html', location.href).href
      });
    }
  };
}
