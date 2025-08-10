<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCodeBlocksStore } from '@/stores/codeBlocks'
import { useCodeExecution } from '@/composables/useCodeExecution'
import CodeBlock from './CodeBlock.vue'
import LexicalEditorWithToolbar from './LexicalEditorWithToolbar.vue'
import { 
  PlayIcon,
  StopIcon,
  TrashIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  CommandLineIcon,
  CursorArrowRaysIcon
} from '@heroicons/vue/24/outline'

const blocksStore = useCodeBlocksStore()
const { executeAllBlocks, stopExecution, clearAllOutputs, executionStats } = useCodeExecution()

const selectedBlockId = ref<string | null>(null)
const showLexicalEditor = ref(false)
const showCodeBlocks = ref(true)
const content = ref(`欢迎使用笔记应用！

这是一个简单的富文本编辑器，你可以在这里编写笔记内容。

切换到代码块模式来创建和执行 JavaScript、TypeScript 或 Markdown 代码块。`)

// ==================== 代码块相关功能 ====================

// 创建新的 JavaScript 代码块
const createJavaScriptBlock = () => {
  const block = blocksStore.createJavaScriptBlock('// 在这里编写 JavaScript 代码\nconsole.log("Hello, World!");')
  selectedBlockId.value = block.id
}

// 创建新的 TypeScript 代码块
const createTypeScriptBlock = () => {
  const block = blocksStore.createTypeScriptBlock(`// 在这里编写 TypeScript 代码

// 类型注解示例
const name: string = "张三";
const age: number = 25;

console.log("用户: " + name + ", 年龄: " + age);

// 数组类型示例
const numbers: number[] = [1, 2, 3, 4, 5];
const sum: number = numbers.reduce((acc, num) => acc + num, 0);
console.log("数组总和:", sum);

// 函数类型示例
function greet(person: string): string {
  return "你好, " + person + "!";
}

const message: string = greet(name);
console.log(message);`)
  selectedBlockId.value = block.id
}

// 创建新的 Markdown 代码块
const createMarkdownBlock = () => {
  const block = blocksStore.createMarkdownBlock('# 新的 Markdown 块\n\n在这里编写 Markdown 内容...')
  selectedBlockId.value = block.id
}

// 选择代码块
const selectBlock = (blockId: string) => {
  selectedBlockId.value = blockId
  blocksStore.selectBlock(blockId)
}

// 删除代码块
const deleteBlock = (blockId: string) => {
  blocksStore.deleteBlock(blockId)
  if (selectedBlockId.value === blockId) {
    selectedBlockId.value = null
  }
}

// 复制代码块
const duplicateBlock = (blockId: string) => {
  const newBlock = blocksStore.duplicateBlock(blockId)
  if (newBlock) {
    selectedBlockId.value = newBlock.id
  }
}

// ==================== 其他功能 ====================

const handleChange = (value: string) => {
  console.log('Content changed:', value.length, 'characters')
}

const toggleEditorMode = () => {
  showLexicalEditor.value = !showLexicalEditor.value
  showCodeBlocks.value = !showCodeBlocks.value
}

// 组件挂载
onMounted(() => {
  console.log('MainContent 组件已加载')
})
</script>

<template>
  <div class="main-content flex-1 flex flex-col h-full">
    <!-- 主工具栏 -->
    <div class="toolbar bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <!-- 编辑器模式切换 -->
        <button
          @click="toggleEditorMode"
          class="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
          title="切换编辑器模式"
        >
          <CursorArrowRaysIcon class="w-4 h-4" />
          <span>{{ showLexicalEditor ? '代码块模式' : 'Lexical模式' }}</span>
        </button>

        <!-- 代码块模式下的按钮 -->
        <div v-if="showCodeBlocks" class="flex items-center space-x-2 border-l border-gray-300 ml-2 pl-2">
          <!-- 新建代码块按钮 -->
          <button
            @click="createJavaScriptBlock"
            class="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
            title="新建 JavaScript 代码块"
          >
            <CodeBracketIcon class="w-4 h-4" />
            <span>JS</span>
          </button>
          
          <button
            @click="createTypeScriptBlock"
            class="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            title="新建 TypeScript 代码块"
          >
            <CommandLineIcon class="w-4 h-4" />
            <span>TS</span>
          </button>
          
          <button
            @click="createMarkdownBlock"
            class="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
            title="新建 Markdown 块"
          >
            <DocumentTextIcon class="w-4 h-4" />
            <span>MD</span>
          </button>

          <!-- 执行控制按钮 -->
          <div class="border-l border-gray-300 mx-2 h-6"></div>
          
          <button
            @click="() => executeAllBlocks()"
            class="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
            title="运行所有代码块"
          >
            <PlayIcon class="w-4 h-4" />
            <span>运行全部</span>
          </button>
          
          <button
            @click="stopExecution"
            class="flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            title="停止执行"
          >
            <StopIcon class="w-4 h-4" />
            <span>停止</span>
          </button>
          
          <button
            @click="clearAllOutputs"
            class="flex items-center space-x-1 px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
            title="清除所有输出"
          >
            <TrashIcon class="w-4 h-4" />
            <span>清除输出</span>
          </button>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <!-- 执行统计 -->
        <div v-if="showCodeBlocks" class="text-xs text-gray-600">
          {{ executionStats.codeBlocks }} 代码块 | 
          {{ executionStats.executedBlocks }} 已执行 | 
          {{ executionStats.errorBlocks }} 错误
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="content-area flex-1 overflow-y-auto p-4">
      <!-- Lexical 编辑器模式 -->
      <div v-if="showLexicalEditor" class="h-full">
        <div class="mb-4">
          <h2 class="text-xl font-semibold text-gray-800 mb-2">富文本编辑器</h2>
          <p class="text-gray-600 text-sm">在这里编写你的笔记内容</p>
        </div>
        
        <!-- 编辑器 -->
        <div class="editor-container mb-4">
          <LexicalEditorWithToolbar
            v-model="content"
            :show-toolbar="true"
            :show-debug="false"
            @change="handleChange"
          />
        </div>
      </div>

      <!-- 代码块模式 -->
      <div v-else>
        <!-- 空状态 -->
        <div v-if="blocksStore.blocks.length === 0" class="flex items-center justify-center h-full text-gray-500">
          <div class="text-center">
            <div class="text-6xl mb-4">🚀</div>
            <h3 class="text-lg font-medium mb-2">欢迎使用 Jupyter-like JavaScript 笔记</h3>
            <p class="text-sm mb-4">创建你的第一个代码块开始编程</p>
            <div class="flex space-x-2 justify-center">
              <button
                @click="createJavaScriptBlock"
                class="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <CodeBracketIcon class="w-4 h-4" />
                <span>JavaScript 代码块</span>
              </button>
              <button
                @click="createTypeScriptBlock"
                class="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <CommandLineIcon class="w-4 h-4" />
                <span>TypeScript 代码块</span>
              </button>
              <button
                @click="createMarkdownBlock"
                class="flex items-center space-x-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                <DocumentTextIcon class="w-4 h-4" />
                <span>Markdown 块</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 代码块列表 -->
        <div v-else class="space-y-4">
          <CodeBlock
            v-for="block in blocksStore.blocks"
            :key="block.id"
            :block="block"
            :is-selected="selectedBlockId === block.id"
            @select="selectBlock"
            @delete="deleteBlock"
            @duplicate="duplicateBlock"
          />
        </div>
      </div>
    </div>

    <!-- 状态栏 -->
    <div class="status-bar bg-gray-50 border-t border-gray-200 px-4 py-1 flex items-center justify-between text-xs text-gray-600">
      <div class="flex items-center space-x-4">
        <span v-if="showCodeBlocks">总代码块: {{ executionStats.totalBlocks }}</span>
        <span v-if="showCodeBlocks && executionStats.totalExecutionTime > 0">
          总执行时间: {{ executionStats.totalExecutionTime }}ms
        </span>
        <span v-if="showLexicalEditor">富文本编辑模式</span>
      </div>
      
      <div class="flex items-center space-x-4">
        <span v-if="showCodeBlocks && selectedBlockId">
          选中: {{ blocksStore.getBlock(selectedBlockId)?.type || 'unknown' }}
        </span>
        <span v-else-if="showCodeBlocks">未选择代码块</span>
        <span v-else>富文本编辑模式</span>
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
