import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface EditorSettings {
  theme: 'light' | 'dark'
  fontSize: number
  lineHeight: number
  wordWrap: boolean
  showLineNumbers: boolean
  autoSave: boolean
  autoSaveInterval: number
}

export const useEditorStore = defineStore('editor', () => {
  const settings = ref<EditorSettings>({
    theme: 'light',
    fontSize: 14,
    lineHeight: 1.5,
    wordWrap: true,
    showLineNumbers: true,
    autoSave: true,
    autoSaveInterval: 3000
  })

  const isPreviewMode = ref(false)
  const isFullscreen = ref(false)
  const isDirty = ref(false)

  const togglePreviewMode = () => {
    isPreviewMode.value = !isPreviewMode.value
  }

  const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value
  }

  const setDirty = (dirty: boolean) => {
    isDirty.value = dirty
  }

  const updateSettings = (newSettings: Partial<EditorSettings>) => {
    settings.value = { ...settings.value, ...newSettings }
  }

  const resetSettings = () => {
    settings.value = {
      theme: 'light',
      fontSize: 14,
      lineHeight: 1.5,
      wordWrap: true,
      showLineNumbers: true,
      autoSave: true,
      autoSaveInterval: 3000
    }
  }

  return {
    settings,
    isPreviewMode,
    isFullscreen,
    isDirty,
    togglePreviewMode,
    toggleFullscreen,
    setDirty,
    updateSettings,
    resetSettings
  }
})
