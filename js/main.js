// main.js — Orquestador principal (modo encuesta)

const App = (() => {
  let currentNivel = null;

  function init() {
    // Inicializar capas de experiencia (en modo oculto)
    BgCanvas.init();
    Particles.init();
    Scene3D.init();
    Character.init();

    // Botón de audio
    const audioBtn = document.getElementById('audio-toggle');
    if (audioBtn) {
      audioBtn.addEventListener('click', async () => {
        await AudioEngine.start();
        const muted = AudioEngine.isMuted();
        AudioEngine.setMute(!muted);
        audioBtn.classList.toggle('muted', !muted);
      });
    }

    // Iniciar flujo de encuesta
    Survey.init();
  }

  function setNivel(n) {
    if (n === currentNivel) return;
    if (n < 1 || n > 5) return;
    currentNivel = n;

    BgCanvas.setNivel(n);
    Particles.setNivel(n);
    Scene3D.setNivel(n);
    Character.setNivel(n);
    AudioEngine.setNivel(n);
  }

  // Atajos de teclado para pruebas (1–5)
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

window.App = App;
