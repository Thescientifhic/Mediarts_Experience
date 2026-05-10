// scene3d.js — Escena Three.js con geometría procedural reactiva

const Scene3D = (() => {
  let renderer, scene, camera;
  let mesh, wireMesh;
  let cfg = null;
  let animId = null;
  let t = 0;
  let targetColor = new THREE.Color();
  let currentColor = new THREE.Color();

  // posiciones originales del icosaedro (para distorsión)
  let basePositions = null;

  function init() {
    const container = document.getElementById('scene-container');

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 4.5);

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xffffff, 1.5, 20);
    pointLight1.position.set(4, 4, 4);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8844cc, 0.8, 15);
    pointLight2.position.set(-3, -2, 3);
    scene.add(pointLight2);

    // Geometría: IcosahedronGeometry subdividida (detail=4 para más vértices)
    const geo = new THREE.IcosahedronGeometry(1.6, 5);

    // Guardar posiciones base para distorsión
    basePositions = new Float32Array(geo.attributes.position.array);

    // Material principal
    const mat = new THREE.MeshPhongMaterial({
      color:        0x4fc0a0,
      emissive:     0x112233,
      shininess:    80,
      specular:     0x88ccff,
      transparent:  true,
      opacity:      0.2,
      side:         THREE.DoubleSide,
    });

    mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    // Wireframe secundario
    const wireGeo = new THREE.IcosahedronGeometry(1.65, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color:       0xffffff,
      wireframe:   true,
      transparent: true,
      opacity:     0.08,
    });
    wireMesh = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireMesh);

    // Resize
    window.addEventListener('resize', onResize);

    loop();
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function setNivel(n) {
    cfg = window.NIVELES[n];
    targetColor.setHex(cfg.mesh_color);
    // wireframe visible sólo en nivel 4–5
    wireMesh.material.opacity   = n >= 4 ? 0.25 : 0.06;
    wireMesh.material.wireframe = true;
  }

  function distort(posArr, base, amount, time, speed) {
    for (let i = 0; i < posArr.length; i += 3) {
      const bx = base[i];
      const by = base[i + 1];
      const bz = base[i + 2];

      // ruido procedural simple (suma de senos)
      const noise =
        Math.sin(bx * 2.5 + time * 1.1) * Math.cos(by * 2.5 + time * 0.7) +
        Math.sin(bz * 3.0 + time * 0.9) * Math.cos(bx * 2.0 + time * 1.3) +
        Math.sin((bx + by + bz) * 1.8 + time * 0.8);

      posArr[i]     = bx + noise * amount;
      posArr[i + 1] = by + noise * amount * 0.9;
      posArr[i + 2] = bz + noise * amount * 1.1;
    }
  }

  function loop() {
    animId = requestAnimationFrame(loop);
    if (!cfg) return;

    t += cfg.mesh_speed * 60;

    // rotación suave — más rápida a mayor nivel
    mesh.rotation.x += cfg.mesh_speed * 0.4;
    mesh.rotation.y += cfg.mesh_speed * 0.7;
    mesh.rotation.z += cfg.mesh_speed * 0.15;
    wireMesh.rotation.copy(mesh.rotation);
    wireMesh.rotation.y -= cfg.mesh_speed * 0.3;

    // escala con pulso
    const pulse  = 1 + Math.sin(t * 0.8) * 0.04 * (1 + cfg.mesh_distort);
    const target = cfg.mesh_scale * pulse;
    mesh.scale.lerp(new THREE.Vector3(target, target, target), 0.05);
    wireMesh.scale.copy(mesh.scale);

    // distorsión de vértices
    const posArr = mesh.geometry.attributes.position.array;
    distort(posArr, basePositions, cfg.mesh_distort, t, cfg.mesh_speed);
    mesh.geometry.attributes.position.needsUpdate = true;
    mesh.geometry.computeVertexNormals();

    // color interpolado
    currentColor.lerp(targetColor, 0.025);
    mesh.material.color.copy(currentColor);
    mesh.material.emissive.setRGB(
      currentColor.r * 0.02,
      currentColor.g * 0.02,
      currentColor.b * 0.02
    );

    // wireframe opacity según nivel
    const wTarget = cfg.mesh_distort > 0.5 ? 0.22 : 0.07;
    wireMesh.material.opacity += (wTarget - wireMesh.material.opacity) * 0.03;

    renderer.render(scene, camera);
  }

  return { init, setNivel };
})();

window.Scene3D = Scene3D;
