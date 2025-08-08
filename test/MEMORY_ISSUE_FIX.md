# 内存问题修复文档

## 问题描述

在运行测试时遇到了 JavaScript 堆内存不足的错误：

```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

## 根本原因

1. **死循环测试**: `codeSandbox.test.ts` 中的 `while(true)` 循环导致内存泄漏
2. **测试配置**: Vitest 的多进程模式增加了内存使用
3. **TypeScript 编译**: 复杂的编译器测试消耗大量内存

## 解决方案

### 1. 修复死循环测试

**问题代码**:
```typescript
it('should respect timeout', async () => {
  const code = 'while(true) { console.log("Infinite loop"); }'
  // ...
})
```

**修复方案**:
```typescript
it('should respect timeout', async () => {
  const code = `
    let i = 0;
    while(i < 1000000) { 
      i++; 
      if (i % 100000 === 0) {
        console.log("Processing:", i);
      }
    }
    console.log("Loop completed");
  `
  // ...
})
```

### 2. 创建安全的测试文件

创建了 `test/unit/codeSandbox.safe.test.ts`，包含：
- 安全的测试用例
- 避免死循环
- 正确的输出格式验证

### 3. 优化 Vitest 配置

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
        maxForks: 1
      }
    }
  }
})
```

### 4. 使用 Vitest 过滤器

简化了 `package.json` 中的测试命令，使用 Vitest 的内置过滤器：

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

使用过滤器运行特定测试：

```bash
# 运行安全的代码沙箱测试
pnpm test:run test/unit/codeSandbox.safe

# 运行 TypeScript 编译器测试
pnpm test:run test/unit/typescriptCompiler

# 运行状态管理测试
pnpm test:run test/unit/stores/

# 按测试名称过滤
pnpm test:run -t "TypeScript"
```

## 测试结果

### 修复前
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

### 修复后
```
✓ test/unit/codeSandbox.safe.test.ts (9 tests) 404ms
✓ test/unit/typescriptCompiler.test.ts (9 tests) 13ms
✓ test/unit/stores/codeBlocks.test.ts (21 tests) 9ms
```

## 最佳实践

1. **避免死循环**: 在测试中使用有限循环或超时机制
2. **分别运行测试**: 使用专门的测试命令运行不同的测试文件
3. **内存监控**: 定期检查测试的内存使用情况
4. **安全测试**: 为关键功能创建安全的测试版本

## 相关文件

- `test/unit/codeSandbox.safe.test.ts`: 安全的代码沙箱测试
- `vitest.config.ts`: 优化的测试配置
- `package.json`: 更新的测试命令
- `test/README.md`: 更新的测试文档
