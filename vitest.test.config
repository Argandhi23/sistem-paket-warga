import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  // Pindahkan pengaturan alias ke dalam 'resolve' (standar Vite)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  test: {
    environment: 'node',
    clearMocks: true,
  },
});