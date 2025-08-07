# Jupyter-like JavaScript Markdown 笔记软件设计

## 项目概述

基于现有的 Electron + Vue 3 + TypeScript 项目，开发一个类似 Jupyter 的 JavaScript Markdown 笔记应用，支持在 Markdown 中嵌入和运行 JavaScript 代码块。

## 核心功能设计

### 1. 代码块执行
- **JavaScript 代码块**：支持在 Markdown 中嵌入可执行的 JavaScript 代码
- **实时执行**：代码块可以独立运行，显示执行结果
- **输出显示**：支持 console.log、图表、HTML 等输出格式
- **错误处理**：优雅的错误显示和调试信息

### 2. 交互式界面
- **代码编辑器**：语法高亮、自动补全、错误提示
- **运行按钮**：每个代码块都有独立的运行按钮
- **输出区域**：显示代码执行结果
- **状态指示**：显示代码块运行状态（运行中、成功、错误）

### 3. 数据可视化
- **图表支持**：集成 Chart.js 或 D3.js 进行数据可视化
- **HTML 输出**：支持渲染 HTML 内容
- **图片显示**：支持生成和显示图片
- **表格输出**：美化表格显示

## 技术栈更新

### 当前技术栈
- **桌面应用框架**: Electron 37.2.3
- **前端框架**: Vue 3.5.17 + TypeScript 5.8.3
- **构建工具**: Vite 7.0.5 + electron-vite 4.0.0
- **状态管理**: Pinia 3.0.3
- **样式框架**: UnoCSS 66.4.1

### 需要新增的技术栈

#### 1. 代码执行引擎
- **代码沙箱**: `vm2` 或自定义沙箱环境
- **代码高亮**: `@codemirror/lang-javascript` + `@codemirror/theme-one-dark`
- **代码格式化**: `prettier` + `@prettier/plugin-php`

#### 2. 数据可视化
- **图表库**: `chart.js` + `vue-chartjs`
- **D3.js**: `d3` (可选，用于高级可视化)
- **数学公式**: `katex` + `markdown-it-katex`

#### 3. 输出渲染
- **HTML 渲染**: 安全的 HTML 渲染器
- **Markdown 增强**: `markdown-it` 插件扩展
- **代码高亮**: `prismjs` 或 `highlight.js`

#### 4. 开发工具
- **调试工具**: 集成开发者工具
- **性能监控**: 代码执行性能分析
- **错误追踪**: 详细的错误信息和堆栈跟踪

## 功能架构设计

### 1. 代码块组件 (CodeBlock.vue)
```typescript
interface CodeBlock {
  id: string
  type: 'javascript' | 'markdown'
  content: string
  output: CodeOutput[]
  status: 'idle' | 'running' | 'success' | 'error'
  executionTime?: number
}

interface CodeOutput {
  type: 'console' | 'html' | 'chart' | 'image' | 'table'
  content: any
  timestamp: number
}
```

### 2. 代码执行引擎
- **沙箱环境**: 安全的 JavaScript 执行环境
- **模块系统**: 支持导入常用库（lodash、moment 等）
- **全局对象**: 提供常用的全局函数和对象
- **内存管理**: 防止内存泄漏和无限循环

### 3. 输出渲染系统
- **Console 输出**: 捕获 console.log、console.error 等
- **HTML 渲染**: 安全的 HTML 内容渲染
- **图表渲染**: Chart.js 图表显示
- **错误显示**: 格式化的错误信息

## 用户界面设计

### 1. 编辑器布局
```
┌─────────────────────────────────────────┐
│ 工具栏 (运行、停止、清除输出)              │
├─────────────────────────────────────────┤
│ 代码编辑器 (语法高亮、行号)               │
├─────────────────────────────────────────┤
│ 输出区域 (结果、图表、错误)               │
└─────────────────────────────────────────┘
```

### 2. 交互功能
- **运行按钮**: 每个代码块右上角的运行按钮
- **停止按钮**: 长时间运行的代码可以停止
- **清除输出**: 清除代码块的输出结果
- **复制代码**: 复制代码块内容
- **删除代码块**: 删除整个代码块

### 3. 状态指示
- **运行中**: 旋转的加载图标
- **成功**: 绿色勾号
- **错误**: 红色错误图标
- **执行时间**: 显示代码执行耗时

## 安全考虑

### 1. 代码沙箱
- **隔离环境**: 使用 vm2 创建安全的执行环境
- **资源限制**: 限制内存使用和执行时间
- **API 限制**: 限制危险的 API 调用
- **网络限制**: 控制网络请求

### 2. 输出安全
- **HTML 过滤**: 过滤危险的 HTML 标签和属性
- **XSS 防护**: 防止跨站脚本攻击
- **内容验证**: 验证输出内容的合法性

## 开发计划

### 第一阶段：基础架构 (Week 1-2)
1. **代码执行引擎**
   - 集成 vm2 沙箱环境
   - 实现基础的代码执行功能
   - 添加错误处理和超时机制

2. **代码块组件**
   - 创建 CodeBlock 组件
   - 实现代码编辑和运行功能
   - 添加输出显示区域

3. **输出渲染**
   - 实现 console 输出捕获
   - 添加 HTML 安全渲染
   - 集成基础图表显示

### 第二阶段：功能增强 (Week 3-4)
1. **数据可视化**
   - 集成 Chart.js
   - 支持多种图表类型
   - 添加交互式图表

2. **编辑器增强**
   - 代码语法高亮
   - 自动补全功能
   - 错误提示和修复建议

3. **用户体验**
   - 添加运行状态指示
   - 实现代码块管理
   - 优化界面交互

### 第三阶段：高级功能 (Week 5-6)
1. **调试功能**
   - 集成开发者工具
   - 添加断点调试
   - 变量查看器

2. **性能优化**
   - 代码执行性能分析
   - 内存使用监控
   - 优化渲染性能

3. **扩展功能**
   - 支持更多输出格式
   - 添加代码模板
   - 实现代码分享

## 技术实现细节

### 1. 代码执行流程
```typescript
async function executeCode(code: string, context: ExecutionContext) {
  const vm = new VM({
    timeout: 5000,
    sandbox: {
      console: createConsoleProxy(),
      Chart: Chart,
      // 其他全局对象
    }
  });
  
  try {
    const result = await vm.run(code);
    return { success: true, result };
  } catch (error) {
    return { success: false, error };
  }
}
```

### 2. 输出捕获
```typescript
function createConsoleProxy() {
  const outputs: CodeOutput[] = [];
  
  return {
    log: (...args: any[]) => {
      outputs.push({
        type: 'console',
        content: args,
        timestamp: Date.now()
      });
    },
    // 其他 console 方法
  };
}
```

### 3. 图表渲染
```typescript
function renderChart(config: ChartConfig) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  new Chart(ctx, config);
  return canvas;
}
```

## 文件结构规划

```
src/
├── main/
│   ├── index.ts
│   ├── codeExecutor.ts      # 代码执行引擎
│   └── security.ts          # 安全相关
├── preload/
│   └── index.ts
└── renderer/
    ├── src/
    │   ├── components/
    │   │   ├── CodeBlock.vue    # 代码块组件
    │   │   ├── CodeEditor.vue   # 代码编辑器
    │   │   ├── OutputDisplay.vue # 输出显示
    │   │   └── ChartRenderer.vue # 图表渲染
    │   ├── composables/
    │   │   ├── useCodeExecution.ts # 代码执行
    │   │   └── useOutputRenderer.ts # 输出渲染
    │   ├── utils/
    │   │   ├── codeSandbox.ts   # 代码沙箱
    │   │   ├── outputRenderer.ts # 输出渲染器
    │   │   └── security.ts      # 安全工具
    │   └── stores/
    │       ├── codeBlocks.ts    # 代码块状态
    │       └── execution.ts     # 执行状态
    └── index.html
```

这个设计将创建一个功能强大的 JavaScript Markdown 笔记软件，类似于 Jupyter 但专注于 JavaScript 生态系统！
