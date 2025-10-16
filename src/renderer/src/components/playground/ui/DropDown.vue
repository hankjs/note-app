<script setup lang="ts">
import { ref, watchEffect } from "vue"
import DropDownItems from "./DropDownItems.vue"
import { useEffect } from "lexical-vue"
import { isDOMNode } from "lexical"
import { isKeyboardInput } from "../utils/focusUtils"

const dropDownPadding = 4

const props = withDefaults(
  defineProps<{
    title?: string
    buttonArialLabel?: string
    disabled?: boolean
    buttonAriaLabel?: string
    buttonClassName: string
    buttonIconClassName?: string
    buttonLabel?: string
    stopCloseOnClickSelf?: boolean
  }>(),
  {
    disabled: false
  }
)

const dropDownRef = ref<{ el: HTMLDivElement } | null>(null)
const buttonRef = ref<HTMLButtonElement | null>(null)
const showDropDown = ref(false)
const shouldAutofocus = ref(false)

function handleClose() {
  showDropDown.value = false
  if (buttonRef.value && buttonRef.value) buttonRef.value.focus()
}

useEffect(() => {
  const button = buttonRef.value
  const dropDown = dropDownRef.value

  if (showDropDown && button !== null && dropDown !== null) {
    const { top, left } = button.getBoundingClientRect()
    dropDown.el.style.top = `${top + button.offsetHeight + dropDownPadding}px`
    dropDown.el.style.left = `${Math.min(left, window.innerWidth - dropDown.el.offsetWidth - 20)}px`
  }
}, [() => dropDownRef.value, () => buttonRef.value, () => showDropDown.value])

useEffect(() => {
  const button = buttonRef.value

  if (button !== null && showDropDown) {
    const handle = (event: PointerEvent) => {
      const target = event.target
      if (!isDOMNode(target)) {
        return
      }

      const targetIsDropDownItem = dropDownRef.value && dropDownRef.value.el.contains(target)
      if (props.stopCloseOnClickSelf && targetIsDropDownItem) {
        return
      }

      if (!button.contains(target)) {
        showDropDown.value = false

        if (targetIsDropDownItem && isKeyboardInput(event)) {
          button.focus()
        }
      }
    }
    document.addEventListener("click", handle)

    return () => {
      document.removeEventListener("click", handle)
    }
  }
}, [
  () => dropDownRef.value,
  () => buttonRef.value,
  () => showDropDown.value,
  () => props.stopCloseOnClickSelf
])

useEffect(() => {
  const handleButtonPositionUpdate = () => {
    if (showDropDown) {
      const button = buttonRef.value
      const dropDown = dropDownRef.value?.el ?? null
      if (button !== null && dropDown !== null) {
        const { top } = button.getBoundingClientRect()
        const newPosition = top + button.offsetHeight + dropDownPadding
        if (newPosition !== dropDown.getBoundingClientRect().top) {
          dropDown.style.top = `${newPosition}px`
        }
      }
    }
  }

  document.addEventListener("scroll", handleButtonPositionUpdate)

  return () => {
    document.removeEventListener("scroll", handleButtonPositionUpdate)
  }
}, [() => buttonRef.value, () => dropDownRef.value, () => showDropDown.value])

const handleOnClick = (e: React.MouseEvent) => {
  showDropDown.value = !showDropDown.value
  shouldAutofocus.value = isKeyboardInput(e)
}
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    :aria-label="buttonAriaLabel || buttonLabel"
    :class="buttonClassName"
    @click="handleOnClick"
    ref="buttonRef"
  >
    <span
      v-if="buttonIconClassName"
      :class="buttonIconClassName"
    />
    <span
      v-if="buttonLabel"
      class="text dropdown-button-text"
      >{{ buttonLabel }}</span
    >
    <i class="chevron-down" />
  </button>

  <Teleport
    v-if="showDropDown"
    to="body"
  >
    <DropDownItems
      ref="dropDownRef"
      @close="handleClose"
      :autofocus="shouldAutofocus"
    >
      <slot />
    </DropDownItems>
  </Teleport>
</template>
