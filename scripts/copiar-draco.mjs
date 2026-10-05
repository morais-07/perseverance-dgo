// Copia os descodificadores Draco do Three.js para public/draco (site funciona offline).
import { cpSync, mkdirSync, existsSync } from 'node:fs';
const src = 'node_modules/three/examples/jsm/libs/draco/gltf';
const dst = 'public/draco';
if (!existsSync(src)) {
  console.warn('[draco] node_modules/three não encontrado — corre "npm install" primeiro.');
  process.exit(0);
}
mkdirSync(dst, { recursive: true });
cpSync(src, dst, { recursive: true });
console.log('[draco] decoders copiados para', dst);
