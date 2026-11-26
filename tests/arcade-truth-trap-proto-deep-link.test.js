'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('arcade/truth-trap-proto/index.html', 'utf8');
const modalThemeIndex = html.indexOf('shared/atlas-modal-theme.css');
const sessionPanelIndex = html.indexOf('shared/atlas-session-panel.css');
assert.ok(modalThemeIndex >= 0 && sessionPanelIndex > modalThemeIndex,
  'Truth Trap must load the shared modal theme before the Students panel styles (mobile and desktop).');
const script = Array.from(html.matchAll(/<script>([\s\S]*?)<\/script>/g)).at(-1)[1];
const gameChromeConfig = html.match(/ArcadeGameChrome\.mountGame\(\{([\s\S]*?)\}\);/);
assert.ok(gameChromeConfig, 'Prototype must mount the shared in-game chrome.');
assert.match(gameChromeConfig[1], /appearance: true/,
  'Day/night control remains available inside the game.');
assert.doesNotMatch(gameChromeConfig[1], /session:\s*true/,
  'Session changes belong on the cover, not the in-game header.');
assert.match(html, /ArcadeGameChrome\.mountLanding\(\{ root: '#opening' \}\)/,
  'The cover must retain the shared Students control.');


const canonicalHtml = fs.readFileSync('arcade/truth-trap/index.html', 'utf8');
const canonicalStart = canonicalHtml.indexOf('const CASES = [');
const canonicalEnd = canonicalHtml.indexOf('];', canonicalStart) + 2;
assert.ok(canonicalStart >= 0 && canonicalEnd > canonicalStart, 'Original case bank must exist.');
const canonicalCases = vm.runInNewContext('(' + canonicalHtml.slice(
  canonicalStart + 'const CASES = '.length, canonicalEnd
) + ')');
assert.equal(canonicalCases.length, 20, 'The original bank contains exactly 20 cases.');
assert.equal(canonicalCases.filter(record => record.wildcard).length, 1, 'The original has one all-true wildcard.');


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
  assert.equal(direct.document.querySelector('.tt-case-heading h1').textContent, 'Reality Needs Better Writing');
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
    assert.equal(number.includes('Review draft'), false);
    const original = canonicalCases[i - 1];
    for (const card of game.factCards) {
      const links = card.querySelector('.tt-fact-sources');
      assert.notEqual(links.textContent, 'Source review pending',
        'Internal source-review placeholders must never appear to players.');
    }

    const heading = game.document.querySelector('.tt-case-heading h1').textContent;
    assert.equal(heading, original.title, 'The original case order and titles must remain unchanged.');
    assert.ok(!headings.has(heading), 'Case headings must be unique.');
    headings.add(heading);
    assert.equal(game.document.querySelector('.tt-discuss p:last-child').textContent, original.discussion,
      'Original discussion text must be preserved.');
    for (const [index, letter] of ['A', 'B', 'C'].entries()) {
      assert.equal(game.exhibits[index].querySelector('.tt-exhibit-claim').textContent, original[letter].text,
        'Original claims must be preserved exactly, in their original A/B/C positions.');
      const expectedInfo = original[letter].info
        .replace(/^<strong>[^<]*<\/strong>\s*/, '')
        .replace(/<[^>]+>/g, '');
      assert.equal(game.factCards[index].querySelector('p').textContent, expectedInfo,
        'Original factual explanations must be preserved apart from markup and redundant verdict labels.');
      const expectedVerdict = original.wildcard || letter !== original.lie ? 'True' : 'The Lie';
      assert.equal(game.factCards[index].querySelector('.tt-fact-heading').textContent,
        letter + ' / ' + expectedVerdict, 'Original lie positions and wildcard semantics must be preserved.');
    }
    const lies = game.factCards.filter(card => card.querySelector('.tt-fact-heading').textContent.endsWith('The Lie'));
    assert.equal(lies.length, original.wildcard ? 0 : 1,
      'Only the original wildcard may have zero lies.');
    const pick = original.wildcard ? 'A' : original.lie;
    game.exhibits.find(exhibit => exhibit.dataset.choice === pick).click();
    game.document.getElementById('tt-accuse').click();
    assert.equal(game.document.getElementById('tt-result-title').textContent,
      original.wildcard ? 'Plot twist. All three were true.' : 'Case cracked. You found the lie.');
    game.document.getElementById('tt-next-case').click();
    assert.equal(game.window.location.searchParams.get('case'), String(i === 20 ? 1 : i + 1));
  }

  const venus = await boot('?case=1');
  assert.match(venus.exhibits[0].querySelector('.tt-art-image').style.backgroundImage, /case-06-a-earth-from-moon\.webp/,
    'Venus artwork must follow its original case.');
  const humans = await boot('?case=9');
  assert.match(humans.exhibits[2].querySelector('.tt-art-image').style.backgroundImage, /case-11-c-bone\.webp/,
    'The bone illustration belongs with the original human-body case.');
  const natureWildcard = await boot('?case=7');
  assert.equal(natureWildcard.exhibits[2].querySelector('.tt-art-placeholder').hidden, true,
    'The original octopus illustration must follow its all-true claim.');
  const unmatched = await boot('?case=15');
  assert.equal(unmatched.exhibits[0].querySelector('.tt-art-placeholder').hidden, false,
    'Unillustrated original claims must not inherit unrelated artwork.');

  const citedCase = await boot('?case=2');
  assert.ok(citedCase.factCards[1].querySelector('.tt-fact-sources').textContent === '',
    'Cited exhibits should not contain source-review placeholder text.');
  const noCitationCase = await boot('?case=1');
  for (const card of noCitationCase.factCards) {
    assert.equal(card.querySelector('.tt-fact-sources').textContent, '',
      'Uncited exhibits should have an empty source area.');
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
  console.log('Truth Trap prototype: canonical 20-case order, exact wording, evidence, discussions, original lie positions and wildcard, navigation, artwork and owner gate verified.');
})().catch(error => { console.error(error); process.exitCode = 1; });
