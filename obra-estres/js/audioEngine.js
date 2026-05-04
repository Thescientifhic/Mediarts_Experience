// audioEngine.js — Motor de sonido generativo con Tone.js

const AudioEngine = (() => {
  let started  = false;
  let muted    = false;
  let currentN = null;
  let loopId   = null;

  // Nodos persistentes (se crean una sola vez)
  let reverb, compressor, masterVol;
  let synths  = [];
  let drones  = [];

  function init() {
    masterVol  = new Tone.Volume(-6).toDestination();
    compressor = new Tone.Compressor(-24, 6).connect(masterVol);
    reverb     = new Tone.Reverb({ decay: 6, wet: 0.7 }).connect(compressor);
    reverb.generate();
  }

  function disposeAll() {
    synths.forEach(s => { try { s.dispose(); } catch(_){} });
    drones.forEach(d => { try { d.dispose(); } catch(_){} });
    if (loopId) clearInterval(loopId);
    synths = [];
    drones = [];
    loopId = null;
  }

  async function start() {
    if (started) return;
    await Tone.start();
    init();
    started = true;
  }

  function setNivel(n) {
    if (!started) return;
    const cfg = window.NIVELES[n];
    if (!cfg) return;
    currentN = n;

    disposeAll();

    reverb.wet.rampTo(cfg.audio_reverb, 1.5);
    masterVol.volume.rampTo(muted ? -Infinity : cfg.audio_volume, 1.0);

    // ── Drones (notas largas sostenidas) ──────────────────────────
    cfg.audio_base_hz.forEach((hz, i) => {
      const drone = new Tone.Synth({
        oscillator: { type: cfg.audio_synth },
        envelope:   { attack: 3.0, decay: 0.5, sustain: 0.7, release: 4.0 },
        volume:     -24 - i * 3,
      }).connect(reverb);

      drone.triggerAttack(hz);

      // vibrato sutil que crece con el nivel
      if (n >= 3) {
        const lfo = new Tone.LFO({
          frequency: 0.08 + n * 0.06,
          min:       hz * 0.99,
          max:       hz * 1.01,
        }).start();
        lfo.connect(drone.frequency);
      }
      drones.push(drone);
    });

    // ── Pulsos rítmicos (aumentan con nivel) ─────────────────────
    if (n >= 2) {
      const pulseSynth = new Tone.MembraneSynth({
        pitchDecay: 0.08,
        octaves:    4,
        volume:     -30 + n * 3,
      }).connect(reverb);

      synths.push(pulseSynth);

      loopId = setInterval(() => {
        if (muted) return;
        // probabilidad de disparo aumenta con el nivel
        if (Math.random() < 0.35 + n * 0.12) {
          const notes = cfg.audio_base_hz;
          const hz = notes[Math.floor(Math.random() * notes.length)];
          pulseSynth.triggerAttackRelease(hz, "8n");
        }
      }, cfg.audio_interval);
    }

    // ── Ruido de textura (nivel 4–5) ─────────────────────────────
    if (n >= 4) {
      const noise = new Tone.Noise({ type: "brown", volume: -40 + n * 4 })
        .connect(reverb);
      const filter = new Tone.AutoFilter({
        frequency: 0.5 + n * 0.4,
        baseFrequency: 300,
        octaves: 2.5,
      }).connect(reverb).start();
      noise.connect(filter);
      noise.start();
      synths.push(noise, filter);
    }
  }

  function setMute(m) {
    muted = m;
    if (!started) return;
    if (m) {
      Tone.getDestination().volume.rampTo(-Infinity, 0.3);
    } else {
      const cfg = window.NIVELES[currentN];
      Tone.getDestination().volume.rampTo(cfg ? cfg.audio_volume : -12, 0.3);
    }
  }

  function isMuted() { return muted; }

  return { start, setNivel, setMute, isMuted };
})();

window.AudioEngine = AudioEngine;
