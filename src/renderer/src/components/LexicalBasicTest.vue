<template>
  <div class="lexical-basic-test">
    <h2>Lexical 基础功能测试</h2>
    
    <div class="test-controls">
      <button @click="initEditor" class="btn">初始化编辑器</button>
      <button @click="testUpdate" class="btn">测试更新</button>
      <button @click="getState" class="btn">获取状态</button>
      <button @click="clearContent" class="btn">清空内容</button>
    </div>

    <div class="editor-section">
      <h3>编辑器</h3>
      <div 
        ref="editorRef"
        class="editor-container"
        contenteditable="true"
      ></div>
    </div>

    <div class="state-section">
      <h3>编辑器状态</h3>
      <pre class="state-display">{{ editorState }}</pre>
    </div>

    <div class="log-section">
      <h3>控制台日志</h3>
      <div class="log-display">
        <div v-for="(log, index) in logs" :key="index" class="log-item">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import '@/utils/lexicalSimpleTest'

const editorRef = ref<HTMLElement>()
const editorState = ref('')
const logs = ref<string[]>([])

// 添加日志
const addLog = (message: string) => {
  logs.value.push(`${new Date().toLocaleTimeString()}: ${message}`)
  console.log(message)
}

// 初始化编辑器
const initEditor = () => {
  if (editorRef.value) {
    (window as any).lexicalTest.setRootElement(editorRef.value)
    addLog('编辑器已初始化')
  } else {
    addLog('编辑器元素未找到')
  }
}

// 测试更新
const testUpdate = () => {
  (window as any).lexicalTest.updateContent('这是测试内容 - ' + new Date().toLocaleTimeString())
  addLog('内容已更新')
}

// 获取状态
const getState = () => {
  const state = (window as any).lexicalTest.getState()
  editorState.value = JSON.stringify(state, null, 2)
  addLog('已获取编辑器状态')
}

// 清空内容
const clearContent = () => {
  (window as any).lexicalTest.updateContent('')
  addLog('内容已清空')
}

// 监听编辑器更新
const updateListener = ({ editorState: newState }: any) => {
  editorState.value = JSON.stringify(newState.toJSON(), null, 2)
  addLog('编辑器状态已更新')
}

onMounted(() => {
  addLog('组件已挂载')
  
  // 自动初始化编辑器
  setTimeout(() => {
    initEditor()
  }, 100)
})

onUnmounted(() => {
  addLog('组件已卸载')
})
</script>

<style scoped>
.lexical-basic-test {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.test-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.btn:hover {
  background-color: #2563eb;
}

.editor-section,
.state-section,
.log-section {
  margin-bottom: 2rem;
}

.editor-section h3,
.state-section h3,
.log-section h3 {
  margin-bottom: 1rem;
  color: #374151;
  font-size: 1.125rem;
  font-weight: 600;
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

.state-display {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 1rem;
  font-size: 0.75rem;
  color: #374151;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
}

.log-display {
  background-color: #1f2937;
  border: 1px solid #374151;
  border-radius: 0.375rem;
  padding: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.log-item {
  color: #d1d5db;
  font-size: 0.75rem;
  font-family: monospace;
  margin-bottom: 0.25rem;
  padding: 0.25rem 0;
  border-bottom: 1px solid #374151;
}

.log-item:last-child {
  border-bottom: none;
}
</style>
