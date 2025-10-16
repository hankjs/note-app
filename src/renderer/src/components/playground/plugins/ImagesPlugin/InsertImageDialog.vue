<script setup lang="ts">
import { useEventListener } from "@vueuse/core"
import { LexicalEditor } from "lexical"
import { computed, ref, watch } from "vue"
import { INSERT_IMAGE_COMMAND, InsertImagePayload } from "./ImagesPlugin.shared"

import landscapeImage from "../../assets/images/landscape.jpg"
import yellowFlowerImage from "../../assets/images/yellow-flower.jpg"
import Button from "../../ui/Button.vue"
import DialogButtonsList from "../../ui/DialogButtonsList.vue"

const props = defineProps<{
  activeEditor: LexicalEditor
}>()

const emit = defineEmits<{
  (event: "close"): void
}>()

const mode = ref<null | "url" | "file">(null)
const hasModifier = ref(false)
useEventListener(document, "keydown", (e: KeyboardEvent) => {
  hasModifier.value = e.ctrlKey
})

const onClick = (payload: InsertImagePayload) => {
  props.activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload)
  emit("close")
}
</script>

<template>
  <DialogButtonsList v-if="!mode">
    <Button
      data-test-id="image-modal-option-sample"
      @click="
        () =>
          onClick(
            hasModifier
              ? {
                  altText: 'Daylight fir trees forest glacier green high ice landscape',
                  src: landscapeImage
                }
              : {
                  altText: 'Yellow flower in tilt shift lens',
                  src: yellowFlowerImage
                }
          )
      "
    >
      Sample
    </Button>
    <Button
      data-test-id="image-modal-option-url"
      @click="mode = 'url'"
    >
      URL
    </Button>
    <Button
      data-test-id="image-modal-option-file"
      @click="mode = 'file'"
    >
      File
    </Button>
  </DialogButtonsList>
</template>
