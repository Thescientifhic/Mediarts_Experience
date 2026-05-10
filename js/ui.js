// ui.js — Panel de información, botones y generador de QR

const UI = (() => {
  let currentNivel = null;

  function init() {
    // Botones de nivel
    document.querySelectorAll('.nivel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const n = parseInt(btn.dataset.nivel);
        window.App && window.App.setNivel(n);
      });
    });

    // Botón de audio
    const audioBtn = document.getElementById('audio-toggle');
    audioBtn.addEventListener('click', async () => {
      await AudioEngine.start();
      const muted = AudioEngine.isMuted();
      AudioEngine.setMute(!muted);
      audioBtn.classList.toggle('muted', !muted);
    });


    // Flash de transición
    const flash = document.createElement('div');
    flash.id = 'transition-flash';
    document.body.appendChild(flash);
  }

  function setNivel(n) {
    currentNivel = n;
    const cfg = window.NIVELES[n];
    if (!cfg) return;

    // Actualizar CSS vars
    document.documentElement.style.setProperty('--color-accent', cfg.color_accent);
    document.documentElement.style.setProperty('--color-bg',     cfg.color_bg);

    // Panel de info
    const nombre = document.getElementById('nivel-nombre');
    const desc   = document.getElementById('nivel-desc');
    const estado = document.getElementById('nivel-estado');

    nombre.style.opacity = '0';
    desc.style.opacity   = '0';

    setTimeout(() => {
      nombre.textContent = cfg.nombre;
      desc.textContent   = cfg.desc;
      estado.textContent = `↳ ${cfg.estado}`;
      nombre.style.color   = cfg.color_accent;
      estado.style.color   = cfg.color_accent;
      nombre.style.opacity = '1';
      desc.style.opacity   = '1';
    }, 200);

    // Botones activos
    document.querySelectorAll('.nivel-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.nivel) === n);
    });

    // Flash de transición
    const flash = document.getElementById('transition-flash');
    if (flash) {
      flash.style.background = cfg.color_accent + '18';
      flash.classList.add('flash');
      setTimeout(() => flash.classList.remove('flash'), 16);
    }
  }

  function buildQRGrid() {
    const grid    = document.getElementById('qr-grid');
    const baseUrl = window.location.origin + window.location.pathname;
    grid.innerHTML = '';

    Object.entries(window.NIVELES).forEach(([n, cfg]) => {
      const url = `${baseUrl}?nivel=${n}`;

      const item  = document.createElement('div');
      item.className = 'qr-item';

      const qrCanvas = document.createElement('canvas');
      QRCode.toCanvas(qrCanvas, url, {
        width:          120,
        margin:         1,
        color: {
          dark:  cfg.color_accent,
          light: '#080810',
        },
      });

      const label = document.createElement('p');
      label.className = 'qr-label';
      label.textContent = `N${n} — ${cfg.nombre}`;

      const urlLabel = document.createElement('p');
      urlLabel.className = 'qr-label';
      urlLabel.style.fontSize = '0.45rem';
      urlLabel.style.wordBreak = 'break-all';
      urlLabel.style.opacity = '0.45';
      urlLabel.textContent = url;

      item.appendChild(qrCanvas);
      item.appendChild(label);
      item.appendChild(urlLabel);
      grid.appendChild(item);
    });
  }

  return { init, setNivel };
})();

window.UI = UI;
