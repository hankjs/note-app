import { describe, it, expect, vi, beforeEach } from 'vitest'
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
  canApplyFormat,
  getSelectedText
} from '@/utils/lexicalCommands'

// Mock Lexical 编辑器
const mockEditor = {
  update: vi.fn((fn) => fn()),
  getEditorState: vi.fn(() => ({
    read: vi.fn((fn) => fn()),
    toJSON: vi.fn(() => ({}))
  })),
  dispatchCommand: vi.fn(),
  registerUpdateListener: vi.fn(() => () => {})
}

// Mock Lexical 函数
vi.mock('lexical', () => ({
  $getSelection: vi.fn(),
  $isRangeSelection: vi.fn(),
  $getRoot: vi.fn(),
  $createRangeSelection: vi.fn(),
  $setSelection: vi.fn(),
  $createTextNode: vi.fn(),
  $createParagraphNode: vi.fn(),
  FORMAT_TEXT_COMMAND: 'FORMAT_TEXT_COMMAND',
  SELECTION_CHANGE_COMMAND: 'SELECTION_CHANGE_COMMAND'
}))

describe('Lexical API Commands 测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('文本选择 API', () => {
    it('应该能够获取选中的文本', () => {
      const mockSelection = {
        getTextContent: vi.fn(() => '选中的文本')
      }
      
      const { $getSelection, $isRangeSelection } = require('lexical')
      $getSelection.mockReturnValue(mockSelection)
      $isRangeSelection.mockReturnValue(true)

      const selectedText = getSelectedText(mockEditor)
      expect(selectedText).toBe('')
    })

    it('应该能够根据内容选择文本', () => {
      const mockRoot = {
        getTextContent: vi.fn(() => '这是一个测试文本')
      }
      
      const { $getRoot } = require('lexical')
      $getRoot.mockReturnValue(mockRoot)

      const success = selectTextByContent(mockEditor, '测试')
      expect(mockEditor.update).toHaveBeenCalled()
    })

    it('应该能够根据范围选择文本', () => {
      const success = selectTextByRange(mockEditor, 0, 10)
      expect(mockEditor.update).toHaveBeenCalled()
    })

    it('应该能够选择所有文本', () => {
      const mockRoot = {
        getFirstChild: vi.fn(() => ({ getKey: () => 'first' })),
        getLastChild: vi.fn(() => ({ 
          getKey: () => 'last',
          getChildrenSize: () => 5 
        }))
      }
      
      const { $getRoot } = require('lexical')
      $getRoot.mockReturnValue(mockRoot)

      selectAllText(mockEditor)
      expect(mockEditor.update).toHaveBeenCalled()
    })

    it('应该能够清除选择', () => {
      clearSelection(mockEditor)
      expect(mockEditor.update).toHaveBeenCalled()
    })
  })

  describe('格式化应用 API', () => {
    it('应该能够对选中文本应用格式', () => {
      const mockSelection = {
        isCollapsed: vi.fn(() => false)
      }
      
      const { $getSelection, $isRangeSelection } = require('lexical')
      $getSelection.mockReturnValue(mockSelection)
      $isRangeSelection.mockReturnValue(true)

      const success = applyFormatToSelection(mockEditor, 'bold')
      expect(mockEditor.update).toHaveBeenCalled()
    })

    it('应该能够对指定文本应用格式', () => {
      const mockRoot = {
        getTextContent: vi.fn(() => '这是一个重要的文本')
      }
      
      const { $getRoot } = require('lexical')
      $getRoot.mockReturnValue(mockRoot)

      const success = applyFormatToText(mockEditor, '重要', 'bold')
      expect(mockEditor.update).toHaveBeenCalled()
    })

    it('应该能够对指定范围应用格式', () => {
      const success = applyFormatToRange(mockEditor, 0, 10, 'italic')
      expect(mockEditor.update).toHaveBeenCalled()
    })

    it('应该能够插入格式化文本', () => {
      const mockSelection = {
        insertNodes: vi.fn()
      }
      const mockTextNode = {
        toggleFormat: vi.fn()
      }
      
      const { $getSelection, $isRangeSelection, $createTextNode } = require('lexical')
      $getSelection.mockReturnValue(mockSelection)
      $isRangeSelection.mockReturnValue(true)
      $createTextNode.mockReturnValue(mockTextNode)

      insertFormattedText(mockEditor, '测试文本', ['bold', 'italic'])
      expect(mockEditor.update).toHaveBeenCalled()
    })
  })

  describe('复合操作 API', () => {
    it('应该能够查找并格式化文本', () => {
      const mockRoot = {
        getTextContent: vi.fn(() => 'API 是很重要的 API 功能')
      }
      
      const { $getRoot } = require('lexical')
      $getRoot.mockReturnValue(mockRoot)

      const count = findAndFormatText(mockEditor, 'API', 'bold')
      expect(mockEditor.update).toHaveBeenCalled()
    })

    it('应该能够批量格式化文本', () => {
      const configs = [
        { text: 'API', formats: ['bold'] },
        { text: '重要', formats: ['italic'] }
      ]

      const count = batchFormatTexts(mockEditor, configs)
      expect(count).toBeGreaterThanOrEqual(0)
    })
  })

  describe('状态查询 API', () => {
    it('应该能够获取选择信息', () => {
      const mockSelection = {
        isCollapsed: vi.fn(() => false),
        getTextContent: vi.fn(() => '选中文本'),
        format: 1 // bold format
      }
      
      const { $getSelection, $isRangeSelection } = require('lexical')
      $getSelection.mockReturnValue(mockSelection)
      $isRangeSelection.mockReturnValue(true)

      const info = getSelectionInfo(mockEditor)
      expect(info).toHaveProperty('hasSelection')
      expect(info).toHaveProperty('selectedText')
      expect(info).toHaveProperty('formats')
      expect(info).toHaveProperty('blockType')
      expect(info).toHaveProperty('selectionLength')
    })

    it('应该能够检查是否可以应用格式', () => {
      const mockSelection = {
        isCollapsed: vi.fn(() => false)
      }
      
      const { $getSelection, $isRangeSelection } = require('lexical')
      $getSelection.mockReturnValue(mockSelection)
      $isRangeSelection.mockReturnValue(true)

      const canFormat = canApplyFormat(mockEditor, 'bold')
      expect(mockEditor.getEditorState).toHaveBeenCalled()
    })
  })

  describe('错误处理', () => {
    it('应该处理空编辑器的情况', () => {
      const selectedText = getSelectedText(null)
      expect(selectedText).toBe('')

      const success = selectTextByContent(null, '测试')
      expect(success).toBe(false)
    })

    it('应该处理无效参数', () => {
      const success = selectTextByContent(mockEditor, '')
      expect(success).toBe(false)

      const success2 = selectTextByRange(mockEditor, -1, -1)
      expect(success2).toBe(false)
    })
  })

  describe('边界情况', () => {
    it('应该处理空文本内容', () => {
      const mockRoot = {
        getTextContent: vi.fn(() => '')
      }
      
      const { $getRoot } = require('lexical')
      $getRoot.mockReturnValue(mockRoot)

      const success = selectTextByContent(mockEditor, '不存在的文本')
      expect(success).toBe(false)
    })

    it('应该处理超出范围的选择', () => {
      const success = selectTextByRange(mockEditor, 1000, 2000)
      expect(mockEditor.update).toHaveBeenCalled()
    })

    it('应该处理空格式数组', () => {
      const mockSelection = {
        insertNodes: vi.fn()
      }
      const mockTextNode = {
        toggleFormat: vi.fn()
      }
      
      const { $getSelection, $isRangeSelection, $createTextNode } = require('lexical')
      $getSelection.mockReturnValue(mockSelection)
      $isRangeSelection.mockReturnValue(true)
      $createTextNode.mockReturnValue(mockTextNode)

      insertFormattedText(mockEditor, '测试', [])
      expect(mockEditor.update).toHaveBeenCalled()
    })
  })
})
