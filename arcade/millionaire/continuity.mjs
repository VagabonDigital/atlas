const REGISTRY_ID = 'arcade:millionaire';
const empty = () => ({ version: 1, exposures: {}, tutorExposures: {}, events: [], results: [] });

// All identity and persistence belong to AtlasBridge. Millionaire adds only
// game fields to existing session states; no learner links or parallel IDs.
export function continuity(Bridge) {
  const read = id => ({ ...empty(), ...Bridge.readRegistry().sessionStates?.[id]?.[REGISTRY_ID]?.millionaire });
  const write = (id, data, extra = {}) => Bridge.upsertSessionState(id, REGISTRY_ID, {
    millionaire: data, ...extra
  });
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
    record(session, event) {
      const data = read(session.id);
      data.events = [...data.events, event].slice(-1000);
      if (event.type === 'exposure') {
        const previous = data.exposures[event.questionId];
        data.exposures[event.questionId] = { count: (previous?.count || 0) + 1, lastSeenAt: event.timestamp };
      }
      if (event.type === 'result') {
        data.results = [...data.results.filter(r => r.runId !== event.runId), event].slice(-100);
      }
      if (event.type === 'void-after-reveal') {
        data.results = data.results.filter(r => r.runId !== event.runId);
        data.events = data.events.map(e => e.runId === event.runId && e.questionId === event.questionId && ['result', 'reveal'].includes(e.type)
          ? { ...e, voided: true } : e);
      }
      const result = data.results.at(-1) || null;
      write(session.id, data, {
        status: event.type === 'result' ? 'played' : 'in-progress',
        progress: { covered: event.type === 'result' && event.outcome === 'top prize' ? 10 : Math.max(0, (event.rung || 1) - 1), total: 10, openEnded: true },
        lastResult: result ? { prize: result.prize, outcome: result.outcome, highest: result.highest } : null
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
