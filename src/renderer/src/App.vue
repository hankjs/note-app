<script setup lang="ts">
import LexicalApiTest from './components/LexicalApiTest.vue'
import ThemeToggle from './components/ThemeToggle.vue'
</script>

<template>
  <div class="app h-screen flex flex-col bg-white">
    <!-- 主题切换按钮 -->
    <ThemeToggle />
    
    <!-- Lexical 编辑器 API 测试 -->
    <LexicalApiTest />
  </div>
</template>

<style>
/* 全局样式重置 */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: var(--font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: var(--color-background);
  color: var(--color-text);
  transition: background-color var(--transition-normal), 
              color var(--transition-normal);
}

.main-container {
  min-height: 0;
}

/* 确保主题类正确应用 */
.app.theme-light {
  background-color: var(--color-background);
  color: var(--color-text);
}

.app.theme-dark {
  background-color: var(--color-background);
  color: var(--color-text);
}
</style>
