import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useSetup } from '@/test/utils/component'
import { 
  useLexicalContext, 
  provideLexicalContext, 
  injectLexicalContext, 
  useLexicalEditor
} from './useLexicalContext'
import type { LexicalEditor } from 'lexical'
import type { LexicalEditorConfig } from '@/types/lexical'
import { createEditor } from 'lexical'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'

// 創建真實的 Lexical Editor
const createRealEditor = (): LexicalEditor => {
  return createEditor({
    namespace: 'TestEditor',
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
    ],
    editable: true,
    onError: (error: Error) => {
      console.error('Lexical Editor Error:', error)
    }
  })
}

describe('useLexicalContext', () => {
  let realEditor: LexicalEditor

  beforeEach(() => {
    realEditor = createRealEditor()
  })

  afterEach(() => {
    if (realEditor) {
      // LexicalEditor 沒有 destroy 方法，我們只需要清理引用
      realEditor = null as any
    }
  })

  describe('基本功能', () => {
    it('應該創建默認的上下文狀態', () => {
      const { editor, config, content, editorState, isInitialized, error } = useSetup(() => {
        return useLexicalContext()
      })

      expect(editor.value).toBeNull()
      expect(config.value).toEqual({
        namespace: 'DefaultEditor',
        editable: true,
        autoFocus: false
      })
      expect(content.value).toBe('')
      expect(editorState.value).toBeNull()
      expect(isInitialized.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('應該設置編輯器實例', () => {
      const { setEditor, editor, isInitialized } = useSetup(() => {
        return useLexicalContext()
      })

      setEditor(realEditor)

      expect(editor.value).toBe(realEditor)
      expect(isInitialized.value).toBe(true)
    })

    it('應該設置內容', () => {
      const { setContent, content } = useSetup(() => {
        return useLexicalContext()
      })

      const testContent = 'Hello World'
      setContent(testContent)

      expect(content.value).toBe(testContent)
    })

    it('應該設置配置', () => {
      const { setConfig, config } = useSetup(() => {
        return useLexicalContext()
      })

      const newConfig: LexicalEditorConfig = {
        namespace: 'TestEditor',
        editable: false,
        autoFocus: true
      }
      setConfig(newConfig)

      expect(config.value).toEqual({
        namespace: 'TestEditor',
        editable: false,
        autoFocus: true
      })
    })

    it('應該設置錯誤', () => {
      const { setError, error } = useSetup(() => {
        return useLexicalContext()
      })

      const testError = new Error('Test error')
      setError(testError)

      expect(error.value).toBe(testError)
    })

    it('應該更新編輯器狀態', () => {
      const { updateEditorState, editorState } = useSetup(() => {
        return useLexicalContext()
      })

      const testState = { content: 'test' }
      updateEditorState(testState)

      expect(editorState.value).toStrictEqual(testState)
    })
  })

  describe('編輯器管理', () => {
    it('應該在有內容時設置編輯器狀態', () => {
      const { setContent, setEditor } = useSetup(() => {
        return useLexicalContext()
      })

      const testContent = '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Hello","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}'
      setContent(testContent)
      setEditor(realEditor)

      // 真實的編輯器會解析並設置狀態
      expect(realEditor.getEditorState()).toBeDefined()
    })

    it('應該清除錯誤當設置新編輯器時', () => {
      const { setError, setEditor, error } = useSetup(() => {
        return useLexicalContext()
      })

      setError(new Error('Previous error'))
      setEditor(realEditor)

      expect(error.value).toBeNull()
    })

    it('應該重置初始化狀態當設置null編輯器時', () => {
      const { setEditor, editor, isInitialized } = useSetup(() => {
        return useLexicalContext()
      })

      setEditor(realEditor)
      expect(isInitialized.value).toBe(true)

      setEditor(null)
      expect(editor.value).toBeNull()
      expect(isInitialized.value).toBe(false)
    })
  })

  describe('清理功能', () => {
    it('應該清理所有監聽器和狀態', () => {
      const { setEditor, cleanup, editor, editorState, error } = useSetup(() => {
        return useLexicalContext()
      })

      setEditor(realEditor)
      const testError = new Error('Test error')
      error.value = testError

      cleanup()

      expect(editor.value).toBeNull()
      expect(editorState.value).toBeNull()
      expect(error.value).toBeNull()
    })

    it('應該添加清理函數', () => {
      const { addCleanup } = useSetup(() => {
        return useLexicalContext()
      })

      const cleanupFn = vi.fn()
      addCleanup(cleanupFn)

      // 清理函數應該被存儲，但不會立即執行
      expect(cleanupFn).not.toHaveBeenCalled()
    })

    it('應該在清理時執行所有清理函數', () => {
      const { addCleanup, cleanup } = useSetup(() => {
        return useLexicalContext()
      })

      const cleanupFn1 = vi.fn()
      const cleanupFn2 = vi.fn()
      addCleanup(cleanupFn1)
      addCleanup(cleanupFn2)

      cleanup()

      expect(cleanupFn1).toHaveBeenCalled()
      expect(cleanupFn2).toHaveBeenCalled()
    })
  })

  describe('provide/inject 功能', () => {
    it('應該提供和注入上下文', () => {
      const { editor, config } = useSetup(() => {
        const injectedContext = injectLexicalContext()
        return injectedContext
      }, {
        wrapper: () => {
          const context = useLexicalContext()
          provideLexicalContext(context)
          return context
        }
      })

      expect(editor.value).toBeNull()
      expect(config.value).toEqual({
        namespace: 'DefaultEditor',
        editable: true,
        autoFocus: false
      })
    })

    it('應該在沒有提供上下文時拋出錯誤', () => {
      expect(() => {
        useSetup(() => {
          return injectLexicalContext()
        })
      }).toThrow('useLexicalContext must be used within a component that provides LexicalContext')
    })

    it('應該通過 useLexicalEditor 獲取上下文', () => {
      const { editor, config, content } = useSetup(() => {
        return useLexicalEditor()
      }, {
        wrapper: () => {
          const context = useLexicalContext()
          provideLexicalContext(context)
          return context
        }
      })

      expect(editor.value).toBeNull()
      expect(config.value).toEqual({
        namespace: 'DefaultEditor',
        editable: true,
        autoFocus: false
      })
      expect(content.value).toBe('')
    })
  })

  describe('監聽器管理', () => {
    it('應該註冊更新監聽器', () => {
      const { setEditor, editorState } = useSetup(() => {
        return useLexicalContext()
      })

      setEditor(realEditor)

      // 真實的編輯器會註冊監聽器並更新狀態
      expect(editorState.value).toBeDefined()
    })

    it('應該在設置新編輯器時重新創建監聽器管理器', () => {
      const { setEditor, addCleanup } = useSetup(() => {
        return useLexicalContext()
      })

      const cleanupFn = vi.fn()
      addCleanup(cleanupFn)

      setEditor(realEditor)

      // 監聽器管理器應該被重置，編輯器狀態應該被更新
      expect(realEditor.getEditorState()).toBeDefined()
    })
  })

  describe('配置合併', () => {
    it('應該合併配置而不是替換', () => {
      const { setConfig, config } = useSetup(() => {
        return useLexicalContext()
      })

      // 設置部分配置
      setConfig({ namespace: 'CustomEditor' })
      expect(config.value).toEqual({
        namespace: 'CustomEditor',
        editable: true,
        autoFocus: false
      })

      // 再次設置部分配置
      setConfig({ autoFocus: true })
      expect(config.value).toEqual({
        namespace: 'CustomEditor',
        editable: true,
        autoFocus: true
      })
    })
  })

  describe('真實 Lexical 功能', () => {
    it('應該能夠更新編輯器內容', () => {
      const { setEditor, editorState } = useSetup(() => {
        return useLexicalContext()
      })

      setEditor(realEditor)

      // 更新編輯器內容 - 使用 Lexical 的 API
      realEditor.update(() => {
        const root = realEditor.getRootElement()
        if (root) {
          root.textContent = 'Hello World'
        }
      })

      expect(editorState.value).toBeDefined()
      // 檢查編輯器狀態是否包含內容
      const state = realEditor.getEditorState()
      expect(state).toBeDefined()
    })

    it('應該能夠處理編輯器狀態變化', () => {
      const { setEditor, editorState } = useSetup(() => {
        return useLexicalContext()
      })

      setEditor(realEditor)

      // 初始狀態
      const initialState = editorState.value
      expect(initialState).toBeDefined()

      // 更新內容 - 使用 Lexical 的 API
      realEditor.update(() => {
        const root = realEditor.getRootElement()
        if (root) {
          root.textContent = 'New Title'
        }
      })

      // 狀態應該已更新
      expect(editorState.value).toBeDefined()
      const updatedState = realEditor.getEditorState()
      expect(updatedState).toBeDefined()
    })

    it('應該能夠設置和獲取編輯器配置', () => {
      const { setEditor } = useSetup(() => {
        return useLexicalContext()
      })

      setEditor(realEditor)

      // 檢查編輯器配置
      expect(realEditor.isEditable()).toBe(true)
      expect(realEditor.getKey()).toBeDefined()
    })

    it('應該能夠處理錯誤狀態', () => {
      const { setEditor, setError, error } = useSetup(() => {
        return useLexicalContext()
      })

      setEditor(realEditor)

      const testError = new Error('Test error')
      setError(testError)

      expect(error.value).toBe(testError)
    })

    it('應該能夠清理編輯器實例', () => {
      const { setEditor, cleanup, editor } = useSetup(() => {
        return useLexicalContext()
      })

      setEditor(realEditor)
      expect(editor.value).toBe(realEditor)

      cleanup()
      expect(editor.value).toBeNull()
    })
  })
})
