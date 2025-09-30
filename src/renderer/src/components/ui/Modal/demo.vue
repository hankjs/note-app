<template>
  <div>
    <div style="display:flex; gap:8px; margin-bottom:12px;">
      <button type="button" @click="open">開啟（方法）</button>
      <button type="button" @click="focus">聚焦</button>
      <button type="button" @click="close">關閉</button>
    </div>

    <!-- 渲染由 useModal 包裝的元件；內容透過 slot 傳入 -->
    <ModalRender>
      <div>
        <p>這是 Modal 內容。</p>
        <button type="button" @click="close">在內容中關閉</button>
      </div>
    </ModalRender>
  </div>
  
</template>

<script setup lang="ts">
import { useModal } from './useModal'

// 透過 props 初始化（也可在模板上覆寫）
const [ModalRender, modal] = useModal({
  title: '示範 Modal',
  closeOnClickOutside: true,
})

const open = () => modal.show()
const close = () => modal.close()
const focus = () => modal.focus()
</script>

<style scoped>
button {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: #f6f6f6;
  cursor: pointer;
}
button:hover { background: #eee; }
</style>


