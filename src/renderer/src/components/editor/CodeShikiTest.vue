<template>
  <div class="code-shiki-test">
    <h2 class="text-2xl font-bold mb-4">@lexical/code-shiki 测试</h2>
    
    <!-- 测试按钮 -->
    <div class="mb-4 space-x-2">
      <button 
        @click="testIntegration"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        测试集成
      </button>
      <button 
        @click="testHighlighting"
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        :disabled="!testEditor"
      >
        测试高亮
      </button>
      <button 
        @click="clearTest"
        class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        清除测试
      </button>
    </div>
    
    <!-- 测试结果 -->
    <div v-if="testResults.length > 0" class="mb-4">
      <h3 class="text-lg font-semibold mb-2">测试结果：</h3>
      <div class="bg-gray-100 p-4 rounded space-y-2">
        <div 
          v-for="(result, index) in testResults" 
          :key="index"
          class="text-sm font-mono"
        >
          {{ result }}
        </div>
      </div>
    </div>
    
    <!-- 测试编辑器 -->
    <div v-if="testEditor" class="border rounded p-4 bg-white">
      <h3 class="text-lg font-semibold mb-2">测试编辑器：</h3>
      <div 
        ref="editorContainer"
        class="min-h-[200px] border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        contenteditable="true"
      ></div>
    </div>
    
    <!-- 说明 -->
    <div class="mt-6 p-4 bg-blue-50 rounded">
      <h3 class="text-lg font-semibold mb-2 text-blue-800">功能说明：</h3>
      <ul class="text-blue-700 space-y-1 text-sm">
        <li>• @lexical/code-shiki 提供了基于 Shiki 的代码语法高亮</li>
        <li>• 支持多种编程语言的语法高亮</li>
        <li>• 自动检测代码语言并应用相应的高亮规则</li>
        <li>• 与 Lexical 编辑器的代码块功能完美集成</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { testCodeShikiIntegration, testCodeHighlighting } from '@/utils/lexicalCodeShikiTest'

// 响应式状态
const testEditor = ref<any>(null)
const testResults = ref<string[]>([])
const editorContainer = ref<HTMLElement>()

// 添加测试结果
const addResult = (message: string) => {
  testResults.value.push(`[${new Date().toLocaleTimeString()}] ${message}`)
}

// 测试集成
const testIntegration = () => {
  try {
    addResult('开始测试 @lexical/code-shiki 集成...')
    
    // 创建测试编辑器
    testEditor.value = testCodeShikiIntegration()
    
    // 设置根元素
    if (editorContainer.value && testEditor.value) {
      testEditor.value.setRootElement(editorContainer.value)
      addResult('测试编辑器创建成功，根元素已设置')
    }
    
    addResult('集成测试完成')
  } catch (error) {
    addResult(`集成测试失败: ${error}`)
    console.error('Integration test failed:', error)
  }
}

// 测试高亮
const testHighlighting = () => {
  if (!testEditor.value) {
    addResult('请先创建测试编辑器')
    return
  }
  
  try {
    addResult('开始测试代码高亮功能...')
    testCodeHighlighting(testEditor.value)
    addResult('高亮测试完成，请查看控制台输出')
  } catch (error) {
    addResult(`高亮测试失败: ${error}`)
    console.error('Highlighting test failed:', error)
  }
}

// 清除测试
const clearTest = () => {
  if (testEditor.value) {
    testEditor.value.destroy()
    testEditor.value = null
  }
  
  if (editorContainer.value) {
    editorContainer.value.innerHTML = ''
  }
  
  testResults.value = []
  addResult('测试已清除')
}

// 组件卸载时清理
onUnmounted(() => {
  if (testEditor.value) {
    testEditor.value.destroy()
  }
})
</script>

<style scoped>
.code-shiki-test {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* 编辑器容器样式 */
.editor-container {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 14px;
  line-height: 1.5;
}
</style>
