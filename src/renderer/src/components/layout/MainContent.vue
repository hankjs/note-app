<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LexicalEditorWithToolbar from '@/components/editor/LexicalEditorWithToolbar.vue'

const content = ref('')

const handleChange = (value: string) => {
  console.log('Content changed:', value.length, 'characters')
}

// 组件挂载
onMounted(() => {
  console.log('MainContent 组件已加载')
})
</script>

<template>
  <div class="main-content flex-1 flex flex-col h-full">
    <!-- 主内容区域 -->
    <div class="content-area flex-1 overflow-y-auto p-4">
      <div class="h-full">
        <!-- 编辑器 -->
        <LexicalEditorWithToolbar
          v-model="content"
          :show-toolbar="true"
          :show-debug="false"
          @change="handleChange"
        />
      </div>
    </div>

    <!-- 状态栏 -->
    <div class="status-bar bg-gray-50 border-t border-gray-200 px-4 py-1 flex items-center justify-between text-xs text-gray-600">
      <div class="flex items-center space-x-4">
        <span>富文本编辑模式</span>
      </div>
      
      <div class="flex items-center space-x-4">
        <span>Lexical 编辑器</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-area {
  min-height: 0;
}

.editor-area textarea {
  background-color: #fafafa;
}

.editor-area textarea:focus {
  background-color: white;
}

.preview-area {
  background-color: white;
}

/* 自定义滚动条 */
.preview-area::-webkit-scrollbar {
  width: 6px;
}

.preview-area::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.preview-area::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.preview-area::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Markdown 预览样式 */
:deep(.prose) {
  color: #374151;
}

:deep(.prose h1) {
  color: #111827;
  font-size: 1.875rem;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 1rem;
}

:deep(.prose h2) {
  color: #111827;
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

:deep(.prose h3) {
  color: #111827;
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

:deep(.prose p) {
  margin-bottom: 1rem;
  line-height: 1.75;
}

:deep(.prose ul) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

:deep(.prose ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

:deep(.prose li) {
  margin-bottom: 0.25rem;
}

:deep(.prose code) {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
}

:deep(.prose pre) {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 1rem;
}

:deep(.prose pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

:deep(.prose blockquote) {
  border-left: 4px solid #e5e7eb;
  padding-left: 1rem;
  margin-left: 0;
  margin-right: 0;
  font-style: italic;
  color: #6b7280;
}

:deep(.prose table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

:deep(.prose th) {
  background-color: #f9fafb;
  padding: 0.5rem;
  text-align: left;
  font-weight: 600;
  border: 1px solid #e5e7eb;
}

:deep(.prose td) {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
}
</style>
