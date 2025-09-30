import { ref, provide, inject } from 'vue'

// 类型定义
export type ShowFlashMessage = (
  message?: string,
  duration?: number,
) => void

// Context key
const FLASH_MESSAGE_CONTEXT_KEY = Symbol('flash-message-context')

// 全局状态
const flashMessage = ref<string | null>(null)
const flashMessageTimeout = ref<number | null>(null)

export function useFlashMessage() {
  const showFlashMessage: ShowFlashMessage = (message, duration = 1000) => {
    // Clear existing timeout
    if (flashMessageTimeout.value) {
      clearTimeout(flashMessageTimeout.value)
    }
    
    if (message) {
      // Set new message
      flashMessage.value = message
      
      // Auto hide after duration
      flashMessageTimeout.value = window.setTimeout(() => {
        flashMessage.value = null
        flashMessageTimeout.value = null
      }, duration)
    } else {
      // Clear message if no message provided
      flashMessage.value = null
      if (flashMessageTimeout.value) {
        clearTimeout(flashMessageTimeout.value)
        flashMessageTimeout.value = null
      }
    }
  }

  const hideFlashMessage = () => {
    if (flashMessageTimeout.value) {
      clearTimeout(flashMessageTimeout.value)
      flashMessageTimeout.value = null
    }
    flashMessage.value = null
  }

  return {
    flashMessage,
    showFlashMessage,
    hideFlashMessage,
  }
}

// Context 提供者
export function provideFlashMessageContext() {
  const context = useFlashMessage()
  provide(FLASH_MESSAGE_CONTEXT_KEY, context)
  return context
}

// Context 消费者
export function useFlashMessageContext(): ReturnType<typeof useFlashMessage> {
  const context = inject<ReturnType<typeof useFlashMessage>>(FLASH_MESSAGE_CONTEXT_KEY)
  if (!context) {
    throw new Error('Missing FlashMessageContext. Please wrap your component with FlashMessageProvider.')
  }
  return context
}
