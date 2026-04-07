# 蔬菜接单系统

蔬菜接单系统，包含订单管理、结算、订单信息生成和商户管理功能。

## 项目结构

```
vegetables_statement/
├── client/               # 前端目录
│   ├── src/              # 前端源代码
│   │   ├── api/          # API 服务
│   │   ├── views/        # 页面视图
│   │   │   ├── StallManagement/  # 大排档管理模块
│   │   │   │   ├── index.vue      # 组件实现
│   │   │   │   └── __tests__/     # 测试目录
│   │   │   │       └── StallManagement.spec.js  # 测试文件
│   │   │   ├── VegetableOrder/    # 蔬菜订单模块
│   │   │   │   ├── index.vue      # 组件实现
│   │   │   │   └── __tests__/     # 测试目录
│   │   │   │       └── VegetableOrder.spec.js   # 测试文件
│   │   │   ├── Settlement/        # 结算模块
│   │   │   │   ├── index.vue      # 组件实现
│   │   │   │   └── __tests__/     # 测试目录
│   │   │   │       └── Settlement.spec.js       # 测试文件
│   │   │   └── OrderInfo/         # 订单信息模块
│   │   │       ├── index.vue      # 组件实现
│   │   │       └── __tests__/     # 测试目录
│   │   │           └── OrderInfo.spec.js        # 测试文件
│   │   ├── App.vue       # 应用入口组件
│   │   └── main.js       # 应用入口文件
│   └── public/           # 前端静态资源
├── server/               # 后端目录
│   ├── controllers/      # 控制器
│   ├── models/           # 数据模型
│   ├── routes/           # 路由
│   ├── middleware/       # 中间件
│   └── app.js            # 服务器入口
├── index.html            # HTML 入口文件
├── package.json          # 项目依赖
├── vite.config.js        # Vite 配置
├── vitest.config.js      # Vitest 配置
└── README.md             # 项目说明
```

## 技术栈

- **前端**：Vue 3 + Ant Design Vue + Axios
- **后端**：Koa + Koa Router
- **构建工具**：Vite
- **测试工具**：Vue Test Utils + Vitest

## TDD 开发方式

本项目采用 **测试驱动开发（TDD）** 的方式进行开发，适合 TDD 小白学习和实践。

### TDD 基本概念

TDD 是一种开发方法，遵循以下步骤：
1. **写测试**：先编写一个失败的测试用例
2. **运行测试**：确认测试失败
3. **写代码**：编写足够的代码使测试通过
4. **运行测试**：确认测试通过
5. **重构**：优化代码结构，保持测试通过

### 项目中的 TDD 实践

1. **测试文件结构**：每个组件都有对应的测试文件，位于 `__tests__` 目录中
2. **测试覆盖**：每个组件都有完整的测试用例，覆盖主要功能
3. **测试驱动**：开发新功能时，先编写测试用例，再实现功能

### 如何编写测试

1. **创建测试文件**：在组件目录下创建 `__tests__` 文件夹，并创建 `组件名.spec.js` 文件
2. **编写测试用例**：使用 `describe` 和 `test` 函数编写测试用例
3. **模拟依赖**：使用 `vi.mock` 模拟 API 调用和其他外部依赖
4. **断言**：使用 `expect` 函数断言测试结果

### 如何运行测试

在项目根目录执行：

```bash
npm test
```

这将运行所有测试用例，并显示测试结果。

### 测试示例

以下是一个简单的测试示例：

```javascript
import { mount } from '@vue/test-utils';
import MyComponent from '@/views/MyComponent/index.vue';
import api from '@/api/api';
import { vi, describe, test, beforeEach, expect } from 'vitest';

// 模拟 API
vi.mock('@/api/api', () => ({
  default: {
    getData: vi.fn()
  }
}));

describe('MyComponent', () => {
  let wrapper;

  beforeEach(() => {
    // 模拟 API 响应
    api.getData.mockResolvedValue({ success: true, data: [] });
    
    // 挂载组件
    wrapper = mount(MyComponent);
  });

  test('renders correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('loads data on mount', async () => {
    await wrapper.vm.$nextTick();
    expect(api.getData).toHaveBeenCalled();
  });
});
```

## 启动脚本

### 1. 安装依赖

在项目根目录执行：

```bash
npm install
```

### 2. 启动后端服务器

在项目根目录执行：

```bash
npm run server
```

后端服务器将在 http://localhost:3000 启动。

### 3. 启动前端应用

在项目根目录执行：

```bash
npm run dev
```

前端应用将在 http://localhost:5173 启动（如果端口被占用，会自动切换到其他端口）。

### 4. 运行测试

在项目根目录执行：

```bash
npm test
```

这将运行所有测试用例，并显示测试结果。

### 5. 访问系统

打开浏览器访问前端应用地址，即可进入蔬菜接单系统。

## 功能说明

1. **大排档管理**：管理商户信息，支持添加、编辑、删除商户。
2. **蔬菜订单**：管理蔬菜订单，支持按分类选择蔬菜，添加、编辑、删除订单，以及标记完成状态。
3. **结算**：对订单进行结算，支持生成结算记录。
4. **订单信息**：生成订单信息文本，方便发给商户。

## 蔬菜分类

系统支持以下蔬菜分类：
- 葱姜蒜类
- 根茎菜类
- 叶菜类
- 豆菜类
- 茄果菜类
- 食用菌
- 瓜菜类
- 芽苗类
- 野菜特菜
- 水生菜类
- 甘蓝类
- 菜用花类

## 注意事项

- 应用已集成 Ant Design Vue 作为 UI 组件库。
- 系统支持移动端响应式设计，适配不同屏幕尺寸。
- 后端使用内存存储模拟数据库，重启服务后数据会重置。
- 项目采用 TDD 开发方式，建议在开发新功能时先编写测试用例。
