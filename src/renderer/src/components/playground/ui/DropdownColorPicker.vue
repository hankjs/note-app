<script setup lang="ts">
import { computed } from "vue"
import DropDown from "./DropDown.vue"
import ColorPicker from "./ColorPicker/index.vue"

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    buttonAriaLabel?: string
    buttonClassName: string
    buttonIconClassName?: string
    buttonLabel?: string
    stopCloseOnClickSelf?: boolean
    color: string
  }>(),
  {
    disabled: false,
    stopCloseOnClickSelf: true
  }
)

const emit = defineEmits<{
  (e: "change", color: string, skipHistoryStack: boolean, skipRefocus: boolean): void
}>()

function onChange(color: string, skipHistoryStack: boolean, skipRefocus: boolean) {
  emit("change", color, skipHistoryStack, skipRefocus)
}

const dropdownProps = computed(() => {
  const { color: _, ...rest } = props
  return rest
})
</script>

<template>
  <DropDown
    v-bind="dropdownProps"
    :disabled="disabled"
    :stop-close-on-click-self="stopCloseOnClickSelf"
  >
    <ColorPicker
      :color="color"
      @change="onChange"
    />
  </DropDown>
</template>
