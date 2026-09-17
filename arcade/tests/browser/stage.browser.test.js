/* B2 — the Stage in a real browser.

   Everything up to the MarkSet is pure and tested in Node. This is the rest of
   the pipeline: a frozen revision fetched over HTTP, verified, mounted through
   the Runtime Face, and drawn. It also captures the frame, so the first thing a
   human judges is the thing the engine actually produced.

     npm run test:browser
*/

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright';

import { startServer } from '../../dev/serve.js';

const here = dirname(fileURLToPath(import.meta.url));
const shots = join(here, '..', '..', 'test-results');

async function withPage(params, body) {
    await mkdir(shots, { recursive: true });
    const server = await startServer({ port: 0, liveReload: false });
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const problems = [];
    page.on('console', (message) => {
        if (message.type() === 'error') problems.push(message.text());
    });
    page.on('pageerror', (error) => problems.push(error.message));
    try {
        await page.goto(`${server.home}?${new URLSearchParams(params)}`, { waitUntil: 'load' });
        await body(page, problems);
    } finally {
        await browser.close();
        await server.close();
    }
}

const countOf = (page, type) => page.locator(`[data-mark-type="${type}"]`).count();

test('R-A opens as a Table world in Plan, through the Runtime Face', async () => {
    await withPage({ revision: 'r-a', frame: 'start', appearance: 'light' }, async (page, problems) => {
        const stage = page.locator('.sp-stage[data-ready="true"]');
        await stage.waitFor({ timeout: 15000 });

        assert.deepEqual(problems, [], 'the page reported errors');
        assert.equal(await page.locator('#error').isVisible(), false, 'the workbench showed a refusal');

        /* The world: three tables, eight seats, six people waiting, three Voices,
           two Goals on the Horizon and the Omen at its edge. */
        assert.equal(await countOf(page, 'place'), 3);
        assert.equal(await countOf(page, 'socket'), 8);
        assert.equal(await countOf(page, 'piece'), 6);
        assert.equal(await countOf(page, 'voice'), 3);
        assert.equal(await countOf(page, 'goal'), 2);
        assert.equal(await countOf(page, 'omen'), 1);
        assert.equal(await countOf(page, 'threshold'), 1);
        assert.equal(await countOf(page, 'margin'), 1);

        /* Names are real text, not pictures of text. */
        const names = await page.locator('.sp-place__name').allTextContents();
        assert.equal(names.length, 3);
        for (const name of names) assert.ok(name.trim().length > 0);

        /* The world is one composed 16:9 canvas that fills its host. */
        const frame = await page.locator('.sp-stage__frame').boundingBox();
        assert.ok(Math.abs(frame.width / frame.height - 16 / 9) < 0.01, 'the Stage is not 16:9');

        /* Nothing the Stage draws may spill outside the canvas. */
        const overflow = await page.evaluate(() => {
            const frameBox = document.querySelector('.sp-stage__frame').getBoundingClientRect();
            return [...document.querySelectorAll('.sp-text')]
                .filter((node) => {
                    const box = node.getBoundingClientRect();
                    return box.left < frameBox.left - 1 || box.top < frameBox.top - 1
                        || box.right > frameBox.right + 1 || box.bottom > frameBox.bottom + 1;
                })
                .map((node) => node.textContent);
        });
        assert.deepEqual(overflow, [], 'text left the Stage');

        await page.locator('.sp-stage').screenshot({ path: join(shots, 'r-a-plan-start-day.png') });
    });
});

test('the same frame reads in night', async () => {
    await withPage({ revision: 'r-a', frame: 'start', appearance: 'night' }, async (page, problems) => {
        await page.locator('.sp-stage[data-ready="true"][data-appearance="night"]').waitFor({ timeout: 15000 });
        assert.deepEqual(problems, []);
        await page.locator('.sp-stage').screenshot({ path: join(shots, 'r-a-plan-start-night.png') });
    });
});

test('a seated Plan puts every Piece on the socket the model gave it', async () => {
    await withPage({ revision: 'r-a', frame: 'seated', appearance: 'light' }, async (page, problems) => {
        await page.locator('.sp-stage[data-ready="true"]').waitFor({ timeout: 15000 });
        assert.deepEqual(problems, []);
        assert.ok(await page.locator('[data-mark-type="socket"][data-occupied="true"]').count() > 0, 'nobody was seated');
        await page.locator('.sp-stage').screenshot({ path: join(shots, 'r-a-plan-seated-day.png') });
    });
});

test('a world whose form has no Stage refuses in the open', async () => {
    await withPage({ revision: 'r-b', frame: 'start', appearance: 'light' }, async (page) => {
        const error = page.locator('#error');
        await error.waitFor({ timeout: 15000 });
        assert.match(await error.textContent(), /Route/u);
        assert.equal(await page.locator('.sp-stage').count(), 0, 'nothing may be drawn for a world with no Stage');
    });
});
