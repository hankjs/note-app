import { ref, computed } from 'vue'
import { useFilesStore } from '@/stores/files'

export function useFileManager() {
  const filesStore = useFilesStore()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const createNewFile = async (name: string, content: string = '') => {
    try {
      isLoading.value = true
      error.value = null
      
      // 这里将来会调用 main process 的 API
      const newFile = {
        id: Date.now().toString(),
        name,
        path: `/new-file-${Date.now()}.md`,
        type: 'file' as const,
        content,
        isOpen: true
      }
      
      filesStore.addFile(newFile)
      filesStore.openFile(newFile.id)
      
      return newFile
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建文件失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const saveFile = async (id: string, content: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      // 这里将来会调用 main process 的 API
      filesStore.updateFileContent(id, content)
      
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '保存文件失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteFile = async (id: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      // 这里将来会调用 main process 的 API
      filesStore.removeFile(id)
      
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除文件失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const openFile = async (path: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      // 这里将来会调用 main process 的 API
      const file = {
        id: Date.now().toString(),
        name: path.split('/').pop() || 'untitled.md',
        path,
        type: 'file' as const,
        content: '# 新文件\n\n开始编写你的 Markdown 内容...',
        isOpen: true
      }
      
      filesStore.addFile(file)
      filesStore.openFile(file.id)
      
      return file
    } catch (err) {
      error.value = err instanceof Error ? err.message : '打开文件失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    createNewFile,
    saveFile,
    deleteFile,
    openFile
  }
}
