/* Engine One — narration.

   Turns a World View into short factual text. It serves three consumers: test
   snapshots, the Class C critic (which has to be able to "read" a playthrough)
   and screen-reader descriptions.

   It must not become player-facing copy on the Stage. Everything here describes
   what is true; nothing here persuades, summarises quality or scores. */

function nameOf(game, kind, key) {
    const section = { piece: 'pieceIndex', place: 'placeIndex', voice: 'voiceIndex' }[kind];
    return game[section]?.[key]?.name ?? key;
}

function locusText(game, locus) {
    switch (locus.kind) {
        case 'piece': return nameOf(game, 'piece', locus.piece);
        case 'place': return nameOf(game, 'place', locus.place);
        case 'voice': return nameOf(game, 'voice', locus.voice);
        case 'threshold': return 'the Threshold';
        case 'plan': return 'the plan';
        default: return 'the world';
    }
}

function locationText(game, location) {
    if (!location) return 'not yet in the world';
    switch (location.kind) {
        case 'threshold': return 'at the Threshold';
        case 'margin': return 'set aside';
        case 'place': return `in ${nameOf(game, 'place', location.place)}`;
        default: return 'nowhere';
    }
}

function list(items) {
    if (items.length === 0) return 'nothing';
    if (items.length === 1) return items[0];
    return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}

export function narrate(game, view) {
    const lines = [];

    lines.push(`PHASE: ${view.phase}${view.editable ? ' (the plan can be changed)' : ' (the plan is set)'}`);

    for (const place of view.places) {
        const held = view.pieces
            .filter((p) => p.location.kind === 'place' && p.location.place === place.key)
            .map((p) => p.name + (p.pinned ? ' [kept]' : '') + (p.material === 'strained' ? ' [strained]' : ''));
        const state = [
            place.closed ? 'closed' : null,
            place.stranded ? 'stranded' : null,
            place.locked ? 'locked' : null
        ].filter(Boolean);
        const loads = place.loads
            .filter((l) => l.fill > 0 || l.limit > 0)
            .map((l) => `${l.label} ${l.fill}/${l.limit} ${l.unit}`);
        lines.push(
            `  ${place.name}${state.length ? ` (${state.join(', ')})` : ''}: `
            + `${held.length}/${place.sockets} — ${list(held)}`
            + (loads.length ? ` · ${loads.join(' · ')}` : '')
        );
    }

    const threshold = view.pieces.filter((p) => p.location.kind === 'threshold');
    if (threshold.length > 0) {
        lines.push(`  ${view.world.thresholdLabel}: ${list(threshold.map((p) => p.name + (p.justArrived ? ' [just arrived]' : '')))}`);
    }

    const margin = view.pieces.filter((p) => p.location.kind === 'margin');
    lines.push(`  ${view.world.marginLabel}: ${list(margin.map((p) => p.name))}`);

    for (const load of view.planLoads) {
        lines.push(`  ${load.label}: ${load.fill}/${load.limit} ${load.unit}`);
    }

    if (view.omen) lines.push(`  Omen (${view.omen.edge}): ${view.omen.text}`);

    for (const seam of view.seams) {
        lines.push(`  SEAM at ${locusText(game, seam.locus)}: ${seam.inscription}`);
    }
    for (const over of view.overflow) {
        lines.push(`  OVERFLOW in ${nameOf(game, 'place', over.place)}: holding ${over.held} of ${over.capacity}`);
    }

    for (const piece of view.pieces) {
        if (piece.factRevealed) lines.push(`  REVEALED — ${piece.name}: ${piece.fact}`);
        if (piece.unavailable) lines.push(`  UNAVAILABLE — ${piece.name}`);
        if (piece.locked) lines.push(`  LOCKED — ${piece.name}`);
    }

    for (const scar of view.scars) {
        lines.push(`  SCAR at ${locusText(game, scar.locus)}: ${scar.label}`);
    }

    for (const hollow of view.imprint) {
        lines.push(`  IMPRINT — ${hollow.name} was in ${nameOf(game, 'place', hollow.place)}`);
    }
    for (const drift of view.driftLines) {
        lines.push(`  MOVED — ${nameOf(game, 'piece', drift.piece)}: ${nameOf(game, 'place', drift.from.place)} to ${nameOf(game, 'place', drift.to.place)}`);
    }
    for (const back of view.returnLines) {
        lines.push(`  BROUGHT BACK — ${nameOf(game, 'piece', back.piece)} into ${nameOf(game, 'place', back.to.place)}`);
    }

    for (const voice of view.voices) {
        /* A tether to a Place says where the Place is by naming it; only a
           tether to a Piece has somewhere to report. */
        const tethers = voice.tethers.map((t) => (
            t.kind === 'place'
                ? nameOf(game, 'place', t.key)
                : `${nameOf(game, 'piece', t.key)} ${locationText(game, t.at)}`
        ));
        lines.push(
            `  VOICE ${voice.name} (${voice.role})${voice.brightened ? ' [leaning in]' : ''}: "${voice.claim}"`
            + (tethers.length ? ` — cares about ${list(tethers)}` : '')
        );
    }

    for (const goal of view.horizon) {
        const state = goal.reached === null
            ? (goal.crossed ? 'now out of reach' : 'still open')
            : (goal.reached ? 'reached' : 'missed');
        lines.push(`  GOAL ${goal.label}: ${state}${goal.line ? ` — ${goal.line}` : ''}`);
    }

    if (view.resolution) {
        lines.push('  RESOLUTION');
        for (const journey of view.resolution.journeys) {
            lines.push(`    ${journey.name}: ${journey.state} (${locationText(game, journey.from)} to ${locationText(game, journey.to)})`);
        }
        for (const outcome of view.resolution.voiceOutcomes) {
            lines.push(`    ${outcome.name}: "${outcome.line}"`);
        }
        for (const note of view.resolution.hindsight) {
            lines.push(`    ${nameOf(game, 'piece', note.piece)} — ${note.note}`);
        }
    }

    const actions = view.primaryActions
        .map((a) => `${a.label}${a.enabled ? '' : ` (unavailable: ${a.reason})`}`);
    lines.push(`  BEAT CONTROL: ${list(actions)}`);

    return lines.join('\n');
}

/* A single line naming where everything stands, for compact test snapshots. */
export function narratePlacements(game, view) {
    return view.pieces
        .map((p) => `${p.key}=${p.location.kind === 'place' ? p.location.place : p.location.kind}`)
        .sort()
        .join(' ');
}
