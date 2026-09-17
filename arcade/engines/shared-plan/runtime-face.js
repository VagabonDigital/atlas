/* Engine One — the Runtime Face.

   The only way in. A host hands over a verified Game Revision and gets back a
   controller; it never reaches past this into the model, the layout or the
   Stage.

   Only the preview still exists so far: a revision, and optionally the action
   log that reaches the frame to show, replayed through the real reducer exactly
   as a restore will replay it. The live Stage — input, saving, restore and the
   Beat Control — arrives later in B2, and `mount` says so rather than pretending. */

import { ENGINE_IDENTITY, SUPPORTED_DEFINITION_SCHEMA_VERSIONS, runtimeSeries } from './identity.js';
import { replay } from './model/index.js';
import { renderStill } from './stage/still.js';

/* What Core's verification does not cover: whether this build can read the
   compiled game inside the revision at all. */
function refuseUnreadable(revision) {
    if (!revision?.compiledGame) {
        throw new Error('Engine One was handed something that is not a Game Revision.');
    }
    if (!SUPPORTED_DEFINITION_SCHEMA_VERSIONS.includes(revision.definitionSchemaVersion)) {
        throw new Error(
            `This build reads Definition schema ${SUPPORTED_DEFINITION_SCHEMA_VERSIONS.join(', ')}, `
            + `and this revision is schema ${revision.definitionSchemaVersion}.`
        );
    }
    if (runtimeSeries(revision.engineRuntimeVersion) !== runtimeSeries(ENGINE_IDENTITY.runtimeVersion)) {
        throw new Error(
            `This revision was compiled for engine runtime ${revision.engineRuntimeVersion}, `
            + `which this build (${ENGINE_IDENTITY.runtimeVersion}) cannot interpret.`
        );
    }
    if (!revision.compiledGame.layout?.voices) {
        throw new Error('This revision was compiled before the Stage existed: its layout places no Voices.');
    }
}

const STILL_CONTROLLER = Object.freeze({
    serialise: () => null,
    restore: () => false,
    pause: () => {},
    invoke: (actionId) => {
        throw new Error(`A preview still has no actions to invoke (${actionId}).`);
    },
    subscribePrimaryActions: (listener) => {
        listener([]);
        return () => {};
    },
    subscribeFinish: () => () => {}
});

export const runtimeFace = Object.freeze({
    identity: ENGINE_IDENTITY,

    mount() {
        throw new Error('The live Engine One Stage is not built yet. Use mountPreviewStill.');
    },

    /* `actionLog` is an Engine One addition to the shared PreviewStillOptions:
       the log that reaches the frame being shown. Core never passes it; the
       workbench does, and phase jumping will use the same path. */
    mountPreviewStill(host, revision, { phase = 'plan', actionLog = [] } = {}) {
        refuseUnreadable(revision);
        const game = revision.compiledGame;
        const session = replay(game, revision, actionLog);
        if (session.phase !== phase) {
            throw new Error(`That action log reaches the ${session.phase} phase, not ${phase}.`);
        }

        const { stage, view, markSet } = renderStill(host.container, game, session, { appearance: host.appearance });
        return Object.freeze({
            ...STILL_CONTROLLER,
            destroy: () => stage.destroy(),
            /* Dev-only windows onto the frame, for the workbench. */
            still: Object.freeze({ view, markSet, setAppearance: (next) => stage.setAppearance(next) })
        });
    }
});

export default runtimeFace;
