<script setup lang="ts">
import { ref } from 'vue'
import LexicalComposer from '../editor/LexicalEditor/LexicalComposer.vue'
import LexicalEditor from '../editor/LexicalEditor/LexicalEditor.vue'
import type { LexicalEditor as LexicalEditorType } from 'lexical'
import LexicalToolbar from '../editor/LexicalToolbar.vue'

const str = localStorage.getItem('editor-content')
const content = ref(str ? str : `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":" Try typing in ","type":"text","version":1},{"detail":0,"format":1,"mode":"normal","style":"","text":"some smiles. ","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":"For example: ","type":"text","version":1},{"detail":0,"format":16,"mode":"normal","style":"","text":":)","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":", ","type":"text","version":1},{"detail":0,"format":16,"mode":"normal","style":"","text":":smiley:","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":".","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":null,"format":"","indent":0,"type":"root","version":1}}`)

const editorRef = ref<InstanceType<typeof LexicalEditor>>()

const handleSave = () => {
  const context = editorRef.value?.getContext()
  if (!context) {
    return
  }
  const json = context.editorState.value.toJSON()
  localStorage.setItem('editor-content', JSON.stringify(json))

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
}

</script>

<template>
  <LexicalComposer 
    :initialConfig="{
      namespace: 'DebuggerEditor',
      editable: true,
      autoFocus: false
    }"
  >
    <LexicalToolbar />
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
        ref="editorRef"
        :initial-content="content"
        @init="handleInit" 
        @focus="handleFocus"
        @blur="handleBlur" 
        @error="handleError" 
      />
  </LexicalComposer>
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
