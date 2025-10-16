<script setup lang="ts">
import { computed, ref } from "vue"
import { Option, Options, PollNodeInterface } from "./PollNode.shared"
import { useCollaborationContext } from "lexical-vue"
const props = defineProps<{
  index: number
  option: Option
  options: Options
  totalVotes: number
  withPollNode: (cb: (pollNode: PollNodeInterface) => void, onSelect?: () => void) => void
}>()

const collaborationContext = useCollaborationContext()
const username = computed(() => collaborationContext.value.name)
const checkboxRef = ref<HTMLInputElement | null>(null)
const votesArray = computed(() => {
  return props.option.votes
})
const checkedIndex = computed(() => votesArray.value.indexOf(username.value))
const checked = computed(() => checkedIndex.value !== -1)
const votes = computed(() => votesArray.value.length)
const text = computed(() => props.option.text)
</script>

<template>
  <div class="PollNode__optionContainer">
    <div :class="['PollNode__optionCheckboxWrapper', checked && 'PollNode__optionCheckboxChecked']">
      <input
        ref="checkboxRef"
        class="PollNode__optionCheckbox"
        type="checkbox"
        @change="
          () => {
            withPollNode((node) => {
              node.toggleVote(option, username)
            })
          }
        "
        :checked="checked"
      />
    </div>
    <div class="PollNode__optionInputWrapper">
      <div
        class="PollNode__optionInputVotes"
        :style="{ width: `${votes === 0 ? 0 : (votes / totalVotes) * 100}%` }"
      />
      <span class="PollNode__optionInputVotesCount">
        {{ votes > 0 && (votes === 1 ? "1 vote" : `${votes} votes`) }}
      </span>
      <input
        class="PollNode__optionInput"
        type="text"
        :value="text"
        @change="
          (e) => {
            const target = e.target as HTMLInputElement
            if (!target) {
              return
            }
            const value = target.value
            const selectionStart = target.selectionStart
            const selectionEnd = target.selectionEnd
            withPollNode(
              (node) => {
                node.setOptionText(option, value)
              },
              () => {
                target.selectionStart = selectionStart
                target.selectionEnd = selectionEnd
              }
            )
          }
        "
        :placeholder="`Option ${index + 1}`"
      />
    </div>
    <button
      :disabled="options.length < 3"
      :class="['PollNode__optionDelete', options.length < 3 && 'PollNode__optionDeleteDisabled']"
      aria-label="Remove"
      @click="
        () => {
          withPollNode((node) => {
            node.deleteOption(option)
          })
        }
      "
    />
  </div>
</template>
