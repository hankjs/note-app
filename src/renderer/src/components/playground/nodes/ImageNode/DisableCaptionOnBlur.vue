<script setup lang="ts">
import { useLexicalComposer } from "lexical-vue"
import { BLUR_COMMAND, COMMAND_PRIORITY_EDITOR } from "lexical"
import { useEffect } from "../../composables/useEffect"
import { $isCaptionEditorEmpty } from "."

const emit = defineEmits<{
  (event: "setShowCaption", show: boolean): void
}>()

const editor = useLexicalComposer()
useEffect(
  () =>
    editor.registerCommand(
      BLUR_COMMAND,
      () => {
        if ($isCaptionEditorEmpty()) {
          emit("setShowCaption", false)
        }
        return false
      },
      COMMAND_PRIORITY_EDITOR
    ),
  []
)
</script>

<template></template>
