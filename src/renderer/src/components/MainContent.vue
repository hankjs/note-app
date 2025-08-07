<script setup lang="ts">
import { ref, watch } from 'vue'
import { useFilesStore } from '@/stores/files'
import { useEditorStore } from '@/stores/editor'
import { markdownToHtml } from '@/utils/markdown'
import { 
  EyeIcon, 
  EyeSlashIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/vue/24/outline'

const filesStore = useFilesStore()
const editorStore = useEditorStore()

const editorContent = ref('')
const previewContent = ref('')

// 监听当前文件变化
watch(() => filesStore.currentFile, (newFile) => {
  if (newFile) {
    editorContent.value = newFile.content || ''
    updatePreview()
  } else {
    editorContent.value = ''
    previewContent.value = ''
  }
}, { immediate: true })

// 监听编辑器内容变化
watch(editorContent, () => {
  updatePreview()
  if (filesStore.currentFile) {
    filesStore.updateFileContent(filesStore.currentFile.id, editorContent.value)
    editorStore.setDirty(true)
  }
})

const updatePreview = () => {
  previewContent.value = markdownToHtml(editorContent.value)
}

const togglePreviewMode = () => {
  editorStore.togglePreviewMode()
}

const toggleFullscreen = () => {
  editorStore.toggleFullscreen()
}

const saveFile = async () => {
  if (filesStore.currentFile) {
    // TODO: 实现文件保存到磁盘
    console.log('保存文件:', filesStore.currentFile.name)
    editorStore.setDirty(false)
  }
}
</script>

<template>
  <div class="main-content flex-1 flex flex-col h-full">
    <!-- 工具栏 -->
    <div class="toolbar bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <button
          @click="togglePreviewMode"
          class="p-2 rounded hover:bg-gray-100 transition-colors"
          :title="editorStore.isPreviewMode ? '关闭预览' : '开启预览'"
        >
          <EyeIcon v-if="!editorStore.isPreviewMode" class="w-4 h-4 text-gray-600" />
          <EyeSlashIcon v-else class="w-4 h-4 text-gray-600" />
        </button>
        
        <button
          @click="toggleFullscreen"
          class="p-2 rounded hover:bg-gray-100 transition-colors"
          :title="editorStore.isFullscreen ? '退出全屏' : '全屏模式'"
        >
          <ArrowsPointingOutIcon v-if="!editorStore.isFullscreen" class="w-4 h-4 text-gray-600" />
          <ArrowsPointingInIcon v-else class="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div class="flex items-center space-x-2">
        <div v-if="editorStore.isDirty" class="text-xs text-orange-600">
          未保存
        </div>
        <button
          @click="saveFile"
          class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          保存
        </button>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="content-area flex-1 flex">
      <!-- 编辑器区域 -->
      <div 
        :class="[
          'editor-area flex-1',
          editorStore.isPreviewMode ? 'hidden' : 'block'
        ]"
      >
        <div v-if="!filesStore.currentFile" class="flex items-center justify-center h-full text-gray-500">
          <div class="text-center">
            <div class="text-6xl mb-4">📝</div>
            <h3 class="text-lg font-medium mb-2">欢迎使用 Markdown 编辑器</h3>
            <p class="text-sm">从侧边栏选择一个文件开始编辑，或创建新文件</p>
          </div>
        </div>
        
        <div v-else class="h-full">
          <textarea
            v-model="editorContent"
            class="w-full h-full p-4 resize-none border-none outline-none font-mono text-sm leading-relaxed"
            placeholder="开始编写你的 Markdown 内容..."
            :style="{
              fontSize: `${editorStore.settings.fontSize}px`,
              lineHeight: editorStore.settings.lineHeight
            }"
          ></textarea>
        </div>
      </div>

      <!-- 预览区域 -->
      <div 
        v-if="editorStore.isPreviewMode"
        class="preview-area flex-1 border-l border-gray-200 overflow-y-auto"
      >
        <div class="p-4">
          <div 
            v-if="previewContent"
            class="prose prose-sm max-w-none"
            v-html="previewContent"
          ></div>
          <div v-else class="text-gray-500 text-center py-8">
            预览区域
          </div>
        </div>
      </div>
    </div>

    <!-- 状态栏 -->
    <div class="status-bar bg-gray-50 border-t border-gray-200 px-4 py-1 flex items-center justify-between text-xs text-gray-600">
      <div class="flex items-center space-x-4">
        <span v-if="filesStore.currentFile">
          {{ filesStore.currentFile.name }}
        </span>
        <span v-else>无文件</span>
      </div>
      
      <div class="flex items-center space-x-4">
        <span v-if="editorContent">
          {{ editorContent.length }} 字符
        </span>
        <span v-if="editorStore.isPreviewMode">
          预览模式
        </span>
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
