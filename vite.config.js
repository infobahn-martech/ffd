import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Dev: root URL (http://localhost:5173/). Production: GitHub Pages subpath.
  base: command === 'serve' ? '/' : '/sedres-fe/',
  build: {
    outDir: 'dist',
  },
}));
