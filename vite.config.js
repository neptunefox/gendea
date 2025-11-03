import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  publicDir: 'public',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'public',
    emptyOutDir: false,
    rollupOptions: {
      input: './src/main.js',
      output: {
        entryFileNames: 'app.bundle.js',
        assetFileNames: '[name][extname]'
      }
    }
  }
});
