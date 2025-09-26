<script setup lang="ts">
import { ref } from 'vue'
import LexicalEditor from '../editor/LexicalEditor.vue'
import Toolbar from '../editor/Toolbar.vue'
import type { LexicalEditor as LexicalEditorType } from 'lexical'
import { useLexicalContext, provideLexicalContext } from '@/composables/useLexicalContext'

// 创建并提供 Lexical 上下文
const lexicalContext = useLexicalContext()
provideLexicalContext(lexicalContext)

// 从 context 获取状态和方法
const {
  editor,
  config,
  content,
  showDebug,
  isInitialized,
  error,
  setContent,
  setConfig,
  setShowDebug,
  setEditor,
  setError
} = lexicalContext

// 初始化配置
setConfig({
  namespace: 'DebuggerEditor',
  editable: true,
  autoFocus: false
})

setShowDebug(true) // 在 Debugger 中默认显示调试信息

// 事件处理
const handleChange = (...args: [value: string] | [id: number]) => {
  const value = args[0]
  if (typeof value === 'string') {
    setContent(value)
    console.log('LexicalEditor: 内容变化', value)
  }
}

const handleFocus = () => {
  console.log('LexicalEditor: 聚焦')
}

const handleBlur = () => {
  console.log('LexicalEditor: 失焦')
}

const handleError = (error: Error) => {
  console.log('LexicalEditor: 错误', error)
  setError(error)
}

const handleInit = (instance: LexicalEditorType) => {
  console.log('LexicalEditor: 初始化', instance)
  setEditor(instance)
}

</script>

<template>
  <div class="debugger-container">
    <!-- 工具栏 -->
    <!-- 
    <Toolbar 
      v-if="editor" 
      :editor="editor as any" 
      :active-editor="editor as any" 
    />
    -->

    <!-- 编辑器 -->
    <LexicalEditor 
      v-model="content" 
      :show-debug="showDebug"
      @init="handleInit" 
      @change="handleChange" 
      @focus="handleFocus"
      @blur="handleBlur" 
      @error="handleError" 
    />
    
    <!-- 调试信息面板 -->
    <div v-if="showDebug" class="debug-panel">
      <h4>调试面板</h4>
      <div class="debug-info">
        <p><strong>编辑器状态:</strong> {{ isInitialized ? '已初始化' : '未初始化' }}</p>
        <p><strong>内容长度:</strong> {{ content.length }}</p>
        <p><strong>命名空间:</strong> {{ config.namespace }}</p>
        <p><strong>可编辑:</strong> {{ config.editable ? '是' : '否' }}</p>
        <p v-if="error"><strong>错误:</strong> {{ error.message }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.debugger-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.debugger-container .toolbar {
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  padding: 8px 12px;
}

.debugger-container .lexical-editor {
  flex: 1;
  min-height: 0;
}

.debug-panel {
  border-top: 1px solid #e5e7eb;
  background: #f8f9fa;
  padding: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.debug-panel h4 {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 14px;
}

.debug-info {
  font-family: monospace;
  font-size: 12px;
}

.debug-info p {
  margin: 4px 0;
  color: #6b7280;
}

.debug-info strong {
  color: #374151;
}
</style>
