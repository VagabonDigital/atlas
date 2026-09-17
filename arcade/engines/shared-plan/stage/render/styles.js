/* Engine One — Stage stylesheets.

   The Stage carries its own tokens and rules, so any host that mounts it gets a
   complete world without knowing what to link. A host that has already linked
   them (the workbench does, so the first frame is painted before script runs)
   marks them, and nothing is added twice. */

const SHEETS = Object.freeze(['../kits/tokens.css', './stage.css']);

export function ensureStylesheets(doc = document) {
    for (const relative of SHEETS) {
        const href = new URL(relative, import.meta.url).href;
        if (doc.querySelector(`link[data-sp-stage][href="${href}"]`)) continue;
        const link = doc.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.dataset.spStage = '';
        doc.head.append(link);
    }
}

export function stylesheetHrefs() {
    return SHEETS.map((relative) => new URL(relative, import.meta.url).href);
}
