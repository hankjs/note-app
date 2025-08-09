<template>
  <div class="lexical-toolbar">
    <!-- 格式化工具组 -->
    <div class="toolbar-group">
      <button
        @click="handleFormatText('bold')"
        :class="['toolbar-btn', { active: isFormatActive('bold') }]"
        title="粗体 (Ctrl+B)"
      >
        <BoldIcon class="w-4 h-4" />
      </button>
      
      <button
        @click="handleFormatText('italic')"
        :class="['toolbar-btn', { active: isFormatActive('italic') }]"
        title="斜体 (Ctrl+I)"
      >
        <ItalicIcon class="w-4 h-4" />
      </button>
      
      <button
        @click="handleFormatText('underline')"
        :class="['toolbar-btn', { active: isFormatActive('underline') }]"
        title="下划线 (Ctrl+U)"
      >
        <UnderlineIcon class="w-4 h-4" />
      </button>
      
      <button
        @click="handleFormatText('strikethrough')"
        :class="['toolbar-btn', { active: isFormatActive('strikethrough') }]"
        title="删除线"
      >
        <StrikethroughIcon class="w-4 h-4" />
      </button>
      
      <button
        @click="handleFormatText('code')"
        :class="['toolbar-btn', { active: isFormatActive('code') }]"
        title="行内代码"
      >
        <CodeIcon class="w-4 h-4" />
      </button>
    </div>

    <!-- 分隔线 -->
    <div class="toolbar-divider"></div>

    <!-- 块级元素工具组 -->
    <div class="toolbar-group">
      <select
        v-model="currentBlockType"
        @change="changeBlockType"
        class="toolbar-select"
        title="块类型"
      >
        <option value="paragraph">段落</option>
        <option value="h1">标题 1</option>
        <option value="h2">标题 2</option>
        <option value="h3">标题 3</option>
        <option value="h4">标题 4</option>
        <option value="h5">标题 5</option>
        <option value="h6">标题 6</option>
        <option value="quote">引用</option>
      </select>
    </div>

    <!-- 分隔线 -->
    <div class="toolbar-divider"></div>

    <!-- 列表工具组 -->
    <div class="toolbar-group">
      <button
        @click="insertList('bullet')"
        :class="['toolbar-btn', { active: isListActive('bullet') }]"
        title="无序列表"
      >
        <ListBulletIcon class="w-4 h-4" />
      </button>
      
      <button
        @click="insertList('number')"
        :class="['toolbar-btn', { active: isListActive('number') }]"
        title="有序列表"
      >
        <ListNumberIcon class="w-4 h-4" />
      </button>
    </div>

    <!-- 分隔线 -->
    <div class="toolbar-divider"></div>

    <!-- 其他操作工具组 -->
    <div class="toolbar-group">
      <button
        @click="insertLink"
        class="toolbar-btn"
        title="插入链接 (Ctrl+K)"
      >
        <LinkIcon class="w-4 h-4" />
      </button>
      
      <button
        @click="handleClearFormatting"
        class="toolbar-btn"
        title="清除格式"
      >
        <XMarkIcon class="w-4 h-4" />
      </button>
    </div>

    <!-- 分隔线 -->
    <div class="toolbar-divider"></div>

    <!-- 历史操作工具组 -->
    <div class="toolbar-group">
      <button
        @click="handleUndo"
        :disabled="!canUndoRef"
        class="toolbar-btn"
        title="撤销 (Ctrl+Z)"
      >
        <ArrowUturnLeftIcon class="w-4 h-4" />
      </button>
      
      <button
        @click="handleRedo"
        :disabled="!canRedoRef"
        class="toolbar-btn"
        title="重做 (Ctrl+Y)"
      >
        <ArrowUturnRightIcon class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  CodeBracketIcon as CodeIcon,
  ListBulletIcon,
  XMarkIcon,
  LinkIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon
} from '@heroicons/vue/24/outline'

import {
  formatText,
  setBlockType,
  insertBulletList,
  insertNumberedList,
  toggleLink,
  clearFormatting,
  undo,
  redo,
  registerSelectionListener,
  isInList,
  type TextFormatType,
  type BlockType
} from '@/utils/lexicalCommands'

// 自定义图标组件
const StrikethroughIcon = { template: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M7.5 10h5m-8 0h1.5m9.5 0H17M6 6.5c0-1.5 1.5-3 4-3s4 1.5 4 3M6 13.5c0 1.5 1.5 3 4 3s4-1.5 4-3" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>' }
const ListNumberIcon = { template: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M3 4h1v3H3V4zM3 8h1v3H3V8zM3 12h1v3H3v-3zM7 5h10v1H7V5zM7 9h10v1H7V9zM7 13h10v1H7v-1z"/></svg>' }

interface Props {
  editor?: any // LexicalEditor instance
}

const props = defineProps<Props>()

// 响应式状态
const currentBlockType = ref<BlockType>('paragraph')
const canUndoRef = ref(false)
const canRedoRef = ref(false)
const activeFormats = ref<Set<TextFormatType>>(new Set())
const currentListState = ref<{ isInList: boolean, listType?: 'bullet' | 'number' }>({ isInList: false })

// 清理函数引用
let selectionListenerCleanup: (() => void) | null = null

// 检查格式是否激活
const isFormatActive = (format: TextFormatType) => {
  return activeFormats.value.has(format)
}

// 检查列表是否激活
const isListActive = (listType: 'bullet' | 'number') => {
  return currentListState.value.isInList && currentListState.value.listType === listType
}

// 格式化文本
const handleFormatText = (format: TextFormatType) => {
  if (!props.editor) return
  
  console.log(`Formatting text: ${format}`)
  formatText(props.editor, format)
}

// 改变块类型
const changeBlockType = () => {
  if (!props.editor) return
  
  console.log(`Changing block type to: ${currentBlockType.value}`)
  setBlockType(props.editor, currentBlockType.value)
}

// 插入列表
const insertList = (listType: 'bullet' | 'number') => {
  if (!props.editor) return
  
  console.log(`Inserting ${listType} list`)
  
  const listState = isInList(props.editor)
  
  if (listState.isInList && listState.listType === listType) {
    // 如果已经是相同类型的列表，则移除列表
    // removeList(props.editor)
  } else {
    // 插入新列表
    if (listType === 'bullet') {
      insertBulletList(props.editor)
    } else {
      insertNumberedList(props.editor)
    }
  }
}

// 插入链接
const insertLink = () => {
  if (!props.editor) return
  
  toggleLink(props.editor)
}

// 清除格式
const handleClearFormatting = () => {
  if (!props.editor) return
  
  console.log('Clearing formatting')
  clearFormatting(props.editor)
}

// 撤销
const handleUndo = () => {
  if (!props.editor) return
  
  console.log('Undo')
  undo(props.editor)
}

// 重做
const handleRedo = () => {
  if (!props.editor) return
  
  console.log('Redo')
  redo(props.editor)
}

// 更新工具栏状态
const updateToolbarState = (formats: Set<TextFormatType>, blockType: BlockType) => {
  activeFormats.value = formats
  currentBlockType.value = blockType
  
  // 更新列表状态
  if (props.editor) {
    currentListState.value = isInList(props.editor)
  }
  
  console.log('Toolbar state updated:', { formats, blockType, listState: currentListState.value })
}

// 快捷键处理
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 'b':
        event.preventDefault()
        handleFormatText('bold')
        break
      case 'i':
        event.preventDefault()
        handleFormatText('italic')
        break
      case 'u':
        event.preventDefault()
        handleFormatText('underline')
        break
      case 'k':
        event.preventDefault()
        insertLink()
        break
      case 'z':
        if (event.shiftKey) {
          event.preventDefault()
          handleRedo()
        } else {
          event.preventDefault()
          handleUndo()
        }
        break
      case 'y':
        event.preventDefault()
        handleRedo()
        break
    }
  }
}

// 生命周期
onMounted(() => {
  // 监听编辑器选择变化
  if (props.editor) {
    selectionListenerCleanup = registerSelectionListener(props.editor, updateToolbarState)
  }
  
  // 注册快捷键
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  // 清理选择监听器
  if (selectionListenerCleanup) {
    selectionListenerCleanup()
  }
  
  // 清理快捷键监听
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.lexical-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-bottom: none;
  border-radius: 0.5rem 0.5rem 0 0;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.toolbar-divider {
  width: 1px;
  height: 1.5rem;
  background-color: #d1d5db;
  margin: 0 0.25rem;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0.25rem;
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
}

.toolbar-btn:hover {
  background-color: #e5e7eb;
  color: #374151;
}

.toolbar-btn:active {
  background-color: #d1d5db;
}

.toolbar-btn.active {
  background-color: #3b82f6;
  color: white;
  border-color: #2563eb;
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-btn:disabled:hover {
  background-color: transparent;
  color: #6b7280;
}

.toolbar-select {
  min-width: 8rem;
  padding: 0.375rem 0.75rem;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.toolbar-select:hover {
  border-color: #9ca3af;
}

.toolbar-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 响应式设计 */
@media (max-width: 640px) {
  .lexical-toolbar {
    padding: 0.5rem;
    gap: 0.375rem;
  }
  
  .toolbar-btn {
    width: 1.75rem;
    height: 1.75rem;
  }
  
  .toolbar-select {
    min-width: 6rem;
    font-size: 0.75rem;
  }
  
  .toolbar-divider {
    display: none;
  }
}
</style>
