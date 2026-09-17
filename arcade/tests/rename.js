/* Machine-rewrites a Draft with scrambled keys and names.

   Nothing about the world's structure changes, so anything the engine reports
   about it — an analysis, a solved layout, a MarkSet — must be identical up to
   the renaming. Kept apart from the tests that use it, so the B1 generality
   suite and the B2 Stage suite can both scramble without depending on each
   other. */

const REF_FIELDS = new Set([
    'key', 'piece', 'place', 'a', 'b', 'resource', 'rule', 'goal', 'voice', 'beat', 'variant', 'tag'
]);
const LIST_FIELDS = new Set(['places', 'tags', 'languageFocus']);
const NAME_FIELDS = new Set(['name']);

export function collectKeys(draft) {
    const keys = new Set();
    for (const section of ['places', 'pieces', 'resources', 'rules', 'goals', 'voices', 'beats']) {
        for (const item of draft[section] ?? []) {
            keys.add(item.key);
            for (const variant of item.variants ?? []) keys.add(variant.key);
            for (const tag of item.tags ?? []) keys.add(tag);
        }
    }
    for (const rule of draft.rules ?? []) {
        if (rule.subject?.tag) keys.add(rule.subject.tag);
        if (rule.needs?.tag) keys.add(rule.needs.tag);
    }
    return keys;
}

export function scramble(draft) {
    const keys = [...collectKeys(draft)].sort();
    const keyMap = new Map(keys.map((key, i) => [key, `k${i}`]));
    let nameCounter = 0;
    const nameMap = new Map();

    const walk = (value, field) => {
        if (Array.isArray(value)) {
            return value.map((entry) => (
                LIST_FIELDS.has(field) && typeof entry === 'string'
                    ? (keyMap.get(entry) ?? entry)
                    : walk(entry, field)
            ));
        }
        if (value && typeof value === 'object') {
            const out = {};
            for (const [k, v] of Object.entries(value)) out[k] = walk(v, k);
            return out;
        }
        if (typeof value === 'string') {
            if (REF_FIELDS.has(field)) return keyMap.get(value) ?? value;
            if (NAME_FIELDS.has(field)) {
                if (!nameMap.has(value)) nameMap.set(value, `Name ${(nameCounter += 1)}`);
                return nameMap.get(value);
            }
        }
        return value;
    };

    return { scrambled: walk(draft, ''), keyMap };
}

/* Mark ids are built from contract keys, so renaming a world renames its marks
   in exactly the same way. */
export function mapMarkId(id, keyMap) {
    return id.split(':').map((part) => keyMap.get(part) ?? part).join(':');
}
