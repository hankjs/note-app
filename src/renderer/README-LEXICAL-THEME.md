# Lexical 编辑器主题系统

本项目实现了一个完整的 Lexical 编辑器主题系统，使用 CSS 变量和顶层 classname 控制主题。

## 特性

- 🎨 **完整的主题系统**: 支持亮色和暗色主题
- 🎯 **CSS 变量驱动**: 使用 CSS 变量实现主题切换
- 🏷️ **顶层类名控制**: 通过 `.app` 类名控制主题状态
- 🛠️ **完整工具栏**: 支持文本格式、标题、列表、代码等
- 📱 **响应式设计**: 适配不同屏幕尺寸
- ♿ **无障碍支持**: 支持高对比度和减少动画模式

## 文件结构

```
src/renderer/src/
├── components/
│   ├── LexicalEditorWithTheme.vue    # 主题化编辑器组件
│   ├── LexicalThemeDemo.vue          # 主题演示页面
│   └── LexicalEditor.vue             # 基础编辑器组件
├── utils/
│   └── lexicalTheme.ts               # 主题配置和工具函数
├── assets/
│   └── lexical-editor.css            # 主题样式文件
└── types/
    └── lexical.d.ts                  # 类型定义
```

## 使用方法

### 1. 基础用法

```vue
<template>
  <LexicalEditorWithTheme 
    v-model="content"
    placeholder="开始输入..."
    :show-debug="false"
  />
</template>

<script setup>
import { ref } from 'vue'
import LexicalEditorWithTheme from '@/components/LexicalEditorWithTheme.vue'

const content = ref('')
</script>
```

### 2. 主题切换

```vue
<template>
  <button @click="toggleTheme">
    {{ isDark ? '切换到亮色' : '切换到暗色' }}
  </button>
</template>

<script setup>
import { ref } from 'vue'

const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  const app = document.querySelector('.app')
  if (app) {
    if (isDark.value) {
      app.classList.add('theme-dark')
      app.classList.remove('theme-light')
    } else {
      app.classList.add('theme-light')
      app.classList.remove('theme-dark')
    }
  }
}
</script>
```

### 3. 自定义主题

```typescript
// 在 lexicalTheme.ts 中自定义主题
export const createCustomTheme = (isDark: boolean = false) => {
  return {
    // 自定义主题配置
    paragraph: 'custom-paragraph-class',
    heading: {
      h1: 'custom-h1-class',
      h2: 'custom-h2-class',
      // ...
    }
  }
}
```

## 主题系统架构

### CSS 变量层级

```css
.app {
  /* 基础变量 */
  --lexical-text-primary: var(--color-text);
  --lexical-bg-primary: var(--color-background);
  --lexical-border-primary: var(--color-border);
  
  /* 间距变量 */
  --lexical-spacing-xs: 0.25rem;
  --lexical-spacing-sm: 0.5rem;
  --lexical-spacing-md: 0.75rem;
  --lexical-spacing-lg: 1rem;
  
  /* 字体变量 */
  --lexical-font-size-xs: 0.75rem;
  --lexical-font-size-sm: 0.875rem;
  --lexical-font-size-base: 1rem;
  --lexical-font-size-lg: 1.125rem;
}

/* 暗色主题 */
.app.theme-dark {
  --lexical-text-primary: #f9fafb;
  --lexical-bg-primary: #1f2937;
  --lexical-border-primary: #374151;
}

/* 亮色主题 */
.app.theme-light {
  --lexical-text-primary: #111827;
  --lexical-bg-primary: #ffffff;
  --lexical-border-primary: #e5e7eb;
}
```

### 类名映射

```typescript
// Lexical 主题配置
const theme = {
  paragraph: 'lexical-paragraph',
  heading: {
    h1: 'lexical-heading-h1',
    h2: 'lexical-heading-h2',
    h3: 'lexical-heading-h3',
    h4: 'lexical-heading-h4',
    h5: 'lexical-heading-h5',
    h6: 'lexical-heading-h6',
  },
  list: {
    ul: 'lexical-list-ul',
    ol: 'lexical-list-ol',
    listitem: 'lexical-listitem',
  },
  text: {
    bold: 'lexical-text-bold',
    italic: 'lexical-text-italic',
    underline: 'lexical-text-underline',
    strikethrough: 'lexical-text-strikethrough',
    code: 'lexical-text-code',
  },
  // ... 更多配置
}
```

## 工具栏功能

### 文本格式
- **粗体**: 使用 `<strong>` 标签
- **斜体**: 使用 `<em>` 标签
- **下划线**: 使用 `<u>` 标签
- **删除线**: 使用 `<s>` 标签

### 标题级别
- H1 到 H6 六个级别
- 支持动态切换

### 列表
- **无序列表**: 使用 `<ul>` 标签
- **有序列表**: 使用 `<ol>` 标签
- 支持嵌套列表

### 代码
- **行内代码**: 使用 `<code>` 标签
- **代码块**: 使用 `<pre>` 标签

### 其他
- **引用**: 使用 `<blockquote>` 标签
- **链接**: 支持插入超链接
- **图片**: 支持插入图片

## 响应式设计

### 断点设置
```css
/* 移动端 */
@media (max-width: 640px) {
  .lexical-toolbar {
    flex-direction: column;
    gap: var(--lexical-spacing-sm);
  }
  
  .toolbar-btn {
    width: 1.75rem;
    height: 1.75rem;
  }
}

/* 平板端 */
@media (max-width: 768px) {
  .lexical-toolbar {
    flex-direction: column;
    gap: var(--lexical-spacing-sm);
  }
}
```

### 触摸优化
- 按钮尺寸适配触摸操作
- 工具栏布局优化移动端体验

## 无障碍支持

### 高对比度模式
```css
@media (prefers-contrast: high) {
  .editor-container {
    border-width: 3px;
  }
  
  .toolbar-btn {
    border-width: 2px;
  }
}
```

### 减少动画模式
```css
@media (prefers-reduced-motion: reduce) {
  .editor-container,
  .toolbar-btn {
    transition: none;
  }
  
  .lexical-cursor {
    animation: none;
  }
}
```

## 性能优化

### CSS 变量缓存
- 使用 CSS 变量避免重复计算
- 主题切换时只更新必要的样式

### 事件优化
- 使用防抖处理输入事件
- 优化粘贴和拖拽事件处理

## 开发调试

### 调试模式
```vue
<LexicalEditorWithTheme 
  :show-debug="true"
  v-model="content"
/>
```

### 调试信息
- 内容长度统计
- 编辑器状态监控
- 主题状态显示
- 当前格式信息

## 扩展开发

### 添加新主题
1. 在 `lexicalTheme.ts` 中定义新主题配置
2. 在 `lexical-editor.css` 中添加对应的 CSS 变量
3. 在组件中添加主题切换逻辑

### 添加新功能
1. 在工具栏中添加新按钮
2. 实现对应的功能函数
3. 更新类型定义和样式

## 注意事项

1. **CSS 变量兼容性**: 确保目标浏览器支持 CSS 变量
2. **主题切换时机**: 在 DOM 更新完成后再更新 CSS 变量
3. **性能考虑**: 避免频繁的主题切换操作
4. **样式隔离**: 使用命名空间避免样式冲突

## 故障排除

### 主题不生效
- 检查 `.app` 类名是否正确
- 确认 CSS 变量是否正确定义
- 检查浏览器开发者工具中的样式应用

### 工具栏不显示
- 检查 `showToolbar` 属性设置
- 确认图标组件是否正确导入
- 检查控制台错误信息

### 样式异常
- 检查 CSS 变量值是否正确
- 确认主题类名是否正确应用
- 检查样式优先级和覆盖关系

## 更新日志

### v1.0.0
- 初始版本发布
- 支持亮色和暗色主题
- 完整的工具栏功能
- 响应式设计支持

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个主题系统。

## 许可证

本项目采用 MIT 许可证。
