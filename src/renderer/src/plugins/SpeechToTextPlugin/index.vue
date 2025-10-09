<template></template>

<script lang="ts">
import type { LexicalCommand } from 'lexical'
import { createCommand } from 'lexical'

export const SPEECH_TO_TEXT_COMMAND: LexicalCommand<boolean> = createCommand('SPEECH_TO_TEXT_COMMAND')

export const SUPPORT_SPEECH_RECOGNITION: boolean =
  typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
</script>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import type { LexicalEditor, RangeSelection } from 'lexical'
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_EDITOR, REDO_COMMAND, UNDO_COMMAND } from 'lexical'
import { useLexicalEditor } from '@/composables/useLexicalContext'
import { useReport } from '@/composables/useReport'

const VOICE_COMMANDS: Readonly<Record<string, (args: { editor: LexicalEditor; selection: RangeSelection }) => void>> = {
  '\n': ({ selection }) => {
    selection.insertParagraph()
  },
  redo: ({ editor }) => {
    editor.dispatchCommand(REDO_COMMAND, undefined)
  },
  undo: ({ editor }) => {
    editor.dispatchCommand(UNDO_COMMAND, undefined)
  },
}

const { editor, onCleanup } = useLexicalEditor()
type ReportFn = (content: string) => ReturnType<typeof setTimeout>
const report = useReport() as unknown as ReportFn

const isEnabled = ref(false)
const SpeechRecognitionCtor: any =
  (typeof window !== 'undefined' && (window as any).SpeechRecognition) ||
  (typeof window !== 'undefined' && (window as any).webkitSpeechRecognition)
const recognition = ref<any | null>(null)

function ensureRecognition() {
  if (!recognition.value && SpeechRecognitionCtor) {
    recognition.value = new SpeechRecognitionCtor()
    recognition.value.continuous = true
    recognition.value.interimResults = true
    recognition.value.addEventListener('result', (event: any) => {
      const resultItem = event.results.item(event.resultIndex)
      const { transcript } = resultItem.item(0)
      report(transcript)

      if (!resultItem.isFinal) {
        return
      }

      const ed = editor.value
      if (!ed) return

      ed.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const command = VOICE_COMMANDS[transcript.toLowerCase().trim()]
          if (command) {
            command({ editor: ed, selection })
          } else if (/\s*\n\s*/.test(transcript)) {
            selection.insertParagraph()
          } else {
            selection.insertText(transcript)
          }
        }
      })
    })
  }
}

function startIfReady() {
  if (SUPPORT_SPEECH_RECOGNITION && isEnabled.value) {
    ensureRecognition()
    recognition.value?.start?.()
  }
}

function stopIfAny() {
  recognition.value?.stop?.()
}

const enabledWatch = watch(
  () => isEnabled.value,
  (enabled) => {
    if (enabled) startIfReady()
    else stopIfAny()
  },
  { immediate: true },
)

onMounted(() => {
  if (!editor.value) return

  const unregister = editor.value.registerCommand(
    SPEECH_TO_TEXT_COMMAND,
    (enabled: boolean) => {
      isEnabled.value = enabled
      return true
    },
    COMMAND_PRIORITY_EDITOR,
  )

  onCleanup(unregister)
  onCleanup(() => enabledWatch.stop())
})

onBeforeUnmount(() => {
  stopIfAny()
})
</script>

