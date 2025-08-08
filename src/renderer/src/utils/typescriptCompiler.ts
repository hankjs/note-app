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
      // 使用 transpileModule 进行语法检查
      const result = ts.transpileModule(code, {
        compilerOptions: {
          ...compilerOptions,
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
          exactOptionalPropertyTypes: false
        },
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
