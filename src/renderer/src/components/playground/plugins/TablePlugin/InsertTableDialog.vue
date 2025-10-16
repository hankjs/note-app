<script setup lang="ts">
import { LexicalEditor } from "lexical"
import { ref } from "vue"
import { useEffect } from "../../composables/useEffect"
import { INSERT_TABLE_COMMAND } from "@lexical/table"
import DialogActions from "../../ui/DialogActions.vue"
import Button from "../../ui/Button.vue"
import TextInput from "../../ui/TextInput.vue"

const props = defineProps<{
  activeEditor: LexicalEditor
}>()

const emit = defineEmits<{
  (event: "close"): void
}>()

const rows = ref("5")
const columns = ref("5")
const isDisabled = ref(true)

useEffect(() => {
  const row = Number(rows)
  const column = Number(columns)
  if (row && row > 0 && row <= 500 && column && column > 0 && column <= 50) {
    isDisabled.value = false
  } else {
    isDisabled.value = true
  }
}, [() => rows.value, () => columns.value])

const onClick = () => {
  props.activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, {
    columns: columns.value,
    rows: rows.value
  })

  emit("close")
}
</script>

<template>
  <TextInput
    placeholder="# of rows (1-500)"
    label="Rows"
    v-model="rows"
    data-test-id="table-modal-rows"
    type="number"
  />
  <TextInput
    placeholder="# of columns (1-50)"
    label="Columns"
    v-model="columns"
    data-test-id="table-modal-columns"
    type="number"
  />
  <DialogActions data-test-id="table-model-confirm-insert">
    <Button
      :disabled="isDisabled"
      @click="onClick"
    >
      Confirm
    </Button>
  </DialogActions>
</template>
