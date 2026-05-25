// survey.js — Controlador de pantallas y flujo de la encuesta

const Survey = (() => {
  let currentQ    = 0;
  let respuestas  = [];
  let nivelFinal  = null;

  // ── Referencias DOM ───────────────────────────────────────────
  const screens = {
    welcome: () => document.getElementById('screen-welcome'),
    survey:  () => document.getElementById('screen-survey'),
    result:  () => document.getElementById('screen-result'),
  };

  // ── Init ──────────────────────────────────────────────────────
  function init() {
    document.getElementById('btn-start').addEventListener('click', startSurvey);
    document.getElementById('btn-restart').addEventListener('click', restart);
    showScreen('welcome');
  }

  // ── Navegación de pantallas ───────────────────────────────────
  function showScreen(name) {
    Object.values(screens).forEach(fn => {
      const el = fn();
      if (el) el.classList.remove('active');
    });
    const target = screens[name]();
    if (target) {
      setTimeout(() => target.classList.add('active'), 30);
    }
  }

  // ── Encuesta ──────────────────────────────────────────────────
  function startSurvey() {
    currentQ   = 0;
    respuestas = [];
    showScreen('survey');
    setTimeout(() => renderQuestion(), 200);
  }

  function renderQuestion() {
    const q      = window.SURVEY_QUESTIONS[currentQ];
    const total  = window.SURVEY_QUESTIONS.length;
    const pct    = Math.round((currentQ / total) * 100);

    // Progreso
    document.getElementById('progress-bar').style.width = pct + '%';
    document.getElementById('progress-label').textContent =
      `${currentQ + 1} / ${total}`;

    // Pregunta con fade
    const qText = document.getElementById('question-text');
    qText.style.opacity = '0';
    qText.style.transform = 'translateY(12px)';

    setTimeout(() => {
      qText.textContent = q.pregunta;
      qText.style.opacity = '1';
      qText.style.transform = 'translateY(0)';
    }, 180);

    // Opciones
    const optContainer = document.getElementById('options-container');
    optContainer.innerHTML = '';
    optContainer.style.opacity = '0';

    setTimeout(() => {
      q.opciones.forEach((op, i) => {
        const btn = document.createElement('button');
        btn.className    = 'option-btn';
        btn.textContent  = op.texto;
        btn.style.animationDelay = (i * 0.08) + 's';
        btn.addEventListener('click', () => selectOption(op.peso, btn));
        optContainer.appendChild(btn);
      });
      optContainer.style.opacity = '1';
    }, 280);
  }

  function selectOption(peso, btnEl) {
    // Feedback visual
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btnEl.classList.add('selected');

    setTimeout(() => {
      respuestas.push(peso);
      currentQ++;

      if (currentQ < window.SURVEY_QUESTIONS.length) {
        renderQuestion();
      } else {
        finalizarEncuesta();
      }
    }, 380);
  }

  // ── Resultado ─────────────────────────────────────────────────
  function finalizarEncuesta() {
    nivelFinal = window.calcularNivel(respuestas);
    const content = window.RESULTS_CONTENT[nivelFinal];
    const cfg     = window.NIVELES[nivelFinal];

    // Poblar textos
    document.getElementById('result-titulo').textContent    = content.titulo;
    document.getElementById('result-subtitulo').textContent = content.subtitulo;

    // Frases
    const frasesEl = document.getElementById('result-frases');
    frasesEl.innerHTML = content.frases
      .map(f => `<p class="result-frase">${f}</p>`)
      .join('');

    // Consejos
    const consejosEl = document.getElementById('result-consejos');
    consejosEl.innerHTML = content.consejos
      .map(c => `<li>${c}</li>`)
      .join('');

    // Color accent del nivel
    document.documentElement.style.setProperty('--color-accent', cfg.color_accent);
    document.getElementById('result-titulo').style.color = cfg.color_accent;
    document.getElementById('result-nivel-num').textContent = `NIVEL ${nivelFinal}`;
    document.getElementById('result-nivel-num').style.color = cfg.color_accent;

    // Mostrar pantalla resultado
    showScreen('result');

    // Activar la experiencia visual y sonora
    setTimeout(() => {
      window.App && window.App.setNivel(nivelFinal);
      // Mostrar los canvases de fondo
      document.getElementById('bg-canvas').style.opacity       = '1';
      document.getElementById('particle-canvas').style.opacity = '1';
      document.getElementById('scene-container').style.opacity = '1';
    }, 600);
  }

  function restart() {
    // Ocultar canvases
    document.getElementById('bg-canvas').style.opacity       = '0';
    document.getElementById('particle-canvas').style.opacity = '0';
    document.getElementById('scene-container').style.opacity = '0';

    // Resetear accent
    document.documentElement.style.setProperty('--color-accent', '#7ecfb3');

    showScreen('welcome');
  }

  return { init };
})();

window.Survey = Survey;
