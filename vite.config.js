import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  publicDir: false,
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
