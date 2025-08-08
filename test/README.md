# 测试文档

## 概述

本项目使用 Vitest 作为测试框架，提供了完整的单元测试覆盖。

## 测试结构

```
test/
├── setup.ts                    # 测试环境设置
├── README.md                   # 测试文档
└── unit/                       # 单元测试
    ├── typescriptCompiler.test.ts  # TypeScript 编译器测试
    ├── codeSandbox.test.ts         # 代码沙箱测试
    └── stores/                     # Store 测试
        └── codeBlocks.test.ts      # 代码块状态管理测试
```

## 测试命令

```bash
# 运行所有测试
pnpm run test

# 运行测试并显示 UI
pnpm run test:ui

# 运行测试并生成报告
pnpm run test:run

# 运行测试并生成覆盖率报告
pnpm run test:coverage
```

## 测试覆盖范围

### 1. TypeScript 编译器 (`typescriptCompiler.test.ts`)

测试 TypeScript 编译器的核心功能：

- ✅ 编译简单的 TypeScript 代码
- ✅ 处理 TypeScript 类型错误
- ✅ 处理语法错误
- ✅ 编译泛型代码
- ✅ 语法检查功能
- ✅ 代码格式化功能

### 2. 代码沙箱 (`codeSandbox.test.ts`)

测试代码执行环境：

- ✅ JavaScript 代码执行
- ✅ TypeScript 代码编译和执行
- ✅ 错误处理
- ✅ 超时机制
- ✅ 控制台输出捕获
- ✅ 安全执行环境

### 3. 代码块状态管理 (`codeBlocks.test.ts`)

测试 Pinia store 的状态管理：

- ✅ 代码块创建（JavaScript、TypeScript、Markdown）
- ✅ 代码块内容更新
- ✅ 代码块删除
- ✅ 代码块选择
- ✅ 状态管理（运行中、成功、错误）
- ✅ 输出管理
- ✅ 代码块移动和复制
- ✅ 计算属性

## 测试环境配置

### 模拟环境

测试环境模拟了以下组件：

- **Electron API**: 模拟 Electron 主进程 API
- **Console**: 模拟控制台输出
- **DOM API**: 使用 jsdom 提供 DOM 环境
- **浏览器 API**: 模拟 ResizeObserver、IntersectionObserver 等

### 路径别名

测试配置支持与项目相同的路径别名：

- `@/*` 指向 `src/renderer/src/*`

## 覆盖率报告

运行 `pnpm run test:coverage` 会生成详细的覆盖率报告，包括：

- 行覆盖率
- 分支覆盖率
- 函数覆盖率
- 语句覆盖率

## 持续集成

测试可以在 CI/CD 流程中运行：

```yaml
# 示例 GitHub Actions 配置
- name: Run Tests
  run: pnpm run test:run

- name: Generate Coverage Report
  run: pnpm run test:coverage
```

## 最佳实践

1. **测试命名**: 使用描述性的测试名称
2. **测试组织**: 按功能模块组织测试文件
3. **模拟依赖**: 适当模拟外部依赖
4. **清理资源**: 在 `afterEach` 中清理测试状态
5. **覆盖率**: 保持高测试覆盖率

## 故障排除

### 常见问题

1. **模块导入错误**: 检查路径别名配置
2. **类型错误**: 确保 TypeScript 配置正确
3. **环境问题**: 检查测试设置文件

### 调试测试

```bash
# 运行单个测试文件
pnpm run test typescriptCompiler.test.ts

# 运行特定测试
pnpm run test -- -t "should compile simple TypeScript code"

# 调试模式
pnpm run test -- --reporter=verbose
```
