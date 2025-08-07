import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface AppSettings {
  language: string
  autoUpdate: boolean
  showWelcomeScreen: boolean
  defaultSaveLocation: string
  backupEnabled: boolean
  backupInterval: number
  maxRecentFiles: number
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>({
    language: 'zh-CN',
    autoUpdate: true,
    showWelcomeScreen: true,
    defaultSaveLocation: '',
    backupEnabled: true,
    backupInterval: 24 * 60 * 60 * 1000, // 24 hours
    maxRecentFiles: 10
  })

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    settings.value = { ...settings.value, ...newSettings }
  }

  const resetSettings = () => {
    settings.value = {
      language: 'zh-CN',
      autoUpdate: true,
      showWelcomeScreen: true,
      defaultSaveLocation: '',
      backupEnabled: true,
      backupInterval: 24 * 60 * 60 * 1000,
      maxRecentFiles: 10
    }
  }

  const getSetting = <K extends keyof AppSettings>(key: K): AppSettings[K] => {
    return settings.value[key]
  }

  const setSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    settings.value[key] = value
  }

  return {
    settings,
    updateSettings,
    resetSettings,
    getSetting,
    setSetting
  }
})
