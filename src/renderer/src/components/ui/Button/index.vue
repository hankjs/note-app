<template>
  <button
    :disabled="disabled"
    :class="classes"
    :title="title"
    :aria-label="title"
    v-bind="dataAttrs"
    type="button"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import joinClasses from '@/utils/joinClasses'

const props = defineProps<{
  'data-test-id'?: string
  className?: string
  disabled?: boolean
  small?: boolean
  title?: string
  onClick?: () => void
}>()

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const classes = computed(() =>
  joinClasses(
    'Button__root',
    props.disabled && 'Button__disabled',
    props.small && 'Button__small',
    props.className,
  ),
)

const dataAttrs = computed(() => ({
  ...(props['data-test-id'] ? { 'data-test-id': props['data-test-id'] } : {}),
}))

function handleClick(event: MouseEvent) {
  emit('click', event)
  props.onClick?.()
}
</script>

<style scoped>
.Button__root {
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 15px;
  padding-right: 15px;
  border: 0px;
  background-color: #eee;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}
.Button__root:hover {
  background-color: #ddd;
}
.Button__small {
  padding-top: 5px;
  padding-bottom: 5px;
  padding-left: 10px;
  padding-right: 10px;
  font-size: 13px;
}
.Button__disabled {
  cursor: not-allowed;
}
.Button__disabled:hover {
  background-color: #eee;
}
</style>


