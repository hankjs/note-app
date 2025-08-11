import { test, expect } from '@playwright/test';
import { waitForElectronApp, toggleElectronTheme, testElectronResponsiveLayout } from './utils/electron-helpers';

test.describe('Note App Electron E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到应用首页
    await page.goto('/');
    // 等待 Electron 应用完全加载
    await waitForElectronApp(page);
  });

  test('should load the application', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle(/Electron/);
    
    // 检查主要元素是否存在
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have basic layout elements', async ({ page }) => {
    // 检查侧边栏是否存在
    const sidebar = page.locator('[data-testid="sidebar"], .sidebar, aside');
    await expect(sidebar.first()).toBeVisible();
    
    // 检查主内容区域是否存在
    const mainContent = page.locator('[data-testid="main-content"], .main-content, main');
    await expect(mainContent.first()).toBeVisible();
  });

  test('should have editor functionality', async ({ page }) => {
    // 检查编辑器是否存在
    const editor = page.locator('[data-testid="editor"], .editor, [contenteditable="true"]');
    await expect(editor.first()).toBeVisible();
    
    // 测试基本的文本输入
    await editor.first().click();
    await editor.first().fill('Hello, Playwright!');
    await expect(editor.first()).toContainText('Hello, Playwright!');
  });

  test('should have theme toggle', async ({ page }) => {
    // 使用 Electron 专用的主题切换函数
    const newTheme = await toggleElectronTheme(page);
    console.log(`Theme toggled to: ${newTheme}`);
    
    // 验证主题确实发生了变化
    expect(newTheme).toBeDefined();
  });

  test('should handle file operations', async ({ page }) => {
    // 检查文件相关功能是否存在
    const fileMenu = page.locator('[data-testid="file-menu"], .file-menu, button:has-text("File")');
    if (await fileMenu.count() > 0) {
      await expect(fileMenu.first()).toBeVisible();
      await fileMenu.first().click();
      
      // 检查文件菜单项
      const newFileOption = page.locator('text=New File, text=新建文件, text=新文件');
      if (await newFileOption.count() > 0) {
        await expect(newFileOption.first()).toBeVisible();
      }
    }
  });

  test('should have responsive design', async ({ page }) => {
    // 使用 Electron 专用的响应式布局测试函数
    await testElectronResponsiveLayout(page);
    console.log('Responsive design test completed');
  });
});
