<template>
  <div class="simple-test">
    <h2>简单 Lexical 编辑器测试</h2>
    
    <div class="test-info">
      <p>编辑器状态: {{ editorReady ? '已准备' : '未准备' }}</p>
      <p>内容: {{ content || '空' }}</p>
    </div>

    <div class="editor-wrapper">
      <div 
        ref="editorRef"
        class="editor-container"
        contenteditable="true"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      >
        点击这里开始编辑...
      </div>
    </div>

    <div class="controls">
      <button @click="clearContent">清空</button>
      <button @click="setContent">设置内容</button>
      <button @click="focusEditor">聚焦</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const editorRef = ref<HTMLElement>()
const content = ref('')
const editorReady = ref(false)

const handleInput = (event: Event) => {
  const target = event.target as HTMLElement
  content.value = target.innerHTML
  console.log('输入内容:', content.value)
}

const handleFocus = () => {
  console.log('编辑器聚焦')
}

const handleBlur = () => {
  console.log('编辑器失焦')
}

const clearContent = () => {
  if (editorRef.value) {
    editorRef.value.innerHTML = ''
    content.value = ''
  }
}

const setContent = () => {
  if (editorRef.value) {
    editorRef.value.innerHTML = '<p>这是测试内容</p><p>支持 <strong>粗体</strong> 和 <em>斜体</em></p>'
    content.value = editorRef.value.innerHTML
  }
}

const focusEditor = () => {
  editorRef.value?.focus()
}

onMounted(() => {
  editorReady.value = true
  console.log('编辑器组件已挂载')
})
</script>

<style scoped>
.simple-test {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.test-info {
  background-color: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.test-info p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
}

.editor-wrapper {
  margin-bottom: 1rem;
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

.controls {
  display: flex;
  gap: 0.5rem;
}

.controls button {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.controls button:hover {
  background-color: #2563eb;
}
</style>
