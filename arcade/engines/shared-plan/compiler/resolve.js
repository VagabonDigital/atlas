/* Engine One — reference resolution and dense indexing.

   Turns the key-referenced Authored Definition into the resolved, densely
   indexed shape the reducer and the enumerator walk in tight loops. */

import { collectRefs, DEFINITION_SCHEMA, VOCAB } from '../definition/index.js';

const REF_SECTIONS = Object.freeze({
    piece: 'pieces',
    place: 'places',
    resource: 'resources',
    rule: 'rules',
    goal: 'goals',
    voice: 'voices',
    beat: 'beats'
});

function indexBy(items) {
    return items.reduce((out, item) => {
        out[item.key] = item;
        return out;
    }, Object.create(null));
}

function reportDuplicates(items, section, report) {
    const seen = new Set();
    items.forEach((item, i) => {
        if (seen.has(item.key)) {
            report({
                code: 'resolve.duplicateKey',
                locus: `${section}[${i}].key`,
                message: `Two entries in ${section} share the key "${item.key}".`,
                modelMessage: `Give every entry in ${section} a distinct key. "${item.key}" is used twice.`
            });
        }
        seen.add(item.key);
    });
}

/* Derived from the allowedIn Rules rather than authored, so a Piece's affinity
   marks and the Rules that create them can never disagree. */
function deriveAffinity(draft, allPlaceKeys) {
    const affinity = Object.create(null);
    for (const piece of draft.pieces) affinity[piece.key] = new Set(allPlaceKeys);
    for (const rule of draft.rules) {
        if (rule.kind !== 'allowedIn') continue;
        const subjects = rule.subject?.kind === 'piece'
            ? [rule.subject.piece]
            : draft.pieces.filter((p) => p.tags.includes(rule.subject?.tag)).map((p) => p.key);
        for (const key of subjects) {
            if (!affinity[key]) continue;
            affinity[key] = new Set([...affinity[key]].filter((pl) => rule.places.includes(pl)));
        }
    }
    return Object.fromEntries(Object.entries(affinity).map(([k, v]) => [k, [...v]]));
}

function resolveTopology(draft, report) {
    const kind = draft.world.topology;
    const order = draft.places.map((p) => p.key);
    const adjacency = Object.create(null);
    for (const key of order) adjacency[key] = [];

    if (kind !== 'graph') {
        if (draft.world.siteTemplate) {
            report({
                code: 'resolve.topologyMismatch',
                locus: 'world.siteTemplate',
                message: `A site template only means something in a graph world; this world is "${kind}".`,
                modelMessage: `Remove world.siteTemplate, or set world.topology to "graph".`
            });
        }
        for (const [i, place] of draft.places.entries()) {
            if (place.slot) {
                report({
                    code: 'resolve.topologyMismatch',
                    locus: `places[${i}].slot`,
                    message: `Places only take a slot in a graph world; this world is "${kind}".`,
                    modelMessage: `Remove places[${i}].slot, or set world.topology to "graph".`
                });
            }
        }
        return { kind, order, adjacency, template: null };
    }

    const template = VOCAB.SITE_TEMPLATES[draft.world.siteTemplate];
    if (!template) {
        report({
            code: 'resolve.missingTemplate',
            locus: 'world.siteTemplate',
            message: 'A graph world must name a site template.',
            modelMessage: `Set world.siteTemplate to one of: ${Object.keys(VOCAB.SITE_TEMPLATES).join(', ')}.`
        });
        return { kind, order, adjacency, template: null };
    }

    const bySlot = new Map();
    draft.places.forEach((place, i) => {
        if (!place.slot) {
            report({
                code: 'resolve.missingSlot',
                locus: `places[${i}].slot`,
                message: `${place.name} needs a slot in the "${template.label}" template.`,
                modelMessage: `Give places[${i}] a slot from: ${template.slots.join(', ')}.`
            });
            return;
        }
        if (!template.slots.includes(place.slot)) {
            report({
                code: 'resolve.unknownSlot',
                locus: `places[${i}].slot`,
                message: `"${place.slot}" is not a slot in the "${template.label}" template.`,
                modelMessage: `Use one of: ${template.slots.join(', ')}.`
            });
            return;
        }
        if (bySlot.has(place.slot)) {
            report({
                code: 'resolve.slotTaken',
                locus: `places[${i}].slot`,
                message: `Two Places are assigned to slot "${place.slot}".`,
                modelMessage: `Each Place needs its own slot. "${place.slot}" is used twice.`
            });
            return;
        }
        bySlot.set(place.slot, place.key);
    });

    for (const [a, b] of template.edges) {
        const ka = bySlot.get(a);
        const kb = bySlot.get(b);
        if (ka && kb) {
            adjacency[ka].push(kb);
            adjacency[kb].push(ka);
        }
    }

    return { kind, order, adjacency, template: draft.world.siteTemplate };
}

export function resolve(draft, report) {
    for (const [section, items] of Object.entries({
        places: draft.places,
        pieces: draft.pieces,
        resources: draft.resources,
        rules: draft.rules,
        goals: draft.goals,
        voices: draft.voices,
        beats: draft.beats
    })) {
        reportDuplicates(items, section, report);
    }

    const sections = {
        places: indexBy(draft.places),
        pieces: indexBy(draft.pieces),
        resources: indexBy(draft.resources),
        rules: indexBy(draft.rules),
        goals: indexBy(draft.goals),
        voices: indexBy(draft.voices),
        beats: indexBy(draft.beats)
    };
    const allVariantKeys = new Set(draft.beats.flatMap((b) => b.variants.map((v) => v.key)));

    /* Walking the schema rather than hand-written traversal means a new
       referencing field cannot be forgotten here. */
    for (const ref of collectRefs(DEFINITION_SCHEMA, draft, '')) {
        if (ref.refKind === 'variant') {
            if (!allVariantKeys.has(ref.key)) {
                report({
                    code: 'resolve.unknownRef',
                    locus: ref.locus,
                    message: `No variant named "${ref.key}".`,
                    modelMessage: `"${ref.key}" is not the key of any beat variant.`
                });
            }
            continue;
        }
        const section = REF_SECTIONS[ref.refKind];
        if (!section) continue;
        if (!sections[section][ref.key]) {
            report({
                code: 'resolve.unknownRef',
                locus: ref.locus,
                message: `No ${ref.refKind} named "${ref.key}".`,
                modelMessage: `"${ref.key}" is not the key of any entry in ${section}. Use one of: ${Object.keys(sections[section]).join(', ') || '(none)'}.`
            });
        }
    }

    const topology = resolveTopology(draft, report);

    const places = draft.places.map((p, index) => ({ ...p, index }));
    const pieces = draft.pieces.map((p, index) => ({
        ...p,
        index,
        /* Authored as a list of pairs; compiled to a dense map for the sums the
           enumerator computes on every node. */
        resources: Object.fromEntries(p.resources.map((r) => [r.resource, r.value]))
    }));
    const resources = draft.resources.map((r, index) => ({ ...r, index }));
    const rules = draft.rules.map((r, index) => ({ ...r, index }));
    const goals = draft.goals.map((g, index) => ({ ...g, index }));
    const voices = draft.voices.map((v, index) => ({ ...v, index }));
    const beats = draft.beats.map((b, index) => ({
        ...b,
        index,
        variants: b.variants.map((v, vi) => ({ ...v, index: vi })),
        variantIndex: indexBy(b.variants)
    }));

    return {
        contract: draft.contract,
        meta: draft.meta,
        design: draft.design,
        presentation: draft.presentation,
        world: draft.world,
        places,
        placeIndex: indexBy(places),
        pieces,
        pieceIndex: indexBy(pieces),
        resources,
        resourceIndex: indexBy(resources),
        rules,
        ruleIndex: indexBy(rules),
        goals,
        goalIndex: indexBy(goals),
        voices,
        voiceIndex: indexBy(voices),
        beats,
        beatIndex: indexBy(beats),
        resolution: draft.resolution,
        tutor: draft.tutor,
        topology,
        affinity: deriveAffinity(draft, places.map((p) => p.key))
    };
}
