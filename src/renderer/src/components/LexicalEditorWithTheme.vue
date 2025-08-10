<template>
  <div class="lexical-editor-with-theme">
    <!-- 工具栏 -->
    <div class="lexical-toolbar">
      <!-- 文本格式组 -->
      <div class="toolbar-group">
        <button 
          @click="toggleBold" 
          :class="['toolbar-btn', { active: isBold }]"
          title="粗体"
        >
          <BoldIcon class="toolbar-icon" />
        </button>
        <button 
          @click="toggleItalic" 
          :class="['toolbar-btn', { active: isItalic }]"
          title="斜体"
        >
          <ItalicIcon class="toolbar-icon" />
        </button>
        <button 
          @click="toggleUnderline" 
          :class="['toolbar-btn', { active: isUnderline }]"
          title="下划线"
        >
          <UnderlineIcon class="toolbar-icon" />
        </button>
        <button 
          @click="toggleStrikethrough" 
          :class="['toolbar-btn', { active: isStrikethrough }]"
          title="删除线"
        >
          <StrikethroughIcon class="toolbar-icon" />
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- 标题组 -->
      <div class="toolbar-group">
        <select 
          v-model="currentHeading" 
          @change="setHeading"
          class="toolbar-select"
          title="标题级别"
        >
          <option value="">段落</option>
          <option value="h1">标题 1</option>
          <option value="h2">标题 2</option>
          <option value="h3">标题 3</option>
          <option value="h4">标题 4</option>
          <option value="h5">标题 5</option>
          <option value="h6">标题 6</option>
        </select>
      </div>

      <div class="toolbar-divider"></div>

      <!-- 列表组 -->
      <div class="toolbar-group">
        <button 
          @click="toggleUnorderedList" 
          :class="['toolbar-btn', { active: isUnorderedList }]"
          title="无序列表"
        >
          <ListBulletIcon class="toolbar-icon" />
        </button>
        <button 
          @click="toggleOrderedList" 
          :class="['toolbar-btn', { active: isOrderedList }]"
          title="有序列表"
        >
          <ListNumberIcon class="toolbar-icon" />
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- 代码组 -->
      <div class="toolbar-group">
        <button 
          @click="toggleCode" 
          :class="['toolbar-btn', { active: isCode }]"
          title="行内代码"
        >
          <CodeBracketIcon class="toolbar-icon" />
        </button>
        <button 
          @click="toggleCodeBlock" 
          :class="['toolbar-btn', { active: isCodeBlock }]"
          title="代码块"
        >
          <DocumentTextIcon class="toolbar-icon" />
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- 链接组 -->
      <div class="toolbar-group">
        <button 
          @click="insertLink" 
          class="toolbar-btn"
          title="插入链接"
        >
          <LinkIcon class="toolbar-icon" />
        </button>
        <button 
          @click="insertImage" 
          class="toolbar-btn"
          title="插入图片"
        >
          <PhotoIcon class="toolbar-icon" />
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- 引用组 -->
      <div class="toolbar-group">
        <button 
          @click="toggleQuote" 
          :class="['toolbar-btn', { active: isQuote }]"
          title="引用"
        >
          <QuoteIcon class="toolbar-icon" />
        </button>
      </div>
    </div>

    <!-- 编辑器容器 -->
    <div 
      ref="editorRef"
      class="editor-container"
      contenteditable="true"
      @focus="onFocus"
      @blur="onBlur"
      @input="onInput"
      @paste="onPaste"
      @drop="onDrop"
      @dragover="onDragOver"
    ></div>

    <!-- 调试信息（开发环境） -->
    <div v-if="showDebug" class="debug-info">
      <h4>调试信息</h4>
      <p>内容长度: {{ content.length }}</p>
      <p>编辑器状态: {{ editorState ? '已初始化' : '未初始化' }}</p>
      <p>当前主题: {{ isDarkTheme ? '暗色' : '亮色' }}</p>
      <p>当前格式: {{ currentFormat }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { 
  BoldIcon, 
  ItalicIcon, 
  UnderlineIcon, 
  StrikethroughIcon,
  ListBulletIcon,
  ListNumberIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  LinkIcon,
  PhotoIcon,
  QuoteIcon
} from '@heroicons/vue/24/outline'
import { getEditorTheme, watchThemeChange, getThemeState } from '@/utils/lexicalTheme'
import type { LexicalEditorConfig } from '@/types/lexical'

interface Props {
  modelValue?: string
  config?: LexicalEditorConfig
  showDebug?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  config: () => ({ namespace: 'ThemedEditor' }),
  showDebug: false,
  placeholder: '开始输入...'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
  'focus': []
  'blur': []
  'error': [error: Error]
}>()

// 编辑器状态
const editorRef = ref<HTMLElement>()
const content = ref(props.modelValue)
const editorState = ref<any>(null)
const isDarkTheme = ref(false)

// 格式状态
const isBold = ref(false)
const isItalic = ref(false)
const isUnderline = ref(false)
const isStrikethrough = ref(false)
const isUnorderedList = ref(false)
const isOrderedList = ref(false)
const isCode = ref(false)
const isCodeBlock = ref(false)
const isQuote = ref(false)
const currentHeading = ref('')

// 计算属性
const currentFormat = computed(() => {
  const formats = []
  if (isBold.value) formats.push('粗体')
  if (isItalic.value) formats.push('斜体')
  if (isUnderline.value) formats.push('下划线')
  if (isStrikethrough.value) formats.push('删除线')
  if (isUnorderedList.value) formats.push('无序列表')
  if (isOrderedList.value) formats.push('有序列表')
  if (isCode.value) formats.push('行内代码')
  if (isCodeBlock.value) formats.push('代码块')
  if (isQuote.value) formats.push('引用')
  if (currentHeading.value) formats.push(`标题 ${currentHeading.value.slice(1)}`)
  
  return formats.length > 0 ? formats.join(', ') : '无格式'
})

// 初始化编辑器
const initEditor = () => {
  if (editorRef.value) {
    // 这里应该使用真正的 Lexical 编辑器初始化
    // 目前使用模拟实现
    console.log('LexicalEditorWithTheme: 编辑器已初始化')
    
    // 设置占位符
    if (!props.modelValue) {
      editorRef.value.innerHTML = `<span class="lexical-placeholder">${props.placeholder}</span>`
    }
    
    // 如果有初始内容，设置到编辑器
    if (props.modelValue) {
      updateContent(props.modelValue)
    }
  } else {
    console.error('LexicalEditorWithTheme: 编辑器元素未找到')
  }
}

// 更新内容
const updateContent = (newContent: string) => {
  if (editorRef.value) {
    editorRef.value.innerHTML = newContent
    content.value = newContent
    emit('update:modelValue', newContent)
    emit('change', newContent)
  }
}

// 文本格式切换
const toggleBold = () => {
  isBold.value = !isBold.value
  document.execCommand('bold', false)
}

const toggleItalic = () => {
  isItalic.value = !isItalic.value
  document.execCommand('italic', false)
}

const toggleUnderline = () => {
  isUnderline.value = !isUnderline.value
  document.execCommand('underline', false)
}

const toggleStrikethrough = () => {
  isStrikethrough.value = !isStrikethrough.value
  document.execCommand('strikethrough', false)
}

// 标题设置
const setHeading = () => {
  if (currentHeading.value) {
    document.execCommand('formatBlock', false, currentHeading.value)
  } else {
    document.execCommand('formatBlock', false, 'p')
  }
}

// 列表切换
const toggleUnorderedList = () => {
  isUnorderedList.value = !isUnorderedList.value
  isOrderedList.value = false
  document.execCommand('insertUnorderedList', false)
}

const toggleOrderedList = () => {
  isOrderedList.value = !isOrderedList.value
  isUnorderedList.value = false
  document.execCommand('insertOrderedList', false)
}

// 代码切换
const toggleCode = () => {
  isCode.value = !isCode.value
  document.execCommand('formatBlock', false, 'code')
}

const toggleCodeBlock = () => {
  isCodeBlock.value = !isCodeBlock.value
  document.execCommand('formatBlock', false, 'pre')
}

// 引用切换
const toggleQuote = () => {
  isQuote.value = !isQuote.value
  document.execCommand('formatBlock', false, 'blockquote')
}

// 插入链接
const insertLink = () => {
  const url = prompt('请输入链接地址:')
  if (url) {
    document.execCommand('createLink', false, url)
  }
}

// 插入图片
const insertImage = () => {
  const url = prompt('请输入图片地址:')
  if (url) {
    document.execCommand('insertImage', false, url)
  }
}

// 事件处理
const onFocus = () => {
  emit('focus')
}

const onBlur = () => {
  emit('blur')
}

const onInput = () => {
  if (editorRef.value) {
    const newContent = editorRef.value.innerHTML
    content.value = newContent
    emit('update:modelValue', newContent)
    emit('change', newContent)
  }
}

const onPaste = (event: ClipboardEvent) => {
  // 处理粘贴事件，清理格式
  event.preventDefault()
  const text = event.clipboardData?.getData('text/plain') || ''
  document.execCommand('insertText', false, text)
}

const onDrop = (event: DragEvent) => {
  // 处理拖拽事件
  event.preventDefault()
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
}

// 主题管理
const initTheme = () => {
  isDarkTheme.value = getThemeState()
  
  // 监听主题变化
  const observer = watchThemeChange((isDark) => {
    isDarkTheme.value = isDark
    console.log('LexicalEditorWithTheme: 主题已切换为', isDark ? '暗色' : '亮色')
  })
  
  return observer
}

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue) => {
  if (newValue !== content.value) {
    updateContent(newValue)
  }
}, { immediate: true })

// 组件挂载后初始化
onMounted(() => {
  console.log('LexicalEditorWithTheme: 组件已挂载')
  
  // 初始化主题
  const themeObserver = initTheme()
  
  // 自动初始化编辑器
  setTimeout(() => {
    initEditor()
  }, 100)
  
  // 组件卸载时清理
  onUnmounted(() => {
    if (themeObserver) {
      themeObserver.disconnect()
    }
    console.log('LexicalEditorWithTheme: 组件已卸载')
  })
})

// 暴露方法给父组件
defineExpose({
  focus: () => editorRef.value?.focus(),
  updateContent,
  getContent: () => content.value,
  getState: () => editorState.value,
  setRootElement: initEditor
})
</script>

<style scoped>
/* 组件特定样式 */
.lexical-editor-with-theme {
  width: 100%;
  border-radius: var(--lexical-editor-radius);
  overflow: hidden;
  box-shadow: var(--lexical-shadow-sm);
}

.toolbar-icon {
  width: 1rem;
  height: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .lexical-toolbar {
    flex-direction: column;
    gap: var(--lexical-spacing-sm);
  }
  
  .toolbar-group {
    justify-content: center;
  }
  
  .toolbar-divider {
    display: none;
  }
}
</style>
