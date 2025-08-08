<template>
  <div class="lexical-editor-test">
    <h2>LexicalEditor 组件测试</h2>
    
    <div class="test-controls">
      <button @click="setContent" class="btn">设置内容</button>
      <button @click="getContent" class="btn">获取内容</button>
      <button @click="focusEditor" class="btn">聚焦编辑器</button>
      <button @click="clearContent" class="btn">清空内容</button>
    </div>

    <div class="editor-section">
      <h3>LexicalEditor 组件</h3>
      <LexicalEditor 
        ref="editorRef"
        v-model="content"
        :show-debug="true"
        @change="onContentChange"
        @focus="onFocus"
      />
    </div>

    <div class="content-section">
      <h3>内容状态</h3>
      <pre class="content-display">{{ content }}</pre>
    </div>

    <div class="log-section">
      <h3>事件日志</h3>
      <div class="log-display">
        <div v-for="(log, index) in logs" :key="index" class="log-item">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LexicalEditor from './LexicalEditor.vue'

const editorRef = ref<InstanceType<typeof LexicalEditor>>()
const content = ref('这是 LexicalEditor 组件的初始内容')
const logs = ref<string[]>([])

// 添加日志
const addLog = (message: string) => {
  logs.value.push(`${new Date().toLocaleTimeString()}: ${message}`)
  console.log(message)
}

// 设置内容
const setContent = () => {
  content.value = '这是通过按钮设置的新内容 - ' + new Date().toLocaleTimeString()
  addLog('内容已设置')
}

// 获取内容
const getContent = () => {
  addLog(`当前内容: ${content.value}`)
}

// 聚焦编辑器
const focusEditor = () => {
  editorRef.value?.focus()
  addLog('编辑器已聚焦')
}

// 清空内容
const clearContent = () => {
  content.value = ''
  addLog('内容已清空')
}

// 内容变化事件
const onContentChange = (newContent: string) => {
  addLog(`内容变化: ${newContent}`)
}

// 聚焦事件
const onFocus = () => {
  addLog('编辑器获得焦点')
}
</script>

<style scoped>
.lexical-editor-test {
  width: 100%;
  height: 100vh;
  padding: 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.test-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  flex-shrink: 0;
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

.editor-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin-bottom: 1rem;
}

.content-section,
.log-section {
  flex-shrink: 0;
  max-height: 200px;
  margin-bottom: 1rem;
}

.editor-section h3,
.content-section h3,
.log-section h3 {
  margin-bottom: 1rem;
  color: #374151;
  font-size: 1.125rem;
  font-weight: 600;
}

.content-display {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.5rem;
  font-size: 0.75rem;
  color: #374151;
  height: 150px;
  overflow-y: auto;
  white-space: pre-wrap;
}

.log-display {
  background-color: #1f2937;
  border: 1px solid #374151;
  border-radius: 0.375rem;
  padding: 0.5rem;
  height: 150px;
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
