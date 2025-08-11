import { Page, Locator, expect } from '@playwright/test';

/**
 * Electron-specific test helpers
 * Uses electron-playwright-helpers for better Electron support
 */

/**
 * 等待 Electron 应用完全加载
 */
export async function waitForElectronApp(page: Page): Promise<void> {
  // 等待 Electron 特有的元素加载
  await page.waitForLoadState('domcontentloaded');
  
  // 等待应用渲染完成
  await page.waitForSelector('#app', { timeout: 10000 });
  
  // 等待 Vue 应用挂载
  await page.waitForFunction(() => {
    const appElement = document.querySelector('#app');
    return appElement && appElement.children.length > 0;
  }, { timeout: 10000 });
}

/**
 * 检查是否在 Electron 环境中运行
 */
export async function isElectronEnvironment(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    return typeof window !== 'undefined' && 
           (window.navigator.userAgent.includes('Electron') || 
            (window as any).electronAPI !== undefined);
  });
}

/**
 * 等待 Lexical 编辑器在 Electron 中完全初始化
 */
export async function waitForElectronEditor(page: Page): Promise<Locator> {
  console.log('waitForElectronEditor: 开始等待编辑器')
  
  // 等待编辑器容器 - 注意：contenteditable 在内部的 .editor-container 上
  const editor = page.locator('.editor-container[contenteditable="true"]');
  await editor.first().waitFor({ state: 'visible', timeout: 15000 });
  
  console.log('waitForElectronEditor: 编辑器容器可见')
  
  // 等待编辑器内容区域加载
  await page.waitForFunction(() => {
    const editorElement = document.querySelector('.editor-container[contenteditable="true"]');
    return editorElement && editorElement.children.length > 0;
  }, { timeout: 15000 });
  
  console.log('waitForElectronEditor: 编辑器内容区域已加载')
  
  // 额外等待确保编辑器完全初始化
  await page.waitForTimeout(1000);
  
  // 验证编辑器可以接受输入
  await page.waitForFunction(() => {
    const editorElement = document.querySelector('.editor-container[contenteditable="true"]');
    if (!editorElement) return false;
    
    // 检查编辑器是否有正确的属性
    const isContentEditable = editorElement.getAttribute('contenteditable') === 'true';
    const hasLexicalEditor = editorElement.hasAttribute('data-lexical-editor');
    
    return isContentEditable && hasLexicalEditor;
  }, { timeout: 10000 });
  
  console.log('waitForElectronEditor: 编辑器完全初始化，可以接受输入')
  
  return editor.first();
}

/**
 * 在 Electron 编辑器中输入文本
 */
export async function typeInElectronEditor(page: Page, text: string): Promise<void> {
  const editor = await waitForElectronEditor(page);
  
  // 点击编辑器获取焦点
  await editor.click();
  
  // 等待编辑器完全加载
  await page.waitForTimeout(500);
  
  // 先清空编辑器内容（全选 + 删除）
  await page.keyboard.press('Control+a');
  await page.waitForTimeout(100);
  await page.keyboard.press('Delete');
  
  // 等待清空完成
  await page.waitForTimeout(200);
  
  // 验证编辑器已清空
  const emptyContent = await editor.textContent();
  console.log('Editor content after clearing:', emptyContent);
  
  // 使用 page.keyboard.type 而不是 editor.type，确保 Lexical 编辑器正确接收事件
  await page.keyboard.type(text);
  
  // 等待输入完成
  await page.waitForTimeout(200);
  
  // 验证文本已输入
  const finalContent = await editor.textContent();
  console.log('Editor content after typing:', finalContent);
}

/**
 * 模拟 Electron 应用的键盘快捷键
 */
export async function simulateElectronShortcut(page: Page, shortcut: string): Promise<void> {
  // Electron 在 macOS 上使用 Cmd，在其他平台使用 Ctrl
  const isMac = process.platform === 'darwin';
  const modifier = isMac ? 'Meta' : 'Control';
  
  switch (shortcut.toLowerCase()) {
    case 'save':
      await page.keyboard.press(`${modifier}+s`);
      break;
    case 'new':
      await page.keyboard.press(`${modifier}+n`);
      break;
    case 'open':
      await page.keyboard.press(`${modifier}+o`);
      break;
    case 'selectall':
      await page.keyboard.press(`${modifier}+a`);
      break;
    case 'copy':
      await page.keyboard.press(`${modifier}+c`);
      break;
    case 'paste':
      await page.keyboard.press(`${modifier}+v`);
      break;
    case 'cut':
      await page.keyboard.press(`${modifier}+x`);
      break;
    case 'undo':
      await page.keyboard.press(`${modifier}+z`);
      break;
    case 'redo':
      if (isMac) {
        await page.keyboard.press(`${modifier}+Shift+z`);
      } else {
        await page.keyboard.press(`${modifier}+y`);
      }
      break;
    case 'bold':
      await page.keyboard.press(`${modifier}+b`);
      break;
    case 'italic':
      await page.keyboard.press(`${modifier}+i`);
      break;
    default:
      throw new Error(`Unknown shortcut: ${shortcut}`);
  }
  
  // 等待快捷键操作完成
  await page.waitForTimeout(200);
}

/**
 * 检查 Electron 应用的主题状态
 */
export async function getElectronTheme(page: Page): Promise<string> {
  return await page.evaluate(() => {
    // 检查多种可能的主题属性
    const html = document.documentElement;
    const body = document.body;
    
    if (html.getAttribute('data-theme')) {
      return html.getAttribute('data-theme') || 'light';
    }
    
    if (html.classList.contains('dark')) {
      return 'dark';
    }
    
    if (body.classList.contains('dark')) {
      return 'dark';
    }
    
    // 检查 CSS 变量
    const computedStyle = getComputedStyle(html);
    const themeVar = computedStyle.getPropertyValue('--theme').trim();
    if (themeVar) {
      return themeVar;
    }
    
    return 'light';
  });
}

/**
 * 切换 Electron 应用主题
 */
export async function toggleElectronTheme(page: Page): Promise<string> {
  const initialTheme = await getElectronTheme(page);
  
  // 查找主题切换按钮
  const themeToggle = page.locator('[data-testid="theme-toggle"], .theme-toggle, button[aria-label*="theme"], button[title*="theme"]');
  
  if (await themeToggle.count() > 0) {
    await themeToggle.first().click();
    
    // 等待主题切换完成
    await page.waitForTimeout(300);
    
    const newTheme = await getElectronTheme(page);
    return newTheme;
  }
  
  return initialTheme;
}

/**
 * 等待 Electron 应用的文件操作完成
 */
export async function waitForElectronFileOperation(page: Page, operation: 'save' | 'load' | 'new'): Promise<void> {
  // 等待文件操作相关的 UI 状态变化
  switch (operation) {
    case 'save':
      // 等待保存完成指示器
      await page.waitForSelector('[data-testid="save-indicator"], .save-indicator, .saved', { 
        state: 'visible', 
        timeout: 5000 
      });
      break;
    case 'load':
      // 等待文件加载完成
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      break;
    case 'new':
      // 等待新文件创建完成
      await page.waitForTimeout(1000);
      break;
  }
}

/**
 * 检查 Electron 应用的响应式布局
 */
export async function testElectronResponsiveLayout(page: Page): Promise<void> {
  const viewports = [
    { width: 1280, height: 720 },   // 桌面
    { width: 1024, height: 768 },   // 小桌面
    { width: 800, height: 600 },    // 平板
    { width: 375, height: 667 },    // 手机
  ];
  
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(500);
    
    // 检查应用是否仍然可用
    await expect(page.locator('body')).toBeVisible();
    
    // 检查主要元素是否可见
    const mainContent = page.locator('[data-testid="main-content"], .main-content, main, #app');
    if (await mainContent.count() > 0) {
      await expect(mainContent.first()).toBeVisible();
    }
  }
  
  // 恢复默认尺寸
  await page.setViewportSize({ width: 1280, height: 720 });
}

/**
 * 获取 Electron 应用的控制台日志
 */
export async function getElectronConsoleLogs(page: Page): Promise<string[]> {
  const logs: string[] = [];
  
  page.on('console', msg => {
    logs.push(`${msg.type()}: ${msg.text()}`);
  });
  
  return logs;
}

/**
 * 检查 Electron 应用是否有错误
 */
export async function checkElectronErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  
  return errors;
}

/**
 * 测试退格键功能
 */
export async function testBackspaceKey(page: Page, text: string, deleteCount: number): Promise<void> {
  const editor = await waitForElectronEditor(page);
  
  // 输入文本
  await typeInElectronEditor(page, text);
  
  // 验证文本已输入
  await expect(editor).toContainText(text);
  
  // 将光标移动到文本末尾
  await editor.click();
  await page.keyboard.press('End');
  
  // 按退格键删除指定数量的字符
  for (let i = 0; i < deleteCount; i++) {
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(50); // 短暂等待确保删除操作完成
  }
  
  // 验证删除结果
  const expectedText = text.slice(0, -deleteCount);
  if (expectedText) {
    await expect(editor).toContainText(expectedText);
  } else {
    await expect(editor).toHaveText('');
  }
}

/**
 * 测试删除键功能
 */
export async function testDeleteKey(page: Page, text: string, deleteCount: number): Promise<void> {
  const editor = await waitForElectronEditor(page);
  
  // 输入文本
  await typeInElectronEditor(page, text);
  
  // 验证文本已输入
  await expect(editor).toContainText(text);
  
  // 将光标移动到文本开头
  await editor.click();
  await page.keyboard.press('Home');
  
  // 按删除键删除指定数量的字符
  for (let i = 0; i < deleteCount; i++) {
    await page.keyboard.press('Delete');
    await page.waitForTimeout(50); // 短暂等待确保删除操作完成
  }
  
  // 验证删除结果
  const expectedText = text.slice(deleteCount);
  if (expectedText) {
    await expect(editor).toContainText(expectedText);
  } else {
    await expect(editor).toHaveText('');
  }
}

/**
 * 测试光标移动和文本选择
 */
export async function testCursorMovement(page: Page, text: string): Promise<void> {
  const editor = await waitForElectronEditor(page);
  
  // 输入文本
  await typeInElectronEditor(page, text);
  
  // 测试光标移动到开头
  await editor.click();
  await page.keyboard.press('Home');
  
  // 测试光标移动到末尾
  await page.keyboard.press('End');
  
  // 测试光标向左移动
  await page.keyboard.press('ArrowLeft');
  
  // 测试光标向右移动
  await page.keyboard.press('ArrowRight');
  
  // 测试全选
  await simulateElectronShortcut(page, 'selectall');
  
  // 验证文本被选中
  await expect(editor).toContainText(text);
}
