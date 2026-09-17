/* Engine One — the Stage.

   Reads the World View and the compiled layout, and draws them. It owns no
   state, interprets no Rule and never writes to a session: everything it shows
   was decided by the model and measured by the compiler.

   Pure parts (marks, forms, kits) run in Node and are tested there. Rendering
   needs a document. */

export { buildMarks, MARK_TYPES, LAYERS, StageNotBuiltError } from './marks/build.js';
export { markId } from './marks/ids.js';
export { formAdapter, hasForm, StageFormUnavailable } from './forms/adapter.js';
export { TOKENS, kitFor, kitIds } from './kits/index.js';
export { createStageView } from './render/reconcile.js';
export { ensureStylesheets, stylesheetHrefs } from './render/styles.js';
export { renderStill } from './still.js';
