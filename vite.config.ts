import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  base: process.env.PA_BASE ?? '/policy-audit/',
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs',
          dest: 'vendor',
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@core': path.resolve(process.cwd(), 'src/core'),
      '@app': path.resolve(process.cwd(), 'src/app'),
    },
  },
  build: { target: 'es2022', sourcemap: false },
});
