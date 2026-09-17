/* B2 — versions and provenance.

   Narrowing a Voice's anchor to a Place narrowed what a Definition may say, so
   it is a new Definition schema version. This build reads schema 1 only, schema
   0 content fails closed wherever it turns up, and every frozen reference
   records the versions that actually produced it. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
    compile, verifyRevision, contentHash,
    COMPILER_VERSION, ENGINE_RUNTIME_VERSION, ENGINE_IDENTITY, SUPPORTED_DEFINITION_SCHEMA_VERSIONS
} from '../engines/shared-plan/compiler/index.js';
import { ENGINE_IDENTITY as DECLARED_IDENTITY } from '../engines/shared-plan/identity.js';
import { DEFINITION_SCHEMA_VERSION, definitionJsonSchema } from '../engines/shared-plan/definition/index.js';
import { allDrafts, draftNames, referenceNames, revisionFor } from './helpers.js';

/* The same recomputation compile.test.js uses, so an altered version still
   reaches verification as an internally consistent revision. */
function rehash(revision) {
    const { placeIndex, pieceIndex, resourceIndex, ruleIndex, goalIndex, voiceIndex, beatIndex, ...rest } =
        revision.compiledGame;
    return contentHash({
        compiledGame: { ...rest, beats: rest.beats.map(({ variantIndex, ...b }) => b) },
        engineRuntimeVersion: revision.engineRuntimeVersion,
        definitionSchemaVersion: revision.definitionSchemaVersion,
        compilerVersion: revision.compilerVersion,
        generationContractVersion: revision.generationContractVersion
    });
}

test('narrowing the Voice anchor is Definition schema 1, the only schema this build reads', () => {
    assert.equal(DEFINITION_SCHEMA_VERSION, '1');
    assert.deepEqual([...SUPPORTED_DEFINITION_SCHEMA_VERSIONS], ['1']);
    assert.deepEqual([...ENGINE_IDENTITY.supportedDefinitionSchemaVersions], ['1']);

    const schema = definitionJsonSchema();
    assert.equal(schema.properties.contract.properties.schemaVersion.const, '1');
    assert.match(schema.title, /v1$/u);
    for (const name of draftNames) {
        assert.equal(allDrafts[name].contract.schemaVersion, '1', `${name} still declares an older schema`);
    }
});

test('schema 0 content fails closed, at compile and at verification', () => {
    const draft = structuredClone(allDrafts['r-a']);
    draft.contract.schemaVersion = '0';
    const { ok, diagnostics } = compile(draft);
    assert.equal(ok, false, 'a schema 0 Draft must not compile');
    assert.deepEqual(
        diagnostics.filter((d) => d.severity === 'error').map((d) => [d.code, d.locus]),
        [['shape.const', 'contract.schemaVersion']]
    );

    const revision = structuredClone(revisionFor('r-a'));
    revision.definitionSchemaVersion = '0';
    revision.contentHash = rehash(revision);
    const check = verifyRevision(revision);
    assert.equal(check.ok, false, 'a schema 0 revision must not mount');
    assert.match(check.problems.join(' '), /Definition schema 0 is not supported/u);
});

test('every frozen reference records the versions that produced it', () => {
    for (const name of referenceNames) {
        const file = new URL(`../definitions/revisions/${name}.json`, import.meta.url);
        const frozen = JSON.parse(readFileSync(file, 'utf8'));
        assert.equal(frozen.definitionSchemaVersion, DEFINITION_SCHEMA_VERSION, `${name}: schema`);
        assert.equal(frozen.compilerVersion, COMPILER_VERSION, `${name}: compiler`);
        assert.equal(frozen.engineRuntimeVersion, ENGINE_RUNTIME_VERSION, `${name}: runtime`);
        assert.equal(frozen.provenance.frozenBySessionSchemaVersion, ENGINE_IDENTITY.sessionSchemaVersion, `${name}: session schema`);
        assert.ok(verifyRevision(frozen).ok, `${name}: the frozen revision does not verify`);
    }
});

test('the runtime declares its identity without loading the compiler', () => {
    assert.equal(DECLARED_IDENTITY, ENGINE_IDENTITY, 'there is one identity, which the compiler re-exports');
    const source = readFileSync(new URL('../engines/shared-plan/identity.js', import.meta.url), 'utf8');
    const imports = [...source.matchAll(/from\s+['"]([^'"]+)['"]/gu)].map((m) => m[1]);
    assert.ok(imports.every((spec) => !spec.includes('compiler')), `identity.js imports ${imports.join(', ')}`);
});
