import { ref, computed } from 'vue'
import { useCodeBlocksStore } from '@/stores/codeBlocks'
import { executeCode, ExecutionContext } from '@/utils/codeSandbox'

export function useCodeExecution() {
  const blocksStore = useCodeBlocksStore()
  const isExecuting = ref(false)
  const executionQueue = ref<string[]>([])

  // 执行单个代码块
  const executeBlock = async (blockId: string, context: ExecutionContext = {}) => {
    const block = blocksStore.getBlock(blockId)
    if (!block || block.type !== 'javascript') {
      return
    }

    // 更新状态为运行中
    blocksStore.updateBlockStatus(blockId, 'running')
    blocksStore.setExecuting(true)
    isExecuting.value = true

    try {
      // 清除之前的输出
      blocksStore.clearBlockOutputs(blockId)

      // 执行代码
      const result = await executeCode(block.content, {
        timeout: 10000, // 10秒超时
        memoryLimit: 128, // 128MB 内存限制
        allowNetwork: false, // 不允许网络请求
        allowFileSystem: false, // 不允许文件系统访问
        ...context
      })

      // 设置执行结果
      blocksStore.setExecutionResult(blockId, result)

    } catch (error) {
      // 处理执行错误
      blocksStore.updateBlockStatus(blockId, 'error', undefined, error instanceof Error ? error.message : String(error))
    } finally {
      // 更新执行状态
      blocksStore.setExecuting(false)
      isExecuting.value = false
    }
  }

  // 执行所有 JavaScript 代码块
  const executeAllBlocks = async (context: ExecutionContext = {}) => {
    const jsBlocks = blocksStore.javascriptBlocks
    const blockIds = jsBlocks.map(block => block.id)

    for (const blockId of blockIds) {
      await executeBlock(blockId, context)
    }
  }

  // 停止执行
  const stopExecution = () => {
    blocksStore.setExecuting(false)
    isExecuting.value = false
    executionQueue.value = []
  }

  // 清除所有输出
  const clearAllOutputs = () => {
    blocksStore.blocks.forEach(block => {
      blocksStore.clearBlockOutputs(block.id)
    })
  }

  // 获取执行统计
  const executionStats = computed(() => {
    const blocks = blocksStore.blocks
    const totalBlocks = blocks.length
    const jsBlocks = blocks.filter(b => b.type === 'javascript')
    const executedBlocks = jsBlocks.filter(b => b.status === 'success' || b.status === 'error')
    const runningBlocks = jsBlocks.filter(b => b.status === 'running')
    const errorBlocks = jsBlocks.filter(b => b.status === 'error')
    const totalExecutionTime = jsBlocks.reduce((sum, b) => sum + (b.executionTime || 0), 0)

    return {
      totalBlocks,
      jsBlocks: jsBlocks.length,
      executedBlocks: executedBlocks.length,
      runningBlocks: runningBlocks.length,
      errorBlocks: errorBlocks.length,
      totalExecutionTime,
      averageExecutionTime: executedBlocks.length > 0 ? totalExecutionTime / executedBlocks.length : 0
    }
  })

  // 检查代码块是否有语法错误
  const validateCode = (code: string): { valid: boolean; error?: string } => {
    try {
      // 使用 Function 构造函数检查语法
      new Function(code)
      return { valid: true }
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : '语法错误' 
      }
    }
  }

  // 格式化代码
  const formatCode = (code: string): string => {
    try {
      // 简单的代码格式化
      return code
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n')
    } catch {
      return code
    }
  }

  // 获取代码块依赖关系
  const getBlockDependencies = (blockId: string): string[] => {
    const block = blocksStore.getBlock(blockId)
    if (!block || block.type !== 'javascript') {
      return []
    }

    // 简单的依赖分析（可以根据需要扩展）
    const dependencies: string[] = []
    const code = block.content.toLowerCase()

    // 检查是否使用了其他代码块的变量
    blocksStore.blocks.forEach(otherBlock => {
      if (otherBlock.id !== blockId && otherBlock.type === 'javascript') {
        // 这里可以实现更复杂的依赖分析
        // 目前只是简单的文本匹配
        if (code.includes(otherBlock.id)) {
          dependencies.push(otherBlock.id)
        }
      }
    })

    return dependencies
  }

  // 执行代码块及其依赖
  const executeBlockWithDependencies = async (blockId: string, context: ExecutionContext = {}) => {
    const dependencies = getBlockDependencies(blockId)
    
    // 先执行依赖
    for (const depId of dependencies) {
      await executeBlock(depId, context)
    }
    
    // 再执行当前代码块
    await executeBlock(blockId, context)
  }

  return {
    // 状态
    isExecuting: computed(() => isExecuting.value),
    executionQueue: computed(() => executionQueue.value),
    executionStats,

    // 方法
    executeBlock,
    executeAllBlocks,
    stopExecution,
    clearAllOutputs,
    validateCode,
    formatCode,
    getBlockDependencies,
    executeBlockWithDependencies
  }
}
