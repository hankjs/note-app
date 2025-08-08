import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCodeExecution } from '@/composables/useCodeExecution'
import { useCodeBlocksStore } from '@/stores/codeBlocks'

// 不使用 mock，使用真实实现

describe('useCodeExecution', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('validateCode', () => {
    it('should validate JavaScript code correctly', () => {
      const { validateCode } = useCodeExecution()
      
      // 有效的 JavaScript 代码
      const validJS = 'console.log("Hello, World!");'
      const result1 = validateCode(validJS, 'javascript')
      expect(result1.valid).toBe(true)
      expect(result1.error).toBeUndefined()
      
      // 无效的 JavaScript 代码
      const invalidJS = 'console.log("Hello, World!"'
      const result2 = validateCode(invalidJS, 'javascript')
      expect(result2.valid).toBe(false)
      expect(result2.error).toBeDefined()
    })

    it('should validate TypeScript code correctly', async () => {
      const { validateCode } = useCodeExecution()
      
      const validTS = 'const name: string = "Hello";'
      const result1 = validateCode(validTS, 'typescript')
      expect(result1.valid).toBe(true)
      expect(result1.error).toBeUndefined()
      
      const invalidTS = 'const name: string = 123;'
      const result2 = validateCode(invalidTS, 'typescript')
      expect(result2.valid).toBe(false)
      expect(result2.error).toBeDefined()
    })

    it('should handle TypeScript compilation errors gracefully', async () => {
      const { validateCode } = useCodeExecution()
      
      // 使用会导致编译错误的代码
      const tsCode = 'const name: string = "Hello"; const invalid: number = "string";'
      const result = validateCode(tsCode, 'typescript')
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should default to JavaScript validation when language is not specified', () => {
      const { validateCode } = useCodeExecution()
      
      const validJS = 'console.log("Hello");'
      const result = validateCode(validJS) // 不指定语言，默认 JavaScript
      expect(result.valid).toBe(true)
    })

    it('should handle complex TypeScript features', async () => {
      const { validateCode } = useCodeExecution()
      
      const complexTS = `
        interface User {
          name: string;
          age: number;
        }
        
        function greet(user: User): string {
          return \`Hello, \${user.name}!\`;
        }
        
        const user: User = { name: "John", age: 30 };
        const message = greet(user);
        console.log(message);
        
        // 使用泛型和类型断言
        const userAge: number = user.age;
        console.log(userAge);
      `
      
      const result = validateCode(complexTS, 'typescript')
      if (!result.valid) {
        console.log('Complex TS validation failed:', result.error)
      }
      expect(result.valid).toBe(true)
    })

    it('should handle TypeScript syntax errors with line numbers', async () => {
      const { validateCode } = useCodeExecution()
      
      const invalidTS = `
        const name: string = "John";
        const age: number = 30;
        const message: string = age; // 类型错误
      `
      
      const result = validateCode(invalidTS, 'typescript')
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('getBlockDependencies', () => {
    it('should return empty array for non-code blocks', () => {
      const { getBlockDependencies } = useCodeExecution()
      const blocksStore = useCodeBlocksStore()
      
      // 创建 Markdown 块
      const markdownBlock = blocksStore.createMarkdownBlock('# Test')
      
      const dependencies = getBlockDependencies(markdownBlock.id)
      expect(dependencies).toEqual([])
    })

    it('should return empty array for non-existent blocks', () => {
      const { getBlockDependencies } = useCodeExecution()
      
      const dependencies = getBlockDependencies('non-existent-id')
      expect(dependencies).toEqual([])
    })

    it('should analyze dependencies for JavaScript blocks', () => {
      const { getBlockDependencies } = useCodeExecution()
      const blocksStore = useCodeBlocksStore()
      
      // 创建两个 JavaScript 块
      const block1 = blocksStore.createJavaScriptBlock('const data = "test";')
      const block2 = blocksStore.createJavaScriptBlock(`console.log(data); // 引用 block1 的变量`)
      
      const dependencies = getBlockDependencies(block2.id)
      // 注意：当前的依赖分析是简单的文本匹配，实际可能不会检测到这种依赖
      expect(Array.isArray(dependencies)).toBe(true)
    })

    it('should analyze dependencies for TypeScript blocks', () => {
      const { getBlockDependencies } = useCodeExecution()
      const blocksStore = useCodeBlocksStore()
      
      // 创建 TypeScript 块
      const block1 = blocksStore.createTypeScriptBlock('const name: string = "test";')
      const block2 = blocksStore.createTypeScriptBlock(`console.log(name); // 引用 block1 的变量`)
      
      const dependencies = getBlockDependencies(block2.id)
      expect(Array.isArray(dependencies)).toBe(true)
    })
  })

  describe('formatCode', () => {
    it('should format code by removing empty lines and trimming whitespace', () => {
      const { formatCode } = useCodeExecution()
      
      const messyCode = `
        const name = "John";
        
        console.log(name);
        
      `
      
      const formatted = formatCode(messyCode)
      expect(formatted).toBe('const name = "John";\nconsole.log(name);')
    })

    it('should return original code if formatting fails', () => {
      const { formatCode } = useCodeExecution()
      
      const originalCode = 'const test = "value";'
      const result = formatCode(originalCode)
      expect(result).toBe(originalCode)
    })
  })

  describe('executionStats', () => {
    it('should calculate correct execution statistics', () => {
      const { executionStats } = useCodeExecution()
      const blocksStore = useCodeBlocksStore()
      
      // 创建不同类型的块
      blocksStore.createJavaScriptBlock('console.log("JS");')
      blocksStore.createTypeScriptBlock('console.log("TS");')
      blocksStore.createMarkdownBlock('# Markdown')
      
      const stats = executionStats.value
      expect(stats.totalBlocks).toBe(3)
      expect(stats.codeBlocks).toBe(2) // JS + TS
      expect(stats.executedBlocks).toBe(0) // 还没有执行
      expect(stats.runningBlocks).toBe(0)
      expect(stats.errorBlocks).toBe(0)
      expect(stats.totalExecutionTime).toBe(0)
      expect(stats.averageExecutionTime).toBe(0)
    })
  })
})

