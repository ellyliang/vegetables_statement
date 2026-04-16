import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './client/src'),
    },
  },
  test: {
    // 全局注入 vi / describe / test / expect 等，无需在每个文件 import
    globals: true,
    // 模拟浏览器 DOM 环境
    environment: 'jsdom',
    // 测试文件匹配规则
    include: ['client/src/**/__tests__/*.spec.ts'],
    // 全局 setup 文件（每个测试套件运行前执行）
    setupFiles: ['./client/src/tests/setup.ts'],
    // 覆盖率配置（运行 npm run test:coverage 时生效）
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['client/src/**/*.vue', 'client/src/api/**/*.ts'],
      exclude: [
        'client/src/main.ts',
        '**/node_modules/**',
        '**/__tests__/**',
      ],
    },
  },
});
