// bgCanvas.js — Campo de color generativo (plasma + ondas)

const BgCanvas = (() => {
  let canvas, ctx, W, H;
  let t = 0;
  let cfg = null;
  let animId = null;
  let targetCfg = null;
  let blendAmt = 1.0;

  function init() {
    canvas = document.getElementById('bg-canvas');
    ctx    = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    loop();
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function setNivel(n) {
    targetCfg = window.NIVELES[n];
    if (!cfg) { cfg = targetCfg; blendAmt = 1.0; }
    else blendAmt = 0.0;
  }

  function lerp(a, b, f) { return a + (b - a) * f; }

  function plasma(x, y, time, complexity) {
    let v = 0;
    // capas de plasma — más capas = más caótico
    v += Math.sin(x / 80 + time);
    v += Math.sin(y / 60 - time * 0.7);
    v += Math.sin((x + y) / 70 + time * 0.5);
    if (complexity > 4) {
      v += Math.sin(Math.sqrt((x - W/2)**2 + (y - H/2)**2) / 55 - time * 0.8);
    }
    if (complexity > 7) {
      v += Math.sin(x / 30 * Math.cos(time * 0.3) + y / 40 * Math.sin(time * 0.25));
    }
    if (complexity > 10) {
      v += Math.sin((x * y) / (W * H) * complexity * 40 + time * 1.2);
      v += Math.cos(x / 20 - y / 25 + time * 1.5) * 0.5;
    }
    return v;
  }

  function loop() {
    if (!cfg) { animId = requestAnimationFrame(loop); return; }

    // blend entre configuraciones
    if (blendAmt < 1.0) blendAmt = Math.min(1.0, blendAmt + 0.012);
    const c = blendAmt >= 1.0 ? targetCfg : cfg;
    if (blendAmt >= 1.0) cfg = targetCfg;

    t += c.bg_speed * 60;

    // resolución reducida para performance
    const scale = 3;
    const sW = Math.floor(W / scale);
    const sH = Math.floor(H / scale);

    const imageData = ctx.createImageData(sW, sH);
    const data      = imageData.data;

    const hBase  = c.bg_hue_base;
    const hRange = c.bg_hue_range;
    const comp   = c.bg_complexity;

    for (let py = 0; py < sH; py++) {
      for (let px = 0; px < sW; px++) {
        const x = px * scale;
        const y = py * scale;

        const v   = plasma(x, y, t, comp);
        const vN  = (v / (comp * 0.6) + 1) / 2; // normalizar 0–1
        const hue = hBase + vN * hRange * 2 - hRange;
        const sat = 60 + vN * 35;
        const lit = 4 + vN * 14; // bajo para mantener oscuro

        // hsl → rgb inline
        const h1 = ((hue % 360) + 360) % 360;
        const s1 = sat / 100;
        const l1 = lit / 100;
        const a  = s1 * Math.min(l1, 1 - l1);
        const f  = (n) => {
          const k = (n + h1 / 30) % 12;
          return l1 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
        };

        const idx = (py * sW + px) * 4;
        data[idx]     = Math.round(f(0)  * 255);
        data[idx + 1] = Math.round(f(8)  * 255);
        data[idx + 2] = Math.round(f(4)  * 255);
        data[idx + 3] = 255;
      }
    }

    // dibujar imagen escalada
    const offscreen = document.createElement('canvas');
    offscreen.width  = sW;
    offscreen.height = sH;
    offscreen.getContext('2d').putImageData(imageData, 0, 0);

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'medium';
    ctx.drawImage(offscreen, 0, 0, W, H);
    ctx.restore();

    // vignette
    const grad = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, H*0.9);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.75)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    animId = requestAnimationFrame(loop);
  }

  return { init, setNivel };
})();

window.BgCanvas = BgCanvas;
