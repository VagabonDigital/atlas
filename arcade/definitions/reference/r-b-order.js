/* R-B "Order" — consequence through sequence.

   Structural role: a different topology kind from R-A, so it proves the mark
   layer and the model are not quietly shaped around groups. Stresses order,
   upstream loss, stranding, Omens, sever and a pin-guarded variant.

   Data only. Nothing here is code. */

export default {
    contract: { engineId: 'shared-plan', schemaVersion: '1' },

    meta: {
        title: 'Last Ferry',
        premise: 'One crossing left before the weather closes the channel, and more to carry than the boat will hold.',
        levelBand: 'B2-C1',
        targetMinutes: 15,
        tone: 'grave'
    },

    design: {
        tensionShape: 'safetyVsMeaning',
        pressureSignature: 'loss',
        intendedDilemma: 'Everything critical fits only if the grain stays behind, and the grain is the only thing anyone eats in winter.',
        languageFocus: ['prioritisation', 'conditionals', 'concession']
    },

    presentation: { stageForm: 'route', kit: 'draftingRoom', accent: 'graphite' },

    world: {
        topology: 'sequence',
        thresholdLabel: 'The Slipway',
        marginLabel: 'Left Ashore',
        clockLabel: 'Last light'
    },

    /* Contract order is travel order: upstream first. */
    places: [
        { key: 'quay', name: 'Quay Head', glyph: 'harbour', sockets: 3, descriptor: 'The near landing' },
        { key: 'midpoint', name: 'Mid Reach', glyph: 'bridge', sockets: 2, descriptor: 'A jetty in open water' },
        { key: 'far-shore', name: 'Far Shore', glyph: 'depot', sockets: 3, descriptor: 'Where the village waits' }
    ],

    pieces: [
        { key: 'doctor', name: 'Doctor Vey', glyph: 'person', tags: ['people', 'critical'], resources: [{ resource: 'weight', value: 2 }] },
        { key: 'pump', name: 'Water Pump', glyph: 'pump', tags: ['gear', 'critical'], resources: [{ resource: 'weight', value: 5 }] },
        { key: 'medkit', name: 'Medicine Chest', glyph: 'medicine', tags: ['supply', 'critical'], resources: [{ resource: 'weight', value: 4 }] },
        { key: 'grain', name: 'Grain Sacks', glyph: 'crate', tags: ['supply'], resources: [{ resource: 'weight', value: 6 }] },
        { key: 'radio', name: 'Field Radio', glyph: 'radio', tags: ['gear'], resources: [{ resource: 'weight', value: 3 }] },
        { key: 'lamps', name: 'Storm Lamps', glyph: 'lantern', tags: ['supply'], resources: [{ resource: 'weight', value: 2 }] }
    ],

    resources: [
        { key: 'weight', label: 'Load', unit: 'kilos', scope: 'plan', limit: 14, render: 'loadLine' }
    ],

    rules: [
        { key: 'boat-load', kind: 'sumLimit', resource: 'weight', inscription: 'Fourteen kilos in all' },
        {
            /* Supplies are for the village, so landing them at the near quay is
               not a delivery. This is what stops the cheap answer of dropping
               everything at the first stop. */
            key: 'supplies-onward',
            kind: 'allowedIn',
            subject: { kind: 'tag', tag: 'supply' },
            places: ['midpoint', 'far-shore'],
            inscription: 'Supplies go onward'
        },
        { key: 'pump-first', kind: 'before', a: 'pump', b: 'grain', inscription: 'Pump lands before grain' }
    ],

    goals: [
        {
            key: 'within-weight',
            label: 'The load stays legal',
            condition: { kind: 'sumResource', resource: 'weight', scope: 'plan', cmp: 'lte', value: 14 },
            reachedLine: 'The boat rode high enough the whole way over.',
            missedLine: 'She was down at the gunwales and everyone knew it.'
        },
        {
            key: 'medicine-lands',
            label: 'Medicine reaches Far Shore',
            condition: { kind: 'pieceIn', piece: 'medkit', place: 'far-shore' },
            /* Once the channel shuts, nothing left ashore can be sent across. */
            impossibleWhen: {
                kind: 'all',
                terms: [
                    { kind: 'beatFired', beat: 'the-sever' },
                    { kind: 'pieceCut', piece: 'medkit' }
                ]
            },
            reachedLine: 'The chest went up the beach before dark.',
            missedLine: 'The village will wait another week for it.'
        },
        {
            key: 'critical-aboard',
            label: 'Every critical load sails',
            condition: { kind: 'countTagged', tag: 'critical', scope: 'plan', cmp: 'gte', value: 3 },
            reachedLine: 'Doctor, pump and chest all made the crossing.',
            missedLine: 'Something that mattered stayed on the slipway.'
        }
    ],

    voices: [
        {
            key: 'ilse',
            name: 'Ilse',
            role: 'harbourmaster',
            claim: 'The pump goes over before anything else.',
            concern: { kind: 'not', term: { kind: 'pieceCut', piece: 'pump' } },
            tethers: [{ kind: 'piece', piece: 'pump' }],
            anchor: { kind: 'place', place: 'quay' },
            outcomes: [
                { condition: { kind: 'pieceCut', piece: 'pump' }, line: 'You left the pump. I hope you can explain that.' }
            ],
            fallbackOutcome: 'The pump went over. That is the one that mattered.'
        },
        {
            key: 'otto',
            name: 'Otto',
            role: 'grows the north fields',
            claim: 'Without the grain there is nothing to eat.',
            concern: { kind: 'not', term: { kind: 'pieceCut', piece: 'grain' } },
            tethers: [{ kind: 'piece', piece: 'grain' }],
            anchor: { kind: 'place', place: 'far-shore' },
            outcomes: [
                { condition: { kind: 'pieceCut', piece: 'grain' }, line: 'No grain. We will be thin by March.' }
            ],
            fallbackOutcome: 'The sacks came over. We will manage the winter.'
        }
    ],

    beats: [
        {
            key: 'the-sever',
            trigger: 'afterCommit',
            omen: { edge: 'north', text: 'Cloud building in the north channel' },
            variants: [
                {
                    /* Declaring the pump as the thing to protect means the crew
                       kept the engine running and got one reach further. The pin
                       shapes the beat without the beat hunting the pin. */
                    key: 'engine-held',
                    guard: { kind: 'piecePinned', piece: 'pump' },
                    effects: [{ kind: 'severAfter', place: 'midpoint' }],
                    staging: 'rupture',
                    severity: 'sharp',
                    entryEdge: 'north',
                    locus: { kind: 'place', place: 'midpoint' },
                    headline: 'The channel shuts beyond Mid Reach.',
                    scarLabel: 'Channel shut'
                },
                {
                    key: 'weather-wins',
                    effects: [{ kind: 'severAfter', place: 'quay' }],
                    staging: 'rupture',
                    severity: 'heavy',
                    entryEdge: 'north',
                    locus: { kind: 'place', place: 'quay' },
                    headline: 'The channel shuts beyond Quay Head.',
                    scarLabel: 'Channel shut'
                }
            ]
        }
    ],

    resolution: {
        hindsight: [
            {
                piece: 'grain',
                condition: { kind: 'pieceCut', piece: 'grain' },
                note: 'Left on the slipway to keep the weight down.'
            },
            {
                piece: 'medkit',
                condition: { kind: 'pieceIn', piece: 'medkit', place: 'quay' },
                note: 'Landed at the near quay and went no further.'
            }
        ]
    },

    tutor: {
        brief: 'Six loads, fourteen kilos, three landings in order. The three critical loads weigh eleven together, so the grain only sails if something else does not. Ask where each thing should land, not just whether it goes. The pin matters here: what they choose to protect changes how far the boat gets.',
        prompts: {
            plan: ['Why that landing and not the next one?', 'What happens if this never arrives?'],
            commit: ['What are you protecting above everything else?'],
            perturb: ['Which part of the plan just died?'],
            react: ['What is stranded now?'],
            revise: ['What goes back ashore to make this work?'],
            resolve: ['Was the grain worth the risk you took?']
        }
    }
};
