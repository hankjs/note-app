import { test, expect } from '@playwright/test';
import { 
  waitForElectronApp, 
  waitForElectronEditor, 
  typeInElectronEditor, 
  testBackspaceKey,
  testDeleteKey,
  testCursorMovement
} from './utils/electron-helpers';

test.describe('Keyboard Input Tests - Focus on Backspace/Delete Issues', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 等待 Electron 应用完全加载
    await waitForElectronApp(page);
  });

  test('should handle basic backspace key functionality', async ({ page }) => {
    // 测试基本的退格键功能
    await testBackspaceKey(page, 'Hello World', 5);
    
    // 验证结果：应该只剩下 "Hello "
    const editor = await waitForElectronEditor(page);
    await expect(editor).toContainText('Hello ');
    await expect(editor).not.toContainText('World');
  });

  test('should handle backspace at cursor position', async ({ page }) => {
    const editor = await waitForElectronEditor(page);
    
    // 输入测试文本
    await typeInElectronEditor(page, 'Testing Backspace');
    
    // 将光标移动到 "Backspace" 前面
    await editor.click();
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    
    // 按退格键删除 "Testing "
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    
    // 验证结果
    await expect(editor).toContainText('Backspace');
    await expect(editor).not.toContainText('Testing');
  });

  test('should handle delete key functionality', async ({ page }) => {
    // 测试删除键功能
    await testDeleteKey(page, 'Delete Test Text', 6);
    
    // 验证结果：应该只剩下 "Test Text"
    const editor = await waitForElectronEditor(page);
    await expect(editor).toContainText('Test Text');
    await expect(editor).not.toContainText('Delete');
  });

  test('should handle delete at cursor position', async ({ page }) => {
    const editor = await waitForElectronEditor(page);
    
    // 输入测试文本
    await typeInElectronEditor(page, 'Cursor Delete Test');
    
    // 将光标移动到 "Delete" 前面
    await editor.click();
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    
    // 按删除键删除 "Cursor "
    await page.keyboard.press('Delete');
    await page.keyboard.press('Delete');
    await page.keyboard.press('Delete');
    await page.keyboard.press('Delete');
    await page.keyboard.press('Delete');
    await page.keyboard.press('Delete');
    await page.keyboard.press('Delete');
    
    // 验证结果
    await expect(editor).toContainText('Delete Test');
    await expect(editor).not.toContainText('Cursor');
  });

  test('should handle backspace with empty editor', async ({ page }) => {
    const editor = await waitForElectronEditor(page);
    
    // 清空编辑器
    await editor.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
    
    // 验证编辑器为空
    await expect(editor).toHaveText('');
    
    // 尝试按退格键（不应该崩溃）
    await page.keyboard.press('Backspace');
    
    // 验证编辑器仍然为空
    await expect(editor).toHaveText('');
  });

  test('should handle delete with empty editor', async ({ page }) => {
    const editor = await waitForElectronEditor(page);
    
    // 清空编辑器
    await editor.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
    
    // 验证编辑器为空
    await expect(editor).toHaveText('');
    
    // 尝试按删除键（不应该崩溃）
    await page.keyboard.press('Delete');
    
    // 验证编辑器仍然为空
    await expect(editor).toHaveText('');
  });

  test('should handle cursor movement and text selection', async ({ page }) => {
    // 测试光标移动和文本选择功能
    await testCursorMovement(page, 'Cursor Movement Test');
  });

  test('should handle backspace after text selection', async ({ page }) => {
    const editor = await waitForElectronEditor(page);
    
    // 输入测试文本
    await typeInElectronEditor(page, 'Select and Delete Text');
    
    // 选择 "Select and " 部分
    await editor.click();
    await page.keyboard.press('Home');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    
    // 按退格键删除选中的文本
    await page.keyboard.press('Backspace');
    
    // 验证结果
    await expect(editor).toContainText('Delete Text');
    await expect(editor).not.toContainText('Select and');
  });

  test('should handle delete after text selection', async ({ page }) => {
    const editor = await waitForElectronEditor(page);
    
    // 输入测试文本
    await typeInElectronEditor(page, 'Select and Delete Text');
    
    // 选择 " and Delete" 部分
    await editor.click();
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    
    // 按删除键删除选中的文本
    await page.keyboard.press('Delete');
    
    // 验证结果
    await expect(editor).toContainText('Select Text');
    await expect(editor).not.toContainText('and Delete');
  });

  test('should handle multiple backspace operations', async ({ page }) => {
    const editor = await waitForElectronEditor(page);
    
    // 输入测试文本
    await typeInElectronEditor(page, 'Multiple Backspace Test');
    
    // 将光标移动到末尾
    await editor.click();
    await page.keyboard.press('End');
    
    // 连续按退格键删除整个文本
    const textLength = 'Multiple Backspace Test'.length;
    for (let i = 0; i < textLength; i++) {
      await page.keyboard.press('Backspace');
      await page.waitForTimeout(30); // 短暂等待
    }
    
    // 验证编辑器为空
    await expect(editor).toHaveText('');
  });

  test('should handle multiple delete operations', async ({ page }) => {
    const editor = await waitForElectronEditor(page);
    
    // 输入测试文本
    await typeInElectronEditor(page, 'Multiple Delete Test');
    
    // 将光标移动到开头
    await editor.click();
    await page.keyboard.press('Home');
    
    // 连续按删除键删除整个文本
    const textLength = 'Multiple Delete Test'.length;
    for (let i = 0; i < textLength; i++) {
      await page.keyboard.press('Delete');
      await page.waitForTimeout(30); // 短暂等待
    }
    
    // 验证编辑器为空
    await expect(editor).toHaveText('');
  });
});
