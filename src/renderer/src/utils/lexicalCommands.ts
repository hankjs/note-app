import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  $getRoot,
  ElementNode,
  $createRangeSelection,
  $setSelection,
  TextNode,
  $createTextNode,
  $createParagraphNode
} from 'lexical'
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingTagType
} from '@lexical/rich-text'
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode
} from '@lexical/list'
import {
  $createLinkNode,
  $isLinkNode,
  TOGGLE_LINK_COMMAND
} from '@lexical/link'
import {
  $isAtNodeEnd,
  $wrapNodes,
  $isNodeSelection
} from '@lexical/selection'

// 文本格式常量
export const TEXT_FORMAT_TYPES = {
  bold: 1,
  italic: 2,
  underline: 8,
  strikethrough: 4,
  code: 16
} as const

export type TextFormatType = keyof typeof TEXT_FORMAT_TYPES

// 块类型常量
export const BLOCK_TYPES = {
  paragraph: 'paragraph',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  quote: 'quote',
  code: 'code'
} as const

export type BlockType = keyof typeof BLOCK_TYPES

// 格式化文本命令
export function formatText(editor: any, format: TextFormatType): void {
  if (!editor) {
    console.warn('Editor is not available')
    return
  }
  
  try {
    console.log('Executing formatText command:', format)
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
  } catch (error) {
    console.error('Failed to execute formatText command:', error)
  }
}

// 获取当前选择的格式
export function getSelectedTextFormats(editor: any): Set<TextFormatType> {
  const formats = new Set<TextFormatType>()
  
  const selection = $getSelection()
  if ($isRangeSelection(selection)) {
    const formatFlags = selection.format
    
    if (formatFlags & TEXT_FORMAT_TYPES.bold) formats.add('bold')
    if (formatFlags & TEXT_FORMAT_TYPES.italic) formats.add('italic')
    if (formatFlags & TEXT_FORMAT_TYPES.underline) formats.add('underline')
    if (formatFlags & TEXT_FORMAT_TYPES.strikethrough) formats.add('strikethrough')
    if (formatFlags & TEXT_FORMAT_TYPES.code) formats.add('code')
  }
  
  return formats
}

// 设置块类型
export function setBlockType(editor: any, blockType: BlockType): void {
  editor.update(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return

    const anchorNode = selection.anchor.getNode()
    let element = anchorNode.getKey() === 'root' 
      ? anchorNode 
      : anchorNode.getTopLevelElementOrThrow()

    if (element instanceof ElementNode) {
      let newElement: ElementNode

      switch (blockType) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          newElement = $createHeadingNode(blockType as HeadingTagType)
          break
        case 'quote':
          newElement = $createQuoteNode()
          break
        case 'paragraph':
        default:
          // 创建段落节点
          newElement = element.constructor.getType() === 'paragraph' 
            ? element 
            : element.replace(element.constructor.create())
          break
      }

      if (newElement !== element) {
        const children = element.getChildren()
        children.forEach(child => {
          newElement.append(child)
        })
        element.replace(newElement)
      }
    }
  })
}

// 获取当前块类型
export function getCurrentBlockType(editor: any): BlockType {
  let blockType: BlockType = 'paragraph'
  
  editor.getEditorState().read(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode()
      const element = anchorNode.getKey() === 'root' 
        ? anchorNode 
        : anchorNode.getTopLevelElementOrThrow()

      if (element) {
        const type = element.getType()
        if (type === 'heading') {
          const headingElement = element as any
          blockType = headingElement.getTag() as BlockType
        } else if (type === 'quote') {
          blockType = 'quote'
        } else if (type === 'code') {
          blockType = 'code'
        } else {
          blockType = 'paragraph'
        }
      }
    }
  })
  
  return blockType
}

// 插入无序列表
export function insertBulletList(editor: any): void {
  editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
}

// 插入有序列表
export function insertNumberedList(editor: any): void {
  editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
}

// 移除列表
export function removeList(editor: any): void {
  editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
}

// 检查是否在列表中
export function isInList(editor: any): { isInList: boolean, listType?: 'bullet' | 'number' } {
  let result = { isInList: false, listType: undefined as 'bullet' | 'number' | undefined }
  
  editor.getEditorState().read(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode()
      let currentNode = anchorNode

      // 向上遍历查找列表节点
      while (currentNode) {
        if ($isListNode(currentNode)) {
          result.isInList = true
          result.listType = currentNode.getListType() === 'bullet' ? 'bullet' : 'number'
          break
        }
        currentNode = currentNode.getParent()
      }
    }
  })
  
  return result
}

// 切换链接
export function toggleLink(editor: any, url?: string): void {
  const selection = $getSelection()
  if (!$isRangeSelection(selection)) return

  const nodes = selection.extract()
  
  if (nodes.length === 1) {
    const firstNode = nodes[0]
    // 如果选中的是链接节点，则移除链接
    if ($isLinkNode(firstNode)) {
      firstNode.remove()
      return
    }
  }

  // 如果没有提供 URL，提示用户输入
  if (!url) {
    url = prompt('请输入链接地址:') || ''
  }

  if (url) {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
  }
}

// 清除格式
export function clearFormatting(editor: any): void {
  editor.update(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      // 清除文本格式
      selection.formatText('bold', null)
      selection.formatText('italic', null)
      selection.formatText('underline', null)
      selection.formatText('strikethrough', null)
      selection.formatText('code', null)
    }
  })
}

// 撤销命令
export function undo(editor: any): void {
  editor.dispatchCommand('UNDO_COMMAND', undefined)
}

// 重做命令
export function redo(editor: any): void {
  editor.dispatchCommand('REDO_COMMAND', undefined)
}

// 检查是否可以撤销
export function canUndo(editor: any): boolean {
  // TODO: 实现撤销状态检查
  return true
}

// 检查是否可以重做
export function canRedo(editor: any): boolean {
  // TODO: 实现重做状态检查
  return true
}

// 注册选择变化监听器
export function registerSelectionListener(
  editor: any,
  callback: (formats: Set<TextFormatType>, blockType: BlockType) => void
): () => void {
  return editor.registerUpdateListener(({ editorState }: any) => {
    editorState.read(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const formats = getSelectedTextFormats(editor)
        const blockType = getCurrentBlockType(editor)
        callback(formats, blockType)
      }
    })
  })
}

// ==================== 文本选择 API ====================

export interface TextPosition {
  offset: number
  node?: TextNode
}

export interface TextRange {
  start: TextPosition
  end: TextPosition
}

// 获取当前选择的文本
export function getSelectedText(editor: any): string {
  if (!editor || !editor.getEditorState) {
    return ''
  }
  
  let selectedText = ''
  
  try {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        selectedText = selection.getTextContent()
      }
    })
  } catch (error) {
    console.error('Failed to get selected text:', error)
  }
  
  return selectedText
}

// 根据文本内容选择文字
export function selectTextByContent(editor: any, searchText: string, startIndex: number = 0): boolean {
  if (!editor || !editor.update || !searchText) {
    return false
  }
  
  let success = false
  
  try {
    editor.update(() => {
      const root = $getRoot()
      if (!root || !root.getTextContent) {
        return
      }
      
      const textContent = root.getTextContent()
      const index = textContent.indexOf(searchText, startIndex)
      
      if (index !== -1) {
        success = selectTextByRange(editor, index, index + searchText.length)
      }
    })
  } catch (error) {
    console.error('Failed to select text by content:', error)
  }
  
  return success
}

// 根据字符范围选择文字
export function selectTextByRange(editor: any, startOffset: number, endOffset: number): boolean {
  let success = false
  
  editor.update(() => {
    try {
      const root = $getRoot()
      const textNodes = getAllTextNodes(root)
      
      let currentOffset = 0
      let startNode: TextNode | null = null
      let endNode: TextNode | null = null
      let startNodeOffset = 0
      let endNodeOffset = 0
      
      // 找到开始和结束位置的节点
      for (const textNode of textNodes) {
        const nodeText = textNode.getTextContent()
        const nodeLength = nodeText.length
        
        if (startNode === null && currentOffset + nodeLength > startOffset) {
          startNode = textNode
          startNodeOffset = startOffset - currentOffset
        }
        
        if (endNode === null && currentOffset + nodeLength >= endOffset) {
          endNode = textNode
          endNodeOffset = endOffset - currentOffset
          break
        }
        
        currentOffset += nodeLength
      }
      
      if (startNode && endNode) {
        const selection = $createRangeSelection()
        selection.anchor.set(startNode.getKey(), startNodeOffset, 'text')
        selection.focus.set(endNode.getKey(), endNodeOffset, 'text')
        $setSelection(selection)
        success = true
      }
    } catch (error) {
      console.error('Failed to select text by range:', error)
    }
  })
  
  return success
}

// 选择所有文本
export function selectAllText(editor: any): void {
  editor.update(() => {
    const root = $getRoot()
    const firstChild = root.getFirstChild()
    const lastChild = root.getLastChild()
    
    if (firstChild && lastChild) {
      const selection = $createRangeSelection()
      selection.anchor.set(firstChild.getKey(), 0, 'element')
      selection.focus.set(lastChild.getKey(), lastChild.getChildrenSize(), 'element')
      $setSelection(selection)
    }
  })
}

// 清除选择
export function clearSelection(editor: any): void {
  editor.update(() => {
    $setSelection(null)
  })
}

// 获取所有文本节点
function getAllTextNodes(node: any): TextNode[] {
  const textNodes: TextNode[] = []
  
  function traverse(currentNode: any) {
    if (currentNode.getType && currentNode.getType() === 'text') {
      textNodes.push(currentNode as TextNode)
    } else if (currentNode.getChildren) {
      const children = currentNode.getChildren()
      for (const child of children) {
        traverse(child)
      }
    }
  }
  
  traverse(node)
  return textNodes
}

// ==================== 程序化工具栏操作 API ====================

// 对选中文本应用格式
export function applyFormatToSelection(editor: any, format: TextFormatType): boolean {
  let success = false
  
  editor.update(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection) && !selection.isCollapsed()) {
      formatText(editor, format)
      success = true
    }
  })
  
  return success
}

// 对指定文本应用格式
export function applyFormatToText(editor: any, searchText: string, format: TextFormatType): boolean {
  const selected = selectTextByContent(editor, searchText)
  if (selected) {
    return applyFormatToSelection(editor, format)
  }
  return false
}

// 对指定范围应用格式
export function applyFormatToRange(editor: any, startOffset: number, endOffset: number, format: TextFormatType): boolean {
  const selected = selectTextByRange(editor, startOffset, endOffset)
  if (selected) {
    return applyFormatToSelection(editor, format)
  }
  return false
}

// 插入格式化文本
export function insertFormattedText(editor: any, text: string, formats: TextFormatType[]): void {
  editor.update(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const textNode = $createTextNode(text)
      
      // 应用格式
      formats.forEach(format => {
        switch (format) {
          case 'bold':
            textNode.toggleFormat('bold')
            break
          case 'italic':
            textNode.toggleFormat('italic')
            break
          case 'underline':
            textNode.toggleFormat('underline')
            break
          case 'strikethrough':
            textNode.toggleFormat('strikethrough')
            break
          case 'code':
            textNode.toggleFormat('code')
            break
        }
      })
      
      selection.insertNodes([textNode])
    }
  })
}

// ==================== 复合操作 API ====================

// 查找并格式化所有匹配的文本
export function findAndFormatText(editor: any, searchText: string, format: TextFormatType): number {
  let count = 0
  
  editor.update(() => {
    const root = $getRoot()
    const fullText = root.getTextContent()
    let searchIndex = 0
    
    while (true) {
      const index = fullText.indexOf(searchText, searchIndex)
      if (index === -1) break
      
      if (selectTextByRange(editor, index, index + searchText.length)) {
        formatText(editor, format)
        count++
      }
      
      searchIndex = index + searchText.length
    }
  })
  
  return count
}

// 批量应用格式到多个文本
export function batchFormatTexts(editor: any, textFormats: Array<{ text: string, formats: TextFormatType[] }>): number {
  let successCount = 0
  
  textFormats.forEach(({ text, formats }) => {
    formats.forEach(format => {
      if (applyFormatToText(editor, text, format)) {
        successCount++
      }
    })
  })
  
  return successCount
}

// ==================== 工具栏状态 API ====================

// 获取当前选择的详细信息
export function getSelectionInfo(editor: any): {
  hasSelection: boolean
  selectedText: string
  formats: Set<TextFormatType>
  blockType: BlockType
  selectionLength: number
} {
  const info = {
    hasSelection: false,
    selectedText: '',
    formats: new Set<TextFormatType>(),
    blockType: 'paragraph' as BlockType,
    selectionLength: 0
  }
  
  editor.getEditorState().read(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      info.hasSelection = !selection.isCollapsed()
      info.selectedText = selection.getTextContent()
      info.selectionLength = info.selectedText.length
      info.formats = getSelectedTextFormats(editor)
      info.blockType = getCurrentBlockType(editor)
    }
  })
  
  return info
}

// 检查是否可以应用格式
export function canApplyFormat(editor: any, format: TextFormatType): boolean {
  let canApply = false
  
  editor.getEditorState().read(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection) && !selection.isCollapsed()) {
      canApply = true
    }
  })
  
  return canApply
}
