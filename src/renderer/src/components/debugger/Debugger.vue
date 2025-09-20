<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import LexicalEditor from '../editor/LexicalEditor.vue'
import type { LexicalEditor as LexicalEditorType } from 'lexical'
import type { LexicalEditorConfig } from '@/types/lexical'

// 响应式状态
const content = ref("")
const editorRef = ref<InstanceType<typeof LexicalEditor>>()
const editor = ref<LexicalEditorType | null>(null)
const config = ref<LexicalEditorConfig>({
  namespace: 'DebuggerEditor',
  editable: true,
  autoFocus: false
})

const showDebug = ref(false)


// 事件处理
const handleChange = (value: string) => {
  content.value = value
  console.log('LexicalEditor: 内容变化', value)
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
  <LexicalEditor v-model="content" :config="config" :show-debug="showDebug"
    @init="handleInit" @change="handleChange" @focus="handleFocus"
    @blur="handleBlur" @error="handleError" ref="editorRef" />
</template>
