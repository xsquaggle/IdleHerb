import { defineConfig, type Plugin } from 'vite';
import { fileURLToPath } from 'node:url';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';

const root = fileURLToPath(new URL('../..', import.meta.url));

/** Moves the built script into the page itself once it is written, so the build is one file. */
function inlineScript(): Plugin {
  let outDir = '';
  return {
    name: 'sprout-inline-script',
    apply: 'build',
    configResolved(cfg) {
      outDir = isAbsolute(cfg.build.outDir) ? cfg.build.outDir : join(cfg.root, cfg.build.outDir);
    },
    closeBundle() {
      const htmlPath = join(outDir, 'index.html');
      let text = readFileSync(htmlPath, 'utf8');
      text = text.replace(/<script type="module" crossorigin src="\.\/(assets\/[^"]+\.js)"><\/script>/g, (_m, file: string) => {
        // A closing script tag inside the code would end the element early.
        const code = readFileSync(join(outDir, file), 'utf8').replace(/<\/script/gi, '<\\/script');
        rmSync(join(outDir, file));
        return `<script type="module">${code}</script>`;
      });
      writeFileSync(htmlPath, text);
      rmSync(join(outDir, 'assets'), { recursive: true, force: true });
    },
  };
}

/**
 * `vite build --mode single` (or `SINGLE=1 vite build`): one self-contained HTML file with the
 * art and fonts inlined. The Windows app ships this file, and it opens straight from disk.
 * Otherwise the phone preview loads the files from wherever they sit, so every path is relative.
 */
export default defineConfig(({ mode }) => {
  const single = mode === 'single' || process.env.SINGLE === '1';
  return {
    base: './',
    resolve: {
      alias: {
        '@sprout/core': fileURLToPath(new URL('../core/src/index.ts', import.meta.url)),
        '@content': fileURLToPath(new URL('../content/generated', import.meta.url)),
        '@art': fileURLToPath(new URL('../../art', import.meta.url)),
      },
    },
    server: { fs: { allow: [root] }, host: true },
    plugins: single ? [inlineScript()] : [],
    build: {
      outDir: single ? 'dist-single' : 'dist',
      emptyOutDir: true,
      assetsInlineLimit: single ? 100_000_000 : 0,
      chunkSizeWarningLimit: 8000,
      target: 'es2022',
      rollupOptions: single ? { output: { inlineDynamicImports: true } } : undefined,
    },
    define: {
      __BUILD__: JSON.stringify(process.env.GITHUB_SHA?.slice(0, 7) ?? process.env.SPROUT_BUILD ?? 'dev'),
      __BUILT_AT__: JSON.stringify(new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC'),
    },
  };
});
