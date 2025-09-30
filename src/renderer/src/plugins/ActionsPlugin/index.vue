<template>
  <div class="actions">
    <!-- Speech to Text Button -->
    <button v-if="SUPPORT_SPEECH_RECOGNITION" @click="toggleSpeechToText"
      :class="[
        'action-button action-button-mic',
        { active: isSpeechToText }
      ]" title="Speech To Text"
      :aria-label="`${isSpeechToText ? 'Enable' : 'Disable'} speech to text`">
      <i class="mic" />
    </button>

    <!-- Import Button -->
    <button class="action-button import" @click="handleImport" title="Import"
      aria-label="Import editor state from JSON">
      <i class="import" />
    </button>

    <!-- Export Button -->
    <button class="action-button export" @click="handleExport" title="Export"
      aria-label="Export editor state to JSON">
      <i class="export" />
    </button>

    <!-- Share Button -->
    <button class="action-button share"
      :disabled="isCollabActive || INITIAL_SETTINGS.isCollab"
      @click="handleShare" title="Share"
      aria-label="Share Playground link to current editor state">
      <i class="share" />
    </button>

    <!-- Clear Button -->
    <button class="action-button clear" :disabled="isEditorEmpty"
      @click="showClearDialog" title="Clear" aria-label="Clear editor contents">
      <i class="clear" />
    </button>

    <!-- Lock/Unlock Button -->
    <button :class="['action-button', !isEditable ? 'unlock' : 'lock']"
      @click="toggleEditable" title="Read-Only Mode"
      :aria-label="`${!isEditable ? 'Unlock' : 'Lock'} read-only mode`">
      <i :class="!isEditable ? 'unlock' : 'lock'" />
    </button>

    <!-- Markdown Toggle Button -->
    <button class="action-button" @click="handleMarkdownToggle"
      title="Convert From Markdown" aria-label="Convert from markdown">
      <i class="markdown" />
    </button>

    <!-- Collaborative Editing Button -->
    <button v-if="isCollabActive" class="action-button connect"
      @click="toggleConnect"
      :title="`${connected ? 'Disconnect' : 'Connect'} Collaborative Editing`"
      :aria-label="`${connected ? 'Disconnect from' : 'Connect to'} a collaborative editing server`">
      <i :class="connected ? 'disconnect' : 'connect'" />
    </button>

    <!-- Modal -->
    <Modal>
      <template #default>
        Are you sure you want to clear the editor?
        <div className="Modal__content">
          <Button @click="handleModalClear">
            Clear
          </Button>
          <Button class="ml-2" @click="handleModalCancel">
            Cancel
          </Button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { LexicalEditor } from 'lexical'
import { useLexicalEditor } from '@/composables/useLexicalContext'
import { useFlashMessageContext } from '@renderer/components/ui/FlashMessage/useFlashMessage'
import { useModal } from '@/composables/useModal'
// import { SPEECH_TO_TEXT_COMMAND, SUPPORT_SPEECH_RECOGNITION } from '../SpeechToTextPlugin'
// import { PLAYGROUND_TRANSFORMERS } from '../MarkdownTransformers'
import { docFromHash, docToHash } from '@/utils/docSerialization'

// Lexical imports
import { $createCodeNode, $isCodeNode } from '@lexical/code'
import {
  editorStateFromSerializedDocument,
  exportFile,
  importFile,
  type SerializedDocument,
  serializedDocumentFromEditorState,
} from '@lexical/file'
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from '@lexical/markdown'
import { mergeRegister } from '@lexical/utils'
// import { CONNECTED_COMMAND, TOGGLE_CONNECT_COMMAND } from '@lexical/yjs'
import {
  $createTextNode,
  $getRoot,
  $isParagraphNode,
  CLEAR_HISTORY_COMMAND,
  COLLABORATION_TAG,
  COMMAND_PRIORITY_EDITOR,
  HISTORIC_TAG,
  CLEAR_EDITOR_COMMAND
} from 'lexical'
import Button from '@/components/ui/Button/index.vue'

// Props
interface Props {
  isRichText: boolean
  shouldPreserveNewLinesInMarkdown: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isRichText: true,
  shouldPreserveNewLinesInMarkdown: false,
})

// Composables
const { editor } = useLexicalEditor()
const { showFlashMessage } = useFlashMessageContext()
const [Modal, $Modal] = useModal()

// Constants
const INITIAL_SETTINGS = {
  isCollab: false, // TODO: Get from settings
}

// Mock constants for missing imports
const PLAYGROUND_TRANSFORMERS: any[] = []
const CONNECTED_COMMAND = 'CONNECTED_COMMAND' as any
const TOGGLE_CONNECT_COMMAND = 'TOGGLE_CONNECT_COMMAND' as any
const SPEECH_TO_TEXT_COMMAND = 'SPEECH_TO_TEXT_COMMAND' as any
const SUPPORT_SPEECH_RECOGNITION = false

// Reactive state
const isEditable = ref(true)
const isSpeechToText = ref(false)
const connected = ref(false)
const isEditorEmpty = ref(true)
const isCollabActive = ref(false) // TODO: Get from collaboration context


// Methods
async function sendEditorState(editor: LexicalEditor): Promise<void> {
  const stringifiedEditorState = JSON.stringify(editor.getEditorState())
  try {
    await fetch('http://localhost:1235/setEditorState', {
      body: stringifiedEditorState,
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
      },
      method: 'POST',
    })
  } catch {
    // NO-OP
  }
}

async function validateEditorState(editor: LexicalEditor): Promise<void> {
  const stringifiedEditorState = JSON.stringify(editor.getEditorState())
  let response: Response | null = null
  try {
    response = await fetch('http://localhost:1235/validateEditorState', {
      body: stringifiedEditorState,
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
      },
      method: 'POST',
    })
  } catch {
    // NO-OP
  }
  if (response !== null && response.status === 403) {
    throw new Error(
      'Editor state validation failed! Server did not accept changes.',
    )
  }
}

async function shareDoc(doc: SerializedDocument): Promise<void> {
  const url = new URL(window.location.toString())
  url.hash = await docToHash(doc)
  const newUrl = url.toString()
  window.history.replaceState({}, '', newUrl)
  await window.navigator.clipboard.writeText(newUrl)
}

// Event handlers
function toggleSpeechToText() {
  if (!editor.value) return
  editor.value.dispatchCommand(SPEECH_TO_TEXT_COMMAND, !isSpeechToText.value)
  isSpeechToText.value = !isSpeechToText.value
}

function handleImport() {
  if (!editor.value) return
  importFile(editor.value)
}

function handleExport() {
  if (!editor.value) return
  exportFile(editor.value, {
    fileName: `Playground ${new Date().toISOString()}`,
    source: 'Playground',
  })
}

function handleShare() {
  if (!editor.value) return
  shareDoc(
    serializedDocumentFromEditorState(editor.value.getEditorState(), {
      source: 'Playground',
    }),
  ).then(
    () => showFlashMessage('URL copied to clipboard'),
    () => showFlashMessage('URL could not be copied to clipboard'),
  )
}

function showClearDialog() {
  $Modal.show('Clear editor')
}

function handleModalClear() {
  editor.value?.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined)
  editor.value?.focus()
  $Modal.close()
}

function handleModalCancel() {
  editor.value?.focus()
  $Modal.close()
}

function toggleEditable() {
  if (!editor.value) return
  // Send latest editor state to commenting validation server
  if (isEditable.value) {
    sendEditorState(editor.value)
  }
  editor.value.setEditable(!editor.value.isEditable())
}

function handleMarkdownToggle() {
  if (!editor.value) return
  editor.value.update(() => {
    const root = $getRoot()
    const firstChild = root.getFirstChild()
    if ($isCodeNode(firstChild) && firstChild.getLanguage() === 'markdown') {
      $convertFromMarkdownString(
        firstChild.getTextContent(),
        PLAYGROUND_TRANSFORMERS,
        undefined, // node
        props.shouldPreserveNewLinesInMarkdown,
      )
    } else {
      const markdown = $convertToMarkdownString(
        PLAYGROUND_TRANSFORMERS,
        undefined, //node
        props.shouldPreserveNewLinesInMarkdown,
      )
      const codeNode = $createCodeNode('markdown')
      codeNode.append($createTextNode(markdown))
      root.clear().append(codeNode)
      if (markdown.length === 0) {
        codeNode.select()
      }
    }
  })
}

function toggleConnect() {
  if (!editor.value) return
  editor.value.dispatchCommand(TOGGLE_CONNECT_COMMAND, !connected.value)
}

// Lifecycle
onMounted(() => {
  if (!editor.value) return

  // Initialize editable state
  isEditable.value = editor.value.isEditable()

  // Load document from hash if not in collaboration mode
  if (!INITIAL_SETTINGS.isCollab) {
    docFromHash(window.location.hash).then((doc) => {
      if (doc && doc.source === 'Playground' && editor.value) {
        editor.value.setEditorState(editorStateFromSerializedDocument(editor.value, doc))
        editor.value.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined)
      }
    })
  }

  // Register listeners
  const cleanup = mergeRegister(
    editor.value.registerEditableListener((editable) => {
      isEditable.value = editable
    }),
    editor.value.registerCommand<boolean>(
      CONNECTED_COMMAND,
      (payload) => {
        const isConnected = payload
        connected.value = isConnected
        return false
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.value.registerUpdateListener(
      ({ dirtyElements, tags }) => {
        // If we are in read only mode, send the editor state
        // to server and ask for validation if possible.
        if (
          !isEditable.value &&
          dirtyElements.size > 0 &&
          !tags.has(HISTORIC_TAG) &&
          !tags.has(COLLABORATION_TAG)
        ) {
          validateEditorState(editor.value!)
        }
        editor.value!.getEditorState().read(() => {
          const root = $getRoot()
          const children = root.getChildren()

          if (children.length > 1) {
            isEditorEmpty.value = false
          } else {
            if ($isParagraphNode(children[0])) {
              const paragraphChildren = children[0].getChildren()
              isEditorEmpty.value = paragraphChildren.length === 0
            } else {
              isEditorEmpty.value = false
            }
          }
        })
      },
    ),
  )

  onUnmounted(cleanup)
})

</script>

<style scoped>
.actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 0.25rem;
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: var(--color-hover);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button.active {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.action-button i {
  width: 1rem;
  height: 1rem;
}

/* Icon styles - these would need to be implemented with actual icons */
.action-button i.mic::before {
  content: '🎤';
}

.action-button i.import::before {
  content: '📁';
}

.action-button i.export::before {
  content: '💾';
}

.action-button i.share::before {
  content: '🔗';
}

.action-button i.clear::before {
  content: '🗑️';
}

.action-button i.lock::before {
  content: '🔒';
}

.action-button i.unlock::before {
  content: '🔓';
}

.action-button i.markdown::before {
  content: '📝';
}

.action-button i.connect::before {
  content: '🔌';
}

.action-button i.disconnect::before {
  content: '🔌';
}
</style>
