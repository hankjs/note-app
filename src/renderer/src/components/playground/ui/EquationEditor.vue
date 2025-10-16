<script setup lang="ts">
import { ref, watch } from "vue"
defineProps<{
  inline: boolean
}>()

const vModel = defineModel<string>()
const emit = defineEmits<{
  (event: "mounted", input: HTMLInputElement | HTMLTextAreaElement): void
}>()

const inputRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null)
watch(inputRef, (newInput) => {
  if (newInput) {
    emit("mounted", newInput)
  }
})

const onChange = (event: Event) => {
  vModel.value = (event.target as HTMLInputElement).value
}
</script>

<template>
  <span
    v-if="inline"
    className="EquationEditor_inputBackground"
  >
    <span className="EquationEditor_dollarSign">$</span>
    <input
      className="EquationEditor_inlineEditor"
      :value="vModel"
      @change="onChange"
      autofocus="true"
      ref="inputRef"
    />
    <span className="EquationEditor_dollarSign">$</span>
  </span>
  <div
    v-else
    className="EquationEditor_inputBackground"
  >
    <span className="EquationEditor_dollarSign">{'$$\n'}</span>
    <textarea
      className="EquationEditor_blockEditor"
      :value="vModel"
      @change="onChange"
      ref="inputRef"
    />
    <span className="EquationEditor_dollarSign">{'\n$$'}</span>
  </div>
</template>
