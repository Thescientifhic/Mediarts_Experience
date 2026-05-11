// main.js — Orquestador principal

const App = (() => {
  let currentNivel  = null;
  let audioStarted  = false;

  function init() {
    BgCanvas.init();
    Particles.init();
    Scene3D.init();
    Character.init();
    UI.init();

    const params      = new URLSearchParams(window.location.search);
    const nivelParam  = parseInt(params.get('nivel'));
    const nivelInicio = (nivelParam >= 1 && nivelParam <= 5) ? nivelParam : 1;

    setNivel(nivelInicio);

    window.App = { setNivel };

    // ── Arrancar audio en el primer gesto del usuario ──────────────────────
    // La API de audio del navegador requiere interacción antes de reproducir.
    // Capturamos cualquier click/tap en la página para desbloquearlo.
    const unlockAudio = async () => {
      if (audioStarted) return;
      audioStarted = true;
      await AudioEngine.start();
      // Re-aplicar el nivel actual para que la pista empiece a sonar
      AudioEngine.setNivel(currentNivel);
      document.removeEventListener('click',     unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown',    unlockAudio);
    };

    document.addEventListener('click',      unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('keydown',    unlockAudio, { once: true });
  }

  function setNivel(n) {
    if (n === currentNivel) return;
    if (n < 1 || n > 5)    return;

    currentNivel = n;

    BgCanvas.setNivel(n);
    Particles.setNivel(n);
    Scene3D.setNivel(n);
    Character.setNivel(n);
    UI.setNivel(n);

    // Solo llamar al audio si ya fue desbloqueado por el usuario
    if (audioStarted) AudioEngine.setNivel(n);

    const url = new URL(window.location.href);
    url.searchParams.set('nivel', n);
    window.history.replaceState({}, '', url);
  }

  document.addEventListener('keydown', e => {
    const n = parseInt(e.key);
    if (n >= 1 && n <= 5) setNivel(n);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { setNivel };
})();