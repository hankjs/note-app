import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getCodeSandbox, disposeCodeSandbox, executeCode } from '@/utils/codeSandbox'

describe('Code Sandbox', () => {
  let sandbox: any

  beforeEach(() => {
    sandbox = getCodeSandbox()
  })

  afterEach(() => {
    disposeCodeSandbox()
  })

  describe('JavaScript Execution', () => {
    it('should execute simple JavaScript code', async () => {
      const code = 'console.log("Hello, World!"); const result = 1 + 2; result;'
      
      const result = await executeCode(code, { language: 'javascript' })
      
      expect(result.success).toBe(true)
      expect(result.outputs).toHaveLength(1)
      expect(result.outputs[0].content).toBe('Hello, World!')
      expect(result.result).toBe(3)
    })

    it('should handle JavaScript errors', async () => {
      const code = 'console.log("Before error"); throw new Error("Test error"); console.log("After error");'
      
      const result = await executeCode(code, { language: 'javascript' })
      
      expect(result.success).toBe(false)
      expect(result.outputs).toHaveLength(2)
      expect(result.outputs[0].content).toBe('Before error')
      expect(result.outputs[1].type).toBe('error')
      expect(result.outputs[1].content).toContain('Test error')
    })

    it('should respect timeout', async () => {
      const code = 'while(true) { console.log("Infinite loop"); }'
      
      const result = await executeCode(code, { 
        language: 'javascript',
        timeout: 100 // 100ms 超时
      })
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('timeout')
    })

    it('should capture console outputs', async () => {
      const code = `
        console.log("Info message");
        console.warn("Warning message");
        console.error("Error message");
        console.info("Info message 2");
      `
      
      const result = await executeCode(code, { language: 'javascript' })
      
      expect(result.success).toBe(true)
      expect(result.outputs).toHaveLength(4)
      expect(result.outputs[0].content).toBe('Info message')
      expect(result.outputs[1].content).toBe('Warning message')
      expect(result.outputs[2].content).toBe('Error message')
      expect(result.outputs[3].content).toBe('Info message 2')
    })
  })

  describe('TypeScript Execution', () => {
    it('should compile and execute TypeScript code', async () => {
      const code = `
        interface User {
          name: string;
          age: number;
        }
        
        const user: User = {
          name: "张三",
          age: 25
        };
        
        console.log("用户: " + user.name + ", 年龄: " + user.age);
        user.age;
      `
      
      const result = await executeCode(code, { language: 'typescript' })
      
      expect(result.success).toBe(true)
      expect(result.outputs).toHaveLength(1)
      expect(result.outputs[0].content).toBe('用户: 张三, 年龄: 25')
      expect(result.result).toBe(25)
    })

    it('should handle TypeScript compilation errors', async () => {
      const code = `
        const user: User = {
          name: "张三",
          age: "25" // 类型错误
        };
      `
      
      const result = await executeCode(code, { language: 'typescript' })
      
      expect(result.success).toBe(false)
      expect(result.outputs).toHaveLength(1)
      expect(result.outputs[0].type).toBe('error')
      expect(result.outputs[0].content).toContain('TypeScript 编译失败')
    })

    it('should handle TypeScript syntax errors', async () => {
      const code = `
        const user = {
          name: "张三"
          age: 25 // 缺少分号
        };
      `
      
      const result = await executeCode(code, { language: 'typescript' })
      
      expect(result.success).toBe(false)
      expect(result.outputs).toHaveLength(1)
      expect(result.outputs[0].type).toBe('error')
    })
  })

  describe('Safe Execution Environment', () => {
    it('should provide safe global objects', async () => {
      const code = `
        console.log("Math:", typeof Math);
        console.log("JSON:", typeof JSON);
        console.log("Date:", typeof Date);
        console.log("Array:", typeof Array);
        console.log("Object:", typeof Object);
        console.log("Promise:", typeof Promise);
      `
      
      const result = await executeCode(code, { language: 'javascript' })
      
      expect(result.success).toBe(true)
      expect(result.outputs).toHaveLength(6)
      expect(result.outputs[0].content).toBe('Math: object')
      expect(result.outputs[1].content).toBe('JSON: object')
      expect(result.outputs[2].content).toBe('Date: function')
      expect(result.outputs[3].content).toBe('Array: function')
      expect(result.outputs[4].content).toBe('Object: function')
      expect(result.outputs[5].content).toBe('Promise: function')
    })

    it('should limit setTimeout delay', async () => {
      const code = `
        const id = setTimeout(() => console.log("Delayed"), 10000);
        console.log("Timeout ID:", id);
        clearTimeout(id);
        console.log("Timeout cleared");
      `
      
      const result = await executeCode(code, { language: 'javascript' })
      
      expect(result.success).toBe(true)
      expect(result.outputs).toHaveLength(3)
      expect(result.outputs[0].content).toContain('Timeout ID:')
      expect(result.outputs[2].content).toBe('Timeout cleared')
    })

    it('should limit setInterval delay', async () => {
      const code = `
        const id = setInterval(() => console.log("Interval"), 5000);
        console.log("Interval ID:", id);
        clearInterval(id);
        console.log("Interval cleared");
      `
      
      const result = await executeCode(code, { language: 'javascript' })
      
      expect(result.success).toBe(true)
      expect(result.outputs).toHaveLength(3)
      expect(result.outputs[0].content).toContain('Interval ID:')
      expect(result.outputs[2].content).toBe('Interval cleared')
    })
  })

  describe('HTML Rendering', () => {
    it('should render safe HTML', async () => {
      const code = `
        const html = '<div>Hello <strong>World</strong></div>';
        console.log(html);
      `
      
      const result = await executeCode(code, { language: 'javascript' })
      
      expect(result.success).toBe(true)
      expect(result.outputs).toHaveLength(1)
      expect(result.outputs[0].content).toBe('<div>Hello <strong>World</strong></div>')
    })
  })
})
