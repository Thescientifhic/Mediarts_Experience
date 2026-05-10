// main.js — Orquestador principal

const App = (() => {
  let currentNivel = null;

  function init() {
    // Inicializar todos los módulos
    BgCanvas.init();
    Particles.init();
    Scene3D.init();
    Character.init();
    UI.init();

    // Leer ?nivel= de la URL
    const params = new URLSearchParams(window.location.search);
    const nivelParam = parseInt(params.get('nivel'));
    const nivelInicio = (nivelParam >= 1 && nivelParam <= 5) ? nivelParam : 1;

    // Aplicar nivel inicial
    setNivel(nivelInicio);

    // Exponer globalmente para los botones de UI
    window.App = { setNivel };
  }

  function setNivel(n) {
    if (n === currentNivel) return;
    if (n < 1 || n > 5) return;

    currentNivel = n;

    // Orquestar los tres canales
    BgCanvas.setNivel(n);
    Particles.setNivel(n);
    Scene3D.setNivel(n);
    Character.setNivel(n);
    UI.setNivel(n);

    // Audio: iniciar en primer interacción del usuario
    AudioEngine.setNivel(n);

    // Actualizar URL sin recargar (útil para compartir el estado)
    const url = new URL(window.location.href);
    url.searchParams.set('nivel', n);
    window.history.replaceState({}, '', url);
  }

  // Atajos de teclado: 1–5 para cambiar nivel
  document.addEventListener('keydown', e => {
    const n = parseInt(e.key);
    if (n >= 1 && n <= 5) setNivel(n);
  });

  // Iniciar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { setNivel };
})();
