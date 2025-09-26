<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import LexicalEditor from '../editor/LexicalEditor.vue'
import Toolbar from '../editor/Toolbar.vue'
import type { LexicalEditor as LexicalEditorType } from 'lexical'
import type { LexicalEditorConfig } from '@/types/lexical'

// 响应式状态
const content = ref("")
const editorRef = ref<InstanceType<typeof LexicalEditor>>()
const editor = shallowRef<LexicalEditorType | null>(null)
const config = ref<LexicalEditorConfig>({
  namespace: 'DebuggerEditor',
  editable: true,
  autoFocus: false
})

const showDebug = ref(false)


// 事件处理
const handleChange = (...args: [value: string] | [id: number]) => {
  const value = args[0]
  if (typeof value === 'string') {
    content.value = value
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
}

const handleInit = (instance: LexicalEditorType) => {
  console.log('LexicalEditor: 初始化', instance)

  editor.value = instance
}

</script>

<template>
  <div class="debugger-container">
    <!-- 工具栏 -->
    <!-- <Toolbar 
      v-if="editor" 
      :editor="editor as any" 
      :active-editor="editor as any" 
    /> -->
    
    <!-- 编辑器 -->
    <LexicalEditor 
      v-model="content" 
      :config="config" 
      :show-debug="showDebug"
      @init="handleInit" 
      @change="handleChange" 
      @focus="handleFocus"
      @blur="handleBlur" 
      @error="handleError" 
      ref="editorRef" 
    />
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
</style>
