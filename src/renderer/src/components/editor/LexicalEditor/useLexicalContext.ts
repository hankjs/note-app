import { ref, shallowRef, provide, inject, type Ref } from 'vue'
import type { LexicalEditor } from 'lexical'
import type { LexicalEditorConfig } from '@/types/lexical'

type UnmountListeners = () => void;

type ListenerManager = Map<string, UnmountListeners>
let _uid = 0

// 定义 Lexical 上下文的接口
export interface LexicalContext {
  // 编辑器实例
  editor: Ref<LexicalEditor | null>
  
  // 编辑器配置
  config: Ref<LexicalEditorConfig>
  
  // 编辑器内容
  content: Ref<string>
  
  // 编辑器状态
  editorState: Ref<any>
  
  // 编辑器是否已初始化
  isInitialized: Ref<boolean>
  
  // 错误状态
  error: Ref<Error | null>

  // 方法
  setEditor: (instance: LexicalEditor | null) => void
  setContent: (content: string) => void
  setConfig: (config: LexicalEditorConfig) => void
  setError: (error: Error | null) => void
  updateEditorState: (state: any) => void
  cleanup: () => void
  addCleanup: (cleanup: () => void) => void
}

// 提供 Lexical 上下文的 key
export const LEXICAL_CONTEXT_KEY = Symbol('lexical-context')

// 创建 Lexical 上下文的 composable
export function useLexicalContext() {
  // 创建响应式状态
  const editor = shallowRef<LexicalEditor | null>(null)
  const config = ref<LexicalEditorConfig>({
    namespace: 'DefaultEditor',
    editable: true,
    autoFocus: false
  })
  const content = ref('')
  const editorState = ref<any>(null)
  const isInitialized = ref(false)
  const error = ref<Error | null>(null)
  
  // 清理函数引用
  const cleanupRef = ref<() => void>(() => {})

  // 监听器管理器
  const listenerManager = ref<ListenerManager>(new Map())

  const updateEditorState = (state: any) => {
    editorState.value = state
  }
  
  // 方法定义
  const setEditor = (instance: LexicalEditor | null) => {
    editor.value = instance
    isInitialized.value = !!instance
    listenerManager.value = new Map()
    if (!instance) {
      return
    }

    error.value = null // 清除之前的错误

    listenerManager.value.set(`update-${_uid++}`, instance.registerUpdateListener(({ editorState }) => {
      updateEditorState(editorState)
    }))

    if (content.value) {
      const state = instance.parseEditorState(content.value);
      instance.setEditorState(state);
    }
  }
  
  const setContent = (newContent: string) => {
    content.value = newContent
  }
  
  const setConfig = (newConfig: LexicalEditorConfig) => {
    config.value = { ...config.value, ...newConfig }
  }
  
  const setError = (err: Error | null) => {
    error.value = err
  }
  
  const cleanup = () => {
    if (cleanupRef.value) {
      cleanupRef.value()
    }
    if (listenerManager.value && listenerManager.value.size > 0) {
      listenerManager.value.forEach((cleanup) => {
        cleanup()
      })
      listenerManager.value.clear()
    }
    setEditor(null)
    updateEditorState(null)
    setError(null)
  }
  
  const addCleanup = (cleanup: () => void) => {
    listenerManager.value.set(`cleanup-${_uid++}`, cleanup)
  }
  
  // 创建上下文对象
  const context: LexicalContext = {
    editor,
    config,
    content,
    editorState,
    isInitialized,
    error,
    setEditor,
    setContent,
    setConfig,
    setError,
    updateEditorState,
    cleanup,
    addCleanup
  }
  
  return context
}

// 提供 Lexical 上下文
export function provideLexicalContext(context: LexicalContext) {
  provide(LEXICAL_CONTEXT_KEY, context)
  return context
}

// 注入 Lexical 上下文
export function injectLexicalContext(): LexicalContext {
  const context = inject<LexicalContext>(LEXICAL_CONTEXT_KEY)
  if (!context) {
    throw new Error('useLexicalContext must be used within a component that provides LexicalContext')
  }
  return context
}

// 便捷的 composable 用于在子组件中获取上下文
export function useLexicalEditor() {
  const context = injectLexicalContext()
  return {
    editor: context.editor,
    config: context.config,
    content: context.content,
    editorState: context.editorState,
    isInitialized: context.isInitialized,
    error: context.error,
    setEditor: context.setEditor,
    setContent: context.setContent,
    setConfig: context.setConfig,
    setError: context.setError,
    updateEditorState: context.updateEditorState,
    cleanup: context.cleanup,
    addCleanup: context.addCleanup
  }
}
