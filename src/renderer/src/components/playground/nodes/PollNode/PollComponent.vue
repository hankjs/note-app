<script setup lang="ts">
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  BaseSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  LexicalNode,
  NodeKey
} from "lexical"
import { computed, ref } from "vue"
import { createPollOption, getTotalVotes, Options, PollNodeInterface } from "./PollNode.shared"
import { useLexicalComposer, useLexicalNodeSelection } from "lexical-vue"
import { useEffect } from "../../composables/useEffect"
import { mergeRegister } from "@lexical/utils"
import Button from "../../ui/Button.vue"

const props = defineProps<{
  nodeKey: NodeKey
  options: Options
  question: string
  isPollNode: (node: LexicalNode | null) => node is PollNodeInterface
}>()

const editor = useLexicalComposer()
const totalVotes = computed(() => getTotalVotes(props.options))
const { isSelected, setSelected, clearSelection } = useLexicalNodeSelection(props.nodeKey)
const selection = ref<BaseSelection | null>(null)
const containerRef = ref(null)

useEffect(() => {
  return mergeRegister(
    editor.registerUpdateListener(({ editorState }) => {
      selection.value = editorState.read(() => $getSelection())
    }),
    editor.registerCommand<MouseEvent>(
      CLICK_COMMAND,
      (payload) => {
        const event = payload

        if (event.target === containerRef.value) {
          if (!event.shiftKey) {
            clearSelection()
          }
          setSelected(!isSelected)
          return true
        }

        return false
      },
      COMMAND_PRIORITY_LOW
    )
  )
}, [() => editor, () => isSelected.value, () => props.nodeKey])

const withPollNode = (cb: (node: PollNodeInterface) => void, onUpdate?: () => void): void => {
  editor.update(
    () => {
      const node = $getNodeByKey(props.nodeKey)
      if (props.isPollNode(node)) {
        cb(node)
      }
    },
    { onUpdate }
  )
}

const addOption = () => {
  withPollNode((node) => {
    node.addOption(createPollOption())
  })
}

const isFocused = computed(() => $isNodeSelection(selection.value) && isSelected.value)
</script>

<template>
  <div
    :class="['PollNode__container', isFocused && 'focused']"
    ref="containerRef"
  >
    <div class="PollNode__inner">
      <h2 class="PollNode__heading">{{ question }}</h2>
      <PollOptionComponent
        v-for="(option, index) in options"
        :key="option.uid"
        :withPollNode="withPollNode"
        :option="option"
        :index="index"
        :options="options"
        :totalVotes="totalVotes"
      />
      <div class="PollNode__footer">
        <Button
          @click="addOption"
          :small="true"
        >
          Add Option
        </Button>
      </div>
    </div>
  </div>
</template>
