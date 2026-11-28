import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));

// The phone preview is served from https://xsquaggle.github.io/IdleHerb/ and the desktop
// app loads the files from disk, so every path in the build is relative.
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@sprout/core': fileURLToPath(new URL('../core/src/index.ts', import.meta.url)),
      '@content': fileURLToPath(new URL('../content/generated', import.meta.url)),
      '@art': fileURLToPath(new URL('../../art', import.meta.url)),
    },
  },
  server: { fs: { allow: [root] }, host: true },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 2000,
    target: 'es2022',
  },
  define: {
    __BUILD__: JSON.stringify(process.env.GITHUB_SHA?.slice(0, 7) ?? 'dev'),
    __BUILT_AT__: JSON.stringify(new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC'),
  },
});
