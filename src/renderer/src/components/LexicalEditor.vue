<template>
  <div class="lexical-editor">
    <!-- 编辑器容器 -->
    <div 
      ref="editorRef"
      class="editor-container"
      :class="{ 'is-editable': isEditable }"
    ></div>
    
    <!-- 调试信息（开发环境） -->
    <div v-if="showDebug" class="debug-info">
      <h4>调试信息</h4>
      <p>内容长度: {{ content.length }}</p>
      <p>可编辑: {{ isEditable }}</p>
      <p>编辑器状态: {{ editorState ? '已初始化' : '未初始化' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useLexicalEditor } from '@/composables/useLexicalEditor'
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

// 使用 Lexical 编辑器 composable
const {
  isEditable,
  content,
  editorState,
  updateContent,
  setEditorState,
  setRootElement,
  focus,
  blur,
  destroy,
  onUpdate,
  onError
} = useLexicalEditor({
  ...props.config,
  editable: props.config.editable ?? true
})

// 监听内容变化，同步到父组件
watch(content, (newContent) => {
  emit('update:modelValue', newContent)
  emit('change', newContent)
})

// 监听 modelValue 变化，同步到编辑器
watch(() => props.modelValue, (newValue) => {
  if (newValue !== content.value) {
    updateContent(newValue)
  }
}, { immediate: true })

// 监听编辑器更新
onUpdate((editorState) => {
  // 编辑器状态更新时的处理
  console.log('Editor updated:', editorState)
})

// 监听编辑器错误
onError((error) => {
  emit('error', error)
})

// 组件挂载后初始化编辑器
onMounted(async () => {
  await nextTick()
  
  // 等待编辑器创建完成
  setTimeout(() => {
    if (editorRef.value) {
      // 将编辑器挂载到 DOM 元素
      setRootElement(editorRef.value)
      
      // 如果有初始内容，设置到编辑器
      if (props.modelValue) {
        updateContent(props.modelValue)
      }
    }
  }, 200)
})

// 组件卸载时清理
onUnmounted(() => {
  destroy()
})

// 暴露方法给父组件
defineExpose({
  focus,
  blur,
  updateContent,
  setEditorState,
  setRootElement,
  destroy
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
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 1rem;
  background-color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  overflow-y: auto;
}

.editor-container:focus-within {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.editor-container.is-editable {
  cursor: text;
}

.editor-container:not(.is-editable) {
  cursor: default;
  background-color: #f9fafb;
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
