// Converte os renders dos rovers (PNG de 1920×1080) para WebP leve em public/media/m1/rovers/<destino>/.
// Uso: node scripts/importar-rovers.mjs "C:\Users\rafae\Downloads\Renders_Rovers"
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const origem = process.argv[2];
if (!origem) throw new Error('Indica a pasta dos renders.');

const PASTAS = { marte: 'Marte', lua: 'Lua', mercurio: 'Mercurio', europa: 'Europa', tita: 'Tita', io: 'Io', venus: 'Venus' };
const VISTAS = { 1: 'principal', 2: 'lateral', 3: 'traseira' };

for (const [id, pasta] of Object.entries(PASTAS)) {
  const dir = path.join(origem, pasta);
  const destino = path.join('public/media/m1/rovers', id);
  await mkdir(destino, { recursive: true });
  const ficheiros = await readdir(dir);
  const de = (n) => path.join(dir, ficheiros.find((f) => f.includes(`_${n}_`)));
  for (const [n, nome] of Object.entries(VISTAS)) {
    await sharp(de(n)).webp({ quality: 80, effort: 6 }).toFile(path.join(destino, `${nome}.webp`));
    await sharp(de(n)).resize(320).webp({ quality: 70, effort: 6 }).toFile(path.join(destino, `${nome}_t.webp`));
  }
  // recorte sem fundo do rover, para o seletor e para o teste de gravidade
  await sharp(await sharp(de(4)).trim().toBuffer()).resize(560).webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile(path.join(destino, 'recorte.webp'));
  console.log('ok', id);
}
