<script setup lang="ts">
import { computed, ref, watch } from "vue"
const props = defineProps<{
  checked: boolean
  id?: string
  text: string
}>()

const emit = defineEmits<{
  (event: "error"): void
  (event: "click", e: MouseEvent): void
}>()

const buttonId = "id_" + Math.floor(Math.random() * 10000)
</script>

<template>
  <div
    class="switch"
    :id="id"
  >
    <label :for="buttonId">{{ text }}</label>
    <button
      role="switch"
      :aria-checked="checked"
      :id="buttonId"
      @click="$emit('click', $event)"
    >
      <span />
    </button>
  </div>
</template>
