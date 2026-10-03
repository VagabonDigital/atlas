import test from 'node:test';
import assert from 'node:assert/strict';
import { Millionaire, PRIZES, band } from '../game.mjs';
import { QUESTIONS } from '../questions.mjs';
import { continuity } from '../continuity.mjs';
const create = options => { const g = new Millionaire(QUESTIONS, { random: () => .37, ...options }); assert.ok(g.start()); return g; };
const correct = g => { g.select(g.state.question.answer); g.lock(); g.reveal(); };
const reach = (g, n) => { while (g.state.rung < n) { correct(g); assert.ok(g.continue()); } };

test('40 complete verified seed units, four per rung, with unique options and IDs', () => {
  assert.equal(QUESTIONS.length, 40); assert.equal(new Set(QUESTIONS.map(q => q.id)).size, 40);
  for (let rung = 1; rung <= 10; rung++) assert.equal(QUESTIONS.filter(q => q.rung === rung).length, 4);
  for (const q of QUESTIONS) { assert.equal(new Set(q.options).size, 4); assert.ok(q.options[q.answer]); assert.ok(q.evidence && q.explanation && q.reviewedAt && q.family); assert.equal(q.difficulty.band, band(q.rung)); }
});
test('complete ten-question run, exact awards, safety levels, no early answer exposure', () => {
  const g = create();
  for (let rung = 1; rung <= 10; rung++) {
    const view = g.publicView(); assert.equal(view.answer, undefined); assert.equal(view.explanation, undefined); assert.equal(view.question.answer, undefined); assert.equal(view.question.evidence, undefined);
    correct(g); assert.equal(g.state.earned, PRIZES[rung - 1]); assert.equal(g.state.secured, rung >= 7 ? 125000 : rung >= 3 ? 8000 : 0);
    if (rung < 10) assert.ok(g.continue());
  }
  assert.equal(g.state.phase, 'win'); assert.equal(g.state.prize, 1000000); assert.ok(g.summary()); assert.equal(g.sessionSeen.size, 10);
});
test('wrong answer ends the run at the last cleared safety level', () => {
  for (const [rung, prize] of [[1,0],[3,0],[4,8000],[7,8000],[8,125000],[10,125000]]) {
    const g = create(); reach(g, rung); g.select((g.state.question.answer+1)%4); g.lock(); g.reveal(); assert.equal(g.state.prize, prize); assert.equal(g.state.phase, 'incorrect'); assert.equal(g.continue(), false);
  }
});
test('selection is reversible; commitment blocks consequential actions until Host reveal', () => {
  const g = create(); reach(g, 4); g.select(0); g.select(1); assert.equal(g.state.selected, 1); g.lock();
  assert.equal(g.select(2), false); assert.equal(g.walk(), false); for (const key of ['narrow','host','new']) assert.equal(g.lifeline(key), false);
  assert.equal(g.publicView().answer, undefined); assert.equal(g.state.phase, 'locked'); assert.ok(g.reveal()); assert.equal(g.reveal(), false);
});
test('all three lifelines combine, preserve correct option, never repeat discarded questions', () => {
  const g = create(); g.select(0); assert.ok(g.lifeline('narrow')); assert.equal(g.state.hidden.length, 2); assert.ok(!g.state.hidden.includes(g.state.question.answer));
  const pick = [0,1,2,3].find(i => !g.state.hidden.includes(i)); assert.ok(g.lifeline('host')); assert.ok(g.advise(pick,'Fairly sure'));
  const previous = g.state.question.id; assert.ok(g.lifeline('new')); assert.notEqual(g.state.question.id, previous); assert.equal(band(g.state.question.rung), 'opening');
  for (const key of ['narrow','host','new']) assert.equal(g.lifeline(key), false);
});
test('walk-away eligibility, cancellation and hypothetical reveal keep the banked result fixed', () => {
  const g = create(); assert.equal(g.walk(),false); reach(g,5); g.select(1); g.walk(); g.cancelWalk(); assert.equal(g.state.selected,1);
  g.walk(); g.walk(true); assert.equal(g.state.prize,16000); g.select((g.state.question.answer+1)%4); g.reveal(); assert.equal(g.state.prize,16000); assert.equal(g.state.outcome,'walked away'); assert.equal(g.replace('factual-error','error'),false); g.summary();
});
test('factual void restores pre-question funds and lifelines, including after summary; recognition is free', () => {
  const events=[]; const g=create({onEvent:e=>events.push(e)}); reach(g,7); const before=g.state.question.id;
  g.lifeline('narrow'); g.select(g.state.question.answer); g.lock(); g.reveal(); assert.equal(g.state.secured,125000);
  assert.equal(g.replace('wording'),false); assert.equal(g.replace('factual-error',''),false); assert.ok(g.replace('factual-error','Key contradicted by source'));
  assert.equal(g.state.secured,8000); assert.equal(g.state.earned,64000); assert.equal(g.state.lifelines.narrow,false); assert.notEqual(g.state.question.id,before);
  g.select((g.state.question.answer+1)%4); g.lock(); g.reveal(); g.summary(); assert.ok(g.replace('factual-error','Source correction')); assert.equal(g.state.phase,'question');
  assert.ok(g.replace('recognition')); assert.equal(g.state.lifelines.new,false); assert.ok(events.some(e=>e.type==='recognition')); assert.ok(events.some(e=>e.type==='void-after-reveal'));
});
test('fresh replay and exhaustion preserve content integrity', () => {
  const g=create(); reach(g,10); correct(g); g.summary(); const seen=[...g.sessionSeen];
  const replay=create({sessionSeen:seen,seen}); assert.ok(!seen.includes(replay.state.question.id));
  const exhausted=new Millionaire(QUESTIONS,{sessionSeen:QUESTIONS.map(q=>q.id)}); assert.equal(exhausted.start(),false);
  const noNew=create(); QUESTIONS.filter(q=>band(q.rung)==='opening').forEach(q=>noNew.sessionSeen.add(q.id));
  const previous=noNew.state.question.id; assert.equal(noNew.lifeline('new'),false); assert.equal(noNew.state.lifelines.new,false); assert.equal(noNew.state.question.id,previous);
});

test('unseen questions in the band take priority over previously exposed exact-rung questions', () => {
  const seen = QUESTIONS.filter(q => q.rung === 1).map(q => q.id);
  const g = create({ seen });
  assert.ok(!seen.includes(g.state.question.id));
  assert.equal(band(g.state.question.rung), 'opening');
});

test('Atlas continuity records both exposure scopes and removes a voided result', () => {
  const registry = { sessionStates: {} };
  const bridge = {
    defaultSessionId: 'shared', readRegistry: () => structuredClone(registry),
    upsertSessionState(id, key, value) {
      registry.sessionStates[id] ||= {};
      registry.sessionStates[id][key] = { ...registry.sessionStates[id][key], ...structuredClone(value) };
    }, touchRecentActivity() {}
  };
  const store = continuity(bridge);
  const session = { id: 'learner' };
  const event = { runId: 'run', questionId: QUESTIONS[0].id, rung: 1, timestamp: 1 };
  store.record(session, { ...event, type: 'exposure' });
  assert.equal(registry.sessionStates.learner['arcade:millionaire'].millionaire.exposures[event.questionId].count, 1);
  assert.equal(registry.sessionStates.shared['arcade:millionaire'].millionaire.tutorExposures[event.questionId].count, 1);
  assert.ok(store.seen('another-learner').includes(event.questionId));
  // URL creation in recent activity uses the browser location; supply that boundary here.
  const previousLocation = globalThis.location;
  globalThis.location = { href: 'http://localhost/arcade/millionaire/index.html' };
  try {
    store.record(session, { ...event, type: 'result', prize: 0, outcome: 'wrong answer', highest: 1 });
    store.record(session, { ...event, type: 'void-after-reveal', note: 'Incorrect key' });
    const state = registry.sessionStates.learner['arcade:millionaire'];
    assert.equal(state.lastResult, null);
    assert.equal(state.millionaire.results.length, 0);
    assert.equal(state.millionaire.events.find(e => e.type === 'result').voided, true);
    assert.ok(store.seen(session.id).includes(event.questionId));
  } finally { if (previousLocation === undefined) delete globalThis.location; else globalThis.location = previousLocation; }
});
