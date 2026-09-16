/* Hostile fixtures H-1 to H-6.

   These are not games anyone should teach with. They are the shapes the engine
   must survive: every budget at once, no Rules at all, the longest legal names
   in the narrowest slots, unconditional beats, a world that locks itself, and a
   world where almost nothing exists until a beat creates it.

   Each must compile, play end to end and lay out legibly. Data only. */

const contract = { engineId: 'shared-plan', schemaVersion: '0' };

const tutor = {
    brief: 'A hostile fixture. Not a lesson.',
    prompts: {}
};

/* H-1 — every structural budget at its maximum simultaneously. */
const h1 = {
    contract,
    meta: { title: 'Maximum', premise: 'Every budget at once.', levelBand: 'B2-C1', targetMinutes: 30, tone: 'dry' },
    design: { tensionShape: 'speedVsCare', pressureSignature: 'scarcity', intendedDilemma: 'Everything at maximum.', languageFocus: ['a', 'b', 'c', 'd'] },
    presentation: { stageForm: 'table', kit: 'draftingRoom', accent: 'graphite' },
    world: { topology: 'groups', thresholdLabel: 'Inbox', marginLabel: 'Dropped', clockLabel: 'Hour one' },
    places: [
        { key: 'pa', name: 'Alpha', glyph: 'table', sockets: 6, descriptor: 'One' },
        { key: 'pb', name: 'Bravo', glyph: 'bench', sockets: 6, descriptor: 'Two' },
        { key: 'pc', name: 'Cairo', glyph: 'store', sockets: 6, descriptor: 'Three' },
        { key: 'pd', name: 'Delta', glyph: 'depot', sockets: 6, descriptor: 'Four' },
        { key: 'pe', name: 'Echo', glyph: 'well', sockets: 6, descriptor: 'Five' }
    ],
    pieces: [
        { key: 'ia', name: 'Iron', glyph: 'crate', tags: ['red', 'heavy', 'odd'], resources: [{ resource: 'ra', value: 1 }, { resource: 'rb', value: 1 }] },
        { key: 'ib', name: 'Jade', glyph: 'barrel', tags: ['red', 'heavy'], resources: [{ resource: 'ra', value: 1 }, { resource: 'rb', value: 1 }] },
        { key: 'ic', name: 'Kiln', glyph: 'workshop', tags: ['blue', 'heavy'], resources: [{ resource: 'ra', value: 1 }, { resource: 'rb', value: 1 }] },
        { key: 'id', name: 'Loom', glyph: 'toolkit', tags: ['blue'], resources: [{ resource: 'ra', value: 1 }, { resource: 'rb', value: 1 }] },
        { key: 'ie', name: 'Mast', glyph: 'tower', tags: ['red'], resources: [{ resource: 'ra', value: 1 }, { resource: 'rb', value: 1 }] },
        { key: 'if', name: 'Nail', glyph: 'toolkit', tags: ['blue'], resources: [{ resource: 'ra', value: 1 }, { resource: 'rb', value: 1 }] },
        { key: 'ig', name: 'Oath', glyph: 'book', tags: ['odd'], resources: [{ resource: 'ra', value: 1 }, { resource: 'rb', value: 1 }] },
        { key: 'ih', name: 'Pail', glyph: 'well', tags: ['odd'], resources: [{ resource: 'ra', value: 1 }, { resource: 'rb', value: 1 }] }
    ],
    resources: [
        { key: 'ra', label: 'Alpha Load', unit: 'units', scope: 'place', limit: 6, render: 'loadLine' },
        { key: 'rb', label: 'Bravo Load', unit: 'units', scope: 'plan', limit: 8, render: 'clock' }
    ],
    rules: [
        { key: 'ua', kind: 'sumLimit', resource: 'ra', inscription: 'Six to a place' },
        { key: 'ub', kind: 'sumLimit', resource: 'rb', inscription: 'Eight in all' },
        { key: 'uc', kind: 'together', a: 'ia', b: 'ib', inscription: 'Iron with Jade' },
        { key: 'ud', kind: 'apart', a: 'ic', b: 'id', inscription: 'Kiln from Loom' },
        { key: 'ue', kind: 'allowedIn', subject: { kind: 'tag', tag: 'odd' }, places: ['pa', 'pb', 'pc', 'pd', 'pe'], inscription: 'Odd things anywhere' },
        { key: 'uf', kind: 'requires', piece: 'ie', needs: { kind: 'tag', tag: 'blue' }, where: 'anywhere', inscription: 'Mast needs blue' }
    ],
    goals: [
        { key: 'ga', label: 'Fill three places', condition: { kind: 'countTagged', tag: 'red', scope: 'plan', cmp: 'gte', value: 2 }, reachedLine: 'Red held.', missedLine: 'Red failed.' },
        { key: 'gb', label: 'Keep blue together', condition: { kind: 'countTagged', tag: 'blue', scope: 'plan', cmp: 'gte', value: 2 }, reachedLine: 'Blue held.', missedLine: 'Blue failed.' },
        { key: 'gc', label: 'Odd things survive', condition: { kind: 'countTagged', tag: 'odd', scope: 'plan', cmp: 'gte', value: 1 }, reachedLine: 'Odd held.', missedLine: 'Odd failed.' }
    ],
    voices: [
        { key: 'va', name: 'Vera', role: 'first', claim: 'Keep Iron where I can see it.', claimVariants: ['Now keep Jade instead.', 'Now keep Kiln instead.'], tethers: [{ kind: 'piece', piece: 'ia' }, { kind: 'place', place: 'pa' }], anchor: { kind: 'place', place: 'pa' }, outcomes: [{ condition: { kind: 'pieceCut', piece: 'ia' }, line: 'Iron went.' }, { condition: { kind: 'pieceCut', piece: 'ib' }, line: 'Jade went.' }, { condition: { kind: 'pieceCut', piece: 'ic' }, line: 'Kiln went.' }], fallbackOutcome: 'All held.' },
        { key: 'vb', name: 'Wynn', role: 'second', claim: 'Jade matters more than the rest.', claimVariants: ['Jade still matters.'], tethers: [{ kind: 'piece', piece: 'ib' }], anchor: { kind: 'place', place: 'pb' }, outcomes: [{ condition: { kind: 'pieceCut', piece: 'ib' }, line: 'Jade went.' }], fallbackOutcome: 'Jade held.' },
        { key: 'vc', name: 'Xuan', role: 'third', claim: 'Kiln and Loom must never meet.', claimVariants: ['They met anyway.'], tethers: [{ kind: 'piece', piece: 'ic' }, { kind: 'piece', piece: 'id' }], anchor: { kind: 'place', place: 'pc' }, outcomes: [{ condition: { kind: 'pieceCut', piece: 'ic' }, line: 'Kiln went.' }], fallbackOutcome: 'Kiln held.' },
        { key: 'vd', name: 'Yusuf', role: 'fourth', claim: 'Nothing here is worth the trouble.', claimVariants: ['Still not worth it.'], tethers: [{ kind: 'place', place: 'pe' }], anchor: { kind: 'place', place: 'pe' }, outcomes: [{ condition: { kind: 'beatFired', beat: 'ba' }, line: 'Told you.' }], fallbackOutcome: 'Nothing happened.' }
    ],
    beats: [
        {
            key: 'ba',
            trigger: 'afterCommit',
            omen: { edge: 'north', text: 'Something is coming' },
            variants: [
                { key: 'va1', guard: { kind: 'countTagged', tag: 'red', scope: 'place', place: 'pa', cmp: 'gte', value: 2 }, effects: [{ kind: 'closePlace', place: 'pa' }, { kind: 'lockPiece', piece: 'ig' }, { kind: 'shiftVoice', voice: 'va', claimVariant: 0 }], staging: 'closure', severity: 'heavy', entryEdge: 'north', locus: { kind: 'place', place: 'pa' }, headline: 'Alpha closes without warning.', scarLabel: 'Closed' },
                { key: 'va2', guard: { kind: 'countTagged', tag: 'blue', scope: 'place', place: 'pb', cmp: 'gte', value: 2 }, effects: [{ kind: 'setCapacity', place: 'pb', sockets: 1 }, { kind: 'shiftVoice', voice: 'vb', claimVariant: 0 }], staging: 'drought', severity: 'sharp', entryEdge: 'east', locus: { kind: 'place', place: 'pb' }, headline: 'Bravo shrinks to a single socket.', scarLabel: 'Shrunk' },
                { key: 'va3', guard: { kind: 'piecePinned', piece: 'ig' }, effects: [{ kind: 'revealFact', piece: 'ig' }, { kind: 'shiftVoice', voice: 'vc', claimVariant: 0 }], staging: 'revelation', severity: 'quiet', entryEdge: 'west', locus: { kind: 'piece', piece: 'ig' }, headline: 'The Oath was never binding.', scarLabel: 'Revealed' },
                { key: 'va4', effects: [{ kind: 'adjustResourceLimit', resource: 'rb', limit: 5 }, { kind: 'shiftVoice', voice: 'vd', claimVariant: 0 }], staging: 'drought', severity: 'quiet', entryEdge: 'south', locus: { kind: 'threshold' }, headline: 'The allowance is cut to five.', scarLabel: 'Cut' }
            ]
        },
        {
            key: 'bb',
            trigger: 'afterRevision',
            variants: [
                { key: 'vb1', effects: [{ kind: 'lockPlace', place: 'pe' }], staging: 'closure', severity: 'quiet', entryEdge: 'south', locus: { kind: 'place', place: 'pe' }, headline: 'Echo is sealed for the night.', scarLabel: 'Sealed' }
            ]
        }
    ],
    resolution: {
        hindsight: [
            { piece: 'ia', condition: { kind: 'pieceCut', piece: 'ia' }, note: 'Iron was dropped.' },
            { piece: 'ib', condition: { kind: 'pieceCut', piece: 'ib' }, note: 'Jade was dropped.' },
            { piece: 'ic', condition: { kind: 'pieceCut', piece: 'ic' }, note: 'Kiln was dropped.' },
            { piece: 'id', condition: { kind: 'pieceCut', piece: 'id' }, note: 'Loom was dropped.' }
        ]
    },
    tutor
};

/* H-2 — no Rules at all. Everything is judgement; nothing can ever be a Seam. */
const h2 = {
    contract,
    meta: { title: 'No Rules', premise: 'Nothing is mechanically wrong here, only arguable.', levelBand: 'B1-B2', targetMinutes: 10, tone: 'playful' },
    design: { tensionShape: 'fairPlanVsWorkingPlan', pressureSignature: 'voiceShift', intendedDilemma: 'Only human claims decide anything.', languageFocus: ['justification'] },
    presentation: { stageForm: 'table', kit: 'fieldNotebook', accent: 'moss' },
    world: { topology: 'groups', thresholdLabel: 'Waiting', marginLabel: 'Not Chosen', clockLabel: 'Now' },
    places: [
        { key: 'left', name: 'Left Room', glyph: 'hearth', sockets: 3 },
        { key: 'right', name: 'Right Room', glyph: 'garden', sockets: 3 }
    ],
    pieces: [
        { key: 'ash', name: 'Ash', glyph: 'person', tags: [] },
        { key: 'bo', name: 'Bo', glyph: 'person', tags: [] },
        { key: 'cy', name: 'Cy', glyph: 'person', tags: [] },
        { key: 'di', name: 'Di', glyph: 'person', tags: [] }
    ],
    resources: [],
    rules: [],
    goals: [
        { key: 'together', label: 'Nobody sits alone', condition: { kind: 'pieceIn', piece: 'ash', place: 'left' }, reachedLine: 'Ash stayed left.', missedLine: 'Ash moved.' }
    ],
    voices: [
        { key: 'ora', name: 'Ora', role: 'watches', claim: 'Ash belongs on the left. Obviously.', tethers: [{ kind: 'piece', piece: 'ash' }], anchor: { kind: 'place', place: 'left' }, outcomes: [], fallbackOutcome: 'You did what you did.' }
    ],
    beats: [
        {
            key: 'shift',
            trigger: 'afterCommit',
            variants: [
                { key: 'only', effects: [{ kind: 'closePlace', place: 'right' }], staging: 'closure', severity: 'sharp', entryEdge: 'west', locus: { kind: 'place', place: 'right' }, headline: 'The right room is locked.', scarLabel: 'Locked' }
            ]
        }
    ],
    resolution: { hindsight: [] },
    tutor
};

/* H-3 — the longest legal names in the narrowest layout slots. */
const h3 = {
    contract,
    meta: { title: 'Long Names Everywhere', premise: 'Every string sits at the top of its budget and must still render.', levelBand: 'B2-C1', targetMinutes: 15, tone: 'dry' },
    design: { tensionShape: 'speedVsCare', pressureSignature: 'time', intendedDilemma: 'Legibility under maximum text in the tightest slots available.', languageFocus: ['clarification'] },
    presentation: { stageForm: 'table', kit: 'draftingRoom', accent: 'redline' },
    world: { topology: 'groups', thresholdLabel: 'Assembly Point', marginLabel: 'Withdrawn Items', clockLabel: 'Midnight run' },
    places: [
        { key: 'northwest', name: 'Northwest Wing', glyph: 'workshop', sockets: 6, descriptor: 'Draughty and rather far away' },
        { key: 'substation', name: 'Substation Yard', glyph: 'tower', sockets: 6, descriptor: 'Fenced, gravelled, and quite loud' },
        { key: 'courtyard', name: 'Courtyard Steps', glyph: 'bench', sockets: 6, descriptor: 'Sheltered from the prevailing wind' },
        { key: 'warehouse', name: 'Warehouse Bay', glyph: 'depot', sockets: 6, descriptor: 'Cold storage, awkward access' },
        { key: 'gatehouse', name: 'Gatehouse Lodge', glyph: 'door', sockets: 6, descriptor: 'Small, but nobody else wants it' }
    ],
    pieces: [
        { key: 'transformer', name: 'Transformer', glyph: 'generator', tags: ['critical'] },
        { key: 'scaffolding', name: 'Scaffolding', glyph: 'toolkit', tags: ['bulky'] },
        { key: 'refrigerant', name: 'Refrigerant', glyph: 'barrel', tags: ['hazard'] },
        { key: 'instruments', name: 'Instruments', glyph: 'instrument', tags: ['delicate'] },
        { key: 'partitions', name: 'Partitions', glyph: 'workshop', tags: ['bulky'] },
        { key: 'groundsheet', name: 'Groundsheet', glyph: 'tent', tags: ['bulky'] },
        { key: 'switchgear', name: 'Switchgear', glyph: 'generator', tags: ['critical'] },
        { key: 'ventilation', name: 'Ventilation', glyph: 'pump', tags: ['bulky'] }
    ],
    resources: [],
    rules: [
        { key: 'hazard-siting', kind: 'allowedIn', subject: { kind: 'tag', tag: 'hazard' }, places: ['substation', 'warehouse'], inscription: 'Hazardous goods outdoors only' }
    ],
    goals: [
        { key: 'critical-sited', label: 'Critical plant is sited', condition: { kind: 'countTagged', tag: 'critical', scope: 'plan', cmp: 'gte', value: 2 }, reachedLine: 'Both critical units were sited before the deadline.', missedLine: 'A critical unit never found a home.' }
    ],
    voices: [
        { key: 'inspector', name: 'Inspector Hallowell', role: 'signs the certificate', claim: 'Refrigerant stays outdoors, whatever else you decide.', tethers: [{ kind: 'piece', piece: 'refrigerant' }], anchor: { kind: 'place', place: 'substation' }, outcomes: [], fallbackOutcome: 'The paperwork was, in the end, acceptable to me.' }
    ],
    beats: [
        {
            key: 'condemnation',
            trigger: 'afterCommit',
            omen: { edge: 'west', text: 'A clipboard at the gatehouse' },
            variants: [
                { key: 'northwest-condemned', effects: [{ kind: 'closePlace', place: 'northwest' }], staging: 'closure', severity: 'heavy', entryEdge: 'west', locus: { kind: 'place', place: 'northwest' }, headline: 'The Northwest Wing is condemned with immediate effect.', scarLabel: 'Condemned' }
            ]
        }
    ],
    resolution: { hindsight: [] },
    tutor
};

/* H-4 — every beat unconditional, including an aftershock. */
const h4 = {
    contract,
    meta: { title: 'Unconditional', premise: 'Both beats fire the same way no matter what the plan says.', levelBand: 'B1-B2', targetMinutes: 12, tone: 'grave' },
    design: { tensionShape: 'earlyCommitmentBlocksLaterOpportunity', pressureSignature: 'loss', intendedDilemma: 'The world does not care what you chose.', languageFocus: ['hindsight'] },
    presentation: { stageForm: 'route', kit: 'draftingRoom', accent: 'graphite' },
    world: { topology: 'sequence', thresholdLabel: 'Staging', marginLabel: 'Held Back', clockLabel: 'First light' },
    places: [
        { key: 'origin', name: 'Origin', glyph: 'harbour', sockets: 3 },
        { key: 'transit', name: 'Transit', glyph: 'bridge', sockets: 3 },
        { key: 'delivery', name: 'Delivery', glyph: 'depot', sockets: 3 }
    ],
    pieces: [
        { key: 'water', name: 'Water', glyph: 'barrel', tags: ['supply'] },
        { key: 'bread', name: 'Bread', glyph: 'store', tags: ['supply'] },
        { key: 'coats', name: 'Coats', glyph: 'tent', tags: ['supply'] },
        { key: 'nurse', name: 'Nurse', glyph: 'person', tags: ['people'] }
    ],
    resources: [],
    rules: [
        { key: 'water-first', kind: 'before', a: 'water', b: 'bread', inscription: 'Water lands before bread' }
    ],
    goals: [
        { key: 'delivered', label: 'Something reaches Delivery', condition: { kind: 'countTagged', tag: 'supply', scope: 'place', place: 'delivery', cmp: 'gte', value: 1 }, reachedLine: 'Something got through.', missedLine: 'Nothing got through.' }
    ],
    voices: [],
    beats: [
        {
            key: 'first-cut',
            trigger: 'afterCommit',
            variants: [
                { key: 'sever', effects: [{ kind: 'severAfter', place: 'transit' }], staging: 'rupture', severity: 'sharp', entryEdge: 'north', locus: { kind: 'place', place: 'transit' }, headline: 'The road past Transit is gone.', scarLabel: 'Severed' }
            ]
        },
        {
            key: 'aftershock',
            trigger: 'afterRevision',
            variants: [
                { key: 'again', effects: [{ kind: 'makeUnavailable', piece: 'nurse' }], staging: 'rupture', severity: 'heavy', entryEdge: 'north', locus: { kind: 'piece', piece: 'nurse' }, headline: 'The nurse is recalled to the city.', scarLabel: 'Recalled' }
            ]
        }
    ],
    resolution: { hindsight: [] },
    tutor
};

/* H-5 — a world that locks everything it contains. */
const h5 = {
    contract,
    meta: { title: 'Everything Locks', premise: 'One beat freezes every piece and every place at once.', levelBand: 'B1-B2', targetMinutes: 10, tone: 'grave' },
    design: { tensionShape: 'protectThePinnedVsProtectTheGroup', pressureSignature: 'loss', intendedDilemma: 'After the beat there is nothing left to decide, and that has to still resolve cleanly.', languageFocus: ['hindsight'] },
    presentation: { stageForm: 'table', kit: 'fieldNotebook', accent: 'clay' },
    world: { topology: 'groups', thresholdLabel: 'Doorway', marginLabel: 'Excluded', clockLabel: 'Lockdown' },
    places: [
        { key: 'vault', name: 'Vault', glyph: 'archive', sockets: 3 },
        { key: 'office', name: 'Office', glyph: 'workshop', sockets: 3 }
    ],
    pieces: [
        { key: 'ledger', name: 'Ledger', glyph: 'book', tags: ['record'] },
        { key: 'keyring', name: 'Keyring', glyph: 'toolkit', tags: ['access'] },
        { key: 'clockwork', name: 'Clockwork', glyph: 'clock', tags: ['record'] },
        { key: 'painting', name: 'Painting', glyph: 'painting', tags: ['value'] }
    ],
    resources: [],
    rules: [
        { key: 'records-vault', kind: 'allowedIn', subject: { kind: 'tag', tag: 'record' }, places: ['vault'], inscription: 'Records live in the vault' }
    ],
    goals: [
        { key: 'ledger-safe', label: 'The ledger is in the vault', condition: { kind: 'pieceIn', piece: 'ledger', place: 'vault' }, reachedLine: 'The ledger was where it should be.', missedLine: 'The ledger was somewhere else.' }
    ],
    voices: [],
    beats: [
        {
            key: 'seal',
            trigger: 'afterCommit',
            omen: { edge: 'south', text: 'A siren, two streets away' },
            variants: [
                { key: 'freeze', effects: [{ kind: 'lockPiece', piece: 'ledger' }, { kind: 'lockPiece', piece: 'painting' }, { kind: 'lockPlace', place: 'vault' }], staging: 'closure', severity: 'heavy', entryEdge: 'south', locus: { kind: 'place', place: 'vault' }, headline: 'Everything is sealed where it stands.', scarLabel: 'Sealed' }
            ]
        }
    ],
    resolution: { hindsight: [] },
    tutor
};

/* H-6 — almost nothing exists until a beat creates it. */
const h6 = {
    contract,
    meta: { title: 'Born Late', premise: 'Most of this world does not exist until the change arrives.', levelBand: 'B2-C1', targetMinutes: 12, tone: 'playful' },
    design: { tensionShape: 'earlyCommitmentBlocksLaterOpportunity', pressureSignature: 'revelation', intendedDilemma: 'You commit to a small world and then a much larger one appears around it.', languageFocus: ['speculation'] },
    presentation: { stageForm: 'table', kit: 'fieldNotebook', accent: 'ink' },
    world: { topology: 'groups', thresholdLabel: 'Outside', marginLabel: 'Turned Away', clockLabel: 'Opening' },
    places: [
        { key: 'front', name: 'Front Room', glyph: 'hearth', sockets: 3 },
        { key: 'annexe', name: 'The Annexe', glyph: 'door', sockets: 3, status: 'dormant' }
    ],
    pieces: [
        { key: 'first', name: 'Mira', glyph: 'person', tags: ['early'] },
        { key: 'second', name: 'Tomas', glyph: 'person', tags: ['early'] },
        { key: 'third', name: 'Yuki', glyph: 'person', tags: ['late'], status: 'dormant' },
        { key: 'fourth', name: 'Edda', glyph: 'person', tags: ['late'], status: 'dormant' }
    ],
    resources: [],
    rules: [
        { key: 'late-annexe', kind: 'allowedIn', subject: { kind: 'tag', tag: 'late' }, places: ['annexe'], inscription: 'Latecomers use the annexe', status: 'dormant' }
    ],
    goals: [
        { key: 'early-seated', label: 'The early arrivals sit', condition: { kind: 'countTagged', tag: 'early', scope: 'plan', cmp: 'gte', value: 2 }, reachedLine: 'Both were settled before the rush.', missedLine: 'One of them never sat down.' },
        { key: 'late-seated', label: 'The latecomers sit too', condition: { kind: 'countTagged', tag: 'late', scope: 'plan', cmp: 'gte', value: 2 }, reachedLine: 'Even the late ones found a chair.', missedLine: 'The annexe stayed half empty.', status: 'dormant' }
    ],
    voices: [],
    beats: [
        {
            key: 'the-rush',
            trigger: 'afterCommit',
            omen: { edge: 'east', text: 'Voices in the street' },
            variants: [
                { key: 'open-up', effects: [{ kind: 'reopenPlace', place: 'annexe' }, { kind: 'introducePiece', piece: 'third' }, { kind: 'activateGoal', goal: 'late-seated' }], staging: 'arrival', severity: 'sharp', entryEdge: 'east', locus: { kind: 'place', place: 'annexe' }, headline: 'The annexe opens and the street comes in.', scarLabel: 'Opened' }
            ]
        },
        {
            key: 'the-last',
            trigger: 'afterRevision',
            variants: [
                { key: 'one-more', effects: [{ kind: 'introducePiece', piece: 'fourth' }, { kind: 'activateRule', rule: 'late-annexe' }], staging: 'arrival', severity: 'quiet', entryEdge: 'east', locus: { kind: 'threshold' }, headline: 'One more, and the rule is enforced now.', scarLabel: 'Enforced' }
            ]
        }
    ],
    resolution: { hindsight: [] },
    tutor
};

export const hostileFixtures = { 'h-1': h1, 'h-2': h2, 'h-3': h3, 'h-4': h4, 'h-5': h5, 'h-6': h6 };
export default hostileFixtures;
