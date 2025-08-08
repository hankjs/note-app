export interface CodeOutput {
  type: 'console' | 'html' | 'chart' | 'image' | 'table' | 'error'
  content: any
  timestamp: number
  level?: 'log' | 'warn' | 'error' | 'info'
  lineNumber?: number // 添加行数信息
}

export interface ExecutionResult {
  success: boolean
  outputs: CodeOutput[]
  executionTime: number
  error?: string
  result?: any
}

export interface ExecutionContext {
  timeout?: number
  memoryLimit?: number
  allowNetwork?: boolean
  allowFileSystem?: boolean
  language?: 'javascript' | 'typescript'
}

class CodeSandbox {
  private outputs: CodeOutput[] = []
  private consoleProxy: any

  constructor() {
    this.setupConsoleProxy()
  }

  private setupConsoleProxy() {
    this.consoleProxy = {
      log: (...args: any[]) => {
        const lineNumber = this.getCallerLineNumber()
        this.addOutput('console', args, 'log', lineNumber)
      },
      warn: (...args: any[]) => {
        const lineNumber = this.getCallerLineNumber()
        this.addOutput('console', args, 'warn', lineNumber)
      },
      error: (...args: any[]) => {
        const lineNumber = this.getCallerLineNumber()
        this.addOutput('console', args, 'error', lineNumber)
      },
      info: (...args: any[]) => {
        const lineNumber = this.getCallerLineNumber()
        this.addOutput('console', args, 'info', lineNumber)
      },
      table: (data: any) => {
        const lineNumber = this.getCallerLineNumber()
        this.addOutput('table', data, undefined, lineNumber)
      },
      clear: () => this.outputs = []
    }
  }

  private getCallerLineNumber(): number | undefined {
    try {
      const stack = new Error().stack
      if (!stack) return undefined
      
      const lines = stack.split('\n')
      // 查找包含用户代码的行（跳过前几行系统调用）
      for (let i = 3; i < lines.length; i++) {
        const line = lines[i]
        // 如果行包含 eval 或 Function，说明是用户代码
        if (line.includes('eval') || line.includes('Function')) {
          // 尝试提取行号
          const match = line.match(/:(\d+):(\d+)/)
          if (match) {
            return parseInt(match[1])
          }
        }
      }
      return undefined
    } catch {
      return undefined
    }
  }

  private addOutput(type: CodeOutput['type'], content: any, level?: CodeOutput['level'], lineNumber?: number) {
    this.outputs.push({
      type,
      content,
      level,
      timestamp: Date.now(),
      lineNumber
    })
  }

  async executeCode(code: string, context: ExecutionContext = {}): Promise<ExecutionResult> {
    debugger
    const startTime = Date.now()
    this.outputs = []

    try {
      let executableCode = code

      // 如果是 TypeScript，先编译
      if (context.language === 'typescript') {
        const { compileTypeScript } = await import('./typescriptCompiler')
        const compileResult = compileTypeScript(code)
        
        if (!compileResult.success) {
          return {
            success: false,
            outputs: [{
              type: 'error',
              content: compileResult.error || 'TypeScript 编译失败',
              timestamp: Date.now()
            }],
            executionTime: Date.now() - startTime,
            error: compileResult.error
          }
        }
        
        executableCode = compileResult.code || code
      }

      // 创建安全的执行环境
      const safeGlobals = {
        console: this.consoleProxy,
        setTimeout: (fn: Function, delay: number) => {
          return setTimeout(() => {
            try {
              fn()
            } catch (error) {
              this.addOutput('error', error instanceof Error ? error.message : String(error))
            }
          }, Math.min(delay, 5000))
        },
        setInterval: (fn: Function, delay: number) => {
          return setInterval(() => {
            try {
              fn()
            } catch (error) {
              this.addOutput('error', error instanceof Error ? error.message : String(error))
            }
          }, Math.min(delay, 1000))
        },
        clearTimeout: (id: number) => clearTimeout(id),
        clearInterval: (id: number) => clearInterval(id),
        Math: Math,
        JSON: JSON,
        Date: Date,
        Array: Array,
        Object: Object,
        String: String,
        Number: Number,
        Boolean: Boolean,
        RegExp: RegExp,
        Error: Error,
        Promise: Promise,
        Map: Map,
        Set: Set,
        WeakMap: WeakMap,
        WeakSet: WeakSet,
        Symbol: Symbol,
        Proxy: Proxy,
        Reflect: Reflect,
        Intl: Intl,
        parseInt: parseInt,
        parseFloat: parseFloat,
        isNaN: isNaN,
        isFinite: isFinite,
        escape: escape,
        unescape: unescape,
        encodeURI: encodeURI,
        encodeURIComponent: encodeURIComponent,
        decodeURI: decodeURI,
        decodeURIComponent: decodeURIComponent
      }

      // 设置超时
      const timeout = context.timeout || 5000
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Execution timeout')), timeout)
      })

      // 创建执行函数
      const executeFunction = new Function(...Object.keys(safeGlobals), executableCode)
      
      // 执行代码
      const executionPromise = Promise.resolve(executeFunction(...Object.values(safeGlobals)))
      
      const result = await Promise.race([executionPromise, timeoutPromise])
      
      const executionTime = Date.now() - startTime

      return {
        success: true,
        outputs: [...this.outputs],
        executionTime,
        result
      }

    } catch (error) {
      const executionTime = Date.now() - startTime
      
      this.addOutput('error', error instanceof Error ? error.message : String(error))

      return {
        success: false,
        outputs: [...this.outputs],
        executionTime,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  // 安全的 HTML 渲染
  renderHTML(html: string): string {
    // 简单的 HTML 过滤，移除危险的标签和属性
    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button']
    const dangerousAttributes = ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus']
    
    let safeHTML = html
    
    // 移除危险标签
    dangerousTags.forEach(tag => {
      const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gis')
      safeHTML = safeHTML.replace(regex, '')
    })
    
    // 移除危险属性
    dangerousAttributes.forEach(attr => {
      const regex = new RegExp(`${attr}=["'][^"']*["']`, 'gi')
      safeHTML = safeHTML.replace(regex, '')
    })
    
    return safeHTML
  }

  // 清理资源
  dispose() {
    this.outputs = []
  }
}

// 创建全局沙箱实例
let globalSandbox: CodeSandbox | null = null

export function getCodeSandbox(): CodeSandbox {
  if (!globalSandbox) {
    globalSandbox = new CodeSandbox()
  }
  return globalSandbox
}

export function disposeCodeSandbox() {
  if (globalSandbox) {
    globalSandbox.dispose()
    globalSandbox = null
  }
}

// 便捷的执行函数
export async function executeCode(
  code: string, 
  context: ExecutionContext = {}
): Promise<ExecutionResult> {
  const sandbox = getCodeSandbox()
  return sandbox.executeCode(code, context)
}

// 安全的 HTML 渲染函数
export function renderSafeHTML(html: string): string {
  const sandbox = getCodeSandbox()
  return sandbox.renderHTML(html)
}
