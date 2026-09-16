/* Engine One — budgets.
   Single source for every budget number. The compiler enforces these, analysis
   relies on them for tractability, and generated constraint text is derived
   from them so prompts cannot drift from the compiler. */

export const BUDGETS = Object.freeze({
    places: Object.freeze({ min: 2, max: 5 }),
    pieces: Object.freeze({ min: 2, max: 8 }),
    resources: Object.freeze({ min: 0, max: 2 }),
    rules: Object.freeze({ min: 0, max: 6 }),
    goals: Object.freeze({ min: 1, max: 3 }),
    voices: Object.freeze({ min: 0, max: 4 }),
    beats: Object.freeze({ min: 1, max: 2 }),
    variantsPerBeat: Object.freeze({ min: 1, max: 4 }),
    effectsPerVariant: Object.freeze({ min: 0, max: 3 }),
    tagsPerPiece: Object.freeze({ min: 0, max: 3 }),
    tethersPerVoice: Object.freeze({ min: 0, max: 2 }),
    claimVariantsPerVoice: Object.freeze({ min: 0, max: 2 }),
    outcomesPerVoice: Object.freeze({ min: 0, max: 3 }),
    socketsPerPlace: Object.freeze({ min: 1, max: 6 }),
    hindsightNotes: Object.freeze({ min: 0, max: 4 }),
    languageFocus: Object.freeze({ min: 0, max: 4 }),
    promptsPerPhase: Object.freeze({ min: 0, max: 2 }),
    predicateDepth: Object.freeze({ max: 2 }),
    predicateTerms: Object.freeze({ max: 4 }),
    visibleWordsPerPhase: Object.freeze({ max: 70 })
});

/* Every string in the contract has a text kind. Each kind carries a word
   budget, a character budget and the typographic scale role the layout module
   measures it against. */
export const TEXT_KINDS = Object.freeze({
    title: Object.freeze({ words: 5, chars: 40, scale: 'title', onStage: true }),
    premise: Object.freeze({ words: 24, chars: 160, scale: 'premise', onStage: true }),
    /* Place names head a frame and get its full width. Piece names are read
       inside a socket cell in the narrowest Place on the Stage, which is a much
       smaller slot, so they carry a tighter budget. One `name` kind could not
       honestly serve both. */
    name: Object.freeze({ words: 3, chars: 22, scale: 'name', onStage: true }),
    placeName: Object.freeze({ words: 3, chars: 22, scale: 'name', onStage: true }),
    pieceName: Object.freeze({ words: 2, chars: 16, scale: 'micro', onStage: true }),
    sayHint: Object.freeze({ words: 4, chars: 28, scale: 'micro', onStage: false }),
    descriptor: Object.freeze({ words: 6, chars: 40, scale: 'micro', onStage: true }),
    fact: Object.freeze({ words: 10, chars: 64, scale: 'micro', onStage: true }),
    inscription: Object.freeze({ words: 6, chars: 40, scale: 'inscription', onStage: true }),
    claim: Object.freeze({ words: 12, chars: 80, scale: 'claim', onStage: true }),
    headline: Object.freeze({ words: 12, chars: 80, scale: 'headline', onStage: true }),
    outcome: Object.freeze({ words: 14, chars: 96, scale: 'claim', onStage: true }),
    goalLabel: Object.freeze({ words: 8, chars: 34, scale: 'goal', onStage: true }),
    scarLabel: Object.freeze({ words: 2, chars: 18, scale: 'micro', onStage: true }),
    omen: Object.freeze({ words: 6, chars: 40, scale: 'micro', onStage: true }),
    clockLabel: Object.freeze({ words: 3, chars: 20, scale: 'micro', onStage: true }),
    unitWord: Object.freeze({ words: 1, chars: 12, scale: 'micro', onStage: true }),
    hindsight: Object.freeze({ words: 10, chars: 64, scale: 'micro', onStage: true }),
    /* Off-stage kinds are never rendered on the Stage and are excluded from
       the visible-word budget. */
    brief: Object.freeze({ words: 80, chars: 520, scale: 'offstage', onStage: false }),
    prompt: Object.freeze({ words: 15, chars: 100, scale: 'offstage', onStage: false }),
    intendedDilemma: Object.freeze({ words: 40, chars: 260, scale: 'offstage', onStage: false })
});

export function textKind(kind) {
    const spec = TEXT_KINDS[kind];
    if (!spec) throw new Error(`Unknown text kind: ${kind}`);
    return spec;
}

export function countWords(value) {
    if (typeof value !== 'string') return 0;
    const trimmed = value.trim();
    if (trimmed === '') return 0;
    return trimmed.split(/\s+/u).length;
}

/* Rendered as constraint text inside generation prompts so the model is told
   exactly what the compiler will enforce. */
export function describeBudgets() {
    const lines = [];
    for (const [name, spec] of Object.entries(BUDGETS)) {
        const parts = [];
        if (typeof spec.min === 'number') parts.push(`at least ${spec.min}`);
        if (typeof spec.max === 'number') parts.push(`at most ${spec.max}`);
        lines.push(`${name}: ${parts.join(', ')}`);
    }
    for (const [name, spec] of Object.entries(TEXT_KINDS)) {
        lines.push(`text.${name}: at most ${spec.words} words / ${spec.chars} characters`);
    }
    return lines;
}
