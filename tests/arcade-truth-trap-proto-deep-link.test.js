'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('arcade/truth-trap-proto/index.html', 'utf8');
const script = Array.from(html.matchAll(/<script>([\s\S]*?)<\/script>/g)).at(-1)[1];

function node() {
  const children = new Map();
  const events = new Map();
  return {
    hidden: false, disabled: false, style: {}, dataset: {}, textContent: '',
    classList: { add() {}, remove() {}, toggle() {} },
    querySelector(key) {
      if (!children.has(key)) children.set(key, node());
      return children.get(key);
    },
    addEventListener(key, handler) { events.set(key, handler); },
    click() { events.get('click')?.(); },
    setAttribute() {}, append() {}, replaceChildren() {}, focus() {}, scrollIntoView() {}
  };
}

async function boot(query, isOwner = true) {
  const root = node();
  const exhibits = ['A', 'B', 'C'].map(choice => Object.assign(node(), { dataset: { choice } }));
  const factCards = [node(), node(), node()];
  const document = {
    documentElement: node(),
    getElementById: id => root.querySelector('#' + id),
    querySelector: key => root.querySelector(key),
    querySelectorAll: key => key === '.tt-exhibit' ? exhibits : factCards,
    createElement: node, addEventListener() {}
  };
  const workspace = document.getElementById('owner-workspace');
  const cover = document.getElementById('opening');
  workspace.hidden = true;
  let resolveUser;
  const user = new Promise(resolve => { resolveUser = resolve; });
  const window = {
    location: new URL('https://atlas.example/arcade/truth-trap-proto/' + query),
    history: { state: null, replaceState(_, __, url) { window.location = new URL(url); } },
    AtlasCloud: { getUser: () => user },
    addEventListener() {}, setTimeout(callback) { callback(); }
  };
  vm.runInNewContext(script, { document, window, URL, URLSearchParams });
  assert.equal(workspace.hidden, true, 'Deep links must not expose the workspace before verification.');
  resolveUser({ id: 'user', email: isOwner ? 'savvy989@gmail.com' : 'other@example.com' });
  await new Promise(resolve => setImmediate(resolve));
  return { document, window, exhibits, factCards, workspace, cover };
}

(async () => {
  const direct = await boot('?case=4&keep=yes#test');
  assert.equal(direct.workspace.hidden, false);
  assert.equal(direct.cover.hidden, true);
  assert.equal(direct.document.querySelector('.tt-case-heading h1').textContent, 'Your Brain Is Bluffing');
  direct.exhibits[0].click();
  direct.document.getElementById('tt-accuse').click();
  direct.document.getElementById('tt-next-case').click();
  assert.equal(direct.window.location.searchParams.get('case'), '5');
  assert.equal(direct.window.location.searchParams.get('keep'), 'yes');
  assert.equal(direct.window.location.hash, '#test');

  const headings = new Set();
  for (let i = 1; i <= 20; i++) {
    const game = await boot('?case=' + i);
    assert.equal(game.workspace.hidden, false);
    const number = game.document.querySelector('.tt-case-number').textContent;
    assert.match(number, new RegExp('^Case ' + String(i).padStart(2, '0') + ' /'));
    assert.equal(number.includes('Review draft'), i > 5);
    const heading = game.document.querySelector('.tt-case-heading h1').textContent;
    assert.ok(heading && !headings.has(heading), 'Case headings must be non-empty and unique.');
    headings.add(heading);
    for (const exhibit of game.exhibits) assert.ok(exhibit.querySelector('.tt-exhibit-claim').textContent);
    const lies = game.factCards.filter(card => card.querySelector('.tt-fact-heading').textContent.endsWith('The Lie'));
    assert.equal(lies.length, 1, 'Every case must have exactly one lie.');
    for (const card of game.factCards) {
      assert.ok(card.querySelector('p').textContent);
      assert.equal(card.querySelector('.tt-fact-sources').textContent, i > 5 ? 'Source review pending' : '');
    }
    const lie = lies[0].querySelector('.tt-fact-heading').textContent[0];
    game.exhibits.find(exhibit => exhibit.dataset.choice === lie).click();
    game.document.getElementById('tt-accuse').click();
    assert.equal(game.document.getElementById('tt-result-title').textContent, 'Case cracked. You found the lie.');
    game.document.getElementById('tt-next-case').click();
    assert.equal(game.window.location.searchParams.get('case'), String(i === 20 ? 1 : i + 1));
  }

  const nonOwner = await boot('?case=4', false);
  assert.equal(nonOwner.workspace.hidden, true);
  assert.equal(nonOwner.document.getElementById('access-gate').hidden, false);

  for (const query of ['', '?case=21', '?case=999', '?case=4x', '?case=0']) {
    const normal = await boot(query);
    assert.equal(normal.cover.hidden, false);
    assert.equal(normal.workspace.hidden, true);
    assert.match(normal.document.querySelector('.tt-case-number').textContent, /Case 01/);
    normal.document.getElementById('btn-start').click();
    assert.equal(normal.workspace.hidden, false);
    assert.equal(normal.window.location.searchParams.get('case'), '1');
  }
  console.log('Truth Trap prototype: all 20 case links, single-lie reveals, review state, navigation and owner gate verified.');
})().catch(error => { console.error(error); process.exitCode = 1; });
