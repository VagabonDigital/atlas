import { Millionaire, PRIZES, band, resolved } from './game.mjs';
import { QUESTIONS } from './questions.mjs';
import { continuity } from './continuity.mjs';
import { createShowDirector } from './show-director.mjs';

const $ = selector => document.querySelector(selector);
const all = selector => [...document.querySelectorAll(selector)];
const money = n => Number(n).toLocaleString('en-US');
const letters = ['A', 'B', 'C', 'D'];
const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
const lockIcon = '<svg viewBox="0 0 24 28"><path d="M6 11V7a6 6 0 0112 0v4h2v15H4V11zm3 0h6V7a3 3 0 00-6 0zm2 6v5h2v-5z"/></svg>';
const Bridge = window.AtlasBridge;
let game, context, visitSeen = new Set(), visitResults = [], lastQuestion, lastPhase;
let isInspection = false, muted = false, dialogOrigin;
let hostDraftPick = null, hostDraftConfidence = 'Unsure';
const storage = Bridge ? continuity(Bridge) : null;
const showDirector = createShowDirector($('#show'));

function playSound(kind) {
  if (muted) return;
  showDirector.cue(kind);
}

function resetHostDraft() {
  hostDraftPick = null;
  hostDraftConfidence = 'Unsure';
}

function onEvent(event) {
  if (event.type === 'exposure') visitSeen.add(event.questionId);
  if (event.type === 'result') visitResults = [...visitResults.filter(r => r.runId !== event.runId), event];
  if (event.type === 'void-after-reveal') visitResults = visitResults.filter(r => r.runId !== event.runId);
  if (!isInspection) storage.record(context, event);
}

function persistRun() {
  if (isInspection || !game || !context) return;
  const snapshot = game.snapshot();
  if (!snapshot) {
    storage.clearRun(context.id);
    return;
  }
  storage.saveRun(context.id, snapshot, game.publicView());
}

function syncResetControl() {
  const button = $('#reset-session');
  if (!button) return;
  if (isInspection || !storage) { button.hidden = true; return; }
  const active = context || storage.context();
  button.hidden = !active?.id || !storage.hasSessionData(active.id);
}

function modal(title, content, kind = '') {
  dialogOrigin = document.activeElement;
  $('#dialog').className = kind;
  $('#close-dialog').hidden = false;
  $('#dialog-content').innerHTML = `<h2 id="dialog-title">${title}</h2>${content}`;
  if (!$('#dialog').open) $('#dialog').showModal();
}
function closeModal() { $('#dialog').close(); dialogOrigin?.focus(); }
$('#close-dialog').addEventListener('click', closeModal);
$('#dialog').addEventListener('click', e => { if (e.target === $('#dialog')) closeModal(); });

function start() {
  const nextContext = storage.context();
  if (context && nextContext.id !== context.id) { visitSeen = new Set(); visitResults = []; }
  context = nextContext;
  resetHostDraft();
  game = new Millionaire(QUESTIONS, { seen: storage.seen(context.id), sessionSeen: [...visitSeen], onEvent });
  if (!game.start()) {
    modal('A full show needs fresh questions', '<p>There are not enough fresh questions left for another complete run in this session.</p><p>Finish this session to return to the entrance. Previously seen questions remain recorded for future play.</p><button class="primary" id="end-session">Finish session</button>');
    $('#end-session').onclick = () => { closeModal(); finish(); };
    return;
  }
  window.AtlasSessionPanel?.close();
  window.AtlasAnalytics?.arcadeGameStart('millionaire');
  lastQuestion = null;
  playSound('next'); render();
}

function finish({ clearContinuity = true } = {}) {
  showDirector.stop();
  if (clearContinuity && !isInspection && context) storage.clearRun(context.id);
  game = null; visitSeen = new Set(); visitResults = []; lastQuestion = null; lastPhase = null;
  resetHostDraft();
  $('#show').dataset.screen = 'entrance'; $('#show').dataset.phase = ''; $('#show').dataset.pressure = '';
  $('#entrance').hidden = false; $('#board').hidden = true; $('#summary').hidden = true;
  $('#landing-chrome').hidden = false; $('#game-chrome').hidden = true;
  $('#celebration').replaceChildren(); $('#feedback').replaceChildren(); $('#start').focus();
  syncResetControl();
}

function celebrate() {
  $('#celebration').innerHTML = Array.from({ length: 65 }, (_, i) =>
    `<i style="--x:${(i * 37) % 100}%;--d:${(i % 13) * .07}s;--c:${i % 3 === 0 ? '#c8e8ff' : '#f7cb64'}"></i>`).join('');
  setTimeout(() => $('#celebration').replaceChildren(), 5500);
}

function render() {
  const v = game.publicView();
  const reveal = resolved(v.phase);
  const open = game.isOpen();
  const hostMode = v.phase === 'adviser';
  $('#show').dataset.screen = v.phase === 'summary' ? 'summary' : 'game';
  $('#show').dataset.phase = v.phase; $('#show').dataset.pressure = band(v.rung);
  showDirector.sync({ band: band(v.rung), phase: v.phase });
  $('#entrance').hidden = true; $('#landing-chrome').hidden = true; $('#game-chrome').hidden = false;
  $('#board').hidden = v.phase === 'summary'; $('#summary').hidden = v.phase !== 'summary';
  $('#question-number').textContent = v.rung;
  $('#question').textContent = v.question.prompt;
  if (v.question.id !== lastQuestion) {
    $('.question-panel').classList.remove('question-arrive');
    requestAnimationFrame(() => $('.question-panel').classList.add('question-arrive'));
    lastQuestion = v.question.id;
    $('#question').focus({ preventScroll: true });
  }
  all('.answer').forEach((button, i) => {
    const selected = v.selected === i;
    const removed = v.hidden.includes(i);
    const correct = reveal && v.answer === i;
    const wrong = reveal && selected && v.answer !== i;
    const hostPicked = hostMode && hostDraftPick === i;
    const contestantChoice = hostMode && selected;
    button.className = ['answer', selected && !reveal && !hostMode ? 'selected' : '', contestantChoice ? 'contestant-choice' : '', hostPicked ? 'host-pick' : '', correct ? 'correct' : '', wrong ? 'wrong' : '', removed ? 'removed' : ''].filter(Boolean).join(' ');
    button.querySelector('.answer-text').textContent = removed ? '—' : v.question.options[i];
    button.querySelector('.answer-status').innerHTML = correct ? '✓' : wrong ? '×' : hostPicked ? '<span class="host-mark">H</span>' : selected && v.phase === 'locked' ? lockIcon : '';
    button.disabled = removed || !(open || v.phase === 'hypothetical' || hostMode);
    button.setAttribute('aria-pressed', String(hostMode ? hostPicked : selected));
    button.setAttribute('aria-label', `${letters[i]}: ${removed ? 'Removed by Narrow It Down' : v.question.options[i]}${correct ? ', correct answer' : wrong ? ', incorrect answer' : selected && v.phase === 'locked' ? ', locked' : ''}${contestantChoice ? ', contestant choice' : ''}${hostPicked ? ', Host choice' : ''}`);
  });
  all('[data-lifeline]').forEach(button => {
    const kind = button.dataset.lifeline;
    button.disabled = !open || v.lifelines[kind];
    button.classList.toggle('used', v.lifelines[kind]);
    button.title = v.lifelines[kind] ? 'Used this run' : !open ? 'Available before lock-in' : 'Use only at the Contestant’s request';
    button.setAttribute('aria-label', `${{ narrow:'Narrow It Down', host:'Host’s Take', new:'New Question' }[kind]}${v.lifelines[kind] ? ', used' : ''}`);
  });
  $('#advice').hidden = !v.adviser || v.adviser.pick === null;
  if (v.adviser?.pick !== null && v.adviser) $('#advice').innerHTML = `Host’s take: <strong>${letters[v.adviser.pick]}</strong><br>${escape(v.adviser.confidence)}`;
  $('#ladder').innerHTML = PRIZES.map((value, i) => {
    const safety = [2, 6].includes(i); const cleared = value <= v.earned;
    return `<li value="${i + 1}" class="${i + 1 === v.rung ? 'current ' : ''}${safety ? 'safety ' : ''}${cleared ? 'cleared' : ''}" ${i + 1 === v.rung ? 'aria-current="step"' : ''} aria-label="Question ${i + 1}: ${money(value)}${safety ? ', safety level' : ''}${cleared ? ', earned' : ''}"><span class="rung-num">${i + 1}</span><span class="amount">${money(value)}</span><span class="rung-marker" aria-hidden="true">${cleared ? '✓' : safety ? '◆' : ''}</span></li>`;
  }).reverse().join('');
  $('#guaranteed').textContent = money(v.secured);
  $('#walk').hidden = v.rung < 4 || v.phase === 'walk-confirm' || v.outcome === 'walked away';
  $('#walk').disabled = !open;
  $('#bankable').textContent = `with ${money(v.earned)}`;
  $('#walk-confirm').hidden = v.phase !== 'walk-confirm';
  $('#confirm-amount').textContent = money(v.earned);
  let title = '', text = '', action = '', hint = '';
  switch (v.phase) {
    case 'question': hint = 'Take your time. Choose an answer.'; break;
    case 'selected': action = 'Lock Answer'; hint = '“Final answer?” · Lock only after commitment.'; break;
    case 'locked': action = 'Reveal Answer'; break;
    case 'correct': title = `${money(v.earned)} earned`; text = v.explanation; action = 'Continue'; break;
    case 'safety': title = `${money(v.secured)} guaranteed`; text = v.explanation; action = 'Continue'; break;
    case 'incorrect': title = `${money(v.prize)} · Your final result`; text = v.explanation; action = 'See Result'; break;
    case 'win': title = '1,000,000 · You did it!'; text = v.explanation; action = 'See Result'; break;
    case 'walk-confirm': hint = 'Your answer is still uncommitted.'; break;
    case 'hypothetical': title = `${money(v.prize)} banked`; text = 'What would you have answered? Your result is safe.'; action = 'Reveal Answer'; hint = 'Choose a hypothetical answer, or reveal without one.'; break;
    case 'walk-reveal': title = `${money(v.prize)} banked`; text = v.explanation; action = 'See Result'; break;
    case 'adviser': hint = 'Host’s Take · choose your answer, then confidence.'; break;
  }
  $('#feedback').innerHTML = title ? `<strong>${escape(title)}</strong><p>${escape(text)}${reveal && v.sources?.length ? `<a href="${escape(v.sources[0].url)}" target="_blank" rel="noopener noreferrer">Source ↗</a>` : ''}</p>` : '';
  $('#decision-hint').textContent = hint;
  $('#primary').textContent = action; $('#primary').hidden = hostMode || !action;
  $('#host-advice-controls').hidden = !hostMode;
  all('[data-host-confidence]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.hostConfidence === hostDraftConfidence)));
  $('#host-submit').disabled = !hostMode || hostDraftPick === null;
  $('#question-tools').hidden = reveal || ['walk-confirm', 'hypothetical', 'walk-reveal', 'adviser'].includes(v.phase);
  if (v.phase === 'summary') {
    $('#summary-outcome').textContent = v.outcome;
    $('#summary-prize').textContent = money(v.prize);
    $('#summary-highest').textContent = `${v.rung} / 10`;
    $('#summary-best').textContent = money(Math.max(v.prize, ...visitResults.map(r => r.prize)));
  }
  if (lastPhase !== v.phase && v.phase === 'win') celebrate();
  lastPhase = v.phase;
  persistRun();
  syncResetControl();
}

function noReplacement() {
  modal('No fresh replacement in this band', '<p>Every question in this difficulty band has already appeared in this session. The current question and lifelines have been kept unchanged.</p><p>You can return to the board, or finish this session without recording a result for this run.</p><div class="dialog-actions"><button class="outline" id="return-board">Return to board</button><button class="outline" id="end-session">Finish session</button></div>');
  $('#return-board').onclick = closeModal;
  $('#end-session').onclick = () => { closeModal(); finish(); };
}

function questionCare() {
  modal('Question care', `<p>Clarifying unfamiliar wording is free. Explain the wording without factual hints. Replace a recognised question or one that cannot be played fairly.</p>
    <label for="care-reason">Reason</label><select id="care-reason"><option value="recognition">Recognised from prior Atlas play</option><option value="wording">Ambiguity / wording cannot be clarified fairly</option><option value="factual-concern">Factual concern</option></select>
    <label for="care-note">Brief note (optional)</label><textarea id="care-note" maxlength="1000"></textarea><p id="care-error" class="dialog-error" role="alert"></p><button id="replace-question" class="primary">Replace Question</button><p class="note">A replacement stays in the same difficulty band and does not consume New Question.</p>`);
  $('#replace-question').onclick = () => {
    const ok = game.replace($('#care-reason').value, $('#care-note').value.trim());
    closeModal();
    if (ok) { playSound('next'); render(); } else noReplacement();
  };
}

function confirmResetSession() {
  if (isInspection || !storage) return;
  const target = context || storage.context();
  if (!target?.id || !storage.hasSessionData(target.id)) return;
  modal('Reset Millionaire session?', `<p>This clears the active run, question history, results and session best for <strong>${escape(target.name || 'this Atlas session')}</strong>.</p><p>Other Atlas sessions and tutor-wide question history are not changed. This cannot be undone.</p><div class="dialog-actions"><button class="outline" id="cancel-reset-session">Cancel</button><button class="primary" id="confirm-reset-session">Reset Session</button></div>`);
  $('#cancel-reset-session').onclick = closeModal;
  $('#confirm-reset-session').onclick = () => {
    storage.resetSession(target.id);
    closeModal();
    context = target;
    finish({ clearContinuity: false });
  };
}

$('#start').onclick = start; $('#again').onclick = start; $('#finish').onclick = finish;
all('[data-answer]').forEach(button => button.onclick = () => {
  const index = Number(button.dataset.answer);
  const phase = game?.publicView()?.phase;
  if (phase === 'adviser') {
    if (game.publicView().hidden.includes(index)) return;
    hostDraftPick = index;
    playSound('select');
    render();
    return;
  }
  if (game.select(index)) { playSound('select'); render(); }
});
all('[data-host-confidence]').forEach(button => button.onclick = () => {
  if (game?.publicView()?.phase !== 'adviser') return;
  hostDraftConfidence = button.dataset.hostConfidence;
  render();
});
$('#host-submit').onclick = () => {
  if (game?.advise(hostDraftPick, hostDraftConfidence)) {
    resetHostDraft();
    render();
  }
};
all('[data-lifeline]').forEach(button => button.onclick = () => {
  const kind = button.dataset.lifeline;
  if (!game.lifeline(kind)) { if (kind === 'new') noReplacement(); return; }
  if (kind === 'host') resetHostDraft();
  playSound('lifeline'); render();
});
$('#primary').onclick = () => {
  const phase = game.publicView().phase;
  if (phase === 'selected') { game.lock(); playSound('lock'); }
  else if (['locked', 'hypothetical'].includes(phase)) {
    game.reveal(); const p = game.publicView().phase;
    playSound(p === 'incorrect' ? 'wrong' : p === 'safety' ? 'safety' : p === 'win' ? 'win' : 'correct');
  } else if (['correct', 'safety'].includes(phase)) {
    if (!game.continue()) { noReplacement(); return; } playSound('next');
  } else game.summary();
  render();
};
$('#walk').onclick = () => { game.walk(); render(); };
$('#confirm-walk').onclick = () => { game.walk(true); render(); };
$('#stay').onclick = () => { game.cancelWalk(); render(); };
$('#question-tools').onclick = questionCare;
$('#reset-session').onclick = confirmResetSession;
$('#sound').onclick = () => {
  muted = !muted;
  showDirector.setMuted(muted);
  $('#sound').textContent = muted ? 'Sound off' : 'Sound on';
  $('#sound').setAttribute('aria-pressed', String(muted));
  if (!muted) playSound('select');
};
$('#how-to').onclick = () => modal('Welcome to the show', `<p>One tutor is the <strong>Host</strong>. One learner is the <strong>Contestant</strong>. Share this screen; the Host operates it.</p>
  <h3>Your climb</h3><p>Answer ten questions to reach 1,000,000. There is no timer and no real money. Say what you think, change your mind, and ask for free wording clarification.</p>
  <ol><li>The Contestant chooses an answer. The Host selects it.</li><li>Ask “Final answer?” consistently. Click <strong>Lock Answer</strong> only after explicit commitment.</li><li>Pause for suspense, then the Host clicks <strong>Reveal Answer</strong>.</li></ol>
  <h3>Three lifelines · once each</h3><p><strong>Narrow It Down</strong> removes two wrong answers. <strong>Host’s Take</strong> lets the Host choose directly on the board, add confidence, then return control without revealing the answer. <strong>New Question</strong> replaces the question within its difficulty band. Lifelines may be combined before lock-in.</p>
  <h3>Know the stakes</h3><p>Clearing Question 3 guarantees <strong>8,000</strong>; clearing Question 7 guarantees <strong>125,000</strong>. A wrong answer ends the run at the last safety level, or zero.</p><p>From Question 4, <strong>Walk Away</strong> banks the previous prize before lock-in. Then say what you would have answered and reveal it for closure.</p>
  <h3>Keep it fair</h3><p>The Host stays neutral outside Host’s Take: probe reasoning without recommending an answer, lifeline or walk-away. Both players see the correct answer only at reveal.</p><p>Before reveal, use <strong>Question care</strong> for recognised questions, unclear wording or factual concerns. A replacement stays in the same difficulty band and does not consume New Question.</p>`);

try {
  if (!Bridge || !window.ArcadeGameChrome || !window.AtlasSessionPanel) throw new Error('Atlas shared runtime did not load.');
  // The session panel owns its own existing cloud bootstrap; no game networking.
  window.AtlasSessionPanel.mount({ root: '#atlas-session-panel-root', initialView: 'manage' });
  window.ArcadeGameChrome.mountLanding({ root: '#landing-chrome', appearance: false, returnTo: 'arcade' });
  window.ArcadeGameChrome.mountGame({ root: '#game-chrome', session: false, search: false, appearance: false });
  const inspect = new URLSearchParams(location.search).get('inspect');
  if (['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) && inspect) {
    isInspection = true;
    context = storage.context();
    const { inspectState } = await import('./dev/inspect.mjs');
    game = inspectState(inspect); render();
  } else {
    storage.register();
    context = storage.context();
    const savedRun = storage.activeRun(context.id);
    if (savedRun) {
      game = new Millionaire(QUESTIONS, { seen: storage.seen(context.id), sessionSeen: savedRun.sessionSeen || [], onEvent });
      if (game.restore(savedRun)) {
        visitSeen = new Set(savedRun.sessionSeen || []);
        lastQuestion = null;
        window.AtlasSessionPanel?.close();
        render();
      } else {
        game = null;
        storage.clearRun(context.id);
      }
    }
    syncResetControl();
  }
  // Only the game is fixed dark. Never write over the tutor’s saved appearance.
  document.documentElement.dataset.theme = 'night';
  window.addEventListener('atlas:appearance-change', () => { document.documentElement.dataset.theme = 'night'; });
  window.addEventListener('atlas:persistence-scope-change', () => {
    if (isInspection) return;
    if ($('#dialog').open) closeModal();
    finish({ clearContinuity: false }); context = null;
    syncResetControl();
    modal('Teaching context changed', '<p>The Atlas account context changed. Start a new run in the current session.</p>');
  });
} catch (error) {
  console.error(error);
  $('#show').innerHTML = '<section class="fatal"><h1>Millionaire</h1><p>The game could not load its shared Atlas runtime. Reload this page to try again.</p><a href="../index.html">Back to Arcade</a></section>';
}