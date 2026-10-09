// Utilitários partilhados: caminhos, escape de HTML, marcação de [A CONFIRMAR] e slots de media.

export const asset = (p) => new URL(p, document.baseURI).href;

const ENT = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ENT[c]);

const TBC = /\[(?:FALTA[^\]]*|A CONFIRMAR[^\]]*|VÍDEO[^\]]*)\]/g;
/** Escapa e destaca os placeholders (para nunca passarem despercebidos). */
export const tbc = (s) => esc(s).replace(TBC, (m) => `<mark class="tbc">${m}</mark>`);

/** Verifica se um ficheiro existe (o servidor de desenvolvimento devolve HTML para ficheiros em falta). */
const existsCache = new Map();
export function exists(file) {
  if (!existsCache.has(file)) {
    existsCache.set(
      file,
      fetch(asset(file), { method: 'HEAD' })
        .then((r) => r.ok && !(r.headers.get('content-type') || '').includes('text/html'))
        .catch(() => false),
    );
  }
  return existsCache.get(file);
}

/** Linha de cota (dimension line) em SVG sobre uma imagem. cota = { label, dir: 'h' | 'v' } */
function cotaSvg(cota) {
  if (!cota) return '';
  const l = esc(cota.label);
  if (cota.dir === 'v') {
    return `<svg class="dim" viewBox="0 0 160 90" aria-hidden="true">
      <line class="ext" x1="16" y1="12" x2="34" y2="12"/><line class="ext" x1="16" y1="78" x2="34" y2="78"/>
      <line x1="24" y1="12" x2="24" y2="78"/>
      <path d="M20 19 L24 12 L28 19 M20 71 L24 78 L28 71"/>
      <text x="32" y="48" transform="rotate(-90 32 48)" text-anchor="middle">${l}</text></svg>`;
  }
  return `<svg class="dim" viewBox="0 0 160 90" aria-hidden="true">
    <line class="ext" x1="22" y1="68" x2="22" y2="82"/><line class="ext" x1="138" y1="68" x2="138" y2="82"/>
    <line x1="22" y1="76" x2="138" y2="76"/>
    <path d="M29 72 L22 76 L29 80 M131 72 L138 76 L131 80"/>
    <text x="80" y="70" text-anchor="middle">${l}</text></svg>`;
}

/**
 * Slot de media. Mostra o ficheiro se existir; caso contrário, uma caixa a indicar
 * exatamente que ficheiro colocar e onde. cfg = { kind, file, desc, size, alt, credito }
 */
export function slot(cfg, { ar = '', cota = null, extra = '' } = {}) {
  const kind = cfg.kind || 'image';
  const what = kind === 'video' ? 'vídeo' : 'imagem';
  const desc = cfg.desc ? `<span class="d">${esc(cfg.desc)}</span>` : '';
  const size = cfg.size ? `<span class="s">${esc(cfg.size)}</span>` : '';
  const media =
    kind === 'video'
      ? `<video data-src="${esc(cfg.file)}" muted loop playsinline controls autoplay preload="metadata" aria-label="${esc(cfg.alt || cfg.desc || '')}"></video>`
      : `<img data-src="${esc(cfg.file)}" alt="${esc(cfg.alt || '')}" loading="lazy" decoding="async" />`;
  const cred = cfg.credito ? `<span class="cred">${esc(cfg.credito)}</span>` : '';
  return `<figure class="slot ${ar} ${extra}" data-slot="${esc(cfg.file)}">
    ${media}${cotaSvg(cota)}
    <div class="ph" role="img" aria-label="Falta ${what}: ${esc(cfg.alt || cfg.desc || cfg.file)}">
      <span class="miss">FALTA ${what.toUpperCase()}</span>${desc}<span class="f">${esc(cfg.file)}</span>${size}
    </div>${cred}</figure>`;
}

/** Procura, em todos os slots dentro de `root`, o ficheiro e mostra-o se existir. */
export function hydrateSlots(root = document) {
  root.querySelectorAll('figure.slot:not([data-hydrated])').forEach((fig) => {
    fig.dataset.hydrated = '1';
    const el = fig.querySelector('img, video');
    const src = asset(el.dataset.src);
    if (el.tagName === 'IMG') {
      const probe = new Image();
      probe.onload = () => {
        el.src = src;
        fig.classList.add('has-media');
        if (fig.closest('.week')) {
          // slides das semanas: abrem em ponto grande ao clicar
          fig.tabIndex = 0;
          fig.setAttribute('role', 'button');
          fig.setAttribute('aria-label', `Ampliar: ${el.alt}`);
        }
      };
      probe.src = src;
    } else {
      exists(el.dataset.src).then((ok) => {
        if (!ok) return;
        if (reducedMotion()) el.removeAttribute('autoplay'); // sem movimento automático se o utilizador o pediu
        el.src = src;
        fig.classList.add('has-media');
      });
    }
  });
}

/** Revelação suave ao fazer scroll. */
export function revealOnScroll(root = document) {
  const els = root.querySelectorAll('.rv:not(.in)');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach((e) => e.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  els.forEach((e) => io.observe(e));
}

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isMobile = () => matchMedia('(max-width: 767px)').matches;

export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && c.getContext('webgl2')) || !!c.getContext('webgl');
  } catch {
    return false;
  }
}

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const fmt = (n, d = 0) => new Intl.NumberFormat('pt-PT', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);

export const icon = {
  reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
  explode: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 9V3m0 0-2.5 2.5M12 3l2.5 2.5M12 15v6m0 0-2.5-2.5M12 21l2.5-2.5M9 12H3m0 0 2.5-2.5M3 12l2.5 2.5M15 12h6m0 0-2.5-2.5M21 12l-2.5 2.5"/><circle cx="12" cy="12" r="1.5"/></svg>',
  full: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>',
  rotate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 3 18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 4.2-.9M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v13m0 0-5-5m5 5 5-5M4 21h16"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
  prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
};
