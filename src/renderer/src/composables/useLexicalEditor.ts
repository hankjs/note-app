import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { 
  createEditor, 
  LexicalEditor, 
  EditorState,
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  $isRootNode,
  $isParagraphNode,
  $isTextNode,
  TextNode,
  ParagraphNode
} from 'lexical'
import { 
  HeadingNode, 
  QuoteNode
} from '@lexical/rich-text'
import { CodeNode, CodeHighlightNode } from '@lexical/code'
import { registerCodeHighlighting } from '@lexical/code-shiki'
import { registerHistory, createEmptyHistoryState } from '@lexical/history'
import { ListItemNode, ListNode } from '@lexical/list'
import { LinkNode, AutoLinkNode } from '@lexical/link'
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table'
import { mergeRegister } from '@lexical/utils'

import type { 
  LexicalEditorConfig, 
  UseLexicalEditorReturn
} from '@/types/lexical'
import { editorStateToText, textToEditorState, createDefaultContent } from '@/utils/lexicalUtils'
import { createLexicalTheme, watchThemeChange, applyThemeToEditor } from '@/utils/lexicalTheme'
import { initializeEditorCommands } from '@/utils/lexicalCommands'

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
    console.log('useLexicalEditor: 开始创建编辑器实例')
    
    if (editor.value) {
      console.log('useLexicalEditor: 清理现有编辑器')
      // 清理现有编辑器
      editor.value = null
    }

    try {
      // 创建编辑器配置 - 使用最简单的配置
      const initialConfig = {
        namespace: defaultConfig.namespace,
        nodes: [
          // 基本节点类型 - 这些是必需的
          TextNode,
          ParagraphNode,
          HeadingNode, 
          QuoteNode, 
          CodeNode, 
          CodeHighlightNode,
          // 添加基本的文本和段落节点
          ListNode,
          ListItemNode,
          LinkNode,
          AutoLinkNode,
          TableNode,
          TableCellNode,
          TableRowNode
        ],
        theme: createLexicalTheme(),
        onError: (error: Error) => {
          console.error('Lexical Editor Error:', error)
          errorCallbacks.value.forEach(callback => callback(error))
        },
        editable: defaultConfig.editable,
        // 添加选择插件配置
        selection: {
          anchor: { key: 'root', offset: 0, type: 'text' },
          focus: { key: 'root', offset: 0, type: 'text' }
        }
      }

      console.log('useLexicalEditor: 编辑器配置:', initialConfig)

      // 创建编辑器
      const newEditor = createEditor(initialConfig)
      console.log('useLexicalEditor: 编辑器实例创建成功')

      // 注册基本插件
      mergeRegister(
        registerHistory(newEditor, createEmptyHistoryState(), 300)
      )
      console.log('useLexicalEditor: 插件注册完成')

      // 监听编辑器更新
      newEditor.registerUpdateListener(({ editorState: newEditorState }) => {
        console.log('useLexicalEditor: 编辑器状态更新')
        editorState.value = newEditorState
        
        // 使用工具函数转换编辑器状态为文本
        content.value = editorStateToText(newEditorState)
        
        // 触发更新回调
        updateCallbacks.value.forEach(callback => callback(newEditorState))
      })

      // 初始化内容
      createDefaultContent(newEditor)
      console.log('useLexicalEditor: 默认内容创建完成')

      editor.value = newEditor

      // 自动聚焦
      if (defaultConfig.autoFocus) {
        nextTick(() => {
          newEditor.focus()
        })
      }
      
      console.log('useLexicalEditor: 编辑器实例创建完成')
    } catch (error) {
      console.error('useLexicalEditor: 创建编辑器实例失败:', error)
    }
  }

  // 更新内容
  const updateContent = (newContent: string) => {
    if (!editor.value) return
    textToEditorState(editor.value, newContent)
  }

  // 设置编辑器状态
  const setEditorState = (state: EditorState) => {
    if (!editor.value) return
    editor.value.setEditorState(state)
  }

  // 设置根元素
  const setRootElement = (element: HTMLElement) => {
    // 如果编辑器实例不存在，先创建它
    if (!editor.value) {
      console.log('useLexicalEditor: 编辑器实例不存在，先创建编辑器')
      createEditorInstance()
      // 等待编辑器创建完成
      setTimeout(() => {
        if (editor.value) {
          try {
            console.log('useLexicalEditor: 设置根元素:', element)
            editor.value.setRootElement(element)
            console.log('useLexicalEditor: 根元素设置成功')
            
            // 强制重新绑定事件监听器
            setTimeout(() => {
              if (editor.value) {
                try {
                  // 尝试聚焦编辑器
                  editor.value.focus()
                  console.log('useLexicalEditor: 编辑器聚焦成功')
                  
                  // 强制重新绑定事件监听器
                  editor.value.update(() => {
                    console.log('useLexicalEditor: 强制更新编辑器状态')
                  })
                  
                  // 验证编辑器可以接收输入
                  console.log('useLexicalEditor: 验证编辑器状态...')
                  const state = editor.value.getEditorState()
                  console.log('useLexicalEditor: 编辑器状态:', state.toJSON())
                  
                  // 检查编辑器的选择状态
                  const selection = state._selection
                  console.log('useLexicalEditor: 编辑器选择状态:', selection)
                  
                  console.log('useLexicalEditor: 事件监听器重新绑定完成')
                } catch (error) {
                  console.error('useLexicalEditor: 编辑器验证失败:', error)
                }
              }
            }, 100)
          } catch (error) {
            console.error('useLexicalEditor: 设置根元素失败:', error)
          }
        }
      }, 100)
      return
    }
    
    try {
      console.log('useLexicalEditor: 设置根元素:', element)
      editor.value.setRootElement(element)
      console.log('useLexicalEditor: 根元素设置成功')
      
      // 强制重新绑定事件监听器
      setTimeout(() => {
        if (editor.value) {
          try {
            // 尝试聚焦编辑器
            editor.value.focus()
            console.log('useLexicalEditor: 编辑器聚焦成功')
            
            // 强制重新绑定事件监听器
            editor.value.update(() => {
              console.log('useLexicalEditor: 强制更新编辑器状态')
            })
            
            // 验证编辑器可以接收输入
            console.log('useLexicalEditor: 验证编辑器状态...')
            const state = editor.value.getEditorState()
            console.log('useLexicalEditor: 编辑器状态:', state.toJSON())
            
            // 检查编辑器的选择状态
            const selection = state._selection
            console.log('useLexicalEditor: 编辑器选择状态:', selection)
            
            console.log('useLexicalEditor: 事件监听器重新绑定完成')
          } catch (error) {
            console.error('useLexicalEditor: 编辑器验证失败:', error)
          }
        }
      }, 100)
    } catch (error) {
      console.error('useLexicalEditor: 设置根元素失败:', error)
    }
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
    // 编辑器现在会在 setRootElement 时创建，这里只监听主题变化
    // 监听主题变化
    watchThemeChange(() => {
      if (editor.value) {
        applyThemeToEditor(editor.value)
      }
    })
  })

  // 组件卸载时销毁编辑器
  onUnmounted(() => {
    destroy()
    // 清理 observer 如果需要，但 watchThemeChange 返回 MutationObserver，可以 disconnect
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
