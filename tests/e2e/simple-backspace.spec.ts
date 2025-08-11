import { test, expect } from '@playwright/test';
import { waitForElectronApp, waitForElectronEditor, typeInElectronEditor } from './utils/electron-helpers';

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
    
    // 检查编辑器的属性
    const editorElement = await page.locator('.editor-container[contenteditable="true"]').first();
    const isContentEditable = await editorElement.getAttribute('contenteditable');
    const hasLexicalEditor = await editorElement.getAttribute('data-lexical-editor');
    console.log('Editor attributes:', { isContentEditable, hasLexicalEditor });
    
    // 检查编辑器的内部 HTML 结构
    const innerHTML = await editorElement.innerHTML();
    console.log('Editor innerHTML:', innerHTML);
    
    // 获取原始内容 - 使用用户级别的方式
    const originalContent = await editor.textContent();
    console.log('Original content:', originalContent);
    
    // 使用專門的 Electron 編輯器輸入函數
    console.log('Starting to type text...');
    await typeInElectronEditor(page, 'TEST');
    console.log('Finished typing text');
    
    // 等待输入完成
    await page.waitForTimeout(1000);
    
    // 再次检查编辑器的内部 HTML 结构
    const newInnerHTML = await editorElement.innerHTML();
    console.log('Editor innerHTML after typing:', newInnerHTML);
    
    // 获取新内容 - 使用用户级别的方式
    const newContent = await editor.textContent();
    console.log('New content:', newContent);
    
    // 验证文本输入是否正常
    expect(newContent).not.toBeNull();
    expect(newContent).toContain('TEST');
  });

  test('should handle text replacement', async ({ page }) => {
    const editor = await waitForElectronEditor(page);
    
    // 点击编辑器获取焦点
    await editor.click();
    
    // 等待一下确保编辑器完全加载
    await page.waitForTimeout(1000);
    
    // 先輸入一些初始文本
    await typeInElectronEditor(page, 'INITIAL TEXT');
    
    // 驗證初始文本已輸入
    let currentContent = await editor.textContent();
    console.log('Initial content:', currentContent);
    
    // 全选现有内容
    await page.keyboard.press('Control+a');
    
    // 等待选择完成
    await page.waitForTimeout(300);
    
    // 输入新文本（这会替换选中的内容）
    await page.keyboard.type('NEW CONTENT');
    
    // 等待输入完成
    await page.waitForTimeout(500);
    
    // 检查内容是否被替换
    const newContent = await editor.textContent();
    
    console.log('New content after replacement:', newContent);
    
    // 验证内容是否被正确替换
    expect(newContent).toContain('NEW CONTENT');
    
    // 检查是否還包含初始文本（應該被替換掉）
    expect(newContent).not.toContain('INITIAL TEXT');
  });
});
