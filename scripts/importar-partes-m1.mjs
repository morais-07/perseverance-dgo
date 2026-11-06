// Converte as imagens enviadas pela equipa para a M1 e copia o PDF da apresentação do Nuno.
// Uso: node scripts/importar-partes-m1.mjs <pasta imagens do Nuno> <imagem dos componentes do braço>
import { copyFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const [nuno, braco] = process.argv.slice(2);
const SUSP = 'public/media/m1/suspensao';
await mkdir(SUSP, { recursive: true });
for (const f of await readdir(nuno)) {
  if (!/^passo.*\.png$/.test(f)) continue;
  await sharp(path.join(nuno, f)).resize({ width: 1800, withoutEnlargement: true }).webp({ quality: 84, effort: 5 }).toFile(path.join(SUSP, f.replace('.png', '.webp')));
}
await copyFile(path.join(nuno, 'apresentacao_M1_Nuno.pdf'), 'public/downloads/apresentacao_M1_Nuno.pdf');
await sharp(braco).webp({ quality: 90, alphaQuality: 95, effort: 6 }).toFile('public/media/m1/braco/componentes.webp');
console.log('ok');
