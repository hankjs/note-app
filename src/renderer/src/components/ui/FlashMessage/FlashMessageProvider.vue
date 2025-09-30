<template>
  <div>
    <!-- 渲染子组件 -->
    <slot />
    
    <!-- 显示 FlashMessage -->
    <FlashMessage v-if="flashMessage">
      {{ flashMessage }}
    </FlashMessage>
  </div>
</template>

<script setup lang="ts">
import { provideFlashMessageContext } from '@renderer/components/ui/FlashMessage/useFlashMessage'
import FlashMessage from './FlashMessage.vue'

// 提供 FlashMessage Context
const { flashMessage } = provideFlashMessageContext()
</script>
