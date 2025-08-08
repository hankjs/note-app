<template>
  <div class="lexical-test">
    <h1>Lexical 编辑器测试</h1>
    
    <div class="test-controls">
      <button @click="toggleEditable" class="btn">
        {{ isEditable ? '禁用编辑' : '启用编辑' }}
      </button>
      <button @click="clearContent" class="btn">清空内容</button>
      <button @click="setSampleContent" class="btn">设置示例内容</button>
      <button @click="showDebug = !showDebug" class="btn">
        {{ showDebug ? '隐藏调试' : '显示调试' }}
      </button>
    </div>

    <div class="editor-section">
      <h3>编辑器</h3>
      <div class="editor-status">
        <p>编辑器状态: {{ editorRef ? '已挂载' : '未挂载' }}</p>
        <p>内容长度: {{ content.length }}</p>
      </div>
      <LexicalEditor
        v-model="content"
        :config="editorConfig"
        :show-debug="showDebug"
        @change="handleChange"
        @error="handleError"
        ref="editorRef"
      />
    </div>

    <div class="content-section">
      <h3>内容预览</h3>
      <div class="content-display">
        <h4>HTML 内容:</h4>
        <pre>{{ content }}</pre>
      </div>
    </div>

    <div class="status-section">
      <h3>状态信息</h3>
      <p>内容长度: {{ content.length }}</p>
      <p>可编辑: {{ isEditable }}</p>
      <p>最后更新: {{ lastUpdate }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LexicalEditor from './LexicalEditor.vue'
import type { LexicalEditorConfig } from '@/types/lexical'

// 响应式状态
const content = ref('')
const isEditable = ref(true)
const showDebug = ref(false)
const lastUpdate = ref('')
const editorRef = ref()

// 编辑器配置
const editorConfig: LexicalEditorConfig = {
  namespace: 'TestEditor',
  editable: true,
  placeholder: '开始输入内容...',
  autoFocus: false
}

// 切换可编辑状态
const toggleEditable = () => {
  isEditable.value = !isEditable.value
  editorConfig.editable = isEditable.value
}

// 清空内容
const clearContent = () => {
  content.value = ''
  lastUpdate.value = new Date().toLocaleTimeString()
}

// 设置示例内容
const setSampleContent = () => {
  content.value = `# 欢迎使用 Lexical 编辑器

这是一个**富文本编辑器**的测试页面。

## 功能特性

- 支持 *斜体* 和 **粗体** 文本
- 支持 [链接](https://lexical.dev)
- 支持代码块：

\`\`\`javascript
console.log('Hello, Lexical!');
\`\`\`

## 列表支持

1. 有序列表项 1
2. 有序列表项 2
3. 有序列表项 3

- 无序列表项 1
- 无序列表项 2
- 无序列表项 3

> 这是一个引用块，用于突出显示重要信息。

继续编辑以测试更多功能...`
  lastUpdate.value = new Date().toLocaleTimeString()
}

// 处理内容变化
const handleChange = (newContent: string) => {
  console.log('Content changed:', newContent)
  lastUpdate.value = new Date().toLocaleTimeString()
}

// 处理错误
const handleError = (error: Error) => {
  console.error('Editor error:', error)
  alert(`编辑器错误: ${error.message}`)
}
</script>

<style scoped>
.lexical-test {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.lexical-test h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #1f2937;
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
.content-section,
.status-section {
  margin-bottom: 2rem;
}

.editor-status {
  background-color: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 0.375rem;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.editor-status p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: #0369a1;
}

.editor-section h3,
.content-section h3,
.status-section h3 {
  margin-bottom: 1rem;
  color: #374151;
  font-size: 1.125rem;
  font-weight: 600;
}

.content-display {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 1rem;
}

.content-display h4 {
  margin: 0 0 0.5rem 0;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 600;
}

.content-display pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 0.75rem;
  color: #374151;
  max-height: 200px;
  overflow-y: auto;
}

.status-section p {
  margin: 0.25rem 0;
  color: #6b7280;
  font-size: 0.875rem;
}
</style>
