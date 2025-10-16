<script setup lang="ts">
import { VNode } from "vue"
import { CellEditorConfig, useCellContext } from "../../composables/useCellContext"
import { useLexicalComposer } from "lexical-vue"
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table"
import { useEffect } from "../../composables/useEffect"
const props = defineProps<{
  cellEditorConfig: CellEditorConfig
}>()

const slot = defineSlots<{
  default: () => VNode
}>()

const editor = useLexicalComposer()
const cellContext = useCellContext()
useEffect(() => {
  if (!editor.hasNodes([TableNode, TableRowNode, TableCellNode])) {
    throw new Error(
      "TablePlugin: TableNode, TableRowNode, or TableCellNode is not registered on editor"
    )
  }
}, [() => editor])
useEffect(() => {
  cellContext.set(props.cellEditorConfig, slot)
}, [cellContext, props.cellEditorConfig, slot.default])
</script>

<template>
  <slot />
</template>
