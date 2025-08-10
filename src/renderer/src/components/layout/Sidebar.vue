<script setup lang="ts">
import { ref } from 'vue'
import { useFilesStore } from '@/stores/files'
import { useFileManager } from '@/composables/useFileManager'
import { 
  FolderIcon, 
  DocumentIcon, 
  PlusIcon, 
  FolderPlusIcon,
  ChevronRightIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'

const filesStore = useFilesStore()
const { createNewFile } = useFileManager()

const expandedFolders = ref<Set<string>>(new Set())
const selectedFile = ref<string | null>(null)

const toggleFolder = (folderId: string) => {
  if (expandedFolders.value.has(folderId)) {
    expandedFolders.value.delete(folderId)
  } else {
    expandedFolders.value.add(folderId)
  }
}

const selectFile = (fileId: string) => {
  selectedFile.value = fileId
  filesStore.openFile(fileId)
}

const handleNewFile = async () => {
  const fileName = `新文件-${Date.now()}.md`
  await createNewFile(fileName, '# 新文件\n\n开始编写你的 Markdown 内容...')
}

const handleNewFolder = () => {
  // TODO: 实现新建文件夹功能
  console.log('新建文件夹')
}
</script>

<template>
  <div class="sidebar bg-gray-50 border-r border-gray-200 w-64 flex flex-col h-full">
    <!-- 侧边栏头部 -->
    <div class="sidebar-header p-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-800">文件</h2>
        <div class="flex space-x-1">
          <button
            @click="handleNewFile"
            class="p-1 rounded hover:bg-gray-200 transition-colors"
            title="新建文件"
          >
            <PlusIcon class="w-4 h-4 text-gray-600" />
          </button>
          <button
            @click="handleNewFolder"
            class="p-1 rounded hover:bg-gray-200 transition-colors"
            title="新建文件夹"
          >
            <FolderPlusIcon class="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>

    <!-- 文件树 -->
    <div class="file-tree flex-1 overflow-y-auto p-2">
      <div v-if="filesStore.files.length === 0" class="text-center py-8 text-gray-500">
        <DocumentIcon class="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p class="text-sm">暂无文件</p>
        <button
          @click="handleNewFile"
          class="mt-2 text-blue-600 hover:text-blue-700 text-sm"
        >
          创建第一个文件
        </button>
      </div>

      <div v-else class="space-y-1">
        <div
          v-for="file in filesStore.files"
          :key="file.id"
          @click="selectFile(file.id)"
          :class="[
            'file-item flex items-center px-2 py-1 rounded cursor-pointer transition-colors',
            selectedFile === file.id
              ? 'bg-blue-100 text-blue-700'
              : 'hover:bg-gray-100 text-gray-700'
          ]"
        >
          <div class="flex items-center flex-1 min-w-0">
            <FolderIcon v-if="file.type === 'folder'" class="w-4 h-4 mr-2 flex-shrink-0" />
            <DocumentIcon v-else class="w-4 h-4 mr-2 flex-shrink-0" />
            
            <span class="truncate text-sm">{{ file.name }}</span>
          </div>

          <div v-if="file.type === 'folder'" class="flex-shrink-0">
            <ChevronRightIcon
              v-if="!expandedFolders.has(file.id)"
              class="w-4 h-4 text-gray-400"
              @click.stop="toggleFolder(file.id)"
            />
            <ChevronDownIcon
              v-else
              class="w-4 h-4 text-gray-400"
              @click.stop="toggleFolder(file.id)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 侧边栏底部 -->
    <div class="sidebar-footer p-2 border-t border-gray-200">
      <div class="text-xs text-gray-500 text-center">
        已打开 {{ filesStore.openFiles.length }} 个文件
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  min-width: 16rem;
  max-width: 20rem;
}

.file-tree {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.file-tree::-webkit-scrollbar {
  width: 4px;
}

.file-tree::-webkit-scrollbar-track {
  background: transparent;
}

.file-tree::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 2px;
}

.file-tree::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}
</style>
