const AudioEngine = (() => {

  let muted       = false;
  let currentN    = null;
  let audioEl     = null;

  let fadeInterval = null;
  let transitionId = 0;

  const TRACKS = {
    1: 'assets/audio/nivel1.mp3',
    2: 'assets/audio/nivel2.mp3',
    3: 'assets/audio/nivel3.mp3',
    4: 'assets/audio/nivel4.mp3',
    5: 'assets/audio/nivel5.mp3',
  };

  const FADE_OUT_MS = 400;
  const FADE_IN_MS  = 1000;
  const MAX_VOLUME  = 0.85;
  const FADE_STEPS  = 30;

  async function start() {
    // Compatibilidad con main.js
  }

  function setNivel(n) {

    if (n === currentN) return;

    currentN = n;

    const src = TRACKS[n];
    if (!src) return;

    transitionId++;
    const thisTransition = transitionId;

    stopCurrentAudio(() => {

      // Si otra transición empezó mientras tanto, cancelar
      if (thisTransition !== transitionId) return;

      createAndPlay(src);

    });
  }

  function stopCurrentAudio(callback) {

    if (!audioEl) {
      callback();
      return;
    }

    clearFade();

    const startVol = audioEl.volume;
    const step     = startVol / FADE_STEPS;
    const interval = FADE_OUT_MS / FADE_STEPS;

    fadeInterval = setInterval(() => {

      if (!audioEl) {
        clearFade();
        callback();
        return;
      }

      audioEl.volume = Math.max(0, audioEl.volume - step);

      if (audioEl.volume <= 0.01) {

        clearFade();

        try {
          audioEl.pause();

          // FORZAR descarga completa
          audioEl.removeAttribute('src');
          audioEl.load();

        } catch (e) {}

        audioEl = null;

        callback();
      }

    }, interval);
  }

  function createAndPlay(src) {

    clearFade();

    const newAudio = new Audio();

    newAudio.src       = src;
    newAudio.loop      = true;
    newAudio.preload   = 'auto';
    newAudio.volume    = 0;
    newAudio.playsInline = true;
    

    audioEl = newAudio;

    if (muted) return;

    const playPromise = newAudio.play();

    if (playPromise !== undefined) {

      playPromise
        .then(() => {
          fadeIn(newAudio);
        })
        .catch(err => {
          console.warn('Audio bloqueado:', err);
        });
    }
  }

  function fadeIn(targetAudio) {

    clearFade();

    const step     = MAX_VOLUME / FADE_STEPS;
    const interval = FADE_IN_MS / FADE_STEPS;

    fadeInterval = setInterval(() => {

      // Si el audio cambió durante fade
      if (audioEl !== targetAudio) {
        clearFade();
        return;
      }

      targetAudio.volume = Math.min(
        MAX_VOLUME,
        targetAudio.volume + step
      );

      if (targetAudio.volume >= MAX_VOLUME) {
        clearFade();
      }

    }, interval);
  }

  function clearFade() {
    if (fadeInterval) {
      clearInterval(fadeInterval);
      fadeInterval = null;
    }
  }

  function setMute(m) {

    muted = m;

    if (!audioEl) return;

    if (m) {

      audioEl.volume = 0;
      audioEl.pause();

    } else {

      audioEl.play()
        .then(() => fadeIn(audioEl))
        .catch(() => {});
    }
  }

  function isMuted() {
    return muted;
  }

  return {
    start,
    setNivel,
    setMute,
    isMuted
  };

})();

window.AudioEngine = AudioEngine;