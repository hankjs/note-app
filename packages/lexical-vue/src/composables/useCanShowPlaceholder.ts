import type { LexicalEditor } from 'lexical'

import { readonly, ref } from 'vue'
import { $canShowPlaceholderCurry } from '@lexical/text'
import { mergeRegister } from '@lexical/utils'
import { useMounted } from './useMounted'

function canShowPlaceholderFromCurrentEditorState(
  editor: LexicalEditor,
): boolean {
  const currentCanShowPlaceholder = editor
    .getEditorState()
    .read($canShowPlaceholderCurry(editor.isComposing()))

  return currentCanShowPlaceholder
}

export function useCanShowPlaceholder(editor: LexicalEditor) {
  const canShowPlaceholder = ref(false)

  function resetCanShowPlaceholder() {
    const currentCanShowPlaceholder
      = canShowPlaceholderFromCurrentEditorState(editor)
    canShowPlaceholder.value = currentCanShowPlaceholder
  }

  useMounted(() => {
    resetCanShowPlaceholder()
    return mergeRegister(
      editor.registerUpdateListener(() => {
        resetCanShowPlaceholder()
      }),
      editor.registerEditableListener(() => {
        resetCanShowPlaceholder()
      }),
    )
  })

  return readonly(canShowPlaceholder)
}
