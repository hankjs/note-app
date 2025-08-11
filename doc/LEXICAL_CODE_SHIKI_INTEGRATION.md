# @lexical/code-shiki 集成文档

## 概述

`@lexical/code-shiki` 是一个为 Lexical 编辑器提供基于 Shiki 的代码语法高亮的模块。它能够自动检测代码语言并应用相应的语法高亮规则，提供专业的代码显示效果。

## 功能特性

- 🎨 **自动语法高亮**：基于 Shiki 引擎，支持 100+ 种编程语言
- 🌈 **主题支持**：内置多种主题，支持自定义主题
- 🔍 **语言检测**：自动识别代码块中的编程语言
- ⚡ **性能优化**：高效的语法解析和高亮渲染
- 🎯 **无缝集成**：与 Lexical 编辑器的代码块功能完美配合

## 安装

```bash
pnpm add @lexical/code-shiki
```

## 集成步骤

### 1. 导入模块

```typescript
import { registerCodeHighlighting } from '@lexical/code-shiki'
```

### 2. 注册代码高亮

```typescript
import { mergeRegister } from '@lexical/utils'

// 在编辑器配置中注册
mergeRegister(
  registerRichText(editor),
  registerHistory(editor, createEmptyHistoryState(), 300),
  registerCodeHighlighting(editor) // 注册代码高亮
)
```

### 3. 确保节点类型

确保编辑器包含必要的节点类型：

```typescript
import { CodeNode, CodeHighlightNode } from '@lexical/code'

const initialConfig = {
  nodes: [HeadingNode, QuoteNode, CodeNode, CodeHighlightNode],
  // ... 其他配置
}
```

## 使用方法

### 创建代码块

1. 在工具栏的块类型选择器中选择"代码块"
2. 或者使用快捷键 `Ctrl+Shift+K`（如果已配置）
3. 在代码块中输入代码

### 代码高亮示例

```javascript
// JavaScript 代码会自动高亮
function helloWorld() {
  console.log("Hello, World!");
  return "Hello from Lexical!";
}

// 支持 ES6+ 语法
const greeting = (name) => `Hello, ${name}!`;
```

```typescript
// TypeScript 代码高亮
interface User {
  id: number;
  name: string;
  email: string;
}

class UserService {
  async getUser(id: number): Promise<User | null> {
    // 实现逻辑
    return null;
  }
}
```

```html
<!-- HTML 代码高亮 -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>Lexical 编辑器</title>
</head>
<body>
  <h1>欢迎使用 Lexical</h1>
  <p>这是一个强大的富文本编辑器</p>
</body>
</html>
```

## 支持的语言

`@lexical/code-shiki` 支持以下主要编程语言：

- **Web 开发**：HTML, CSS, JavaScript, TypeScript, JSX, TSX
- **后端开发**：Python, Java, C#, Go, Rust, PHP, Ruby
- **数据科学**：Python, R, Julia, SQL
- **系统编程**：C, C++, Rust, Go
- **标记语言**：Markdown, YAML, JSON, XML
- **配置文件**：TOML, INI, Shell scripts

## 主题支持

默认支持多种主题：

- `github-dark` - GitHub 深色主题
- `github-light` - GitHub 浅色主题
- `dracula` - Dracula 主题
- `monokai` - Monokai 主题
- `nord` - Nord 主题
- `one-dark` - One Dark 主题

## 自定义配置

### 语言配置

```typescript
// 可以配置支持的语言
const languageConfig = {
  languages: ['javascript', 'typescript', 'python', 'java']
}
```

### 主题配置

```typescript
// 可以配置主题
const themeConfig = {
  theme: 'github-dark'
}
```

## 性能优化

- 代码高亮是异步进行的，不会阻塞编辑器操作
- 支持懒加载，只在需要时加载语言包
- 缓存机制减少重复解析

## 故障排除

### 常见问题

1. **代码高亮不工作**
   - 检查是否正确注册了 `registerCodeHighlighting`
   - 确保包含了 `CodeNode` 和 `CodeHighlightNode`

2. **特定语言不支持**
   - 检查语言名称是否正确
   - 某些语言可能需要额外的语言包

3. **主题不生效**
   - 检查主题名称是否正确
   - 确保主题文件已正确加载

### 调试技巧

```typescript
// 在控制台中检查编辑器状态
editor.getEditorState().read(() => {
  const root = $getRoot()
  console.log('Editor content:', root.getTextContent())
})

// 检查代码块节点
const codeBlocks = root.getChildren().filter(node => node.getType() === 'code')
console.log('Code blocks:', codeBlocks)
```

## 测试

使用提供的测试组件验证集成：

```vue
<template>
  <CodeShikiTest />
</template>

<script setup>
import CodeShikiTest from '@/components/editor/CodeShikiTest.vue'
</script>
```

## 相关资源

- [Lexical 官方文档](https://lexical.dev/)
- [@lexical/code 模块](https://lexical.dev/docs/modules/code)
- [Shiki 语法高亮引擎](https://shiki.matsu.io/)
- [代码高亮主题预览](https://shiki.matsu.io/themes)

## 更新日志

- **v0.34.0** - 初始集成，支持基本代码高亮功能
- 支持多种编程语言和主题
- 与工具栏代码块功能集成
- 提供测试组件和文档
