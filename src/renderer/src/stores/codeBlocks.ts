import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CodeOutput, ExecutionResult } from '@/utils/codeSandbox'

export interface CodeBlock {
  id: string
  type: 'javascript' | 'markdown'
  content: string
  outputs: CodeOutput[]
  status: 'idle' | 'running' | 'success' | 'error'
  executionTime?: number
  error?: string
  createdAt: number
  updatedAt: number
}

export const useCodeBlocksStore = defineStore('codeBlocks', () => {
  const blocks = ref<CodeBlock[]>([])
  const currentBlockId = ref<string | null>(null)
  const isExecuting = ref(false)

  const currentBlock = computed(() => 
    blocks.value.find(block => block.id === currentBlockId.value) || null
  )

  const javascriptBlocks = computed(() => 
    blocks.value.filter(block => block.type === 'javascript')
  )

  const markdownBlocks = computed(() => 
    blocks.value.filter(block => block.type === 'markdown')
  )

  // 创建新的代码块
  const createBlock = (type: 'javascript' | 'markdown', content: string = ''): CodeBlock => {
    const block: CodeBlock = {
      id: generateBlockId(),
      type,
      content,
      outputs: [],
      status: 'idle',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    
    blocks.value.push(block)
    return block
  }

  // 创建 JavaScript 代码块
  const createJavaScriptBlock = (content: string = ''): CodeBlock => {
    return createBlock('javascript', content)
  }

  // 创建 Markdown 代码块
  const createMarkdownBlock = (content: string = ''): CodeBlock => {
    return createBlock('markdown', content)
  }

  // 更新代码块内容
  const updateBlockContent = (id: string, content: string) => {
    const block = blocks.value.find(b => b.id === id)
    if (block) {
      block.content = content
      block.updatedAt = Date.now()
    }
  }

  // 更新代码块状态
  const updateBlockStatus = (id: string, status: CodeBlock['status'], executionTime?: number, error?: string) => {
    const block = blocks.value.find(b => b.id === id)
    if (block) {
      block.status = status
      if (executionTime !== undefined) {
        block.executionTime = executionTime
      }
      if (error !== undefined) {
        block.error = error
      }
      block.updatedAt = Date.now()
    }
  }

  // 添加输出到代码块
  const addBlockOutput = (id: string, output: CodeOutput) => {
    const block = blocks.value.find(b => b.id === id)
    if (block) {
      block.outputs.push(output)
      block.updatedAt = Date.now()
    }
  }

  // 清除代码块输出
  const clearBlockOutputs = (id: string) => {
    const block = blocks.value.find(b => b.id === id)
    if (block) {
      block.outputs = []
      block.status = 'idle'
      block.error = undefined
      block.executionTime = undefined
      block.updatedAt = Date.now()
    }
  }

  // 设置执行结果
  const setExecutionResult = (id: string, result: ExecutionResult) => {
    const block = blocks.value.find(b => b.id === id)
    if (block) {
      block.outputs = result.outputs
      block.status = result.success ? 'success' : 'error'
      block.executionTime = result.executionTime
      block.error = result.error
      block.updatedAt = Date.now()
    }
  }

  // 删除代码块
  const deleteBlock = (id: string) => {
    const index = blocks.value.findIndex(b => b.id === id)
    if (index > -1) {
      blocks.value.splice(index, 1)
      if (currentBlockId.value === id) {
        currentBlockId.value = null
      }
    }
  }

  // 选择代码块
  const selectBlock = (id: string) => {
    currentBlockId.value = id
  }

  // 移动代码块
  const moveBlock = (fromIndex: number, toIndex: number) => {
    if (fromIndex >= 0 && fromIndex < blocks.value.length && 
        toIndex >= 0 && toIndex < blocks.value.length) {
      const block = blocks.value.splice(fromIndex, 1)[0]
      blocks.value.splice(toIndex, 0, block)
    }
  }

  // 复制代码块
  const duplicateBlock = (id: string): CodeBlock | null => {
    const originalBlock = blocks.value.find(b => b.id === id)
    if (originalBlock) {
      const newBlock: CodeBlock = {
        ...originalBlock,
        id: generateBlockId(),
        outputs: [],
        status: 'idle',
        error: undefined,
        executionTime: undefined,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      blocks.value.push(newBlock)
      return newBlock
    }
    return null
  }

  // 获取代码块
  const getBlock = (id: string): CodeBlock | null => {
    return blocks.value.find(b => b.id === id) || null
  }

  // 设置执行状态
  const setExecuting = (executing: boolean) => {
    isExecuting.value = executing
  }

  // 清空所有代码块
  const clearAllBlocks = () => {
    blocks.value = []
    currentBlockId.value = null
  }

  // 导入代码块
  const importBlocks = (importedBlocks: CodeBlock[]) => {
    blocks.value = importedBlocks.map(block => ({
      ...block,
      id: generateBlockId(), // 重新生成 ID 避免冲突
      createdAt: Date.now(),
      updatedAt: Date.now()
    }))
  }

  // 导出代码块
  const exportBlocks = (): CodeBlock[] => {
    return blocks.value.map(block => ({
      ...block,
      id: block.id // 保持原有 ID
    }))
  }

  return {
    // 状态
    blocks,
    currentBlockId,
    isExecuting,
    
    // 计算属性
    currentBlock,
    javascriptBlocks,
    markdownBlocks,
    
    // 方法
    createBlock,
    createJavaScriptBlock,
    createMarkdownBlock,
    updateBlockContent,
    updateBlockStatus,
    addBlockOutput,
    clearBlockOutputs,
    setExecutionResult,
    deleteBlock,
    selectBlock,
    moveBlock,
    duplicateBlock,
    getBlock,
    setExecuting,
    clearAllBlocks,
    importBlocks,
    exportBlocks
  }
})

// 生成唯一的代码块 ID
function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
