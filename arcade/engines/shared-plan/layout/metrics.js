/* Engine One — font metrics.

   The compiler has to know whether a name fits before anyone opens a browser,
   because a name that overflows is a Class A error rather than a rendering
   problem discovered on a call.

   These are deliberately conservative estimates for a humanist sans at the
   smallest legible scale. Build phase B2 compares them against real rendered
   text across kits and browsers; if they prove optimistic, the ratios tighten
   here and every game is re-measured by recompiling. */

export const SCALE_ROLES = Object.freeze({
    title: Object.freeze({ fontSize: 34, tracking: 1.0 }),
    premise: Object.freeze({ fontSize: 20, tracking: 1.0 }),
    name: Object.freeze({ fontSize: 22, tracking: 1.0 }),
    headline: Object.freeze({ fontSize: 28, tracking: 1.0 }),
    claim: Object.freeze({ fontSize: 16, tracking: 1.0 }),
    goal: Object.freeze({ fontSize: 18, tracking: 1.0 }),
    inscription: Object.freeze({ fontSize: 14, tracking: 1.02 }),
    micro: Object.freeze({ fontSize: 13, tracking: 1.02 }),
    /* Never rendered on the Stage, so never measured. */
    offstage: Object.freeze({ fontSize: 0, tracking: 1.0 })
});

const NARROW = new Set([...'iljItf.,;:\'"|!()[]-']);
const WIDE = new Set([...'mMWw@']);
const UPPER = /[A-Z]/u;
const DIGIT = /[0-9]/u;

function charRatio(ch) {
    if (ch === ' ') return 0.28;
    if (NARROW.has(ch)) return 0.28;
    if (WIDE.has(ch)) return 0.88;
    if (UPPER.test(ch)) return 0.66;
    if (DIGIT.test(ch)) return 0.56;
    return 0.53;
}

export function measure(text, scaleRole) {
    const scale = SCALE_ROLES[scaleRole];
    if (!scale) throw new Error(`Unknown scale role: ${scaleRole}`);
    if (scale.fontSize === 0) return 0;
    let ems = 0;
    for (const ch of text) ems += charRatio(ch);
    return ems * scale.fontSize * scale.tracking;
}

export function fits(text, scaleRole, maxWidth) {
    return measure(text, scaleRole) <= maxWidth;
}

/* Most Stage text wraps: a Piece name under a socket, a Voice claim beneath a
   medallion, a headline inscribed at a locus. Measuring those as one line would
   reject text that renders perfectly well.

   Two things have to hold. The longest single word must fit one line, because a
   word cannot be broken. And the whole string must fit the lines available. */
export function wrappedFit(text, scaleRole, maxWidth, lines) {
    const longestWord = text
        .split(/\s+/u)
        .reduce((widest, word) => Math.max(widest, measure(word, scaleRole)), 0);
    const total = measure(text, scaleRole);
    return {
        ok: longestWord <= maxWidth && total <= maxWidth * lines,
        longestWord,
        total,
        capacity: maxWidth * lines
    };
}
