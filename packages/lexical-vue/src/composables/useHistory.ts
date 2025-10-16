import type { HistoryState } from '@lexical/history'
import type { LexicalEditor } from 'lexical'
import { type MaybeRefOrGetter, computed, inject, provide, toValue, watchEffect } from 'vue'

import { createEmptyHistoryState, registerHistory } from '@lexical/history'
import { LexicalHistoryContextKey } from './inject'

export function useHistory(
  editor: MaybeRefOrGetter<LexicalEditor>,
  externalHistoryState?: MaybeRefOrGetter<HistoryState | undefined>,
  delay?: MaybeRefOrGetter<number | undefined>,
) {
  const historyState = computed<HistoryState>(
    () => toValue(externalHistoryState) || createEmptyHistoryState(),
  )
  provide(LexicalHistoryContextKey, { historyState })

  watchEffect((onInvalidate) => {
    const unregisterListener = registerHistory(toValue(editor), historyState.value, toValue(delay) || 1000)

    onInvalidate(unregisterListener)
  })
}

export function useSharedHistoryContext() {
  const historyContext = inject<{ historyState: HistoryState }>(LexicalHistoryContextKey)
  if (!historyContext) {
    throw new Error('useSharedHistoryContext: cannot find a LexicalHistoryContext')
  }
  return historyContext
}