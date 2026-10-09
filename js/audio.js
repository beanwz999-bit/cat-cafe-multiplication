/* ===========================================================
   Sound effects — synthesized with the Web Audio API
   =========================================================== */
const Sound = (() => {
  let ctx = null;
  let master = null;
  let enabled = true;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.8;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function unlock() {
    const c = ensure();
    if (c) {
      const b = c.createBuffer(1, 1, 22050);
      const s = c.createBufferSource();
      s.buffer = b;
      s.connect(c.destination);
      s.start(0);
    }
    window.removeEventListener('pointerdown', unlock, true);
    window.removeEventListener('touchend', unlock, true);
  }
  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('touchend', unlock, true);

  function tone(freq, start, dur, opts = {}) {
    const { type = 'sine', vol = 0.18, slideTo = null } = opts;
    if (!ctx) return;
    const t0 = ctx.currentTime + start;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(master);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  function meow() {
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const p = 0.85 + Math.random() * 0.35;
    const o = ctx.createOscillator();
    const f = ctx.createBiquadFilter();
    const f2 = ctx.createBiquadFilter();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(420 * p, t0);
    o.frequency.linearRampToValueAtTime(720 * p, t0 + 0.14);
    o.frequency.linearRampToValueAtTime(560 * p, t0 + 0.4);
    o.frequency.linearRampToValueAtTime(430 * p, t0 + 0.6);
    f.type = 'bandpass';
    f.Q.value = 3;
    f.frequency.setValueAtTime(800, t0);
    f.frequency.linearRampToValueAtTime(1900, t0 + 0.15);
    f.frequency.linearRampToValueAtTime(1100, t0 + 0.6);
    f2.type = 'lowpass';
    f2.frequency.value = 3200;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.35, t0 + 0.06);
    g.gain.exponentialRampToValueAtTime(0.22, t0 + 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.65);
    o.connect(f); f.connect(f2); f2.connect(g); g.connect(master);
    o.start(t0);
    o.stop(t0 + 0.7);
  }

  function purr() {
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const dur = 1.3;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 280;
    const am = ctx.createGain();
    am.gain.value = 0.5;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 24;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.5;
    lfo.connect(lfoGain);
    lfoGain.connect(am.gain);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(0.9, t0 + 0.2);
    env.gain.setValueAtTime(0.9, t0 + dur - 0.35);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(lp); lp.connect(am); am.connect(env); env.connect(master);
    src.start(t0); lfo.start(t0);
    src.stop(t0 + dur); lfo.stop(t0 + dur);
  }

  function pianoKey() {
    if (!ctx) return;
    const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];
    const n = notes[Math.floor(Math.random() * notes.length)];
    tone(n, 0, 0.4, { type: 'triangle', vol: 0.2 });
  }

  const effects = {
    tap: () => tone(700, 0, 0.06, { type: 'triangle', vol: 0.07 }),
    key: () => tone(520 + Math.random() * 60, 0, 0.05, { type: 'triangle', vol: 0.06 }),
    correct: () => {
      tone(784, 0, 0.14, { type: 'triangle', vol: 0.18 });
      tone(1047, 0.09, 0.18, { type: 'triangle', vol: 0.18 });
      tone(1319, 0.18, 0.3, { type: 'sine', vol: 0.14 });
    },
    quick: () => {
      tone(988, 0, 0.08, { type: 'triangle', vol: 0.15 });
      tone(1319, 0.06, 0.14, { type: 'sine', vol: 0.12 });
    },
    wrong: () => {
      tone(330, 0, 0.16, { type: 'sine', vol: 0.16, slideTo: 260 });
      tone(247, 0.14, 0.24, { type: 'sine', vol: 0.14, slideTo: 220 });
    },
    coin: () => {
      tone(1319, 0, 0.07, { type: 'square', vol: 0.04 });
      tone(1976, 0.06, 0.22, { type: 'square', vol: 0.04 });
    },
    buy: () => {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.07, 0.18, { type: 'triangle', vol: 0.15 }));
    },
    bloom: () => {
      [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.08, 0.3, { type: 'sine', vol: 0.12 }));
      tone(2093, 0.36, 0.4, { type: 'sine', vol: 0.06 });
    },
    fanfare: () => {
      [523, 659, 784].forEach((f, i) => tone(f, i * 0.12, 0.16, { type: 'triangle', vol: 0.16 }));
      tone(1047, 0.38, 0.5, { type: 'triangle', vol: 0.18 });
      tone(784, 0.38, 0.5, { type: 'sine', vol: 0.1 });
    },
    tick: () => tone(880, 0, 0.08, { type: 'sine', vol: 0.12 }),
    go: () => {
      tone(1047, 0, 0.35, { type: 'triangle', vol: 0.18 });
      tone(1568, 0, 0.35, { type: 'sine', vol: 0.08 });
    },
    pop: () => tone(600, 0, 0.09, { type: 'sine', vol: 0.12, slideTo: 1200 }),
    pianoKey,
    meow,
    purr,
  };

  return {
    play(name) {
      if (!enabled) return;
      if (!ensure()) return;
      try { effects[name] && effects[name](); } catch (e) { /* ignore audio errors */ }
    },
    setEnabled(v) { enabled = !!v; },
    get enabled() { return enabled; },
  };
})();
