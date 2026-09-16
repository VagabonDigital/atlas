#!/usr/bin/env node
/* Freezes every reference Draft into a Game Revision file.

   Everything played is an immutable Game Revision from the first day, including
   hand-authored references, so there is never a second identity system to
   reconcile when generation arrives. */

import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { references } from '../definitions/index.js';
import { compileAndFreeze, formatDiagnostic, verifyRevision } from '../engines/shared-plan/compiler/index.js';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'definitions', 'revisions');

await mkdir(outDir, { recursive: true });

let failures = 0;
for (const [name, draft] of Object.entries(references)) {
    const { ok, revision, diagnostics } = compileAndFreeze(draft);
    if (!ok) {
        failures += 1;
        console.error(`${name}: did not compile`);
        for (const d of diagnostics) console.error(`  ${formatDiagnostic(d)}`);
        continue;
    }

    const check = verifyRevision(revision);
    if (!check.ok) {
        failures += 1;
        console.error(`${name}: revision failed verification: ${check.problems.join('; ')}`);
        continue;
    }

    await writeFile(join(outDir, `${name}.json`), `${JSON.stringify(revision, null, 2)}\n`, 'utf8');
    const warnings = diagnostics.filter((d) => d.severity !== 'error').length;
    console.log(`${name}: ${revision.revisionId}  (${warnings} warning(s))`);
}

if (failures > 0) process.exitCode = 1;
