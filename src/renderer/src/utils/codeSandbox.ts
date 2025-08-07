export interface CodeOutput {
  type: 'console' | 'html' | 'chart' | 'image' | 'table' | 'error'
  content: any
  timestamp: number
  level?: 'log' | 'warn' | 'error' | 'info'
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
}

class CodeSandbox {
  private outputs: CodeOutput[] = []
  private consoleProxy: any

  constructor() {
    this.setupConsoleProxy()
  }

  private setupConsoleProxy() {
    this.consoleProxy = {
      log: (...args: any[]) => this.addOutput('console', args, 'log'),
      warn: (...args: any[]) => this.addOutput('console', args, 'warn'),
      error: (...args: any[]) => this.addOutput('console', args, 'error'),
      info: (...args: any[]) => this.addOutput('console', args, 'info'),
      table: (data: any) => this.addOutput('table', data),
      clear: () => this.outputs = []
    }
  }

  private addOutput(type: CodeOutput['type'], content: any, level?: CodeOutput['level']) {
    this.outputs.push({
      type,
      content,
      level,
      timestamp: Date.now()
    })
  }

  async executeCode(code: string, context: ExecutionContext = {}): Promise<ExecutionResult> {
    const startTime = Date.now()
    this.outputs = []

    try {
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
      const executeFunction = new Function(...Object.keys(safeGlobals), code)
      
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
