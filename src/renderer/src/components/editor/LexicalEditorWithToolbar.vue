<template>
  <div class="lexical-editor-with-toolbar">
    <!-- 工具栏 -->
    <LexicalToolbar 
      v-if="showToolbar" 
      :editor="editor" 
    />
    
    <!-- 编辑器 -->
    <LexicalEditor
      v-model="content"
      :config="config"
      :show-debug="showDebug"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @error="handleError"
      ref="editorRef"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import LexicalEditor from './LexicalEditor/LexicalEditor.vue'
import LexicalToolbar from './LexicalToolbar.vue'
import type { LexicalEditorConfig } from '@/types/lexical'

interface Props {
  modelValue?: string
  config?: LexicalEditorConfig
  showDebug?: boolean
  showToolbar?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  config: () => ({ namespace: 'DefaultEditor' }),
  showDebug: false,
  showToolbar: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
  'focus': []
  'blur': []
  'error': [error: Error]
}>()

// 响应式状态
const content = ref(props.modelValue)
const editorRef = ref<InstanceType<typeof LexicalEditor>>()
const editor = ref<any>(null)

// 事件处理
const handleChange = (value: string) => {
  content.value = value
  emit('update:modelValue', value)
  emit('change', value)
}

const handleFocus = () => {
  emit('focus')
}

const handleBlur = () => {
  emit('blur')
}

const handleError = (error: Error) => {
  emit('error', error)
}

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue) => {
  if (newValue !== content.value) {
    content.value = newValue
  }
})

// 获取编辑器实例
// const getEditorInstance = () => {
//   // 从全局对象获取编辑器实例
//   const globalEditor = (window as any).lexicalTest || (window as any).lexicalEditor
//   console.log('Getting editor instance:', globalEditor)
//   return globalEditor
// }

// 编辑器实例变化监听
// const updateEditorInstance = () => {
//   const newEditor = getEditorInstance()
//   if (newEditor && newEditor !== editor.value) {
//     editor.value = newEditor
//     console.log('LexicalEditorWithToolbar: 编辑器实例已更新', editor.value)
//   }
// }

// 组件挂载后获取编辑器实例
onMounted(() => {
  // 延迟获取编辑器实例，确保子组件已经初始化
  setTimeout(() => {
    if (editorRef.value?.editor) {
      editor.value = editorRef.value.editor
      console.log('LexicalEditorWithToolbar: 编辑器实例已从子组件获取', editor.value)
    }
  }, 300)
})

// 暴露方法给父组件
defineExpose({
  focus: () => editorRef.value?.focus(),
  updateContent: (newContent: string) => editorRef.value?.updateContent(newContent),
  getState: () => editorRef.value?.getState(),
  getEditor: () => editor.value
})
</script>

<style scoped>
.lexical-editor-with-toolbar {
  width: 100%;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: white;
}

.lexical-editor-with-toolbar :deep(.lexical-editor) {
  border: none;
  border-radius: 0;
}

.lexical-editor-with-toolbar :deep(.editor-container) {
  border: none;
  border-radius: 0 0 0.5rem 0.5rem;
}

.lexical-editor-with-toolbar :deep(.editor-container):focus {
  box-shadow: none;
}

/* 确保工具栏和编辑器无缝连接 */
.lexical-editor-with-toolbar :deep(.lexical-toolbar) {
  border-radius: 0.5rem 0.5rem 0 0;
}
</style>
