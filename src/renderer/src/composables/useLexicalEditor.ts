import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { 
  createEditor, 
  LexicalEditor, 
  EditorState,
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  $isRootNode,
  $isParagraphNode,
  $isTextNode
} from 'lexical'
import { 
  HeadingNode, 
  QuoteNode
} from '@lexical/rich-text'
import { CodeNode, CodeHighlightNode } from '@lexical/code'
import { registerCodeHighlighting } from '@lexical/code-shiki'
import { registerHistory, createEmptyHistoryState } from '@lexical/history'
import { ListItemNode, ListNode } from '@lexical/list'
import { LinkNode, AutoLinkNode } from '@lexical/link'
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table'
import { mergeRegister } from '@lexical/utils'

import type { 
  LexicalEditorConfig, 
  UseLexicalEditorReturn
} from '@/types/lexical'
import { editorStateToText, textToEditorState, createDefaultContent } from '@/utils/lexicalUtils'
import { createLexicalTheme, watchThemeChange, applyThemeToEditor } from '@/utils/lexicalTheme'
import { initializeEditorCommands } from '@/utils/lexicalCommands'

export function useLexicalEditor(config: Partial<LexicalEditorConfig> = {}): UseLexicalEditorReturn {
  // 响应式状态
  const editor = ref<LexicalEditor | null>(null)
  const isEditable = ref(config.editable ?? true)
  const content = ref('')
  const editorState = ref<EditorState | null>(null)
  
  // 事件回调
  const updateCallbacks = ref<Array<(editorState: EditorState) => void>>([])
  const errorCallbacks = ref<Array<(error: Error) => void>>([])

  // 默认配置
  const defaultConfig: LexicalEditorConfig = {
    namespace: config.namespace || 'VueLexicalEditor',
    editable: config.editable ?? true,
    autoFocus: config.autoFocus ?? false
  }

  // 创建编辑器实例
  const createEditorInstance = () => {
    if (editor.value) {
      // 清理现有编辑器
      editor.value = null
    }

    // 创建编辑器配置 - 使用最简单的配置
    const initialConfig = {
      namespace: defaultConfig.namespace,
      nodes: [
        HeadingNode, 
        QuoteNode, 
        CodeNode, 
        CodeHighlightNode
      ],
      theme: createLexicalTheme(),
      onError: (error: Error) => {
        console.error('Lexical Editor Error:', error)
        errorCallbacks.value.forEach(callback => callback(error))
      },
      editable: defaultConfig.editable,
    }

    // 创建编辑器
    const newEditor = createEditor(initialConfig)

    // 注册基本插件
    mergeRegister(
      registerHistory(newEditor, createEmptyHistoryState(), 300)
    )

    // 监听编辑器更新
    newEditor.registerUpdateListener(({ editorState: newEditorState }) => {
      editorState.value = newEditorState
      
      // 使用工具函数转换编辑器状态为文本
      content.value = editorStateToText(newEditorState)
      
      // 触发更新回调
      updateCallbacks.value.forEach(callback => callback(newEditorState))
    })

    // 初始化内容
    createDefaultContent(newEditor)

    editor.value = newEditor

    // 自动聚焦
    if (defaultConfig.autoFocus) {
      nextTick(() => {
        newEditor.focus()
      })
    }
  }

  // 更新内容
  const updateContent = (newContent: string) => {
    if (!editor.value) return
    textToEditorState(editor.value, newContent)
  }

  // 设置编辑器状态
  const setEditorState = (state: EditorState) => {
    if (!editor.value) return
    editor.value.setEditorState(state)
  }

  // 设置根元素
  const setRootElement = (element: HTMLElement) => {
    if (!editor.value) return
    editor.value.setRootElement(element)
  }

  // 聚焦编辑器
  const focus = () => {
    if (!editor.value) return
    editor.value.focus()
  }

  // 失焦编辑器
  const blur = () => {
    if (!editor.value) return
    editor.value.blur()
  }

  // 销毁编辑器
  const destroy = () => {
    if (editor.value) {
      editor.value = null
    }
  }

  // 注册更新回调
  const onUpdate = (callback: (editorState: EditorState) => void) => {
    updateCallbacks.value.push(callback)
  }

  // 注册错误回调
  const onError = (callback: (error: Error) => void) => {
    errorCallbacks.value.push(callback)
  }

  // 监听可编辑状态变化
  watch(isEditable, (newValue) => {
    if (editor.value) {
      editor.value.setEditable(newValue)
    }
  })

  // 组件挂载时创建编辑器
  onMounted(() => {
    // 延迟创建编辑器，确保 DOM 已经准备好
    setTimeout(() => {
      createEditorInstance()
      // 监听主题变化
      watchThemeChange(() => {
        if (editor.value) {
          applyThemeToEditor(editor.value)
        }
      })
    }, 100)
  })

  // 组件卸载时销毁编辑器
  onUnmounted(() => {
    destroy()
    // 清理 observer 如果需要，但 watchThemeChange 返回 MutationObserver，可以 disconnect
  })

  return {
    editor,
    isEditable,
    content,
    editorState,
    updateContent,
    setEditorState,
    setRootElement,
    focus,
    blur,
    destroy,
    onUpdate,
    onError
  }
}
