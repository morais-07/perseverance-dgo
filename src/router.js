// Router por hash (#/historia, #/m0/montagem, #/m1/viagem/europa…): cada página é montada de raiz e a anterior é limpa.
// Funciona em GitHub Pages sem configuração extra e o modelo 3D só é carregado uma vez.
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import site from './content/site.json';
import m1 from './content/m1.json';
import m2 from './content/m2.json';
import * as R from './render.js';
import { esc, hydrateSlots, icon, revealOnScroll } from './lib/util.js';
import { runCleanups } from './lib/lifecycle.js';
import { initCounters, initMarsVsEarth, initTimeline, initBeforeAfter, initSubTabs, paintSol, initDownloadButtons } from './modules/ui.js';
import { initHero } from './modules/hero.js';
import { initViewer } from './modules/viewer.js';
import { initMinis } from './modules/mini.js';
import { initRocker } from './modules/rocker.js';
import { initGens } from './modules/gens.js';
import { initViagem } from './modules/viagem.js';

/** Secção cujo conteúdo já vem com o seu próprio `.wrap`. */
const raw = (cls, inner, label = '') => `<section class="sec ${cls}" ${label ? `aria-labelledby="${label}"` : ''}>${inner}</section>`;
const wrap = (x) => `<div class="wrap">${x}</div>`;

/** Navegação por separadores dentro de uma página (M0, M1). */
const tabsNav = (base, tabs, cur) =>
  `<nav class="pg-tabs" aria-label="Secções desta página">${tabs
    .map((t, i) => `<a href="#${base}/${t.id}" ${t.id === cur ? 'aria-current="page"' : ''}><span class="mono">${String(i + 1).padStart(2, '0')}</span>${esc(t.rotulo)}</a>`)
    .join('')}</nav>`;

/** Página com separadores: devolve o separador pedido (ou o primeiro). */
function tabbed(base, cls, head, tabs, tab) {
  const cur = tabs.find((t) => t.id === tab) || tabs[0];
  // Um separador «full» ocupa a largura toda da janela, por isso fica fora do `.wrap`.
  const top = `${head}${tabsNav(base, tabs, cur.id)}`;
  const html = cur.full ? raw(`${cls} sec-full`, `${wrap(top)}${cur.render()}`) : raw(cls, wrap(`${top}<div class="pg-body">${cur.render()}</div>`));
  return { tab: cur.id, html };
}

const M0_TABS = [
  { id: 'semanas', rotulo: 'Semana a semana', render: R.m0Semanas },
  { id: 'estrategia', rotulo: 'Estratégia e subsistemas', render: R.m0Estrategia },
  { id: 'montagem', rotulo: 'Montagem e render', render: R.m0Montagem },
  { id: 'processo', rotulo: 'Processo e design generativo', render: R.m0Processo },
];

const m1Tabs = () =>
  m1.wip?.ativo
    ? [
        { id: 'viagem', rotulo: 'Escolhe a próxima viagem', render: R.renderViagem, full: true },
        { id: 'plano', rotulo: 'Plano e estado', render: R.m1Plano },
      ]
    : [
        { id: 'viagem', rotulo: 'Escolhe a próxima viagem', render: R.renderViagem, full: true },
        { id: 'semanas', rotulo: 'Semana a semana', render: R.m1Semanas },
        { id: 'subsistemas', rotulo: 'Subsistemas', render: R.m1Subsistemas },
        { id: 'parametrizacao', rotulo: 'Parametrização e simulação', render: R.m1Parametrizacao },
      ];

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
  objetivo: { id: 'objetivo', nav: 'objetivo', render: () => ({ html: raw('dark', R.renderObjetivo(), 'objetivo-t') }) },
  projeto: { id: 'projeto', nav: 'projeto', sub: true, render: () => ({ html: raw('dark', R.renderProjetoIntro(), 'projeto-t') }) },
  porque: { id: 'porque', nav: 'projeto', sub: true, render: () => ({ html: raw('light grid-mm', R.renderPorque(), 'porque-t') }) },
  m0: { id: 'm0', nav: 'projeto', sub: true, tabs: () => M0_TABS, render: (tab) => tabbed('/m0', 'dark', R.m0Head(), M0_TABS, tab) },
  m1: { id: 'm1', nav: 'projeto', sub: true, tabs: m1Tabs, render: (tab) => tabbed('/m1', 'light grid-mm', R.m1Head(), m1Tabs(), tab) },
  m2: { id: 'm2', nav: 'projeto', sub: true, render: () => ({ html: raw('dark', wrap(`${R.m2Head()}${R.m2Corpo()}`), 'm2-t') }) },
  equipa: { id: 'equipa', nav: 'equipa', render: () => ({ html: raw('light grid-mm', R.renderEquipa(), 'equipa-t') }) },
};

/** Ordem de leitura do relatório: todas as páginas e, dentro delas, todos os separadores. */
const ORDEM = ['', 'historia', 'objetivo', 'projeto', 'porque', 'm0', 'm1', 'm2', 'equipa'];
function sequencia() {
  return ORDEM.flatMap((k) => {
    const def = PAGES[k];
    if (!def.tabs) return [{ id: def.id, tab: '', rota: `/${k}`, titulo: site.paginas[def.id] }];
    return def.tabs().map((t) => ({ id: def.id, tab: t.id, rota: `/${k}/${t.id}`, titulo: `${def.id.toUpperCase()} · ${t.rotulo}` }));
  });
}

/** Botões «Anterior» e «Seguinte» no fim de cada página. */
function pager(def, tab) {
  const seq = sequencia();
  const i = seq.findIndex((p) => p.id === def.id && p.tab === (tab || ''));
  const link = (p, cls, rot, ic) =>
    p ? `<a class="pager-l ${cls}" href="#${p.rota}"><span class="pager-ic">${ic}</span><span><small>${esc(rot)}</small><b>${esc(p.titulo)}</b></span></a>` : '';
  const n = site.paginacao;
  return `<nav class="pager dark" aria-label="${esc(n.rotulo)}">${link(seq[i - 1], 'ant', n.anterior, icon.prev)}${link(seq[i + 1], 'seg', n.seguinte, icon.next)}</nav>`;
}

/* Ligações antigas (#historia, #semana-5, #viewer…) → rotas novas. */
const LEGACY = { inicio: '/', sobre: '/', historia: '/historia', objetivo: '/objetivo', projeto: '/projeto', porque: '/porque', m0: '/m0', m1: '/m1', m2: '/m2', equipa: '/equipa', viewer: '/m0/montagem/viewer', 'viewer-bloco': '/m0/montagem', generativo: '/m0/processo/generativo' };
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

function mount(def, tab, extra, firstLoad) {
  runCleanups();
  ScrollTrigger.getAll().forEach((t) => t.kill(true));

  const el = document.getElementById('page');
  const out = def.home ? homePage() : def.render(tab);
  el.innerHTML = out.html + pager(def, out.tab);
  el.dataset.page = def.id;
  el.dataset.tab = out.tab || '';
  setNav(def);

  const tabLabel = out.tab ? ` · ${def.tabs().find((x) => x.id === out.tab)?.rotulo}` : '';
  document.title = def.home ? 'Perseverance, peça a peça · DGO 2026/27' : `${site.paginas[def.id]}${tabLabel} · Perseverance, peça a peça`;

  hydrateSlots(el);
  revealOnScroll(el);
  paintSol();
  initTimeline();
  initMarsVsEarth();
  initBeforeAfter();
  initSubTabs();
  initRocker(el.querySelector('[data-rb]'));
  initGens(el.querySelector('[data-gens]'));
  initDownloadButtons(site.download.nota);
  initCounters();
  initViewer(el.querySelector('#viewer'));
  initMinis(el);
  initViagem(el.querySelector('[data-viagem]'), extra);
  out.init?.(el);

  // Posição: topo da página, ou a âncora pedida (ex.: #/m0/estrategia/metodo-A).
  const anchorId = def.tabs ? (out.tab === 'viagem' ? null : extra) : tab;
  const anchor = anchorId ? document.getElementById(anchorId) : null;
  scrollTo({ top: 0, behavior: 'instant' });
  if (anchor) requestAnimationFrame(() => anchor.scrollIntoView({ block: 'start', behavior: 'instant' }));
  ScrollTrigger.refresh();
  dispatchEvent(new Event('scroll')); // atualiza a barra de progresso
  if (!firstLoad) el.focus({ preventScroll: true }); // leitores de ecrã anunciam a nova página
}

export function startRouter() {
  history.scrollRestoration = 'manual'; // recarregar a meio da página não pode saltar a animação inicial
  let first = true;
  const route = () => {
    const { page, tab, extra } = parse();
    mount(PAGES[page], tab, extra, first);
    first = false;
  };
  addEventListener('hashchange', route);
  route();
}
