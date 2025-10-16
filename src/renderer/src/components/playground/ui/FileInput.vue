<script setup lang="ts">
defineProps<{
  dataTestId?: string
  accept?: string
  label: string
}>()

const emit = defineEmits<{
  (event: "change", files: FileList | null): void
}>()

const onChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit("change", target.files)
}
</script>

<template>
  <div class="Input__wrapper">
    <label class="Input__label">{{ label }}</label>
    <input
      type="file"
      :accept="accept"
      class="Input__input"
      :data-test-id="dataTestId"
      @change="onChange"
    />
  </div>
</template>
