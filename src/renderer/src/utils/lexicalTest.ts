import { createEditor, $getRoot, $createParagraphNode, $createTextNode } from 'lexical'
import { registerRichText, HeadingNode, QuoteNode } from '@lexical/rich-text'
import { registerHistory, createEmptyHistoryState } from '@lexical/history'
import { mergeRegister } from '@lexical/utils'

// 创建编辑器配置
const initialConfig = {
  namespace: 'Test Editor',
  nodes: [HeadingNode, QuoteNode],
  onError: (error: Error) => {
    console.error('Lexical Editor Error:', error)
  },
  theme: {
    quote: 'PlaygroundEditorTheme__quote',
  },
}

// 创建编辑器实例
const editor = createEditor(initialConfig)

// 注册插件
mergeRegister(
  registerRichText(editor),
  registerHistory(editor, createEmptyHistoryState(), 300)
)

// 监听编辑器更新
editor.registerUpdateListener(({ editorState }) => {
  console.log('Editor updated:', editorState.toJSON())
})

// 初始化内容
editor.update(() => {
  const root = $getRoot()
  if (root.getFirstChild() === null) {
    const paragraph = $createParagraphNode()
    const text = $createTextNode('Hello, Lexical!')
    paragraph.append(text)
    root.append(paragraph)
  }
})

// 导出编辑器实例供测试使用
export { editor }

// 测试函数
export function testEditor() {
  console.log('Testing Lexical Editor...')
  
  // 测试添加内容
  editor.update(() => {
    const root = $getRoot()
    const paragraph = $createParagraphNode()
    const text = $createTextNode('This is a test paragraph.')
    paragraph.append(text)
    root.append(paragraph)
  })
  
  console.log('Test completed')
}

// 测试设置根元素
export function setRootElement(element: HTMLElement) {
  editor.setRootElement(element)
  console.log('Root element set:', element)
}

// 测试获取编辑器状态
export function getEditorState() {
  return editor.getEditorState()
}

// 测试更新内容
export function updateContent(content: string) {
  editor.update(() => {
    const root = $getRoot()
    root.clear()
    
    const paragraph = $createParagraphNode()
    const text = $createTextNode(content)
    paragraph.append(text)
    root.append(paragraph)
  })
}
