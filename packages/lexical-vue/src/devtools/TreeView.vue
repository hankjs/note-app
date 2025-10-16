<script setup lang="ts">
import { EditorState, EditorSetOptions } from "lexical"
import { LexicalCommandLog } from "./useLexicalCommandsLog"
import { computed, ref, watch } from "vue"
import { useEffect } from "../composables"

const LARGE_EDITOR_STATE_SIZE = 1000

const props = defineProps<{
  editorState: EditorState
  treeTypeButtonClassName?: string
  timeTravelButtonClassName?: string
  timeTravelPanelButtonClassName?: string
  timeTravelPanelClassName?: string
  timeTravelPanelSliderClassName?: string
  viewClassName?: string
  generateContent: (exportDOM: boolean) => Promise<string>
  commandsLog?: LexicalCommandLog
}>()

const emit = defineEmits<{
  (event: "error"): void
  (event: "setEditorState", state: EditorState, options?: EditorSetOptions): void
  (event: "mounted", ref: HTMLPreElement): void
}>()

const vEditorReadOnly = defineModel("readonly")
const timeStampedEditorStates = ref<Array<[number, EditorState]>>([])
const content = ref<string>("")
const timeTravelEnabled = ref(false)
const showExportDOM = ref(false)
const playingIndexRef = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)
const isPlaying = ref(false)
const isLimited = ref(false)
const showLimited = ref(false)
const lastEditorStateRef = ref<null | EditorState>(null)
const lastCommandsLogRef = ref<LexicalCommandLog>()
const lastGenerationID = ref(0)
const preRef = ref<HTMLPreElement | null>(null)
watch(preRef, (newVal) => {
  if (newVal) {
    emit("mounted", newVal)
  }
})

const generateTree = (exportDOM: boolean) => {
  lastGenerationID.value = lastGenerationID.value + 1
  const myID = lastGenerationID.value
  props
    .generateContent(exportDOM)
    .then((treeText) => {
      if (myID === lastGenerationID.value) {
        content.value = treeText
      }
    })
    .catch((err) => {
      if (myID === lastGenerationID.value) {
        content.value = `Error rendering tree: ${err.message}\n\nStack:\n${err.stack}`
      }
    })
}

useEffect(() => {
  if (!showLimited.value && props.editorState._nodeMap.size > LARGE_EDITOR_STATE_SIZE) {
    isLimited.value = true
    if (!showLimited.value) {
      return
    }
  }

  // Update view when either editor state changes or new commands are logged
  const shouldUpdate =
    lastEditorStateRef.value !== props.editorState || lastCommandsLogRef.value !== props.commandsLog

  if (shouldUpdate) {
    // Check if it's a real editor state change
    const isEditorStateChange = lastEditorStateRef.value !== props.editorState

    lastEditorStateRef.value = props.editorState
    lastCommandsLogRef.value = props.commandsLog
    generateTree(showExportDOM.value)

    // Only record in time travel if there was an actual editor state change
    if (!timeTravelEnabled.value && isEditorStateChange) {
      timeStampedEditorStates.value = [
        ...timeStampedEditorStates.value,
        [Date.now(), props.editorState]
      ]
    }
  }
}, [
  () => props.editorState,
  () => props.commandsLog,
  () => showExportDOM.value,
  () => showLimited.value,
  () => timeTravelEnabled.value
])

const totalEditorStates = computed(() => timeStampedEditorStates.value.length)

useEffect(() => {
  if (!isPlaying.value) {
    return
  }
  let timeoutId: ReturnType<typeof setTimeout>

  const play = () => {
    const currentIndex = playingIndexRef.value

    if (currentIndex === totalEditorStates.value - 1) {
      isPlaying.value = false
      return
    }

    const currentTime = timeStampedEditorStates.value[currentIndex][0]
    const nextTime = timeStampedEditorStates.value[currentIndex + 1][0]
    const timeDiff = nextTime - currentTime
    timeoutId = setTimeout(() => {
      playingIndexRef.value++
      const index = playingIndexRef.value
      const input = inputRef.value

      if (input !== null) {
        input.value = String(index)
      }

      emit("setEditorState", timeStampedEditorStates.value[index][1])
      play()
    }, timeDiff)
  }

  play()

  return () => {
    clearTimeout(timeoutId)
  }
}, [() => timeStampedEditorStates.value, () => isPlaying.value, () => totalEditorStates.value])

const handleExportModeToggleClick = () => {
  generateTree(!showExportDOM.value)
  showExportDOM.value = !showExportDOM.value
}
</script>

<template>
  <div class="{viewClassName}">
    <div
      v-if="!showLimited && isLimited"
      :style="{ padding: 20 }"
    >
      <span :style="{ marginRight: 20 }">
        Detected large EditorState, this can impact debugging performance.
      </span>
      <button
        @click="
          () => {
            showLimited = true
          }
        "
        :style="{
          background: 'transparent',
          border: '1px solid white',
          color: 'white',
          cursor: 'pointer',
          padding: 5
        }"
      >
        Show full tree
      </button>
    </div>
    <button
      v-if="!showLimited"
      @click="() => handleExportModeToggleClick()"
      :class="treeTypeButtonClassName"
      type="button"
    >
      {{ showExportDOM ? "Tree" : "Export DOM" }}
    </button>
    <button
      v-if="!timeTravelEnabled && (showLimited || !isLimited) && totalEditorStates > 2"
      @click="
        () => {
          vEditorReadOnly = true
          playingIndexRef = totalEditorStates - 1
          timeTravelEnabled = true
        }
      "
      :class="timeTravelButtonClassName"
      type="button"
    >
      Time Travel
    </button>
    <pre
      v-if="showLimited || !isLimited"
      ref="preRef"
    > {{ content }}
    </pre>
    <div
      v-if="timeTravelEnabled && (showLimited || !isLimited)"
      class="{timeTravelPanelClassName}"
    >
      <button
        :class="timeTravelPanelButtonClassName"
        @click="
          () => {
            if (playingIndexRef === totalEditorStates - 1) {
              playingIndexRef = 1
            }
            isPlaying = !isPlaying
          }
        "
        type="button"
      >
        {{ isPlaying ? "Pause" : "Play" }}
      </button>
      <input
        :class="timeTravelPanelSliderClassName"
        ref="inputRef"
        @change="
          (event) => {
            const editorStateIndex = Number((event.target as HTMLInputElement).value)
            const timeStampedEditorState = timeStampedEditorStates[editorStateIndex]

            if (timeStampedEditorState) {
              playingIndexRef = editorStateIndex
              emit('setEditorState', timeStampedEditorState[1])
            }
          }
        "
        type="range"
        min="1"
        :max="totalEditorStates - 1"
      />
      <button
        :class="timeTravelPanelButtonClassName"
        @click="
          () => {
            vEditorReadOnly = false
            const index = timeStampedEditorStates.length - 1
            const timeStampedEditorState = timeStampedEditorStates[index]
            emit('setEditorState', timeStampedEditorState[1])
            const input = inputRef as HTMLInputElement

            if (input !== null) {
              input.value = String(index)
            }

            timeTravelEnabled = false
            isPlaying = false
          }
        "
        type="button"
      >
        Exit
      </button>
    </div>
  </div>
</template>
