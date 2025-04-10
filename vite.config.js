import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Use conditional base path for different environments
  base: process.env.NODE_ENV === 'production' ? '/' : '/city-builder-interactive/build',
  ssgOptions: {
    script: 'async',
    dirStyle: 'nested',
  },
  build: {
    outDir: 'build',
    emptyOutDir: false,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  assetsInclude: [],
  server: {},
  resolve: {
    alias: {
      '@': '/src/components',
      '@src': '/src',
    },
  },
  optimizeDeps: {
    exclude: ['three'],
  },
});
