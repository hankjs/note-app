<template>
  <div class="lexical-api-test">
    <h1>Lexical 编辑器 API 测试</h1>
    
    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="api-section">
        <h3>文本选择 API</h3>
        <div class="api-buttons">
          <button @click="selectSpecificText" class="api-btn">选择"测试文本"</button>
          <button @click="selectByRange" class="api-btn">选择字符 0-10</button>
          <button @click="selectAll" class="api-btn">选择全部文本</button>
          <button @click="clearSelect" class="api-btn">清除选择</button>
          <button @click="getSelected" class="api-btn">获取选中文本</button>
        </div>
      </div>

      <div class="api-section">
        <h3>格式化 API</h3>
        <div class="api-buttons">
          <button @click="applyBoldToSelection" class="api-btn">对选中文本加粗</button>
          <button @click="applyItalicToText" class="api-btn">对"重要"文字加斜体</button>
          <button @click="applyUnderlineToRange" class="api-btn">对字符 20-30 加下划线</button>
          <button @click="insertFormatted" class="api-btn">插入格式化文本</button>
        </div>
      </div>

      <div class="api-section">
        <h3>复合操作 API</h3>
        <div class="api-buttons">
          <button @click="findAndBold" class="api-btn">查找并加粗所有"文本"</button>
          <button @click="batchFormat" class="api-btn">批量格式化</button>
          <button @click="getSelectionInfo" class="api-btn">获取选择信息</button>
          <button @click="checkCanFormat" class="api-btn">检查是否可格式化</button>
        </div>
      </div>
    </div>

    <!-- 编辑器区域 -->
    <div class="editor-section">
      <h3>编辑器</h3>
      <LexicalEditorWithToolbar
        v-model="content"
        :show-toolbar="true"
        :show-debug="false"
        @change="handleChange"
        ref="editorRef"
      />
    </div>

    <!-- API 结果显示 -->
    <div class="results-section">
      <h3>API 执行结果</h3>
      <div class="results-display">
        <div v-for="(result, index) in apiResults" :key="index" class="result-item">
          <span class="result-time">{{ result.time }}</span>
          <span class="result-api">{{ result.api }}</span>
          <span class="result-status" :class="result.success ? 'success' : 'error'">
            {{ result.success ? '✓' : '✗' }}
          </span>
          <span class="result-data">{{ result.data }}</span>
        </div>
      </div>
      <button @click="clearResults" class="clear-btn">清空结果</button>
    </div>

    <!-- 使用说明 -->
    <div class="instructions">
      <h3>API 使用说明</h3>
      <div class="instruction-content">
        <h4>文本选择 API：</h4>
        <ul>
          <li><code>selectTextByContent(text)</code> - 根据文本内容选择</li>
          <li><code>selectTextByRange(start, end)</code> - 根据字符范围选择</li>
          <li><code>selectAllText()</code> - 选择所有文本</li>
          <li><code>clearSelection()</code> - 清除选择</li>
          <li><code>getSelectedText()</code> - 获取当前选中的文本</li>
        </ul>

        <h4>格式化 API：</h4>
        <ul>
          <li><code>applyFormatToSelection(format)</code> - 对当前选择应用格式</li>
          <li><code>applyFormatToText(text, format)</code> - 对指定文本应用格式</li>
          <li><code>applyFormatToRange(start, end, format)</code> - 对指定范围应用格式</li>
          <li><code>insertFormattedText(text, formats)</code> - 插入预格式化文本</li>
        </ul>

        <h4>复合操作 API：</h4>
        <ul>
          <li><code>findAndFormatText(text, format)</code> - 查找并格式化所有匹配文本</li>
          <li><code>batchFormatTexts(configs)</code> - 批量格式化多个文本</li>
          <li><code>getSelectionInfo()</code> - 获取当前选择的详细信息</li>
          <li><code>canApplyFormat(format)</code> - 检查是否可以应用格式</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LexicalEditorWithToolbar from './LexicalEditorWithToolbar.vue'

// 状态
const content = ref(`这是一个测试文本，包含各种重要信息。

请使用 API 按钮来测试不同的功能：
- 文本选择功能
- 格式化应用
- 复合操作

这段文本可以用来测试各种 API 功能。`)

const editorRef = ref()
const apiResults = ref<Array<{
  time: string
  api: string
  success: boolean
  data: string
}>>([])

// 获取编辑器实例
const getEditorApi = () => {
  return (window as any).lexicalTest
}

// 添加结果记录
const addResult = (api: string, success: boolean, data: any) => {
  const time = new Date().toLocaleTimeString()
  apiResults.value.unshift({
    time,
    api,
    success,
    data: typeof data === 'object' ? JSON.stringify(data) : String(data)
  })
  
  // 限制结果数量
  if (apiResults.value.length > 20) {
    apiResults.value = apiResults.value.slice(0, 20)
  }
}

// ==================== 文本选择 API 测试 ====================

const selectSpecificText = () => {
  const api = getEditorApi()
  if (api) {
    try {
      const success = api.selectTextByContent('测试文本')
      addResult('selectTextByContent("测试文本")', success, `选择${success ? '成功' : '失败'}`)
    } catch (error) {
      addResult('selectTextByContent', false, error)
    }
  }
}

const selectByRange = () => {
  const api = getEditorApi()
  if (api) {
    try {
      const success = api.selectTextByRange(0, 10)
      addResult('selectTextByRange(0, 10)', success, `选择${success ? '成功' : '失败'}`)
    } catch (error) {
      addResult('selectTextByRange', false, error)
    }
  }
}

const selectAll = () => {
  const api = getEditorApi()
  if (api) {
    try {
      api.selectAllText()
      addResult('selectAllText()', true, '全选完成')
    } catch (error) {
      addResult('selectAllText', false, error)
    }
  }
}

const clearSelect = () => {
  const api = getEditorApi()
  if (api) {
    try {
      api.clearSelection()
      addResult('clearSelection()', true, '清除选择完成')
    } catch (error) {
      addResult('clearSelection', false, error)
    }
  }
}

const getSelected = () => {
  const api = getEditorApi()
  if (api) {
    try {
      const selectedText = api.getSelectedText()
      addResult('getSelectedText()', true, `选中文本: "${selectedText}"`)
    } catch (error) {
      addResult('getSelectedText', false, error)
    }
  }
}

// ==================== 格式化 API 测试 ====================

const applyBoldToSelection = () => {
  const api = getEditorApi()
  if (api) {
    try {
      const success = api.applyFormatToSelection('bold')
      addResult('applyFormatToSelection("bold")', success, `格式化${success ? '成功' : '失败'}`)
    } catch (error) {
      addResult('applyFormatToSelection', false, error)
    }
  }
}

const applyItalicToText = () => {
  const api = getEditorApi()
  if (api) {
    try {
      const success = api.applyFormatToText('重要', 'italic')
      addResult('applyFormatToText("重要", "italic")', success, `格式化${success ? '成功' : '失败'}`)
    } catch (error) {
      addResult('applyFormatToText', false, error)
    }
  }
}

const applyUnderlineToRange = () => {
  const api = getEditorApi()
  if (api) {
    try {
      const success = api.applyFormatToRange(20, 30, 'underline')
      addResult('applyFormatToRange(20, 30, "underline")', success, `格式化${success ? '成功' : '失败'}`)
    } catch (error) {
      addResult('applyFormatToRange', false, error)
    }
  }
}

const insertFormatted = () => {
  const api = getEditorApi()
  if (api) {
    try {
      api.insertFormattedText('这是粗体斜体文本', ['bold', 'italic'])
      addResult('insertFormattedText()', true, '插入格式化文本成功')
    } catch (error) {
      addResult('insertFormattedText', false, error)
    }
  }
}

// ==================== 复合操作 API 测试 ====================

const findAndBold = () => {
  const api = getEditorApi()
  if (api) {
    try {
      const count = api.findAndFormatText('文本', 'bold')
      addResult('findAndFormatText("文本", "bold")', true, `格式化了 ${count} 个匹配项`)
    } catch (error) {
      addResult('findAndFormatText', false, error)
    }
  }
}

const batchFormat = () => {
  const api = getEditorApi()
  if (api) {
    try {
      const configs = [
        { text: 'API', formats: ['bold'] },
        { text: '功能', formats: ['italic'] }
      ]
      const count = api.batchFormatTexts(configs)
      addResult('batchFormatTexts()', true, `批量格式化 ${count} 项`)
    } catch (error) {
      addResult('batchFormatTexts', false, error)
    }
  }
}

const getSelectionInfo = () => {
  const api = getEditorApi()
  if (api) {
    try {
      const info = api.getSelectionInfo()
      addResult('getSelectionInfo()', true, info)
    } catch (error) {
      addResult('getSelectionInfo', false, error)
    }
  }
}

const checkCanFormat = () => {
  const api = getEditorApi()
  if (api) {
    try {
      const canFormat = api.canApplyFormat('bold')
      addResult('canApplyFormat("bold")', true, `可以格式化: ${canFormat}`)
    } catch (error) {
      addResult('canApplyFormat', false, error)
    }
  }
}

// ==================== 其他功能 ====================

const handleChange = (value: string) => {
  console.log('Content changed:', value.length, 'characters')
}

const clearResults = () => {
  apiResults.value = []
}

// 组件挂载
onMounted(() => {
  console.log('API 测试组件已加载')
})
</script>

<style scoped>
.lexical-api-test {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  font-family: system-ui, sans-serif;
}

h1 {
  color: #1f2937;
  text-align: center;
  margin-bottom: 2rem;
}

.control-panel {
  background-color: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
}

.api-section {
  margin-bottom: 1.5rem;
}

.api-section h3 {
  color: #374151;
  margin-bottom: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
}

.api-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.api-btn {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.api-btn:hover {
  background-color: #2563eb;
}

.editor-section {
  margin-bottom: 2rem;
}

.editor-section h3 {
  color: #1f2937;
  margin-bottom: 1rem;
}

.results-section {
  background-color: #1f2937;
  color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.results-section h3 {
  color: #f9fafb;
  margin-bottom: 1rem;
}

.results-display {
  max-height: 300px;
  overflow-y: auto;
  font-family: ui-monospace, monospace;
  font-size: 0.75rem;
  margin-bottom: 1rem;
}

.result-item {
  display: flex;
  margin-bottom: 0.5rem;
  padding: 0.25rem;
  border-radius: 0.25rem;
  background-color: rgba(255, 255, 255, 0.05);
}

.result-time {
  color: #9ca3af;
  margin-right: 0.75rem;
  min-width: 80px;
}

.result-api {
  color: #60a5fa;
  margin-right: 0.75rem;
  min-width: 200px;
  font-weight: 600;
}

.result-status {
  margin-right: 0.75rem;
  min-width: 20px;
  font-weight: bold;
}

.result-status.success {
  color: #34d399;
}

.result-status.error {
  color: #f87171;
}

.result-data {
  color: #f9fafb;
  flex: 1;
  word-break: break-all;
}

.clear-btn {
  padding: 0.5rem 1rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.clear-btn:hover {
  background-color: #dc2626;
}

.instructions {
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.instructions h3 {
  color: #0c4a6e;
  margin-bottom: 1rem;
}

.instruction-content h4 {
  color: #0c4a6e;
  margin: 1rem 0 0.5rem 0;
  font-size: 1rem;
}

.instruction-content ul {
  margin: 0 0 1rem 0;
  padding-left: 1.5rem;
}

.instruction-content li {
  margin-bottom: 0.25rem;
  color: #0c4a6e;
}

.instruction-content code {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-family: ui-monospace, monospace;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .lexical-api-test {
    padding: 1rem;
  }
  
  .api-buttons {
    flex-direction: column;
  }
  
  .api-btn {
    width: 100%;
  }
}
</style>
