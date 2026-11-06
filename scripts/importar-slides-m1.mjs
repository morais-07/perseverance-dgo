// Converte as imagens dos slides do M1 para WebP: galerias das semanas e figuras recortadas das secções.
// Uso: node scripts/importar-slides-m1.mjs <pasta com os PNG a 1600 px> <pasta com os PNG a 3200 px> <pasta com as imagens do BeeGraphy>
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const [slides, hd, pics] = process.argv.slice(2);
const SAIDA = 'public/media/m1';

/* Galerias. Na apresentação ficam de fora o slide 3 (logótipos) e o 5 (vídeo com valores antigos). */
const num = (p, a, b) => Array.from({ length: b - a + 1 }, (_, i) => `${p}_${String(a + i).padStart(2, '0')}`);
const GALERIAS = {
  semana5: num('s05', 2, 2),
  semana6: num('s06', 2, 2),
  semana7: num('s07', 2, 5),
  semana8: ['m1_01', 'm1_02', 'm1_04', ...num('m1', 6, 20)],
};
for (const [pasta, lista] of Object.entries(GALERIAS)) {
  await mkdir(path.join(SAIDA, pasta), { recursive: true });
  for (const [i, nome] of lista.entries()) {
    const base = path.join(SAIDA, pasta, `slide_${String(i + 1).padStart(2, '0')}`);
    await sharp(path.join(slides, `${nome}.png`)).webp({ quality: 80, effort: 5 }).toFile(`${base}.webp`);
    await sharp(path.join(slides, `${nome}.png`)).resize(480).webp({ quality: 68, effort: 5 }).toFile(`${base}_t.webp`);
  }
}

/* Figuras: [ficheiro de saída, slide, x0, y0, x1, y1], em coordenadas de um slide com 1600×900. */
const FIGURAS = [
  ['braco/parametros', 's07_02', 280, 254, 1560, 860],
  ['braco/marte', 'm1_08', 26, 130, 294, 450],
  ['braco/lua', 'm1_08', 338, 130, 546, 450],
  ['braco/mercurio', 'm1_08', 608, 130, 846, 450],
  ['braco/venus', 'm1_08', 886, 130, 1146, 450],
  ['braco/tita', 'm1_08', 1242, 324, 1510, 744],
  ['braco/europa', 'm1_08', 186, 540, 428, 824],
  ['braco/io', 'm1_08', 558, 540, 776, 824],
  ['chassis/fusion_e_beegraphy', 'm1_09', 40, 400, 1580, 880],
  ['chassis/fusion', 'm1_10', 44, 170, 1050, 690],
  ['chassis/sliders', 'm1_12', 800, 220, 1510, 790],
];
for (const [saida, slide, x0, y0, x1, y1] of FIGURAS) {
  const f = path.join(SAIDA, `${saida}.webp`);
  await mkdir(path.dirname(f), { recursive: true });
  await sharp(path.join(hd, `${slide}.png`))
    .extract({ left: x0 * 2, top: y0 * 2, width: (x1 - x0) * 2, height: (y1 - y0) * 2 })
    .resize({ width: 1400, withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(f);
}

/* Imagens do BeeGraphy, tal como estão na apresentação. */
const BEE = [['chassis/nos', 'cb_00'], ['chassis/seed_original', 'cs_00'], ['chassis/seed_6', 'cs_01'], ['chassis/seed_10', 'cs_02'], ['chassis/seed_846', 'cs_03']];
for (const [saida, nome] of BEE) await sharp(path.join(pics, `${nome}.png`)).resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toFile(path.join(SAIDA, `${saida}.webp`));
console.log('ok');
