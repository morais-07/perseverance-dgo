// Hero: o rover (GLB) controlado pelo scroll — roda, aproxima-se e abre em vista explodida.
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { buildRover, createStage, loadRoverModel, SUBS } from '../lib/rover.js';
import { hasWebGL, isMobile, reducedMotion } from '../lib/util.js';

gsap.registerPlugin(ScrollTrigger);

export async function initHero(hero) {
  if (isMobile() || !hasWebGL()) return; // no telemóvel o hero é uma imagem estática
  const canvas = hero.querySelector('canvas');
  const labelsHost = hero.querySelector('.hero-labels');
  const tele = {
    rot: hero.querySelector('[data-tele="rot"]'),
    zoom: hero.querySelector('[data-tele="zoom"]'),
    ex: hero.querySelector('[data-tele="ex"]'),
  };
  const reduced = reducedMotion();

  const hs = { rot: 0.55, dist: 9.4, elev: 0.16, ex: 0, shiftX: 2.3, lookY: 0.05, lab: 0 };
  if (reduced) Object.assign(hs, { rot: 0.9, dist: 9.6, elev: 0.32, ex: 0.7, shiftX: 0, lookY: 0.2, lab: 1 });

  // O pin é criado já (antes de o modelo carregar) para o layout não saltar quando o GLB chegar.
  if (!reduced) {
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: hero, start: 'top top', end: '+=260%', scrub: 0.9, pin: true, anticipatePin: 1 },
    });
    tl.to(hs, { rot: 0.55 + Math.PI * 1.9, duration: 1 }, 0)
      .to(hs, { dist: 7.2, elev: 0.22, duration: 0.5, ease: 'power1.inOut' }, 0)
      .to(hs, { shiftX: 0, duration: 0.55, ease: 'power2.inOut' }, 0.2)
      .to(hs, { ex: 1, duration: 0.4, ease: 'power2.inOut' }, 0.58)
      .to(hs, { dist: 10.6, elev: 0.46, lookY: 0.25, duration: 0.4, ease: 'power1.inOut' }, 0.58)
      .to(hs, { lab: 1, duration: 0.12 }, 0.88)
      .to('.hero-copy', { autoAlpha: 0, y: -70, duration: 0.14, ease: 'power1.in' }, 0.04)
      .to('.hero-cue', { autoAlpha: 0, duration: 0.06 }, 0.02);
  }

  let model;
  try {
    model = await loadRoverModel();
  } catch (err) {
    console.warn('[hero] modelo 3D indisponível — a manter a imagem estática', err);
    return;
  }

  const rover = buildRover(model.gltf);
  const stage = createStage(canvas, { floorY: -rover.size.y / 2 - 0.02 });
  stage.scene.add(rover.pivot);

  // etiquetas dos subsistemas (aparecem na vista explodida)
  const labels = SUBS.map((s) => {
    const el = document.createElement('div');
    el.className = 'hero-label';
    el.innerHTML = `<b>${String(s.n).padStart(2, '0')}</b>${s.nome}`;
    labelsHost.appendChild(el);
    return { id: s.id, el };
  });

  const v = new THREE.Vector3();
  const apply = () => {
    const { camera } = stage;
    camera.position.set(0, hs.lookY + Math.sin(hs.elev) * hs.dist, Math.cos(hs.elev) * hs.dist);
    camera.lookAt(0, hs.lookY, 0);
    rover.pivot.rotation.y = hs.rot;
    rover.pivot.position.x = hs.shiftX;
    if (stage.floorGroup) stage.floorGroup.position.x = hs.shiftX;
    rover.setExplode(hs.ex);
    rover.pivot.updateMatrixWorld(true);
    stage.render();

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    labels.forEach(({ id, el }) => {
      if (!rover.anchorWorld(id, v)) return;
      v.project(camera);
      el.style.opacity = hs.lab.toFixed(2);
      el.style.transform = `translate(${(v.x * 0.5 + 0.5) * w + 14}px, ${(-v.y * 0.5 + 0.5) * h - 8}px)`;
    });
    if (tele.rot) {
      tele.rot.textContent = String(Math.round((((hs.rot * 180) / Math.PI) % 360) + 360) % 360).padStart(3, '0') + '°';
      tele.zoom.textContent = (9.4 / hs.dist).toFixed(1) + '×';
      tele.ex.textContent = Math.round(hs.ex * 100) + ' %';
    }
  };

  hero.classList.add('ready');
  apply();

  if (reduced) {
    new ResizeObserver(apply).observe(hero);
    return;
  }

  // Só renderizar enquanto o hero estiver visível.
  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 }).observe(hero);
  const loop = () => {
    if (visible) apply();
    requestAnimationFrame(loop);
  };
  loop();
}
