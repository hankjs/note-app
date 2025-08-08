import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import LexicalEditor from '../../../src/renderer/src/components/LexicalEditor.vue'

// 模拟 lexicalSimpleTest
const mockLexicalTest = {
  setRootElement: vi.fn(),
  updateContent: vi.fn(),
  getState: vi.fn(() => ({ root: { children: [] } })),
  focus: vi.fn()
}

// 模拟全局 window 对象
Object.defineProperty(window, 'lexicalTest', {
  value: mockLexicalTest,
  writable: true
})

describe('LexicalEditor 组件测试', () => {
  let wrapper: any

  beforeEach(() => {
    // 重置模拟函数
    vi.clearAllMocks()
    
    // 创建组件包装器
    wrapper = mount(LexicalEditor, {
      props: {
        modelValue: '初始内容',
        showDebug: true
      },
      global: {
        stubs: {
          // 模拟 DOM 元素
          div: {
            template: '<div><slot /></div>',
            props: ['ref', 'class', 'contenteditable']
          }
        }
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('组件初始化', () => {
    it('应该能够正确挂载组件', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.lexical-editor').exists()).toBe(true)
    })

    it('应该能够渲染编辑器容器', () => {
      const editorContainer = wrapper.find('.editor-container')
      expect(editorContainer.exists()).toBe(true)
      expect(editorContainer.attributes('contenteditable')).toBe('true')
    })

    it('应该能够显示调试信息', async () => {
      await nextTick()
      const debugInfo = wrapper.find('.debug-info')
      expect(debugInfo.exists()).toBe(true)
      expect(debugInfo.text()).toContain('调试信息')
    })
  })

  describe('Props 处理', () => {
    it('应该能够接收 modelValue prop', () => {
      const wrapper = mount(LexicalEditor, {
        props: {
          modelValue: '测试内容'
        }
      })
      
      expect(wrapper.props('modelValue')).toBe('测试内容')
      wrapper.unmount()
    })

    it('应该能够接收 config prop', () => {
      const config = { namespace: 'TestEditor' }
      const wrapper = mount(LexicalEditor, {
        props: {
          config
        }
      })
      
      expect(wrapper.props('config')).toEqual(config)
      wrapper.unmount()
    })

    it('应该能够接收 showDebug prop', () => {
      const wrapper = mount(LexicalEditor, {
        props: {
          showDebug: true
        }
      })
      
      expect(wrapper.props('showDebug')).toBe(true)
      wrapper.unmount()
    })
  })

  describe('事件处理', () => {
    it('应该能够触发 update:modelValue 事件', async () => {
      const wrapper = mount(LexicalEditor, {
        props: {
          modelValue: '初始内容'
        }
      })

      // 模拟内容更新
      await wrapper.vm.updateContent('新内容')
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['新内容'])
      
      wrapper.unmount()
    })

    it('应该能够触发 change 事件', async () => {
      const wrapper = mount(LexicalEditor, {
        props: {
          modelValue: '初始内容'
        }
      })

      // 模拟内容更新
      await wrapper.vm.updateContent('新内容')
      
      expect(wrapper.emitted('change')).toBeTruthy()
      expect(wrapper.emitted('change')[0]).toEqual(['新内容'])
      
      wrapper.unmount()
    })

    it('应该能够触发 focus 事件', async () => {
      const wrapper = mount(LexicalEditor)

      // 模拟聚焦
      await wrapper.vm.focus()
      
      expect(wrapper.emitted('focus')).toBeTruthy()
      
      wrapper.unmount()
    })
  })

  describe('方法测试', () => {
    it('应该能够调用 updateContent 方法', async () => {
      const newContent = '更新的内容'
      await wrapper.vm.updateContent(newContent)
      
      expect(mockLexicalTest.updateContent).toHaveBeenCalledWith(newContent)
    })

    it('应该能够调用 getState 方法', async () => {
      const state = await wrapper.vm.getState()
      
      expect(mockLexicalTest.getState).toHaveBeenCalled()
      expect(state).toEqual({ root: { children: [] } })
    })

    it('应该能够调用 focus 方法', async () => {
      await wrapper.vm.focus()
      
      expect(mockLexicalTest.focus).toHaveBeenCalled()
    })

    it('应该能够调用 setRootElement 方法', async () => {
      const element = document.createElement('div')
      await wrapper.vm.setRootElement(element)
      
      expect(mockLexicalTest.setRootElement).toHaveBeenCalledWith(element)
    })
  })

  describe('生命周期', () => {
    it('应该在挂载时初始化编辑器', async () => {
      await nextTick()
      
      // 等待 setTimeout 执行
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(mockLexicalTest.setRootElement).toHaveBeenCalled()
    })

    it('应该在卸载时清理资源', async () => {
      const consoleSpy = vi.spyOn(console, 'log')
      
      wrapper.unmount()
      
      expect(consoleSpy).toHaveBeenCalledWith('LexicalEditor: 组件已卸载')
    })
  })

  describe('响应式数据', () => {
    it('应该能够响应 modelValue 变化', async () => {
      const wrapper = mount(LexicalEditor, {
        props: {
          modelValue: '初始内容'
        }
      })

      // 更新 prop
      await wrapper.setProps({ modelValue: '新内容' })
      
      expect(mockLexicalTest.updateContent).toHaveBeenCalledWith('新内容')
      
      wrapper.unmount()
    })

    it('应该能够同步内容到父组件', async () => {
      const wrapper = mount(LexicalEditor, {
        props: {
          modelValue: '初始内容'
        }
      })

      // 模拟内部内容更新
      await wrapper.vm.updateContent('内部更新')
      
      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['内部更新'])
      
      wrapper.unmount()
    })
  })

  describe('错误处理', () => {
    it('应该能够处理编辑器初始化错误', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error')
      mockLexicalTest.setRootElement.mockImplementation(() => {
        throw new Error('初始化错误')
      })

      const wrapper = mount(LexicalEditor)
      
      // 等待初始化
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('LexicalEditor: 编辑器元素未找到')
      
      wrapper.unmount()
    })
  })

  describe('样式测试', () => {
    it('应该应用正确的 CSS 类', () => {
      const editorContainer = wrapper.find('.editor-container')
      expect(editorContainer.classes()).toContain('editor-container')
    })

    it('应该设置正确的 contenteditable 属性', () => {
      const editorContainer = wrapper.find('.editor-container')
      expect(editorContainer.attributes('contenteditable')).toBe('true')
    })
  })
})
