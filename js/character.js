// character.js — Reproduce el video del personaje solo si el archivo existe.
// Sin video → el personaje simplemente no aparece. Sin placeholders.
// Chromakey por software: elimina el fondo negro Y verde en tiempo real via canvas 2D.

let canvasEl, ctxCanvas;

const Character = (() => {
  let container, videoEl;
  let currentNivel = null;
  let animFrameId  = null;

  const VIDEO_SOURCES = {
    1: [
      { src: 'assets/characters/nivel1.webm', type: 'video/webm' },
      { src: 'assets/characters/nivel1.mp4',  type: 'video/mp4' },
    ],
    2: [
      { src: 'assets/characters/nivel2.webm', type: 'video/webm' },
      { src: 'assets/characters/nivel2.mp4',  type: 'video/mp4' },
    ],
    3: [
      { src: 'assets/characters/nivel3.webm', type: 'video/webm' },
      { src: 'assets/characters/nivel3.mp4',  type: 'video/mp4' },
    ],
    4: [
      { src: 'assets/characters/nivel4.webm', type: 'video/webm' },
      { src: 'assets/characters/nivel4.mp4',  type: 'video/mp4' },
    ],
    5: [
      { src: 'assets/characters/nivel5.webm', type: 'video/webm' },
      { src: 'assets/characters/nivel5.mp4',  type: 'video/mp4' },
    ],
  };

  // ── COLORES DE FONDO A ELIMINAR ──────────────────────────────────────────
  // Agrega aquí todos los colores que quieras eliminar.
  // Cada entrada: { r, g, b, tolerance }
  //   tolerance 0–255: qué tan parecido al color se elimina.
  //   Sube la tolerancia si quedan bordes residuales.
  //   Bájala si se come partes del personaje.
  const BG_COLORS = [
    { r: 0,   g: 0,   b: 0,   tolerance: 80  },  // Negro
    { r: 0,   g: 255, b: 0,   tolerance: 100 },  // Verde croma #0B9226
  ];
  // ─────────────────────────────────────────────────────────────────────────

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    container = document.createElement('div');
    container.id = 'character-container';
    container.style.opacity = '0';
    document.body.appendChild(container);

    // El video se mantiene oculto; el canvas es lo que se muestra
    videoEl = document.createElement('video');
    videoEl.muted       = true;
    videoEl.loop        = true;
    videoEl.playsInline = true;
    videoEl.style.display = 'none';
    container.appendChild(videoEl);
  }

  // ── Cambiar nivel ─────────────────────────────────────────────────────────
  function setNivel(n) {
    currentNivel = n;
    container.style.opacity = '0';

    // Detener loop de dibujo anterior
    if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }

    // Limpiar canvas anterior si existe
    if (canvasEl) { canvasEl.remove(); canvasEl = null; ctxCanvas = null; }

    videoEl.pause();
    setTimeout(() => tryLoadVideo(n), 350);
  }

  // ── Carga el video probando cada source en orden ──────────────────────────
  async function tryLoadVideo(n) {
    const sources = VIDEO_SOURCES[n];
    if (!sources) return;

    const validSrc = await findFirstValid(sources);
    if (!validSrc) { hideCharacter(); return; }

    // Video limpio
    const newVideo = document.createElement('video');
    newVideo.muted        = true;
    newVideo.loop         = true;
    newVideo.playsInline  = true;
    newVideo.crossOrigin  = 'anonymous';
    newVideo.style.display = 'none';

    sources.forEach(s => {
      const sourceEl = document.createElement('source');
      sourceEl.src  = s.src;
      sourceEl.type = s.type;
      newVideo.appendChild(sourceEl);
    });

    container.replaceChild(newVideo, videoEl);
    videoEl = newVideo;

    // Canvas de salida (lo que el usuario ve)
    canvasEl = document.createElement('canvas');
    canvasEl.style.width      = '100%';
    canvasEl.style.height     = '100%';
    canvasEl.style.objectFit  = 'contain';
    canvasEl.style.opacity    = '0';
    canvasEl.style.transition = 'opacity 0.5s ease';
    ctxCanvas = canvasEl.getContext('2d', { willReadFrequently: true });
    container.appendChild(canvasEl);

    videoEl.addEventListener('playing', () => {
      const w = videoEl.videoWidth;
      const h = videoEl.videoHeight;
      canvasEl.width  = w;
      canvasEl.height = h;

      container.style.opacity  = '1';
      canvasEl.style.opacity   = '1';

      drawFrame(w, h);
    }, { once: true });

    videoEl.addEventListener('error', () => hideCharacter(), { once: true });

    videoEl.load();
    videoEl.play().catch(() => hideCharacter());
  }

  // ── Loop de dibujo con chromakey multi-color ──────────────────────────────
  function drawFrame(w, h) {
    if (!videoEl || videoEl.paused || videoEl.ended) {
      animFrameId = requestAnimationFrame(() => drawFrame(w, h));
      return;
    }

    ctxCanvas.drawImage(videoEl, 0, 0, w, h);

    const imageData = ctxCanvas.getImageData(0, 0, w, h);
    const data      = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Recorrer todos los colores de fondo definidos
      for (const bg of BG_COLORS) {
        const dist = Math.sqrt(
          (r - bg.r) ** 2 +
          (g - bg.g) ** 2 +
          (b - bg.b) ** 2
        );

        if (dist < bg.tolerance) {
          // Borde suave: zona interior → opacidad 0, zona de borde → fade gradual
          const half = bg.tolerance * 0.5;
          data[i + 3] = dist < half
            ? 0
            : Math.round(((dist - half) / half) * 255);
          break; // Ya procesamos este pixel, pasar al siguiente
        }
      }
    }

    ctxCanvas.putImageData(imageData, 0, 0);
    animFrameId = requestAnimationFrame(() => drawFrame(w, h));
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function hideCharacter() {
    container.style.opacity = '0';
    if (canvasEl) canvasEl.style.opacity = '0';
  }

  async function findFirstValid(sources) {
    for (const s of sources) {
      try {
        const res = await fetch(s.src, { method: 'HEAD' });
        if (res.ok) return s.src;
      } catch (_) { /* siguiente */ }
    }
    return null;
  }

  return { init, setNivel };
})();

window.Character = Character;