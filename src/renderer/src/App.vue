<script setup lang="ts">
// import MainContent from './components/layout/MainContent.vue'
// import Sidebar from './components/layout/Sidebar.vue'
// import ThemeToggle from './components/layout/ThemeToggle.vue'
import Debugger from './components/debugger/Debugger.vue'
import FlashMessageContextDemo from './components/ui/FlashMessageContextDemo.vue';
import FlashMessageProvider from './components/ui/FlashMessageProvider.vue';
</script>

<template>
  <div class="app h-screen flex flex-col bg-white">
    <FlashMessageProvider>
      <FlashMessageContextDemo />
    </FlashMessageProvider>
    <!-- <Debugger /> -->

    <template v-if="false">
    <!-- 主题切换按钮 -->
    <ThemeToggle />
    
    <!-- 主应用容器 -->
    <div class="main-container flex-1 flex overflow-hidden">
      <!-- 侧边栏 -->
      <Sidebar />
      
      <!-- 主内容区域 -->
      <MainContent />
    </div>
    </template>
  </div>
</template>
