// Visualizador 3D principal: órbita, zoom, pan, hotspots, isolar/destacar/ocultar subsistemas e vista explodida.
import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildRover, createStage, loadRoverModel, onModelProgress, SUBS } from '../lib/rover.js';
import { esc, hasWebGL, icon, reducedMotion, clamp } from '../lib/util.js';

export function initViewer(root) {
  if (!root) return;
  if (!hasWebGL()) {
    root.classList.add('nogl');
    root.querySelector('.v-load')?.classList.add('done');
    return;
  }
  const $ = (s) => root.querySelector(s);
  const canvas = $('canvas');
  const loadEl = $('.v-load');
  const meter = $('.v-load .meter i');
  const pct = $('.v-load .pct');
  const info = $('.v-info');
  const reduced = reducedMotion();

  onModelProgress((p) => {
    meter.style.width = Math.round(p * 100) + '%';
    pct.textContent = Math.round(p * 100) + ' %';
  });

  let started = false;
  let visible = false;
  let ctx = null;

  new IntersectionObserver(
    ([e]) => {
      visible = e.isIntersecting;
      if (visible && !started) {
        started = true;
        start().catch((e) => {
          console.error('[viewer]', e);
          loadEl.classList.add('done');
        });
      }
    },
    { rootMargin: '500px 0px' },
  ).observe(root);

  async function start() {
    let model;
    try {
      model = await loadRoverModel();
    } catch (err) {
      console.warn('[viewer] falha ao carregar o modelo', err);
      root.classList.add('nogl');
      loadEl.classList.add('done');
      return;
    }
    const rover = buildRover(model.gltf);
    const stage = createStage(canvas, { floorY: -rover.size.y / 2 - 0.02 });
    stage.scene.add(rover.pivot);
    const { camera, renderer } = stage;
    const R = rover.radius;

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = R * 0.9;
    controls.maxDistance = R * 7;
    controls.maxPolarAngle = Math.PI * 0.52;
    controls.autoRotate = !reduced;
    controls.autoRotateSpeed = 1.1;
    controls.zoomToCursor = false;

    const home = { pos: new THREE.Vector3(R * 2.5, R * 1.35, R * 3.1), target: new THREE.Vector3(0, 0, 0) };
    camera.position.copy(home.pos);
    controls.target.copy(home.target);
    controls.update();

    const st = { selected: null, isolate: false, hidden: new Set(), ex: 0, auto: controls.autoRotate };
    const btn = (a) => root.querySelector(`[data-act="${a}"]`);

    /* ── provisório ── */
    $('.v-prov').hidden = !model.provisional;

    /* ── hotspots ── */
    const hsHost = $('.v-hotspots');
    const hotspots = {};
    SUBS.forEach((s) => {
      if (!rover.hasNodes(s.id)) return;
      const b = document.createElement('button');
      b.className = 'hotspot';
      b.dataset.id = s.id;
      b.dataset.label = s.nome;
      b.setAttribute('aria-label', `Subsistema ${s.n}: ${s.nome}. Abrir informação.`);
      b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `<span aria-hidden="true">${s.n}</span>`;
      b.addEventListener('click', () => select(st.selected === s.id ? null : s.id));
      hsHost.appendChild(b);
      hotspots[s.id] = b;
    });

    /* ── seleção / isolar / ocultar ── */
    const applyView = () => {
      rover.setView(st);
      root.querySelectorAll('.chip').forEach((c) => {
        const id = c.dataset.id;
        c.classList.toggle('on', st.selected === id);
        const eye = c.querySelector('.eye');
        const off = st.hidden.has(id);
        eye.setAttribute('aria-pressed', String(off));
        eye.setAttribute('aria-label', `${off ? 'Mostrar' : 'Ocultar'} ${SUBS.find((x) => x.id === id).nome}`);
        eye.innerHTML = off ? icon.eyeOff : icon.eye;
        c.querySelector('[data-act="select"]').setAttribute('aria-pressed', String(st.selected === id));
      });
      Object.entries(hotspots).forEach(([id, h]) => {
        h.setAttribute('aria-pressed', String(st.selected === id));
      });
    };

    const tween = (to, dur = 0.9) => {
      if (reduced) dur = 0;
      const t0 = controls.target.clone();
      const delta = to.clone().sub(t0);
      const p0 = camera.position.clone();
      const o = { k: 0 };
      gsap.to(o, {
        k: 1,
        duration: dur,
        ease: 'power3.inOut',
        onUpdate: () => {
          controls.target.copy(t0).addScaledVector(delta, o.k);
          camera.position.copy(p0).addScaledVector(delta, o.k);
        },
      });
    };

    function select(id) {
      st.selected = id;
      if (!id) st.isolate = false;
      if (id) {
        st.hidden.delete(id);
        controls.autoRotate = false;
        st.auto = false;
        btn('rotate').setAttribute('aria-pressed', 'false');
        const c = rover.boxOf(id).getCenter(new THREE.Vector3());
        tween(c);
        showInfo(id);
      } else {
        tween(home.target);
        info.classList.remove('open');
      }
      btn('isolate')?.setAttribute('aria-pressed', String(st.isolate));
      applyView();
    }

    function showInfo(id) {
      const s = SUBS.find((x) => x.id === id);
      info.innerHTML = `
        <button class="icon-btn close" data-act="close" aria-label="Fechar painel">${icon.close}</button>
        <div class="code">${esc(s.codigo)} · SUBSISTEMA ${String(s.n).padStart(2, '0')}</div>
        <h3>${esc(s.nome)}</h3>
        <p class="real mono" style="font-size:.72rem;color:#94a3b8;margin-top:-8px">${esc(s.nomeReal)}</p>
        <p>${esc(s.funcao)}</p>
        <div class="figs">${s.numeros
          .map((n) => `<div class="fig"><span class="v">${esc(n.valor)}<small>${esc(n.unidade)}</small></span><span class="l">${esc(n.rotulo)}</span></div>`)
          .join('')}</div>
        <div class="actions">
          <button data-act="isolate" aria-pressed="${st.isolate}">Isolar</button>
          <button data-act="goto-card">Ver secção (M0)</button>
        </div>`;
      info.classList.add('open');
      info.querySelector('[data-act="close"]').focus({ preventScroll: true });
    }

    info.addEventListener('click', (e) => {
      const a = e.target.closest('[data-act]')?.dataset.act;
      if (a === 'close') select(null);
      if (a === 'isolate') {
        st.isolate = !st.isolate;
        e.target.closest('button').setAttribute('aria-pressed', String(st.isolate));
        applyView();
      }
      if (a === 'goto-card') document.getElementById('sub-' + st.selected)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });

    root.querySelectorAll('.chip').forEach((c) => {
      const id = c.dataset.id;
      if (!rover.hasNodes(id)) {
        c.hidden = true;
        return;
      }
      c.querySelector('[data-act="select"]').addEventListener('click', () => select(st.selected === id ? null : id));
      c.querySelector('.eye').addEventListener('click', () => {
        if (st.hidden.has(id)) st.hidden.delete(id);
        else {
          st.hidden.add(id);
          if (st.selected === id) select(null);
        }
        applyView();
      });
    });
    $('.chips-all').addEventListener('click', () => {
      st.hidden.clear();
      select(null);
    });

    /* ── ferramentas ── */
    const explode = (target) => {
      st.ex = target;
      const o = { v: rover.explode };
      btn('explode').setAttribute('aria-pressed', String(target > 0));
      gsap.to(o, { v: target, duration: reduced ? 0 : 1.3, ease: 'power3.inOut', onUpdate: () => rover.setExplode(o.v) });
    };
    btn('explode').addEventListener('click', () => explode(st.ex > 0 ? 0 : 1));
    const stopAuto = () => {
      controls.autoRotate = false;
      st.auto = false;
      btn('rotate').setAttribute('aria-pressed', 'false');
    };
    btn('rotate').addEventListener('click', () => {
      st.auto = !st.auto;
      controls.autoRotate = st.auto;
      btn('rotate').setAttribute('aria-pressed', String(st.auto));
    });
    controls.addEventListener('start', stopAuto); // a rotação automática pára quando o utilizador interage
    btn('rotate').setAttribute('aria-pressed', String(st.auto));

    const reset = () => {
      st.selected = null;
      st.isolate = false;
      st.hidden.clear();
      info.classList.remove('open');
      explode(0);
      const p0 = camera.position.clone();
      const t0 = controls.target.clone();
      const o = { k: 0 };
      gsap.to(o, {
        k: 1,
        duration: reduced ? 0 : 0.9,
        ease: 'power3.inOut',
        onUpdate: () => {
          camera.position.lerpVectors(p0, home.pos, o.k);
          controls.target.lerpVectors(t0, home.target, o.k);
        },
      });
      applyView();
    };
    btn('reset').addEventListener('click', reset);

    const zoom = (f) => {
      const off = camera.position.clone().sub(controls.target);
      const len = clamp(off.length() * f, controls.minDistance, controls.maxDistance);
      camera.position.copy(controls.target).add(off.setLength(len));
    };
    btn('zoom-in').addEventListener('click', () => zoom(0.82));
    btn('zoom-out').addEventListener('click', () => zoom(1.22));

    const fsBtn = btn('fullscreen');
    if (document.fullscreenEnabled) {
      fsBtn.addEventListener('click', () => (document.fullscreenElement ? document.exitFullscreen() : root.requestFullscreen()));
      document.addEventListener('fullscreenchange', () => fsBtn.setAttribute('aria-pressed', String(document.fullscreenElement === root)));
    } else fsBtn.hidden = true;

    /* ── teclado no canvas: setas rodam, +/- zoom, 0 repõe, E explode ── */
    const orbitBy = (dTheta, dPhi) => {
      const off = camera.position.clone().sub(controls.target);
      const sph = new THREE.Spherical().setFromVector3(off);
      sph.theta += dTheta;
      sph.phi = clamp(sph.phi + dPhi, 0.15, Math.PI * 0.52);
      camera.position.copy(controls.target).add(off.setFromSpherical(sph));
    };
    canvas.addEventListener('keydown', (e) => {
      const k = e.key;
      const step = 0.12;
      const map = { ArrowLeft: () => orbitBy(-step, 0), ArrowRight: () => orbitBy(step, 0), ArrowUp: () => orbitBy(0, -step), ArrowDown: () => orbitBy(0, step), '+': () => zoom(0.85), '=': () => zoom(0.85), '-': () => zoom(1.18), _: () => zoom(1.18), 0: reset, e: () => explode(st.ex > 0 ? 0 : 1), E: () => explode(st.ex > 0 ? 0 : 1) };
      if (map[k]) {
        e.preventDefault();
        stopAuto();
        map[k]();
      }
    });

    /* ── ciclo de render (só quando visível) ── */
    const v = new THREE.Vector3();
    const tick = () => {
      requestAnimationFrame(tick);
      if (!visible) return;
      controls.update();
      rover.pivot.updateMatrixWorld(true);
      stage.render();
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      Object.entries(hotspots).forEach(([id, el]) => {
        const hidden = st.hidden.has(id) || (st.isolate && st.selected && st.selected !== id);
        el.style.visibility = hidden ? 'hidden' : 'visible';
        if (hidden || !rover.anchorWorld(id, v)) return;
        v.project(camera);
        el.style.transform = `translate(${(v.x * 0.5 + 0.5) * w}px, ${(-v.y * 0.5 + 0.5) * h}px)`;
      });
    };
    tick();

    loadEl.classList.add('done');
    ctx = { rover, stage, controls, select, explode, reset };
    root.__viewer = ctx; // útil para depuração na consola
  }
}
