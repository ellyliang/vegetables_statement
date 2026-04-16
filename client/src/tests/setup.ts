/**
 * Vitest 全局 Setup 文件
 * 每个测试套件运行前自动执行一次
 *
 * 在这里可以：
 * - 配置全局 Mock（如 window.matchMedia）
 * - 注册 Vue 全局组件 / 插件
 * - 抑制第三方库的控制台噪音
 */

import { vi } from 'vitest';

// 屏蔽 Ant Design Vue 在 jsdom 中触发的 ResizeObserver 警告
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// 屏蔽 matchMedia 在 jsdom 中不支持的警告
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
