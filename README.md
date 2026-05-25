# Niveles de Estrés — Instalación Media Arts

Experiencia web interactiva que representa las emociones asociadas a distintos niveles de estrés mediante modelado 3D generativo, campo de color procedural y paisajes sonoros reactivos.

---

## Estructura del proyecto

```
obra-estres/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── config.js        ← Paletas, audio y comportamiento por nivel
│   ├── audioEngine.js   ← Sonido generativo con Tone.js
│   ├── bgCanvas.js      ← Campo de color plasma (canvas 2D)
│   ├── particles.js     ← Sistema de partículas reactivo
│   ├── scene3d.js       ← Modelo 3D con Three.js
│   ├── ui.js            ← Panel de info + generador de QR
│   └── main.js          ← Orquestador principal
└── README.md
```

---

## Prueba local

Necesitas un servidor HTTP local (los navegadores bloquean ES modules desde `file://`).

**Opción A — Python (sin instalar nada extra):**
```bash
cd obra-estres
python3 -m http.server 8080
# Abrir: http://localhost:8080
```

**Opción B — Node.js:**
```bash
npx serve obra-estres
```

**Opción C — VS Code:**
Instala la extensión "Live Server" y haz clic en "Go Live".

---

## Uso

| Acción | Resultado |
|--------|-----------|
| Botones 1–5 en pantalla | Cambia el nivel de estrés |
| Teclas `1` a `5` | Atajos de teclado |
| URL `?nivel=3` | Carga directa del nivel 3 |
| Botón 🔊 | Activa/silencia el audio |
| Botón `QR` | Genera los 5 QR imprimibles |

---

## Despliegue en GitHub Pages (gratis)

1. Crea un repositorio en GitHub (puede ser privado en plan gratuito, pero Pages requiere público o Pro)
2. Sube todos los archivos:
   ```bash
   git init
   git add .
   git commit -m "instalación media arts"
   git remote add origin https://github.com/TU_USUARIO/obra-estres.git
   git push -u origin main
   ```
3. Ve a **Settings → Pages → Source: Deploy from branch → main / (root)**
4. En ~2 minutos el sitio estará en:
   `https://TU_USUARIO.github.io/obra-estres/`

Los QR deben apuntar a esa URL. Puedes generarlos directamente desde el botón QR de la interfaz.

---

## Personalización

Todo el comportamiento emocional vive en `js/config.js`. Cada nivel tiene:

- **Colores** (`color_bg`, `color_accent`, `color_fog`)
- **Geometría 3D** (`mesh_speed`, `mesh_distort`, `wireframe`)
- **Partículas** (`particle_count`, `particle_speed`, `particle_size`)
- **Plasma de fondo** (`bg_hue_base`, `bg_complexity`, `bg_speed`)
- **Audio** (`audio_synth`, `audio_base_hz`, `audio_reverb`)

No necesitas tocar ningún otro archivo para cambiar la experiencia sensorial.

---

## Tecnologías

- [Three.js r128](https://threejs.org/) — renderizado 3D WebGL
- [Tone.js 14](https://tonejs.github.io/) — síntesis de audio generativo
- [qrcode.js](https://github.com/soldair/node-qrcode) — generación de QR en canvas
- Canvas 2D nativo — plasma de color procedural
- Web Audio API — motor de audio subyacente

Sin dependencias de build. Funciona directamente en el navegador.

---

## Requisitos del navegador

Chrome 90+, Firefox 88+, Safari 15+, Edge 90+.  
Requiere interacción del usuario para iniciar el audio (política del navegador).
