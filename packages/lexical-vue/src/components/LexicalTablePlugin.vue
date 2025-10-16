<script setup lang="ts">
import {
  $isScrollableTablesActive,
  TableCellNode,
  TableNode,
  registerTableCellUnmergeTransform,
  registerTablePlugin,
  registerTableSelectionObserver,
  setScrollableTablesActive
} from "@lexical/table"

import { useEffect, useLexicalComposer } from "../composables"

export interface TablePluginProps {
  /**
   * When `false` (default `true`), merged cell support (colspan and rowspan) will be disabled and all
   * tables will be forced into a regular grid with 1x1 table cells.
   */
  hasCellMerge?: boolean
  /**
   * When `false` (default `true`), the background color of TableCellNode will always be removed.
   */
  hasCellBackgroundColor?: boolean
  /**
   * When `true` (default `true`), the tab key can be used to navigate table cells.
   */
  hasTabHandler?: boolean
  /**
   * When `true` (default `false`), tables will be wrapped in a `<div>` to enable horizontal scrolling
   */
  hasHorizontalScroll?: boolean
}

const {
  hasHorizontalScroll = false,
  hasTabHandler = true,
  hasCellMerge = true,
  hasCellBackgroundColor = true
} = defineProps<TablePluginProps>()

const editor = useLexicalComposer()

useEffect(() => {
  const hadHorizontalScroll = $isScrollableTablesActive(editor)
  if (hadHorizontalScroll !== hasHorizontalScroll) {
    setScrollableTablesActive(editor, hasHorizontalScroll)
    // Registering the transform has the side-effect of marking all existing
    // TableNodes as dirty. The handler is immediately unregistered.
    editor.registerNodeTransform(TableNode, () => {})()
  }
})

useEffect(() => registerTablePlugin(editor))

useEffect(() => registerTableSelectionObserver(editor, hasTabHandler))

// Unmerge cells when the feature isn't enabled
useEffect(() => {
  if (!hasCellMerge) {
    return registerTableCellUnmergeTransform(editor)
  }
})

// Remove cell background color when feature is disabled
useEffect(() => {
  if (hasCellBackgroundColor) {
    return
  }
  return editor.registerNodeTransform(TableCellNode, (node) => {
    if (node.getBackgroundColor() !== null) {
      node.setBackgroundColor(null)
    }
  })
})
</script>

<template />
