<template>
  <div class="lexical-toolbar-test">
    <h1>Lexical 工具栏功能测试</h1>
    
    <div class="test-controls">
      <button @click="toggleToolbar" class="btn">
        {{ showToolbar ? '隐藏工具栏' : '显示工具栏' }}
      </button>
      <button @click="toggleDebug" class="btn">
        {{ showDebug ? '隐藏调试' : '显示调试' }}
      </button>
      <button @click="clearContent" class="btn">清空内容</button>
      <button @click="setSampleContent" class="btn">设置示例内容</button>
    </div>

    <div class="editor-section">
      <h3>带工具栏的 Lexical 编辑器</h3>
      <div class="editor-wrapper">
        <LexicalEditorWithToolbar
          v-model="content"
          :config="editorConfig"
          :show-debug="showDebug"
          :show-toolbar="showToolbar"
          @change="handleChange"
          @focus="handleFocus"
          @blur="handleBlur"
          @error="handleError"
          ref="editorRef"
        />
      </div>
    </div>

    <div class="content-section">
      <h3>内容预览</h3>
      <div class="content-display">
        <h4>文本内容:</h4>
        <pre>{{ content || '(空内容)' }}</pre>
        
        <h4>字符统计:</h4>
        <p>字符数: {{ content.length }}</p>
        <p>行数: {{ content.split('\n').length }}</p>
      </div>
    </div>

    <div class="event-log-section">
      <h3>事件日志</h3>
      <div class="event-log">
        <div 
          v-for="(event, index) in eventLog" 
          :key="index"
          :class="['event-item', `event-${event.type}`]"
        >
          <span class="event-time">{{ event.time }}</span>
          <span class="event-type">{{ event.type }}</span>
          <span class="event-data">{{ event.data }}</span>
        </div>
      </div>
      <button @click="clearEventLog" class="btn btn-sm">清空日志</button>
    </div>

    <div class="instructions-section">
      <h3>使用说明</h3>
      <div class="instructions">
        <h4>工具栏功能:</h4>
        <ul>
          <li><strong>⚠️ 重要:</strong> 大部分格式化功能需要先选择文本才能生效</li>
          <li><strong>格式化:</strong> 选择文本后点击粗体、斜体、下划线等按钮</li>
          <li><strong>标题:</strong> 将光标放在段落中，然后使用下拉菜单选择标题级别</li>
          <li><strong>列表:</strong> 将光标放在段落中，点击无序列表或有序列表按钮</li>
          <li><strong>链接:</strong> 选择文本后点击链接按钮，输入 URL</li>
          <li><strong>清除格式:</strong> 选择已格式化的文本后点击清除格式按钮</li>
          <li><strong>撤销/重做:</strong> 使用撤销和重做按钮（适用于所有操作）</li>
        </ul>
        
        <h4>快捷键:</h4>
        <ul>
          <li><kbd>Ctrl+B</kbd>: 粗体</li>
          <li><kbd>Ctrl+I</kbd>: 斜体</li>
          <li><kbd>Ctrl+U</kbd>: 下划线</li>
          <li><kbd>Ctrl+K</kbd>: 插入链接</li>
          <li><kbd>Ctrl+Z</kbd>: 撤销</li>
          <li><kbd>Ctrl+Y</kbd> 或 <kbd>Ctrl+Shift+Z</kbd>: 重做</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LexicalEditorWithToolbar from './LexicalEditorWithToolbar.vue'
import type { LexicalEditorConfig } from '@/types/lexical'

// 响应式状态
const content = ref('')
const showToolbar = ref(true)
const showDebug = ref(false)
const editorRef = ref()
const eventLog = ref<Array<{
  time: string
  type: string
  data: string
}>>([])

// 编辑器配置
const editorConfig: LexicalEditorConfig = {
  namespace: 'ToolbarTestEditor',
  editable: true,
  placeholder: '开始使用工具栏编辑内容...',
  autoFocus: false
}

// 事件处理
const handleChange = (value: string) => {
  addEventLog('change', `内容长度: ${value.length}`)
}

const handleFocus = () => {
  addEventLog('focus', '编辑器获得焦点')
}

const handleBlur = () => {
  addEventLog('blur', '编辑器失去焦点')
}

const handleError = (error: Error) => {
  addEventLog('error', error.message)
}

// 添加事件日志
const addEventLog = (type: string, data: string) => {
  const now = new Date()
  const time = now.toLocaleTimeString()
  eventLog.value.unshift({ time, type, data })
  
  // 限制日志数量
  if (eventLog.value.length > 50) {
    eventLog.value = eventLog.value.slice(0, 50)
  }
}

// 控制操作
const toggleToolbar = () => {
  showToolbar.value = !showToolbar.value
  addEventLog('control', `工具栏${showToolbar.value ? '显示' : '隐藏'}`)
}

const toggleDebug = () => {
  showDebug.value = !showDebug.value
  addEventLog('control', `调试模式${showDebug.value ? '开启' : '关闭'}`)
}

const clearContent = () => {
  content.value = ''
  addEventLog('control', '清空内容')
}

const setSampleContent = () => {
  content.value = `选择这些文字来测试格式化功能：

这是普通文本，可以选择它来测试粗体、斜体等格式。

这是另一段文本，用来测试下划线和删除线。

这段文字可以用来测试行内代码格式。

可以选择这一行来测试标题格式转换。

请尝试：
1. 选择任意文字
2. 点击工具栏按钮
3. 观察格式变化`
  
  addEventLog('control', '设置示例内容')
}

const clearEventLog = () => {
  eventLog.value = []
}

// 组件挂载
onMounted(() => {
  addEventLog('system', '工具栏测试组件已加载')
  
  // 自动设置示例内容
  setTimeout(() => {
    setSampleContent()
  }, 500)
})
</script>

<style scoped>
.lexical-toolbar-test {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.lexical-toolbar-test h1 {
  color: #1f2937;
  margin-bottom: 2rem;
  text-align: center;
}

.test-controls {
  display: flex;
  gap: 0.75rem;
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

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
}

.editor-section,
.content-section,
.event-log-section,
.instructions-section {
  margin-bottom: 2rem;
}

.editor-section h3,
.content-section h3,
.event-log-section h3,
.instructions-section h3 {
  color: #1f2937;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.editor-wrapper {
  margin-bottom: 1rem;
}

.content-display {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
}

.content-display h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.content-display pre {
  background-color: #f3f4f6;
  padding: 0.75rem;
  border-radius: 0.375rem;
  overflow-x: auto;
  white-space: pre-wrap;
  font-size: 0.875rem;
  margin: 0.5rem 0;
}

.content-display p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.event-log {
  background-color: #1f2937;
  color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
  max-height: 300px;
  overflow-y: auto;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, monospace;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
}

.event-item {
  display: flex;
  margin-bottom: 0.25rem;
  padding: 0.25rem;
  border-radius: 0.25rem;
}

.event-item.event-error {
  background-color: rgba(239, 68, 68, 0.2);
}

.event-item.event-change {
  background-color: rgba(34, 197, 94, 0.2);
}

.event-item.event-control {
  background-color: rgba(59, 130, 246, 0.2);
}

.event-time {
  color: #9ca3af;
  margin-right: 0.5rem;
  min-width: 80px;
}

.event-type {
  color: #fbbf24;
  margin-right: 0.5rem;
  min-width: 60px;
  font-weight: 600;
}

.event-data {
  color: #f9fafb;
}

.instructions {
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.instructions h4 {
  color: #0c4a6e;
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.instructions ul {
  margin: 0 0 1.5rem 0;
  padding-left: 1.5rem;
}

.instructions li {
  margin-bottom: 0.5rem;
  color: #0c4a6e;
}

.instructions kbd {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, monospace;
}

.instructions strong {
  color: #1e40af;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .lexical-toolbar-test {
    padding: 1rem;
  }
  
  .test-controls {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
