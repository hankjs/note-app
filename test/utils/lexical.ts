import { nextTick } from 'vue'
import { useLexicalEditorSetup, type LexicalEditorSetupProps } from '@/components/editor/LexicalEditor/useLexicalEditorSetup'
import { useLexicalContext, provideLexicalContext } from '@/composables/useLexicalContext'
import { LexicalEditorEvent } from '@/components/editor/type'
import { useSetup } from '@/test/utils/component'

// Lexical 編輯器測試工具類型定義
export interface LexicalTestSetupOptions {
  /** 初始內容 */
  initialContent?: string
  /** 自定義 emit 函數 */
  emit?: LexicalEditorEvent
  /** 自定義配置 */
  config?: {
    namespace?: string
    editable?: boolean
    autoFocus?: boolean
  }
}

export interface LexicalTestSetupReturn {
  /** 編輯器 DOM 引用 */
  editorRef: any
  /** 獲取上下文函數 */
  getContext: () => any
  /** 觸發的事件列表 */
  emittedEvents: any[]
  /** 創建的 DOM 元素 */
  mockElement: HTMLElement
  /** 等待編輯器初始化完成 */
  waitForInitialization: () => Promise<void>
}

/**
 * 創建 Lexical 編輯器測試設置
 * @param options 測試選項
 * @returns 測試設置對象
 */
export function createLexicalTestSetup(options: LexicalTestSetupOptions = {}): LexicalTestSetupReturn {
  const {
    initialContent,
    emit,
    config = {}
  } = options

  // 事件收集器
  const emittedEvents: any[] = []
  
  // 默認 emit 函數
  const defaultEmit: LexicalEditorEvent = ((event: string, ...args: any[]) => {
    emittedEvents.push({ event, args })
  }) as LexicalEditorEvent

  // 創建 DOM 元素
  const mockElement = document.createElement('div')
  mockElement.setAttribute('data-testid', 'editor-root')
  document.body.appendChild(mockElement)

  // 使用 useSetup 創建測試設置
  const setup = useSetup(
    (testProps?: any) => useLexicalEditorSetup(testProps || { initialContent }, emit || defaultEmit),
    {
      props: { initialContent },
      wrapper: () => {
        const context = useLexicalContext()
        
        // 應用自定義配置
        if (config.namespace) {
          context.setConfig({ namespace: config.namespace })
        }
        if (config.editable !== undefined) {
          context.setConfig({ editable: config.editable })
        }
        if (config.autoFocus !== undefined) {
          context.setConfig({ autoFocus: config.autoFocus })
        }
        
        provideLexicalContext(context)
        return { context }
      }
    }
  )

  // 等待編輯器初始化完成的輔助函數
  const waitForInitialization = async () => {
    // 設置 editorRef 為 DOM 元素以觸發編輯器初始化
    setup.editorRef.value = mockElement
    await nextTick()
    await nextTick() // 等待額外的 tick 確保所有異步操作完成
  }

  return {
    editorRef: setup.editorRef,
    getContext: setup.getContext,
    emittedEvents,
    mockElement,
    waitForInitialization
  }
}

/**
 * 清理 Lexical 測試環境
 */
export function cleanupLexicalTest() {
  // 清理 DOM
  const elements = document.querySelectorAll('[data-testid="editor-root"]')
  elements.forEach(el => el.remove())
}

/**
 * 創建簡單的 Lexical 編輯器測試設置（不包含 DOM 元素）
 * @param options 測試選項
 * @returns 測試設置對象
 */
export function createSimpleLexicalTestSetup(options: LexicalTestSetupOptions = {}): Omit<LexicalTestSetupReturn, 'mockElement' | 'waitForInitialization'> {
  const {
    initialContent,
    emit,
    config = {}
  } = options

  // 事件收集器
  const emittedEvents: any[] = []
  
  // 默認 emit 函數
  const defaultEmit: LexicalEditorEvent = ((event: string, ...args: any[]) => {
    emittedEvents.push({ event, args })
  }) as LexicalEditorEvent

  // 使用 useSetup 創建測試設置
  const setup = useSetup(
    (testProps?: any) => useLexicalEditorSetup(testProps || { initialContent }, emit || defaultEmit),
    {
      props: { initialContent },
      wrapper: () => {
        const context = useLexicalContext()
        
        // 應用自定義配置
        if (config.namespace) {
          context.setConfig({ namespace: config.namespace })
        }
        if (config.editable !== undefined) {
          context.setConfig({ editable: config.editable })
        }
        if (config.autoFocus !== undefined) {
          context.setConfig({ autoFocus: config.autoFocus })
        }
        
        provideLexicalContext(context)
        return { context }
      }
    }
  )

  return {
    editorRef: setup.editorRef,
    getContext: setup.getContext,
    emittedEvents
  }
}

/**
 * 創建帶有自定義配置的 Lexical 編輯器測試設置
 * @param config 編輯器配置
 * @param options 其他測試選項
 * @returns 測試設置對象
 */
export function createLexicalTestWithConfig(
  config: LexicalTestSetupOptions['config'],
  options: Omit<LexicalTestSetupOptions, 'config'> = {}
): LexicalTestSetupReturn {
  return createLexicalTestSetup({
    ...options,
    config
  })
}

/**
 * 創建帶有初始內容的 Lexical 編輯器測試設置
 * @param initialContent 初始內容
 * @param options 其他測試選項
 * @returns 測試設置對象
 */
export function createLexicalTestWithContent(
  initialContent: string,
  options: Omit<LexicalTestSetupOptions, 'initialContent'> = {}
): LexicalTestSetupReturn {
  return createLexicalTestSetup({
    ...options,
    initialContent
  })
}

/**
 * 創建帶有自定義事件處理的 Lexical 編輯器測試設置
 * @param emit 自定義 emit 函數
 * @param options 其他測試選項
 * @returns 測試設置對象
 */
export function createLexicalTestWithEmit(
  emit: LexicalEditorEvent,
  options: Omit<LexicalTestSetupOptions, 'emit'> = {}
): LexicalTestSetupReturn {
  return createLexicalTestSetup({
    ...options,
    emit
  })
}
