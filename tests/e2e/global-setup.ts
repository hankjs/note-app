import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  
  // 启动浏览器并检查应用是否可访问
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // 等待开发服务器启动
    await page.goto(baseURL || 'http://localhost:5173');
    
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Application is accessible at:', baseURL);
  } catch (error) {
    console.error('❌ Failed to access application:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
