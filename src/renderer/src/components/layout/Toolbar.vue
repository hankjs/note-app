<script setup lang="ts">
import { useFileManager } from '@/composables/useFileManager'
import { 
  DocumentPlusIcon,
  FolderOpenIcon,
  DocumentArrowDownIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline'
const { createNewFile } = useFileManager()

const handleNewFile = async () => {
  const fileName = `新文件-${Date.now()}.md`
  await createNewFile(fileName, '# 新文件\n\n开始编写你的 Markdown 内容...')
}

const handleOpenFile = () => {
  // TODO: 实现打开文件功能
  console.log('打开文件')
}

const handleSaveFile = () => {
  // TODO: 实现保存文件功能
  console.log('保存文件')
}

const handleOpenSettings = () => {
  // TODO: 实现打开设置功能
  console.log('打开设置')
}

const handleSearch = () => {
  // TODO: 实现搜索功能
  console.log('搜索')
}
</script>

<template>
  <div class="toolbar bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
    <!-- 左侧操作按钮 -->
    <div class="flex items-center space-x-2">
      <button
        @click="handleNewFile"
        class="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        title="新建文件 (Ctrl+N)"
      >
        <DocumentPlusIcon class="w-4 h-4" />
        <span>新建</span>
      </button>
      
      <button
        @click="handleOpenFile"
        class="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
        title="打开文件 (Ctrl+O)"
      >
        <FolderOpenIcon class="w-4 h-4" />
        <span>打开</span>
      </button>
      
              <button
          @click="handleSaveFile"
          class="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
          title="保存文件 (Ctrl+S)"
        >
          <DocumentArrowDownIcon class="w-4 h-4" />
          <span>保存</span>
        </button>
    </div>

    <!-- 中间搜索框 -->
    <div class="flex-1 max-w-md mx-4">
      <div class="relative">
        <input
          type="text"
          placeholder="搜索文件..."
          class="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <MagnifyingGlassIcon class="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>
    </div>

    <!-- 右侧操作按钮 -->
    <div class="flex items-center space-x-2">
      <button
        @click="handleSearch"
        class="p-2 rounded hover:bg-gray-100 transition-colors"
        title="全局搜索 (Ctrl+Shift+F)"
      >
        <MagnifyingGlassIcon class="w-4 h-4 text-gray-600" />
      </button>
      
      <button
        @click="handleOpenSettings"
        class="p-2 rounded hover:bg-gray-100 transition-colors"
        title="设置"
      >
        <Cog6ToothIcon class="w-4 h-4 text-gray-600" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  min-height: 3rem;
}
</style>
