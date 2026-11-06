// M1 · Suspensão: seletor de destino, que troca a imagem da suspensão completa e os números.
import { asset } from '../lib/util.js';

export function initSuspensao(root) {
  if (!root) return;
  const linhas = [...root.querySelectorAll('[data-susp]')];
  const img = root.querySelector('[data-susp-img]');
  const cap = root.querySelector('[data-susp-cap]');
  const escolher = (b) => {
    linhas.forEach((l) => l.setAttribute('aria-pressed', String(l === b)));
    img.src = asset(`media/m1/suspensao/passo5_suspensao_${b.dataset.susp}.webp`);
    img.alt = `Suspensão completa para ${b.dataset.nome}: a laranja, as peças geradas para este destino.`;
    cap.textContent = b.dataset.legenda;
  };
  linhas.forEach((l) => l.addEventListener('click', () => escolher(l)));
  escolher(linhas.find((l) => l.dataset.susp === 'marte') || linhas[0]);
}
