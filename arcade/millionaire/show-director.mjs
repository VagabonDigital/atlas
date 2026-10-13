const PROFILES = {
  opening: { root: 55.0, upper: 82.5, bed: .0065, pulse: .42, modulation: .0018 },
  middle: { root: 58.27, upper: 87.31, bed: .0085, pulse: .56, modulation: .0025 },
  pressure: { root: 61.74, upper: 92.5, bed: .0115, pulse: .74, modulation: .0034 },
  final: { root: 65.41, upper: 98.0, bed: .014, pulse: .92, modulation: .0042 }
};

const AUDIO_ASSETS = {
  atmosphere: './assets/audio/bed-pressure.mp3',
  next: './assets/audio/cue-round-transition.mp3',
  correct: './assets/audio/cue-correct.mp3',
  wrong: './assets/audio/cue-wrong.mp3'
};

const RELEASE_PHASES = new Set(['correct', 'safety', 'incorrect', 'win', 'walk-reveal', 'summary']);
const SOFT_PHASES = new Set(['walk-confirm', 'hypothetical', 'adviser']);

// Tuned for a shared tutoring call, where speech must remain dominant.
const MASTER_LEVEL = .46;
const REAL_CUE_GAIN = { next: .40, correct: .52, wrong: .50 };
const REAL_CUE_TAIL = {
  // Millionaire's "Let's Play" moment breathes before settling into the question bed.
  // Keep this long enough to feel ceremonial, but short enough not to fight tutor speech.
  next: { fadeAt: 3.7, stopAt: 4.6 },
  correct: { fadeAt: 2.35, stopAt: 2.95 },
  wrong: { fadeAt: 3.0, stopAt: 3.65 }
};
const ATMOSPHERE_LEVEL = {
  opening: .10,
  middle: .14,
  pressure: .20,
  final: .24
};

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
  const mediaTimers = {};
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;

  Object.entries(AUDIO_ASSETS).forEach(([name, source]) => {
    const element = new Audio(new URL(source, import.meta.url).href);
    element.preload = 'auto';
    element.playsInline = true;
    if (name === 'atmosphere') element.loop = true;
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

    master.gain.value = muted ? .0001 : MASTER_LEVEL;
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
      gain.gain.value = name === 'atmosphere' ? .0001 : 1;
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
    if (RELEASE_PHASES.has(phase)) return .0001;
    if (SOFT_PHASES.has(phase)) return profile.bed * .10;
    if (phase === 'locked') return profile.bed * .20;
    if (phase === 'selected') return profile.bed * .15;
    return profile.bed * .10;
  }

  function atmosphereLevel(band, phase) {
    if (RELEASE_PHASES.has(phase)) return .0001;
    const base = ATMOSPHERE_LEVEL[band] ?? ATMOSPHERE_LEVEL.opening;
    if (SOFT_PHASES.has(phase)) return base * .40;
    if (phase === 'locked') return base * 1.28;
    if (phase === 'selected') return base * 1.10;
    return base;
  }

  function playAtmosphere(fallbackLevel) {
    const element = media.atmosphere;
    if (!element || element.paused === false) return;
    void element.play().catch(() => {
      if (synthBedGain) ramp(synthBedGain.gain, muted ? .0001 : fallbackLevel, .18);
    });
  }

  function pauseAtmosphere(reset = false) {
    const element = media.atmosphere;
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
    const pitchLift = locked ? 1.025 : 1;
    const fallbackLevel = proceduralBedLevel(profile, currentPhase);

    ramp(low.frequency, profile.root * pitchLift, seconds);
    ramp(high.frequency, profile.upper * pitchLift, seconds);
    ramp(lfo.frequency, profile.pulse + (locked ? .12 : 0), seconds);
    ramp(lfoDepth.gain, release ? .0001 : profile.modulation * .18, seconds);
    ramp(synthBedGain.gain, muted || release ? .0001 : fallbackLevel, seconds);

    if (release || muted) {
      if (mediaGains.atmosphere) ramp(mediaGains.atmosphere.gain, .0001, .16);
      pauseAtmosphere();
      return;
    }

    playAtmosphere(fallbackLevel);
    if (mediaGains.atmosphere) {
      ramp(mediaGains.atmosphere.gain, atmosphereLevel(currentBand, currentPhase), seconds);
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

  function stopAsset(kind, reset = true) {
    const element = media[kind];
    if (!element) return;
    clearTimeout(mediaTimers[kind]);
    delete mediaTimers[kind];
    element.pause();
    if (reset) element.currentTime = 0;
  }

  function stopOneShots(except) {
    ['next', 'correct', 'wrong'].forEach(kind => {
      if (kind !== except) stopAsset(kind);
    });
  }

  function playAsset(kind) {
    const element = media[kind];
    const gain = mediaGains[kind];
    if (!element || !gain || !context) return false;

    stopOneShots(kind);
    stopAsset(kind);
    const now = context.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(Math.max(.0001, REAL_CUE_GAIN[kind] || .45), now);

    const tail = REAL_CUE_TAIL[kind];
    if (tail) {
      gain.gain.setValueAtTime(Math.max(.0001, REAL_CUE_GAIN[kind] || .45), now + tail.fadeAt);
      gain.gain.exponentialRampToValueAtTime(.0001, now + tail.stopAt);
      mediaTimers[kind] = setTimeout(() => stopAsset(kind), Math.ceil((tail.stopAt + .08) * 1000));
    }

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
      // Tiny tactile confirmation: felt more than heard.
      tone(560, now, .09, .0065, 'triangle');
    } else if (kind === 'lock') {
      // Temporary restrained commitment cue until the dedicated lock asset arrives.
      tone(110, now, .22, .010, 'triangle');
      tone(55, now + .045, .34, .0075, 'sine');
    } else if (kind === 'safety') {
      playAsset('correct');
      tone(659.25, now + .20, .38, .0075);
      tone(880, now + .30, .44, .006);
    } else if (kind === 'win') {
      playAsset('correct');
      [392, 523.25, 659.25, 783.99].forEach((f, i) => tone(f, now + .18 + i * .10, .52, .010));
    } else if (kind === 'lifeline') {
      tone(659.25, now, .20, .0075);
      tone(880, now + .07, .26, .006);
    }
  }

  function sync(view) {
    if (!view) return;
    applyBed(view.band || currentBand, view.phase || currentPhase);
  }

  function setMuted(value) {
    muted = Boolean(value);
    if (!context || !master) return;
    ramp(master.gain, muted ? .0001 : MASTER_LEVEL, .18);
    if (muted) pauseAtmosphere();
    else applyBed(currentBand, currentPhase, .2);
  }

  function stop() {
    if (synthBedGain) ramp(synthBedGain.gain, .0001, .22);
    if (mediaGains.atmosphere) ramp(mediaGains.atmosphere.gain, .0001, .16);
    Object.keys(mediaTimers).forEach(kind => clearTimeout(mediaTimers[kind]));
    Object.values(media).forEach(element => {
      element.pause();
      element.currentTime = 0;
    });
    if (root) delete root.dataset.showCue;
  }

  document.addEventListener('visibilitychange', () => {
    if (!context) return;
    if (document.hidden) {
      pauseAtmosphere();
      void context.suspend();
    } else if (!muted) {
      void context.resume().then(() => applyBed(currentBand, currentPhase, .2)).catch(() => {});
    }
  });

  return { cue, sync, setMuted, stop };
}
