import './styles.css';
import { renderTopbar, renderSubnav, renderRodape, renderEgg } from './render.js';
import { asset } from './lib/util.js';
import { initProgress, initSol, initLightbox, initEgg } from './modules/ui.js';
import { startRouter } from './router.js';

addEventListener('unhandledrejection', (e) => console.error('[erro]', e.reason));
addEventListener('error', (e) => console.error('[erro]', e.message));

const put = (id, html) => (document.getElementById(id).innerHTML = html);

// Estrutura fixa (topo, submenu e rodapé); o conteúdo de cada página é montado pelo router.
put('topbar', renderTopbar());
put('subnav', renderSubnav());
put('rodape', renderRodape());

// Logótipo DGO em SVG inline (herda a cor do texto).
fetch(asset('media/logo/dgo-logo.svg'))
  .then((r) => (r.ok ? r.text() : ''))
  .then((svg) => {
    if (svg.startsWith('<svg')) document.querySelectorAll('.logo-slot').forEach((el) => (el.innerHTML = svg));
  })
  .catch(() => {});

// «Saltar para o conteúdo»: não pode mudar o hash, senão o router mudava de página.
document.querySelector('.skip')?.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('page').focus();
});

initProgress();
initSol();
initLightbox();
initEgg(renderEgg());
startRouter();
