/* Engine One — the workbench.

   A developer's window onto the engine. It mounts worlds only through the
   Runtime Face, exactly as Core will, so whatever it shows is what the product
   would show. Everything it adds around the Stage — the identity panel, the
   Beat Control preview, the frame facts — is chrome, outside the world.

   Frames are reached by replaying an action log through the real reducer, which
   is the same path a restore takes. */

import { runtimeFace } from '../shared-plan/runtime-face.js';
import { verifyRevision } from '../shared-plan/compiler/index.js';
import { Actions, firstValidCommit } from '../shared-plan/model/index.js';

const REVISIONS = ['r-a', 'r-b', 'r-c'];

const FRAMES = {
    start: {
        label: 'Plan · start',
        note: 'The world as it opens: everyone waiting at the Threshold, nothing decided.',
        actionLog: () => []
    },
    seated: {
        label: 'Plan · seated',
        note: 'The first arrangement the enumerator finds that could be committed, placed one Piece at a time through the real reducer.',
        actionLog: (game, revision) => {
            const placements = firstValidCommit(game, revision);
            if (!placements) return [];
            return game.pieces
                .filter((piece) => placements[piece.key]?.kind === 'place')
                .map((piece) => Actions.place(piece.key, placements[piece.key].place));
        }
    }
};

const el = (id) => document.getElementById(id);
let controller = null;

function readState() {
    const params = new URLSearchParams(location.search);
    const revision = REVISIONS.includes(params.get('revision')) ? params.get('revision') : REVISIONS[0];
    const frame = Object.hasOwn(FRAMES, params.get('frame')) ? params.get('frame') : 'start';
    const appearance = params.get('appearance') === 'night' ? 'night' : 'light';
    return { revision, frame, appearance };
}

function writeState(state) {
    const params = new URLSearchParams(state);
    history.replaceState(null, '', `?${params.toString()}`);
}

function fillControls(state) {
    const revision = el('revision');
    if (revision.options.length === 0) {
        for (const id of REVISIONS) revision.append(new Option(id.toUpperCase(), id));
        for (const [id, frame] of Object.entries(FRAMES)) el('frame').append(new Option(frame.label, id));
    }
    revision.value = state.revision;
    el('frame').value = state.frame;
    el('appearance').value = state.appearance;
}

function facts(target, rows) {
    target.replaceChildren();
    for (const [term, value, bad] of rows) {
        const dt = document.createElement('dt');
        dt.textContent = term;
        const dd = document.createElement('dd');
        dd.textContent = value;
        if (bad) dd.className = 'is-bad';
        target.append(dt, dd);
    }
}

function setError(message) {
    const box = el('error');
    box.textContent = message;
    box.hidden = !message;
}

function showIdentity(revision, check) {
    facts(el('identity'), [
        ['Id', revision.revisionId],
        ['Hash', revision.contentHash],
        ['Schema', revision.definitionSchemaVersion],
        ['Compiler', revision.compilerVersion],
        ['Runtime', revision.engineRuntimeVersion],
        ['Verified', check.ok ? 'yes' : check.problems.join('; '), !check.ok]
    ]);
}

function showBeatControl(actions) {
    const box = el('beat');
    box.replaceChildren();
    for (const action of actions) {
        const item = document.createElement('div');
        item.className = 'wb-action';
        item.dataset.enabled = String(action.enabled);
        const label = document.createElement('b');
        label.textContent = action.label;
        const detail = document.createElement('span');
        detail.textContent = action.enabled
            ? `${action.interaction} · ${action.placement}`
            : `unavailable: ${action.reason}`;
        item.append(label, detail);
        box.append(item);
    }
}

function showFrame(game, still) {
    const counts = new Map();
    for (const mark of still.markSet.marks.values()) {
        counts.set(mark.type, (counts.get(mark.type) ?? 0) + 1);
    }
    facts(el('frame-facts'), [
        ['Form', game.presentation.stageForm],
        ['Kit', `${game.presentation.kit} · ${game.presentation.accent}`],
        ['Phase', still.markSet.phase],
        ['Voices', game.layout.voices.placement],
        ['Marks', [...counts].map(([type, n]) => `${n} ${type}`).join(', ')]
    ]);
}

async function show() {
    const state = readState();
    fillControls(state);
    writeState(state);

    const host = el('stage');
    controller?.destroy();
    controller = null;
    host.replaceChildren();
    delete host.dataset.ready;
    setError('');
    el('note').textContent = FRAMES[state.frame].note;

    let revision;
    try {
        const response = await fetch(`../../definitions/revisions/${state.revision}.json`);
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        revision = await response.json();
    } catch (error) {
        setError(`That revision could not be loaded: ${error.message}`);
        return;
    }

    const check = verifyRevision(revision);
    showIdentity(revision, check);
    if (!check.ok) {
        setError(`This revision does not verify: ${check.problems.join('; ')}`);
        return;
    }

    const game = revision.compiledGame;
    try {
        const actionLog = FRAMES[state.frame].actionLog(game, revision);
        controller = runtimeFace.mountPreviewStill(
            { container: host, appearance: state.appearance },
            revision,
            { phase: 'plan', actionLog }
        );
        showBeatControl(controller.still.view.primaryActions);
        showFrame(game, controller.still);
        host.dataset.ready = 'true';
    } catch (error) {
        setError(error.message);
        showBeatControl([]);
        facts(el('frame-facts'), [['Form', game.presentation.stageForm], ['Stage', 'not built for this world yet']]);
    }
}

el('controls').addEventListener('change', (event) => {
    const state = readState();
    state[event.target.name] = event.target.value;
    writeState(state);
    show();
});

show();

/* The development server pushes a reload when a file changes. */
if (['localhost', '127.0.0.1'].includes(location.hostname)) {
    new EventSource('/__reload').addEventListener('message', () => location.reload());
}
