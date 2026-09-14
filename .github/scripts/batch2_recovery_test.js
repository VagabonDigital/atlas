const fs = require('fs');
const vm = require('vm');

class MemoryStorage {
  constructor() { this.map = new Map(); }
  get length() { return this.map.size; }
  key(index) { return Array.from(this.map.keys())[index] ?? null; }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(String(key), String(value)); }
  removeItem(key) { this.map.delete(String(key)); }
}

global.window = global;
global.localStorage = new MemoryStorage();
global.AtlasStructuredSubject = {
  validateDocument() { return { valid: true, errors: [] }; }
};

vm.runInThisContext(
  fs.readFileSync('shared/atlas-tutor-subjects.js', 'utf8'),
  { filename: 'atlas-tutor-subjects.js' }
);

(async () => {
  const Subjects = global.AtlasTutorSubjects;
  const document = {
    schemaVersion: 1,
    module: { title: 'Recovery Test', navTitle: 'Recovery Test', bgImage: '', catalogDescription: '' },
    subjectCopy: {},
    discussionSets: [],
    culturalLensCards: []
  };

  const subject = await Subjects.createSubject({
    metadata: { title: 'Recovery Test' },
    document
  });
  if (!subject) throw new Error('Could not create test subject');

  await Subjects.saveBuildCheckpoint(subject.id, {
    workingDraft: { baseRevision: 1, document, activeViewId: 'view-orientation' },
    buildState: { kind: 'full-subject', completedStep: 7, autoSaveOnComplete: true }
  });

  const firstState = await Subjects.getBuildState(subject.id);
  if (firstState?.completedStep !== 7) throw new Error('Checkpoint step missing');

  // A newer normal draft must win over the older checkpoint draft so tutor edits are preserved.
  await new Promise(resolve => setTimeout(resolve, 2));
  const editedDocument = JSON.parse(JSON.stringify(document));
  editedDocument.module.title = 'Tutor Edited Title';
  await Subjects.saveWorkingDraft(subject.id, {
    baseRevision: 1,
    document: editedDocument,
    activeViewId: 'view-discussion'
  });
  const editedDraft = await Subjects.getWorkingDraft(subject.id);
  if (editedDraft?.document?.module?.title !== 'Tutor Edited Title') {
    throw new Error('Newer tutor draft was overwritten by checkpoint');
  }

  // Losing either compatibility mirror must recover from the atomic journal.
  for (const key of Array.from(localStorage.map.keys())) {
    if (key.includes('::buildState::')) localStorage.removeItem(key);
  }
  const recoveredState = await Subjects.getBuildState(subject.id);
  if (recoveredState?.completedStep !== 7) throw new Error('State mirror recovery failed');

  // Re-save a checkpoint with the latest draft, then remove its draft mirror.
  await Subjects.saveBuildCheckpoint(subject.id, {
    workingDraft: editedDraft,
    buildState: recoveredState
  });
  for (const key of Array.from(localStorage.map.keys())) {
    if (key.includes('::workingDraft::')) localStorage.removeItem(key);
  }
  const recoveredDraft = await Subjects.getWorkingDraft(subject.id);
  if (recoveredDraft?.document?.module?.title !== 'Tutor Edited Title') {
    throw new Error('Draft mirror recovery failed');
  }

  await Subjects.clearBuildState(subject.id);
  if (await Subjects.getBuildState(subject.id)) throw new Error('Build checkpoint did not clear');

  console.log('Batch 2 recovery persistence scenarios passed');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
