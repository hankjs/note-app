<template>
  <div class="flash-message-context-demo">
    <h2>FlashMessage Context API 演示</h2>
    
    <div class="demo-controls">
      <button @click="showSuccessMessage" class="btn btn-success">
        显示成功消息
      </button>
      
      <button @click="showErrorMessage" class="btn btn-error">
        显示错误消息
      </button>
      
      <button @click="showInfoMessage" class="btn btn-info">
        显示信息消息
      </button>
      
      <button @click="showCustomDurationMessage" class="btn btn-warning">
        显示长时间消息 (5秒)
      </button>
      
      <button @click="hideMessage" class="btn btn-secondary">
        立即隐藏消息
      </button>
    </div>
    
    <div class="demo-info">
      <p>当前消息: {{ flashMessage || '无' }}</p>
      <p>使用 Context API: {{ isUsingContext ? '是' : '否' }}</p>
    </div>
    
    <div class="demo-code">
      <h3>使用方法:</h3>
      <pre><code>// 1. 在应用根组件中包装 FlashMessageProvider
FlashMessageProvider&gt;
  &lt;YourApp /&gt;
&lt;/FlashMessageProvider&gt;

// 2. 在子组件中使用
const { showFlashMessage } = useFlashMessageContext()
showFlashMessage('消息内容', 3000)</code></pre>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useFlashMessageContext } from '@/composables/useFlashMessage'

const { flashMessage, showFlashMessage, hideFlashMessage } = useFlashMessageContext()

// 检查是否正在使用 Context API
const isUsingContext = true

function showSuccessMessage() {
  showFlashMessage('✅ 操作成功！', 2000)
}

function showErrorMessage() {
  showFlashMessage('❌ 操作失败，请重试', 3000)
}

function showInfoMessage() {
  showFlashMessage('ℹ️ 这是一条信息消息', 4000)
}

function showCustomDurationMessage() {
  showFlashMessage('⏰ 这条消息会显示 5 秒钟', 5000)
}

function hideMessage() {
  hideFlashMessage()
}
</script>
