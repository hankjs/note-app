<script setup lang="ts">
import Modal from "../Modal.vue"
import Button from "../Button.vue"

const emit = defineEmits<{
  (event: "close"): void
}>()

const discardModalOpenRef = defineModel()
</script>

<template>
  <Modal
    title="Discard"
    @close="
      () => {
        discardModalOpenRef = false
      }
    "
    :closeOnClickOutside="false"
  >
    Are you sure you want to discard the changes?
    <div className="ExcalidrawModal__discardModal">
      <Button
        @click="
          () => {
            discardModalOpenRef = false
            emit('close')
          }
        "
      >
        Discard
      </Button>
      <Button
        @click="
          () => {
            discardModalOpenRef = false
          }
        "
      >
        Cancel
      </Button>
    </div>
  </Modal>
</template>
