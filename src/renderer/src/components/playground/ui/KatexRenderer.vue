<script setup lang="ts">
import { ref } from "vue"
import katex from "katex"
import { useEffect } from "../composables/useEffect"

const props = defineProps<{
  equation: string
  inline: boolean
}>()

const emit = defineEmits<{
  (event: "doubleClick"): void
}>()

const katexElementRef = ref<HTMLDivElement | null>(null)

useEffect(() => {
  const katexElement = katexElementRef.value

  if (katexElement !== null) {
    katex.render(props.equation, katexElement, {
      displayMode: !props.inline, // true === block display //
      errorColor: "#cc0000",
      output: "html",
      strict: "warn",
      throwOnError: false,
      trust: false
    })
  }
}, [() => props.equation, () => props.inline])

const onDoubleClick = () => {
  emit("doubleClick")
}
</script>

<template>
  <img
    src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    width="0"
    height="0"
    alt=""
  />
  <span
    role="button"
    tabindex="-1"
    @dblclick="onDoubleClick"
    ref="katexElementRef"
  />
  <img
    src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    width="0"
    height="0"
    alt=""
  />
</template>
