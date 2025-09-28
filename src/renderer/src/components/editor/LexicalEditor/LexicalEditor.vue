<template>
  <div class="lexical-editor">
    <!-- 编辑器容器 -->
    <div ref="editorRef" class="editor-container" contenteditable="true"></div>
  </div>
</template>

<script setup lang="ts">
import { LexicalEditorEvent } from '../type'
import { useLexicalEditorSetup } from './useLexicalEditorSetup'

interface Props {
  initialContent?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialContent: '',
})

const emit = defineEmits<LexicalEditorEvent>()

// 使用提取的 composable
const { editorRef, getContext } = useLexicalEditorSetup(props, emit)

defineExpose({
  getContext
})
</script>

<style>
/* 编辑器样式现在由 lexical-editor.css 提供 */
/* 这里只保留组件特定的样式 */
.lexical-editor {
  user-select: text;
  position: relative;
  width: 100%;
  height: 100%;
}

.editor-container {
  width: 100%;
  height: 100%;
  min-height: 200px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.5;
  outline: none;
}

.editor-container:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.debug-info {
  margin-top: 16px;
  padding: 12px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
}

.debug-info h4 {
  margin: 0 0 8px 0;
  color: #495057;
}

.debug-info p {
  margin: 4px 0;
  color: #6c757d;
}
</style>
