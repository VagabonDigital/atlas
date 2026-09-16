/* R-C "Load" — capacity and weight pressure.

   Structural role: the only reference that runs two resources at once, one at
   Place scope and one at plan scope, and the one that exercises triage when a
   Place's capacity is taken away under a standing plan. B1 runs it headless; the
   Vessel painter that makes it playable belongs to B5.

   Note that "Base Camp" is not a Place. Equipment deliberately left behind is
   what the Margin already is, and giving it a Place as well would have meant two
   grammars for the same idea.

   Data only. Nothing here is code. */

export default {
    contract: { engineId: 'shared-plan', schemaVersion: '0' },

    meta: {
        title: 'Twenty Kilos',
        premise: 'Everything you take has to be carried, and the sled only goes as far as the ice allows.',
        levelBand: 'B1-B2',
        targetMinutes: 15,
        tone: 'dry'
    },

    design: {
        tensionShape: 'safetyVsMeaning',
        pressureSignature: 'scarcity',
        intendedDilemma: 'Warmth, safety and the sponsor each want a place in a pack that holds four things, and only the sled was making all three possible.',
        languageFocus: ['prioritisation', 'comparison', 'justification']
    },

    presentation: { stageForm: 'vessel', kit: 'draftingRoom', accent: 'blueprint' },

    world: {
        topology: 'groups',
        thresholdLabel: 'The Store',
        marginLabel: 'Base Camp',
        clockLabel: 'Departure'
    },

    places: [
        { key: 'pack', name: 'Pack', glyph: 'crate', sockets: 4, descriptor: 'Carried on your back' },
        { key: 'sled', name: 'Sled', glyph: 'depot', sockets: 4, descriptor: 'Only while the ice holds' }
    ],

    pieces: [
        { key: 'tent', name: 'Tent', glyph: 'tent', tags: ['warm', 'shelter'], resources: [{ resource: 'mass', value: 5 }, { resource: 'bulk', value: 18 }] },
        { key: 'stove', name: 'Stove', glyph: 'kitchen', tags: ['warm'], resources: [{ resource: 'mass', value: 3 }, { resource: 'bulk', value: 8 }] },
        { key: 'fuel', name: 'Fuel Cans', glyph: 'barrel', tags: ['warm'], resources: [{ resource: 'mass', value: 6 }, { resource: 'bulk', value: 14 }] },
        { key: 'rations', name: 'Rations', glyph: 'store', tags: ['food'], resources: [{ resource: 'mass', value: 7 }, { resource: 'bulk', value: 20 }] },
        { key: 'medkit', name: 'Med Kit', glyph: 'medicine', tags: ['safety'], resources: [{ resource: 'mass', value: 2 }, { resource: 'bulk', value: 5 }] },
        { key: 'camera', name: 'Camera Rig', glyph: 'instrument', tags: ['sponsor'], resources: [{ resource: 'mass', value: 4 }, { resource: 'bulk', value: 10 }] },
        { key: 'rope', name: 'Rope', glyph: 'toolkit', tags: ['safety'], resources: [{ resource: 'mass', value: 3 }, { resource: 'bulk', value: 6 }] },
        { key: 'radio', name: 'Radio', glyph: 'radio', tags: ['safety'], resources: [{ resource: 'mass', value: 2 }, { resource: 'bulk', value: 4 }] }
    ],

    resources: [
        /* Fifteen to a load, against thirty-two kilos of kit. Set any higher and
           bulk always bites first and the weight limit never does anything. */
        { key: 'mass', label: 'Mass', unit: 'kilos', scope: 'place', limit: 15, render: 'loadLine' },
        /* Everything together is 85 litres, so thirty have to stay behind before
           anything else is decided. That is what makes warmth, safety and the
           sponsor compete from the first move rather than only after the sled
           is lost. */
        { key: 'bulk', label: 'Bulk', unit: 'litres', scope: 'plan', limit: 55, render: 'loadLine' }
    ],

    rules: [
        { key: 'carry-limit', kind: 'sumLimit', resource: 'mass', inscription: 'Twenty kilos to a load' },
        { key: 'bulk-limit', kind: 'sumLimit', resource: 'bulk', inscription: 'Seventy litres in all' },
        { key: 'stove-needs-fuel', kind: 'requires', piece: 'stove', needs: { kind: 'piece', piece: 'fuel' }, where: 'anywhere', inscription: 'Stove needs fuel' }
    ],

    goals: [
        {
            key: 'stay-warm',
            label: 'The team can stay warm',
            condition: { kind: 'countTagged', tag: 'warm', scope: 'plan', cmp: 'gte', value: 2 },
            reachedLine: 'Cold nights, but survivable ones.',
            missedLine: 'Nobody slept properly after the second night.'
        },
        {
            key: 'stay-safe',
            label: 'Safety gear is carried',
            condition: { kind: 'countTagged', tag: 'safety', scope: 'plan', cmp: 'gte', value: 2 },
            reachedLine: 'When it went wrong you had what you needed.',
            missedLine: 'You were further from help than you thought.'
        },
        {
            key: 'sponsor-served',
            label: 'The sponsor gets footage',
            condition: { kind: 'pieceIn', piece: 'camera', place: 'pack' },
            reachedLine: 'The rig made the summit. The funding is safe.',
            missedLine: 'No footage. Next year will be harder to fund.'
        }
    ],

    voices: [
        {
            key: 'ravi',
            name: 'Ravi',
            role: 'the sponsor',
            claim: 'We need summit footage or the funding goes.',
            concern: { kind: 'pieceIn', piece: 'camera', place: 'pack' },
            claimVariants: ['Carry the rig yourself if you have to.'],
            tethers: [{ kind: 'piece', piece: 'camera' }],
            anchor: { kind: 'place', place: 'pack' },
            outcomes: [
                { condition: { kind: 'pieceCut', piece: 'camera' }, line: 'You left the rig behind. We will talk in March.' }
            ],
            fallbackOutcome: 'The rig went with you. Good. Bring something back.'
        },
        {
            key: 'anke',
            name: 'Anke',
            role: 'team doctor',
            claim: 'The med kit is not negotiable. Ever.',
            concern: { kind: 'not', term: { kind: 'pieceCut', piece: 'medkit' } },
            tethers: [{ kind: 'piece', piece: 'medkit' }],
            anchor: { kind: 'place', place: 'pack' },
            outcomes: [
                { condition: { kind: 'pieceCut', piece: 'medkit' }, line: 'You went out without it. I want that on record.' }
            ],
            fallbackOutcome: 'The kit went. I can live with the rest.'
        }
    ],

    beats: [
        {
            key: 'the-sled-goes',
            trigger: 'afterCommit',
            omen: { edge: 'north', text: 'Thin ice on the north track' },
            variants: [
                {
                    /* Loading the rig into the pack means the sled carried more
                       of everything else, so losing it hurts more. */
                    key: 'sponsor-holds',
                    guard: { kind: 'pieceIn', piece: 'camera', place: 'pack' },
                    effects: [
                        { kind: 'setCapacity', place: 'sled', sockets: 0 },
                        { kind: 'adjustResourceLimit', resource: 'bulk', limit: 38 },
                        { kind: 'shiftVoice', voice: 'ravi', claimVariant: 0 }
                    ],
                    staging: 'drought',
                    severity: 'heavy',
                    entryEdge: 'north',
                    locus: { kind: 'place', place: 'sled' },
                    headline: 'The sled is gone. Carry what you can.',
                    scarLabel: 'Sled lost'
                },
                {
                    key: 'travel-light',
                    effects: [
                        { kind: 'setCapacity', place: 'sled', sockets: 0 },
                        { kind: 'adjustResourceLimit', resource: 'bulk', limit: 44 }
                    ],
                    staging: 'drought',
                    severity: 'sharp',
                    entryEdge: 'north',
                    locus: { kind: 'place', place: 'sled' },
                    headline: 'The sled is gone. Carry what you can.',
                    scarLabel: 'Sled lost'
                }
            ]
        }
    ],

    resolution: {
        hindsight: [
            { piece: 'camera', condition: { kind: 'pieceCut', piece: 'camera' }, note: 'Went back to base when the sled died.' },
            { piece: 'fuel', condition: { kind: 'pieceCut', piece: 'fuel' }, note: 'Left behind, and the stove with it.' }
        ]
    },

    tutor: {
        brief: 'Eight items, two loads, two limits. The sled is doing most of the work and it will not last. Before you commit, make them say what the sled is for. After it goes there are four sockets and twenty kilos, and warmth, safety and the sponsor cannot all fit. Push on which of the three they are willing to lose.',
        prompts: {
            plan: ['Why does that go on the sled and not the pack?', 'What would you drop first?'],
            commit: ['What are you refusing to leave behind?'],
            perturb: ['How much of that plan still works?'],
            react: ['What has to come out now?'],
            revise: ['Warmth, safety or footage. Which one goes?'],
            resolve: ['Was the sled a mistake, or just bad luck?']
        }
    }
};
