<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { DateTimeNodeInterface } from "./DateTimeNode.shared"
import { LexicalNode, NodeKey } from "lexical"
import { useLexicalComposer, useLexicalNodeSelection } from "lexical-vue"
import { autoUpdate, flip, offset, shift, useFloating } from "@floating-ui/vue"

const props = defineProps<{
  dateTime: Date | undefined
  nodeKey: NodeKey
  isDateTimeNode: (node: LexicalNode | null) => node is DateTimeNodeInterface
}>()

const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

const editor = useLexicalComposer()
const isOpen = ref(false)
const containerRef = ref<null | HTMLDivElement>(null)
const selected = ref(props.dateTime)
const getIncludeTime = () => {
  if (props.dateTime === undefined) {
    return false
  }
  const hours = props.dateTime?.getHours()
  const minutes = props.dateTime?.getMinutes()
  return hours !== 0 || minutes !== 0
}
const includeTime = ref(getIncludeTime())
const getTimeValue = () => {
  if (props.dateTime === undefined) {
    return "00:00"
  }
  const hours = props.dateTime?.getHours()
  const minutes = props.dateTime?.getMinutes()
  if (hours !== 0 || minutes !== 0) {
    return `${hours?.toString().padStart(2, "0")}:${minutes?.toString().padStart(2, "0")}`
  }
  return "00:00"
}
const timeValue = ref(getTimeValue())

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { isNodeSelected, setNodeSelected, clearNodeSelection } = useLexicalNodeSelection(
  props.nodeKey
)

const { refs, floatingStyles, context } = useFloating(containerRef, {
  middleware: [
    offset(5),
    flip({
      fallbackPlacements: ["top-start"]
    }),
    shift({ padding: 10 })
  ],
  onOpenChange: (isOpen) => {
    isOpen.value = isOpen
  },
  open: isOpen,
  placement: "bottom-start",
  strategy: "fixed",
  whileElementsMounted: autoUpdate
})
</script>

<template></template>
