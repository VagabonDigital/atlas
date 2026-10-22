import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { boards } from '../content.mjs';
import * as engine from '../engine.mjs';

// Verify the actual app module with deterministic browser and AtlasBridge fakes.
const appSource = readFileSync(new URL('../app.mjs', import.meta.url), 'utf8')
  .replace(/^import[^\n]*\n/gm, '') +
  '\n;globalThis.testGame={start,submit,get state(){return state}};';

function fixture() {
  const registry = { sessionStates: {}, recentActivity: [] }, local = new Map();
  let active = 'learner-a';
  function launch() {
    const elements = new Map(), listeners = new Map();
    function node(key) {
      if (!elements.has(key)) {
        const events = new Map(), classes = new Set();
        elements.set(key, {
          innerHTML: '', textContent: '', hidden: false, disabled: false, dataset: {},
          style: { setProperty() {} },
          classList: {
            add(...xs) { xs.forEach(x => classes.add(x)); },
            remove(...xs) { xs.forEach(x => classes.delete(x)); },
            toggle(x, on) { if (on) classes.add(x); else classes.delete(x); }
          },
          addEventListener(type, fn) { events.set(type, [...events.get(type) || [], fn]); },
          emit(type, event) { for (const fn of events.get(type) || []) fn(event); },
          querySelector(selector) { return node(key + ' ' + selector); },
          focus() {}, setAttribute() {}, remove() {},
          getBoundingClientRect() { return { left: 0, top: 0 }; }
        });
      }
      return elements.get(key);
    }
    const bridge = {
      readActiveSession: () => ({ id: active, name: active === 'learner-a' ? 'Alice' : 'Bob' }),
      readRegistry: () => registry,
      upsertSessionState(session, id, state) {
        const entries = registry.sessionStates[session] ||= {};
        entries[id] = { ...entries[id], ...structuredClone(state), sessionId: session, registryId: id };
      },
      touchRecentActivity(activity) {
        registry.recentActivity = [activity, ...registry.recentActivity.filter(x =>
          x.sessionId !== activity.sessionId || x.registryId !== activity.registryId)];
      }
    };
    const context = {
      boards, ...engine,
      window: {
        AtlasBridge: bridge, AtlasAnalytics: { arcadeGameStart() {} },
        ArcadeGameChrome: { mountLanding() {}, mountGame() {} },
        AtlasSessionPanel: { mount() {} },
        addEventListener(event, fn) { listeners.set(event, [...listeners.get(event) || [], fn]); }
      },
      document: {
        querySelector: node, querySelectorAll: () => [],
        createElement: () => node('new'), documentElement: { style: { setProperty() {} } },
        body: { append() {} }
      },
      localStorage: {
        getItem: key => local.get(key) ?? null,
        setItem: (key, value) => local.set(key, String(value))
      },
      URL, location: { href: 'https://atlasfortutors.com/arcade/family-feud/index.html' },
      matchMedia: () => ({ matches: true }), performance: { now: () => Date.now() },
      setTimeout(fn) { fn(); return 1; }
    };
    runInNewContext(appSource, context, { filename: 'family-feud/app.mjs' });
    return {
      game: context.testGame,
      switchTo(session) {
        active = session;
        for (const fn of listeners.get('atlas:session-change') || []) fn();
      },
      click(action) {
        node('#dock').emit('click', { target: { closest: () => ({ dataset: { action } }) } });
      },
      answer(value) {
        node('#answer').emit('input', { target: { value } });
        return context.testGame.submit(false);
      }
    };
  }
  return { launch, state: session => registry.sessionStates[session]?.['arcade:family-feud'],
    recent: () => registry.recentActivity };
}

test('Family Feud snapshots restore across reload, remain learner-specific, and retire on completion', async () => {
  const f = fixture();
  let page = f.launch();
  assert.equal(page.game.state, null);
  await page.game.start();
  assert.equal(f.state('learner-a').status, 'in-progress');
  assert.equal(f.state('learner-a').progress.covered, 1);
  const firstBoard = page.game.state.boards[0].id;
  const concept = page.game.state.boards[0].concepts[0];
  await page.answer(concept.label);
  assert.equal(f.state('learner-a').familyFeud.scores.reduce((x, y) => x + y), concept.value);
  page = f.launch();
  assert.equal(page.game.state.boards[0].id, firstBoard);
  assert.equal(page.game.state.revealed[0].owner !== null, true);
  await page.game.submit(true);
  const strikes = page.game.state.strikes.reduce((x, y) => x + y);
  page = f.launch();
  assert.equal(page.game.state.strikes.reduce((x, y) => x + y), strikes);

  page.switchTo('learner-b');
  assert.equal(page.game.state, null);
  await page.game.start();
  assert.equal(f.state('learner-b').status, 'in-progress');
  page.switchTo('learner-a');
  assert.equal(page.game.state.boards[0].id, firstBoard);
  assert.equal(page.game.state.strikes.reduce((x, y) => x + y), strikes);

  const previous = structuredClone(f.state('learner-a').familyFeud);
  const pending = page.game.submit(true);
  page.switchTo('learner-b');
  await pending;
  assert.deepEqual(f.state('learner-a').familyFeud, previous);
  assert.equal(f.state('learner-b').familyFeud.round, 0);
  page.switchTo('learner-a');

  for (let round = 0; round < 3; round++) {
    while (page.game.state.phase === 'playing') await page.game.submit(true);
    assert.equal(page.game.state.phase, 'missed');
    page.click('reveal-all');
    assert.equal(f.state('learner-a').familyFeud.phase, 'roundEnd');
    page = f.launch();
    assert.equal(page.game.state.phase, 'roundEnd');
    page.click('next');
    if (round < 2) assert.equal(page.game.state.round, round + 1);
  }

  assert.equal(page.game.state.phase, 'final');
  assert.equal(f.state('learner-a').status, 'complete');
  assert.equal(f.state('learner-a').familyFeud, null);
  assert.ok(f.recent().some(item => item.sessionId === 'learner-a'));
  page = f.launch();
  assert.equal(page.game.state, null);
  await page.game.start();
  assert.equal(f.state('learner-a').status, 'in-progress');
});
