# TDD 开发指引 + 前端 TDD 重点知识

> 适合人群：前端小白 / 刚接触自动化测试的开发者
> 技术栈：Vue 3 + Vitest + @vue/test-utils

---

## 第一部分：小白开发者指引

### 1. 什么是 TDD？

TDD（Test-Driven Development，测试驱动开发）的核心流程只有三步，俗称"红 → 绿 → 重构"：

```
1. 红（Red）   ── 先写一个"会失败"的测试
2. 绿（Green） ── 写最少的业务代码，让测试通过
3. 重构（Refactor） ── 在测试保护下优化代码
```

用大白话说：**先想好"这个功能应该怎么用"，再去实现它**。

---

### 2. 本项目的目录约定

```
client/src/
├── api/                    # 接口层（axios 请求）
│   ├── orderApi.js
│   ├── merchantApi.js
│   └── settlementApi.js
├── views/
│   ├── VegetableOrder/
│   │   ├── index.vue              # 组件本体
│   │   └── __tests__/
│   │       └── VegetableOrder.spec.js   # 对应的测试文件
│   ├── StallManagement/
│   │   ├── index.vue
│   │   └── __tests__/
│   │       └── StallManagement.spec.js
│   ├── Settlement/...
│   └── OrderInfo/...
└── tests/
    └── setup.js           # 全局测试初始化（测试框架自动加载）
```

**规则：测试文件和被测试文件放在同一目录的 `__tests__` 文件夹里**，文件名以 `.spec.js` 结尾。

---

### 3. 常用命令速查

| 命令 | 用途 |
|------|------|
| `npm run test` | 一次性运行所有测试（CI 用） |
| `npm run test:watch` | 监听文件变化、自动重跑（**开发时主要用这个**） |
| `npm run test:coverage` | 生成覆盖率报告（HTML 报告在 `./coverage/index.html`）|
| `npm run test:ui` | 打开可视化测试界面（浏览器里看测试结果）|

> **推荐工作流**：开发时开一个终端跑 `npm run test:watch`，另一个终端跑 `npm run dev`，边写代码边看测试是否通过。

---

### 4. 写第一个测试：以添加新功能为例

假设你要给 `StallManagement` 加一个"搜索商户"功能，按 TDD 流程：

**Step 1 — 红：先写测试（功能还没实现）**

在 `client/src/views/StallManagement/__tests__/StallManagement.spec.js` 里追加：

```js
test('根据关键字过滤商户', () => {
  // 假设组件有一个 searchKeyword 属性和一个 filteredMerchants 计算属性
  wrapper.vm.searchKeyword = '张三';
  const result = wrapper.vm.filteredMerchants;
  expect(result.length).toBe(1);
  expect(result[0].name).toBe('张三大排档');
});
```

运行 `npm run test:watch`，测试**失败**（红），因为 `filteredMerchants` 还不存在。这是正常的。

**Step 2 — 绿：在组件里实现功能**

打开 `client/src/views/StallManagement/index.vue`，在 `<script setup>` 里添加：

```js
const searchKeyword = ref('');
const filteredMerchants = computed(() =>
  merchants.value.filter(m => m.name.includes(searchKeyword.value))
);
```

保存后，测试自动重跑 → **通过**（绿）。

**Step 3 — 重构：有测试保护，放心优化**

比如把过滤逻辑提取成独立函数，测试依然绿，说明重构没有破坏功能。

---

### 5. Mock（模拟）是什么，为什么要用？

测试里不能真的去请求后端 API（后端可能没启动、数据会变化），所以用 `vi.mock()` 伪造接口返回值。

```js
// 告诉 Vitest："遇到 @/api/merchantApi 模块时，用这个假版本代替"
vi.mock('@/api/merchantApi', () => ({
  default: {
    getAllMerchants: vi.fn(),   // vi.fn() 创建一个"记录调用"的假函数
  }
}));

// 在具体测试里，指定这个假函数返回什么数据
merchantApi.getAllMerchants.mockResolvedValue({
  success: true,
  data: [{ id: 1, name: '张三大排档' }]
});
```

这样测试完全在本地运行，快且稳定。

---

### 6. 常见测试断言速查

```js
// 值相等
expect(wrapper.vm.merchants.length).toBe(2);

// 包含某个字符串
expect(wrapper.find('h3').text()).toBe('大排档管理');

// 函数被调用过
expect(merchantApi.getAllMerchants).toHaveBeenCalled();

// 函数被调用时传了特定参数
expect(orderApi.createOrder).toHaveBeenCalledWith({ vegetable: '西红柿', ... });

// 值为真（truthy）
expect(wrapper.vm.orderInfo).toBeTruthy();

// 值是某种类型
expect(typeof wrapper.vm.orderInfo).toBe('string');

// 数字大于某值
expect(buttons.length).toBeGreaterThan(0);
```

---

### 7. 本项目的测试结构模板

每个组件测试文件都遵循相同结构，直接复制修改：

```js
import { mount } from '@vue/test-utils';
import MyComponent from '@/views/MyComponent/index.vue';
import myApi from '@/api/myApi';

// ① 模拟 API 模块
vi.mock('@/api/myApi', () => ({
  default: {
    getAll: vi.fn(),
    create: vi.fn(),
  }
}));

describe('MyComponent', () => {
  let wrapper;

  // ② 每个测试前重置状态
  beforeEach(() => {
    vi.clearAllMocks();                          // 清除上次的调用记录

    myApi.getAll.mockResolvedValue({             // 设置假数据
      success: true,
      data: [{ id: 1, name: '示例' }]
    });

    wrapper = mount(MyComponent);                // 挂载组件
  });

  // ③ 测试渲染
  test('组件渲染正常', async () => {
    await wrapper.vm.$nextTick();
    expect(wrapper.exists()).toBe(true);
  });

  // ④ 测试交互
  test('点击按钮打开对话框', () => {
    wrapper.find('button').trigger('click');
    expect(wrapper.vm.isEditing).toBe(true);
  });

  // ⑤ 测试异步 API 调用
  test('保存数据时调用接口', async () => {
    myApi.create.mockResolvedValue({ success: true, data: { id: 2 } });
    await wrapper.vm.save();
    expect(myApi.create).toHaveBeenCalled();
  });
});
```

---

## 第二部分：前端 TDD 重点知识

### 1. 为什么前端测试比后端难？

前端组件有三大特殊性：

| 特性 | 挑战 | 解决方案 |
|------|------|----------|
| DOM 交互 | 浏览器 API 在 Node.js 不存在 | jsdom 模拟浏览器环境 |
| 异步渲染 | Vue 更新 DOM 是异步的 | `await nextTick()` / `flushPromises()` |
| 外部依赖 | HTTP 请求、localStorage 等 | `vi.mock()` / `vi.spyOn()` |

---

### 2. Vitest 核心概念

#### 测试文件结构

```
describe('模块名')         ── 测试套件，给相关测试分组
  test('测试描述')          ── 单个测试用例（it 是别名）
    expect(值).匹配器()     ── 断言
```

#### 生命周期钩子

```js
beforeAll(() => { /* 整个 describe 块运行前执行一次 */ })
afterAll(() => { /* 整个 describe 块运行后执行一次 */ })
beforeEach(() => { /* 每个 test 运行前执行 */ })   // 最常用
afterEach(() => { /* 每个 test 运行后执行 */ })
```

#### Mock 三件套

```js
vi.fn()                    // 创建空的假函数（可记录调用）
vi.mock('模块路径', 工厂)   // 替换整个模块
vi.spyOn(对象, '方法名')   // 监听真实方法（不替换实现）

// 控制假函数返回值
myFn.mockReturnValue(值)             // 同步返回
myFn.mockResolvedValue(值)           // 异步 Promise resolve
myFn.mockRejectedValue(错误)         // 异步 Promise reject

// 清除
vi.clearAllMocks()    // 清除调用记录（保留 mock 定义）
vi.resetAllMocks()    // 清除调用记录 + 重置实现
vi.restoreAllMocks()  // 还原 spyOn 监听的原始实现
```

---

### 3. @vue/test-utils 核心 API

#### 挂载组件

```js
// mount：完整挂载（包括子组件，推荐）
const wrapper = mount(MyComponent, {
  props: { title: '标题' },           // 传入 props
  global: {
    stubs: { MyChildComponent: true } // 桩掉子组件（避免干扰）
  }
});

// shallowMount：浅挂载（子组件全部变成桩）
const wrapper = shallowMount(MyComponent);
```

#### 查找元素

```js
wrapper.find('h3')                  // CSS 选择器（返回第一个）
wrapper.findAll('.btn')             // CSS 选择器（返回所有）
wrapper.findComponent(ChildComp)    // 查找子组件
```

#### 触发交互

```js
await wrapper.find('button').trigger('click');
await wrapper.find('input').setValue('新值');
await wrapper.find('input').trigger('input');
```

#### 读取状态

```js
wrapper.vm.someData                 // 访问组件的响应式数据
wrapper.vm.someMethod()             // 直接调用组件方法
wrapper.html()                      // 获取渲染后的 HTML 字符串
wrapper.find('h3').text()           // 获取元素文本内容
```

#### 异步等待

```js
await wrapper.vm.$nextTick()        // 等待 Vue 更新 DOM
await flushPromises()               // 等待所有 Promise 完成（需单独 import）
```

---

### 4. 测试应该测什么？

遵循"测行为，不测实现"原则：

```
✅ 好的测试：
- 点击"添加"按钮后，对话框出现
- 提交表单时，接口被调用且传入了正确参数
- 数据加载成功后，列表显示了对应行数

❌ 差的测试：
- 内部变量 isLoading 在第 3 毫秒变成了 true
- computed 属性的内部计算过程
- 某个私有方法的返回值（除非是核心算法）
```

---

### 5. 覆盖率报告怎么看？

运行 `npm run test:coverage` 后，在 `./coverage/index.html` 用浏览器打开：

| 指标 | 含义 | 建议目标 |
|------|------|----------|
| **Statements** | 语句覆盖率 | ≥ 70% |
| **Branches** | 分支覆盖率（if/else） | ≥ 60% |
| **Functions** | 函数覆盖率 | ≥ 70% |
| **Lines** | 行覆盖率 | ≥ 70% |

> 覆盖率不是越高越好。100% 覆盖率但断言无意义 = 无效测试。优先保证**核心业务逻辑**有高质量的测试。

---

### 6. TDD 常见误区

| 误区 | 正确做法 |
|------|----------|
| 先把功能全写完再补测试 | 先写测试，再写实现 |
| 一个测试测很多功能 | 每个测试只验证一件事 |
| 测试文件比业务代码还复杂 | 简化 setup，用 beforeEach 复用 |
| Mock 了所有东西导致测试失真 | 只 mock 外部依赖（网络、文件），内部逻辑真实执行 |
| 测试通过就删掉重构后不测 | 重构后必须重跑测试 |

---

### 7. 学习路径推荐

```
阶段 1（当前）：组件测试
  └── 读懂 __tests__/*.spec.js
  └── 能仿照模板写新组件的测试

阶段 2：进阶测试技巧
  └── 测试 Vuex / Pinia store
  └── 测试 Vue Router 导航
  └── 测试自定义 Composable (useXxx hooks)

阶段 3：端到端测试 (E2E)
  └── Playwright / Cypress
  └── 模拟真实用户在浏览器里的操作流程
```

---

*本文档对应项目：vegetables_statement（蔬菜接单系统）*
*测试框架：Vitest v4 + @vue/test-utils v2*
