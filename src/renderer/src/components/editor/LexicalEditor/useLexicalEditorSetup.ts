import { ref, onUnmounted, watch, type Ref } from 'vue'
import { LexicalEditor } from 'lexical'
import { createLexicalTheme } from '@renderer/utils/lexicalTheme'
import { createEditor } from 'lexical'
import { registerListeners } from '@/components/editor/userListeners'
import { LexicalEditorEvent } from '@/components/editor/type'
import { useLexicalEditor } from '@/composables/useLexicalContext'

import { HeadingNode, QuoteNode, registerRichText } from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'

import { registerDragonSupport } from '@lexical/dragon'
import { createEmptyHistoryState, registerHistory } from '@lexical/history'
import { mergeRegister } from '@lexical/utils'

import { EmojiNode } from '@/components/editor/emoji-plugin/EmojiNode'
import { registerEmoji } from '@/components/editor/emoji-plugin/EmojiPlugin'

export interface LexicalEditorSetupProps {
  initialContent?: string
}

export interface LexicalEditorSetupReturn {
  editorRef: Ref<HTMLElement | undefined>
  getContext: () => ReturnType<typeof useLexicalEditor>
}

export function useLexicalEditorSetup(
  props: LexicalEditorSetupProps,
  emit: LexicalEditorEvent
): LexicalEditorSetupReturn {
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
        nodes: [
          HeadingNode,
          ListNode,
          ListItemNode,
          QuoteNode,
          CodeNode,
          CodeHighlightNode,
          AutoLinkNode,
          LinkNode,
          TableNode,
          TableRowNode,
          TableCellNode,
          EmojiNode
        ],
        onError: (error: Error) => {
          console.error(error)
          setError(error)
        }
      }

      const instance = createEditor(editorConfig) as LexicalEditor
      instance.setRootElement(el)

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
      )

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

  return {
    editorRef,
    getContext
  }
}
