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
import PollOptionComponent from "./PollOptionComponent.vue"

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

<style>
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

 .PollNode__container {
  border: 1px solid #eee;
  background-color: #fcfcfc;
  border-radius: 10px;
  max-width: 600px;
  min-width: 400px;
  cursor: pointer;
  user-select: none;
}
.PollNode__container.focused {
  outline: 2px solid rgb(60, 132, 244);
}
.PollNode__inner {
  margin: 15px;
  cursor: default;
}
.PollNode__heading {
  margin-left: 0px;
  margin-top: 0px;
  margin-right: 0px;
  margin-bottom: 15px;
  color: #444;
  text-align: center;
  font-size: 18px;
}
.PollNode__optionContainer {
  display: flex;
  flex-direction: row;
  margin-bottom: 10px;
  align-items: center;
}
.PollNode__optionInputWrapper {
  display: flex;
  flex: 10px;
  border: 1px solid rgb(61, 135, 245);
  border-radius: 5px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}
.PollNode__optionInput {
  display: flex;
  flex: 1px;
  border: 0px;
  padding: 7px;
  color: rgb(61, 135, 245);
  background-color: transparent;
  font-weight: bold;
  outline: 0px;
  z-index: 0;
}
.PollNode__optionInput::placeholder {
  font-weight: normal;
  color: #999;
}
.PollNode__optionInputVotes {
  background-color: rgb(236, 243, 254);
  height: 100%;
  position: absolute;
  top: 0px;
  left: 0px;
  transition: width 1s ease;
  z-index: 0;
}
.PollNode__optionInputVotesCount {
  color: rgb(61, 135, 245);
  position: absolute;
  right: 15px;
  font-size: 12px;
  top: 5px;
}
.PollNode__optionCheckboxWrapper {
  position: relative;
  display: flex;
  width: 22px;
  height: 22px;
  border: 1px solid #999;
  margin-right: 10px;
  border-radius: 5px;
}
.PollNode__optionCheckboxChecked {
  border: 1px solid rgb(61, 135, 245);
  background-color: rgb(61, 135, 245);
}
.PollNode__optionCheckboxChecked:after {
  content: '';
  cursor: pointer;
  border-color: #fff;
  border-style: solid;
  position: absolute;
  display: block;
  top: 4px;
  width: 5px;
  left: 8px;
  height: 9px;
  margin: 0;
  transform: rotate(45deg);
  border-width: 0 2px 2px 0;
  pointer-events: none;
}
.PollNode__optionCheckbox {
  border: 0px;
  position: absolute;
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
.PollNode__optionDelete {
  position: relative;
  display: flex;
  width: 28px;
  height: 28px;
  margin-left: 6px;
  border: 0px;
  background-color: transparent;
  background-position: 6px 6px;
  background-repeat: no-repeat;
  z-index: 0;
  cursor: pointer;
  border-radius: 5px;
  opacity: 0.3;
}
.PollNode__optionDelete:before,
.PollNode__optionDelete:after {
  position: absolute;
  display: block;
  content: '';
  background-color: #999;
  width: 2px;
  height: 15px;
  top: 6px;
  left: 13px;
}
.PollNode__optionDelete:before {
  transform: rotate(-45deg);
}
.PollNode__optionDelete:after {
  transform: rotate(45deg);
}
.PollNode__optionDelete:hover {
  opacity: 1;
  background-color: #eee;
}
.PollNode__optionDeleteDisabled {
  cursor: not-allowed;
}
.PollNode__optionDeleteDisabled:hover {
  opacity: 0.3;
  background-color: transparent;
}
.PollNode__footer {
  display: flex;
  justify-content: center;
}
</style>