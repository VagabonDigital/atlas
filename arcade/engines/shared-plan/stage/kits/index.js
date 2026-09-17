/* Engine One — material kits.

   A kit is a complete set of tokens for both appearances. The Stage styles
   everything through these names, so a kit can change how a world is made
   without any mark knowing.

   Only the neutral kit exists so far: enough to read the world honestly, and
   deliberately plain, so the authored kits are judged as design rather than
   inherited by accident. Every Definition's kit renders through it until then. */

export const TOKENS = Object.freeze([
    /* surfaces */
    'bleed', 'ground', 'texture', 'zone', 'surface', 'surface-edge', 'setting', 'setting-edge',
    'passage', 'passage-edge', 'rest', 'rest-edge', 'socket-edge',
    /* inks */
    'ink', 'ink-quiet', 'ink-faint',
    /* the materials a Piece passes through */
    'provisional-fill', 'provisional-edge', 'set-fill', 'set-edge',
    'strained-edge', 'loosened-edge', 'resolved-fill',
    /* marks */
    'tether', 'seam', 'scar', 'imprint', 'drift', 'meter', 'hatch',
    'voice-card', 'voice-edge', 'medallion', 'medallion-ink',
    /* light */
    'accent', 'focus', 'shadow',
    /* type */
    'font-names', 'font-display'
]);

const DEFAULT_KIT = 'neutral';

const BUILT = Object.freeze({ neutral: { label: 'neutral' } });

/* Until the authored kits arrive, every kit resolves to the neutral one. */
export function kitFor(kitId) {
    return Object.hasOwn(BUILT, kitId) ? kitId : DEFAULT_KIT;
}

export function kitIds() {
    return Object.keys(BUILT);
}
