<script setup lang="ts">
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  COMMAND_PRIORITY_HIGH,
  KEY_ESCAPE_COMMAND,
  LexicalNode,
  NodeKey,
  SELECTION_CHANGE_COMMAND
} from "lexical"
import { useLexicalComposer, useLexicalEditable, ErrorBoundary } from "lexical-vue"
import { ref } from "vue"
import { EquationNodeInterface } from "./EquationNode.shared"
import { useEffect } from "../../composables/useEffect"
import { mergeRegister } from "@lexical/utils"
import EquationEditor from "../../ui/EquationEditor.vue"
import KatexRenderer from "../../ui/KatexRenderer.vue"

const props = defineProps<{
  equation: string
  inline: boolean
  nodeKey: NodeKey
  isEquationNode: (node: LexicalNode | null) => node is EquationNodeInterface
}>()

const editor = useLexicalComposer()
const isEditable = useLexicalEditable()
const equationValue = ref(props.equation)
const showEquationEditor = ref<boolean>(false)
const inputRef = ref<HTMLTextAreaElement | HTMLInputElement | null>(null)

const onHide = (restoreSelection?: boolean) => {
  showEquationEditor.value = false
  editor.update(() => {
    const node = $getNodeByKey(props.nodeKey)
    if (props.isEquationNode(node)) {
      node.setEquation(equationValue.value)
      if (restoreSelection) {
        node.selectNext(0, 0)
      }
    }
  })
}

useEffect(() => {
  if (!showEquationEditor.value && equationValue.value !== props.equation) {
    equationValue.value = props.equation
  }
}, [() => showEquationEditor.value, () => props.equation, () => equationValue.value])

useEffect(() => {
  if (!isEditable.value) {
    return
  }
  if (showEquationEditor.value) {
    return mergeRegister(
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          const activeElement = document.activeElement
          const inputElem = inputRef.value
          if (inputElem !== activeElement) {
            onHide()
          }
          return false
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          const activeElement = document.activeElement
          const inputElem = inputRef.value
          if (inputElem === activeElement) {
            onHide(true)
            return true
          }
          return false
        },
        COMMAND_PRIORITY_HIGH
      )
    )
  } else {
    return editor.registerUpdateListener(({ editorState }) => {
      const isSelected = editorState.read(() => {
        const selection = $getSelection()
        return (
          $isNodeSelection(selection) &&
          selection.has(props.nodeKey) &&
          selection.getNodes().length === 1
        )
      })
      if (isSelected) {
        showEquationEditor.value = true
      }
    })
  }
}, [() => editor, () => props.nodeKey, () => showEquationEditor.value, () => isEditable.value])

const onDoubleClick = () => {
  if (isEditable.value) {
    showEquationEditor.value = true
  }
}
</script>

<template>
        <EquationEditor
          v-if="showEquationEditor && isEditable"
          v-model="equationValue"
          :inline="inline"
          ref="inputRef"
        />
        <ErrorBoundary v-else @error="(e) => editor._onError(e)" :fallback="null">
          <KatexRenderer
            :equation="equationValue"
            :inline="inline"
            @double-click="onDoubleClick"
          />
        </ErrorBoundary>
</template>
