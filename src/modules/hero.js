// Hero: o rover (GLB) controlado pelo scroll — roda, aproxima-se e abre em vista explodida.
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { buildRover, createStage, loadRoverModel, onModelProgress, SUBS } from '../lib/rover.js';
import { hasWebGL, reducedMotion } from '../lib/util.js';
import { onLeave } from '../lib/lifecycle.js';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true }); // a barra de endereço do telemóvel não deve reiniciar a animação

const CHAVE_ESTATICO = 'dgo-hero-estatico';
const lerEstatico = () => {
  try {
    return localStorage.getItem(CHAVE_ESTATICO) === '1';
  } catch {
    return false;
  }
};

export async function initHero(hero) {
  const status = hero.querySelector('.hero-status');
  const dizer = (txt) => {
    status.textContent = txt;
    status.hidden = !txt;
  };
  if (!hasWebGL()) {
    dizer('Este navegador tem o WebGL desligado, por isso aparece uma imagem em vez da animação. Para a ver, ativa a aceleração por hardware nas definições do navegador.');
    return;
  }
  const canvas = hero.querySelector('canvas');
  const labelsHost = hero.querySelector('.hero-labels');
  const tele = {
    rot: hero.querySelector('[data-tele="rot"]'),
    zoom: hero.querySelector('[data-tele="zoom"]'),
    ex: hero.querySelector('[data-tele="ex"]'),
  };
  // Com «efeitos de animação» desligados no sistema, a animação continua: só anda quando a pessoa faz scroll.
  // O que se retira é a rotação automática, e essas pessoas têm um botão para passar à vista estática.
  const reduced = reducedMotion();
  const estatico = reduced && lerEstatico();
  if (reduced) {
    const b = hero.querySelector('.hero-motion');
    b.hidden = false;
    b.textContent = estatico ? 'Ver a animação' : 'Usar vista estática';
    b.addEventListener('click', () => {
      try {
        localStorage.setItem(CHAVE_ESTATICO, estatico ? '0' : '1');
      } catch {
        /* sem armazenamento, a escolha dura só até recarregar */
      }
      location.reload();
    });
  }

  const hs = { rot: 0.55, dist: 9.4, elev: 0.16, ex: 0, shiftX: 2.3, lookY: 0.05, lab: 0, mobY: 1.0 };
  if (estatico) Object.assign(hs, { rot: 0.9, dist: 9.6, elev: 0.32, ex: 0.7, shiftX: 0, lookY: 0.2, lab: 1, mobY: 0.5 });

  // O pin é criado já (antes de o modelo carregar) para o layout não saltar quando o GLB chegar.
  let tl = null;
  if (!estatico) {
    tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: hero, start: 'top top', end: '+=260%', scrub: 0.9, pin: true, anticipatePin: 1 },
    });
    tl.to(hs, { rot: 0.55 + Math.PI * 1.9, duration: 1 }, 0)
      .to(hs, { dist: 7.2, elev: 0.22, duration: 0.5, ease: 'power1.inOut' }, 0)
      .to(hs, { shiftX: 0, duration: 0.55, ease: 'power2.inOut' }, 0.2)
      .to(hs, { ex: 1, duration: 0.4, ease: 'power2.inOut' }, 0.58)
      .to(hs, { dist: 10.6, elev: 0.46, lookY: 0.25, duration: 0.4, ease: 'power1.inOut' }, 0.58)
      .to(hs, { mobY: 0.35, duration: 0.6, ease: 'power1.inOut' }, 0.1)
      .to(hs, { lab: 1, duration: 0.12 }, 0.88)
      .to('.hero-copy', { autoAlpha: 0, y: -70, duration: 0.14, ease: 'power1.in' }, 0.04)
      .to('.hero-cue', { autoAlpha: 0, duration: 0.06 }, 0.02);
  }
  // Se o 3D falhar, a página não pode ficar presa numa animação vazia.
  const desistir = (txt) => {
    tl?.scrollTrigger?.kill(true);
    tl?.progress(0).kill();
    hero.classList.remove('ready');
    dizer(txt);
  };

  const pararProgresso = onModelProgress((p) => dizer(p < 1 ? `A carregar o modelo 3D… ${Math.round(p * 100)} %` : ''));
  onLeave(pararProgresso);
  let model;
  try {
    model = await loadRoverModel();
  } catch (err) {
    console.warn('[hero] modelo 3D indisponível — a manter a imagem estática', err);
    pararProgresso();
    if (hero.isConnected) desistir('O modelo 3D não carregou. Verifica a ligação à internet e recarrega a página.');
    return;
  }
  pararProgresso();

  if (!hero.isConnected) return; // o utilizador já saiu da página inicial enquanto o modelo carregava
  dizer('');

  const rover = buildRover(model.gltf);
  let stage;
  try {
    stage = createStage(canvas, { floorY: -rover.size.y / 2 - 0.02, envIntensity: model.provisional ? 0.85 : 0.5 });
  } catch (err) {
    console.warn('[hero] WebGL recusado', err);
    desistir('A placa gráfica recusou o WebGL, por isso aparece uma imagem em vez da animação. Para a ver, ativa a aceleração por hardware nas definições do navegador.');
    return;
  }
  canvas.addEventListener('webglcontextlost', () => {
    if (!dead) desistir('A placa gráfica interrompeu o 3D. Recarrega a página para voltar a ver a animação.');
  });
  stage.scene.add(rover.pivot);
  let dead = false;
  onLeave(() => {
    dead = true;
    stage.dispose();
  });

  // etiquetas dos subsistemas (aparecem na vista explodida)
  const labels = SUBS.map((s) => {
    const el = document.createElement('div');
    el.className = 'hero-label';
    el.innerHTML = `<b>${String(s.n).padStart(2, '0')}</b>${s.nome}`;
    labelsHost.appendChild(el);
    return { id: s.id, el };
  });

  let idle = 0; // rotação lenta enquanto ninguém faz scroll, para se perceber que o rover é 3D
  const v = new THREE.Vector3();
  const apply = () => {
    const { camera } = stage;
    // Em ecrãs verticais (telemóvel) afasta a câmara, centra o rover e deixa espaço ao título
    const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
    const portrait = aspect < 1;
    const ds = portrait ? 1 + (1 - aspect) * 2.3 : 1;
    const look = hs.lookY + (portrait ? hs.mobY : 0);
    const sx = portrait ? 0 : hs.shiftX;
    camera.position.set(0, look + Math.sin(hs.elev) * hs.dist * ds, Math.cos(hs.elev) * hs.dist * ds);
    camera.lookAt(0, look, 0);
    rover.pivot.rotation.y = hs.rot + idle;
    rover.pivot.position.x = sx;
    if (stage.floorGroup) stage.floorGroup.position.x = sx;
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
      tele.rot.textContent = String(Math.round((((rover.pivot.rotation.y * 180) / Math.PI) % 360) + 360) % 360).padStart(3, '0') + '°';
      tele.zoom.textContent = (9.4 / hs.dist).toFixed(1) + '×';
      tele.ex.textContent = Math.round(hs.ex * 100) + ' %';
    }
  };

  if (!model.provisional) hero.querySelector('[data-prov]').textContent = 'MODELO DA EQUIPA · DGO';
  hero.classList.add('ready');
  apply();

  if (estatico) {
    new ResizeObserver(apply).observe(hero);
    return;
  }

  // Só renderizar enquanto o hero estiver visível.
  let visible = true;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
  io.observe(hero);
  onLeave(() => io.disconnect());
  // Em computadores lentos reduz a resolução em vez de deixar a animação aos soluços.
  let frames = 0;
  let t0 = performance.now();
  let last = t0;
  const loop = (now) => {
    if (dead) return;
    requestAnimationFrame(loop);
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (!visible || document.hidden) return;
    if (!reduced && (tl?.scrollTrigger?.progress ?? 0) < 0.002) idle += dt * 0.16;
    apply();
    if (++frames === 40) {
      if (now - t0 > 40 * 40 && stage.renderer.getPixelRatio() > 1) {
        stage.renderer.setPixelRatio(1);
        stage.resize();
      }
      frames = 0;
      t0 = now;
    }
  };
  requestAnimationFrame(loop);
}
