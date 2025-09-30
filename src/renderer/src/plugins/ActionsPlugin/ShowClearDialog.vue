<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <h3>Are you sure you want to clear the editor?</h3>
      <div class="modal-actions">
        <button
          @click="handleClear"
          class="btn btn-primary"
        >
          Clear
        </button>
        <button
          @click="handleCancel"
          class="btn btn-secondary"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CLEAR_EDITOR_COMMAND } from 'lexical'
import type { LexicalEditor } from 'lexical'

interface Props {
  editor: LexicalEditor
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

function handleClear() {
  props.editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined)
  props.editor.focus()
  emit('close')
}

function handleCancel() {
  props.editor.focus()
  emit('close')
}

function handleOverlayClick() {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-background);
  border-radius: 0.5rem;
  padding: 1.5rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin: 0 0 1rem 0;
  color: var(--color-text);
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-secondary {
  background: var(--color-background-mute);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-hover);
}
</style>
