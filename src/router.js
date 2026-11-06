// Router por hash (#/historia, #/m0/montagem, #/m1/viagem/europa…): cada página é montada de raiz e a anterior é limpa.
// Funciona em GitHub Pages sem configuração extra e o modelo 3D só é carregado uma vez.
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import site from './content/site.json';
import m1 from './content/m1.json';
import m2 from './content/m2.json';
import * as R from './render.js';
import { esc, hydrateSlots, icon, reducedMotion, revealOnScroll } from './lib/util.js';
import { onLeave, runCleanups } from './lib/lifecycle.js';
import { initCounters, initMarsVsEarth, initTimeline, paintSol, initDownloadButtons } from './modules/ui.js';
import { initHero } from './modules/hero.js';
import { initViewer } from './modules/viewer.js';
import { initRocker } from './modules/rocker.js';
import { initGens } from './modules/gens.js';
import { initViagem } from './modules/viagem.js';
import { initSuspensao } from './modules/suspensao.js';

/** Secção cujo conteúdo já vem com o seu próprio `.wrap`. */
const raw = (cls, inner, label = '', id = '') => `<section ${id ? `id="${id}"` : ''} class="sec ${cls}" ${label ? `aria-labelledby="${label}"` : ''}>${inner}</section>`;
const wrap = (x) => `<div class="wrap">${x}</div>`;

/** Índice das secções de uma página corrida. */
const indice = (base, secs, tipo = '') =>
  `<nav class="pg-tabs ${tipo}" aria-label="Secções desta página">${secs
    .map((t, i) => `<a href="#${base}/${t.id}" data-alvo="${base.slice(1)}-${t.id}"><span class="mono">${String(i + 1).padStart(2, '0')}</span>${esc(t.rotulo)}</a>`)
    .join('')}</nav>`;

/** Uma secção da página, com a âncora própria (ex.: m0-estrategia). */
const bloco = (base, t) => `<div class="pg-sec" id="${base.slice(1)}-${t.id}">${t.render()}</div>`;

const M0_SECS = [
  { id: 'semanas', rotulo: 'Semana a semana', render: R.m0Semanas },
  { id: 'estrategia', rotulo: 'Estratégia e subsistemas', render: R.m0Estrategia },
  { id: 'montagem', rotulo: 'Montagem e render', render: R.m0Montagem },
  { id: 'processo', rotulo: 'Processo e próximo passo', render: R.m0Processo },
];

const M1_SECS = [
  { id: 'viagem', rotulo: 'Escolhe a próxima viagem', render: R.renderViagem },
  { id: 'estrategia', rotulo: 'Estratégia', render: R.m1Estrategia },
  { id: 'braco', rotulo: 'Braço', render: R.m1Braco },
  { id: 'chassis', rotulo: 'Chassis', render: R.m1Chassis },
  { id: 'suspensao', rotulo: 'Suspensão', render: R.m1Suspensao },
  { id: 'semanas', rotulo: 'Semana a semana', render: R.m1Semanas },
];

/** M1: a viagem ocupa a largura toda da janela; o índice fica fixo por cima de tudo o que vem a seguir. */
function m1Page() {
  const [viagem, ...resto] = M1_SECS;
  return {
    html: `${raw('light grid-mm sec-cabeca', wrap(R.m1Head()))}
      ${indice('/m1', M1_SECS, 'banda')}
      ${raw('dark sec-viagem', bloco('/m1', viagem))}
      ${raw('dark sec-cola', wrap(resto.map((t) => bloco('/m1', t)).join('')))}`,
  };
}

const estado = (k) => (k === 'm0' || !{ m1, m2 }[k].wip?.ativo ? site.inicio.estadoConcluido : { m1, m2 }[k].wip.estado);

function homePage() {
  const h = site.inicio;
  return {
    html: `<section id="inicio" class="hero dark" aria-label="Início">${R.renderHero()}</section>
      <section id="sobre" class="sec dark sobre-sec" aria-label="Sobre este projeto">${R.renderSobre()}</section>
      ${raw(
        'dark home-map',
        wrap(`<header class="sec-head rv"><p class="eyebrow">${esc(h.eyebrow)}</p><h2 id="mapa-t">${esc(h.titulo)}</h2><p class="lead">${esc(h.texto)}</p></header>
        <div class="home-cards">${h.cartoes
          .map(
            (c) => `<a class="home-card rv" href="#${c.rota}"><span class="hc-code mono">${esc(c.codigo)}</span>
              <span class="hc-t">${esc(c.titulo)}</span><span class="hc-p">${esc(c.texto)}</span>
              ${c.estado ? `<span class="hc-state ${estado(c.estado) === h.estadoConcluido ? 'ok' : ''}">${esc(estado(c.estado))}</span>` : ''}
              <span class="hc-go" aria-hidden="true">→</span></a>`,
          )
          .join('')}</div>`),
        'mapa-t',
      )}
      ${raw('dark home-ia', R.renderIA(), 'ia-t')}`,
    init: (el) => initHero(el.querySelector('#inicio')),
  };
}

/** Todas as páginas. `nav` = item do menu principal; `sub` = mostra o submenu «O Nosso Projeto». */
const PAGES = {
  '': { id: 'inicio', nav: 'inicio', home: true },
  historia: { id: 'historia', nav: 'historia', render: () => ({ html: raw('light grid-mm', R.renderHistoria(), 'historia-t') }) },
  projeto: {
    id: 'projeto',
    nav: 'projeto',
    sub: true,
    render: () => ({
      html: `${raw('dark', R.renderObjetivo(), 'objetivo-t', 'projeto-objetivo')}
        ${raw('dark sec-cola', R.renderProjetoIntro(), 'projeto-t', 'projeto-atos')}
        ${raw('light grid-mm', R.renderPorque(), 'porque-t', 'projeto-porque')}`,
    }),
  },
  m0: { id: 'm0', nav: 'projeto', sub: true, render: () => ({ html: raw('dark', wrap(`${R.m0Head()}${indice('/m0', M0_SECS, 'fixa')}${M0_SECS.map((t) => bloco('/m0', t)).join('')}`), 'm0-t') }) },
  m1: { id: 'm1', nav: 'projeto', sub: true, render: m1Page },
  m2: { id: 'm2', nav: 'projeto', sub: true, render: () => ({ html: raw('dark', wrap(`${R.m2Head()}${R.m2Corpo()}`), 'm2-t') }) },
  equipa: { id: 'equipa', nav: 'equipa', render: () => ({ html: raw('light grid-mm', R.renderEquipa(), 'equipa-t') }) },
};

/** Ordem de leitura do relatório. */
const ORDEM = ['', 'historia', 'projeto', 'm0', 'm1', 'm2', 'equipa'];

/** Botões «Anterior» e «Seguinte» no fim de cada página. */
function pager(def) {
  const i = ORDEM.findIndex((k) => PAGES[k] === def);
  const link = (k, cls, rot, ic) =>
    k === undefined ? '' : `<a class="pager-l ${cls}" href="#/${k}"><span class="pager-ic">${ic}</span><span><small>${esc(rot)}</small><b>${esc(site.paginas[PAGES[k].id])}</b></span></a>`;
  const n = site.paginacao;
  return `<nav class="pager dark" aria-label="${esc(n.rotulo)}">${link(ORDEM[i - 1], 'ant', n.anterior, icon.prev)}${link(ORDEM[i + 1], 'seg', n.seguinte, icon.next)}</nav>`;
}

/* Ligações antigas (#historia, #semana-5, #viewer…) → rotas novas. */
const LEGACY = { inicio: '/', sobre: '/', historia: '/historia', objetivo: '/projeto/objetivo', projeto: '/projeto', porque: '/projeto/porque', m0: '/m0', m1: '/m1', m2: '/m2', equipa: '/equipa', viewer: '/m0/montagem/viewer', 'viewer-bloco': '/m0/montagem', generativo: '/m0/processo/generativo' };
function legacy(id) {
  if (LEGACY[id]) return LEGACY[id];
  const w = id.match(/^semana-(\d+)$/);
  if (w) return R.weekRoute(w[1]);
  if (id.startsWith('metodo-') || id.startsWith('sub-')) return `/m0/estrategia/${id}`;
  return null;
}

function parse() {
  let h = location.hash;
  if (!h.startsWith('#/')) {
    const r = legacy(h.slice(1));
    h = `#${r || '/'}`;
    history.replaceState(null, '', h);
  }
  // Páginas que passaram a fazer parte de «O nosso projeto».
  const antiga = { objetivo: '/projeto/objetivo', porque: '/projeto/porque' }[h.slice(2).split('/')[0]];
  if (antiga) {
    h = `#${antiga}`;
    history.replaceState(null, '', h);
  }
  const [page = '', tab, extra] = h.slice(2).split('/').map(decodeURIComponent);
  return { page: PAGES[page] ? page : '', tab, extra };
}

function setNav(def) {
  document.querySelectorAll('#nav a').forEach((a) => a.setAttribute('aria-current', String(a.dataset.sec === def.nav)));
  const sub = document.getElementById('subnav');
  sub.hidden = !def.sub;
  document.body.classList.toggle('inner', !def.home);
  document.body.classList.toggle('has-sub', !!def.sub);
  sub.querySelectorAll('a').forEach((a) => a.setAttribute('aria-current', String(a.dataset.sec === def.id)));
}

/** Elemento pedido pela rota (ex.: #/m0/estrategia/metodo-A ou #/projeto/porque). */
function alvo(page, tab, extra) {
  return (extra && document.getElementById(extra)) || (tab && (document.getElementById(`${page}-${tab}`) || document.getElementById(tab))) || null;
}

/**
 * Vai até à secção e mantém-na no sítio enquanto as imagens acima dela carregam e mudam a altura da página.
 * Para assim que a pessoa mexe na página, ou ao fim de 8 segundos.
 */
function irPara(sec, suave = false) {
  const animar = suave && !reducedMotion();
  sec.scrollIntoView({ block: 'start', behavior: animar ? 'smooth' : 'instant' });
  const acertar = () => sec.scrollIntoView({ block: 'start', behavior: 'instant' });
  const ro = new ResizeObserver(acertar);
  const manter = () => {
    acertar();
    ro.observe(document.getElementById('page'));
  };
  // Com scroll suave, só se fixa a posição depois de a animação acabar.
  const inicio = animar ? setTimeout(manter, 1200) : null;
  const parar = () => {
    ro.disconnect();
    clearTimeout(inicio);
    clearTimeout(limite);
    EVENTOS.forEach((n) => removeEventListener(n, parar));
  };
  const limite = setTimeout(parar, 8000);
  EVENTOS.forEach((n) => addEventListener(n, parar, { passive: true }));
  onLeave(parar);
  if (!animar) manter();
}
const EVENTOS = ['wheel', 'touchstart', 'keydown', 'pointerdown'];

/** Índice da página: leva à secção sem remontar a página e acompanha o scroll. */
function initIndice(el) {
  const nav = el.querySelector('.pg-tabs');
  if (!nav) return;
  const links = [...nav.querySelectorAll('a')];
  const marcar = (id) => links.forEach((a) => (a.dataset.alvo === id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
  links.forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      history.replaceState(null, '', a.getAttribute('href'));
      const sec = document.getElementById(a.dataset.alvo);
      if (sec) irPara(sec, true);
    }),
  );
  // A secção atual é a última cujo início já passou de 40 % da altura da janela.
  const secs = links.map((a) => document.getElementById(a.dataset.alvo)).filter(Boolean);
  let pendente = false;
  const atualizar = () => {
    pendente = false;
    const limite = innerHeight * 0.4;
    const cur = secs.filter((x) => x.getBoundingClientRect().top <= limite).pop() || secs[0];
    marcar(cur.id);
  };
  const aoRolar = () => {
    if (pendente) return;
    pendente = true;
    requestAnimationFrame(atualizar);
  };
  addEventListener('scroll', aoRolar, { passive: true });
  onLeave(() => removeEventListener('scroll', aoRolar));
  atualizar();
}

function mount(def, tab, extra, firstLoad) {
  runCleanups();
  ScrollTrigger.getAll().forEach((t) => t.kill(true));

  const el = document.getElementById('page');
  const out = def.home ? homePage() : def.render();
  el.innerHTML = out.html + pager(def);
  el.dataset.page = def.id;
  setNav(def);

  document.title = def.home ? 'Perseverance, peça a peça · DGO 2026/27' : `${site.paginas[def.id]} · Perseverance, peça a peça`;

  hydrateSlots(el);
  revealOnScroll(el);
  paintSol();
  initTimeline();
  initMarsVsEarth();
  initRocker(el.querySelector('[data-rb]'));
  initGens(el.querySelector('[data-gens]'));
  initDownloadButtons(site.download.nota);
  initCounters();
  initViewer(el.querySelector('#viewer'));
  initViagem(el.querySelector('[data-viagem]'), extra);
  initSuspensao(el.querySelector('[data-suspensao]'));
  out.init?.(el);
  initIndice(el);

  // Posição: topo da página, ou a secção pedida.
  const anchor = alvo(el.dataset.page, tab, extra);
  scrollTo({ top: 0, behavior: 'instant' });
  if (anchor) requestAnimationFrame(() => irPara(anchor));
  ScrollTrigger.refresh();
  dispatchEvent(new Event('scroll')); // atualiza a barra de progresso
  if (!firstLoad) el.focus({ preventScroll: true }); // leitores de ecrã anunciam a nova página
}

export function startRouter() {
  history.scrollRestoration = 'manual'; // recarregar a meio da página não pode saltar a animação inicial
  let first = true;
  let atual = null;
  const route = () => {
    const { page, tab, extra } = parse();
    // Dentro da mesma página basta ir à secção: não se volta a carregar nada.
    if (page === atual) {
      const a = alvo(PAGES[page].id, tab, extra);
      if (a) irPara(a, true);
      else if (!tab) scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
      return;
    }
    atual = page;
    mount(PAGES[page], tab, extra, first);
    first = false;
  };
  addEventListener('hashchange', route);
  route();
}
