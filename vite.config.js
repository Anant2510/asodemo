import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// IMPORTANT: `base` must match the GitHub repo name exactly (with leading + trailing slash)
// because GitHub Pages serves project sites under https://USER.github.io/REPO/
// If you fork/rename the repo, update this string.
export default defineConfig({
  plugins: [react()],
  base: '/asodemo/',
  server: {
    host: true,
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
