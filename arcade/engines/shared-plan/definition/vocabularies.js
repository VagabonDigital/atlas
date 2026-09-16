/* Engine One — closed vocabularies.
   Every presentational and mechanical choice a Definition makes is an ID from
   one of these sets. Nothing here may be extended by an authored Definition. */

export const TOPOLOGY_KINDS = Object.freeze(['groups', 'sequence', 'graph']);

/* The phase machine is mechanical, but the contract references phases (tutor
   prompts are keyed by them), so the ordered set lives with the vocabularies
   and the model imports it from here. */
export const PHASES = Object.freeze(['plan', 'commit', 'perturb', 'react', 'revise', 'resolve']);

/* Stage Forms carry presentational meaning; topology kinds carry mechanical
   meaning. Several forms may share one topology kind and therefore one solver. */
export const STAGE_FORMS = Object.freeze({
    table: Object.freeze({ topology: 'groups', ground: 'table' }),
    vessel: Object.freeze({ topology: 'groups', ground: 'vessel' }),
    route: Object.freeze({ topology: 'sequence', ground: 'route' }),
    site: Object.freeze({ topology: 'graph', ground: 'site' })
});

export function formsForTopology(topology) {
    return Object.keys(STAGE_FORMS).filter((f) => STAGE_FORMS[f].topology === topology);
}

/* Graph adjacency comes from authored templates, never from generated edge
   lists. A Definition picks a template and assigns Places to slots, which makes
   an unlayoutable or disconnected world impossible to express. */
export const SITE_TEMPLATES = Object.freeze({
    laneOfSix: Object.freeze({
        label: 'lane of six',
        slots: Object.freeze(['n1', 'n2', 'n3', 's1', 's2', 's3']),
        edges: Object.freeze([
            Object.freeze(['n1', 'n2']), Object.freeze(['n2', 'n3']),
            Object.freeze(['s1', 's2']), Object.freeze(['s2', 's3']),
            Object.freeze(['n1', 's1']), Object.freeze(['n2', 's2']), Object.freeze(['n3', 's3'])
        ])
    }),
    ringOfFive: Object.freeze({
        label: 'ring of five',
        slots: Object.freeze(['r1', 'r2', 'r3', 'r4', 'r5']),
        edges: Object.freeze([
            Object.freeze(['r1', 'r2']), Object.freeze(['r2', 'r3']), Object.freeze(['r3', 'r4']),
            Object.freeze(['r4', 'r5']), Object.freeze(['r5', 'r1'])
        ])
    }),
    quadOfFour: Object.freeze({
        label: 'quad of four',
        slots: Object.freeze(['q1', 'q2', 'q3', 'q4']),
        edges: Object.freeze([
            Object.freeze(['q1', 'q2']), Object.freeze(['q2', 'q4']),
            Object.freeze(['q4', 'q3']), Object.freeze(['q3', 'q1'])
        ])
    })
});

/* Rule families. Count capacity is implicit in socket counts and is therefore
   not an authored rule. */
export const RULE_KINDS = Object.freeze({
    sumLimit: Object.freeze({ topologies: TOPOLOGY_KINDS }),
    allowedIn: Object.freeze({ topologies: TOPOLOGY_KINDS }),
    requires: Object.freeze({ topologies: TOPOLOGY_KINDS }),
    together: Object.freeze({ topologies: TOPOLOGY_KINDS }),
    apart: Object.freeze({ topologies: TOPOLOGY_KINDS }),
    near: Object.freeze({ topologies: Object.freeze(['graph']) }),
    far: Object.freeze({ topologies: Object.freeze(['graph']) }),
    before: Object.freeze({ topologies: Object.freeze(['sequence']) })
});

export const PREDICATE_KINDS = Object.freeze({
    pieceIn: Object.freeze({ topologies: TOPOLOGY_KINDS }),
    pieceCut: Object.freeze({ topologies: TOPOLOGY_KINDS }),
    piecePinned: Object.freeze({ topologies: TOPOLOGY_KINDS }),
    countTagged: Object.freeze({ topologies: TOPOLOGY_KINDS }),
    sumResource: Object.freeze({ topologies: TOPOLOGY_KINDS }),
    beatFired: Object.freeze({ topologies: TOPOLOGY_KINDS }),
    adjacent: Object.freeze({ topologies: Object.freeze(['graph']) }),
    upstreamOf: Object.freeze({ topologies: Object.freeze(['sequence']) }),
    all: Object.freeze({ topologies: TOPOLOGY_KINDS, combinator: true }),
    not: Object.freeze({ topologies: TOPOLOGY_KINDS, combinator: true })
});

/* No effect moves a Piece. That guarantee comes from the vocabulary itself
   rather than from validation. */
export const EFFECT_KINDS = Object.freeze({
    closePlace: Object.freeze({ topologies: TOPOLOGY_KINDS }),
    reopenPlace: Object.freeze({ topologies: TOPOLOGY_KINDS }),
    setCapacity: Object.freeze({ topologies: TOPOLOGY_KINDS }),
    adjustResourceLimit: Object.freeze({ topologies: TOPOLOGY_KINDS }),
    makeUnavailable: Object.freeze({ topologies: TOPOLOGY_KINDS }),
    introducePiece: Object.freeze({ topologies: TOPOLOGY_KINDS }),
    activateRule: Object.freeze({ topologies: TOPOLOGY_KINDS }),
    activateGoal: Object.freeze({ topologies: TOPOLOGY_KINDS }),
    lockPiece: Object.freeze({ topologies: TOPOLOGY_KINDS }),
    lockPlace: Object.freeze({ topologies: TOPOLOGY_KINDS }),
    revealFact: Object.freeze({ topologies: TOPOLOGY_KINDS }),
    shiftVoice: Object.freeze({ topologies: TOPOLOGY_KINDS }),
    severAfter: Object.freeze({ topologies: Object.freeze(['sequence']) })
});

export const COMPARATORS = Object.freeze(['eq', 'ne', 'lt', 'lte', 'gt', 'gte']);
export const RESOURCE_SCOPES = Object.freeze(['place', 'plan']);
export const COUNT_SCOPES = Object.freeze(['place', 'plan', 'margin']);
export const RESOURCE_RENDERS = Object.freeze(['loadLine', 'clock']);
export const REQUIRES_WHERE = Object.freeze(['samePlace', 'anywhere']);
export const STATUSES = Object.freeze(['active', 'dormant']);
export const BEAT_TRIGGERS = Object.freeze(['afterCommit', 'afterRevision']);

export const STAGING_PRESETS = Object.freeze([
    'arrival', 'closure', 'rupture', 'drought', 'revelation', 'voice'
]);
export const SEVERITIES = Object.freeze(['quiet', 'sharp', 'heavy']);
export const ENTRY_EDGES = Object.freeze([
    'north', 'east', 'south', 'west', 'threshold', 'horizon'
]);

/* Pressure categories are derived from staging presets for the off-Stage tutor
   brief, so the tutor can be told "something will close" without being told
   which Place. */
export const PRESSURE_CATEGORY_BY_PRESET = Object.freeze({
    arrival: 'something arrives',
    closure: 'something closes',
    rupture: 'something breaks',
    drought: 'something runs short',
    revelation: 'something is not what it seemed',
    voice: 'someone changes their mind'
});

export const TENSION_SHAPES = Object.freeze([
    'safetyVsMeaning',
    'twoVoicesOneScarcePlace',
    'earlyCommitmentBlocksLaterOpportunity',
    'loyaltyVsEfficiency',
    'protectThePinnedVsProtectTheGroup',
    'speedVsCare',
    'fairPlanVsWorkingPlan',
    'heritageVsVitality'
]);

export const PRESSURE_SIGNATURES = Object.freeze([
    'loss', 'scarcity', 'arrival', 'time', 'revelation', 'voiceShift'
]);

export const TONE_PRESETS = Object.freeze(['playful', 'warm', 'grave', 'dry']);

export const MATERIAL_KITS = Object.freeze({
    draftingRoom: Object.freeze({
        label: 'architectural drafting',
        accents: Object.freeze(['graphite', 'blueprint', 'redline']),
        forms: Object.freeze(['table', 'vessel', 'route', 'site'])
    }),
    fieldNotebook: Object.freeze({
        label: 'field notebook',
        accents: Object.freeze(['ink', 'moss', 'clay']),
        forms: Object.freeze(['table', 'vessel', 'route', 'site'])
    })
});

export const LEVEL_BANDS = Object.freeze(['A2-B1', 'B1-B2', 'B2-C1', 'C1-C2']);

/* A curated, tagged glyph library. Models choose by tag search; the compiler
   rejects unknown IDs; a monogram fallback always exists. Glyph plus name must
   always suffice, so no glyph is ever load-bearing for comprehension. */
export const GLYPHS = Object.freeze({
    hearth: Object.freeze(['home', 'warmth', 'gathering']),
    table: Object.freeze(['gathering', 'meal', 'meeting']),
    door: Object.freeze(['threshold', 'access', 'entry']),
    garden: Object.freeze(['growth', 'outdoor', 'quiet']),
    workshop: Object.freeze(['making', 'tools', 'work']),
    store: Object.freeze(['supply', 'stock', 'trade']),
    clinic: Object.freeze(['care', 'health', 'shelter']),
    school: Object.freeze(['learning', 'children', 'civic']),
    harbour: Object.freeze(['water', 'arrival', 'trade']),
    bridge: Object.freeze(['crossing', 'link', 'route']),
    depot: Object.freeze(['storage', 'logistics', 'route']),
    crate: Object.freeze(['load', 'goods', 'weight']),
    barrel: Object.freeze(['load', 'liquid', 'supply']),
    lantern: Object.freeze(['light', 'guide', 'night']),
    tent: Object.freeze(['shelter', 'temporary', 'field']),
    tower: Object.freeze(['signal', 'height', 'watch']),
    well: Object.freeze(['water', 'shared', 'civic']),
    archive: Object.freeze(['record', 'memory', 'paper']),
    kitchen: Object.freeze(['food', 'heat', 'work']),
    bench: Object.freeze(['rest', 'public', 'quiet']),
    person: Object.freeze(['people', 'guest', 'worker']),
    elder: Object.freeze(['people', 'age', 'family']),
    child: Object.freeze(['people', 'young', 'family']),
    crew: Object.freeze(['people', 'work', 'team']),
    animal: Object.freeze(['livestock', 'care', 'field']),
    instrument: Object.freeze(['music', 'craft', 'delicate']),
    generator: Object.freeze(['power', 'machine', 'critical']),
    pump: Object.freeze(['water', 'machine', 'critical']),
    radio: Object.freeze(['signal', 'contact', 'machine']),
    toolkit: Object.freeze(['repair', 'tools', 'work']),
    medicine: Object.freeze(['care', 'critical', 'supply']),
    seed: Object.freeze(['growth', 'future', 'supply']),
    book: Object.freeze(['record', 'learning', 'paper']),
    painting: Object.freeze(['art', 'heirloom', 'delicate']),
    clock: Object.freeze(['time', 'machine', 'record'])
});

export function glyphsByTag(tag) {
    return Object.keys(GLYPHS).filter((g) => GLYPHS[g].includes(tag));
}

export function isVocabularyMember(set, value) {
    return Array.isArray(set) ? set.includes(value) : Object.hasOwn(set, value);
}

/* Which vocabulary entries a given topology kind may use. Used by the resolver
   so topology-specific vocabulary cannot be used with a mismatched topology. */
export function allowedForTopology(table, topology) {
    return Object.keys(table).filter((k) => table[k].topologies.includes(topology));
}
