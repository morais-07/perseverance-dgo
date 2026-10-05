// Converte PNG/JPG de public/media (e subpastas) para WebP otimizado (largura máx. 1920 px).
// Uso:  npm run imagens            → converte tudo o que ainda não tem .webp
//       npm run imagens -- --apagar → apaga o original depois de converter
import { readdirSync, statSync, existsSync, unlinkSync } from 'node:fs';
import { join, extname } from 'node:path';
import sharp from 'sharp';

const apagar = process.argv.includes('--apagar');
const raiz = 'public/media';
const MAX = 1920;

const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

for (const f of walk(raiz)) {
  const ext = extname(f).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext) || f.split('\\').join('/').includes('/logo/')) continue;
  const out = f.slice(0, -ext.length) + '.webp';
  if (existsSync(out)) continue;
  await sharp(f).resize({ width: MAX, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
  const a = statSync(f).size, b = statSync(out).size;
  console.log(`${f} → ${out}  ${(a / 1024).toFixed(0)} KB → ${(b / 1024).toFixed(0)} KB`);
  if (apagar) unlinkSync(f);
}
