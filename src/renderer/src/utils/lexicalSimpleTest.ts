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
import {
  selectTextByContent,
  selectTextByRange,
  selectAllText,
  clearSelection,
  applyFormatToSelection,
  applyFormatToText,
  applyFormatToRange,
  insertFormattedText,
  findAndFormatText,
  batchFormatTexts,
  getSelectionInfo,
  canApplyFormat
} from './lexicalCommands'

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
  },
  // 添加命令分发方法
  dispatchCommand: (command: any, payload?: any) => {
    try {
      console.log('Dispatching command:', command, 'payload:', payload)
      return editor.dispatchCommand(command, payload)
    } catch (error) {
      console.error('Failed to dispatch command:', error)
      return false
    }
  },
  // 添加编辑器更新方法
  update: (fn: () => void) => {
    try {
      return editor.update(fn)
    } catch (error) {
      console.error('Failed to update editor:', error)
    }
  },
  // 获取编辑器实例
  getEditor: () => editor,
  
  // ==================== 新增 API ====================
  
  // 文本选择 API
  getSelectedText: () => {
    let selectedText = ''
    editor.getEditorState().read(() => {
      const selection = editor.getEditorState()._selection
      if (selection && selection.getTextContent) {
        selectedText = selection.getTextContent()
      }
    })
    return selectedText
  },
  
  selectTextByContent: (searchText: string, startIndex: number = 0) => {
    return selectTextByContent(editor, searchText, startIndex)
  },
  
  selectTextByRange: (startOffset: number, endOffset: number) => {
    return selectTextByRange(editor, startOffset, endOffset)
  },
  
  selectAllText: () => {
    selectAllText(editor)
  },
  
  clearSelection: () => {
    clearSelection(editor)
  },
  
  // 程序化格式应用 API
  applyFormatToSelection: (format: string) => {
    return applyFormatToSelection(editor, format as any)
  },
  
  applyFormatToText: (searchText: string, format: string) => {
    return applyFormatToText(editor, searchText, format as any)
  },
  
  applyFormatToRange: (startOffset: number, endOffset: number, format: string) => {
    return applyFormatToRange(editor, startOffset, endOffset, format as any)
  },
  
  insertFormattedText: (text: string, formats: string[]) => {
    insertFormattedText(editor, text, formats as any[])
  },
  
  // 复合操作 API
  findAndFormatText: (searchText: string, format: string) => {
    return findAndFormatText(editor, searchText, format as any)
  },
  
  batchFormatTexts: (textFormats: Array<{ text: string, formats: string[] }>) => {
    return batchFormatTexts(editor, textFormats as any)
  },
  
  // 状态查询 API
  getSelectionInfo: () => {
    return getSelectionInfo(editor)
  },
  
  canApplyFormat: (format: string) => {
    return canApplyFormat(editor, format as any)
  }
}

console.log('Lexical 编辑器已创建，可以使用以下命令测试：')
console.log('基础功能：')
console.log('- lexicalTest.setRootElement(element) - 设置根元素')
console.log('- lexicalTest.updateContent("text") - 更新内容')
console.log('- lexicalTest.getState() - 获取状态')
console.log('- lexicalTest.focus() - 聚焦编辑器')
console.log('')
console.log('文本选择 API：')
console.log('- lexicalTest.selectTextByContent("文本") - 根据内容选择文字')
console.log('- lexicalTest.selectTextByRange(0, 10) - 根据范围选择文字')
console.log('- lexicalTest.selectAllText() - 选择所有文本')
console.log('- lexicalTest.clearSelection() - 清除选择')
console.log('- lexicalTest.getSelectedText() - 获取选中文本')
console.log('')
console.log('格式化 API：')
console.log('- lexicalTest.applyFormatToSelection("bold") - 对选中文本加粗')
console.log('- lexicalTest.applyFormatToText("重要", "italic") - 对指定文本加斜体')
console.log('- lexicalTest.applyFormatToRange(0, 10, "underline") - 对范围加下划线')
console.log('')
console.log('复合操作 API：')
console.log('- lexicalTest.findAndFormatText("API", "bold") - 查找并格式化所有匹配文本')
console.log('- lexicalTest.getSelectionInfo() - 获取选择详细信息')
console.log('- lexicalTest.canApplyFormat("bold") - 检查是否可以应用格式')
