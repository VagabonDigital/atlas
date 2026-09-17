/* B2 — the Stage's boundaries, enforced mechanically.

   The Stage is where a generic engine most easily turns into one game with a
   renderer attached. Review misses that; these rules do not. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

import { TOKENS, kitIds } from '../engines/shared-plan/stage/kits/index.js';
import { VOCAB } from '../engines/shared-plan/definition/index.js';
import { references } from './helpers.js';
import { collectKeys } from './rename.js';

const here = dirname(fileURLToPath(import.meta.url));
const engineRoot = join(here, '..', 'engines', 'shared-plan');
const stageRoot = join(engineRoot, 'stage');

const FORM_IDS = Object.keys(VOCAB.STAGE_FORMS);

function sourceFiles(dir, extension = '.js') {
    const out = [];
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) out.push(...sourceFiles(full, extension));
        else if (entry.endsWith(extension)) out.push(full);
    }
    return out;
}

const stagePath = (file) => relative(stageRoot, file).split('\\').join('/');
const importsOf = (source) => [...source.matchAll(/from\s+['"]([^'"]+)['"]/gu)].map((m) => m[1]);
const stringLiterals = (source) => [...source.matchAll(/(['"])((?:\\.|(?!\1)[^\\\r\n])*)\1/gu)].map((m) => m[2]);

/* Pure Stage modules: no document, no clock, no randomness, so a frame is a
   function of its inputs and can be built and compared in Node. */
const PURE = ['marks', 'forms', 'kits'];
const isPure = (file) => PURE.some((dir) => stagePath(file).startsWith(`${dir}/`));

test('the Stage imports only the model, the layout and the Definition', () => {
    const allowed = /^\.{1,2}\/(\.\.\/)?(layout|model|definition)\/index\.js$|^\.{1,2}\//u;
    const offences = [];
    for (const file of sourceFiles(stageRoot)) {
        for (const spec of importsOf(readFileSync(file, 'utf8'))) {
            if (!spec.startsWith('.')) {
                offences.push(`${stagePath(file)} imports the package ${spec}`);
                continue;
            }
            if (/\/(compiler|analysis|narration)\//u.test(spec)) {
                offences.push(`${stagePath(file)} imports ${spec}`);
                continue;
            }
            assert.match(spec, allowed, `${stagePath(file)} imports ${spec}`);
        }
    }
    assert.deepEqual(offences, []);
});

test('a form never sees a World View, and the mark layer never sees the DOM', () => {
    const offences = [];
    for (const file of sourceFiles(join(stageRoot, 'forms'))) {
        for (const spec of importsOf(readFileSync(file, 'utf8'))) {
            if (/\/model\//u.test(spec)) offences.push(`${stagePath(file)} imports ${spec}`);
        }
    }
    for (const file of sourceFiles(join(stageRoot, 'marks'))) {
        for (const spec of importsOf(readFileSync(file, 'utf8'))) {
            if (/render/u.test(spec)) offences.push(`${stagePath(file)} imports ${spec}`);
        }
    }
    assert.deepEqual(offences, []);
});

test('only a form adapter names a Stage Form', () => {
    const offences = [];
    for (const file of sourceFiles(stageRoot)) {
        const path = stagePath(file);
        if (path.startsWith('forms/') || path === 'kits/index.js') continue;
        for (const literal of stringLiterals(readFileSync(file, 'utf8'))) {
            if (FORM_IDS.includes(literal.trim())) offences.push(`${path} names the form "${literal}"`);
        }
    }
    assert.deepEqual(offences, [], 'a form name outside forms/ means the grammar has started to branch');
});

test('pure Stage modules read no clock, no randomness and no document', () => {
    const banned = ['Math.random', 'Date.now', 'new Date', 'performance.now', 'document.', 'window.', 'localStorage'];
    const offences = [];
    for (const file of sourceFiles(stageRoot).filter(isPure)) {
        const source = readFileSync(file, 'utf8');
        for (const token of banned) {
            if (source.includes(token)) offences.push(`${stagePath(file)} uses ${token}`);
        }
    }
    assert.deepEqual(offences, []);
});

test('every kit defines every token, for both appearances', () => {
    const css = readFileSync(join(stageRoot, 'kits', 'tokens.css'), 'utf8');
    const offences = [];
    for (const kit of kitIds()) {
        for (const appearance of ['light', 'night']) {
            const selector = appearance === 'night'
                ? String.raw`\.sp-stage\[data-kit="${kit}"\]\[data-appearance="night"\]`
                : String.raw`\.sp-stage\[data-kit="${kit}"\]`;
            const match = new RegExp(`${selector}\\s*\\{([^}]*)\\}`, 'u').exec(css);
            if (!match) {
                offences.push(`${kit} has no ${appearance} block`);
                continue;
            }
            for (const token of TOKENS) {
                if (!match[1].includes(`--sp-${token}:`)) offences.push(`${kit} ${appearance} is missing --sp-${token}`);
            }
        }
    }
    assert.deepEqual(offences, []);
});

test('no Stage stylesheet names a game or a Stage Form', () => {
    const forbidden = new Map();
    for (const [name, draft] of Object.entries(references)) {
        for (const key of collectKeys(draft)) forbidden.set(key.toLowerCase(), `${name} key "${key}"`);
        for (const section of ['places', 'pieces', 'voices', 'resources']) {
            for (const item of draft[section] ?? []) {
                const label = item.name ?? item.label;
                if (label) forbidden.set(label.toLowerCase(), `${name} name "${label}"`);
            }
        }
    }
    for (const form of FORM_IDS) forbidden.set(form, `the Stage Form "${form}"`);

    const offences = [];
    for (const file of sourceFiles(stageRoot, '.css')) {
        const source = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//gu, ' ');
        for (const token of source.match(/[A-Za-z][A-Za-z0-9-]*/gu) ?? []) {
            const hit = forbidden.get(token.toLowerCase());
            if (hit) offences.push(`${stagePath(file)}: "${token}" is ${hit}`);
        }
    }
    assert.deepEqual(offences, []);
});

test('the Runtime Face reaches the engine through its own modules only', () => {
    const source = readFileSync(join(engineRoot, 'runtime-face.js'), 'utf8');
    for (const spec of importsOf(source)) {
        assert.match(spec, /^\.\/(identity\.js|model\/index\.js|stage\/still\.js)$/u, `the Runtime Face imports ${spec}`);
    }
});
