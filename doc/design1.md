# Markdown Note App 设计文档

## 项目概述

基于现有的 Electron + Vue 3 + TypeScript 项目，开发一个功能完整的 Markdown 笔记应用。

## 技术栈分析

### 当前技术栈
- **桌面应用框架**: Electron 37.2.3
- **前端框架**: Vue 3.5.17 + TypeScript 5.8.3
- **构建工具**: Vite 7.0.5 + electron-vite 4.0.0
- **代码质量**: ESLint + Prettier
- **包管理**: pnpm

### 需要新增的技术栈

#### 1. Markdown 相关
- **Markdown 解析器**: `markdown-it`
- **Markdown 编辑器**: `@codemirror/view` + `@codemirror/lang-markdown`
- **语法高亮**: `@codemirror/state` + `@codemirror/theme-one-dark`
- **实时预览**: 自定义 Vue 组件

#### 2. 文件系统
- **文件操作**: Node.js fs 模块 (通过 Electron main process)
- **文件监控**: `chokidar` (监听文件变化)
- **文件格式**: `.md` 文件支持

#### 3. UI 组件库
- **基础组件**: `@headlessui/vue`, `@vueuse/core`
- **图标库**: `@heroicons/vue` 
- **样式框架**: UnoCSS

#### 4. 数据管理
- **状态管理**: Pinia (Vue 3 推荐)
- **本地存储**: Electron Store 
- **文件索引**: 自定义索引系统

#### 5. 功能增强
- **搜索**: `fuse.js` (模糊搜索)
- **快捷键**: `@vueuse/core` 的 useKeyboardShortcut
- **拖拽**: `@vueuse/core` 的 useDraggable
- **导出**: `puppeteer` (PDF 导出)

## 待办列表

### 第一阶段：基础架构 (Week 1-2)

#### 1.1 项目初始化
- [x] 安装必要的依赖包
  - [x] `markdown-it` (Markdown 解析)
  - [x] `@codemirror/view` (编辑器)
  - [x] `@codemirror/lang-markdown` (Markdown 语法)
  - [x] `@codemirror/state` (编辑器状态)
  - [x] `@codemirror/theme-one-dark` (主题)
  - [x] `pinia` (状态管理)
  - [x] `@headlessui/vue` (UI 组件)
  - [x] `@heroicons/vue` (图标)
  - [x] `unocss` (样式框架)
  - [x] `chokidar` (文件监控)
  - [x] `fuse.js` (模糊搜索)
  - [x] `electron-store` (本地存储)
  - [x] `markdown-it-highlightjs` (代码高亮)
  - [x] `markdown-it-task-lists` (任务列表)
  - [x] `markdown-it-footnote` (脚注)
  - [x] `highlight.js` (语法高亮)

#### 1.2 基础布局设计
- [x] 设计应用主布局 (侧边栏 + 主内容区)
- [x] 实现侧边栏组件 (文件树)
- [x] 实现主内容区组件 (编辑器 + 预览)
- [x] 实现顶部工具栏

#### 1.3 项目配置完成
- [x] 配置 UnoCSS (uno.config.ts)
- [x] 更新 Vite 配置集成 UnoCSS
- [x] 配置 TypeScript 路径别名 (@/*)
- [x] 集成 Pinia 状态管理
- [x] 创建基础 Store 结构
  - [x] files.ts (文件状态管理)
  - [x] editor.ts (编辑器状态管理)
  - [x] settings.ts (设置状态管理)
- [x] 创建基础组合式函数
  - [x] useFileManager.ts (文件管理)
- [x] 创建工具函数
  - [x] markdown.ts (Markdown 处理)
  - [x] fileUtils.ts (文件工具)
- [x] 类型检查通过

#### 1.4 文件系统集成
- [ ] 在 main process 中实现文件操作 API
- [ ] 实现文件读取功能
- [ ] 实现文件保存功能
- [ ] 实现文件创建功能
- [ ] 实现文件删除功能

### 第二阶段：核心功能 (Week 3-4)

#### 2.1 Markdown 编辑器
- [ ] 集成 CodeMirror 编辑器
- [ ] 配置 Markdown 语法高亮
- [ ] 实现编辑器主题切换
- [ ] 添加编辑器快捷键支持
- [ ] 实现自动保存功能

#### 2.2 Markdown 预览
- [ ] 实现 Markdown 实时预览
- [ ] 支持代码语法高亮
- [ ] 支持数学公式渲染 (可选)
- [ ] 支持图表渲染 (可选)
- [ ] 实现预览主题切换

#### 2.3 文件管理
- [ ] 实现文件树组件
- [ ] 支持文件夹展开/折叠
- [ ] 支持文件重命名
- [ ] 支持文件拖拽排序
- [ ] 实现最近打开文件列表

### 第三阶段：高级功能 (Week 5-6)

#### 3.1 搜索功能
- [ ] 集成 `fuse.js` 实现模糊搜索
- [ ] 实现全局搜索界面
- [ ] 支持搜索历史记录
- [ ] 实现搜索结果高亮
- [ ] 支持正则表达式搜索

#### 3.2 状态管理
- [ ] 使用 Pinia 管理应用状态
- [ ] 实现文件列表状态管理
- [ ] 实现编辑器状态管理
- [ ] 实现设置状态管理
- [ ] 实现搜索状态管理

#### 3.3 设置系统
- [ ] 实现设置界面
- [ ] 支持编辑器主题设置
- [ ] 支持预览主题设置
- [ ] 支持字体大小设置
- [ ] 支持快捷键自定义

### 第四阶段：用户体验优化 (Week 7-8)

#### 4.1 快捷键系统
- [ ] 实现常用快捷键
  - [ ] Ctrl+N (新建文件)
  - [ ] Ctrl+S (保存文件)
  - [ ] Ctrl+O (打开文件)
  - [ ] Ctrl+F (搜索)
  - [ ] Ctrl+Shift+F (全局搜索)
- [ ] 支持快捷键自定义
- [ ] 添加快捷键帮助界面

#### 4.2 导出功能
- [ ] 实现 Markdown 导出为 HTML
- [ ] 实现 Markdown 导出为 PDF
- [ ] 实现 Markdown 导出为纯文本
- [ ] 支持批量导出功能

#### 4.3 性能优化
- [ ] 实现文件懒加载
- [ ] 优化大文件渲染性能
- [ ] 实现编辑器虚拟滚动
- [ ] 优化搜索性能

### 第五阶段：高级特性 (Week 9-10)

#### 5.1 协作功能 (可选)
- [ ] 实现文件版本控制
- [ ] 支持文件同步 (云存储)
- [ ] 实现文件分享功能

#### 5.2 插件系统 (可选)
- [ ] 设计插件架构
- [ ] 实现插件 API
- [ ] 支持自定义主题插件
- [ ] 支持自定义快捷键插件

#### 5.3 数据备份
- [ ] 实现自动备份功能
- [ ] 支持备份到本地
- [ ] 支持备份到云端
- [ ] 实现备份恢复功能

## 项目结构规划

```
src/
├── main/
│   ├── index.ts                 # 主进程入口
│   ├── fileManager.ts           # 文件管理
│   └── ipcHandlers.ts           # IPC 处理器
├── preload/
│   └── index.ts                 # 预加载脚本
└── renderer/
    ├── src/
    │   ├── App.vue              # 主应用组件
    │   ├── main.ts              # 渲染进程入口
    │   ├── stores/              # Pinia 状态管理
    │   │   ├── files.ts         # 文件状态
    │   │   ├── editor.ts        # 编辑器状态
    │   │   └── settings.ts      # 设置状态
    │   ├── components/          # Vue 组件
    │   │   ├── Sidebar.vue      # 侧边栏
    │   │   ├── FileTree.vue     # 文件树
    │   │   ├── Editor.vue       # Markdown 编辑器
    │   │   ├── Preview.vue      # Markdown 预览
    │   │   ├── Toolbar.vue      # 工具栏
    │   │   └── Search.vue       # 搜索组件
    │   ├── composables/         # Vue 组合式函数
    │   │   ├── useFileManager.ts # 文件管理
    │   │   ├── useEditor.ts     # 编辑器相关
    │   │   └── useSearch.ts     # 搜索相关
    │   └── utils/               # 工具函数
    │       ├── markdown.ts      # Markdown 处理
    │       └── fileUtils.ts     # 文件工具
    └── index.html               # HTML 模板
```

## 开发优先级

1. **高优先级**: 基础架构、文件系统、Markdown 编辑器
2. **中优先级**: 搜索功能、状态管理、设置系统
3. **低优先级**: 导出功能、性能优化、高级特性

## 技术选型说明

### 为什么选择 CodeMirror？
- 轻量级且性能优秀
- 对 Markdown 支持良好
- 可定制性强
- 活跃的社区支持

### 为什么选择 Pinia？
- Vue 3 官方推荐的状态管理方案
- TypeScript 支持良好
- 开发工具支持完善
- 学习成本低

### 为什么选择 Tailwind CSS？
- 快速开发
- 响应式设计支持
- 可定制性强
- 文件大小可控

## 风险评估

### 技术风险
- **CodeMirror 集成复杂度**: 中等风险，需要深入学习 API
- **文件系统性能**: 低风险，Node.js 原生支持
- **大文件处理**: 中等风险，需要优化渲染性能

### 时间风险
- **功能范围过大**: 建议先实现核心功能，后续迭代
- **UI/UX 设计**: 需要投入时间进行界面设计
- **测试覆盖**: 需要编写足够的测试用例

## 后续规划

1. **MVP 版本**: 实现基础的 Markdown 编辑和预览功能
2. **Beta 版本**: 添加搜索、设置等核心功能
3. **正式版本**: 完善用户体验，添加高级功能
4. **迭代优化**: 根据用户反馈持续改进
