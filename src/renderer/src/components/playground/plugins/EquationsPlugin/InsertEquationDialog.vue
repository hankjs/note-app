<script setup lang="ts">
import { LexicalEditor } from "lexical";
import { INSERT_EQUATION_COMMAND } from "./EquationsPlugin.shared"
import KatexEquationAlterer from '../../ui/KatexEquationAlterer.vue';

const props = defineProps<{
  activeEditor: LexicalEditor
}>()

const emit = defineEmits<{
  (event: "close"): void
}>()

const onEquationConfirm = (equation: string, inline: boolean) => {
  props.activeEditor.dispatchCommand(INSERT_EQUATION_COMMAND, { equation, inline })
  emit("close")
}
</script>

<template>
  <KatexEquationAlterer @confirm="onEquationConfirm" />
</template>
