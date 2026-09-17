/* Engine One — a still frame of a world.

   A compiled game and a session in; one correct frame out. The four steps are
   the Stage pipeline: derive the World View, build marks, paint the space the
   form describes, render. The live Stage will be the same four steps with
   dispatch in front of them and choreography behind. */

import { derive } from '../model/index.js';
import { buildMarks } from './marks/build.js';
import { formAdapter } from './forms/adapter.js';
import { kitFor } from './kits/index.js';
import { createStageView } from './render/reconcile.js';

export function renderStill(container, game, session, { appearance = 'light' } = {}) {
    const adapter = formAdapter(game.presentation.stageForm);
    const view = derive(game, session);
    const markSet = buildMarks(game, view, adapter);

    const stage = createStageView(container, {
        kit: kitFor(game.presentation.kit),
        accent: game.presentation.accent,
        appearance,
        phase: view.phase,
        label: game.meta.title
    });
    stage.setGround(adapter.paintGround(game.layout));
    stage.render(markSet);

    return { stage, view, markSet };
}
