/* Engine One — diagnostics.

   Diagnostics are a product surface, not debug output. Every finding has a
   stable code, a locus naming the key it is about, a plain-English message for
   a human author and a model-directed message for a bounded repair round. The
   difference between a repair that works and one that thrashes is almost
   entirely here. */

export const SEVERITY = Object.freeze({ error: 'error', warning: 'warning', info: 'info' });

export function makeSink() {
    const entries = [];
    const report = (entry) => {
        entries.push({
            severity: SEVERITY.error,
            ...entry,
            modelMessage: entry.modelMessage ?? entry.message
        });
    };
    report.warn = (entry) => report({ ...entry, severity: SEVERITY.warning });
    report.info = (entry) => report({ ...entry, severity: SEVERITY.info });
    report.entries = entries;
    report.errors = () => entries.filter((e) => e.severity === SEVERITY.error);
    report.warnings = () => entries.filter((e) => e.severity === SEVERITY.warning);
    report.hasErrors = () => entries.some((e) => e.severity === SEVERITY.error);
    return report;
}

export function formatDiagnostic(entry) {
    const at = entry.locus ? ` (${entry.locus})` : '';
    return `[${entry.severity}] ${entry.code}${at}: ${entry.message}`;
}

/* One block of instruction per finding, for the single bounded repair round.
   Fresh candidates beat deep repair, so this is written to be actionable in one
   pass rather than to open a negotiation. */
export function phraseForRepair(diagnostics) {
    const errors = diagnostics.filter((d) => d.severity === SEVERITY.error);
    if (errors.length === 0) return 'No blocking problems.';
    const lines = errors.map((d, i) => `${i + 1}. ${d.locus ? `At ${d.locus}: ` : ''}${d.modelMessage}`);
    return [
        'The Definition you produced did not compile. Fix exactly these problems and return the whole Definition again.',
        'Do not change anything else, and do not explain the changes.',
        '',
        ...lines
    ].join('\n');
}
