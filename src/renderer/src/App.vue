<script setup lang="ts">
import LexicalEditorTest from './components/LexicalEditorTest.vue'
</script>

<template>
  <div class="app h-screen flex flex-col bg-white">
    <!-- LexicalEditor 组件测试 -->
    <LexicalEditorTest />
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
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.main-container {
  min-height: 0;
}
</style>
