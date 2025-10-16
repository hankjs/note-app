<script setup lang="ts">
import { computed, ref } from "vue"
import { INSERT_LAYOUT_COMMAND } from "./LayoutPlugin.shared"
import DropDown from "../../ui/DropDown.vue"
import { LexicalEditor } from "lexical"

const props = defineProps<{
  activeEditor: LexicalEditor
}>()

const emit = defineEmits<{
  (event: "close"): void
}>()

const LAYOUTS = [
  { label: "2 columns (equal width)", value: "1fr 1fr" },
  { label: "2 columns (25% - 75%)", value: "1fr 3fr" },
  { label: "3 columns (equal width)", value: "1fr 1fr 1fr" },
  { label: "3 columns (25% - 50% - 25%)", value: "1fr 2fr 1fr" },
  { label: "4 columns (equal width)", value: "1fr 1fr 1fr 1fr" }
]

const layout = ref(LAYOUTS[0].value)
const buttonLabel = computed(() => LAYOUTS.find((item) => item.value === layout.value)?.label)

const onClick = () => {
  props.activeEditor.dispatchCommand(INSERT_LAYOUT_COMMAND, layout.value)
  emit("close")
}
</script>

<template>
  <DropDown
    button-class-name="toolbar-item dialog-dropdown"
    :button-label="buttonLabel"
  >
    <DropDownItem
      v-for="{ label, value } in LAYOUTS"
      :key="value"
      class="item"
      @click="layout = value"
    >
      <span class="text">{{ label }}</span>
    </DropDownItem>
  </DropDown>
  <Button @click="onClick">Insert</Button>
</template>
