<template>
  <div class="lexical-editor">
    <!-- 编辑器容器 -->
    <div ref="editorRef" class="editor-container" contenteditable="true"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch, shallowRef } from 'vue'
import type { LexicalEditorConfig } from '@/types/lexical'
import { LexicalEditor } from 'lexical'
import { createLexicalTheme } from '@renderer/utils/lexicalTheme'
import { createEditor, HISTORY_MERGE_TAG } from 'lexical';
import { registerListeners } from '../userListeners'
import { LexicalEditorEvent } from '../type'
import { useLexicalEditor } from './useLexicalContext'

import { registerDragonSupport } from '@lexical/dragon';
import { createEmptyHistoryState, registerHistory } from '@lexical/history';
import { HeadingNode, QuoteNode, registerRichText } from '@lexical/rich-text';
import { mergeRegister } from '@lexical/utils';

import {EmojiNode} from '../emoji-plugin/EmojiNode';
import {registerEmoji} from '../emoji-plugin/EmojiPlugin';

interface Props {
  initialContent?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialContent: '',
})

const emit = defineEmits<LexicalEditorEvent>()

// 使用 Lexical 上下文
const context = useLexicalEditor()
const {
  editor: contextEditor,
  config: contextConfig,
  error: contextError,
  setEditor,
  setContent,
  setError,
  cleanup: contextCleanup,
  addCleanup
} = context

const editorRef = ref<HTMLElement>()

watch(contextEditor, (newEditor) => {
  if (newEditor) {
    emit('init', newEditor)
  }
})

watch(contextError, (newError) => {
  if (newError) {
    emit('error', newError)
  }
})

// 初始化编辑器 - 参考标准 Lexical 模式
const initEditor = async (el: HTMLElement) => {
  if (!editorRef.value) {
    console.error('LexicalEditor: 编辑器元素未找到')
    return
  }

  try {
    const editorConfig = {
      namespace: contextConfig.value.namespace || `LexicalEditor_${Date.now()}`,
      theme: createLexicalTheme(),
      nodes: [HeadingNode, QuoteNode, EmojiNode],
      onError: (error: Error) => {
        console.error(error)
        setError(error)
      }
    };

    const instance = createEditor(editorConfig) as LexicalEditor;
    instance.setRootElement(el);

    /**
     * 返回一個函式，當被呼叫時會執行所有傳入的函式。
     * 通常用於註冊多個 Lexical 監聽器，
     * 並可透過單一函式呼叫來一次性移除這些監聽器，類似於 React 的 useEffect hook。
     */
    // Registering Plugins
    const cleanup = mergeRegister(
      registerRichText(instance),
      registerDragonSupport(instance),
      registerHistory(instance, createEmptyHistoryState(), 300),
      registerEmoji(instance),
      registerListeners(instance)
    );

    // 设置初始内容
    if (props.initialContent) {
      setContent(props.initialContent)
    }
    // 使用 context 方法设置编辑器实例
    setEditor(instance)
    // 添加清理函数
    addCleanup(cleanup)
    // 清除错误状态
    setError(null)
  } catch (error) {
    console.error('LexicalEditor: 编辑器初始化失败:', error)
    setError(error as Error)
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
  // 使用 context 清理方法
  contextCleanup()
})

const getContext = () => {
  return context
}

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
