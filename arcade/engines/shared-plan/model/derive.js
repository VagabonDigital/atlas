/* Engine One — derivation of the World View.

   The World View is made of marks. A "requires" Rule and a "sum limit" Rule both
   arrive as Seams carrying an inscription; nothing downstream can tell which
   Rule produced one. That is what keeps the visual grammar independent of any
   particular game, and it is why a new Rule kind costs model and compiler work
   but no Stage work. */

import { buildContext } from './state.js';
import { seams, overCapacityPlaces, activeRules } from './rules.js';
import { evaluate } from './predicates.js';
import { variantOf } from './effects.js';
import { checkAction } from './actions.js';
import { isEditable } from './phases.js';

const PRIMARY_BY_PHASE = Object.freeze({
    plan: { id: 'commitPlan', label: 'Commit plan', interaction: 'hold' },
    commit: { id: 'bringChange', label: 'Bring the change', interaction: 'press' },
    react: { id: 'openRevision', label: 'Open revision', interaction: 'press' },
    revise: { id: 'setNewPlan', label: 'Set the new plan', interaction: 'hold' },
    resolve: { id: 'finish', label: 'Finish', interaction: 'press' }
});

function materialState(ctx, pieceKey, strainedPieces) {
    const phase = ctx.session.phase;
    if (phase === 'resolve') return 'resolved';
    if (strainedPieces.has(pieceKey)) return 'strained';
    if (phase === 'plan') return 'provisional';
    if (phase === 'revise') return 'loosened';
    return 'set';
}

/* Which Places currently hold Pieces that can no longer leave through an open
   world: the change landed on them and their contents are stranded. */
function strandedPlaces(ctx) {
    return ctx.game.places
        .filter((p) => ctx.world.closedPlaces.has(p.key) && ctx.piecesIn(p.key).length > 0)
        .map((p) => p.key);
}

function disclosureSet(ctx) {
    const set = new Set();
    for (const place of ctx.game.places) if (ctx.world.bornPlaces.has(place.key)) set.add(`place:${place.key}`);
    for (const piece of ctx.game.pieces) if (ctx.world.bornPieces.has(piece.key)) set.add(`piece:${piece.key}`);
    for (const rule of ctx.game.rules) if (ctx.world.activeRules.has(rule.key)) set.add(`rule:${rule.key}`);
    for (const goal of ctx.game.goals) if (ctx.world.activeGoals.has(goal.key)) set.add(`goal:${goal.key}`);
    for (const voice of ctx.game.voices) set.add(`voice:${voice.key}`);
    /* A resource exists on the Stage only once an active Rule makes it bite. */
    for (const resource of ctx.game.resources) {
        const live = activeRules(ctx).some((r) => r.kind === 'sumLimit' && r.resource === resource.key);
        if (live) set.add(`resource:${resource.key}`);
    }
    return set;
}

function baselineFor(session) {
    if (session.commitments.length === 0) return null;
    /* During revision the Imprint is the plan the learner has just set; at
       Resolve it is the position they originally took, because that is the one
       the final conversation is about. */
    return session.phase === 'resolve'
        ? session.commitments[0]
        : session.commitments[session.commitments.length - 1];
}

function sameLocation(a, b) {
    if (!a || !b) return false;
    if (a.kind !== b.kind) return false;
    return a.kind !== 'place' || (a.place === b.place && a.socket === b.socket);
}

export function derive(game, session) {
    const ctx = buildContext(game, session);
    const brokenSeams = seams(ctx);
    const overflow = overCapacityPlaces(ctx);
    const stranded = new Set(strandedPlaces(ctx));

    const strainedPieces = new Set();
    for (const seam of brokenSeams) {
        if (seam.locus.kind === 'piece') strainedPieces.add(seam.locus.piece);
        if (seam.locus.kind === 'place') for (const k of ctx.piecesIn(seam.locus.place)) strainedPieces.add(k);
    }
    for (const place of stranded) for (const k of ctx.piecesIn(place)) strainedPieces.add(k);
    for (const o of overflow) for (const k of ctx.piecesIn(o.place)) strainedPieces.add(k);

    const baseline = baselineFor(session);
    const lastFired = session.firedBeats.at(-1) ?? null;
    const lastVariant = lastFired ? variantOf(game, lastFired) : null;

    /* --- pieces --- */
    const pieces = game.pieces
        .filter((p) => ctx.world.bornPieces.has(p.key))
        .map((p) => ({
            key: p.key,
            name: p.name,
            glyph: p.glyph,
            tags: p.tags,
            location: ctx.locationOf(p.key),
            material: materialState(ctx, p.key, strainedPieces),
            locked: ctx.world.lockedPieces.has(p.key),
            unavailable: ctx.world.unavailablePieces.has(p.key),
            pinned: ctx.isPinned(p.key),
            justArrived: ctx.world.justArrived.has(p.key),
            fact: p.fact && (!p.fact.hidden || ctx.world.revealedFacts.has(p.key)) ? p.fact.text : null,
            factRevealed: Boolean(p.fact?.hidden) && ctx.world.revealedFacts.has(p.key)
        }));

    /* --- places --- */
    const places = game.places
        .filter((p) => ctx.world.bornPlaces.has(p.key))
        .map((p) => ({
            key: p.key,
            name: p.name,
            glyph: p.glyph,
            descriptor: p.descriptor ?? null,
            slot: p.slot ?? null,
            open: ctx.isPlaceOpen(p.key),
            closed: ctx.world.closedPlaces.has(p.key),
            locked: ctx.world.lockedPlaces.has(p.key),
            stranded: stranded.has(p.key),
            sockets: ctx.capacityOf(p.key),
            held: ctx.piecesIn(p.key).length,
            loads: game.resources
                .filter((r) => r.scope === 'place')
                .map((r) => ({
                    resource: r.key,
                    label: r.label,
                    unit: r.unit,
                    render: r.render,
                    fill: ctx.resourceSum(r.key, 'place', p.key),
                    limit: ctx.limitOf(r.key)
                }))
        }));

    const planLoads = game.resources
        .filter((r) => r.scope === 'plan')
        .map((r) => ({
            resource: r.key,
            label: r.label,
            unit: r.unit,
            render: r.render,
            fill: ctx.resourceSum(r.key, 'plan'),
            limit: ctx.limitOf(r.key)
        }));

    /* --- rule marks ---
       A tether is drawn as one of three marks. The Stage needs to know whether
       two Pieces are pulled together, pushed apart or ordered, because those
       look different. It does not need to know which Rule kind said so. */
    const TETHER_RELATION = { together: 'bond', near: 'bond', apart: 'repel', far: 'repel', before: 'order' };
    const tethers = activeRules(ctx)
        .filter((r) => Object.hasOwn(TETHER_RELATION, r.kind))
        .map((r) => ({
            rule: r.key,
            relation: TETHER_RELATION[r.kind],
            a: r.a,
            b: r.b,
            inscription: r.inscription,
            relevant: session.phase === 'react' || session.phase === 'resolve'
                || strainedPieces.has(r.a) || strainedPieces.has(r.b)
        }));

    /* --- scars --- */
    const scars = session.firedBeats.map((fired) => {
        const variant = variantOf(game, fired);
        return { locus: variant.locus, label: variant.scarLabel, beat: fired.beat, variant: fired.variant };
    });

    /* --- imprint and drift --- */
    const imprint = [];
    const driftLines = [];
    const returnLines = [];
    if (baseline && session.phase !== 'plan' && session.phase !== 'commit') {
        for (const piece of game.pieces) {
            if (!ctx.world.bornPieces.has(piece.key)) continue;
            const was = baseline.placements[piece.key];
            const now = ctx.locationOf(piece.key);
            if (!was || sameLocation(was, now)) continue;
            if (was.kind === 'place') {
                imprint.push({ piece: piece.key, name: piece.name, place: was.place, socket: was.socket });
                if (now.kind === 'place') driftLines.push({ piece: piece.key, from: was, to: now });
            }
            if (was.kind === 'margin' && now.kind === 'place') {
                returnLines.push({ piece: piece.key, to: now });
            }
        }
    }

    /* --- voices --- */
    const touchedByLastBeat = new Set();
    if (lastVariant) {
        if (lastVariant.locus.kind === 'piece') touchedByLastBeat.add(`piece:${lastVariant.locus.piece}`);
        if (lastVariant.locus.kind === 'place') touchedByLastBeat.add(`place:${lastVariant.locus.place}`);
        for (const effect of lastVariant.effects) {
            if (effect.piece) touchedByLastBeat.add(`piece:${effect.piece}`);
            if (effect.place) touchedByLastBeat.add(`place:${effect.place}`);
        }
    }

    const voices = game.voices.map((v) => {
        const variantIndex = ctx.world.voiceClaim[v.key];
        const claim = variantIndex === null || variantIndex === undefined
            ? v.claim
            : (v.claimVariants[variantIndex] ?? v.claim);
        const tetherEnds = v.tethers.map((t) => {
            if (t.kind === 'piece') {
                return { kind: 'piece', key: t.piece, at: ctx.locationOf(t.piece) };
            }
            return { kind: 'place', key: t.place, at: { kind: 'place', place: t.place } };
        });
        return {
            key: v.key,
            name: v.name,
            role: v.role,
            claim,
            anchor: v.anchor,
            tethers: tetherEnds,
            /* Atlas shows where the thing they care about went. It never shows
               whether that was right. */
            brightened: tetherEnds.some((t) => touchedByLastBeat.has(`${t.kind}:${t.key}`))
        };
    });

    /* --- horizon --- */
    const horizon = game.goals
        .filter((g) => ctx.world.activeGoals.has(g.key))
        .map((g) => ({
            key: g.key,
            label: g.label,
            crossed: Boolean(g.impossibleWhen) && evaluate(ctx, g.impossibleWhen),
            reached: session.phase === 'resolve' ? evaluate(ctx, g.condition) : null,
            line: session.phase === 'resolve'
                ? (evaluate(ctx, g.condition) ? g.reachedLine : g.missedLine)
                : null
        }));

    /* --- resolve marks --- */
    let resolution = null;
    if (session.phase === 'resolve') {
        const first = session.commitments[0] ?? null;
        const journeys = game.pieces
            .filter((p) => ctx.world.bornPieces.has(p.key))
            .map((p) => {
                const was = first?.placements[p.key] ?? null;
                const now = ctx.locationOf(p.key);
                let state;
                if (now.kind === 'margin') state = 'lost';
                else if (was && sameLocation(was, now)) state = 'held';
                else state = 'moved';
                return { piece: p.key, name: p.name, from: was, to: now, state };
            });

        resolution = {
            journeys,
            voiceOutcomes: game.voices.map((v) => {
                const match = v.outcomes.find((o) => evaluate(ctx, o.condition));
                return { voice: v.key, name: v.name, line: match ? match.line : v.fallbackOutcome };
            }),
            hindsight: game.resolution.hindsight
                .filter((h) => evaluate(ctx, h.condition))
                .map((h) => ({ piece: h.piece, note: h.note }))
        };
    }

    /* --- primary actions for the Core chrome slot --- */
    const primary = PRIMARY_BY_PHASE[session.phase];
    const primaryActions = [];
    if (session.phase === 'resolve') {
        primaryActions.push({ ...primary, enabled: true });
    } else {
        const verdict = checkAction(ctx, { kind: primary.id, confirm: false });
        primaryActions.push({
            ...primary,
            enabled: verdict.ok,
            reason: verdict.ok ? undefined : verdict.reason,
            needsConfirm: verdict.needsConfirm ?? false
        });
        if (checkAction(ctx, { kind: 'resolveNow' }).ok) {
            primaryActions.push({ id: 'resolveNow', label: 'Resolve now', interaction: 'press', enabled: true });
        }
    }

    return {
        phase: session.phase,
        editable: isEditable(session.phase),
        disclosure: disclosureSet(ctx),
        world: {
            topology: game.topology.kind,
            stageForm: game.presentation.stageForm,
            thresholdLabel: game.world.thresholdLabel,
            marginLabel: game.world.marginLabel,
            clockLabel: game.world.clockLabel,
            clockStarted: session.commitments.length > 0,
            severedAfter: [...ctx.world.severedAfter]
        },
        pieces,
        places,
        planLoads,
        seams: brokenSeams,
        overflow,
        tethers,
        scars,
        imprint,
        driftLines,
        returnLines,
        voices,
        horizon,
        omen: omenFor(ctx),
        resolution,
        primaryActions
    };
}

/* The Omen sits at the edge the change will come from, and only while the change
   is still ahead. */
function omenFor(ctx) {
    if (ctx.session.phase !== 'plan' && ctx.session.phase !== 'commit') return null;
    const beat = ctx.game.beats.find((b) => b.trigger === 'afterCommit' && !ctx.firedBeatSet.has(b.key));
    if (!beat?.omen) return null;
    return { edge: beat.omen.edge, text: beat.omen.text, sharpened: ctx.session.phase === 'commit' };
}
