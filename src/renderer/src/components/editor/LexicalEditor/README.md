# LexicalComposer 使用指南

`LexicalComposer` 是一个用于提供 Lexical 编辑器的上下文组件，它封装了 Lexical 编辑器的状态管理和配置。

## 基本用法

```vue
<template>
  <LexicalComposer 
    :config="{
      namespace: 'MyEditor',
      editable: true,
      autoFocus: false
    }"
    :show-debug="true"
  >
    <!-- 编辑器组件 -->
    <LexicalEditor 
      v-model="content"
      @init="handleInit"
      @change="handleChange"
    />
    
    <!-- 工具栏组件 -->
    <Toolbar v-if="editor" :editor="editor" />
  </LexicalComposer>
</template>

<script setup lang="ts">
import LexicalComposer from './LexicalComposer.vue'
import LexicalEditor from './LexicalEditor.vue'
import Toolbar from '../Toolbar.vue'
import { useLexicalEditor } from './useLexicalContext'

// 使用上下文
const {
  editor,
  content,
  showDebug,
  isInitialized,
  error,
  setContent,
  setEditor
} = useLexicalEditor()

const handleInit = (instance) => {
  setEditor(instance)
}

const handleChange = (value) => {
  setContent(value)
}
</script>
```

## Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| config | LexicalEditorConfig | `{ namespace: 'LexicalEditor', editable: true, autoFocus: false }` | 编辑器配置 |
| showDebug | boolean | false | 是否显示调试信息 |

## 暴露的上下文

`LexicalComposer` 通过 `useLexicalEditor()` 提供以下上下文：

- `editor`: Lexical 编辑器实例
- `config`: 编辑器配置
- `content`: 编辑器内容
- `editorState`: 编辑器状态
- `showDebug`: 是否显示调试信息
- `isInitialized`: 编辑器是否已初始化
- `error`: 错误状态
- `setEditor()`: 设置编辑器实例
- `setContent()`: 设置内容
- `setConfig()`: 设置配置
- `setShowDebug()`: 设置调试显示
- `setError()`: 设置错误
- `updateEditorState()`: 更新编辑器状态
- `cleanup()`: 清理资源
- `onCleanup()`: 添加清理函数

## 组件结构

```
LexicalComposer (提供上下文)
├── LexicalEditor (使用上下文)
├── Toolbar (使用上下文)
└── 其他子组件 (使用上下文)
```

## 注意事项

1. `LexicalComposer` 必须在最外层包装所有需要访问 Lexical 上下文的组件
2. 子组件通过 `useLexicalEditor()` 获取上下文
3. 组件卸载时会自动清理资源
4. 支持多个编辑器实例，每个 `LexicalComposer` 提供独立的上下文
