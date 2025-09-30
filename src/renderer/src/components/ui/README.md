# FlashMessage Context API

基于 React FlashMessageContext 的 Vue 3 实现，提供全局的 FlashMessage 管理功能。

## 功能特点

- ✅ **Context API**: 类似 React Context 的提供者/消费者模式
- ✅ **自动超时**: 消息自动隐藏，默认 1 秒
- ✅ **类型安全**: 完整的 TypeScript 支持
- ✅ **错误处理**: 未提供 Context 时抛出错误
- ✅ **动画效果**: 平滑的淡入动画
- ✅ **无障碍支持**: 支持 `role="dialog"` 和 `role="alert"`

## 使用方法

### 1. 在应用根组件中提供 Context

```vue
<template>
  <div id="app">
    <FlashMessageProvider>
      <!-- 你的应用内容 -->
      <YourApp />
    </FlashMessageProvider>
  </div>
</template>

<script setup>
import FlashMessageProvider from '@/components/ui/FlashMessageProvider.vue'
</script>
```

### 2. 在子组件中使用 FlashMessage

```vue
<template>
  <div>
    <button @click="showMessage">显示消息</button>
  </div>
</template>

<script setup>
import { useFlashMessageContext } from '@/composables/useFlashMessage'

const { showFlashMessage, hideFlashMessage } = useFlashMessageContext()

function showMessage() {
  showFlashMessage('这是一条消息！', 3000)
}

function hideMessage() {
  hideFlashMessage()
}
</script>
```

## API 参考

### `useFlashMessageContext()`

返回 FlashMessage Context 的方法和状态。

**返回值:**
- `flashMessage: Ref<string | null>` - 当前显示的消息
- `showFlashMessage: ShowFlashMessage` - 显示消息的函数
- `hideFlashMessage: () => void` - 隐藏消息的函数

### `ShowFlashMessage` 类型

```typescript
type ShowFlashMessage = (
  message?: string,
  duration?: number,
) => void
```

**参数:**
- `message?: string` - 要显示的消息内容
- `duration?: number` - 显示持续时间（毫秒），默认 1000ms

**示例:**
```typescript
// 显示消息 3 秒
showFlashMessage('操作成功！', 3000)

// 显示消息使用默认时间（1秒）
showFlashMessage('消息')

// 隐藏消息
showFlashMessage()
```

## 组件说明

### FlashMessageProvider.vue

Context 提供者组件，负责：
- 提供 FlashMessage Context
- 渲染子组件
- 自动显示 FlashMessage

### FlashMessage.vue

消息显示组件，负责：
- 使用 Teleport 渲染到 body
- 提供动画效果
- 支持插槽内容

## 与 React 版本的对比

| 功能 | React | Vue 3 |
|------|-------|-------|
| Context 提供者 | `FlashMessageContext` | `FlashMessageProvider` |
| Context 消费者 | `useFlashMessageContext` | `useFlashMessageContext` |
| 消息渲染 | `createPortal` | `<Teleport>` |
| 状态管理 | `useState` | `ref` |
| 副作用 | `useEffect` | `onMounted/onUnmounted` |
| 类型安全 | TypeScript | TypeScript |

## 错误处理

如果组件没有包装在 `FlashMessageProvider` 中，`useFlashMessageContext` 会抛出错误：

```
Error: Missing FlashMessageContext. Please wrap your component with FlashMessageProvider.
```

## 样式自定义

可以通过 CSS 变量自定义样式：

```css
.FlashMessage__alert {
  --bg-color: rgba(0, 0, 0, 0.8);
  --text-color: white;
  --font-size: 1.5rem;
  --border-radius: 1em;
  --padding: 0.5em 1.5em;
}
```
