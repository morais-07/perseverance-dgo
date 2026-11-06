// M1 · «Escolhe a próxima viagem»: os rovers reais de cada destino, em vídeo, em render e em 3D,
// e um teste em que todos saltam ao mesmo tempo com a gravidade do seu destino.
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import data from '../content/destinos.json';
import { buildRover, createStage, loadGLB } from '../lib/rover.js';
import { asset, esc, fmt, hasWebGL, icon, reducedMotion, tbc } from '../lib/util.js';
import { onLeave } from '../lib/lifecycle.js';

const D = data.destinos;
const pasta = (id) => `media/m1/rovers/${id}`;
const v0 = data.salto.v0;
const salto = (g) => ({ h: v0 ** 2 / (2 * g), t: (2 * v0) / g });

const sheetHtml = (d) => {
  const s = salto(d.g);
  const peso = data.massaRover * d.g;
  const r = d.rover;
  const dif = r.delta > 0 ? `+${r.delta}` : `−${Math.abs(r.delta)}`;
  return `<div class="vg-why">
      <h4>Porque o escolhemos</h4>
      <p class="vg-why-txt">${esc(d.porque)}</p>
    </div>
    <dl class="vg-facts">
      <div><dt>Gravidade</dt><dd>${fmt(d.g, 2)} m/s²<small>${fmt((d.g / data.gTerra) * 100, 0)} % da gravidade da Terra</small></dd></div>
      <div><dt>Temperatura</dt><dd>${esc(d.temperatura)}</dd></div>
      <div><dt>Ambiente</dt><dd>${esc(d.ambiente)}</dd></div>
      <div><dt>Peso do rover</dt><dd>${fmt(Math.round(peso))} N<small>${esc(data.massaNota)}, ${data.massaRover} kg</small></dd></div>
      <div><dt>Salto a ${v0} m/s</dt><dd>${fmt(s.h * 100, 0)} cm<small>${fmt(s.t, 2)} s no ar</small></dd></div>
    </dl>
    <div class="vg-muda">
      <div class="vg-muda-txt">
        <h4>${esc(data.adaptacaoTitulo)}</h4>
        <p class="vg-muda-num"><b>${fmt(r.massa, 1)} kg</b> de suspensão, ${dif} % face aos ${fmt(data.massaSuspensaoOriginal, 1)} kg originais.</p>
        <p>Material: ${esc(r.material)}. ${esc(r.nota)}</p>
        <p>No joelho do meio, a variante ${esc(r.codigo)} usa a família ${esc(r.familia)}, em ${esc(r.matJ)}: braço de ${fmt(r.braco, 2)} kg e fator de segurança 3D de ${fmt(r.fs, 2)}.</p>
        ${
          d.chassis
            ? `<p>Chassis: comprimento de ${fmt(d.chassis.comprimento)} mm, ${d.chassis.nCostelas} costelas de ${d.chassis.espCostela} mm de espessura, anéis de ${d.chassis.largAnel} mm de largura e ${d.chassis.nLongarinas} longarinas de ${d.chassis.raioLongarina} mm de raio.</p>`
            : `<p>${esc(data.chassisFusion)}</p>`
        }
        <p>Braço: tubo 1 com Ø${d.braco.dTubo1} mm e ${d.braco.compTubo1} mm de comprimento (${d.braco.c3Nr} furos de Ø${d.braco.c3D} mm); tubo 2 com Ø${d.braco.dTubo2} mm e ${d.braco.compTubo2} mm de comprimento (${d.braco.c6Nr} furos de Ø${d.braco.c6D} mm).</p>
        <p class="note">${esc(data.corNota)}</p>
      </div>
      <figure><img src="${asset(`media/m1/suspensao/passo5_suspensao_${d.id}.webp`)}" alt="Suspensão completa para ${esc(d.nome)}: a laranja, as peças geradas." loading="lazy" /><figcaption>Suspensão</figcaption></figure>
      <figure class="vg-muda-braco"><img src="${asset(`media/m1/braco/${d.id}.webp`)}" alt="Braço do rover para ${esc(d.nome)}." loading="lazy" /><figcaption>Braço</figcaption></figure>
    </div>`;
};

export function initViagem(root, wanted) {
  if (!root) return;
  const byId = Object.fromEntries(D.map((d) => [d.id, d]));
  let cur = byId[wanted] || D.find((d) => d.origem) || D[0];
  const reduced = reducedMotion();
  const webgl = hasWebGL();

  const $ = (s) => root.querySelector(s);
  const stage = $('[data-stage]');
  const media = $('[data-media]');
  const video = $('video');
  const canvas = $('canvas');
  const nome = $('[data-nome]');
  const kicker = $('[data-kicker]');
  const leitura = $('[data-leitura]');
  const sheet = $('[data-info]');
  const radios = [...root.querySelectorAll('.vg-dest')];
  const lanes = [...root.querySelectorAll('.lab-lane[data-id]')];
  const modos = [...root.querySelectorAll('[data-modo]')];
  const vistas = [...root.querySelectorAll('[data-vista]')];
  const pause = $('.vg-pause');
  const load = $('.vg-load');
  const hint = $('.vg-hint');

  let modo = reduced ? 'vistas' : 'movimento'; // sem movimento automático para quem o pediu no sistema
  let vista = 'principal';
  let pausado = false;
  let dead = false;
  let visivel = true;

  /* ───────── imagem de fundo, com transição entre imagens ───────── */
  let imgTok = 0;
  function setImage() {
    const tok = ++imgTok;
    const v = modo === 'vistas' ? vista : 'principal';
    const im = new Image();
    im.alt = `Render do rover para ${cur.nome}, vista ${v}.`;
    im.onload = () => {
      if (tok !== imgTok || dead) return;
      const antigas = [...media.children];
      media.appendChild(im);
      void im.offsetWidth; // o navegador regista a opacidade inicial, para a transição acontecer
      im.classList.add('on');
      setTimeout(() => antigas.forEach((o) => o.remove()), 700);
    };
    im.src = asset(`${pasta(cur.id)}/${v}.webp`);
  }

  /* ───────── vídeo: repete com uma dissolução sobre o render, em vez de um salto ───────── */
  function setVideo() {
    video.classList.remove('on');
    if (modo !== 'movimento') {
      video.pause();
      video.removeAttribute('src');
      video.load();
      return;
    }
    video.src = asset(`${pasta(cur.id)}/clip.mp4`);
    if (!pausado && visivel) video.play().catch(() => {});
  }
  video.addEventListener('playing', () => video.classList.add('on'));
  video.addEventListener('timeupdate', () => {
    if (video.duration && video.duration - video.currentTime < 0.4) video.classList.remove('on');
  });
  video.addEventListener('ended', () => {
    video.currentTime = 0;
    video.play().catch(() => {});
  });
  const syncPause = () => {
    pause.innerHTML = pausado ? icon.play : icon.pause;
    const t = pausado ? 'Retomar o vídeo' : 'Pausar o vídeo';
    pause.setAttribute('aria-label', t);
    pause.title = t;
  };
  pause.addEventListener('click', () => {
    pausado = !pausado;
    syncPause();
    if (pausado) video.pause();
    else video.play().catch(() => {});
  });
  syncPause();

  /* ───────── 3D: só carrega quando se pede ───────── */
  let st3d = null;
  let controls = null;
  let raf = 0;
  const rovers = {};
  let roverAtual = null;

  function start3d() {
    st3d = createStage(canvas, { floorY: -1, fov: 30, envIntensity: 0.75 });
    controls = new OrbitControls(st3d.camera, canvas);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = false; // a roda do rato continua a fazer scroll à página
    controls.maxPolarAngle = Math.PI * 0.52;
    controls.autoRotate = !reduced;
    controls.autoRotateSpeed = 0.9;
    controls.addEventListener('start', () => (controls.autoRotate = false));
    canvas.style.touchAction = 'pan-y'; // no telemóvel, arrastar na vertical continua a mover a página
    const dir = { x: 0.62, y: 0.2, z: 1 };
    const place = () => {
      const k = 5.1 * Math.max(1, 1.7 / st3d.camera.aspect);
      st3d.camera.position.set(dir.x * k, dir.y * k, dir.z * k);
      controls.update();
    };
    place();
    const loop = () => {
      if (dead) return;
      raf = requestAnimationFrame(loop);
      if (modo !== '3d' || !visivel || document.hidden) return;
      controls.update();
      st3d.render();
    };
    loop();
  }

  async function set3d() {
    if (modo !== '3d') return;
    const id = cur.id;
    load.hidden = false;
    load.textContent = `A carregar o rover para ${cur.nome}…`;
    try {
      if (!st3d) start3d();
      const gltf = await loadGLB(`models/rovers/${id}.glb`);
      if (dead || cur.id !== id || modo !== '3d') return;
      rovers[id] ||= buildRover(gltf);
      if (roverAtual) st3d.scene.remove(roverAtual.pivot);
      roverAtual = rovers[id];
      st3d.scene.add(roverAtual.pivot);
      st3d.floorGroup.position.y = -roverAtual.size.y / 2 - 0.02;
      load.hidden = true;
    } catch (err) {
      console.warn('[viagem] 3D indisponível', err);
      load.textContent = 'Não foi possível carregar o modelo 3D. Experimenta o vídeo ou as vistas.';
    }
  }

  function aplicarModo() {
    stage.dataset.modo = modo;
    modos.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.modo === modo)));
    vistas.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.vista === vista)));
    root.querySelector('.vg-views').hidden = modo !== 'vistas';
    pause.hidden = modo !== 'movimento';
    hint.hidden = modo !== '3d';
    canvas.hidden = modo !== '3d';
    if (modo !== '3d') load.hidden = true;
    if (modo === '3d' && st3d) st3d.resize();
    setImage();
    setVideo();
    set3d();
  }

  /* ───────── escolher um destino ───────── */
  function select(id, { push = true, focus = false } = {}) {
    cur = byId[id];
    radios.forEach((r) => {
      const on = r.dataset.id === id;
      r.setAttribute('aria-checked', String(on));
      r.tabIndex = on ? 0 : -1;
      if (on) {
        if (focus) r.focus();
        if (r.parentElement.scrollWidth > r.parentElement.clientWidth) r.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'instant' });
      }
    });
    lanes.forEach((l) => l.classList.toggle('on', l.dataset.id === id));
    root.style.setProperty('--dc', cur.cor);
    $('.vg-ambient').style.backgroundImage = `url("${asset(`${pasta(cur.id)}/principal_t.webp`)}")`;
    root.style.setProperty('--dh', cur.horizonte);
    kicker.textContent = cur.origem ? `${cur.tipo}, ${data.ponto[0].toLowerCase()}${data.ponto.slice(1)}` : cur.tipo;
    nome.textContent = cur.nome;
    if (!reduced) {
      nome.classList.remove('in');
      void nome.offsetWidth;
      nome.classList.add('in');
    }
    leitura.innerHTML = `<span><b>${fmt(cur.g, 2)}</b> m/s²</span><span><b>${esc(cur.temperatura)}</b></span>`;
    sheet.innerHTML = sheetHtml(cur);
    aplicarModo();
    if (push) history.replaceState(null, '', `#/m1/viagem/${id}`); // ligação partilhável, sem reconstruir a página
  }

  radios.forEach((r) => r.addEventListener('click', () => select(r.dataset.id)));
  $('.vg-rail').addEventListener('keydown', (e) => {
    const i = radios.findIndex((r) => r.dataset.id === cur.id);
    const n = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: radios.length - 1 }[e.key];
    if (n === undefined) return;
    e.preventDefault();
    select(radios[(n + radios.length) % radios.length].dataset.id, { focus: true });
  });
  modos.forEach((b) => {
    if (b.dataset.modo === '3d' && !webgl) b.hidden = true;
    b.addEventListener('click', () => {
      modo = b.dataset.modo;
      aplicarModo();
    });
  });
  vistas.forEach((b) =>
    b.addEventListener('click', () => {
      vista = b.dataset.vista;
      aplicarModo();
    }),
  );

  // Vídeo e 3D param quando saem do ecrã.
  const io = new IntersectionObserver(([e]) => {
    visivel = e.isIntersecting;
    if (modo !== 'movimento' || pausado) return;
    if (visivel) video.play().catch(() => {});
    else video.pause();
  });
  io.observe(stage);

  /* ───────── teste de gravidade: todos saltam ao mesmo tempo, à velocidade real ───────── */
  const lab = $('.lab');
  const labBtn = $('[data-saltar]');
  const hMax = salto(Math.min(...D.map((d) => d.g))).h;
  const pistas = [...lab.querySelectorAll('.lab-lane')].map((el) => ({ img: el.querySelector('img'), track: el.querySelector('.lab-track'), g: Number(el.dataset.g) }));
  let labRaf = 0;
  function saltar() {
    cancelAnimationFrame(labRaf);
    const t0 = performance.now();
    const passo = (now) => {
      if (dead) return;
      const t = (now - t0) / 1000;
      let noAr = false;
      pistas.forEach((p) => {
        const y = Math.max(0, v0 * t - 0.5 * p.g * t * t);
        if (t < (2 * v0) / p.g) noAr = true;
        const curso = p.track.clientHeight - p.img.offsetHeight;
        p.img.style.transform = `translateY(${-(y / hMax) * curso}px)`;
      });
      if (noAr) labRaf = requestAnimationFrame(passo);
      else labBtn.textContent = data.laboratorio.repetir;
    };
    labRaf = requestAnimationFrame(passo);
  }
  labBtn.addEventListener('click', saltar);
  lanes.forEach((l) => l.addEventListener('click', () => select(l.dataset.id)));
  // Primeiro salto quando o teste entra no ecrã (só uma vez, e nunca para quem pediu menos movimento).
  const labIo = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting) return;
      labIo.disconnect();
      if (!reduced) saltar();
    },
    { threshold: 0.6 },
  );
  labIo.observe(lab);

  onLeave(() => {
    dead = true;
    cancelAnimationFrame(raf);
    cancelAnimationFrame(labRaf);
    io.disconnect();
    labIo.disconnect();
    video.pause();
    video.removeAttribute('src');
    controls?.dispose();
    st3d?.dispose();
  });

  select(cur.id, { push: false });
  root.__viagem = { select }; // útil para depuração na consola
}
