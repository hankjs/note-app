<script setup lang="ts">
import Sidebar from './components/Sidebar.vue'
import MainContent from './components/MainContent.vue'
import Toolbar from './components/Toolbar.vue'
</script>

<template>
  <div class="app h-screen flex flex-col bg-white">
    <!-- 顶部工具栏 -->
    <Toolbar />
    
    <!-- 主内容区域 -->
    <div class="main-container flex-1 flex overflow-hidden">
      <!-- 侧边栏 -->
      <Sidebar />
      
      <!-- 主内容区 -->
      <MainContent />
    </div>
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app {
  height: 100vh;
  overflow: hidden;
}

.main-container {
  min-height: 0;
}
</style>
