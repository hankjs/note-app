import { Page, Locator } from '@playwright/test';

/**
 * 等待编辑器加载完成
 */
export async function waitForEditor(page: Page): Promise<Locator> {
  const editor = page.locator('[data-testid="lexical-editor"], .lexical-editor, [contenteditable="true"]');
  await editor.first().waitFor({ state: 'visible', timeout: 10000 });
  return editor.first();
}

/**
 * 在编辑器中输入文本
 */
export async function typeInEditor(page: Page, text: string): Promise<void> {
  const editor = await waitForEditor(page);
  await editor.click();
  await editor.fill(text);
}

/**
 * 选择编辑器中的所有文本
 */
export async function selectAllText(page: Page): Promise<void> {
  const editor = await waitForEditor(page);
  await editor.click();
  await page.keyboard.press('Control+a');
}

/**
 * 检查元素是否存在
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  const element = page.locator(selector);
  return await element.count() > 0;
}

/**
 * 等待主题切换完成
 */
export async function waitForThemeChange(page: Page): Promise<void> {
  await page.waitForTimeout(200);
}

/**
 * 获取当前主题
 */
export async function getCurrentTheme(page: Page): Promise<string> {
  return await page.evaluate(() => {
    return document.documentElement.getAttribute('data-theme') || 
           document.documentElement.getAttribute('class')?.includes('dark') ? 'dark' : 'light';
  });
}

/**
 * 切换主题
 */
export async function toggleTheme(page: Page): Promise<void> {
  const themeToggle = page.locator('[data-testid="theme-toggle"], .theme-toggle, button[aria-label*="theme"]');
  if (await elementExists(page, '[data-testid="theme-toggle"], .theme-toggle, button[aria-label*="theme"]')) {
    await themeToggle.first().click();
    await waitForThemeChange(page);
  }
}

/**
 * 等待页面加载完成
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

/**
 * 截图并保存
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `tests/e2e/screenshots/${name}.png` });
}

/**
 * 检查控制台错误
 */
export async function checkConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  return errors;
}

/**
 * 模拟用户输入延迟
 */
export async function simulateTyping(page: Page, selector: string, text: string, delay: number = 100): Promise<void> {
  const element = page.locator(selector);
  await element.click();
  
  for (const char of text) {
    await element.type(char);
    await page.waitForTimeout(delay);
  }
}

/**
 * 等待元素可见
 */
export async function waitForElementVisible(page: Page, selector: string, timeout: number = 5000): Promise<Locator> {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible', timeout });
  return element;
}

/**
 * 检查响应式布局
 */
export async function testResponsiveLayout(page: Page, viewports: Array<{ width: number; height: number }>): Promise<void> {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(500);
    
    // 检查页面是否仍然可见
    await expect(page.locator('body')).toBeVisible();
  }
}
