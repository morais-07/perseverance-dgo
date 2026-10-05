import { defineConfig } from 'vite';

// base './' → funciona em GitHub Pages (subpasta), Netlify, Vercel e até abrindo a pasta dist offline via servidor estático.
export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: { three: ['three'], gsap: ['gsap'] },
      },
    },
  },
});
