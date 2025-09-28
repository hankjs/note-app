import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import {
  createLexicalTestSetup,
  createSimpleLexicalTestSetup,
  createLexicalTestWithConfig,
  createLexicalTestWithContent,
  createLexicalTestWithEmit,
  cleanupLexicalTest,
  type LexicalTestSetupOptions,
  type LexicalTestSetupReturn
} from '@test/utils/lexical'
import { LexicalEditorEvent } from '@/components/editor/type'

/**
 * Lexical 編輯器測試工具使用文檔
 * 
 * 這個測試文件展示了如何使用 Lexical 編輯器測試工具的所有功能。
 * 每個測試用例都是一個具體的使用示例，可以作為使用文檔參考。
 */
describe('Lexical 編輯器測試工具使用文檔', () => {
  afterEach(() => {
    // 每個測試後清理環境
    cleanupLexicalTest()
  })

  describe('createLexicalTestSetup - 完整測試設置', () => {
    it('基本使用方式：創建完整的編輯器測試環境', async () => {
      // 創建完整的測試設置，包含 DOM 元素和編輯器初始化
      const setup = createLexicalTestSetup()

      // 等待編輯器初始化完成
      await setup.waitForInitialization()

      // 獲取編輯器上下文
      const context = setup.getContext()

      // 驗證編輯器已正確初始化
      expect(context.editor.value).toBeDefined()
      expect(context.isInitialized.value).toBe(true)
      expect(setup.mockElement).toBeDefined()
      expect(setup.editorRef).toBeDefined()
    })

    it('帶初始內容的測試設置', async () => {
      const initialContent = '<p>Hello World</p>'
      
      // 創建帶初始內容的測試設置
      const setup = createLexicalTestSetup({
        initialContent
      })

      await setup.waitForInitialization()

      const context = setup.getContext()
      
      // 驗證編輯器已初始化
      expect(context.editor.value).toBeDefined()
      expect(context.isInitialized.value).toBe(true)
    })

    it('帶自定義配置的測試設置', async () => {
      // 創建帶自定義配置的測試設置
      const setup = createLexicalTestSetup({
        config: {
          namespace: 'CustomEditor',
          editable: false,
          autoFocus: true
        }
      })

      await setup.waitForInitialization()

      const context = setup.getContext()
      
      // 驗證配置已正確應用
      expect(context.config.value.namespace).toBe('CustomEditor')
      expect(context.config.value.editable).toBe(false)
      expect(context.config.value.autoFocus).toBe(true)
    })

    it('帶自定義事件處理的測試設置', async () => {
      const customEvents: any[] = []
      
      // 創建自定義 emit 函數
      const customEmit: LexicalEditorEvent = ((event: string, ...args: any[]) => {
        customEvents.push({ event, args, timestamp: Date.now() })
      }) as LexicalEditorEvent

      // 創建帶自定義事件處理的測試設置
      const setup = createLexicalTestSetup({
        emit: customEmit
      })

      await setup.waitForInitialization()

      // 驗證自定義事件被觸發
      const initEvents = customEvents.filter(e => e.event === 'init')
      expect(initEvents.length).toBeGreaterThan(0)
    })

    it('完整配置的測試設置', async () => {
      const initialContent = '<h1>Test Title</h1><p>Test content</p>'
      const customEvents: any[] = []
      
      const customEmit: LexicalEditorEvent = ((event: string, ...args: any[]) => {
        customEvents.push({ event, args })
      }) as LexicalEditorEvent

      // 創建完整配置的測試設置
      const setup = createLexicalTestSetup({
        initialContent,
        emit: customEmit,
        config: {
          namespace: 'FullConfigEditor',
          editable: true,
          autoFocus: false
        }
      })

      await setup.waitForInitialization()

      const context = setup.getContext()
      
      // 驗證所有配置都正確應用
      expect(context.editor.value).toBeDefined()
      expect(context.config.value.namespace).toBe('FullConfigEditor')
      expect(context.config.value.editable).toBe(true)
      expect(context.config.value.autoFocus).toBe(false)
      
      // 驗證事件被觸發
      const initEvents = customEvents.filter(e => e.event === 'init')
      expect(initEvents.length).toBeGreaterThan(0)
    })
  })

  describe('createSimpleLexicalTestSetup - 簡化測試設置', () => {
    it('基本使用方式：創建不包含 DOM 的簡化測試', () => {
      // 創建簡化的測試設置，不包含 DOM 元素和初始化等待
      const setup = createSimpleLexicalTestSetup()

      // 獲取編輯器上下文
      const context = setup.getContext()

      // 驗證基本功能
      expect(setup.editorRef).toBeDefined()
      expect(setup.getContext).toBeDefined()
      expect(typeof setup.getContext).toBe('function')
      expect(context).toBeDefined()
      expect(context.editor).toBeDefined()
      expect(context.config).toBeDefined()
      expect(context.content).toBeDefined()
    })

    it('簡化測試用於快速驗證基本功能', async () => {
      const setup = createSimpleLexicalTestSetup({
        config: {
          namespace: 'QuickTest'
        }
      })

      const context = setup.getContext()
      
      // 快速驗證配置
      expect(context.config.value.namespace).toBe('QuickTest')
      
      // 測試錯誤處理
      const testError = new Error('Test error')
      context.setError(testError)
      expect(context.error.value).toBe(testError)
    })

    it('簡化測試用於事件測試', async () => {
      const setup = createSimpleLexicalTestSetup()

      await nextTick()

      const context = setup.getContext()
      
      // 測試錯誤事件
      const testError = new Error('Test error')
      context.setError(testError)
      await nextTick()

      const errorEvents = setup.emittedEvents.filter(e => e.event === 'error')
      expect(errorEvents.length).toBeGreaterThan(0)
    })
  })

  describe('createLexicalTestWithConfig - 配置專用測試設置', () => {
    it('基本使用方式：快速創建帶配置的測試', async () => {
      // 使用專用函數創建帶配置的測試
      const setup = createLexicalTestWithConfig({
        namespace: 'ConfigTestEditor',
        editable: false,
        autoFocus: true
      })

      await setup.waitForInitialization()

      const context = setup.getContext()
      
      // 驗證配置
      expect(context.config.value.namespace).toBe('ConfigTestEditor')
      expect(context.config.value.editable).toBe(false)
      expect(context.config.value.autoFocus).toBe(true)
    })

    it('只設置命名空間的測試', async () => {
      const setup = createLexicalTestWithConfig({
        namespace: 'NamespaceOnly'
      })

      await setup.waitForInitialization()

      const context = setup.getContext()
      expect(context.config.value.namespace).toBe('NamespaceOnly')
    })

    it('只設置編輯狀態的測試', async () => {
      const setup = createLexicalTestWithConfig({
        editable: false
      })

      await setup.waitForInitialization()

      const context = setup.getContext()
      expect(context.config.value.editable).toBe(false)
    })

    it('帶其他選項的配置測試', async () => {
      const setup = createLexicalTestWithConfig(
        {
          namespace: 'ConfigWithOptions',
          editable: true
        },
        {
          initialContent: '<p>Config test content</p>'
        }
      )

      await setup.waitForInitialization()

      const context = setup.getContext()
      expect(context.config.value.namespace).toBe('ConfigWithOptions')
      expect(context.config.value.editable).toBe(true)
    })
  })

  describe('createLexicalTestWithContent - 內容專用測試設置', () => {
    it('基本使用方式：快速創建帶初始內容的測試', async () => {
      const initialContent = '<h1>Title</h1><p>Content</p>'
      
      // 使用專用函數創建帶初始內容的測試
      const setup = createLexicalTestWithContent(initialContent)

      await setup.waitForInitialization()

      const context = setup.getContext()
      
      // 驗證編輯器已初始化
      expect(context.editor.value).toBeDefined()
      expect(context.isInitialized.value).toBe(true)
    })

    it('HTML 內容測試', async () => {
      const htmlContent = '<div><h2>Section</h2><ul><li>Item 1</li><li>Item 2</li></ul></div>'
      
      const setup = createLexicalTestWithContent(htmlContent)

      await setup.waitForInitialization()

      const context = setup.getContext()
      expect(context.editor.value).toBeDefined()
    })

    it('Markdown 風格內容測試', async () => {
      const markdownContent = '# Heading\n\n**Bold text**\n\n- List item 1\n- List item 2'
      
      const setup = createLexicalTestWithContent(markdownContent)

      await setup.waitForInitialization()

      const context = setup.getContext()
      expect(context.editor.value).toBeDefined()
    })

    it('帶其他選項的內容測試', async () => {
      const setup = createLexicalTestWithContent(
        '<p>Test content</p>',
        {
          config: {
            namespace: 'ContentWithConfig'
          }
        }
      )

      await setup.waitForInitialization()

      const context = setup.getContext()
      expect(context.config.value.namespace).toBe('ContentWithConfig')
    })
  })

  describe('createLexicalTestWithEmit - 事件專用測試設置', () => {
    it('基本使用方式：快速創建帶自定義事件的測試', async () => {
      const eventLog: any[] = []
      
      // 創建自定義事件處理器
      const customEmit: LexicalEditorEvent = ((event: string, ...args: any[]) => {
        eventLog.push({
          event,
          args,
          timestamp: Date.now(),
          source: 'custom'
        })
      }) as LexicalEditorEvent

      // 使用專用函數創建帶自定義事件的測試
      const setup = createLexicalTestWithEmit(customEmit)

      await setup.waitForInitialization()

      // 驗證自定義事件被觸發
      const initEvents = eventLog.filter(e => e.event === 'init')
      expect(initEvents.length).toBeGreaterThan(0)
      expect(initEvents[0].source).toBe('custom')
    })

    it('事件過濾測試', async () => {
      const errorEvents: any[] = []
      
      const customEmit: LexicalEditorEvent = ((event: string, ...args: any[]) => {
        if (event === 'error') {
          errorEvents.push({ event, args })
        }
      }) as LexicalEditorEvent

      const setup = createLexicalTestWithEmit(customEmit)

      await setup.waitForInitialization()

      const context = setup.getContext()
      
      // 觸發錯誤事件
      const testError = new Error('Test error')
      context.setError(testError)
      await nextTick()

      expect(errorEvents.length).toBeGreaterThan(0)
    })

    it('事件計數測試', async () => {
      let eventCount = 0
      
      const countingEmit: LexicalEditorEvent = ((event: string, ...args: any[]) => {
        eventCount++
      }) as LexicalEditorEvent

      const setup = createLexicalTestWithEmit(countingEmit)

      await setup.waitForInitialization()

      // 驗證事件被計數
      expect(eventCount).toBeGreaterThan(0)
    })

    it('帶其他選項的事件測試', async () => {
      const eventLog: any[] = []
      
      const customEmit: LexicalEditorEvent = ((event: string, ...args: any[]) => {
        eventLog.push({ event, args })
      }) as LexicalEditorEvent

      const setup = createLexicalTestWithEmit(
        customEmit,
        {
          initialContent: '<p>Event test content</p>',
          config: {
            namespace: 'EventTestEditor'
          }
        }
      )

      await setup.waitForInitialization()

      const context = setup.getContext()
      expect(context.config.value.namespace).toBe('EventTestEditor')
      
      const initEvents = eventLog.filter(e => e.event === 'init')
      expect(initEvents.length).toBeGreaterThan(0)
    })
  })

  describe('cleanupLexicalTest - 清理工具', () => {
    it('基本使用方式：清理測試環境', () => {
      // 創建測試設置
      const setup = createLexicalTestSetup()
      
      // 驗證 DOM 元素存在
      const elements = document.querySelectorAll('[data-testid="editor-root"]')
      expect(elements.length).toBeGreaterThan(0)
      
      // 清理環境
      cleanupLexicalTest()
      
      // 驗證 DOM 元素已被清理
      const elementsAfterCleanup = document.querySelectorAll('[data-testid="editor-root"]')
      expect(elementsAfterCleanup.length).toBe(0)
    })

    it('多次清理的安全性', () => {
      // 創建多個測試設置
      const setup1 = createLexicalTestSetup()
      const setup2 = createLexicalTestSetup()
      
      // 驗證多個元素存在
      let elements = document.querySelectorAll('[data-testid="editor-root"]')
      expect(elements.length).toBe(2)
      
      // 第一次清理
      cleanupLexicalTest()
      elements = document.querySelectorAll('[data-testid="editor-root"]')
      expect(elements.length).toBe(0)
      
      // 第二次清理（應該安全）
      cleanupLexicalTest()
      elements = document.querySelectorAll('[data-testid="editor-root"]')
      expect(elements.length).toBe(0)
    })
  })

  describe('實際使用場景示例', () => {
    it('場景1：測試編輯器初始化流程', async () => {
      // 這是測試編輯器初始化流程的完整示例
      const setup = createLexicalTestSetup({
        config: {
          namespace: 'InitTestEditor',
          editable: true,
          autoFocus: false
        }
      })

      // 等待初始化完成
      await setup.waitForInitialization()

      const context = setup.getContext()
      
      // 驗證初始化狀態
      expect(context.editor.value).toBeDefined()
      expect(context.isInitialized.value).toBe(true)
      expect(context.config.value.namespace).toBe('InitTestEditor')
      
      // 驗證事件
      const initEvents = setup.emittedEvents.filter(e => e.event === 'init')
      expect(initEvents.length).toBeGreaterThan(0)
    })

    it('場景2：測試錯誤處理流程', async () => {
      // 這是測試錯誤處理流程的示例
      const setup = createSimpleLexicalTestSetup()

      const context = setup.getContext()
      
      // 模擬錯誤
      const testError = new Error('Simulated error')
      context.setError(testError)
      await nextTick()

      // 驗證錯誤狀態
      expect(context.error.value).toBe(testError)
      
      // 驗證錯誤事件
      const errorEvents = setup.emittedEvents.filter(e => e.event === 'error')
      expect(errorEvents.length).toBeGreaterThan(0)
    })

    it('場景3：測試配置更新流程', async () => {
      // 這是測試配置更新流程的示例
      const setup = createLexicalTestWithConfig({
        namespace: 'OriginalNamespace',
        editable: true
      })

      await setup.waitForInitialization()

      const context = setup.getContext()
      
      // 驗證初始配置
      expect(context.config.value.namespace).toBe('OriginalNamespace')
      expect(context.config.value.editable).toBe(true)
      
      // 更新配置
      context.setConfig({
        namespace: 'UpdatedNamespace',
        editable: false,
        autoFocus: true
      })
      
      // 驗證更新後的配置
      expect(context.config.value.namespace).toBe('UpdatedNamespace')
      expect(context.config.value.editable).toBe(false)
      expect(context.config.value.autoFocus).toBe(true)
    })

    it('場景4：測試清理流程', async () => {
      // 這是測試清理流程的示例
      const setup = createLexicalTestSetup()

      await setup.waitForInitialization()

      const context = setup.getContext()
      
      // 驗證編輯器已初始化
      expect(context.editor.value).toBeDefined()
      
      // 執行清理
      context.cleanup()
      
      // 驗證清理結果
      expect(context.editor.value).toBeNull()
      expect(context.isInitialized.value).toBe(false)
    })

    it('場景5：測試多個編輯器實例', async () => {
      // 這是測試多個編輯器實例的示例
      const setup1 = createLexicalTestWithConfig({
        namespace: 'Editor1'
      })
      
      const setup2 = createLexicalTestWithConfig({
        namespace: 'Editor2'
      })

      await setup1.waitForInitialization()
      await setup2.waitForInitialization()

      const context1 = setup1.getContext()
      const context2 = setup2.getContext()
      
      // 驗證兩個編輯器都有不同的命名空間
      expect(context1.config.value.namespace).toBe('Editor1')
      expect(context2.config.value.namespace).toBe('Editor2')
      
      // 驗證兩個編輯器都正確初始化
      expect(context1.editor.value).toBeDefined()
      expect(context2.editor.value).toBeDefined()
    })
  })

  describe('類型安全示例', () => {
    it('TypeScript 類型檢查示例', () => {
      // 這個測試展示了 TypeScript 類型檢查的使用
      
      // 正確的類型使用
      const setup: LexicalTestSetupReturn = createLexicalTestSetup({
        initialContent: '<p>Type safe content</p>',
        config: {
          namespace: 'TypeSafeEditor',
          editable: true,
          autoFocus: false
        }
      })

      // 驗證返回的類型
      expect(typeof setup.editorRef).toBe('object')
      expect(typeof setup.getContext).toBe('function')
      expect(Array.isArray(setup.emittedEvents)).toBe(true)
      expect(setup.mockElement).toBeInstanceOf(HTMLElement)
      expect(typeof setup.waitForInitialization).toBe('function')
    })

    it('配置選項類型檢查', () => {
      // 這個測試展示了配置選項的類型檢查
      const options: LexicalTestSetupOptions = {
        initialContent: '<p>Content</p>',
        config: {
          namespace: 'TypeCheckEditor',
          editable: true,
          autoFocus: false
        }
      }

      const setup = createLexicalTestSetup(options)
      
      expect(setup).toBeDefined()
      expect(setup.getContext).toBeDefined()
    })
  })
})
