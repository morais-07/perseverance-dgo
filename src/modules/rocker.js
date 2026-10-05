// Demo interativa (esquemática, 2D) da suspensão rocker-bogie: arrasta o obstáculo e a suspensão adapta-se.
import { clamp, fmt } from '../lib/util.js';

const S = 2.3; // px por cm (esquemático)
const GX = 150; // origem x do rover
const GY = 330; // linha do solo em px
const R = 26.25; // raio da roda (cm): Ø 52,5 cm
const WX = { r: 0, m: 105, f: 235 }; // posições x das rodas (cm, esquemático)
const BOGIE_K = 0.5; // pivô do bogie a meio entre roda traseira e central
const BODY_K = 0.45; // pivô do corpo ao longo do braço oscilante (a partir do bogie)

const px = (x) => GX + x * S;
const py = (y) => GY - y * S;

export function initRocker(host) {
  if (!host) return;
  host.innerHTML = `
    <div class="rb-stage">
      <svg viewBox="0 0 860 400" role="img" aria-labelledby="rb-title rb-desc">
        <title id="rb-title">Demonstração da suspensão rocker-bogie</title>
        <desc id="rb-desc">Vista lateral esquemática: um obstáculo sob as rodas e a suspensão a adaptar-se, com o corpo do rover a subir apenas uma fração da altura do obstáculo.</desc>
        <defs><pattern id="rb-grid" width="23" height="23" patternUnits="userSpaceOnUse"><path d="M23 0H0V23" fill="none" stroke="rgba(255,255,255,.07)"/></pattern></defs>
        <rect width="860" height="400" fill="url(#rb-grid)"/>
        <line id="rb-ref" stroke="#94a3b8" stroke-dasharray="5 5" stroke-width="1"/>
        <text id="rb-ref-t" fill="#94a3b8" font-family="JetBrains Mono Variable, monospace" font-size="11">altura sem obstáculo</text>
        <path id="rb-ground" fill="#241912" stroke="#ff7a00" stroke-width="2"/>
        <g id="rb-rover"></g>
        <g id="rb-obs" tabindex="0" role="slider" aria-label="Posição do obstáculo (cm)" aria-valuemin="-60" aria-valuemax="320" aria-valuenow="0">
          <path class="obs-body" fill="#c44a00" stroke="#ff7a00" stroke-width="2"/>
          <text id="rb-obs-t" fill="#fff" font-family="JetBrains Mono Variable, monospace" font-size="11" text-anchor="middle">↔ arrastar</text>
        </g>
      </svg>
    </div>
    <div class="rb-side">
      <label>Posição do obstáculo <span class="mono" id="rb-xv"></span>
        <input id="rb-x" type="range" min="-60" max="320" step="1" value="-30" /></label>
      <label>Altura do obstáculo <span class="mono" id="rb-hv"></span>
        <input id="rb-h" type="range" min="0" max="52.5" step="0.5" value="40" /></label>
      <div class="rb-read" aria-live="polite">
        <div><span>Obstáculo</span><b id="rb-o">0 cm</b></div>
        <div><span>Subida do corpo</span><b id="rb-rise">0 cm</b></div>
        <div><span>Corpo / obstáculo</span><b id="rb-ratio">—</b></div>
      </div>
      <p class="rb-note">Roda Ø 52,5 cm: a altura máxima do cursor corresponde a um obstáculo do tamanho de uma roda, o limite indicado pela NASA para o rocker-bogie. Distâncias entre rodas esquemáticas.</p>
    </div>`;

  const $ = (s) => host.querySelector(s);
  const svg = $('svg');
  const gRover = $('#rb-rover');
  const ground = $('#rb-ground');
  const obs = $('#rb-obs');
  const inX = $('#rb-x');
  const inH = $('#rb-h');
  const state = { x: Number(inX.value), h: Number(inH.value) };

  const terrain = (x) => {
    const w = 40;
    const ramp = 16;
    const d = Math.abs(x - state.x);
    if (d <= w / 2) return state.h;
    if (d < w / 2 + ramp) return state.h * (1 - (d - w / 2) / ramp);
    return 0;
  };
  const wheelY = (xw) => {
    let best = R;
    for (let p = xw - R; p <= xw + R; p += 0.5) {
      const dy = Math.sqrt(Math.max(0, R * R - (xw - p) ** 2));
      best = Math.max(best, terrain(p) + dy);
    }
    return best;
  };

  const baseline = (() => {
    const yr = R, ym = R, yf = R;
    const by = yr + BOGIE_K * (ym - yr);
    return by + BODY_K * (yf - by);
  })();

  const wheel = (cx, cy, rot) => {
    let s = `<circle cx="${px(cx)}" cy="${py(cy)}" r="${R * S}" fill="#14141a" stroke="#fff" stroke-width="2.5"/>`;
    for (let i = 0; i < 6; i++) {
      const a = rot + (i * Math.PI) / 3;
      s += `<line x1="${px(cx)}" y1="${py(cy)}" x2="${px(cx) + Math.cos(a) * R * S * 0.9}" y2="${py(cy) - Math.sin(a) * R * S * 0.9}" stroke="#94a3b8" stroke-width="1.5"/>`;
    }
    return s + `<circle cx="${px(cx)}" cy="${py(cy)}" r="5" fill="#ff7a00"/>`;
  };

  const draw = () => {
    // chão
    let d = `M ${px(-90)} ${py(-30)} L ${px(-90)} ${py(0)}`;
    for (let x = -90; x <= 340; x += 1) d += ` L ${px(x)} ${py(terrain(x))}`;
    d += ` L ${px(340)} ${py(-30)} Z`;
    ground.setAttribute('d', d);

    const yR = wheelY(WX.r);
    const yM = wheelY(WX.m);
    const yF = wheelY(WX.f);
    const B = { x: WX.r + BOGIE_K * (WX.m - WX.r), y: yR + BOGIE_K * (yM - yR) };
    const P = { x: B.x + BODY_K * (WX.f - B.x), y: B.y + BODY_K * (yF - B.y) };
    const rise = P.y - baseline;

    const rot = -(state.x / R) * 0.2;
    const line = (a, b, w = 7, c = '#ff9a3d') => `<line x1="${px(a.x)}" y1="${py(a.y)}" x2="${px(b.x)}" y2="${py(b.y)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
    const pt = (x, y, c = '#fff') => `<circle cx="${px(x)}" cy="${py(y)}" r="6" fill="${c}" stroke="#0b0b10" stroke-width="2"/>`;
    const R0 = { x: WX.r, y: yR }, M0 = { x: WX.m, y: yM }, F0 = { x: WX.f, y: yF };
    const bodyW = 170, bodyH = 46;
    gRover.innerHTML =
      `<g>${line(R0, M0, 7, '#ff7a00')}${line(F0, B, 7, '#ffc000')}${line(B, P, 7, '#ffc000')}</g>` +
      wheel(R0.x, R0.y, rot) + wheel(M0.x, M0.y, rot) + wheel(F0.x, F0.y, rot) +
      `<rect x="${px(P.x) - (bodyW * S) / 2.4}" y="${py(P.y) - bodyH * S - 10}" width="${bodyW * S * 0.8}" height="${bodyH * S}" rx="6" fill="#e8e4da" stroke="#14141a" stroke-width="2"/>` +
      `<text x="${px(P.x) - (bodyW * S) / 2.4 + 12}" y="${py(P.y) - bodyH * S + 14}" font-family="JetBrains Mono Variable, monospace" font-size="11" fill="#14141a" font-weight="700">CORPO · PRV-CHS</text>` +
      pt(P.x, P.y, '#ff7a00') + pt(B.x, B.y);

    const yRef = py(baseline);
    const ref = $('#rb-ref');
    ref.setAttribute('x1', px(P.x) - 120); ref.setAttribute('x2', px(P.x) + 120);
    ref.setAttribute('y1', yRef); ref.setAttribute('y2', yRef);
    const rt = $('#rb-ref-t');
    rt.setAttribute('x', px(P.x) + 126); rt.setAttribute('y', yRef + 4);

    // obstáculo
    const w = 40, ramp = 16, hh = Math.max(state.h, 0.5);
    obs.querySelector('.obs-body').setAttribute('d', `M ${px(state.x - w / 2 - ramp)} ${py(0)} L ${px(state.x - w / 2)} ${py(hh)} L ${px(state.x + w / 2)} ${py(hh)} L ${px(state.x + w / 2 + ramp)} ${py(0)} Z`);
    const ot = $('#rb-obs-t');
    ot.setAttribute('x', px(state.x)); ot.setAttribute('y', py(hh) - 10);
    obs.setAttribute('aria-valuenow', String(Math.round(state.x)));
    obs.setAttribute('aria-valuetext', `obstáculo a ${Math.round(state.x)} cm, altura ${fmt(state.h, 1)} cm`);

    $('#rb-xv').textContent = Math.round(state.x) + ' cm';
    $('#rb-hv').textContent = fmt(state.h, 1) + ' cm';
    const maxTerr = Math.max(terrain(WX.r), terrain(WX.m), terrain(WX.f));
    $('#rb-o').textContent = fmt(state.h, 1) + ' cm';
    $('#rb-rise').textContent = fmt(Math.max(0, rise), 1) + ' cm';
    $('#rb-ratio').textContent = maxTerr > 1 ? '≈ ' + fmt(Math.max(0, rise) / maxTerr, 2) + ' ×' : '—';
  };

  const set = (x, h) => {
    if (x !== undefined) state.x = clamp(x, -60, 320);
    if (h !== undefined) state.h = clamp(h, 0, 52.5);
    inX.value = state.x;
    inH.value = state.h;
    draw();
  };
  inX.addEventListener('input', () => set(Number(inX.value)));
  inH.addEventListener('input', () => set(undefined, Number(inH.value)));

  // arrastar com o rato/dedo
  const toCm = (clientX) => {
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = 0;
    const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
    return (loc.x - GX) / S;
  };
  let drag = false;
  obs.addEventListener('pointerdown', (e) => {
    drag = true;
    obs.setPointerCapture(e.pointerId);
    obs.style.cursor = 'grabbing';
    e.preventDefault();
  });
  obs.addEventListener('pointermove', (e) => drag && set(toCm(e.clientX)));
  const end = () => {
    drag = false;
    obs.style.cursor = '';
  };
  obs.addEventListener('pointerup', end);
  obs.addEventListener('pointercancel', end);
  obs.addEventListener('keydown', (e) => {
    const k = { ArrowLeft: -5, ArrowRight: 5, PageDown: -25, PageUp: 25 }[e.key];
    if (k) {
      e.preventDefault();
      set(state.x + k);
    }
  });

  set(-30, 40);
}
