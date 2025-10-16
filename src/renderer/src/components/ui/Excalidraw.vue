<script setup lang="ts">
import { ref } from "vue"

import { applyPureReactInVue } from "veaury"

import { Excalidraw } from "@excalidraw/excalidraw"

import type { AppState, BinaryFiles, ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types"
import { ExcalidrawInitialElements } from "../playground/ui/ExcalidrawModal/ExcalidrawModal.shared"

defineProps<{
  /**
   * The initial set of elements to draw into the scene
   */
   initialData?: {
    appState: AppState
    elements: ExcalidrawInitialElements
    files: BinaryFiles
   }
}>()

const emit = defineEmits<{
  /**
   * Callback when the save button is clicked
   */
  (event: "excalidrawAPI", api: ExcalidrawImperativeAPI): void
  (
    event: "change",
    payload: {
      els: ExcalidrawInitialElements
      _: AppState
      fls: BinaryFiles
    }
  ): void
}>()

const ExcalidrawComponent = applyPureReactInVue(Excalidraw)

const excalidrawAPI = ref<ExcalidrawImperativeAPI | null>(null)

const onReady = (api: ExcalidrawImperativeAPI) => {
  excalidrawAPI.value = api
}

const onChange = (els: ExcalidrawInitialElements, _: AppState, fls: BinaryFiles) => {
  emit("change", { els, _, fls })
}
</script>

<template>
  <div style="width: 100%; height: 100%">
    <ExcalidrawComponent
      :initialData="initialData"
      :excalidrawAPI="onReady"
      :onChange="onChange"
    />
  </div>
</template>
