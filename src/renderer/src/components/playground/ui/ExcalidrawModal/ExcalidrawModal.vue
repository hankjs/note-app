<script setup lang="ts">
import type { AppState, BinaryFiles, ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types"
import { computed, ref, shallowRef, watch } from "vue"
import { ExcalidrawInitialElements } from "./ExcalidrawModal.shared"
import { useEffect } from "../../composables/useEffect"
import { isDOMNode } from "lexical"
import { useEventListener } from "@vueuse/core"
import ShowDiscardDialog from "./ShowDiscardDialog.vue"
import Excalidraw from "@renderer/components/ui/Excalidraw.vue"

const props = defineProps<{
  closeOnClickOutside?: boolean
  /**
   * The initial set of elements to draw into the scene
   */
  initialElements?: ExcalidrawInitialElements
  /**
   * The initial set of elements to draw into the scene
   */
  initialAppState: AppState
  /**
   * The initial set of elements to draw into the scene
   */
  initialFiles: BinaryFiles
  /**
   * Controls the visibility of the modal
   */
  isShown?: boolean
}>()

const emit = defineEmits<{
  /**
   * Callback when closing and discarding the new changes
   */
  (event: "close"): void
  /**
   * Completely remove Excalidraw component
   */
  (event: "delete"): void
  /**
   * Callback when the save button is clicked
   */
  (
    event: "save",
    payload: {
      elements: ExcalidrawInitialElements
      appState: Partial<AppState>
      files: BinaryFiles
    }
  ): void
}>()

const excaliDrawModelRef = ref<HTMLDivElement | null>(null)
const excalidrawAPI = shallowRef<ExcalidrawImperativeAPI | null>(null)
const discardModalOpen = ref(false)
const elements = shallowRef<ExcalidrawInitialElements>(props.initialElements)
const files = shallowRef<BinaryFiles>(props.initialFiles)

watch(
  () => excaliDrawModelRef.value,
  () => {
    if (excaliDrawModelRef.value) {
      excaliDrawModelRef.value?.focus()
    }
  }
)

useEffect(() => {
  let modalOverlayElement: HTMLElement | null = null

  const clickOutsideHandler = (event: MouseEvent) => {
    const target = event.target
    if (
      excaliDrawModelRef.value !== null &&
      isDOMNode(target) &&
      !excaliDrawModelRef.value.contains(target) &&
      props.closeOnClickOutside
    ) {
      emit("delete")
    }
  }

  if (excaliDrawModelRef.value !== null) {
    modalOverlayElement = excaliDrawModelRef.value?.parentElement
    modalOverlayElement?.addEventListener("click", clickOutsideHandler)
  }

  return () => {
    modalOverlayElement?.removeEventListener("click", clickOutsideHandler)
  }
}, [() => props.closeOnClickOutside])

useEventListener(excaliDrawModelRef, "keydown", (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    emit("delete")
  }
})

const save = () => {
  if (elements.value?.some((el) => !el.isDeleted)) {
    const appState = excalidrawAPI.value?.getAppState()
    // We only need a subset of the state
    const partialState: Partial<AppState> = {
      exportBackground: appState?.exportBackground,
      exportScale: appState?.exportScale,
      exportWithDarkMode: appState?.theme === "dark",
      isBindingEnabled: appState?.isBindingEnabled,
      isLoading: appState?.isLoading,
      name: appState?.name,
      theme: appState?.theme,
      viewBackgroundColor: appState?.viewBackgroundColor,
      viewModeEnabled: appState?.viewModeEnabled,
      zenModeEnabled: appState?.zenModeEnabled,
      zoom: appState?.zoom
    }
    emit("save", {
      elements: elements.value,
      appState: partialState,
      files: files.value
    })
  } else {
    // delete node if the scene is clear
    emit("delete")
  }
}

const discard = () => {
  discardModalOpen.value = true
}

const onExcalidrawAPI = (api: ExcalidrawImperativeAPI) => {
  excalidrawAPI.value = api
}

const onChange = ({
  els,
  fls
}: {
  els: ExcalidrawInitialElements
  _: AppState
  fls: BinaryFiles
}) => {
  elements.value = els
  files.value = fls
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isShown"
      class="ExcalidrawModal__overlay"
      role="dialog"
    >
      <div
        class="ExcalidrawModal__modal"
        ref="excaliDrawModelRef"
        tabIndex="-1"
      >
        <div class="ExcalidrawModal__row">
          <ShowDiscardDialog
            v-model="discardModalOpen"
            @close="emit('close')"
            v-if="discardModalOpen"
          />
          <Excalidraw
            @change="onChange"
            @excalidrawAPI="onExcalidrawAPI"
            :initialData="{
              appState: initialAppState || { isLoading: false },
              elements: initialElements,
              files: initialFiles
            }"
          />
          <div class="ExcalidrawModal__actions">
            <button
              class="action-button"
              @click="discard"
            >
              Discard
            </button>
            <button
              class="action-button"
              @click="save"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

.ExcalidrawModal__overlay {
  display: flex;
  align-items: center;
  position: fixed;
  flex-direction: column;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  flex-grow: 0px;
  flex-shrink: 1px;
  z-index: 100;
  background-color: rgba(40, 40, 40, 0.6);
}
.ExcalidrawModal__actions {
  text-align: end;
  position: absolute;
  right: 5px;
  top: 5px;
  z-index: 1;
}
.ExcalidrawModal__actions button {
  background-color: #fff;
  border-radius: 5px;
}
.ExcalidrawModal__row {
  position: relative;
  padding: 40px 5px 5px;
  width: 70vw;
  height: 70vh;
  border-radius: 8px;
  box-shadow:
    0 12px 28px 0 rgba(0, 0, 0, 0.2),
    0 2px 4px 0 rgba(0, 0, 0, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);
}
.ExcalidrawModal__row > div {
  border-radius: 5px;
}
.ExcalidrawModal__modal {
  position: relative;
  z-index: 10;
  top: 50px;
  width: auto;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background-color: #eee;
}
.ExcalidrawModal__discardModal {
  margin-top: 60px;
  text-align: center;
}
</style>
