import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  $getRoot,
  ElementNode
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
