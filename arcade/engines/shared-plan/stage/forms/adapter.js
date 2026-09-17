/* Engine One — Stage Forms.

   A form is a small adapter over shared machinery: it paints the space and
   bends a link through it, and nothing else in the Stage may branch on which
   form is playing. Forms never import the model, so a painter can never see a
   World View, let alone a Rule.

   A form that has no Stage yet refuses to mount. Borrowing another form's
   ground would put a Route's stops on a table, which is worse than a clear
   message. */

import { tableForm } from './table.js';

const FORMS = Object.freeze({ table: tableForm });

const NOT_BUILT_YET = Object.freeze({
    route: 'The Route Stage arrives later in B2.',
    vessel: 'The Vessel Stage arrives in B5.',
    site: 'The Site Stage arrives in B5.'
});

export class StageFormUnavailable extends Error {
    constructor(stageForm, message) {
        super(message);
        this.name = 'StageFormUnavailable';
        this.stageForm = stageForm;
    }
}

export function hasForm(stageForm) {
    return Object.hasOwn(FORMS, stageForm);
}

export function formAdapter(stageForm) {
    if (Object.hasOwn(FORMS, stageForm)) return FORMS[stageForm];
    throw new StageFormUnavailable(
        stageForm,
        NOT_BUILT_YET[stageForm] ?? `There is no Stage for the form "${stageForm}".`
    );
}
