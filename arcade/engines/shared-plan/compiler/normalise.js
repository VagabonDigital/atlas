/* Engine One — normalisation.

   Runs before shape checking, not after, because it fills the structural
   defaults that shape checking then measures. It is deliberately total and
   type-tolerant: anything it does not recognise passes through untouched so the
   shape check can report it properly rather than crashing here.

   Defaults are structural only. Nothing here decides what a game means: a
   missing `status` becomes `active` because existing from the start is the
   absence of a choice, whereas dormancy is always an authored claim. */

const SMART_APOSTROPHE = '’';

function slug(value) {
    if (typeof value !== 'string') return value;
    return value
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/gu, '-')
        .replace(/[^a-z0-9-]/gu, '')
        .replace(/-+/gu, '-')
        .replace(/^-|-$/gu, '');
}

function text(value) {
    if (typeof value !== 'string') return value;
    return value
        .replace(/\s+/gu, ' ')
        .trim()
        .replace(/(\p{L})'(\p{L})/gu, `$1${SMART_APOSTROPHE}$2`);
}

const list = (value) => (Array.isArray(value) ? value : []);
const obj = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {});

function normalisePredicate(predicate) {
    if (!predicate || typeof predicate !== 'object') return predicate;
    const out = { ...predicate };
    for (const field of ['piece', 'place', 'a', 'b', 'resource', 'beat', 'variant', 'tag']) {
        if (typeof out[field] === 'string') out[field] = slug(out[field]);
    }
    if (Array.isArray(out.terms)) out.terms = out.terms.map(normalisePredicate);
    if (out.term) out.term = normalisePredicate(out.term);
    return out;
}

function normaliseTarget(target) {
    if (!target || typeof target !== 'object') return target;
    const out = { ...target };
    for (const field of ['piece', 'place', 'voice', 'tag']) {
        if (typeof out[field] === 'string') out[field] = slug(out[field]);
    }
    return out;
}

function normaliseEffect(effect) {
    if (!effect || typeof effect !== 'object') return effect;
    const out = { ...effect };
    for (const field of ['piece', 'place', 'resource', 'rule', 'goal', 'voice']) {
        if (typeof out[field] === 'string') out[field] = slug(out[field]);
    }
    return out;
}

export function normalise(draft) {
    const d = obj(draft);

    const places = list(d.places).map((p) => ({
        ...obj(p),
        key: slug(p?.key),
        name: text(p?.name),
        sayHint: text(p?.sayHint),
        descriptor: text(p?.descriptor),
        status: p?.status ?? 'active'
    }));

    const pieces = list(d.pieces).map((p) => ({
        ...obj(p),
        key: slug(p?.key),
        name: text(p?.name),
        sayHint: text(p?.sayHint),
        fact: p?.fact ? { ...obj(p.fact), text: text(p.fact.text), hidden: p.fact.hidden ?? false } : undefined,
        tags: list(p?.tags).map(slug),
        resources: list(p?.resources).map((r) => ({ ...obj(r), resource: slug(r?.resource) })),
        status: p?.status ?? 'active'
    }));

    const resources = list(d.resources).map((r) => ({
        ...obj(r),
        key: slug(r?.key),
        label: text(r?.label),
        unit: text(r?.unit)
    }));

    const rules = list(d.rules).map((r) => {
        const out = {
            ...obj(r),
            key: slug(r?.key),
            inscription: text(r?.inscription),
            status: r?.status ?? 'active'
        };
        for (const field of ['piece', 'a', 'b', 'resource']) {
            if (typeof out[field] === 'string') out[field] = slug(out[field]);
        }
        if (Array.isArray(out.places)) out.places = out.places.map(slug);
        if (out.subject) out.subject = normaliseTarget(out.subject);
        if (out.needs) out.needs = normaliseTarget(out.needs);
        return out;
    });

    const goals = list(d.goals).map((g) => ({
        ...obj(g),
        key: slug(g?.key),
        label: text(g?.label),
        condition: normalisePredicate(g?.condition),
        impossibleWhen: g?.impossibleWhen ? normalisePredicate(g.impossibleWhen) : undefined,
        reachedLine: text(g?.reachedLine),
        missedLine: text(g?.missedLine),
        status: g?.status ?? 'active'
    }));

    const voices = list(d.voices).map((v) => ({
        ...obj(v),
        key: slug(v?.key),
        name: text(v?.name),
        role: text(v?.role),
        claim: text(v?.claim),
        concern: v?.concern ? normalisePredicate(v.concern) : undefined,
        claimVariants: list(v?.claimVariants).map(text),
        tethers: list(v?.tethers).map(normaliseTarget),
        anchor: normaliseTarget(v?.anchor),
        outcomes: list(v?.outcomes).map((o) => ({
            ...obj(o),
            condition: normalisePredicate(o?.condition),
            line: text(o?.line)
        })),
        fallbackOutcome: text(v?.fallbackOutcome)
    }));

    const beats = list(d.beats).map((b) => ({
        ...obj(b),
        key: slug(b?.key),
        omen: b?.omen ? { ...obj(b.omen), text: text(b.omen.text) } : undefined,
        variants: list(b?.variants).map((v) => ({
            ...obj(v),
            key: slug(v?.key),
            guard: v?.guard ? normalisePredicate(v.guard) : undefined,
            effects: list(v?.effects).map(normaliseEffect),
            locus: normaliseTarget(v?.locus),
            headline: text(v?.headline),
            scarLabel: text(v?.scarLabel)
        }))
    }));

    const prompts = obj(d.tutor?.prompts);
    const normalisedPrompts = {};
    for (const [phase, entries] of Object.entries(prompts)) {
        normalisedPrompts[phase] = list(entries).map(text);
    }

    return {
        contract: { ...obj(d.contract) },
        meta: { ...obj(d.meta), title: text(d.meta?.title), premise: text(d.meta?.premise) },
        design: {
            ...obj(d.design),
            intendedDilemma: text(d.design?.intendedDilemma),
            languageFocus: list(d.design?.languageFocus).map(slug)
        },
        presentation: { ...obj(d.presentation) },
        world: {
            ...obj(d.world),
            thresholdLabel: text(d.world?.thresholdLabel),
            marginLabel: text(d.world?.marginLabel),
            clockLabel: text(d.world?.clockLabel)
        },
        places,
        pieces,
        resources,
        rules,
        goals,
        voices,
        beats,
        resolution: {
            hindsight: list(d.resolution?.hindsight).map((h) => ({
                ...obj(h),
                piece: slug(h?.piece),
                condition: normalisePredicate(h?.condition),
                note: text(h?.note)
            }))
        },
        tutor: {
            ...obj(d.tutor),
            brief: text(d.tutor?.brief),
            prompts: normalisedPrompts
        }
    };
}
