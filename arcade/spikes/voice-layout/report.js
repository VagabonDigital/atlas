/* Renders the Voice placement spike as one self-contained page: the answer
   first, then the verdict matrix, then every fixture as wireframes drawn from
   exactly the geometry the numbers were measured on. */

import { REGIONS, STAGE } from '../../engines/shared-plan/layout/index.js';
import { CARD, MIN_CELL, medallionCentre } from './strategies.js';

const esc = (s) => String(s)
    .replace(/&/gu, '&amp;').replace(/</gu, '&lt;').replace(/>/gu, '&gt;').replace(/"/gu, '&quot;');
const px = (n) => `${Math.round(n)}px`;
const pct = (n) => `${Math.round(n * 100)}%`;

function code(entry) {
    return entry.name.includes('piece anchor') ? 'R-A′' : entry.name.toUpperCase();
}

const FORM_NOTE = {
    table: 'Table',
    route: 'Route',
    vessel: 'Vessel (arrives in B5; same solver as Table)'
};

function initials(name) {
    return name.split(/\s+/u).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function metricsOf(results, fixture, id) {
    return results.find((e) => e.name === fixture)?.strategies.find((s) => s.result.id === id)?.metrics ?? null;
}

/* ---- wireframes ---- */

function nearestPoints(a, b) {
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const onB = { x: clamp(a.x + a.width / 2, b.x, b.x + b.width), y: clamp(a.y + a.height / 2, b.y, b.y + b.height) };
    const onA = { x: clamp(onB.x, a.x, a.x + a.width), y: clamp(onB.y, a.y, a.y + a.height) };
    return { onA, onB };
}

function anchorBox(game, strategy, voice) {
    if (voice.anchor.kind === 'place') return strategy.result.places[voice.anchor.place].frame;
    const slot = game.layout.threshold[game.pieces.findIndex((p) => p.key === voice.anchor.piece)];
    return { x: slot.left, y: REGIONS.threshold.y, width: slot.width, height: REGIONS.threshold.height };
}

function wireframe(entry, strategy, uid) {
    const { game } = entry;
    const { result, metrics } = strategy;
    const byKey = new Map(metrics.cards.map((c) => [c.key, c]));
    const out = [];
    const rect = (cls, b, extra = '') => out.push(
        `<rect class="${cls}" x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}"${extra}/>`
    );
    const text = (cls, x, y, value, anchor = 'start') => out.push(
        `<text class="${cls}" x="${Math.round(x)}" y="${Math.round(y)}" text-anchor="${anchor}">${esc(value)}</text>`
    );

    out.push(`<svg class="wire" viewBox="0 0 ${STAGE.width} ${STAGE.height}" role="img" aria-labelledby="${uid}">`);
    out.push(`<title id="${uid}">${esc(`${code(entry)} ${result.label}, ${result.variant}`)}</title>`);
    rect('w-stage', { x: 0, y: 0, width: STAGE.width, height: STAGE.height });

    for (const [name, box] of Object.entries(REGIONS)) {
        if (name === 'ground') continue;
        rect(name.startsWith('chrome') ? 'w-chrome' : 'w-region', box);
    }
    text('w-label', REGIONS.horizon.x + 12, REGIONS.horizon.y + 22, 'HORIZON');
    text('w-label', REGIONS.chromeTopLeft.x + 12, 26, 'CHROME');
    text('w-label', REGIONS.chromeTopRight.x + 14, 26, 'TUTOR CHROME');
    text('w-label', REGIONS.chromeBottomRight.x + 14, REGIONS.chromeBottomRight.y + 26, 'BEAT CONTROL');
    text('w-label', REGIONS.margin.x + 12, REGIONS.margin.y + 22, 'MARGIN');
    rect('w-ground', REGIONS.ground);

    for (const band of result.bands) {
        rect('w-band', band);
        text('w-label w-label-band', band.x + band.width - 12, band.y + 20, 'VOICE BAND', 'end');
    }
    for (const segment of result.segments ?? []) {
        const p = segment.path;
        out.push(`<line class="w-segment" x1="${p.x1}" y1="${p.y1}" x2="${p.x2}" y2="${p.y2}"/>`);
    }

    for (const place of game.places) {
        const p = result.places[place.key];
        const tight = p.cellHeight < MIN_CELL ? ' is-tight' : '';
        rect(`w-frame${tight}`, p.frame);
        text('w-place', p.frame.x + p.frame.width / 2, p.frame.y + 25, place.name, 'middle');
        for (const s of p.sockets) {
            out.push(`<circle class="w-socket${tight}" cx="${s.x}" cy="${s.y}" r="${s.radius}"/>`);
        }
    }

    game.pieces.forEach((piece, i) => {
        const slot = game.layout.threshold[i];
        out.push(`<circle class="w-token" cx="${slot.x}" cy="${slot.y - 9}" r="10"/>`);
        text('w-piece', slot.x, slot.y + 22, piece.name, 'middle');
    });

    for (const card of result.cards) {
        for (const t of byKey.get(card.key).tethers) {
            out.push(`<line class="w-tether" x1="${Math.round(t.from.x)}" y1="${Math.round(t.from.y)}" x2="${Math.round(t.drawTo.x)}" y2="${Math.round(t.drawTo.y)}"/>`);
            out.push(`<circle class="w-tether-end" cx="${Math.round(t.drawTo.x)}" cy="${Math.round(t.drawTo.y)}" r="5"/>`);
        }
    }

    for (const card of result.cards) {
        const m = byKey.get(card.key);
        if (card.placement !== 'inside') {
            const { onA, onB } = nearestPoints(card, anchorBox(game, strategy, card.voice));
            out.push(`<line class="w-leader" x1="${Math.round(onA.x)}" y1="${Math.round(onA.y)}" x2="${Math.round(onB.x)}" y2="${Math.round(onB.y)}"/>`);
            out.push(`<circle class="w-leader-end" cx="${Math.round(onB.x)}" cy="${Math.round(onB.y)}" r="5"/>`);
        }
        if (m.ambiguousWith.length > 0) {
            rect('w-ambiguous', { x: card.x - 5, y: card.y - 5, width: card.width + 10, height: card.height + 10 }, ' rx="9"');
        }
        const failing = card.problems.length > 0 ? ' is-failing' : '';
        rect(`w-card${failing}`, card, ' rx="6"');
        const c = medallionCentre(card);
        out.push(`<circle class="w-medallion" cx="${c.x}" cy="${c.y}" r="${CARD.medallion}"/>`);
        text('w-initials', c.x, c.y + 5, initials(card.voice.name), 'middle');
        const tx = card.x + CARD.pad + 2 * CARD.medallion + CARD.pad;
        text('w-name', tx, card.y + CARD.pad + 13, card.voice.name);
        text('w-role', tx, card.y + CARD.pad + 13 + CARD.headerLine, card.voice.role);
        card.claimWrap.forEach((line, i) => {
            text('w-claim', card.x + CARD.pad, card.y + CARD.pad + 2 * CARD.headerLine + 4 + CARD.claimLine * i + 15, line.text);
        });
    }

    out.push('</svg>');
    return out.join('');
}

/* ---- page parts ---- */

function chip(pass) {
    return pass
        ? '<span class="chip chip-ok">Fits</span>'
        : '<span class="chip chip-bad">Does not fit</span>';
}

function figure(entry, strategy, index) {
    const { result, metrics } = strategy;
    const uid = `w-${entry.name.replace(/[^a-z0-9]+/giu, '-')}-${index}`;
    const issues = [...metrics.problems, ...metrics.collisions];
    const fellBack = result.fellBackBecause?.length
        ? `<p class="note">Satellite did not fit, so this world uses the band: ${esc(result.fellBackBecause[0])}${result.fellBackBecause.length > 1 ? ` (and ${result.fellBackBecause.length - 1} more)` : ''}.</p>`
        : '';
    const leaning = metrics.headlineConflicts.filter((h) => h.leansIn);
    const headline = leaning.length
        ? `<p class="note">Under composition v1's headline rule, a change's headline would cover ${leaning.map((h) => esc(entry.game.voiceIndex[h.voice].name)).join(' and ')} as they lean in.</p>`
        : '';
    return `
      <figure class="panel">
        <figcaption>
          <div class="panel-head">
            <h4>${esc(result.label)}</h4>
            ${chip(metrics.pass)}
          </div>
          <p class="variant">${esc(result.variant)}</p>
        </figcaption>
        <div class="wire-wrap">${wireframe(entry, strategy, uid)}</div>
        <dl class="stats">
          <div><dt>Socket rows</dt><dd>${px(metrics.minCell)} <span class="was">from ${px(metrics.baseMinCell)}</span></dd></div>
          <div><dt>Socket space kept</dt><dd>${pct(metrics.retained)}</dd></div>
          <div><dt>Gap to anchor</dt><dd>${px(metrics.meanGap)} <span class="was">max ${px(metrics.maxGap)}</span></dd></div>
          <div><dt>Ambiguous cards</dt><dd class="${metrics.ambiguous ? 'bad' : ''}">${metrics.ambiguous} of ${metrics.cards.length}</dd></div>
          <div><dt>Tether reach</dt><dd>${px(metrics.meanTether)} <span class="was">${metrics.meanCrossings.toFixed(2)} frames crossed</span></dd></div>
        </dl>
        ${fellBack}${headline}
        ${issues.length && !result.fellBackBecause?.length ? `<ul class="issues">${issues.slice(0, 3).map((i) => `<li>${esc(i)}</li>`).join('')}${issues.length > 3 ? `<li>and ${issues.length - 3} more</li>` : ''}</ul>` : ''}
      </figure>`;
}

function matrix(results) {
    const strategies = results[0].strategies.map((s) => s.result.label);
    const rows = results.map((entry) => `
        <tr>
          <th scope="row"><span class="code">${esc(code(entry))}</span> ${esc(entry.game.meta.title)}<span class="form">${esc(FORM_NOTE[entry.game.presentation.stageForm] ?? entry.game.presentation.stageForm)} · ${entry.game.voices.length} Voice${entry.game.voices.length === 1 ? '' : 's'}</span></th>
          ${entry.strategies.map(({ result, metrics }) => `
          <td>
            ${chip(metrics.pass)}
            <span class="cell-variant">${esc(result.id === 'hybrid' ? result.variant : '')}</span>
            <span class="nums">gap ${px(metrics.maxGap)} · ${metrics.ambiguous}/${metrics.cards.length} ambiguous<br>rows ${px(metrics.minCell)} · ${pct(metrics.retained)} kept</span>
          </td>`).join('')}
        </tr>`).join('');
    return `
      <div class="scroll">
        <table class="matrix">
          <thead><tr><th scope="col">Fixture</th>${strategies.map((s) => `<th scope="col">${esc(s)}</th>`).join('')}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
}

function legend() {
    const item = (svg, label) => `<li><svg viewBox="0 0 44 28" aria-hidden="true">${svg}</svg>${label}</li>`;
    return `
      <ul class="legend">
        ${item('<rect class="w-frame" x="2" y="3" width="40" height="22"/>', 'Place frame')}
        ${item('<circle class="w-socket" cx="22" cy="14" r="9"/>', 'Socket')}
        ${item(`<rect class="w-frame is-tight" x="2" y="3" width="40" height="22"/><circle class="w-socket is-tight" cx="22" cy="14" r="6"/>`, `Socket rows under ${MIN_CELL}px`)}
        ${item('<rect class="w-card" x="2" y="4" width="40" height="20" rx="4"/><circle class="w-medallion" cx="11" cy="14" r="6"/>', 'Voice card')}
        ${item('<rect class="w-band" x="2" y="6" width="40" height="16"/>', 'Voice band')}
        ${item('<line class="w-tether" x1="4" y1="22" x2="40" y2="6"/><circle class="w-tether-end" cx="40" cy="6" r="3"/>', 'Tether, drawn to where its Piece starts')}
        ${item('<line class="w-leader" x1="4" y1="14" x2="36" y2="14"/><circle class="w-leader-end" cx="38" cy="14" r="3"/>', 'Nearest point of the anchor')}
        ${item('<rect class="w-ambiguous" x="3" y="3" width="38" height="22" rx="5"/>', 'Another Place is as near')}
      </ul>`;
}

const STYLE = `
:root {
  --paper: #f2f5f6;
  --sheet: #ffffff;
  --ink: #1a242a;
  --ink-2: #4a5860;
  --rule: #c9d3d8;
  --line: #9aa8b0;
  --faint: #e3e9ec;
  --accent: #2c5bcc;
  --accent-soft: #dce5fa;
  --redline: #c23b29;
  --redline-soft: #f7e0db;
  --ok: #26734f;
  --ok-soft: #d9eee3;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --paper: #0e1418;
    --sheet: #151d22;
    --ink: #e1e8ec;
    --ink-2: #a3b0b8;
    --rule: #2b373e;
    --line: #5b6970;
    --faint: #1d272d;
    --accent: #88a7ff;
    --accent-soft: #1c2a4a;
    --redline: #ff7f6b;
    --redline-soft: #3b201b;
    --ok: #63c69a;
    --ok-soft: #163226;
  }
}
:root[data-theme="dark"] {
  --paper: #0e1418;
  --sheet: #151d22;
  --ink: #e1e8ec;
  --ink-2: #a3b0b8;
  --rule: #2b373e;
  --line: #5b6970;
  --faint: #1d272d;
  --accent: #88a7ff;
  --accent-soft: #1c2a4a;
  --redline: #ff7f6b;
  --redline-soft: #3b201b;
  --ok: #63c69a;
  --ok-soft: #163226;
}
body {
  background: var(--paper);
  color: var(--ink);
  font: 400 16px/1.55 "Barlow", "Segoe UI", system-ui, sans-serif;
}
.sheet {
  max-width: 1280px;
  margin: 0 auto;
  padding-inline: clamp(16px, 3vw, 32px);
  padding-block: 32px 64px;
  display: grid;
  gap: 40px;
}
h1, h2, h3, h4 {
  font-family: "Barlow Semi Condensed", "Arial Narrow", "Segoe UI", sans-serif;
  text-wrap: balance;
  margin: 0;
}
h1 { font-size: clamp(2rem, 4.5vw, 3.1rem); font-weight: 700; line-height: 1.05; letter-spacing: -0.01em; }
h2 { font-size: 1.55rem; font-weight: 600; }
h3 { font-size: 1.3rem; font-weight: 600; }
h4 { font-size: 1.05rem; font-weight: 600; letter-spacing: 0.01em; }
p { margin: 0; max-width: 68ch; }
.eyebrow {
  font: 600 0.78rem/1 "Barlow Semi Condensed", "Arial Narrow", sans-serif;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-2);
}
.titleblock {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px 32px;
  align-items: end;
  border-bottom: 2px solid var(--ink);
  padding-bottom: 20px;
}
.titleblock .lede { color: var(--ink-2); margin-top: 12px; }
.stamp {
  display: grid;
  grid-template-columns: auto auto;
  border: 1px solid var(--line);
  font: 400 0.8rem/1.3 "IBM Plex Mono", ui-monospace, monospace;
  background: var(--sheet);
}
.stamp div { padding: 6px 10px; border-bottom: 1px solid var(--rule); }
.stamp div:nth-child(odd) { color: var(--ink-2); border-right: 1px solid var(--rule); }
.stamp div:nth-last-child(-n+2) { border-bottom: 0; }
.answer {
  background: var(--sheet);
  border: 1px solid var(--rule);
  border-left: 4px solid var(--accent);
  padding: 24px clamp(16px, 3vw, 32px);
  display: grid;
  gap: 16px;
}
.answer h2 { font-size: 1.7rem; }
.answer ul, .decisions ol { margin: 0; padding-left: 1.2em; display: grid; gap: 10px; max-width: 76ch; }
.columns { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
.decisions { display: grid; gap: 12px; align-content: start; }
.decisions h3 { font-size: 1.15rem; }
.scroll { overflow-x: auto; border: 1px solid var(--rule); background: var(--sheet); }
.matrix { border-collapse: collapse; width: 100%; min-width: 760px; }
.matrix th, .matrix td { padding: 12px 14px; text-align: left; vertical-align: top; border-bottom: 1px solid var(--rule); }
.matrix thead th {
  font: 600 0.8rem/1 "Barlow Semi Condensed", "Arial Narrow", sans-serif;
  letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-2);
  border-bottom: 2px solid var(--ink);
}
.matrix tbody tr:last-child th, .matrix tbody tr:last-child td { border-bottom: 0; }
.matrix th[scope="row"] { font-weight: 600; min-width: 220px; }
.code { font: 500 0.85rem/1 "IBM Plex Mono", ui-monospace, monospace; color: var(--accent); margin-right: 4px; }
.form { display: block; font-weight: 400; font-size: 0.85rem; color: var(--ink-2); }
.cell-variant { display: block; font-size: 0.85rem; color: var(--ink-2); margin-top: 6px; }
.cell-variant:empty { display: none; }
.nums, .stats dd {
  font: 400 0.8rem/1.45 "IBM Plex Mono", ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}
.nums { display: block; margin-top: 6px; color: var(--ink-2); }
.chip {
  display: inline-block;
  font: 600 0.72rem/1 "Barlow Semi Condensed", "Arial Narrow", sans-serif;
  letter-spacing: 0.08em; text-transform: uppercase;
  padding: 5px 8px; border-radius: 3px;
}
.chip-ok { background: var(--ok-soft); color: var(--ok); }
.chip-bad { background: var(--redline-soft); color: var(--redline); }
.method { display: grid; gap: 14px; }
.method ul { margin: 0; padding-left: 1.2em; display: grid; gap: 6px; max-width: 80ch; }
.legend { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 10px 22px; font-size: 0.9rem; color: var(--ink-2); }
.legend li { display: flex; align-items: center; gap: 8px; }
.legend svg { width: 44px; height: 28px; flex: none; }
.toolbar { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; }
.toggle { display: inline-flex; align-items: center; gap: 8px; font-weight: 500; cursor: pointer; }
.toggle input { width: 18px; height: 18px; accent-color: var(--accent); }
.toggle input:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.fixture { display: grid; gap: 14px; padding-top: 28px; border-top: 1px solid var(--rule); }
.fixture-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 14px; }
.fixture-head .form { display: inline; }
.fixture > .note { color: var(--ink-2); }
.panels { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
@media (max-width: 1080px) { .panels { grid-template-columns: minmax(0, 1fr); } }
body:has(#large:checked) .panels { grid-template-columns: minmax(0, 1fr); }
.panel { margin: 0; background: var(--sheet); border: 1px solid var(--rule); padding: 14px; display: grid; gap: 10px; align-content: start; }
.panel-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.variant { color: var(--ink-2); font-size: 0.9rem; }
.wire-wrap { border: 1px solid var(--rule); }
.wire { display: block; width: 100%; height: auto; }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px 16px; margin: 0; }
.stats div { display: grid; gap: 2px; }
.stats dt { font-size: 0.78rem; color: var(--ink-2); }
.stats dd { margin: 0; color: var(--ink); }
.stats dd.bad { color: var(--redline); }
.was { color: var(--ink-2); }
.panel .note { font-size: 0.88rem; color: var(--ink-2); }
.issues { margin: 0; padding-left: 1.1em; font-size: 0.85rem; color: var(--redline); display: grid; gap: 4px; }
.foot { color: var(--ink-2); font-size: 0.9rem; display: grid; gap: 6px; }
code { font: 400 0.88em/1 "IBM Plex Mono", ui-monospace, monospace; background: var(--faint); padding: 2px 5px; border-radius: 3px; }

/* wireframe marks, all drawn from the page tokens */
.w-stage { fill: var(--sheet); }
.w-region { fill: var(--faint); }
.w-chrome { fill: url(#hatch); stroke: var(--rule); stroke-width: 1; }
.w-ground { fill: none; stroke: var(--line); stroke-width: 2; stroke-dasharray: 10 8; }
.w-label { fill: var(--ink-2); font: 600 15px "Barlow Semi Condensed", "Arial Narrow", sans-serif; letter-spacing: 0.12em; }
.w-label-band { fill: var(--accent); }
.w-band { fill: var(--accent-soft); stroke: var(--accent); stroke-width: 1.5; stroke-dasharray: 8 6; }
.w-segment { stroke: var(--line); stroke-width: 3; }
.w-frame { fill: var(--sheet); stroke: var(--ink); stroke-width: 2; }
.w-frame.is-tight { stroke: var(--redline); stroke-width: 4; }
.w-place { fill: var(--ink); font: 600 22px "Barlow Semi Condensed", "Arial Narrow", sans-serif; }
.w-socket { fill: none; stroke: var(--line); stroke-width: 2; }
.w-socket.is-tight { stroke: var(--redline); fill: var(--redline-soft); }
.w-token { fill: var(--faint); stroke: var(--line); stroke-width: 2; }
.w-piece { fill: var(--ink-2); font: 500 13px "Barlow", "Segoe UI", sans-serif; }
.w-tether { stroke: var(--accent); stroke-width: 2; stroke-dasharray: 6 5; opacity: 0.75; }
.w-tether-end { fill: var(--accent); }
.w-leader { stroke: var(--ink-2); stroke-width: 2; }
.w-leader-end { fill: var(--ink-2); }
.w-card { fill: var(--sheet); stroke: var(--accent); stroke-width: 2.5; }
.w-card.is-failing { stroke: var(--redline); }
.w-ambiguous { fill: none; stroke: var(--redline); stroke-width: 3; stroke-dasharray: 7 5; }
.w-medallion { fill: var(--accent); }
.w-initials { fill: var(--sheet); font: 700 13px "Barlow Semi Condensed", "Arial Narrow", sans-serif; }
.w-name { fill: var(--ink); font: 600 13px "Barlow", "Segoe UI", sans-serif; }
.w-role { fill: var(--ink-2); font: 400 13px "Barlow", "Segoe UI", sans-serif; }
.w-claim { fill: var(--ink); font: 400 16px "Barlow", "Segoe UI", sans-serif; }
`;

export function renderReport(results) {
    const sat = (f) => metricsOf(results, f, 'satellite');
    const lane = (f) => metricsOf(results, f, 'lane');
    const hyb = (f) => metricsOf(results, f, 'hybrid');
    const n = (m, key, fmt = px) => (m ? fmt(m[key]) : '—');

    const conflicts = results
        .filter((e) => !e.name.includes('piece anchor') && sat(e.name)?.pass)
        .flatMap((e) => (sat(e.name)?.headlineConflicts ?? [])
            .filter((h) => h.leansIn)
            .map((h) => `${e.game.voiceIndex[h.voice].name} (${code(e)})`));

    const pieceLane = lane('r-a (piece anchor)');
    const pieceGap = pieceLane ? Math.max(...pieceLane.cards.map((c) => c.anchorGap)) : null;
    const routeShift = results.find((e) => e.name === 'r-b')?.strategies.find((s) => s.result.id === 'satellite')?.result.shift ?? 0;

    const fixtures = results.map((entry) => `
      <section class="fixture" aria-labelledby="f-${esc(entry.name.replace(/[^a-z0-9]+/giu, '-'))}">
        <div class="fixture-head">
          <h3 id="f-${esc(entry.name.replace(/[^a-z0-9]+/giu, '-'))}"><span class="code">${esc(code(entry))}</span> ${esc(entry.game.meta.title)}</h3>
          <span class="form">${esc(FORM_NOTE[entry.game.presentation.stageForm] ?? entry.game.presentation.stageForm)} · ${entry.game.places.length} Places · ${entry.game.voices.length} Voice${entry.game.voices.length === 1 ? '' : 's'}</span>
        </div>
        ${entry.note ? `<p class="note">${esc(entry.note)}</p>` : ''}
        <div class="panels">
          ${entry.strategies.map((s, i) => figure(entry, s, i)).join('')}
        </div>
      </section>`).join('');

    return `<title>Where Voices Stand</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Semi+Condensed:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>${STYLE}</style>
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <defs>
    <pattern id="hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="12" height="12" style="fill: var(--faint)"/>
      <line x1="0" y1="0" x2="0" y2="12" style="stroke: var(--rule); stroke-width: 4"/>
    </pattern>
  </defs>
</svg>
<main class="sheet">
  <header class="titleblock">
    <div>
      <p class="eyebrow">Engine One · composition v1 · B1.1 layout spike</p>
      <h1>Where Voices Stand</h1>
      <p class="lede">Composition v1 fixes every region except one: where a Voice goes. The design vision asks for Voices near what they concern, not in a sidebar. This compares a permanent Voice lane with Voices that stand with their own Place, on every fixture that has Voices, using the compiler's own solvers and font metrics at 1280×720.</p>
    </div>
    <div class="stamp" aria-label="Spike details">
      <div>Stage</div><div>1280 × 720</div>
      <div>Fixtures</div><div>${results.length - 1} + 1 synthetic</div>
      <div>Min socket row</div><div>${MIN_CELL}px</div>
      <div>Status</div><div>not wired into solve</div>
    </div>
  </header>

  <section class="answer" aria-labelledby="answer">
    <p class="eyebrow">Recommendation</p>
    <h2 id="answer">Stand each Voice with its own Place, and use a band only as a flagged fallback</h2>
    <ul>
      <li><strong>Satellite is the only placement that never leaves a Voice as near another Place as its own.</strong> Across every fixture where it fits, no card is ambiguous and none is more than 8px from its anchor. It also keeps the most socket space in all three reference games: R-A ${n(sat('r-a'), 'retained', pct)}, R-B ${n(sat('r-b'), 'retained', pct)} and R-C ${n(sat('r-c'), 'retained', pct)}, against ${n(lane('r-a'), 'retained', pct)}, ${n(lane('r-b'), 'retained', pct)} and ${n(lane('r-c'), 'retained', pct)} for the lane. On a Table the Voice stands in a strip under the Place name. On a Route it stands above its frame, which costs no sockets at all once every frame is lowered by ${px(routeShift)}.</li>
      <li><strong>The permanent lane is not recommended.</strong> It looks local in one-row Tables only because its cards happen to sit above their own columns. On a Route both cards float ${n(lane('r-b'), 'maxGap')} from their Places and each is as near another Place (${lane('r-b')?.ambiguous ?? '—'} of ${lane('r-b')?.cards.length ?? '—'} ambiguous). In H-1 one Voice ends up ${n(lane('h-1'), 'maxGap')} from its Place.</li>
      <li><strong>Satellite does not fit the two dense two-row Tables.</strong> Hosting a Voice would squeeze socket rows to ${n(sat('h-1'), 'minCell')} in H-1 and ${n(sat('h-3'), 'minCell')} in H-3, under the ${MIN_CELL}px a Piece needs. The deterministic fallback, one band where the gap between the rows was, keeps them collision-free (rows ${n(hyb('h-1'), 'minCell')} and ${n(hyb('h-3'), 'minCell')}), but each of its cards is as near the row below as the row above (${hyb('h-1')?.ambiguous ?? '—'} of ${hyb('h-1')?.cards.length ?? '—'} and ${hyb('h-3')?.ambiguous ?? '—'} of ${hyb('h-3')?.cards.length ?? '—'} ambiguous). If it is kept, a band card needs a drawn connector to its anchor and the compiler should warn when a world falls back to it.</li>
    </ul>
    <div class="columns">
      <div class="decisions">
        <h3>Decisions before the layout locks</h3>
        <ol>
          <li><strong>Piece anchors.</strong> The schema lets a Voice anchor to a Piece, though no fixture does. No placement keeps such a Voice near its concern: in the lane Marta sits ${pieceGap === null ? '—' : px(pieceGap)} from where Gregor starts, and a satellite has no Place to stand in. The proposal is that Voices anchor to Places for placement, while tethers can still point at Pieces. That narrows the Definition contract, so it is flagged here rather than made.</li>
          <li><strong>The density fallback.</strong> Keep the between-rows band with a connector and a warning, or make an unplaceable Voice a compile error, like text that does not fit. The error would change H-1 and H-3, so it is better decided with generation in B3.</li>
        </ol>
      </div>
      <div class="decisions">
        <h3>Rules satellite brings to the Stage</h3>
        <ol>
          <li>When a change lands on a Place that hosts a Voice, its headline goes below the Voice strip. Composition v1's rule would cover ${conflicts.length ? esc(conflicts.join(', ')) : 'no one'} at the moment they lean in.</li>
          <li>Every card is sized for its longest Resolve outcome line as well as its claim, so nothing reflows when the world resolves. The compiler does not yet measure Resolve text; the spike measures Voice outcome lines itself.</li>
        </ol>
      </div>
    </div>
  </section>

  <section class="method" aria-labelledby="matrix">
    <p class="eyebrow">Verdict matrix</p>
    <h2 id="matrix">Every fixture with Voices, three placements</h2>
    <p>Hybrid is satellite wherever every Voice fits. Otherwise it is one band laid against the anchors: between the rows of a two-row Table, or across the top.</p>
    ${matrix(results)}
  </section>

  <section class="method" aria-labelledby="method">
    <p class="eyebrow">How this was measured</p>
    <h2 id="method">Method</h2>
    <ul>
      <li>A Voice card is a ${CARD.medallion * 2}px medallion beside the name and role, set at the micro size, with the claim below at the claim size (16px). It wraps word by word the way a browser does, up to ${CARD.maxLines} lines, and is sized for its longest claim variant or outcome line.</li>
      <li>A Place fails if its socket rows drop under ${MIN_CELL}px: a 36px Piece chip plus 8px of air.</li>
      <li>A card counts as ambiguous when another Place frame is within 12px of the distance to its own anchor.</li>
      <li>Tether reach is averaged over every position the tethered Piece can take: its Threshold slot, the Margin and every socket. Frames crossed counts the Places a straight tether passes through on the way.</li>
      <li>Frames, sockets, bands and slots all come from <code>solvePlaces</code>, <code>socketGrid</code> and the Threshold slots compiled into each revision. Nothing here changes <code>solve</code>. Regenerate with <code>node spikes/voice-layout/run.js --out &lt;dir&gt;</code>.</li>
    </ul>
  </section>

  <section class="method" aria-labelledby="wireframes">
    <div class="toolbar">
      <div>
        <p class="eyebrow">Wireframes</p>
        <h2 id="wireframes">Each fixture, as the Stage would compose it</h2>
      </div>
      <label class="toggle" for="large"><input type="checkbox" id="large"> Large wireframes</label>
    </div>
    ${legend()}
  </section>

  ${fixtures}

  <footer class="foot">
    <p>Dev-only spike in <code>arcade/spikes/voice-layout</code>. Voice claims are measured with the compiler's conservative font metrics; B2 compares those metrics against rendered text.</p>
  </footer>
</main>`;
}
