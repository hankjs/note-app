import { describe, it, expect } from 'vitest'
import { compileTypeScript, checkTypeScriptSyntax } from '@/utils/typescriptCompiler'

describe('TypeScript Compiler Regression Tests', () => {
  describe('"Unexpected identifier" Error Fix', () => {
    it('should compile interface definitions without "Unexpected identifier" error', () => {
      // 这个测试用例专门用于验证之前出现的 "Unexpected identifier 'User'" 错误已被修复
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
      `

      const result = compileTypeScript(code)
      
      // 验证修复后的编译器能够正确处理接口定义
      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(result.code).toBeDefined()
      expect(result.code).toContain('const user = {')
      expect(result.code).toContain('console.log')
    })

    it('should handle complex TypeScript features without compilation errors', () => {
      // 测试更复杂的 TypeScript 特性
      const code = `
        interface User {
          name: string;
          age: number;
          email?: string;
        }
        
        interface Admin extends User {
          role: string;
          permissions: string[];
        }
        
        function createUser<T extends User>(userData: T): T {
          console.log("创建用户:", userData.name);
          return userData;
        }
        
        const admin: Admin = {
          name: "管理员",
          age: 30,
          role: "admin",
          permissions: ["read", "write", "delete"]
        };
        
        const result = createUser(admin);
        console.log("用户角色:", result.role);
      `

      const result = compileTypeScript(code)
      
      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(result.code).toBeDefined()
      expect(result.code).toContain('function createUser')
      expect(result.code).toContain('console.log')
    })

    it('should handle generic types and interfaces', () => {
      // 测试泛型和接口的组合使用
      const code = `
        interface Container<T> {
          value: T;
          getValue(): T;
        }
        
        class NumberContainer implements Container<number> {
          constructor(public value: number) {}
          
          getValue(): number {
            return this.value;
          }
        }
        
        const container = new NumberContainer(42);
        console.log("容器值:", container.getValue());
      `

      const result = compileTypeScript(code)
      
      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(result.code).toBeDefined()
      expect(result.code).toContain('class NumberContainer')
      expect(result.code).toContain('console.log')
    })

    it('should handle union types and type guards', () => {
      // 测试联合类型和类型守卫
      const code = `
        type StringOrNumber = string | number;
        
        function processValue(value: StringOrNumber): string {
          if (typeof value === "string") {
            return "字符串: " + value;
          } else {
            return "数字: " + value.toString();
          }
        }
        
        console.log(processValue("Hello"));
        console.log(processValue(42));
      `

      const result = compileTypeScript(code)
      
      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(result.code).toBeDefined()
      expect(result.code).toContain('function processValue')
      expect(result.code).toContain('console.log')
    })
  })

  describe('Syntax Check Regression', () => {
    it('should pass syntax check for valid TypeScript with interfaces', () => {
      const code = `
        interface User {
          name: string;
          age: number;
        }
        
        const user: User = {
          name: "张三",
          age: 25
        };
      `

      const result = checkTypeScriptSyntax(code)
      
      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should handle syntax errors gracefully', () => {
      const code = `
        interface User {
          name: string
          age: number // 缺少分号
        }
        
        const user: User = {
          name: "张三"
          age: 25 // 缺少分号
        };
      `

      const result = checkTypeScriptSyntax(code)
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty interface definitions', () => {
      const code = `
        interface EmptyInterface {}
        
        const obj: EmptyInterface = {};
        console.log("空接口对象:", obj);
      `

      const result = compileTypeScript(code)
      
      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(result.code).toBeDefined()
    })

    it('should handle interface with method signatures', () => {
      const code = `
        interface Calculator {
          add(a: number, b: number): number;
          subtract(a: number, b: number): number;
        }
        
        class SimpleCalculator implements Calculator {
          add(a: number, b: number): number {
            return a + b;
          }
          
          subtract(a: number, b: number): number {
            return a - b;
          }
        }
        
        const calc = new SimpleCalculator();
        console.log("1 + 2 =", calc.add(1, 2));
      `

      const result = compileTypeScript(code)
      
      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(result.code).toBeDefined()
      expect(result.code).toContain('class SimpleCalculator')
    })
  })
})
