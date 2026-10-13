const PROFILES = {
  opening: { root: 55.0, upper: 82.5, bed: .0065, pulse: .42, modulation: .0018 },
  middle: { root: 58.27, upper: 87.31, bed: .0085, pulse: .56, modulation: .0025 },
  pressure: { root: 61.74, upper: 92.5, bed: .0115, pulse: .74, modulation: .0034 },
  final: { root: 65.41, upper: 98.0, bed: .014, pulse: .92, modulation: .0042 }
};

const AUDIO_ASSETS = {
  pressureBed: './assets/audio/bed-pressure.mp3',
  next: './assets/audio/cue-round-transition.mp3',
  correct: './assets/audio/cue-correct.mp3',
  wrong: './assets/audio/cue-wrong.mp3'
};

const RELEASE_PHASES = new Set(['correct', 'safety', 'incorrect', 'win', 'walk-reveal', 'summary']);
const SOFT_PHASES = new Set(['walk-confirm', 'hypothetical', 'adviser']);
const REAL_CUE_GAIN = { next: .66, correct: .96, wrong: .96 };

export function createShowDirector(root) {
  let context = null;
  let master = null;
  let synthBedGain = null;
  let cueGain = null;
  let low = null;
  let high = null;
  let lfo = null;
  let lfoDepth = null;
  let muted = false;
  let currentBand = 'opening';
  let currentPhase = 'question';
  let cueTimer = null;

  const media = {};
  const mediaGains = {};
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;

  Object.entries(AUDIO_ASSETS).forEach(([name, source]) => {
    const element = new Audio(new URL(source, import.meta.url).href);
    element.preload = 'auto';
    element.playsInline = true;
    if (name === 'pressureBed') element.loop = true;
    media[name] = element;
  });

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

    const profile = PROFILES[currentBand];
    context = new AudioContextCtor();
    master = context.createGain();
    synthBedGain = context.createGain();
    cueGain = context.createGain();
    low = context.createOscillator();
    high = context.createOscillator();
    lfo = context.createOscillator();
    lfoDepth = context.createGain();

    master.gain.value = muted ? .0001 : .86;
    synthBedGain.gain.value = .0001;
    cueGain.gain.value = 1;
    low.type = 'triangle';
    high.type = 'sine';
    lfo.type = 'sine';
    low.frequency.value = profile.root;
    high.frequency.value = profile.upper;
    lfo.frequency.value = profile.pulse;
    lfoDepth.gain.value = profile.modulation;

    low.connect(synthBedGain);
    high.connect(synthBedGain);
    lfo.connect(lfoDepth).connect(synthBedGain.gain);
    synthBedGain.connect(master);
    cueGain.connect(master);

    Object.entries(media).forEach(([name, element]) => {
      const source = context.createMediaElementSource(element);
      const gain = context.createGain();
      gain.gain.value = name === 'pressureBed' ? .0001 : 1;
      source.connect(gain).connect(master);
      mediaGains[name] = gain;
    });

    master.connect(context.destination);
    low.start();
    high.start();
    lfo.start();

    applyBed(currentBand, currentPhase, .08);
    return true;
  }

  function proceduralBedLevel(profile, phase) {
    const locked = phase === 'locked';
    const release = RELEASE_PHASES.has(phase);
    const softened = SOFT_PHASES.has(phase);
    if (release) return .0012;
    if (softened) return profile.bed * .55;
    if (locked) return profile.bed * 1.25;
    return profile.bed;
  }

  function pressureBedLevel(phase) {
    if (RELEASE_PHASES.has(phase)) return .0001;
    if (SOFT_PHASES.has(phase)) return .20;
    if (phase === 'locked') return .54;
    if (phase === 'selected') return .43;
    return .34;
  }

  function playPressureBed(fallbackLevel) {
    const element = media.pressureBed;
    if (!element || element.paused === false) return;
    void element.play().catch(() => {
      if (synthBedGain) ramp(synthBedGain.gain, muted ? .0001 : fallbackLevel, .18);
    });
  }

  function pausePressureBed(reset = false) {
    const element = media.pressureBed;
    if (!element) return;
    element.pause();
    if (reset) element.currentTime = 0;
  }

  function applyBed(band, phase, seconds = .55) {
    currentBand = PROFILES[band] ? band : 'opening';
    currentPhase = phase || 'question';
    if (!context || !low || !high || !lfo || !synthBedGain) return;

    const profile = PROFILES[currentBand];
    const locked = currentPhase === 'locked';
    const release = RELEASE_PHASES.has(currentPhase);
    const pitchLift = locked ? 1.035 : 1;
    const fallbackLevel = proceduralBedLevel(profile, currentPhase);
    const useRealPressureBed = currentBand === 'pressure' && !release;

    ramp(low.frequency, profile.root * pitchLift, seconds);
    ramp(high.frequency, profile.upper * pitchLift, seconds);
    ramp(lfo.frequency, profile.pulse + (locked ? .18 : 0), seconds);
    ramp(lfoDepth.gain, release ? .0001 : profile.modulation * (locked ? 1.25 : 1), seconds);

    if (useRealPressureBed) {
      ramp(synthBedGain.gain, .0001, .22);
      if (!muted) playPressureBed(fallbackLevel);
      if (mediaGains.pressureBed) ramp(mediaGains.pressureBed.gain, muted ? .0001 : pressureBedLevel(currentPhase), seconds);
    } else {
      if (mediaGains.pressureBed) ramp(mediaGains.pressureBed.gain, .0001, .24);
      pausePressureBed(release || currentBand !== 'pressure');
      ramp(synthBedGain.gain, muted ? .0001 : fallbackLevel, seconds);
    }
  }

  function tone(frequency, start, duration, gain = .025, type = 'sine') {
    if (!context || !cueGain) return;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    envelope.gain.setValueAtTime(.0001, start);
    envelope.gain.exponentialRampToValueAtTime(gain, start + .025);
    envelope.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(envelope).connect(cueGain);
    oscillator.start(start);
    oscillator.stop(start + duration + .03);
  }

  function sweep(from, to, start, duration, gain = .024, type = 'triangle') {
    if (!context || !cueGain) return;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, start);
    oscillator.frequency.exponentialRampToValueAtTime(to, start + duration);
    envelope.gain.setValueAtTime(.0001, start);
    envelope.gain.exponentialRampToValueAtTime(gain, start + .025);
    envelope.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(envelope).connect(cueGain);
    oscillator.start(start);
    oscillator.stop(start + duration + .03);
  }

  function playAsset(kind) {
    const element = media[kind];
    const gain = mediaGains[kind];
    if (!element || !gain) return false;
    element.pause();
    element.currentTime = 0;
    gain.gain.setValueAtTime(REAL_CUE_GAIN[kind] || 1, context.currentTime);
    void element.play().catch(() => {});
    return true;
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

    if (['next', 'correct', 'wrong'].includes(kind) && playAsset(kind)) return;

    const now = context.currentTime + .015;
    if (kind === 'select') {
      tone(523.25, now, .14, .012);
    } else if (kind === 'lock') {
      sweep(196, 98, now, .52, .021, 'triangle');
      tone(73.42, now + .08, .7, .014, 'sine');
    } else if (kind === 'safety') {
      playAsset('correct');
      tone(659.25, now + .24, .52, .013);
      tone(880, now + .36, .62, .010);
    } else if (kind === 'win') {
      playAsset('correct');
      [392, 523.25, 659.25, 783.99].forEach((f, i) => tone(f, now + .22 + i * .11, .72, .018));
    } else if (kind === 'lifeline') {
      tone(659.25, now, .28, .014);
      tone(880, now + .09, .38, .011);
    }
  }

  function sync(view) {
    if (!view) return;
    applyBed(view.band || currentBand, view.phase || currentPhase);
  }

  function setMuted(value) {
    muted = Boolean(value);
    if (!context || !master) return;
    ramp(master.gain, muted ? .0001 : .86, .18);
    if (muted) pausePressureBed();
    else applyBed(currentBand, currentPhase, .2);
  }

  function stop() {
    if (synthBedGain) ramp(synthBedGain.gain, .0001, .28);
    if (mediaGains.pressureBed) ramp(mediaGains.pressureBed.gain, .0001, .18);
    Object.values(media).forEach(element => {
      element.pause();
      element.currentTime = 0;
    });
    if (root) delete root.dataset.showCue;
  }

  document.addEventListener('visibilitychange', () => {
    if (!context) return;
    if (document.hidden) {
      pausePressureBed();
      void context.suspend();
    } else if (!muted) {
      void context.resume().then(() => applyBed(currentBand, currentPhase, .2)).catch(() => {});
    }
  });

  return { cue, sync, setMuted, stop };
}
