<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { registerCodeHighlighting } from '../nodes/CodeNode'
import { useLexicalComposer } from 'lexical-vue'

const editor = useLexicalComposer()
let unregisterListener: () => void

onMounted(() => {
  unregisterListener = registerCodeHighlighting(editor)
})

onUnmounted(() => {
  unregisterListener?.()
})
</script>

<template />
