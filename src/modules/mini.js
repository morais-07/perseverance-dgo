// Mini viewers 3D (um por subsistema). Só um contexto WebGL fica ativo de cada vez.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { buildRover, createStage, loadRoverModel } from '../lib/rover.js';
import { asset, exists, hasWebGL, reducedMotion } from '../lib/util.js';

let active = null; // { stop() }

async function loadOwnModel(id) {
  const file = `models/subsistemas/${id}.glb`;
  if (!(await exists(file))) return null;
  const draco = new DRACOLoader().setDecoderPath(asset('draco/'));
  const gltf = await new GLTFLoader().setDRACOLoader(draco).setMeshoptDecoder(MeshoptDecoder).loadAsync(asset(file));
  draco.dispose();
  const g = gltf.scene;
  const box = new THREE.Box3().setFromObject(g);
  const size = box.getSize(new THREE.Vector3());
  g.scale.setScalar(3 / Math.max(size.x, size.y, size.z));
  const box2 = new THREE.Box3().setFromObject(g);
  g.position.sub(box2.getCenter(new THREE.Vector3()));
  const pivot = new THREE.Group();
  pivot.add(g);
  return pivot;
}

export function initMinis(root = document) {
  const webgl = hasWebGL();
  root.querySelectorAll('.mini').forEach((el) => {
    const id = el.dataset.sub;
    const canvasHost = el;
    const msg = el.querySelector('.mini-load .m');
    let model = null; // { object, frame:{ dist, center } }
    let live = null;

    if (!webgl) {
      msg.textContent = 'WebGL indisponível neste dispositivo';
      el.querySelector('.mini-load button')?.remove();
      return;
    }

    const prepare = async () => {
      if (model) return model;
      msg.textContent = 'A carregar modelo…';
      const own = await loadOwnModel(id);
      if (own) {
        model = { object: own, frame: { center: new THREE.Vector3(), size: 3 }, own: true };
      } else {
        const { gltf } = await loadRoverModel();
        const rover = buildRover(gltf);
        if (!rover.hasNodes(id)) throw new Error('sem nós para ' + id);
        rover.setView({ selected: id, isolate: true });
        const box = rover.boxOf(id);
        model = { object: rover.pivot, rover, frame: { center: box.getCenter(new THREE.Vector3()), size: box.getSize(new THREE.Vector3()).length() } };
      }
      return model;
    };

    const start = async () => {
      if (live) return;
      active?.stop();
      let m;
      try {
        m = await prepare();
      } catch (err) {
        console.warn('[mini]', err);
        msg.textContent = '[A CONFIRMAR] modelo do subsistema indisponível';
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.setAttribute('aria-label', 'Visualizador 3D interativo: arrastar para rodar, rolar para ampliar.');
      canvas.tabIndex = 0;
      canvasHost.prepend(canvas);
      const stage = createStage(canvas, { floor: false, fov: 30 });
      stage.scene.add(m.object);
      const dist = (m.frame.size / 2) / Math.tan((30 * Math.PI) / 360) * 0.92;
      stage.camera.position.copy(m.frame.center).add(new THREE.Vector3(0.7, 0.45, 0.9).normalize().multiplyScalar(dist));
      const controls = new OrbitControls(stage.camera, canvas);
      controls.target.copy(m.frame.center);
      controls.enableDamping = true;
      controls.enablePan = false;
      controls.autoRotate = !reducedMotion();
      controls.autoRotateSpeed = 1.6;
      controls.minDistance = dist * 0.4;
      controls.maxDistance = dist * 2.5;
      controls.addEventListener('start', () => (controls.autoRotate = false));
      canvas.addEventListener('keydown', (e) => {
        if (e.key === '+' || e.key === '=') stage.camera.position.lerp(m.frame.center, 0.12);
        if (e.key === '-') stage.camera.position.lerp(m.frame.center, -0.12);
      });
      let raf = 0;
      const tick = () => {
        raf = requestAnimationFrame(tick);
        controls.update();
        stage.render();
      };
      tick();
      el.classList.add('live');
      const me = {
        stop() {
          cancelAnimationFrame(raf);
          controls.dispose();
          stage.scene.remove(m.object);
          stage.dispose();
          canvas.remove();
          el.classList.remove('live');
          live = null;
          if (active === me) active = null;
        },
      };
      live = me;
      active = me;
    };

    el.querySelector('.mini-load button').addEventListener('click', start);
    new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && e.intersectionRatio > 0.5) start();
        else if (!e.isIntersecting && live) live.stop();
      },
      { threshold: [0, 0.5] },
    ).observe(el);
  });
}
