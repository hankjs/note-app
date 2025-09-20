import { LexicalEditor } from "lexical"

export type LexicalEditorEvent = {
  (e: 'change', id: number): void
  (e: 'update', value: string): void
  (e: 'init', instance: LexicalEditor): void
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
  (e: 'focus'): void
  (e: 'blur'): void
  (e: 'error', error: Error): void

  //#region lexical 事件
  (e: 'lexical:update'): void   
  (e: 'lexical:textContent'): void
  (e: 'lexical:mutation'): void
  (e: 'lexical:editable'): void
  (e: 'lexical:decorator'): void
  (e: 'lexical:root'): void
  //#endregion
}