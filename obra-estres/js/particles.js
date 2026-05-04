// particles.js — Sistema de partículas reactivo al nivel

const Particles = (() => {
  let canvas, ctx, W, H;
  let particles = [];
  let cfg = null;
  let targetCount = 0;
  let animId = null;

  function init() {
    canvas = document.getElementById('particle-canvas');
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
    cfg         = window.NIVELES[n];
    targetCount = cfg.particle_count;
    // ajustar comportamiento de partículas existentes
    particles.forEach(p => applyBehavior(p, cfg));
  }

  function applyBehavior(p, c) {
    p.targetSpeed  = c.particle_speed * (0.5 + Math.random());
    p.targetSize   = c.particle_size  * (0.5 + Math.random() * 1.5);
    p.color        = c.particle_color;
    // patrones de movimiento distintos por nivel
    const n = Object.values(window.NIVELES).findIndex(v => v === c) + 1;
    p.chaos        = n * 0.0004;
  }

  function createParticle(c) {
    const n = Object.values(window.NIVELES).findIndex(v => v === c) + 1;
    const p = {
      x:     Math.random() * W,
      y:     Math.random() * H,
      vx:    (Math.random() - 0.5) * 0.6,
      vy:    (Math.random() - 0.5) * 0.6,
      size:  c.particle_size * (0.5 + Math.random() * 1.5),
      targetSize: c.particle_size,
      speed: c.particle_speed,
      targetSpeed: c.particle_speed,
      color: c.particle_color,
      alpha: Math.random(),
      alphaDir: Math.random() > 0.5 ? 1 : -1,
      angle: Math.random() * Math.PI * 2,
      chaos: n * 0.0004,
      life:  0,
    };
    return p;
  }

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `${r},${g},${b}`;
  }

  function loop() {
    if (!cfg) { animId = requestAnimationFrame(loop); return; }

    ctx.clearRect(0, 0, W, H);

    // agregar / remover partículas gradualmente
    if (particles.length < targetCount && Math.random() < 0.3) {
      particles.push(createParticle(cfg));
    }
    if (particles.length > targetCount && Math.random() < 0.05) {
      particles.splice(Math.floor(Math.random() * particles.length), 1);
    }

    const rgb = hexToRgb(cfg.particle_color);

    particles.forEach(p => {
      p.life++;

      // interpolar hacia targetSpeed
      p.speed += (p.targetSpeed - p.speed) * 0.02;
      p.size  += (p.targetSize  - p.size)  * 0.04;

      // movimiento: fluido en N1, caótico en N5
      p.angle += (Math.random() - 0.5) * p.chaos * 60;
      p.vx    += Math.cos(p.angle) * p.speed * 0.1;
      p.vy    += Math.sin(p.angle) * p.speed * 0.1;

      // fricción
      const friction = 0.97;
      p.vx *= friction;
      p.vy *= friction;

      p.x += p.vx;
      p.y += p.vy;

      // parpadeo de alpha
      p.alpha += p.alphaDir * 0.004;
      if (p.alpha >= 1)    { p.alpha = 1; p.alphaDir = -1; }
      if (p.alpha <= 0.05) { p.alpha = 0.05; p.alphaDir = 1; }

      // wrap bordes
      if (p.x < -5)  p.x = W + 5;
      if (p.x > W+5) p.x = -5;
      if (p.y < -5)  p.y = H + 5;
      if (p.y > H+5) p.y = -5;

      // dibujar
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.1, p.size), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb},${p.alpha * 0.7})`;
      ctx.fill();

      // halos tenues en N4–N5
      if (p.chaos > 0.001) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${p.alpha * 0.04})`;
        ctx.fill();
      }
    });

    // líneas de conexión (N3+, sólo entre partículas cercanas)
    if (cfg.particle_count >= 340) {
      const maxDist = 80;
      ctx.lineWidth = 0.3;
      for (let i = 0; i < particles.length; i += 2) {
        for (let j = i + 2; j < particles.length; j += 2) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < maxDist) {
            const a = (1 - dist / maxDist) * 0.2;
            ctx.strokeStyle = `rgba(${rgb},${a})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    animId = requestAnimationFrame(loop);
  }

  return { init, setNivel };
})();

window.Particles = Particles;
