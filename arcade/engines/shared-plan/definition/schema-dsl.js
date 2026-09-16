/* A very small schema DSL.

   It exists so the Definition schema is single-sourced: the same node tree
   drives shape checking in the compiler and the JSON Schema exported for model
   structured output. Adding a field in one place cannot leave the other stale.

   This is not a general validation library. It supports exactly the shapes the
   Engine One contract uses. */

import { TEXT_KINDS, countWords } from './budgets.js';

export const S = {
    string(textKindName, opts = {}) {
        if (!TEXT_KINDS[textKindName]) throw new Error(`Unknown text kind: ${textKindName}`);
        return { node: 'string', textKind: textKindName, ...opts };
    },
    /* Author-supplied identifiers. Normalised to slugs before resolution. */
    key(opts = {}) {
        return { node: 'key', ...opts };
    },
    /* A reference to another section's key. Shape checking only proves it is a
       key-shaped string; the resolver proves it points at something real and of
       the right kind. */
    ref(refKind, opts = {}) {
        return { node: 'ref', refKind, ...opts };
    },
    enum(values, opts = {}) {
        return { node: 'enum', values: [...values], ...opts };
    },
    const(value, opts = {}) {
        return { node: 'const', value, ...opts };
    },
    integer(min, max, opts = {}) {
        return { node: 'integer', min, max, ...opts };
    },
    boolean(opts = {}) {
        return { node: 'boolean', ...opts };
    },
    array(of, opts = {}) {
        return { node: 'array', of, ...opts };
    },
    object(fields, opts = {}) {
        return { node: 'object', fields, ...opts };
    },
    /* A closed set of alternatives discriminated by a literal `kind` field. */
    union(variants, opts = {}) {
        return { node: 'union', variants, ...opts };
    },
    /* Object with fixed keys drawn from a list, each holding the same node. */
    record(keys, of, opts = {}) {
        return { node: 'record', keys: [...keys], of, ...opts };
    },
    /* Defers construction so recursive shapes (predicate combinators) can be
       expressed without a circular reference at module load. */
    lazy(thunk, opts = {}) {
        let cached = null;
        return { node: 'lazy', resolve: () => (cached ??= thunk()), ...opts };
    }
};

function typeName(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
}

/* Shape checking. Reports into a sink rather than throwing, so one pass
   collects every problem in a Draft instead of stopping at the first. */
export function checkShape(node, value, path, report) {
    /* Presence is decided on the outer node, before a lazy node resolves to its
       inner shape, so `optional` survives on recursive fields. */
    if (value === undefined || value === null) {
        if (!node.optional) {
            report({ code: 'shape.missing', locus: path, message: `Required value is missing at ${path}.` });
        }
        return;
    }
    if (node.node === 'lazy') return checkShape(node.resolve(), value, path, report);

    switch (node.node) {
        case 'string': {
            if (typeof value !== 'string') {
                report({ code: 'shape.type', locus: path, message: `${path} must be text, received ${typeName(value)}.` });
                return;
            }
            const spec = TEXT_KINDS[node.textKind];
            if (value.trim() === '') {
                report({ code: 'shape.empty', locus: path, message: `${path} must not be empty.` });
                return;
            }
            const words = countWords(value);
            if (words > spec.words) {
                report({
                    code: 'budget.words',
                    locus: path,
                    message: `${path} uses ${words} words; the ${node.textKind} budget is ${spec.words}.`
                });
            }
            if (value.length > spec.chars) {
                report({
                    code: 'budget.chars',
                    locus: path,
                    message: `${path} is ${value.length} characters; the ${node.textKind} budget is ${spec.chars}.`
                });
            }
            return;
        }
        case 'key':
        case 'ref': {
            if (typeof value !== 'string' || !/^[a-z0-9][a-z0-9-]*$/u.test(value)) {
                report({
                    code: 'shape.key',
                    locus: path,
                    message: `${path} must be a lower-case key, received ${JSON.stringify(value)}.`
                });
            }
            return;
        }
        case 'enum': {
            if (!node.values.includes(value)) {
                report({
                    code: 'shape.enum',
                    locus: path,
                    message: `${path} must be one of ${node.values.join(', ')}; received ${JSON.stringify(value)}.`
                });
            }
            return;
        }
        case 'const': {
            if (value !== node.value) {
                report({
                    code: 'shape.const',
                    locus: path,
                    message: `${path} must be ${JSON.stringify(node.value)}; received ${JSON.stringify(value)}.`
                });
            }
            return;
        }
        case 'integer': {
            if (!Number.isInteger(value)) {
                report({ code: 'shape.type', locus: path, message: `${path} must be a whole number.` });
                return;
            }
            if (typeof node.min === 'number' && value < node.min) {
                report({ code: 'budget.range', locus: path, message: `${path} is ${value}; the minimum is ${node.min}.` });
            }
            if (typeof node.max === 'number' && value > node.max) {
                report({ code: 'budget.range', locus: path, message: `${path} is ${value}; the maximum is ${node.max}.` });
            }
            return;
        }
        case 'boolean': {
            if (typeof value !== 'boolean') {
                report({ code: 'shape.type', locus: path, message: `${path} must be true or false.` });
            }
            return;
        }
        case 'array': {
            if (!Array.isArray(value)) {
                report({ code: 'shape.type', locus: path, message: `${path} must be a list.` });
                return;
            }
            if (typeof node.min === 'number' && value.length < node.min) {
                report({ code: 'budget.count', locus: path, message: `${path} has ${value.length} entries; the minimum is ${node.min}.` });
            }
            if (typeof node.max === 'number' && value.length > node.max) {
                report({ code: 'budget.count', locus: path, message: `${path} has ${value.length} entries; the maximum is ${node.max}.` });
            }
            value.forEach((entry, i) => checkShape(node.of, entry, `${path}[${i}]`, report));
            return;
        }
        case 'object': {
            if (typeName(value) !== 'object') {
                report({ code: 'shape.type', locus: path, message: `${path} must be an object.` });
                return;
            }
            for (const [field, child] of Object.entries(node.fields)) {
                checkShape(child, value[field], path ? `${path}.${field}` : field, report);
            }
            for (const field of Object.keys(value)) {
                if (!Object.hasOwn(node.fields, field)) {
                    report({
                        code: 'shape.unknownField',
                        locus: path ? `${path}.${field}` : field,
                        message: `${field} is not part of the contract.`
                    });
                }
            }
            return;
        }
        case 'record': {
            if (typeName(value) !== 'object') {
                report({ code: 'shape.type', locus: path, message: `${path} must be an object.` });
                return;
            }
            for (const field of Object.keys(value)) {
                if (!node.keys.includes(field)) {
                    report({
                        code: 'shape.unknownField',
                        locus: `${path}.${field}`,
                        message: `${field} is not one of ${node.keys.join(', ')}.`
                    });
                    continue;
                }
                checkShape(node.of, value[field], `${path}.${field}`, report);
            }
            return;
        }
        case 'union': {
            if (typeName(value) !== 'object') {
                report({ code: 'shape.type', locus: path, message: `${path} must be an object.` });
                return;
            }
            const variant = node.variants[value.kind];
            if (!variant) {
                report({
                    code: 'shape.union',
                    locus: `${path}.kind`,
                    message: `${path}.kind must be one of ${Object.keys(node.variants).join(', ')}; received ${JSON.stringify(value.kind)}.`
                });
                return;
            }
            checkShape(variant, value, path, report);
            return;
        }
        default:
            throw new Error(`Unknown schema node: ${node.node}`);
    }
}

/* JSON Schema draft 2020-12, for provider structured-output constraints.

   Recursive shapes (predicate combinators) must become a `$ref` into `$defs`,
   or expanding them inline would never terminate. A lazy node carrying a
   `defName` is the marker for "this shape refers to itself". */
export function toJsonSchema(node, defs = null) {
    const root = defs === null;
    const registry = defs ?? Object.create(null);
    const schema = toJsonSchemaNode(node, registry);
    if (!root) return schema;
    return Object.keys(registry).length > 0 ? { ...schema, $defs: registry } : schema;
}

function toJsonSchemaNode(node, defs) {
    if (node.node === 'lazy') {
        if (!node.defName) return toJsonSchemaNode(node.resolve(), defs);
        if (!Object.hasOwn(defs, node.defName)) {
            /* Reserve the name before expanding, so the expansion can refer back
               to it without recursing forever. */
            defs[node.defName] = true;
            defs[node.defName] = toJsonSchemaNode(node.resolve(), defs);
        }
        return { $ref: `#/$defs/${node.defName}` };
    }

    const toJsonSchema = (child) => toJsonSchemaNode(child, defs);

    switch (node.node) {
        case 'string': {
            const spec = TEXT_KINDS[node.textKind];
            return { type: 'string', minLength: 1, maxLength: spec.chars, description: `${node.textKind}: at most ${spec.words} words` };
        }
        case 'key':
        case 'ref':
            return { type: 'string', pattern: '^[a-z0-9][a-z0-9-]*$' };
        case 'enum':
            return { enum: [...node.values] };
        case 'const':
            return { const: node.value };
        case 'integer': {
            const out = { type: 'integer' };
            if (typeof node.min === 'number') out.minimum = node.min;
            if (typeof node.max === 'number') out.maximum = node.max;
            return out;
        }
        case 'boolean':
            return { type: 'boolean' };
        case 'array': {
            const out = { type: 'array', items: toJsonSchema(node.of) };
            if (typeof node.min === 'number') out.minItems = node.min;
            if (typeof node.max === 'number') out.maxItems = node.max;
            return out;
        }
        case 'object': {
            const properties = {};
            const required = [];
            for (const [field, child] of Object.entries(node.fields)) {
                properties[field] = toJsonSchema(child);
                if (!child.optional) required.push(field);
            }
            return { type: 'object', properties, required, additionalProperties: false };
        }
        case 'record': {
            const properties = {};
            for (const key of node.keys) properties[key] = toJsonSchema(node.of);
            return { type: 'object', properties, required: [], additionalProperties: false };
        }
        case 'union':
            return { oneOf: Object.values(node.variants).map(toJsonSchema) };
        default:
            throw new Error(`Unknown schema node: ${node.node}`);
    }
}

/* Walks a value alongside its schema and yields every reference with the kind
   it must resolve to. The resolver uses this instead of hand-written traversal,
   so a new referencing field cannot be forgotten. */
export function collectRefs(node, value, path, out = []) {
    if (value === undefined || value === null) return out;
    if (node.node === 'lazy') return collectRefs(node.resolve(), value, path, out);

    switch (node.node) {
        case 'ref':
            if (typeof value === 'string') out.push({ refKind: node.refKind, key: value, locus: path });
            return out;
        case 'array':
            if (Array.isArray(value)) value.forEach((entry, i) => collectRefs(node.of, entry, `${path}[${i}]`, out));
            return out;
        case 'object':
            if (typeName(value) === 'object') {
                for (const [field, child] of Object.entries(node.fields)) {
                    collectRefs(child, value[field], path ? `${path}.${field}` : field, out);
                }
            }
            return out;
        case 'record':
            if (typeName(value) === 'object') {
                for (const [field, entry] of Object.entries(value)) {
                    if (node.keys.includes(field)) collectRefs(node.of, entry, `${path}.${field}`, out);
                }
            }
            return out;
        case 'union': {
            if (typeName(value) !== 'object') return out;
            const variant = node.variants[value.kind];
            if (variant) collectRefs(variant, value, path, out);
            return out;
        }
        default:
            return out;
    }
}

/* Walks a value alongside its schema and yields every string with its text
   kind, for the visible-word budget and the layout legibility-fit check. */
export function collectStrings(node, value, path, out = []) {
    if (value === undefined || value === null) return out;
    if (node.node === 'lazy') return collectStrings(node.resolve(), value, path, out);

    switch (node.node) {
        case 'string':
            if (typeof value === 'string') out.push({ textKind: node.textKind, value, locus: path });
            return out;
        case 'array':
            if (Array.isArray(value)) value.forEach((entry, i) => collectStrings(node.of, entry, `${path}[${i}]`, out));
            return out;
        case 'object':
            if (typeName(value) === 'object') {
                for (const [field, child] of Object.entries(node.fields)) {
                    collectStrings(child, value[field], path ? `${path}.${field}` : field, out);
                }
            }
            return out;
        case 'record':
            if (typeName(value) === 'object') {
                for (const [field, entry] of Object.entries(value)) {
                    if (node.keys.includes(field)) collectStrings(node.of, entry, `${path}.${field}`, out);
                }
            }
            return out;
        case 'union': {
            if (typeName(value) !== 'object') return out;
            const variant = node.variants[value.kind];
            if (variant) collectStrings(variant, value, path, out);
            return out;
        }
        default:
            return out;
    }
}
