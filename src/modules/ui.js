// Interações da página: navegação, progresso, contadores, cronologia, Sol, easter egg.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { esc, fmt, icon, reducedMotion, asset } from '../lib/util.js';
import { historiaEvents } from '../render.js';

gsap.registerPlugin(ScrollTrigger);

/* ───────── Barra de progresso de leitura (a navegação ativa é do router) ───────── */
export function initProgress() {
  const bar = document.getElementById('progress-bar');
  let ticking = false;
  const update = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  };
  addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  addEventListener('resize', update);
  update();
  return update;
}

/* ───────── Contadores animados ───────── */
export function initCounters() {
  document.querySelectorAll('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    if (reducedMotion()) {
      el.textContent = fmt(end);
      return;
    }
    const o = { v: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 1.8, ease: 'power3.out', onUpdate: () => (el.textContent = fmt(Math.round(o.v))) }),
    });
    el.textContent = '0';
  });
}

/* ───────── Peso na Terra vs Marte ───────── */
export function initMarsVsEarth() {
  const host = document.querySelector('[data-mve]');
  if (!host) return;
  const m = 1025;
  const wE = m * 9.80665;
  const wM = m * 3.73;
  const rows = [
    { k: 'Terra', v: wE, pct: 100, cls: '' },
    { k: 'Marte', v: wM, pct: (wM / wE) * 100, cls: 'mars' },
  ];
  host.innerHTML = rows
    .map(
      (r) => `<div class="bar ${r.cls}"><div class="bar-top"><span>${r.k}</span><span>${fmt(Math.round(r.v))} N${r.cls ? ` · ${fmt(r.pct, 0)} %` : ''}</span></div>
      <div class="bar-track" role="img" aria-label="Peso do rover em ${r.k}: ${fmt(Math.round(r.v))} newton"><div class="bar-fill" data-w="${r.pct}"></div></div></div>`,
    )
    .join('');
  const fills = host.querySelectorAll('.bar-fill');
  const set = () => fills.forEach((f) => (f.style.width = f.dataset.w + '%'));
  if (reducedMotion()) return set();
  ScrollTrigger.create({ trigger: host, start: 'top 85%', once: true, onEnter: set });
}

/* ───────── Cronologia interativa ───────── */
export function initTimeline() {
  const root = document.querySelector('[data-tl]');
  if (!root) return;
  const tabs = [...root.querySelectorAll('.tl-tab')];
  const panel = root.querySelector('.tl-panel');
  const show = (i, focus = false) => {
    const e = historiaEvents[i];
    tabs.forEach((t, k) => {
      t.setAttribute('aria-selected', String(k === i));
      t.tabIndex = k === i ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', 'tl-t' + i);
    panel.innerHTML = `<div><p class="when">${esc(e.rotulo)}</p><h3>${esc(e.titulo)}</h3><p>${esc(e.texto)}</p></div>
      ${e.imagem ? `<figure><img src="${asset(e.imagem.file)}" alt="${esc(e.imagem.alt)}" loading="lazy" width="800" height="450" style="width:100%;height:auto;max-height:340px;object-fit:cover;border:1px solid var(--ink)"/><figcaption class="credit">${esc(e.imagem.credito)}</figcaption></figure>` : '<div class="noimg" aria-hidden="true">PRV · ' + esc(e.rotulo) + '</div>'}`;
    if (focus) tabs[i].focus();
    tabs[i].scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
  };
  tabs.forEach((t, i) => t.addEventListener('click', () => show(i)));
  root.querySelector('.tl-rail').addEventListener('keydown', (e) => {
    const cur = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    const map = { ArrowRight: cur + 1, ArrowLeft: cur - 1, Home: 0, End: tabs.length - 1 };
    if (e.key in map) {
      e.preventDefault();
      show(Math.max(0, Math.min(tabs.length - 1, map[e.key])), true);
    }
  });
  show(0);
}

/* ───────── Sol marciano ───────── */
const LANDING = Date.UTC(2021, 1, 18, 20, 55, 0); // Sol 0: aterragem em Jezero
const SOL_MS = 88775.244 * 1000;

export function paintSol() {
  const sol = Math.floor((Date.now() - LANDING) / SOL_MS);
  document.querySelectorAll('[data-sol]').forEach((e) => (e.textContent = fmt(sol)));
}
export function initSol() {
  paintSol();
  setInterval(paintSol, 60000);
}

/* ───────── Easter egg: «Dare Mighty Things» ───────── */
export function initEgg(html) {
  const egg = document.getElementById('egg');
  egg.innerHTML = html;
  const chute = egg.querySelector('[data-chute]');
  chute.innerHTML = 'DARE MIGHTY THINGS'
    .split(' ')
    .map((w) => [...w].map((c) => `<div><b>${c}</b><span>${c.charCodeAt(0).toString(2).padStart(7, '0')}</span></div>`).join(''))
    .join('<div style="grid-column:1/-1;border:0;padding:0;height:6px"></div>');
  let last = null;
  const close = () => {
    egg.hidden = true;
    last?.focus?.();
  };
  const open = () => {
    last = document.activeElement;
    egg.hidden = false;
    egg.querySelector('[data-egg-close]').focus();
  };
  egg.querySelector('[data-egg-close]').addEventListener('click', close);
  egg.addEventListener('click', (e) => e.target === egg && close());
  let buf = '';
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !egg.hidden) return close();
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
    buf = (buf + e.key.toLowerCase()).slice(-4);
    if (buf === 'dare') open();
  });
  console.info('%cDare Mighty Things', 'color:#ff7a00;font-weight:700;font-size:14px');
}

/* ───────── Botão de CAD ainda indisponível ───────── */
let toast;
let timer;
export function initDownloadButtons(msg) {
  document.querySelectorAll('[data-nodownload]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        toast.setAttribute('role', 'status');
        document.body.appendChild(toast);
      }
      toast.textContent = a.dataset.aviso || msg;
      toast.classList.add('show');
      clearTimeout(timer);
      timer = setTimeout(() => toast.classList.remove('show'), 5000);
    }),
  );
}

/* ───────── Ampliar os slides das semanas (com galeria) ───────── */
export function initLightbox() {
  let box, img, cap, last;
  let items = [];
  let idx = 0;
  const show = () => {
    const it = items[idx];
    img.src = it.src;
    img.alt = it.alt;
    cap.textContent = items.length > 1 ? `${idx + 1} / ${items.length}` : '';
    box.classList.toggle('single', items.length < 2);
  };
  const close = () => {
    if (!box) return;
    box.hidden = true;
    last?.focus?.();
  };
  const step = (d) => {
    idx = (idx + d + items.length) % items.length;
    show();
  };
  const open = (list, i, from) => {
    if (!box) {
      box = document.createElement('div');
      box.className = 'lightbox';
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-modal', 'true');
      box.setAttribute('aria-label', 'Imagem ampliada');
      box.innerHTML = `<button class="icon-btn lb-close" aria-label="Fechar">${icon.close}</button>
        <button class="icon-btn lb-prev" aria-label="Slide anterior">${icon.prev}</button>
        <img alt="" /><button class="icon-btn lb-next" aria-label="Slide seguinte">${icon.next}</button><span class="lb-cap" aria-live="polite"></span>`;
      img = box.querySelector('img');
      cap = box.querySelector('.lb-cap');
      box.addEventListener('click', (e) => {
        if (e.target.closest('.lb-prev')) return step(-1);
        if (e.target.closest('.lb-next')) return step(1);
        close();
      });
      document.body.appendChild(box);
    }
    last = from;
    items = list;
    idx = i;
    show();
    box.hidden = false;
    box.querySelector('.lb-close').focus();
  };
  document.addEventListener('click', (e) => {
    const t = e.target.closest('.gal-t');
    if (t) {
      const group = [...document.querySelectorAll(`.gal-t[data-gal="${t.dataset.gal}"]`)];
      return open(group.map((g) => ({ src: asset(g.dataset.full), alt: g.dataset.alt })), group.indexOf(t), t);
    }
    const fig = e.target.closest('.week .slot.has-media, .m1-slot .slot.has-media');
    if (fig) {
      const im = fig.querySelector('img');
      if (im?.src) open([{ src: im.src, alt: im.alt }], 0, fig);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (box && !box.hidden) {
      if (e.key === 'Escape') return close();
      if (e.key === 'ArrowRight') return step(1);
      if (e.key === 'ArrowLeft') return step(-1);
    }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('.week .slot.has-media')) {
      e.preventDefault();
      e.target.click();
    }
  });
}
