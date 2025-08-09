import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LexicalToolbar from '@/components/LexicalToolbar.vue'

// Mock Lexical 编辑器
const mockEditor = {
  dispatchCommand: vi.fn(),
  update: vi.fn(),
  registerUpdateListener: vi.fn(() => () => {}),
  getEditorState: vi.fn(() => ({
    read: vi.fn()
  }))
}

// Mock 命令函数
vi.mock('@/utils/lexicalCommands', () => ({
  formatText: vi.fn(),
  setBlockType: vi.fn(),
  insertBulletList: vi.fn(),
  insertNumberedList: vi.fn(),
  toggleLink: vi.fn(),
  clearFormatting: vi.fn(),
  undo: vi.fn(),
  redo: vi.fn(),
  registerSelectionListener: vi.fn(() => () => {}),
  isInList: vi.fn(() => ({ isInList: false }))
}))

describe('LexicalToolbar 组件测试', () => {
  let wrapper: any

  beforeEach(() => {
    // 清理 mock 调用
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('组件渲染', () => {
    it('应该正确渲染工具栏', () => {
      wrapper = mount(LexicalToolbar, {
        props: {
          editor: mockEditor
        }
      })

      expect(wrapper.find('.lexical-toolbar').exists()).toBe(true)
    })

    it('应该渲染所有格式化按钮', () => {
      wrapper = mount(LexicalToolbar, {
        props: {
          editor: mockEditor
        }
      })

      // 检查格式化按钮
      expect(wrapper.find('button[title*="粗体"]').exists()).toBe(true)
      expect(wrapper.find('button[title*="斜体"]').exists()).toBe(true)
      expect(wrapper.find('button[title*="下划线"]').exists()).toBe(true)
      expect(wrapper.find('button[title*="删除线"]').exists()).toBe(true)
      expect(wrapper.find('button[title*="行内代码"]').exists()).toBe(true)
    })

    it('应该渲染块类型选择器', () => {
      wrapper = mount(LexicalToolbar, {
        props: {
          editor: mockEditor
        }
      })

      const select = wrapper.find('select.toolbar-select')
      expect(select.exists()).toBe(true)
      
      // 检查选项
      const options = select.findAll('option')
      expect(options.length).toBeGreaterThan(0)
      expect(options.some((option: any) => option.text() === '段落')).toBe(true)
      expect(options.some((option: any) => option.text() === '标题 1')).toBe(true)
    })

    it('应该渲染列表按钮', () => {
      wrapper = mount(LexicalToolbar, {
        props: {
          editor: mockEditor
        }
      })

      expect(wrapper.find('button[title*="无序列表"]').exists()).toBe(true)
      expect(wrapper.find('button[title*="有序列表"]').exists()).toBe(true)
    })

    it('应该渲染历史操作按钮', () => {
      wrapper = mount(LexicalToolbar, {
        props: {
          editor: mockEditor
        }
      })

      expect(wrapper.find('button[title*="撤销"]').exists()).toBe(true)
      expect(wrapper.find('button[title*="重做"]').exists()).toBe(true)
    })
  })

  describe('格式化功能', () => {
    it('应该能够触发粗体格式化', async () => {
      const { formatText } = await import('@/utils/lexicalCommands')
      
      wrapper = mount(LexicalToolbar, {
        props: {
          editor: mockEditor
        }
      })

      const boldButton = wrapper.find('button[title*="粗体"]')
      await boldButton.trigger('click')

      expect(formatText).toHaveBeenCalledWith(mockEditor, 'bold')
    })

    it('应该能够触发斜体格式化', async () => {
      const { formatText } = await import('@/utils/lexicalCommands')
      
      wrapper = mount(LexicalToolbar, {
        props: {
          editor: mockEditor
        }
      })

      const italicButton = wrapper.find('button[title*="斜体"]')
      await italicButton.trigger('click')

      expect(formatText).toHaveBeenCalledWith(mockEditor, 'italic')
    })

    it('应该能够清除格式', async () => {
      const { clearFormatting } = await import('@/utils/lexicalCommands')
      
      wrapper = mount(LexicalToolbar, {
        props: {
          editor: mockEditor
        }
      })

      const clearButton = wrapper.find('button[title*="清除格式"]')
      await clearButton.trigger('click')

      expect(clearFormatting).toHaveBeenCalledWith(mockEditor)
    })
  })

  describe('块类型功能', () => {
    it('应该能够改变块类型', async () => {
      const { setBlockType } = await import('@/utils/lexicalCommands')
      
      wrapper = mount(LexicalToolbar, {
        props: {
          editor: mockEditor
        }
      })

      const select = wrapper.find('select.toolbar-select')
      await select.setValue('h1')
      await select.trigger('change')

      expect(setBlockType).toHaveBeenCalledWith(mockEditor, 'h1')
    })
  })

  describe('列表功能', () => {
    it('应该能够插入无序列表', async () => {
      const { insertBulletList } = await import('@/utils/lexicalCommands')
      
      wrapper = mount(LexicalToolbar, {
        props: {
          editor: mockEditor
        }
      })

      const bulletListButton = wrapper.find('button[title*="无序列表"]')
      await bulletListButton.trigger('click')

      expect(insertBulletList).toHaveBeenCalledWith(mockEditor)
    })

    it('应该能够插入有序列表', async () => {
      const { insertNumberedList } = await import('@/utils/lexicalCommands')
      
      wrapper = mount(LexicalToolbar, {
        props: {
          editor: mockEditor
        }
      })

      const numberedListButton = wrapper.find('button[title*="有序列表"]')
      await numberedListButton.trigger('click')

      expect(insertNumberedList).toHaveBeenCalledWith(mockEditor)
    })
  })

  describe('历史操作功能', () => {
    it('应该能够撤销', async () => {
      const { undo } = await import('@/utils/lexicalCommands')
      
      wrapper = mount(LexicalToolbar, {
        props: {
          editor: mockEditor
        }
      })

      const undoButton = wrapper.find('button[title*="撤销"]')
      await undoButton.trigger('click')

      expect(undo).toHaveBeenCalledWith(mockEditor)
    })

    it('应该能够重做', async () => {
      const { redo } = await import('@/utils/lexicalCommands')
      
      wrapper = mount(LexicalToolbar, {
        props: {
          editor: mockEditor
        }
      })

      const redoButton = wrapper.find('button[title*="重做"]')
      await redoButton.trigger('click')

      expect(redo).toHaveBeenCalledWith(mockEditor)
    })
  })

  describe('链接功能', () => {
    it('应该能够插入链接', async () => {
      const { toggleLink } = await import('@/utils/lexicalCommands')
      
      wrapper = mount(LexicalToolbar, {
        props: {
          editor: mockEditor
        }
      })

      const linkButton = wrapper.find('button[title*="插入链接"]')
      await linkButton.trigger('click')

      expect(toggleLink).toHaveBeenCalledWith(mockEditor)
    })
  })

  describe('快捷键功能', () => {
    it('应该响应 Ctrl+B 快捷键', async () => {
      const { formatText } = await import('@/utils/lexicalCommands')
      
      wrapper = mount(LexicalToolbar, {
        props: {
          editor: mockEditor
        }
      })

      // 模拟 Ctrl+B 按键
      const event = new KeyboardEvent('keydown', {
        key: 'b',
        ctrlKey: true,
        bubbles: true
      })
      
      document.dispatchEvent(event)
      
      // 等待事件处理
      await wrapper.vm.$nextTick()

      expect(formatText).toHaveBeenCalledWith(mockEditor, 'bold')
    })

    it('应该响应 Ctrl+I 快捷键', async () => {
      const { formatText } = await import('@/utils/lexicalCommands')
      
      wrapper = mount(LexicalToolbar, {
        props: {
          editor: mockEditor
        }
      })

      // 模拟 Ctrl+I 按键
      const event = new KeyboardEvent('keydown', {
        key: 'i',
        ctrlKey: true,
        bubbles: true
      })
      
      document.dispatchEvent(event)
      
      // 等待事件处理
      await wrapper.vm.$nextTick()

      expect(formatText).toHaveBeenCalledWith(mockEditor, 'italic')
    })

    it('应该响应 Ctrl+Z 撤销快捷键', async () => {
      const { undo } = await import('@/utils/lexicalCommands')
      
      wrapper = mount(LexicalToolbar, {
        props: {
          editor: mockEditor
        }
      })

      // 模拟 Ctrl+Z 按键
      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        bubbles: true
      })
      
      document.dispatchEvent(event)
      
      // 等待事件处理
      await wrapper.vm.$nextTick()

      expect(undo).toHaveBeenCalledWith(mockEditor)
    })
  })

  describe('状态管理', () => {
    it('应该注册选择监听器', () => {
      const { registerSelectionListener } = require('@/utils/lexicalCommands')
      
      wrapper = mount(LexicalToolbar, {
        props: {
          editor: mockEditor
        }
      })

      expect(registerSelectionListener).toHaveBeenCalledWith(
        mockEditor,
        expect.any(Function)
      )
    })

    it('应该在卸载时清理监听器', () => {
      const cleanupFn = vi.fn()
      const { registerSelectionListener } = require('@/utils/lexicalCommands')
      registerSelectionListener.mockReturnValue(cleanupFn)
      
      wrapper = mount(LexicalToolbar, {
        props: {
          editor: mockEditor
        }
      })

      wrapper.unmount()

      expect(cleanupFn).toHaveBeenCalled()
    })
  })

  describe('错误处理', () => {
    it('应该处理没有编辑器的情况', () => {
      wrapper = mount(LexicalToolbar, {
        props: {
          editor: null
        }
      })

      // 组件应该正常渲染但按钮不应该工作
      expect(wrapper.find('.lexical-toolbar').exists()).toBe(true)
      
      // 点击按钮不应该抛出错误
      const boldButton = wrapper.find('button[title*="粗体"]')
      expect(async () => {
        await boldButton.trigger('click')
      }).not.toThrow()
    })
  })
})
