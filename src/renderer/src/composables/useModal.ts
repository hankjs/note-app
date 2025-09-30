import { ref } from 'vue'

const modal = ref<{
  title: string
  content?: any
} | null>(null)

export function useModal() {
  const showModal = (title: string, content?: any) => {
    modal.value = { title, content }
  }

  const hideModal = () => {
    modal.value = null
  }

  return {
    modal,
    showModal,
    hideModal,
  }
}
