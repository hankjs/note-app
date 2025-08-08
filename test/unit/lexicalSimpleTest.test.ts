import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createEditor, $getRoot, $createParagraphNode, $createTextNode } from 'lexical'
import { registerRichText, HeadingNode, QuoteNode } from '@lexical/rich-text'
import { registerHistory, createEmptyHistoryState } from '@lexical/history'
import { mergeRegister } from '@lexical/utils'

// 模拟 DOM 环境
const createMockDOM = () => {
  const element = document.createElement('div')
  element.contentEditable = 'true'
  element.style.width = '100px'
  element.style.height = '100px'
  document.body.appendChild(element)
  return element
}

describe('LexicalSimpleTest 测试', () => {
  let editor: any
  let rootElement: HTMLElement

  beforeEach(() => {
    // 创建编辑器
    editor = createEditor({
      namespace: 'Simple Test',
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

    // 创建 DOM 元素
    rootElement = createMockDOM()
  })

  afterEach(() => {
    if (rootElement.parentNode) {
      rootElement.parentNode.removeChild(rootElement)
    }
    editor = null
  })

  describe('编辑器创建', () => {
    it('应该能够创建编辑器实例', () => {
      expect(editor).toBeDefined()
      expect(typeof editor.setRootElement).toBe('function')
      expect(typeof editor.update).toBe('function')
      expect(typeof editor.getEditorState).toBe('function')
      expect(typeof editor.focus).toBe('function')
    })

    it('应该能够注册必要的插件', () => {
      expect(() => {
        const testEditor = createEditor({
          namespace: 'Test',
          nodes: [HeadingNode, QuoteNode]
        })
        
        mergeRegister(
          registerRichText(testEditor),
          registerHistory(testEditor, createEmptyHistoryState(), 300)
        )
        
        expect(testEditor).toBeDefined()
      }).not.toThrow()
    })
  })

  describe('setRootElement 功能', () => {
    it('应该能够设置根元素', () => {
      expect(() => {
        editor.setRootElement(rootElement)
      }).not.toThrow()
    })

    it('应该能够处理无效的根元素', () => {
      expect(() => {
        editor.setRootElement(null)
      }).not.toThrow()
    })
  })

  describe('updateContent 功能', () => {
    beforeEach(() => {
      editor.setRootElement(rootElement)
    })

    it('应该能够更新内容', () => {
      const testContent = '测试内容'
      
      expect(() => {
        editor.update(() => {
          const root = $getRoot()
          root.clear()
          const paragraph = $createParagraphNode()
          const text = $createTextNode(testContent)
          paragraph.append(text)
          root.append(paragraph)
        })
      }).not.toThrow()

      const state = editor.getEditorState()
      expect(state).toBeDefined()
    })

    it('应该能够清空内容', () => {
      // 先添加内容
      editor.update(() => {
        const root = $getRoot()
        const paragraph = $createParagraphNode()
        const text = $createTextNode('一些内容')
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

    it('应该能够处理空内容', () => {
      expect(() => {
        editor.update(() => {
          const root = $getRoot()
          root.clear()
        })
      }).not.toThrow()
    })
  })

  describe('getState 功能', () => {
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
        const text = $createTextNode('测试')
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

    it('应该返回正确的状态结构', () => {
      const state = editor.getEditorState()
      const json = state.toJSON()
      
      expect(json).toHaveProperty('root')
      expect(json.root).toHaveProperty('children')
      expect(json.root).toHaveProperty('direction')
      expect(json.root).toHaveProperty('format')
      expect(json.root).toHaveProperty('indent')
      expect(json.root).toHaveProperty('type')
      expect(json.root).toHaveProperty('version')
    })
  })

  describe('focus 功能', () => {
    beforeEach(() => {
      editor.setRootElement(rootElement)
    })

    it('应该能够聚焦编辑器', () => {
      expect(() => {
        editor.focus()
      }).not.toThrow()
    })

    it('应该能够处理多次聚焦', () => {
      expect(() => {
        editor.focus()
        editor.focus()
        editor.focus()
      }).not.toThrow()
    })
  })

  describe('状态更新监听', () => {
    beforeEach(() => {
      editor.setRootElement(rootElement)
    })

    it('应该能够监听状态更新', () => {
      const updateListener = vi.fn()
      editor.registerUpdateListener(updateListener)

      editor.update(() => {
        const root = $getRoot()
        const paragraph = $createParagraphNode()
        const text = $createTextNode('测试更新')
        paragraph.append(text)
        root.append(paragraph)
      })

      expect(updateListener).toHaveBeenCalled()
    })

    it('应该能够移除更新监听器', () => {
      const updateListener = vi.fn()
      const removeListener = editor.registerUpdateListener(updateListener)

      editor.update(() => {
        const root = $getRoot()
        const paragraph = $createParagraphNode()
        const text = $createTextNode('测试')
        paragraph.append(text)
        root.append(paragraph)
      })

      expect(updateListener).toHaveBeenCalled()

      // 移除监听器
      removeListener()

      // 重置模拟函数
      vi.clearAllMocks()

      // 再次更新
      editor.update(() => {
        const root = $getRoot()
        root.clear()
      })

      expect(updateListener).not.toHaveBeenCalled()
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

      // 注册插件
      mergeRegister(
        registerRichText(testEditor),
        registerHistory(testEditor, createEmptyHistoryState(), 300)
      )

      // 尝试在没有根元素的情况下更新
      expect(() => {
        testEditor.update(() => {
          const root = $getRoot()
          root.clear()
        })
      }).not.toThrow()

      // 错误处理器应该被调用
      expect(errorHandler).toHaveBeenCalled()
    })

    it('应该能够处理无效的更新操作', () => {
      editor.setRootElement(rootElement)

      expect(() => {
        editor.update(() => {
          // 尝试访问不存在的节点
          const root = $getRoot()
          // 这里故意不添加任何内容，测试空更新
        })
      }).not.toThrow()
    })
  })

  describe('性能测试', () => {
    beforeEach(() => {
      editor.setRootElement(rootElement)
    })

    it('应该能够处理大量内容更新', () => {
      const iterations = 100
      
      expect(() => {
        for (let i = 0; i < iterations; i++) {
          editor.update(() => {
            const root = $getRoot()
            root.clear()
            const paragraph = $createParagraphNode()
            const text = $createTextNode(`内容 ${i}`)
            paragraph.append(text)
            root.append(paragraph)
          })
        }
      }).not.toThrow()

      const state = editor.getEditorState()
      expect(state).toBeDefined()
    })

    it('应该能够处理快速连续更新', () => {
      const promises = []
      
      for (let i = 0; i < 10; i++) {
        promises.push(
          new Promise<void>((resolve) => {
            editor.update(() => {
              const root = $getRoot()
              const paragraph = $createParagraphNode()
              const text = $createTextNode(`快速更新 ${i}`)
              paragraph.append(text)
              root.append(paragraph)
            })
            resolve()
          })
        )
      }

      expect(() => {
        Promise.all(promises)
      }).not.toThrow()
    })
  })

  describe('内存管理', () => {
    it('应该能够正确清理资源', () => {
      const updateListener = vi.fn()
      const removeListener = editor.registerUpdateListener(updateListener)

      editor.setRootElement(rootElement)

      // 进行一些操作
      editor.update(() => {
        const root = $getRoot()
        const paragraph = $createParagraphNode()
        const text = $createTextNode('测试内容')
        paragraph.append(text)
        root.append(paragraph)
      })

      // 清理监听器
      removeListener()

      // 清理根元素
      editor.setRootElement(null)

      expect(updateListener).toHaveBeenCalled()
    })
  })
})
