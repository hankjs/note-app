<script setup lang="ts">
import { useLexicalComposer } from "lexical-vue"
import { computed, ref, watch } from "vue"
import { useEffect } from "../../composables/useEffect"
import { $createImageNode, ImageNode } from "../../nodes/ImageNode"
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils"
import {
  $onDragover,
  $onDragStart,
  $onDrop,
  INSERT_IMAGE_COMMAND,
  InsertImagePayload
} from "./ImagesPlugin.shared"
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND
} from "lexical"
const props = defineProps<{
  captionsEnabled?: boolean
}>()

const emit = defineEmits<{
  (event: "error"): void
  (event: "init", image: HTMLImageElement | null): void
}>()

const editor = useLexicalComposer()
useEffect(() => {
  if (!editor.hasNodes([ImageNode])) {
    throw new Error("ImagesPlugin: ImageNode not registered on editor")
  }

  return mergeRegister(
    editor.registerCommand<InsertImagePayload>(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        const imageNode = $createImageNode(payload)
        $insertNodes([imageNode])
        if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
          $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd()
        }

        return true
      },
      COMMAND_PRIORITY_EDITOR
    ),
    editor.registerCommand<DragEvent>(
      DRAGSTART_COMMAND,
      (event) => {
        return $onDragStart(event)
      },
      COMMAND_PRIORITY_HIGH
    ),
    editor.registerCommand<DragEvent>(
      DRAGOVER_COMMAND,
      (event) => {
        return $onDragover(event)
      },
      COMMAND_PRIORITY_LOW
    ),
    editor.registerCommand<DragEvent>(
      DROP_COMMAND,
      (event) => {
        return $onDrop(event, editor)
      },
      COMMAND_PRIORITY_HIGH
    )
  )
}, [() => editor, () => props.captionsEnabled])
</script>

<template></template>
