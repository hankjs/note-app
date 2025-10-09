<template>
  <div class="lexical-composer">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'
import { useLexicalContext, provideLexicalContext, type LexicalContext } from '@/composables/useLexicalContext'
import type { LexicalEditorConfig } from '@/types/lexical'

interface Props {
  initialConfig?: LexicalEditorConfig
}

const props = withDefaults(defineProps<Props>(), {
  initialConfig: () => ({
    namespace: 'LexicalEditor',
    editable: true,
    autoFocus: false
  }),
})

// 创建 Lexical 上下文
const lexicalContext = useLexicalContext()

// 提供上下文给子组件
provideLexicalContext(lexicalContext)

// 初始化配置
if (props.initialConfig) {
  lexicalContext.setConfig(props.initialConfig)
}

// 组件卸载时清理
onUnmounted(() => {
  lexicalContext.cleanup()
})

// 暴露上下文给父组件使用
defineExpose<LexicalContext>({
  editor: lexicalContext.editor,
  config: lexicalContext.config,
  content: lexicalContext.content,
  editorState: lexicalContext.editorState,
  isInitialized: lexicalContext.isInitialized,
  error: lexicalContext.error,
  setEditor: lexicalContext.setEditor,
  setContent: lexicalContext.setContent,
  setConfig: lexicalContext.setConfig,
  setError: lexicalContext.setError,
  updateEditorState: lexicalContext.updateEditorState,
  cleanup: lexicalContext.cleanup,
  onCleanup: lexicalContext.onCleanup
})
</script>

<style scoped>
.lexical-composer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
