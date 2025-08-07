<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCodeBlocksStore, type CodeBlock } from '@/stores/codeBlocks'
import { useCodeExecution } from '@/composables/useCodeExecution'
import { markdownToHtml } from '@/utils/markdown'
import { 
  PlayIcon, 
  StopIcon, 
  TrashIcon, 
  DocumentDuplicateIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'

interface Props {
  block: CodeBlock
  isSelected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false
})

const emit = defineEmits<{
  select: [blockId: string]
  delete: [blockId: string]
  duplicate: [blockId: string]
}>()

const blocksStore = useCodeBlocksStore()
const { executeBlock, validateCode } = useCodeExecution()

const isEditing = ref(false)
const editContent = ref('')

// 计算属性
const isJavaScript = computed(() => props.block.type === 'javascript')
const isMarkdown = computed(() => props.block.type === 'markdown')
const isRunning = computed(() => props.block.status === 'running')
const hasError = computed(() => props.block.status === 'error')
const hasOutput = computed(() => props.block.outputs.length > 0)
const markdownHtml = computed(() => markdownToHtml(props.block.content))

// 状态图标
const statusIcon = computed(() => {
  if (isRunning.value) return ClockIcon
  if (hasError.value) return ExclamationTriangleIcon
  if (props.block.status === 'success') return CheckCircleIcon
  return null
})

const statusColor = computed(() => {
  if (isRunning.value) return 'text-blue-500'
  if (hasError.value) return 'text-red-500'
  if (props.block.status === 'success') return 'text-green-500'
  return 'text-gray-400'
})

// 开始编辑
const startEdit = () => {
  editContent.value = props.block.content
  isEditing.value = true
}

// 保存编辑
const saveEdit = () => {
  blocksStore.updateBlockContent(props.block.id, editContent.value)
  isEditing.value = false
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
}

// 运行代码
const runCode = async () => {
  if (!isJavaScript.value) return
  
  // 验证代码语法
  const validation = validateCode(props.block.content)
  if (!validation.valid) {
    blocksStore.updateBlockStatus(props.block.id, 'error', undefined, validation.error)
    return
  }

  await executeBlock(props.block.id)
}

// 停止执行
const stopExecution = () => {
  // TODO: 实现停止执行功能
  console.log('停止执行代码块:', props.block.id)
}

// 清除输出
const clearOutputs = () => {
  blocksStore.clearBlockOutputs(props.block.id)
}

// 删除代码块
const deleteBlock = () => {
  emit('delete', props.block.id)
}

// 复制代码块
const duplicateBlock = () => {
  emit('duplicate', props.block.id)
}

// 选择代码块
const selectBlock = () => {
  emit('select', props.block.id)
}

// 渲染输出内容
const renderOutput = (output: any) => {
  if (output.type === 'console') {
    return output.content.map((item: any) => 
      typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)
    ).join(' ')
  }
  return String(output.content)
}

// 监听内容变化
watch(() => props.block.content, (newContent) => {
  if (!isEditing.value) {
    editContent.value = newContent
  }
})
</script>

<template>
  <div 
    :class="[
      'code-block border rounded-lg mb-4 overflow-hidden transition-all',
      isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
    ]"
    @click="selectBlock"
  >
    <!-- 代码块头部 -->
    <div class="block-header bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-200">
      <div class="flex items-center space-x-2">
        <span class="text-xs font-medium text-gray-600 uppercase">
          {{ isJavaScript ? 'JavaScript' : 'Markdown' }}
        </span>
        
        <!-- 状态指示器 -->
        <component 
          v-if="statusIcon" 
          :is="statusIcon" 
          :class="['w-4 h-4', statusColor]"
        />
        
        <!-- 执行时间 -->
        <span v-if="props.block.executionTime" class="text-xs text-gray-500">
          {{ props.block.executionTime }}ms
        </span>
      </div>

      <div class="flex items-center space-x-1">
        <!-- 运行按钮 (仅 JavaScript) -->
        <button
          v-if="isJavaScript"
          @click.stop="runCode"
          :disabled="isRunning"
          :class="[
            'p-1 rounded transition-colors',
            isRunning 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-green-600 hover:bg-green-100'
          ]"
          title="运行代码"
        >
          <PlayIcon class="w-4 h-4" />
        </button>

        <!-- 停止按钮 -->
        <button
          v-if="isRunning"
          @click.stop="stopExecution"
          class="p-1 rounded text-red-600 hover:bg-red-100 transition-colors"
          title="停止执行"
        >
          <StopIcon class="w-4 h-4" />
        </button>

        <!-- 清除输出按钮 -->
        <button
          v-if="hasOutput"
          @click.stop="clearOutputs"
          class="p-1 rounded text-gray-600 hover:bg-gray-100 transition-colors"
          title="清除输出"
        >
          <TrashIcon class="w-4 h-4" />
        </button>

        <!-- 复制按钮 -->
        <button
          @click.stop="duplicateBlock"
          class="p-1 rounded text-gray-600 hover:bg-gray-100 transition-colors"
          title="复制代码块"
        >
          <DocumentDuplicateIcon class="w-4 h-4" />
        </button>

        <!-- 删除按钮 -->
        <button
          @click.stop="deleteBlock"
          class="p-1 rounded text-red-600 hover:bg-red-100 transition-colors"
          title="删除代码块"
        >
          <TrashIcon class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- 代码块内容 -->
    <div class="block-content">
      <!-- 编辑模式 -->
      <div v-if="isEditing" class="p-4">
        <textarea
          v-model="editContent"
          :class="[
            'w-full min-h-[200px] p-3 border rounded font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500',
            isJavaScript ? 'bg-gray-900 text-green-400' : 'bg-white text-gray-800'
          ]"
          :placeholder="isJavaScript ? '// 输入 JavaScript 代码...' : '# 输入 Markdown 内容...'"
        ></textarea>
        
        <div class="flex justify-end space-x-2 mt-2">
          <button
            @click="cancelEdit"
            class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            取消
          </button>
          <button
            @click="saveEdit"
            class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            保存
          </button>
        </div>
      </div>

      <!-- 显示模式 -->
      <div v-else class="p-4">
        <!-- JavaScript 代码显示 -->
        <div v-if="isJavaScript" class="space-y-4">
          <pre 
            @dblclick="startEdit"
            class="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto cursor-pointer hover:bg-gray-800 transition-colors"
          ><code>{{ props.block.content || '// 点击编辑代码...' }}</code></pre>
        </div>

        <!-- Markdown 内容显示 -->
        <div v-else-if="isMarkdown" class="space-y-4">
          <div 
            @dblclick="startEdit"
            class="prose prose-sm max-w-none cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
            v-html="markdownHtml"
          ></div>
        </div>
      </div>
    </div>

    <!-- 输出区域 -->
    <div v-if="hasOutput" class="block-output bg-gray-50 border-t border-gray-200 p-4">
      <h4 class="text-sm font-medium text-gray-700 mb-2">输出结果:</h4>
      
      <div class="space-y-2">
        <div
          v-for="(output, index) in props.block.outputs"
          :key="index"
          :class="[
            'p-2 rounded text-sm font-mono',
            output.type === 'error' 
              ? 'bg-red-100 text-red-800 border border-red-200'
              : output.type === 'console' && output.level === 'error'
              ? 'bg-red-100 text-red-800 border border-red-200'
              : output.type === 'console' && output.level === 'warn'
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              : 'bg-white text-gray-800 border border-gray-200'
          ]"
        >
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs text-gray-500">
              {{ output.type }} {{ output.level ? `(${output.level})` : '' }}
            </span>
            <span class="text-xs text-gray-400">
              {{ new Date(output.timestamp).toLocaleTimeString() }}
            </span>
          </div>
          <div class="whitespace-pre-wrap">{{ renderOutput(output) }}</div>
        </div>
      </div>
    </div>

    <!-- 错误信息 -->
    <div v-if="hasError && props.block.error" class="block-error bg-red-50 border-t border-red-200 p-4">
      <h4 class="text-sm font-medium text-red-700 mb-2">执行错误:</h4>
      <div class="text-sm text-red-600 font-mono">{{ props.block.error }}</div>
    </div>
  </div>
</template>

<style scoped>
.code-block {
  transition: all 0.2s ease-in-out;
}

.code-block:hover {
  transform: translateY(-1px);
}

/* 自定义滚动条 */
pre::-webkit-scrollbar {
  height: 6px;
}

pre::-webkit-scrollbar-track {
  background: #374151;
}

pre::-webkit-scrollbar-thumb {
  background: #6b7280;
  border-radius: 3px;
}

pre::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
