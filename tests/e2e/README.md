# Playwright E2E 测试

这个目录包含了使用 Playwright 进行端到端测试的测试文件。

## 安装

Playwright 已经安装并配置完成。如果需要重新安装：

```bash
pnpm add -D @playwright/test
npx playwright install
```

## 运行测试

### 基本命令

```bash
# 运行所有 e2e 测试
pnpm test:e2e

# 运行测试并显示 UI 界面
pnpm test:e2e:ui

# 在有头模式下运行测试（可以看到浏览器）
pnpm test:e2e:headed

# 调试模式运行测试
pnpm test:e2e:debug

# 显示测试报告
pnpm test:e2e:report

# 运行所有测试（单元测试 + e2e 测试）
pnpm test:all
```

### 运行特定测试

```bash
# 运行特定测试文件
npx playwright test app.spec.ts

# 运行特定测试
npx playwright test --grep "should load the application"

# 运行特定浏览器
npx playwright test --project=chromium
```

## 测试文件结构

- `app.spec.ts` - 基本应用功能测试
- `lexical-editor.spec.ts` - Lexical 编辑器功能测试
- `utils/test-helpers.ts` - 测试辅助函数
- `screenshots/` - 测试截图目录

## 测试配置

配置文件 `playwright.config.ts` 包含：

- 测试目录：`./tests/e2e`
- 浏览器配置：Chromium、Firefox、WebKit
- 开发服务器配置：自动启动 `pnpm dev`
- 截图和视频配置：失败时自动保存
- 并行测试支持

## 编写测试

### 基本测试结构

```typescript
import { test, expect } from '@playwright/test';

test.describe('功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('应该正确加载', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });
});
```

### 使用测试辅助函数

```typescript
import { waitForEditor, typeInEditor } from './utils/test-helpers';

test('编辑器功能', async ({ page }) => {
  const editor = await waitForEditor(page);
  await typeInEditor(page, '测试文本');
  await expect(editor).toContainText('测试文本');
});
```

## 选择器策略

测试使用多种选择器策略来定位元素：

1. **data-testid**：首选，最稳定
2. **CSS 类名**：备选方案
3. **语义化选择器**：如 `[contenteditable="true"]`
4. **文本内容**：如 `button:has-text("Save")`

## 调试技巧

### 1. 使用 headed 模式

```bash
pnpm test:e2e:headed
```

### 2. 使用调试模式

```bash
pnpm test:e2e:debug
```

### 3. 添加断点

```typescript
test('调试测试', async ({ page }) => {
  await page.pause(); // 在这里暂停
  // ... 测试代码
});
```

### 4. 截图调试

```typescript
import { takeScreenshot } from './utils/test-helpers';

test('截图测试', async ({ page }) => {
  await page.goto('/');
  await takeScreenshot(page, 'homepage');
});
```

## 最佳实践

1. **等待元素加载**：使用 `waitForSelector` 或 `waitForElementVisible`
2. **避免硬编码等待**：使用 `waitFor` 而不是 `waitForTimeout`
3. **使用有意义的测试名称**：描述测试的目的和期望结果
4. **保持测试独立**：每个测试应该可以独立运行
5. **清理测试数据**：在 `afterEach` 中清理测试产生的数据

## 故障排除

### 常见问题

1. **元素找不到**：检查选择器是否正确，元素是否已加载
2. **测试不稳定**：添加适当的等待条件，避免竞态条件
3. **浏览器兼容性**：测试在不同浏览器中的行为

### 获取帮助

- [Playwright 官方文档](https://playwright.dev/)
- [Playwright 测试 API](https://playwright.dev/docs/api/class-test)
- [选择器指南](https://playwright.dev/docs/selectors)
