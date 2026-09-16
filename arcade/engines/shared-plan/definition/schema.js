/* Engine One — the Authored Definition schema, v0.

   This is the single source of the contract. The compiler shape-checks against
   it, the resolver walks it to find references, and `definitionJsonSchema()`
   exports it for model structured output. */

import { S, toJsonSchema } from './schema-dsl.js';
import { BUDGETS } from './budgets.js';
import * as V from './vocabularies.js';

export const ENGINE_ID = 'shared-plan';
export const DEFINITION_SCHEMA_VERSION = '0';

const glyphIds = Object.keys(V.GLYPHS);
const kitIds = Object.keys(V.MATERIAL_KITS);
const allAccents = [...new Set(Object.values(V.MATERIAL_KITS).flatMap((k) => k.accents))];
const siteTemplateIds = Object.keys(V.SITE_TEMPLATES);
const allSlots = [...new Set(Object.values(V.SITE_TEMPLATES).flatMap((t) => t.slots))];

/* ---- shared small shapes ---- */

const TARGET = S.union({
    piece: S.object({ kind: S.const('piece'), piece: S.ref('piece') }),
    place: S.object({ kind: S.const('place'), place: S.ref('place') })
});

const LOCUS = S.union({
    piece: S.object({ kind: S.const('piece'), piece: S.ref('piece') }),
    place: S.object({ kind: S.const('place'), place: S.ref('place') }),
    voice: S.object({ kind: S.const('voice'), voice: S.ref('voice') }),
    threshold: S.object({ kind: S.const('threshold') })
});

/* A Piece, or every Piece carrying a tag. */
const SUBJECT = S.union({
    piece: S.object({ kind: S.const('piece'), piece: S.ref('piece') }),
    tag: S.object({ kind: S.const('tag'), tag: S.key() })
});

/* ---- predicates ---- */

/* Self-referential through `all` and `not`, so it is exported as a named
   definition rather than expanded inline. */
const PREDICATE = S.lazy(() => S.union({
    pieceIn: S.object({ kind: S.const('pieceIn'), piece: S.ref('piece'), place: S.ref('place') }),
    pieceCut: S.object({ kind: S.const('pieceCut'), piece: S.ref('piece') }),
    piecePinned: S.object({ kind: S.const('piecePinned'), piece: S.ref('piece') }),
    countTagged: S.object({
        kind: S.const('countTagged'),
        tag: S.key(),
        scope: S.enum(V.COUNT_SCOPES),
        place: S.ref('place', { optional: true }),
        cmp: S.enum(V.COMPARATORS),
        value: S.integer(0, BUDGETS.pieces.max)
    }),
    sumResource: S.object({
        kind: S.const('sumResource'),
        resource: S.ref('resource'),
        scope: S.enum(V.RESOURCE_SCOPES),
        place: S.ref('place', { optional: true }),
        cmp: S.enum(V.COMPARATORS),
        value: S.integer(0, 9999)
    }),
    beatFired: S.object({
        kind: S.const('beatFired'),
        beat: S.ref('beat'),
        variant: S.ref('variant', { optional: true })
    }),
    adjacent: S.object({ kind: S.const('adjacent'), a: S.ref('piece'), b: S.ref('piece') }),
    upstreamOf: S.object({ kind: S.const('upstreamOf'), piece: S.ref('piece'), place: S.ref('place') }),
    all: S.object({
        kind: S.const('all'),
        terms: S.array(PREDICATE, { min: 1, max: BUDGETS.predicateTerms.max })
    }),
    not: S.object({ kind: S.const('not'), term: PREDICATE })
}), { defName: 'predicate' });

/* ---- effects ---- */

const EFFECT = S.union({
    closePlace: S.object({ kind: S.const('closePlace'), place: S.ref('place') }),
    reopenPlace: S.object({ kind: S.const('reopenPlace'), place: S.ref('place') }),
    setCapacity: S.object({
        kind: S.const('setCapacity'),
        place: S.ref('place'),
        sockets: S.integer(0, BUDGETS.socketsPerPlace.max)
    }),
    adjustResourceLimit: S.object({
        kind: S.const('adjustResourceLimit'),
        resource: S.ref('resource'),
        limit: S.integer(0, 9999)
    }),
    makeUnavailable: S.object({ kind: S.const('makeUnavailable'), piece: S.ref('piece') }),
    introducePiece: S.object({ kind: S.const('introducePiece'), piece: S.ref('piece') }),
    activateRule: S.object({ kind: S.const('activateRule'), rule: S.ref('rule') }),
    activateGoal: S.object({ kind: S.const('activateGoal'), goal: S.ref('goal') }),
    lockPiece: S.object({ kind: S.const('lockPiece'), piece: S.ref('piece') }),
    lockPlace: S.object({ kind: S.const('lockPlace'), place: S.ref('place') }),
    revealFact: S.object({ kind: S.const('revealFact'), piece: S.ref('piece') }),
    shiftVoice: S.object({
        kind: S.const('shiftVoice'),
        voice: S.ref('voice'),
        claimVariant: S.integer(0, BUDGETS.claimVariantsPerVoice.max - 1)
    }),
    severAfter: S.object({ kind: S.const('severAfter'), place: S.ref('place') })
});

/* ---- rules ---- */

/* `status` and the collection fields are optional in the Draft and filled by
   the compiler with safe structural defaults: things exist and are empty unless
   the author says otherwise. Dormancy is always declared, never inferred. */
const ruleCommon = {
    key: S.key(),
    inscription: S.string('inscription'),
    status: S.enum(V.STATUSES, { optional: true })
};

const RULE = S.union({
    sumLimit: S.object({ ...ruleCommon, kind: S.const('sumLimit'), resource: S.ref('resource') }),
    allowedIn: S.object({
        ...ruleCommon,
        kind: S.const('allowedIn'),
        subject: SUBJECT,
        places: S.array(S.ref('place'), { min: 1, max: BUDGETS.places.max })
    }),
    requires: S.object({
        ...ruleCommon,
        kind: S.const('requires'),
        piece: S.ref('piece'),
        needs: SUBJECT,
        where: S.enum(V.REQUIRES_WHERE)
    }),
    together: S.object({ ...ruleCommon, kind: S.const('together'), a: S.ref('piece'), b: S.ref('piece') }),
    apart: S.object({ ...ruleCommon, kind: S.const('apart'), a: S.ref('piece'), b: S.ref('piece') }),
    near: S.object({ ...ruleCommon, kind: S.const('near'), a: S.ref('piece'), b: S.ref('piece') }),
    far: S.object({ ...ruleCommon, kind: S.const('far'), a: S.ref('piece'), b: S.ref('piece') }),
    before: S.object({ ...ruleCommon, kind: S.const('before'), a: S.ref('piece'), b: S.ref('piece') })
});

/* ---- sections ---- */

const PLACE = S.object({
    key: S.key(),
    name: S.string('placeName'),
    sayHint: S.string('sayHint', { optional: true }),
    glyph: S.enum(glyphIds),
    sockets: S.integer(BUDGETS.socketsPerPlace.min, BUDGETS.socketsPerPlace.max),
    /* graph topology only; the resolver rejects it elsewhere */
    slot: S.enum(allSlots, { optional: true }),
    descriptor: S.string('descriptor', { optional: true }),
    status: S.enum(V.STATUSES, { optional: true })
});

const PIECE = S.object({
    key: S.key(),
    name: S.string('pieceName'),
    sayHint: S.string('sayHint', { optional: true }),
    glyph: S.enum(glyphIds),
    fact: S.object({
        text: S.string('fact'),
        hidden: S.boolean()
    }, { optional: true }),
    tags: S.array(S.key(), { max: BUDGETS.tagsPerPiece.max, optional: true }),
    resources: S.array(S.object({
        resource: S.ref('resource'),
        value: S.integer(0, 9999)
    }), { max: BUDGETS.resources.max, optional: true }),
    status: S.enum(V.STATUSES, { optional: true })
});

const RESOURCE = S.object({
    key: S.key(),
    label: S.string('name'),
    unit: S.string('unitWord'),
    scope: S.enum(V.RESOURCE_SCOPES),
    limit: S.integer(0, 9999),
    render: S.enum(V.RESOURCE_RENDERS)
});

const GOAL = S.object({
    key: S.key(),
    label: S.string('goalLabel'),
    condition: PREDICATE,
    impossibleWhen: S.lazy(() => PREDICATE, { optional: true }),
    reachedLine: S.string('outcome'),
    missedLine: S.string('outcome'),
    status: S.enum(V.STATUSES, { optional: true })
});

const VOICE = S.object({
    key: S.key(),
    name: S.string('name'),
    role: S.string('descriptor'),
    claim: S.string('claim'),
    /* Analysis only. Never rendered, so Atlas still never scores a Stake. */
    concern: S.lazy(() => PREDICATE, { optional: true }),
    claimVariants: S.array(S.string('claim'), { max: BUDGETS.claimVariantsPerVoice.max, optional: true }),
    tethers: S.array(TARGET, { max: BUDGETS.tethersPerVoice.max, optional: true }),
    anchor: TARGET,
    outcomes: S.array(S.object({
        condition: S.lazy(() => PREDICATE),
        line: S.string('outcome')
    }), { max: BUDGETS.outcomesPerVoice.max, optional: true }),
    fallbackOutcome: S.string('outcome')
});

const VARIANT = S.object({
    key: S.key(),
    guard: S.lazy(() => PREDICATE, { optional: true }),
    effects: S.array(EFFECT, { max: BUDGETS.effectsPerVariant.max, optional: true }),
    staging: S.enum(V.STAGING_PRESETS),
    severity: S.enum(V.SEVERITIES),
    entryEdge: S.enum(V.ENTRY_EDGES),
    locus: LOCUS,
    headline: S.string('headline'),
    scarLabel: S.string('scarLabel')
});

const BEAT = S.object({
    key: S.key(),
    trigger: S.enum(V.BEAT_TRIGGERS),
    omen: S.object({
        edge: S.enum(V.ENTRY_EDGES),
        text: S.string('omen')
    }, { optional: true }),
    variants: S.array(VARIANT, { min: BUDGETS.variantsPerBeat.min, max: BUDGETS.variantsPerBeat.max })
});

export const DEFINITION_SCHEMA = S.object({
    contract: S.object({
        engineId: S.const(ENGINE_ID),
        schemaVersion: S.const(DEFINITION_SCHEMA_VERSION)
    }),
    meta: S.object({
        title: S.string('title'),
        premise: S.string('premise'),
        levelBand: S.enum(V.LEVEL_BANDS),
        targetMinutes: S.integer(5, 30),
        tone: S.enum(V.TONE_PRESETS)
    }),
    /* Never rendered. Steers generation and Class C review. */
    design: S.object({
        tensionShape: S.enum(V.TENSION_SHAPES),
        pressureSignature: S.enum(V.PRESSURE_SIGNATURES),
        intendedDilemma: S.string('intendedDilemma'),
        languageFocus: S.array(S.key(), { max: BUDGETS.languageFocus.max, optional: true })
    }),
    presentation: S.object({
        stageForm: S.enum(Object.keys(V.STAGE_FORMS)),
        kit: S.enum(kitIds),
        accent: S.enum(allAccents)
    }),
    world: S.object({
        topology: S.enum(V.TOPOLOGY_KINDS),
        siteTemplate: S.enum(siteTemplateIds, { optional: true }),
        thresholdLabel: S.string('name'),
        marginLabel: S.string('name'),
        clockLabel: S.string('clockLabel')
    }),
    places: S.array(PLACE, { min: BUDGETS.places.min, max: BUDGETS.places.max }),
    pieces: S.array(PIECE, { min: BUDGETS.pieces.min, max: BUDGETS.pieces.max }),
    resources: S.array(RESOURCE, { max: BUDGETS.resources.max, optional: true }),
    rules: S.array(RULE, { max: BUDGETS.rules.max, optional: true }),
    goals: S.array(GOAL, { min: BUDGETS.goals.min, max: BUDGETS.goals.max }),
    voices: S.array(VOICE, { max: BUDGETS.voices.max, optional: true }),
    beats: S.array(BEAT, { min: BUDGETS.beats.min, max: BUDGETS.beats.max }),
    resolution: S.object({
        hindsight: S.array(S.object({
            piece: S.ref('piece'),
            condition: S.lazy(() => PREDICATE),
            note: S.string('hindsight')
        }), { max: BUDGETS.hindsightNotes.max, optional: true })
    }, { optional: true }),
    tutor: S.object({
        brief: S.string('brief'),
        prompts: S.record(V.PHASES, S.array(S.string('prompt'), { max: BUDGETS.promptsPerPhase.max }), { optional: true })
    })
});

export { PREDICATE, EFFECT, RULE, TARGET, LOCUS, SUBJECT };

export function definitionJsonSchema() {
    return {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        title: `Engine One Authored Definition v${DEFINITION_SCHEMA_VERSION}`,
        ...toJsonSchema(DEFINITION_SCHEMA)
    };
}
