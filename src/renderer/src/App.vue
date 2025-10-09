<script setup lang="ts">
// import MainContent from './components/layout/MainContent.vue'
// import Sidebar from './components/layout/Sidebar.vue'
// import ThemeToggle from './components/layout/ThemeToggle.vue'
import Debugger from './components/debugger/Debugger.vue'
import FlashMessageProvider from './components/ui/FlashMessage/FlashMessageProvider.vue';
import { useModal } from './composables/useModal';
import Button from './components/ui/Button/index.vue';
const [Modal, $Modal] = useModal()

function handleModalClear() {
  $Modal.close()
}

function handleModalCancel() {
  $Modal.close()
}

function showClearDialog() {
  $Modal.show('Clear editor')
}
</script>

<template>
  <div class="app h-screen flex flex-col bg-white">
    <FlashMessageProvider>
      <!-- <Debugger /> -->
       <Button @click="showClearDialog">
        Show Clear Dialog
       </Button>
      <Modal>
      <template #default>
        Are you sure you want to clear the editor?
      <div className="Modal__content">
        <Button
          @click="handleModalClear">
          Clear
        </Button>
        <Button
        class="ml-2"
          @click="handleModalCancel">
          Cancel
        </Button>
      </div> 
      </template>
    </Modal>

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
    </FlashMessageProvider>
  </div>
</template>
