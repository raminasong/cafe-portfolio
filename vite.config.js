import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Two pages: the main portfolio (index.html) and the interactive café (cafe.html).
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        cafe: resolve(import.meta.dirname, 'cafe.html'),
      },
    },
  },
});
