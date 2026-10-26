// Millionaire-only projection: the research archive owns editorial decisions;
// this emits the browser bank without shipping rejected records or repair notes.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const archiveURL = new URL('./wwtbam.json', import.meta.url);
export const bankURL = new URL('../questions.mjs', import.meta.url);
export function renderBank(archive) {
  const rows = archive.filter(q => ['approved', 'repaired_and_approved'].includes(q.review_status)).map(q => {
    if (!Number.isInteger(q.atlas_rung) || q.atlas_rung < 1 || q.atlas_rung > 10 ||
        !q.review_explanation || q.answers.length !== 4 || new Set(q.answers).size !== 4 ||
        !q.answers.includes(q.correct_answer)) throw new Error(`Incomplete accepted entry ${q.index}`);
    return {
      id: `wwtbam-${q.previous_index}`, rung: q.atlas_rung, family: 'general-knowledge',
      prompt: q.question, options: q.answers, answer: q.answers.indexOf(q.correct_answer),
      explanation: q.review_explanation,
      difficulty: { rung: q.atlas_rung, band: q.atlas_rung <= 3 ? 'opening' : q.atlas_rung <= 6 ? 'middle' : q.atlas_rung <= 9 ? 'pressure' : 'final', calibration: 'editorial' },
      sources: q.review_sources,
      evidence: q.review_basis || 'Prior editorial review; supporting references listed in sources.',
      reviewedAt: q.reviewed_at, review: q.review_status,
      provenance: { index: q.index, previousIndex: q.previous_index, source: q.source, date: q.date, prize: q.prize, sourceDifficulty: q.difficulty }
    };
  });
  return '// Generated from dev/wwtbam.json by dev/build-questions.mjs. Do not edit directly.\n' +
    '// Source keys plus editorial review; sources lists only independently consulted references.\n' +
    'export const QUESTIONS = Object.freeze([\n' + rows.map(q => `  Object.freeze(${JSON.stringify(q)})`).join(',\n') + '\n]);\n';
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const output = renderBank(JSON.parse(readFileSync(archiveURL, 'utf8')));
  if (process.argv.includes('--check')) {
    if (readFileSync(bankURL, 'utf8').replaceAll('\r\n', '\n') !== output) throw new Error('Run node arcade/millionaire/dev/build-questions.mjs');
    console.log('Millionaire question projection is current.');
  } else writeFileSync(bankURL, output);
}
