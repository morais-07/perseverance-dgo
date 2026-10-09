// Gera docs/conteudo-em-falta.md: lista de todos os slots de media (ficheiro → secção → descrição → dimensões),
// com o estado atual (existe / em falta). Corre com:  npm run slots
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const C = 'src/content';
const read = (f) => JSON.parse(readFileSync(join(C, f), 'utf8'));
const rows = [];
const add = (secao, s) => s && s.file && rows.push({ secao, file: s.file, desc: s.desc || s.alt || '', size: s.size || '', kind: s.kind || 'image' });

const m0 = read('m0.json');
const m1 = read('m1.json');
const m2 = read('m2.json');
const wipM1 = m1.wip?.ativo;
const wipM2 = m2.wip?.ativo;

// M0
add('M0 · Render do rover (imagem)', m0.renderRover.imagem);
add('M0 · Render do rover (vídeo)', m0.renderRover.video);
for (const p of read('partes.json').partes) {
  add(`M0 · ${p.nome} (CAD 3D)`, { kind: 'image', file: `media/m0/${p.id}_cad.webp`, desc: `CAD 3D: ${p.nome.toLowerCase()} (render ou captura do Fusion).`, size: '1600×900' });
}
rows.push({ secao: 'M0 · Montagem completa (CAD da equipa)', file: read('subsistemas.json').modeloFinal.ficheiro, desc: 'GLB do rover completo com nós nomeados: mastro, braco, suspensao, chassis, mmrtg. < 15 MB. Ver docs/exportar-modelo.md.', size: '< 15 MB', kind: 'modelo' });

// Semanas (M1 e M2 só quando deixam de estar «em desenvolvimento»)
for (const f of readdirSync(join(C, 'semanas')).sort()) {
  const w = read(join('semanas', f));
  if ((w.fase === 'M1' && wipM1) || (w.fase === 'M2' && wipM2)) continue;
  add(`Semana ${w.semana} (${w.fase})`, w.slot);
}

// M1 / M2 completos (só se «wip» estiver desligado)
if (!wipM1) {
  add('M1 · Antes/depois (nosso modelo)', m1.antesDepois.depois);
  add('M1 · Design table', m1.parametrico.slot);
  m1.simulacao.slots.forEach((s) => add('M1 · Simulação / AGD', s));
}
if (!wipM2) {
  m2.otimizacao.iteracoes.forEach((g) => add(`M2 · Otimização, geração ${g.gen}`, { kind: 'image', file: g.slotFile, desc: `Geração ${g.gen}: forma obtida e mapa de tensões.`, size: '1600×900' }));
  add('M2 · Pós-processamento', m2.otimizacao.posProcessamento.slot);
  m2.renders.slots.forEach((s) => add('M2 · Renders finais', s));
  add('M2 · Turntable', m2.renders.video);
}

// Equipa
read('equipa.json').membros.forEach((m) => add(`Equipa · ${m.nome}`, m.foto));

rows.push({ secao: 'Download CAD', file: 'downloads/perseverance_cad.zip', desc: 'Pacote com os ficheiros STEP e nativos. Se > 50 MB, usar GitHub Releases ou Git LFS (ver README).', size: '—', kind: 'zip' });

const state = (f) => (existsSync(join('public', f)) ? '✅ existe' : '⬜ em falta');
const out = [
  '# Conteúdo em falta',
  '',
  'Lista **gerada automaticamente** (`npm run slots`) a partir dos ficheiros em `src/content/`. Cada espaço do site mostra, **a vermelho**, o que falta e o nome exato do ficheiro esperado; basta pôr o ficheiro na pasta `public/` indicada e ele aparece sozinho (sem alterar código).',
  '',
  `Total: ${rows.length} · já preenchidos: ${rows.filter((r) => existsSync(join('public', r.file))).length}`,
  '',
  '| Estado | Ficheiro (dentro de `public/`) | Secção | Descrição | Dimensões |',
  '|---|---|---|---|---|',
  ...rows.map((r) => `| ${state(r.file)} | \`${r.file}\` | ${r.secao} | ${r.desc.replace(/\|/g, '/')} | ${r.size} |`),
  '',
  '## Formatos recomendados',
  '',
  '- **Imagens e slides:** WebP (qualidade 80–85), ≤ 300 KB cada. Largura mínima 1600 px nas imagens 16:9. Para converter PNG/JPG: `npm run imagens`.',
  '- **Vídeos:** MP4 (H.264), 10–20 s, sem áudio, ≤ 8 MB.',
  '- **Modelos:** GLB com Draco ou Meshopt; texturas WebP/KTX2.',
  '',
  '## Texto em falta',
  '',
  'Procura `FALTA` e `A CONFIRMAR` em `src/content/`. No site, tudo o que falta aparece **a vermelho**.',
  '',
].join('\n');
writeFileSync('docs/conteudo-em-falta.md', out);
console.log(`[slots] docs/conteudo-em-falta.md gerado (${rows.length} entradas)`);
