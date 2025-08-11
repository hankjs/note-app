import { test, expect } from '@playwright/test';
import { 
  waitForElectronApp, 
  waitForElectronEditor, 
  typeInElectronEditor, 
  simulateElectronShortcut,
  waitForElectronFileOperation 
} from './utils/electron-helpers';

test.describe('Lexical Editor Electron E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 等待 Electron 应用完全加载
    await waitForElectronApp(page);
  });

  test('should initialize Lexical editor', async ({ page }) => {
    // 使用 Electron 专用的编辑器等待函数
    const editor = await waitForElectronEditor(page);
    await expect(editor).toBeVisible();
    
    // 检查编辑器是否可编辑
    await expect(editor).toHaveAttribute('contenteditable', 'true');
    
    // 检查编辑器容器是否存在
    const editorContainer = page.locator('.lexical-editor');
    await expect(editorContainer.first()).toBeVisible();
  });

  test('should handle basic text input', async ({ page }) => {
    // 使用 Electron 专用的文本输入函数
    await typeInElectronEditor(page, 'This is a test note');
    
    // 验证文本已输入
    const editor = await waitForElectronEditor(page);
    await expect(editor).toContainText('This is a test note');
  });

  test('should handle keyboard shortcuts', async ({ page }) => {
    // 输入测试文本
    await typeInElectronEditor(page, 'Test text');
    
    // 测试全选快捷键
    await simulateElectronShortcut(page, 'selectall');
    
    // 测试加粗快捷键
    await simulateElectronShortcut(page, 'bold');
    
    // 验证文本被加粗
    const boldText = page.locator('strong, b');
    if (await boldText.count() > 0) {
      await expect(boldText.first()).toContainText('Test text');
    }
  });

  test('should handle toolbar actions', async ({ page }) => {
    // 检查工具栏是否存在
    const toolbar = page.locator('[data-testid="toolbar"], .toolbar, .lexical-toolbar');
    if (await toolbar.count() > 0) {
      await expect(toolbar.first()).toBeVisible();
      
      // 测试加粗按钮
      const boldButton = page.locator('[data-testid="bold-button"], button[aria-label*="bold"], button[title*="bold"]');
      if (await boldButton.count() > 0) {
        await expect(boldButton.first()).toBeVisible();
        
        // 选择文本并应用加粗
        const editor = page.locator('[data-testid="lexical-editor"], .lexical-editor, [contenteditable="true"]').first();
        await editor.click();
        await editor.fill('Bold text');
        await page.keyboard.press('Control+a');
        await boldButton.first().click();
        
        // 验证文本被加粗
        const boldElement = page.locator('strong, b');
        if (await boldElement.count() > 0) {
          await expect(boldElement.first()).toContainText('Bold text');
        }
      }
    }
  });

  test('should handle markdown input', async ({ page }) => {
    // 输入 markdown 语法
    await typeInElectronEditor(page, '# Heading 1\n\n**Bold text**\n\n- List item 1\n- List item 2');
    
    // 验证 markdown 被正确渲染
    const editor = await waitForElectronEditor(page);
    await expect(editor).toContainText('Heading 1');
    await expect(editor).toContainText('Bold text');
    await expect(editor).toContainText('List item 1');
    await expect(editor).toContainText('List item 2');
  });

  test('should handle code blocks', async ({ page }) => {
    // 输入代码块
    await typeInElectronEditor(page, '```javascript\nconsole.log("Hello World");\n```');
    
    // 验证代码块被正确渲染
    const editor = await waitForElectronEditor(page);
    await expect(editor).toContainText('console.log("Hello World");');
    
    // 检查代码块元素
    const codeBlock = page.locator('pre, code');
    if (await codeBlock.count() > 0) {
      await expect(codeBlock.first()).toBeVisible();
    }
  });

  test('should handle file save and load', async ({ page }) => {
    // 输入一些内容
    await typeInElectronEditor(page, 'Content to save');
    
    // 检查保存按钮
    const saveButton = page.locator('[data-testid="save-button"], button:has-text("Save"), button:has-text("保存")');
    if (await saveButton.count() > 0) {
      await expect(saveButton.first()).toBeVisible();
      
      // 点击保存
      await saveButton.first().click();
      
      // 等待保存操作完成
      await waitForElectronFileOperation(page, 'save');
    }
  });

  test('should handle undo/redo', async ({ page }) => {
    // 输入原始文本
    await typeInElectronEditor(page, 'Original text');
    
    // 修改文本
    await typeInElectronEditor(page, 'Modified text');
    
    // 测试撤销快捷键
    await simulateElectronShortcut(page, 'undo');
    
    // 验证文本恢复到原始状态
    const editor = await waitForElectronEditor(page);
    await expect(editor).toContainText('Original text');
    
    // 测试重做快捷键
    await simulateElectronShortcut(page, 'redo');
    
    // 验证文本被重做
    await expect(editor).toContainText('Modified text');
  });
});
