<script setup lang="ts">
import { LexicalEditor } from "lexical"
import { ref } from "vue"
import { INSERT_POLL_COMMAND } from "./PollPlugin.shared"
import TextInput from "../../ui/TextInput.vue"
import DialogActions from "../../ui/DialogActions.vue"
import Button from "../../ui/Button.vue"
const props = defineProps<{
  activeEditor: LexicalEditor
}>()

const emit = defineEmits<{
  (event: "close"): void
}>()

const question = ref("")

const onClick = () => {
  props.activeEditor.dispatchCommand(INSERT_POLL_COMMAND, question.value)
  emit("close")
}
</script>

<template>
  <TextInput
    label="Question"
    v-model="question"
  />
  <DialogActions>
    <Button
      :disabled="question.trim() === ''"
      @click="onClick"
    >
      Confirm
    </Button>
  </DialogActions>
</template>
