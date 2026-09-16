// ============================================================
// SHARED PLAN UNDER PRESSURE — TWENTY KILOS
// First hand-authored Engine One reference Definition.
//
// The Definition describes possibility.
// Session state lives in the engine runtime.
// No executable mechanic logic belongs here.
// ============================================================

(function () {
    'use strict';

    window.SharedPlanDefinitions =
        window.SharedPlanDefinitions || {};

    const definition = {
        schemaVersion: 1,
        engineId: 'shared-plan-under-pressure',
        engineVersion: 1,
        definitionId: 'twenty-kilos',
        definitionVersion: '1.0.1',
        definitionHash: 'twenty-kilos-v1.0.1-20260915',

        registry: {
            registryId: 'arcade:twenty-kilos',
            world: 'arcade',
            type: 'game',
            title: 'Twenty Kilos',
            premise:
                'Pack an expedition, commit to the plan, then adapt when the mountain changes the rules.',
            status: 'available',
            formatLabel: 'Shared Plan',
            unitLabel: 'Plan',
            total: 1,
            accent: '#c56b37',
            accentLight: '#f7e5d8'
        },

        identity: {
            title: 'Twenty Kilos',
            eyebrow: 'High-altitude expedition',
            premise:
                'You are leaving base camp for a two-day summit push. Decide what travels in the Pack, what rides on the Sled, and what stays behind.',
            durationMinutes: 15,
            level: 'B1+/B2',
            tone: 'strategic, grounded, pressured'
        },

        resource: {
            id: 'weightKg',
            label: 'Weight',
            unit: 'kg',
            decimals: 1
        },

        containers: [
            {
                id: 'pack',
                name: 'Pack',
                shortName: 'Pack',
                description:
                    'What the team can carry when vehicle support disappears.',
                resourceLimit: 20,
                carried: true,
                layout: 'cluster'
            },
            {
                id: 'sled',
                name: 'Sled',
                shortName: 'Sled',
                description:
                    'Vehicle-supported equipment. Useful while the route stays open.',
                resourceLimit: 10,
                carried: true,
                layout: 'cluster'
            },
            {
                id: 'base-camp',
                name: 'Base Camp',
                shortName: 'Base',
                description:
                    'Equipment deliberately left behind before departure.',
                resourceLimit: null,
                carried: false,
                layout: 'cluster',
                lockAfterCommit: true
            }
        ],

        entities: [
            {
                id: 'cold-shelter',
                name: 'Cold Shelter',
                description: 'Four-season shelter for severe wind and cold.',
                resourceCost: 7,
                tags: ['cold', 'shelter', 'safety']
            },
            {
                id: 'medical-kit',
                name: 'Medical Kit',
                description: 'Trauma supplies, medication and emergency treatment.',
                resourceCost: 3.5,
                tags: ['medical', 'safety']
            },
            {
                id: 'satellite-phone',
                name: 'Satellite Phone',
                description: 'Emergency contact when ordinary coverage disappears.',
                resourceCost: 1.5,
                tags: ['communication', 'electronics']
            },
            {
                id: 'battery-pack',
                name: 'Battery Pack',
                description: 'Power for the satellite phone and small electronics.',
                resourceCost: 2,
                tags: ['power', 'electronics']
            },
            {
                id: 'camera-kit',
                name: 'Camera Kit',
                description: 'Professional camera, lens and protected media case.',
                resourceCost: 5.5,
                tags: ['camera', 'sponsor']
            },
            {
                id: 'climbing-rope',
                name: 'Climbing Rope',
                description: 'Technical rope for the exposed upper route.',
                resourceCost: 6.5,
                tags: ['climbing', 'route', 'safety']
            },
            {
                id: 'stove-fuel',
                name: 'Stove & Fuel',
                description: 'Hot food, melted water and a reliable heat source.',
                resourceCost: 4.5,
                tags: ['heat', 'food']
            },
            {
                id: 'insulated-layers',
                name: 'Insulated Layers',
                description: 'Extra down layers for a serious temperature drop.',
                resourceCost: 4,
                tags: ['cold', 'clothing', 'safety']
            }
        ],

        rules: [
            {
                id: 'satellite-needs-power',
                type: 'requires',
                label: 'Satellite phone needs the Battery Pack.',
                sourceEntityId: 'satellite-phone',
                requiredEntityId: 'battery-pack',
                scope: 'carried'
            }
        ],

        goals: [
            {
                id: 'medical-support',
                label: 'Keep emergency medical support with the team.',
                status: 'active',
                predicate: {
                    type: 'entity-carried',
                    entityId: 'medical-kit'
                }
            },
            {
                id: 'route-security',
                label: 'Keep the technical rope for the exposed upper route.',
                status: 'active',
                predicate: {
                    type: 'entity-carried',
                    entityId: 'climbing-rope'
                }
            },
            {
                id: 'cold-ready',
                label: 'Carry both the Cold Shelter and Insulated Layers.',
                status: 'inactive',
                predicate: {
                    type: 'all-entities-carried',
                    entityIds: [
                        'cold-shelter',
                        'insulated-layers'
                    ]
                }
            }
        ],

        stakes: [
            {
                id: 'sponsor-footage',
                holder: 'Sponsor',
                claim:
                    'We need summit footage or next year\'s funding is at risk.',
                relatedEntityIds: ['camera-kit']
            }
        ],

        beats: [
            {
                id: 'weather-break',
                label: 'The route changes',
                variants: [
                    {
                        id: 'phone-left-behind',
                        when: [
                            {
                                type: 'entity-carried',
                                entityId: 'satellite-phone',
                                not: true
                            }
                        ],
                        reveal:
                            'The temperature crashes 12°C. The Sled axle fails — and the satellite phone is already back at base.',
                        effects: [
                            {
                                type: 'set-container-availability',
                                containerId: 'sled',
                                available: false
                            },
                            {
                                type: 'activate-goal',
                                goalId: 'cold-ready'
                            }
                        ]
                    },
                    {
                        id: 'standard',
                        when: [],
                        reveal:
                            'The temperature crashes 12°C and the Sled axle fails. From here, everything must fit in the 20kg Pack.',
                        effects: [
                            {
                                type: 'set-container-availability',
                                containerId: 'sled',
                                available: false
                            },
                            {
                                type: 'activate-goal',
                                goalId: 'cold-ready'
                            }
                        ]
                    }
                ]
            }
        ],

        commitment: {
            poolBecomesCut: true,
            lockCutAfterCommit: true,
            declaredStake: {
                enabled: false,
                prompt: 'What are you most determined to protect?'
            }
        },

        resolution: {
            prompt:
                'Look at the final Pack. What did you protect, what did you sacrifice, and would you make the same call again?',
            outcomeLines: [
                {
                    when: [
                        {
                            type: 'entity-carried',
                            entityId: 'camera-kit'
                        }
                    ],
                    text:
                        'The sponsor gets the summit footage — but the weight had to come from somewhere.'
                },
                {
                    when: [
                        {
                            type: 'entity-carried',
                            entityId: 'camera-kit',
                            not: true
                        }
                    ],
                    text:
                        'The camera stayed behind. The expedition protected something else instead.'
                }
            ]
        },

        tutorBrief: {
            summary:
                'Let the learner own the packing decisions. Ask for reasoning when it is useful, but do not optimise the board for them.',
            watchFor:
                'The useful moment is after the route changes. Give the learner time to react before opening revision.'
        },

        theme: {
            visualMode: 'expedition',
            accent: '#c56b37',
            atmosphere: 'high-altitude dusk'
        }
    };

    window.SharedPlanDefinitions[definition.definitionId] =
        Object.freeze(definition);
})();
