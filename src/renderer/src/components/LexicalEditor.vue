<template>
  <div class="lexical-editor">
    <!-- 编辑器容器 -->
    <div 
      ref="editorRef"
      class="editor-container"
      contenteditable="true"
    ></div>
    
    <!-- 调试信息（开发环境） -->
    <div v-if="showDebug" class="debug-info">
      <h4>调试信息</h4>
      <p>内容长度: {{ content.length }}</p>
      <p>编辑器状态: {{ editorState ? '已初始化' : '未初始化' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import '@/utils/lexicalSimpleTest'
import type { LexicalEditorConfig } from '@/types/lexical'

interface Props {
  modelValue?: string
  config?: LexicalEditorConfig
  showDebug?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  config: () => ({ namespace: 'DefaultEditor' }),
  showDebug: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
  'focus': []
  'blur': []
  'error': [error: Error]
}>()

// 编辑器容器引用
const editorRef = ref<HTMLElement>()
const content = ref(props.modelValue)
const editorState = ref<any>(null)

// 初始化编辑器
const initEditor = () => {
  if (editorRef.value) {
    (window as any).lexicalTest.setRootElement(editorRef.value)
    console.log('LexicalEditor: 编辑器已初始化')
    
    // 如果有初始内容，设置到编辑器
    if (props.modelValue) {
      updateContent(props.modelValue)
    }
  } else {
    console.error('LexicalEditor: 编辑器元素未找到')
  }
}

// 更新内容
const updateContent = (newContent: string) => {
  (window as any).lexicalTest.updateContent(newContent)
  content.value = newContent
  emit('update:modelValue', newContent)
  emit('change', newContent)
}

// 获取状态
const getState = () => {
  const state = (window as any).lexicalTest.getState()
  editorState.value = state
  return state
}

// 聚焦编辑器
const focus = () => {
  (window as any).lexicalTest.focus()
  emit('focus')
}

// 监听 modelValue 变化，同步到编辑器
watch(() => props.modelValue, (newValue) => {
  if (newValue !== content.value) {
    updateContent(newValue)
  }
}, { immediate: true })

// 组件挂载后初始化编辑器
onMounted(() => {
  console.log('LexicalEditor: 组件已挂载')
  
  // 自动初始化编辑器
  setTimeout(() => {
    initEditor()
  }, 100)
})

// 组件卸载时清理
onUnmounted(() => {
  console.log('LexicalEditor: 组件已卸载')
})

// 暴露方法给父组件
defineExpose({
  focus,
  updateContent,
  getState,
  setRootElement: initEditor
})
</script>

<style scoped>
.lexical-editor {
  width: 100%;
  min-height: 200px;
}

.editor-container {
  width: 100%;
  min-height: 200px;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  background-color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  outline: none;
  transition: border-color 0.2s;
}

.editor-container:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 编辑器内容样式 */
.editor-container :deep(p) {
  margin-bottom: 0.75rem;
}

.editor-container :deep(h1) {
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 1rem;
  margin-top: 1.5rem;
}

.editor-container :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  margin-top: 1.25rem;
}

.editor-container :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  margin-top: 1rem;
}

.editor-container :deep(ul),
.editor-container :deep(ol) {
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
}

.editor-container :deep(li) {
  margin-bottom: 0.25rem;
}

.editor-container :deep(blockquote) {
  border-left: 4px solid #e5e7eb;
  padding-left: 1rem;
  margin-left: 0;
  margin-right: 0;
  font-style: italic;
  color: #6b7280;
}

.editor-container :deep(code) {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
}

.editor-container :deep(pre) {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 0.75rem;
}

.editor-container :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

.editor-container :deep(a) {
  color: #3b82f6;
  text-decoration: underline;
}

.editor-container :deep(a:hover) {
  color: #2563eb;
}

/* 调试信息样式 */
.debug-info {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.debug-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 600;
}

.debug-info p {
  margin: 0.25rem 0;
}
</style>
