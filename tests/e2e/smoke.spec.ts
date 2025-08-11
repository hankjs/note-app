import { test, expect } from '@playwright/test';
import { waitForElectronApp, isElectronEnvironment } from './utils/electron-helpers';

test('smoke test - should load Electron app', async ({ page }) => {
  // 这是一个简单的冒烟测试，验证 Electron 应用基本配置是否正确
  await page.goto('/');
  
  // 等待 Electron 应用完全加载
  await waitForElectronApp(page);
  
  // 检查页面是否加载
  await expect(page).toHaveTitle(/Electron/);
  
  // 检查页面内容
  await expect(page.locator('body')).toBeVisible();
  
  // 检查是否在 Electron 环境中
  const isElectron = await isElectronEnvironment(page);
  console.log(`Running in Electron environment: ${isElectron}`);
  
  // 等待一下确保页面完全加载
  await page.waitForLoadState('networkidle');
  
  console.log('Smoke test passed - Electron app is working correctly!');
});
