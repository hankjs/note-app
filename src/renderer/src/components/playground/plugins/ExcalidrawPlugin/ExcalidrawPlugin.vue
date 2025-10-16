<script setup lang="ts">
import { useLexicalComposer } from "lexical-vue"
import { computed, ref, watch } from "vue"
import { useEffect } from "../../composables/useEffect"
import { INSERT_EXCALIDRAW_COMMAND } from "./ExcalidrawPlugin.shared"
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR
} from "lexical"
import { $wrapNodeInElement } from "@lexical/utils"
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types"
import ExcalidrawModal from "../../ui/ExcalidrawModal/ExcalidrawModal.vue"
import { ExcalidrawInitialElements } from "../../ui/ExcalidrawModal/ExcalidrawModal.shared"
import { $createExcalidrawNode, ExcalidrawNode } from "../../nodes/ExcalidrawNode"

const editor = useLexicalComposer()
const isModalOpen = ref(false)

useEffect(() => {
  if (!editor.hasNodes([ExcalidrawNode])) {
    throw new Error("ExcalidrawPlugin: ExcalidrawNode not registered on editor")
  }

  return editor.registerCommand(
    INSERT_EXCALIDRAW_COMMAND,
    () => {
      isModalOpen.value = true
      return true
    },
    COMMAND_PRIORITY_EDITOR
  )
}, [editor])

const onClose = () => {
  isModalOpen.value = false
}

const onDelete = () => {
  isModalOpen.value = false
}

const onSave = ({
  elements,
  appState,
  files
}: {
  elements: ExcalidrawInitialElements
  appState: Partial<AppState>
  files: BinaryFiles
}) => {
  editor.update(() => {
    const excalidrawNode = $createExcalidrawNode()
    excalidrawNode.setData(
      JSON.stringify({
        appState,
        elements,
        files
      })
    )
    $insertNodes([excalidrawNode])
    if ($isRootOrShadowRoot(excalidrawNode.getParentOrThrow())) {
      $wrapNodeInElement(excalidrawNode, $createParagraphNode).selectEnd()
    }
  })
  isModalOpen.value = false
}

const initialAppState = {} as AppState
</script>

<template>
  <ExcalidrawModal
    v-if="isModalOpen"
    :closeOnClickOutside="false"
    :initialElements="[]"
    :initialFiles="{}"
    :initialAppState="initialAppState"
    :isShown="isModalOpen"
    @delete="onDelete"
    @close="onClose"
    @save="onSave"
  />
</template>
