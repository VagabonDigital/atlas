/* R-A "Belonging" — the judgement-heavy people game.

   Structural role: no resources and no arithmetic at all. Everything that
   matters is who sits with whom, which is exactly the shape a load game cannot
   test. Stresses Voices, together/apart, tethers and social stakes.

   Data only. Nothing here is code. */

export default {
    contract: { engineId: 'shared-plan', schemaVersion: '0' },

    meta: {
        title: 'The Long Table',
        premise: 'Three tables, seven people, and one evening that everyone will remember differently.',
        levelBand: 'B1-B2',
        targetMinutes: 15,
        tone: 'warm'
    },

    design: {
        tensionShape: 'loyaltyVsEfficiency',
        pressureSignature: 'arrival',
        intendedDilemma: 'Seating that keeps the peace uses the porch. Using the porch is what the rain punishes, and someone then has nowhere to sit.',
        languageFocus: ['justification', 'concession', 'hindsight']
    },

    presentation: { stageForm: 'table', kit: 'fieldNotebook', accent: 'ink' },

    world: {
        topology: 'groups',
        thresholdLabel: 'The Hallway',
        marginLabel: 'Another Night',
        clockLabel: 'Seven o\'clock'
    },

    places: [
        { key: 'hearth-table', name: 'Hearth Table', glyph: 'hearth', sockets: 3, descriptor: 'Warm, and everyone hears you' },
        { key: 'window-table', name: 'Window Table', glyph: 'table', sockets: 3, descriptor: 'Bright, a little formal' },
        { key: 'porch-table', name: 'Porch Table', glyph: 'bench', sockets: 2, descriptor: 'Outside, under the eaves' }
    ],

    pieces: [
        { key: 'nadia', name: 'Nadia', glyph: 'person', tags: ['guest', 'family'] },
        { key: 'gregor', name: 'Gregor', glyph: 'elder', tags: ['guest', 'family', 'elder'], fact: { text: 'Feels the cold badly', hidden: false } },
        { key: 'imre', name: 'Imre', glyph: 'person', tags: ['guest', 'friend'] },
        { key: 'sofia', name: 'Sofia', glyph: 'child', tags: ['guest', 'family', 'child'] },
        { key: 'benedek', name: 'Benedek', glyph: 'person', tags: ['guest', 'friend'] },
        { key: 'talia', name: 'Talia', glyph: 'person', tags: ['guest', 'family'] },
        { key: 'orsolya', name: 'Orsolya', glyph: 'person', tags: ['guest', 'family'], status: 'dormant', fact: { text: 'Has not eaten since morning', hidden: false } }
    ],

    resources: [],

    rules: [
        { key: 'sisters', kind: 'together', a: 'nadia', b: 'talia', inscription: 'Nadia sits with Talia' },
        { key: 'old-quarrel', kind: 'apart', a: 'gregor', b: 'benedek', inscription: 'Gregor and Benedek apart' },
        {
            key: 'children-inside',
            kind: 'allowedIn',
            subject: { kind: 'tag', tag: 'child' },
            places: ['hearth-table', 'window-table'],
            inscription: 'Children eat indoors'
        }
    ],

    goals: [
        {
            key: 'all-seated',
            label: 'Everyone finds a seat',
            condition: { kind: 'countTagged', tag: 'guest', scope: 'plan', cmp: 'gte', value: 7 },
            reachedLine: 'Every chair was filled, and nobody ate standing up.',
            missedLine: 'Someone went home without sitting down.'
        },
        {
            key: 'gregor-warm',
            label: 'Gregor sits at the hearth',
            condition: { kind: 'pieceIn', piece: 'gregor', place: 'hearth-table' },
            /* Once the porch is shut, anyone on it is stranded there and can
               never reach the hearth. */
            impossibleWhen: {
                kind: 'all',
                terms: [
                    { kind: 'beatFired', beat: 'the-arrival', variant: 'porch-shut' },
                    { kind: 'pieceIn', piece: 'gregor', place: 'porch-table' }
                ]
            },
            reachedLine: 'Gregor kept the warm seat all evening.',
            missedLine: 'Gregor sat where there was room, and said nothing.'
        }
    ],

    voices: [
        {
            key: 'marta',
            name: 'Marta',
            role: 'the host',
            claim: 'Put Gregor by the hearth. He feels the cold.',
            concern: { kind: 'pieceIn', piece: 'gregor', place: 'hearth-table' },
            claimVariants: ['Forget the hearth. Just find Orsolya a chair.'],
            tethers: [{ kind: 'piece', piece: 'gregor' }, { kind: 'place', place: 'hearth-table' }],
            anchor: { kind: 'place', place: 'hearth-table' },
            outcomes: [
                {
                    condition: { kind: 'pieceIn', piece: 'gregor', place: 'hearth-table' },
                    line: 'He was warm. That was all I wanted.'
                }
            ],
            fallbackOutcome: 'He sat where you put him. He always does.'
        },
        {
            key: 'zsofia',
            name: 'Zsofia',
            role: 'Sofia\'s mother',
            claim: 'Sofia should sit where I can see her.',
            tethers: [{ kind: 'piece', piece: 'sofia' }],
            anchor: { kind: 'place', place: 'window-table' },
            outcomes: [
                {
                    condition: { kind: 'pieceIn', piece: 'sofia', place: 'window-table' },
                    line: 'She was right there by the window. Good.'
                }
            ],
            fallbackOutcome: 'I spent the evening turning round in my chair.'
        },
        {
            key: 'dezso',
            name: 'Dezso',
            role: 'keeps the garden',
            claim: 'The porch is the best table. Use it.',
            tethers: [{ kind: 'place', place: 'porch-table' }],
            anchor: { kind: 'place', place: 'porch-table' },
            outcomes: [
                {
                    condition: { kind: 'beatFired', beat: 'the-arrival', variant: 'porch-shut' },
                    line: 'The porch was perfect, right up until it was not.'
                },
                {
                    condition: { kind: 'countTagged', tag: 'guest', scope: 'place', place: 'porch-table', cmp: 'gte', value: 1 },
                    line: 'Someone ate outside after all. I said so.'
                }
            ],
            fallbackOutcome: 'Nobody used the porch. Nobody ever does.'
        }
    ],

    beats: [
        {
            key: 'the-arrival',
            trigger: 'afterCommit',
            omen: { edge: 'east', text: 'A car slows on the lane' },
            variants: [
                {
                    key: 'porch-shut',
                    guard: { kind: 'countTagged', tag: 'guest', scope: 'place', place: 'porch-table', cmp: 'gte', value: 1 },
                    effects: [
                        { kind: 'introducePiece', piece: 'orsolya' },
                        { kind: 'closePlace', place: 'porch-table' },
                        { kind: 'shiftVoice', voice: 'marta', claimVariant: 0 }
                    ],
                    staging: 'closure',
                    severity: 'sharp',
                    entryEdge: 'east',
                    locus: { kind: 'place', place: 'porch-table' },
                    headline: 'Rain takes the porch, and Orsolya is at the door.',
                    scarLabel: 'Rained off'
                },
                {
                    key: 'one-more',
                    effects: [
                        { kind: 'introducePiece', piece: 'orsolya' },
                        { kind: 'shiftVoice', voice: 'marta', claimVariant: 0 }
                    ],
                    staging: 'arrival',
                    severity: 'quiet',
                    entryEdge: 'east',
                    locus: { kind: 'threshold' },
                    headline: 'Orsolya is at the door, and she has not eaten.',
                    scarLabel: 'Unplanned'
                }
            ]
        }
    ],

    resolution: {
        hindsight: [
            {
                piece: 'gregor',
                condition: { kind: 'pieceIn', piece: 'gregor', place: 'porch-table' },
                note: 'Stayed on the porch when the rain came.'
            },
            {
                piece: 'orsolya',
                condition: { kind: 'pieceCut', piece: 'orsolya' },
                note: 'Arrived hungry and was sent away.'
            }
        ]
    },

    tutor: {
        brief: 'Seven people, three tables, no numbers anywhere. The whole game is judgement. Let the learner seat everyone and say why before you commit. The porch looks like the easy answer and it is the one the weather punishes. After the change, push for what they are protecting rather than for a tidy arrangement.',
        prompts: {
            plan: ['Who would mind sitting there?', 'Why those two together?'],
            commit: ['Which seat would you refuse to change?'],
            perturb: ['What does this cost you?'],
            react: ['Who is worst off now?'],
            revise: ['What are you giving up to fix it?'],
            resolve: ['Would you seat them the same way again?']
        }
    }
};
