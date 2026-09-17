/* Engine One — Class A semantics.

   Everything here is mechanically decidable from the Definition plus the model.
   Nothing here is a judgement about whether the game is any good: that is Class
   C, and it is advisory by policy. */

import { BUDGETS, VOCAB, countWords } from '../definition/index.js';
import { predicateDepth, predicateTouches, predicateTouchesPin } from '../model/predicates.js';
import { buildContext, syntheticSession } from '../model/index.js';
import { evaluate } from '../model/predicates.js';
import {
    commitEvidence, enumerateArrangements, enumerateRevisions,
    frozenAfterBeat, variantForCommit
} from '../model/enumerate.js';

const HONESTY_COMMIT_SAMPLE = 400;
/* Caps the expensive half of the honesty check. Hitting it means the answer is
   reported as unverified rather than quietly assumed. */
const HONESTY_REVISION_SEARCH_BUDGET = 600;

function checkPresentation(game, report) {
    const form = VOCAB.STAGE_FORMS[game.presentation.stageForm];
    if (form && form.topology !== game.world.topology) {
        report({
            code: 'validate.formTopology',
            locus: 'presentation.stageForm',
            message: `The ${game.presentation.stageForm} form is a "${form.topology}" world, but world.topology is "${game.world.topology}".`,
            modelMessage: `Set world.topology to "${form.topology}", or choose a form from: ${VOCAB.formsForTopology(game.world.topology).join(', ')}.`
        });
    }

    const kit = VOCAB.MATERIAL_KITS[game.presentation.kit];
    if (kit) {
        if (!kit.forms.includes(game.presentation.stageForm)) {
            report({
                code: 'validate.kitForm',
                locus: 'presentation.kit',
                message: `The "${kit.label}" kit does not support the ${game.presentation.stageForm} form.`,
                modelMessage: `Choose a kit that supports ${game.presentation.stageForm}.`
            });
        }
        if (!kit.accents.includes(game.presentation.accent)) {
            report({
                code: 'validate.kitAccent',
                locus: 'presentation.accent',
                message: `"${game.presentation.accent}" is not an accent of the "${kit.label}" kit.`,
                modelMessage: `Use one of: ${kit.accents.join(', ')}.`
            });
        }
    }
}

function checkTopologyVocabulary(game, report) {
    const topology = game.world.topology;

    game.rules.forEach((rule, i) => {
        const spec = VOCAB.RULE_KINDS[rule.kind];
        if (spec && !spec.topologies.includes(topology)) {
            report({
                code: 'validate.ruleTopology',
                locus: `rules[${i}]`,
                message: `A "${rule.kind}" Rule only means something in a ${spec.topologies.join(' or ')} world.`,
                modelMessage: `Remove this Rule, or use a Rule from: ${VOCAB.allowedForTopology(VOCAB.RULE_KINDS, topology).join(', ')}.`
            });
        }
    });

    const walkPredicate = (predicate, locus) => {
        const spec = VOCAB.PREDICATE_KINDS[predicate.kind];
        if (spec && !spec.topologies.includes(topology)) {
            report({
                code: 'validate.predicateTopology',
                locus,
                message: `The "${predicate.kind}" predicate only means something in a ${spec.topologies.join(' or ')} world.`,
                modelMessage: `Use a predicate from: ${VOCAB.allowedForTopology(VOCAB.PREDICATE_KINDS, topology).filter((k) => k !== 'all' && k !== 'not').join(', ')}.`
            });
        }
        if (predicate.kind === 'all') predicate.terms.forEach((t, i) => walkPredicate(t, `${locus}.terms[${i}]`));
        if (predicate.kind === 'not') walkPredicate(predicate.term, `${locus}.term`);

        if (predicateDepth(predicate) > BUDGETS.predicateDepth.max) {
            report({
                code: 'budget.predicateDepth',
                locus,
                message: `This condition nests ${predicateDepth(predicate)} deep; the maximum is ${BUDGETS.predicateDepth.max}.`,
                modelMessage: `Flatten this condition to at most ${BUDGETS.predicateDepth.max} levels of "all"/"not".`
            });
        }
    };

    for (const goal of game.goals) {
        walkPredicate(goal.condition, `goals.${goal.key}.condition`);
        if (goal.impossibleWhen) walkPredicate(goal.impossibleWhen, `goals.${goal.key}.impossibleWhen`);
    }
    for (const voice of game.voices) {
        if (voice.concern) walkPredicate(voice.concern, `voices.${voice.key}.concern`);
        voice.outcomes.forEach((o, i) => walkPredicate(o.condition, `voices.${voice.key}.outcomes[${i}].condition`));
    }
    for (const beat of game.beats) {
        for (const variant of beat.variants) {
            if (variant.guard) walkPredicate(variant.guard, `beats.${beat.key}.${variant.key}.guard`);
            for (const effect of variant.effects) {
                const spec = VOCAB.EFFECT_KINDS[effect.kind];
                if (spec && !spec.topologies.includes(topology)) {
                    report({
                        code: 'validate.effectTopology',
                        locus: `beats.${beat.key}.${variant.key}`,
                        message: `The "${effect.kind}" effect only means something in a ${spec.topologies.join(' or ')} world.`,
                        modelMessage: `Use an effect from: ${VOCAB.allowedForTopology(VOCAB.EFFECT_KINDS, topology).join(', ')}.`
                    });
                }
            }
        }
    }
    for (const note of game.resolution.hindsight) {
        walkPredicate(note.condition, `resolution.hindsight.${note.piece}`);
    }
}

function checkBeats(game, report) {
    if (!game.beats.some((b) => b.trigger === 'afterCommit')) {
        report({
            code: 'validate.noPrimaryBeat',
            locus: 'beats',
            message: 'Nothing ever happens to the committed plan: no beat is triggered after commit.',
            modelMessage: 'At least one beat must have trigger "afterCommit".'
        });
    }

    for (const beat of game.beats) {
        const last = beat.variants.at(-1);
        if (last?.guard) {
            report({
                code: 'validate.noFallbackVariant',
                locus: `beats.${beat.key}.${last.key}`,
                message: `The last variant of "${beat.key}" is guarded, so the beat could match nothing.`,
                modelMessage: `Remove the guard from the final variant of beat "${beat.key}" so there is always a fallback.`
            });
        }
        beat.variants.forEach((variant, i) => {
            if (i < beat.variants.length - 1 && !variant.guard) {
                report.warn({
                    code: 'validate.unreachableVariant',
                    locus: `beats.${beat.key}.${variant.key}`,
                    message: `This variant has no guard but is not last, so no later variant can ever fire.`,
                    modelMessage: `Give this variant a guard, or make it the final variant.`
                });
            }
            for (const effect of variant.effects) {
                if (effect.kind !== 'shiftVoice') continue;
                const voice = game.voiceIndex[effect.voice];
                if (voice && effect.claimVariant >= voice.claimVariants.length) {
                    report({
                        code: 'validate.missingClaimVariant',
                        locus: `beats.${beat.key}.${variant.key}`,
                        message: `${voice.name} has no claim variant at index ${effect.claimVariant}.`,
                        modelMessage: `Add a claimVariants entry to voice "${voice.key}", or lower claimVariant.`
                    });
                }
            }
        });
    }

    /* beatFired may only name a variant of the beat it names. */
    const walk = (predicate, locus) => {
        if (predicate.kind === 'beatFired' && predicate.variant) {
            const beat = game.beatIndex[predicate.beat];
            if (beat && !beat.variantIndex[predicate.variant]) {
                report({
                    code: 'validate.variantNotInBeat',
                    locus,
                    message: `Variant "${predicate.variant}" does not belong to beat "${predicate.beat}".`,
                    modelMessage: `Use one of beat "${predicate.beat}"'s variants: ${Object.keys(beat.variantIndex).join(', ')}.`
                });
            }
        }
        if (predicate.kind === 'all') predicate.terms.forEach((t, i) => walk(t, `${locus}.terms[${i}]`));
        if (predicate.kind === 'not') walk(predicate.term, `${locus}.term`);
    };
    for (const goal of game.goals) {
        walk(goal.condition, `goals.${goal.key}.condition`);
        if (goal.impossibleWhen) walk(goal.impossibleWhen, `goals.${goal.key}.impossibleWhen`);
    }
    for (const beat of game.beats) {
        for (const variant of beat.variants) {
            if (variant.guard) walk(variant.guard, `beats.${beat.key}.${variant.key}.guard`);
        }
    }
    for (const voice of game.voices) {
        voice.outcomes.forEach((o, i) => walk(o.condition, `voices.${voice.key}.outcomes[${i}].condition`));
    }
}

/* Nothing appears without a birth event. Anything dormant has to be born by
   some beat effect, or it can never exist. */
function checkDormantBirths(game, report) {
    const born = { piece: new Set(), place: new Set(), rule: new Set(), goal: new Set() };
    for (const beat of game.beats) {
        for (const variant of beat.variants) {
            for (const effect of variant.effects) {
                if (effect.kind === 'introducePiece') born.piece.add(effect.piece);
                if (effect.kind === 'reopenPlace') born.place.add(effect.place);
                if (effect.kind === 'activateRule') born.rule.add(effect.rule);
                if (effect.kind === 'activateGoal') born.goal.add(effect.goal);
            }
        }
    }

    const sections = [
        ['piece', game.pieces, 'pieces', 'introducePiece'],
        ['place', game.places, 'places', 'reopenPlace'],
        ['rule', game.rules, 'rules', 'activateRule'],
        ['goal', game.goals, 'goals', 'activateGoal']
    ];
    for (const [kind, items, section, effectName] of sections) {
        for (const item of items) {
            if (item.status === 'dormant' && !born[kind].has(item.key)) {
                report({
                    code: 'validate.dormantNeverBorn',
                    locus: `${section}.${item.key}`,
                    message: `"${item.key}" is dormant but no beat ever brings it into the world.`,
                    modelMessage: `Add a "${effectName}" effect for "${item.key}" to one of the beat variants, or set its status to "active".`
                });
            }
        }
    }
}

function checkInitialState(game, report) {
    const openActive = game.places.filter((p) => p.status === 'active').map((p) => p.key);
    if (openActive.length === 0) {
        report({
            code: 'validate.noOpenPlace',
            locus: 'places',
            message: 'Every Place is dormant, so there is nowhere to put anything.',
            modelMessage: 'At least one Place must have status "active".'
        });
    }
    for (const piece of game.pieces) {
        if (piece.status !== 'active') continue;
        const landable = game.affinity[piece.key].filter((k) => openActive.includes(k));
        if (landable.length === 0) {
            report({
                code: 'validate.noLegalDestination',
                locus: `pieces.${piece.key}`,
                message: `${piece.name} has nowhere it is allowed to stand.`,
                modelMessage: `Widen an allowedIn Rule for "${piece.key}", or make one of its permitted Places active.`
            });
        }
    }
}

/* A resource earns its place either by being limited by a Rule or by being
   counted by some condition. One that does neither creates no pressure and
   reads on the Stage as a number nobody is playing against. */
function checkDeadResources(game, report) {
    const counted = new Set();
    const walk = (predicate) => {
        const touches = predicateTouches(predicate);
        for (const key of touches.resources) counted.add(key);
    };
    for (const goal of game.goals) {
        walk(goal.condition);
        if (goal.impossibleWhen) walk(goal.impossibleWhen);
    }
    for (const voice of game.voices) {
        if (voice.concern) walk(voice.concern);
        for (const outcome of voice.outcomes) walk(outcome.condition);
    }
    for (const beat of game.beats) {
        for (const variant of beat.variants) if (variant.guard) walk(variant.guard);
    }
    for (const note of game.resolution.hindsight) walk(note.condition);

    for (const resource of game.resources) {
        const limited = game.rules.some((r) => r.kind === 'sumLimit' && r.resource === resource.key);
        if (!limited && !counted.has(resource.key)) {
            report.warn({
                code: 'analysis.deadResource',
                locus: `resources.${resource.key}`,
                message: `"${resource.label}" is never limited by a Rule and never counted by a condition, so it never creates pressure.`,
                modelMessage: `Add a sumLimit Rule for resource "${resource.key}", refer to it from a Goal condition, or remove the resource.`
            });
        }
    }
}

/* Names have to be distinguishable out loud, because "the one next to the
   kitchen" has to be a sayable reference. */
function checkSpeakability(game, report) {
    const named = [
        ...game.pieces.map((p) => ({ what: 'piece', key: p.key, name: p.name })),
        ...game.places.map((p) => ({ what: 'place', key: p.key, name: p.name }))
    ];
    for (let i = 0; i < named.length; i += 1) {
        for (let j = i + 1; j < named.length; j += 1) {
            const a = named[i];
            const b = named[j];
            const pa = a.name.toLowerCase().slice(0, 3);
            const pb = b.name.toLowerCase().slice(0, 3);
            if (pa === pb) {
                report.warn({
                    code: 'validate.speakability',
                    locus: `${a.what}s.${a.key}.name`,
                    message: `"${a.name}" and "${b.name}" start alike and are easy to confuse out loud.`,
                    modelMessage: `Rename one of "${a.name}" or "${b.name}" so they do not share an opening sound.`
                });
            }
        }
    }
}

/* The aggregate visible-word ceiling is reported rather than enforced: the
   per-text-kind budgets are already blocking, and a games-wide ceiling needs
   calibration against real lessons before it can honestly reject anything. */
function checkVisibleWords(game, report) {
    const reading = [
        ...game.places.map((p) => p.descriptor ?? ''),
        ...game.voices.map((v) => v.claim),
        ...game.goals.map((g) => g.label),
        ...game.rules.filter((r) => r.status === 'active').map((r) => r.inscription)
    ];
    const total = reading.reduce((sum, t) => sum + countWords(t), 0);
    if (total > BUDGETS.visibleWordsPerPhase.max) {
        report.warn({
            code: 'budget.visibleWords',
            locus: 'meta',
            message: `About ${total} words are readable at once during planning; the working ceiling is ${BUDGETS.visibleWordsPerPhase.max}.`,
            modelMessage: `Shorten Place descriptors, Voice claims, Goal labels or Rule inscriptions so they total ${BUDGETS.visibleWordsPerPhase.max} words or fewer.`
        });
    }
}

/* A world nobody can commit to is not a game. This is the first check that
   needs the model, and it uses the same reducer and Rules the runtime does. */
function checkCommitExists(game, revisionLike, report) {
    /* The budget has to cover the worst legal world — every budget at maximum,
       eight Pieces across five Places — or a hostile but valid Definition would
       be rejected for being large rather than for being wrong. */
    const { arrangements, complete } = enumerateArrangements(game, revisionLike, {
        limit: 1,
        nodeBudget: 400000
    });
    if (arrangements.length === 0) {
        report({
            code: 'validate.noValidCommit',
            locus: 'rules',
            /* Finding nothing only means "there is nothing" if the whole space
               was walked; otherwise it means the budget ran out first. */
            message: complete
                ? 'There is no arrangement of the Pieces that satisfies every Rule.'
                : 'No plan that satisfies every Rule was found within the search budget.',
            modelMessage: 'Relax the Rules, raise a capacity or a resource limit, or reduce the number of Pieces, so at least one legal plan exists.'
        });
        return null;
    }
    return arrangements[0];
}

/* Every variant the beat could select for a given plan, including the ones a
   Keep pin would select. A guard may read the pin, so checking only the unpinned
   selection would leave pin-guarded variants entirely unverified. */
function selectableVariants(game, revisionLike, beat, placements) {
    const found = new Map();
    const record = (pinned) => {
        const variant = variantForCommit(game, revisionLike, beat, placements, pinned);
        if (!found.has(variant.key)) found.set(variant.key, { variant, pinned });
    };

    record(null);
    if (beat.variants.some((v) => v.guard && predicateTouchesPin(v.guard))) {
        for (const [key, loc] of Object.entries(placements)) {
            if (loc.kind === 'place') record(key);
        }
    }
    return [...found.values()];
}

/* A world mark that lies breaks trust, so this blocks.

   The two directions of this question need different evidence. Finding a legal
   revision that still reaches the Goal is a witness: it is a concrete, verified
   counterexample and it blocks regardless of how much of the space was searched.
   Finding none proves the mark honest only if the search saw everything, so an
   incomplete search that found nothing is reported as unverified rather than
   passing silently. */
function checkImpossibleWhenHonesty(game, revisionLike, report) {
    const goals = game.goals.filter((g) => g.impossibleWhen);
    if (goals.length === 0) return;

    const { arrangements, exhaustive } = commitEvidence(game, revisionLike, {
        sampleTarget: HONESTY_COMMIT_SAMPLE
    });

    let complete = exhaustive;
    let searches = 0;
    const dishonest = new Map();
    /* Goals whose mark was actually exercised, so "we looked and found nothing"
       can be told apart from "the condition never came up". */
    const examined = new Set();

    /* The revisions available after a beat depend only on which variant fired
       and which Pieces the world froze in place, never on the Keep pin, because
       only Rules decide which revisions are legal. Many different commits leave
       the same Pieces frozen, so the same search would otherwise be repeated
       hundreds of times. */
    const revisionCache = new Map();
    const revisionsFor = (placements, firedBeats, variantKey) => {
        const { frozen } = frozenAfterBeat(game, revisionLike, placements, firedBeats);
        const key = `${variantKey}|${Object.keys(frozen).sort().map(
            (k) => `${k}:${frozen[k].kind === 'place' ? frozen[k].place : frozen[k].kind}`
        ).join(',')}`;

        if (revisionCache.has(key)) return revisionCache.get(key);
        if (searches >= HONESTY_REVISION_SEARCH_BUDGET) return null;
        searches += 1;

        const result = enumerateRevisions(
            game, revisionLike, placements, firedBeats, { nodeBudget: 40000 }
        );
        revisionCache.set(key, result);
        return result;
    };

    for (const beat of game.beats) {
        for (const placements of arrangements) {
            for (const { variant, pinned } of selectableVariants(game, revisionLike, beat, placements)) {
                const firedBeats = [{ beat: beat.key, variant: variant.key }];
                const ctx = buildContext(game, syntheticSession(
                    revisionLike, placements, { firedBeats, phase: 'react', pinned }
                ));

                for (const goal of goals) {
                    if (dishonest.has(goal.key)) continue;
                    if (!ctx.world.activeGoals.has(goal.key)) continue;
                    if (!evaluate(ctx, goal.impossibleWhen)) continue;

                    examined.add(goal.key);

                    const search = revisionsFor(placements, firedBeats, variant.key);
                    if (search === null) {
                        complete = false;
                        continue;
                    }
                    const { arrangements: revisions, complete: revisionsComplete } = search;
                    if (!revisionsComplete) complete = false;

                    for (const revision of revisions) {
                        const after = buildContext(game, syntheticSession(
                            revisionLike, revision, { firedBeats, phase: 'resolve', pinned }
                        ));
                        if (evaluate(after, goal.condition)) {
                            dishonest.set(goal.key, { goal, beat, variant });
                            break;
                        }
                    }
                }
            }
        }
    }

    /* A witness is a witness. It blocks. */
    for (const { goal, beat, variant } of dishonest.values()) {
        report({
            code: 'validate.dishonestImpossibleWhen',
            locus: `goals.${goal.key}.impossibleWhen`,
            message: `"${goal.label}" is marked impossible after ${beat.key}/${variant.key}, but a legal revision still reaches it.`,
            modelMessage: `Either tighten goals.${goal.key}.impossibleWhen so it only holds when the Goal is genuinely unreachable, or remove it.`
        });
    }

    if (!complete) {
        for (const goal of goals) {
            if (dishonest.has(goal.key)) continue;
            report.warn({
                code: 'validate.impossibleWhenUnverified',
                locus: `goals.${goal.key}.impossibleWhen`,
                message: `"${goal.label}" could not be fully verified as honest: the plan space was not searched exhaustively.`,
                modelMessage: `Reduce the number of Pieces or Places, or tighten the Rules, so the plan space can be checked exhaustively.`
            });
        }
    }

    /* A mark whose condition never held anywhere is not dishonest, but it is
       inert: it will never appear on the Horizon. */
    if (complete) {
        for (const goal of goals) {
            if (examined.has(goal.key)) continue;
            report.warn({
                code: 'validate.impossibleWhenNeverHolds',
                locus: `goals.${goal.key}.impossibleWhen`,
                message: `"${goal.label}" is never marked out of reach by any legal plan, so the condition never shows.`,
                modelMessage: `Loosen goals.${goal.key}.impossibleWhen so it can actually hold, or remove it.`
            });
        }
    }
}

export function validate(game, revisionLike, report) {
    checkPresentation(game, report);
    checkTopologyVocabulary(game, report);
    checkBeats(game, report);
    checkDormantBirths(game, report);
    checkInitialState(game, report);
    checkDeadResources(game, report);
    checkSpeakability(game, report);
    checkVisibleWords(game, report);

    /* The enumeration-backed checks only run once the structure is sound;
       searching a world with broken references proves nothing. */
    if (report.hasErrors()) return;

    const sample = checkCommitExists(game, revisionLike, report);
    if (sample) checkImpossibleWhenHonesty(game, revisionLike, report);
}
