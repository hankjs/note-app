<script setup lang="ts">
import { provide } from 'vue'
import { useCellContextProvider, CellContextProviderKey } from '../../composables/useCellContext'
const { cellEditorConfig, cellEditorPlugins, set } = useCellContextProvider()

provide(CellContextProviderKey, {
  cellEditorConfig,
  cellEditorPlugins,
  set,
})

</script>

<template>
  <slot />
</template>
