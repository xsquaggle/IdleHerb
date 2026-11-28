import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@sprout/core': fileURLToPath(new URL('./packages/core/src/index.ts', import.meta.url)),
      '@sprout/content': fileURLToPath(new URL('./packages/content/src/index.ts', import.meta.url)),
    },
  },
  test: {
    include: ['packages/**/*.test.ts', 'apps/**/*.test.ts'],
    testTimeout: 120000,
  },
});
