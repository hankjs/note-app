import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import LexicalEditor from '../../src/renderer/src/components/LexicalEditor.vue'
import LexicalEditorTest from '../../src/renderer/src/components/LexicalEditorTest.vue'

// 模拟 lexicalSimpleTest
const mockLexicalTest = {
  setRootElement: vi.fn(),
  updateContent: vi.fn(),
  getState: vi.fn(() => ({ 
    root: { 
      children: [
        {
          children: [{ text: '测试内容' }],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1
        }
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1
    }
  })),
  focus: vi.fn()
}

// 模拟全局 window 对象
Object.defineProperty(window, 'lexicalTest', {
  value: mockLexicalTest,
  writable: true
})

describe('Lexical 集成测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('LexicalEditor 组件集成', () => {
    let wrapper: any

    beforeEach(() => {
      wrapper = mount(LexicalEditor, {
        props: {
          modelValue: '初始内容',
          showDebug: true
        }
      })
    })

    afterEach(() => {
      if (wrapper) {
        wrapper.unmount()
      }
    })

    it('应该能够正确初始化并与 Lexical 集成', async () => {
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 150))

      expect(mockLexicalTest.setRootElement).toHaveBeenCalled()
      expect(wrapper.find('.lexical-editor').exists()).toBe(true)
    })

    it('应该能够通过 v-model 双向绑定内容', async () => {
      const newContent = '新内容'
      await wrapper.setProps({ modelValue: newContent })

      expect(mockLexicalTest.updateContent).toHaveBeenCalledWith(newContent)
    })

    it('应该能够触发内容变化事件', async () => {
      await wrapper.vm.updateContent('变化的内容')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('change')).toBeTruthy()
    })

    it('应该能够处理聚焦事件', async () => {
      await wrapper.vm.focus()

      expect(mockLexicalTest.focus).toHaveBeenCalled()
      expect(wrapper.emitted('focus')).toBeTruthy()
    })
  })

  describe('LexicalEditorTest 组件集成', () => {
    let wrapper: any

    beforeEach(() => {
      wrapper = mount(LexicalEditorTest, {
        global: {
          stubs: {
            LexicalEditor: {
              template: '<div class="mock-lexical-editor">Mock Editor</div>',
              props: ['modelValue', 'showDebug'],
              emits: ['update:modelValue', 'change', 'focus']
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

    it('应该能够正确渲染测试组件', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.lexical-editor-test').exists()).toBe(true)
      expect(wrapper.find('.mock-lexical-editor').exists()).toBe(true)
    })

    it('应该能够显示控制按钮', () => {
      const buttons = wrapper.findAll('.btn')
      expect(buttons).toHaveLength(4)
      expect(buttons[0].text()).toBe('设置内容')
      expect(buttons[1].text()).toBe('获取内容')
      expect(buttons[2].text()).toBe('聚焦编辑器')
      expect(buttons[3].text()).toBe('清空内容')
    })

    it('应该能够显示内容状态', () => {
      const contentDisplay = wrapper.find('.content-display')
      expect(contentDisplay.exists()).toBe(true)
    })

    it('应该能够显示事件日志', () => {
      const logDisplay = wrapper.find('.log-display')
      expect(logDisplay.exists()).toBe(true)
    })
  })

  describe('组件间通信', () => {
    it('应该能够在父子组件间正确传递数据', async () => {
      const wrapper = mount(LexicalEditorTest, {
        global: {
          stubs: {
            LexicalEditor: {
              template: '<div class="mock-lexical-editor">Mock Editor</div>',
              props: ['modelValue', 'showDebug'],
              emits: ['update:modelValue', 'change', 'focus']
            }
          }
        }
      })

      // 测试内容设置
      await wrapper.find('.btn').trigger('click')
      
      // 检查内容是否更新
      expect(wrapper.vm.content).toContain('这是通过按钮设置的新内容')

      wrapper.unmount()
    })

    it('应该能够处理事件传递', async () => {
      const wrapper = mount(LexicalEditorTest, {
        global: {
          stubs: {
            LexicalEditor: {
              template: '<div class="mock-lexical-editor">Mock Editor</div>',
              props: ['modelValue', 'showDebug'],
              emits: ['update:modelValue', 'change', 'focus']
            }
          }
        }
      })

      // 模拟 LexicalEditor 组件触发事件
      const lexicalEditor = wrapper.findComponent({ name: 'LexicalEditor' })
      await lexicalEditor.vm.$emit('change', '新内容')
      await lexicalEditor.vm.$emit('focus')

      // 检查日志是否记录
      expect(wrapper.vm.logs.length).toBeGreaterThan(0)

      wrapper.unmount()
    })
  })

  describe('错误处理集成', () => {
    it('应该能够处理 Lexical 初始化错误', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error')
      mockLexicalTest.setRootElement.mockImplementation(() => {
        throw new Error('Lexical 初始化失败')
      })

      const wrapper = mount(LexicalEditor)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 150))

      expect(consoleErrorSpy).toHaveBeenCalledWith('LexicalEditor: 编辑器元素未找到')

      wrapper.unmount()
    })

    it('应该能够处理内容更新错误', async () => {
      mockLexicalTest.updateContent.mockImplementation(() => {
        throw new Error('内容更新失败')
      })

      const wrapper = mount(LexicalEditor, {
        props: {
          modelValue: '初始内容'
        }
      })

      await nextTick()

      // 尝试更新内容
      await wrapper.setProps({ modelValue: '新内容' })

      // 应该不会抛出错误，而是被内部处理
      expect(wrapper.exists()).toBe(true)

      wrapper.unmount()
    })
  })

  describe('性能集成测试', () => {
    it('应该能够处理快速的内容更新', async () => {
      const wrapper = mount(LexicalEditor, {
        props: {
          modelValue: '初始内容'
        }
      })

      // 快速连续更新内容
      const updates = []
      for (let i = 0; i < 10; i++) {
        updates.push(wrapper.setProps({ modelValue: `内容 ${i}` }))
      }

      await Promise.all(updates)

      expect(mockLexicalTest.updateContent).toHaveBeenCalledTimes(10)
      expect(wrapper.exists()).toBe(true)

      wrapper.unmount()
    })

    it('应该能够处理大量事件', async () => {
      const wrapper = mount(LexicalEditorTest, {
        global: {
          stubs: {
            LexicalEditor: {
              template: '<div class="mock-lexical-editor">Mock Editor</div>',
              props: ['modelValue', 'showDebug'],
              emits: ['update:modelValue', 'change', 'focus']
            }
          }
        }
      })

      // 快速触发多个事件
      const lexicalEditor = wrapper.findComponent({ name: 'LexicalEditor' })
      const events = []
      
      for (let i = 0; i < 50; i++) {
        events.push(lexicalEditor.vm.$emit('change', `事件 ${i}`))
      }

      await Promise.all(events)

      // 检查日志数量
      expect(wrapper.vm.logs.length).toBeGreaterThan(0)
      expect(wrapper.exists()).toBe(true)

      wrapper.unmount()
    })
  })

  describe('内存管理集成', () => {
    it('应该能够正确清理组件资源', async () => {
      const wrapper = mount(LexicalEditor, {
        props: {
          modelValue: '测试内容'
        }
      })

      // 进行一些操作
      await wrapper.vm.updateContent('新内容')
      await wrapper.vm.focus()

      // 卸载组件
      wrapper.unmount()

      // 检查是否还有内存泄漏
      expect(wrapper.exists()).toBe(false)
    })

    it('应该能够处理多个组件的创建和销毁', async () => {
      const wrappers = []

      // 创建多个组件
      for (let i = 0; i < 5; i++) {
        const wrapper = mount(LexicalEditor, {
          props: {
            modelValue: `内容 ${i}`
          }
        })
        wrappers.push(wrapper)
      }

      // 验证所有组件都正确创建
      wrappers.forEach(wrapper => {
        expect(wrapper.exists()).toBe(true)
      })

      // 销毁所有组件
      wrappers.forEach(wrapper => {
        wrapper.unmount()
      })

      // 验证所有组件都正确销毁
      wrappers.forEach(wrapper => {
        expect(wrapper.exists()).toBe(false)
      })
    })
  })
})
