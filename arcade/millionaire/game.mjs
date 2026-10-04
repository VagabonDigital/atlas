// Millionaire rules. The UI receives only publicView(); answer keys stay here
// until the Host explicitly reveals. No hidden answer/explanation DOM exists.
export const PRIZES = [2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000];
export const band = rung => rung <= 3 ? 'opening' : rung <= 6 ? 'middle' : rung <= 9 ? 'pressure' : 'final';
export const resolved = phase => ['correct', 'incorrect', 'safety', 'win', 'walk-reveal', 'summary'].includes(phase);
const copy = value => structuredClone(value);
const RESTORABLE_PHASES = new Set(['question', 'selected', 'locked', 'correct', 'safety', 'incorrect', 'win', 'walk-confirm', 'hypothetical', 'walk-reveal', 'adviser']);

export class Millionaire {
  constructor(bank, { random = Math.random, seen = [], sessionSeen = [], onEvent = () => {} } = {}) {
    this.bank = bank;
    this.random = random;
    this.seen = new Set(seen);
    this.sessionSeen = new Set(sessionSeen);
    this.onEvent = onEvent;
    this.state = null;
  }
  emit(type, extra = {}) {
    this.onEvent({ type, runId: this.state?.id, questionId: this.state?.question?.id,
      rung: this.state?.rung, timestamp: Date.now(), ...extra });
  }
  snapshot() {
    if (!this.state || !RESTORABLE_PHASES.has(this.state.phase)) return null;
    return copy({ version: 1, state: this.state, sessionSeen: [...this.sessionSeen] });
  }
  restore(snapshot) {
    if (!snapshot || snapshot.version !== 1 || !snapshot.state || typeof snapshot.state !== 'object') return false;
    const candidate = copy(snapshot.state);
    const rung = Number(candidate.rung);
    const questionId = candidate.question?.id;
    if (!candidate.id || !Number.isInteger(rung) || rung < 1 || rung > 10 || !RESTORABLE_PHASES.has(candidate.phase)) return false;
    if (!questionId || !this.bank.some(question => question.id === questionId)) return false;
    if (!Array.isArray(candidate.question?.options) || candidate.question.options.length !== 4) return false;
    if (!Number.isInteger(candidate.question.answer) || candidate.question.answer < 0 || candidate.question.answer > 3) return false;
    this.state = candidate;
    this.sessionSeen = new Set(Array.isArray(snapshot.sessionSeen) ? snapshot.sessionSeen : []);
    this.sessionSeen.add(questionId);
    this.sessionSeen.forEach(id => this.seen.add(id));
    return true;
  }
  available(rung, replacing = false) {
    let pool = this.bank.filter(q => !this.sessionSeen.has(q.id) && band(q.rung) === band(rung));
    // Normal progression prefers its authored rung. Replacements stay in-band.
    const exact = pool.filter(q => q.rung === rung);
    const unseen = pool.filter(q => !this.seen.has(q.id));
    const exactUnseen = exact.filter(q => !this.seen.has(q.id));
    if (!replacing && exactUnseen.length) return exactUnseen;
    if (unseen.length) return unseen;
    return !replacing && exact.length ? exact : pool;
  }
  canStart() {
    return ['opening', 'middle', 'pressure', 'final'].every((b, i) =>
      this.bank.filter(q => band(q.rung) === b && !this.sessionSeen.has(q.id)).length >= [3, 3, 3, 1][i]);
  }
  start() {
    if (!this.canStart()) return false;
    this.state = { id: globalThis.crypto.randomUUID(), rung: 1, earned: 0, secured: 0,
      phase: 'question', selected: null, hidden: [], lifelines: { narrow: false, host: false, new: false },
      adviser: null, outcome: null, prize: null, question: null, snapshot: null };
    this.emit('start');
    this.loadQuestion();
    return true;
  }
  loadQuestion(replacing = false) {
    const s = this.state;
    const pool = this.available(s.rung, replacing);
    if (!pool.length) return false;
    const q = pool[Math.floor(this.random() * pool.length)];
    const order = [0, 1, 2, 3];
    for (let i = 3; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    s.question = { ...q, options: order.map(i => q.options[i]), answer: order.indexOf(q.answer) };
    s.selected = null;
    s.hidden = [];
    s.adviser = null;
    s.phase = 'question';
    s.outcome = null;
    s.prize = null;
    s.snapshot = { earned: s.earned, secured: s.secured, lifelines: copy(s.lifelines) };
    this.sessionSeen.add(q.id);
    this.seen.add(q.id);
    this.emit('exposure', { authoredRung: q.rung, family: q.family });
    return true;
  }
  isOpen() { return ['question', 'selected'].includes(this.state?.phase); }
  select(index) {
    const s = this.state;
    if ((!this.isOpen() && s?.phase !== 'hypothetical') || !Number.isInteger(index) || index < 0 || index > 3 || s.hidden.includes(index)) return false;
    s.selected = index;
    if (s.phase !== 'hypothetical') s.phase = 'selected';
    return true;
  }
  lock() {
    if (this.state?.phase !== 'selected') return false;
    this.state.phase = 'locked';
    this.emit('lock');
    return true;
  }
  reveal() {
    const s = this.state;
    if (!s || !['locked', 'hypothetical'].includes(s.phase)) return false;
    if (s.phase === 'hypothetical') {
      s.phase = 'walk-reveal';
    } else if (s.selected === s.question.answer) {
      s.earned = PRIZES[s.rung - 1];
      if ([3, 7].includes(s.rung)) s.secured = s.earned;
      s.phase = [3, 7].includes(s.rung) ? 'safety' : s.rung === 10 ? 'win' : 'correct';
      if (s.rung === 10) { s.outcome = 'top prize'; s.prize = s.earned; }
    } else {
      s.phase = 'incorrect'; s.outcome = 'wrong answer'; s.prize = s.secured;
    }
    this.emit('reveal', { correct: s.selected === s.question.answer, hypothetical: s.outcome === 'walked away' });
    return true;
  }
  continue() {
    const s = this.state;
    if (!s || !['correct', 'safety'].includes(s.phase)) return false;
    if (!this.available(s.rung + 1).length) return false;
    s.rung++;
    return this.loadQuestion();
  }
  walk(confirm = false) {
    const s = this.state;
    if (!s || s.rung < 4) return false;
    if (!confirm && this.isOpen()) { s.phase = 'walk-confirm'; return true; }
    if (confirm && s.phase === 'walk-confirm') {
      s.phase = 'hypothetical'; s.prize = s.earned; s.outcome = 'walked away';
      s.selected = null;
      this.emit('walk', { prize: s.prize });
      return true;
    }
    return false;
  }
  cancelWalk() {
    if (this.state?.phase !== 'walk-confirm') return false;
    this.state.phase = this.state.selected === null ? 'question' : 'selected';
    return true;
  }
  lifeline(kind) {
    const s = this.state;
    if (!this.isOpen() || !Object.hasOwn(s.lifelines, kind) || s.lifelines[kind]) return false;
    if (kind === 'new' && !this.available(s.rung, true).length) return false;
    s.lifelines[kind] = true;
    this.emit('lifeline', { kind });
    if (kind === 'new') return this.loadQuestion(true);
    if (kind === 'narrow') {
      const wrong = [0, 1, 2, 3].filter(i => i !== s.question.answer);
      const keep = wrong[Math.floor(this.random() * wrong.length)];
      s.hidden = wrong.filter(i => i !== keep);
      if (s.hidden.includes(s.selected)) { s.selected = null; s.phase = 'question'; }
    }
    if (kind === 'host') { s.phase = 'adviser'; s.adviser = { pick: null, confidence: 'Unsure' }; }
    return true;
  }
  advise(pick, confidence) {
    const s = this.state;
    if (s?.phase !== 'adviser' || ![0, 1, 2, 3].includes(pick) || s.hidden.includes(pick)
      || !['Unsure', 'Fairly sure', 'Very sure'].includes(confidence)) return false;
    s.adviser = { pick, confidence };
    s.phase = s.selected === null ? 'question' : 'selected';
    this.emit('advice', { pick, confidence });
    return true;
  }
  replace(reason, note = '') {
    const s = this.state;
    if (!s || !this.available(s.rung, true).length) return false;
    const after = resolved(s.phase);
    if (after ? reason !== 'factual-error' : !['recognition', 'wording', 'factual-concern'].includes(reason)) return false;
    // Once walking away is confirmed the banked outcome cannot be undone.
    if (s.outcome === 'walked away' || ['hypothetical', 'walk-confirm', 'adviser'].includes(s.phase)) return false;
    if (after && !note.trim()) return false;
    this.emit(after ? 'void-after-reveal' : reason === 'recognition' ? 'recognition' : 'void-before-reveal', { reason, note });
    Object.assign(s, copy(s.snapshot));
    return this.loadQuestion(true);
  }
  summary() {
    const s = this.state;
    if (!s || !['incorrect', 'win', 'walk-reveal'].includes(s.phase)) return false;
    s.phase = 'summary';
    this.emit('result', { prize: s.prize, outcome: s.outcome, highest: s.rung });
    return true;
  }
  publicView() {
    if (!this.state) return null;
    const { question, snapshot, ...publicState } = this.state;
    const { answer, explanation, evidence, sources, ...publicQuestion } = question;
    return copy({ ...publicState, question: publicQuestion,
      ...(resolved(this.state.phase) ? { answer, explanation, sources } : {}) });
  }
}
