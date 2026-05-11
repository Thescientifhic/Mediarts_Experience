// audioEngine.js — Reproduce una pista MP3 específica por nivel.
// Cada nivel tiene su propia canción en assets/audio/nivelN.mp3
// Fade in al entrar, fade out al salir. Mute global sin interrumpir la pista.

const AudioEngine = (() => {
  let muted      = false;
  let currentN   = null;
  let audioEl    = null;
  let fadeOut    = null;  // ID del intervalo de fade out en curso

  // ── PISTAS POR NIVEL ──────────────────────────────────────────────────────
  // Cambia las rutas a donde tengas tus MP3.
  const TRACKS = {
    1: 'assets/audio/nivel1.mp3',
    2: 'assets/audio/nivel2.mp3',
    3: 'assets/audio/nivel3.mp3',
    4: 'assets/audio/nivel4.mp3',
    5: 'assets/audio/nivel5.mp3',
  };

  // ── AJUSTES ───────────────────────────────────────────────────────────────
  const FADE_OUT_MS  = 400;   // Duración del fade out al cambiar de nivel (ms)
  const FADE_IN_MS   = 1000;  // Duración del fade in al entrar (ms)
  const MAX_VOLUME   = 0.85;  // Volumen máximo (0.0 – 1.0)
  const FADE_STEPS   = 30;    // Pasos de interpolación del fade
  // ─────────────────────────────────────────────────────────────────────────

  // ── Arrancar el AudioContext con gesto del usuario ────────────────────────
  async function start() {
    // Con <audio> nativo no necesitamos Tone.js ni AudioContext manual.
    // Esta función se mantiene para compatibilidad con main.js existente.
  }

  // ── Cambiar nivel ─────────────────────────────────────────────────────────
  function setNivel(n) {
    if (n === currentN) return;
    currentN = n;

    const src = TRACKS[n];
    if (!src) return;

    if (audioEl && !audioEl.paused) {
      // Hay algo sonando: fade out → luego cargar nueva pista
      fadeOutAndThen(() => loadTrack(src));
    } else {
      // Sin audio previo: cargar directamente
      loadTrack(src);
    }
  }

  // ── Cargar y reproducir una pista ─────────────────────────────────────────
  function loadTrack(src) {
    // Detener y limpiar pista anterior
    if (audioEl) {
      audioEl.pause();
      audioEl.src = '';
      audioEl.remove();
    }
    if (fadeOut) { clearInterval(fadeOut); fadeOut = null; }

    audioEl         = new Audio(src);
    audioEl.loop    = true;
    audioEl.volume  = 0;                     // Empieza en 0 para hacer fade in
    audioEl.preload = 'auto';

    if (muted) {
      // Si está muteado: cargamos pero no reproducimos
      audioEl.volume = 0;
      audioEl.play().catch(() => {});
      audioEl.pause();
      return;
    }

    audioEl.play().then(() => {
      fadeIn();
    }).catch(() => {
      // Autoplay bloqueado por el navegador: se reproducirá en el próximo
      // setNivel() o cuando el usuario interactúe con el botón de sonido.
    });
  }

  // ── Fade in ───────────────────────────────────────────────────────────────
  function fadeIn() {
    if (!audioEl) return;
    const step     = MAX_VOLUME / FADE_STEPS;
    const interval = FADE_IN_MS / FADE_STEPS;

    const id = setInterval(() => {
      if (!audioEl) { clearInterval(id); return; }
      const next = Math.min(audioEl.volume + step, MAX_VOLUME);
      audioEl.volume = next;
      if (next >= MAX_VOLUME) clearInterval(id);
    }, interval);
  }

  // ── Fade out y callback ───────────────────────────────────────────────────
  function fadeOutAndThen(callback) {
    if (!audioEl) { callback(); return; }
    if (fadeOut) clearInterval(fadeOut);

    const startVol = audioEl.volume;
    const step     = startVol / FADE_STEPS;
    const interval = FADE_OUT_MS / FADE_STEPS;

    fadeOut = setInterval(() => {
      if (!audioEl) { clearInterval(fadeOut); fadeOut = null; callback(); return; }
      const next = Math.max(audioEl.volume - step, 0);
      audioEl.volume = next;
      if (next <= 0) {
        clearInterval(fadeOut);
        fadeOut = null;
        audioEl.pause();
        callback();
      }
    }, interval);
  }

  // ── Mute / Unmute ─────────────────────────────────────────────────────────
  function setMute(m) {
    muted = m;
    if (!audioEl) return;

    if (m) {
      // Fade out suave (sin callback: la pista sigue cargada, solo silenciada)
      fadeOutAndThen(() => {});
    } else {
      // Retomar reproducción con fade in
      if (audioEl.paused) {
        audioEl.play().then(() => fadeIn()).catch(() => {});
      } else {
        fadeIn();
      }
    }
  }

  function isMuted() { return muted; }

  return { start, setNivel, setMute, isMuted };
})();

window.AudioEngine = AudioEngine;