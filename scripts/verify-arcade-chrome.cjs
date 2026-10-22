/* Chromium regression and screenshot pass. Run with Playwright available via
   NODE_PATH, CHROME_PATH pointing to Chromium, and ARCADE_SCREENSHOTS optional.
   Files are served through routing, so no running server/account is required.
   Forbidden Words uses its existing local-verification entry with API fixtures;
   Tomorrow/Would You Rather use their existing local entry hook. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = process.env.ARCADE_SCREENSHOTS;
const games = ['family-feud', 'millionaire', 'forbidden-words', 'truth-trap', 'tomorrow-got-weird', 'would-you-rather'];
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json' };

async function setup(browser, viewport, blockedStorage = false) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  await context.addInitScript(() => {
    window.audioContextCount = 0;
    const NativeAudioContext = window.AudioContext;
    window.AudioContext = class extends NativeAudioContext {
      constructor(...args) { super(...args); window.audioContextCount++; }
    };
  });
  if (blockedStorage) await context.addInitScript(() => {
    Storage.prototype.getItem = Storage.prototype.setItem = () => { throw new DOMException('Unavailable', 'SecurityError'); };
  });
  let phase = 'waiting';
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname !== 'atlas.local') return route.abort();
    if (url.pathname.startsWith('/forbidden-words/')) {
      const action = route.request().postDataJSON().action;
      if (action === 'start') phase = 'active';
      return route.fulfill({ json: { state: {
        phase, revision: 1, serverNow: Date.now(), deadline: Date.now() + 120000,
        connected: { tutor: true, learner: true }, actor: 'tutor', role: 'Describer',
        round: 1, turn: 1, score: 0, played: 0, remaining: 50, ready: [], review: [],
        invite: 'local', theme: 'light', card: { target: 'Umbrella', forbidden: ['Rain', 'Wet', 'Cover', 'Open', 'Weather'], nonce: 'local-card' }
      } } });
    }
    try {
      let file = path.join(root, decodeURIComponent(url.pathname));
      if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
      let body = await fs.readFile(file);
      if (url.pathname === '/arcade/forbidden-words/') body = Buffer.from(body.toString().replace('<head>', '<head><meta name="fw-api" content="/forbidden-words/"><meta name="fw-local-verification" content="true">'));
      await route.fulfill({ body, contentType: mime[path.extname(file)] || 'application/octet-stream' });
    } catch { await route.fulfill({ status: 404, body: '' }); }
  });
  return context;
}

async function capture(page, name) {
  if (output) await page.screenshot({ path: path.join(output, name + '.png'), fullPage: true });
}
async function start(page, game) {
  if (game === 'family-feud') await page.getByRole('button', { name: 'Start Match' }).click();
  else if (game === 'millionaire') await page.locator('#start').click();
  else if (game === 'forbidden-words') await page.locator('[data-action="start"]').click();
  else await page.evaluate(() => startGame({ skipPublicAccessGate: true }));
  await page.waitForTimeout(1700);
}
async function soundButton(page) {
  const button = page.getByRole('button', { name: 'Sound', exact: true });
  if (!await button.isVisible()) await page.getByRole('button', { name: 'More game controls' }).click();
  return button;
}
async function checkSound(page, game, blockedStorage) {
  let button = await soundButton(page);
  assert.equal(await button.getAttribute('aria-pressed'), 'false', game + ': default off');
  assert.equal(await page.evaluate(() => window.audioContextCount), 0, game + ': no audio initialized by default');
  await button.focus();
  if (game === 'forbidden-words') {
    await page.waitForTimeout(900);
    assert.equal(await button.evaluate(el => el === document.activeElement), true, 'polling preserves sound focus');
  }
  await button.press('Enter');
  button = await soundButton(page);
  assert.equal(await button.getAttribute('aria-pressed'), 'true');
  assert.equal(await button.innerText(), 'Sound on');
  assert.ok(await page.evaluate(() => window.audioContextCount > 0), game + ': enabling initializes audio');
  if (blockedStorage) return;
  await page.reload();
  button = await soundButton(page);
  assert.equal(await button.getAttribute('aria-pressed'), 'true', game + ': restore on');
  if (game === 'forbidden-words') {
    await page.getByRole('button', { name: 'How to play', exact: true }).click();
    assert.ok(await page.evaluate(() => window.audioContextCount > 0), 'restored preference unlocks audio on interaction');
    await page.keyboard.press('Escape');
    button = await soundButton(page);
  }
  await button.press('Space');
  button = await soundButton(page);
  assert.equal(await button.getAttribute('aria-pressed'), 'false');
  await page.reload();
  button = await soundButton(page);
  assert.equal(await button.getAttribute('aria-pressed'), 'false', game + ': restore off');
}

(async () => {
  if (output) await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });
  try {
    for (const width of (process.env.ARCADE_WIDTHS || '1440,390,320').split(',').map(Number)) {
      for (const game of (process.env.ARCADE_GAMES || games.join(',')).split(',')) {
        const context = await setup(browser, { width, height: width === 1440 ? 900 : 844 });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(`https://atlas.local/arcade/${game}/`);
        await page.locator('.arcade-game-chrome-session').waitFor();
        await capture(page, `${game}-cover-${width}`);
        if (width < 820) {
          await page.locator('.arcade-game-chrome-session-name').evaluate(el => { el.textContent = 'A learner with a very long session name'; });
          await capture(page, `${game}-long-session-${width}`);
          const back = await page.locator('.arcade-game-chrome-back').boundingBox();
          const session = await page.locator('.arcade-game-chrome-session').boundingBox();
          assert.ok(back.x + back.width <= session.x, game + ': navigation/session overlap');
          assert.ok(session.x + session.width <= width, game + ': session within viewport');
        }
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, game + ': cover overflow');
        const fixed = ['family-feud', 'millionaire'].includes(game);
        assert.equal(await page.locator('.arcade-game-chrome-appearance').count(), fixed ? 0 : 1);
        await page.locator('.arcade-game-chrome-session').click();
        assert.ok(await page.locator('#atlas-session-panel-root').innerText(), game + ': session opens');
        await page.keyboard.press('Escape');
        // Reload closes the session panel independently of its close animation.
        await page.reload();
        if (!fixed) {
          await page.locator('.arcade-game-chrome-appearance').click();
          await page.waitForTimeout(400);
          assert.equal(await page.locator('html').getAttribute('data-theme'), 'night');
          await capture(page, `${game}-cover-night-${width}`);
          await page.locator('.arcade-game-chrome-appearance').click();
        }
        await start(page, game);
        await capture(page, `${game}-game-${width}`);
        if (!fixed) {
          await page.evaluate(() => window.AtlasBridge.setAppearanceMode('night'));
          await page.waitForTimeout(400);
          await capture(page, `${game}-game-night-${width}`);
          await page.evaluate(() => window.AtlasBridge.setAppearanceMode('light'));
        }
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, game + ': gameplay overflow');
        if (games.indexOf(game) < 3) {
          await checkSound(page, game, false);
          if (game === 'forbidden-words' && width < 820) {
            await capture(page, `${game}-menu-${width}`);
            await page.keyboard.press('Escape');
            assert.equal(await page.locator('.arcade-game-chrome-game-menu-toggle').getAttribute('aria-expanded'), 'false');
          }
        } else assert.equal(await page.getByRole('button', { name: 'Sound', exact: true }).count(), 0);
        assert.deepEqual(errors, [], game + ': browser errors');
        await context.close();
        console.log(`PASS ${game} ${width}px: cover, session, appearance, gameplay, sound contract`);
      }
    }
    for (const game of games.slice(0, 3)) {
      const context = await setup(browser, { width: 1440, height: 900 }, true);
      const page = await context.newPage();
      await page.goto(`https://atlas.local/arcade/${game}/`);
      await start(page, game);
      await checkSound(page, game, true);
      await context.close();
      console.log(`PASS ${game}: unavailable storage`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
