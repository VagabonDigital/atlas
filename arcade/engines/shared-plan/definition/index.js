/* Engine One — the Definition module.

   Owns the shape of the contract and every budget number. It contains no
   validation that needs a model and no presentation defaults. */

export { BUDGETS, TEXT_KINDS, textKind, countWords, describeBudgets } from './budgets.js';
export * as VOCAB from './vocabularies.js';
export {
    ENGINE_ID,
    DEFINITION_SCHEMA_VERSION,
    DEFINITION_SCHEMA,
    PREDICATE,
    EFFECT,
    RULE,
    TARGET,
    LOCUS,
    SUBJECT,
    definitionJsonSchema
} from './schema.js';
export { S, checkShape, toJsonSchema, collectRefs, collectStrings } from './schema-dsl.js';
