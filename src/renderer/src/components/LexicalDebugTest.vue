<template>
  <div class="lexical-debug-test">
    <h1>Lexical 工具栏调试测试</h1>
    
    <div class="debug-info">
      <h3>调试信息</h3>
      <p>编辑器实例: {{ editor ? '已获取' : '未获取' }}</p>
      <p>编辑器类型: {{ editor ? typeof editor : 'undefined' }}</p>
      <p>内容长度: {{ content.length }}</p>
      <p>最后操作: {{ lastAction }}</p>
    </div>

    <div class="test-buttons">
      <button @click="testBold" class="test-btn">测试粗体</button>
      <button @click="testItalic" class="test-btn">测试斜体</button>
      <button @click="testFocus" class="test-btn">聚焦编辑器</button>
      <button @click="getEditorInfo" class="test-btn">获取编辑器信息</button>
    </div>

    <div class="editor-wrapper">
      <h3>编辑器区域</h3>
      <LexicalEditorWithToolbar
        v-model="content"
        :show-toolbar="true"
        :show-debug="true"
        @change="handleChange"
        ref="editorRef"
      />
    </div>

    <div class="console-output">
      <h3>控制台输出</h3>
      <div class="console">
        <div v-for="(log, index) in logs" :key="index" class="log-entry">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LexicalEditorWithToolbar from './LexicalEditorWithToolbar.vue'

// 状态
const content = ref('选择这些文字并点击工具栏按钮来测试格式化功能。')
const lastAction = ref('无')
const editor = ref<any>(null)
const editorRef = ref()
const logs = ref<Array<{ time: string, message: string }>>([])

// 添加日志
const addLog = (message: string) => {
  const time = new Date().toLocaleTimeString()
  logs.value.unshift({ time, message })
  if (logs.value.length > 20) {
    logs.value = logs.value.slice(0, 20)
  }
}

// 获取编辑器实例
const getEditorInstance = () => {
  const globalEditor = (window as any).lexicalTest || (window as any).lexicalEditor
  addLog(`全局编辑器实例: ${globalEditor ? '存在' : '不存在'}`)
  return globalEditor
}

// 测试按钮
const testBold = () => {
  lastAction.value = '测试粗体'
  addLog('测试粗体命令')
  
  const editorInstance = getEditorInstance()
  if (editorInstance) {
    addLog('尝试执行粗体命令')
    try {
      // 直接调用编辑器的格式化命令
      editorInstance.dispatchCommand('FORMAT_TEXT_COMMAND', 'bold')
      addLog('粗体命令已执行')
    } catch (error) {
      addLog(`粗体命令执行失败: ${error}`)
    }
  } else {
    addLog('编辑器实例不可用')
  }
}

const testItalic = () => {
  lastAction.value = '测试斜体'
  addLog('测试斜体命令')
  
  const editorInstance = getEditorInstance()
  if (editorInstance) {
    try {
      editorInstance.dispatchCommand('FORMAT_TEXT_COMMAND', 'italic')
      addLog('斜体命令已执行')
    } catch (error) {
      addLog(`斜体命令执行失败: ${error}`)
    }
  } else {
    addLog('编辑器实例不可用')
  }
}

const testFocus = () => {
  lastAction.value = '聚焦编辑器'
  addLog('尝试聚焦编辑器')
  
  const editorInstance = getEditorInstance()
  if (editorInstance && editorInstance.focus) {
    try {
      editorInstance.focus()
      addLog('编辑器已聚焦')
    } catch (error) {
      addLog(`聚焦失败: ${error}`)
    }
  } else {
    addLog('编辑器实例不可用或没有focus方法')
  }
}

const getEditorInfo = () => {
  lastAction.value = '获取编辑器信息'
  
  const editorInstance = getEditorInstance()
  if (editorInstance) {
    addLog(`编辑器对象keys: ${Object.keys(editorInstance)}`)
    
    if (editorInstance.getEditor) {
      const realEditor = editorInstance.getEditor()
      addLog(`真实编辑器实例: ${realEditor ? '存在' : '不存在'}`)
      
      if (realEditor) {
        addLog(`编辑器状态: ${realEditor.isEditable() ? '可编辑' : '不可编辑'}`)
        try {
          const state = realEditor.getEditorState()
          addLog(`编辑器状态获取成功`)
        } catch (error) {
          addLog(`获取编辑器状态失败: ${error}`)
        }
      }
    }
  }
  
  editor.value = editorInstance
}

// 事件处理
const handleChange = (value: string) => {
  addLog(`内容变化: 长度 ${value.length}`)
}

// 组件挂载
onMounted(() => {
  addLog('调试组件已挂载')
  
  // 延迟获取编辑器实例
  setTimeout(() => {
    getEditorInfo()
  }, 1000)
})
</script>

<style scoped>
.lexical-debug-test {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: system-ui, sans-serif;
}

.debug-info {
  background-color: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.debug-info p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
}

.test-buttons {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.test-btn {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.test-btn:hover {
  background-color: #2563eb;
}

.editor-wrapper {
  margin-bottom: 2rem;
}

.console-output {
  background-color: #1f2937;
  color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
  max-height: 300px;
  overflow-y: auto;
}

.console {
  font-family: ui-monospace, monospace;
  font-size: 0.75rem;
}

.log-entry {
  display: flex;
  margin-bottom: 0.25rem;
  padding: 0.125rem 0;
}

.log-time {
  color: #9ca3af;
  margin-right: 0.5rem;
  min-width: 80px;
}

.log-message {
  color: #f9fafb;
}

h1, h3 {
  color: #1f2937;
  margin-bottom: 1rem;
}

h1 {
  font-size: 1.875rem;
  text-align: center;
}

h3 {
  font-size: 1.25rem;
  font-weight: 600;
}
</style>
