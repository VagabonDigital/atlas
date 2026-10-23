import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { boards,legacyBoards } from '../content.mjs';
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
          innerHTML: '', textContent: '', hidden: false, disabled: false, open: false, dataset: {},
          showModal() { this.open = true; }, close() { this.open = false; },
          style: { setProperty() {} },
          classList: {
            add(...xs) { xs.forEach(x => classes.add(x)); },
            remove(...xs) { xs.forEach(x => classes.delete(x)); },
            toggle(x, on) { if (on) classes.add(x); else classes.delete(x); }
          },
          addEventListener(type, fn) { events.set(type, [...events.get(type) || [], fn]); },
          emit(type, event) { for (const fn of events.get(type) || []) fn(event); },
          querySelector(selector) { return node(key + ' ' + selector); },
          append(child) { child.parentElement = this; },
          focus() {}, setAttribute(name, value) { this[name] = value; }, remove() {},
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
      boards, legacyBoards, ...engine,
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
      sound: () => node('#sound'),
      toggleSound: () => node('#sound').emit('click'),
      newMatch: () => node('#new-match').emit('click'),
      cancelNewMatch: () => node('#cancel-new-match').emit('click'),
      confirmNewMatch: () => node('#confirm-new-match').emit('click'),
      newMatchDialogOpen: () => node('#new-match-dialog').open,
      newMatchVisible: () => !node('#new-match').hidden,
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
  return {
    launch,
    state: session => registry.sessionStates[session]?.['arcade:family-feud'],
    recent: () => registry.recentActivity,
    seen: () => JSON.parse(local.get('atlas:family-feud:seen') || '[]'),
    seedLegacyMatch(session='learner-a') {
      registry.sessionStates[session] = { 'arcade:family-feud': {
        status: 'in-progress',
        familyFeud: {
          version: 1,boardIds:legacyBoards.slice(0,3).map(b=>b.id),
          round:0,starter:0,active:0,scores:[0,0],contribution:[0,0],
          strikes:[0,0],revealed:Array(6).fill(null),phase:'playing',
          names:['Player 1','Alice']
        }
      }};
    }
  };
}

test('sound defaults off and remembers enabled and disabled choices across reloads', () => {
  const f = fixture();
  let app = f.launch();
  assert.equal(app.sound()['aria-pressed'], 'false');
  app.toggleSound();
  app = f.launch();
  assert.equal(app.sound()['aria-pressed'], 'true');
  assert.equal(app.sound()['aria-label'], 'Sound');
  app.toggleSound();
  assert.equal(f.launch().sound()['aria-pressed'], 'false');
});

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
    await new Promise(resolve => setImmediate(resolve)); // Let the round-opening animation finish.
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


test('a newly started match uses only sourced Season 26 boards',async()=>{
  const f=fixture(),page=f.launch();
  await page.game.start();
  assert.equal(page.game.state.boards.length,3);
  assert.equal(page.game.state.boards.every(b=>b.kind==='season26'),true);
});

test('previously saved illustrative matches still restore and continue',async()=>{
  const f=fixture();f.seedLegacyMatch();
  const page=f.launch();
  assert.equal(page.game.state.boards.map(b=>b.id).join(','),legacyBoards.slice(0,3).map(b=>b.id).join(','));
  await page.answer('house keys');
  assert.equal(f.state('learner-a').familyFeud.scores.reduce((a,b)=>a+b,0),34);
  assert.equal(f.state('learner-a').familyFeud.revealed[0].owner,0);
});


test('New Match requires confirmation and preserves seen boards and other learner snapshots', async () => {
  const f = fixture();
  const page = f.launch();
  await page.game.start();
  const openingBoard = page.game.state.boards[0].id;
  const answer = page.game.state.boards[0].concepts[0].label;
  await page.answer(answer);
  const original = structuredClone(f.state('learner-a').familyFeud);
  const recorded = f.seen();
  assert.equal(page.newMatchVisible(), true);

  page.newMatch();
  assert.equal(page.newMatchDialogOpen(), true);
  page.cancelNewMatch();
  assert.equal(page.newMatchDialogOpen(), false);
  assert.deepEqual(f.state('learner-a').familyFeud, original);

  page.switchTo('learner-b');
  await page.game.start();
  const untouched = structuredClone(f.state('learner-b').familyFeud);
  page.switchTo('learner-a');
  assert.equal(page.game.state.boards[0].id, openingBoard);

  page.newMatch();
  page.confirmNewMatch();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(page.newMatchDialogOpen(), false);
  assert.equal(page.game.state.round, 0);
  assert.equal(page.game.state.phase, 'playing');
  assert.deepEqual(page.game.state.scores, [0, 0]);
  assert.deepEqual(page.game.state.revealed, Array(6).fill(null));
  assert.equal(f.state('learner-a').status, 'in-progress');
  assert.equal(f.state('learner-a').familyFeud.round, 0);
  assert.ok(f.seen().includes(openingBoard));
  assert.ok(recorded.every(id => f.seen().includes(id)));
  assert.deepEqual(f.state('learner-b').familyFeud, untouched);
});

test('New Match confirmation cannot replace another learner after a session switch', async () => {
  const f = fixture(), page = f.launch();
  await page.game.start();
  page.newMatch();
  assert.equal(page.newMatchDialogOpen(), true);
  page.switchTo('learner-b');
  assert.equal(page.newMatchDialogOpen(), false);
  page.confirmNewMatch();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(page.game.state, null);
  assert.equal(f.state('learner-b'), undefined);
  assert.equal(f.state('learner-a').status, 'in-progress');
});
