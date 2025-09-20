<template>
  <div class="lexical-editor">
    <!-- 编辑器容器 -->
    <div ref="editorRef" class="editor-container" contenteditable="true"></div>

    <!-- 调试信息（开发环境） -->
    <div v-if="showDebug" class="debug-info">
      <h4>调试信息</h4>
      <p>内容长度: {{ content.length }}</p>
      <p>编辑器状态: {{ editorState ? '已初始化' : '未初始化' }}</p>
      <p>编辑器实例: {{ editor ? '已创建' : '未创建' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, watchEffect, shallowRef } from 'vue'
import type { LexicalEditorConfig } from '@/types/lexical'
import { LexicalEditor } from 'lexical'
import { createLexicalTheme } from '@renderer/utils/lexicalTheme'
import { createEditor, HISTORY_MERGE_TAG } from 'lexical';
import { useListeners } from './userListeners'
import { LexicalEditorEvent } from './type'

import { registerDragonSupport } from '@lexical/dragon';
import { createEmptyHistoryState, registerHistory } from '@lexical/history';
import { HeadingNode, QuoteNode, registerRichText } from '@lexical/rich-text';
import { mergeRegister } from '@lexical/utils';

import prepopulatedRichText from './prepopulatedRichText';

interface Props {
  modelValue?: string
  config?: LexicalEditorConfig
  showDebug?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  config: () => ({
    namespace: 'DefaultEditor',
    editable: true,
    autoFocus: false
  }),
  showDebug: false
})

const emit = defineEmits<LexicalEditorEvent>()

const editorRef = ref<HTMLElement>()
const content = ref(props.modelValue)
const editorState = ref<any>(null)

const editor = ref<LexicalEditor | null>(null)

const { registerListeners } = useListeners()

// 初始化编辑器 - 参考标准 Lexical 模式
const initEditor = async (el: HTMLElement) => {
  if (!editorRef.value) {
    console.error('LexicalEditor: 编辑器元素未找到')
    return
  }

  try {
    const config = {
      namespace: 'Hank Editor',
      theme: createLexicalTheme(),
      // Register nodes specific for @lexical/rich-text
      nodes: [HeadingNode, QuoteNode],
      onError: (error: Error) => {
        console.error(error)

      }
    };

    const instance = createEditor(config) as LexicalEditor;
    editor.value = instance
    editor.value.setRootElement(el);

    // Registering Plugins
    mergeRegister(
      registerRichText(instance),
      registerDragonSupport(instance),
      registerHistory(instance, createEmptyHistoryState(), 300),
    );
    registerListeners(instance as LexicalEditor)
    emit('init', instance as LexicalEditor)

    instance.update(prepopulatedRichText, { tag: HISTORY_MERGE_TAG });

  } catch (error) {
    console.error('LexicalEditor: 编辑器初始化失败:', error)
    emit('error', error as Error)
  }
}



watch(() => editorRef.value, (newValue, oldValue) => {
  console.log('LexicalEditor: 编辑器元素变化', newValue, oldValue)
  if (newValue === oldValue) {
    return
  }
  if (!newValue) {
    return
  }

  initEditor(newValue)
}, {
  immediate: true
})

// 组件卸载时清理
onUnmounted(() => {
  console.log('LexicalEditor: 组件已卸载')
  // 清理 DOM 元素上的引用
  if (editorRef.value) {
    delete (editorRef.value as any).lexicalEditor
  }
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
