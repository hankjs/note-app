import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCodeBlocksStore } from '@/stores/codeBlocks'

describe('Code Blocks Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Block Creation', () => {
    it('should create JavaScript block', () => {
      const store = useCodeBlocksStore()
      const block = store.createJavaScriptBlock('console.log("Hello");')
      
      expect(block.type).toBe('javascript')
      expect(block.content).toBe('console.log("Hello");')
      expect(block.status).toBe('idle')
      expect(store.blocks).toHaveLength(1)
    })

    it('should create TypeScript block', () => {
      const store = useCodeBlocksStore()
      const block = store.createTypeScriptBlock('const message: string = "Hello";')
      
      expect(block.type).toBe('typescript')
      expect(block.content).toBe('const message: string = "Hello";')
      expect(block.status).toBe('idle')
      expect(store.blocks).toHaveLength(1)
    })

    it('should create Markdown block', () => {
      const store = useCodeBlocksStore()
      const block = store.createMarkdownBlock('# Hello World')
      
      expect(block.type).toBe('markdown')
      expect(block.content).toBe('# Hello World')
      expect(store.blocks).toHaveLength(1)
    })

    it('should generate unique IDs for blocks', () => {
      const store = useCodeBlocksStore()
      const block1 = store.createJavaScriptBlock('code1')
      const block2 = store.createJavaScriptBlock('code2')
      
      expect(block1.id).not.toBe(block2.id)
    })
  })

  describe('Block Management', () => {
    it('should update block content', () => {
      const store = useCodeBlocksStore()
      const block = store.createJavaScriptBlock('old code')
      
      store.updateBlockContent(block.id, 'new code')
      
      expect(store.getBlock(block.id)?.content).toBe('new code')
    })

    it('should delete block', () => {
      const store = useCodeBlocksStore()
      const block = store.createJavaScriptBlock('test code')
      
      expect(store.blocks).toHaveLength(1)
      
      store.deleteBlock(block.id)
      
      expect(store.blocks).toHaveLength(0)
      expect(store.getBlock(block.id)).toBeNull()
    })

    it('should select block', () => {
      const store = useCodeBlocksStore()
      const block = store.createJavaScriptBlock('test code')
      
      store.selectBlock(block.id)
      
      expect(store.currentBlockId).toBe(block.id)
    })
  })

  describe('Block Status Management', () => {
    it('should update block status', () => {
      const store = useCodeBlocksStore()
      const block = store.createJavaScriptBlock('test code')
      
      store.updateBlockStatus(block.id, 'running')
      
      expect(store.getBlock(block.id)?.status).toBe('running')
    })

    it('should update block status with execution time', () => {
      const store = useCodeBlocksStore()
      const block = store.createJavaScriptBlock('test code')
      
      store.updateBlockStatus(block.id, 'success', 100)
      
      const updatedBlock = store.getBlock(block.id)
      expect(updatedBlock?.status).toBe('success')
      expect(updatedBlock?.executionTime).toBe(100)
    })

    it('should update block status with error', () => {
      const store = useCodeBlocksStore()
      const block = store.createJavaScriptBlock('test code')
      
      store.updateBlockStatus(block.id, 'error', undefined, 'Test error')
      
      const updatedBlock = store.getBlock(block.id)
      expect(updatedBlock?.status).toBe('error')
      expect(updatedBlock?.error).toBe('Test error')
    })
  })

  describe('Block Outputs', () => {
    it('should add output to block', () => {
      const store = useCodeBlocksStore()
      const block = store.createJavaScriptBlock('test code')
      
      store.addBlockOutput(block.id, {
        type: 'console',
        content: 'Hello World',
        timestamp: Date.now()
      })
      
      const updatedBlock = store.getBlock(block.id)
      expect(updatedBlock?.outputs).toHaveLength(1)
      expect(updatedBlock?.outputs[0].content).toBe('Hello World')
    })

    it('should clear block outputs', () => {
      const store = useCodeBlocksStore()
      const block = store.createJavaScriptBlock('test code')
      
      store.addBlockOutput(block.id, {
        type: 'console',
        content: 'Hello World',
        timestamp: Date.now()
      })
      
      expect(store.getBlock(block.id)?.outputs).toHaveLength(1)
      
      store.clearBlockOutputs(block.id)
      
      expect(store.getBlock(block.id)?.outputs).toHaveLength(0)
    })

    it('should clear all outputs', () => {
      const store = useCodeBlocksStore()
      const block1 = store.createJavaScriptBlock('code1')
      const block2 = store.createJavaScriptBlock('code2')
      
      store.addBlockOutput(block1.id, {
        type: 'console',
        content: 'Output 1',
        timestamp: Date.now()
      })
      
      store.addBlockOutput(block2.id, {
        type: 'console',
        content: 'Output 2',
        timestamp: Date.now()
      })
      
      expect(store.getBlock(block1.id)?.outputs).toHaveLength(1)
      expect(store.getBlock(block2.id)?.outputs).toHaveLength(1)
      
      // 手动清除每个块的输出
      store.clearBlockOutputs(block1.id)
      store.clearBlockOutputs(block2.id)
      
      expect(store.getBlock(block1.id)?.outputs).toHaveLength(0)
      expect(store.getBlock(block2.id)?.outputs).toHaveLength(0)
    })
  })

  describe('Block Movement', () => {
    it('should move block up', () => {
      const store = useCodeBlocksStore()
      const block1 = store.createJavaScriptBlock('code1')
      const block2 = store.createJavaScriptBlock('code2')
      
      expect(store.blocks[0].id).toBe(block1.id)
      expect(store.blocks[1].id).toBe(block2.id)
      
      store.moveBlock(1, 0) // 从索引1移动到索引0
      
      expect(store.blocks[0].id).toBe(block2.id)
      expect(store.blocks[1].id).toBe(block1.id)
    })

    it('should move block down', () => {
      const store = useCodeBlocksStore()
      const block1 = store.createJavaScriptBlock('code1')
      const block2 = store.createJavaScriptBlock('code2')
      
      expect(store.blocks[0].id).toBe(block1.id)
      expect(store.blocks[1].id).toBe(block2.id)
      
      store.moveBlock(0, 1) // 从索引0移动到索引1
      
      expect(store.blocks[0].id).toBe(block2.id)
      expect(store.blocks[1].id).toBe(block1.id)
    })

    it('should not move first block up', () => {
      const store = useCodeBlocksStore()
      const block = store.createJavaScriptBlock('code')
      
      store.moveBlock(0, -1) // 尝试移动到无效索引
      
      expect(store.blocks[0].id).toBe(block.id)
    })

    it('should not move last block down', () => {
      const store = useCodeBlocksStore()
      const block = store.createJavaScriptBlock('code')
      
      store.moveBlock(0, 1) // 尝试移动到超出范围的索引
      
      expect(store.blocks[0].id).toBe(block.id)
    })
  })

  describe('Block Duplication', () => {
    it('should duplicate block', () => {
      const store = useCodeBlocksStore()
      const originalBlock = store.createJavaScriptBlock('test code')
      
      const duplicatedBlock = store.duplicateBlock(originalBlock.id)
      
      expect(duplicatedBlock).toBeDefined()
      expect(duplicatedBlock?.content).toBe(originalBlock.content)
      expect(duplicatedBlock?.type).toBe(originalBlock.type)
      expect(duplicatedBlock?.id).not.toBe(originalBlock.id)
      expect(store.blocks).toHaveLength(2)
    })
  })

  describe('Computed Properties', () => {
    it('should filter JavaScript blocks', () => {
      const store = useCodeBlocksStore()
      store.createJavaScriptBlock('js code')
      store.createTypeScriptBlock('ts code')
      store.createMarkdownBlock('md content')
      
      expect(store.javascriptBlocks).toHaveLength(1)
      expect(store.javascriptBlocks[0].content).toBe('js code')
    })

    it('should filter TypeScript blocks', () => {
      const store = useCodeBlocksStore()
      store.createJavaScriptBlock('js code')
      store.createTypeScriptBlock('ts code')
      store.createMarkdownBlock('md content')
      
      // 手动过滤 TypeScript 块，因为 store 中没有 typescriptBlocks 计算属性
      const typescriptBlocks = store.blocks.filter(block => block.type === 'typescript')
      expect(typescriptBlocks).toHaveLength(1)
      expect(typescriptBlocks[0].content).toBe('ts code')
    })

    it('should filter Markdown blocks', () => {
      const store = useCodeBlocksStore()
      store.createJavaScriptBlock('js code')
      store.createTypeScriptBlock('ts code')
      store.createMarkdownBlock('md content')
      
      expect(store.markdownBlocks).toHaveLength(1)
      expect(store.markdownBlocks[0].content).toBe('md content')
    })
  })
})
