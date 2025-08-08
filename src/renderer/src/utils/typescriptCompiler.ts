import * as ts from 'typescript'

export interface CompileResult {
  success: boolean
  code?: string
  error?: string
  diagnostics?: readonly ts.Diagnostic[]
}

export interface CompileOptions {
  target?: ts.ScriptTarget
  module?: ts.ModuleKind
  strict?: boolean
  esModuleInterop?: boolean
  allowSyntheticDefaultImports?: boolean
  skipLibCheck?: boolean
}

class TypeScriptCompiler {
  private defaultOptions: CompileOptions = {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.None,
    strict: false,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    skipLibCheck: true
  }

  /**
   * 编译 TypeScript 代码为 JavaScript
   */
  compile(code: string, options: CompileOptions = {}): CompileResult {
    const compilerOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.None,
      strict: false,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      skipLibCheck: true,
      noEmitOnError: false,
      noImplicitAny: false,
      noImplicitReturns: false,
      noImplicitThis: false,
      noUnusedLocals: false,
      noUnusedParameters: false,
      allowUnusedLabels: true,
      allowUnreachableCode: true,
      strictNullChecks: false,
      strictFunctionTypes: false,
      strictBindCallApply: false,
      strictPropertyInitialization: false,
      noImplicitOverride: false,
      noPropertyAccessFromIndexSignature: false,
      noUncheckedIndexedAccess: false,
      exactOptionalPropertyTypes: false,
      ...options
    }

    try {
      // 直接使用 transpileModule，这是最简单和最可靠的方法
      const result = ts.transpileModule(code, {
        compilerOptions,
        reportDiagnostics: true
      })

      if (result.diagnostics && result.diagnostics.length > 0) {
        const errors = result.diagnostics.map(diagnostic => {
          const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
          if (diagnostic.file && diagnostic.start) {
            const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
            return `Line ${line + 1}, Column ${character + 1}: ${message}`
          }
          return message
        }).join('\n')

        return {
          success: false,
          error: errors,
          diagnostics: result.diagnostics
        }
      }

      return {
        success: true,
        code: result.outputText
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '编译失败'
      }
    }
  }

  /**
   * 检查 TypeScript 代码语法
   */
  checkSyntax(code: string, options: CompileOptions = {}): CompileResult {
    const compilerOptions: ts.CompilerOptions = {
      target: options.target || this.defaultOptions.target,
      module: options.module || this.defaultOptions.module,
      strict: options.strict ?? this.defaultOptions.strict,
      esModuleInterop: options.esModuleInterop ?? this.defaultOptions.esModuleInterop,
      allowSyntheticDefaultImports: options.allowSyntheticDefaultImports ?? this.defaultOptions.allowSyntheticDefaultImports,
      skipLibCheck: options.skipLibCheck ?? this.defaultOptions.skipLibCheck,
      noEmit: true
    }

    try {
      // 添加 console 的类型声明
      const codeWithConsole = `
        declare const console: {
          log(...args: any[]): void;
          error(...args: any[]): void;
          warn(...args: any[]): void;
          info(...args: any[]): void;
        };
        
        ${code}
      `;
      
      // 使用 createProgram 进行完整的类型检查
      const compilerOptions: ts.CompilerOptions = {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.None,
        lib: ['es2020'], // 只使用 ES2020 库
        strict: true, // 启用严格模式
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        skipLibCheck: true,
        noEmit: true,
        noEmitOnError: true, // 错误时不输出
        noImplicitAny: true, // 不允许隐式 any
        noImplicitReturns: true, // 不允许隐式返回
        noImplicitThis: true, // 不允许隐式 this
        noUnusedLocals: false, // 允许未使用的局部变量
        noUnusedParameters: false, // 允许未使用的参数
        allowUnusedLabels: true,
        allowUnreachableCode: true,
        strictNullChecks: true, // 启用严格空值检查
        strictFunctionTypes: true, // 启用严格函数类型检查
        strictBindCallApply: true, // 启用严格 bind/call/apply 检查
        strictPropertyInitialization: true, // 启用严格属性初始化检查
        noImplicitOverride: false,
        noPropertyAccessFromIndexSignature: false,
        noUncheckedIndexedAccess: false,
        exactOptionalPropertyTypes: false
      }

      // 创建源文件
      const sourceFile = ts.createSourceFile(
        'temp.ts',
        codeWithConsole,
        ts.ScriptTarget.ES2020,
        true
      )

      // 创建程序，使用自定义文件系统
      const program = ts.createProgram(['temp.ts'], compilerOptions, {
        getSourceFile: (fileName) => {
          if (fileName === 'temp.ts') {
            return sourceFile
          }
          return undefined
        },
        writeFile: () => {},
        getCurrentDirectory: () => '/',
        getDirectories: () => [],
        fileExists: (fileName) => fileName === 'temp.ts',
        readFile: (fileName) => fileName === 'temp.ts' ? codeWithConsole : undefined,
        getDefaultLibFileName: () => 'lib.d.ts',
        getCanonicalFileName: (fileName) => fileName,
        useCaseSensitiveFileNames: () => false,
        getNewLine: () => '\n'
      })

      // 获取诊断信息
      const diagnostics = ts.getPreEmitDiagnostics(program)

      // 过滤掉库文件相关的错误，只保留用户代码中的错误
      const userCodeErrors = diagnostics.filter(diagnostic => {
        // 只保留与我们的源文件相关的错误
        return diagnostic.file && diagnostic.file.fileName === 'temp.ts'
      })

      if (userCodeErrors.length > 0) {
        const errors = userCodeErrors.map(diagnostic => {
          const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
          if (diagnostic.file && diagnostic.start) {
            const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
            // 调整行号，因为我们添加了类型声明
            const adjustedLine = line - 6 // 减去类型声明的行数
            return `Line ${adjustedLine + 1}, Column ${character + 1}: ${message}`
          }
          return message
        }).join('\n')

        return {
          success: false,
          error: errors,
          diagnostics: userCodeErrors
        }
      }

      return {
        success: true
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '语法检查失败'
      }
    }
  }

  /**
   * 格式化 TypeScript 代码
   */
  format(code: string, options: CompileOptions = {}): string {
    try {
      const compilerOptions: ts.CompilerOptions = {
        target: options.target || this.defaultOptions.target,
        module: options.module || this.defaultOptions.module,
        strict: options.strict ?? this.defaultOptions.strict,
        esModuleInterop: options.esModuleInterop ?? this.defaultOptions.esModuleInterop,
        allowSyntheticDefaultImports: options.allowSyntheticDefaultImports ?? this.defaultOptions.allowSyntheticDefaultImports,
        skipLibCheck: options.skipLibCheck ?? this.defaultOptions.skipLibCheck
      }

      const sourceFile = ts.createSourceFile(
        'temp.ts',
        code,
        compilerOptions.target || ts.ScriptTarget.ES2020,
        true
      )

      const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
        removeComments: false
      })

      return printer.printNode(ts.EmitHint.SourceFile, sourceFile, sourceFile)
    } catch {
      return code
    }
  }

  /**
   * 获取代码的类型信息
   */
  getTypeInfo(code: string, position: number): string | null {
    try {
      const sourceFile = ts.createSourceFile(
        'temp.ts',
        code,
        ts.ScriptTarget.ES2020,
        true
      )

      const program = ts.createProgram(['temp.ts'], {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.None,
        strict: false,
        skipLibCheck: true
      })

      const typeChecker = program.getTypeChecker()
      
      // 使用 getNodeAtPosition 的替代方法
      const findNodeAtPosition = (node: ts.Node, pos: number): ts.Node | null => {
        if (node.getStart() <= pos && pos < node.getEnd()) {
          for (const child of node.getChildren()) {
            const found = findNodeAtPosition(child, pos)
            if (found) return found
          }
          return node
        }
        return null
      }
      
      const node = findNodeAtPosition(sourceFile, position)
      
      if (node) {
        const type = typeChecker.getTypeAtLocation(node)
        return typeChecker.typeToString(type)
      }

      return null
    } catch {
      return null
    }
  }
}

// 创建全局编译器实例
let globalCompiler: TypeScriptCompiler | null = null

export function getTypeScriptCompiler(): TypeScriptCompiler {
  if (!globalCompiler) {
    globalCompiler = new TypeScriptCompiler()
  }
  return globalCompiler
}

// 便捷的编译函数
export function compileTypeScript(
  code: string, 
  options: CompileOptions = {}
): CompileResult {
  const compiler = getTypeScriptCompiler()
  return compiler.compile(code, options)
}

// 便捷的语法检查函数
export function checkTypeScriptSyntax(
  code: string, 
  options: CompileOptions = {}
): CompileResult {
  const compiler = getTypeScriptCompiler()
  return compiler.checkSyntax(code, options)
}

// 便捷的格式化函数
export function formatTypeScript(code: string): string {
  const compiler = getTypeScriptCompiler()
  return compiler.format(code)
}
