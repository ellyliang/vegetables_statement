import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    include: ['client/src/views/**/__tests__/*.spec.js'],
    alias: {
      '@': '/client/src'
    }
  }
});
