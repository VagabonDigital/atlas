#!/usr/bin/env node
/* Headless play harness.

   Compiles a Draft, plays it through a scripted session and prints the narrated
   World View at every phase, plus the analysis report.

     node harness/play.js              all drafts, one line each
     node harness/play.js r-a          one draft, fully narrated
     node harness/play.js r-b --pin pump
     node harness/play.js --all        every draft, fully narrated
     node harness/play.js --variants   every variant of every beat, one line each
*/

import { allDrafts } from '../definitions/index.js';
import { compileAndFreeze, formatDiagnostic } from '../engines/shared-plan/compiler/index.js';
import { derive, replay, verifyReplay } from '../engines/shared-plan/model/index.js';
import { narrate } from '../engines/shared-plan/narration/index.js';
import { analyse, formatAnalysis } from '../engines/shared-plan/analysis/index.js';
import { autoplay, findCommitFor } from './autoplay.js';

function compileDraft(name) {
    const draft = allDrafts[name];
    if (!draft) throw new Error(`No draft named "${name}". Try: ${Object.keys(allDrafts).join(', ')}`);
    return compileAndFreeze(draft);
}

function playOne(name, { pin = null, verbose = true }) {
    const { ok, revision, diagnostics } = compileDraft(name);

    if (!ok) {
        console.log(`\n=== ${name} — DID NOT COMPILE ===`);
        for (const d of diagnostics) console.log(`  ${formatDiagnostic(d)}`);
        return false;
    }

    const warnings = diagnostics.filter((d) => d.severity !== 'error');
    const game = revision.compiledGame;
    const { session, trace } = autoplay(revision, { pin });

    if (!verbose) {
        console.log(
            `${name.padEnd(6)} ${game.meta.title.padEnd(22)} `
            + `${game.topology.kind.padEnd(9)} ${String(trace.length).padStart(3)} actions  `
            + `${session.phase.padEnd(8)} ${warnings.length} warning(s)`
        );
        return true;
    }

    console.log(`\n${'='.repeat(72)}`);
    console.log(`${name}: ${game.meta.title}  [${game.topology.kind} / ${game.presentation.stageForm}]`);
    console.log(`revision ${revision.revisionId}`);
    console.log('='.repeat(72));

    if (warnings.length > 0) {
        console.log('\n-- compiler notes --');
        for (const d of warnings) console.log(`  ${formatDiagnostic(d)}`);
    }

    /* Replay the log one action at a time and narrate each phase as it is
       reached, so the printed playthrough is the session the log describes
       rather than a retelling of it. */
    console.log('\n-- playthrough --');
    let seenPhase = null;
    for (let i = 0; i <= session.actionLog.length; i += 1) {
        const partial = replay(game, revision, session.actionLog.slice(0, i), { sessionId: 'harness' });
        if (partial.phase !== seenPhase) {
            seenPhase = partial.phase;
            console.log(`\n${narrate(game, derive(game, partial))}`);
        }
    }

    console.log('\n-- actions --');
    for (const entry of trace) {
        const detail = [entry.action.piece, entry.action.place].filter(Boolean).join(' -> ');
        console.log(
            `  ${entry.ok ? ' ' : '!'} ${entry.action.kind.padEnd(18)} ${detail.padEnd(28)} ${entry.note ?? ''}`
            + (entry.refusal ? ` (${entry.refusal})` : '')
        );
    }

    console.log(`\n-- replay verified: ${verifyReplay(game, revision, session)} --`);

    console.log('\n-- analysis --');
    console.log(formatAnalysis(game, analyse(game, revision)));

    return true;
}

/* Proves every authored variant is reachable and narrates cleanly, rather than
   only whichever one the first legal plan happens to select. */
function playVariants(name) {
    const { ok, revision, diagnostics } = compileDraft(name);
    if (!ok) {
        console.log(`${name}: DID NOT COMPILE`);
        for (const d of diagnostics) console.log(`  ${formatDiagnostic(d)}`);
        return false;
    }

    const game = revision.compiledGame;

    for (const beat of game.beats) {
        for (const variant of beat.variants) {
            /* An aftershock beat fires on its own terms once revision is set,
               so its variants are exercised by the ordinary playthrough. */
            if (beat.trigger !== 'afterCommit') {
                console.log(`  ${name} ${beat.key}/${variant.key}: fires after revision`);
                continue;
            }
            const found = findCommitFor(game, revision, beat.key, variant.key);
            if (!found) {
                /* Hostile fixtures contain deliberately unreachable variants, so
                   this is reported rather than treated as a failure. */
                console.log(`  ${name} ${beat.key}/${variant.key}: no legal commit found that selects it`);
                continue;
            }
            const { session, trace, view } = autoplay(revision, {
                target: { beat: beat.key, variant: variant.key }
            });
            const fired = session.firedBeats.map((f) => `${f.beat}/${f.variant}`).join(', ');
            const narration = narrate(game, view);
            console.log(
                `  ${name} ${beat.key}/${variant.key}: `
                + `${found.pin ? `pin=${found.pin} ` : ''}${trace.length} actions, `
                + `fired [${fired}], ${session.phase}, ${narration.split('\n').length} narrated lines`
            );
        }
    }
    return true;
}

const args = process.argv.slice(2);
const pinIndex = args.indexOf('--pin');
const pin = pinIndex >= 0 ? args[pinIndex + 1] : null;
const names = args.filter((a) => !a.startsWith('--') && a !== pin);
const all = args.includes('--all');

let failures = 0;
if (args.includes('--variants')) {
    const targets = names.length > 0 ? names : Object.keys(allDrafts);
    console.log('-- every variant of every beat --');
    for (const name of targets) if (!playVariants(name)) failures += 1;
} else if (names.length > 0) {
    for (const name of names) if (!playOne(name, { pin, verbose: true })) failures += 1;
} else {
    for (const name of Object.keys(allDrafts)) {
        if (!playOne(name, { pin: null, verbose: all })) failures += 1;
    }
}

if (failures > 0) {
    console.error(`\n${failures} draft(s) did not compile.`);
    process.exitCode = 1;
}
