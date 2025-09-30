<template>
  <Teleport to="body">
    <div 
      v-if="isVisible"
      class="Modal__overlay" 
      role="dialog"
      @click="handleOverlayClick"
    >
      <div 
        class="Modal__modal" 
        tabindex="-1" 
        ref="modalRef"
        @click.stop
      >
        <h2 class="Modal__title">{{ innerTitle }}</h2>
        <button
          class="Modal__closeButton"
          aria-label="Close modal"
          type="button"
          @click="handleClose"
        >
          X
        </button>
        <div class="Modal__content">
          <slot :isVisible="isVisible" :onClose="handleClose" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts">
export interface Props {
  title?: string
  closeOnClickOutside?: boolean
  modelValue?: boolean
}

export interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'update:title', value: string): void
  (e: 'close'): void
}
</script>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useInner } from '@/composables/useInner'

const props = withDefaults(defineProps<Props>(), {
  closeOnClickOutside: false,
  modelValue: false
})

const emit = defineEmits<Emits>()

const modalRef = ref<HTMLElement | null>(null)
const isVisible = ref(props.modelValue)
const innerTitle = useInner(props, 'title', emit)

// 關閉 modal
const handleClose = () => {
  isVisible.value = false
  emit('update:modelValue', false)
  emit('close')
}

// 處理點擊外部關閉
const handleOverlayClick = (event: MouseEvent) => {
  if (props.closeOnClickOutside && event.target === event.currentTarget) {
    handleClose()
  }
}

// 處理鍵盤事件
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isVisible.value) {
    handleClose()
  }
}

// 聚焦到 modal
const focusModal = async () => {
  await nextTick()
  if (modalRef.value) {
    modalRef.value.focus()
  }
}

const show = (title?: string) => {
  console.log('show', title)
  if (title) {
    innerTitle.value = title
  }

  isVisible.value = true
  emit('update:modelValue', true)
}

// 監聽 props.modelValue 變化
watch(() => props.modelValue, (newValue) => {
  isVisible.value = newValue
  if (newValue) {
    focusModal()
  }
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  if (isVisible.value) {
    focusModal()
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

defineExpose({
  focus: focusModal,
  show,
  close: handleClose,
})
</script>

<style>
.Modal__overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  flex-direction: column;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  background-color: rgba(40, 40, 40, 0.6);
  flex-grow: 0px;
  flex-shrink: 1px;
  z-index: 100;
}

.Modal__modal {
  padding: 20px;
  min-height: 100px;
  min-width: 300px;
  display: flex;
  flex-grow: 0px;
  background-color: #fff;
  flex-direction: column;
  position: relative;
  box-shadow: 0 0 20px 0 #444;
  border-radius: 10px;
}

.Modal__title {
  color: #444;
  margin: 0px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ccc;
}

.Modal__closeButton {
  border: 0px;
  position: absolute;
  right: 20px;
  border-radius: 20px;
  justify-content: center;
  align-items: center;
  display: flex;
  width: 30px;
  height: 30px;
  text-align: center;
  cursor: pointer;
  background-color: #eee;
}

.Modal__closeButton:hover {
  background-color: #ddd;
}

.Modal__content {
  padding-top: 20px;
}
</style>
