<template>
  <div class="lexical-theme-demo">
    <div class="demo-header">
      <h1>Lexical 编辑器主题演示</h1>
      <p>展示使用 CSS 变量和顶层 classname 控制的主题系统</p>
    </div>

    <div class="demo-controls">
      <button @click="toggleTheme" class="theme-toggle-btn">
        <SunIcon v-if="isDark" class="theme-icon" />
        <MoonIcon v-else class="theme-icon" />
        {{ isDark ? '切换到亮色主题' : '切换到暗色主题' }}
      </button>
      
      <div class="demo-options">
        <label class="option-item">
          <input type="checkbox" v-model="showDebug" />
          显示调试信息
        </label>
        
        <label class="option-item">
          <input type="checkbox" v-model="showToolbar" />
          显示工具栏
        </label>
      </div>
    </div>

    <div class="demo-content">
      <!-- 基础编辑器 -->
      <div class="editor-section">
        <h2>基础编辑器</h2>
        <p>使用默认配置的基础编辑器</p>
        <LexicalEditor 
          v-model="basicContent"
          :show-debug="showDebug"
          placeholder="这是一个基础编辑器..."
        />
      </div>

      <!-- 主题化编辑器 -->
      <div class="editor-section">
        <h2>主题化编辑器</h2>
        <p>集成完整主题系统和工具栏的编辑器</p>
        <LexicalEditorWithTheme 
          v-model="themedContent"
          :show-debug="showDebug"
          placeholder="这是一个主题化编辑器，包含完整的工具栏..."
        />
      </div>

      <!-- 内容预览 -->
      <div class="preview-section">
        <h2>内容预览</h2>
        <div class="preview-tabs">
          <button 
            v-for="tab in previewTabs" 
            :key="tab.id"
            @click="activePreviewTab = tab.id"
            :class="['preview-tab', { active: activePreviewTab === tab.id }]"
          >
            {{ tab.name }}
          </button>
        </div>
        
        <div class="preview-content">
          <!-- HTML 预览 -->
          <div v-if="activePreviewTab === 'html'" class="preview-panel">
            <h3>HTML 内容</h3>
            <pre class="html-preview">{{ themedContent || basicContent }}</pre>
          </div>
          
          <!-- 纯文本预览 -->
          <div v-if="activePreviewTab === 'text'" class="preview-panel">
            <h3>纯文本内容</h3>
            <div class="text-preview">{{ stripHtml(themedContent || basicContent) }}</div>
          </div>
          
          <!-- 统计信息 -->
          <div v-if="activePreviewTab === 'stats'" class="preview-panel">
            <h3>内容统计</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">字符数</span>
                <span class="stat-value">{{ getCharCount() }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">单词数</span>
                <span class="stat-value">{{ getWordCount() }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">段落数</span>
                <span class="stat-value">{{ getParagraphCount() }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">行数</span>
                <span class="stat-value">{{ getLineCount() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 主题信息 -->
      <div class="theme-info">
        <h2>主题信息</h2>
        <div class="theme-details">
          <div class="theme-item">
            <span class="theme-label">当前主题:</span>
            <span class="theme-value">{{ isDark ? '暗色主题' : '亮色主题' }}</span>
          </div>
          <div class="theme-item">
            <span class="theme-label">CSS 变量:</span>
            <span class="theme-value">{{ isDark ? '使用暗色变量' : '使用亮色变量' }}</span>
          </div>
          <div class="theme-item">
            <span class="theme-label">顶层类名:</span>
            <span class="theme-value">.app.theme-{{ isDark ? 'dark' : 'light' }}</span>
          </div>
        </div>
        
        <div class="css-variables-preview">
          <h3>当前主题的 CSS 变量</h3>
          <div class="variables-grid">
            <div class="variable-item">
              <span class="variable-name">--lexical-text-primary</span>
              <span class="variable-value" :style="{ color: cssVariables.textPrimary }">
                {{ cssVariables.textPrimary }}
              </span>
            </div>
            <div class="variable-item">
              <span class="variable-name">--lexical-bg-primary</span>
              <span class="variable-value" :style="{ backgroundColor: cssVariables.bgPrimary }">
                {{ cssVariables.bgPrimary }}
              </span>
            </div>
            <div class="variable-item">
              <span class="variable-name">--lexical-border-primary</span>
              <span class="variable-value" :style="{ borderColor: cssVariables.borderPrimary }">
                {{ cssVariables.borderPrimary }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline'
import LexicalEditor from './LexicalEditor.vue'
import LexicalEditorWithTheme from './LexicalEditorWithTheme.vue'

// 状态
const isDark = ref(false)
const showDebug = ref(false)
const showToolbar = ref(true)
const basicContent = ref('<h1>欢迎使用 Lexical 编辑器</h1><p>这是一个<strong>基础编辑器</strong>，支持基本的文本编辑功能。</p>')
const themedContent = ref('<h2>主题化编辑器</h2><p>这是一个<em>主题化编辑器</em>，包含完整的工具栏和主题支持。</p><ul><li>支持多种文本格式</li><li>支持列表和标题</li><li>支持代码块和引用</li></ul>')
const activePreviewTab = ref('html')

// CSS 变量
const cssVariables = ref({
  textPrimary: '#000000',
  bgPrimary: '#ffffff',
  borderPrimary: '#e5e7eb'
})

// 预览标签
const previewTabs = [
  { id: 'html', name: 'HTML' },
  { id: 'text', name: '纯文本' },
  { id: 'stats', name: '统计' }
]

// 切换主题
const toggleTheme = () => {
  isDark.value = !isDark.value
  const app = document.querySelector('.app')
  if (app) {
    if (isDark.value) {
      app.classList.add('theme-dark')
      app.classList.remove('theme-light')
    } else {
      app.classList.add('theme-light')
      app.classList.remove('theme-dark')
    }
  }
  
  // 延迟更新 CSS 变量，等待 DOM 更新完成
  setTimeout(() => {
    updateCSSVariables()
  }, 100)
}

// 内容处理
const stripHtml = (html: string) => {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

const getCharCount = () => {
  return stripHtml(themedContent.value || basicContent.value).length
}

const getWordCount = () => {
  const text = stripHtml(themedContent.value || basicContent.value)
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

const getParagraphCount = () => {
  const content = themedContent.value || basicContent.value
  return (content.match(/<p[^>]*>.*?<\/p>/g) || []).length
}

const getLineCount = () => {
  const text = stripHtml(themedContent.value || basicContent.value)
  return text.split('\n').length
}

// 初始化主题状态
onMounted(() => {
  const app = document.querySelector('.app')
  if (app) {
    isDark.value = app.classList.contains('theme-dark')
  }
  
  // 更新 CSS 变量值
  updateCSSVariables()
})

// 更新 CSS 变量
const updateCSSVariables = () => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement
    cssVariables.value = {
      textPrimary: getComputedStyle(root).getPropertyValue('--lexical-text-primary') || '#000000',
      bgPrimary: getComputedStyle(root).getPropertyValue('--lexical-bg-primary') || '#ffffff',
      borderPrimary: getComputedStyle(root).getPropertyValue('--lexical-border-primary') || '#e5e7eb'
    }
  }
}
</script>

<style scoped>
.lexical-theme-demo {
  padding: var(--lexical-spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: var(--lexical-spacing-2xl);
}

.demo-header h1 {
  font-size: var(--lexical-font-size-3xl);
  color: var(--lexical-text-primary);
  margin-bottom: var(--lexical-spacing-sm);
}

.demo-header p {
  font-size: var(--lexical-font-size-lg);
  color: var(--lexical-text-secondary);
}

.demo-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--lexical-spacing-xl);
  padding: var(--lexical-spacing-lg);
  background-color: var(--lexical-bg-secondary);
  border-radius: var(--lexical-editor-radius);
  border: 1px solid var(--lexical-border-secondary);
}

.theme-toggle-btn {
  display: flex;
  align-items: center;
  gap: var(--lexical-spacing-sm);
  padding: var(--lexical-spacing-sm) var(--lexical-spacing-lg);
  background-color: var(--lexical-primary);
  color: var(--lexical-text-inverse);
  border: none;
  border-radius: var(--lexical-editor-radius);
  cursor: pointer;
  font-size: var(--lexical-font-size-sm);
  transition: background-color var(--lexical-transition-fast);
}

.theme-toggle-btn:hover {
  background-color: var(--lexical-primary-hover);
}

.theme-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.demo-options {
  display: flex;
  gap: var(--lexical-spacing-lg);
}

.option-item {
  display: flex;
  align-items: center;
  gap: var(--lexical-spacing-xs);
  font-size: var(--lexical-font-size-sm);
  color: var(--lexical-text-secondary);
}

.editor-section {
  margin-bottom: var(--lexical-spacing-2xl);
}

.editor-section h2 {
  font-size: var(--lexical-font-size-2xl);
  color: var(--lexical-text-primary);
  margin-bottom: var(--lexical-spacing-sm);
}

.editor-section p {
  color: var(--lexical-text-secondary);
  margin-bottom: var(--lexical-spacing-lg);
}

.preview-section {
  margin-bottom: var(--lexical-spacing-2xl);
}

.preview-section h2 {
  font-size: var(--lexical-font-size-2xl);
  color: var(--lexical-text-primary);
  margin-bottom: var(--lexical-spacing-lg);
}

.preview-tabs {
  display: flex;
  gap: var(--lexical-spacing-xs);
  margin-bottom: var(--lexical-spacing-lg);
}

.preview-tab {
  padding: var(--lexical-spacing-sm) var(--lexical-spacing-lg);
  background-color: var(--lexical-bg-secondary);
  border: 1px solid var(--lexical-border-secondary);
  border-radius: var(--lexical-editor-radius);
  color: var(--lexical-text-secondary);
  cursor: pointer;
  transition: all var(--lexical-transition-fast);
}

.preview-tab:hover {
  background-color: var(--lexical-bg-hover);
  color: var(--lexical-text-primary);
}

.preview-tab.active {
  background-color: var(--lexical-primary);
  color: var(--lexical-text-inverse);
  border-color: var(--lexical-primary);
}

.preview-content {
  background-color: var(--lexical-bg-secondary);
  border: 1px solid var(--lexical-border-secondary);
  border-radius: var(--lexical-editor-radius);
  overflow: hidden;
}

.preview-panel {
  padding: var(--lexical-spacing-lg);
}

.preview-panel h3 {
  font-size: var(--lexical-font-size-lg);
  color: var(--lexical-text-primary);
  margin-bottom: var(--lexical-spacing-md);
}

.html-preview {
  background-color: var(--lexical-bg-tertiary);
  padding: var(--lexical-spacing-md);
  border-radius: var(--lexical-editor-radius);
  font-family: var(--font-family-mono);
  font-size: var(--lexical-font-size-sm);
  color: var(--lexical-text-primary);
  overflow-x: auto;
  white-space: pre-wrap;
  max-height: 300px;
  overflow-y: auto;
}

.text-preview {
  background-color: var(--lexical-bg-tertiary);
  padding: var(--lexical-spacing-md);
  border-radius: var(--lexical-editor-radius);
  font-size: var(--lexical-font-size-sm);
  color: var(--lexical-text-primary);
  line-height: 1.6;
  white-space: pre-wrap;
  max-height: 300px;
  overflow-y: auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--lexical-spacing-md);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--lexical-spacing-md);
  background-color: var(--lexical-bg-tertiary);
  border-radius: var(--lexical-editor-radius);
  border: 1px solid var(--lexical-border-secondary);
}

.stat-label {
  font-size: var(--lexical-font-size-sm);
  color: var(--lexical-text-secondary);
  margin-bottom: var(--lexical-spacing-xs);
}

.stat-value {
  font-size: var(--lexical-font-size-2xl);
  font-weight: 600;
  color: var(--lexical-primary);
}

.theme-info {
  margin-bottom: var(--lexical-spacing-2xl);
}

.theme-info h2 {
  font-size: var(--lexical-font-size-2xl);
  color: var(--lexical-text-primary);
  margin-bottom: var(--lexical-spacing-lg);
}

.theme-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--lexical-spacing-md);
  margin-bottom: var(--lexical-spacing-xl);
}

.theme-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--lexical-spacing-md);
  background-color: var(--lexical-bg-secondary);
  border-radius: var(--lexical-editor-radius);
  border: 1px solid var(--lexical-border-secondary);
}

.theme-label {
  font-size: var(--lexical-font-size-sm);
  color: var(--lexical-text-secondary);
}

.theme-value {
  font-size: var(--lexical-font-size-sm);
  color: var(--lexical-text-primary);
  font-weight: 500;
}

.css-variables-preview h3 {
  font-size: var(--lexical-font-size-lg);
  color: var(--lexical-text-primary);
  margin-bottom: var(--lexical-spacing-md);
}

.variables-grid {
  display: grid;
  gap: var(--lexical-spacing-sm);
}

.variable-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--lexical-spacing-sm);
  background-color: var(--lexical-bg-tertiary);
  border-radius: var(--lexical-editor-radius);
  border: 1px solid var(--lexical-border-secondary);
}

.variable-name {
  font-family: var(--font-family-mono);
  font-size: var(--lexical-font-size-sm);
  color: var(--lexical-text-secondary);
}

.variable-value {
  font-size: var(--lexical-font-size-sm);
  color: var(--lexical-text-primary);
  padding: var(--lexical-spacing-xs) var(--lexical-spacing-sm);
  border-radius: var(--lexical-editor-radius);
  min-width: 80px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .demo-controls {
    flex-direction: column;
    gap: var(--lexical-spacing-md);
    align-items: stretch;
  }
  
  .demo-options {
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .theme-details {
    grid-template-columns: 1fr;
  }
  
  .variable-item {
    flex-direction: column;
    gap: var(--lexical-spacing-xs);
    align-items: stretch;
  }
}
</style>
