<script setup lang="ts">
import { $getNodeByKey, CLICK_COMMAND, COMMAND_PRIORITY_LOW, isDOMNode, NodeKey } from "lexical"
import { useLexicalComposer, useLexicalEditable, useLexicalNodeSelection } from "lexical-vue"
import { computed, ref, watch } from "vue"
import { useEffect } from "../../composables/useEffect"
import { mergeRegister } from "@lexical/utils"
import { ExcalidrawInitialElements } from "../../ui/ExcalidrawModal/ExcalidrawModal.shared"
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types"
import { ExcalidrawNodeInterface } from "./ExcalidrawNodeInterface"
import { Component } from "vue"
import { LexicalNode } from "lexical"
import ExcalidrawModal from "../../ui/ExcalidrawModal/ExcalidrawModal.vue"
import ExcalidrawImage from "./ExcalidrawImage.vue"
import ImageResize from "../../ui/ImageResize.vue"

const props = defineProps<{
  data: string
  nodeKey: NodeKey
  width: "inherit" | number
  height: "inherit" | number
  isExcalidrawNode: (node: LexicalNode | null) => node is ExcalidrawNodeInterface<Component>
}>()

const emit = defineEmits<{
  (event: "error"): void
  (event: "init", image: HTMLImageElement | null): void
}>()

const editor = useLexicalComposer()
const isEditable = useLexicalEditable()
const isModalOpen = ref<boolean>(props.data === "[]" && editor.isEditable())
const imageContainerRef = ref<HTMLDivElement | null>(null)
const buttonRef = ref<HTMLButtonElement | null>(null)
const captionButtonRef = ref<HTMLButtonElement | null>(null)
const { isSelected, setSelected, clearSelection } = useLexicalNodeSelection(props.nodeKey)
const isResizing = ref<boolean>(false)

useEffect(() => {
  if (!isEditable) {
    if (isSelected) {
      clearSelection()
    }
    return
  }
  return mergeRegister(
    editor.registerCommand(
      CLICK_COMMAND,
      (event: MouseEvent) => {
        const buttonElem = buttonRef.value
        const eventTarget = event.target

        if (isResizing) {
          return true
        }

        if (buttonElem !== null && isDOMNode(eventTarget) && buttonElem.contains(eventTarget)) {
          if (!event.shiftKey) {
            clearSelection()
          }
          setSelected(!isSelected)
          if (event.detail > 1) {
            isModalOpen.value = true
          }
          return true
        }

        return false
      },
      COMMAND_PRIORITY_LOW
    )
  )
}, [() => editor, () => isSelected.value, () => isResizing.value, () => isEditable.value])

const deleteNode = () => {
  isModalOpen.value = false
  return editor.update(() => {
    const node = $getNodeByKey(props.nodeKey)
    if (node) {
      node.remove()
    }
  })
}

const setData = (els: ExcalidrawInitialElements, aps: Partial<AppState>, fls: BinaryFiles) => {
  return editor.update(() => {
    const node = $getNodeByKey(props.nodeKey)
    if (props.isExcalidrawNode(node)) {
      if ((els && els.length > 0) || Object.keys(fls).length > 0) {
        node.setData(
          JSON.stringify({
            appState: aps,
            elements: els,
            files: fls
          })
        )
      } else {
        node.remove()
      }
    }
  })
}

const onResizeStart = () => {
  isResizing.value = true
}

const onResizeEnd = (nextWidth: "inherit" | number, nextHeight: "inherit" | number) => {
  // Delay hiding the resize bars for click case
  setTimeout(() => {
    isResizing.value = false
  }, 200)

  editor.update(() => {
    const node = $getNodeByKey(props.nodeKey)

    if (props.isExcalidrawNode(node)) {
      node.setWidth(nextWidth)
      node.setHeight(nextHeight)
    }
  })
}

const openModal = () => {
  isModalOpen.value = true
}

const parsedData = computed<{
  elements: ExcalidrawInitialElements
  files: BinaryFiles
  appState: AppState
}>(() => {
  let data = {
    elements: [] as ExcalidrawInitialElements,
    files: {} as BinaryFiles,
    appState: {} as AppState
  }
  try {
    const res = JSON.parse(props.data)
    data.elements = res.elements ?? []
    data.files = res.files ?? {}
    data.appState = res.appState ?? {}
    return data
  } catch (error) {
    return data
  }
})

const closeModal = () => {
  isModalOpen.value = false
  if (parsedData.value.elements?.length === 0) {
    editor.update(() => {
      const node = $getNodeByKey(props.nodeKey)
      if (node) {
        node.remove()
      }
    })
  }
}
</script>

<template>
  <ExcalidrawModal
    v-if="isEditable && isModalOpen"
    :initialElements="parsedData.elements"
    :initialFiles="parsedData.files"
    :initialAppState="parsedData.appState"
    :isShown="isModalOpen"
    @delete="deleteNode"
    @close="closeModal"
    @save="
      ({ elements, appState, files }) => {
        setData(elements, appState, files)
        isModalOpen = false
      }
    "
    :closeOnClickOutside="false"
  />
  <button
    v-if="parsedData.elements && parsedData.elements.length > 0"
    ref="buttonRef"
    :class="`excalidraw-button ${isSelected ? 'selected' : ''}`"
  >
    <ExcalidrawImage
      :imageContainerRef="imageContainerRef"
      class="image"
      :elements="parsedData.elements"
      :files="parsedData.files"
      :appState="parsedData.appState"
      :width="width"
      :height="height"
    />
    <div
      v-if="isSelected && isEditable"
      class="image-edit-button"
      role="button"
      tabIndex="0"
      @mousedown="(event) => event.preventDefault()"
      @click="openModal"
    />

    <ImageResize
      v-if="(isSelected || isResizing) && isEditable"
      @init="
        ({ image, button }) => {
          imageContainerRef = image
          buttonRef = button
        }
      "
      :showCaption="true"
      @update:show-caption="() => null"
      :editor="editor"
      @resizeStart="onResizeStart"
      @resizeEnd="({ width, height }) => onResizeEnd(width, height)"
      :captionsEnabled="true"
    />
  </button>
</template>
