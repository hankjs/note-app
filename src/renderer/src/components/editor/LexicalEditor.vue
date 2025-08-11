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
import { useLexicalEditor } from '@/composables/useLexicalEditor'
import { editorStateToText } from '@/utils/lexicalUtils'
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

const editorRef = ref<HTMLElement>()
const content = ref(props.modelValue)
const editorState = ref<any>(null)

const { 
  editor,
  setRootElement,
  updateContent: updateEditorContent,
  focus: focusEditor,
  onUpdate,
  onError 
} = useLexicalEditor(props.config)

// 初始化编辑器
const initEditor = () => {
  if (editorRef.value) {
    console.log('LexicalEditor: 开始初始化编辑器')
    
    // 设置根元素 - useLexicalEditor 会处理编辑器的创建
    setRootElement(editorRef.value)
    
    console.log('LexicalEditor: 编辑器初始化完成')
  } else {
    console.error('LexicalEditor: 编辑器元素未找到')
  }
}

// 更新内容
const updateContent = (newContent: string) => {
  updateEditorContent(newContent)
  content.value = newContent
  emit('update:modelValue', newContent)
  emit('change', newContent)
}

// 获取状态
const getState = () => {
  const state = editor.value?.getEditorState()?.toJSON()
  editorState.value = state
  return state
}

// 聚焦编辑器
const focus = () => {
  focusEditor()
  emit('focus')
}

// 监听 modelValue 变化，同步到编辑器
watch(() => props.modelValue, (newValue) => {
  if (newValue !== content.value) {
    updateContent(newValue)
  }
})

  // 组件挂载后初始化编辑器
  onMounted(() => {
    console.log('LexicalEditor: 组件已挂载')
    
    // 自动初始化编辑器
    setTimeout(() => {
      initEditor()
      
      // 将编辑器实例绑定到 DOM 元素上，方便测试访问
      if (editor.value && editorRef.value) {
        (editorRef.value as any).lexicalEditor = editor.value;
        console.log('LexicalEditor: 编辑器实例已绑定到 DOM 元素')
      }
    }, 100)
    
    // 监听更新
    onUpdate((state) => {
      console.log('Editor updated:', state.toJSON())
      // 使用工具函数提取文本内容，而不是 JSON 字符串
      try {
        const textContent = editorStateToText(state)
        content.value = textContent
        console.log('LexicalEditor: 内容已更新:', textContent)
      } catch (error) {
        console.error('LexicalEditor: 提取文本内容失败:', error)
      }
    })
    
    // 监听错误
    onError((error) => {
      emit('error', error)
    })
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
  setRootElement: initEditor,
  editor
})
</script>

<style scoped>
/* 编辑器样式现在由 lexical-editor.css 提供 */
/* 这里只保留组件特定的样式 */
</style>
