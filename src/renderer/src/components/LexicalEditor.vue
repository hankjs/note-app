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
/* 编辑器样式现在由 lexical-editor.css 提供 */
/* 这里只保留组件特定的样式 */
</style>
