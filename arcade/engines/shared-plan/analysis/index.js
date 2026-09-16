/* Engine One — dilemma analysis.

   The runtime never searches; analysis verifies by search, before play. Every
   metric here is evidence about whether a world is a genuine dilemma, and every
   one of them is reported rather than enforced.

   It blocks nothing on its own. Build phase B1 calibrates nothing: thresholds
   invented before real lessons would reject good games and admit bad ones, so
   the stage plan decides later which findings block which authors.

   Analysis uses the model rather than reimplementing the Rules. */

import {
    buildContext,
    syntheticSession,
    sampleArrangements,
    enumerateRevisions,
    variantForCommit,
    familySignature,
    seams,
    overCapacityPlaces,
    evaluate,
    predicateTouchesPin
} from '../model/index.js';

const COMMIT_SAMPLE = 600;
const REVISION_SAMPLE = 120;

function withoutRule(game, ruleKey) {
    const rules = game.rules.filter((r) => r.key !== ruleKey);
    const ruleIndex = rules.reduce((out, r) => {
        out[r.key] = r;
        return out;
    }, Object.create(null));
    return { ...game, rules, ruleIndex };
}

/* A Rule binds if there is any plan which satisfies every other Rule but breaks
   this one. If no such plan exists anywhere in the space, the Rule never
   changes what is legal and is decoration.

   This has to be asked by lifting the Rule and looking for plans it would
   reject, not by comparing two counts: the samples are stratified and
   deduplicated, so their sizes are not comparable. */
function ruleBinds(game, identity, rule) {
    const { arrangements, truncated } = sampleArrangements(withoutRule(game, rule.key), identity, {
        target: COMMIT_SAMPLE,
        nodeBudget: 400000
    });
    for (const placements of arrangements) {
        const ctx = buildContext(game, syntheticSession(identity, placements, { phase: 'commit' }));
        if (seams(ctx).some((s) => s.rule === rule.key)) return { binds: true, truncated };
    }
    return { binds: false, truncated };
}

/* A beat touches a commit when the world it creates actually disturbs that
   plan: a Rule breaks, a Place overflows, something is stranded, a Goal goes
   out of reach, or a Piece in the plan is taken away or frozen. A beat that
   touches few commits is a beat most learners will shrug at. */
function disturbs(game, identity, placements, firedBeats) {
    const ctx = buildContext(game, syntheticSession(identity, placements, { firedBeats, phase: 'react' }));
    if (seams(ctx).length > 0) return true;
    if (overCapacityPlaces(ctx).length > 0) return true;

    for (const piece of game.pieces) {
        const loc = ctx.locationOf(piece.key);
        if (!loc || loc.kind !== 'place') continue;
        if (ctx.world.closedPlaces.has(loc.place)) return true;
        if (ctx.world.unavailablePieces.has(piece.key)) return true;
        if (ctx.world.lockedPieces.has(piece.key)) return true;
    }
    for (const goal of game.goals) {
        if (!ctx.world.activeGoals.has(goal.key)) continue;
        if (goal.impossibleWhen && evaluate(ctx, goal.impossibleWhen)) return true;
    }
    return false;
}

function frequencyReport(arrangements, game) {
    /* How often each Piece ends up in the same location across every legal
       plan. A Piece that is in one Place in almost every valid commit is not a
       decision the learner is really making. */
    const perPiece = {};
    for (const piece of game.pieces) {
        /* A dormant Piece is absent from every commit because it does not exist
           yet. Reporting that as a dominant placement would make every world
           with a late arrival look rigged. */
        if (piece.status !== 'active') continue;
        const counts = new Map();
        for (const arrangement of arrangements) {
            const loc = arrangement[piece.key];
            const key = loc?.kind === 'place' ? loc.place : (loc?.kind ?? 'absent');
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
        perPiece[piece.key] = top
            ? { where: top[0], share: arrangements.length ? top[1] / arrangements.length : 0 }
            : { where: 'absent', share: 0 };
    }
    return perPiece;
}

export function analyse(compiledGame, identity = {}) {
    const game = compiledGame;
    const notes = [];

    const { arrangements: commits, truncated: commitsTruncated } = sampleArrangements(game, identity, {
        target: COMMIT_SAMPLE,
        nodeBudget: 400000
    });

    const report = {
        validCommits: commits.length,
        commitsTruncated,
        dominance: frequencyReport(commits, game),
        deadRules: [],
        beats: [],
        goalReachAtCommit: {},
        notes
    };

    if (commits.length === 0) {
        notes.push('No legal plan exists, so nothing else can be measured.');
        return report;
    }

    /* Which Goals are already satisfiable by a plain commit, before anything
       has happened. A Goal that every valid commit reaches carries no tension. */
    for (const goal of game.goals) {
        if (goal.status !== 'active') continue;
        let reached = 0;
        for (const placements of commits) {
            const ctx = buildContext(game, syntheticSession(identity, placements, { phase: 'commit' }));
            if (evaluate(ctx, goal.condition)) reached += 1;
        }
        const share = reached / commits.length;
        report.goalReachAtCommit[goal.key] = share;
        if (share === 1) {
            notes.push(`Goal "${goal.key}" is reached by every legal plan, so it carries no tension at commit.`);
        }
    }

    /* A Rule that never changes which plans are legal is decoration. */
    for (const rule of game.rules) {
        if (rule.status !== 'active') continue;
        const { binds, truncated } = ruleBinds(game, identity, rule);
        if (!binds && !truncated) {
            report.deadRules.push(rule.key);
            notes.push(`Rule "${rule.key}" never rejects any plan, so it never binds.`);
        }
    }

    /* Guards may read the Keep pin, so a variant can be perfectly reachable and
       still never fire for an unpinned plan. Reachability is therefore asked
       with the pin varied, while share and touch rate stay measured on the
       unpinned plan, which is what an ordinary session looks like. */
    const pinSensitive = (beat) => beat.variants.some(
        (v) => v.guard && predicateTouchesPin(v.guard)
    );

    for (const beat of game.beats) {
        const variantCounts = new Map();
        const reachableUnderSomePin = new Set();
        let touched = 0;

        for (const placements of commits) {
            const variant = variantForCommit(game, identity, beat, placements);
            variantCounts.set(variant.key, (variantCounts.get(variant.key) ?? 0) + 1);
            if (disturbs(game, identity, placements, [{ beat: beat.key, variant: variant.key }])) touched += 1;

            if (pinSensitive(beat)) {
                for (const [key, loc] of Object.entries(placements)) {
                    if (loc.kind !== 'place') continue;
                    reachableUnderSomePin.add(
                        variantForCommit(game, identity, beat, placements, key).key
                    );
                }
            }
        }

        /* How many structurally different answers the learner has once the
           change has landed. One family means the revision is forced, which is
           the silent optimiser's dream and the conversation's loss. */
        const families = new Map();
        const sample = commits.slice(0, REVISION_SAMPLE);
        let revisionsTruncated = false;
        for (const placements of sample) {
            const variant = variantForCommit(game, identity, beat, placements);
            const firedBeats = [{ beat: beat.key, variant: variant.key }];
            const { arrangements: revisions, truncated } = enumerateRevisions(
                game, identity, placements, firedBeats, { nodeBudget: 60000 }
            );
            if (truncated) revisionsTruncated = true;
            const signatures = new Set(revisions.map(familySignature));
            const current = families.get(variant.key) ?? { min: Infinity, max: 0, total: 0, n: 0 };
            current.min = Math.min(current.min, signatures.size);
            current.max = Math.max(current.max, signatures.size);
            current.total += signatures.size;
            current.n += 1;
            families.set(variant.key, current);
        }

        const pinGated = beat.variants
            .filter((v) => !variantCounts.has(v.key) && reachableUnderSomePin.has(v.key))
            .map((v) => v.key);
        const unreachable = beat.variants
            .filter((v) => !variantCounts.has(v.key) && !reachableUnderSomePin.has(v.key))
            .map((v) => v.key);

        for (const key of pinGated) {
            notes.push(`Variant "${beat.key}/${key}" fires only when something is pinned.`);
        }
        for (const key of unreachable) {
            notes.push(`Variant "${beat.key}/${key}" never fires for any legal plan.`);
        }

        /* If the pin decides every guarded outcome, the learner works out that
           what they declare is what the world comes for, and stops pinning
           honestly. One pin-gated variant among several is not that. */
        const guarded = beat.variants.filter((v) => v.guard);
        if (pinGated.length >= 2 && pinGated.length === guarded.length) {
            notes.push(`Beat "${beat.key}" is decided entirely by the Keep pin.`);
        }

        report.beats.push({
            beat: beat.key,
            trigger: beat.trigger,
            touchRate: touched / commits.length,
            variantShare: Object.fromEntries(
                [...variantCounts.entries()].map(([k, n]) => [k, n / commits.length])
            ),
            unreachableVariants: unreachable,
            pinGatedVariants: pinGated,
            revisionFamilies: Object.fromEntries(
                [...families.entries()].map(([k, f]) => [k, {
                    min: f.min === Infinity ? 0 : f.min,
                    max: f.max,
                    mean: f.n ? f.total / f.n : 0
                }])
            ),
            revisionsTruncated
        });
    }

    return report;
}

export function formatAnalysis(game, report) {
    const lines = [];
    lines.push(`Valid commits: ${report.validCommits}${report.commitsTruncated ? ' (search truncated)' : ''}`);

    const dominant = Object.entries(report.dominance)
        .filter(([, d]) => d.share >= 0.9)
        .map(([key, d]) => `${key} -> ${d.where} (${Math.round(d.share * 100)}%)`);
    lines.push(`Dominant placements: ${dominant.length ? dominant.join(', ') : 'none above 90%'}`);

    lines.push(`Dead Rules: ${report.deadRules.length ? report.deadRules.join(', ') : 'none'}`);

    for (const [goal, share] of Object.entries(report.goalReachAtCommit)) {
        lines.push(`Goal "${goal}" already reached by ${Math.round(share * 100)}% of valid commits`);
    }

    for (const beat of report.beats) {
        lines.push(`Beat "${beat.beat}" (${beat.trigger}): touches ${Math.round(beat.touchRate * 100)}% of commits`);
        for (const [variant, share] of Object.entries(beat.variantShare)) {
            const families = beat.revisionFamilies[variant];
            const familyText = families
                ? `revision families min ${families.min}, mean ${families.mean.toFixed(1)}, max ${families.max}`
                : 'no revision sample';
            lines.push(`  ${variant}: fires for ${Math.round(share * 100)}% of commits; ${familyText}`);
        }
        if (beat.pinGatedVariants.length) {
            lines.push(`  pin-gated: ${beat.pinGatedVariants.join(', ')}`);
        }
        if (beat.unreachableVariants.length) {
            lines.push(`  unreachable: ${beat.unreachableVariants.join(', ')}`);
        }
    }

    for (const note of report.notes) lines.push(`Note: ${note}`);
    return lines.join('\n');
}
