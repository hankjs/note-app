import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createEditor, $getRoot, $createParagraphNode, $createTextNode } from 'lexical'
import { registerRichText, HeadingNode, QuoteNode } from '@lexical/rich-text'
import { registerHistory, createEmptyHistoryState } from '@lexical/history'
import { mergeRegister } from '@lexical/utils'

// 模拟 Lexical 编辑器
const createMockEditor = () => {
  const editor = createEditor({
    namespace: 'TestEditor',
    nodes: [HeadingNode, QuoteNode],
    onError: (error: Error) => {
      console.error('Editor Error:', error)
    }
  })

  // 注册插件
  mergeRegister(
    registerRichText(editor),
    registerHistory(editor, createEmptyHistoryState(), 300)
  )

  return editor
}

// 模拟 DOM 元素
const createMockElement = () => {
  const element = document.createElement('div')
  element.contentEditable = 'true'
  return element
}

describe('Lexical 工具函数测试', () => {
  let editor: any
  let rootElement: HTMLElement

  beforeEach(() => {
    editor = createMockEditor()
    rootElement = createMockElement()
    document.body.appendChild(rootElement)
  })

  afterEach(() => {
    if (rootElement.parentNode) {
      rootElement.parentNode.removeChild(rootElement)
    }
    editor = null
  })

  describe('编辑器初始化', () => {
    it('应该能够创建编辑器实例', () => {
      expect(editor).toBeDefined()
      expect(typeof editor.setRootElement).toBe('function')
      expect(typeof editor.update).toBe('function')
      expect(typeof editor.getEditorState).toBe('function')
    })

    it('应该能够设置根元素', () => {
      expect(() => {
        editor.setRootElement(rootElement)
      }).not.toThrow()
    })

    it('应该能够注册插件', () => {
      expect(() => {
        const testEditor = createMockEditor()
        expect(testEditor).toBeDefined()
      }).not.toThrow()
    })
  })

  describe('内容操作', () => {
    beforeEach(() => {
      editor.setRootElement(rootElement)
    })

    it('应该能够初始化内容', () => {
      editor.update(() => {
        const root = $getRoot()
        const paragraph = $createParagraphNode()
        const text = $createTextNode('Hello, Lexical!')
        paragraph.append(text)
        root.append(paragraph)
      })

      const state = editor.getEditorState()
      expect(state).toBeDefined()
    })

    it('应该能够更新内容', () => {
      const testContent = 'Test content'
      
      editor.update(() => {
        const root = $getRoot()
        root.clear()
        const paragraph = $createParagraphNode()
        const text = $createTextNode(testContent)
        paragraph.append(text)
        root.append(paragraph)
      })

      const state = editor.getEditorState()
      const json = state.toJSON()
      expect(json).toBeDefined()
    })

    it('应该能够清空内容', () => {
      // 先添加一些内容
      editor.update(() => {
        const root = $getRoot()
        const paragraph = $createParagraphNode()
        const text = $createTextNode('Some content')
        paragraph.append(text)
        root.append(paragraph)
      })

      // 然后清空
      editor.update(() => {
        const root = $getRoot()
        root.clear()
      })

      const state = editor.getEditorState()
      const json = state.toJSON()
      expect(json.root.children).toHaveLength(0)
    })
  })

  describe('状态管理', () => {
    beforeEach(() => {
      editor.setRootElement(rootElement)
    })

    it('应该能够获取编辑器状态', () => {
      const state = editor.getEditorState()
      expect(state).toBeDefined()
      expect(typeof state.toJSON).toBe('function')
    })

    it('应该能够序列化状态为 JSON', () => {
      editor.update(() => {
        const root = $getRoot()
        const paragraph = $createParagraphNode()
        const text = $createTextNode('Test')
        paragraph.append(text)
        root.append(paragraph)
      })

      const state = editor.getEditorState()
      const json = state.toJSON()
      
      expect(json).toBeDefined()
      expect(json.root).toBeDefined()
      expect(json.root.children).toBeDefined()
      expect(Array.isArray(json.root.children)).toBe(true)
    })

    it('应该能够监听状态更新', () => {
      const updateListener = vi.fn()
      editor.registerUpdateListener(updateListener)

      editor.update(() => {
        const root = $getRoot()
        const paragraph = $createParagraphNode()
        const text = $createTextNode('Test')
        paragraph.append(text)
        root.append(paragraph)
      })

      expect(updateListener).toHaveBeenCalled()
    })
  })

  describe('焦点管理', () => {
    beforeEach(() => {
      editor.setRootElement(rootElement)
    })

    it('应该能够聚焦编辑器', () => {
      expect(() => {
        editor.focus()
      }).not.toThrow()
    })

    it('应该能够失焦编辑器', () => {
      expect(() => {
        editor.blur()
      }).not.toThrow()
    })
  })

  describe('错误处理', () => {
    it('应该能够处理编辑器错误', () => {
      const errorHandler = vi.fn()
      const testEditor = createEditor({
        namespace: 'ErrorTest',
        nodes: [HeadingNode, QuoteNode],
        onError: errorHandler
      })

      // 触发一个错误（尝试在没有根元素的情况下更新）
      expect(() => {
        testEditor.update(() => {
          const root = $getRoot()
          root.clear()
        })
      }).not.toThrow()

      // 错误处理器应该被调用
      expect(errorHandler).toHaveBeenCalled()
    })
  })
})
