<script setup lang="ts">
import { computed, ref } from "vue"
import TextInput from "../../ui/TextInput.vue"
import DialogActions from "../../ui/DialogActions.vue"
import Button from "../../ui/Button.vue"
import FileInput from "../../ui/FileInput.vue"

const emit = defineEmits<{
  (event: "click", payload: { src: string; altText: string }): void
}>()

const src = ref("")
const altText = ref("")

const isDisabled = computed(() => src.value === "")

const loadImage = (files: FileList | null) => {
  const reader = new FileReader()
  reader.onload = function () {
    if (typeof reader.result === "string") {
      src.value = reader.result
    }
    return ""
  }
  if (files !== null) {
    reader.readAsDataURL(files[0])
  }
}
</script>

<template>
  <FileInput
    label="Image Upload"
    @change="loadImage"
    accept="image/*"
    data-test-id="image-modal-file-upload"
  />
  <TextInput
    v-model="altText"
    label="Alt Text"
    placeholder="Random unsplash image"
    data-test-id="image-modal-alt-text-input"
  />
  <DialogActions>
    <Button
      data-test-id="image-modal-confirm-btn"
      :disabled="isDisabled"
      @click="emit('click', { altText, src })"
    >
      Confirm
    </Button>
  </DialogActions>
</template>
