// Carregamento do modelo GLB (uma única vez), divisão por subsistemas, vista explodida e palco 3D partilhado.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import cfg from '../content/subsistemas.json';
import { asset, exists } from './util.js';

export const SUBS = cfg.subsistemas;
const ALL = [...cfg.subsistemas, ...cfg.extras];
export const NORM_SIZE = 3; // o rover é normalizado para ~3 unidades (≈ 3 m)

/* ───────── Carregamento ───────── */
let modelPromise = null;
const listeners = new Set();
let progress = 0;

export function onModelProgress(fn) {
  listeners.add(fn);
  fn(progress);
  return () => listeners.delete(fn);
}

/** Usa o modelo final (public/models/perseverance_dgo.glb) se existir; senão o provisório da NASA. */
export function loadRoverModel() {
  if (modelPromise) return modelPromise;
  modelPromise = (async () => {
    const final = await exists(cfg.modeloFinal.ficheiro);
    const file = final ? cfg.modeloFinal.ficheiro : cfg.modeloProvisorio.ficheiro;
    const draco = new DRACOLoader().setDecoderPath(asset('draco/'));
    const loader = new GLTFLoader().setDRACOLoader(draco).setMeshoptDecoder(MeshoptDecoder);
    const gltf = await new Promise((res, rej) =>
      loader.load(
        asset(file),
        res,
        (e) => {
          progress = e.total ? e.loaded / e.total : Math.min(0.95, progress + 0.05);
          listeners.forEach((fn) => fn(progress));
        },
        rej,
      ),
    );
    draco.dispose();
    progress = 1;
    listeners.forEach((fn) => fn(1));
    // O modelo da equipa vem do Blender com a frente do rover em +X; o site espera a frente em +Z.
    if (final && cfg.modeloFinal.rotacaoY) gltf.scene.rotation.y = THREE.MathUtils.degToRad(cfg.modeloFinal.rotacaoY);
    return { gltf, provisional: !final };
  })();
  modelPromise.catch(() => (modelPromise = null));
  return modelPromise;
}

/* ───────── Subsistema de um nó ───────── */
function subOf(name) {
  const n = name.toLowerCase();
  for (const s of ALL) {
    if (n === s.id || n.startsWith(s.id + '_') || n.startsWith(s.id + '.') || n.startsWith(s.id + '-')) return s.id;
  }
  for (const s of ALL) if (s.nodesNasa?.includes(name)) return s.id;
  return 'chassis';
}

/* ───────── Construção do rover ───────── */
export function buildRover(gltf) {
  const model = cloneSkinned(gltf.scene);
  const groups = {};
  ALL.forEach((s) => {
    const g = new THREE.Group();
    g.name = s.id;
    groups[s.id] = g;
  });
  [...model.children].forEach((child) => groups[subOf(child.name)].add(child));
  Object.values(groups).forEach((g) => model.add(g));

  // Clonar materiais para este viewer (dimming/destaque independentes entre viewers).
  model.traverse((o) => {
    if (!o.isMesh) return;
    const clone = (m) => {
      const c = m.clone();
      c.userData.base = { opacity: c.opacity, transparent: c.transparent, depthWrite: c.depthWrite, emissive: c.emissive ? c.emissive.getHex() : 0, ei: c.emissiveIntensity ?? 1 };
      return c;
    };
    o.material = Array.isArray(o.material) ? o.material.map(clone) : clone(o.material);
    o.frustumCulled = false; // meshes com armadura/skin
  });

  // Normalizar escala (CAD exportado costuma estar em mm) e centrar à volta da origem.
  model.updateMatrixWorld(true);
  const box0 = new THREE.Box3().setFromObject(model);
  const size0 = box0.getSize(new THREE.Vector3());
  const k = NORM_SIZE / Math.max(size0.x, size0.y, size0.z);
  model.scale.setScalar(k);
  const pivot = new THREE.Group();
  pivot.add(model);
  pivot.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(pivot);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  pivot.updateMatrixWorld(true);
  const bbox = new THREE.Box3().setFromObject(pivot);
  const size = bbox.getSize(new THREE.Vector3());

  // Âncoras (centro de cada subsistema, em coordenadas locais do grupo) e direções de explosão.
  const dist = size.length() * 0.2;
  const anchors = {};
  const dirs = {};
  const bounds = {};
  ALL.forEach((s) => {
    const g = groups[s.id];
    const b = new THREE.Box3().setFromObject(g);
    bounds[s.id] = b;
    if (b.isEmpty()) return;
    const c = b.getCenter(new THREE.Vector3());
    if (s.id === 'mastro') c.y = b.max.y - (b.max.y - b.min.y) * 0.12;
    anchors[s.id] = g.worldToLocal(c.clone());
    dirs[s.id] = new THREE.Vector3(...(s.explode || [0, 0, 0])).normalize().multiplyScalar(dist);
  });

  let ex = 0;
  const api = {
    pivot,
    groups,
    anchors,
    bounds,
    size,
    radius: size.length() / 2,
    /** t ∈ [0,1] */
    setExplode(t) {
      ex = t;
      ALL.forEach((s) => {
        const d = dirs[s.id];
        if (d) groups[s.id].position.copy(d).multiplyScalar(t);
      });
    },
    get explode() {
      return ex;
    },
    /** estado visual: { selected, isolate, hidden:Set } */
    setView({ selected = null, isolate = false, hidden = new Set() } = {}) {
      ALL.forEach((s) => {
        const g = groups[s.id];
        const hide = hidden.has(s.id) || (isolate && selected && s.id !== selected);
        g.visible = !hide;
        const dim = selected && !isolate && s.id !== selected;
        const hi = selected && s.id === selected;
        g.traverse((o) => {
          if (!o.isMesh) return;
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
            const b = m.userData.base;
            if (!b) return;
            if (dim && !(m.transmission > 0)) {
              m.transparent = true;
              m.opacity = 0.14;
              m.depthWrite = false;
            } else {
              m.transparent = b.transparent;
              m.opacity = b.opacity;
              m.depthWrite = b.depthWrite;
            }
            if (m.emissive) {
              if (hi) {
                m.emissive.set(new THREE.Color(ALL.find((x) => x.id === s.id).cor));
                m.emissiveIntensity = 0.28;
              } else {
                m.emissive.setHex(b.emissive);
                m.emissiveIntensity = b.ei;
              }
            }
          });
        });
      });
    },
    /** posição em coordenadas de mundo da âncora de um subsistema */
    anchorWorld(id, out = new THREE.Vector3()) {
      const a = anchors[id];
      if (!a) return null;
      return groups[id].localToWorld(out.copy(a));
    },
    /** caixa só de um subsistema (para enquadrar a câmara) */
    boxOf(id) {
      return new THREE.Box3().setFromObject(groups[id]);
    },
    hasNodes(id) {
      return groups[id] && groups[id].children.length > 0;
    },
  };
  return api;
}

/* ───────── Palco (renderer + cena + luzes + chão) ───────── */
function radialTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  grad.addColorStop(0, 'rgba(0,0,0,0.55)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createStage(canvas, { floorY = -1.2, floor = true, fov = 32, envIntensity = 0.85 } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = envIntensity;

  const key = new THREE.DirectionalLight(0xffd9b8, 2.4);
  key.position.set(4, 6, 3);
  const rim = new THREE.DirectionalLight(0x9db8ff, 1.1);
  rim.position.set(-5, 3, -4);
  scene.add(key, rim, new THREE.HemisphereLight(0xffe3d0, 0x1a1008, 0.35));

  let floorGroup = null;
  if (floor) {
    floorGroup = new THREE.Group();
    const polar = new THREE.PolarGridHelper(3.4, 24, 7, 96, 0xff7a00, 0x6a3a1a);
    polar.material.transparent = true;
    polar.material.opacity = 0.35;
    const blob = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 4.6),
      new THREE.MeshBasicMaterial({ map: radialTexture(), transparent: true, depthWrite: false }),
    );
    blob.rotation.x = -Math.PI / 2;
    blob.position.y = 0.002;
    floorGroup.add(polar, blob);
    floorGroup.position.y = floorY;
    scene.add(floorGroup);
  }

  const camera = new THREE.PerspectiveCamera(fov, 1, 0.05, 200);
  const parent = canvas.parentElement;
  const resize = () => {
    const w = parent.clientWidth || 1;
    const h = parent.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(parent);
  resize();

  return {
    renderer,
    scene,
    camera,
    floorGroup,
    resize,
    render: () => renderer.render(scene, camera),
    dispose() {
      ro.disconnect();
      pmrem.dispose();
      envTex.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
