import { createEditor, $getRoot, $createParagraphNode, $createTextNode } from 'lexical'
import { registerRichText, HeadingNode, QuoteNode } from '@lexical/rich-text'
import { CodeNode, CodeHighlightNode, $createCodeNode } from '@lexical/code'
import { registerCodeHighlighting } from '@lexical/code-shiki'
import { registerHistory, createEmptyHistoryState } from '@lexical/history'
import { mergeRegister } from '@lexical/utils'

// 测试 @lexical/code-shiki 集成
export function testCodeShikiIntegration() {
  console.log('Testing @lexical/code-shiki integration...')
  
  // 创建编辑器配置
  const initialConfig = {
    namespace: 'CodeShiki Test Editor',
    nodes: [HeadingNode, QuoteNode, CodeNode, CodeHighlightNode],
    onError: (error: Error) => {
      console.error('Lexical Editor Error:', error)
    },
  }

  // 创建编辑器实例
  const editor = createEditor(initialConfig)

  // 注册插件
  mergeRegister(
    registerRichText(editor),
    registerHistory(editor, createEmptyHistoryState(), 300),
    registerCodeHighlighting(editor)
  )

  // 测试代码块创建
  editor.update(() => {
    const root = $getRoot()
    root.clear()
    
    // 创建段落
    const paragraph = $createParagraphNode()
    const text = $createTextNode('这是一个测试段落')
    paragraph.append(text)
    root.append(paragraph)
    
    // 创建代码块
    const codeBlock = $createCodeNode()
    const codeText = $createTextNode('console.log("Hello, World!");')
    codeBlock.append(codeText)
    root.append(codeBlock)
    
    console.log('Code block created successfully')
    console.log('Editor content:', root.getTextContent())
  })

  return editor
}

// 测试代码高亮功能
export function testCodeHighlighting(editor: any) {
  console.log('Testing code highlighting...')
  
  editor.update(() => {
    const root = $getRoot()
    const codeBlock = root.getLastChild()
    
    if (codeBlock && codeBlock.getType() === 'code') {
      console.log('Code block found:', codeBlock.getTextContent())
      console.log('Code block type:', codeBlock.getType())
      
      // 检查是否有高亮节点
      const codeBlockElement = codeBlock as any
      if (codeBlockElement.getChildren) {
        const children = codeBlockElement.getChildren()
        children.forEach((child: any, index: number) => {
          console.log(`Child ${index}:`, {
            type: child.getType(),
            text: child.getTextContent(),
            format: child.getFormat ? child.getFormat() : 'N/A'
          })
        })
      }
    }
  })
}

// 导出测试函数
export default {
  testCodeShikiIntegration,
  testCodeHighlighting
}
