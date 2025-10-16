<script setup lang="ts">
import { computed, ref } from "vue"
import TextInput from "../../ui/TextInput.vue"
import DialogActions from "../../ui/DialogActions.vue"
import Button from "../../ui/Button.vue"

const emit = defineEmits<{
  (event: "click", payload: { src: string; altText: string }): void
}>()

const src = ref("")
const altText = ref("")

const isDisabled = computed(() => src.value === "")
</script>

<template>
  <TextInput
    v-model="src"
    label="Image URL"
    placeholder="i.e. https://source.unsplash.com/random"
    data-test-id="image-modal-url-input"
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
