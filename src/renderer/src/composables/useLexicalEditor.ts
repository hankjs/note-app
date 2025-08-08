import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { 
  createEditor, 
  LexicalEditor, 
  EditorState,
  $getRoot,
  $createParagraphNode,
  $createTextNode
} from 'lexical'
import { registerRichText } from '@lexical/rich-text'
import { $convertFromMarkdownString } from '@lexical/markdown'

import type { 
  LexicalEditorConfig, 
  UseLexicalEditorReturn
} from '@/types/lexical'

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

    // 创建编辑器
    const newEditor = createEditor({
      namespace: defaultConfig.namespace,
      onError: (error) => {
        console.error('Lexical Editor Error:', error)
        errorCallbacks.value.forEach(callback => callback(error))
      },
      editable: isEditable.value
    })

    // 注册富文本节点
    registerRichText(newEditor)

    // 监听编辑器更新
    newEditor.registerUpdateListener(({ editorState: newEditorState }) => {
      editorState.value = newEditorState
      
      // 更新内容（简化版本）
      content.value = JSON.stringify(newEditorState.toJSON())
      
      // 触发更新回调
      updateCallbacks.value.forEach(callback => callback(newEditorState))
    })

    // 初始化内容
    initializeDefaultContent(newEditor)

    editor.value = newEditor

    // 自动聚焦
    if (defaultConfig.autoFocus) {
      nextTick(() => {
        newEditor.focus()
      })
    }
  }

  // 初始化默认内容
  const initializeDefaultContent = (editorInstance: LexicalEditor) => {
    editorInstance.update(() => {
      const root = $getRoot()
      if (root.getFirstChild() === null) {
        const paragraph = $createParagraphNode()
        const text = $createTextNode('开始编辑...')
        paragraph.append(text)
        root.append(paragraph)
      }
    })
  }

  // 更新内容
  const updateContent = (newContent: string) => {
    if (!editor.value) return

    editor.value.update(() => {
      const root = $getRoot()
      root.clear()
      
      if (newContent) {
        try {
          // 尝试解析为 Markdown
          $convertFromMarkdownString(newContent)
        } catch (error) {
          // 如果解析失败，作为纯文本处理
          const paragraph = $createParagraphNode()
          const text = $createTextNode(newContent)
          paragraph.append(text)
          root.append(paragraph)
        }
      }
    })
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
    }, 100)
  })

  // 组件卸载时销毁编辑器
  onUnmounted(() => {
    destroy()
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
