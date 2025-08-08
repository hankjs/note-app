import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical'
import { $convertFromMarkdownString } from '@lexical/markdown'

// 将编辑器状态转换为可读的文本内容
export function editorStateToText(editorState: any): string {
  try {
    const json = editorState.toJSON()
    return extractTextFromJSON(json)
  } catch (error) {
    console.error('Failed to convert editor state to text:', error)
    return ''
  }
}

// 从 JSON 中提取文本内容
function extractTextFromJSON(json: any): string {
  if (!json || !json.root || !json.root.children) {
    return ''
  }

  const lines: string[] = []
  
  for (const child of json.root.children) {
    if (child.type === 'paragraph') {
      const paragraphText = extractTextFromNode(child)
      if (paragraphText) {
        lines.push(paragraphText)
      }
    } else if (child.type === 'heading') {
      const headingText = extractTextFromNode(child)
      if (headingText) {
        const level = child.tag || 'h1'
        const prefix = '#'.repeat(parseInt(level.slice(1)))
        lines.push(`${prefix} ${headingText}`)
      }
    } else if (child.type === 'list') {
      const listText = extractTextFromListNode(child)
      lines.push(...listText)
    }
  }
  
  return lines.join('\n')
}

// 从节点中提取文本
function extractTextFromNode(node: any): string {
  if (!node.children) {
    return ''
  }
  
  const texts: string[] = []
  
  for (const child of node.children) {
    if (child.type === 'text') {
      let text = child.text || ''
      
      // 处理格式
      if (child.format & 1) text = `**${text}**` // bold
      if (child.format & 2) text = `*${text}*`   // italic
      if (child.format & 4) text = `~~${text}~~` // strikethrough
      if (child.format & 8) text = `\`${text}\`` // code
      
      texts.push(text)
    } else if (child.type === 'link') {
      const linkText = extractTextFromNode(child)
      const url = child.url || ''
      texts.push(`[${linkText}](${url})`)
    }
  }
  
  return texts.join('')
}

// 从列表节点中提取文本
function extractTextFromListNode(node: any): string[] {
  if (!node.children) {
    return []
  }
  
  const lines: string[] = []
  const isOrdered = node.listType === 'number'
  
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i]
    if (child.type === 'listitem') {
      const itemText = extractTextFromNode(child)
      if (itemText) {
        const prefix = isOrdered ? `${i + 1}.` : '-'
        lines.push(`${prefix} ${itemText}`)
      }
    }
  }
  
  return lines
}

// 将文本内容转换为编辑器状态
export function textToEditorState(editor: any, text: string): void {
  if (!editor || !text) return

  editor.update(() => {
    const root = $getRoot()
    root.clear()
    
    try {
      // 尝试解析为 Markdown
      $convertFromMarkdownString(text)
    } catch (error) {
      // 如果解析失败，作为纯文本处理
      const paragraph = $createParagraphNode()
      const textNode = $createTextNode(text)
      paragraph.append(textNode)
      root.append(paragraph)
    }
  })
}

// 创建默认的编辑器内容
export function createDefaultContent(editor: any): void {
  if (!editor) return

  editor.update(() => {
    const root = $getRoot()
    if (root.getFirstChild() === null) {
      const paragraph = $createParagraphNode()
      const text = $createTextNode('开始编辑...')
      paragraph.append(text)
      root.append(paragraph)
    }
  })
}
