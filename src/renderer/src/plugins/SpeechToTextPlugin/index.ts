import { ref, onUnmounted } from 'vue'
import type { LexicalCommand, LexicalEditor, RangeSelection } from 'lexical'
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical'

export const SPEECH_TO_TEXT_COMMAND: LexicalCommand<boolean> = createCommand(
  'SPEECH_TO_TEXT_COMMAND',
)

const VOICE_COMMANDS: Readonly<
  Record<
    string,
    (arg0: { editor: LexicalEditor; selection: RangeSelection }) => void
  >
> = {
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

export const SUPPORT_SPEECH_RECOGNITION: boolean =
  'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

// Vue 3 composable for speech to text functionality
export function useSpeechToText(editor: LexicalEditor) {
  const isEnabled = ref(false)
  const SpeechRecognition =
    // @ts-expect-error missing type
    window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = ref<typeof SpeechRecognition | null>(null)

  const startRecognition = () => {
    if (!recognition.value) {
      recognition.value = new SpeechRecognition()
      recognition.value.continuous = true
      recognition.value.interimResults = true
      recognition.value.addEventListener(
        'result',
        (event: typeof SpeechRecognition) => {
          const resultItem = event.results.item(event.resultIndex)
          const { transcript } = resultItem.item(0)

          if (!resultItem.isFinal) {
            return
          }

          editor.update(() => {
            const selection = $getSelection()

            if ($isRangeSelection(selection)) {
              const command = VOICE_COMMANDS[transcript.toLowerCase().trim()]

              if (command) {
                command({
                  editor,
                  selection,
                })
              } else if (transcript.match(/\s*\n\s*/)) {
                selection.insertParagraph()
              } else {
                selection.insertText(transcript)
              }
            }
          })
        },
      )
    }

    if (isEnabled.value) {
      recognition.value.start()
    } else {
      recognition.value.stop()
    }
  }

  const stopRecognition = () => {
    if (recognition.value) {
      recognition.value.stop()
    }
  }

  const toggleRecognition = (enabled: boolean) => {
    isEnabled.value = enabled
    if (enabled) {
      startRecognition()
    } else {
      stopRecognition()
    }
  }

  onUnmounted(() => {
    stopRecognition()
  })

  return {
    isEnabled,
    toggleRecognition,
    startRecognition,
    stopRecognition,
  }
}
