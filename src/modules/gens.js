// Gerações da otimização: carrossel de imagens + gráfico da massa por iteração (SVG, a partir de m2.json).
import m2 from '../content/m2.json';
import { slot, hydrateSlots, fmt } from '../lib/util.js';

export function initGens(root) {
  if (!root) return;
  const its = m2.otimizacao.iteracoes;
  const view = root.querySelector('[data-genview]');
  const range = root.querySelector('input[type="range"]');
  const chartEl = root.querySelector('[data-chart]');
  const prev = root.querySelector('[data-prev]');
  const next = root.querySelector('[data-next]');

  view.innerHTML =
    its
      .map(
        (g, i) =>
          `<div class="gen" data-i="${i}" ${i ? 'hidden' : ''}>${slot({
            kind: 'image',
            file: g.slotFile,
            desc: `Geração ${g.gen} da otimização topológica: forma obtida e mapa de tensões.`,
            size: '1600×900',
            alt: `Geração ${g.gen} da otimização da peça em estudo.`,
          })}</div>`,
      )
      .join('') + `<span class="gen-label" aria-live="polite"></span>`;
  hydrateSlots(view);
  const label = view.querySelector('.gen-label');

  const vals = its.map((g) => g.massa_kg);
  const have = vals.filter((v) => typeof v === 'number');

  const W = 480, H = 300, L = 56, Rr = 16, T = 20, B = 46;
  const drawChart = (cur) => {
    const xs = (i) => L + (its.length === 1 ? 0 : (i / (its.length - 1)) * (W - L - Rr));
    let lo = 0, hi = 1;
    if (have.length) {
      lo = Math.min(...have);
      hi = Math.max(...have);
      const pad = (hi - lo || hi || 1) * 0.15;
      lo = Math.max(0, lo - pad);
      hi += pad;
    }
    const ys = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico da massa da peça ao longo das gerações da otimização">`;
    for (let k = 0; k <= 4; k++) {
      const y = T + (k / 4) * (H - T - B);
      s += `<line class="gridl" x1="${L}" x2="${W - Rr}" y1="${y}" y2="${y}"/>`;
      if (have.length) s += `<text x="${L - 8}" y="${y + 4}" text-anchor="end">${fmt(hi - (k / 4) * (hi - lo), 2)}</text>`;
    }
    its.forEach((g, i) => (s += `<text x="${xs(i)}" y="${H - B + 18}" text-anchor="middle">${g.gen}</text>`));
    s += `<line class="ax" x1="${L}" x2="${L}" y1="${T}" y2="${H - B}"/><line class="ax" x1="${L}" x2="${W - Rr}" y1="${H - B}" y2="${H - B}"/>`;
    s += `<text x="${(L + W - Rr) / 2}" y="${H - 8}" text-anchor="middle">Geração</text>`;
    s += `<text transform="rotate(-90 14 ${(T + H - B) / 2})" x="14" y="${(T + H - B) / 2}" text-anchor="middle">Massa (kg)</text>`;
    if (!have.length) {
      s += `<text class="empty" x="${(L + W - Rr) / 2}" y="${(T + H - B) / 2}" text-anchor="middle">[A CONFIRMAR] sem dados</text>`;
      s += `<text x="${(L + W - Rr) / 2}" y="${(T + H - B) / 2 + 18}" text-anchor="middle">preencher massa_kg em src/content/m2.json</text>`;
    } else {
      const pts = its.map((g, i) => (typeof g.massa_kg === 'number' ? [xs(i), ys(g.massa_kg)] : null)).filter(Boolean);
      s += `<polyline class="ln" points="${pts.map((p) => p.join(',')).join(' ')}"/>`;
      pts.forEach((p) => (s += `<circle class="pt" cx="${p[0]}" cy="${p[1]}" r="4"/>`));
      const cv = its[cur].massa_kg;
      if (typeof cv === 'number') s += `<circle class="cur" cx="${xs(cur)}" cy="${ys(cv)}" r="7"/>`;
    }
    s += '</svg>';
    s += `<table class="sr"><caption>Massa por geração</caption><tbody>${its.map((g) => `<tr><th scope="row">Geração ${g.gen}</th><td>${typeof g.massa_kg === 'number' ? fmt(g.massa_kg, 2) + ' kg' : '[A CONFIRMAR]'}</td></tr>`).join('')}</tbody></table>`;
    chartEl.innerHTML = s;
  };

  const show = (i) => {
    i = Math.max(0, Math.min(its.length - 1, i));
    view.querySelectorAll('.gen').forEach((g) => (g.hidden = Number(g.dataset.i) !== i));
    range.value = i + 1;
    const m = its[i].massa_kg;
    label.textContent = `GERAÇÃO ${its[i].gen}${typeof m === 'number' ? ' · ' + fmt(m, 2) + ' kg' : ''}`;
    prev.disabled = i === 0;
    next.disabled = i === its.length - 1;
    drawChart(i);
    root._i = i;
  };
  range.addEventListener('input', () => show(Number(range.value) - 1));
  prev.addEventListener('click', () => show((root._i || 0) - 1));
  next.addEventListener('click', () => show((root._i || 0) + 1));
  show(0);
}


