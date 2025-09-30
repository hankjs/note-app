<template>
  <Teleport to="body">
    <div class="FlashMessage__overlay" role="dialog">
      <div class="FlashMessage__alert" role="alert">
        <!-- 支持插槽内容 -->
        <slot>
          {{ message }}
        </slot>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  message?: string
}

defineProps<Props>()
</script>

<style scoped>
.FlashMessage__overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  pointer-events: none;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  z-index: 9999;
}

.FlashMessage__alert {
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.5em 1.5em;
  font-size: 1.5rem;
  border-radius: 1em;
  margin: 0;
  max-width: 80vw;
  word-wrap: break-word;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  animation: flashMessageFadeIn 0.3s ease-out;
}

@keyframes flashMessageFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
