<script setup lang="ts">
import { EditorState, LexicalEditor } from "lexical"
import { computed, ref, shallowRef, watch } from "vue"
import { CustomPrintNodeFn, generateContent, useLexicalCommandsLog } from "../devtools"
import { useEffect } from "../composables"
import { mergeRegister } from "@lexical/utils"
import { TreeView as TreeViewCore } from "../devtools"
/**
 * TreeView is a React component that provides a visual representation of
 * the Lexical editor's state and enables debugging features like time travel
 * and custom tree node rendering.
 *
 * @param {Object} props - The properties passed to the TreeView component.
 * @param {LexicalEditor} props.editor - The Lexical editor instance to be visualized and debugged.
 * @param {string} [props.treeTypeButtonClassName] - Custom class name for the tree type toggle button.
 * @param {string} [props.timeTravelButtonClassName] - Custom class name for the time travel toggle button.
 * @param {string} [props.timeTravelPanelButtonClassName] - Custom class name for buttons inside the time travel panel.
 * @param {string} [props.timeTravelPanelClassName] - Custom class name for the overall time travel panel container.
 * @param {string} [props.timeTravelPanelSliderClassName] - Custom class name for the time travel slider in the panel.
 * @param {string} [props.viewClassName] - Custom class name for the tree view container.
 * @param {CustomPrintNodeFn} [props.customPrintNode] - A function for customizing the display of nodes in the tree.
 */
const props = defineProps<{
  editor: LexicalEditor
  treeTypeButtonClassName?: string
  timeTravelButtonClassName?: string
  timeTravelPanelButtonClassName?: string
  timeTravelPanelClassName?: string
  timeTravelPanelSliderClassName?: string
  viewClassName?: string
  customPrintNode?: CustomPrintNodeFn
}>()

const emit = defineEmits<{
  (event: "error"): void
  (event: "init", image: HTMLImageElement | null): void
}>()

const treeElementRef = ref<HTMLPreElement | null>(null)

const editorCurrentState = shallowRef<EditorState>(props.editor.getEditorState())

const commandsLog = useLexicalCommandsLog(props.editor)

useEffect(() => {
  // Registers listeners to update the tree view when the editor state changes
  return mergeRegister(
    props.editor.registerUpdateListener(({ editorState }) => {
      editorCurrentState.value = editorState
    }),
    props.editor.registerEditableListener(() => {
      editorCurrentState.value = props.editor.getEditorState()
    })
  )
}, [() => props.editor])

useEffect(() => {
  const element = treeElementRef.value

  if (element !== null) {
    // Assigns the editor instance to the tree view DOM element for internal tracking
    // @ts-ignore Internal field used by Lexical
    element.__lexicalEditor = props.editor

    return () => {
      // Cleans up the reference when the component is unmounted
      // @ts-ignore Internal field used by Lexical
      element.__lexicalEditor = null
    }
  }

  return
}, [() => props.editor, () => treeElementRef.value])

/**
 * Handles toggling the readonly state of the editor.
 *
 * @param {boolean} isReadonly - Whether the editor should be set to readonly.
 */
const handleEditorReadOnly = (isReadonly: boolean) => {
  const rootElement = props.editor.getRootElement()
  if (rootElement == null) {
    return
  }

  rootElement.contentEditable = isReadonly ? "false" : "true"
}
</script>

<template>
  <TreeViewCore
    :treeTypeButtonClassName="treeTypeButtonClassName"
    :timeTravelButtonClassName="timeTravelButtonClassName"
    :timeTravelPanelSliderClassName="timeTravelPanelSliderClassName"
    :timeTravelPanelButtonClassName="timeTravelPanelButtonClassName"
    :viewClassName="viewClassName"
    :timeTravelPanelClassName="timeTravelPanelClassName"
    :setEditorReadOnly="handleEditorReadOnly"
    :editorState="editorCurrentState"
    @setEditorState="(state) => editor.setEditorState(state)"
    :generateContent="
      async (exportDOM) => {
        // Generates the content for the tree view, allowing customization with exportDOM and customPrintNode
        return generateContent(editor, commandsLog, exportDOM, customPrintNode)
      }
    "
    ref="treeElementRef"
    :commandsLog="commandsLog"
  />
</template>
