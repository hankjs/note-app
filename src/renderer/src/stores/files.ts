import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface FileItem {
  id: string
  name: string
  path: string
  type: 'file' | 'folder'
  content?: string
  isOpen?: boolean
  children?: FileItem[]
}

export const useFilesStore = defineStore('files', () => {
  const files = ref<FileItem[]>([])
  const currentFile = ref<FileItem | null>(null)
  const recentFiles = ref<string[]>([])

  const openFiles = computed(() => 
    files.value.filter(file => file.isOpen)
  )

  const addFile = (file: FileItem) => {
    files.value.push(file)
  }

  const removeFile = (id: string) => {
    const index = files.value.findIndex(file => file.id === id)
    if (index > -1) {
      files.value.splice(index, 1)
    }
  }

  const openFile = (id: string) => {
    const file = files.value.find(f => f.id === id)
    if (file) {
      file.isOpen = true
      currentFile.value = file
      addToRecentFiles(file.path)
    }
  }

  const closeFile = (id: string) => {
    const file = files.value.find(f => f.id === id)
    if (file) {
      file.isOpen = false
      if (currentFile.value?.id === id) {
        currentFile.value = null
      }
    }
  }

  const updateFileContent = (id: string, content: string) => {
    const file = files.value.find(f => f.id === id)
    if (file) {
      file.content = content
    }
  }

  const addToRecentFiles = (path: string) => {
    const index = recentFiles.value.indexOf(path)
    if (index > -1) {
      recentFiles.value.splice(index, 1)
    }
    recentFiles.value.unshift(path)
    if (recentFiles.value.length > 10) {
      recentFiles.value.pop()
    }
  }

  return {
    files,
    currentFile,
    recentFiles,
    openFiles,
    addFile,
    removeFile,
    openFile,
    closeFile,
    updateFileContent,
    addToRecentFiles
  }
})
