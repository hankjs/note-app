<script setup lang="ts">
import { ref } from 'vue'
import { useLexicalEditor } from '../editor/LexicalEditor/useLexicalContext'

const str = localStorage.getItem('editor-content')
const content = ref(str ? str : `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":" Try typing in ","type":"text","version":1},{"detail":0,"format":1,"mode":"normal","style":"","text":"some smiles. ","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":"For example: ","type":"text","version":1},{"detail":0,"format":16,"mode":"normal","style":"","text":":)","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":", ","type":"text","version":1},{"detail":0,"format":16,"mode":"normal","style":"","text":":smiley:","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":".","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":null,"format":"","indent":0,"type":"root","version":1}}`)
// 使用 Lexical 上下文
const context = useLexicalEditor() 
context.setContent(content.value)

const handleSave = () => {
  if (!context) {
    return
  }
  const json = context.editorState.value.toJSON()
  localStorage.setItem('editor-content', JSON.stringify(json))
}
</script>

<template>
  <div class="toolbar">
    <button @click="handleSave">保存</button>
  </div>
</template>
