// 先设置全局 Vue
import { createApp } from 'vue';
(global as unknown as Record<string, unknown>).Vue = { createApp };
