<template>
  <div class="theme-toggle">
    <button
      @click="toggleTheme"
      :class="['theme-btn', { active: isDark }]"
      :title="isDark ? '切换到亮色主题' : '切换到暗色主题'"
    >
      <SunIcon v-if="isDark" class="theme-icon" />
      <MoonIcon v-else class="theme-icon" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline'

// 主题状态
const isDark = ref(false)

// 切换主题
const toggleTheme = () => {
  isDark.value = !isDark.value
  applyTheme()
}

// 应用主题
const applyTheme = () => {
  const root = document.documentElement
  const app = document.querySelector('.app')
  
  if (isDark.value) {
    root.setAttribute('data-theme', 'dark')
    app?.classList.add('theme-dark')
    app?.classList.remove('theme-light')
    localStorage.setItem('theme', 'dark')
  } else {
    root.setAttribute('data-theme', 'light')
    app?.classList.add('theme-light')
    app?.classList.remove('theme-dark')
    localStorage.setItem('theme', 'light')
  }
}

// 初始化主题
const initTheme = () => {
  // 从localStorage获取保存的主题
  const savedTheme = localStorage.getItem('theme')
  
  // 如果没有保存的主题，则使用系统偏好
  if (!savedTheme) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = prefersDark
  } else {
    isDark.value = savedTheme === 'dark'
  }
  
  // 应用主题
  applyTheme()
  
  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      isDark.value = e.matches
      applyTheme()
    }
  })
}

// 监听主题变化
watch(isDark, () => {
  applyTheme()
})

// 组件挂载后初始化
onMounted(() => {
  initTheme()
})
</script>

<style scoped>
.theme-toggle {
  position: fixed;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: var(--z-fixed);
}

.theme-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  padding: var(--spacing-sm);
  background-color: var(--color-background-soft);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-full);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  backdrop-filter: blur(10px);
}

.theme-btn:hover {
  background-color: var(--color-background-mute);
  color: var(--color-text);
  border-color: var(--color-border-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.theme-btn:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.theme-btn.active {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary-hover);
}

.theme-icon {
  width: 1.5rem;
  height: 1.5rem;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .theme-toggle {
    top: var(--spacing-sm);
    right: var(--spacing-sm);
  }
  
  .theme-btn {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .theme-icon {
    width: 1.25rem;
    height: 1.25rem;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .theme-btn {
    border-width: 3px;
  }
}

/* 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  .theme-btn {
    transition: none;
    transform: none;
  }
  
  .theme-btn:hover {
    transform: none;
  }
}
</style>
