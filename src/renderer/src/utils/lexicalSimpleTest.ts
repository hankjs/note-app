// 最简单的 Lexical 编辑器测试
// 这个文件可以直接在浏览器控制台中运行

import { createEditor, $getRoot, $createParagraphNode, $createTextNode } from 'lexical'
import { registerRichText, HeadingNode, QuoteNode } from '@lexical/rich-text'
import { registerHistory, createEmptyHistoryState } from '@lexical/history'
import { 
  registerList, 
  ListNode, 
  ListItemNode 
} from '@lexical/list'
import { 
  LinkNode 
} from '@lexical/link'
import { mergeRegister } from '@lexical/utils'

// 创建编辑器
const editor = createEditor({
  namespace: 'Simple Test',
  nodes: [
    HeadingNode, 
    QuoteNode, 
    ListNode, 
    ListItemNode, 
    LinkNode
  ],
  onError: (error: Error) => {
    console.error('Editor Error:', error)
  }
})

// 注册插件
mergeRegister(
  registerRichText(editor),
  registerHistory(editor, createEmptyHistoryState(), 300),
  registerList(editor)
  // 注意：@lexical/link 不需要单独的注册函数，只需要添加 LinkNode 到节点列表
)

// 监听更新
editor.registerUpdateListener(({ editorState }) => {
  console.log('Editor State:', editorState.toJSON())
})

// 初始化内容
editor.update(() => {
  const root = $getRoot()
  const paragraph = $createParagraphNode()
  const text = $createTextNode('Hello, Lexical!')
  paragraph.append(text)
  root.append(paragraph)
})

// 导出到全局对象，方便在控制台中使用
declare global {
  interface Window {
    lexicalEditor: any
    lexicalTest: any
  }
}

window.lexicalEditor = editor
window.lexicalTest = {
  setRootElement: (element: HTMLElement) => {
    editor.setRootElement(element)
    console.log('Root element set to:', element)
  },
  updateContent: (content: string) => {
    editor.update(() => {
      const root = $getRoot()
      root.clear()
      const paragraph = $createParagraphNode()
      const text = $createTextNode(content)
      paragraph.append(text)
      root.append(paragraph)
    })
    console.log('Content updated to:', content)
  },
  getState: () => {
    return editor.getEditorState().toJSON()
  },
  focus: () => {
    editor.focus()
    console.log('Editor focused')
  }
}

console.log('Lexical 编辑器已创建，可以使用以下命令测试：')
console.log('- lexicalTest.setRootElement(element) - 设置根元素')
console.log('- lexicalTest.updateContent("text") - 更新内容')
console.log('- lexicalTest.getState() - 获取状态')
console.log('- lexicalTest.focus() - 聚焦编辑器')
