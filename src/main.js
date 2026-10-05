import './styles.css';
import {
  renderTopbar, renderHero, renderSobre, renderHistoria, renderObjetivo, renderProjetoIntro, renderSubnav,
  renderPorque, renderM0, renderM1, renderM2, renderEquipa, renderRodape, renderEgg,
} from './render.js';
import site from './content/site.json';
import { hydrateSlots, revealOnScroll, asset } from './lib/util.js';
import {
  initNav, initCounters, initMarsVsEarth, initTimeline, initBeforeAfter, initSubTabs, initLightbox, initSol, initEgg, initDownloadButtons,
} from './modules/ui.js';
import { initHero } from './modules/hero.js';
import { initViewer } from './modules/viewer.js';
import { initMinis } from './modules/mini.js';
import { initRocker } from './modules/rocker.js';
import { initGens } from './modules/gens.js';

addEventListener('unhandledrejection', (e) => console.error('[erro]', e.reason));
addEventListener('error', (e) => console.error('[erro]', e.message));

const put = (id, html) => (document.getElementById(id).innerHTML = html);

put('topbar', renderTopbar());
put('inicio', renderHero());
put('sobre', renderSobre());
put('historia', renderHistoria());
put('objetivo', renderObjetivo());
put('projeto-intro', renderProjetoIntro());
put('subnav', renderSubnav());
put('porque', renderPorque());
put('m0', renderM0());
put('m1', renderM1());
put('m2', renderM2());
put('equipa', renderEquipa());
put('rodape', renderRodape());

// Logótipo DGO em SVG inline (herda a cor do texto).
fetch(asset('media/logo/dgo-logo.svg'))
  .then((r) => (r.ok ? r.text() : ''))
  .then((svg) => {
    if (svg.startsWith('<svg')) document.querySelectorAll('.logo-slot').forEach((el) => (el.innerHTML = svg));
  })
  .catch(() => {});

hydrateSlots();
revealOnScroll();
initNav();
initSol();
initTimeline();
initMarsVsEarth();
initBeforeAfter();
initSubTabs();
initLightbox();
initRocker(document.querySelector('[data-rb]'));
initGens(document.querySelector('[data-gens]'));
initEgg(renderEgg());
initDownloadButtons(site.download.nota);

// 3D: hero primeiro (carrega o GLB), depois viewer principal e mini viewers (reutilizam o mesmo GLB).
initHero(document.getElementById('inicio'));
initViewer(document.getElementById('viewer'));
initMinis();
initCounters();

// salto direto para uma secção/semana (ex.: /#m1 ou /#semana-5)
if (location.hash) requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView());
