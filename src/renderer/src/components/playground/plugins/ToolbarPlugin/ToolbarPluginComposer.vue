<script setup lang="ts">
import { provide } from 'vue'
import { useToolbarStateProvider, ToolbarStateProviderKey } from '../../composables/useToolbarState'

const { toolbarState, updateToolbarState } = useToolbarStateProvider()
provide(ToolbarStateProviderKey, { toolbarState, updateToolbarState })

</script>

<template>
  <slot />
</template>
