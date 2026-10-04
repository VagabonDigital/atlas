const PROFILES = {
  opening: { root: 55.0, upper: 82.5, bed: .0065, pulse: .42, modulation: .0018 },
  middle: { root: 58.27, upper: 87.31, bed: .0085, pulse: .56, modulation: .0025 },
  pressure: { root: 61.74, upper: 92.5, bed: .0115, pulse: .74, modulation: .0034 },
  final: { root: 65.41, upper: 98.0, bed: .014, pulse: .92, modulation: .0042 }
};

const RELEASE_PHASES = new Set(['correct', 'safety', 'incorrect', 'win', 'walk-reveal', 'summary']);
const SOFT_PHASES = new Set(['walk-confirm', 'hypothetical', 'adviser']);

export function createShowDirector(root) {
  let context = null;
  let master = null;
  let bedGain = null;
  let low = null;
  let high = null;
  let lfo = null;
  let lfoDepth = null;
  let muted = false;
  let currentBand = 'opening';
  let currentPhase = 'question';
  let cueTimer = null;

  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;

  function ramp(param, value, seconds = .35) {
    if (!context || !param) return;
    const now = context.currentTime;
    param.cancelScheduledValues(now);
    param.setValueAtTime(Math.max(.0001, param.value || .0001), now);
    param.exponentialRampToValueAtTime(Math.max(.0001, value), now + seconds);
  }

  function ensureAudio() {
    if (!AudioContextCtor) return false;
    if (context) {
      if (context.state === 'suspended' && !muted) void context.resume();
      return true;
    }

    context = new AudioContextCtor();
    master = context.createGain();
    bedGain = context.createGain();
    const cueGain = context.createGain();
    low = context.createOscillator();
    high = context.createOscillator();
    lfo = context.createOscillator();
    lfoDepth = context.createGain();

    master.gain.value = muted ? .0001 : .78;
    bedGain.gain.value = .0001;
    cueGain.gain.value = 1;
    low.type = 'triangle';
    high.type = 'sine';
    lfo.type = 'sine';

    low.connect(bedGain);
    high.connect(bedGain);
    lfo.connect(lfoDepth).connect(bedGain.gain);
    bedGain.connect(master);
    cueGain.connect(master);
    master.connect(context.destination);

    low.start();
    high.start();
    lfo.start();

    context.__millionaireCueGain = cueGain;
    applyBed(currentBand, currentPhase, .08);
    return true;
  }

  function applyBed(band, phase, seconds = .55) {
    currentBand = PROFILES[band] ? band : 'opening';
    currentPhase = phase || 'question';
    if (!context || !low || !high || !lfo || !bedGain) return;

    const profile = PROFILES[currentBand];
    const locked = currentPhase === 'locked';
    const release = RELEASE_PHASES.has(currentPhase);
    const softened = SOFT_PHASES.has(currentPhase);
    const pitchLift = locked ? 1.035 : 1;
    const level = release ? .0012 : softened ? profile.bed * .55 : locked ? profile.bed * 1.25 : profile.bed;

    ramp(low.frequency, profile.root * pitchLift, seconds);
    ramp(high.frequency, profile.upper * pitchLift, seconds);
    ramp(lfo.frequency, profile.pulse + (locked ? .18 : 0), seconds);
    ramp(lfoDepth.gain, release ? .0001 : profile.modulation * (locked ? 1.25 : 1), seconds);
    ramp(bedGain.gain, muted ? .0001 : level, seconds);
  }

  function tone(frequency, start, duration, gain = .025, type = 'sine') {
    if (!context || !context.__millionaireCueGain) return;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    envelope.gain.setValueAtTime(.0001, start);
    envelope.gain.exponentialRampToValueAtTime(gain, start + .025);
    envelope.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(envelope).connect(context.__millionaireCueGain);
    oscillator.start(start);
    oscillator.stop(start + duration + .03);
  }

  function sweep(from, to, start, duration, gain = .024, type = 'triangle') {
    if (!context || !context.__millionaireCueGain) return;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, start);
    oscillator.frequency.exponentialRampToValueAtTime(to, start + duration);
    envelope.gain.setValueAtTime(.0001, start);
    envelope.gain.exponentialRampToValueAtTime(gain, start + .025);
    envelope.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(envelope).connect(context.__millionaireCueGain);
    oscillator.start(start);
    oscillator.stop(start + duration + .03);
  }

  function flash(kind, duration = 900) {
    if (!root) return;
    clearTimeout(cueTimer);
    root.dataset.showCue = kind;
    cueTimer = setTimeout(() => {
      if (root.dataset.showCue === kind) delete root.dataset.showCue;
    }, duration);
  }

  function cue(kind) {
    flash(kind, ['wrong', 'win', 'safety'].includes(kind) ? 1500 : 850);
    if (muted || !ensureAudio()) return;

    const now = context.currentTime + .015;
    if (kind === 'select') {
      tone(523.25, now, .16, .016);
    } else if (kind === 'lock') {
      sweep(196, 98, now, .52, .026, 'triangle');
      tone(73.42, now + .08, .7, .018, 'sine');
    } else if (kind === 'correct') {
      [392, 523.25, 659.25].forEach((f, i) => tone(f, now + i * .095, .42, .022));
    } else if (kind === 'safety') {
      [329.63, 440, 554.37, 659.25].forEach((f, i) => tone(f, now + i * .105, .55, .026));
    } else if (kind === 'wrong') {
      sweep(220, 82.41, now, .95, .03, 'sawtooth');
      tone(110, now + .18, 1.05, .019, 'triangle');
    } else if (kind === 'win') {
      [261.63, 329.63, 392, 523.25, 659.25, 783.99].forEach((f, i) => tone(f, now + i * .11, .8, .027));
    } else if (kind === 'lifeline') {
      tone(659.25, now, .28, .018);
      tone(880, now + .09, .38, .015);
    } else if (kind === 'next') {
      tone(196, now, .28, .014, 'triangle');
      tone(293.66, now + .1, .34, .015);
    }
  }

  function sync(view) {
    if (!view) return;
    applyBed(view.band || currentBand, view.phase || currentPhase);
  }

  function setMuted(value) {
    muted = Boolean(value);
    if (!context || !master) return;
    ramp(master.gain, muted ? .0001 : .78, .18);
    if (!muted) applyBed(currentBand, currentPhase, .2);
  }

  function stop() {
    if (bedGain) ramp(bedGain.gain, .0001, .28);
    if (root) delete root.dataset.showCue;
  }

  document.addEventListener('visibilitychange', () => {
    if (!context) return;
    if (document.hidden) void context.suspend();
    else if (!muted) void context.resume().then(() => applyBed(currentBand, currentPhase, .2)).catch(() => {});
  });

  return { cue, sync, setMuted, stop };
}
