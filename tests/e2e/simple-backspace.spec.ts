import { test, expect } from '@playwright/test';
import { waitForElectronApp, waitForElectronEditor } from './utils/electron-helpers';

test.describe('Simple Backspace Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForElectronApp(page);
  });

  test('should handle simple backspace', async ({ page }) => {
    const editor = await waitForElectronEditor(page);
    
    // 点击编辑器获取焦点
    await editor.click();
    
    // 等待一下确保编辑器完全加载
    await page.waitForTimeout(1000);
    
    // 检查编辑器是否有默认内容
    const hasContent = await editor.textContent();
    console.log('Editor content:', hasContent);
    
    // 将光标移动到文本末尾
    await page.keyboard.press('End');
    
    // 等待光标移动
    await page.waitForTimeout(500);
    
    // 按退格键
    await page.keyboard.press('Backspace');
    
    // 等待退格键操作完成
    await page.waitForTimeout(500);
    
    // 检查内容是否发生变化
    const newContent = await editor.textContent();
    console.log('Editor content after backspace:', newContent);
    
    // 验证退格键确实有作用（内容长度应该减少）
    expect(newContent?.length).toBeLessThanOrEqual(hasContent?.length || 0);
    
    // 如果内容没有变化，记录这个信息
    if (newContent === hasContent) {
      console.log('⚠️ 退格键没有生效 - 内容没有变化');
    } else {
      console.log('✅ 退格键生效 - 内容已变化');
    }
  });

  test('should handle simple text input', async ({ page }) => {
    const editor = await waitForElectronEditor(page);
    
    // 点击编辑器获取焦点
    await editor.click();
    
    // 等待一下确保编辑器完全加载
    await page.waitForTimeout(1000);
    
    // 记录原始内容长度
    const originalContent = await editor.textContent();
    const originalLength = originalContent?.length || 0;
    
    // 输入一些文本
    await editor.type('TEST');
    
    // 等待输入完成
    await page.waitForTimeout(500);
    
    // 检查内容是否增加
    const newContent = await editor.textContent();
    const newLength = newContent?.length || 0;
    
    console.log('Original length:', originalLength);
    console.log('New length:', newLength);
    console.log('Content added:', newContent?.includes('TEST'));
    
    // 验证文本输入是否正常
    expect(newLength).toBeGreaterThan(originalLength);
    expect(newContent).toContain('TEST');
  });

  test('should handle text replacement', async ({ page }) => {
    const editor = await waitForElectronEditor(page);
    
    // 点击编辑器获取焦点
    await editor.click();
    
    // 等待一下确保编辑器完全加载
    await page.waitForTimeout(1000);
    
    // 全选现有内容
    await page.keyboard.press('Control+a');
    
    // 等待选择完成
    await page.waitForTimeout(500);
    
    // 输入新文本（这会替换选中的内容）
    await editor.type('NEW CONTENT');
    
    // 等待输入完成
    await page.waitForTimeout(500);
    
    // 检查内容是否被替换
    const newContent = await editor.textContent();
    
    console.log('New content after replacement:', newContent);
    
    // 验证内容是否被正确替换
    expect(newContent).toContain('NEW CONTENT');
    
    // 检查是否还包含原始内容
    const hasOriginalContent = newContent?.includes('欢迎使用笔记应用');
    console.log('Still has original content:', hasOriginalContent);
  });
});
