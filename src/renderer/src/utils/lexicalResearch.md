# Lexical 核心 API 研究笔记

## 1. 核心概念

### 1.1 Lexical 架构
- **Editor**: 编辑器实例，管理整个编辑状态
- **EditorState**: 编辑器的状态，包含所有节点和选择
- **Node**: 编辑器中的节点，如文本、段落、标题等
- **Selection**: 当前的选择状态
- **Command**: 用于修改编辑器状态的命令

### 1.2 基本使用流程
```typescript
import { createEditor, $getRoot, $createParagraphNode, $createTextNode } from 'lexical';

// 1. 创建编辑器
const editor = createEditor({
  namespace: 'MyEditor',
  onError: (error) => console.error(error),
});

// 2. 注册节点
editor.registerNode(ParagraphNode);
editor.registerNode(TextNode);

// 3. 初始化内容
editor.update(() => {
  const root = $getRoot();
  const paragraph = $createParagraphNode();
  const text = $createTextNode('Hello World');
  paragraph.append(text);
  root.append(paragraph);
});
```

## 2. 核心 API

### 2.1 Editor 创建和配置
```typescript
interface EditorConfig {
  namespace: string;
  theme?: EditorTheme;
  nodes?: Array<Klass<LexicalNode>>;
  onError?: (error: Error) => void;
  editable?: boolean;
  editorState?: string;
  placeholder?: string;
}

const editor = createEditor(config);
```

### 2.2 编辑器生命周期
```typescript
// 注册节点
editor.registerNode(MyCustomNode);

// 更新编辑器状态
editor.update(() => {
  // 在这里修改编辑器状态
});

// 获取编辑器状态
const editorState = editor.getEditorState();

// 设置编辑器状态
editor.setEditorState(editorState);

// 销毁编辑器
editor.destroy();
```

### 2.3 常用命令
```typescript
// 获取根节点
const root = $getRoot();

// 获取当前选择
const selection = $getSelection();

// 创建节点
const paragraph = $createParagraphNode();
const text = $createTextNode('Hello');

// 插入节点
root.append(paragraph);
paragraph.append(text);

// 删除节点
node.remove();
```

## 3. Vue 集成要点

### 3.1 生命周期管理
- 在 `onMounted` 中创建编辑器实例
- 在 `onUnmounted` 中销毁编辑器实例
- 使用 `ref` 管理编辑器实例

### 3.2 响应式绑定
- 监听编辑器状态变化
- 将 Vue 的响应式数据同步到编辑器
- 处理双向数据绑定

### 3.3 事件处理
- 监听编辑器的各种事件
- 将事件转换为 Vue 事件
- 处理用户交互

## 4. 主题系统

### 4.1 主题配置
```typescript
const theme = {
  text: {
    bold: 'font-weight-bold',
    italic: 'italic',
    underline: 'underline',
  },
  paragraph: 'mb-2',
  heading: {
    h1: 'text-2xl font-bold',
    h2: 'text-xl font-bold',
    h3: 'text-lg font-bold',
  },
};
```

### 4.2 CSS 类名映射
- 需要为每个节点类型定义 CSS 类名
- 支持动态主题切换
- 响应式样式支持

## 5. 插件系统

### 5.1 内置插件
- `@lexical/rich-text`: 富文本支持
- `@lexical/list`: 列表支持
- `@lexical/link`: 链接支持
- `@lexical/table`: 表格支持
- `@lexical/code`: 代码块支持

### 5.2 插件注册
```typescript
import { RichTextPlugin } from '@lexical/rich-text';
import { ListPlugin } from '@lexical/list';

editor.registerPlugin(new RichTextPlugin());
editor.registerPlugin(new ListPlugin());
```

## 6. 数据序列化

### 6.1 JSON 格式
```typescript
// 导出为 JSON
const json = JSON.stringify(editorState.toJSON());

// 从 JSON 导入
const editorState = editor.parseEditorState(json);
```

### 6.2 HTML 转换
```typescript
import { $generateHtmlFromNodes } from '@lexical/html';

editor.update(() => {
  const html = $generateHtmlFromNodes(editor);
});
```

### 6.3 Markdown 转换
```typescript
import { $convertFromMarkdownString } from '@lexical/markdown';

editor.update(() => {
  $convertFromMarkdownString(markdownString);
});
```

## 7. 性能优化

### 7.1 更新优化
- 使用 `editor.update()` 批量更新
- 避免频繁的状态更新
- 使用 `useEffect` 优化更新时机

### 7.2 渲染优化
- 虚拟滚动支持
- 懒加载大文档
- 避免不必要的重新渲染

## 8. 错误处理

### 8.1 错误边界
```typescript
const editor = createEditor({
  onError: (error) => {
    console.error('Editor error:', error);
    // 显示用户友好的错误信息
  },
});
```

### 8.2 状态恢复
- 保存编辑器状态快照
- 实现撤销/重做功能
- 处理异常状态恢复

## 9. 下一步计划

1. **创建基础 Vue 组件**: 实现最简单的编辑器组件
2. **实现数据绑定**: 连接 Vue 响应式系统与 Lexical
3. **添加工具栏**: 实现基本的格式化功能
4. **主题集成**: 实现主题系统
5. **插件集成**: 逐步添加各种插件
6. **性能优化**: 优化渲染和更新性能
